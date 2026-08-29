"use client";

import * as React from "react";
import Link from "next/link";
import { Copy, ExternalLink, Globe, MoreHorizontal, PenLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Dialog, ConfirmDialog } from "@/components/app/dialog";
import { ErrorNote, Spinner } from "@/components/app/primitives";
import { MiniWireframe } from "@/components/app/mini-wireframe";
import { StatusPill } from "@/components/app/status-pill";
import { KIND_LABEL } from "@/components/app/catalog";
import { useSession } from "@/components/app/session";
import { createProject, deleteProject, updateProject } from "@/lib/api-client";
import type { Project } from "@/lib/types";
import { cn, relativeTime } from "@/lib/utils";

export function ProjectCard({ project }: { project: Project }) {
  const { upsertProject, removeProject } = useSession();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [name, setName] = React.useState(project.name);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const rename = async () => {
    const next = name.trim();
    if (!next || next === project.name) {
      setRenameOpen(false);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const updated = await updateProject(project.id, { name: next });
      upsertProject(updated);
      setRenameOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Rename failed.");
    } finally {
      setPending(false);
    }
  };

  const duplicate = async () => {
    setMenuOpen(false);
    setPending(true);
    try {
      const copy = await createProject({
        prompt: project.prompt,
        kind: project.kind,
        name: `${project.name} copy`,
      });
      upsertProject(copy);
    } catch {
      /* the card stays as-is; the list is unchanged */
    } finally {
      setPending(false);
    }
  };

  const destroy = async () => {
    setPending(true);
    setError(null);
    try {
      await deleteProject(project.id);
      removeProject(project.id);
      setDeleteOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Delete failed.");
    } finally {
      setPending(false);
    }
  };

  const host = project.domain ?? `${project.slug}.hercules.app`;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-ring/40 hover:shadow-md">
      <Link
        href={`/dashboard/${project.id}`}
        className="block rounded-t-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="h-28 border-b border-border bg-muted/50 p-2.5">
          <MiniWireframe spec={project.spec} />
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold tracking-tight">
              <Link
                href={`/dashboard/${project.id}`}
                className="rounded outline-none after:absolute after:inset-0 after:content-[''] focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {project.name}
              </Link>
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {KIND_LABEL[project.kind]}
            </p>
          </div>
          <div ref={menuRef} className="relative z-10 shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={`Actions for ${project.name}`}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground outline-none transition hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {pending ? <Spinner /> : <MoreHorizontal className="size-4" />}
            </button>
            {menuOpen ? (
              <div
                role="menu"
                aria-label={`${project.name} actions`}
                className="animate-fade-up absolute top-full right-0 z-50 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg"
              >
                <MenuLink href={`/dashboard/${project.id}`} onSelect={() => setMenuOpen(false)}>
                  <ExternalLink className="size-4 text-muted-foreground" aria-hidden="true" />
                  Open
                </MenuLink>
                <MenuButton
                  onSelect={() => {
                    setMenuOpen(false);
                    setName(project.name);
                    setRenameOpen(true);
                  }}
                >
                  <PenLine className="size-4 text-muted-foreground" aria-hidden="true" />
                  Rename
                </MenuButton>
                <MenuButton onSelect={duplicate}>
                  <Copy className="size-4 text-muted-foreground" aria-hidden="true" />
                  Duplicate
                </MenuButton>
                <div className="my-1 h-px bg-border" />
                <MenuButton
                  destructive
                  onSelect={() => {
                    setMenuOpen(false);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete
                </MenuButton>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={project.status} size="sm" />
          {project.status === "live" ? (
            <span className="inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <Globe className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{host}</span>
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-2.5 text-xs text-muted-foreground">
          <span className="font-mono">v{project.version}</span>
          <span>Updated {relativeTime(project.updatedAt)}</span>
        </div>
      </div>

      <Dialog
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="Rename app"
        description="This is the name you and your team see in the workspace."
        footer={
          <>
            <Button variant="outline" onClick={() => setRenameOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button onClick={rename} disabled={pending || !name.trim()}>
              {pending ? <Spinner label="Saving" /> : null}
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {error ? <ErrorNote message={error} /> : null}
          <div className="space-y-1.5">
            <Label htmlFor={`rename-${project.id}`}>App name</Label>
            <Input
              id={`rename-${project.id}`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void rename();
              }}
            />
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={destroy}
        pending={pending}
        title={`Delete ${project.name}?`}
        description="The app, its data model and every version are removed. This cannot be undone."
      />
    </div>
  );
}

const MENU_ITEM =
  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm outline-none transition hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50";

function MenuLink({
  href,
  onSelect,
  children,
}: {
  href: string;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} role="menuitem" onClick={onSelect} className={MENU_ITEM}>
      {children}
    </Link>
  );
}

function MenuButton({
  onSelect,
  children,
  destructive,
}: {
  onSelect: () => void;
  children: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className={cn(MENU_ITEM, destructive && "text-destructive hover:bg-destructive/10")}
    >
      {children}
    </button>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="h-28 animate-pulse border-b border-border bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
