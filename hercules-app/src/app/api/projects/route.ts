import { z } from "zod";

import { deriveProjectKind, deriveTitle, generateSpec } from "@/lib/generator";
import {
  forbidden,
  json,
  notFound,
  readBody,
  requireUser,
  route,
  unauthorized,
} from "@/lib/session";
import { createProject, getProject, listProjects } from "@/lib/store";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const createSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(8, "Describe the app you want in a sentence or two.")
    .max(2000),
  kind: z.enum(["internal", "customer", "marketing", "mobile"]).optional(),
  name: z.string().trim().min(2).max(60).optional(),
  /**
   * Copy an existing app the caller owns, rather than generating a new spec
   * from the prompt. Regenerating from the original creation prompt would drop
   * every screen, table and role added by later follow-ups, so a duplicate
   * would silently differ from the app it was copied from.
   */
  duplicateOf: z.string().trim().min(1).max(64).optional(),
});

/** GET /api/projects -> Project[] */
export const GET = route(async () => {
  const user = await requireUser();
  if (!user) return unauthorized();
  return json<Project[]>(await listProjects(user.id));
});

/** POST /api/projects { prompt, kind?, name? } -> Project */
export const POST = route(async (request) => {
  const user = await requireUser();
  if (!user) return unauthorized();

  const parsed = await readBody(request, createSchema);
  if (!parsed.ok) return parsed.response;

  const { prompt } = parsed.data;

  let source: Project | null = null;
  if (parsed.data.duplicateOf) {
    source = await getProject(parsed.data.duplicateOf);
    if (!source) return notFound("Project");
    if (source.ownerId !== user.id) return forbidden();
  }

  const name = parsed.data.name ?? deriveTitle(prompt);
  const spec = source ? source.spec : generateSpec(prompt);
  const project = await createProject({
    ownerId: user.id,
    name,
    prompt,
    kind: parsed.data.kind ?? (source ? source.kind : deriveProjectKind(prompt)),
    spec: { ...spec, title: name, summary: spec.summary.replace(spec.title, name) },
    // A copy is never live: it has its own lifecycle and no domain of its own.
    status: "draft",
  });

  return json<Project>(project, 201);
});
