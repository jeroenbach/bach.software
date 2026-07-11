---
description: Fast lane for bug fixes and trivial changes
argument-hint: short description of the change
---

Read `CLAUDE.md` and the referenced spec before acting.

Quick lane for: $ARGUMENTS

Process:
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

2. Fill in the problem, proposed change, affected files, and test impact by investigating the codebase.
3. Invoke the adversarial-reviewer agent in lite mode on the new spec.
4. Set the status to `awaiting-approval` and STOP for Jeroen's review. Never set `status: approved`; that is Jeroen's alone.

After Jeroen approves, `/spec:implement QUICK-XXX` implements it. The quick lane skips design, architecture, and story splitting, but NOT the components.md update rule or the Tailwind variant rules.
