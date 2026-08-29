import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The single page-header treatment shared by every content page
 * (pricing, case studies, docs, support, changelog, careers, legal).
 * Always renders the page's one and only <h1>.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
  align = "left",
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <header className={cn("border-b border-border bg-muted/40", className)}>
      <div
        className={cn(
          "container-page py-14 md:py-16",
          centered && "flex flex-col items-center text-center",
        )}
      >
        {eyebrow ? (
          <p className="text-[13px] font-medium tracking-wide text-muted-foreground uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            "text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl",
            eyebrow && "mt-3",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              "mt-4 max-w-2xl text-lg leading-7 text-pretty text-muted-foreground",
              centered && "mx-auto",
            )}
          >
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-7">{children}</div> : null}
      </div>
    </header>
  );
}
