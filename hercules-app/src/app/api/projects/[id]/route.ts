import { z } from "zod";

import {
  forbidden,
  json,
  notFound,
  readBody,
  requireUser,
  routeWithParams,
  unauthorized,
} from "@/lib/session";
import { deleteProject, getProject, updateProject } from "@/lib/store";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

const fieldSchema = z.object({
  name: z.string(),
  type: z.enum(["text", "number", "currency", "date", "boolean", "select", "relation", "email", "url"]),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  relation: z.string().optional(),
});

const specSchema = z.object({
  title: z.string(),
  summary: z.string(),
  capabilities: z.array(z.string()),
  tables: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      fields: z.array(fieldSchema),
      rowCount: z.number(),
    })
  ),
  screens: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      kind: z.enum(["dashboard", "table", "form", "detail", "board", "settings"]),
      table: z.string().optional(),
      stats: z
        .array(z.object({ label: z.string(), value: z.string(), delta: z.string().optional() }))
        .optional(),
    })
  ),
  roles: z.array(z.object({ name: z.string(), permissions: z.array(z.string()) })),
});

const patchSchema = z
  .object({
    name: z.string().trim().min(2).max(60),
    prompt: z.string().trim().min(4).max(2000),
    kind: z.enum(["internal", "customer", "marketing", "mobile"]),
    status: z.enum(["draft", "building", "live", "error"]),
    domain: z.string().trim().max(120).nullable(),
    version: z.number().int().min(1).max(100_000),
    spec: specSchema,
    members: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        role: z.enum(["owner", "admin", "editor", "viewer"]),
      })
    ),
    metrics: z.object({
      activeUsers: z.number(),
      requests30d: z.number(),
      uptime: z.number(),
      storageMb: z.number(),
    }),
  })
  .partial();

/** GET /api/projects/:id -> Project */
export const GET = routeWithParams<Params>(async (_request, context) => {
  const user = await requireUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const project = await getProject(id);
  if (!project) return notFound("Project");
  if (project.ownerId !== user.id) return forbidden();

  return json<Project>(project);
});

/** PATCH /api/projects/:id Partial<Project> -> Project */
export const PATCH = routeWithParams<Params>(async (request, context) => {
  const user = await requireUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const existing = await getProject(id);
  if (!existing) return notFound("Project");
  if (existing.ownerId !== user.id) return forbidden();

  const parsed = await readBody(request, patchSchema);
  if (!parsed.ok) return parsed.response;

  const updated = await updateProject(id, parsed.data);
  if (!updated) return notFound("Project");
  return json<Project>(updated);
});

/** DELETE /api/projects/:id -> { ok } */
export const DELETE = routeWithParams<Params>(async (_request, context) => {
  const user = await requireUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const existing = await getProject(id);
  if (!existing) return notFound("Project");
  if (existing.ownerId !== user.id) return forbidden();

  const ok = await deleteProject(id);
  return json({ ok });
});
