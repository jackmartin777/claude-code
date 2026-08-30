import { ChevronDown } from "lucide-react";
import { faqs } from "@/data/site";

export function FaqSection() {
  return (
    <section aria-labelledby="faq-heading" className="py-20 sm:py-24 lg:py-28">
      <div className="container-page">
        <h2
          id="faq-heading"
          className="text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance sm:text-4xl lg:text-5xl"
        >
          Frequently Asked Questions
        </h2>

        <div className="mt-10 max-w-3xl sm:mt-12">
          {faqs.map((faq) => (
            <details key={faq.q} className="group border-b border-border">
              <summary
                className={[
                  "flex cursor-pointer list-none items-center justify-between gap-6 rounded-lg py-5",
                  "text-[15px] font-medium sm:text-base",
                  "outline-none transition-colors hover:text-foreground/80",
                  "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  "[&::-webkit-details-marker]:hidden",
                ].join(" ")}
              >
                {faq.q}
                <ChevronDown
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="pb-5 pr-10 text-[15px] leading-relaxed text-muted-foreground">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
