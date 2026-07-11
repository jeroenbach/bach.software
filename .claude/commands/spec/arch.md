---
description: Work out the technical design for a FEATURE (or a delta for a story)
argument-hint: FEAT-XXX or ST-YY
---

Read `CLAUDE.md` and the referenced spec before acting.

Invoke the architect agent on: $ARGUMENTS

Mode selection:
- A feature id (FEAT-XXX) runs FULL mode: fill the Architecture section of the feature spec covering the whole feature (component plan, component APIs, API contract, data flow, ADR notes, slicing seams) and advance the feature status to `adversarial-review`.
- A story id (ST-YY) runs DELTA mode: no re-architecting; work out only details the feature architecture left open for this slice, and record them in the story's Architecture reference. Conflicts with feature-level decisions are flagged and resolved in the feature spec first.
