"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Mail, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Dialog } from "@/components/app/dialog";
import { EmptyState, ErrorNote, Meter, Skeleton, Spinner } from "@/components/app/primitives";
import { PLAN_META } from "@/components/app/catalog";
import { updateProfile } from "@/lib/api-client";
import { useSession } from "@/components/app/session";
import { deleteProject } from "@/lib/api-client";
import type { Member, Role } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "workspace", label: "Workspace" },
  { id: "members", label: "Members" },
  { id: "billing", label: "Billing" },
  { id: "danger", label: "Danger zone" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const ROLE_TONE: Record<Role, string> = {
  owner: "bg-ring/18 text-foreground",
  admin: "bg-ring/12 text-foreground",
  editor: "bg-muted text-muted-foreground",
  viewer: "bg-muted text-muted-foreground",
};

export function SettingsView() {
  const [tab, setTab] = React.useState<TabId>("profile");
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const { loading } = useSession();

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const index = TABS.findIndex((item) => item.id === tab);
    const next = TABS[(index + (event.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
    setTab(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account, this workspace and who can get into it.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Settings sections"
        onKeyDown={onKeyDown}
        className="mt-5 flex gap-1 overflow-x-auto border-b border-border"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            ref={(node) => {
              tabRefs.current[item.id] = node;
            }}
            type="button"
            role="tab"
            id={`settings-tab-${item.id}`}
            aria-controls={`settings-panel-${item.id}`}
            aria-selected={tab === item.id}
            tabIndex={tab === item.id ? 0 : -1}
            onClick={() => setTab(item.id)}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50",
              tab === item.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`settings-panel-${tab}`}
        aria-labelledby={`settings-tab-${tab}`}
        tabIndex={0}
        className="mt-5 outline-none"
      >
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : tab === "profile" ? (
          <ProfilePanel />
        ) : tab === "workspace" ? (
          <WorkspacePanel />
        ) : tab === "members" ? (
          <MembersPanel />
        ) : tab === "billing" ? (
          <BillingPanel />
        ) : (
          <DangerPanel />
        )}
      </div>
    </div>
  );
}

function Panel({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-5">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="p-5">{children}</div>
      {footer ? (
        <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-3">
          {footer}
        </div>
      ) : null}
    </section>
  );
}

function ProfilePanel() {
  const { user, setUser } = useSession();
  const [name, setName] = React.useState(user?.name ?? "");
  const [company, setCompany] = React.useState(user?.company ?? "");
  const [saved, setSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!user) return null;

  // Persist for real: reporting "Profile saved" after a timer meant the old
  // name came back on the next navigation.
  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const updated = await updateProfile({ name: name.trim(), company: company.trim() });
      setUser(updated);
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel
      title="Profile"
      description="How you appear to your teammates."
      footer={
        <>
          {error ? (
            <p className="mr-auto text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : saved ? (
            <p className="mr-auto flex items-center gap-1.5 text-sm text-success">
              <Check className="size-4" aria-hidden="true" />
              Profile saved
            </p>
          ) : null}
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? <Spinner label="Saving" /> : null}
            Save changes
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground"
        >
          {initials(user.name)}
        </span>
        <div className="text-sm">
          <p className="font-medium">{user.name}</p>
          <p className="text-muted-foreground">
            Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">Name</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setSaved(false);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="profile-company">Company</Label>
          <Input
            id="profile-company"
            value={company}
            placeholder="Northwind"
            onChange={(event) => {
              setCompany(event.target.value);
              setSaved(false);
            }}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" value={user.email} readOnly aria-readonly className="bg-muted/60" />
          <p className="text-xs text-muted-foreground">
            Contact support to change the email on your account.
          </p>
        </div>
      </div>
    </Panel>
  );
}

function WorkspacePanel() {
  const { user, projects } = useSession();
  const [workspace, setWorkspace] = React.useState(user?.company || "My workspace");
  const live = projects.filter((project) => project.status === "live").length;

  return (
    <div className="space-y-4">
      <Panel
        title="Workspace"
        description="Everything you build lives inside this workspace."
        footer={<Button>Save workspace</Button>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="workspace-name">Workspace name</Label>
            <Input
              id="workspace-name"
              value={workspace}
              onChange={(event) => setWorkspace(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="workspace-region">Data region</Label>
            <Input id="workspace-region" value="EU (Frankfurt)" readOnly className="bg-muted/60" />
          </div>
        </div>
      </Panel>
      <dl className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Apps", value: projects.length.toString() },
          { label: "Live apps", value: live.toString() },
          {
            label: "Members",
            value: new Set(
              projects.flatMap((project) => project.members.map((member) => member.email)),
            ).size.toString(),
          },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card px-4 py-3">
            <dt className="text-xs text-muted-foreground">{item.label}</dt>
            <dd className="mt-0.5 text-xl font-semibold tracking-tight tabular-nums">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function MembersPanel() {
  const { user, projects, projectsLoading } = useSession();
  const [invites, setInvites] = React.useState<{ email: string; role: Role }[]>([]);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<Role>("editor");
  const [error, setError] = React.useState<string | null>(null);

  const members = React.useMemo(() => {
    const map = new Map<string, Member>();
    if (user) {
      map.set(user.email, { id: user.id, name: user.name, email: user.email, role: "owner" });
    }
    for (const project of projects) {
      for (const member of project.members) {
        if (!map.has(member.email)) map.set(member.email, member);
      }
    }
    return Array.from(map.values());
  }, [projects, user]);

  const invite = (event: React.FormEvent) => {
    event.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Enter a valid email address.");
      return;
    }
    if (members.some((member) => member.email.toLowerCase() === value)) {
      setError("That person is already in this workspace.");
      return;
    }
    setError(null);
    setInvites((current) => [...current, { email: value, role }]);
    setEmail("");
  };

  return (
    <div className="space-y-4">
      <Panel title="Invite a teammate" description="They get an email with a link into this workspace.">
        <form onSubmit={invite} className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1 space-y-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              placeholder="teammate@company.com"
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
              className="h-9.5 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <Button type="submit">
            <Mail className="size-4" aria-hidden="true" />
            Send invite
          </Button>
        </form>
        {error ? <ErrorNote className="mt-3" message={error} /> : null}
      </Panel>

      <Panel title="Members" description="Everyone with access to the apps in this workspace.">
        {projectsLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <EmptyState title="No members yet" description="Invite someone above to share your apps." />
        ) : (
          <ul className="divide-y divide-border">
            {members.map((member) => (
              <li key={member.email} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold"
                >
                  {initials(member.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{member.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                    ROLE_TONE[member.role],
                  )}
                >
                  {member.role}
                </span>
              </li>
            ))}
            {invites.map((item) => (
              <li key={item.email} className="flex items-center gap-3 py-2.5">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-xs font-semibold text-muted-foreground"
                >
                  {initials(item.email)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.email}</p>
                  <p className="text-xs text-muted-foreground">Invitation sent</p>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                  {item.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function BillingPanel() {
  const { user } = useSession();
  if (!user) return null;
  const plan = PLAN_META[user.plan];
  const used = Math.max(0, plan.credits - user.credits);
  const months = ["This month", "Last month", "Two months ago"];

  return (
    <div className="space-y-4">
      <Panel title="Plan" description={plan.blurb}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold tracking-tight">
              {plan.label}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {plan.price}
                {plan.price.startsWith("$") ? " per month" : ""}
              </span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {plan.credits.toLocaleString("en-US")} build credits included each month
            </p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex h-9.5 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground outline-none transition hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            Change plan
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline justify-between text-xs text-muted-foreground">
            <span>{used.toLocaleString("en-US")} credits used</span>
            <span>{user.credits.toLocaleString("en-US")} remaining</span>
          </div>
          <Meter value={used} max={plan.credits} className="mt-1.5" />
        </div>
      </Panel>

      <Panel title="Invoices" description="Billing history for this workspace.">
        <ul className="divide-y divide-border">
          {months.map((month, index) => (
            <li key={month} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <span className="min-w-0 flex-1 truncate text-sm">{month}</span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {plan.price.startsWith("$") ? plan.price : "—"}
              </span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  index === 0 ? "bg-muted text-muted-foreground" : "bg-success/12 text-success",
                )}
              >
                {index === 0 ? "Open" : "Paid"}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function DangerPanel() {
  const { projects, removeProject, signOut } = useSession();
  const [open, setOpen] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const wipe = async () => {
    setPending(true);
    setError(null);
    try {
      for (const project of projects) {
        await deleteProject(project.id);
        removeProject(project.id);
      }
      setOpen(false);
      setConfirmText("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Some apps could not be deleted.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="rounded-xl border border-destructive/40 bg-card">
      <div className="border-b border-destructive/30 p-5">
        <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight text-destructive">
          <TriangleAlert className="size-4" aria-hidden="true" />
          Danger zone
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These actions are permanent. There is no undo and no export afterwards.
        </p>
      </div>
      <div className="space-y-4 p-5">
        {error ? <ErrorNote message={error} /> : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">Delete every app</p>
            <p className="text-sm text-muted-foreground">
              Removes all {projects.length} app{projects.length === 1 ? "" : "s"}, their data models
              and every version.
            </p>
          </div>
          <Button
            variant="destructive"
            disabled={projects.length === 0}
            onClick={() => setOpen(true)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete all apps
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">Sign out everywhere</p>
            <p className="text-sm text-muted-foreground">
              Ends this session on every device you are signed in on.
            </p>
          </div>
          <Button variant="outline" onClick={() => void signOut({ everywhere: true })}>
            Sign out everywhere
          </Button>
        </div>
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete every app?"
        description={`This deletes all ${projects.length} apps in this workspace. Type "delete" to confirm.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={pending || confirmText.trim().toLowerCase() !== "delete"}
              onClick={() => void wipe()}
            >
              {pending ? <Spinner label="Deleting" /> : null}
              {pending ? "Deleting…" : "Delete everything"}
            </Button>
          </>
        }
      >
        <div className="space-y-1.5">
          <Label htmlFor="danger-confirm">Type delete to confirm</Label>
          <Input
            id="danger-confirm"
            value={confirmText}
            autoComplete="off"
            onChange={(event) => setConfirmText(event.target.value)}
          />
        </div>
      </Dialog>
    </section>
  );
}
