import type { ReactNode } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ActiveUsersCounter } from "@/components/marketing/active-users-counter";
import { cn, initials } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Panel A — Publish in a click                                        */
/* ------------------------------------------------------------------ */

const dashboardStats = [
  { label: "Active Deals", value: "128", delta: "+8%" },
  { label: "Win Rate", value: "42%", delta: "+4%" },
  { label: "Avg Deal", value: "$89k", delta: "+6%" },
  { label: "Revenue", value: "$247k", delta: "+12%" },
];

const revenueSeries = [
  { month: "Sep", value: 42 },
  { month: "Oct", value: 55 },
  { month: "Nov", value: 48 },
  { month: "Dec", value: 67 },
  { month: "Jan", value: 72 },
  { month: "Feb", value: 89 },
];

const CHART_W = 320;
const CHART_H = 92;
const BAR_W = 22;
const SCALE_MAX = 100;

/** Column with a 4px rounded cap and a square foot on the baseline. */
function columnPath(x: number, height: number) {
  const radius = Math.min(4, height);
  const top = CHART_H - height;
  return [
    `M${x} ${CHART_H}`,
    `L${x} ${top + radius}`,
    `Q${x} ${top} ${x + radius} ${top}`,
    `L${x + BAR_W - radius} ${top}`,
    `Q${x + BAR_W} ${top} ${x + BAR_W} ${top + radius}`,
    `L${x + BAR_W} ${CHART_H}`,
    "Z",
  ].join(" ");
}

function PublishMock() {
  const band = CHART_W / revenueSeries.length;

  return (
    <div
      role="img"
      aria-label="A published CRM dashboard running on a custom domain, showing deal metrics and a six-month revenue trend."
      className="overflow-hidden rounded-xl border border-border bg-background shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-muted-foreground/30" />
          <span className="size-2 rounded-full bg-muted-foreground/30" />
          <span className="size-2 rounded-full bg-muted-foreground/30" />
        </span>
        <span className="mx-auto inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
          <Lock className="size-2.5" aria-hidden="true" />
          app.yourcompany.com
        </span>
        <Badge tone="accent" className="text-[10px]">
          v1
        </Badge>
      </div>

      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {dashboardStats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-2.5">
              <p className="text-[11px] leading-none text-muted-foreground">{stat.label}</p>
              <p className="mt-2 flex items-baseline gap-1.5">
                <span className="text-lg font-semibold leading-none tracking-tight">
                  {stat.value}
                </span>
                <span className="text-[11px] font-semibold leading-none text-success">
                  {stat.delta}
                </span>
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-lg border border-border bg-card p-3">
          <p className="text-[11px] text-muted-foreground">Revenue by month</p>
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H + 1}`}
            className="mt-2 h-auto w-full"
            aria-hidden="true"
            focusable="false"
          >
            <line
              x1="0"
              y1={CHART_H + 0.5}
              x2={CHART_W}
              y2={CHART_H + 0.5}
              className="stroke-border"
              strokeWidth="1"
            />
            {revenueSeries.map((point, index) => {
              const height = (point.value / SCALE_MAX) * CHART_H;
              const x = index * band + (band - BAR_W) / 2;
              const isCurrent = index === revenueSeries.length - 1;
              return (
                <path
                  key={point.month}
                  d={columnPath(x, height)}
                  className={isCurrent ? "fill-primary" : "fill-primary/30"}
                />
              );
            })}
          </svg>
          <div className="grid grid-cols-6 text-center text-[10px] text-muted-foreground">
            {revenueSeries.map((point) => (
              <span key={point.month}>{point.month}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panel B — Scale to millions                                         */
/* ------------------------------------------------------------------ */

const SPARK_POINTS = [
  [0, 74],
  [25, 70],
  [50, 72],
  [75, 63],
  [100, 59],
  [125, 61],
  [150, 51],
  [175, 45],
  [200, 47],
  [225, 34],
  [250, 27],
  [275, 19],
  [300, 12],
] as const;

const sparkLine = SPARK_POINTS.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ");
const sparkArea = `${sparkLine} L300 88 L0 88 Z`;

function ScaleMock() {
  return (
    <div
      role="img"
      aria-label="An active-user counter reading 750,000 above a rising usage trend."
      className="rounded-xl border border-border bg-background p-4"
    >
      <p className="text-xs text-muted-foreground">Active users</p>
      <p className="mt-1 text-4xl font-semibold tracking-tight sm:text-5xl">
        <ActiveUsersCounter target={750000} />
      </p>
      <svg
        viewBox="0 0 310 92"
        className="mt-5 h-auto w-full text-primary"
        aria-hidden="true"
        focusable="false"
      >
        <path d={sparkArea} fill="currentColor" opacity="0.1" />
        <path
          d={sparkLine}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx="300"
          cy="12"
          r="4"
          fill="currentColor"
          className="stroke-background"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panel C — Govern with confidence                                    */
/* ------------------------------------------------------------------ */

const members = [
  { name: "Alex Rivera", role: "Admin" as const },
  { name: "Sam Chen", role: "Viewer" as const },
  { name: "Jordan Lee", role: "Editor" as const },
];

const roleTone = {
  Admin: "accent",
  Editor: "outline",
  Viewer: "muted",
} as const;

function GovernMock() {
  return (
    <div
      role="img"
      aria-label="A users and roles panel listing Alex Rivera as admin, Sam Chen as viewer and Jordan Lee as editor."
      className="rounded-xl border border-border bg-background"
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <ShieldCheck className="size-4 text-muted-foreground" aria-hidden="true" />
        <p className="text-[13px] font-medium">Users &amp; Roles</p>
      </div>
      <ul className="divide-y divide-border">
        {members.map((member) => (
          <li key={member.name} className="flex items-center gap-3 px-4 py-3">
            <span
              aria-hidden="true"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground"
            >
              {initials(member.name)}
            </span>
            <span className="text-[13px] font-medium">{member.name}</span>
            <Badge tone={roleTone[member.role]} className="ml-auto">
              {member.role}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

function Panel({
  id,
  title,
  body,
  children,
  className,
  stacked,
}: {
  id: string;
  title: string;
  body: string;
  children: ReactNode;
  className?: string;
  stacked?: boolean;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-8",
        className,
      )}
    >
      <div className={cn(stacked ? "flex flex-col gap-8" : "grid gap-8 lg:grid-cols-2 lg:items-center")}>
        <div className="max-w-md">
          <h2 id={id} className="text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{body}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

export function ProductPanels() {
  return (
    <div className="container-page pb-20 sm:pb-24 lg:pb-28">
      <div className="flex flex-col gap-5 sm:gap-6">
        <Panel
          id="panel-publish"
          title="Publish in a click"
          body="Deploy your app to a custom domain instantly. You can also publish to the iOS App Store or Google Play Store."
        >
          <PublishMock />
        </Panel>

        <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
          <Panel
            id="panel-scale"
            stacked
            title="Scale to millions"
            body="Hercules apps are serverless, meaning they scale up to as much traffic as you need without breaking."
          >
            <ScaleMock />
          </Panel>

          <Panel
            id="panel-govern"
            stacked
            title="Govern with confidence"
            body="Apps are secure and private, with best-in-class uptime and permission management."
          >
            <GovernMock />
          </Panel>
        </div>
      </div>
    </div>
  );
}
