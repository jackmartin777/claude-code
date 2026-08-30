"use client";

import * as React from "react";
import { Check, ExternalLink, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Dialog } from "@/components/app/dialog";
import { ErrorNote, Spinner } from "@/components/app/primitives";
import { publishProject } from "@/lib/api-client";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

export function PublishDialog({
  project,
  open,
  onClose,
  onPublished,
}: {
  project: Project;
  open: boolean;
  onClose: () => void;
  onPublished: (project: Project) => void;
}) {
  const [mode, setMode] = React.useState<"subdomain" | "custom">(
    project.domain ? "custom" : "subdomain",
  );
  const [domain, setDomain] = React.useState(project.domain ?? "");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setDone(null);
      setError(null);
    }
  }, [open]);

  const fallback = `${project.slug}.hercules.app`;

  const publish = async () => {
    const custom = domain.trim().toLowerCase();
    if (mode === "custom" && !DOMAIN_RE.test(custom)) {
      setError("Enter a domain like app.yourcompany.com.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const updated = await publishProject(project.id, mode === "custom" ? custom : undefined);
      onPublished(updated);
      setDone(updated.domain ?? fallback);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Publish failed. Try again in a moment.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={done ? "Your app is live" : "Publish this app"}
      description={
        done
          ? undefined
          : "Hercules builds, hosts and serves it. Publishing takes a few seconds."
      }
      footer={
        done ? (
          <Button onClick={onClose}>Done</Button>
        ) : (
          <>
            <Button variant="outline" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button onClick={publish} disabled={pending}>
              {pending ? <Spinner label="Publishing" /> : <Globe className="size-4" />}
              {pending ? "Publishing…" : "Publish"}
            </Button>
          </>
        )
      }
    >
      {done ? (
        <div className="space-y-3">
          <p className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2.5 text-sm text-success">
            <Check className="size-4 shrink-0" aria-hidden="true" />
            Deployed to production
          </p>
          <a
            href={`https://${done}`}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm outline-none transition hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate font-mono text-[13px]">{done}</span>
            <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {error ? <ErrorNote message={error} /> : null}
          <div role="radiogroup" aria-label="Where to publish" className="space-y-2">
            <ModeOption
              checked={mode === "subdomain"}
              onSelect={() => setMode("subdomain")}
              title="Hercules subdomain"
              detail={fallback}
            />
            <ModeOption
              checked={mode === "custom"}
              onSelect={() => setMode("custom")}
              title="Custom domain"
              detail="Point a domain you own at this app."
            />
          </div>
          {mode === "custom" ? (
            <div className="space-y-1.5">
              <Label htmlFor="publish-domain">Domain</Label>
              <Input
                id="publish-domain"
                value={domain}
                autoFocus
                placeholder="app.yourcompany.com"
                onChange={(event) => setDomain(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void publish();
                }}
              />
              <p className="text-xs text-muted-foreground">
                Add a CNAME pointing to {fallback} — Hercules issues the certificate.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </Dialog>
  );
}

function ModeOption({
  checked,
  onSelect,
  title,
  detail,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-2.5 rounded-lg border p-3 text-left outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50",
        checked ? "border-ring/60 bg-accent/40" : "border-border hover:bg-accent/30",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
          checked ? "border-foreground" : "border-muted-foreground/50",
        )}
        aria-hidden="true"
      >
        {checked ? <span className="size-2 rounded-full bg-foreground" /> : null}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block truncate font-mono text-xs text-muted-foreground">{detail}</span>
      </span>
    </button>
  );
}
