"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, LayoutGrid, Search, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { EmptyState, ErrorNote, Skeleton, Spinner } from "@/components/app/primitives";
import { ProjectCard, ProjectCardSkeleton } from "@/components/app/project-card";
import { useCreateProject } from "@/components/app/new-app-dialog";
import { KIND_LABEL, PLAN_META, TEMPLATES } from "@/components/app/catalog";
import { useSession } from "@/components/app/session";
import type { ProjectKind, ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "all" | ProjectStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "building", label: "Building" },
  { value: "draft", label: "Drafts" },
  { value: "error", label: "Errors" },
];

const KINDS: ProjectKind[] = ["internal", "customer", "marketing", "mobile"];

export function DashboardView() {
  const { user, projects, projectsLoading, loading, error, refresh } = useSession();
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("all");
  const [greeting, setGreeting] = React.useState("Welcome back");

  React.useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
  }, []);

  const visible = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects
      .filter((project) => (filter === "all" ? true : project.status === filter))
      .filter((project) =>
        needle
          ? project.name.toLowerCase().includes(needle) ||
            project.prompt.toLowerCase().includes(needle) ||
            (project.domain ?? "").toLowerCase().includes(needle)
          : true,
      )
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }, [projects, query, filter]);

  const liveCount = projects.filter((project) => project.status === "live").length;
  const planMeta = user ? PLAN_META[user.plan] : null;
  const creditsUsed = planMeta && user ? Math.max(0, planMeta.credits - user.credits) : 0;
  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting}
            {loading ? (
              <Skeleton className="ml-2 inline-block h-6 w-24 align-middle" />
            ) : firstName ? (
              `, ${firstName}`
            ) : (
              ""
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe what your business needs and Hercules builds it — database, screens, hosting and
            all.
          </p>
        </div>
        <Link
          href="/dashboard/templates"
          className="inline-flex items-center gap-1 rounded-lg text-sm font-medium text-muted-foreground outline-none transition hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Browse templates
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </header>

      <Composer />

      <UsageStrip
        apps={projects.length}
        live={liveCount}
        creditsUsed={creditsUsed}
        creditsTotal={planMeta?.credits ?? 0}
        loading={loading || projectsLoading}
      />

      <section aria-labelledby="apps-heading" className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="apps-heading" className="text-base font-semibold tracking-tight">
            Your apps
            {!projectsLoading && projects.length > 0 ? (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {projects.length}
              </span>
            ) : null}
          </h2>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <div className="relative w-full max-w-56 sm:w-56">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search apps"
                aria-label="Search apps"
                className="h-9 pl-8"
              />
            </div>
            <div
              role="group"
              aria-label="Filter by status"
              className="flex items-center gap-0.5 rounded-lg border border-border p-0.5"
            >
              {FILTERS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={filter === option.value}
                  onClick={() => setFilter(option.value)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    filter === option.value
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && !projectsLoading ? (
          <ErrorNote
            className="mt-4"
            message={error}
            action={
              <Button size="sm" variant="outline" onClick={() => void refresh()}>
                Retry
              </Button>
            }
          />
        ) : null}

        {projectsLoading ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((card) => (
              <ProjectCardSkeleton key={card} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <NoApps />
        ) : visible.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={<Search className="size-5" />}
            title="No apps match those filters"
            description="Try a different search term or clear the status filter."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                <X className="size-4" aria-hidden="true" />
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Composer() {
  const [prompt, setPrompt] = React.useState("");
  const [kind, setKind] = React.useState<ProjectKind>("internal");
  const { create, pending, error } = useCreateProject();
  const ref = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 180)}px`;
  }, [prompt]);

  const submit = () => void create(prompt, kind);

  return (
    <section aria-label="Build a new app" className="mt-6">
      <div className="rounded-2xl border border-border bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus-within:border-ring/50 focus-within:ring-[3px] focus-within:ring-ring/25">
        <label htmlFor="dashboard-composer" className="sr-only">
          What do you want to build?
        </label>
        <Textarea
          id="dashboard-composer"
          ref={ref}
          rows={2}
          value={prompt}
          disabled={pending}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="What do you want to build? e.g. a CRM where my reps log calls and I can see the pipeline by region"
          className="min-h-16 resize-none border-0 bg-transparent px-2 py-1.5 text-[15px] leading-relaxed shadow-none focus-visible:border-0 focus-visible:ring-0"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2 px-1">
          <div role="radiogroup" aria-label="App kind" className="flex flex-wrap gap-1">
            {KINDS.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={kind === option}
                onClick={() => setKind(option)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  kind === option
                    ? "border-transparent bg-secondary text-secondary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {KIND_LABEL[option]}
              </button>
            ))}
          </div>
          <Button
            onClick={submit}
            disabled={pending || prompt.trim().length < 8}
            className="ml-auto"
          >
            {pending ? <Spinner label="Starting build" /> : <Sparkles className="size-4" />}
            {pending ? "Starting build…" : "Build it"}
          </Button>
        </div>
      </div>
      {error ? <ErrorNote className="mt-2" message={error} /> : null}
    </section>
  );
}

function UsageStrip({
  apps,
  live,
  creditsUsed,
  creditsTotal,
  loading,
}: {
  apps: number;
  live: number;
  creditsUsed: number;
  creditsTotal: number;
  loading: boolean;
}) {
  const items = [
    { label: "Apps", value: apps.toString(), detail: "in this workspace" },
    { label: "Live apps", value: live.toString(), detail: "serving traffic" },
    {
      label: "Credits used",
      value: creditsUsed.toLocaleString("en-US"),
      detail: `of ${creditsTotal.toLocaleString("en-US")} this month`,
    },
  ];
  return (
    <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-baseline justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3"
        >
          <div>
            <dt className="text-xs text-muted-foreground">{item.label}</dt>
            <dd className="mt-0.5 text-xl font-semibold tracking-tight tabular-nums">
              {loading ? <Skeleton className="h-6 w-10" /> : item.value}
            </dd>
          </div>
          <span className="text-right text-[11px] text-muted-foreground">{item.detail}</span>
        </div>
      ))}
    </dl>
  );
}

function NoApps() {
  const { create, pending, error } = useCreateProject();
  const suggestions = TEMPLATES.slice(0, 4);
  return (
    <div className="mt-4">
      {error ? <ErrorNote className="mb-3" message={error} /> : null}
      <EmptyState
        icon={<LayoutGrid className="size-5" />}
        title="No apps yet"
        description="Start from a template or describe your own idea in the box above — most people have something working in a couple of minutes."
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {suggestions.map((template) => (
          <div
            key={template.id}
            className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">{template.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{template.tagline}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => void create(template.prompt, template.kind)}
            >
              Use template
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
