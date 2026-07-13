#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime
import json

out=Path('docs/RELEASE_EVIDENCE.md')
out.parent.mkdir(exist_ok=True)
if not out.exists():
    out.write_text('# Release evidence\n\n', encoding='utf-8')

manifest_path = Path('EXTERNAL_AUDIT_MANIFEST.json')
manifest = {}
if manifest_path.exists():
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))

checks = manifest.get('release_verification_commands') or [
    'python -m pytest -q',
    'python scripts/validate_no_generated_data.py --strict',
    'python scripts/validate_i18n_labels.py --strict',
    'python scripts/validate_source_provenance.py --strict',
    'python scripts/validate_index_formulas.py --strict',
    'python scripts/validate_release_readiness.py --strict',
    'bash scripts/release_gate.sh',
]

with out.open('a', encoding='utf-8') as f:
    f.write(f'\n## Status update {datetime.utcnow().isoformat()}Z\n\n')
    f.write('- Release dataset: real-source production SQLite and raw snapshots are stored under `data/`.\n')
    f.write('- Audit package: see root `EXTERNAL_AUDIT_MANIFEST.json` for package name, checksum and excluded paths.\n')
    f.write('- Verification commands:\n')
    for command in checks:
        f.write(f'  - `{command}`\n')
print(out)
