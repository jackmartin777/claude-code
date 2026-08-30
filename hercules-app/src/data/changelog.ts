/**
 * Release notes rendered on /changelog. Newest entry first.
 */

export type ChangeTag = "New" | "Improved" | "Fixed";

export type ChangelogEntry = {
  version: string;
  /** ISO date, rendered with `formatChangelogDate`. */
  date: string;
  title: string;
  summary: string;
  tags: ChangeTag[];
  items: { tag: ChangeTag; text: string }[];
};

export const changelog: ChangelogEntry[] = [
  {
    version: "3.12",
    date: "2026-08-18",
    title: "Plan before you build",
    summary:
      "Hercules now proposes a written plan for any change that touches more than one table, so you can correct the approach before a single credit is spent on code.",
    tags: ["New", "Improved"],
    items: [
      { tag: "New", text: "Structural changes open with a plan you can edit, approve or reject." },
      { tag: "New", text: "Plans list the tables, screens and permissions a change will touch." },
      { tag: "Improved", text: "Rejected plans cost a tenth of a credit instead of a full build." },
      { tag: "Improved", text: "The build log now links each step back to the plan item it came from." },
      { tag: "Fixed", text: "Long plans no longer collapse the preview pane on narrow screens." },
    ],
  },
  {
    version: "3.11",
    date: "2026-07-29",
    title: "Offline mode for mobile builds",
    summary:
      "Field apps can now work with no signal. Changes queue on the device and sync when it reconnects, with conflicts surfaced to a human instead of silently overwritten.",
    tags: ["New", "Fixed"],
    items: [
      { tag: "New", text: "Offline queueing for reads and writes on iOS and Android builds." },
      { tag: "New", text: "Conflict review screen for records edited in two places at once." },
      { tag: "New", text: "Photos captured offline upload in the background once signal returns." },
      { tag: "Improved", text: "Mobile builds are roughly 40% smaller after a dependency clean-up." },
      { tag: "Fixed", text: "Push notification permissions are now requested at first use, not launch." },
    ],
  },
  {
    version: "3.10",
    date: "2026-07-02",
    title: "MCP connections",
    summary:
      "Connect Hercules to your own tools and data over the Model Context Protocol, at build time, at runtime, or both.",
    tags: ["New"],
    items: [
      { tag: "New", text: "Add an MCP server by URL in Settings, then Connections." },
      { tag: "New", text: "Per-tool permissions, so a connection can be granted read access only." },
      { tag: "New", text: "MCP calls made by a published app appear in the audit log." },
      { tag: "Improved", text: "Secrets can now be scoped to a single connection." },
    ],
  },
  {
    version: "3.9",
    date: "2026-06-11",
    title: "Roles and permissions, rebuilt",
    summary:
      "Row-level access is now enforced in the database rather than the interface, so exports, search and API responses obey the same rules as the screens.",
    tags: ["Improved", "Fixed"],
    items: [
      { tag: "Improved", text: "Row-level rules are compiled into database policies." },
      { tag: "Improved", text: "Field-level visibility can hide a column from a role entirely." },
      { tag: "New", text: "Role switcher in the preview shows the app as any role sees it." },
      { tag: "Fixed", text: "CSV export ignored row-level rules for workspace admins." },
      { tag: "Fixed", text: "Search results could reveal titles of records a viewer could not open." },
    ],
  },
  {
    version: "3.8",
    date: "2026-05-20",
    title: "Spend caps and usage breakdowns",
    summary:
      "See exactly where credits go and stop a project before it exceeds a budget you have not approved.",
    tags: ["New", "Improved"],
    items: [
      { tag: "New", text: "Per-project spend caps that pause building without affecting published apps." },
      { tag: "New", text: "Usage page broken down by project, by day and by category." },
      { tag: "New", text: "Email alert to owners and admins at 80% of the monthly allowance." },
      { tag: "Improved", text: "Small edits cost measurably less after a context-window rewrite." },
      { tag: "Improved", text: "Top-up credit packs no longer expire." },
    ],
  },
  {
    version: "3.7",
    date: "2026-04-28",
    title: "Skills",
    summary:
      "Package the standards your business reuses — document layouts, brand rules, approved wording — and every app you build inherits them.",
    tags: ["New"],
    items: [
      { tag: "New", text: "Workspace and project skills, with assets such as fonts and letterheads." },
      { tag: "New", text: "A starter library covering documents, spreadsheets, charts, SEO and email." },
      { tag: "New", text: "Admins can mark a workspace skill as required for new projects." },
      { tag: "Improved", text: "Generated PDFs now honour brand kit colours and typography." },
    ],
  },
  {
    version: "3.6",
    date: "2026-04-07",
    title: "Faster previews and safer migrations",
    summary:
      "The preview now updates while Hercules is still writing, and schema changes explain themselves before they run.",
    tags: ["Improved", "Fixed"],
    items: [
      { tag: "Improved", text: "Preview refreshes incrementally instead of reloading the whole app." },
      { tag: "Improved", text: "Median time from message to visible change is down to under nine seconds." },
      { tag: "New", text: "Destructive migrations show a summary and require confirmation." },
      { tag: "Fixed", text: "Renaming a field could orphan values in dependent computed fields." },
      { tag: "Fixed", text: "Rollback occasionally restored code without the matching schema." },
    ],
  },
  {
    version: "3.5",
    date: "2026-03-12",
    title: "Custom domains everywhere",
    summary:
      "Attach as many domains as you like to a project, with certificates issued automatically and a clearer path through DNS.",
    tags: ["New", "Improved"],
    items: [
      { tag: "New", text: "Multiple domains per app, with one marked primary." },
      { tag: "New", text: "Live DNS checker that names the exact record blocking issuance." },
      { tag: "Improved", text: "Certificate issuance now completes in under a minute in most cases." },
      { tag: "Improved", text: "www and root redirects are configurable per domain." },
      { tag: "Fixed", text: "CAA records at the zone apex are detected and explained." },
    ],
  },
];

export function formatChangelogDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
