# Hercules — recreation

A functional recreation of [hercules.app](https://hercules.app), the AI app builder for
business by Zeus AI Labs. Built as a study in reproducing a polished commercial product
end to end: the marketing site, the signed-in workspace, and a working build engine
behind them.

> This is an independent recreation for educational purposes. It is not affiliated with
> Zeus AI Labs, Inc. Marketing copy and customer quotes are transcribed from the public
> site to keep the reproduction faithful.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, Server Components) |
| Language | TypeScript, strict |
| Styling | Tailwind CSS v4, shadcn-style CSS variable tokens |
| Type font | Geist Sans / Geist Mono |
| Icons | lucide-react |
| Validation | zod |
| Persistence | JSON file store (`.data/`), swappable for a real database |

No chart library, no component library, no image assets — every visual is CSS or inline
SVG.

## Design system

Tokens in `src/app/globals.css` were transcribed from the production Hercules stylesheet
rather than eyeballed: a warm-tinted neutral scale (hue 85 in the dark theme), a
near-black light primary, a lavender dark primary (`oklch(83.98% .068 284.85)`) and a
matching focus ring at hue 283.68, `--radius: .625rem`. Both themes are first-class;
the theme is applied before first paint by an inline script so there is no flash.

Use semantic classes only (`bg-background`, `text-muted-foreground`, `border-border`,
`bg-sidebar`, `ring-ring`). Nothing hardcodes a hex value.

## Structure

```
src/
  app/
    (marketing)/     landing, pricing, case studies, docs, support, changelog, legal
    (auth)/          login, signup
    (app)/           the signed-in workspace: dashboard, builder, settings
    api/             REST + SSE route handlers
  components/
    ui/              primitives (button, card, badge, input)
    marketing/       landing page sections
    content/         shared content-page furniture
    app/             product surfaces (sidebar, chat, preview)
  data/              transcribed marketing copy, pricing, docs, changelog
  lib/
    types.ts         domain model + API contract (single source of truth)
    generator.ts     prompt -> AppSpec build engine
    store.ts         persistence
    api-client.ts    typed browser client, including the SSE reader
```

## The build engine

The product's core trick — describe an app, watch it get built — is real here, just
offline. `src/lib/generator.ts` analyses a prompt for its archetype (CRM, ERP, HR portal,
inventory tracker, ops dashboard, client portal, booking, storefront, helpdesk, …),
extracts signals such as team size and requested capabilities, and emits an `AppSpec`:
tables with typed fields, screens, roles and dashboard tiles. Follow-up messages mutate
that spec, so "add a reports page" or "let customers pay invoices" actually changes the
generated app.

`POST /api/projects/:id/messages` streams the build back as server-sent events — build
steps transitioning pending → running → done, the assistant's reply token by token, then
the updated spec — which is what drives the animated checklist and live preview in the
builder.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

Sign in with the demo account (`alex@northwind.co`, any password) or use the
"Continue with the demo account" button on the login page. A seeded workspace with
several built apps is created on first run.

```bash
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

## API

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Create an account and seed a workspace |
| `POST` | `/api/auth/login` | Start a session |
| `POST` | `/api/auth/logout` | End a session |
| `GET` | `/api/auth/me` | Current user |
| `GET`/`POST` | `/api/projects` | List / create apps |
| `GET`/`PATCH`/`DELETE` | `/api/projects/:id` | Read, update, delete an app |
| `GET` | `/api/projects/:id/messages` | Conversation history |
| `POST` | `/api/projects/:id/messages` | Send a message — streams the build over SSE |
| `GET` | `/api/projects/:id/versions` | Version history |
| `POST` | `/api/projects/:id/publish` | Publish to a domain |

Shapes for every route live in `src/lib/types.ts`.
