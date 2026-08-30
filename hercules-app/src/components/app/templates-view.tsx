"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorNote, Spinner } from "@/components/app/primitives";
import { MiniWireframe } from "@/components/app/mini-wireframe";
import { KIND_LABEL, TEMPLATES, TEMPLATE_CATEGORIES } from "@/components/app/catalog";
import { useCreateProject } from "@/components/app/new-app-dialog";
import type { AppSpec, ScreenKind } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Each template gets a thumbnail shape so the gallery reads at a glance. */
const SHAPES: Record<string, ScreenKind[]> = {
  crm: ["board", "table", "dashboard"],
  erp: ["dashboard", "table", "form"],
  hr: ["form", "table", "dashboard"],
  inventory: ["table", "dashboard", "form"],
  ops: ["dashboard", "table"],
  "client-portal": ["detail", "table", "form"],
  booking: ["dashboard", "form", "table"],
  storefront: ["table", "detail", "dashboard"],
};

function previewSpec(id: string): AppSpec {
  const kinds = SHAPES[id] ?? ["dashboard", "table"];
  return {
    title: id,
    summary: "",
    capabilities: [],
    tables: [],
    roles: [],
    screens: kinds.map((kind, index) => ({ id: `${id}-${index}`, name: kind, kind })),
  };
}

export function TemplatesView() {
  const [category, setCategory] = React.useState<string>("All");
  const { create, pending, error } = useCreateProject();
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const visible = TEMPLATES.filter(
    (template) => category === "All" || template.category === category,
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          A starting brief, not a rigid theme. Pick the closest one and then ask Hercules to change
          anything — the template is just the first message in the conversation.
        </p>
      </header>

      {error ? <ErrorNote className="mt-4" message={error} /> : null}

      <div role="group" aria-label="Filter templates" className="mt-5 flex flex-wrap gap-1.5">
        {["All", ...TEMPLATE_CATEGORIES].map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={category === option}
            onClick={() => setCategory(option)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50",
              category === option
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((template) => {
          const busy = pending && activeId === template.id;
          return (
            <article
              key={template.id}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-ring/40"
            >
              <div className="h-28 border-b border-border bg-muted/50 p-2.5">
                <MiniWireframe spec={previewSpec(template.id)} />
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-2 p-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-[15px] font-semibold tracking-tight">{template.name}</h2>
                  <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    {KIND_LABEL[template.kind]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{template.tagline}</p>
                <p className="line-clamp-3 rounded-lg bg-muted/50 p-2.5 text-xs leading-relaxed text-muted-foreground">
                  {template.prompt}
                </p>
                <Button
                  className="mt-auto w-full"
                  disabled={pending}
                  onClick={() => {
                    setActiveId(template.id);
                    void create(template.prompt, template.kind);
                  }}
                >
                  {busy ? <Spinner label="Creating app" /> : <Sparkles className="size-4" />}
                  {busy ? "Starting build…" : "Use template"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
