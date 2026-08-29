import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, LifeBuoy, Rocket } from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { DocsNav } from "@/components/content/docs-nav";
import { docsBySection } from "@/data/docs";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Learn how to build business software with Hercules: writing a good prompt, the generated data model, auth and permissions, payments, custom domains, skills, MCP and cloud credits.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "Documentation | Hercules",
    description: "Everything you need to build, ship and run apps on Hercules.",
    url: "/docs",
  },
};

const quickLinks = [
  {
    href: "/docs/getting-started",
    icon: Rocket,
    title: "Getting started",
    description: "From a blank chat to a live app on your own domain.",
  },
  {
    href: "/docs/prompting",
    icon: BookOpen,
    title: "Prompting",
    description: "Describe an app so Hercules builds the right thing first time.",
  },
  {
    href: "/docs/cloud-credits",
    icon: LifeBuoy,
    title: "Cloud credits",
    description: "What a credit is and how to keep a project inside its budget.",
  },
];

export default function DocsPage() {
  return (
    <>
      <PageHeader
        title="Documentation"
        description="Everything you need to build, ship and run business software on Hercules — written for people who have never opened a code editor."
      />

      <div className="container-page py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
          <DocsNav />

          <div>
            <section aria-labelledby="start-here">
              <h2 id="start-here" className="sr-only">
                Start here
              </h2>
              <ul className="grid gap-4 sm:grid-cols-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "group flex h-full flex-col rounded-xl border border-border bg-card p-5 outline-none",
                        "transition-colors hover:border-ring/60 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      )}
                    >
                      <span className="inline-flex size-9 items-center justify-center rounded-lg bg-muted">
                        <link.icon aria-hidden="true" className="size-4.5 text-foreground" />
                      </span>
                      <span className="mt-4 block font-semibold tracking-tight text-foreground">
                        {link.title}
                      </span>
                      <span className="mt-1.5 block text-sm leading-6 text-muted-foreground">
                        {link.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {docsBySection().map((group) => (
              <section key={group.section} className="mt-12" aria-labelledby={`section-${group.section.replace(/\s+/g, "-").toLowerCase()}`}>
                <h2
                  id={`section-${group.section.replace(/\s+/g, "-").toLowerCase()}`}
                  className="text-lg font-semibold tracking-tight text-foreground"
                >
                  {group.section}
                </h2>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                  {group.docs.map((doc) => (
                    <li key={doc.slug}>
                      <Link
                        href={`/docs/${doc.slug}`}
                        className={cn(
                          "group flex h-full flex-col rounded-xl border border-border bg-card p-5 outline-none",
                          "transition-colors hover:border-ring/60 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        )}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="font-semibold tracking-tight text-foreground">
                            {doc.title}
                          </span>
                          <ArrowRight
                            aria-hidden="true"
                            className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                          />
                        </span>
                        <span className="mt-2 block flex-1 text-sm leading-6 text-pretty text-muted-foreground">
                          {doc.description}
                        </span>
                        <span className="mt-4 block text-[12px] text-muted-foreground">
                          {doc.readingTime}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <div className="mt-14 rounded-xl border border-border bg-muted/40 p-6">
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Cannot find what you need?
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                The community forum answers most build questions within a few hours, and our
                team reads every message sent from the support page.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
                <Link
                  href="/support"
                  className="rounded-lg text-foreground underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  Contact support
                </Link>
                <Link
                  href="/forum"
                  className="rounded-lg text-foreground underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  Community forum
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
