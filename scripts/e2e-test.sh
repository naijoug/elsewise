#!/bin/bash
# HTTP-only smoke checks. Browser interactions are covered separately.
set -euo pipefail
base="${1:-http://127.0.0.1:4173}"
base="${base%/}"
for route in / /idiom/array-map/ /languages/ /language/python/ /favorites/ /idioms/ /search-index.json /build-manifest.json; do
  curl --silent --show-error --fail --max-time 10 "$base$route" >/dev/null
  echo "PASS $route"
done
curl --silent --show-error --fail "$base/" | grep -q 'Elsewise'
status=$(curl --silent --output /dev/null --write-out '%{http_code}' "$base/missing-release-page")
[ "$status" = 404 ]
echo 'HTTP smoke checks passed; no browser interaction was executed.'
