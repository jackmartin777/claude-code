import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Closing call-to-action shared by the long content pages. */
export function CtaCard({
  title = "Build your first app today",
  description = "Describe the software your business needs and watch Hercules build it. No credit card required.",
  primary = { label: "Start building free", href: "/signup" },
  secondary = { label: "Talk to sales", href: "/support" },
  className,
}: {
  title?: string;
  description?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string } | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card px-6 py-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:px-12",
        className,
      )}
    >
      <h2 className="text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-pretty text-muted-foreground">
        {description}
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link href={primary.href} className={buttonClasses("primary", "lg")}>
          {primary.label}
        </Link>
        {secondary ? (
          <Link href={secondary.href} className={buttonClasses("outline", "lg")}>
            {secondary.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
