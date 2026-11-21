# Specs

This folder is driven by the **spec** Claude Code plugin (spec-driven development: epics, features, stories, approval gates).

**Fresh clone?** The plugin installs itself: this repository's `.claude/settings.json` registers the `bach.software` marketplace ([jeroenbach/claude-plugins](https://github.com/jeroenbach/claude-plugins)) and enables the `spec` plugin, so Claude Code offers to install it the first time you open the project — accept once and the `/spec:*` commands are available. To install it by hand instead: `/plugin marketplace add jeroenbach/claude-plugins`, then `/plugin install spec@bach.software`.

- `PROJECT.md` is the project profile: the project-specific contract every workflow agent reads first. It belongs to this repository; edit it freely.
- `components.md` is the living inventory of the project's public surface (when the profile says the project keeps one).
- Everything else here is specs: `EPIC-XXX-*/`, `FEAT-XXX-*/`, `QUICK-XXX-*/`, and `archive/` for shipped work.

The workflow itself (lifecycles, gates, commands) is documented in the plugin: see the `spec` plugin's README and its `docs/WORKFLOW.md`. Quick orientation:

- `/spec:status` shows the pipeline and what is waiting on you.
- `/spec:feature <idea>` starts a feature; `/spec:quick <description>` is the fast lane for small fixes.
- `/spec:continue <id>` runs everything up to your next approval gate; `/spec:approve <id>` opens a gate.
- `/spec:auto <id>` runs all remaining phases end to end for low-risk work, crossing your gates under the per-spec delegation you grant by typing it (every crossed gate and decision is logged in the spec for PR review).
- `/spec:init` re-runs setup (safe on an existing project; it updates rather than overwrites).
