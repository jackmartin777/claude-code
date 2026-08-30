/**
 * Server-side persistence for Hercules.
 *
 * SERVER ONLY. This module touches the filesystem via node:fs/promises and must
 * never be imported from a client component or from `api-client.ts` - doing so
 * breaks the browser build. Client code talks to the API routes instead.
 *
 * Data lives in `.data/hercules.json` at the project root so it survives dev
 * server hot reloads and restarts. The parsed document is cached on
 * `globalThis` because Next reloads modules aggressively in development, and
 * every write goes through a single in-process promise chain so two concurrent
 * requests can never interleave a read-modify-write and clobber the file.
 */

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { createSeedData, seedWorkspace, type Credential, type StoreData } from "./seed";
import type {
  AppSpec,
  BuildStep,
  Member,
  Message,
  MessageRole,
  Plan,
  Project,
  ProjectKind,
  ProjectMetrics,
  ProjectStatus,
  User,
  Version,
} from "./types";
import { slugify } from "./utils";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "hercules.json");

/* ------------------------------------------------------------------ */
/* Global singleton cache + write lock                                 */
/* ------------------------------------------------------------------ */

interface StoreCache {
  data: StoreData | null;
  loading: Promise<StoreData> | null;
  /** Serialises every mutation; never rejects, so it can always be chained. */
  queue: Promise<unknown>;
}

const globalRef = globalThis as typeof globalThis & {
  __herculesStore__?: StoreCache;
};

function cache(): StoreCache {
  if (!globalRef.__herculesStore__) {
    globalRef.__herculesStore__ = { data: null, loading: null, queue: Promise.resolve() };
  }
  return globalRef.__herculesStore__;
}

/* ------------------------------------------------------------------ */
/* Load / persist                                                      */
/* ------------------------------------------------------------------ */

function isStoreData(value: unknown): value is StoreData {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<StoreData>;
  return (
    Array.isArray(candidate.users) &&
    Array.isArray(candidate.projects) &&
    Array.isArray(candidate.messages) &&
    Array.isArray(candidate.versions)
  );
}

/**
 * Read the data file. A missing, unreadable or corrupt file is never fatal:
 * we fall back to freshly generated seed data and rewrite it on the next write.
 */
async function loadFromDisk(): Promise<StoreData> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (isStoreData(parsed)) {
      return {
        schema: parsed.schema ?? 1,
        users: parsed.users,
        credentials: Array.isArray(parsed.credentials) ? parsed.credentials : [],
        projects: parsed.projects,
        messages: parsed.messages,
        versions: parsed.versions,
      };
    }
    return createSeedData();
  } catch {
    // ENOENT, permission problems, invalid JSON - all recoverable.
    return createSeedData();
  }
}

