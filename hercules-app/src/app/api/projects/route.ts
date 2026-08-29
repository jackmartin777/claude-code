import { z } from "zod";

import { deriveProjectKind, deriveTitle, generateSpec } from "@/lib/generator";
import { json, readBody, requireUser, route, unauthorized } from "@/lib/session";
import { createProject, listProjects } from "@/lib/store";
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
  const spec = generateSpec(prompt);
  const name = parsed.data.name ?? deriveTitle(prompt);
  const project = await createProject({
    ownerId: user.id,
    name,
    prompt,
    kind: parsed.data.kind ?? deriveProjectKind(prompt),
    spec: { ...spec, title: name, summary: spec.summary.replace(spec.title, name) },
    status: "draft",
  });

  return json<Project>(project, 201);
});
