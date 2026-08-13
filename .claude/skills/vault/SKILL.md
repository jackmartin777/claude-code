---
name: vault
description: "Read from and write to my Obsidian vault — the one place notes, briefs, numbers and plans persist. Fires whenever something should be saved, filed, appended, or looked up in my notes: \"save this\", \"add it to my notes\", \"file this\", \"what did I write about X\", \"check my notes for Y\". Also the persistence layer every other skill calls — metrics, inbox, trends and plan all write through this skill rather than touching files themselves. Not for writing source files inside a code project, and not for scratch or temp files."
---

## What this does

One job: reading and writing markdown in my Obsidian vault. Nothing else persists anything — if another skill produced something worth keeping, it comes here.

## Finding the vault

Resolve the path in this order, and stop at the first hit:

1. `$CLAUDE_VAULT_PATH`
2. `~/.claude/skills/vault/vault.config` — a single line holding the absolute path
3. Nothing set → ask me for the path once, confirm it exists and contains a `.obsidian/` directory, then write it to `vault.config` so no later run has to ask again.

Never guess a path. Never create a vault directory that isn't there — if the path I give doesn't exist, say so and stop.

## Before writing anything

Read the vault's existing folder structure first and match it. My vault has conventions already; mirror them instead of imposing new ones. Only when there is genuinely no existing home for something, fall back to:

- `Daily/YYYY-MM-DD.md` — one note per day, the default target for anything dated
- one topic note per subject, named as the subject, at the vault root or in whatever folder already holds similar notes

Producer skills each own an H2 in the daily note: `## Priorities` (plan), `## Brief` (inbox), `## Metrics` (metrics), `## Trends` (trends). Create the section if it's missing, update in place if it's there.

## Writing rules

- Append or create by default. Never overwrite a file and never delete one.
- Replacing existing content — an updated section, a corrected number — needs the old text shown to me and a yes before it happens.
- Every write goes inside the resolved vault root. A path outside it, for any reason, stops and asks me first, naming the exact file. This is the rule the whole skill layer leans on: nothing lands outside the vault silently.
- Keep frontmatter that's already on a note. New notes get `date` and `tags` only.
- Link with wikilinks (`[[Note name]]`) so notes stay connected in the graph.
- No git commits, no sync, no plugin actions unless I ask.

## Reading

Search filenames and content before answering "what did I write about X" — don't answer from memory of an earlier turn in the session. Quote what's actually in the note, cite the filename, and say plainly when the vault has nothing on it.
