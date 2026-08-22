---
description: "Show the pipeline: all specs and their current status"
---

Read `CLAUDE.md` and the referenced spec before acting.

Scan the frontmatter of every `docs/specs/**/spec.md` (epics, features, their stories, and quick specs) and print a pipeline overview table:

- Group each epic (EPIC-XXX) with the features that carry its `epic:` id nested underneath, and each feature with its stories nested under it (id, name, status, approved_by, pr).
- Features with no `epic:` value are standalone; list them in their own group after the epics.
- Include QUICK-XXX specs in their own group.
- **Highlight everything in `awaiting-approval`**: these are waiting on Jeroen and block their downstream phases.
- Flag anything stuck: use `git log --follow` on each spec.md to see when its `status:` line last changed, and mark specs sitting in the same status for a long time (e.g. more than 7 days) as stale.

Read-only: this command changes no spec. End with a short "next actions" list (what Jeroen needs to approve, which specs an agent can pick up next).
