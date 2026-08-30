"use client";

import * as React from "react";
import {
  ChevronRight,
  Database,
  History,
  Layers,
  Lock,
  Monitor,
  RefreshCw,
  RotateCcw,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/app/dialog";
import { EmptyState, ErrorNote, Skeleton } from "@/components/app/primitives";
import { AppPreview, labelFor } from "@/components/app/app-preview";
import { SCREEN_KIND_LABEL } from "@/components/app/catalog";
import { getVersions, restoreVersion } from "@/lib/api-client";
import type { AppSpec, Project, Version } from "@/lib/types";
import { cn, relativeTime } from "@/lib/utils";

const TABS = [
  { id: "preview", label: "Preview" },
  { id: "data", label: "Data" },
  { id: "screens", label: "Screens" },
  { id: "versions", label: "Versions" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function PreviewPane({
  project,
  spec,
  onProjectUpdate,
  screenId,
  onSelectScreen,
}: {
  project: Project;
  spec: AppSpec;
  onProjectUpdate: (project: Project) => void;
  screenId: string | null;
  onSelectScreen: (id: string) => void;
}) {
  const [tab, setTab] = React.useState<TabId>("preview");
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  const onTabKeyDown = (event: React.KeyboardEvent) => {
    const index = TABS.findIndex((item) => item.id === tab);
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next = TABS[(index + (event.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
    setTab(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-muted/30">
      <div
        role="tablist"
        aria-label="App views"
        onKeyDown={onTabKeyDown}
        className="flex shrink-0 items-center gap-1 border-b border-border bg-background px-3"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            ref={(node) => {
              tabRefs.current[item.id] = node;
            }}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            tabIndex={tab === item.id ? 0 : -1}
            onClick={() => setTab(item.id)}
            className={cn(
              "relative -mb-px border-b-2 px-3 py-2.5 text-[13px] font-medium outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50",
              tab === item.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        tabIndex={0}
        className="min-h-0 flex-1 overflow-hidden outline-none"
      >
        {tab === "preview" ? (
          <PreviewTab
            project={project}
            spec={spec}
            screenId={screenId}
            onSelectScreen={onSelectScreen}
          />
        ) : tab === "data" ? (
          <DataTab spec={spec} />
        ) : tab === "screens" ? (
          <ScreensTab spec={spec} screenId={screenId} onSelectScreen={onSelectScreen} />
        ) : (
          <VersionsTab project={project} onProjectUpdate={onProjectUpdate} />
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Preview ------------------------------- */

export function hostFor(project: Project) {
  return project.domain ?? `${project.slug}.hercules.app`;
}

export function BrowserFrame({
  project,
  device,
  onDeviceChange,
  children,
  className,
  toolbarExtra,
}: {
  project: Project;
  device: "desktop" | "mobile";
  onDeviceChange?: (device: "desktop" | "mobile") => void;
  children: React.ReactNode;
  className?: string;
  toolbarExtra?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border bg-muted/50 px-3">
        <div className="flex shrink-0 gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        </div>
        <div className="mx-auto flex h-6 min-w-0 max-w-72 flex-1 items-center gap-1.5 rounded-md border border-border bg-background px-2">
          <Lock className="size-2.5 shrink-0 text-success" aria-hidden="true" />
          <span className="truncate text-[11px] text-muted-foreground">{hostFor(project)}</span>
        </div>
        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] text-secondary-foreground">
          v{project.version}
        </span>
        {onDeviceChange ? (
          <div
            role="group"
            aria-label="Preview device"
            className="flex shrink-0 items-center gap-0.5 rounded-md border border-border p-0.5"
          >
            {(
              [
                { id: "desktop", label: "Desktop preview", Icon: Monitor },
                { id: "mobile", label: "Mobile preview", Icon: Smartphone },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                aria-label={label}
                aria-pressed={device === id}
                onClick={() => onDeviceChange(id)}
                className={cn(
                  "inline-flex size-5 items-center justify-center rounded outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  device === id
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-3" />
              </button>
            ))}
          </div>
        ) : null}
        {toolbarExtra}
      </div>
      <div className="flex min-h-0 flex-1 justify-center overflow-hidden bg-muted/40 p-3">
        <div
          className={cn(
            "flex min-h-0 w-full flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-[max-width] duration-300",
            device === "mobile" ? "max-w-[26rem]" : "max-w-full",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function PreviewTab({
  project,
  spec,
  screenId,
  onSelectScreen,
}: {
  project: Project;
  spec: AppSpec;
  screenId: string | null;
  onSelectScreen: (id: string) => void;
}) {
  const [device, setDevice] = React.useState<"desktop" | "mobile">("desktop");
  return (
    <div className="h-full min-h-0 p-3">
      <BrowserFrame
        project={project}
        device={device}
        onDeviceChange={setDevice}
        className="h-full"
      >
        <AppPreview
          spec={spec}
          screenId={screenId}
          onSelectScreen={onSelectScreen}
          compact={device === "mobile"}
        />
      </BrowserFrame>
    </div>
  );
}

/* --------------------------------- Data -------------------------------- */

const TYPE_TONE: Record<string, string> = {
  text: "bg-muted text-muted-foreground",
  number: "bg-muted text-muted-foreground",
  currency: "bg-success/12 text-success",
  date: "bg-muted text-muted-foreground",
  boolean: "bg-muted text-muted-foreground",
  select: "bg-ring/15 text-foreground",
  relation: "bg-ring/15 text-foreground",
  email: "bg-muted text-muted-foreground",
  url: "bg-muted text-muted-foreground",
};

function DataTab({ spec }: { spec: AppSpec }) {
  const [open, setOpen] = React.useState<string[]>(() =>
    spec.tables.length > 0 ? [spec.tables[0].name] : [],
  );

  if (spec.tables.length === 0) {
    return (
      <div className="h-full overflow-y-auto p-4">
        <EmptyState
          icon={<Database className="size-5" />}
          title="No tables yet"
          description="Ask Hercules what the app should store — customers, orders, jobs — and the data model appears here."
        />
      </div>
    );
  }

  return (
    <div className="h-full space-y-2 overflow-y-auto p-3">
      {spec.tables.map((table) => {
        const expanded = open.includes(table.name);
        return (
          <div key={table.name} className="overflow-hidden rounded-xl border border-border bg-card">
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() =>
                setOpen((current) =>
                  current.includes(table.name)
                    ? current.filter((name) => name !== table.name)
                    : [...current, table.name],
                )
              }
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left outline-none transition hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <ChevronRight
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform",
                  expanded && "rotate-90",
                )}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{labelFor(table.name)}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {table.description}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                {table.rowCount.toLocaleString("en-US")} rows
              </span>
            </button>
            {expanded ? (
              <ul className="divide-y divide-border border-t border-border">
                {table.fields.map((field) => (
                  <li key={field.name} className="flex items-center gap-2 px-3 py-2 pl-9">
                    <span className="min-w-0 flex-1 truncate font-mono text-[13px]">
                      {field.name}
                      {field.required ? (
                        <span className="text-destructive" title="Required">
                          {" *"}
                          <span className="sr-only">required</span>
                        </span>
                      ) : null}
                    </span>
                    {field.relation ? (
                      <span className="truncate text-[11px] text-muted-foreground">
                        → {field.relation}
                      </span>
                    ) : null}
                    {field.options && field.options.length > 0 ? (
                      <span className="hidden truncate text-[11px] text-muted-foreground sm:inline">
                        {field.options.slice(0, 3).join(" · ")}
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                        TYPE_TONE[field.type] ?? "bg-muted text-muted-foreground",
                      )}
                    >
                      {field.type}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------- Screens ------------------------------- */

function ScreensTab({
  spec,
  screenId,
  onSelectScreen,
}: {
  spec: AppSpec;
  screenId: string | null;
  onSelectScreen: (id: string) => void;
}) {
  if (spec.screens.length === 0) {
    return (
      <div className="h-full overflow-y-auto p-4">
        <EmptyState
          icon={<Layers className="size-5" />}
          title="No screens yet"
          description="Screens appear here as Hercules builds them."
        />
      </div>
    );
  }
  return (
    <div className="h-full space-y-2 overflow-y-auto p-3">
      {spec.screens.map((screen) => {
        const table = spec.tables.find(
          (item) => item.name.toLowerCase() === screen.table?.toLowerCase(),
        );
        const active = screen.id === screenId;
        return (
          <button
            key={screen.id}
            type="button"
            onClick={() => onSelectScreen(screen.id)}
            className={cn(
              "flex w-full items-start gap-3 rounded-xl border bg-card p-3 text-left outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50",
              active ? "border-ring/60" : "border-border hover:border-ring/40",
            )}
          >
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{screen.name}</span>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  {SCREEN_KIND_LABEL[screen.kind]}
                </span>
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                {screen.kind === "dashboard"
                  ? `${screen.stats?.length ?? 0} stat tiles and a trend chart`
                  : table
                    ? `${table.fields.length} fields from ${labelFor(table.name)} · ${table.rowCount.toLocaleString("en-US")} rows`
                    : "No table connected"}
              </span>
            </span>
            <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
              {active ? "Showing" : "Show"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------- Versions ------------------------------- */

function VersionsTab({
  project,
  onProjectUpdate,
}: {
  project: Project;
  onProjectUpdate: (project: Project) => void;
}) {
  const [versions, setVersions] = React.useState<Version[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [restoring, setRestoring] = React.useState<Version | null>(null);
  const [pending, setPending] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setVersions(await getVersions(project.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load version history.");
    } finally {
      setLoading(false);
    }
  }, [project.id]);

  React.useEffect(() => {
    void load();
  }, [load, project.version]);

  const restore = async () => {
    if (!restoring) return;
    setPending(true);
    try {
      const updated = await restoreVersion(project.id, restoring.id);
      onProjectUpdate(updated);
      setRestoring(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Restore failed.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-3">
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="rounded-xl border border-border bg-card p-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="mt-2 h-3 w-1/4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorNote
          message={error}
          action={
            <Button size="sm" variant="outline" onClick={() => void load()}>
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Retry
            </Button>
          }
        />
      ) : versions.length === 0 ? (
        <EmptyState
          icon={<History className="size-5" />}
          title="No versions yet"
          description="Every build you accept is saved here so you can roll back at any time."
        />
      ) : (
        <ol className="space-y-2">
          {versions
            .slice()
            .sort((a, b) => b.version - a.version)
            .map((version) => {
              const current = version.version === project.version;
              return (
                <li
                  key={version.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border bg-card p-3",
                    current ? "border-ring/60" : "border-border",
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted font-mono text-xs font-medium">
                    v{version.version}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm font-medium">{version.label}</span>
                      {version.published ? (
                        <span className="rounded-full bg-success/12 px-2 py-0.5 text-[11px] font-medium text-success">
                          Published
                        </span>
                      ) : null}
                      {current ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          Current
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {relativeTime(version.createdAt)}
                    </span>
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={current}
                    onClick={() => setRestoring(version)}
                  >
                    <RotateCcw className="size-3.5" aria-hidden="true" />
                    Restore
                  </Button>
                </li>
              );
            })}
        </ol>
      )}

      <ConfirmDialog
        open={restoring !== null}
        onClose={() => setRestoring(null)}
        onConfirm={restore}
        pending={pending}
        confirmLabel="Restore"
        title={`Restore v${restoring?.version ?? ""}?`}
        description="The app goes back to this build. Your later versions stay in the history."
      />
    </div>
  );
}
