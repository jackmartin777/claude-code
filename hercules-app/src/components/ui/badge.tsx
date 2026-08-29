import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "muted" | "outline" | "success" | "accent";

const tones: Record<Tone, string> = {
  default: "bg-primary text-primary-foreground border-transparent",
  muted: "bg-muted text-muted-foreground border-transparent",
  outline: "border-border text-foreground",
  success: "border-transparent bg-success/12 text-success",
  accent: "border-transparent bg-ring/15 text-foreground",
};

export function Badge({
  className,
  tone = "muted",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
