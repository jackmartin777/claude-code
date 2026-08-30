import { z } from "zod";

import { clearSession, json, readBody, requireUser, route } from "@/lib/session";
import { bumpSessionEpoch } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const logoutSchema = z
  .object({
    /** Also invalidate sessions held on the user's other devices. */
    everywhere: z.boolean().optional(),
  })
  .optional();

/** POST /api/auth/logout { everywhere? } -> { ok } */
export const POST = route(async (request) => {
  const raw = (await request.text()).trim();
  let everywhere = false;

  if (raw.length > 0) {
    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = undefined;
    }
    const parsed = logoutSchema.safeParse(payload);
    everywhere = parsed.success ? (parsed.data?.everywhere ?? false) : false;
  }

  if (everywhere) {
    // Bumping the generation retires every cookie issued to this user, so the
    // other devices really are signed out rather than just this one.
    const user = await requireUser();
    if (user) await bumpSessionEpoch(user.id);
  }

  await clearSession();
  return json({ ok: true });
});
