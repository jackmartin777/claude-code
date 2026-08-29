"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Blocks,
  LayoutGrid,
  LayoutTemplate,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings as SettingsIcon,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { Meter, Skeleton } from "@/components/app/primitives";
import { PLAN_META, STATUS_META } from "@/components/app/catalog";
import { useSession } from "@/components/app/session";
import { cn, initials } from "@/lib/utils";

const NAV = [
  { label: "Apps", href: "/dashboard", icon: LayoutGrid, exact: true },
  { label: "Templates", href: "/dashboard/templates", icon: LayoutTemplate },
  { label: "Integrations", href: "/dashboard/integrations", icon: Blocks },
  { label: "Usage", href: "/dashboard/usage", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
];

export type SidebarVariant = "desktop" | "drawer";

/**
 * One sidebar body, rendered twice: as the fixed rail (which shrinks to icons
 * at md and can be pinned closed at lg) and inside the mobile drawer.
 */
export function SidebarBody({
  variant,
  collapsed,
  onNewApp,
  onNavigate,
  onToggleCollapse,
}: {
  variant: SidebarVariant;
  collapsed: boolean;
  onNewApp: () => void;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const { projects, projectsLoading, user, loading } = useSession();

  const drawer = variant === "drawer";
  // `hidden lg:block` is the "auto" state: icons at md, labels from lg.
  const label = drawer ? "" : collapsed ? "sr-only" : "sr-only lg:not-sr-only";
  const details = drawer ? "" : collapsed ? "hidden" : "hidden lg:block";
  const expandedOnly = drawer ? "" : collapsed ? "hidden" : "hidden lg:flex";
  const rowAlign = drawer
    ? "justify-start"
    : collapsed
      ? "justify-center"
      : "justify-center lg:justify-start";

  const recents = React.useMemo(
    () =>
      projects
        .slice()
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
        .slice(0, 5),
    [projects],
  );

  const planMeta = user ? PLAN_META[user.plan] : null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-1 px-3 py-4">
      <div className={cn("mb-1 flex items-center gap-2 px-1", rowAlign)}>
        <Link
          href="/dashboard"
          onClick={onNavigate}
          aria-label="Hercules — go to your apps"
          className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <LogoMark className="size-6 shrink-0" />
          <span className={cn("text-[15px] font-semibold tracking-tight", label)}>Hercules</span>
        </Link>
        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "ml-auto hidden size-7 items-center justify-center rounded-md text-muted-foreground outline-none transition hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 lg:flex",
              collapsed && "lg:hidden",
            )}
          >
            <PanelLeftClose className="size-4" />
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onNewApp}
        className={cn(
          "mt-2 flex h-9.5 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm outline-none transition hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-ring/50",
          rowAlign,
        )}
        title="New app"
      >
        <Plus className="size-4 shrink-0" aria-hidden="true" />
        <span className={label}>New app</span>
      </button>

      <nav aria-label="Workspace" className="mt-4 flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              title={item.label}
              className={cn(
                "flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50",
                rowAlign,
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className={label}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={cn("mt-6 min-h-0 flex-1 flex-col overflow-hidden", expandedOnly)}>
        <p className="px-2.5 pb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Recent apps
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {projectsLoading ? (
            <div className="space-y-1.5 px-2.5 py-1">
              {[0, 1, 2].map((row) => (
                <Skeleton key={row} className="h-4 w-full" />
              ))}
            </div>
          ) : recents.length === 0 ? (
            <p className="px-2.5 text-xs leading-relaxed text-muted-foreground">
              Nothing yet. Your apps show up here as you build them.
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {recents.map((project) => {
                const active = pathname === `/dashboard/${project.id}`;
                return (
                  <li key={project.id}>
                    <Link
                      href={`/dashboard/${project.id}`}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-8 items-center gap-2 rounded-lg px-2.5 text-[13px] outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        active
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                      )}
                    >
                      <span
                        className={cn("size-1.5 shrink-0 rounded-full", STATUS_META[project.status].dot)}
                        aria-hidden="true"
                      />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-auto pt-3">
        <Link
          href="/dashboard/settings"
          onClick={onNavigate}
          aria-label="Account, plan and settings"
          className={cn(
            "flex items-center gap-2.5 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-2.5 outline-none transition hover:bg-sidebar-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
            drawer ? "" : collapsed ? "justify-center" : "justify-center lg:justify-start",
          )}
        >
          {loading ? (
            <Skeleton className="size-8 shrink-0 rounded-full" />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
            >
              {user ? initials(user.name) : "—"}
            </span>
          )}
          <span className={cn("min-w-0 flex-1", details)}>
            {loading || !user || !planMeta ? (
              <>
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="mt-1.5 h-2.5 w-16" />
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-[13px] font-medium">{user.name}</span>
                  <span className="shrink-0 rounded-full bg-ring/15 px-1.5 py-px text-[10px] font-medium tracking-wide uppercase">
                    {planMeta.label}
                  </span>
                </span>
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  {user.credits.toLocaleString("en-US")} credits left
                </span>
                <Meter
                  value={user.credits}
                  max={planMeta.credits}
                  className="mt-1.5 h-1"
                  tone={user.credits / planMeta.credits < 0.15 ? "destructive" : "primary"}
                />
              </>
            )}
          </span>
        </Link>
      </div>
    </div>
  );
}

export function CollapsedExpandButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Expand sidebar"
      className="hidden size-8 items-center justify-center rounded-lg text-muted-foreground outline-none transition hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 lg:inline-flex"
    >
      <PanelLeftOpen className="size-4" />
    </button>
  );
}
