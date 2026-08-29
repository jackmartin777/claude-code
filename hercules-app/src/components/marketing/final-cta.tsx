import { PromptComposer } from "@/components/marketing/prompt-composer";

export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-heading" className="pb-24 pt-6 sm:pb-28">
      <div className="container-page">
        <div className="relative isolate overflow-hidden rounded-3xl border border-border bg-muted px-6 py-16 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:px-10 sm:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[-12rem] -z-10 h-[26rem] w-[min(48rem,140%)] -translate-x-1/2 rounded-full bg-ring/20 blur-[110px]"
          />
          <h2
            id="final-cta-heading"
            className="text-center text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance sm:text-4xl lg:text-5xl"
          >
            Start building for free
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-muted-foreground">
            No credit card required. Describe your idea and start building in seconds.
          </p>
          <PromptComposer
            className="mt-10"
            placeholder="Build a CRM for my regional HVAC company"
          />
        </div>
      </div>
    </section>
  );
}
