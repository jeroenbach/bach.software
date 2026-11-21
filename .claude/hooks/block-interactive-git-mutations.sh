#!/usr/bin/env bash
# PreToolUse(Bash): interactive sessions never touch git state (no add/commit/push) —
# see CLAUDE.md "Interactive vs Autonomous Sessions". Autonomous runs (CI/GITHUB_ACTIONS set)
# are left alone, matching the same detection the spec plugin's chain 3 uses.
set -euo pipefail

if [ -n "${CI:-}" ] || [ -n "${GITHUB_ACTIONS:-}" ]; then
  exit 0
fi

input="$(cat)"
command="$(echo "$input" | jq -r '.tool_input.command // ""')"

if echo "$command" | grep -qE '(^|[;&|]|\()\s*git\s+(add|commit|push)\b'; then
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
