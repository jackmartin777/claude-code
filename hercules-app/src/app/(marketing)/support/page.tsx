import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Building2, Mail, MessagesSquare } from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { Section, SectionHeading } from "@/components/content/section";
import { FaqAccordion } from "@/components/content/faq-accordion";
import { ContactForm } from "@/components/content/contact-form";
import { faqs } from "@/data/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with Hercules: read the documentation, ask the community forum, email our support team, or talk to sales about an enterprise rollout.",
  alternates: { canonical: "/support" },
  openGraph: {
    title: "Support | Hercules",
    description: "Documentation, community, email support and enterprise sales.",
    url: "/support",
  },
};

const channels = [
  {
    icon: BookOpen,
    title: "Documentation",
    description:
      "Guides for prompting, the data model, auth, payments, domains and credits. Start here — most questions are answered in a couple of minutes.",
    action: { label: "Browse the docs", href: "/docs" },
    meta: "Always available",
  },
  {
    icon: MessagesSquare,
    title: "Community forum",
    description:
      "Thousands of builders sharing prompts, patterns and finished apps. The right place for \u201chow would you build this?\u201d questions.",
    action: { label: "Open the forum", href: "/forum" },
    meta: "Answers in a few hours",
  },
  {
    icon: Mail,
    title: "Email support",
    description:
      "Something broken, a billing question, or an app that is not behaving? Send us the details and a link and we will dig in.",
    action: { label: "support@hercules.app", href: "mailto:support@hercules.app" },
    meta: "One business day · four hours on priority plans",
  },
  {
    icon: Building2,
    title: "Enterprise sales",
    description:
      "Security reviews, SSO and SAML, dedicated infrastructure, invoicing and volume pricing for teams rolling Hercules out company-wide.",
    action: { label: "sales@hercules.app", href: "mailto:sales@hercules.app" },
    meta: "Same business day",
  },
];

export default function SupportPage() {
  return (
    <>
      <PageHeader
        title="Support"
        description="Read the docs, ask the community, or send us a message. A human answers every one."
      />

      <Section>
        <h2 className="sr-only">Ways to get help</h2>
        <ul className="grid gap-5 sm:grid-cols-2">
          {channels.map((channel) => {
            const external = channel.action.href.startsWith("mailto:");
            return (
              <li
                key={channel.title}
                className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-muted">
                  <channel.icon aria-hidden="true" className="size-4.5 text-foreground" />
                </span>
                <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
                  {channel.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-pretty text-muted-foreground">
                  {channel.description}
                </p>
                <p className="mt-4 text-[12px] text-muted-foreground">{channel.meta}</p>
                {external ? (
                  <a
                    href={channel.action.href}
                    className={cn(
                      "mt-2 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-foreground",
                      "underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    )}
                  >
                    {channel.action.label}
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </a>
                ) : (
                  <Link
                    href={channel.action.href}
                    className={cn(
                      "mt-2 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-foreground",
                      "underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    )}
                  >
                    {channel.action.label}
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </Section>

      <Section className="border-t border-border bg-muted/30">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
          <SectionHeading
            title="Send us a message"
            description="Tell us what you are building and what is in your way. Include a link to the app if you have one — it is the fastest route to a useful answer."
          />
          <ContactForm />
        </div>
      </Section>

      <Section className="border-t border-border">
        <SectionHeading
          title="Frequently asked questions"
          description="The questions we are asked most often about what Hercules is and what it can build."
        />
        <FaqAccordion items={faqs} className="mt-8" />
        <p className="mt-6 text-sm text-muted-foreground">
          Looking for plan and billing questions?{" "}
          <Link
            href="/pricing#compare"
            className="rounded font-medium text-foreground underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            See the pricing page
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
