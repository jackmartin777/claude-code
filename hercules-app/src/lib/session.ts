/**
 * Cookie-based demo sessions, password hashing, and the small set of helpers
 * every API route shares.
 *
 * SERVER ONLY - imports next/headers and node:crypto. Never import this from a
 * client component.
 *
 * The session cookie holds nothing but the user id. It is httpOnly and
 * sameSite=lax, so the browser sends it on same-site navigations and fetches
 * but never exposes it to scripts. This is a demo: there is no signature on the
 * cookie, but passwords are still never stored in the clear - signup stores a
 * salted SHA-256 digest and login compares digests in constant time.
 */

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import type { ZodType } from "zod";

import { getCredential, getSessionEpoch, getUser, getUserByEmail } from "./store";
import type { ApiError, User } from "./types";

export const SESSION_COOKIE = "hercules_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/* ------------------------------------------------------------------ */
/* Password hashing                                                    */
/* ------------------------------------------------------------------ */

export function hashPassword(password: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

export function createCredential(password: string): { salt: string; hash: string } {
  const salt = randomBytes(16).toString("hex");
  return { salt, hash: hashPassword(password, salt) };
}

/** Constant-time comparison of the stored digest against a fresh one. */
export function verifyPassword(
  password: string,
  credential: { salt: string; hash: string }
): boolean {
  const candidate = Buffer.from(hashPassword(password, credential.salt), "hex");
  const stored = Buffer.from(credential.hash, "hex");
  if (candidate.length === 0 || candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}

/* ------------------------------------------------------------------ */
/* Session cookie                                                      */
/* ------------------------------------------------------------------ */

/**
 * The cookie holds `userId.generation`. The generation lets "sign out
 * everywhere" invalidate cookies already issued on other devices, which a bare
 * user id could not do. Cookies written before this format are read as
 * generation 0 so existing sessions keep working.
 */
function parseSessionCookie(value: string): { userId: string; epoch: number } | null {
  if (!value) return null;
  const separator = value.lastIndexOf(".");
  if (separator < 0) return { userId: value, epoch: 0 };
  const userId = value.slice(0, separator);
  const epoch = Number.parseInt(value.slice(separator + 1), 10);
  if (!userId || Number.isNaN(epoch)) return null;
  return { userId, epoch };
}

export async function getSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value ?? "";
  return parseSessionCookie(raw)?.userId ?? null;
}

export async function setSession(userId: string): Promise<void> {
  const jar = await cookies();
  const epoch = await getSessionEpoch(userId);
  jar.set(SESSION_COOKIE, `${userId}.${epoch}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/** The signed-in user, or null when there is no valid session. */
export async function requireUser(): Promise<User | null> {
  const jar = await cookies();
  const session = parseSessionCookie(jar.get(SESSION_COOKIE)?.value ?? "");
  if (!session) return null;

  // A cookie issued before the user's latest "sign out everywhere" is dead.
  const epoch = await getSessionEpoch(session.userId);
  if (session.epoch !== epoch) return null;

  return getUser(session.userId);
}

/* ------------------------------------------------------------------ */
/* Route helpers                                                       */
/* ------------------------------------------------------------------ */

export function json<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status: number): NextResponse<ApiError> {
  return NextResponse.json<ApiError>({ error: message }, { status });
}

export const unauthorized = (): NextResponse<ApiError> =>
  apiError("You must be signed in to do that.", 401);
export const forbidden = (): NextResponse<ApiError> =>
  apiError("You do not have access to that project.", 403);
export const notFound = (what = "Resource"): NextResponse<ApiError> =>
  apiError(`${what} not found.`, 404);

/**
 * Parse and validate a JSON request body. Returns either the typed value or a
 * ready-made 400 response, so routes never have to guess at zod internals.
 */
export async function readBody<T>(
  request: NextRequest,
  schema: ZodType<T>
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse<ApiError> }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, response: apiError("Request body must be valid JSON.", 400) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const where = first?.path.join(".");
    const message = first ? `${where ? `${where}: ` : ""}${first.message}` : "Invalid request body.";
    return { ok: false, response: apiError(message, 400) };
  }
  return { ok: true, data: parsed.data };
}

function serverError(error: unknown): NextResponse<ApiError> {
  console.error("[hercules/api] unhandled error:", error);
  const detail = error instanceof Error ? error.message : "Unexpected server error.";
  return apiError(
    process.env.NODE_ENV === "production" ? "Something went wrong on our side." : detail,
    500
  );
}

/**
 * Wrap a route handler so an unexpected throw becomes a 500 JSON ApiError
 * instead of Next's HTML error page.
 */
export function route(
  handler: (request: NextRequest) => Promise<Response>
): (request: NextRequest) => Promise<Response> {
  return async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      return serverError(error);
    }
  };
}

/** Same as `route`, for dynamic segments. Next 16 hands params as a Promise. */
export function routeWithParams<P>(
  handler: (request: NextRequest, context: { params: Promise<P> }) => Promise<Response>
): (request: NextRequest, context: { params: Promise<P> }) => Promise<Response> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return serverError(error);
    }
  };
}

/* ------------------------------------------------------------------ */
/* Login                                                               */
/* ------------------------------------------------------------------ */

export type LoginResult =
  | { ok: true; user: User }
  | { ok: false; status: 401 | 404; message: string };

/**
 * Demo login. Seeded accounts have no stored credential and accept any
 * password; accounts created through signup must match their stored hash.
 */
export async function attemptLogin(email: string, password: string): Promise<LoginResult> {
  const user = await getUserByEmail(email);
  if (!user) {
    return { ok: false, status: 404, message: "No account found for that email address." };
  }
  const credential = await getCredential(user.id);
  if (credential && !verifyPassword(password, credential)) {
    return { ok: false, status: 401, message: "That password is incorrect." };
  }
  return { ok: true, user };
}
