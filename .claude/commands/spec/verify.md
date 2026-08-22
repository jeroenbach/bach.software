---
description: Verify an implemented story against its spec
argument-hint: ST-YY
---

Read `CLAUDE.md` and the referenced spec before acting.

Invoke the **qa-verifier** agent on the story identified in the arguments below. It only acts on specs with status `verifying`. It runs the full test suite and linting, walks every acceptance criterion with evidence, compares the implementation to the feature prototype at this story's anchors (states policy, tokens, responsive behavior), checks process compliance (components.md updated, Tailwind variant rule, no silent deviations), writes the Verification report, and sets the status to `done` (pass) or back to `implementing` (fail).

Arguments:

$ARGUMENTS
