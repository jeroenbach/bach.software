#!/usr/bin/env bash
# PreToolUse(Bash): interactive sessions never touch git state (no add/commit/push),
# see CLAUDE.md "Interactive vs Autonomous Sessions". Autonomous runs (cloud sessions, CI)
# are left alone, matching the detection the spec plugin's /spec:continue uses.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || [ -n "${CI:-}" ] || [ -n "${GITHUB_ACTIONS:-}" ]; then
  exit 0
fi

input="$(cat)"
command="$(echo "$input" | jq -r '.tool_input.command // ""')"

# Any whitespace counts as a preceding delimiter so env-var prefixes (FOO=1 git add),
# `command git add` and `xargs git add` are caught too; global git options (-C <path>,
# -c key=val, --git-dir=..., --no-pager, ...) may sit between `git` and the subcommand.
if echo "$command" | grep -qE '(^|[;&|(]|\s)git\s+((-C|-c)\s+\S+\s+|--?[a-zA-Z-]+(=\S+)?\s+)*(add|commit|push)\b'; then
  reason='Interactive sessions never touch git state (no add/commit/push) per CLAUDE.md — stage and commit yourself.'
  jq -n --arg reason "$reason" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $reason
    }
  }'
fi

exit 0
