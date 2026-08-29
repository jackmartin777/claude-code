"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Check, Globe, Loader2, Maximize2, PenLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, Skeleton } from "@/components/app/primitives";
import { StatusPill } from "@/components/app/status-pill";
import { BuilderChat } from "@/components/app/builder-chat";
import { BrowserFrame, PreviewPane, hostFor } from "@/components/app/preview-pane";
import { AppPreview } from "@/components/app/app-preview";
import { PublishDialog } from "@/components/app/publish-dialog";
import { useSession } from "@/components/app/session";
import { getProject, updateProject } from "@/lib/api-client";
import type { AppSpec, Project } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Builder({ projectId }: { projectId: string }) {
  const { upsertProject } = useSession();
  const [project, setProject] = React.useState<Project | null>(null);
  const [spec, setSpec] = React.useState<AppSpec | null>(null);
  const [screenId, setScreenId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [streaming, setStreaming] = React.useState(false);
  const [pane, setPane] = React.useState<"chat" | "preview">("chat");
  const [fullscreen, setFullscreen] = React.useState(false);
  const [publishOpen, setPublishOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await getProject(projectId);
      setProject(loaded);
      setSpec(loaded.spec ?? null);
      setScreenId(loaded.spec?.screens?.[0]?.id ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not open this app.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleProject = React.useCallback(
    (next: Project) => {
      setProject(next);
      if (next.spec) {
        setSpec(next.spec);
        setScreenId((current) =>
          current && next.spec.screens.some((screen) => screen.id === current)
            ? current
            : (next.spec.screens[0]?.id ?? null),
        );
      }
      upsertProject(next);
    },
    [upsertProject],
  );

  const handleSpec = React.useCallback((next: AppSpec) => {
    setSpec(next);
    setScreenId((current) =>
      current && next.screens.some((screen) => screen.id === current)
        ? current
        : (next.screens[0]?.id ?? null),
    );
  }, []);

  const handleStreaming = React.useCallback((value: boolean) => setStreaming(value), []);

  if (loading) return <BuilderSkeleton />;

  if (error || !project || !spec) {
    return (
      <div className="mx-auto flex h-full max-w-lg items-center justify-center p-6">
        <EmptyState
          className="w-full"
          icon={<AlertTriangle className="size-5" />}
          title="This app could not be opened"
          description={error ?? "It may have been deleted from another window."}
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => void load()}>
                Try again
              </Button>
              <Link
                href="/dashboard"
                className="inline-flex h-9.5 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground outline-none transition hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                Back to apps
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3 sm:px-4">
        <Link
          href="/dashboard"
          aria-label="Back to apps"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 lg:hidden"
        >
          <ArrowLeft className="size-4" />
        </Link>

        <EditableName project={project} onUpdate={handleProject} />

        <div className="flex shrink-0 items-center gap-2">
          <StatusPill status={project.status} />
          {streaming ? (
            <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              Building
            </span>
          ) : null}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {project.status === "live" ? (
            <a
              href={`https://${hostFor(project)}`}
              target="_blank"
              rel="noreferrer noopener"
              className="hidden items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground outline-none transition hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 md:inline-flex"
            >
              <Globe className="size-3.5" aria-hidden="true" />
              {hostFor(project)}
            </a>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFullscreen(true)}
            aria-label="Open the preview full screen"
          >
            <Maximize2 className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Full screen</span>
          </Button>
          <Button size="sm" onClick={() => setPublishOpen(true)}>
            {project.status === "live" ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <Globe className="size-3.5" aria-hidden="true" />
            )}
            {project.status === "live" ? "Republish" : "Publish"}
          </Button>
        </div>
      </header>

      <div
        role="tablist"
        aria-label="Builder panes"
        className="flex shrink-0 items-center gap-1 border-b border-border px-3 py-1.5 lg:hidden"
      >
        {(["chat", "preview"] as const).map((value) => (
          <button
            key={value}
            role="tab"
            type="button"
            aria-selected={pane === value}
            onClick={() => setPane(value)}
            className={cn(
              "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50",
              pane === value
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {value === "chat" ? "Chat" : "Preview"}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        <section
          aria-label="Conversation"
          className={cn(
            "min-h-0 w-full flex-col border-border lg:flex lg:w-[38%] lg:min-w-[21rem] lg:border-r",
            pane === "chat" ? "flex" : "hidden",
          )}
        >
          <BuilderChat
            project={project}
            onSpec={handleSpec}
            onProject={handleProject}
            onStreamingChange={handleStreaming}
          />
        </section>
        <section
          aria-label="App preview"
          className={cn("min-h-0 flex-1 lg:block", pane === "preview" ? "block" : "hidden")}
        >
          <PreviewPane
            project={project}
            spec={spec}
            onProjectUpdate={handleProject}
            screenId={screenId}
            onSelectScreen={setScreenId}
          />
        </section>
      </div>

      <PublishDialog
        project={project}
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onPublished={handleProject}
      />

      {fullscreen ? (
        <FullscreenPreview
          project={project}
          spec={spec}
          screenId={screenId}
          onSelectScreen={setScreenId}
          onClose={() => setFullscreen(false)}
        />
      ) : null}
    </div>
  );
}

function EditableName({
  project,
  onUpdate,
}: {
  project: Project;
  onUpdate: (project: Project) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(project.name);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    setValue(project.name);
  }, [project.name]);

  const commit = async () => {
    const next = value.trim();
    setEditing(false);
    if (!next || next === project.name) {
      setValue(project.name);
      return;
    }
    setPending(true);
    try {
      onUpdate(await updateProject(project.id, { name: next }));
    } catch {
      setValue(project.name);
    } finally {
      setPending(false);
    }
  };

  if (editing) {
    return (
      <Input
        autoFocus
        value={value}
        aria-label="App name"
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void commit();
          }
          if (event.key === "Escape") {
            setValue(project.name);
            setEditing(false);
          }
        }}
        className="h-8 max-w-56 text-sm font-semibold"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title="Rename this app"
      className="group -ml-1 flex min-w-0 items-center gap-1.5 rounded-lg px-1.5 py-1 outline-none transition hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <span className="truncate text-sm font-semibold tracking-tight">{project.name}</span>
      {pending ? (
        <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" />
      ) : (
        <PenLine
          className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      )}
      <span className="sr-only">Rename app</span>
    </button>
  );
}

function FullscreenPreview({
  project,
  spec,
  screenId,
  onSelectScreen,
  onClose,
}: {
  project: Project;
  spec: AppSpec;
  screenId: string | null;
  onSelectScreen: (id: string) => void;
  onClose: () => void;
}) {
  const [device, setDevice] = React.useState<"desktop" | "mobile">("desktop");

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.name} preview`}
      className="fixed inset-0 z-100 flex flex-col bg-background p-3 sm:p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <p className="truncate text-sm font-semibold">{project.name}</p>
        <span className="text-xs text-muted-foreground">Preview</span>
        <Button
          variant="ghost"
          size="icon"
          autoFocus
          onClick={onClose}
          aria-label="Close full screen preview"
          className="ml-auto"
        >
          <X className="size-4" />
        </Button>
      </div>
      <BrowserFrame
        project={project}
        device={device}
        onDeviceChange={setDevice}
        className="min-h-0 flex-1"
      >
        <AppPreview
          spec={spec}
          screenId={screenId}
          onSelectScreen={onSelectScreen}
          compact={device === "mobile"}
        />
      </BrowserFrame>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Press <kbd className="font-sans font-medium">Esc</kbd> to close
      </p>
    </div>
  );
}

function BuilderSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <div className="ml-auto flex gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="hidden min-h-0 w-[38%] min-w-[21rem] flex-col gap-4 border-r border-border p-5 lg:flex">
          <Skeleton className="h-14 w-3/5 self-end rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-auto h-20 w-full rounded-xl" />
        </div>
        <div className="min-h-0 flex-1 bg-muted/30 p-3">
          <div className="flex h-full flex-col gap-2">
            <Skeleton className="h-9 w-64 rounded-lg" />
            <Skeleton className="min-h-0 flex-1 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
