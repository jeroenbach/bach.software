---
description: "Adversarial review: full for features, lite for stories and quick specs"
argument-hint: FEAT-XXX or ST-YY or QUICK-XXX
---

Read `CLAUDE.md` and the referenced spec before acting.

Invoke the adversarial-reviewer agent on: $ARGUMENTS

Mode selection by spec type:
- FEAT-XXX: FEATURE mode (full): attack the entire spec, prototype, and touched code paths (functional, design, architecture, cross-cutting).
- ST-YY or QUICK-XXX: STORY mode (lite): blockers only (testable acceptance criteria mapped in the QA plan, consistency with the approved feature design/architecture, explicit dependencies).

The reviewer writes findings with severities into the Adversarial review section, routes blockers and should-fixes as "PROPOSED (adversarial review)" updates, sets the status to `awaiting-approval`, and stops. Approval is Jeroen's alone.
