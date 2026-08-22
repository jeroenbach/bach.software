---
description: "Adversarial review: full for features, lite for stories and quick specs"
argument-hint: FEAT-XXX or ST-YY or QUICK-XXX
---

Read `CLAUDE.md` and the referenced spec before acting.

Invoke the **adversarial-reviewer** agent on the spec identified in the arguments below, in the mode matching the spec type:

- FEAT-XXX: FEATURE mode (full) — attack functional, design, architecture, and cross-cutting cohesion.
- ST-YY or QUICK-XXX: STORY mode (lite) — blockers only: testable acceptance criteria mapped in the QA plan, consistency with the approved feature design/architecture, explicit dependencies.

The reviewer writes findings with severities in the spec's Adversarial review section, routes blockers/should-fixes as "PROPOSED (adversarial review)" edits in the relevant sections, and sets status to `awaiting-approval`. After that, only Jeroen decides.

Arguments:

$ARGUMENTS
