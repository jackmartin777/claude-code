import { z } from "zod";

import {
  apiError,
  createCredential,
  json,
  readBody,
  route,
  setSession,
} from "@/lib/session";
import { createUser, getUserByEmail } from "@/lib/store";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name.").max(80),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(5)
    .max(160)
    .regex(/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/, "Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters.").max(200),
  company: z.string().trim().max(120).optional(),
});

/** POST /api/auth/signup { name, email, password } -> User */
export const POST = route(async (request) => {
  const parsed = await readBody(request, signupSchema);
  if (!parsed.ok) return parsed.response;

  const existing = await getUserByEmail(parsed.data.email);
  if (existing) {
    return apiError("An account with that email already exists. Try signing in.", 400);
  }

  const user = await createUser({
    name: parsed.data.name,
    email: parsed.data.email,
    ...(parsed.data.company ? { company: parsed.data.company } : {}),
    plan: "free",
    credits: 25,
    credential: createCredential(parsed.data.password),
  });

  await setSession(user.id);
  return json<User>(user, 201);
});
