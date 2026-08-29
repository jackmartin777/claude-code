/**
 * The Hercules generator.
 *
 * A deterministic, fully offline planner that turns a plain-language prompt
 * into an `AppSpec`, a believable ordered build plan, and follow-up mutations
 * applied when the user keeps chatting with their app.
 *
 * There is no model call here: structure is inferred from keyword analysis over
 * a library of entity blueprints. Every export is a pure function - no I/O, no
 * randomness, no clock - so the same prompt always produces the same app and
 * the module is safe to import from the client or the server.
 *
 * Capability strings mirror the labels in `src/data/site.ts` (featureGroups)
 * so the product UI can look each one up in the marketing vocabulary.
 */

import type {
  AppSpec,
  BuildStep,
  FieldSpec,
  ProjectKind,
  ScreenSpec,
  TableSpec,
} from "./types";
import { slugify } from "./utils";

/* ------------------------------------------------------------------ */
/* Capability vocabulary (mirrors data/site.ts featureGroups)          */
/* ------------------------------------------------------------------ */

export const CAP = {
  auth: "Auth",
  users: "Users",
  database: "Database",
  backend: "Backend",
  payments: "Payments",
  email: "Email",
  storage: "Storage",
  hosting: "Hosting",
  domains: "Domains",
  files: "Files & media",
  cms: "CMS",
  search: "Search",
  branding: "Branding",
  seo: "SEO",
  mobile: "Mobile",
  i18n: "Internationalization",
  chat: "Chat",
  notifications: "Notifications",
  aiText: "AI text generation",
  aiImage: "AI image generation",
  aiSpeech: "AI speech generation",
  aiTranscription: "AI transcription",
  chatbots: "Chatbots",
  aiGateway: "AI Gateway",
  realtime: "Realtime",
  roles: "Roles & permissions",
  security: "Security",
  secrets: "Secrets",
  analytics: "Analytics",
  audits: "Audits",
  versionControl: "Version control",
  scheduled: "Scheduled events",
  recurring: "Recurring events",
} as const;

const BASE_CAPABILITIES: string[] = [
  CAP.auth,
  CAP.users,
  CAP.database,
  CAP.backend,
  CAP.hosting,
  CAP.roles,
];

/* ------------------------------------------------------------------ */
/* Small deterministic helpers                                         */
/* ------------------------------------------------------------------ */

/** FNV-1a. Deterministic, stable across runs and platforms. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic integer in [min, max] derived from a seed string. */
function seeded(seed: string, min: number, max: number): number {
  if (max <= min) return min;
  return min + (hash(seed) % (max - min + 1));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      word.length <= 3 && /^(and|for|the|of|to|a|an|my|our)$/i.test(word)
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ")
    .replace(/^./, (c) => c.toUpperCase());
}

function singular(word: string): string {
  if (/ies$/i.test(word)) return `${word.slice(0, -3)}y`;
  if (/(ses|ches|shes|xes)$/i.test(word)) return word.slice(0, -2);
  if (/s$/i.test(word) && !/ss$/i.test(word)) return word.slice(0, -1);
  return word;
}

function plural(word: string): string {
  if (/s$/i.test(word)) return word;
  if (/y$/i.test(word) && !/[aeiou]y$/i.test(word)) return `${word.slice(0, -1)}ies`;
  if (/(ch|sh|x|s)$/i.test(word)) return `${word}es`;
  return `${word}s`;
}

function list(items: string[]): string {
  const parts = items.filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0] as string;
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

function compact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(value);
}

function withCommas(value: number): string {
  return value.toLocaleString("en-US");
}

/* ------------------------------------------------------------------ */
/* Field + table primitives                                            */
/* ------------------------------------------------------------------ */

function field(
  name: string,
  type: FieldSpec["type"],
  extra: { required?: boolean; options?: string[]; relation?: string } = {}
): FieldSpec {
  const spec: FieldSpec = { name, type };
  if (extra.required) spec.required = true;
  if (extra.options) spec.options = extra.options;
  if (extra.relation) spec.relation = extra.relation;
  return spec;
}

function screen(
  name: string,
  kind: ScreenSpec["kind"],
  table?: string,
  stats?: ScreenSpec["stats"]
): ScreenSpec {
  const spec: ScreenSpec = { id: slugify(name) || `screen-${hash(name) % 997}`, name, kind };
  if (table) spec.table = table;
  if (stats) spec.stats = stats;
  return spec;
}

/* ------------------------------------------------------------------ */
/* Entity library - the backbone of every blueprint                    */
/* ------------------------------------------------------------------ */

interface EntityDef {
  /** Plural, human-facing table name. */
  label: string;
  description: string;
  /** Row count for a ~10 person team; scaled by the prompt's signals. */
  rows: number;
  fields: FieldSpec[];
}

const STATUS = (options: string[]) => field("Status", "select", { required: true, options });

