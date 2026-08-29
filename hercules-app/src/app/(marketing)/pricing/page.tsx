import type { Metadata } from "next";
import Link from "next/link";
import { Check, Coins, Minus } from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { Section, SectionHeading } from "@/components/content/section";
import { FaqAccordion } from "@/components/content/faq-accordion";
import { PricingTiers } from "@/components/content/pricing-tiers";
import { CtaCard } from "@/components/content/cta-card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import {
  comparison,
  credits,
  pricingFaqs,
  tiers,
  tierOrder,
  type ComparisonValue,
} from "@/data/pricing";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Hercules pricing: start free with 30 monthly credits, then upgrade to Pro, Business or Enterprise as your apps grow. Hosting, database, auth and AI are included on every plan.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing | Hercules",
    description:
      "Start for free and upgrade as you grow. Compare the Free, Pro, Business and Enterprise plans.",
    url: "/pricing",
  },
};

function ComparisonCell({ value }: { value: ComparisonValue }) {
  if (value === true) {
    return (
      <>
        <Check aria-hidden="true" className="mx-auto size-4 text-success" />
        <span className="sr-only">Included</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <Minus aria-hidden="true" className="mx-auto size-4 text-border" />
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return <span className="text-sm text-foreground tabular-nums">{value}</span>;
}

export default function PricingPage() {
  return (
    <>
      <PageHeader
        title="Pricing"
        description="Start for free and upgrade as you grow."
      />

      <Section>
        <PricingTiers />
        <p className="mt-8 text-center text-[13px] text-muted-foreground">
          All prices in USD. Hosting, database, auth, storage and email are included on every
          plan, including the free tier.
        </p>
      </Section>

      <Section className="border-t border-border bg-muted/30" id="compare">
        <SectionHeading
          title="Compare plans"
          description="Everything Hercules builds into your apps, and where each capability becomes available."
        />

        <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <caption className="sr-only">
              Feature comparison across the Free, Pro, Business and Enterprise plans
            </caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="w-[34%] px-5 py-4 text-sm font-semibold text-foreground">
                  Features
                </th>
                {tiers.map((tier) => (
                  <th
                    key={tier.id}
                    scope="col"
                    className={cn(
                      "px-4 py-4 text-center text-sm font-semibold text-foreground",
                      tier.highlight && "bg-ring/8",
                    )}
                  >
                    <span className="block">{tier.name}</span>
                    <span className="mt-0.5 block text-[12px] font-normal text-muted-foreground">
                      {typeof tier.monthly === "number"
                        ? `$${tier.monthly}/mo`
                        : tier.customLabel}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            {comparison.map((group) => (
              <tbody key={group.heading}>
                <tr className="border-b border-border bg-muted/60">
                  <th
                    scope="colgroup"
                    colSpan={tiers.length + 1}
                    className="px-5 py-2.5 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase"
                  >
                    {group.heading}
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-b-0">
                    <th scope="row" className="px-5 py-3.5 align-top font-normal">
                      <span className="block text-sm text-foreground">{row.label}</span>
                      {row.hint ? (
                        <span className="mt-0.5 block text-[12px] text-muted-foreground">
                          {row.hint}
                        </span>
                      ) : null}
                    </th>
                    {tierOrder.map((id) => (
                      <td
                        key={id}
                        className={cn(
                          "px-4 py-3.5 text-center align-middle",
                          id === "business" && "bg-ring/8",
                        )}
                      >
                        <ComparisonCell value={row.values[id]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
        <p className="mt-3 text-[13px] text-muted-foreground md:hidden">
          Scroll the table sideways to see every plan.
        </p>
      </Section>

      <Section className="border-t border-border">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-9">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-muted">
              <Coins aria-hidden="true" className="size-4.5 text-foreground" />
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {credits.title}
            </h2>
            <Badge tone="accent">Included on every plan</Badge>
          </div>

          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-pretty text-muted-foreground">
            {credits.summary}
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {credits.spends.map((spend) => (
              <div key={spend.label} className="rounded-xl border border-border bg-muted/40 p-5">
                <h3 className="text-sm font-semibold text-foreground">{spend.label}</h3>
                <p className="mt-2 text-sm leading-6 text-pretty text-muted-foreground">
                  {spend.detail}
                </p>
              </div>
            ))}
          </div>

          <ul className="mt-8 grid gap-2.5 sm:grid-cols-2">
            {credits.notes.map((note) => (
              <li key={note} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
                <span className="text-pretty">{note}</span>
              </li>
            ))}
          </ul>

          <Link href={credits.docHref} className={cn(buttonClasses("outline", "md"), "mt-8")}>
            Read the Cloud Credits docs
          </Link>
        </div>
      </Section>

      <Section className="border-t border-border bg-muted/30">
        <SectionHeading title="Frequently asked questions" />
        <FaqAccordion items={pricingFaqs} className="mt-8 bg-card" />
      </Section>

      <Section className="border-t border-border">
        <CtaCard
          title="Start building on the free plan"
          description="Thirty credits a month, a live app on a hercules.app subdomain, and every part of the platform switched on. Upgrade whenever you outgrow it."
          secondary={{ label: "Contact sales", href: "/support" }}
        />
      </Section>
    </>
  );
}
