import { z } from "zod";

import { apiError, json, readBody, requireUser, route, unauthorized } from "@/lib/session";
import { updateUser } from "@/lib/store";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/auth/me -> User | null */
export const GET = route(async () => {
  const user = await requireUser();
  return json<User | null>(user);
});

const profileSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(120).optional(),
  company: z.string().trim().max(120).optional(),
});

/** PATCH /api/auth/me { name?, company? } -> User */
export const PATCH = route(async (request) => {
  const user = await requireUser();
  if (!user) return unauthorized();

  const parsed = await readBody(request, profileSchema);
  if (!parsed.ok) return parsed.response;

  const updated = await updateUser(user.id, parsed.data);
  if (!updated) return apiError("Could not update your profile.", 500);

  return json<User>(updated);
});
