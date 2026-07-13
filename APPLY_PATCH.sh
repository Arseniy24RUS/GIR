#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export PYTHONUTF8=1
export PYTHONIOENCODING=utf-8
export PYTEST_DISABLE_PLUGIN_AUTOLOAD=1

if [[ ! -f EXTERNAL_AUDIT_MANIFEST.json ]]; then
  echo "Run this script from the root of global_index_platform_scientific_candidate_20260711-003623." >&2
  exit 2
fi

bash scripts/patch_candidate_gate.sh "$@"

echo
printf '%s\n' "GIIP final-release-v6 offline patch applied successfully."
printf '%s\n' "The project remains 1.0.0-rc6 until official HCI+, national statistics, corporate data and fresh Playwright v6 evidence are loaded."
