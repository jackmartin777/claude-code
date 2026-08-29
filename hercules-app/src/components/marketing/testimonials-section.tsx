import * as React from "react";
import { Quote } from "lucide-react";
import { testimonials, type Testimonial } from "@/data/site";
import { cn } from "@/lib/utils";

const COLUMN_DURATIONS = ["52s", "68s", "58s"];
const COLUMN_VISIBILITY = ["block", "hidden md:block", "hidden lg:block"];

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <figure className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <blockquote className="text-[13.5px] leading-relaxed text-foreground/90">
        {item.quote}
      </blockquote>
      <figcaption className="mt-4 text-[13px]">
        <span className="font-medium">{item.name}</span>
        {item.role ? (
          <span className="block text-muted-foreground">{item.role}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}

function Column({ items, duration }: { items: Testimonial[]; duration: string }) {
  const group = (decorative?: boolean) => (
    <div
      aria-hidden={decorative || undefined}
      className="flex shrink-0 flex-col [gap:var(--marquee-gap)]"
    >
      {items.map((item, index) => (
        <TestimonialCard key={`${item.name}-${index}${decorative ? "-clone" : ""}`} item={item} />
      ))}
    </div>
  );

  return (
    <div
      className="flex flex-col animate-marquee-y [gap:var(--marquee-gap)]"
      style={
        {
          "--marquee-duration": duration,
          "--marquee-gap": "1rem",
        } as React.CSSProperties
      }
    >
      {group()}
      {group(true)}
    </div>
  );
}

export function TestimonialsSection() {
  const featured = testimonials.find((item) => item.featured);
  const rest = testimonials.filter((item) => !item.featured);
  const columns = [0, 1, 2].map((column) => rest.filter((_, index) => index % 3 === column));

  return (
    <section aria-labelledby="testimonials-heading" className="py-20 sm:py-24 lg:py-28">
      <div className="container-page">
        <h2
          id="testimonials-heading"
          className="text-center text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance sm:text-4xl lg:text-5xl"
        >
          <span className="block">Never coded before?</span>
          <span className="block text-muted-foreground">Neither have our customers</span>
        </h2>
        <p className="mt-5 text-center text-sm font-medium text-muted-foreground">
          Loved by 100k+ businesses
        </p>

        {featured ? (
          <figure className="relative mx-auto mt-12 max-w-3xl rounded-2xl border border-border bg-card p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:mt-14 sm:p-10">
            <Quote
              className="absolute right-6 top-6 size-10 text-ring/25 sm:size-12"
              aria-hidden="true"
            />
            <blockquote className="relative max-w-2xl text-lg font-medium leading-relaxed tracking-[-0.01em] text-balance sm:text-xl">
              {featured.quote}
            </blockquote>
            <figcaption className="mt-6 text-sm">
              <span className="font-medium">{featured.name}</span>
              {featured.role ? (
                <span className="block text-muted-foreground">{featured.role}</span>
              ) : null}
            </figcaption>
          </figure>
        ) : null}

        <div className="mt-6 grid gap-4 sm:mt-8 md:grid-cols-2 lg:grid-cols-3">
          {columns.map((items, index) => (
            <div
              key={index}
              className={cn(
                "marquee-paused h-[28rem] overflow-hidden lg:h-[32rem]",
                "[mask-image:linear-gradient(to_bottom,transparent_0,black_12%,black_88%,transparent_100%)]",
                COLUMN_VISIBILITY[index],
              )}
            >
              <Column items={items} duration={COLUMN_DURATIONS[index]} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