const ENTITIES: Record<string, EntityDef> = {
  contacts: {
    label: "Contacts",
    description: "Every person you do business with, with their account and owner.",
    rows: 1840,
    fields: [
      field("Full name", "text", { required: true }),
      field("Email", "email", { required: true }),
      field("Phone", "text"),
      field("Job title", "text"),
      field("Account", "relation", { relation: "Accounts" }),
      field("Owner", "relation", { relation: "Team members" }),
      STATUS(["Lead", "Active", "Dormant"]),
      field("Last contacted", "date"),
    ],
  },
  accounts: {
    label: "Accounts",
    description: "Companies you sell to, with size, segment and account owner.",
    rows: 420,
    fields: [
      field("Company name", "text", { required: true }),
      field("Website", "url"),
      field("Industry", "select", { options: ["Logistics", "Retail", "Manufacturing", "Services", "Technology"] }),
      field("Employees", "number"),
      field("Annual value", "currency"),
      field("Owner", "relation", { relation: "Team members" }),
      STATUS(["Prospect", "Customer", "Churned"]),
    ],
  },
  deals: {
    label: "Deals",
    description: "Opportunities moving through the pipeline with value and close date.",
    rows: 260,
    fields: [
      field("Name", "text", { required: true }),
      field("Account", "relation", { required: true, relation: "Accounts" }),
      field("Value", "currency", { required: true }),
      field("Stage", "select", {
        required: true,
        options: ["Qualifying", "Discovery", "Proposal", "Negotiation", "Won", "Lost"],
      }),
      field("Probability", "number"),
      field("Expected close", "date"),
      field("Owner", "relation", { relation: "Team members" }),
    ],
  },
  activities: {
    label: "Follow-ups",
    description: "Calls, emails and next steps scheduled against a contact or deal.",
    rows: 3100,
    fields: [
      field("Subject", "text", { required: true }),
      field("Type", "select", { required: true, options: ["Call", "Email", "Meeting", "Task"] }),
      field("Due", "date", { required: true }),
      field("Contact", "relation", { relation: "Contacts" }),
      field("Deal", "relation", { relation: "Deals" }),
      field("Completed", "boolean"),
      field("Notes", "text"),
    ],
  },
  teamMembers: {
    label: "Team members",
    description: "Everyone with a login, their role and the territory they cover.",
    rows: 12,
    fields: [
      field("Name", "text", { required: true }),
      field("Email", "email", { required: true }),
      field("Role", "select", { required: true, options: ["Owner", "Admin", "Editor", "Viewer"] }),
      field("Team", "text"),
      field("Active", "boolean"),
    ],
  },
  employees: {
    label: "Employees",
    description: "The people directory: department, manager, start date and status.",
    rows: 86,
    fields: [
      field("Full name", "text", { required: true }),
      field("Work email", "email", { required: true }),
      field("Department", "select", {
        required: true,
        options: ["Operations", "Sales", "Finance", "Engineering", "People"],
      }),
      field("Manager", "relation", { relation: "Employees" }),
      field("Start date", "date", { required: true }),
      field("Salary", "currency"),
      STATUS(["Applicant", "Onboarding", "Active", "Leaver"]),
    ],
  },
  timeOff: {
    label: "Time off",
    description: "Leave requests with balances and the approval trail.",
    rows: 340,
    fields: [
      field("Employee", "relation", { required: true, relation: "Employees" }),
      field("Type", "select", { required: true, options: ["Annual", "Sick", "Parental", "Unpaid"] }),
      field("From", "date", { required: true }),
      field("To", "date", { required: true }),
      field("Days", "number"),
      STATUS(["Requested", "Approved", "Declined"]),
      field("Approver", "relation", { relation: "Employees" }),
    ],
  },
  onboarding: {
    label: "Onboarding tasks",
    description: "Checklist each new starter works through in their first fortnight.",
    rows: 620,
    fields: [
      field("Task", "text", { required: true }),
      field("Employee", "relation", { required: true, relation: "Employees" }),
      field("Owner", "relation", { relation: "Employees" }),
      field("Due", "date"),
      field("Done", "boolean"),
    ],
  },
  timesheets: {
    label: "Timesheets",
    description: "Hours booked against jobs, projects or clients for payroll and billing.",
    rows: 4200,
    fields: [
      field("Employee", "relation", { required: true, relation: "Employees" }),
      field("Date", "date", { required: true }),
      field("Hours", "number", { required: true }),
      field("Billable", "boolean"),
      field("Notes", "text"),
    ],
  },
  products: {
    label: "Products",
    description: "The catalogue: SKU, price, category and stock position.",
    rows: 640,
    fields: [
      field("Name", "text", { required: true }),
      field("SKU", "text", { required: true }),
      field("Category", "select", { options: ["Core", "Accessory", "Consumable", "Service"] }),
      field("Price", "currency", { required: true }),
      field("Cost", "currency"),
      field("In stock", "number"),
      field("Active", "boolean"),
    ],
  },
  inventory: {
    label: "Stock levels",
    description: "On-hand quantity per product per location, with reorder points.",
    rows: 1900,
    fields: [
      field("Product", "relation", { required: true, relation: "Products" }),
      field("Location", "relation", { required: true, relation: "Locations" }),
      field("On hand", "number", { required: true }),
      field("Reorder point", "number"),
      field("Reserved", "number"),
      field("Last counted", "date"),
    ],
  },
  locations: {
    label: "Locations",
    description: "Warehouses, branches and vans that hold stock or serve customers.",
    rows: 9,
    fields: [
      field("Name", "text", { required: true }),
      field("Type", "select", { options: ["Warehouse", "Branch", "Van", "Site"] }),
      field("Address", "text"),
      field("Manager", "relation", { relation: "Team members" }),
      field("Active", "boolean"),
    ],
  },
  suppliers: {
    label: "Suppliers",
    description: "Vendors you buy from, with lead times and payment terms.",
    rows: 74,
    fields: [
      field("Name", "text", { required: true }),
      field("Contact email", "email"),
      field("Lead time (days)", "number"),
      field("Payment terms", "select", { options: ["Net 7", "Net 14", "Net 30", "Net 60"] }),
      field("Preferred", "boolean"),
    ],
  },
  purchaseOrders: {
    label: "Purchase orders",
    description: "What you have ordered from suppliers and what has landed.",
    rows: 380,
    fields: [
      field("Reference", "text", { required: true }),
      field("Supplier", "relation", { required: true, relation: "Suppliers" }),
      field("Total", "currency", { required: true }),
      field("Ordered", "date"),
      field("Expected", "date"),
      STATUS(["Draft", "Sent", "Part received", "Received", "Cancelled"]),
    ],
  },
  orders: {
    label: "Orders",
    description: "Customer orders with line totals, fulfilment and payment state.",
    rows: 2400,
    fields: [
      field("Order number", "text", { required: true }),
      field("Customer", "relation", { required: true, relation: "Customers" }),
      field("Total", "currency", { required: true }),
      field("Placed", "date", { required: true }),
      STATUS(["Pending", "Paid", "Fulfilled", "Refunded"]),
      field("Channel", "select", { options: ["Web", "Phone", "Rep", "Marketplace"] }),
    ],
  },
  customers: {
    label: "Customers",
    description: "Who you serve, how to reach them and what they are worth.",
    rows: 1450,
    fields: [
      field("Name", "text", { required: true }),
      field("Email", "email", { required: true }),
      field("Phone", "text"),
      field("Address", "text"),
      field("Lifetime value", "currency"),
      STATUS(["Active", "Lapsed", "Blocked"]),
      field("Joined", "date"),
    ],
  },
  invoices: {
    label: "Invoices",
    description: "Billing documents with amounts, due dates and payment status.",
    rows: 960,
    fields: [
      field("Invoice number", "text", { required: true }),
      field("Customer", "relation", { required: true, relation: "Customers" }),
      field("Amount", "currency", { required: true }),
      field("Issued", "date", { required: true }),
      field("Due", "date", { required: true }),
      STATUS(["Draft", "Sent", "Paid", "Overdue", "Written off"]),
      field("PDF", "url"),
    ],
  },
  payments: {
    label: "Payments",
    description: "Money received against invoices, with method and reference.",
    rows: 880,
    fields: [
      field("Invoice", "relation", { required: true, relation: "Invoices" }),
      field("Amount", "currency", { required: true }),
      field("Method", "select", { required: true, options: ["Card", "Bank transfer", "Cash", "Direct debit"] }),
      field("Received", "date", { required: true }),
      field("Reference", "text"),
      field("Reconciled", "boolean"),
    ],
  },
  quotes: {
    label: "Quotes",
    description: "Estimates sent to customers before the work is booked in.",
    rows: 540,
    fields: [
      field("Reference", "text", { required: true }),
      field("Customer", "relation", { required: true, relation: "Customers" }),
      field("Total", "currency", { required: true }),
      field("Valid until", "date"),
      STATUS(["Draft", "Sent", "Accepted", "Declined", "Expired"]),
      field("Notes", "text"),
    ],
  },
  expenses: {
    label: "Expenses",
    description: "Costs logged against a job, project or cost centre.",
    rows: 1260,
    fields: [
      field("Description", "text", { required: true }),
      field("Amount", "currency", { required: true }),
      field("Category", "select", { options: ["Fuel", "Parts", "Travel", "Software", "Other"] }),
      field("Date", "date", { required: true }),
      field("Receipt", "url"),
      field("Approved", "boolean"),
    ],
  },
  jobs: {
    label: "Jobs",
    description: "Scheduled work with a customer, an address and an assigned crew.",
    rows: 1720,
    fields: [
      field("Reference", "text", { required: true }),
      field("Customer", "relation", { required: true, relation: "Customers" }),
      field("Address", "text", { required: true }),
      field("Scheduled for", "date", { required: true }),
      field("Technician", "relation", { relation: "Technicians" }),
      STATUS(["Unassigned", "Scheduled", "In progress", "Complete", "Cancelled"]),
      field("Value", "currency"),
    ],
  },
  technicians: {
    label: "Technicians",
    description: "Field staff, the skills they hold and the area they cover.",
    rows: 18,
    fields: [
      field("Name", "text", { required: true }),
      field("Phone", "text", { required: true }),
      field("Skills", "select", { options: ["Install", "Service", "Emergency", "Inspection"] }),
      field("Region", "text"),
      field("Available", "boolean"),
    ],
  },
  workOrders: {
    label: "Work orders",
    description: "What has to be done on site, with parts used and time on the job.",
    rows: 2050,
    fields: [
      field("Job", "relation", { required: true, relation: "Jobs" }),
      field("Task", "text", { required: true }),
      field("Parts used", "text"),
      field("Hours", "number"),
      field("Signature", "url"),
      field("Completed", "boolean"),
    ],
  },
  inspections: {
    label: "Inspections",
    description: "Checklists completed on site with photos and pass or fail results.",
    rows: 1140,
    fields: [
      field("Job", "relation", { relation: "Jobs" }),
      field("Checklist", "select", { options: ["Safety", "Pre-delivery", "Annual service", "Handover"] }),
      field("Inspector", "relation", { relation: "Technicians" }),
      field("Date", "date", { required: true }),
      field("Photos", "url"),
      field("Passed", "boolean"),
    ],
  },
  vehicles: {
    label: "Vehicles",
    description: "The fleet, with registration, service dates and current driver.",
    rows: 24,
    fields: [
      field("Registration", "text", { required: true }),
      field("Model", "text"),
      field("Driver", "relation", { relation: "Technicians" }),
      field("Next service", "date"),
      field("Mileage", "number"),
      STATUS(["Active", "In workshop", "Retired"]),
    ],
  },
  deliveries: {
    label: "Deliveries",
    description: "Drops on today's route, scanned and signed for on a phone.",
    rows: 3600,
    fields: [
      field("Reference", "text", { required: true }),
      field("Customer", "relation", { required: true, relation: "Customers" }),
      field("Address", "text", { required: true }),
      field("Driver", "relation", { relation: "Technicians" }),
      field("Scanned at", "date"),
      field("Signature", "url"),
      STATUS(["Loaded", "Out for delivery", "Delivered", "Failed"]),
    ],
  },
  tickets: {
    label: "Tickets",
    description: "Support requests with priority, owner and time to first response.",
    rows: 2760,
    fields: [
      field("Subject", "text", { required: true }),
      field("Customer", "relation", { required: true, relation: "Customers" }),
      field("Priority", "select", { required: true, options: ["Low", "Normal", "High", "Urgent"] }),
      STATUS(["New", "Open", "Waiting", "Resolved", "Closed"]),
      field("Assignee", "relation", { relation: "Team members" }),
      field("Opened", "date", { required: true }),
      field("Resolved", "date"),
    ],
  },
  slaPolicies: {
    label: "SLA policies",
    description: "Response and resolution targets by plan and priority.",
    rows: 8,
    fields: [
      field("Name", "text", { required: true }),
      field("Priority", "select", { required: true, options: ["Low", "Normal", "High", "Urgent"] }),
      field("First response (mins)", "number", { required: true }),
      field("Resolution (hours)", "number", { required: true }),
      field("Active", "boolean"),
    ],
  },
  projects: {
    label: "Projects",
    description: "Work streams with an owner, budget and delivery date.",
    rows: 96,
    fields: [
      field("Name", "text", { required: true }),
      field("Client", "relation", { relation: "Customers" }),
      field("Owner", "relation", { relation: "Team members" }),
      STATUS(["Planned", "Active", "On hold", "Delivered"]),
      field("Budget", "currency"),
      field("Starts", "date"),
      field("Due", "date"),
    ],
  },
  tasks: {
    label: "Tasks",
    description: "The unit of work: assignee, status, estimate and due date.",
    rows: 2480,
    fields: [
      field("Title", "text", { required: true }),
      field("Project", "relation", { required: true, relation: "Projects" }),
      field("Assignee", "relation", { relation: "Team members" }),
      STATUS(["Backlog", "In progress", "In review", "Done"]),
      field("Estimate (hrs)", "number"),
      field("Due", "date"),
      field("Priority", "select", { options: ["Low", "Medium", "High"] }),
    ],
  },
  milestones: {
    label: "Milestones",
    description: "The dates the client actually cares about on each project.",
    rows: 240,
    fields: [
      field("Name", "text", { required: true }),
      field("Project", "relation", { required: true, relation: "Projects" }),
      field("Target date", "date", { required: true }),
      field("Complete", "boolean"),
    ],
  },
  bookings: {
    label: "Bookings",
    description: "Reserved slots with the customer, service and duration.",
    rows: 2900,
    fields: [
      field("Customer", "relation", { required: true, relation: "Customers" }),
      field("Service", "relation", { required: true, relation: "Services" }),
      field("Starts", "date", { required: true }),
      field("Duration (mins)", "number", { required: true }),
      STATUS(["Requested", "Confirmed", "Completed", "No show", "Cancelled"]),
      field("Paid", "boolean"),
    ],
  },
  services: {
    label: "Services",
    description: "What can be booked, how long it takes and what it costs.",
    rows: 22,
    fields: [
      field("Name", "text", { required: true }),
      field("Duration (mins)", "number", { required: true }),
      field("Price", "currency", { required: true }),
      field("Staff", "relation", { relation: "Team members" }),
      field("Bookable online", "boolean"),
    ],
  },
  appointments: {
    label: "Appointments",
    description: "Diary entries with the practitioner, room and visit type.",
    rows: 3400,
    fields: [
      field("Client", "relation", { required: true, relation: "Clients" }),
      field("Practitioner", "relation", { required: true, relation: "Team members" }),
      field("Starts", "date", { required: true }),
      field("Type", "select", { options: ["Consultation", "Follow-up", "Assessment", "Class"] }),
      STATUS(["Booked", "Attended", "Missed", "Cancelled"]),
      field("Notes", "text"),
    ],
  },
  clients: {
    label: "Clients",
    description: "The people you look after, with contact details and history.",
    rows: 980,
    fields: [
      field("Full name", "text", { required: true }),
      field("Email", "email", { required: true }),
      field("Phone", "text"),
      field("Date of birth", "date"),
      field("Plan", "select", { options: ["Pay as you go", "Monthly", "Annual"] }),
      STATUS(["Active", "Paused", "Cancelled"]),
    ],
  },
  members: {
    label: "Members",
    description: "Membership records with plan, renewal date and access level.",
    rows: 1240,
    fields: [
      field("Name", "text", { required: true }),
      field("Email", "email", { required: true }),
      field("Plan", "select", { required: true, options: ["Off-peak", "Standard", "Premium"] }),
      field("Renews", "date"),
      field("Monthly fee", "currency"),
      STATUS(["Active", "Frozen", "Cancelled"]),
    ],
  },
  classes: {
    label: "Classes",
    description: "The timetable: instructor, capacity and how full each session is.",
    rows: 180,
    fields: [
      field("Name", "text", { required: true }),
      field("Instructor", "relation", { relation: "Team members" }),
      field("Starts", "date", { required: true }),
      field("Capacity", "number", { required: true }),
      field("Booked", "number"),
      field("Room", "text"),
    ],
  },
  courses: {
    label: "Courses",
    description: "Programmes learners can enrol on, with modules and duration.",
    rows: 42,
    fields: [
      field("Title", "text", { required: true }),
      field("Category", "select", { options: ["Compliance", "Onboarding", "Technical", "Leadership"] }),
      field("Modules", "number"),
      field("Hours", "number"),
      field("Published", "boolean"),
    ],
  },
  lessons: {
    label: "Lessons",
    description: "Individual units inside a course, with media and a quiz.",
    rows: 460,
    fields: [
      field("Title", "text", { required: true }),
      field("Course", "relation", { required: true, relation: "Courses" }),
      field("Order", "number"),
      field("Video", "url"),
      field("Quiz questions", "number"),
    ],
  },
  enrolments: {
    label: "Enrolments",
    description: "Who is on which course and how far through they are.",
    rows: 2600,
    fields: [
      field("Learner", "relation", { required: true, relation: "Learners" }),
      field("Course", "relation", { required: true, relation: "Courses" }),
      field("Progress %", "number"),
      field("Started", "date"),
      field("Completed", "date"),
      field("Score", "number"),
    ],
  },
  learners: {
    label: "Learners",
    description: "Students and staff taking courses, with cohort and manager.",
    rows: 860,
    fields: [
      field("Name", "text", { required: true }),
      field("Email", "email", { required: true }),
      field("Cohort", "text"),
      field("Manager", "relation", { relation: "Team members" }),
      STATUS(["Invited", "Active", "Completed"]),
    ],
  },
  events: {
    label: "Events",
    description: "Dates in the calendar with a venue, capacity and ticket price.",
    rows: 64,
    fields: [
      field("Name", "text", { required: true }),
      field("Venue", "text"),
      field("Starts", "date", { required: true }),
      field("Capacity", "number", { required: true }),
      field("Ticket price", "currency"),
      STATUS(["Draft", "On sale", "Sold out", "Past"]),
    ],
  },
  attendees: {
    label: "Attendees",
    description: "Registrations with ticket type, check-in state and dietary notes.",
    rows: 4800,
    fields: [
      field("Name", "text", { required: true }),
      field("Email", "email", { required: true }),
      field("Event", "relation", { required: true, relation: "Events" }),
      field("Ticket type", "select", { options: ["General", "Early bird", "VIP", "Comp"] }),
      field("Checked in", "boolean"),
      field("Notes", "text"),
    ],
  },
  properties: {
    label: "Properties",
    description: "Listings with address, price, status and the agent responsible.",
    rows: 310,
    fields: [
      field("Address", "text", { required: true }),
      field("Type", "select", { options: ["House", "Apartment", "Office", "Retail", "Land"] }),
      field("Price", "currency", { required: true }),
      field("Bedrooms", "number"),
      field("Agent", "relation", { relation: "Team members" }),
      STATUS(["Draft", "Listed", "Under offer", "Sold", "Let"]),
    ],
  },
  viewings: {
    label: "Viewings",
    description: "Appointments to see a property, with feedback afterwards.",
    rows: 1480,
    fields: [
      field("Property", "relation", { required: true, relation: "Properties" }),
      field("Contact", "relation", { required: true, relation: "Contacts" }),
      field("When", "date", { required: true }),
      field("Feedback", "text"),
      field("Offer made", "boolean"),
    ],
  },
  leases: {
    label: "Leases",
    description: "Tenancies with rent, term dates and the deposit held.",
    rows: 220,
    fields: [
      field("Property", "relation", { required: true, relation: "Properties" }),
      field("Tenant", "relation", { required: true, relation: "Contacts" }),
      field("Monthly rent", "currency", { required: true }),
      field("Starts", "date", { required: true }),
      field("Ends", "date"),
      field("Deposit", "currency"),
    ],
  },
  menuItems: {
    label: "Menu items",
    description: "Dishes and drinks with price, allergens and availability.",
    rows: 148,
    fields: [
      field("Name", "text", { required: true }),
      field("Section", "select", { options: ["Starters", "Mains", "Desserts", "Drinks"] }),
      field("Price", "currency", { required: true }),
      field("Allergens", "text"),
      field("Available", "boolean"),
    ],
  },
  reservations: {
    label: "Reservations",
    description: "Table bookings with covers, sitting time and special requests.",
    rows: 2200,
    fields: [
      field("Name", "text", { required: true }),
      field("Phone", "text", { required: true }),
      field("Covers", "number", { required: true }),
      field("Sitting", "date", { required: true }),
      field("Table", "text"),
      STATUS(["Booked", "Seated", "Completed", "No show"]),
    ],
  },
  pages: {
    label: "Pages",
    description: "Generated pages with their target keyword, meta data and traffic.",
    rows: 480,
    fields: [
      field("Title", "text", { required: true }),
      field("Slug", "text", { required: true }),
      field("Target keyword", "text"),
      field("Meta description", "text"),
      field("Location", "relation", { relation: "Locations" }),
      field("Published", "boolean"),
      field("Monthly views", "number"),
    ],
  },
  posts: {
    label: "Blog posts",
    description: "Articles with an author, publish date and canonical URL.",
    rows: 128,
    fields: [
      field("Title", "text", { required: true }),
      field("Author", "relation", { relation: "Team members" }),
      field("Published", "date"),
      field("Tags", "text"),
      field("Hero image", "url"),
      field("Live", "boolean"),
    ],
  },
  leads: {
    label: "Leads",
    description: "Enquiries captured from the site, with source and outcome.",
    rows: 1520,
    fields: [
      field("Name", "text", { required: true }),
      field("Email", "email", { required: true }),
      field("Phone", "text"),
      field("Source", "select", { options: ["Organic", "Paid", "Referral", "Direct"] }),
      field("Message", "text"),
      STATUS(["New", "Contacted", "Qualified", "Won", "Lost"]),
    ],
  },
  documents: {
    label: "Documents",
    description: "Files shared with a record, with version and who uploaded it.",
    rows: 1340,
    fields: [
      field("Name", "text", { required: true }),
      field("File", "url", { required: true }),
      field("Uploaded by", "relation", { relation: "Team members" }),
      field("Uploaded", "date"),
      field("Shared with customer", "boolean"),
    ],
  },
  notifications: {
    label: "Notifications",
    description: "Emails and alerts queued or sent, with template and status.",
    rows: 5400,
    fields: [
      field("Template", "select", { required: true, options: ["Welcome", "Reminder", "Receipt", "Alert"] }),
      field("Recipient", "email", { required: true }),
      field("Channel", "select", { options: ["Email", "SMS", "Push", "In-app"] }),
      field("Sent", "date"),
      STATUS(["Queued", "Sent", "Failed"]),
    ],
  },
  reports: {
    label: "Saved reports",
    description: "Filtered views the team saves, schedules and shares.",
    rows: 26,
    fields: [
      field("Name", "text", { required: true }),
      field("Source table", "text", { required: true }),
      field("Filters", "text"),
      field("Schedule", "select", { options: ["None", "Daily", "Weekly", "Monthly"] }),
      field("Owner", "relation", { relation: "Team members" }),
    ],
  },
  auditLog: {
    label: "Audit log",
    description: "Every create, update and delete with the user and timestamp.",
    rows: 12400,
    fields: [
      field("Actor", "relation", { required: true, relation: "Team members" }),
      field("Action", "select", { required: true, options: ["Create", "Update", "Delete", "Login", "Export"] }),
      field("Record", "text", { required: true }),
      field("When", "date", { required: true }),
      field("IP address", "text"),
    ],
  },
  subscriptions: {
    label: "Subscriptions",
    description: "Recurring plans with billing interval and next charge date.",
    rows: 640,
    fields: [
      field("Customer", "relation", { required: true, relation: "Customers" }),
      field("Plan", "select", { required: true, options: ["Starter", "Growth", "Scale"] }),
      field("Amount", "currency", { required: true }),
      field("Interval", "select", { options: ["Monthly", "Annual"] }),
      field("Next charge", "date"),
      STATUS(["Trialling", "Active", "Past due", "Cancelled"]),
    ],
  },
  shifts: {
    label: "Shifts",
    description: "Who is working when, across sites and roles.",
    rows: 1600,
    fields: [
      field("Employee", "relation", { required: true, relation: "Employees" }),
      field("Starts", "date", { required: true }),
      field("Ends", "date", { required: true }),
      field("Location", "relation", { relation: "Locations" }),
      field("Confirmed", "boolean"),
    ],
  },
  assets: {
    label: "Assets",
    description: "Equipment issued to staff or sites, with condition and value.",
    rows: 420,
    fields: [
      field("Name", "text", { required: true }),
      field("Serial number", "text"),
      field("Assigned to", "relation", { relation: "Team members" }),
      field("Purchased", "date"),
      field("Value", "currency"),
      STATUS(["In use", "In storage", "Repair", "Written off"]),
    ],
  },
  contracts: {
    label: "Contracts",
    description: "Agreements with renewal dates, value and signed copies.",
    rows: 180,
    fields: [
      field("Title", "text", { required: true }),
      field("Counterparty", "text", { required: true }),
      field("Value", "currency"),
      field("Signed", "date"),
      field("Renews", "date"),
      field("Document", "url"),
    ],
  },
  reviews: {
    label: "Reviews",
    description: "Ratings and comments left by customers after a job or order.",
    rows: 890,
    fields: [
      field("Customer", "relation", { relation: "Customers" }),
      field("Rating", "number", { required: true }),
      field("Comment", "text"),
      field("Received", "date"),
      field("Published", "boolean"),
    ],
  },
  messages: {
    label: "Messages",
    description: "Threaded conversation between your team and a customer.",
    rows: 3800,
    fields: [
      field("Thread", "text", { required: true }),
      field("Author", "text", { required: true }),
      field("Body", "text", { required: true }),
      field("Sent", "date", { required: true }),
      field("Read", "boolean"),
    ],
  },
};

