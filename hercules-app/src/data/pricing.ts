/**
 * Pricing presentation for the marketing site. Hercules does not publish its
 * real numbers, so these tiers describe a credible model.
 *
 * Prices and credit allowances are not defined here — they come from
 * `@/data/plans`, the single source shared with signup and the in-app credit
 * meter. This file owns only how they are presented.
 */

import { PLANS } from "@/data/plans";

export type BillingPeriod = "monthly" | "annual";

export type TierId = "free" | "pro" | "business" | "enterprise";

export type PricingTier = {
  id: TierId;
  name: string;
  positioning: string;
  /** Dollars per month when billed monthly. `null` means "talk to us". */
  monthly: number | null;
  /** Dollars per month when billed annually (~20% off). */
  annual: number | null;
  /** Shown instead of a number when there is no list price. */
  customLabel?: string;
  credits: string;
  features: string[];
  cta: { label: string; href: string };
  highlight?: boolean;
  badge?: string;
  footnote?: string;
};

export const ANNUAL_DISCOUNT = 0.2;

/*
 * Prices and credit allowances come from `@/data/plans`, which is also what
 * signup grants and what the in-app credit meter measures against. Restating
 * them here let the page advertise 30 credits while signup handed out 25.
 */
const price = (id: TierId) => ({
  monthly: PLANS[id].monthly,
  annual: PLANS[id].annual,
});

const allowance = (id: TierId) =>
  Number.isFinite(PLANS[id].credits)
    ? `${PLANS[id].credits.toLocaleString("en-US")} monthly credits`
    : "Unlimited credits";

export const tiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    positioning: "Try Hercules and ship your first app.",
    ...price("free"),
    credits: allowance("free"),
    features: [
      allowance("free"),
      "1 published app",
      "hercules.app subdomain",
      "Database, auth and hosting included",
      "Community support",
    ],
    cta: { label: "Start building free", href: "/signup" },
    footnote: "No credit card required.",
  },
  {
    id: "pro",
    name: "Pro",
    positioning: "For founders and small teams running on their own software.",
    ...price("pro"),
    credits: allowance("pro"),
    features: [
      allowance("pro"),
      "Unlimited published apps",
      "Custom domains with free SSL",
      "Remove the Hercules badge",
      "Mobile publishing to iOS and Android",
      "Email support",
    ],
    cta: { label: "Start free trial", href: "/signup" },
    badge: "14-day trial",
  },
  {
    id: "business",
    name: "Business",
    positioning: "For teams that need control over who can do what.",
    ...price("business"),
    credits: allowance("business"),
    features: [
      allowance("business"),
      "Everything in Pro",
      "Roles and permissions",
      "SSO for your whole workspace",
      "Audit logs and version history",
      "Priority support",
    ],
    cta: { label: "Start free trial", href: "/signup" },
    highlight: true,
    badge: "Most popular",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    positioning: "For organisations with procurement, security and scale requirements.",
    monthly: null,
    annual: null,
    customLabel: "Custom",
    credits: "Custom credit allocation",
    features: [
      "Custom credit allocation",
      "SSO and SAML with SCIM provisioning",
      "Dedicated infrastructure and region choice",
      "Invoicing and annual purchase orders",
      "Uptime SLA and security review",
      "Dedicated success manager",
    ],
    cta: { label: "Contact sales", href: "/support" },
  },
];

export const tierOrder: TierId[] = ["free", "pro", "business", "enterprise"];

export function priceFor(tier: PricingTier, period: BillingPeriod) {
  return period === "annual" ? tier.annual : tier.monthly;
}

/* ------------------------------------------------------------------ */
/* Plan comparison                                                     */
/* ------------------------------------------------------------------ */

/** `true` = included, `false` = not included, string = a specific limit. */
export type ComparisonValue = boolean | string;

export type ComparisonRow = {
  label: string;
  hint?: string;
  values: Record<TierId, ComparisonValue>;
};

export type ComparisonGroup = {
  /** Matches a heading in `featureGroups` from data/site. */
  heading: string;
  rows: ComparisonRow[];
};

