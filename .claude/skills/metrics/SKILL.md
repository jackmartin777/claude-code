---
name: metrics
description: "Pull my current numbers from the platforms I track and report them back as a short written summary. Fires on \"how are my numbers\", \"pull my stats\", \"how did this week do\", \"what's growth looking like\", or any start-of-week or end-of-month numbers check. Prose only — never a chart, dashboard or spreadsheet. Not for analysing a dataset I hand over, and not for someone else's data."
---

## What this does

One job: fetch my live numbers and say what they are in a few sentences.

## Sources

The list of platforms I track lives in the vault at `Meta/metrics-sources.md`, read through the **vault** skill.

If that note doesn't exist, ask me — in one message — which platforms to pull from and what the headline number is for each. Write the answer to that note so this never gets asked twice. Update the note when I add or drop a platform.

## Credentials

Connected MCP connectors only. If a platform I've named isn't connected, say so and offer to surface a connector for it — then report the rest.

Never ask me for an API key, token, password or secret; never read one out of a file; never print one. A source that would need raw credentials is a source this skill reports as unavailable.

## Reporting

- Short written summary, under 150 words, plain prose. No tables, no bullets-of-bullets, no visualisation.
- Each number gets its comparison — against last week, last month, or the last run stored in the vault — and the direction it moved.
- One sentence on what actually changed and why, when the data supports one. No speculation dressed as cause.
- A source that failed, returned nothing, or is stale gets named as such. Never fill a gap with an estimate, and never carry forward an old number as if it were current.

## Persisting

Write the summary through the **vault** skill, under `## Metrics` in today's daily note. That stored summary is also what the next run compares against.
