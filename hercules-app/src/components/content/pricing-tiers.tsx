"use client";

import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ANNUAL_DISCOUNT,
  priceFor,
  tiers,
  type BillingPeriod,
} from "@/data/pricing";

const periods: { id: BillingPeriod; label: string }[] = [
  { id: "monthly", label: "Monthly" },
  { id: "annual", label: "Annual" },
];

export function PricingTiers() {
  const [period, setPeriod] = React.useState<BillingPeriod>("monthly");

  return (
    <div>
      <div className="flex flex-col items-center gap-3">
        <div
          role="group"
          aria-label="Billing period"
          className="inline-flex items-center rounded-full border border-border bg-muted p-1"
        >
          {periods.map((option) => {
            const active = period === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setPeriod(option.id)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors outline-none",
                  "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  active
                    ? "bg-card text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
                {option.id === "annual" ? (
                  <Badge tone="success" className="px-1.5 py-0 text-[11px]">
                    Save {Math.round(ANNUAL_DISCOUNT * 100)}%
                  </Badge>
                ) : null}
              </button>
            );
          })}
        </div>
        <p aria-live="polite" className="text-[13px] text-muted-foreground">
          {period === "annual"
            ? "Annual plans are billed once a year and save you two months."
            : "Monthly plans. Cancel or change your plan at any time."}
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {tiers.map((tier) => {
          const price = priceFor(tier, period);
          const billedAnnually =
            period === "annual" && typeof price === "number" && price > 0
              ? price * 12
              : null;

          return (
            <div
              key={tier.id}
              className={cn(
                "relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
                tier.highlight && "ring-2 ring-ring md:shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  {tier.name}
                </h3>
                {tier.badge ? (
                  <Badge tone={tier.highlight ? "accent" : "outline"}>{tier.badge}</Badge>
                ) : null}
              </div>

              <p className="mt-2 min-h-10 text-sm leading-5 text-pretty text-muted-foreground">
                {tier.positioning}
              </p>

              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold tracking-tight text-foreground tabular-nums">
                  {typeof price === "number" ? `$${price}` : tier.customLabel}
                </span>
                {typeof price === "number" ? (
                  <span className="text-sm text-muted-foreground">/month</span>
                ) : null}
              </div>
              <p className="mt-1.5 text-[13px] text-muted-foreground">
                {billedAnnually
                  ? `Billed $${billedAnnually.toLocaleString("en-US")} once a year`
                  : typeof price === "number" && price === 0
                    ? (tier.footnote ?? "Free forever")
                    : typeof price === "number"
                      ? "Billed monthly"
                      : "Annual contract, invoiced"}
              </p>

              <Link
                href={tier.cta.href}
                className={cn(
                  buttonClasses(tier.highlight ? "primary" : "outline", "md"),
                  "mt-6 w-full",
                )}
              >
                {tier.cta.label}
              </Link>

              <ul className="mt-6 space-y-2.5 border-t border-border pt-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-success"
                    />
                    <span className="text-pretty">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
