import type { Metadata } from "next";
import Link from "next/link";
import { MessagesSquare, Sparkles, TrendingUp, Wrench } from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { Section, SectionHeading } from "@/components/content/section";
import { CtaCard } from "@/components/content/cta-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Forum",
  description:
    "Ask questions, share what you have built, and see how other businesses solved the same problem.",
};

const categories = [
  {
    icon: Sparkles,
    name: "Show and tell",
    body: "Post the app you built and how long it took. The most copied threads on the forum.",
    topics: 1_284,
  },
  {
    icon: Wrench,
    name: "Help and how-to",
    body: "Stuck on a data model, a permission rule or an integration? Ask here.",
    topics: 3_961,
  },
  {
    icon: TrendingUp,
    name: "Templates",
    body: "Prompts that reliably produce a good starting point, shared by the people who wrote them.",
    topics: 742,
  },
  {
    icon: MessagesSquare,
    name: "Feature requests",
    body: "Tell us what is missing. Requests here become the changelog.",
    topics: 508,
  },
];

const threads = [
  { title: "How do you model per-customer pricing without duplicating products?", replies: 34, tag: "Help and how-to" },
  { title: "Built our entire dispatch system in a weekend — here is the prompt", replies: 121, tag: "Show and tell" },
  { title: "Best way to structure roles for a company with contractors?", replies: 27, tag: "Help and how-to" },
  { title: "Template: field service app with photo capture and signatures", replies: 63, tag: "Templates" },
  { title: "Please add scheduled exports to Google Sheets", replies: 89, tag: "Feature requests" },
];

export default function ForumPage() {
  return (
    <>
      <Section className="pt-14 md:pt-20">
        <PageHeader
          eyebrow="Community"
          title="The Hercules forum"
          description="A hundred thousand businesses build here, and almost none of them are developers. Whatever you are stuck on, somebody has already solved it."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className={buttonClasses("primary", "lg")}>
            Join the forum
          </Link>
          <Link href="/docs" className={buttonClasses("outline", "lg")}>
            Read the docs
          </Link>
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading title="Categories" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <Card key={category.name} className="p-5">
              <div className="flex items-start gap-3">
                <category.icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[15px] font-semibold tracking-tight">{category.name}</h3>
                    <Badge tone="muted">{category.topics.toLocaleString("en-US")} topics</Badge>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{category.body}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading title="Active this week" />
        <Card className="mt-6 divide-y divide-border">
          {threads.map((thread) => (
            <div key={thread.title} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">{thread.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{thread.tag}</p>
              </div>
              <Badge tone="outline">{thread.replies} replies</Badge>
            </div>
          ))}
        </Card>
      </Section>

      <Section className="pt-0">
        <CtaCard
          title="Have a question?"
          description="Post it on the forum, or reach the team directly if it is account or billing related."
          primary={{ label: "Join the forum", href: "/signup" }}
          secondary={{ label: "Contact support", href: "/support" }}
        />
      </Section>
    </>
  );
}
