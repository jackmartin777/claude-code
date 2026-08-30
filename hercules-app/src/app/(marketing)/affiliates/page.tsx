import type { Metadata } from "next";
import Link from "next/link";
import { BadgeDollarSign, LineChart, Link2, Wallet } from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { Section, SectionHeading } from "@/components/content/section";
import { CtaCard } from "@/components/content/cta-card";
import { FaqAccordion } from "@/components/content/faq-accordion";
import { Card } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Affiliates",
  description:
    "Earn 30% recurring commission for a year on every business you introduce to Hercules.",
};

const steps = [
  {
    icon: Link2,
    title: "Share your link",
    body: "Sign up and get a tracked link. Use it in videos, newsletters, courses or client work.",
  },
  {
    icon: LineChart,
    title: "Track every signup",
    body: "See clicks, trials and conversions in your dashboard, updated as they happen.",
  },
  {
    icon: BadgeDollarSign,
    title: "Earn 30% for a year",
    body: "Take 30% of every payment your referrals make for their first twelve months.",
  },
  {
    icon: Wallet,
    title: "Get paid monthly",
    body: "Payouts clear on the first of each month once your balance passes $50.",
  },
];

const faqs = [
  {
    q: "Who can join the affiliate programme?",
    a: "Anyone with an audience that builds software for a business — agencies, consultants, course creators, newsletter writers and community operators. You do not need to be a Hercules customer.",
  },
  {
    q: "How long does the cookie last?",
    a: "Ninety days. If someone clicks your link and signs up within that window, the referral is credited to you.",
  },
  {
    q: "When do commissions stop?",
    a: "Twelve months after each referral's first payment. Referrals you introduce later start their own twelve-month window.",
  },
  {
    q: "Can I refer my own clients?",
    a: "Yes. Agencies commonly build on Hercules for clients and use the programme to offset their own costs. You may not refer your own account.",
  },
];

export default function AffiliatesPage() {
  return (
    <>
      <Section className="pt-14 md:pt-20">
        <PageHeader
          eyebrow="Affiliates"
          title="Earn 30% for a year on everyone you refer"
          description="Hercules replaces five-figure software quotes with something a business can build itself. That is an easy recommendation to make — and a well paid one."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className={buttonClasses("primary", "lg")}>
            Become an affiliate
          </Link>
          <Link href="/support" className={buttonClasses("outline", "lg")}>
            Ask a question
          </Link>
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading title="How it works" description="Four steps, no approval queue." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <Card key={step.title} className="p-5">
              <step.icon className="size-5 text-muted-foreground" aria-hidden="true" />
              <h3 className="mt-3 text-[15px] font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading title="Questions" />
        <div className="mt-6">
          <FaqAccordion items={faqs} />
        </div>
      </Section>

      <Section className="pt-0">
        <CtaCard
          title="Start earning this month"
          description="Join the programme, share your link, and take 30% of everything your referrals spend in their first year."
          primary={{ label: "Become an affiliate", href: "/signup" }}
          secondary={{ label: "Read the docs", href: "/docs" }}
        />
      </Section>
    </>
  );
}
