#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
export PYTHONUTF8=1
export PYTHONIOENCODING=utf-8
export PYTEST_DISABLE_PLUGIN_AUTOLOAD=1
DEFAULT_PATCH_ARCHIVE="$ROOT/giip_v06_hci_plus_final_release_patch_003623.zip"
PATCH_ARCHIVE="${GIIP_V6_PATCH_ARCHIVE:-$DEFAULT_PATCH_ARCHIVE}"

printf '%s\n' '[pre] Verifying UTF-8 mode and V6 patch lineage.'
python -c "import sys; assert sys.flags.utf8_mode == 1, 'Python UTF-8 mode is required'"
if [[ ! -f PATCH_INTEGRATION_V6.json ]]; then
  python scripts/write_patch_integration_manifest_v6.py prepare --patch-archive "$PATCH_ARCHIVE"
fi
python -c "import json,pathlib; p=json.loads(pathlib.Path('PATCH_INTEGRATION_V6.json').read_text(encoding='utf-8')); assert p.get('patch_version') == '6.0.0-scientific-candidate-003623', 'unexpected V6 lineage version'; assert p.get('status') in {'prepared','applied'}, 'V6 lineage is not prepared or applied'"
python scripts/verify_patch_files.py --phase pre

printf '%s\n' '[apply] Applying the deterministic final-release-v6 migration.'
python scripts/apply_final_release_v6_patch.py "$@"
python scripts/verify_patch_files.py --phase post

printf '%s\n' '[post] Running candidate tests and strict validators.'
python scripts/generate_scientific_validation_report.py
python scripts/generate_release_docs.py
python -m giip.cli validate
python -m pytest -q
python scripts/validate_no_generated_data.py --strict
python scripts/validate_i18n_labels.py --strict
python scripts/validate_source_provenance.py --strict
python scripts/validate_index_formulas.py --strict
python scripts/validate_final_release_candidate.py
node --check giip/static/app.js
node --check giip/static/landing.js
node --check giip/static/cooperation.js

if [[ ! -f PATCH_APPLIED_V6.json ]]; then
  echo "PATCH_APPLIED_V6.json is missing after patch application." >&2
  exit 2
fi
python -c "import json,pathlib; lineage=json.loads(pathlib.Path('PATCH_INTEGRATION_V6.json').read_text(encoding='utf-8')); marker=json.loads(pathlib.Path('PATCH_APPLIED_V6.json').read_text(encoding='utf-8')); assert marker.get('patch_version') == lineage.get('patch_version'), 'applied marker and integration lineage disagree'"

echo "GIIP final-release-v6 offline candidate gate passed. Only official online data and fresh Playwright-v6 evidence may remain."
