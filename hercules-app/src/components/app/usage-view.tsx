"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, BarChart3 } from "lucide-react";
import { EmptyState, Meter, Skeleton } from "@/components/app/primitives";
import { StatusPill } from "@/components/app/status-pill";
import { PLAN_META } from "@/components/app/catalog";
import { useSession } from "@/components/app/session";
import type { Project } from "@/lib/types";
import { cn, formatCompact } from "@/lib/utils";

function hashString(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

const DAYS = 30;

/** Spread the month's credit spend across days deterministically. */
function dailySeries(seed: string, total: number): { day: number; value: number }[] {
  const weights = Array.from({ length: DAYS }, (_, index) => {
    const weekday = (index + 3) % 7;
    const weekend = weekday === 0 || weekday === 6 ? 0.35 : 1;
    return ((hashString(`${seed}:${index}`) % 70) + 18) * weekend;
  });
  const sum = weights.reduce((accumulator, value) => accumulator + value, 0) || 1;
  return weights.map((weight, index) => ({
    day: index + 1,
    value: Math.round((weight / sum) * total),
  }));
}

export function UsageView() {
  const { user, projects, loading, projectsLoading } = useSession();

  if (loading || !user) return <UsageSkeleton />;

  const plan = PLAN_META[user.plan];
  const used = Math.max(0, plan.credits - user.credits);
  const series = dailySeries(user.id, used);
  const peak = series.reduce((best, point) => (point.value > best.value ? point : best), series[0]);

  const totalRequests = projects.reduce((sum, project) => sum + project.metrics.requests30d, 0) || 1;
  const perApp = projects
    .map((project) => ({
      project,
      credits: Math.round((project.metrics.requests30d / totalRequests) * used),
    }))
    .sort((a, b) => b.credits - a.credits);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Usage</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Credits are spent when Hercules builds or changes an app. Serving your live apps is free.
        </p>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section
          aria-labelledby="credits-chart-heading"
          className="rounded-xl border border-border bg-card p-5 lg:col-span-2"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 id="credits-chart-heading" className="text-sm font-medium">
                Credits used — last 30 days
              </h2>
              <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                {used.toLocaleString("en-US")}
                <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                  of {plan.credits.toLocaleString("en-US")}
                </span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Resets on the 1st · {user.credits.toLocaleString("en-US")} left
            </p>
          </div>

          {used === 0 ? (
            <EmptyState
              className="mt-4"
              icon={<BarChart3 className="size-5" />}
              title="No credits used yet this month"
              description="Build or change an app and the daily spend shows up here."
            />
          ) : (
            <CreditBars series={series} peakDay={peak.day} />
          )}
        </section>

        <section aria-labelledby="plan-heading" className="rounded-xl border border-border bg-card p-5">
          <h2 id="plan-heading" className="text-sm font-medium">
            Your plan
          </h2>
          <p className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold tracking-tight">{plan.label}</span>
            <span className="text-sm text-muted-foreground">
              {plan.price}
              {plan.price.startsWith("$") ? "/mo" : ""}
            </span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{plan.blurb}</p>
          <div className="mt-4">
            <div className="flex items-baseline justify-between text-xs text-muted-foreground">
              <span>{used.toLocaleString("en-US")} used</span>
              <span>{plan.credits.toLocaleString("en-US")} included</span>
            </div>
            <Meter
              value={used}
              max={plan.credits}
              className="mt-1.5"
              tone={used / plan.credits > 0.85 ? "destructive" : "primary"}
            />
          </div>
          <Link
            href="/pricing"
            className="mt-4 inline-flex h-9.5 w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground outline-none transition hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            Compare plans
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </div>

      <section aria-labelledby="per-app-heading" className="mt-6">
        <h2 id="per-app-heading" className="text-base font-semibold tracking-tight">
          Usage by app
        </h2>
        {projectsLoading ? (
          <div className="mt-3 space-y-2">
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : perApp.length === 0 ? (
          <EmptyState
            className="mt-3"
            icon={<BarChart3 className="size-5" />}
            title="No apps yet"
            description="Once you build an app its usage is broken out here."
          />
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                    App
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                    Credits
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                    Requests 30d
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                    Active users
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                    Storage
                  </th>
                </tr>
              </thead>
              <tbody>
                {perApp.map(({ project, credits }) => (
                  <UsageRow key={project.id} project={project} credits={credits} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function UsageRow({ project, credits }: { project: Project; credits: number }) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-accent/40">
      <td className="px-4 py-2.5">
        <Link
          href={`/dashboard/${project.id}`}
          className="rounded font-medium outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {project.name}
        </Link>
      </td>
      <td className="px-4 py-2.5">
        <StatusPill status={project.status} size="sm" />
      </td>
      <td className="px-4 py-2.5 text-right tabular-nums">{credits.toLocaleString("en-US")}</td>
      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
        {formatCompact(project.metrics.requests30d)}
      </td>
      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
        {formatCompact(project.metrics.activeUsers)}
      </td>
      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
        {project.metrics.storageMb.toLocaleString("en-US")} MB
      </td>
    </tr>
  );
}

/** Single-series magnitude over time: one hue, 2px gaps, rounded data-ends. */
function CreditBars({
  series,
  peakDay,
}: {
  series: { day: number; value: number }[];
  peakDay: number;
}) {
  const width = 720;
  const height = 200;
  const padTop = 24;
  const padBottom = 22;
  const max = Math.max(...series.map((point) => point.value), 1);
  const slot = width / series.length;
  const barWidth = Math.max(4, slot - 4);
  const radius = Math.min(3, barWidth / 2);
  const plot = height - padTop - padBottom;

  return (
    <figure className="mt-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Credits used each day for the last ${series.length} days. Peak on day ${peakDay}.`}
      >
        {[0, 0.5, 1].map((fraction) => (
          <line
            key={fraction}
            x1={0}
            x2={width}
            y1={padTop + plot * fraction}
            y2={padTop + plot * fraction}
            className="stroke-border"
            strokeWidth={1}
          />
        ))}
        {series.map((point) => {
          const barHeight = Math.max(2, (point.value / max) * plot);
          const x = point.day * slot - slot + (slot - barWidth) / 2;
          const y = padTop + plot - barHeight;
          const r = Math.min(radius, barHeight);
          const path = `M${x},${y + barHeight} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + barWidth - r},${y} Q${x + barWidth},${y} ${x + barWidth},${y + r} L${x + barWidth},${y + barHeight} Z`;
          return (
            <path
              key={point.day}
              d={path}
              className={cn(
                "transition-[fill]",
                point.day === peakDay ? "fill-chart-1" : "fill-chart-1/70 hover:fill-chart-1",
              )}
            >
              <title>{`Day ${point.day}: ${point.value.toLocaleString("en-US")} credits`}</title>
            </path>
          );
        })}
        {series.map((point) =>
          point.day === peakDay ? (
            <text
              key={`label-${point.day}`}
              x={point.day * slot - slot / 2}
              y={padTop + plot - (point.value / max) * plot - 8}
              textAnchor="middle"
              style={{ fontSize: 12 }}
              className="fill-foreground font-medium"
            >
              {point.value.toLocaleString("en-US")}
            </text>
          ) : null,
        )}
        {series.map((point) =>
          point.day % 5 === 0 || point.day === 1 ? (
            <text
              key={`tick-${point.day}`}
              x={point.day * slot - slot / 2}
              y={height - 6}
              textAnchor="middle"
              style={{ fontSize: 11 }}
              className="fill-muted-foreground"
            >
              {point.day}
            </text>
          ) : null,
        )}
      </svg>
      <figcaption className="mt-1 text-xs text-muted-foreground">
        Day of the current billing month. Hover a bar for the exact spend.
      </figcaption>
    </figure>
  );
}

function UsageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <Skeleton className="mt-6 h-40 rounded-xl" />
    </div>
  );
}
