import * as React from "react";
import { cn } from "@/lib/utils";

/** Consistent vertical rhythm + max width for content-page sections. */
export function Section({
  className,
  innerClassName,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { innerClassName?: string }) {
  return (
    <section className={cn("py-14 md:py-16", className)} {...props}>
      <div className={cn("container-page", innerClassName)}>{children}</div>
    </section>
  );
}

export function SectionHeading({
  title,
  description,
  className,
  id,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <h2 id={id} className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
