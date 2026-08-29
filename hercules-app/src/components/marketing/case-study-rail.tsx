import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { caseStudies, hero, type CaseStudy } from "@/data/site";
import { cn } from "@/lib/utils";

function CaseStudyCard({ study, decorative }: { study: CaseStudy; decorative?: boolean }) {
  return (
    <li className="w-[16.5rem] shrink-0 sm:w-[19rem]">
      <Link
        href={`/case-studies/${study.slug}`}
        tabIndex={decorative ? -1 : undefined}
        className={cn(
          "flex h-full flex-col justify-between rounded-xl border border-border bg-card p-5",
          "shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow,transform] duration-200",
          "hover:-translate-y-0.5 hover:border-ring/50 hover:shadow-md",
          "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        )}
      >
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {study.industry}
          </p>
          <p className="mt-1.5 text-[15px] font-semibold tracking-tight">{study.company}</p>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4">
          {study.stats.map((stat) => (
            <div key={stat.label}>
              <dd className="text-xl font-semibold tracking-tight">{stat.value}</dd>
              <dt className="mt-0.5 text-xs leading-snug text-muted-foreground">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </Link>
    </li>
  );
}

export function CaseStudyRail() {
  return (
    <section aria-labelledby="social-proof-heading" className="py-16 sm:py-20">
      <h2
        id="social-proof-heading"
        className="text-center text-sm font-medium text-muted-foreground"
      >
        {hero.socialProof}
      </h2>

      <div
        className={cn(
          "marquee-paused relative mt-8 overflow-hidden sm:mt-10",
          "[mask-image:linear-gradient(to_right,transparent_0,black_6%,black_94%,transparent_100%)]",
          "[-webkit-mask-image:linear-gradient(to_right,transparent_0,black_6%,black_94%,transparent_100%)]",
        )}
      >
        <div
          className="flex w-max animate-marquee-x [gap:var(--marquee-gap)]"
          style={
            {
              "--marquee-duration": "56s",
              "--marquee-gap": "1rem",
            } as React.CSSProperties
          }
        >
          <ul className="flex shrink-0 items-stretch [gap:var(--marquee-gap)]">
            {caseStudies.map((study) => (
              <CaseStudyCard key={study.slug} study={study} />
            ))}
          </ul>
          <ul aria-hidden="true" className="flex shrink-0 items-stretch [gap:var(--marquee-gap)]">
            {caseStudies.map((study) => (
              <CaseStudyCard key={`${study.slug}-clone`} study={study} decorative />
            ))}
          </ul>
        </div>
      </div>

      <div className="container-page mt-10 flex justify-center">
        <Link href="/case-studies" className={cn(buttonClasses("outline", "md"), "group")}>
          View all case studies
          <ArrowRight
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
}
