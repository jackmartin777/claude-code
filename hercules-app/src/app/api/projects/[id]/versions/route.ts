import {
  forbidden,
  json,
  notFound,
  requireUser,
  routeWithParams,
  unauthorized,
} from "@/lib/session";
import { getProject, listVersions } from "@/lib/store";
import type { Version } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

/** GET /api/projects/:id/versions -> Version[] */
export const GET = routeWithParams<Params>(async (_request, context) => {
  const user = await requireUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const project = await getProject(id);
  if (!project) return notFound("Project");
  if (project.ownerId !== user.id) return forbidden();

  return json<Version[]>(await listVersions(id));
});
