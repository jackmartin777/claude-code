import { z } from "zod";

import {
  applyFollowUp,
  generateSpec,
  initialReply,
  planBuildSteps,
} from "@/lib/generator";
import {
  apiError,
  forbidden,
  json,
  notFound,
  readBody,
  requireUser,
  routeWithParams,
  unauthorized,
} from "@/lib/session";
import {
  addMessage,
  commitBuild,
  getProject,
  listMessages,
  spendCredits,
  updateProject,
} from "@/lib/store";
import type { AppSpec, BuildEvent, BuildStep } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

const messageSchema = z.object({
  content: z.string().trim().min(2, "Say what you would like to change.").max(4000),
});

/** GET /api/projects/:id/messages -> Message[] */
export const GET = routeWithParams<Params>(async (_request, context) => {
  const user = await requireUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const project = await getProject(id);
  if (!project) return notFound("Project");
  if (project.ownerId !== user.id) return forbidden();

  return json(await listMessages(id));
});

/* ------------------------------------------------------------------ */
/* The streaming build                                                 */
/* ------------------------------------------------------------------ */

const encoder = new TextEncoder();

function frame(event: BuildEvent): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Deterministic 250-700ms stagger so the UI animates at a human pace. */
function stepDelay(step: BuildStep, index: number): number {
  let h = 2166136261;
  const seed = `${step.id}:${index}`;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return 250 + ((h >>> 0) % 451);
}

/**
 * POST /api/projects/:id/messages { content } -> SSE stream of BuildEvent
 *
 * Emits `step` events as each build step moves pending -> running -> done,
 * interleaves `token` events carrying the assistant reply word by word, then a
 * `spec` event with the updated AppSpec and a final `done` event carrying the
 * persisted Message and Project.
 */
/**
 * One build at a time per project.
 *
 * Deriving a follow-up reads the project's spec, generates the next one from
 * it, then commits. Two overlapping requests would each derive from the same
 * pre-build snapshot and the second commit would overwrite the first, silently
 * dropping a change made in another tab. commitBuild serialises its own writes,
 * but the read-derive-commit sequence has to be atomic as a whole.
 */
const buildLocks = new Map<string, Promise<void>>();

/**
 * Waits for any build already running on this project, then claims the slot.
 * The returned release must be called once the build has committed - the lock
 * has to span the whole read-derive-commit sequence, and the commit happens
 * inside the stream, after the response has been handed back.
 */
async function acquireBuildLock(projectId: string): Promise<() => void> {
  while (buildLocks.has(projectId)) {
    await buildLocks.get(projectId);
  }
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = () => {
      if (buildLocks.get(projectId) === held) buildLocks.delete(projectId);
      resolve();
    };
  });
  buildLocks.set(projectId, held);
  return release;
}

export const POST = routeWithParams<Params>(async (request, context) => {
  const user = await requireUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const project = await getProject(id);
  if (!project) return notFound("Project");
  if (project.ownerId !== user.id) return forbidden();

  const parsed = await readBody(request, messageSchema);
  if (!parsed.ok) return parsed.response;
  const content = parsed.data.content;

  // Credits are presented as the build allowance, so an exhausted balance has
  // to stop the build before it runs rather than being clamped at zero after.
  if (user.credits <= 0) {
    return apiError(
      "You are out of build credits. Upgrade your plan to keep building.",
      402
    );
  }

  const releaseLock = await acquireBuildLock(id);

  // Re-read inside the lock: a build that was queued ahead of this one may have
  // just replaced the spec we would otherwise derive from.
  const current = (await getProject(id)) ?? project;
  const history = await listMessages(id);

  // A project is created with a spec already generated from its prompt, but
  // with no messages — the builder shows that prompt as an intro card and the
  // user clicks it to watch the initial build run. Only that replay is a first
  // build. Anything else typed into an empty transcript is a refinement of the
  // spec the project already has, so it must go through applyFollowUp; treating
  // it as a first build would regenerate the app from the follow-up text alone
  // and discard everything the creation prompt produced.
  const normalise = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();
  const isFirstBuild =
    history.length === 0 && normalise(content) === normalise(project.prompt);

  let spec: AppSpec;
  let steps: BuildStep[];
  let reply: string;
  let versionLabel: string;

  if (isFirstBuild) {
    const generated = generateSpec(content);
    spec = { ...generated, title: current.name, summary: generated.summary.replace(generated.title, current.name) };
    steps = planBuildSteps(content, spec);
    reply = initialReply(spec);
    versionLabel = "Initial build";
  } else {
    const result = applyFollowUp(current.spec, content);
    spec = result.spec;
    steps = result.steps;
    reply = result.reply;
    versionLabel = content.length > 48 ? `${content.slice(0, 45).trim()}...` : content;
  }

  // Persist the user's turn and flip the project into "building" before the
  // stream opens, so a refresh mid-build shows the right state.
  await addMessage({ projectId: id, role: "user", content });
  await updateProject(id, { status: "building" });

  let cancelled = false;
  const words = reply.split(/(?<=\s)/);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: BuildEvent): void => {
        if (cancelled) return;
        try {
          controller.enqueue(frame(event));
        } catch {
          // The client went away between the check and the enqueue.
          cancelled = true;
        }
      };

      try {
        const tokensPerStep = Math.max(1, Math.ceil(words.length / Math.max(1, steps.length)));
        let cursor = 0;

        for (let i = 0; i < steps.length; i += 1) {
          if (cancelled) break;
          const step = steps[i];
          if (!step) continue;

          send({ type: "step", step: { ...step, status: "running" } });
          await sleep(stepDelay(step, i));
          send({ type: "step", step: { ...step, status: "done" } });

          // Stream the reply alongside the plan once the first step lands.
          if (i > 0 && cursor < words.length) {
            const slice = words.slice(cursor, cursor + tokensPerStep);
            cursor += slice.length;
            for (const word of slice) {
              if (cancelled) break;
              send({ type: "token", text: word });
              await sleep(18);
            }
          }
        }

        // Anything left of the reply.
        while (!cancelled && cursor < words.length) {
          const word = words[cursor];
          cursor += 1;
          if (word) send({ type: "token", text: word });
          await sleep(18);
        }

        send({ type: "spec", spec });

        // Persist even when the client disconnected: the build really happened.
        const committed = await commitBuild({
          projectId: id,
          reply,
          steps: steps.map((step) => ({ ...step, status: "done" as const })),
          spec,
          // Building is not publishing: a draft stays private until the owner
          // uses Publish. Only an already-live app stays live after a rebuild.
          status: current.status === "live" ? "live" : "draft",
          versionLabel,
        });
        await spendCredits(user.id, 1);

        if (!committed) {
          send({ type: "error", message: "That project was deleted while it was building." });
        } else {
          send({ type: "done", message: committed.message, project: committed.project });
        }
      } catch (error) {
        console.error("[hercules/api] build stream failed:", error);
        await updateProject(id, { status: "error" }).catch(() => undefined);
        send({
          type: "error",
          message: error instanceof Error ? error.message : "The build failed unexpectedly.",
        });
      } finally {
        // Released here rather than on cancel: a disconnected client still lets
        // the build run to completion, so the next one must wait for the commit.
        releaseLock();
        try {
          controller.close();
        } catch {
          // Already closed by a client disconnect.
        }
      }
    },
    cancel() {
      cancelled = true;
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
});
