import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { DocsNav } from "@/components/content/docs-nav";
import { DocBody, DocToc } from "@/components/content/doc-body";
import { adjacentDocs, docs, getDoc } from "@/data/docs";
import { cn } from "@/lib/utils";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);

  if (!doc) {
    return { title: "Page not found" };
  }

  return {
    title: `${doc.title} — Docs`,
    description: doc.description,
    alternates: { canonical: `/docs/${doc.slug}` },
    openGraph: {
      title: `${doc.title} | Hercules docs`,
      description: doc.description,
      url: `/docs/${doc.slug}`,
      type: "article",
    },
  };
}

export default async function DocPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const doc = getDoc(slug);

  if (!doc) notFound();

  const { previous, next } = adjacentDocs(doc.slug);

  return (
    <div className="container-page py-10 md:py-14">
      <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[15rem_minmax(0,1fr)_13rem]">
        <DocsNav currentSlug={doc.slug} />

        <article className="min-w-0">
          <nav aria-label="Breadcrumb" className="text-[13px] text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link
                  href="/docs"
                  className="rounded outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  Docs
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>{doc.section}</li>
            </ol>
          </nav>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            {doc.title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-7 text-pretty text-muted-foreground">
            {doc.description}
          </p>
          <p className="mt-3 text-[13px] text-muted-foreground">{doc.readingTime}</p>

          <hr className="mt-8 border-border" />

          <div className="mt-8">
            <DocBody blocks={doc.body} />
          </div>

          <nav
            aria-label="Documentation pages"
            className="mt-14 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
          >
            {previous ? (
              <Link
                href={`/docs/${previous.slug}`}
                className={cn(
                  "rounded-xl border border-border bg-card p-4 outline-none transition-colors",
                  "hover:border-ring/60 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                )}
              >
                <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <ArrowLeft aria-hidden="true" className="size-3.5" />
                  Previous
                </span>
                <span className="mt-1 block font-medium text-foreground">{previous.title}</span>
              </Link>
            ) : (
              <span aria-hidden="true" className="hidden sm:block" />
            )}

            {next ? (
              <Link
                href={`/docs/${next.slug}`}
                className={cn(
                  "rounded-xl border border-border bg-card p-4 text-right outline-none transition-colors",
                  "hover:border-ring/60 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                )}
              >
                <span className="flex items-center justify-end gap-1.5 text-[13px] text-muted-foreground">
                  Next
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </span>
                <span className="mt-1 block font-medium text-foreground">{next.title}</span>
              </Link>
            ) : null}
          </nav>
        </article>

        <aside className="hidden xl:block">
          <div className="sticky top-20">
            <DocToc blocks={doc.body} />
            <div className="mt-8 border-t border-border pt-6 text-sm">
              <p className="text-muted-foreground">Still stuck?</p>
              <Link
                href="/support"
                className="mt-1.5 inline-block rounded font-medium text-foreground underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                Contact support
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
