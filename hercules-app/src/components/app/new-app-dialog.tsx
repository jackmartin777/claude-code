"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Dialog } from "@/components/app/dialog";
import { ErrorNote, Spinner } from "@/components/app/primitives";
import { KIND_LABEL } from "@/components/app/catalog";
import { useSession } from "@/components/app/session";
import { createProject } from "@/lib/api-client";
import type { ProjectKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const KINDS: ProjectKind[] = ["internal", "customer", "marketing", "mobile"];

const IDEAS = [
  "a CRM my reps actually use",
  "a client portal with invoices",
  "an inventory tracker with low-stock alerts",
  "an HR portal for leave requests",
];

/** Shared "describe your app" flow — used by the sidebar, the dashboard and empty states. */
export function useCreateProject() {
  const router = useRouter();
  const { upsertProject } = useSession();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const create = React.useCallback(
    async (prompt: string, kind: ProjectKind = "internal") => {
      const trimmed = prompt.trim();
      if (!trimmed || pending) return;
      setPending(true);
      setError(null);
      try {
        const project = await createProject({ prompt: trimmed, kind });
        upsertProject(project);
        router.push(`/dashboard/${project.id}`);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "We could not start that build.");
        setPending(false);
      }
    },
    [pending, router, upsertProject],
  );

  return { create, pending, error, setError };
}

export function NewAppDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [prompt, setPrompt] = React.useState("");
  const [kind, setKind] = React.useState<ProjectKind>("internal");
  const { create, pending, error } = useCreateProject();

  React.useEffect(() => {
    if (open) setPrompt("");
  }, [open]);

  const submit = () => void create(prompt, kind);

  return (
    <Dialog
      open={open}
      onClose={pending ? () => undefined : onClose}
      title="Build a new app"
      description="Describe the software you need the way you'd brief a developer."
      className="max-w-lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending || prompt.trim().length < 8}>
            {pending ? <Spinner label="Creating your app" /> : <Sparkles className="size-4" />}
            {pending ? "Starting build…" : "Start building"}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {error ? <ErrorNote message={error} /> : null}
        <Textarea
          autoFocus
          rows={5}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") submit();
          }}
          placeholder={`Build me ${IDEAS[0]}…`}
          aria-label="Describe the app you want to build"
          className="min-h-32 text-[15px] leading-relaxed"
        />
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">What kind of app?</p>
          <div role="radiogroup" aria-label="App kind" className="flex flex-wrap gap-1.5">
            {KINDS.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={kind === option}
                onClick={() => setKind(option)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium outline-none transition",
                  "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  kind === option
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {KIND_LABEL[option]}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Try: {IDEAS.slice(1).map((idea, index) => (
            <React.Fragment key={idea}>
              {index > 0 ? ", " : ""}
              <button
                type="button"
                onClick={() => setPrompt(`Build me ${idea}.`)}
                className="rounded underline underline-offset-2 outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {idea}
              </button>
            </React.Fragment>
          ))}
        </p>
      </div>
    </Dialog>
  );
}
