"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LogOut, Menu, Settings as SettingsIcon, X, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/app/primitives";
import { CollapsedExpandButton, SidebarBody } from "@/components/app/sidebar";
import { NewAppDialog } from "@/components/app/new-app-dialog";
import { SessionProvider, useSession } from "@/components/app/session";
import { cn, initials } from "@/lib/utils";

const COLLAPSE_KEY = "hercules-sidebar-collapsed";

const STATIC_CRUMBS: Record<string, string> = {
  templates: "Templates",
  usage: "Usage",
  settings: "Settings",
  integrations: "Integrations",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Shell>{children}</Shell>
    </SessionProvider>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [newAppOpen, setNewAppOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* storage unavailable — default to the expanded rail */
    }
  }, []);

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* preference is per-view only */
      }
      return next;
    });
  }, []);

  React.useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const openNewApp = React.useCallback(() => {
    setDrawerOpen(false);
    setNewAppOpen(true);
  }, []);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <aside
        className={cn(
          "hidden shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:block",
          collapsed ? "w-[4.5rem]" : "w-[4.5rem] lg:w-64",
        )}
      >
        <SidebarBody
          variant="desktop"
          collapsed={collapsed}
          onNewApp={openNewApp}
          onToggleCollapse={toggleCollapsed}
        />
      </aside>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onNewApp={openNewApp} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          collapsed={collapsed}
          onExpand={toggleCollapsed}
          onOpenDrawer={() => setDrawerOpen(true)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>

      <NewAppDialog open={newAppOpen} onClose={() => setNewAppOpen(false)} />
    </div>
  );
}

function MobileDrawer({
  open,
  onClose,
  onNewApp,
}: {
  open: boolean;
  onClose: () => void;
  onNewApp: () => void;
}) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("a,button")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const nodes = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled])"),
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 md:hidden">
      <div className="absolute inset-0 bg-foreground/30" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Workspace navigation"
        className="animate-fade-up absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="absolute top-4 right-3 z-10 inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground outline-none transition hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <X className="size-4" />
        </button>
        <SidebarBody
          variant="drawer"
          collapsed={false}
          onNewApp={onNewApp}
          onNavigate={onClose}
        />
      </div>
    </div>
  );
}

function TopBar({
  collapsed,
  onExpand,
  onOpenDrawer,
}: {
  collapsed: boolean;
  onExpand: () => void;
  onOpenDrawer: () => void;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur-sm sm:px-5">
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label="Open navigation"
        className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground outline-none transition hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 md:hidden"
      >
        <Menu className="size-4.5" />
      </button>
      {collapsed ? <CollapsedExpandButton onClick={onExpand} /> : null}
      <Breadcrumbs />
      <div className="ml-auto flex items-center gap-1">
        <CreditPill />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}

function Breadcrumbs() {
  const pathname = usePathname();
  const { projects } = useSession();

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [{ label: "Apps", href: "/dashboard" }];
  if (segments.length > 1) {
    const second = segments[1];
    const staticLabel = STATIC_CRUMBS[second];
    if (staticLabel) {
      crumbs.push({ label: staticLabel });
    } else {
      const project = projects.find((item) => item.id === second);
      crumbs.push({ label: project?.name ?? "App" });
    }
  }

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {index > 0 ? (
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              ) : null}
              {crumb.href && !last ? (
                <Link
                  href={crumb.href}
                  className="hidden rounded text-muted-foreground outline-none transition hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:inline"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className="truncate font-medium text-foreground"
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function CreditPill() {
  const { user, loading } = useSession();
  if (loading) return <Skeleton className="mr-1 hidden h-6 w-20 rounded-full sm:block" />;
  if (!user) return null;
  return (
    <Link
      href="/dashboard/usage"
      className="mr-1 hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground outline-none transition hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:inline-flex"
    >
      <Zap className="size-3.5" aria-hidden="true" />
      {user.credits.toLocaleString("en-US")}
      <span className="sr-only">credits remaining</span>
    </Link>
  );
}

function UserMenu() {
  const { user, loading, signOut } = useSession();
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (loading) return <Skeleton className="size-8 rounded-full" />;
  if (!user) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground outline-none transition hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {initials(user.name)}
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="animate-fade-up absolute top-full right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg"
        >
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-border" />
          <Link
            href="/dashboard/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none transition hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <SettingsIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            Settings
          </Link>
          <Link
            href="/dashboard/usage"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none transition hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <Zap className="size-4 text-muted-foreground" aria-hidden="true" />
            Usage &amp; credits
          </Link>
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm outline-none transition hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <LogOut className="size-4 text-muted-foreground" aria-hidden="true" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
