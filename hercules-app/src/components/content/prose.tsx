import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Typography wrapper for long-form content (docs bodies, legal pages).
 * Styling is expressed with child selectors so the callers can stay
 * plain semantic HTML.
 */
export function Prose({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "max-w-3xl text-[15px] leading-7 text-muted-foreground",
        "[&_h2]:mt-12 [&_h2]:scroll-mt-24 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground",
        "[&_h3]:mt-8 [&_h3]:scroll-mt-24 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground",
        "[&_h2+p]:mt-3 [&_h3+p]:mt-2",
        "[&_p]:mt-4 [&_p]:text-pretty",
        "[&_ul]:mt-4 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul>li]:list-disc",
        "[&_ol]:mt-4 [&_ol]:space-y-2 [&_ol]:pl-5 [&_ol>li]:list-decimal",
        "[&_li]:marker:text-muted-foreground",
        "[&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-foreground",
        "[&>*:first-child]:mt-0 [&>section:first-child>*:first-child]:mt-0",
        className,
      )}
      {...props}
    />
  );
}

/** A horizontally scrollable code block in the mono font. */
export function CodeBlock({
  source,
  lang,
  className,
}: {
  source: string;
  lang?: string;
  className?: string;
}) {
  return (
    <figure className={cn("mt-5 overflow-hidden rounded-xl border border-border bg-muted", className)}>
      {lang ? (
        <figcaption className="border-b border-border px-4 py-2 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
          {lang}
        </figcaption>
      ) : null}
      <div className="overflow-x-auto">
        <pre className="min-w-0 p-4 font-mono text-[13px] leading-6 text-foreground">
          <code>{source}</code>
        </pre>
      </div>
    </figure>
  );
}
