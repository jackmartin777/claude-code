import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type FaqItem = { q: string; a: string };

/**
 * Native <details> accordion — no JavaScript, keyboard accessible for free,
 * and the answers stay in the DOM for search engines.
 */
export function FaqAccordion({
  items,
  className,
}: {
  items: readonly FaqItem[];
  className?: string;
}) {
  return (
    <div className={cn("divide-y divide-border overflow-hidden rounded-xl border border-border bg-card", className)}>
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary
            className={cn(
              "flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4",
              "text-[15px] font-medium text-foreground outline-none transition-colors",
              "hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/50",
              "[&::-webkit-details-marker]:hidden",
            )}
          >
            <span className="text-pretty">{item.q}</span>
            <ChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <div className="px-5 pb-5 text-sm leading-6 text-muted-foreground">
            <p className="max-w-3xl text-pretty">{item.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
