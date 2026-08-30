import { CodeBlock, Prose } from "@/components/content/prose";
import type { DocBlock } from "@/data/docs";
import { slugify } from "@/lib/utils";

/** Renders a doc's block list as headed prose sections. */
export function DocBody({ blocks }: { blocks: DocBlock[] }) {
  return (
    <Prose>
      {blocks.map((block) => (
        <section key={block.heading} aria-labelledby={slugify(block.heading)}>
          <h2 id={slugify(block.heading)}>{block.heading}</h2>
          {block.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {block.list ? (
            <ul>
              {block.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {block.code ? <CodeBlock lang={block.code.lang} source={block.code.source} /> : null}
        </section>
      ))}
    </Prose>
  );
}

/** In-page table of contents built from the block headings. */
export function DocToc({ blocks }: { blocks: DocBlock[] }) {
  return (
    <nav aria-label="On this page" className="text-sm">
      <h2 className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
        On this page
      </h2>
      <ul className="mt-3 space-y-2 border-l border-border">
        {blocks.map((block) => (
          <li key={block.heading}>
            <a
              href={`#${slugify(block.heading)}`}
              className="-ml-px block border-l border-transparent pl-3 text-muted-foreground outline-none transition-colors hover:border-ring hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {block.heading}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
