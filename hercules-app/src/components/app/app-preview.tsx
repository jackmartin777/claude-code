"use client";

import * as React from "react";
import { Bell, ChevronDown, Plus, Search } from "lucide-react";
import { SCREEN_KIND_LABEL } from "@/components/app/catalog";
import type { AppSpec, FieldSpec, ScreenSpec, TableSpec } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Deterministic sample data — the same spec always renders the same
 * preview, so nothing flickers between re-renders or spec updates.
 * ------------------------------------------------------------------ */

function hashString(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function pickFrom<T>(pool: readonly T[], seed: string): T {
  return pool[hashString(seed) % pool.length];
}

const PEOPLE = [
  "Ana Duarte", "Marcus Bell", "Priya Raman", "Tom Okafor", "Lena Fischer",
  "Sofia Rossi", "Jonah Weiss", "Mei Chen", "Daniel Mbeki", "Clara Nunez",
] as const;

const COMPANIES = [
  "Northwind Foods", "Ridgeline Supply", "Cobalt Logistics", "Vero Studio",
  "Harbourpoint", "Atlas Tooling", "Belmont Health", "Kestrel Labs",
] as const;

const STATUSES = ["Open", "In progress", "Blocked", "Review", "Complete"] as const;
const CITIES = ["Cape Town", "Austin", "Rotterdam", "Manchester", "Lisbon", "Toronto"] as const;
const NOUNS = ["Onboarding pack", "Quarterly review", "Site survey", "Renewal", "Delivery run", "Trial fit-out"] as const;
const STREETS = ["Harbour Rd", "Mill Lane", "Kloof St", "Alder Way", "Bridge St", "Vine Terrace"] as const;

/*
 * A row's identity is seeded from the row, not the field, so every column in
 * the same row agrees: the name, the email and the company all describe one
 * person. Seeding per field made each cell pick independently, which rendered
 * rows like "Clara Nunez / priya@cobalt.com".
 */
function rowPerson(seedBase: string, row: number): string {
  return pickFrom(PEOPLE, `${seedBase}:person:${row}`);
}

function rowCompany(seedBase: string, row: number): string {
  return pickFrom(COMPANIES, `${seedBase}:company:${row}`);
}

function firstWord(value: string): string {
  return value.split(" ")[0].toLowerCase();
}

export function labelFor(name: string): string {
  const spaced = name.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function cellValue(field: FieldSpec, seedBase: string, row: number): string {
  const seed = `${seedBase}:${field.name}:${row}`;
  const lower = field.name.toLowerCase();
  switch (field.type) {
    case "email":
      return `${firstWord(rowPerson(seedBase, row))}@${firstWord(rowCompany(seedBase, row))}.com`;
    case "number":
      return String(4 + (hashString(seed) % 480));
    case "currency":
      return formatCurrency(120 + (hashString(seed) % 48000));
    case "date": {
      const days = hashString(seed) % 90;
      const date = new Date(Date.now() - days * 86400000);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
    }
    case "boolean":
      return hashString(seed) % 2 === 0 ? "Yes" : "No";
    case "select":
      return pickFrom(field.options && field.options.length > 0 ? field.options : STATUSES, seed);
    case "relation":
      return lower.includes("owner") || lower.includes("user") || lower.includes("contact")
        ? rowPerson(seedBase, row)
        : rowCompany(seedBase, row);
    case "url":
      return `${firstWord(rowCompany(seedBase, row))}.com`;
    default: {
      if (lower.includes("email")) return cellValue({ ...field, type: "email" }, seedBase, row);
      // Shapes that read as nonsense when filled from the generic noun pool.
      if (lower.includes("phone") || lower.includes("mobile") || lower.includes("tel")) {
        return `+1 (${200 + (hashString(seed) % 700)}) ${100 + (hashString(`${seed}:a`) % 900)}-${1000 + (hashString(`${seed}:b`) % 9000)}`;
      }
      if (lower.includes("address") || lower.includes("street")) {
        return `${1 + (hashString(seed) % 240)} ${pickFrom(STREETS, seed)}`;
      }
      if (lower.includes("city") || lower.includes("region") || lower.includes("location")) {
        return pickFrom(CITIES, seed);
      }
      if (lower.includes("status") || lower.includes("stage")) return pickFrom(STATUSES, seed);
      if (lower.includes("company") || lower.includes("account") || lower.includes("supplier")) {
        return rowCompany(seedBase, row);
      }
      if (lower.includes("name") || lower.includes("contact") || lower.includes("owner")) {
        return rowPerson(seedBase, row);
      }
      return pickFrom(NOUNS, seed);
    }
  }
}

function series(seed: string, points: number): number[] {
  return Array.from({ length: points }, (_, index) => {
    const wave = Math.sin((index / points) * Math.PI * 1.4) * 22;
    return Math.round(34 + wave + (hashString(`${seed}:${index}`) % 34));
  });
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ------------------------------------------------------------------ *
 * The mock application
 * ------------------------------------------------------------------ */

export function AppPreview({
  spec,
  screenId,
  onSelectScreen,
  compact = false,
}: {
  spec: AppSpec;
  screenId: string | null;
  onSelectScreen: (id: string) => void;
  compact?: boolean;
}) {
  const screens = spec.screens ?? [];
  const active = screens.find((screen) => screen.id === screenId) ?? screens[0];

  if (!active) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
        This app has no screens yet. Ask Hercules for one in the chat.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 bg-background text-foreground">
      {compact ? null : (
        <nav
          aria-label={`${spec.title} screens`}
          className="flex w-40 shrink-0 flex-col gap-0.5 border-r border-border bg-muted/40 p-2"
        >
          <p className="truncate px-2 py-1.5 text-[11px] font-semibold tracking-tight">
            {spec.title}
          </p>
          {screens.map((screen) => (
            <button
              key={screen.id}
              type="button"
              onClick={() => onSelectScreen(screen.id)}
              aria-current={screen.id === active.id ? "page" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[11px] outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50",
                screen.id === active.id
                  ? "bg-card font-medium text-foreground shadow-[0_0_0_1px_var(--border)]"
                  : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
              )}
            >
              <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/40" aria-hidden="true" />
              <span className="truncate">{screen.name}</span>
            </button>
          ))}
        </nav>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-3">
          <p className="truncate text-[11px] font-medium">{active.name}</p>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:flex">
              <Search className="size-2.5" aria-hidden="true" />
              Search
            </span>
            <Bell className="size-3 text-muted-foreground" aria-hidden="true" />
            <span
              className="flex size-4 items-center justify-center rounded-full bg-primary text-[8px] font-semibold text-primary-foreground"
              aria-hidden="true"
            >
              AW
            </span>
          </div>
        </div>

        {compact ? (
          <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-border px-2 py-1.5">
            {screens.map((screen) => (
              <button
                key={screen.id}
                type="button"
                onClick={() => onSelectScreen(screen.id)}
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  screen.id === active.id
                    ? "bg-secondary font-medium text-secondary-foreground"
                    : "text-muted-foreground",
                )}
              >
                {screen.name}
              </button>
            ))}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <ScreenBody spec={spec} screen={active} compact={compact} />
        </div>
      </div>
    </div>
  );
}

function tableFor(spec: AppSpec, screen: ScreenSpec): TableSpec | undefined {
  if (screen.table) {
    const match = spec.tables.find(
      (table) => table.name.toLowerCase() === screen.table?.toLowerCase(),
    );
    if (match) return match;
  }
  return spec.tables[0];
}

function ScreenBody({
  spec,
  screen,
  compact,
}: {
  spec: AppSpec;
  screen: ScreenSpec;
  compact: boolean;
}) {
  const table = tableFor(spec, screen);

  if (screen.kind === "dashboard") {
    const stats =
      screen.stats && screen.stats.length > 0
        ? screen.stats
        : spec.tables.slice(0, 3).map((item) => ({
            label: labelFor(item.name),
            value: item.rowCount.toLocaleString("en-US"),
            delta: undefined,
          }));
    return (
      <div className="space-y-3">
        <div className={cn("grid gap-2", compact ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4")}>
          {stats.slice(0, 4).map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-2.5">
              <p className="truncate text-[10px] text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-base leading-none font-semibold tracking-tight tabular-nums">
                {stat.value}
              </p>
              {stat.delta ? (
                <p className="mt-1 text-[10px] font-medium text-success">{stat.delta}</p>
              ) : null}
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] font-medium">
              {stats[0]?.label ?? "Volume"} — last 12 months
            </p>
            <p className="text-[10px] text-muted-foreground">Updated live</p>
          </div>
          <TrendChart seed={`${spec.title}:${screen.id}`} />
        </div>
        {table ? (
          <div className="rounded-lg border border-border bg-card">
            <p className="border-b border-border px-3 py-2 text-[11px] font-medium">
              Recent {labelFor(table.name).toLowerCase()}
            </p>
            <DataTable table={table} rows={4} compact={compact} dense />
          </div>
        ) : null}
      </div>
    );
  }

  if (screen.kind === "table") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 flex-1 items-center gap-1 rounded-md border border-border px-2 text-[10px] text-muted-foreground">
            <Search className="size-2.5" aria-hidden="true" />
            Search {table ? labelFor(table.name).toLowerCase() : "records"}
          </span>
          <span className="flex h-6 items-center gap-1 rounded-md border border-border px-2 text-[10px] text-muted-foreground">
            Filter
            <ChevronDown className="size-2.5" aria-hidden="true" />
          </span>
          <span className="flex h-6 items-center gap-1 rounded-md bg-primary px-2 text-[10px] font-medium text-primary-foreground">
            <Plus className="size-2.5" aria-hidden="true" />
            New
          </span>
        </div>
        {table ? (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <DataTable table={table} rows={8} compact={compact} />
          </div>
        ) : (
          <EmptyPreview label="No table is connected to this screen yet." />
        )}
      </div>
    );
  }

  if (screen.kind === "form") {
    const fields = (table?.fields ?? []).slice(0, 8);
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-border bg-card p-4">
        <p className="text-[11px] font-semibold">{screen.name}</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {table ? `Adds a record to ${labelFor(table.name)}.` : "Captures a new record."}
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {fields.length === 0 ? (
            <EmptyPreview label="No fields yet." />
          ) : (
            fields.map((field) => (
              <div
                key={field.name}
                className={cn("space-y-1", field.type === "text" ? "sm:col-span-2" : undefined)}
              >
                <p className="text-[10px] font-medium text-muted-foreground">
                  {labelFor(field.name)}
                  {field.required ? <span className="text-destructive"> *</span> : null}
                </p>
                {field.type === "boolean" ? (
                  <span className="flex h-5 w-9 items-center rounded-full bg-muted p-0.5">
                    <span className="size-4 rounded-full bg-card shadow-[0_0_0_1px_var(--border)]" />
                  </span>
                ) : field.type === "select" ? (
                  <span className="flex h-7 items-center justify-between rounded-md border border-border px-2 text-[10px] text-muted-foreground">
                    {(field.options ?? STATUSES.slice(0, 3))[0]}
                    <ChevronDown className="size-2.5" aria-hidden="true" />
                  </span>
                ) : (
                  <span className="flex h-7 items-center rounded-md border border-border px-2 text-[10px] text-muted-foreground">
                    {cellValue(field, `${screen.id}:form`, 0)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <span className="flex h-6 items-center rounded-md border border-border px-2.5 text-[10px] text-muted-foreground">
            Cancel
          </span>
          <span className="flex h-6 items-center rounded-md bg-primary px-2.5 text-[10px] font-medium text-primary-foreground">
            Save
          </span>
        </div>
      </div>
    );
  }

  if (screen.kind === "board") {
    const selectField = table?.fields.find(
      (field) => field.type === "select" && (field.options?.length ?? 0) > 1,
    );
    const columns = selectField?.options ?? ["Backlog", "In progress", "Review", "Done"];
    const titleField =
      table?.fields.find((field) => field.name.toLowerCase().includes("name")) ??
      table?.fields.find((field) => field.type === "text") ??
      table?.fields[0];
    return (
      <div className={cn("grid gap-2", compact ? "grid-cols-2" : "grid-cols-4")}>
        {columns.slice(0, compact ? 2 : 4).map((column, columnIndex) => {
          const cards = 2 + (hashString(`${screen.id}:${column}`) % 3);
          return (
            <div key={column} className="flex flex-col gap-1.5 rounded-lg bg-muted/60 p-2">
              <p className="flex items-center justify-between text-[10px] font-medium">
                <span className="truncate">{column}</span>
                <span className="text-muted-foreground">{cards}</span>
              </p>
              {Array.from({ length: cards }).map((_, cardIndex) => (
                <div
                  key={cardIndex}
                  className="rounded-md border border-border bg-card p-2 shadow-[0_1px_1px_rgba(0,0,0,0.03)]"
                >
                  <p className="truncate text-[10px] font-medium">
                    {titleField
                      ? cellValue(titleField, `${screen.id}:${columnIndex}`, cardIndex)
                      : pickFrom(NOUNS, `${screen.id}:${columnIndex}:${cardIndex}`)}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1">
                    <span className="size-3 rounded-full bg-ring/30" aria-hidden="true" />
                    <span className="text-[9px] text-muted-foreground">
                      {pickFrom(PEOPLE, `${screen.id}:${column}:${cardIndex}`).split(" ")[0]}
                    </span>
                    <span className="ml-auto rounded-full bg-muted px-1.5 py-px text-[9px] text-muted-foreground">
                      {cellValue(
                        { name: "due", type: "date" },
                        `${screen.id}:${column}`,
                        cardIndex,
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  if (screen.kind === "detail") {
    const fields = (table?.fields ?? []).slice(0, 6);
    return (
      <div className="grid gap-2 lg:grid-cols-3">
        <div className="space-y-2 rounded-lg border border-border bg-card p-3 lg:col-span-2">
          <p className="text-[11px] font-semibold">
            {table ? cellValue(table.fields[0] ?? { name: "name", type: "text" }, screen.id, 1) : screen.name}
          </p>
          <dl className="grid grid-cols-2 gap-2">
            {fields.map((field) => (
              <div key={field.name} className="rounded-md bg-muted/50 p-2">
                <dt className="text-[9px] text-muted-foreground">{labelFor(field.name)}</dt>
                <dd className="mt-0.5 truncate text-[10px] font-medium">
                  {cellValue(field, `${screen.id}:detail`, 2)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="space-y-2 rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] font-medium">Activity</p>
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex gap-1.5">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-ring/50" aria-hidden="true" />
              <p className="text-[9px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">
                  {pickFrom(PEOPLE, `${screen.id}:activity:${row}`).split(" ")[0]}
                </span>{" "}
                updated this record
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // settings
  return (
    <div className="mx-auto max-w-lg space-y-2">
      {(spec.roles.length > 0
        ? spec.roles.map((role) => ({ title: role.name, detail: role.permissions.join(", ") }))
        : [{ title: "Workspace", detail: "Name, logo and timezone" }]
      ).map((section) => (
        <div
          key={section.title}
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
        >
          <div className="min-w-0">
            <p className="text-[11px] font-medium capitalize">{section.title}</p>
            <p className="truncate text-[10px] text-muted-foreground">{section.detail}</p>
          </div>
          <span className="flex h-5 w-9 shrink-0 items-center rounded-full bg-primary p-0.5">
            <span className="ml-auto size-4 rounded-full bg-primary-foreground" />
          </span>
        </div>
      ))}
    </div>
  );
}

function DataTable({
  table,
  rows,
  compact,
  dense,
}: {
  table: TableSpec;
  rows: number;
  compact: boolean;
  dense?: boolean;
}) {
  const fields = table.fields.slice(0, compact ? 3 : dense ? 4 : 6);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            {fields.map((field) => (
              <th
                key={field.name}
                scope="col"
                className="px-2.5 py-1.5 text-[10px] font-medium whitespace-nowrap text-muted-foreground"
              >
                {labelFor(field.name)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, row) => (
            <tr key={row} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
              {fields.map((field, column) => (
                <td
                  key={field.name}
                  className={cn(
                    "px-2.5 py-1.5 text-[10px] whitespace-nowrap",
                    column === 0 ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {field.type === "select" ? (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-foreground">
                      {cellValue(field, table.name, row)}
                    </span>
                  ) : (
                    cellValue(field, table.name, row)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyPreview({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-6 text-center text-[10px] text-muted-foreground">
      {label}
    </div>
  );
}

/** Single-series trend. One hue, thin line, recessive grid, direct end label. */
export function TrendChart({ seed }: { seed: string }) {
  const values = series(seed, 12);
  const max = Math.max(...values) * 1.15;
  const width = 640;
  const height = 180;
  const padX = 8;
  const padY = 12;
  const stepX = (width - padX * 2) / (values.length - 1);
  const points = values.map((value, index) => ({
    x: padX + index * stepX,
    y: height - padY - (value / max) * (height - padY * 2),
  }));
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const area = `${line} L${points[points.length - 1].x},${height - padY} L${points[0].x},${height - padY} Z`;
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-2 h-auto w-full"
      role="img"
      aria-label={`Trend across the last ${values.length} months, ending at ${values[values.length - 1]}`}
    >
      {[0.25, 0.5, 0.75, 1].map((fraction) => (
        <line
          key={fraction}
          x1={padX}
          x2={width - padX}
          y1={padY + (height - padY * 2) * fraction}
          y2={padY + (height - padY * 2) * fraction}
          className="stroke-border"
          strokeWidth={1}
        />
      ))}
      <path d={area} className="fill-chart-1/12" />
      <path d={line} className="stroke-chart-1" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r={4.5} className="fill-chart-1" />
      <circle cx={last.x} cy={last.y} r={8} className="fill-chart-1/20" />
      {values.map((value, index) => (
        <text
          key={index}
          x={points[index].x}
          y={height - 1}
          textAnchor="middle"
          className="fill-muted-foreground text-[9px]"
          style={{ fontSize: 9 }}
        >
          {index % 2 === 0 ? MONTHS[index] : ""}
        </text>
      ))}
    </svg>
  );
}
