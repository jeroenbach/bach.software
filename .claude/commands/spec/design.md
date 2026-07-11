---
description: Create the cohesive HTML prototype for a FEATURE (or a delta for a story)
argument-hint: FEAT-XXX (or ST-YY for deltas), optional notes/screenshot paths
---

Read `CLAUDE.md` and the referenced spec before acting.

Invoke the ui-designer agent on: $ARGUMENTS

Mode selection:
- A feature id (FEAT-XXX) runs FULL mode: produce `prototype.html` covering the entire feature in the feature folder, fill the Design section of the feature spec, and advance the feature status to `architecture`.
- A story id (ST-YY) runs DELTA mode: no redesign; only refine what the story's Design reference marks as open, keep full consistency with the feature prototype, and record the delta in the story spec. Conflicts with the feature design become flagged amendments on the feature spec instead.

Pass any extra notes or screenshot/asset paths from the arguments to the agent as design input.
