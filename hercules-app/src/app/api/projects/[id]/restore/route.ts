import { z } from "zod";

import {
  apiError,
  forbidden,
  json,
  notFound,
  readBody,
  requireUser,
  routeWithParams,
  unauthorized,
} from "@/lib/session";
import { addVersion, getProject, listVersions, updateProject } from "@/lib/store";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

const restoreSchema = z.object({
  versionId: z.string().trim().min(1).max(64),
});

/**
 * POST /api/projects/:id/restore { versionId } -> Project
 *
 * Restoring rolls the app *forward*: the chosen snapshot becomes a new version
 * on top of the history rather than resetting the version counter. Rewinding
 * the number in place left the spec at the latest build (so nothing actually
 * changed) and let the next build reuse a number already taken, which corrupts
 * the history it is meant to protect.
 */
export const POST = routeWithParams<Params>(async (request, context) => {
  const user = await requireUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const project = await getProject(id);
  if (!project) return notFound("Project");
  if (project.ownerId !== user.id) return forbidden();

  const parsed = await readBody(request, restoreSchema);
  if (!parsed.ok) return parsed.response;

  const versions = await listVersions(id);
  const target = versions.find((version) => version.id === parsed.data.versionId);
  if (!target) return notFound("Version");
  if (!target.spec) {
    return apiError("That version was recorded before snapshots and cannot be restored.", 409);
  }

  const version = project.version + 1;
  await addVersion({
    projectId: id,
    version,
    label: `Restored v${target.version}`,
    published: false,
    spec: target.spec,
  });

  const updated = await updateProject(id, { spec: target.spec, version });
  if (!updated) return notFound("Project");

  return json<Project>(updated);
});
