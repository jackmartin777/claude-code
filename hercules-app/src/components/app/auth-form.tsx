"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ErrorNote, Spinner } from "@/components/app/primitives";
import { createProject, login, signup } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const DEMO_EMAIL = "alex@northwind.co";
const DEMO_PASSWORD = "demo";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Record<string, string>;

function Field({
  id,
  label,
  error,
  children,
  hint,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {hint}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-[13px] text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  invalid,
  autoComplete,
  placeholder = "••••••••",
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  autoComplete: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        name={id}
        type={visible ? "text" : "password"}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={cn("pr-10", invalid && "border-destructive")}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-muted-foreground outline-none transition hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-7">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function DemoButton({
  pending,
  onClick,
}: {
  pending: boolean;
  onClick: () => void;
}) {
  return (
    <>
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <Button type="button" variant="outline" className="w-full" onClick={onClick} disabled={pending}>
        {pending ? <Spinner label="Signing in" /> : <Sparkles className="size-4" />}
        Continue with the demo account
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Signs you in as {DEMO_EMAIL} with a workspace of sample apps.
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */

export function LoginForm({ prompt = "" }: { prompt?: string }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Errors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<"form" | "demo" | null>(null);

  const finish = React.useCallback(() => {
    router.push("/dashboard");
    router.refresh();
  }, [router]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Errors = {};
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (password.length < 1) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setFormError(null);
    setPending("form");
    try {
      await login(email.trim(), password);
      finish();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "We could not sign you in.");
      setPending(null);
    }
  };

  const demo = async () => {
    setFormError(null);
    setPending("demo");
    try {
      await login(DEMO_EMAIL, DEMO_PASSWORD);
      finish();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "The demo account is unavailable.");
      setPending(null);
    }
  };

  const signupHref = prompt
    ? `/signup?prompt=${encodeURIComponent(prompt)}`
    : "/signup";

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to keep building.">
      <form onSubmit={submit} noValidate className="space-y-4">
        {formError ? <ErrorNote message={formError} /> : null}
        <Field id="email" label="Email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            onChange={(event) => setEmail(event.target.value)}
            className={cn(errors.email && "border-destructive")}
          />
        </Field>
        <Field
          id="password"
          label="Password"
          error={errors.password}
          hint={
            <Link
              href="/support"
              className="rounded text-xs text-muted-foreground underline-offset-2 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              Forgot password?
            </Link>
          }
        >
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            invalid={Boolean(errors.password)}
            autoComplete="current-password"
          />
        </Field>
        <Button type="submit" size="lg" className="w-full" disabled={pending !== null}>
          {pending === "form" ? <Spinner label="Signing in" /> : null}
          {pending === "form" ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <DemoButton pending={pending === "demo"} onClick={demo} />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Hercules?{" "}
        <Link
          href={signupHref}
          className="rounded font-medium text-foreground underline-offset-2 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}

/* ------------------------------------------------------------------ */

export function SignupForm({ prompt = "" }: { prompt?: string }) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Errors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<"form" | "demo" | null>(null);
  const [stage, setStage] = React.useState<"idle" | "creating">("idle");

  /** After auth: if the visitor arrived with an idea, build it immediately. */
  const finish = React.useCallback(async () => {
    if (prompt.trim()) {
      try {
        setStage("creating");
        const project = await createProject({ prompt: prompt.trim() });
        router.push(`/dashboard/${project.id}`);
        router.refresh();
        return;
      } catch {
        /* fall through to the dashboard — the prompt is still in the composer */
      }
    }
    router.push("/dashboard");
    router.refresh();
  }, [prompt, router]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Tell us what to call you.";
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid work email address.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setFormError(null);
    setPending("form");
    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        company: company.trim() || undefined,
      });
      await finish();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "We could not create your account.");
      setPending(null);
      setStage("idle");
    }
  };

  const demo = async () => {
    setFormError(null);
    setPending("demo");
    try {
      await login(DEMO_EMAIL, DEMO_PASSWORD);
      await finish();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "The demo account is unavailable.");
      setPending(null);
      setStage("idle");
    }
  };

  const busy = pending !== null;

  return (
    <div className="space-y-4">
      {prompt ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-foreground" aria-hidden="true" />
            You&rsquo;re about to build:
          </p>
          <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-foreground">{prompt}</p>
          <p className="mt-2.5 flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowRight className="size-3.5" aria-hidden="true" />
            Create your account and Hercules starts building it.
          </p>
        </div>
      ) : null}

      <AuthCard
        title="Create your account"
        subtitle={prompt ? "One step and your app starts building." : "Build your first app in a couple of minutes."}
      >
        <form onSubmit={submit} noValidate className="space-y-4">
          {formError ? <ErrorNote message={formError} /> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Name" error={errors.name}>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                placeholder="Alex Whitfield"
                value={name}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? "name-error" : undefined}
                onChange={(event) => setName(event.target.value)}
                className={cn(errors.name && "border-destructive")}
              />
            </Field>
            <Field id="company" label="Company">
              <Input
                id="company"
                name="company"
                autoComplete="organization"
                placeholder="Northwind"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              />
            </Field>
          </div>
          <Field id="email" label="Work email" error={errors.email}>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "email-error" : undefined}
              onChange={(event) => setEmail(event.target.value)}
              className={cn(errors.email && "border-destructive")}
            />
          </Field>
          <Field id="password" label="Password" error={errors.password}>
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              invalid={Boolean(errors.password)}
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
          </Field>
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {pending === "form" ? <Spinner label="Creating your account" /> : null}
            {stage === "creating"
              ? "Starting your build…"
              : pending === "form"
                ? "Creating account…"
                : prompt
                  ? "Create account & build"
                  : "Create account"}
          </Button>
        </form>

        <DemoButton pending={pending === "demo"} onClick={demo} />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="rounded font-medium text-foreground underline-offset-2 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            Sign in
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
