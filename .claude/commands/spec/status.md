---
description: "Show the pipeline: all specs and their current status"
---

Read `CLAUDE.md` and the referenced spec before acting.

Scan the frontmatter of every `docs/specs/**/spec.md` (features, their stories, and quick specs) and print a pipeline table:

- Group by feature: each FEAT-XXX row followed by its stories indented underneath; QUICK-XXX specs in their own group.
- Columns: id, name, status, created, approved_by, pr (for stories/quick).
- Highlight anything in `awaiting-approval`: these are waiting on Jeroen and block their downstream phases.
- Highlight anything stuck: use `git log --follow` on each spec.md to find when the status line last changed, and flag specs sitting in the same status unusually long.

End with a one-line summary: how many specs are waiting on Jeroen, how many are in flight, how many are done. Read-only: do not modify any spec.
