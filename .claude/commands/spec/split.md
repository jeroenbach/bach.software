---
description: Split an APPROVED feature spec into user stories
argument-hint: FEAT-XXX
---

Read `CLAUDE.md` and the referenced spec before acting.

Invoke the scrum-master agent on the feature: $ARGUMENTS

APPROVAL GATE (enforced here and by the agent): the feature spec's frontmatter status must be exactly `approved`, set by Jeroen with `approved_by` filled. If it is anything else, do NOT split; report the current status and stop. A feature is only split after Jeroen approved its design and architecture.

The scrum-master slices the approved feature into vertically sliced, dependency-ordered stories under `stories/`, updates the feature's Stories section, sets the feature to `in-progress`, and each story to `qa`.
