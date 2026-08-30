/**
 * Canonical marketing content, transcribed from the production Hercules site.
 * Shared by the landing page, case-study pages, pricing and the footer so copy
 * never drifts between surfaces.
 */

export const site = {
  name: "Hercules",
  legalName: "Zeus AI Labs, Inc.",
  tagline: "The Best AI App Builder for Business",
  title: "Hercules | The Best AI App Builder for Business",
  description:
    "Build custom software for your business without hiring a developer. Hercules lets you create internal software, customer apps, SEO pages, mobiles apps and more by chatting with AI.",
  ogDescription:
    "Build custom software for your business without hiring a developer. Create internal tools, customer apps, and websites by chatting with AI.",
  footerTagline: "The best AI app and website builder for business",
  twitter: "@usehercules",
  year: 2026,
} as const;

export const nav = [
  { label: "Docs", href: "/docs" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Pricing", href: "/pricing" },
  { label: "Support", href: "/support" },
] as const;

export const footerNav = [
  {
    heading: "Product",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Skills", href: "/docs/skills" },
      { label: "MCP", href: "/docs/mcp" },
      { label: "Utilities", href: "/docs/utilities" },
      { label: "Docs", href: "/docs" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Support", href: "/support" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Careers", href: "/careers" },
      { label: "Affiliates", href: "/affiliates" },
      { label: "Changelog", href: "/changelog" },
      { label: "Forum", href: "/forum" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Abuse", href: "/legal/abuse" },
    ],
  },
] as const;

export const hero = {
  eyebrow: "The Best",
  headline: "AI App Builder",
  headlineTail: "for Business",
  subhead: ["Build custom software for your business", "without hiring a developer"],
  placeholder:
    "Build a CRM for my 12-person sales team that tracks deals and follow-ups...",
  cta: "Build it",
  socialProof: "Trusted by 100k+ businesses",
} as const;

export type UseCaseTab = {
  id: string;
  label: string;
  prompt: string;
  chips: string[];
};

export const useCaseTabs: UseCaseTab[] = [
  {
    id: "internal",
    label: "Internal software",
    prompt: "Build a CRM for my 12-person sales team that tracks deals and follow-ups...",
    chips: ["CRM", "ERP", "HR portal", "Inventory tracker", "Operations dashboard"],
  },
  {
    id: "customer",
    label: "Customer software",
    prompt: "Build a client portal where customers can book jobs and pay invoices...",
    chips: ["Client portal", "Booking app", "Storefront", "Membership site", "Support desk"],
  },
  {
    id: "marketing",
    label: "Marketing & SEO",
    prompt: "Build an SEO site for my HVAC company with a page for every city we serve...",
    chips: ["Landing pages", "Programmatic SEO", "Blog", "Lead capture", "Case studies"],
  },
  {
    id: "mobile",
    label: "Mobile apps",
    prompt: "Build a mobile app my drivers use to scan deliveries and capture signatures...",
    chips: ["Field app", "Loyalty app", "Driver app", "Inspections", "Push notifications"],
  },
];

export type CaseStudy = {
  slug: string;
  company: string;
  industry: string;
  quote: string;
  person: string;
  role: string;
  stats: { value: string; label: string }[];
  summary: string;
  challenge: string;
  solution: string;
  outcome: string;
  apps: string[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "petony-transportes",
    company: "Petony Transportes",
    industry: "Logistics & Transportation",
    quote:
      "I know zero about code, but I built a Hercules app that pulled my whole business into one place. Our revenue is up around 20%.",
    person: "Pedro Amaral",
    role: "Founder, Petony Transportes",
    stats: [
      { value: "+20%", label: "Revenue growth" },
      { value: "$230k", label: "Saved" },
    ],
    summary:
      "A freight operator replaced four disconnected tools with a single dispatch, fleet and invoicing app built by chat.",
    challenge:
      "Dispatch lived in a spreadsheet, maintenance in a notebook, and invoicing in a separate accounting package. Nothing reconciled, and drivers were phoning the office for every job change.",
    solution:
      "Pedro described the operation in plain language and Hercules generated a dispatch board, a driver mobile view, a maintenance log and automated invoicing on one database with role-based access.",
    outcome:
      "Loads are assigned in seconds instead of hours, invoices go out the day a load closes, and the company retired the software contracts it had been carrying for years.",
    apps: ["Dispatch board", "Driver mobile app", "Maintenance log", "Invoicing"],
  },
  {
    slug: "gamatauri",
    company: "Gamatauri",
    industry: "Beverage Wholesale",
    quote:
      "With Hercules I can set a different price for every product and every customer in seconds. My sales instantly went up.",
    person: "Thales",
    role: "Founder, Gamatauri",
    stats: [
      { value: "+$200k", label: "Added revenue" },
      { value: "49%", label: "Higher store sales" },
    ],
    summary:
      "A beverage wholesaler built per-customer price books and an ordering portal its retailers actually use.",
    challenge:
      "Every retailer negotiated its own pricing, so reps rebuilt quotes by hand and mistakes cost margin on every order.",
    solution:
      "Hercules built a catalogue with customer-specific price lists, an ordering portal for stores, and approval rules that stop an order below floor price.",
    outcome:
      "Stores order themselves at the right price, reps spend their time selling, and the wholesaler added six figures of revenue in the first year.",
    apps: ["Price book", "Retailer ordering portal", "Rep dashboard"],
  },
  {
    slug: "helixon-law",
    company: "Helixon Law",
    industry: "Law firm",
    quote:
      "It used to take me 6 hours to build a legal packet for a military board. With the app I built on Hercules, I do it in about 15 minutes.",
    person: "Will Helixon",
    role: "Founder, Helixon Law",
    stats: [
      { value: "+30%", label: "Higher close rate" },
      { value: "40+", label: "Apps built" },
    ],
    summary:
      "A military defence practice automated document assembly and intake across more than forty internal apps.",
    challenge:
      "Assembling a board packet meant hours of copying exhibits, formatting declarations and re-checking citations for every case.",
    solution:
      "Hercules assembled an intake form, a matter database and a document generator that renders the full packet from case records.",
    outcome:
      "Packets take a quarter of an hour, intake conversion rose sharply, and the firm keeps building new internal tools as cases demand them.",
    apps: ["Client intake", "Matter database", "Packet generator", "Billing"],
  },
  {
    slug: "mma-plumbing",
    company: "MMA Plumbing",
    industry: "Home Services",
    quote:
      "Every agency quoted me at least €250,000 to build what I wanted. Hercules let me build it myself in a few weeks, without writing a single line of code.",
    person: "Rachid",
    role: "Founder, MMA Plumbing",
    stats: [
      { value: "€250k", label: "Saved on software" },
      { value: "46", label: "Apps built" },
    ],
    summary:
      "A plumbing company built the field-service platform agencies said would take a year and a quarter of a million euro.",
    challenge:
      "Off-the-shelf field-service software did not match how the crews worked, and custom quotes started at €250,000.",
    solution:
      "Rachid built scheduling, quoting, job photos, parts inventory and customer notifications himself over a few weeks of chatting with Hercules.",
    outcome:
      "The company runs entirely on software it owns, and forty-six apps later it has never written a line of code.",
    apps: ["Job scheduling", "Quoting", "Parts inventory", "Customer portal"],
  },
  {
    slug: "havoc-motorcycles",
    company: "Havoc Motorcycles",
    industry: "Motorcycle Manufacturing",
    quote:
      "We relaunched the whole brand in three days. What used to be an agency project is now something we change ourselves in an afternoon.",
    person: "Havoc Motorcycles",
    role: "Motorcycle Manufacturing",
    stats: [
      { value: "3 days", label: "To relaunch" },
      { value: "$10k+", label: "Saved" },
    ],
    summary:
      "A motorcycle manufacturer rebuilt its storefront and dealer portal in a long weekend.",
    challenge:
      "The old site was slow, hard to update, and every change went through an agency queue measured in weeks.",
    solution:
      "Hercules rebuilt the marketing site, model configurator and dealer ordering portal from a description of the range.",
    outcome:
      "The brand relaunched in three days, and product updates now ship the same day they are decided.",
    apps: ["Storefront", "Model configurator", "Dealer portal"],
  },
  {
    slug: "kingdom-construction",
    company: "Kingdom Construction",
    industry: "Construction",
    quote:
      "It would have cost hundreds of thousands to hire a dev team. Hercules helped me turn my dream into reality.",
    person: "Kevin",
    role: "Founder, Kingdom Construction",
    stats: [
      { value: "$30k", label: "Saved per year" },
      { value: "4", label: "Vendors replaced" },
    ],
    summary:
      "A builder consolidated four SaaS subscriptions into one project and subcontractor system.",
    challenge:
      "Estimating, scheduling, subcontractor payments and client updates each lived in a different subscription that did not talk to the others.",
    solution:
      "Hercules built a single project record carrying estimates, schedules, subcontractor assignments and a client-facing progress view.",
    outcome:
      "Four vendors cancelled, thirty thousand dollars a year saved, and clients see progress without phoning the site.",
    apps: ["Estimating", "Project scheduling", "Subcontractor payments", "Client updates"],
  },
  {
    slug: "the-ice-cream-hut",
    company: "The Ice Cream Hut",
    industry: "Food & Beverage",
    quote:
      "A generic website was going to cost me $50,000. I paid far less for Hercules and got a much better result: everything in one place.",
    person: "Ron Ramsey",
    role: "Founder, The Ice Cream Hut",
    stats: [
      { value: "30x", label: "Website traffic" },
      { value: "$50k", label: "Saved" },
    ],
    summary:
      "A dessert franchise grew organic traffic thirtyfold with programmatic location pages.",
    challenge:
      "A generic template site ranked for nothing, and a custom build was quoted at fifty thousand dollars.",
    solution:
      "Hercules generated a location page for every store with local schema, a franchise enquiry funnel and an events booking form.",
    outcome:
      "Traffic multiplied thirty times, franchise enquiries arrive weekly, and the site is edited by the owner in minutes.",
    apps: ["Location pages", "Franchise funnel", "Events booking"],
  },
  {
    slug: "sold-out",
    company: "Sold Out",
    industry: "Music & Entertainment",
    quote:
      "A revenue split sheet used to take me an hour. Now it's instant, and it generates the producer agreement and label waiver automatically.",
    person: "David Restrepo",
    role: "VP, Sold Out",
    stats: [
      { value: "30x", label: "Faster song releases" },
      { value: "75 hrs", label: "Saved a month" },
    ],
    summary:
      "A music company automated splits, contracts and release scheduling for its entire catalogue.",
    challenge:
      "Every release meant a manual split sheet, a producer agreement and a label waiver, each rebuilt by hand.",
    solution:
      "Hercules built a release record that computes splits and generates the paperwork the moment collaborators are added.",
    outcome:
      "Releases move thirty times faster and the team gets back about seventy-five hours every month.",
    apps: ["Release manager", "Split calculator", "Contract generator"],
  },
];

export type Testimonial = {
  quote: string;
  name: string;
  role?: string;
  featured?: boolean;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Every agency quoted me at least €250,000 to build what I wanted. Hercules let me build it myself in a few weeks, without writing a single line of code.",
    name: "Rachid",
    role: "Founder, MMA Plumbing",
    featured: true,
  },
  {
    quote:
      "I've tried every AI app builder and Hercules is the best by far. The built-in backend and database is 🔥.",
    name: "Charlie S.",
  },
  {
    quote:
      "It used to take me 6 hours to build a legal packet for a military board. With the app I built on Hercules, I do it in about 15 minutes.",
    name: "Will Helixon",
    role: "Founder, Helixon Law",
  },
  {
    quote:
      "I was running a 15-person team and a physical office. Now almost everything runs on AI agents I built on Hercules in a month, without writing any code.",
    name: "Muhammad",
    role: "Founder, Universal Marketing",
  },
  {
    quote:
      "Developers quoted me $80k just for basic accounting software. I built a full ERP myself in a month on Hercules, with no code, and it's already making $55k a year.",
    name: "Ulrich",
    role: "Founder, Global Connectors",
  },
  {
    quote:
      "My old site got about 300 page views a month. After I rebuilt it on Hercules I hit almost 12,000 in 6 weeks, and my sales rose 30%.",
    name: "Jude",
    role: "Founder, Mauritius.biz",
  },
  {
    quote:
      "A developer quoted me $50k and 6 months to build my store. I built it myself on Hercules in 5 weeks with no code, and we've done $180k in orders in 60 days.",
    name: "Trent",
    role: "Founder, GlowBall Nation",
  },
  {
    quote:
      "I lost over $36k on a developer who spent a year and never delivered. I built my company's whole operating system myself on Hercules in under a month, with no code.",
    name: "Sarah",
    role: "Founder, Imjomat",
  },
  {
    quote:
      "I'm a full-stack engineer. I've tried dozens of systems in 8 years. I built what I have now on Hercules in 15 days for about $1,000. It's incredible.",
    name: "Airam",
    role: "Founder, Pleno",
  },
  {
    quote:
      "I found Hercules on a Friday evening and kept building until 3am. The next morning I showed my wife what I'd built and she was amazed.",
    name: "Doug Dostal",
    role: "Founder, Reiliz",
  },
  {
    quote:
      "As a non-technical founder, Hercules has already saved me thousands I would have spent on a developer.",
    name: "Brittany B.",
  },
  {
    quote:
      "I asked Hercules to make our casino better. In half an hour it replicated what took us 18 months and $230,000 to build.",
    name: "Jeremy",
    role: "Founder, ATOM Technology",
  },
  {
    quote:
      "Hercules is the best AI app builder I've used. It's fast, the designs are stunning, and the team is incredibly responsive.",
    name: "Roberto Ortiz",
    role: "CEO at Ortitech",
  },
  {
    quote:
      "A generic website was going to cost me $50,000. I paid far less for Hercules and got a much better result: everything in one place.",
    name: "Ron Ramsey",
    role: "Founder, The Ice Cream Hut",
  },
  {
    quote:
      "I know zero about code, but I built a Hercules app that pulled my whole business into one place. Our revenue is up around 20%.",
    name: "Pedro Amaral",
    role: "Founder, Petony Transportes",
  },
  {
    quote:
      "It took me an hour to build an app my whole team now uses every day. I can't even code, but Hercules makes it that easy.",
    name: "Dorian P.",
  },
  {
    quote:
      "It cut my daily admin work from 12 hours down to maybe 1.5. Hercules rekindled something in me I thought I'd lost.",
    name: "Donnie Lee",
    role: "Founder, Donald Lee Service",
  },
  {
    quote:
      "With Hercules I can set a different price for every product and every customer in seconds. My sales instantly went up.",
    name: "Thales",
    role: "Founder, Gamatauri",
  },
  {
    quote:
      "A revenue split sheet used to take me an hour. Now it's instant, and it generates the producer agreement and label waiver automatically.",
    name: "David Restrepo",
    role: "VP, Sold Out",
  },
  {
    quote:
      "I built my entire startup on Hercules. It's incredible, and whenever I had questions the team was unbelievably helpful.",
    name: "Paramjit G.",
  },
  {
    quote:
      "It would have cost hundreds of thousands to hire a dev team. Hercules helped me turn my dream into reality.",
    name: "Kevin",
    role: "Founder, Kingdom Construction",
  },
  {
    quote:
      "I tried a couple of other platforms, but Hercules is by far the best. 50% of my domains now rank on the first page of Google.",
    name: "TR",
    role: "Owner, American Mortuary Equipment",
  },
];

