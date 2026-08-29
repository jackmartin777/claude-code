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
import { addVersion, getProject, markVersionsPublished, updateProject } from "@/lib/store";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

const publishSchema = z
  .object({
    domain: z
      .string()
      .trim()
      .toLowerCase()
      .max(120)
      .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/, "Enter a domain like app.example.com.")
      .optional(),
  })
  .optional();

/** POST /api/projects/:id/publish { domain? } -> Project */
export const POST = routeWithParams<Params>(async (request, context) => {
  const user = await requireUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const project = await getProject(id);
  if (!project) return notFound("Project");
  if (project.ownerId !== user.id) return forbidden();

  // The body is optional: publishing without a domain uses the hercules.app one.
  const parsed = await readBody(request, publishSchema);
  const requested = parsed.ok ? parsed.data?.domain : undefined;
  const domain = requested ?? project.domain ?? `${project.slug}.hercules.app`;
  const version = project.version + 1;

  await addVersion({
    projectId: id,
    version,
    label: `Published to ${domain}`,
    published: true,
  });
  await markVersionsPublished(id);

  const updated = await updateProject(id, {
    status: "live",
    domain,
    version,
    metrics: { ...project.metrics, uptime: project.metrics.uptime || 100 },
  });
  if (!updated) return notFound("Project");

  return json<Project>(updated);
});
