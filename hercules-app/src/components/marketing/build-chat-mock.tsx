"use client";

import * as React from "react";
import { Check, Sparkles } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { buildTimeline } from "@/data/site";
import { cn } from "@/lib/utils";

const PROMPT = "Build a CRM for my 75 person sales team";
const READY = "Your CRM is ready";
const STEP_MS = 720;

/** Total reveals: the prompt bubble, one per build step, then the ready line. */
const TOTAL = buildTimeline.length + 2;

export function BuildChatMock() {
  const ref = React.useRef<HTMLDivElement>(null);
  // Rendered complete on the server so the panel reads correctly without JS;
  // the effect rewinds it before the observer plays the sequence back.
  const [revealed, setRevealed] = React.useState(TOTAL);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const start = () => {
      for (let i = 1; i <= TOTAL; i += 1) {
        timers.push(setTimeout(() => setRevealed(i), i * STEP_MS));
      }
    };

    if (typeof IntersectionObserver === "undefined") return;

    setRevealed(0);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect();
            start();
          }
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  const shown = (index: number) => revealed > index;

  return (
    <div
      ref={ref}
      className="rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6"
    >
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <LogoMark className="size-5" />
        <span className="text-[13px] font-medium">Hercules</span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Sparkles className="size-3" aria-hidden="true" />
          Building
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div
          className={cn(
            "flex justify-end transition-all duration-500",
            shown(0) ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
          )}
        >
          <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-[13px] leading-snug text-primary-foreground">
            {PROMPT}
          </p>
        </div>

        <ol className="flex flex-col gap-2.5">
          {buildTimeline.map((step, index) => {
            const visible = shown(index + 1);
            return (
              <li
                key={step.verb + step.subject}
                className={cn(
                  "flex items-center gap-2.5 transition-all duration-500",
                  visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success",
                    "transition-transform duration-300",
                    visible ? "scale-100" : "scale-0",
                  )}
                  style={{ transitionDelay: visible ? "180ms" : "0ms" }}
                >
                  <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                </span>
                <span className="text-[13px] text-muted-foreground">
                  {`${step.verb} ${step.subject}`.trim()}
                </span>
              </li>
            );
          })}
        </ol>

        <p
          className={cn(
            "mt-1 text-[13px] font-medium transition-all duration-500",
            shown(TOTAL - 1) ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
          )}
        >
          {READY}
        </p>
      </div>
    </div>
  );
}
