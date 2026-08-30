"use client";

import * as React from "react";
import { ArrowUp, RefreshCw, Square } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { BuildSteps, upsertStep } from "@/components/app/build-steps";
import { ErrorNote, Skeleton } from "@/components/app/primitives";
import { getMessages, streamMessage } from "@/lib/api-client";
import type { AppSpec, BuildStep, Message, Project } from "@/lib/types";
import { cn, relativeTime } from "@/lib/utils";

const SUGGESTIONS = [
  "Add a report screen with revenue by month",
  "Let staff export any table to CSV",
  "Add roles so managers approve, staff submit",
  "Email me when a record is created",
];

interface LiveTurn {
  steps: BuildStep[];
  text: string;
  stopped?: boolean;
}

export function BuilderChat({
  project,
  onSpec,
  onProject,
  onStreamingChange,
}: {
  project: Project;
  onSpec: (spec: AppSpec) => void;
  onProject: (project: Project) => void;
  onStreamingChange?: (streaming: boolean) => void;
}) {
  const projectId = project.id;
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [live, setLive] = React.useState<LiveTurn | null>(null);
  const [streaming, setStreaming] = React.useState(false);
  const [streamError, setStreamError] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");

  const abortRef = React.useRef<(() => void) | null>(null);
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const lastSentRef = React.useRef<string>("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const history = await getMessages(projectId);
      setMessages(history);
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : "Could not load this conversation.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    onStreamingChange?.(streaming);
  }, [streaming, onStreamingChange]);

  React.useEffect(() => () => abortRef.current?.(), []);

  // Keep the transcript pinned to the newest content unless the reader scrolled up.
  React.useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
    if (distance < 220) node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages, live]);

  React.useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 200)}px`;
  }, [draft]);

  const send = React.useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || streaming) return;
      lastSentRef.current = trimmed;
      setDraft("");
      setStreamError(null);
      setStreaming(true);
      setLive({ steps: [], text: "" });
      setMessages((current) => [
        ...current,
        {
          id: `optimistic-${Date.now()}`,
          projectId,
          role: "user",
          content: trimmed,
          createdAt: new Date().toISOString(),
        },
      ]);

      abortRef.current = streamMessage(projectId, trimmed, {
        onStep: (step) =>
          setLive((current) => (current ? { ...current, steps: upsertStep(current.steps, step) } : current)),
        onToken: (text) =>
          setLive((current) => (current ? { ...current, text: current.text + text } : current)),
        onSpec: (spec) => onSpec(spec),
        onDone: (message, updated) => {
          setMessages((current) => [...current, message]);
          setLive(null);
          setStreaming(false);
          abortRef.current = null;
          if (updated) onProject(updated);
        },
        onError: (message) => {
          setStreamError(message || "The build stopped unexpectedly.");
          setLive(null);
          setStreaming(false);
          abortRef.current = null;
        },
      });
    },
    [onProject, onSpec, projectId, streaming],
  );

  const stop = () => {
    abortRef.current?.();
    abortRef.current = null;
    setStreaming(false);
    setLive((current) =>
      current
        ? {
            ...current,
            stopped: true,
            steps: current.steps.map((step) =>
              step.status === "running" ? { ...step, status: "pending" } : step,
            ),
          }
        : current,
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          {loading ? (
            <ChatSkeleton />
          ) : loadError ? (
            <ErrorNote
              message={loadError}
              action={
                <Button size="sm" variant="outline" onClick={() => void load()}>
                  <RefreshCw className="size-3.5" aria-hidden="true" />
                  Retry
                </Button>
              }
            />
          ) : messages.length === 0 && !live ? (
            <Intro prompt={project.prompt} onPick={send} />
          ) : null}

          {messages.map((message) =>
            message.role === "user" ? (
              <UserBubble key={message.id} message={message} />
            ) : (
              <AssistantTurn key={message.id} message={message} />
            ),
          )}

          {live ? (
            <AssistantTurn
              live
              stopped={live.stopped}
              streaming={streaming}
              steps={live.steps}
              text={live.text}
            />
          ) : null}

          {streamError ? (
            <ErrorNote
              message={streamError}
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setStreamError(null);
                    send(lastSentRef.current);
                  }}
                >
                  <RefreshCw className="size-3.5" aria-hidden="true" />
                  Try again
                </Button>
              }
            />
          ) : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-sm sm:px-5">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-border bg-card p-2 focus-within:border-ring/50 focus-within:ring-[3px] focus-within:ring-ring/25">
            <label htmlFor="builder-composer" className="sr-only">
              Ask Hercules for a change
            </label>
            <Textarea
              id="builder-composer"
              ref={textareaRef}
              rows={1}
              value={draft}
              disabled={streaming}
              placeholder={streaming ? "Hercules is building…" : "Ask for a change…"}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send(draft);
                }
              }}
              className="max-h-50 min-h-9 border-0 bg-transparent px-1.5 py-1.5 text-sm leading-relaxed shadow-none focus-visible:border-0 focus-visible:ring-0"
            />
            <div className="mt-1 flex items-center justify-between gap-2 pl-1.5">
              <p className="text-[11px] text-muted-foreground">
                <kbd className="font-sans font-medium">Enter</kbd> to send ·{" "}
                <kbd className="font-sans font-medium">Shift</kbd> +{" "}
                <kbd className="font-sans font-medium">Enter</kbd> for a new line
              </p>
              {streaming ? (
                <Button size="sm" variant="outline" onClick={stop}>
                  <Square className="size-3.5 fill-current" aria-hidden="true" />
                  Stop
                </Button>
              ) : (
                <Button
                  size="icon"
                  onClick={() => send(draft)}
                  disabled={draft.trim().length === 0}
                  aria-label="Send message"
                  className="size-8 rounded-lg"
                >
                  <ArrowUp className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserBubble({ message }: { message: Message }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-secondary px-3.5 py-2 text-sm leading-relaxed text-secondary-foreground">
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{relativeTime(message.createdAt)}</p>
      </div>
    </div>
  );
}

function AssistantTurn({
  message,
  steps,
  text,
  live,
  streaming,
  stopped,
}: {
  message?: Message;
  steps?: BuildStep[];
  text?: string;
  live?: boolean;
  streaming?: boolean;
  stopped?: boolean;
}) {
  const body = message?.content ?? text ?? "";
  const list = message?.steps ?? steps ?? [];
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
        <LogoMark className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1 space-y-2.5">
        {list.length > 0 ? (
          <div className="rounded-xl border border-border bg-card p-3">
            <BuildSteps steps={list} />
          </div>
        ) : null}
        {body || (live && !stopped) ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground">
            {body}
            {live && streaming ? (
              <span
                className="animate-caret ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-foreground"
                aria-hidden="true"
              />
            ) : null}
          </p>
        ) : null}
        {stopped ? (
          <p className="text-[13px] text-muted-foreground">Stopped. Send another message to carry on.</p>
        ) : null}
        {message ? (
          <p className="text-[11px] text-muted-foreground">{relativeTime(message.createdAt)}</p>
        ) : null}
      </div>
    </div>
  );
}

function Intro({ prompt, onPick }: { prompt: string; onPick: (value: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
          <LogoMark className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-relaxed">
            This app was built from your brief. Ask for anything you want changed — a new screen, a
            different field, a rule about who can see what — and I&rsquo;ll rebuild it live.
          </p>
          {prompt ? (
            <p className="mt-3 rounded-xl border border-border bg-muted/50 p-3 text-[13px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Your brief: </span>
              {prompt}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 pl-10">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onPick(suggestion)}
            className={cn(
              "rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground outline-none transition",
              "hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
            )}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <div className="flex justify-end">
        <Skeleton className="h-14 w-3/5 rounded-2xl" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="size-7 shrink-0 rounded-lg" />
        <div className="w-full space-y-2">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-3.5 w-4/5" />
          <Skeleton className="h-3.5 w-3/5" />
        </div>
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-2/5 rounded-2xl" />
      </div>
    </div>
  );
}
