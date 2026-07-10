---
description: Create a new feature spec from an idea
argument-hint: describe the feature idea
---

Read `CLAUDE.md` and the referenced spec before acting.

Invoke the product-owner agent to elaborate the following idea into a feature spec:

$ARGUMENTS

The agent creates `docs/specs/FEAT-XXX-<kebab-name>/spec.md` from `docs/specs/TEMPLATE-feature.md` (numbered sequentially based on existing specs), fills the functional sections, lists open questions for Jeroen, and sets the status for the next phase. It never sets `status: approved`.