export const comparison: ComparisonGroup[] = [
  {
    heading: "Platform",
    rows: [
      {
        label: "Monthly credits",
        hint: "Spent when Hercules builds or changes an app.",
        values: {
        free: PLANS.free.credits.toLocaleString("en-US"),
        pro: PLANS.pro.credits.toLocaleString("en-US"),
        business: PLANS.business.credits.toLocaleString("en-US"),
        enterprise: "Custom",
      },
      },
      {
        label: "Published apps",
        values: { free: "1", pro: "Unlimited", business: "Unlimited", enterprise: "Unlimited" },
      },
      {
        label: "Database and backend",
        values: { free: true, pro: true, business: true, enterprise: true },
      },
      {
        label: "Auth and users",
        values: { free: true, pro: true, business: true, enterprise: true },
      },
      {
        label: "Payments",
        values: { free: true, pro: true, business: true, enterprise: true },
      },
      {
        label: "Transactional email",
        values: { free: "100 / mo", pro: "10,000 / mo", business: "100,000 / mo", enterprise: "Custom" },
      },
      {
        label: "File storage",
        values: { free: "500 MB", pro: "25 GB", business: "250 GB", enterprise: "Custom" },
      },
      {
        label: "Hosting and CDN",
        values: { free: true, pro: true, business: true, enterprise: true },
      },
      {
        label: "Custom domains",
        values: { free: false, pro: true, business: true, enterprise: true },
      },
      {
        label: "Remove Hercules badge",
        values: { free: false, pro: true, business: true, enterprise: true },
      },
      {
        label: "Mobile publishing",
        hint: "App Store and Google Play builds from the same project.",
        values: { free: false, pro: true, business: true, enterprise: true },
      },
    ],
  },
  {
    heading: "AI",
    rows: [
      {
        label: "AI text generation",
        values: { free: true, pro: true, business: true, enterprise: true },
      },
      {
        label: "AI image generation",
        values: { free: false, pro: true, business: true, enterprise: true },
      },
      {
        label: "AI speech and transcription",
        values: { free: false, pro: true, business: true, enterprise: true },
      },
      {
        label: "Chatbots and realtime",
        values: { free: false, pro: true, business: true, enterprise: true },
      },
      {
        label: "Skills and MCP connections",
        values: { free: "3", pro: "Unlimited", business: "Unlimited", enterprise: "Unlimited" },
      },
      {
        label: "AI Gateway with your own keys",
        values: { free: false, pro: false, business: true, enterprise: true },
      },
    ],
  },
  {
    heading: "Administration",
    rows: [
      {
        label: "Version history and rollback",
        values: { free: "7 days", pro: "90 days", business: "Unlimited", enterprise: "Unlimited" },
      },
      {
        label: "Workspace members",
        values: { free: "1", pro: "5", business: "25", enterprise: "Unlimited" },
      },
      {
        label: "Roles and permissions",
        values: { free: false, pro: false, business: true, enterprise: true },
      },
      {
        label: "SSO",
        values: { free: false, pro: false, business: true, enterprise: true },
      },
      {
        label: "SAML and SCIM provisioning",
        values: { free: false, pro: false, business: false, enterprise: true },
      },
      {
        label: "Audit logs",
        values: { free: false, pro: false, business: true, enterprise: true },
      },
      {
        label: "Secrets management",
        values: { free: false, pro: true, business: true, enterprise: true },
      },
      {
        label: "Dedicated infrastructure",
        values: { free: false, pro: false, business: false, enterprise: true },
      },
      {
        label: "Invoicing and purchase orders",
        values: { free: false, pro: false, business: false, enterprise: true },
      },
      {
        label: "Uptime SLA",
        values: { free: false, pro: false, business: false, enterprise: true },
      },
      {
        label: "Support",
        values: {
          free: "Community",
          pro: "Email",
          business: "Priority",
          enterprise: "Dedicated manager",
        },
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Cloud credits explainer                                             */
/* ------------------------------------------------------------------ */

export const credits = {
  title: "Cloud credits",
  summary:
    "A credit is what Hercules spends when it does work for you. Reading your app, planning a change, writing the code and deploying it all draw from the same monthly balance.",
  spends: [
    {
      label: "Building and editing",
      detail:
        "A small change such as renaming a field or adjusting a layout usually costs a fraction of a credit. A new screen with its own table and permissions costs a few.",
    },
    {
      label: "AI inside your app",
      detail:
        "Text, image, speech and transcription calls your app makes to the AI Gateway are metered per request against the same balance.",
    },
    {
      label: "Hosting and infrastructure",
      detail:
        "Hosting, the database, auth, storage, email and the CDN are included on every plan. Ordinary production traffic does not consume credits.",
    },
  ],
  notes: [
    "Credits refresh on the first day of your billing cycle and do not roll over.",
    "Top-up packs can be bought at any time and never expire.",
    "You can set a spend cap so an app can never exceed a budget you have not approved.",
  ],
  docHref: "/docs/cloud-credits",
} as const;

/* ------------------------------------------------------------------ */
/* Pricing FAQ — verbatim copy from the production site                */
/* ------------------------------------------------------------------ */

export const pricingFaqs = [
  {
    q: "What is Hercules?",
    a: "Hercules makes it easy to build beautiful apps, websites, and prototypes using AI.",
  },
  {
    q: "Can I change my plan anytime?",
    a: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards and offer invoicing for Enterprise customers.",
  },
  {
    q: "How much is app hosting and deployment?",
    a: "Hercules offers an incredibly generous free tier for hosting and deployment. All Hercules apps come with hosting database, backend, auth, AI, email, and more. Please see the Cloud Credits documentation for more details.",
  },
] as const;
