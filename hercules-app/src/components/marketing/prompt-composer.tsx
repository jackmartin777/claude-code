"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Paperclip, X } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { hero } from "@/data/site";
import { cn } from "@/lib/utils";

type PromptComposerProps = {
  /** Placeholder shown in the textarea — swapped by the hero use-case tabs. */
  placeholder: string;
  /** Suggestion chips rendered beneath the composer; clicking one fills the textarea. */
  chips?: readonly string[];
  /** Accessible name for the chip row. */
  chipsLabel?: string;
  className?: string;
  rows?: number;
};

/**
 * The signature Hercules prompt composer. Submitting hands the prompt to the
 * signup flow, which picks it back up from the query string.
 */
export function PromptComposer({
  placeholder,
  chips = [],
  chipsLabel = "Example prompts",
  className,
  rows = 3,
}: PromptComposerProps) {
  const router = useRouter();
  const fieldId = React.useId();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [value, setValue] = React.useState("");
  const [attachment, setAttachment] = React.useState<string | null>(null);

  const submit = React.useCallback(() => {
    const prompt = value.trim();
    if (!prompt) return;
    router.push(`/signup?prompt=${encodeURIComponent(prompt)}`);
  }, [router, value]);

  const useChip = (chip: string) => {
    setValue(chip);
    const el = textareaRef.current;
    if (el) {
      el.focus();
      const end = chip.length;
      requestAnimationFrame(() => el.setSelectionRange(end, end));
    }
  };

  return (
    <div className={cn("mx-auto w-full max-w-2xl", className)}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div
          className={cn(
            "rounded-2xl border border-border bg-card shadow-lg shadow-foreground/5",
            "transition-[box-shadow,border-color] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30",
          )}
        >
          <label htmlFor={fieldId} className="sr-only">
            Describe the app you want to build
          </label>
          <textarea
            id={fieldId}
            ref={textareaRef}
            rows={rows}
            value={value}
            placeholder={placeholder}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                submit();
              }
            }}
            className={cn(
              "block w-full resize-none bg-transparent px-4 pt-4 text-[15px] leading-relaxed",
              "text-foreground outline-none placeholder:text-muted-foreground sm:px-5 sm:pt-5",
            )}
          />

          {attachment ? (
            <div className="px-4 pt-1 sm:px-5">
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                <Paperclip className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{attachment}</span>
                <button
                  type="button"
                  onClick={() => {
                    setAttachment(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  aria-label={`Remove ${attachment}`}
                  className="-mr-1 rounded-full p-0.5 outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </span>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 p-3 sm:p-4">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              tabIndex={-1}
              className="hidden"
              onChange={(event) => setAttachment(event.target.files?.[0]?.name ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={cn(
                buttonClasses("ghost", "sm"),
                "text-muted-foreground hover:text-foreground",
              )}
            >
              <Paperclip className="size-4" aria-hidden="true" />
              Attach Image
            </button>

            <button
              type="submit"
              disabled={value.trim().length === 0}
              className={cn(buttonClasses("primary", "md"), "group")}
            >
              {hero.cta}
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </form>

      {chips.length > 0 ? (
        <div
          role="group"
          aria-label={chipsLabel}
          className="mt-4 flex flex-wrap items-center justify-center gap-2"
        >
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => useChip(chip)}
              className={cn(
                "rounded-full border border-border bg-card px-3 py-1.5 text-[13px] text-muted-foreground",
                "transition-colors hover:bg-accent hover:text-accent-foreground",
                "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              )}
            >
              {chip}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
