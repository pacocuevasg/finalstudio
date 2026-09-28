#!/usr/bin/env bash
# Maintainers: build every template example and run the checker on it.
# Run after changing engine/, scripts/check.mjs or any template.
set -uo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${TMPDIR:-/tmp}/motion-check-all"; rm -rf "$OUT"; mkdir -p "$OUT"; fail=0
for f in "$HERE"/templates/*/example*.json; do
  n="$(basename "$(dirname "$f")")$(basename "$f" .json | sed 's/example//')"
  if node "$HERE/engine/build.mjs" "$f" "$OUT/$n" >"$OUT/$n.build.txt" 2>&1 && node "$HERE/scripts/check.mjs" "$OUT/$n" >"$OUT/$n.check.txt" 2>&1; then echo "✓ $n"; else echo "✗ $n (see $OUT/$n.*.txt)"; fail=1; fi
done
exit $fail
