import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { docsBySection } from "@/data/docs";
import { cn } from "@/lib/utils";

function NavList({ currentSlug }: { currentSlug?: string }) {
  return (
    <ul className="space-y-6">
      {docsBySection().map((group) => (
        <li key={group.section}>
          <h2 className="px-3 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
            {group.section}
          </h2>
          <ul className="mt-2 space-y-0.5">
            {group.docs.map((doc) => {
              const active = doc.slug === currentSlug;
              return (
                <li key={doc.slug}>
                  <Link
                    href={`/docs/${doc.slug}`}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-3 py-1.5 text-sm outline-none transition-colors",
                      "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      active
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                    )}
                  >
                    {doc.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/**
 * Documentation navigation. Sticky rail on large screens, collapsed into a
 * disclosure on small ones so the content stays at the top of the page.
 */
export function DocsNav({
  currentSlug,
  className,
}: {
  currentSlug?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <details className="rounded-xl border border-border bg-card lg:hidden">
        <summary
          className={cn(
            "group flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3",
            "text-sm font-medium text-foreground outline-none",
            "focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "[&::-webkit-details-marker]:hidden",
          )}
        >
          Browse documentation
          <ChevronDown
            aria-hidden="true"
            className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
          />
        </summary>
        <nav aria-label="Documentation" className="border-t border-border px-1 py-4">
          <NavList currentSlug={currentSlug} />
        </nav>
      </details>

      <nav
        aria-label="Documentation"
        className="hidden lg:sticky lg:top-20 lg:block lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:pr-2"
      >
        <NavList currentSlug={currentSlug} />
      </nav>
    </div>
  );
}
