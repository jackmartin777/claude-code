import type { Metadata } from "next";
import { PageHeader } from "@/components/content/page-header";
import { Section } from "@/components/content/section";
import { Badge } from "@/components/ui/badge";
import { changelog, formatChangelogDate, type ChangeTag } from "@/data/changelog";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "What shipped on Hercules: plans before builds, offline mobile apps, MCP connections, rebuilt permissions, spend caps, skills and custom domains.",
  alternates: { canonical: "/changelog" },
  openGraph: {
    title: "Changelog | Hercules",
    description: "Every release, newest first.",
    url: "/changelog",
  },
};

const tagTone: Record<ChangeTag, "success" | "accent" | "muted"> = {
  New: "success",
  Improved: "accent",
  Fixed: "muted",
};

export default function ChangelogPage() {
  return (
    <>
      <PageHeader
        title="Changelog"
        description="Everything we ship to Hercules, newest first. Published apps keep running through every release — you never have to upgrade anything yourself."
      />

      <Section>
        <ol className="relative">
          {/* The rail. Sits under the dates on desktop, at the far left on mobile. */}
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[7px] w-px bg-border md:left-[calc(11rem+7px)]"
          />

          {changelog.map((entry) => (
            <li
              key={entry.version}
              className="relative grid gap-4 pb-14 pl-8 last:pb-0 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-10 md:pl-0"
            >
              <div className="md:pr-10 md:text-right">
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 left-0 size-3.5 rounded-full border-2 border-background bg-ring md:left-[11rem]"
                />
                <time
                  dateTime={entry.date}
                  className="block text-sm font-medium text-foreground"
                >
                  {formatChangelogDate(entry.date)}
                </time>
                <span className="mt-1 block font-mono text-[12px] text-muted-foreground">
                  v{entry.version}
                </span>
              </div>

              <article className="md:pl-8">
                <div className="flex flex-wrap items-center gap-2">
                  {entry.tags.map((tag) => (
                    <Badge key={tag} tone={tagTone[tag]}>
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h2 className="mt-3 text-xl font-semibold tracking-tight text-balance text-foreground sm:text-2xl">
                  {entry.title}
                </h2>
                <p className="mt-2 max-w-2xl text-[15px] leading-7 text-pretty text-muted-foreground">
                  {entry.summary}
                </p>

                <ul className="mt-5 space-y-2.5">
                  {entry.items.map((item) => (
                    <li key={item.text} className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 w-16 shrink-0 text-[12px] font-medium",
                          item.tag === "New" && "text-success",
                          item.tag === "Improved" && "text-foreground",
                          item.tag === "Fixed" && "text-muted-foreground",
                        )}
                      >
                        {item.tag}
                      </span>
                      <span className="text-sm leading-6 text-pretty text-muted-foreground">
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