/** Words in a prompt that map onto an entity key. */
const ENTITY_ALIASES: Record<string, string> = {
  contact: "contacts",
  contacts: "contacts",
  account: "accounts",
  accounts: "accounts",
  company: "accounts",
  companies: "accounts",
  deal: "deals",
  deals: "deals",
  opportunity: "deals",
  opportunities: "deals",
  pipeline: "deals",
  "follow-up": "activities",
  "follow-ups": "activities",
  followup: "activities",
  followups: "activities",
  activity: "activities",
  activities: "activities",
  employee: "employees",
  employees: "employees",
  staff: "employees",
  "time off": "timeOff",
  leave: "timeOff",
  holiday: "timeOff",
  pto: "timeOff",
  onboarding: "onboarding",
  timesheet: "timesheets",
  timesheets: "timesheets",
  hours: "timesheets",
  product: "products",
  products: "products",
  catalogue: "products",
  catalog: "products",
  sku: "products",
  skus: "products",
  stock: "inventory",
  inventory: "inventory",
  warehouse: "locations",
  warehouses: "locations",
  location: "locations",
  locations: "locations",
  branch: "locations",
  branches: "locations",
  supplier: "suppliers",
  suppliers: "suppliers",
  vendor: "suppliers",
  vendors: "suppliers",
  "purchase order": "purchaseOrders",
  "purchase orders": "purchaseOrders",
  order: "orders",
  orders: "orders",
  customer: "customers",
  customers: "customers",
  client: "customers",
  clients: "customers",
  invoice: "invoices",
  invoices: "invoices",
  billing: "invoices",
  payment: "payments",
  payments: "payments",
  quote: "quotes",
  quotes: "quotes",
  estimate: "quotes",
  estimates: "quotes",
  expense: "expenses",
  expenses: "expenses",
  receipt: "expenses",
  receipts: "expenses",
  job: "jobs",
  jobs: "jobs",
  technician: "technicians",
  technicians: "technicians",
  tech: "technicians",
  techs: "technicians",
  crew: "technicians",
  crews: "technicians",
  driver: "technicians",
  drivers: "technicians",
  "work order": "workOrders",
  "work orders": "workOrders",
  inspection: "inspections",
  inspections: "inspections",
  checklist: "inspections",
  checklists: "inspections",
  vehicle: "vehicles",
  vehicles: "vehicles",
  fleet: "vehicles",
  delivery: "deliveries",
  deliveries: "deliveries",
  ticket: "tickets",
  tickets: "tickets",
  sla: "slaPolicies",
  slas: "slaPolicies",
  project: "projects",
  projects: "projects",
  task: "tasks",
  tasks: "tasks",
  milestone: "milestones",
  milestones: "milestones",
  booking: "bookings",
  bookings: "bookings",
  service: "services",
  services: "services",
  appointment: "appointments",
  appointments: "appointments",
  patient: "clients",
  patients: "clients",
  member: "members",
  members: "members",
  membership: "members",
  class: "classes",
  classes: "classes",
  course: "courses",
  courses: "courses",
  lesson: "lessons",
  lessons: "lessons",
  enrolment: "enrolments",
  enrolments: "enrolments",
  enrollment: "enrolments",
  enrollments: "enrolments",
  learner: "learners",
  learners: "learners",
  student: "learners",
  students: "learners",
  event: "events",
  events: "events",
  attendee: "attendees",
  attendees: "attendees",
  registration: "attendees",
  registrations: "attendees",
  property: "properties",
  properties: "properties",
  listing: "properties",
  listings: "properties",
  viewing: "viewings",
  viewings: "viewings",
  lease: "leases",
  leases: "leases",
  tenant: "leases",
  tenants: "leases",
  menu: "menuItems",
  "menu item": "menuItems",
  "menu items": "menuItems",
  reservation: "reservations",
  reservations: "reservations",
  table: "reservations",
  page: "pages",
  pages: "pages",
  post: "posts",
  posts: "posts",
  blog: "posts",
  article: "posts",
  articles: "posts",
  lead: "leads",
  leads: "leads",
  enquiry: "leads",
  enquiries: "leads",
  inquiry: "leads",
  inquiries: "leads",
  document: "documents",
  documents: "documents",
  file: "documents",
  files: "documents",
  notification: "notifications",
  notifications: "notifications",
  alert: "notifications",
  alerts: "notifications",
  report: "reports",
  reports: "reports",
  audit: "auditLog",
  audits: "auditLog",
  "audit log": "auditLog",
  subscription: "subscriptions",
  subscriptions: "subscriptions",
  shift: "shifts",
  shifts: "shifts",
  rota: "shifts",
  roster: "shifts",
  asset: "assets",
  assets: "assets",
  equipment: "assets",
  contract: "contracts",
  contracts: "contracts",
  review: "reviews",
  reviews: "reviews",
  rating: "reviews",
  ratings: "reviews",
  message: "messages",
  messages: "messages",
  chat: "messages",
};

/* ------------------------------------------------------------------ */
/* Signal extraction                                                   */
/* ------------------------------------------------------------------ */

export interface PromptSignals {
  prompt: string;
  lower: string;
  /** Head count mentioned in the prompt, defaulted when absent. */
  seats: number;
  /** Row-count multiplier derived from the head count. */
  scale: number;
  /** Qualifier lifted from "for my <x> team" - e.g. "Sales", "HVAC". */
  qualifier: string | null;
  industry: string | null;
  /** Entity keys explicitly named in the prompt. */
  entities: string[];
  features: FeatureKey[];
  archetype: ArchetypeId;
  kind: ProjectKind;
}

const INDUSTRIES: [RegExp, string][] = [
  [/\bhvac\b/, "HVAC"],
  [/\bplumb/, "Plumbing"],
  [/\belectric(al|ian)/, "Electrical"],
  [/\bconstruction|builder|contracting\b/, "Construction"],
  [/\blogistics|freight|haulage|trucking|courier\b/, "Logistics"],
  [/\blaw firm|legal|attorney|solicitor\b/, "Legal"],
  [/\bdental|dentist\b/, "Dental"],
  [/\bmedical|clinic|health|physio|therapy\b/, "Clinic"],
  [/\bgym|fitness|yoga|pilates|studio\b/, "Fitness"],
  [/\brestaurant|cafe|bistro|kitchen|catering\b/, "Restaurant"],
  [/\breal estate|property|lettings|realtor\b/, "Real estate"],
  [/\bsalon|barber|spa\b/, "Salon"],
  [/\bwholesale|distribut/, "Wholesale"],
  [/\bmanufactur|factory|production line\b/, "Manufacturing"],
  [/\bretail|store|shop\b/, "Retail"],
  [/\bnonprofit|charity|ngo\b/, "Nonprofit"],
  [/\bschool|college|university|academy|training\b/, "Education"],
  [/\bagency|marketing agency|studio\b/, "Agency"],
  [/\binsurance|broker\b/, "Insurance"],
  [/\baccounting|bookkeep\b/, "Accounting"],
  [/\bsales\b/, "Sales"],
  [/\brecruit|staffing\b/, "Recruitment"],
  [/\bcleaning\b/, "Cleaning"],
  [/\blandscap|garden/, "Landscaping"],
  [/\bpest control\b/, "Pest control"],
  [/\broofing\b/, "Roofing"],
  [/\bveterinar|vet practice\b/, "Veterinary"],
];

export type FeatureKey =
  | "payments"
  | "invoicing"
  | "scheduling"
  | "notifications"
  | "email"
  | "mobile"
  | "portal"
  | "reports"
  | "documents"
  | "chat"
  | "search"
  | "seo"
  | "inventory"
  | "timeTracking"
  | "approvals"
  | "audits"
  | "ai"
  | "i18n"
  | "subscriptions"
  | "reviews"
  | "signatures";

const FEATURE_PATTERNS: [FeatureKey, RegExp][] = [
  ["payments", /\bpay(ment|ments|ing)?\b|\bcheckout\b|\bcard\b|\bstripe\b|\btake money\b|\bbilling\b/],
  ["invoicing", /\binvoic|\bquote|\bestimate|\bbilling\b|\bstatement/],
  ["scheduling", /\bschedul|\bcalendar|\bbook(ing|ings)?\b|\bappointment|\bdispatch|\brota\b|\bshift/],
  ["notifications", /\bnotif|\balert|\breminder|\bsms\b|\bpush\b|\btext them\b/],
  ["email", /\bemail|\bmailing|\bnewsletter|\bsend .*mail/],
  ["mobile", /\bmobile\b|\bphone(s)?\b|\bios\b|\bandroid\b|\bapp store\b|\bon site\b|\btablet/],
  ["portal", /\bportal\b|\bcustomers can\b|\bclients can\b|\bself[- ]serve|\blogin for (customers|clients)/],
  ["reports", /\breport|\banalytic|\bdashboard|\bkpi|\bmetric|\bexport|\bcharts?\b/],
  ["documents", /\bdocument|\bfile upload|\battachment|\bphoto|\bpdf\b|\bcontract/],
  ["chat", /\bchat\b|\bmessag|\bconversation|\binbox\b/],
  ["search", /\bsearch\b|\bfilter|\bfind (a|the) /],
  ["seo", /\bseo\b|\bsearch engine|\brank(ing)?\b|\borganic traffic|\bprogrammatic/],
  ["inventory", /\binventory|\bstock\b|\bwarehouse|\bsku\b|\bparts\b|\bsupplies\b/],
  ["timeTracking", /\btime track|\btimesheet|\bhours\b|\bclock (in|out)|\bbillable/],
  ["approvals", /\bapprov|\bsign[- ]?off|\bauthoris|\bauthoriz/],
  ["audits", /\baudit|\bcompliance|\bhistory of changes|\bwho changed/],
  ["ai", /\bai\b|\bgpt\b|\bsummaris|\bsummariz|\bchatbot|\bautomatically writes?\b|\btranscri/],
  ["i18n", /\bmulti[- ]?lingual|\btranslat|\blanguages\b|\bspanish|\bfrench|\bgerman/],
  ["subscriptions", /\bsubscription|\brecurring|\bmembership|\bretainer|\bmonthly plan/],
  ["reviews", /\breview|\brating|\bfeedback|\bnps\b|\btestimonial/],
  ["signatures", /\bsignature|\bsign for|\bproof of delivery|\be[- ]?sign/],
];

export type ArchetypeId =
  | "crm"
  | "erp"
  | "hr"
  | "inventory"
  | "ops"
  | "portal"
  | "booking"
  | "storefront"
  | "project"
  | "helpdesk"
  | "invoicing"
  | "fieldservice"
  | "lms"
  | "events"
  | "realestate"
  | "restaurant"
  | "clinic"
  | "seosite"
  | "generic";

