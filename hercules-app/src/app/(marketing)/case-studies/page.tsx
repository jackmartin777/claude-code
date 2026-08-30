import type { Metadata } from "next";
import { PageHeader } from "@/components/content/page-header";
import { Section } from "@/components/content/section";
import { CaseStudyFilter } from "@/components/content/case-study-filter";
import { CtaCard } from "@/components/content/cta-card";
import { caseStudies } from "@/data/site";

export const metadata: Metadata = {
  title: "Case studies",
  description:
    "How logistics operators, law firms, builders, wholesalers and manufacturers replaced their software stack with apps they built themselves on Hercules.",
  alternates: { canonical: "/case-studies" },
  openGraph: {
    title: "Case studies | Hercules",
    description: "How 100k+ businesses build the software they run on.",
    url: "/case-studies",
  },
};

export default function CaseStudiesPage() {
  return (
    <>
      <PageHeader
        title="Case studies"
        description="How 100k+ businesses build the software they run on."
      />

      <Section>
        <CaseStudyFilter studies={caseStudies} />
      </Section>

      <Section className="border-t border-border bg-muted/30">
        <CtaCard
          title="Your story could be next"
          description="Most of these businesses had never written a line of code. Describe what you need and see what Hercules builds in the first five minutes."
          secondary={{ label: "Talk to sales", href: "/support" }}
        />
      </Section>
    </>
  );
}