async function persist(data: StoreData): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    const tmp = `${DATA_FILE}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
    await rename(tmp, DATA_FILE);
  } catch (error) {
    // Persistence is best-effort: an unwritable disk must not take down a
    // request. The in-memory copy stays authoritative for this process.
    console.error("[hercules/store] failed to persist data file:", error);
  }
}

async function read(): Promise<StoreData> {
  const c = cache();
  if (c.data) return c.data;
  if (!c.loading) {
    c.loading = loadFromDisk()
      .then(async (data) => {
        c.data = data;
        await persist(data);
        return data;
      })
      .catch(() => {
        const fallback = createSeedData();
        c.data = fallback;
        return fallback;
      })
      .finally(() => {
        c.loading = null;
      });
  }
  return c.loading;
}

/**
 * Run a mutation with exclusive access to the store, then persist.
 * Mutations are queued so concurrent requests apply one after another.
 */
async function mutate<T>(fn: (data: StoreData) => T | Promise<T>): Promise<T> {
  const c = cache();
  const run = c.queue.then(
    async () => {
      const data = await read();
      const result = await fn(data);
      await persist(data);
      return result;
    },
    async () => {
      // The previous task failed; carry on regardless.
      const data = await read();
      const result = await fn(data);
      await persist(data);
      return result;
    }
  );
  // Keep the chain alive even if this mutation throws.
  c.queue = run.catch(() => undefined);
  return run;
}

/** Deep copy on the way out so callers can never mutate cached state. */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function id(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

function now(): string {
  return new Date().toISOString();
}

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

export async function getUser(userId: string): Promise<User | null> {
  const data = await read();
  return clone(data.users.find((u) => u.id === userId) ?? null);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const data = await read();
  const needle = email.trim().toLowerCase();
  return clone(data.users.find((u) => u.email.toLowerCase() === needle) ?? null);
}

export interface CreateUserInput {
  name: string;
  email: string;
  company?: string;
  plan?: Plan;
  credits?: number;
  credential?: { salt: string; hash: string };
}

/** Creates the user and seeds them a starter workspace. */
export async function createUser(input: CreateUserInput): Promise<User> {
  return mutate((data) => {
    const email = input.email.trim().toLowerCase();
    const existing = data.users.find((u) => u.email.toLowerCase() === email);
    if (existing) return clone(existing);

    const user: User = {
      id: id("usr"),
      name: input.name.trim(),
      email,
      ...(input.company?.trim() ? { company: input.company.trim() } : {}),
      plan: input.plan ?? "free",
      credits: input.credits ?? 25,
      createdAt: now(),
    };
    data.users.push(user);

    if (input.credential) {
      data.credentials.push({ userId: user.id, ...input.credential });
    }

    const workspace = seedWorkspace(user);
    data.projects.push(...workspace.projects);
    data.messages.push(...workspace.messages);
    data.versions.push(...workspace.versions);

    return clone(user);
  });
}

export async function getCredential(userId: string): Promise<Credential | null> {
  const data = await read();
  return clone(data.credentials.find((c) => c.userId === userId) ?? null);
}

export async function setCredential(userId: string, salt: string, hash: string): Promise<void> {
  await mutate((data) => {
    const existing = data.credentials.find((c) => c.userId === userId);
    if (existing) {
      existing.salt = salt;
      existing.hash = hash;
      return;
    }
    data.credentials.push({ userId, salt, hash });
  });
}

export async function spendCredits(userId: string, amount: number): Promise<number> {
  return mutate((data) => {
    const user = data.users.find((u) => u.id === userId);
    if (!user) return 0;
    user.credits = Math.max(0, user.credits - amount);
    return user.credits;
  });
}

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export async function listProjects(ownerId: string): Promise<Project[]> {
  const data = await read();
  return clone(
    data.projects
      .filter((p) => p.ownerId === ownerId)
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
  );
}

export async function getProject(projectId: string): Promise<Project | null> {
  const data = await read();
  return clone(data.projects.find((p) => p.id === projectId) ?? null);
}

export interface CreateProjectInput {
  ownerId: string;
  name: string;
  prompt: string;
  kind: ProjectKind;
  spec: AppSpec;
  status?: ProjectStatus;
  domain?: string | null;
  members?: Member[];
  metrics?: ProjectMetrics;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  return mutate((data) => {
    const owner = data.users.find((u) => u.id === input.ownerId);
    const timestamp = now();
    const project: Project = {
      id: id("prj"),
      ownerId: input.ownerId,
      name: input.name,
      slug: slugify(input.name) || "app",
      prompt: input.prompt,
      kind: input.kind,
      status: input.status ?? "draft",
      domain: input.domain ?? null,
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      spec: input.spec,
      members:
        input.members ??
        (owner
          ? [{ id: id("mem"), name: owner.name, email: owner.email, role: "owner" as const }]
          : []),
      metrics: input.metrics ?? { activeUsers: 1, requests30d: 0, uptime: 100, storageMb: 8 },
    };
    data.projects.push(project);

    // Record v1 alongside the project itself. The project is created with a
    // spec already generated from its prompt, so without this row the version
    // history would start at the first edit and there would be no way back to
    // the original build. Written in the same mutation to keep a project and
    // its opening version atomic.
    data.versions.push({
      id: id("ver"),
      projectId: project.id,
      version: project.version,
      label: "Initial build",
      createdAt: timestamp,
      published: project.status === "live",
    });

    return clone(project);
  });
}

/** Fields a caller may patch. Identity and ownership are never writable. */
export type ProjectPatch = Partial<
  Pick<
    Project,
    "name" | "prompt" | "kind" | "status" | "domain" | "version" | "spec" | "members" | "metrics"
  >
>;

export async function updateProject(
  projectId: string,
  patch: ProjectPatch
): Promise<Project | null> {
  return mutate((data) => {
    const project = data.projects.find((p) => p.id === projectId);
    if (!project) return null;

    if (patch.name !== undefined) {
      project.name = patch.name;
      project.slug = slugify(patch.name) || project.slug;
    }
    if (patch.prompt !== undefined) project.prompt = patch.prompt;
    if (patch.kind !== undefined) project.kind = patch.kind;
    if (patch.status !== undefined) project.status = patch.status;
    if (patch.domain !== undefined) project.domain = patch.domain;
    if (patch.version !== undefined) project.version = patch.version;
    if (patch.spec !== undefined) project.spec = patch.spec;
    if (patch.members !== undefined) project.members = patch.members;
    if (patch.metrics !== undefined) project.metrics = patch.metrics;
    project.updatedAt = now();

    return clone(project);
  });
}

export async function deleteProject(projectId: string): Promise<boolean> {
  return mutate((data) => {
    const index = data.projects.findIndex((p) => p.id === projectId);
    if (index < 0) return false;
    data.projects.splice(index, 1);
    data.messages = data.messages.filter((m) => m.projectId !== projectId);
    data.versions = data.versions.filter((v) => v.projectId !== projectId);
    return true;
  });
}

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

export async function listMessages(projectId: string): Promise<Message[]> {
  const data = await read();
  return clone(
    data.messages
      .filter((m) => m.projectId === projectId)
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
  );
}

export interface AddMessageInput {
  projectId: string;
  role: MessageRole;
  content: string;
  steps?: BuildStep[];
}

export async function addMessage(input: AddMessageInput): Promise<Message> {
  return mutate((data) => {
    const message: Message = {
      id: id("msg"),
      projectId: input.projectId,
      role: input.role,
      content: input.content,
      createdAt: now(),
      ...(input.steps ? { steps: input.steps } : {}),
    };
    data.messages.push(message);
    return clone(message);
  });
}

/* ------------------------------------------------------------------ */
/* Versions                                                            */
/* ------------------------------------------------------------------ */

export async function listVersions(projectId: string): Promise<Version[]> {
  const data = await read();
  return clone(
    data.versions.filter((v) => v.projectId === projectId).sort((a, b) => b.version - a.version)
  );
}

export interface AddVersionInput {
  projectId: string;
  version: number;
  label: string;
  published?: boolean;
}

export async function addVersion(input: AddVersionInput): Promise<Version> {
  return mutate((data) => {
    const version: Version = {
      id: id("ver"),
      projectId: input.projectId,
      version: input.version,
      label: input.label,
      createdAt: now(),
      published: input.published ?? false,
    };
    data.versions.push(version);
    return clone(version);
  });
}

/** Marks every version of a project as published - used by the publish route. */
export async function markVersionsPublished(projectId: string): Promise<void> {
  await mutate((data) => {
    for (const version of data.versions) {
      if (version.projectId === projectId) version.published = true;
    }
  });
}

/**
 * Apply a message, a version bump and a project update as one atomic step.
 * The streaming build route uses this so a client disconnect can never leave a
 * project half-updated.
 */
export async function commitBuild(params: {
  projectId: string;
  reply: string;
  steps: BuildStep[];
  spec: AppSpec;
  status: ProjectStatus;
  versionLabel: string;
}): Promise<{ message: Message; project: Project; version: Version } | null> {
  return mutate((data) => {
    const project = data.projects.find((p) => p.id === params.projectId);
    if (!project) return null;

    const timestamp = now();
    const message: Message = {
      id: id("msg"),
      projectId: params.projectId,
      role: "assistant",
      content: params.reply,
      createdAt: timestamp,
      steps: params.steps,
    };
    data.messages.push(message);

    project.version += 1;
    project.spec = params.spec;
    project.status = params.status;
    project.updatedAt = timestamp;
    project.metrics = {
      ...project.metrics,
      requests30d: project.metrics.requests30d + Math.round(params.spec.tables.length * 37),
      storageMb: project.metrics.storageMb + params.spec.tables.length,
    };

    const version: Version = {
      id: id("ver"),
      projectId: params.projectId,
      version: project.version,
      label: params.versionLabel,
      createdAt: timestamp,
      published: project.status === "live",
    };
    data.versions.push(version);

    return { message: clone(message), project: clone(project), version: clone(version) };
  });
}