const ARCHETYPE_KEYWORDS: [ArchetypeId, [RegExp, number][]][] = [
  [
    "crm",
    [
      [/\bcrm\b/, 12],
      [/\bpipeline\b/, 5],
      [/\bdeals?\b/, 5],
      [/\bleads?\b/, 3],
      [/\bsales team\b/, 5],
      [/\bfollow[- ]?ups?\b/, 3],
      [/\bcustomer relationship/, 8],
      [/\bprospects?\b/, 3],
    ],
  ],
  [
    "erp",
    [
      [/\berp\b/, 12],
      [/\bgeneral ledger\b/, 6],
      [/\bpurchase orders?\b/, 4],
      [/\bsupply chain\b/, 5],
      [/\bmanufactur/, 4],
      [/\baccounting\b/, 4],
      [/\bwhole business\b/, 3],
      [/\bback office\b/, 3],
    ],
  ],
  [
    "hr",
    [
      [/\bhr\b/, 10],
      [/\bhuman resources\b/, 10],
      [/\bemployees?\b/, 4],
      [/\bonboarding\b/, 4],
      [/\btime off\b|\bpto\b|\bannual leave\b/, 5],
      [/\bpayroll\b/, 5],
      [/\brecruit|\bapplicants?\b/, 4],
      [/\bpeople team\b/, 4],
    ],
  ],
  [
    "inventory",
    [
      [/\binventory\b/, 10],
      [/\bstock (levels?|control)\b/, 8],
      [/\bwarehouse\b/, 5],
      [/\bskus?\b/, 4],
      [/\bparts\b/, 3],
      [/\breorder\b/, 4],
      [/\bstocktake\b/, 5],
    ],
  ],
  [
    "ops",
    [
      [/\bops dashboard\b|\boperations dashboard\b/, 12],
      [/\bdashboard\b/, 4],
      [/\bkpis?\b/, 5],
      [/\bmetrics\b/, 4],
      [/\bone place\b|\bsingle view\b/, 3],
      [/\bmonitor\b/, 3],
      [/\breporting\b/, 3],
    ],
  ],
  [
    "portal",
    [
      [/\bclient portal\b|\bcustomer portal\b/, 12],
      [/\bportal\b/, 6],
      [/\bcustomers can\b|\bclients can\b/, 5],
      [/\bself[- ]serve\b/, 4],
      [/\blogin for (customers|clients)\b/, 5],
    ],
  ],
  [
    "booking",
    [
      [/\bbooking (app|system|site)\b/, 10],
      [/\bbook (a |an )?(job|appointment|slot|table|class)/, 6],
      [/\bappointments?\b/, 5],
      [/\breservations?\b/, 4],
      [/\bavailability\b/, 4],
      [/\bcalendar\b/, 3],
    ],
  ],
  [
    "storefront",
    [
      [/\bstorefront\b|\becommerce\b|\be-commerce\b/, 12],
      [/\bonline (store|shop)\b/, 9],
      [/\bcheckout\b/, 5],
      [/\bcart\b/, 5],
      [/\bproducts? (page|catalogue|catalog)\b/, 4],
      [/\bsell (products|online)\b/, 6],
    ],
  ],
  [
    "project",
    [
      [/\bproject (tracker|management|manager)\b/, 11],
      [/\bkanban\b/, 6],
      [/\bsprints?\b/, 5],
      [/\bmilestones?\b/, 4],
      [/\btasks?\b/, 4],
      [/\bbacklog\b/, 4],
    ],
  ],
  [
    "helpdesk",
    [
      [/\bhelpdesk\b|\bhelp desk\b|\bservice desk\b/, 12],
      [/\bticket(ing|s)?\b/, 7],
      [/\bsupport (desk|team|requests?)\b/, 6],
      [/\bsla\b/, 5],
      [/\bcustomer support\b/, 5],
    ],
  ],
  [
    "invoicing",
    [
      [/\binvoicing (app|system)\b/, 11],
      [/\binvoices?\b/, 4],
      [/\bquotes?\b|\bestimates?\b/, 3],
      [/\bbilling system\b/, 6],
      [/\bget paid\b/, 5],
      [/\bchase payments?\b/, 5],
    ],
  ],
  [
    "fieldservice",
    [
      [/\bfield service\b/, 12],
      [/\btechnicians?\b/, 6],
      [/\bwork orders?\b/, 6],
      [/\bdispatch\b/, 6],
      [/\bcrews?\b/, 4],
      [/\bdrivers?\b/, 5],
      [/\bjob (site|cards?)\b/, 4],
      [/\bdeliver(y|ies)\b/, 5],
      [/\bscan\b/, 4],
      [/\bon site\b/, 3],
    ],
  ],
  [
    "lms",
    [
      [/\blms\b|\blearning management\b/, 12],
      [/\bcourses?\b/, 6],
      [/\blessons?\b/, 5],
      [/\bstudents?\b|\blearners?\b/, 4],
      [/\btraining\b/, 4],
      [/\bquiz(zes)?\b/, 4],
      [/\bcertificat/, 4],
    ],
  ],
  [
    "events",
    [
      [/\bevents? (app|platform|management)\b/, 11],
      [/\battendees?\b/, 6],
      [/\bregistrations?\b/, 5],
      [/\bconference\b/, 6],
      [/\btickets? for\b/, 4],
      [/\bcheck[- ]?in\b/, 4],
    ],
  ],
  [
    "realestate",
    [
      [/\breal estate\b/, 12],
      [/\bproperties\b|\blistings?\b/, 6],
      [/\bviewings?\b/, 5],
      [/\btenants?\b|\bleases?\b/, 5],
      [/\blettings\b|\brealtor\b/, 6],
    ],
  ],
  [
    "restaurant",
    [
      [/\brestaurant\b/, 11],
      [/\bmenus?\b/, 5],
      [/\bcovers\b/, 4],
      [/\bkitchen\b/, 4],
      [/\bcafe\b|\bbistro\b|\bdiner\b/, 6],
      [/\btable bookings?\b/, 6],
    ],
  ],
  [
    "clinic",
    [
      [/\bclinic\b|\bpractice\b|\bpatients?\b/, 9],
      [/\bgym\b|\bfitness\b|\bstudio\b/, 8],
      [/\bmembers?\b|\bmemberships?\b/, 4],
      [/\bclasses\b/, 4],
      [/\btherap/, 5],
      [/\bconsultations?\b/, 4],
    ],
  ],
  [
    "seosite",
    [
      [/\bseo (site|website|pages)\b/, 12],
      [/\bprogrammatic\b/, 8],
      [/\bpage for every\b/, 9],
      [/\blanding pages?\b/, 6],
      [/\bmarketing site\b/, 7],
      [/\bblog\b/, 3],
      [/\brank(ing)? on google\b/, 6],
    ],
  ],
];

function detectArchetype(lower: string): ArchetypeId {
  let best: ArchetypeId = "generic";
  let bestScore = 0;
  for (const [id, patterns] of ARCHETYPE_KEYWORDS) {
    let score = 0;
    for (const [pattern, weight] of patterns) {
      if (pattern.test(lower)) score += weight;
    }
    if (score > bestScore) {
      bestScore = score;
      best = id;
    }
  }
  return bestScore >= 4 ? best : "generic";
}

function detectFeatures(lower: string): FeatureKey[] {
  const found: FeatureKey[] = [];
  for (const [key, pattern] of FEATURE_PATTERNS) {
    if (pattern.test(lower)) found.push(key);
  }
  return found;
}

function detectEntities(lower: string): string[] {
  const keys: string[] = [];
  for (const [alias, key] of Object.entries(ENTITY_ALIASES)) {
    const pattern = new RegExp(`\\b${alias.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`);
    if (pattern.test(lower)) keys.push(key);
  }
  return unique(keys);
}

function detectSeats(lower: string): number {
  const person = lower.match(
    /(\d{1,4})[-\s]?(?:person|people|employees?|staff|users?|seats?|members?|reps?|technicians?|drivers?|agents?|crew)/
  );
  if (person?.[1]) return clamp(Number.parseInt(person[1], 10), 1, 5000);
  const team = lower.match(/team of (\d{1,4})/);
  if (team?.[1]) return clamp(Number.parseInt(team[1], 10), 1, 5000);
  return 10;
}

