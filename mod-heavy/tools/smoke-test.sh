#!/usr/bin/env bash
# MOD-HEAVY smoke test: JS syntax, embed freshness, and every referenced file
# returning 200 from a local static server (python3 -m http.server).
# Usage: bash tools/smoke-test.sh [port]
set -euo pipefail

cd "$(dirname "$0")/.."
PORT="${1:-8765}"
fail=0

echo "== node --check"
for f in js/*.js tools/*.js; do
  if node --check "$f"; then echo "  ok   $f"; else echo "  FAIL $f"; fail=1; fi
done

echo "== JSON parse"
for f in missions/*.json; do
  if node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))"; then echo "  ok   $f"; else echo "  FAIL $f"; fail=1; fi
done

echo "== embed matches missions/m1.json"
node tools/build-embed.js --check || fail=1

echo "== no ES module syntax in browser scripts (breaks file://)"
if grep -nE '^\s*(import|export)\s' js/*.js || grep -n 'type="module"' index.html; then
  echo "  FAIL module syntax found"; fail=1
else
  echo "  ok"
fi

echo "== referenced files over http://127.0.0.1:$PORT/"
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
for _ in $(seq 1 30); do curl -s -o /dev/null "http://127.0.0.1:$PORT/" && break; sleep 0.2; done

# Relative src/href from index.html + paths fetched by the scripts.
paths=$( { echo "index.html"; \
  grep -oE '(src|href)="[^"#:]+"' index.html | sed -E 's/^(src|href)="//; s/"$//'; \
  grep -ohE 'fetch\("[^"]+"' js/*.js | sed -E 's/^fetch\("//; s/"$//'; } | sort -u )
for p in $paths; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/$p")
  if [ "$code" = "200" ]; then echo "  200  $p"; else echo "  $code  $p"; fail=1; fi
done

if [ "$fail" -eq 0 ]; then echo "SMOKE TEST PASSED"; else echo "SMOKE TEST FAILED"; exit 1; fi
