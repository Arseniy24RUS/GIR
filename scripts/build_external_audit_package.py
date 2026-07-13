#!/usr/bin/env python3
from __future__ import annotations

import argparse
import fnmatch
import json
import os
import sqlite3
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from collect_audit_evidence import main as collect_evidence

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / 'data' / 'global_index_platform.sqlite'

EXCLUDE_PATTERNS = [
    '_cleanup_quarantine/**',
    '.git/**',
    '.pytest_cache/**',
    '.mypy_cache/**',
    '.ruff_cache/**',
    '.venv/**',
    'venv/**',
    '**/__pycache__/**',
    'build/**',
    'dist/**',
    'logs/**',
    'tmp/**',
    'temp/**',
    'playwright/node_modules/**',
    'playwright/test-results/**',
    'playwright/playwright-report/**',
    'audit_evidence/playwright/_v6_visual_baselines/**',
    'outputs/**',
    'backups/**',
    '*.zip',
    '*.zip.sha256',
    '*.zip.receipt.json',
]

REQUIRED_PACKAGE_ARTIFACTS = [
    'audit_evidence/EVIDENCE_MANIFEST.json',
    'audit_evidence/outputs/playwright-summary.json',
    'audit_evidence/playwright/final_v6_playwright_manifest.json',
    'audit_evidence/playwright/playwright-report-v6.zip',
    'audit_evidence/playwright/visual-baseline-snapshots-v6.zip',
    'giip/static/ASSET_MANIFEST.json',
    'giip/static/landing/asset-manifest.json',
    'giip/static/landing.js',
    'giip/static/landing.css',
    'giip/static/cooperation.js',
    'giip/static/cooperation.css',
    'giip/static/personal-data-consent.html',
    'giip/static/flags/MANIFEST.json',
    'giip/static/flags/LICENSE-flag-icons.txt',
    'open_platform.cmd',
    'PATCH_INTEGRATION_V6.json',
]

HEAVY_DIRECTORY_NAMES = {
    '.git', '.mypy_cache', '.pytest_cache', '.ruff_cache', '.venv', '__pycache__',
    '_cleanup_quarantine', '_v6_visual_baselines', 'build', 'dist', 'logs',
    'node_modules', 'playwright-report', 'test-results', 'tmp', 'temp', 'venv',
}


def now_stamp() -> str:
    return datetime.now().strftime('%Y%m%d-%H%M%S')


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def sha256(path: Path) -> str:
    import hashlib
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def legal_decisions() -> dict[str, dict[str, Any]]:
    if not DB.exists():
        raise SystemExit(f'Database is missing: {DB}')
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    try:
        existing = conn.execute("SELECT COUNT(*) n FROM sqlite_master WHERE type='table' AND name='license_registry'").fetchone()['n']
        if not existing:
            raise SystemExit('license_registry table is missing; apply the scientific patch first.')
        return {r['source_id']: dict(r) for r in conn.execute('SELECT * FROM license_registry ORDER BY source_id')}
    finally:
        conn.close()


def is_excluded(rel: str) -> bool:
    rel = rel.replace('\\', '/')
    for pattern in EXCLUDE_PATTERNS:
        if '/' not in pattern and pattern.startswith('*.'):
            if '/' not in rel and fnmatch.fnmatch(rel, pattern):
                return True
            continue
        if fnmatch.fnmatch(rel, pattern):
            return True
    return False


def is_excluded_dir(rel: str) -> bool:
    rel = rel.replace('\\', '/').strip('/')
    if not rel:
        return False
    if any(part in HEAVY_DIRECTORY_NAMES for part in rel.split('/')):
        return True
    if rel.endswith('__pycache__') or '/__pycache__/' in f'/{rel}/':
        return True
    for pattern in EXCLUDE_PATTERNS:
        if not pattern.endswith('/**') or pattern.startswith('**/'):
            continue
        prefix = pattern[:-3].strip('/')
        if rel == prefix or rel.startswith(prefix + '/'):
            return True
    return False


def raw_source_id(rel: str) -> str | None:
    parts = rel.replace('\\', '/').split('/')
    return parts[2] if len(parts) >= 4 and parts[:2] == ['data', 'raw'] else None


