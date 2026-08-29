import type { Metadata } from "next";
import { ChevronDown, MapPin } from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { Section, SectionHeading } from "@/components/content/section";
import { Badge } from "@/components/ui/badge";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join Zeus AI Labs and help 100k+ businesses build the software they run on. Open roles across engineering, design, support and go-to-market.",
  alternates: { canonical: "/careers" },
  openGraph: {
    title: "Careers | Hercules",
    description: "Help 100k+ businesses build the software they run on.",
    url: "/careers",
  },
};

const values = [
  {
    title: "Ship to real businesses",
    description:
      "Our customers are plumbers, wholesalers, law firms and hauliers. We measure work by what it changes for them on a Tuesday morning, not by how it demos.",
  },
  {
    title: "Small teams, whole problems",
    description:
      "One or two people own a problem end to end — the research, the build, the launch and whatever it breaks. Handoffs are the exception.",
  },
  {
    title: "Write it down",
    description:
      "We are spread across a lot of time zones. A clear document beats a meeting, and a decision nobody wrote down did not happen.",
  },
  {
    title: "Earn the trust",
    description:
      "People run their payroll, their invoices and their livelihoods on what we build. Security, reliability and honest status pages are not overhead.",
  },
];

const roles = [
  {
    title: "Senior Product Engineer, Builder",
    team: "Engineering",
    location: "Remote (Americas / Europe)",
    type: "Full-time",
    about:
      "Own the loop between a person describing what they want and a working application appearing. You will work across the planner, the code generation pipeline and the preview runtime.",
    looking: [
      "Deep experience with TypeScript and React in a production product.",
      "Comfort working with LLM-driven systems, evaluation harnesses and prompt regressions.",
      "A track record of shipping features to real users, not prototypes.",
    ],
  },
  {
    title: "Infrastructure Engineer",
    team: "Engineering",
    location: "Remote (Europe)",
    type: "Full-time",
    about:
      "Every app our customers publish runs on infrastructure we operate. You will look after multi-tenant isolation, deploy times, database provisioning and the platform's boring reliability.",
    looking: [
      "Experience running multi-tenant workloads at scale.",
      "Strong opinions about isolation boundaries and blast radius.",
      "Comfort being on call for a system businesses depend on.",
    ],
  },
  {
    title: "Product Designer",
    team: "Design",
    location: "Remote (Americas / Europe)",
    type: "Full-time",
    about:
      "Design for people who have never built software before and now maintain four apps. You will shape the builder, the workspace and the templates every generated app inherits.",
    looking: [
      "A portfolio of shipped product work, not concept pieces.",
      "Fluency in systems: tokens, components and the constraints of generated UI.",
      "A habit of watching real users struggle and fixing what you saw.",
    ],
  },
  {
    title: "Support Engineer",
    team: "Customer",
    location: "Remote (Americas)",
    type: "Full-time",
    about:
      "Answer the hard tickets — the ones where an app is not doing what someone expected — and turn what you learn into documentation, product fixes and better defaults.",
    looking: [
      "Enough technical depth to read a schema and reproduce a bug.",
      "Genuinely good writing under time pressure.",
      "Patience with non-technical customers and impatience with recurring problems.",
    ],
  },
  {
    title: "Solutions Architect, Enterprise",
    team: "Go-to-market",
    location: "New York or Remote (Americas)",
    type: "Full-time",
    about:
      "Work with larger customers through security review, SSO rollout and their first ten internal apps, then feed what you learn straight back into the product roadmap.",
    looking: [
      "Experience with enterprise security questionnaires and procurement.",
      "Ability to build a working proof of concept yourself, in the product.",
      "Clear communication with both IT teams and the people they serve.",
    ],
  },
  {
    title: "Technical Writer",
    team: "Customer",
    location: "Remote (Europe / Africa)",
    type: "Contract or full-time",
    about:
      "Own the documentation this site is built on. You will write for business owners, not developers, and you will use the product every day to keep it honest.",
    looking: [
      "Published documentation you are proud of and can point to.",
      "The instinct to test every instruction you write.",
      "Comfort with product managers, engineers and a fast-moving changelog.",
    ],
  },
];

const applyAddress = "careers@hercules.app";

export default function CareersPage() {
  return (
    <>
      <PageHeader
        eyebrow={site.legalName}
        title="Careers"
        description="We are a small, remote team building the tool that lets any business own its software. If that sounds like the most interesting problem you could work on this decade, we would like to hear from you."
      />

      <Section>
        <SectionHeading
          title="How we work"
          description="Four things we actually hold each other to, rather than a poster on a wall."
        />
        <ul className="mt-8 grid gap-5 sm:grid-cols-2">
          {values.map((value) => (
            <li key={value.title} className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                {value.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-pretty text-muted-foreground">
                {value.description}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section className="border-t border-border bg-muted/30">
        <SectionHeading
          title="Open roles"
          description="Every role is remote-first. Expand one to see what the work involves, then email us — a short note about something you have built beats a cover letter."
        />

        <ul className="mt-8 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {roles.map((role) => (
            <li key={role.title}>
              <details className="group">
                <summary
                  className={cn(
                    "flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 outline-none",
                    "transition-colors hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    "[&::-webkit-details-marker]:hidden",
                  )}
                >
                  <span className="flex-1 text-[15px] font-medium text-pretty text-foreground">
                    {role.title}
                  </span>
                  <Badge tone="outline">{role.team}</Badge>
                  <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <MapPin aria-hidden="true" className="size-3.5" />
                    {role.location}
                  </span>
                  <span className="text-[13px] text-muted-foreground">{role.type}</span>
                  <ChevronDown
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  />
                </summary>

                <div className="px-5 pb-6">
                  <p className="max-w-2xl text-sm leading-6 text-pretty text-muted-foreground">
                    {role.about}
                  </p>
                  <h3 className="mt-5 text-[13px] font-semibold text-foreground">
                    What we are looking for
                  </h3>
                  <ul className="mt-2 max-w-2xl list-disc space-y-1.5 pl-5 text-sm leading-6 text-muted-foreground marker:text-muted-foreground">
                    {role.looking.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <a
                    href={`mailto:${applyAddress}?subject=${encodeURIComponent(`Application: ${role.title}`)}`}
                    className={cn(
                      "mt-5 inline-flex items-center rounded-lg text-sm font-medium text-foreground",
                      "underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    )}
                  >
                    Apply for this role
                  </a>
                </div>
              </details>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-sm text-muted-foreground">
          Nothing here that fits?{" "}
          <a
            href={`mailto:${applyAddress}?subject=${encodeURIComponent("Open application")}`}
            className="rounded font-medium text-foreground underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            Send an open application
          </a>{" "}
          and tell us what you would work on.
        </p>
      </Section>
    </>
  );
}
