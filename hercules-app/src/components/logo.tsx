import Link from "next/link";
import { cn } from "@/lib/utils";

/** Hercules mark — a stylised pillar/column, wordmark set in Geist. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-6", className)}
    >
      <rect x="1" y="1" width="22" height="22" rx="6.5" className="fill-primary" />
      <path
        d="M8.4 6.6v10.8M15.6 6.6v10.8M8.4 12h7.2"
        className="stroke-primary-foreground"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
  showWordmark = true,
}: {
  className?: string;
  href?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded-lg", className)}
    >
      <LogoMark />
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-tight">Hercules</span>
      )}
    </Link>
  );
}