export const featureGroups = [
  {
    heading: "Platform",
    items: ["Auth", "Users", "Database", "Backend", "Payments", "Email", "Storage", "Hosting", "Domains"],
  },
  {
    heading: "Content & experience",
    items: ["Files & media", "CMS", "Search", "Branding", "SEO", "Mobile", "Internationalization", "Chat", "Notifications"],
  },
  {
    heading: "AI",
    items: ["AI text generation", "AI image generation", "AI speech generation", "AI transcription", "Chatbots", "AI Gateway", "Realtime"],
  },
  {
    heading: "Administration",
    items: ["Roles & permissions", "Security", "Secrets", "Analytics", "Audits", "Version control", "Scheduled events", "Recurring events"],
  },
] as const;

export const faqs = [
  {
    q: "What is Hercules?",
    a: "Hercules makes it easy to build beautiful apps, websites, and prototypes using AI. You describe the software your business needs in plain language and Hercules builds it — front end, database, backend and hosting included.",
  },
  {
    q: "How does Hercules work?",
    a: "You chat with Hercules the way you would brief a developer. It plans the app, creates the data model, builds the screens and deploys it live. Every change you ask for is applied in real time, and every version is kept so you can roll back.",
  },
  {
    q: "What can I build with Hercules?",
    a: "Internal software like CRMs, ERPs, HR portals and operations dashboards; customer software like client portals, booking apps and storefronts; marketing sites and programmatic SEO pages; and mobile apps for iOS and Android.",
  },
  {
    q: "What features are built into Hercules?",
    a: "Auth, users, database, backend, payments, email, storage, hosting, domains, files and media, CMS, search, SEO, internationalization, chat, notifications, AI text, image, speech and transcription, roles and permissions, audits, version control, scheduled events, and thousands of API integrations.",
  },
  {
    q: "Do I need coding experience?",
    a: "No. Most Hercules customers have never written a line of code. You describe what you want in your own words and Hercules handles the engineering.",
  },
  {
    q: "Can I publish to my own domain?",
    a: "Yes. Connect a custom domain and publish in a click. SSL, CDN and hosting are included on every plan, including the free tier.",
  },
  {
    q: "Can I build mobile apps?",
    a: "Yes. Hercules apps work on mobile out of the box, and you can publish to the iOS App Store and Google Play Store from the same project.",
  },
] as const;

export const buildTimeline = [
  { verb: "Created", subject: "contacts and accounts" },
  { verb: "Built", subject: "opportunities section" },
  { verb: "Added", subject: "role based access control" },
  { verb: "Published", subject: "" },
] as const;
