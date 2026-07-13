#!/usr/bin/env bash
set -euo pipefail
cd playwright
npm ci
if [[ -n "${GIIP_PLAYWRIGHT_EXECUTABLE_PATH:-${PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH:-}}" ]]; then
  browser="${GIIP_PLAYWRIGHT_EXECUTABLE_PATH:-${PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}}"
  if [[ ! -x "$browser" ]]; then
    echo "Configured Chromium executable is not executable: $browser" >&2
    exit 1
  fi
  echo "Using system Chromium: $browser"
else
  npx playwright install --with-deps chromium
fi
