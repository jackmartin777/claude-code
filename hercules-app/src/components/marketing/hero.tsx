import { hero } from "@/data/site";
import { HeroPrompt } from "@/components/marketing/hero-prompt";

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden">
      {/* Soft lavender bloom behind the headline. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-16rem] -z-10 h-[32rem] w-[min(64rem,120vw)] -translate-x-1/2 rounded-full bg-ring/20 blur-[128px]"
      />

      <div className="container-page pb-20 pt-16 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
        <h1
          id="hero-heading"
          className="mx-auto max-w-4xl text-center text-[2.75rem] font-semibold leading-[1.03] tracking-[-0.03em] text-balance sm:text-6xl lg:text-7xl"
        >
          <span className="block">{hero.eyebrow}</span>
          <span className="block">{hero.headline}</span>
          <span className="block">{hero.headlineTail}</span>
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-center text-base leading-relaxed text-muted-foreground sm:mt-7 sm:text-lg">
          <span className="block">{hero.subhead[0]}</span>
          <span className="block">{hero.subhead[1]}</span>
        </p>

        <HeroPrompt />
      </div>
    </section>
  );
}
