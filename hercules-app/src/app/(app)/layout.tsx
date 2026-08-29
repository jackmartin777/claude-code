import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";

/**
 * Server-side session gate. The auth cookie is set by /api/auth/*; a request
 * with no session-ish cookie at all never reaches the product shell.
 */
async function hasSession() {
  const jar = await cookies();
  return jar
    .getAll()
    .some(
      (cookie) =>
        Boolean(cookie.value) &&
        /(session|auth|token|sid|uid|user|hercules)/i.test(cookie.name) &&
        !/theme/i.test(cookie.name),
    );
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasSession())) redirect("/login");
  return <AppShell>{children}</AppShell>;
}
