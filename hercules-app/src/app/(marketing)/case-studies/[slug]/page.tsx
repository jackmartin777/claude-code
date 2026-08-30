import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { Section } from "@/components/content/section";
import { CtaCard } from "@/components/content/cta-card";
import { caseStudies } from "@/data/site";
import { cn } from "@/lib/utils";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

function findStudy(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = findStudy(slug);

  if (!study) {
    return { title: "Case study not found" };
  }

  return {
    title: `${study.company} case study`,
    description: study.summary,
    alternates: { canonical: `/case-studies/${study.slug}` },
    openGraph: {
      title: `${study.company} | Hercules case study`,
      description: study.summary,
      url: `/case-studies/${study.slug}`,
      type: "article",
    },
  };
}

const sections = [
  { key: "challenge", label: "The challenge" },
  { key: "solution", label: "What they built" },
  { key: "outcome", label: "The outcome" },
] as const;

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const study = findStudy(slug);

  if (!study) notFound();

  const index = caseStudies.findIndex((item) => item.slug === study.slug);
  const previous = index > 0 ? caseStudies[index - 1] : null;
  const next = index < caseStudies.length - 1 ? caseStudies[index + 1] : null;

  return (
    <>
      <PageHeader eyebrow={study.industry} title={study.company} description={study.summary}>
        <Link
          href="/case-studies"
          className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          All case studies
        </Link>
      </PageHeader>

      <Section>
        <figure className="max-w-4xl">
          <blockquote className="text-2xl leading-9 font-medium tracking-tight text-balance text-foreground sm:text-3xl sm:leading-11">
            &ldquo;{study.quote}&rdquo;
          </blockquote>
          <figcaption className="mt-6 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{study.person}</span>
            <span aria-hidden="true"> · </span>
            {study.role}
          </figcaption>
        </figure>

        <dl className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
          {study.stats.map((stat) => (
            <div key={stat.label} className="bg-card px-6 py-8">
              <dt className="text-sm text-muted-foreground">{stat.label}</dt>
              <dd className="mt-1.5 text-4xl font-semibold tracking-tight text-foreground tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section className="border-t border-border bg-muted/30">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16">
          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.key}>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  {section.label}
                </h2>
                <p className="mt-3 max-w-2xl text-[15px] leading-7 text-pretty text-muted-foreground">
                  {study[section.key]}
                </p>
              </div>
            ))}
          </div>

          <aside className="lg:pt-1">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-sm font-semibold text-foreground">Apps built on Hercules</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {study.apps.map((app) => (
                  <li
                    key={app}
                    className="rounded-full border border-border bg-muted px-3 py-1 text-[13px] text-foreground"
                  >
                    {app}
                  </li>
                ))}
              </ul>
              <dl className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted-foreground">Industry</dt>
                  <dd className="text-right font-medium text-foreground">{study.industry}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted-foreground">Told by</dt>
                  <dd className="text-right font-medium text-foreground">{study.person}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted-foreground">Role</dt>
                  <dd className="text-right font-medium text-foreground">{study.role}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </Section>

      <Section className="border-t border-border">
        <nav aria-label="More case studies" className="grid gap-4 sm:grid-cols-2">
          {previous ? (
            <Link
              href={`/case-studies/${previous.slug}`}
              className={cn(
                "group rounded-xl border border-border bg-card p-5 outline-none transition-colors",
                "hover:border-ring/60 focus-visible:ring-[3px] focus-visible:ring-ring/50",
              )}
            >
              <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <ArrowLeft aria-hidden="true" className="size-3.5" />
                Previous
              </span>
              <span className="mt-1.5 block font-medium text-foreground">{previous.company}</span>
              <span className="mt-0.5 block text-[13px] text-muted-foreground">
                {previous.industry}
              </span>
            </Link>
          ) : (
            <span aria-hidden="true" className="hidden sm:block" />
          )}

          {next ? (
            <Link
              href={`/case-studies/${next.slug}`}
              className={cn(
                "group rounded-xl border border-border bg-card p-5 text-right outline-none transition-colors",
                "hover:border-ring/60 focus-visible:ring-[3px] focus-visible:ring-ring/50",
              )}
            >
              <span className="flex items-center justify-end gap-1.5 text-[13px] text-muted-foreground">
                Next
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </span>
              <span className="mt-1.5 block font-medium text-foreground">{next.company}</span>
              <span className="mt-0.5 block text-[13px] text-muted-foreground">
                {next.industry}
              </span>
            </Link>
          ) : null}
        </nav>

        <CtaCard
          className="mt-12"
          title={`Build what ${study.company} built`}
          description="Describe your operation in plain language and Hercules will build the app around it — database, screens, permissions and hosting included."
          secondary={{ label: "Read the docs", href: "/docs" }}
        />
      </Section>
    </>
  );
}
