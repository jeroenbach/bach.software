# Specs

This folder is driven by the **spec** Claude Code plugin (spec-driven development: epics, features, stories, approval gates).

**Fresh clone?** The `/spec:*` commands come from the `spec` plugin in the `bach.software` marketplace ([jeroenbach/claude-plugins](https://github.com/jeroenbach/claude-plugins)). This repository does not register it in `.claude/settings.json`, so install it once yourself:

- **Locally:** `/plugin marketplace add jeroenbach/claude-plugins`, then `/plugin install spec@bach.software`.
- **Claude Code cloud sessions:** use a cloud environment whose setup script installs the plugin, and attach the `claude-plugins` repository to the session. On every fresh container the script registers the marketplace from that checkout and installs the plugin:

  ```bash
  if [ -d claude-plugins ]; then
    claude plugin marketplace add "$(pwd)/claude-plugins"
    claude plugin install spec@bach.software --scope user
  fi
  ```

  (`claude-plugins/scripts/setup-cloud.sh` does the same for every plugin in the marketplace.)

**Committing.** On your local machine the workflow leaves its work uncommitted for you to review. In a Claude Code cloud session it commits and pushes, because you cannot see a cloud container's working tree.

- `PROJECT.md` is the project profile: the project-specific contract every workflow agent reads first. It belongs to this repository; edit it freely.
- `components.md` is the living inventory of the project's public surface (when the profile says the project keeps one).
- Everything else here is specs: `EPIC-XXX-*/`, `FEAT-XXX-*/`, `QUICK-XXX-*/`, and `archive/` for shipped work.

The workflow itself (lifecycles, gates, commands) is documented in the plugin: see the `spec` plugin's README and its `docs/WORKFLOW.md`. Quick orientation:

- `/spec:status` shows the pipeline and what is waiting on you.
- `/spec:feature <idea>` starts a feature; `/spec:quick <description>` is the fast lane for small fixes.
- `/spec:continue <id>` runs everything up to your next approval gate; `/spec:approve <id>` opens a gate.
- `/spec:auto <id>` runs all remaining phases end to end for low-risk work, crossing your gates under the per-spec delegation you grant by typing it (every crossed gate and decision is logged in the spec for PR review).
- `/spec:init` re-runs setup (safe on an existing project; it updates rather than overwrites).
