import { z } from "zod";

import { apiError, attemptLogin, json, readBody, route, setSession } from "@/lib/session";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(5)
    .max(160)
    .regex(/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/, "Enter a valid email address."),
  password: z.string().min(1, "Enter your password.").max(200),
});

/** POST /api/auth/login { email, password } -> User */
export const POST = route(async (request) => {
  const parsed = await readBody(request, loginSchema);
  if (!parsed.ok) return parsed.response;

  const result = await attemptLogin(parsed.data.email, parsed.data.password);
  if (!result.ok) return apiError(result.message, result.status);

  await setSession(result.user.id);
  return json<User>(result.user);
});
