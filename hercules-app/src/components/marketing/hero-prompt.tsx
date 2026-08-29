"use client";

import * as React from "react";
import { useCaseTabs } from "@/data/site";
import { PromptComposer } from "@/components/marketing/prompt-composer";
import { cn } from "@/lib/utils";

/** Use-case pills + composer. The pills swap the placeholder and the chip row. */
export function HeroPrompt() {
  const [activeId, setActiveId] = React.useState(useCaseTabs[0].id);
  const active = useCaseTabs.find((tab) => tab.id === activeId) ?? useCaseTabs[0];

  return (
    <div className="mt-10 sm:mt-12">
      <div
        role="group"
        aria-label="Choose what you want to build"
        className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-2"
      >
        {useCaseTabs.map((tab) => {
          const isActive = tab.id === active.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                "inline-flex h-9 items-center rounded-full border px-4 text-[13px] font-medium sm:text-sm",
                "transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                isActive
                  ? "border-transparent bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <PromptComposer
        className="mt-6"
        placeholder={active.prompt}
        chips={active.chips}
        chipsLabel={`${active.label} examples`}
      />
    </div>
  );
}
