/**
 * Typed, browser-safe client for the Hercules API.
 *
 * Import this from client components. It deliberately imports nothing but
 * `types.ts` - no store, no node builtins - so it is safe in any bundle.
 * Every call throws `ApiClientError` on a non-2xx response, and
 * `streamMessage` parses the server-sent build stream.
 */

import type {
  AppSpec,
  BuildEvent,
  BuildStep,
  Message,
  Project,
  ProjectKind,
  User,
  Version,
} from "./types";

export class ApiClientError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

const JSON_HEADERS: HeadersInit = { "Content-Type": "application/json" };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      credentials: "same-origin",
      ...init,
    });
  } catch (error) {
    throw new ApiClientError(
      error instanceof Error ? error.message : "Network request failed.",
      0
    );
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "error" in payload
        ? String((payload as { error: unknown }).error)
        : `Request failed with status ${response.status}.`;
    throw new ApiClientError(message, response.status);
  }

  return payload as T;
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export function login(email: string, password: string): Promise<User> {
  return request<User>("/api/auth/login", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ email, password }),
  });
}

export function signup(input: {
  name: string;
  email: string;
  password: string;
  company?: string;
}): Promise<User> {
  return request<User>("/api/auth/signup", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export function logout(): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}

export function getMe(): Promise<User | null> {
  return request<User | null>("/api/auth/me", { cache: "no-store" });
}

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export function listProjects(): Promise<Project[]> {
  return request<Project[]>("/api/projects", { cache: "no-store" });
}

export function getProject(id: string): Promise<Project> {
  return request<Project>(`/api/projects/${encodeURIComponent(id)}`, { cache: "no-store" });
}

export function createProject(input: {
  prompt: string;
  kind?: ProjectKind;
  name?: string;
}): Promise<Project> {
  return request<Project>("/api/projects", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export type ProjectUpdate = Partial<
  Pick<
    Project,
    "name" | "prompt" | "kind" | "status" | "domain" | "version" | "spec" | "members" | "metrics"
  >
>;

export function updateProject(id: string, patch: ProjectUpdate): Promise<Project> {
  return request<Project>(`/api/projects/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(patch),
  });
}

export function deleteProject(id: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(`/api/projects/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function getMessages(projectId: string): Promise<Message[]> {
  return request<Message[]>(`/api/projects/${encodeURIComponent(projectId)}/messages`, {
    cache: "no-store",
  });
}

export function getVersions(projectId: string): Promise<Version[]> {
  return request<Version[]>(`/api/projects/${encodeURIComponent(projectId)}/versions`, {
    cache: "no-store",
  });
}

export function publishProject(projectId: string, domain?: string): Promise<Project> {
  return request<Project>(`/api/projects/${encodeURIComponent(projectId)}/publish`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(domain ? { domain } : {}),
  });
}

/* ------------------------------------------------------------------ */
/* The streaming build                                                 */
/* ------------------------------------------------------------------ */

export interface StreamHandlers {
  /** Fired every time a build step changes state. */
  onStep?: (step: BuildStep) => void;
  /** Fired for each word of the assistant's reply. */
  onToken?: (text: string) => void;
  /** Fired once with the updated app spec. */
  onSpec?: (spec: AppSpec) => void;
  /** Fired once when the build is persisted. */
  onDone?: (message: Message, project: Project) => void;
  /**
   * Fired on a server-reported or transport error. The first argument is a
   * display-ready message; the second carries the typed error (an
   * `ApiClientError` with a `status` when the failure came from the server).
   */
  onError?: (message: string, error: Error) => void;
}

function isBuildEvent(value: unknown): value is BuildEvent {
  return typeof value === "object" && value !== null && "type" in value;
}

function dispatch(event: BuildEvent, handlers: StreamHandlers): void {
  switch (event.type) {
    case "step":
      handlers.onStep?.(event.step);
      break;
    case "token":
      handlers.onToken?.(event.text);
      break;
    case "spec":
      handlers.onSpec?.(event.spec);
      break;
    case "done":
      handlers.onDone?.(event.message, event.project);
      break;
    case "error":
      handlers.onError?.(event.message, new Error(event.message));
      break;
  }
}

/**
 * POST a chat message and consume the server-sent build stream.
 *
 * Returns an abort function; calling it cancels the request and stops any
 * further callbacks. The build itself is still persisted server-side.
 */
export function streamMessage(
  projectId: string,
  content: string,
  handlers: StreamHandlers
): () => void {
  const controller = new AbortController();
  let aborted = false;

  const run = async (): Promise<void> => {
    const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/messages`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ content }),
      credentials: "same-origin",
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      let message = `Request failed with status ${response.status}.`;
      try {
        const parsed: unknown = JSON.parse(text);
        if (typeof parsed === "object" && parsed !== null && "error" in parsed) {
          message = String((parsed as { error: unknown }).error);
        }
      } catch {
        // Non-JSON error body: keep the status message.
      }
      throw new ApiClientError(message, response.status);
    }

    const body = response.body;
    if (!body) throw new ApiClientError("The server returned an empty stream.", 502);

    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (!aborted) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const rawEvent = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        for (const line of rawEvent.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;
          try {
            const parsed: unknown = JSON.parse(payload);
            if (isBuildEvent(parsed)) dispatch(parsed, handlers);
          } catch {
            // Ignore malformed frames rather than killing the stream.
          }
        }
        boundary = buffer.indexOf("\n\n");
      }
    }
  };

  run().catch((error: unknown) => {
    if (aborted) return;
    if (error instanceof DOMException && error.name === "AbortError") return;
    const typed = error instanceof Error ? error : new Error("The build stream failed.");
    handlers.onError?.(typed.message, typed);
  });

  return () => {
    if (aborted) return;
    aborted = true;
    controller.abort();
  };
}
