"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const topics = [
  "Getting started",
  "Billing and plans",
  "A bug in my app",
  "Custom domains",
  "Enterprise and security",
  "Something else",
];

type Errors = Partial<Record<"name" | "email" | "topic" | "message", string>>;

const fieldClass = (invalid?: boolean) =>
  cn(invalid && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30");

export function ContactForm() {
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [name, setName] = React.useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      topic: String(form.get("topic") ?? "").trim(),
      message: String(form.get("message") ?? "").trim(),
    };

    const next: Errors = {};
    if (!values.name) next.name = "Tell us who you are.";
    if (!values.email) next.email = "We need an email address to reply to.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email))
      next.email = "That does not look like a valid email address.";
    if (!values.topic) next.topic = "Pick the closest topic.";
    if (!values.message) next.message = "Let us know what is going on.";
    else if (values.message.length < 20)
      next.message = "A little more detail helps us answer on the first reply.";

    setErrors(next);

    if (Object.keys(next).length === 0) {
      setName(values.name);
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-border bg-card p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      >
        <CheckCircle2 aria-hidden="true" className="mx-auto size-9 text-success" />
        <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
          Thanks{name ? `, ${name.split(" ")[0]}` : ""} — your message is on its way
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-pretty text-muted-foreground">
          A human reads every message. Most are answered within one business day, and
          priority plans are answered within four working hours.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => {
            setSubmitted(false);
            setErrors({});
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">
            Name <span className="text-muted-foreground">*</span>
          </Label>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            className={cn("mt-2", fieldClass(Boolean(errors.name)))}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
          />
          {errors.name ? (
            <p id="contact-name-error" className="mt-1.5 text-[13px] text-destructive">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="contact-email">
            Work email <span className="text-muted-foreground">*</span>
          </Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            className={cn("mt-2", fieldClass(Boolean(errors.email)))}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
          />
          {errors.email ? (
            <p id="contact-email-error" className="mt-1.5 text-[13px] text-destructive">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="contact-company">Company</Label>
          <Input
            id="contact-company"
            name="company"
            autoComplete="organization"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="contact-topic">
            Topic <span className="text-muted-foreground">*</span>
          </Label>
          <select
            id="contact-topic"
            name="topic"
            defaultValue=""
            aria-invalid={errors.topic ? true : undefined}
            aria-describedby={errors.topic ? "contact-topic-error" : undefined}
            className={cn(
              "mt-2 flex h-9.5 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition",
              "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40",
              fieldClass(Boolean(errors.topic)),
            )}
          >
            <option value="" disabled>
              Choose a topic
            </option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
          {errors.topic ? (
            <p id="contact-topic-error" className="mt-1.5 text-[13px] text-destructive">
              {errors.topic}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="contact-message">
            How can we help? <span className="text-muted-foreground">*</span>
          </Label>
          <Textarea
            id="contact-message"
            name="message"
            rows={6}
            placeholder="Tell us what you are building, what you expected to happen, and what happened instead. A link to the app helps."
            className={cn("mt-2", fieldClass(Boolean(errors.message)))}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
          />
          {errors.message ? (
            <p id="contact-message-error" className="mt-1.5 text-[13px] text-destructive">
              {errors.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[13px] text-muted-foreground">
          Fields marked * are required.
        </p>
        <Button type="submit" size="lg">
          Send message
        </Button>
      </div>
    </form>
  );
}
