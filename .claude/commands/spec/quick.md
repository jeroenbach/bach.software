---
description: Fast lane for bug fixes and trivial changes
argument-hint: short description of the change
---

Read `CLAUDE.md` and the referenced spec before acting.

Quick lane lifecycle: `draft → adversarial-review → [awaiting-discussion] → awaiting-approval → approved → implementing → verifying → done`.

1. Create `docs/specs/QUICK-XXX-<kebab-name>/spec.md` (numbered sequentially based on existing QUICK specs, including those under `docs/specs/archive/`; an archived id is never reused) with this mini-template:

   ```markdown
   ---
   id: QUICK-XXX
   type: quick
   status: draft
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

2. Invoke the **adversarial-reviewer** agent (model: opus, pass this explicitly on the Agent tool call, see `.claude/agents/adversarial-reviewer.md`) in STORY (lite) mode on the new spec.

3. STOP for Jeroen's review at whichever status the reviewer set: `awaiting-approval` if it left nothing open, `awaiting-discussion` if it left an unresolved blocker or should-fix. For a genuinely quick fix, expect the former; landing in `awaiting-discussion` is a hint the change is not actually quick-lane material. Only Jeroen may set `status: approved`.

After approval, `/spec:continue QUICK-XXX` ships it: the developer implements, the qa-verifier verifies with the usual fix loop, and the folder is archived to `docs/specs/archive/` on `done`, still honouring the `docs/components.md` update obligation and the Tailwind variant rules. `/spec:implement QUICK-XXX` remains available for just the implementation step.

If this command was interrupted before the review ran (the spec sits in `draft` or `adversarial-review`), `/spec:continue QUICK-XXX` finishes the prep and review and stops at the same gate.

Change description:

$ARGUMENTS
