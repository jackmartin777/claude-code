import { z } from "zod";

import { json, readBody, requireUser, route } from "@/lib/session";
import { addSupportRequest } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const supportSchema = z.object({
  name: z.string().trim().min(1, "Tell us who you are.").max(120),
  email: z
    .string()
    .trim()
    .max(200)
    .regex(/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/, "Enter a valid email address."),
  topic: z.string().trim().min(1, "Pick the closest topic.").max(60),
  message: z
    .string()
    .trim()
    .min(20, "A little more detail helps us answer on the first reply.")
    .max(5000),
});

/**
 * POST /api/support { name, email, topic, message } -> { ok }
 *
 * The form told people a human would read their message while discarding it in
 * the browser, so billing and security reports were lost silently. The request
 * is now recorded before the success state is shown.
 */
export const POST = route(async (request) => {
  const parsed = await readBody(request, supportSchema);
  if (!parsed.ok) return parsed.response;

  const user = await requireUser();
  await addSupportRequest({
    ...parsed.data,
    ...(user ? { userId: user.id } : {}),
  });

  return json({ ok: true }, 201);
});
