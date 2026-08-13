---
name: inbox
description: "My morning brief in plain text — scan mail and calendar and return the three things that actually need me today. Fires on \"what's on today\", \"anything I need to deal with\", \"catch me up\", \"what did I miss\", or any first-thing-in-the-morning check-in. Not the rendered HTML morning page — that's the `morning` skill; this one answers in the conversation. Not for searching my mail for a specific message, and not for drafting replies."
---

## What this does

One job: read mail and calendar, and hand back the three items it would cost me something to ignore today.

## Sources

Connected connectors only — mail and calendar. Missing connector: say which role is missing, work from what's connected, and don't pretend the picture is complete. Never ask for credentials.

Calendar: today, midnight to midnight, my timezone. Tomorrow's events only matter if something today has to happen first for them to go well.

Mail: threads where someone asked me something and I haven't answered. Open the thread before listing it — if I already replied, or the ask went to a group where anyone could pick it up, it isn't mine and it doesn't make the list.

## Choosing the three

The test is cost of ignoring it until tomorrow: someone is blocked on me, a window closes today, or it gets harder to undo. Rank by that, keep the top three.

Prep counts — something tomorrow that goes badly if I haven't read, decided or drafted today is a legitimate item, but only with a concrete anchor: the doc, the decision, the draft.

If fewer than three qualify, return fewer and say the day is light. Never pad the list to reach three.

## Reporting

Three items, numbered. Each one is two lines at most:

- what it is and who's waiting, with the source named in prose ("in the thread with Sarah", "on your 2pm")
- the single next action

Quote anything I'm meant to act on verbatim rather than paraphrasing the ask.

## Persisting

Write the brief through the **vault** skill, under `## Brief` in today's daily note. If **plan** runs afterwards, these three are its starting material.
