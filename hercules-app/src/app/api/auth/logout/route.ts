import { clearSession, json, route } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** POST /api/auth/logout -> { ok } */
export const POST = route(async () => {
  await clearSession();
  return json({ ok: true });
});
