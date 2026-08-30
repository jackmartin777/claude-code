"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getMe, listProjects, logout } from "@/lib/api-client";
import type { Project, User } from "@/lib/types";

interface SessionValue {
  user: User | null;
  projects: Project[];
  loading: boolean;
  projectsLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  upsertProject: (project: Project) => void;
  removeProject: (id: string) => void;
  spendCredits: (amount: number) => void;
  setUser: (user: User) => void;
  signOut: (options?: { everywhere?: boolean }) => Promise<void>;
}

const SessionContext = React.createContext<SessionValue | null>(null);

export function useSession(): SessionValue {
  const value = React.useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside <SessionProvider>");
  return value;
}

export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [projectsLoading, setProjectsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
      if (!me) {
        router.replace("/login");
        return;
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load your account.");
    } finally {
      setLoading(false);
    }

    try {
      setProjectsLoading(true);
      const list = await listProjects();
      setProjects(list);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load your apps.");
    } finally {
      setProjectsLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const upsertProject = React.useCallback((project: Project) => {
    setProjects((current) => {
      const index = current.findIndex((item) => item.id === project.id);
      if (index === -1) return [project, ...current];
      const next = current.slice();
      next[index] = project;
      return next;
    });
  }, []);

  const removeProject = React.useCallback((id: string) => {
    setProjects((current) => current.filter((item) => item.id !== id));
  }, []);

  const spendCredits = React.useCallback((amount: number) => {
    setUser((current) =>
      current ? { ...current, credits: Math.max(0, current.credits - amount) } : current,
    );
  }, []);

  const signOut = React.useCallback(async (options?: { everywhere?: boolean }) => {
    try {
      await logout(options);
    } catch {
      /* the session is being discarded either way */
    }
    setUser(null);
    setProjects([]);
    router.replace("/login");
    router.refresh();
  }, [router]);

  const value = React.useMemo<SessionValue>(
    () => ({
      user,
      projects,
      loading,
      projectsLoading,
      error,
      refresh: load,
      upsertProject,
      removeProject,
      spendCredits,
      setUser,
      signOut,
    }),
    [
      user,
      projects,
      loading,
      projectsLoading,
      error,
      load,
      upsertProject,
      removeProject,
      spendCredits,
      signOut,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
