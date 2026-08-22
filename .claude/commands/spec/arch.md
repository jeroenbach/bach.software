---
description: Work out the technical design for a FEATURE (or a delta for a story)
argument-hint: FEAT-XXX or ST-YY
---

Read `CLAUDE.md` and the referenced spec before acting.

Invoke the **architect** agent on the spec identified in the arguments below.

- A feature id (FEAT-XXX) runs FULL mode: fill the feature spec's Architecture section (component plan against `docs/components.md`, component/variant APIs, API contract including Kiota client and C# endpoint impact, data flow, ADR notes, slicing seams) and advance the feature status to `adversarial-review`.
- A story id (ST-YY) runs DELTA mode: only work out details the feature architecture left open for that slice. Conflicts with feature-level decisions are flagged and resolved in the feature spec first, never overridden locally.

Arguments:

$ARGUMENTS
