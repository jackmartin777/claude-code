"use client";

import { Check, Loader2 } from "lucide-react";
import type { BuildStep } from "@/lib/types";
import { cn } from "@/lib/utils";

/** The build checklist. Each row animates pending → running → done in place. */
export function BuildSteps({ steps, className }: { steps: BuildStep[]; className?: string }) {
  if (steps.length === 0) return null;
  return (
    <ol className={cn("space-y-1.5", className)}>
      {steps.map((step) => (
        <li key={step.id} className="flex items-start gap-2 text-[13px] leading-5">
          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
            {step.status === "done" ? (
              <Check className="size-3.5 text-success transition-opacity duration-300" aria-hidden="true" />
            ) : step.status === "running" ? (
              <Loader2 className="size-3.5 animate-spin text-foreground" aria-hidden="true" />
            ) : (
              <span className="size-2.5 rounded-full border border-muted-foreground/40" aria-hidden="true" />
            )}
          </span>
          <span
            className={cn(
              "min-w-0 transition-colors duration-300",
              step.status === "pending" ? "text-muted-foreground/70" : "text-foreground",
            )}
          >
            <span className="font-medium">{step.verb}</span>{" "}
            <span className={step.status === "done" ? "text-muted-foreground" : undefined}>
              {step.subject}
            </span>
          </span>
          <span className="sr-only">
            {step.status === "done" ? "done" : step.status === "running" ? "in progress" : "pending"}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function upsertStep(steps: BuildStep[], next: BuildStep): BuildStep[] {
  const index = steps.findIndex((step) => step.id === next.id);
  if (index === -1) return [...steps, next];
  const copy = steps.slice();
  copy[index] = next;
  return copy;
}
