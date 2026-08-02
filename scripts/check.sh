#!/usr/bin/env bash
# Runs the full local pipeline: lint + typecheck + coverage, with the (optional)
# build running in the background, then Playwright in Docker against ./dist.
set -u

do_build=1
if [ -t 0 ]; then
  printf "Run a fresh 'pnpm build' before Playwright? [Y/n] "
  read -r answer
  case "$answer" in
    [nN]*) do_build=0 ;;
  esac
fi

build_pid=""
build_log=""

cleanup() {
  if [ -n "$build_pid" ] && kill -0 "$build_pid" 2>/dev/null; then
    echo "✖ stopping background build ($build_pid)"
    pkill -P "$build_pid" 2>/dev/null
    kill "$build_pid" 2>/dev/null
  fi
}
trap cleanup EXIT

if [ "$do_build" -eq 1 ]; then
  build_log="$(mktemp -t check-build)"
  echo "▶ 'pnpm build' started in the background (log: $build_log)"
  pnpm build >"$build_log" 2>&1 &
  build_pid=$!
fi

pnpm lint:fix && nuxi typecheck && pnpm ci:test:coverage || exit 1

if [ -n "$build_pid" ]; then
  echo "▶ waiting for the background build to finish..."
  if ! wait "$build_pid"; then
    build_pid=""
    echo "✖ 'pnpm build' failed — output:"
    cat "$build_log"
    exit 1
  fi
  build_pid=""
  echo "✔ build finished"
fi

pnpm ci:playwright:docker
