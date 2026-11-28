#!/usr/bin/env bash
# PostToolUse(Write|Edit): auto-fix lint on edited frontend files.
set -euo pipefail

input="$(cat)"
file="$(echo "$input" | jq -r '.tool_input.file_path // .tool_response.filePath // ""')"

case "$file" in
  */src/app/*.vue | */src/app/*.ts | */src/app/*.js)
    project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
    "$project_dir/node_modules/.bin/eslint" --fix "$file" 2>/dev/null || true
    ;;
esac

exit 0
