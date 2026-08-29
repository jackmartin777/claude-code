import type { Plan, ProjectKind, ProjectStatus, ScreenKind } from "@/lib/types";

/** Plan metadata used by the sidebar credit meter, usage page and billing tab. */
export const PLAN_META: Record<
  Plan,
  { label: string; credits: number; price: string; blurb: string }
> = {
  free: {
    label: "Free",
    credits: 100,
    price: "$0",
    blurb: "Kick the tyres. One live app, Hercules subdomain.",
  },
  pro: {
    label: "Pro",
    credits: 1_000,
    price: "$40",
    blurb: "For builders shipping real internal tools.",
  },
  business: {
    label: "Business",
    credits: 5_000,
    price: "$150",
    blurb: "Custom domains, roles and permissions, audit log.",
  },
  enterprise: {
    label: "Enterprise",
    credits: 25_000,
    price: "Custom",
    blurb: "SSO, private hosting, dedicated support engineer.",
  },
};

export const STATUS_META: Record<
  ProjectStatus,
  { label: string; chip: string; dot: string }
> = {
  draft: {
    label: "Draft",
    chip: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  building: {
    label: "Building",
    chip: "bg-ring/18 text-foreground",
    dot: "bg-ring",
  },
  live: {
    label: "Live",
    chip: "bg-success/12 text-success",
    dot: "bg-success",
  },
  error: {
    label: "Error",
    chip: "bg-destructive/12 text-destructive",
    dot: "bg-destructive",
  },
};

export const KIND_LABEL: Record<ProjectKind, string> = {
  internal: "Internal tool",
  customer: "Customer app",
  marketing: "Marketing site",
  mobile: "Mobile app",
};

export const SCREEN_KIND_LABEL: Record<ScreenKind, string> = {
  dashboard: "Dashboard",
  table: "Table",
  form: "Form",
  detail: "Detail",
  board: "Board",
  settings: "Settings",
};

export interface TemplateSpec {
  id: string;
  category: string;
  name: string;
  tagline: string;
  prompt: string;
  kind: ProjectKind;
}

/** Starter prompts shown on /dashboard/templates and in the dashboard empty state. */
export const TEMPLATES: TemplateSpec[] = [
  {
    id: "crm",
    category: "Sales",
    name: "CRM",
    tagline: "Pipeline, contacts, deals and activity log.",
    kind: "internal",
    prompt:
      "Build a CRM for my sales team with companies, contacts, deals and activities. Deals move through a pipeline board from Lead to Won, each deal has an owner, value and close date, and the dashboard shows pipeline value, win rate and deals closing this month.",
  },
  {
    id: "erp",
    category: "Operations",
    name: "Lightweight ERP",
    tagline: "Orders, purchasing, stock and suppliers in one place.",
    kind: "internal",
    prompt:
      "Build a lightweight ERP for a small manufacturer covering products, suppliers, purchase orders, sales orders and stock levels. Show a dashboard of open orders, stock value and late deliveries, and let staff receive stock against a purchase order.",
  },
  {
    id: "hr",
    category: "People",
    name: "HR portal",
    tagline: "Employees, leave requests and onboarding checklists.",
    kind: "internal",
    prompt:
      "Build an HR portal where employees request leave and managers approve it. Track employees, departments, leave balances and onboarding checklists, with a dashboard showing headcount, who is off this week and pending approvals.",
  },
  {
    id: "inventory",
    category: "Operations",
    name: "Inventory tracker",
    tagline: "Items, locations, movements and low-stock alerts.",
    kind: "internal",
    prompt:
      "Build an inventory tracker with items, warehouse locations, stock movements and suppliers. Staff scan items in and out, low stock triggers a reorder flag, and the dashboard shows stock on hand, items below reorder point and movement this week.",
  },
  {
    id: "ops",
    category: "Operations",
    name: "Ops dashboard",
    tagline: "Live KPIs pulled together for the leadership team.",
    kind: "internal",
    prompt:
      "Build an operations dashboard for my leadership team showing revenue, orders, fulfilment time and customer satisfaction by region and month, with a table of exceptions that need attention and the ability to add a comment to any exception.",
  },
  {
    id: "client-portal",
    category: "Customer",
    name: "Client portal",
    tagline: "Projects, files, invoices and messages per client.",
    kind: "customer",
    prompt:
      "Build a client portal where each client signs in to see their projects, milestones, shared files, invoices and a message thread with our team. Staff see every client, clients only see their own records.",
  },
  {
    id: "booking",
    category: "Customer",
    name: "Booking app",
    tagline: "Services, availability, bookings and reminders.",
    kind: "customer",
    prompt:
      "Build a booking app for a studio with services, staff, availability and customer bookings. Customers pick a service and a time slot, get an email confirmation and a reminder, and staff see the day's schedule on a dashboard.",
  },
  {
    id: "storefront",
    category: "Customer",
    name: "Storefront",
    tagline: "Catalogue, cart, checkout and order management.",
    kind: "customer",
    prompt:
      "Build an online storefront with a product catalogue, categories, cart, checkout with card payments and an order management screen for staff. Show best sellers and revenue this month on the admin dashboard.",
  },
];

export const TEMPLATE_CATEGORIES = ["Sales", "Operations", "People", "Customer"] as const;

/** Integrations gallery — every visual is CSS, so each entry carries a token class. */
export const INTEGRATIONS: {
  name: string;
  category: string;
  description: string;
  connected: boolean;
}[] = [
  { name: "Stripe", category: "Payments", description: "Charge cards, run subscriptions and reconcile payouts.", connected: true },
  { name: "Slack", category: "Messaging", description: "Post alerts and approvals into any channel.", connected: true },
  { name: "Gmail", category: "Email", description: "Send transactional email from your own domain.", connected: false },
  { name: "Google Sheets", category: "Data", description: "Two-way sync between a sheet and a table.", connected: true },
  { name: "Xero", category: "Finance", description: "Push invoices and pull the chart of accounts.", connected: false },
  { name: "HubSpot", category: "Sales", description: "Mirror contacts and deals with your CRM of record.", connected: false },
  { name: "Twilio", category: "Messaging", description: "SMS notifications and one-time passcodes.", connected: false },
  { name: "S3", category: "Storage", description: "Store uploads in your own bucket.", connected: true },
  { name: "Salesforce", category: "Sales", description: "Sync accounts, opportunities and custom objects.", connected: false },
  { name: "QuickBooks", category: "Finance", description: "Keep invoices and payments in step with the ledger.", connected: false },
  { name: "Notion", category: "Docs", description: "Publish records into a Notion database.", connected: false },
  { name: "Zapier", category: "Automation", description: "Reach 6,000 more apps with no extra work.", connected: true },
];
