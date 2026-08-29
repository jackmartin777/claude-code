import { json, requireUser, route } from "@/lib/session";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/auth/me -> User | null */
export const GET = route(async () => {
  const user = await requireUser();
  return json<User | null>(user);
});
