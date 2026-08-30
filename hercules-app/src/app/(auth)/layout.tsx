import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/data/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,var(--color-ring)_0%,transparent_70%)] opacity-[0.13]"
      />
      <header className="relative flex items-center justify-between px-5 py-5">
        <Logo href="/" />
        <ThemeToggle />
      </header>
      <main className="relative flex flex-1 items-start justify-center px-5 pb-16 pt-4 sm:items-center sm:pt-0">
        <div className="w-full max-w-[26rem]">{children}</div>
      </main>
      <footer className="relative px-5 pb-8 text-center text-xs text-muted-foreground">
        By continuing you agree to the{" "}
        <Link href="/legal/terms" className="underline underline-offset-2 hover:text-foreground">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-foreground">
          Privacy Policy
        </Link>
        . © {site.year} {site.legalName}.
      </footer>
    </div>
  );
}
