#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
export PYTHONUTF8=1
export PYTHONIOENCODING=utf-8
export PYTEST_DISABLE_PLUGIN_AUTOLOAD=1
DEFAULT_PATCH_ARCHIVE="$ROOT/giip_v06_hci_plus_final_release_patch_003623.zip"
PATCH_ARCHIVE="${GIIP_V6_PATCH_ARCHIVE:-$DEFAULT_PATCH_ARCHIVE}"

printf '%s\n' '[pre] Verifying UTF-8 mode, applied marker and V6 patch lineage.'
python -c "import sys; assert sys.flags.utf8_mode == 1, 'Python UTF-8 mode is required'"
if [[ ! -f PATCH_INTEGRATION_V6.json ]]; then
  python scripts/write_patch_integration_manifest_v6.py prepare --patch-archive "$PATCH_ARCHIVE"
fi
if [[ ! -f PATCH_APPLIED_V6.json ]]; then
  echo "PATCH_APPLIED_V6.json is missing. Apply the V6 patch before the release gate." >&2
  exit 2
fi
python -c "import json,pathlib; p=json.loads(pathlib.Path('PATCH_INTEGRATION_V6.json').read_text(encoding='utf-8')); assert p.get('patch_version') == '6.0.0-scientific-candidate-003623', 'unexpected V6 lineage version'; assert p.get('status') in {'prepared','applied'}, 'V6 lineage is not prepared or applied'; m=json.loads(pathlib.Path('PATCH_APPLIED_V6.json').read_text(encoding='utf-8')); marker_version=m.get('patch_version'); assert not marker_version or marker_version == p.get('patch_version'), 'applied marker and integration lineage disagree'; assert m.get('final_v6_result') or (m.get('online_finalization_result') or {}).get('final_v6'), 'applied marker has no V6 finalization result'"

printf '%s\n' '[post] Running release tests and strict validators before browser QA.'
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
python scripts/verify_patch_files.py --phase post

PLAYWRIGHT_STARTED_AT="$(python -c 'import time; print(time.time())')"
(
  cd playwright
  npx playwright test \
    --project=desktop-ru-dark \
    --project=desktop-ru-light \
    --project=desktop-en-dark \
    --project=desktop-en-light \
    --project=mobile-ru \
    --project=mobile-en \
    --project=tablet-ru \
    --project=tablet-en
)
python scripts/write_patch_integration_manifest_v6.py finalize
python scripts/verify_patch_files.py --phase post
python scripts/record_playwright_v6_evidence.py --run-started-at "$PLAYWRIGHT_STARTED_AT"
python scripts/validate_release_readiness.py --strict

echo "GIIP customer_final_release gate passed."
