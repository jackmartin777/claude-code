"use client";

import * as React from "react";
import { Check, Plug, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/app/primitives";
import { INTEGRATIONS } from "@/components/app/catalog";
import { cn, initials } from "@/lib/utils";

export function IntegrationsView() {
  const [query, setQuery] = React.useState("");
  const [connected, setConnected] = React.useState<string[]>(() =>
    INTEGRATIONS.filter((item) => item.connected).map((item) => item.name),
  );

  const visible = INTEGRATIONS.filter((item) =>
    query.trim()
      ? `${item.name} ${item.category} ${item.description}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      : true,
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect a service once and every app in this workspace can use it.
          </p>
        </div>
        <div className="relative w-full max-w-64">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search integrations"
            aria-label="Search integrations"
            className="pl-8"
          />
        </div>
      </header>

      {visible.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<Plug className="size-5" />}
          title="Nothing matches that search"
          description="Hercules also reaches 6,000 more apps through Zapier."
        />
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => {
            const isConnected = connected.includes(item.name);
            return (
              <div
                key={item.name}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
              >
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold"
                >
                  {initials(item.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {item.name}
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">
                      {item.category}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  <Button
                    size="sm"
                    variant={isConnected ? "outline" : "secondary"}
                    className={cn("mt-2.5", isConnected && "text-success")}
                    onClick={() =>
                      setConnected((current) =>
                        current.includes(item.name)
                          ? current.filter((name) => name !== item.name)
                          : [...current, item.name],
                      )
                    }
                  >
                    {isConnected ? (
                      <>
                        <Check className="size-3.5" aria-hidden="true" />
                        Connected
                      </>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
