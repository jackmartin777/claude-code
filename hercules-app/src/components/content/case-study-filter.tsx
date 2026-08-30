"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CaseStudy } from "@/data/site";

const ALL = "All industries";

export function CaseStudyFilter({ studies }: { studies: CaseStudy[] }) {
  const industries = React.useMemo(() => {
    const seen = new Set<string>();
    for (const study of studies) seen.add(study.industry);
    return [ALL, ...Array.from(seen).sort((a, b) => a.localeCompare(b))];
  }, [studies]);

  const [active, setActive] = React.useState(ALL);

  const visible = React.useMemo(
    () => (active === ALL ? studies : studies.filter((s) => s.industry === active)),
    [active, studies],
  );

  return (
    <div>
      <div
        role="group"
        aria-label="Filter case studies by industry"
        className="flex flex-wrap gap-2"
      >
        {industries.map((industry) => {
          const selected = industry === active;
          return (
            <button
              key={industry}
              type="button"
              onClick={() => setActive(industry)}
              aria-pressed={selected}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors outline-none",
                "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                selected
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {industry}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="mt-5 text-[13px] text-muted-foreground">
        Showing {visible.length} {visible.length === 1 ? "story" : "stories"}
        {active === ALL ? "" : ` in ${active}`}.
      </p>

      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((study) => (
          <li key={study.slug} className="h-full">
            <Link
              href={`/case-studies/${study.slug}`}
              className={cn(
                "group flex h-full flex-col rounded-2xl border border-border bg-card p-6 outline-none",
                "shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-ring/60",
                "focus-visible:ring-[3px] focus-visible:ring-ring/50",
              )}
            >
              <p className="text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
                {study.industry}
              </p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                {study.company}
              </h3>

              <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
                {study.stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                      {stat.value}
                    </dd>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </dl>

              <p className="mt-5 flex-1 text-sm leading-6 text-pretty text-muted-foreground">
                {study.summary}
              </p>

              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                Read story
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
