/**
 * Documentation content for /docs. Each doc is a slug, some front matter and
 * an ordered list of blocks. Blocks render as a heading, prose paragraphs and
 * an optional list or code sample.
 */

export type DocBlock = {
  heading: string;
  paragraphs: string[];
  list?: string[];
  code?: { lang?: string; source: string };
};

export type Doc = {
  slug: string;
  title: string;
  description: string;
  /** Sidebar group. Must appear in `docSections`. */
  section: DocSection;
  readingTime: string;
  body: DocBlock[];
};

export type DocSection = "Get started" | "Build" | "Extend" | "Ship";

export const docSections: DocSection[] = ["Get started", "Build", "Extend", "Ship"];

export const docs: Doc[] = [
  {
    slug: "getting-started",
    title: "Getting started",
    description:
      "Go from a blank chat to a live app on your own domain in about fifteen minutes.",
    section: "Get started",
    readingTime: "6 min read",
    body: [
      {
        heading: "What Hercules builds for you",
        paragraphs: [
          "Hercules is an AI app builder for business. You describe the software you need in plain language and Hercules produces a working application: the screens people use, the database behind them, the backend that enforces your rules, and the hosting it all runs on.",
          "There is no separate stack to assemble. Auth, users, a Postgres-style database, file storage, transactional email, payments, search and an AI gateway are switched on from the first message. You are not choosing services, you are describing a business.",
        ],
      },
      {
        heading: "Your first prompt",
        paragraphs: [
          "Open a new project and describe the app the way you would brief a new hire on their first day: who uses it, what they do in it, and what has to be true at the end.",
          "Hercules replies with a short plan before it writes anything — the tables it intends to create, the screens it will build, and the roles it will define. Read the plan. Correcting a plan costs one sentence; correcting a finished app costs a rebuild.",
        ],
        code: {
          lang: "prompt",
          source:
            "Build an app for my 12-person commercial cleaning company.\n\nOffice staff schedule jobs against client sites and assign crews.\nCrew leads open the job on their phone, tick off a checklist and\nupload photos. When the last task is ticked the job closes and an\ninvoice draft is created for the office to approve.\n\nOffice staff can see every client. Crew leads only see jobs they\nare assigned to.",
        },
      },
      {
        heading: "The build loop",
        paragraphs: [
          "Each message you send is one turn of the loop: Hercules plans, edits the app, redeploys the preview and tells you what changed. The preview on the right is the real application running against a real database, not a mockup.",
          "Work in small steps. Ask for one screen, look at it, then ask for the next. Small turns are cheaper in credits, easier to review, and far easier to roll back if you change your mind.",
        ],
        list: [
          "Ask for a change in one or two sentences.",
          "Click through the preview and use the app as your team would.",
          "Correct what is wrong before adding anything new.",
          "Publish when a slice of the app is genuinely usable.",
        ],
      },
      {
        heading: "Publishing",
        paragraphs: [
          "Publish puts the current version on the web. On the free plan your app lives at a hercules.app subdomain; on Pro and above you can connect a domain you own and Hercules provisions the certificate for you.",
          "Publishing is a snapshot, not a switch. You can keep editing after you publish, and nothing your visitors see changes until you publish again.",
        ],
      },
      {
        heading: "Versions and rollback",
        paragraphs: [
          "Every turn is saved as a version with a label describing what changed. If a change goes wrong, restore the previous version and you are back where you were within seconds, database schema included.",
          "Versions are also how you review work. Open the diff on a version to see the tables and screens that were touched before you publish it to your team.",
        ],
      },
      {
        heading: "Where to go next",
        paragraphs: [
          "Read Prompting to learn how to describe an app so Hercules gets it right the first time, then Database to understand the data model it generates.",
        ],
        list: [
          "Prompting — how to describe an app well",
          "Database — tables, relations and the data your app stores",
          "Auth and users — sign-in, roles and who can see what",
          "Cloud credits — what a credit is and where it goes",
        ],
      },
    ],
  },
  {
    slug: "prompting",
    title: "Prompting",
    description:
      "How to describe an app so Hercules builds the right thing on the first attempt.",
    section: "Get started",
    readingTime: "8 min read",
    body: [
      {
        heading: "Describe the business, not the interface",
        paragraphs: [
          "The most common mistake is to describe screens. Screens are an output. Describe the work instead — who does what, in what order, and what changes when they are done — and Hercules will choose an interface that fits.",
          "Compare two briefs for the same app. The first produces a generic table; the second produces a working process.",
        ],
        code: {
          lang: "prompt",
          source:
            "Weak:  Build a page with a table of orders and an add button.\n\nStrong: Sales reps take phone orders from retailers. Each order has\n        a retailer, a delivery date and any number of line items\n        priced from that retailer's price list. An order below the\n        floor price needs a manager to approve it before it can be\n        sent to the warehouse.",
        },
      },
      {
        heading: "The four things worth stating",
        paragraphs: [
          "Almost every good brief answers the same four questions. If your prompt covers them, Hercules rarely needs a second attempt.",
        ],
        list: [
          "Who uses it — the roles, and what each one is allowed to see or change.",
          "The nouns — the things the business keeps track of, and how they relate to each other.",
          "The flow — the sequence of states something moves through, and what triggers each move.",
          "The rules — what must never happen, what needs approval, what has to be unique.",
        ],
      },
      {
        heading: "Use your own vocabulary",
        paragraphs: [
          "If your business calls them jobs, do not translate them into tickets. Hercules names tables, fields, screens and buttons after the words you use, and an app that speaks your language needs no training.",
          "The same applies to statuses. Say the statuses out loud — quoted, scheduled, in progress, snagged, invoiced — and Hercules will build them as a real workflow rather than a free-text field.",
        ],
      },
      {
        heading: "Give examples and edge cases",
        paragraphs: [
          "One concrete example is worth a paragraph of description. Paste a row from the spreadsheet you are replacing, a sample invoice, or the email a customer sends you, and Hercules will model the fields it actually needs.",
          "Edge cases are equally valuable. Telling Hercules that a job can be split across two crews, or that a customer can have two billing addresses, prevents a data model that has to be unpicked later.",
        ],
      },
      {
        heading: "Iterate in small, specific turns",
        paragraphs: [
          "Once the app exists, keep each request narrow and name the thing you want changed. Vague requests produce vague edits.",
        ],
        code: {
          lang: "prompt",
          source:
            "Weak:  Make the dashboard better.\n\nStrong: On the dashboard, replace the Recent activity list with three\n        tiles: jobs scheduled today, jobs overdue, and unapproved\n        invoices. Clicking a tile filters the jobs table below it.",
        },
      },
      {
        heading: "Ask for a plan when the change is large",
        paragraphs: [
          "For anything that touches several tables — adding multi-currency, splitting customers into companies and contacts, introducing an approvals layer — ask Hercules to plan the change before making it. You will get a summary of what it intends to alter and can correct it for a fraction of a credit.",
        ],
        code: {
          lang: "prompt",
          source:
            "Before you change anything: plan how you would add multi-currency\npricing to the order flow. List the tables you would change, the\nfields you would add, and anything that would break. Wait for my\napproval.",
        },
      },
      {
        heading: "Patterns that work well",
        paragraphs: [
          "These phrasings come up again and again in apps that turned out well the first time.",
        ],
        list: [
          "Only <role> can <action> — establishes permissions as you go.",
          "When <event>, automatically <action> — turns into a scheduled event or trigger.",
          "Every <noun> must have a unique <field> — becomes a real database constraint.",
          "Show <role> only their own <noun> — becomes a row-level access rule.",
          "Keep a record of who changed <noun> and when — becomes an audit trail.",
        ],
      },
    ],
  },
  {
    slug: "database",
    title: "Database",
    description:
      "How Hercules turns your description into tables, relations and rules — and how to shape them.",
    section: "Build",
    readingTime: "9 min read",
    body: [
      {
        heading: "Every app gets a real database",
        paragraphs: [
          "Hercules apps are backed by a managed relational database, not a spreadsheet. Your data lives in typed tables with real relationships, constraints and indexes, which is why an app can grow from ten records to ten million without being rebuilt.",
          "You never have to design the schema yourself. Hercules infers it from the nouns in your prompt, then shows you what it created so you can correct anything that does not match how the business actually works.",
        ],
      },
      {
        heading: "From nouns to tables",
        paragraphs: [
          "Each distinct thing you describe becomes a table. Each fact about that thing becomes a field with a type — text, number, currency, date, boolean, select, email, url or a relation to another table.",
          "A brief about a cleaning company that mentions clients, sites, jobs, crews and invoices produces five tables wired together, not one flat list.",
        ],
        code: {
          lang: "schema",
          source:
            "clients    id · name · billing_email · payment_terms\nsites      id · client → clients · address · access_notes\njobs       id · site → sites · scheduled_for · status · crew → crews\ntasks      id · job → jobs · label · done · photo\ninvoices   id · job → jobs · total · status · issued_on",
        },
      },
      {
        heading: "Relations",
        paragraphs: [
          "A relation field stores a link to a row in another table. Hercules picks the shape from your language: one client has many sites, one job belongs to one site, one job has many tasks, a crew member can be on many jobs and a job can have many crew members.",
          "Because relations are real, the app can follow them. A client page can total every invoice across every job at every site without you writing a query.",
        ],
        list: [
          "One-to-many — a client has many sites.",
          "Many-to-many — crews and jobs, through a join table Hercules manages for you.",
          "Self-referencing — a task that blocks another task, or an employee who reports to an employee.",
        ],
      },
      {
        heading: "Rules and constraints",
        paragraphs: [
          "State a rule in a sentence and it becomes a constraint enforced in the database, not a validation someone can bypass through an API call.",
        ],
        code: {
          lang: "prompt",
          source:
            "Two jobs can never be scheduled for the same crew at the same time.\nAn invoice total must equal the sum of its line items.\nEvery client must have a unique billing email.\nA job cannot be invoiced until every task on it is done.",
        },
      },
      {
        heading: "Importing what you already have",
        paragraphs: [
          "Most businesses arrive with a spreadsheet. Upload the file and Hercules will read the columns, propose a mapping onto your tables, flag the rows it cannot parse, and import the rest.",
          "Import into a copy of your app first if the spreadsheet is messy. Cleaning a bad import costs more than a second attempt.",
        ],
      },
      {
        heading: "Changing the schema safely",
        paragraphs: [
          "Adding a field is safe at any time. Renaming, splitting or removing a field changes existing rows, so Hercules will describe the migration and ask you to confirm it before running.",
          "Ask for the change in business terms and let Hercules work out the migration.",
        ],
        code: {
          lang: "prompt",
          source:
            "Split the single address field on sites into street, city, region\nand postcode. Keep the existing values by parsing them into the new\nfields, and leave anything you cannot parse in a notes field so we\ncan fix it by hand.",
        },
      },
      {
        heading: "Getting data back out",
        paragraphs: [
          "Your data is yours. Every table can be exported to CSV from the app, and Hercules can build reporting views, scheduled email digests or a read-only API endpoint for another system to consume.",
        ],
      },
    ],
  },
  {
    slug: "auth",
    title: "Auth and users",
    description:
      "Sign-in, roles, permissions and the difference between your team and your customers.",
    section: "Build",
    readingTime: "7 min read",
    body: [
      {
        heading: "Authentication is already on",
        paragraphs: [
          "Every Hercules app ships with a users table, a sign-in flow, password reset, email verification and session management. You do not add auth, you decide who is allowed to sign in.",
          "Supported methods include email and password, magic links, Google and Microsoft sign-in, and SSO on Business and Enterprise plans.",
        ],
      },
      {
        heading: "Internal users and external users",
        paragraphs: [
          "Be explicit about which kind of app you are building, because it changes the whole sign-up flow. An internal tool should be invite-only: nobody signs themselves up, an admin adds them. A customer app usually needs open registration, sometimes gated by an invite code or a domain allowlist.",
        ],
        code: {
          lang: "prompt",
          source:
            "Staff are invite-only — an admin adds them and they set a password\nfrom the invitation email. Customers can register themselves, but a\nnew customer account is pending until someone in the office approves\nit, and a pending account can sign in but cannot place an order.",
        },
      },
      {
        heading: "Roles",
        paragraphs: [
          "A role is a named group of permissions. Name your roles after the job titles in your business and describe what each one may do; Hercules creates the roles, applies them to every screen and enforces them on the backend.",
        ],
        list: [
          "Owner — billing, workspace settings and everything below.",
          "Admin — user management and all data.",
          "Editor — creates and edits records within their area.",
          "Viewer — read-only access, useful for auditors and clients.",
        ],
      },
      {
        heading: "Row-level access",
        paragraphs: [
          "Roles decide what someone can do; row-level rules decide which records they can do it to. This is the difference between a crew lead who can update jobs and a crew lead who can update only their own jobs.",
          "Row-level rules are enforced by the database, so they apply to the screens, the search index, exports and any API call alike.",
        ],
        code: {
          lang: "prompt",
          source:
            "Crew leads see only jobs where they are the assigned crew.\nRegional managers see every job at a site in their region.\nClients signing in to the portal see only their own sites, jobs\nand invoices, and can never see costs or crew pay rates.",
        },
      },
      {
        heading: "Field-level visibility",
        paragraphs: [
          "Some fields should be invisible rather than merely read-only. Margin, internal notes, supplier cost and personal contact details are common examples. Say which roles may see which fields and Hercules will strip them from responses for everyone else.",
        ],
      },
      {
        heading: "Testing permissions",
        paragraphs: [
          "Use the role switcher in the preview to view the app exactly as each role sees it, including the screens they do not get. Check the negative cases: a viewer should not see an edit button, and a direct link to a record they do not own should return a not-found page rather than a permission error that confirms the record exists.",
        ],
      },
    ],
  },
  {
    slug: "payments",
    title: "Payments",
    description:
      "Take one-off payments, subscriptions and invoices inside an app you built by chatting.",
    section: "Build",
    readingTime: "6 min read",
    body: [
      {
        heading: "What is included",
        paragraphs: [
          "Payments are part of the platform. Hercules can add a checkout, store payment methods, run subscriptions, issue refunds and reconcile everything back to the records in your database.",
          "Card processing runs through a PCI-compliant provider. Card numbers never touch your app or your database — your app stores a token, the customer record and the payment status.",
        ],
      },
      {
        heading: "Connecting an account",
        paragraphs: [
          "Open Settings, then Payments, and connect the payment account you want funds to land in. Until you connect a live account the app runs in test mode, where the sample card numbers succeed and no money moves.",
          "Test mode is the right place to build. Run a full order through checkout, refund it, and let a subscription renew before you switch anything to live.",
        ],
      },
      {
        heading: "One-off payments",
        paragraphs: [
          "Describe the moment money changes hands and Hercules builds the checkout around it, including the receipt email and the record it writes back.",
        ],
        code: {
          lang: "prompt",
          source:
            "When a customer confirms a booking, take payment for the deposit\n(30% of the quoted total, minimum $50). On success mark the booking\nconfirmed, email a receipt, and record the payment against the\nbooking. If payment fails, keep the booking as pending for 24 hours\nand then release the slot.",
        },
      },
      {
        heading: "Subscriptions",
        paragraphs: [
          "For recurring revenue, describe the plans, the billing interval and what happens on failure. Hercules will build the plan table, the upgrade and downgrade flows with proration, the customer billing portal and the dunning emails.",
        ],
        list: [
          "Plans with monthly and annual pricing, and a trial period if you want one.",
          "Upgrades and downgrades that prorate against the current period.",
          "Retries and dunning email when a card fails.",
          "A self-serve billing portal so customers update cards without emailing you.",
        ],
      },
      {
        heading: "Invoicing",
        paragraphs: [
          "Many business apps need invoices rather than checkouts. Hercules can generate a numbered PDF invoice from a job or an order, email it on a schedule, track what is paid and overdue, and take payment from a link inside the invoice.",
          "Invoice numbering is sequential and gap-free per financial year, which matters more to your accountant than it does to your app.",
        ],
      },
      {
        heading: "Tax and going live",
        paragraphs: [
          "Sales tax, VAT and GST can be calculated at checkout from the customer's address and your registered jurisdictions, and each rate is stored on the transaction so historical records stay correct after a rate change.",
          "Before you go live, run the checklist: switch the payment account to live keys, place one real low-value order, refund it, confirm the receipt email arrives, and confirm the payment shows against the right record in your database.",
        ],
      },
    ],
  },
  {
    slug: "api-integrations",
    title: "API integrations",
    description:
      "Connect your app to the other systems your business already runs on.",
    section: "Build",
    readingTime: "7 min read",
    body: [
      {
        heading: "Three ways to connect",
        paragraphs: [
          "Most integrations fall into one of three shapes, and Hercules handles all of them: your app calls out to an API, another system calls in to your app, or the two exchange data on a schedule.",
        ],
        list: [
          "Outbound calls — fetch a rate, push a contact, create a shipment.",
          "Inbound webhooks — a provider notifies your app that something happened.",
          "Scheduled syncs — reconcile two systems every night.",
        ],
      },
      {
        heading: "Calling an API",
        paragraphs: [
          "Describe the integration in terms of the business outcome and, where you have it, paste a link to the provider's documentation. Hercules writes the request, handles the authentication, parses the response and stores what matters.",
        ],
        code: {
          lang: "prompt",
          source:
            "When a job is marked complete, create a matching entry in our\naccounting system using their REST API. Send the client, the job\nreference, the invoice total and the tax code. Store the returned\nentry id on the job so we can link to it, and if the call fails,\nretry every 10 minutes for an hour and then flag the job for review.",
        },
      },
      {
        heading: "Secrets",
        paragraphs: [
          "API keys, tokens and signing secrets belong in Settings, then Secrets. A secret is encrypted at rest, available to your backend by name, and never sent to the browser or written into your app's source.",
          "Refer to a secret by name in a prompt. Never paste the key itself into the chat.",
        ],
        code: {
          lang: "prompt",
          source:
            "Use the secret named ACCOUNTING_API_KEY as the bearer token for\nthese requests. Do not log the header.",
        },
      },
      {
        heading: "Receiving webhooks",
        paragraphs: [
          "Hercules can expose an endpoint for another system to call, verify the signature, and act on the payload. Ask for idempotency by default so a provider that delivers the same event twice does not create two records.",
        ],
        code: {
          lang: "prompt",
          source:
            "Expose a webhook at /hooks/shipping. Verify the signature using the\nsecret SHIPPING_WEBHOOK_SECRET, ignore any event id we have already\nprocessed, and when the event is delivery.completed set the matching\norder to delivered and email the customer.",
        },
      },
      {
        heading: "Scheduled syncs",
        paragraphs: [
          "For systems without webhooks, run a scheduled event. Tell Hercules how often to run, what to fetch, and how to decide whether a record is new or changed. Keep a sync log table so a failed run is visible rather than silent.",
        ],
      },
      {
        heading: "Designing an integration that survives",
        paragraphs: [
          "Integrations break because remote systems change, rate limit or go down. A few habits make yours durable.",
        ],
        list: [
          "Store the remote id on your record so you can re-sync without duplicating.",
          "Retry with backoff, then surface a failure to a human instead of dropping it.",
          "Log the request and response for failures only, with secrets stripped.",
          "Treat every inbound payload as untrusted and validate it before writing.",
        ],
      },
    ],
  },
  {
    slug: "skills",
    title: "Skills",
    description:
      "Reusable capabilities you teach Hercules once and reuse across every app you build.",
    section: "Extend",
    readingTime: "6 min read",
    body: [
      {
        heading: "What a skill is",
        paragraphs: [
          "A skill is a packaged capability: instructions, examples and optional assets that Hercules loads when a task calls for them. Think of it as institutional knowledge you write down once so every future app inherits it.",
          "Skills are how you stop repeating yourself. If every app your company builds needs the same invoice layout, the same tone of voice in customer email, or the same approval workflow, that belongs in a skill rather than in your next fifteen prompts.",
        ],
      },
      {
        heading: "Built-in skills",
        paragraphs: [
          "Hercules ships with a library you can enable per project. They cover the tasks that come up in almost every business app.",
        ],
        list: [
          "Documents — generate branded PDFs, contracts and packets from records.",
          "Spreadsheets — import messy files and export clean ones.",
          "Charts — build dashboards with consistent, accessible chart styling.",
          "Brand kit — apply your colours, type and logo to everything generated.",
          "SEO — titles, metadata, sitemaps and structured data for public pages.",
          "Email — transactional templates that render correctly in real clients.",
        ],
      },
      {
        heading: "Writing your own",
        paragraphs: [
          "A custom skill is a short document plus any files it needs. Name it after the job it does, describe when it should be used, and keep the instructions specific enough to be actionable.",
          "The description is what determines whether Hercules reaches for the skill at the right moment, so write it in the words a colleague would use.",
        ],
        code: {
          lang: "skill",
          source:
            "name: quote-letter\ndescription: Use when generating a customer quote or estimate for\n  any Northwind app. Produces the approved quote letter layout.\n\nRules:\n- Always show the validity period (30 days) under the total.\n- Group line items by trade, subtotal each group.\n- Use the Northwind letterhead asset and Inter for body text.\n- Amounts to two decimals, thousands separated, currency prefixed.\n- Close with the signature block of the assigned account manager.",
        },
      },
      {
        heading: "Assets",
        paragraphs: [
          "Skills can carry files: a logo, a letterhead, a font, a spreadsheet template, an example document. Hercules uses them directly rather than approximating them, which is what makes generated documents look like yours rather than like a template.",
        ],
      },
      {
        heading: "Scope and sharing",
        paragraphs: [
          "A skill can live in one project or across your whole workspace. Workspace skills are the ones worth investing in — branding, document layouts, security requirements, the phrasing your legal team has approved.",
          "On Business and Enterprise plans an admin can mark a workspace skill as required, so every new project starts with it enabled.",
        ],
      },
      {
        heading: "Keeping skills useful",
        paragraphs: [
          "Skills rot when they describe systems rather than standards. Keep them focused on rules that outlive any single app, review them when the underlying policy changes, and delete the ones nobody has triggered in six months.",
        ],
      },
    ],
  },
  {
    slug: "mcp",
    title: "MCP",
    description:
      "Connect Hercules to external tools and data over the Model Context Protocol.",
    section: "Extend",
    readingTime: "7 min read",
    body: [
      {
        heading: "Why MCP",
        paragraphs: [
          "The Model Context Protocol is an open standard for giving an AI system access to tools and data. An MCP server exposes a set of typed tools; Hercules connects to the server, sees the tools, and can call them while it builds or while your app runs.",
          "It is the cleanest way to let Hercules work against systems it does not know about — your warehouse management system, an internal reporting API, a partner's catalogue.",
        ],
      },
      {
        heading: "Connecting a server",
        paragraphs: [
          "Open Settings, then Connections, and add an MCP server by URL. Provide credentials as secrets rather than inline, choose which tools to expose, and give the connection a name your prompts can refer to.",
          "Hercules lists every tool the server advertises along with its parameters, so you can confirm what you are granting before you enable it.",
        ],
        code: {
          lang: "config",
          source:
            "name:    warehouse\nurl:     https://mcp.internal.example.com/warehouse\nauth:    bearer, from secret WAREHOUSE_MCP_TOKEN\ntools:   stock.lookup, stock.reserve, shipment.create\nscope:   build-time and runtime",
        },
      },
      {
        heading: "Build-time and runtime",
        paragraphs: [
          "A build-time connection lets Hercules use the tools while it constructs your app — reading a schema, listing fields, checking what a real response looks like so the code it writes matches reality.",
          "A runtime connection lets the finished app call the tools on behalf of its users. Grant runtime access deliberately: those calls happen without you watching.",
        ],
      },
      {
        heading: "Using a connection in a prompt",
        paragraphs: [
          "Refer to the connection by name and describe the outcome. Hercules chooses the tool, maps the parameters and handles the response.",
        ],
        code: {
          lang: "prompt",
          source:
            "On the order screen, show live stock for each line item using the\nwarehouse connection. If stock is below the quantity ordered, show\na backorder warning and let the user reserve what is available.\nCache lookups for 60 seconds so we do not hammer the server.",
        },
      },
      {
        heading: "Permissions and safety",
        paragraphs: [
          "Grant the narrowest set of tools that does the job, and prefer read-only tools unless a write is genuinely required. Every MCP call your app makes is recorded in the audit log on Business and Enterprise plans, including the tool, the arguments and the caller.",
          "Treat data returned by an MCP server as untrusted input. Content coming back from a tool is data to display or store, never instructions to follow.",
        ],
      },
      {
        heading: "Troubleshooting",
        paragraphs: [
          "If a connection fails, check the three usual suspects before anything else.",
        ],
        list: [
          "The secret has expired or was rotated on the other side.",
          "The server is not reachable from the network your app runs in.",
          "The tool schema changed and a required parameter is now missing.",
        ],
      },
    ],
  },
  {
    slug: "utilities",
    title: "Utilities",
    description:
      "The built-in helpers every Hercules app can use: search, files, email, scheduling and more.",
    section: "Extend",
    readingTime: "6 min read",
    body: [
      {
        heading: "Batteries included",
        paragraphs: [
          "Utilities are the parts of an application nobody wants to build twice. They are available in every project without installation or configuration — you simply describe what you want and Hercules wires them in.",
        ],
      },
      {
        heading: "Search",
        paragraphs: [
          "Full-text search across any table, with typo tolerance, filters and per-role result scoping so people only ever find records they are allowed to see. Ask for a search box and say what it should look across.",
        ],
        code: {
          lang: "prompt",
          source:
            "Add a search box in the header that searches clients, sites and\njobs. Show the three best matches per type, respect row-level\npermissions, and let the user press Enter for a full results page.",
        },
      },
      {
        heading: "Files and media",
        paragraphs: [
          "Upload files from any screen, straight to object storage with a signed URL. Images are resized and served from the CDN in modern formats; documents keep their original bytes. Access is checked against the same rules as the record they belong to.",
        ],
        list: [
          "Drag-and-drop uploads with progress and resumable retry.",
          "Automatic thumbnails and responsive image variants.",
          "Virus scanning on upload for public-facing forms.",
          "Signed, expiring links for private downloads.",
        ],
      },
      {
        heading: "Email and notifications",
        paragraphs: [
          "Transactional email is included on every plan, with a verified sending domain, templates that match your brand and delivery tracking. In-app notifications, browser push and mobile push are available from the same description.",
        ],
        code: {
          lang: "prompt",
          source:
            "When an invoice becomes overdue, email the client contact and post\nan in-app notification to the account manager. Send at most one\nreminder per invoice per week, and stop once it is paid.",
        },
      },
      {
        heading: "Scheduled and recurring events",
        paragraphs: [
          "Anything that should happen on a clock rather than a click is a scheduled event: nightly syncs, weekly digests, monthly invoicing runs, a reminder ninety days before a contract renews.",
          "Schedules run in your workspace timezone, and every run is logged with its outcome so a silent failure is visible.",
        ],
      },
      {
        heading: "Analytics and audits",
        paragraphs: [
          "Page and event analytics are built in, with no third-party script to add. Audit logging records who changed what and when across every table, which is usually the first thing an auditor or an enterprise customer asks for.",
        ],
      },
      {
        heading: "Internationalization",
        paragraphs: [
          "Apps can be translated into multiple languages with locale-aware dates, numbers and currencies, and right-to-left layout support. Ask for the languages you need and Hercules extracts the strings and builds the switcher.",
        ],
      },
    ],
  },
  {
    slug: "custom-domains",
    title: "Custom domains",
    description:
      "Point a domain you own at your Hercules app, with SSL and a CDN handled for you.",
    section: "Ship",
    readingTime: "5 min read",
    body: [
      {
        heading: "Before you start",
        paragraphs: [
          "Custom domains are available on Pro and above. You need a published app and access to your domain's DNS settings, usually at the registrar you bought it from.",
          "Decide first whether you want the app on the root domain (example.com), a subdomain (app.example.com), or both. Subdomains are simpler and are the right choice for an internal tool sitting beside an existing marketing site.",
        ],
      },
      {
        heading: "Adding the domain",
        paragraphs: [
          "Open the project, go to Settings, then Domains, and add the hostname. Hercules shows the exact DNS records to create and then waits for them to appear.",
        ],
        code: {
          lang: "dns",
          source:
            "Subdomain (recommended)\n  Type   Name   Value\n  CNAME  app    cname.hercules.app.\n\nRoot domain\n  Type   Name   Value\n  A      @      76.76.21.21\n  CNAME  www    cname.hercules.app.",
        },
      },
      {
        heading: "Waiting for DNS",
        paragraphs: [
          "DNS changes propagate in anything from a minute to a few hours depending on the previous record's TTL. Hercules checks every thirty seconds and issues the SSL certificate automatically the moment the record resolves.",
          "If your DNS is behind a proxy such as Cloudflare, set the record to DNS-only while the certificate is issued. You can re-enable proxying afterwards.",
        ],
      },
      {
        heading: "SSL and redirects",
        paragraphs: [
          "Certificates are issued and renewed for you, and every request is redirected to HTTPS. You can choose whether www redirects to the root domain or the other way round; pick one, be consistent, and your SEO stays intact.",
        ],
      },
      {
        heading: "Multiple domains and environments",
        paragraphs: [
          "An app can serve several domains at once — useful when you are migrating from an old hostname, or running the same portal for two brands. One domain is marked primary and the rest redirect to it unless you ask for them to be served independently.",
          "Your hercules.app subdomain keeps working after you attach a custom domain, which makes it a convenient staging URL for internal review.",
        ],
      },
      {
        heading: "Common problems",
        paragraphs: [
          "Nearly every failed domain connection is one of these.",
        ],
        list: [
          "A conflicting record — an old A or CNAME for the same name still exists.",
          "A CAA record that does not allow the certificate authority to issue.",
          "The record was added to the wrong zone, usually at an old DNS host.",
          "A proxy in front of the domain intercepting the certificate challenge.",
        ],
      },
    ],
  },
  {
    slug: "mobile",
    title: "Mobile apps",
    description:
      "Publish the same project to iOS and Android, with native capabilities where you need them.",
    section: "Ship",
    readingTime: "6 min read",
    body: [
      {
        heading: "Responsive first",
        paragraphs: [
          "Every Hercules app is responsive from the first build, so it already works on a phone browser. For many internal tools that is the whole mobile story — send your crew a link and add it to their home screen.",
          "Go further when you need something the browser cannot do: reliable offline use, push notifications, the camera and barcode scanner, background location, or a listing in the app stores.",
        ],
      },
      {
        heading: "Turning on mobile builds",
        paragraphs: [
          "Open Settings, then Mobile, and enable mobile publishing. Hercules generates a native shell around your app, adds the icon and splash screen from your brand kit, and produces builds for both platforms from the same project. There is no second codebase to keep in step.",
        ],
      },
      {
        heading: "Native capabilities",
        paragraphs: [
          "Ask for the capability by describing the moment it is used, and Hercules requests the right permission at the right time rather than all of them on first launch.",
        ],
        list: [
          "Camera and photo library — job photos, receipts, damage reports.",
          "Barcode and QR scanning — stock counts, asset tracking, check-in.",
          "Push notifications — job assignments, approvals, escalations.",
          "Location — proof of attendance, route logging, nearest-site lookup.",
          "Biometric unlock — Face ID or fingerprint on sensitive apps.",
          "Offline mode — queue changes made without signal and sync on return.",
        ],
      },
      {
        heading: "Designing for offline",
        paragraphs: [
          "Field apps lose signal. Say which parts must work offline and what should happen when two people edit the same record from opposite sides of a dead zone.",
        ],
        code: {
          lang: "prompt",
          source:
            "Crew leads must be able to open today's assigned jobs, tick tasks\nand take photos with no signal. Queue the changes and sync when the\ndevice reconnects. If the office changed the same job meanwhile,\nkeep both versions and ask the office to resolve it.",
        },
      },
      {
        heading: "Store submission",
        paragraphs: [
          "Hercules produces the signed builds, the store listing metadata and the screenshots. You still need your own Apple Developer and Google Play accounts — the apps are published under your business, not ours.",
          "Reviews take a few days on the first submission and usually hours after that. Updates that change only your app's content ship instantly without a new review, because the shell is unchanged.",
        ],
      },
      {
        heading: "Before you submit",
        paragraphs: [
          "The two most common rejections are a missing privacy policy and a permission whose purpose string does not explain why the app needs it. Fix both before you submit and the first review usually passes.",
        ],
      },
    ],
  },
  {
    slug: "cloud-credits",
    title: "Cloud credits",
    description:
      "What a credit is, what spends one, and how to keep a project inside its budget.",
    section: "Ship",
    readingTime: "6 min read",
    body: [
      {
        heading: "What a credit is",
        paragraphs: [
          "A credit is the unit Hercules spends when it does work for you. Reading your existing app, planning a change, writing and testing the code, and deploying the result all draw from the same monthly balance.",
          "Every plan includes a monthly allowance: 30 credits on Free, 300 on Pro, 1,200 on Business, and a negotiated allocation on Enterprise. Credits refresh at the start of each billing cycle and do not roll over.",
        ],
      },
      {
        heading: "What spends credits",
        paragraphs: [
          "Building spends credits. Running your app, in ordinary use, does not.",
        ],
        list: [
          "A small edit — renaming a field, adjusting spacing, changing copy — costs a fraction of a credit.",
          "A new screen backed by a new table, with permissions, costs a few credits.",
          "A structural change across several tables costs more, because Hercules has to read and update more of the app.",
          "AI features inside your app — text, image, speech, transcription, chatbots — are metered per request against the same balance.",
        ],
      },
      {
        heading: "What does not spend credits",
        paragraphs: [
          "Hosting, the database, auth, file storage, transactional email within your plan limits, the CDN and SSL are included. A published app serving normal production traffic consumes no credits at all, which is why a business can run for years on a plan it chose in its first month.",
        ],
      },
      {
        heading: "Spending less",
        paragraphs: [
          "The habits that save credits are the same ones that produce better apps.",
        ],
        list: [
          "Plan first. A one-sentence correction to a plan is far cheaper than rebuilding a finished feature.",
          "Batch related changes into one turn instead of five near-identical ones.",
          "Be specific about the screen or field you mean, so Hercules does not have to read the whole app to find it.",
          "Roll back rather than repeatedly patching a change that went wrong.",
          "Cache external and AI calls where a slightly stale answer is fine.",
        ],
      },
      {
        heading: "Budgets and top-ups",
        paragraphs: [
          "Set a spend cap per project so an app can never exceed a budget you have not approved; when the cap is reached, building pauses and the published app keeps running untouched.",
          "If you need more than your plan includes, top-up packs can be bought at any time and never expire. Balance is always spent from your monthly allowance first.",
        ],
      },
      {
        heading: "Watching usage",
        paragraphs: [
          "The usage page breaks the month down by project and by category, so you can see whether credits went into building, into AI calls inside your apps, or into one experiment that got away from you. Owners and admins can also get an email when a workspace passes 80 percent of its allowance.",
        ],
      },
    ],
  },
];

const bySlug = new Map(docs.map((doc) => [doc.slug, doc]));

export function getDoc(slug: string): Doc | undefined {
  return bySlug.get(slug);
}

/** Docs grouped for the sidebar, in `docSections` order. */
export function docsBySection(): { section: DocSection; docs: Doc[] }[] {
  return docSections.map((section) => ({
    section,
    docs: docs.filter((doc) => doc.section === section),
  }));
}

/** Flat reading order, used for the previous / next links. */
export const docOrder: string[] = docSections.flatMap((section) =>
  docs.filter((doc) => doc.section === section).map((doc) => doc.slug),
);

export function adjacentDocs(slug: string) {
  const index = docOrder.indexOf(slug);
  return {
    previous: index > 0 ? getDoc(docOrder[index - 1]) : undefined,
    next: index >= 0 && index < docOrder.length - 1 ? getDoc(docOrder[index + 1]) : undefined,
  };
}
