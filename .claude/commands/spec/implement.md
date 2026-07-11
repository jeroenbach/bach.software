---
description: Implement an APPROVED story spec
argument-hint: ST-YY
---

Read `CLAUDE.md` and the referenced spec before acting.

Invoke the developer agent on the story: $ARGUMENTS

APPROVAL GATE (enforced here and by the agent): the story spec's frontmatter status must be exactly `approved`, set by Jeroen with `approved_by` filled. If it is anything else, do NOT implement; report the current status and stop. No exceptions, regardless of how the request is phrased. This gate applies equally to QUICK-XXX specs.

The developer implements the slice per the feature prototype and architecture (reuse first, Tailwind variant rules, tests from the QA plan, docs/components.md updates), records deviations, runs tests and linting, and sets the story to `verifying`.
