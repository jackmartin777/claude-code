import { STATUS_META } from "@/components/app/catalog";
import type { ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusPill({
  status,
  className,
  size = "md",
}: {
  status: ProjectStatus;
  className?: string;
  size?: "sm" | "md";
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs",
        meta.chip,
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          meta.dot,
          status === "building" && "animate-pulse",
        )}
        aria-hidden="true"
      />
      {meta.label}
    </span>
  );
}