function detectQualifier(prompt: string, lower: string, industry: string | null): string | null {
  const forMy = lower.match(
    /\bfor (?:my|our|a|the)\s+([a-z0-9 &'-]{2,48}?)(?=\s+(?:team|company|business|firm|agency|shop|clinic|practice|crew|staff|department|office|store|school|studio)\b|[,.]|$)/
  );
  if (forMy?.[1]) {
    const cleaned = forMy[1]
      .replace(/\b\d+[-\s]?(?:person|people|employees?|staff|seats?)\b/g, "")
      .replace(/\b(new|small|little|growing|busy|whole|entire|own)\b/g, "")
      .trim();
    if (cleaned && cleaned.length <= 32) return titleCase(cleaned);
  }
  const called = prompt.match(/\b(?:called|named)\s+["“']?([A-Za-z0-9 &'-]{2,40})["”']?/);
  if (called?.[1]) return titleCase(called[1].trim());
  return industry;
}

function detectKind(lower: string, archetype: ArchetypeId): ProjectKind {
  if (/\bmobile app\b|\bios\b|\bandroid\b|\bapp store\b|\bplay store\b|\bon their phones?\b|\bdrivers? use\b/.test(lower)) {
    return "mobile";
  }
  if (archetype === "seosite" || /\bseo\b|\bmarketing site\b|\blanding page|\bwebsite for\b|\bblog\b/.test(lower)) {
    return "marketing";
  }
  if (
    archetype === "portal" ||
    archetype === "storefront" ||
    archetype === "booking" ||
    /\bcustomers can\b|\bclients can\b|\bportal\b|\bstorefront\b|\bpublic\b|\bmembers can\b/.test(lower)
  ) {
    return "customer";
  }
  return "internal";
}

export function analysePrompt(prompt: string): PromptSignals {
  const lower = prompt.toLowerCase();
  const seats = detectSeats(lower);
  const industry = INDUSTRIES.find(([pattern]) => pattern.test(lower))?.[1] ?? null;
  const archetype = detectArchetype(lower);
  return {
    prompt,
    lower,
    seats,
    scale: clamp(seats / 10, 0.35, 8),
    qualifier: detectQualifier(prompt, lower, industry),
    industry,
    entities: detectEntities(lower),
    features: detectFeatures(lower),
    archetype,
    kind: detectKind(lower, archetype),
  };
}

/* ------------------------------------------------------------------ */
/* Table construction                                                  */
/* ------------------------------------------------------------------ */

function scaleRows(base: number, signals: PromptSignals, seed: string): number {
  const jitter = 0.88 + seeded(seed, 0, 24) / 100;
  const scaled = Math.round(base * signals.scale * jitter);
  return Math.max(3, scaled);
}

function entityTable(key: string, signals: PromptSignals, rowOverride?: number): TableSpec | null {
  const def = ENTITIES[key];
  if (!def) return null;
  const base = rowOverride ?? def.rows;
  return {
    name: def.label,
    description: def.description,
    fields: def.fields.map((f) => ({ ...f })),
    rowCount:
      key === "teamMembers"
        ? Math.max(2, signals.seats)
        : key === "technicians"
          ? Math.max(2, Math.round(signals.seats * 0.7))
          : scaleRows(base, signals, `${key}:${signals.prompt}`),
  };
}

/** Build a plausible table for a noun we have no blueprint for. */
function improvisedTable(noun: string, signals: PromptSignals): TableSpec {
  const label = titleCase(plural(noun.trim()));
  const one = singular(noun.trim()).toLowerCase();
  return {
    name: label,
    description: `Every ${one} tracked by the app, with owner, status and dates.`,
    fields: [
      field("Name", "text", { required: true }),
      field("Reference", "text"),
      STATUS(["New", "Active", "Complete", "Archived"]),
      field("Owner", "relation", { relation: "Team members" }),
      field("Value", "currency"),
      field("Due", "date"),
      field("Notes", "text"),
    ],
    rowCount: scaleRows(240, signals, `improvised:${label}`),
  };
}

function tablesFor(keys: string[], signals: PromptSignals): TableSpec[] {
  const built: TableSpec[] = [];
  for (const key of keys) {
    const table = entityTable(key, signals);
    if (table && !built.some((t) => t.name === table.name)) built.push(table);
  }
  return built;
}

/* ------------------------------------------------------------------ */
/* Blueprints                                                          */
/* ------------------------------------------------------------------ */

type Stat = { label: string; value: string; delta?: string };

interface Blueprint {
  label: string;
  /** Suffix used when naming the app - "CRM", "Portal", "Dashboard". */
  noun: string;
  defaultQualifier: string;
  purpose: string;
  tables: string[];
  capabilities: string[];
  roles: { name: string; permissions: string[] }[];
  /** Extra screens beyond the dashboard and one list per table. */
  extraScreens: (signals: PromptSignals) => ScreenSpec[];
  stats: (rows: Record<string, number>, signals: PromptSignals) => Stat[];
}

function rowsOf(tables: TableSpec[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const table of tables) map[table.name] = table.rowCount;
  return map;
}

function rowCount(rows: Record<string, number>, name: string, fallback = 0): number {
  return rows[name] ?? fallback;
}

const BLUEPRINTS: Record<ArchetypeId, Blueprint> = {
  crm: {
    label: "CRM",
    noun: "CRM",
    defaultQualifier: "Sales",
    purpose: "track every contact, deal and follow-up in one pipeline",
    tables: ["contacts", "accounts", "deals", "activities", "teamMembers"],
    capabilities: [CAP.email, CAP.notifications, CAP.analytics, CAP.search],
    roles: [
      { name: "Sales manager", permissions: ["Full pipeline access", "Reassign deals", "Export reports"] },
      { name: "Sales rep", permissions: ["Own contacts and deals", "Log follow-ups", "Send email"] },
      { name: "Read only", permissions: ["View dashboards", "View accounts"] },
    ],
    extraScreens: () => [
      screen("Pipeline", "board", "Deals"),
      screen("Contact detail", "detail", "Contacts"),
      screen("Log a follow-up", "form", "Follow-ups"),
      screen("Settings", "settings"),
    ],
    stats: (rows, signals) => {
      const deals = rowCount(rows, "Deals", 200);
      const pipeline = deals * seeded(`pipe:${signals.prompt}`, 5200, 9400);
      return [
        { label: "Open pipeline", value: `$${compact(pipeline)}`, delta: `+${seeded(`d1:${signals.prompt}`, 6, 22)}%` },
        { label: "Deals in play", value: withCommas(deals), delta: `+${seeded(`d2:${signals.prompt}`, 3, 18)}` },
        { label: "Win rate", value: `${seeded(`d3:${signals.prompt}`, 26, 44)}%`, delta: `+${seeded(`d4:${signals.prompt}`, 1, 6)} pts` },
        { label: "Follow-ups due", value: withCommas(Math.round(rowCount(rows, "Follow-ups", 800) * 0.04)) },
      ];
    },
  },
  erp: {
    label: "ERP",
    noun: "ERP",
    defaultQualifier: "Company",
    purpose: "run purchasing, stock, orders and invoicing off one database",
    tables: ["products", "inventory", "locations", "suppliers", "purchaseOrders", "orders", "customers", "invoices", "employees"],
    capabilities: [CAP.payments, CAP.email, CAP.analytics, CAP.audits, CAP.roles, CAP.search],
    roles: [
      { name: "Finance", permissions: ["Approve purchase orders", "Post invoices", "View margins"] },
      { name: "Operations", permissions: ["Manage stock", "Fulfil orders", "Edit suppliers"] },
      { name: "Sales", permissions: ["Create orders", "View stock", "View customers"] },
      { name: "Auditor", permissions: ["Read only", "Export audit log"] },
    ],
    extraScreens: () => [
      screen("Stock by location", "table", "Stock levels"),
      screen("Raise a purchase order", "form", "Purchase orders"),
      screen("Order detail", "detail", "Orders"),
      screen("Settings", "settings"),
    ],
    stats: (rows, signals) => [
      {
        label: "Stock value",
        value: `$${compact(rowCount(rows, "Stock levels", 1200) * seeded(`sv:${signals.prompt}`, 180, 420))}`,
        delta: `+${seeded(`sv2:${signals.prompt}`, 2, 11)}%`,
      },
      { label: "Open orders", value: withCommas(Math.round(rowCount(rows, "Orders", 2000) * 0.06)) },
      { label: "POs awaiting", value: withCommas(Math.round(rowCount(rows, "Purchase orders", 300) * 0.18)) },
      { label: "Unpaid invoices", value: `$${compact(rowCount(rows, "Invoices", 800) * seeded(`ui:${signals.prompt}`, 240, 680))}`, delta: `-${seeded(`ui2:${signals.prompt}`, 3, 14)}%` },
    ],
  },
  hr: {
    label: "HR portal",
    noun: "HR Portal",
    defaultQualifier: "People",
    purpose: "hold the people directory, leave, onboarding and documents",
    tables: ["employees", "timeOff", "onboarding", "documents", "shifts"],
    capabilities: [CAP.email, CAP.notifications, CAP.files, CAP.security, CAP.audits],
    roles: [
      { name: "HR admin", permissions: ["Manage employees", "Approve leave", "View salaries"] },
      { name: "Manager", permissions: ["Approve own team's leave", "View team directory"] },
      { name: "Employee", permissions: ["Request time off", "View own record", "Upload documents"] },
    ],
    extraScreens: () => [
      screen("Team directory", "table", "Employees"),
      screen("Request time off", "form", "Time off"),
      screen("Employee record", "detail", "Employees"),
      screen("Settings", "settings"),
    ],
    stats: (rows, signals) => [
      { label: "Headcount", value: withCommas(rowCount(rows, "Employees", signals.seats)), delta: `+${seeded(`hc:${signals.prompt}`, 2, 9)}` },
      { label: "Off today", value: withCommas(Math.max(1, Math.round(rowCount(rows, "Employees", 40) * 0.06))) },
      { label: "Pending requests", value: withCommas(Math.round(rowCount(rows, "Time off", 200) * 0.05)) },
      { label: "Onboarding", value: withCommas(Math.max(1, Math.round(rowCount(rows, "Employees", 40) * 0.04))) },
    ],
  },
  inventory: {
    label: "inventory tracker",
    noun: "Inventory",
    defaultQualifier: "Stock",
    purpose: "keep an accurate count of what is on hand, where, and what to reorder",
    tables: ["products", "inventory", "locations", "suppliers", "purchaseOrders"],
    capabilities: [CAP.notifications, CAP.analytics, CAP.mobile, CAP.search, CAP.scheduled],
    roles: [
      { name: "Stock controller", permissions: ["Adjust stock", "Raise purchase orders", "Run stocktakes"] },
      { name: "Warehouse staff", permissions: ["Pick and pack", "Scan movements", "View stock"] },
      { name: "Buyer", permissions: ["Manage suppliers", "Approve reorders"] },
    ],
    extraScreens: () => [
      screen("Low stock", "table", "Stock levels"),
      screen("Stock adjustment", "form", "Stock levels"),
      screen("Product detail", "detail", "Products"),
      screen("Settings", "settings"),
    ],
    stats: (rows, signals) => [
      { label: "SKUs tracked", value: withCommas(rowCount(rows, "Products", 400)) },
      { label: "Below reorder", value: withCommas(Math.round(rowCount(rows, "Stock levels", 900) * 0.07)), delta: `-${seeded(`lr:${signals.prompt}`, 2, 12)}` },
      { label: "Stock value", value: `$${compact(rowCount(rows, "Stock levels", 900) * seeded(`iv:${signals.prompt}`, 90, 260))}` },
      { label: "Locations", value: withCommas(rowCount(rows, "Locations", 4)) },
    ],
  },
  ops: {
    label: "operations dashboard",
    noun: "Dashboard",
    defaultQualifier: "Operations",
    purpose: "pull the numbers the team runs on into one live view",
    tables: ["jobs", "customers", "teamMembers", "reports", "invoices"],
    capabilities: [CAP.analytics, CAP.notifications, CAP.scheduled, CAP.search, CAP.email],
    roles: [
      { name: "Owner", permissions: ["Full access", "Manage users", "Edit metrics"] },
      { name: "Ops lead", permissions: ["Edit jobs", "Build reports", "Share dashboards"] },
      { name: "Viewer", permissions: ["View dashboards", "Export CSV"] },
    ],
    extraScreens: () => [
      screen("Live board", "board", "Jobs"),
      screen("Saved reports", "table", "Saved reports"),
      screen("Job detail", "detail", "Jobs"),
      screen("Settings", "settings"),
    ],
    stats: (rows, signals) => [
      { label: "Jobs today", value: withCommas(Math.max(3, Math.round(rowCount(rows, "Jobs", 900) * 0.02))), delta: `+${seeded(`o1:${signals.prompt}`, 2, 14)}%` },
      { label: "On-time rate", value: `${seeded(`o2:${signals.prompt}`, 88, 98)}%`, delta: `+${seeded(`o3:${signals.prompt}`, 1, 4)} pts` },
      { label: "Revenue MTD", value: `$${compact(rowCount(rows, "Invoices", 500) * seeded(`o4:${signals.prompt}`, 320, 780))}`, delta: `+${seeded(`o5:${signals.prompt}`, 4, 19)}%` },
      { label: "Open exceptions", value: withCommas(seeded(`o6:${signals.prompt}`, 2, 24)) },
    ],
  },
  portal: {
    label: "client portal",
    noun: "Portal",
    defaultQualifier: "Client",
    purpose: "give customers a login to see their jobs, documents and invoices",
    tables: ["customers", "jobs", "invoices", "documents", "messages"],
    capabilities: [CAP.payments, CAP.email, CAP.notifications, CAP.files, CAP.chat, CAP.security],
    roles: [
      { name: "Staff", permissions: ["Manage customers", "Raise invoices", "Reply to messages"] },
      { name: "Customer", permissions: ["View own jobs", "Pay invoices", "Upload documents"] },
      { name: "Support", permissions: ["View customers", "Reply to messages"] },
    ],
    extraScreens: () => [
      screen("Customer home", "dashboard", "Customers"),
      screen("Book a job", "form", "Jobs"),
      screen("Invoice detail", "detail", "Invoices"),
      screen("Messages", "table", "Messages"),
      screen("Settings", "settings"),
    ],
    stats: (rows, signals) => [
      { label: "Active customers", value: withCommas(rowCount(rows, "Customers", 800)), delta: `+${seeded(`p1:${signals.prompt}`, 3, 16)}%` },
      { label: "Jobs booked", value: withCommas(Math.round(rowCount(rows, "Jobs", 900) * 0.09)) },
      { label: "Paid online", value: `${seeded(`p2:${signals.prompt}`, 54, 86)}%`, delta: `+${seeded(`p3:${signals.prompt}`, 2, 11)} pts` },
      { label: "Awaiting reply", value: withCommas(seeded(`p4:${signals.prompt}`, 3, 27)) },
    ],
  },
  booking: {
    label: "booking app",
    noun: "Bookings",
    defaultQualifier: "Booking",
    purpose: "let customers pick a slot and pay without phoning you",
    tables: ["bookings", "services", "customers", "teamMembers", "payments"],
    capabilities: [CAP.payments, CAP.email, CAP.notifications, CAP.scheduled, CAP.recurring, CAP.mobile],
    roles: [
      { name: "Owner", permissions: ["Manage services", "See all bookings", "Refund payments"] },
      { name: "Staff", permissions: ["View own diary", "Confirm bookings"] },
      { name: "Customer", permissions: ["Book a slot", "Reschedule", "Pay"] },
    ],
    extraScreens: () => [
      screen("Diary", "board", "Bookings"),
      screen("Book a slot", "form", "Bookings"),
      screen("Booking detail", "detail", "Bookings"),
      screen("Settings", "settings"),
    ],
    stats: (rows, signals) => [
      { label: "Bookings this week", value: withCommas(Math.max(4, Math.round(rowCount(rows, "Bookings", 1200) * 0.05))), delta: `+${seeded(`b1:${signals.prompt}`, 4, 21)}%` },
      { label: "Utilisation", value: `${seeded(`b2:${signals.prompt}`, 62, 92)}%` },
      { label: "No-show rate", value: `${seeded(`b3:${signals.prompt}`, 2, 9)}%`, delta: `-${seeded(`b4:${signals.prompt}`, 1, 4)} pts` },
      { label: "Taken online", value: `$${compact(rowCount(rows, "Bookings", 1200) * seeded(`b5:${signals.prompt}`, 40, 130))}` },
    ],
  },
  storefront: {
    label: "storefront",
    noun: "Store",
    defaultQualifier: "Online",
    purpose: "sell online with a catalogue, cart and order tracking",
    tables: ["products", "orders", "customers", "payments", "inventory", "reviews"],
    capabilities: [CAP.payments, CAP.email, CAP.storage, CAP.seo, CAP.search, CAP.cms, CAP.branding],
    roles: [
      { name: "Store owner", permissions: ["Manage catalogue", "Refund orders", "View revenue"] },
      { name: "Fulfilment", permissions: ["Pick orders", "Update tracking"] },
      { name: "Customer", permissions: ["Place orders", "View own orders", "Leave a review"] },
    ],
    extraScreens: () => [
      screen("Catalogue", "table", "Products"),
      screen("Order detail", "detail", "Orders"),
      screen("Add a product", "form", "Products"),
      screen("Settings", "settings"),
    ],
    stats: (rows, signals) => [
      { label: "Revenue 30d", value: `$${compact(rowCount(rows, "Orders", 1500) * seeded(`s1:${signals.prompt}`, 60, 190))}`, delta: `+${seeded(`s2:${signals.prompt}`, 5, 28)}%` },
      { label: "Orders", value: withCommas(Math.round(rowCount(rows, "Orders", 1500) * 0.12)), delta: `+${seeded(`s3:${signals.prompt}`, 3, 17)}%` },
      { label: "Conversion", value: `${(seeded(`s4:${signals.prompt}`, 15, 46) / 10).toFixed(1)}%` },
      { label: "Average order", value: `$${seeded(`s5:${signals.prompt}`, 42, 340)}` },
    ],
  },
  project: {
    label: "project tracker",
    noun: "Projects",
    defaultQualifier: "Project",
    purpose: "see every project, task and deadline in one board",
    tables: ["projects", "tasks", "milestones", "teamMembers", "timesheets"],
    capabilities: [CAP.notifications, CAP.analytics, CAP.files, CAP.search, CAP.scheduled],
    roles: [
      { name: "Project lead", permissions: ["Create projects", "Assign tasks", "Edit budgets"] },
      { name: "Contributor", permissions: ["Update own tasks", "Log hours", "Comment"] },
      { name: "Client", permissions: ["View milestones", "View progress"] },
    ],
    extraScreens: () => [
      screen("Board", "board", "Tasks"),
      screen("Project detail", "detail", "Projects"),
      screen("New task", "form", "Tasks"),
      screen("Settings", "settings"),
    ],
    stats: (rows, signals) => [
      { label: "Active projects", value: withCommas(Math.max(2, Math.round(rowCount(rows, "Projects", 60) * 0.45))) },
      { label: "Tasks in flight", value: withCommas(Math.round(rowCount(rows, "Tasks", 1200) * 0.11)), delta: `+${seeded(`pr1:${signals.prompt}`, 4, 24)}` },
      { label: "On schedule", value: `${seeded(`pr2:${signals.prompt}`, 71, 95)}%`, delta: `+${seeded(`pr3:${signals.prompt}`, 1, 6)} pts` },
      { label: "Hours logged", value: withCommas(Math.round(rowCount(rows, "Timesheets", 2000) * 1.4)) },
    ],
  },
  helpdesk: {
    label: "helpdesk",
    noun: "Helpdesk",
    defaultQualifier: "Support",
    purpose: "capture every request, route it and answer within SLA",
    tables: ["tickets", "customers", "teamMembers", "slaPolicies", "messages"],
    capabilities: [CAP.email, CAP.notifications, CAP.chat, CAP.analytics, CAP.search, CAP.chatbots],
    roles: [
      { name: "Support lead", permissions: ["Assign tickets", "Edit SLAs", "View all reports"] },
      { name: "Agent", permissions: ["Answer tickets", "Escalate", "Add macros"] },
      { name: "Customer", permissions: ["Raise a ticket", "View own tickets"] },
    ],
    extraScreens: () => [
      screen("Queue", "board", "Tickets"),
      screen("Ticket detail", "detail", "Tickets"),
      screen("New ticket", "form", "Tickets"),
      screen("Settings", "settings"),
    ],
    stats: (rows, signals) => [
      { label: "Open tickets", value: withCommas(Math.round(rowCount(rows, "Tickets", 1400) * 0.05)), delta: `-${seeded(`h1:${signals.prompt}`, 2, 15)}%` },
      { label: "First response", value: `${seeded(`h2:${signals.prompt}`, 8, 54)}m`, delta: `-${seeded(`h3:${signals.prompt}`, 2, 12)}m` },
      { label: "SLA met", value: `${seeded(`h4:${signals.prompt}`, 89, 99)}%` },
      { label: "CSAT", value: `${(seeded(`h5:${signals.prompt}`, 40, 49) / 10).toFixed(1)}/5` },
    ],
  },
  invoicing: {
    label: "invoicing app",
    noun: "Invoicing",
    defaultQualifier: "Billing",
    purpose: "raise quotes, send invoices and chase what is owed",
    tables: ["customers", "quotes", "invoices", "payments", "expenses"],
    capabilities: [CAP.payments, CAP.email, CAP.notifications, CAP.files, CAP.scheduled, CAP.analytics],
    roles: [
      { name: "Finance", permissions: ["Issue invoices", "Record payments", "Write off debt"] },
      { name: "Sales", permissions: ["Create quotes", "Convert to invoice"] },
      { name: "Customer", permissions: ["View invoices", "Pay online"] },
    ],
    extraScreens: () => [
      screen("Aged debt", "table", "Invoices"),
      screen("New invoice", "form", "Invoices"),
      screen("Invoice detail", "detail", "Invoices"),
      screen("Settings", "settings"),
    ],
    stats: (rows, signals) => [
      { label: "Outstanding", value: `$${compact(rowCount(rows, "Invoices", 700) * seeded(`i1:${signals.prompt}`, 180, 520))}`, delta: `-${seeded(`i2:${signals.prompt}`, 3, 18)}%` },
      { label: "Paid this month", value: `$${compact(rowCount(rows, "Payments", 600) * seeded(`i3:${signals.prompt}`, 220, 640))}`, delta: `+${seeded(`i4:${signals.prompt}`, 4, 22)}%` },
      { label: "Overdue", value: withCommas(Math.round(rowCount(rows, "Invoices", 700) * 0.08)) },
      { label: "Avg days to pay", value: `${seeded(`i5:${signals.prompt}`, 11, 42)}` },
    ],
  },
  fieldservice: {
    label: "field service app",
    noun: "Field Service",
    defaultQualifier: "Field",
    purpose: "schedule jobs, dispatch crews and capture proof on site",
    tables: ["jobs", "customers", "technicians", "workOrders", "inspections", "vehicles"],
    capabilities: [CAP.mobile, CAP.notifications, CAP.files, CAP.scheduled, CAP.storage, CAP.email],
    roles: [
      { name: "Dispatcher", permissions: ["Schedule jobs", "Assign crews", "Reorder routes"] },
      { name: "Technician", permissions: ["View own jobs", "Complete work orders", "Capture photos and signatures"] },
      { name: "Customer", permissions: ["Track job status", "Approve quotes"] },
    ],
    extraScreens: () => [
      screen("Dispatch board", "board", "Jobs"),
      screen("Today's route", "table", "Jobs"),
      screen("Job card", "detail", "Jobs"),
      screen("Complete a work order", "form", "Work orders"),
      screen("Settings", "settings"),
    ],
    stats: (rows, signals) => [
      { label: "Jobs scheduled", value: withCommas(Math.max(4, Math.round(rowCount(rows, "Jobs", 1000) * 0.04))), delta: `+${seeded(`f1:${signals.prompt}`, 3, 17)}` },
      { label: "First-time fix", value: `${seeded(`f2:${signals.prompt}`, 78, 96)}%`, delta: `+${seeded(`f3:${signals.prompt}`, 1, 6)} pts` },
      { label: "Crews out", value: withCommas(Math.max(1, Math.round(rowCount(rows, "Technicians", 12) * 0.8))) },
      { label: "Unassigned", value: withCommas(seeded(`f4:${signals.prompt}`, 0, 12)) },
    ],
  },
  lms: {
    label: "learning platform",
    noun: "Academy",
    defaultQualifier: "Training",
    purpose: "publish courses, enrol people and track completion",
    tables: ["courses", "lessons", "learners", "enrolments", "documents"],
    capabilities: [CAP.email, CAP.notifications, CAP.storage, CAP.files, CAP.analytics, CAP.search],
    roles: [
      { name: "Trainer", permissions: ["Publish courses", "Grade quizzes", "Enrol learners"] },
      { name: "Manager", permissions: ["View team progress", "Assign training"] },
      { name: "Learner", permissions: ["Take courses", "View certificates"] },
    ],
    extraScreens: () => [
      screen("Course catalogue", "table", "Courses"),
      screen("Course detail", "detail", "Courses"),
      screen("Create a lesson", "form", "Lessons"),
      screen("Settings", "settings"),
    ],
    stats: (rows, signals) => [
      { label: "Active learners", value: withCommas(rowCount(rows, "Learners", 400)), delta: `+${seeded(`l1:${signals.prompt}`, 4, 23)}%` },
      { label: "Courses live", value: withCommas(rowCount(rows, "Courses", 20)) },
      { label: "Completion", value: `${seeded(`l2:${signals.prompt}`, 58, 91)}%`, delta: `+${seeded(`l3:${signals.prompt}`, 2, 9)} pts` },
      { label: "Avg score", value: `${seeded(`l4:${signals.prompt}`, 68, 94)}%` },
    ],
  },
  events: {
    label: "events platform",
    noun: "Events",
    defaultQualifier: "Event",
    purpose: "sell tickets, manage registrations and check people in",
    tables: ["events", "attendees", "payments", "locations", "notifications"],
    capabilities: [CAP.payments, CAP.email, CAP.notifications, CAP.mobile, CAP.seo, CAP.branding],
    roles: [
      { name: "Organiser", permissions: ["Create events", "Set pricing", "Refund tickets"] },
      { name: "Door staff", permissions: ["Scan tickets", "Check attendees in"] },
      { name: "Attendee", permissions: ["Buy tickets", "View own tickets"] },
    ],
    extraScreens: () => [
      screen("Event detail", "detail", "Events"),
      screen("Check-in", "table", "Attendees"),
      screen("Create an event", "form", "Events"),
      screen("Settings", "settings"),
    ],
    stats: (rows, signals) => [
      { label: "Tickets sold", value: withCommas(rowCount(rows, "Attendees", 2000)), delta: `+${seeded(`e1:${signals.prompt}`, 6, 31)}%` },
      { label: "Revenue", value: `$${compact(rowCount(rows, "Attendees", 2000) * seeded(`e2:${signals.prompt}`, 28, 120))}` },
      { label: "Upcoming events", value: withCommas(Math.max(1, Math.round(rowCount(rows, "Events", 30) * 0.3))) },
      { label: "Checked in", value: `${seeded(`e3:${signals.prompt}`, 74, 96)}%` },
    ],
  },
  realestate: {
    label: "property system",
    noun: "Properties",
    defaultQualifier: "Property",
    purpose: "manage listings, viewings, offers and tenancies",
    tables: ["properties", "contacts", "viewings", "leases", "documents"],
    capabilities: [CAP.email, CAP.notifications, CAP.storage, CAP.seo, CAP.files, CAP.search],
    roles: [
      { name: "Agent", permissions: ["Manage listings", "Book viewings", "Record offers"] },
      { name: "Landlord", permissions: ["View own properties", "See statements"] },
      { name: "Applicant", permissions: ["Request a viewing", "Submit an offer"] },
    ],
    extraScreens: () => [
      screen("Listings", "table", "Properties"),
      screen("Property detail", "detail", "Properties"),
      screen("Book a viewing", "form", "Viewings"),
      screen("Settings", "settings"),
    ],
    stats: (rows, signals) => [
      { label: "Live listings", value: withCommas(Math.round(rowCount(rows, "Properties", 200) * 0.42)) },
      { label: "Viewings this week", value: withCommas(Math.max(3, Math.round(rowCount(rows, "Viewings", 900) * 0.03))), delta: `+${seeded(`r1:${signals.prompt}`, 2, 14)}` },
      { label: "Under offer", value: withCommas(Math.round(rowCount(rows, "Properties", 200) * 0.11)) },
      { label: "Avg days to let", value: `${seeded(`r2:${signals.prompt}`, 9, 38)}` },
    ],
  },
  restaurant: {
    label: "restaurant system",
    noun: "Restaurant",
    defaultQualifier: "Restaurant",
    purpose: "take reservations, run the menu and see covers at a glance",
    tables: ["reservations", "menuItems", "orders", "customers", "shifts"],
    capabilities: [CAP.payments, CAP.notifications, CAP.email, CAP.mobile, CAP.cms, CAP.branding],
    roles: [
      { name: "Manager", permissions: ["Edit menu", "See covers", "Manage staff"] },
      { name: "Front of house", permissions: ["Take reservations", "Seat guests"] },
      { name: "Guest", permissions: ["Book a table", "View menu"] },
    ],
    extraScreens: () => [
      screen("Tonight's covers", "table", "Reservations"),
      screen("Menu", "table", "Menu items"),
      screen("Take a booking", "form", "Reservations"),
      screen("Settings", "settings"),
    ],
    stats: (rows, signals) => [
      { label: "Covers tonight", value: withCommas(Math.max(8, Math.round(rowCount(rows, "Reservations", 1100) * 0.05))), delta: `+${seeded(`rs1:${signals.prompt}`, 3, 19)}%` },
      { label: "Tables booked", value: `${seeded(`rs2:${signals.prompt}`, 58, 96)}%` },
      { label: "Avg spend", value: `$${seeded(`rs3:${signals.prompt}`, 24, 88)}` },
      { label: "No-shows", value: `${seeded(`rs4:${signals.prompt}`, 1, 8)}%`, delta: `-${seeded(`rs5:${signals.prompt}`, 1, 3)} pts` },
    ],
  },
  clinic: {
    label: "practice app",
    noun: "Practice",
    defaultQualifier: "Practice",
    purpose: "book appointments, keep client records and take payment",
    tables: ["clients", "appointments", "services", "payments", "documents"],
    capabilities: [CAP.payments, CAP.notifications, CAP.email, CAP.security, CAP.scheduled, CAP.recurring],
    roles: [
      { name: "Practitioner", permissions: ["View own diary", "Write notes", "Complete visits"] },
      { name: "Reception", permissions: ["Book appointments", "Take payment", "Manage clients"] },
      { name: "Client", permissions: ["Book online", "View own visits", "Pay"] },
    ],
    extraScreens: () => [
      screen("Diary", "board", "Appointments"),
      screen("Client record", "detail", "Clients"),
      screen("Book an appointment", "form", "Appointments"),
      screen("Settings", "settings"),
    ],
    stats: (rows, signals) => [
      { label: "Appointments today", value: withCommas(Math.max(4, Math.round(rowCount(rows, "Appointments", 1600) * 0.02))) },
      { label: "Active clients", value: withCommas(rowCount(rows, "Clients", 500)), delta: `+${seeded(`c1:${signals.prompt}`, 2, 13)}%` },
      { label: "Diary filled", value: `${seeded(`c2:${signals.prompt}`, 64, 94)}%` },
      { label: "Outstanding", value: `$${compact(rowCount(rows, "Payments", 400) * seeded(`c3:${signals.prompt}`, 20, 90))}` },
    ],
  },
  seosite: {
    label: "SEO site",
    noun: "Site",
    defaultQualifier: "Marketing",
    purpose: "publish a page for every service and place you cover, and capture the leads",
    tables: ["pages", "locations", "posts", "leads", "reviews"],
    capabilities: [CAP.seo, CAP.cms, CAP.domains, CAP.branding, CAP.analytics, CAP.email, CAP.search],
    roles: [
      { name: "Marketer", permissions: ["Publish pages", "Edit SEO metadata", "View analytics"] },
      { name: "Editor", permissions: ["Draft posts", "Upload media"] },
      { name: "Sales", permissions: ["View leads", "Update lead status"] },
    ],
    extraScreens: () => [
      screen("Pages", "table", "Pages"),
      screen("Page editor", "form", "Pages"),
      screen("Leads", "table", "Leads"),
      screen("Settings", "settings"),
    ],
    stats: (rows, signals) => [
      { label: "Pages live", value: withCommas(rowCount(rows, "Pages", 300)), delta: `+${seeded(`se1:${signals.prompt}`, 8, 60)}` },
      { label: "Monthly visits", value: compact(rowCount(rows, "Pages", 300) * seeded(`se2:${signals.prompt}`, 18, 90)), delta: `+${seeded(`se3:${signals.prompt}`, 12, 74)}%` },
      { label: "Leads 30d", value: withCommas(Math.round(rowCount(rows, "Leads", 900) * 0.09)), delta: `+${seeded(`se4:${signals.prompt}`, 5, 33)}%` },
      { label: "Keywords ranking", value: withCommas(seeded(`se5:${signals.prompt}`, 120, 940)) },
    ],
  },
  generic: {
    label: "business app",
    noun: "App",
    defaultQualifier: "Business",
    purpose: "keep the records, screens and permissions your team needs in one place",
    tables: ["customers", "tasks", "teamMembers", "documents"],
    capabilities: [CAP.email, CAP.notifications, CAP.search, CAP.analytics],
    roles: [
      { name: "Owner", permissions: ["Full access", "Manage users", "Publish changes"] },
      { name: "Editor", permissions: ["Create and edit records", "Upload files"] },
      { name: "Viewer", permissions: ["Read only", "Export CSV"] },
    ],
    extraScreens: () => [
      screen("Records", "table", "Customers"),
      screen("New record", "form", "Customers"),
      screen("Record detail", "detail", "Customers"),
      screen("Settings", "settings"),
    ],
    stats: (rows, signals) => [
      { label: "Records", value: withCommas(Object.values(rows).reduce((a, b) => a + b, 0)) },
      { label: "Active users", value: withCommas(Math.max(1, signals.seats)) },
      { label: "Updated today", value: withCommas(seeded(`g1:${signals.prompt}`, 4, 60)) },
      { label: "Open items", value: withCommas(seeded(`g2:${signals.prompt}`, 3, 48)) },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Feature modules layered on top of the blueprint                     */
/* ------------------------------------------------------------------ */

interface FeatureModule {
  tables: string[];
  capabilities: string[];
  screens: (signals: PromptSignals) => ScreenSpec[];
  /** Roles the feature introduces if not already present. */
  roles?: { name: string; permissions: string[] }[];
  /** Used in the assistant reply and the build plan. */
  summary: string;
}

const FEATURE_MODULES: Record<FeatureKey, FeatureModule> = {
  payments: {
    tables: ["payments"],
    capabilities: [CAP.payments, CAP.security],
    screens: () => [screen("Payments", "table", "Payments"), screen("Take a payment", "form", "Payments")],
    summary: "card payments with receipts and reconciliation",
  },
  invoicing: {
    tables: ["invoices"],
    capabilities: [CAP.payments, CAP.email],
    screens: () => [screen("Invoices", "table", "Invoices"), screen("New invoice", "form", "Invoices")],
    summary: "invoicing with due dates and overdue chasing",
  },
  scheduling: {
    tables: ["bookings"],
    capabilities: [CAP.scheduled, CAP.recurring, CAP.notifications],
    screens: () => [screen("Calendar", "board", "Bookings")],
    summary: "a calendar with availability and reminders",
  },
  notifications: {
    tables: ["notifications"],
    capabilities: [CAP.notifications, CAP.email],
    screens: () => [screen("Notification log", "table", "Notifications")],
    summary: "email and SMS notifications",
  },
  email: {
    tables: [],
    capabilities: [CAP.email],
    screens: () => [],
    summary: "transactional email",
  },
  mobile: {
    tables: [],
    capabilities: [CAP.mobile, CAP.storage],
    screens: () => [screen("Mobile home", "dashboard")],
    summary: "a mobile layout that works offline in the field",
  },
  portal: {
    tables: ["messages"],
    capabilities: [CAP.security, CAP.chat],
    screens: () => [screen("Customer portal", "dashboard"), screen("Portal messages", "table", "Messages")],
    roles: [{ name: "Customer", permissions: ["View own records", "Send messages", "Upload files"] }],
    summary: "a customer-facing portal with its own login",
  },
  reports: {
    tables: ["reports"],
    capabilities: [CAP.analytics, CAP.scheduled],
    screens: () => [screen("Reports", "table", "Saved reports"), screen("Report builder", "form", "Saved reports")],
    summary: "saved reports you can schedule and export",
  },
  documents: {
    tables: ["documents"],
    capabilities: [CAP.files, CAP.storage],
    screens: () => [screen("Documents", "table", "Documents")],
    summary: "document storage with sharing controls",
  },
  chat: {
    tables: ["messages"],
    capabilities: [CAP.chat, CAP.realtime],
    screens: () => [screen("Inbox", "table", "Messages")],
    summary: "threaded messaging",
  },
  search: {
    tables: [],
    capabilities: [CAP.search],
    screens: () => [],
    summary: "full-text search across every table",
  },
  seo: {
    tables: ["pages"],
    capabilities: [CAP.seo, CAP.cms, CAP.domains],
    screens: () => [screen("Pages", "table", "Pages")],
    summary: "SEO pages with metadata and sitemaps",
  },
  inventory: {
    tables: ["products", "inventory"],
    capabilities: [CAP.analytics, CAP.notifications],
    screens: () => [screen("Stock levels", "table", "Stock levels")],
    summary: "stock tracking with reorder alerts",
  },
  timeTracking: {
    tables: ["timesheets"],
    capabilities: [CAP.analytics],
    screens: () => [screen("Timesheets", "table", "Timesheets"), screen("Log hours", "form", "Timesheets")],
    summary: "time tracking against jobs for payroll and billing",
  },
  approvals: {
    tables: [],
    capabilities: [CAP.roles, CAP.notifications, CAP.audits],
    screens: () => [screen("Approvals", "board")],
    roles: [{ name: "Approver", permissions: ["Approve or decline requests", "View audit trail"] }],
    summary: "an approval queue with a full audit trail",
  },
  audits: {
    tables: ["auditLog"],
    capabilities: [CAP.audits, CAP.security, CAP.versionControl],
    screens: () => [screen("Audit log", "table", "Audit log")],
    summary: "an audit log of every change",
  },
  ai: {
    tables: [],
    capabilities: [CAP.aiText, CAP.chatbots, CAP.aiGateway],
    screens: () => [screen("AI assistant", "dashboard")],
    summary: "AI summaries and a built-in assistant",
  },
  i18n: {
    tables: [],
    capabilities: [CAP.i18n],
    screens: () => [],
    summary: "multi-language support",
  },
  subscriptions: {
    tables: ["subscriptions"],
    capabilities: [CAP.payments, CAP.recurring],
    screens: () => [screen("Subscriptions", "table", "Subscriptions")],
    summary: "recurring billing with renewals",
  },
  reviews: {
    tables: ["reviews"],
    capabilities: [CAP.email, CAP.notifications],
    screens: () => [screen("Reviews", "table", "Reviews")],
    summary: "review requests and ratings",
  },
  signatures: {
    tables: [],
    capabilities: [CAP.files, CAP.storage, CAP.mobile],
    screens: () => [screen("Proof of delivery", "form")],
    summary: "on-screen signature capture and proof of delivery",
  },
};

/* ------------------------------------------------------------------ */
/* Naming + summary                                                    */
/* ------------------------------------------------------------------ */

const STOP_WORDS = new Set([
  "build",
  "make",
  "create",
  "me",
  "a",
  "an",
  "the",
  "app",
  "application",
  "software",
  "system",
  "tool",
  "for",
  "my",
  "our",
  "that",
  "which",
  "with",
  "and",
  "to",
  "of",
  "in",
  "on",
  "so",
  "we",
  "can",
  "i",
  "it",
  "please",
  "some",
  "new",
]);

export function deriveTitle(prompt: string, signals?: PromptSignals): string {
  const sig = signals ?? analysePrompt(prompt);
  const explicit = prompt.match(/\b(?:called|named)\s+["“']?([A-Za-z0-9 &'-]{2,40})["”']?/);
  if (explicit?.[1]) return titleCase(explicit[1].trim()).slice(0, 48);

  const blueprint = BLUEPRINTS[sig.archetype];
  const qualifier = sig.qualifier ?? sig.industry ?? null;

  if (sig.archetype === "generic") {
    const words = sig.prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
      .slice(0, 3);
    const base = words.length > 0 ? titleCase(words.slice(0, 2).join(" ")) : "Business";
    return `${base} App`.slice(0, 48);
  }

  if (!qualifier) return `${blueprint.defaultQualifier} ${blueprint.noun}`.slice(0, 48);

  const q = qualifier.trim();
  // Avoid "Sales Sales CRM" style repeats.
  if (q.toLowerCase() === blueprint.noun.toLowerCase()) return `${blueprint.defaultQualifier} ${blueprint.noun}`;
  if (blueprint.noun.toLowerCase().includes(q.toLowerCase())) return blueprint.noun;
  return `${q} ${blueprint.noun}`.slice(0, 48);
}

function deriveSummary(signals: PromptSignals, tables: TableSpec[], screens: ScreenSpec[], title: string): string {
  const blueprint = BLUEPRINTS[signals.archetype];
  const who = signals.qualifier
    ? `the ${signals.qualifier.toLowerCase()} team`
    : signals.industry
      ? `a ${signals.industry.toLowerCase()} business`
      : "your team";
  const headline = `${title} is a ${blueprint.label} built to ${blueprint.purpose} for ${who}.`;
  const core = tables.slice(0, 4).map((t) => t.name.toLowerCase());
  const detail = `It carries ${tables.length} tables (${list(core)}), ${screens.length} screens including a live dashboard, and ${
    signals.seats
  } seats of role-based access.`;
  const extras = signals.features
    .filter((f) => FEATURE_MODULES[f].summary.length > 0)
    .slice(0, 3)
    .map((f) => FEATURE_MODULES[f].summary);
  const tail = extras.length > 0 ? ` Also wired up: ${list(extras)}.` : "";
  return `${headline} ${detail}${tail}`;
}

/* ------------------------------------------------------------------ */
/* Spec generation                                                     */
/* ------------------------------------------------------------------ */

function dedupeScreens(screens: ScreenSpec[]): ScreenSpec[] {
  const seen = new Set<string>();
  const out: ScreenSpec[] = [];
  for (const s of screens) {
    const key = s.id || s.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function dedupeRoles(
  roles: { name: string; permissions: string[] }[]
): { name: string; permissions: string[] }[] {
  const seen = new Set<string>();
  const out: { name: string; permissions: string[] }[] = [];
  for (const role of roles) {
    const key = role.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name: role.name, permissions: [...role.permissions] });
  }
  return out;
}

/** Turn a plain-language prompt into a complete application spec. */
export function generateSpec(prompt: string): AppSpec {
  const signals = analysePrompt(prompt);
  const blueprint = BLUEPRINTS[signals.archetype];

  // 1. Tables: blueprint core, then feature modules, then nouns from the prompt.
  const tableKeys: string[] = [...blueprint.tables];
  for (const feature of signals.features) tableKeys.push(...FEATURE_MODULES[feature].tables);
  for (const entity of signals.entities) tableKeys.push(entity);
  const tables = tablesFor(unique(tableKeys), signals);

  // Anything relations point at should exist, so the model is not dangling.
  const names = new Set(tables.map((t) => t.name));
  if (!names.has("Team members") && tables.some((t) => t.fields.some((f) => f.relation === "Team members"))) {
    const team = entityTable("teamMembers", signals);
    if (team) tables.push(team);
  }

  const rows = rowsOf(tables);

  // 2. Screens: dashboard, a list per table, blueprint extras, feature screens.
  const dashboard = screen(
    `${blueprint.noun === "Dashboard" ? "Operations" : blueprint.noun} dashboard`,
    "dashboard",
    tables[0]?.name,
    blueprint.stats(rows, signals)
  );
  const listScreens = tables.map((t) => screen(t.name, "table", t.name));
  const featureScreens = signals.features.flatMap((f) => FEATURE_MODULES[f].screens(signals));
  const screens = dedupeScreens([
    dashboard,
    ...listScreens,
    ...blueprint.extraScreens(signals),
    ...featureScreens,
  ]).filter((s) => !s.table || names.has(s.table) || s.table === undefined);

  // 3. Roles.
  const roles = dedupeRoles([
    ...blueprint.roles,
    ...signals.features.flatMap((f) => FEATURE_MODULES[f].roles ?? []),
  ]);

  // 4. Capabilities.
  const capabilities = unique([
    ...BASE_CAPABILITIES,
    ...blueprint.capabilities,
    ...signals.features.flatMap((f) => FEATURE_MODULES[f].capabilities),
    ...(signals.kind === "mobile" ? [CAP.mobile] : []),
    ...(signals.kind === "marketing" ? [CAP.seo, CAP.cms, CAP.domains] : []),
    ...(signals.kind === "customer" ? [CAP.security, CAP.email] : []),
  ]);

  const title = deriveTitle(prompt, signals);
  return {
    title,
    summary: deriveSummary(signals, tables, screens, title),
    capabilities,
    tables,
    screens,
    roles,
  };
}

/** The ProjectKind the prompt implies - internal, customer, marketing or mobile. */
export function deriveProjectKind(prompt: string): ProjectKind {
  return analysePrompt(prompt).kind;
}

/** Human-readable archetype label, handy for logs and tests. */
export function describeArchetype(prompt: string): string {
  return BLUEPRINTS[analysePrompt(prompt).archetype].label;
}

/* ------------------------------------------------------------------ */
/* Build plan                                                          */
/* ------------------------------------------------------------------ */

function step(verb: BuildStep["verb"], subject: string, index: number): BuildStep {
  return {
    id: `${index + 1}-${slugify(`${verb} ${subject}`) || "step"}`,
    verb,
    subject,
    status: "pending",
  };
}

/**
 * A believable, ordered plan derived from the spec: the data model first, then
 * the screens, then access control, integrations and publishing.
 */
export function planBuildSteps(prompt: string, spec: AppSpec): BuildStep[] {
  const signals = analysePrompt(prompt);
  const subjects: [BuildStep["verb"], string][] = [];

  subjects.push(["Planning", spec.title ? `${spec.title.toLowerCase()} data model` : "your app"]);

  // Tables, announced in pairs so the list reads like a person talking.
  const tableNames = spec.tables.map((t) => t.name.toLowerCase());
  for (let i = 0; i < tableNames.length; i += 2) {
    const pair = tableNames.slice(i, i + 2);
    subjects.push(["Created", list(pair)]);
  }

  // Screens, grouped by kind.
  const dashboards = spec.screens.filter((s) => s.kind === "dashboard");
  if (dashboards.length > 0) {
    const stats = dashboards[0]?.stats?.length ?? 0;
    subjects.push(["Built", stats > 0 ? `the dashboard with ${stats} live tiles` : "the dashboard"]);
  }
  const boards = spec.screens.filter((s) => s.kind === "board");
  for (const board of boards) subjects.push(["Built", `the ${board.name.toLowerCase()} view`]);
  const sections = spec.screens.filter((s) => s.kind === "table" && s.table);
  const headline = sections.slice(0, 3);
  for (const section of headline) subjects.push(["Built", `${section.name.toLowerCase()} section`]);
  if (sections.length > headline.length) {
    subjects.push(["Built", `${sections.length - headline.length} more list screens`]);
  }
  const forms = spec.screens.filter((s) => s.kind === "form");
  if (forms.length > 0) subjects.push(["Added", `${forms.length} data entry ${forms.length === 1 ? "form" : "forms"}`]);

  // Access control.
  if (spec.roles.length > 0) {
    subjects.push(["Added", `role based access control for ${list(spec.roles.map((r) => r.name.toLowerCase()))}`]);
  }

  // Integrations, from the capabilities the spec actually asked for.
  const caps = new Set(spec.capabilities);
  if (caps.has(CAP.email) || caps.has(CAP.notifications)) subjects.push(["Connected", "email notifications"]);
  if (caps.has(CAP.payments)) subjects.push(["Connected", "payments and receipts"]);
  if (caps.has(CAP.storage) || caps.has(CAP.files)) subjects.push(["Connected", "file storage"]);
  if (caps.has(CAP.search)) subjects.push(["Added", "full text search"]);
  if (caps.has(CAP.analytics)) subjects.push(["Added", "analytics and saved reports"]);
  if (caps.has(CAP.audits)) subjects.push(["Added", "an audit trail"]);
  if (caps.has(CAP.seo)) subjects.push(["Added", "SEO metadata and a sitemap"]);
  if (caps.has(CAP.mobile) || signals.kind === "mobile") subjects.push(["Built", "the mobile layout"]);
  if (caps.has(CAP.aiText) || caps.has(CAP.chatbots)) subjects.push(["Connected", "the AI assistant"]);

  subjects.push(["Added", "seed data so the app is not empty"]);
  subjects.push(["Published", signals.kind === "mobile" ? "to web and mobile" : "to hercules.app"]);

  return subjects.map(([verb, subject], index) => step(verb, subject, index));
}

/* ------------------------------------------------------------------ */
/* Follow-up chat: mutating an existing spec                           */
/* ------------------------------------------------------------------ */

interface Change {
  kind: "table" | "screen" | "role" | "capability" | "rename" | "remove" | "tune";
  label: string;
  /** Sentence fragment used in the assistant's reply. */
  phrase: string;
  verb: BuildStep["verb"];
}

function cloneSpec(spec: AppSpec): AppSpec {
  return {
    title: spec.title,
    summary: spec.summary,
    capabilities: [...spec.capabilities],
    tables: spec.tables.map((t) => ({ ...t, fields: t.fields.map((f) => ({ ...f })) })),
    screens: spec.screens.map((s) => ({
      ...s,
      ...(s.stats ? { stats: s.stats.map((stat) => ({ ...stat })) } : {}),
    })),
    roles: spec.roles.map((r) => ({ name: r.name, permissions: [...r.permissions] })),
  };
}

function hasTable(spec: AppSpec, name: string): boolean {
  return spec.tables.some((t) => t.name.toLowerCase() === name.toLowerCase());
}

function hasScreen(spec: AppSpec, name: string): boolean {
  const id = slugify(name);
  return spec.screens.some((s) => s.id === id || s.name.toLowerCase() === name.toLowerCase());
}

function addCapability(spec: AppSpec, capability: string, changes: Change[]): void {
  if (spec.capabilities.includes(capability)) return;
  spec.capabilities.push(capability);
  changes.push({
    kind: "capability",
    label: capability,
    phrase: `switched on ${capability.toLowerCase()}`,
    verb: "Connected",
  });
}

function addTableByKey(spec: AppSpec, key: string, signals: PromptSignals, changes: Change[]): void {
  const table = entityTable(key, signals);
  if (!table || hasTable(spec, table.name)) return;
  spec.tables.push(table);
  changes.push({
    kind: "table",
    label: table.name,
    phrase: `added a ${table.name.toLowerCase()} table with ${table.fields.length} fields`,
    verb: "Created",
  });
  if (!hasScreen(spec, table.name)) {
    spec.screens.push(screen(table.name, "table", table.name));
    changes.push({
      kind: "screen",
      label: table.name,
      phrase: `a list screen for ${table.name.toLowerCase()}`,
      verb: "Built",
    });
  }
}

function addScreen(spec: AppSpec, next: ScreenSpec, changes: Change[]): void {
  if (hasScreen(spec, next.name)) return;
  spec.screens.push(next);
  changes.push({
    kind: "screen",
    label: next.name,
    phrase: `built a ${next.name.toLowerCase()} ${next.kind === "dashboard" ? "dashboard" : next.kind === "board" ? "board" : "screen"}`,
    verb: "Built",
  });
}

function addRole(spec: AppSpec, name: string, permissions: string[], changes: Change[]): void {
  const clean = titleCase(name.trim());
  if (!clean) return;
  if (spec.roles.some((r) => r.name.toLowerCase() === clean.toLowerCase())) return;
  spec.roles.push({ name: clean, permissions });
  changes.push({
    kind: "role",
    label: clean,
    phrase: `created a ${clean.toLowerCase()} role`,
    verb: "Added",
  });
}

const SCREEN_KIND_WORDS: [RegExp, ScreenSpec["kind"]][] = [
  [/\bdashboard\b|\boverview\b|\bhome\b/, "dashboard"],
  [/\bboard\b|\bkanban\b|\bpipeline\b|\bcalendar\b|\bdiary\b|\btimeline\b/, "board"],
  [/\bform\b|\bwizard\b|\bintake\b|\bsubmit\b|\brequest\b/, "form"],
  [/\bdetail\b|\bprofile\b|\brecord\b|\bcard\b/, "detail"],
  [/\bsettings?\b|\bpreferences\b|\bconfig/, "settings"],
];

function screenKindFor(phrase: string): ScreenSpec["kind"] {
  for (const [pattern, kind] of SCREEN_KIND_WORDS) {
    if (pattern.test(phrase)) return kind;
  }
  return "table";
}

function cleanupPhrase(value: string): string {
  return value
    .replace(/^(?:a|an|the|some|new)\s+/i, "")
    .replace(/\b(?:page|screen|view|tab|section)\b/gi, "")
    .replace(/[.!?,]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function matchEntityKey(phrase: string): string | null {
  const lower = phrase.toLowerCase().trim();
  if (ENTITY_ALIASES[lower]) return ENTITY_ALIASES[lower] ?? null;
  const words = lower.split(/\s+/);
  for (let size = Math.min(3, words.length); size >= 1; size -= 1) {
    for (let i = 0; i + size <= words.length; i += 1) {
      const candidate = words.slice(i, i + size).join(" ");
      const key = ENTITY_ALIASES[candidate];
      if (key) return key;
    }
  }
  return null;
}

function retuneDashboard(spec: AppSpec): void {
  const dashboard = spec.screens.find((s) => s.kind === "dashboard" && s.stats && s.stats.length > 0);
  if (!dashboard?.stats) return;
  const biggest = [...spec.tables].sort((a, b) => b.rowCount - a.rowCount)[0];
  if (!biggest) return;
  const label = `${biggest.name} tracked`;
  if (dashboard.stats.some((s) => s.label === label)) return;
  dashboard.stats = [
    ...dashboard.stats.slice(0, 3),
    { label, value: withCommas(biggest.rowCount), delta: `+${seeded(`tune:${biggest.name}`, 2, 18)}%` },
  ];
}

const REPLY_OPENERS = [
  "Done",
  "All set",
  "That's live",
  "Shipped",
];

/**
 * Apply a follow-up chat message to an existing spec.
 *
 * Returns a brand new spec (the input is never mutated), a build plan for the
 * change, and a natural-language reply describing exactly what happened.
 */
export function applyFollowUp(
  spec: AppSpec,
  message: string
): { spec: AppSpec; steps: BuildStep[]; reply: string } {
  const next = cloneSpec(spec);
  const raw = message.trim();
  const lower = raw.toLowerCase();
  const signals = analysePrompt(`${spec.title} ${raw}`);
  const changes: Change[] = [];

  /* -- rename ---------------------------------------------------- */
  const rename = raw.match(
    /\b(?:rename|call|name)\s+(?:it|this|the app|the project)\s+(?:to\s+)?["“']?([A-Za-z0-9 &'-]{2,48})["”']?/i
  );
  if (rename?.[1]) {
    const title = titleCase(rename[1].trim());
    next.title = title;
    next.summary = next.summary.replace(spec.title, title);
    changes.push({ kind: "rename", label: title, phrase: `renamed the app to ${title}`, verb: "Added" });
  }

  /* -- remove ---------------------------------------------------- */
  const remove = raw.match(/\b(?:remove|delete|drop|get rid of)\s+(?:the\s+)?([a-z0-9 '-]{2,40})/i);
  if (remove?.[1]) {
    const target = cleanupPhrase(remove[1]).toLowerCase();
    const screenIndex = next.screens.findIndex(
      (s) => s.name.toLowerCase() === target || s.id === slugify(target)
    );
    if (screenIndex >= 0) {
      const [dropped] = next.screens.splice(screenIndex, 1);
      if (dropped) {
        changes.push({
          kind: "remove",
          label: dropped.name,
          phrase: `removed the ${dropped.name.toLowerCase()} screen`,
          verb: "Built",
        });
      }
    } else {
      const tableIndex = next.tables.findIndex((t) => t.name.toLowerCase() === target);
      if (tableIndex >= 0) {
        const [dropped] = next.tables.splice(tableIndex, 1);
        if (dropped) {
          next.screens = next.screens.filter((s) => s.table !== dropped.name);
          changes.push({
            kind: "remove",
            label: dropped.name,
            phrase: `removed the ${dropped.name.toLowerCase()} table and its screens`,
            verb: "Built",
          });
        }
      }
    }
  }

  /* -- roles ----------------------------------------------------- */
  const roleMatch = raw.match(
    /\b(?:add|create|make|need)\s+(?:a\s+|an\s+)?(?:new\s+)?role\s+(?:for|called|named)?\s*["“']?([a-z0-9 '-]{2,32})["”']?/i
  );
  if (roleMatch?.[1]) {
    const name = cleanupPhrase(roleMatch[1]);
    addRole(next, singular(name), ["View assigned records", "Update own work", "Upload files"], changes);
  } else {
    const roleAlt = raw.match(/\brole\s+for\s+([a-z0-9 '-]{2,32})/i);
    if (roleAlt?.[1]) {
      addRole(next, singular(cleanupPhrase(roleAlt[1])), ["View assigned records", "Update own work"], changes);
    }
  }

  /* -- explicit screens ------------------------------------------ */
  const screenMatch = raw.match(
    /\b(?:add|build|create|make|want|need)\s+(?:a\s+|an\s+|the\s+)?([a-z0-9 '-]{2,40}?)\s+(page|screen|view|tab|board|dashboard|report)\b/i
  );
  if (screenMatch?.[1]) {
    const label = cleanupPhrase(screenMatch[1]);
    const word = (screenMatch[2] ?? "page").toLowerCase();
    const kind = screenKindFor(`${label} ${word}`);
    const entityKey = matchEntityKey(label);
    const linked = entityKey ? ENTITIES[entityKey]?.label : undefined;
    if (entityKey && linked && !hasTable(next, linked)) addTableByKey(next, entityKey, signals, changes);
    const name = titleCase(label) || titleCase(word);
    const built = screen(
      name,
      kind,
      linked && hasTable(next, linked) ? linked : undefined,
      kind === "dashboard"
        ? [
            { label: "This month", value: withCommas(seeded(`fm1:${name}`, 40, 980)), delta: `+${seeded(`fm2:${name}`, 2, 24)}%` },
            { label: "Last month", value: withCommas(seeded(`fm3:${name}`, 30, 900)) },
            { label: "Trend", value: `${seeded(`fm4:${name}`, 3, 40)}%`, delta: "up" },
          ]
        : undefined
    );
    addScreen(next, built, changes);
  }

  /* -- explicit tables ------------------------------------------- */
  const tableMatch = raw.match(
    /\b(?:add|track|store|keep|log|record|manage)\s+(?:a\s+|an\s+|the\s+)?(?:table\s+(?:for|of)\s+)?([a-z0-9 '-]{2,40})/i
  );
  if (tableMatch?.[1]) {
    const phrase = cleanupPhrase(tableMatch[1]);
    const key = matchEntityKey(phrase);
    if (key) {
      addTableByKey(next, key, signals, changes);
    } else if (
      changes.length === 0 &&
      /^(?:add|track|store|keep|log|record|manage)\b/i.test(raw) &&
      phrase.length >= 3 &&
      !/\b(role|page|screen|view|tab)\b/i.test(raw)
    ) {
      const improvised = improvisedTable(phrase, signals);
      if (!hasTable(next, improvised.name)) {
        next.tables.push(improvised);
        changes.push({
          kind: "table",
          label: improvised.name,
          phrase: `added a ${improvised.name.toLowerCase()} table with ${improvised.fields.length} fields`,
          verb: "Created",
        });
        addScreen(next, screen(improvised.name, "table", improvised.name), changes);
      }
    }
  }

  /* -- feature keywords ------------------------------------------ */
  for (const feature of detectFeatures(lower)) {
    const module = FEATURE_MODULES[feature];
    const before = changes.length;
    for (const key of module.tables) addTableByKey(next, key, signals, changes);
    for (const built of module.screens(signals)) addScreen(next, built, changes);
    for (const role of module.roles ?? []) addRole(next, role.name, role.permissions, changes);
    for (const capability of module.capabilities) addCapability(next, capability, changes);
    if (changes.length > before) {
      changes.push({
        kind: "tune",
        label: feature,
        phrase: module.summary,
        verb: "Connected",
      });
    }
  }

  /* -- nothing matched: still do something useful ---------------- */
  if (changes.length === 0) {
    const entityKey = matchEntityKey(lower);
    if (entityKey) {
      addTableByKey(next, entityKey, signals, changes);
    } else {
      retuneDashboard(next);
      changes.push({
        kind: "tune",
        label: "refinements",
        phrase: "re-tuned the dashboard tiles and tightened the layout",
        verb: "Built",
      });
    }
  }

  // Keep the summary honest about the app's current size.
  next.summary = next.summary
    .replace(/\b\d+ tables\b/, `${next.tables.length} tables`)
    .replace(/\b\d+ screens\b/, `${next.screens.length} screens`);

  retuneDashboard(next);

  /* -- build plan for this change -------------------------------- */
  const subjects: [BuildStep["verb"], string][] = [["Planning", "the change you asked for"]];
  const seenSubjects = new Set<string>();
  for (const change of changes) {
    const subject =
      change.kind === "table"
        ? `${change.label.toLowerCase()} table`
        : change.kind === "screen"
          ? `${change.label.toLowerCase()} screen`
          : change.kind === "role"
            ? `the ${change.label.toLowerCase()} role`
            : change.kind === "capability"
              ? change.label.toLowerCase()
              : change.kind === "rename"
                ? `the app name`
                : change.phrase;
    if (seenSubjects.has(subject)) continue;
    seenSubjects.add(subject);
    subjects.push([change.verb, subject]);
  }
  subjects.push(["Added", "regression checks on the data model"]);
  subjects.push(["Published", "version update"]);
  const steps = subjects.map(([verb, subject], index) => step(verb, subject, index));

  /* -- assistant reply ------------------------------------------- */
  const opener = REPLY_OPENERS[hash(raw) % REPLY_OPENERS.length] ?? "Done";
  const phrases = unique(changes.map((c) => c.phrase));
  const headline = `${opener} - I ${list(phrases.slice(0, 4))}.`;
  const stats = `${next.title} now has ${next.tables.length} tables, ${next.screens.length} screens and ${next.roles.length} roles.`;
  const closing =
    changes.some((c) => c.kind === "capability")
      ? "The new capability is live on your published app; nothing else changed."
      : changes.some((c) => c.kind === "remove")
        ? "Existing data was left untouched - you can restore it from version history."
        : "Everything is published and your existing data is untouched.";
  const reply = `${headline} ${stats} ${closing}`;

  return { spec: next, steps, reply };
}

/**
 * The reply the assistant gives on the very first build of a project.
 * Derived entirely from the spec so it always matches what was created.
 */
export function initialReply(spec: AppSpec): string {
  const tables = list(spec.tables.slice(0, 3).map((t) => t.name.toLowerCase()));
  const extra = spec.tables.length > 3 ? ` and ${spec.tables.length - 3} more` : "";
  const dashboard = spec.screens.find((s) => s.kind === "dashboard");
  const tiles = dashboard?.stats?.length ?? 0;
  return (
    `${spec.title} is live. I modelled ${tables}${extra}, then built ${spec.screens.length} screens ` +
    `around them${tiles > 0 ? `, starting with a dashboard carrying ${tiles} live tiles` : ""}. ` +
    `Access is split across ${spec.roles.length} roles (${list(spec.roles.map((r) => r.name.toLowerCase()))}), ` +
    `and ${spec.capabilities.length} platform capabilities are switched on including ${list(
      spec.capabilities.slice(0, 3)
    )}. Tell me what to change next - new screens, fields, roles or integrations.`
  );
}
