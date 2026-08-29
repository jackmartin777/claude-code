/**
 * Domain model + API contract shared by the product UI and the API routes.
 * Both sides code against this file; nothing else may redefine these shapes.
 */

export type Plan = "free" | "pro" | "business" | "enterprise";
export type Role = "owner" | "admin" | "editor" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  plan: Plan;
  credits: number;
  createdAt: string;
}

export type ProjectKind = "internal" | "customer" | "marketing" | "mobile";
export type ProjectStatus = "draft" | "building" | "live" | "error";

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  prompt: string;
  kind: ProjectKind;
  status: ProjectStatus;
  domain: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  spec: AppSpec;
  members: Member[];
  metrics: ProjectMetrics;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface ProjectMetrics {
  activeUsers: number;
  requests30d: number;
  uptime: number;
  storageMb: number;
}

/** The generated application: what the builder produces from a prompt. */
export interface AppSpec {
  title: string;
  summary: string;
  /** Feature capability ids drawn from data/site featureGroups. */
  capabilities: string[];
  tables: TableSpec[];
  screens: ScreenSpec[];
  roles: { name: string; permissions: string[] }[];
}

export interface TableSpec {
  name: string;
  description: string;
  fields: FieldSpec[];
  rowCount: number;
}

export interface FieldSpec {
  name: string;
  type: "text" | "number" | "currency" | "date" | "boolean" | "select" | "relation" | "email" | "url";
  required?: boolean;
  options?: string[];
  relation?: string;
}

export type ScreenKind = "dashboard" | "table" | "form" | "detail" | "board" | "settings";

export interface ScreenSpec {
  id: string;
  name: string;
  kind: ScreenKind;
  table?: string;
  /** Stat tiles shown on dashboard screens. */
  stats?: { label: string; value: string; delta?: string }[];
}

/** A single step the builder streams back while constructing an app. */
export interface BuildStep {
  id: string;
  verb: "Planning" | "Created" | "Built" | "Added" | "Connected" | "Published";
  subject: string;
  status: "pending" | "running" | "done";
}

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  projectId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  steps?: BuildStep[];
}

export interface Version {
  id: string;
  projectId: string;
  version: number;
  label: string;
  createdAt: string;
  published: boolean;
}

/* ------------------------------------------------------------------ */
/* API contract                                                        */
/*                                                                     */
/* POST   /api/projects            { prompt, kind?, name? } -> Project  */
/* GET    /api/projects                                     -> Project[]*/
/* GET    /api/projects/:id                                 -> Project  */
/* PATCH  /api/projects/:id        Partial<Project>         -> Project  */
/* DELETE /api/projects/:id                                 -> { ok }   */
/* GET    /api/projects/:id/messages                        -> Message[]*/
/* POST   /api/projects/:id/messages { content }  -> SSE of BuildEvent  */
/* GET    /api/projects/:id/versions                        -> Version[]*/
/* POST   /api/projects/:id/publish { domain? }             -> Project  */
/* POST   /api/auth/login          { email, password }      -> User     */
/* POST   /api/auth/signup         { name, email, password }-> User     */
/* POST   /api/auth/logout                                  -> { ok }   */
/* GET    /api/auth/me                                      -> User|null*/
/* ------------------------------------------------------------------ */

/** Server-sent event payloads streamed from the message endpoint. */
export type BuildEvent =
  | { type: "step"; step: BuildStep }
  | { type: "token"; text: string }
  | { type: "spec"; spec: AppSpec }
  | { type: "done"; message: Message; project: Project }
  | { type: "error"; message: string };

export interface ApiError {
  error: string;
}
