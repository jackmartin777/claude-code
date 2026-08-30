import type { AppSpec, ScreenKind } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A thumbnail abstraction of a generated app — pure divs, no images.
 * The layout is chosen from the spec's own screen kinds so two apps with
 * different shapes never look the same.
 */
export function MiniWireframe({
  spec,
  className,
}: {
  spec: AppSpec | undefined;
  className?: string;
}) {
  const screens = spec?.screens ?? [];
  const kind: ScreenKind = screens[0]?.kind ?? "dashboard";
  const railItems = Math.min(Math.max(screens.length, 3), 5);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-full w-full gap-1 overflow-hidden rounded-md bg-background p-1.5",
        className,
      )}
    >
      <div className="flex w-1/5 max-w-8 shrink-0 flex-col gap-1 rounded-sm bg-muted p-1">
        <div className="h-1 w-2/3 rounded-full bg-foreground/25" />
        {Array.from({ length: railItems }).map((_, index) => (
          <div key={index} className="h-1 w-full rounded-full bg-foreground/10" />
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1/3 rounded-full bg-foreground/20" />
          <div className="ml-auto h-1.5 w-4 rounded-full bg-ring/50" />
        </div>
        <Body kind={kind} />
      </div>
    </div>
  );
}

function Body({ kind }: { kind: ScreenKind }) {
  if (kind === "table" || kind === "settings") {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-0.5 rounded-sm border border-border p-1">
        <div className="flex gap-1">
          {[3, 2, 2, 1].map((span, index) => (
            <div key={index} className="h-1 rounded-full bg-foreground/20" style={{ flex: span }} />
          ))}
        </div>
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="flex gap-1">
            {[3, 2, 2, 1].map((span, index) => (
              <div
                key={index}
                className="h-1 rounded-full bg-foreground/8"
                style={{ flex: span }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (kind === "board") {
    return (
      <div className="flex min-h-0 flex-1 gap-1">
        {[3, 2, 4].map((cards, column) => (
          <div key={column} className="flex flex-1 flex-col gap-0.5 rounded-sm bg-muted p-1">
            <div className="h-1 w-2/3 rounded-full bg-foreground/20" />
            {Array.from({ length: cards }).map((_, index) => (
              <div key={index} className="h-2 rounded-xs bg-card shadow-[0_0_0_1px_var(--border)]" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (kind === "form") {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-1 rounded-sm border border-border p-1.5">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex flex-col gap-0.5">
            <div className="h-1 w-1/4 rounded-full bg-foreground/20" />
            <div className="h-2 rounded-xs bg-muted" />
          </div>
        ))}
        <div className="mt-auto h-2 w-1/4 self-end rounded-xs bg-primary/70" />
      </div>
    );
  }

  if (kind === "detail") {
    return (
      <div className="flex min-h-0 flex-1 gap-1">
        <div className="flex flex-[2] flex-col gap-1 rounded-sm border border-border p-1">
          <div className="h-1 w-1/2 rounded-full bg-foreground/20" />
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="h-1 w-full rounded-full bg-foreground/8" />
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-1 rounded-sm bg-muted p-1">
          {[0, 1].map((row) => (
            <div key={row} className="h-3 rounded-xs bg-card" />
          ))}
        </div>
      </div>
    );
  }

  // dashboard
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1">
      <div className="flex gap-1">
        {[0, 1, 2].map((tile) => (
          <div key={tile} className="flex flex-1 flex-col gap-0.5 rounded-sm bg-muted p-1">
            <div className="h-0.5 w-2/3 rounded-full bg-foreground/20" />
            <div className="h-1.5 w-1/2 rounded-full bg-foreground/35" />
          </div>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 items-end gap-0.5 rounded-sm border border-border p-1">
        {[40, 65, 50, 80, 60, 95, 72].map((height, index) => (
          <div
            key={index}
            className="flex-1 rounded-t-xs bg-chart-1/70"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}
