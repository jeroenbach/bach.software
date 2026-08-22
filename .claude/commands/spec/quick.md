---
description: Fast lane for bug fixes and trivial changes
argument-hint: short description of the change
---

Read `CLAUDE.md` and the referenced spec before acting.

Quick lane lifecycle: `draft → adversarial-review → awaiting-approval → approved → implementing → done`.

1. Create `docs/specs/QUICK-XXX-<kebab-name>/spec.md` (numbered sequentially based on existing QUICK specs) with this mini-template:

   ```markdown
   ---
   id: QUICK-XXX
   type: quick
   status: draft
   created: YYYY-MM-DD
   approved_by: ""
   pr: ""
   ---

   # Quick: <name>

   ## Problem

   ## Proposed change

   ## Affected files

   ## Test impact

   ## Adversarial review
   ```

   Fill Problem, Proposed change, Affected files (inspect the code, do not guess), and Test impact from the description below.

2. Invoke the **adversarial-reviewer** agent in STORY (lite) mode on the new spec.

3. Set the spec status to `awaiting-approval` and STOP for Jeroen's review. Only Jeroen may set `status: approved`.

After approval, `/spec:implement QUICK-XXX` implements it, including the `docs/components.md` update obligation and the Tailwind variant rules.

Change description:

$ARGUMENTS
