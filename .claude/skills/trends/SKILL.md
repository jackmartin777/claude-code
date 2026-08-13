---
name: trends
description: "Scan the sources I follow and report only what moved since the last scan. Fires on \"what's new\", \"anything moved\", \"check my sources\", \"what changed since yesterday\", or a recurring daily or weekly scan. Deltas only — never a summary of the whole landscape. Not for researching a topic that's new to me, and not for a one-off question about a single site."
---

## What this does

One job: compare my tracked sources against the last snapshot and report the difference.

## Sources

The list lives in the vault at `Meta/trends-sources.md`, read through the **vault** skill. Each entry is a source and what about it I care about.

No such note: ask me once which sources to watch and what counts as movement on each, then write it there. Update it when I add or drop one.

Connected connectors and ordinary web fetching only. No credentials — a source behind a login I can't reach is reported as unreachable, not skipped silently.

## Finding the delta

Read the last scan from `Trends/YYYY-MM-DD.md` in the vault. Compare against it, not against general knowledge. What counts as movement:

- something new since that scan
- something that changed position, price, status or direction
- something that stopped — a thread that went quiet, a thing that shipped, a source that went dark

Background that hasn't changed is not a finding and doesn't get restated. Neither does anything already in the previous scan.

## Reporting

One line per item: what moved, in which direction, on which source, with the link and the date. Group only if there are more than about six.

If nothing moved, say "nothing moved since {date}" and stop. One line is the correct output on a quiet day — don't reach for something to fill it.

Distinguish a source that showed no change from one that failed to load. Never infer movement that wasn't observed.

## Persisting

Write the scan through the **vault** skill to `Trends/YYYY-MM-DD.md`, and add a one-line pointer under `## Trends` in today's daily note. That file is the baseline the next scan reads.