def project_composition(include_raw: set[str]) -> dict[str, Any]:
    sections = ['giip', 'data/raw', 'docs', 'scripts', 'tests', 'playwright/tests', 'audit_evidence']
    out: dict[str, Any] = {}
    for section in sections:
        path = ROOT / section
        files = []
        if path.exists():
            for candidate in path.rglob('*'):
                if not candidate.is_file():
                    continue
                rel = candidate.relative_to(ROOT).as_posix()
                if is_excluded(rel):
                    continue
                source_id = raw_source_id(rel)
                if source_id and source_id not in include_raw:
                    continue
                files.append(candidate)
        out[section] = {'files': len(files), 'bytes': sum(p.stat().st_size for p in files)}
    out['data/global_index_platform.sqlite'] = {'exists': DB.exists(), 'bytes': DB.stat().st_size if DB.exists() else 0}
    raw_root = ROOT / 'data' / 'raw'
    raw_inventory = [p for p in raw_root.rglob('*') if p.is_file()] if raw_root.exists() else []
    out['workspace_raw_inventory_not_automatically_redistributed'] = {
        'files': len(raw_inventory),
        'bytes': sum(p.stat().st_size for p in raw_inventory),
    }
    return out


def verified_asset_inventory(manifest_relative: str, asset_root: str, collection_key: str) -> list[str]:
    manifest_path = ROOT / manifest_relative
    payload = json.loads(manifest_path.read_text(encoding='utf-8'))
    inventory: list[str] = []
    for item in payload.get(collection_key) or []:
        item_relative = str(item.get('path') or '').replace('\\', '/').strip('/')
        if not item_relative or '..' in Path(item_relative).parts:
            raise SystemExit(f'Invalid asset path in {manifest_relative}: {item_relative!r}')
        relative = f'{asset_root.rstrip("/")}/{item_relative}'
        path = ROOT / relative
        if not path.is_file():
            raise SystemExit(f'Asset inventory file is missing: {relative}')
        if int(item.get('bytes') or -1) != path.stat().st_size or str(item.get('sha256') or '').lower() != sha256(path):
            raise SystemExit(f'Asset inventory checksum mismatch: {relative}')
        inventory.append(relative)
    if not inventory:
        raise SystemExit(f'Asset inventory is empty: {manifest_relative}')
    return inventory


def validate_required_artifacts(candidate: bool) -> list[str]:
    required = list(REQUIRED_PACKAGE_ARTIFACTS)
    if not candidate:
        required.append('PATCH_INTEGRATION_V6.json.sha256')
    missing = [relative for relative in required if not (ROOT / relative).is_file()]
    if missing:
        raise SystemExit('Required compact evidence or release ledger files are missing: ' + ', '.join(missing))

    integration_path = ROOT / 'PATCH_INTEGRATION_V6.json'
    integration = json.loads(integration_path.read_text(encoding='utf-8'))
    allowed_statuses = {'prepared', 'applied'} if candidate else {'applied'}
    if integration.get('status') not in allowed_statuses:
        raise SystemExit(
            f"PATCH_INTEGRATION_V6.json has status {integration.get('status')!r}; "
            f"expected one of {sorted(allowed_statuses)}"
        )
    if not candidate:
        sidecar = ROOT / 'PATCH_INTEGRATION_V6.json.sha256'
        fields = sidecar.read_text(encoding='ascii').split()
        if len(fields) < 2 or fields[0].lower() != sha256(integration_path) or fields[1] != integration_path.name:
            raise SystemExit('PATCH_INTEGRATION_V6.json.sha256 does not match the finalized integration ledger.')
    required.extend(verified_asset_inventory('giip/static/ASSET_MANIFEST.json', 'giip/static', 'assets'))
    required.extend(verified_asset_inventory('giip/static/flags/MANIFEST.json', 'giip/static/flags', 'countries'))
    return list(dict.fromkeys(required))


def validate_legal_registry(decisions: dict[str, dict[str, Any]], candidate: bool) -> tuple[set[str], dict[str, str]]:
    include: set[str] = set()
    disposition: dict[str, str] = {}
    pending: list[str] = []
    for source_id, item in decisions.items():
        status = str(item.get('review_status') or '')
        decision = str(item.get('release_archive_decision') or 'pending')
        disposition[source_id] = decision
        if status in {'approved', 'project_policy_approved'} and decision == 'include':
            include.add(source_id)
        elif status in {'approved', 'project_policy_approved'} and decision == 'exclude_raw_keep_derived':
            continue
        else:
            pending.append(source_id)
    if pending and not candidate:
        raise SystemExit(
            'Final customer package cannot be built: legal decisions are pending for source IDs: '
            + ', '.join(sorted(pending))
        )
    return include, disposition


