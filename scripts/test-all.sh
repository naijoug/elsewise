#!/bin/bash
# Production validation plus HTTP smoke checks against a local root-path build.
set -euo pipefail

if [ -n "${GHP_BASE:-}" ] && [ "$GHP_BASE" != "/" ]; then
  echo "test:all expects a root-path build; use pre-deploy and target-specific browser checks for GHP_BASE." >&2
  exit 1
fi

npm run pre-deploy

preview_log=$(mktemp "${TMPDIR:-/tmp}/elsewise-preview.XXXXXX")
preview_pid=""
cleanup() {
  if [ -n "$preview_pid" ]; then
    kill "$preview_pid" 2>/dev/null || true
    wait "$preview_pid" 2>/dev/null || true
  fi
  rm -f "$preview_log"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

# Start Vite directly so the tracked PID owns the preview server.
./node_modules/.bin/vite preview --host 127.0.0.1 > "$preview_log" 2>&1 &
preview_pid=$!
ready=false
for attempt in {1..50}; do
  sleep 0.2
  if ! kill -0 "$preview_pid" 2>/dev/null; then
    cat "$preview_log" >&2
    exit 1
  fi
  if grep -q "Local:" "$preview_log" && curl --silent --fail --max-time 1 http://127.0.0.1:4173/ > /dev/null; then
    ready=true
    break
  fi
done
if [ "$ready" != true ]; then
  cat "$preview_log" >&2
  echo "Preview server did not become ready." >&2
  exit 1
fi

npm run test:smoke -- http://127.0.0.1:4173
