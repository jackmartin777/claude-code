import type { Plan } from "@/lib/types";

/**
 * The single source of truth for what each plan costs and includes.
 *
 * These numbers are shown on the public pricing page, enforced at signup and
 * rendered by the sidebar credit meter and usage page. They previously lived
 * in three places that disagreed — signup granted 25 credits, pricing promised
 * 30 and the in-app plan metadata assumed 100 — which made a brand new account
 * look like it had already spent three quarters of its allowance.
 */
export interface PlanDefinition {
  id: Plan;
  label: string;
  /** Monthly credit allowance. Enterprise is negotiated, so it is unmetered. */
  credits: number;
  /** Price in whole dollars per month, billed monthly. */
  monthly: number | null;
  /** Price per month when billed annually. */
  annual: number | null;
  priceLabel: string;
  blurb: string;
}

export const PLANS: Record<Plan, PlanDefinition> = {
  free: {
    id: "free",
    label: "Free",
    credits: 30,
    monthly: 0,
    annual: 0,
    priceLabel: "$0",
    blurb: "Kick the tyres. One live app, Hercules subdomain.",
  },
  pro: {
    id: "pro",
    label: "Pro",
    credits: 300,
    monthly: 30,
    annual: 24,
    priceLabel: "$30",
    blurb: "For builders shipping real internal tools.",
  },
  business: {
    id: "business",
    label: "Business",
    credits: 1_200,
    monthly: 100,
    annual: 80,
    priceLabel: "$100",
    blurb: "Custom domains, roles and permissions, audit log.",
  },
  enterprise: {
    id: "enterprise",
    label: "Enterprise",
    credits: Number.POSITIVE_INFINITY,
    monthly: null,
    annual: null,
    priceLabel: "Custom",
    blurb: "SSO, private hosting, dedicated support engineer.",
  },
};

/** Credits granted to a newly created account on the given plan. */
export function startingCredits(plan: Plan = "free"): number {
  const { credits } = PLANS[plan];
  return Number.isFinite(credits) ? credits : 25_000;
}