def write_manifest(
    package_name: str,
    include_raw: set[str],
    disposition: dict[str, str],
    candidate: bool,
    required_artifacts: list[str],
) -> dict[str, Any]:
    evidence_manifest = ROOT / 'audit_evidence' / 'EVIDENCE_MANIFEST.json'
    payload = {
        'built_at': now_iso(),
        'package_name': package_name,
        'package_mode': 'scientific_release_candidate' if candidate else 'customer_final_release',
        'archive_checksum_sidecar': package_name + '.sha256',
        'checksum_note': 'The external .sha256 sidecar is the authoritative archive checksum. The in-archive manifest intentionally does not embed a self-referential ZIP hash.',
        'excluded_paths': EXCLUDE_PATTERNS,
        'raw_source_archive_decisions': disposition,
        'raw_source_ids_included': sorted(include_raw),
        'project_composition': project_composition(include_raw),
        'audit_evidence_manifest': evidence_manifest.relative_to(ROOT).as_posix() if evidence_manifest.exists() else None,
        'required_release_artifacts': required_artifacts,
        'release_verification_commands': [
            'python scripts/apply_final_release_v6_patch.py',
            'bash scripts/patch_candidate_gate.sh',
            'python -m pytest -q',
            'python scripts/validate_no_generated_data.py --strict',
            'python scripts/validate_i18n_labels.py --strict',
            'python scripts/validate_source_provenance.py --strict',
            'python scripts/validate_index_formulas.py --strict',
            'python scripts/record_playwright_v6_evidence.py',
            'python scripts/validate_release_readiness.py --strict',
            'bash scripts/release_gate.sh',
        ],
    }
    (ROOT / 'EXTERNAL_AUDIT_MANIFEST.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return payload


def build_zip(package_name: str, include_raw: set[str]) -> Path:
    zip_path = ROOT / package_name
    with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=8) as zf:
        for dirpath, dirnames, filenames in os.walk(ROOT):
            current = Path(dirpath)
            dirnames[:] = [d for d in sorted(dirnames) if not is_excluded_dir((current / d).relative_to(ROOT).as_posix())]
            for filename in sorted(filenames):
                path = current / filename
                rel = path.relative_to(ROOT).as_posix()
                if is_excluded(rel):
                    continue
                source_id = raw_source_id(rel)
                if source_id and source_id not in include_raw:
                    continue
                zf.write(path, rel)
    return zip_path


def verify_archive_contents(zip_path: Path, required_artifacts: list[str]) -> None:
    with zipfile.ZipFile(zip_path) as archive:
        names = set(archive.namelist())
    missing = sorted(set(required_artifacts) - names)
    if missing:
        raise SystemExit('Built package is missing required release artifacts: ' + ', '.join(missing))
    forbidden = sorted(name for name in names if name == 'logs' or name.startswith('logs/'))
    if forbidden:
        raise SystemExit('Built package unexpectedly contains logs/** paths: ' + ', '.join(forbidden[:10]))


def main() -> None:
    ap = argparse.ArgumentParser(description='Build a licence-aware external/customer audit package.')
    ap.add_argument('--candidate', action='store_true', help='Build a candidate package while excluding every raw source without an approved include decision.')
    args = ap.parse_args()
    collect_evidence()
    required_artifacts = validate_required_artifacts(args.candidate)
    decisions = legal_decisions()
    include_raw, disposition = validate_legal_registry(decisions, args.candidate)
    prefix = 'global_index_platform_scientific_candidate' if args.candidate else 'global_index_platform_customer_final'
    package_name = f'{prefix}_{now_stamp()}.zip'
    write_manifest(package_name, include_raw, disposition, args.candidate, required_artifacts)
    zip_path = build_zip(package_name, include_raw)
    verify_archive_contents(zip_path, required_artifacts)
    digest = sha256(zip_path)
    sidecar = ROOT / f'{package_name}.sha256'
    sidecar.write_text(f'{digest}  {package_name}\n', encoding='utf-8')
    receipt = ROOT / f'{package_name}.receipt.json'
    receipt.write_text(json.dumps({
        'package_name': package_name,
        'package_mode': 'scientific_release_candidate' if args.candidate else 'customer_final_release',
        'built_at': now_iso(),
        'zip_size_bytes': zip_path.stat().st_size,
        'zip_sha256': digest,
        'sidecar': sidecar.name,
    }, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'status': 'ok', 'mode': 'candidate' if args.candidate else 'final', 'zip': str(zip_path), 'sha256': digest, 'bytes': zip_path.stat().st_size, 'receipt': str(receipt), 'raw_sources_included': sorted(include_raw)}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
