#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from giip.db import connect, migrate_schema
from giip.scientific_release import apply_scientific_release
from giip.final_release_v6 import apply_offline_finalization

PATCH_VERSION = "6.0.0-scientific-candidate-003623"
APP_VERSION = "1.0.0-rc6"
EXPECTED_BASE_PACKAGE = "global_index_platform_scientific_candidate_20260711-003623.zip"
EXPECTED_BASE_BUILT_AT = "2026-07-10T21:36:23+00:00"
EXPECTED_BASE_SHA256 = "d0d9c9d5190bcc7a32fe9196dfd15aed7198300432ae6f570214a91abed4d095"
INTEGRATION_PATH = ROOT / "PATCH_INTEGRATION_V6.json"
BASELINE_PATH = ROOT / "PATCH_BASELINE_V6.json"
APPLIED_MARKER_PATH = ROOT / "PATCH_APPLIED_V6.json"


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_json(path: Path, label: str) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise SystemExit(f"{label} cannot be read: {exc}") from exc
    if not isinstance(payload, dict):
        raise SystemExit(f"{label} must contain a JSON object")
    return payload


def require_object(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise SystemExit(f"{label} must be a JSON object")
    return value


def rooted_path(relative: str, label: str) -> Path:
    candidate = Path(relative)
    if candidate.is_absolute():
        raise SystemExit(f"{label} must be relative to the project root: {relative}")
    resolved = (ROOT / candidate).resolve()
    try:
        resolved.relative_to(ROOT.resolve())
    except ValueError as exc:
        raise SystemExit(f"{label} escapes the project root: {relative}") from exc
    return resolved


def find_descendant_archive(descendant: dict[str, Any]) -> Path:
    package_name = str(descendant.get("package_name") or "")
    if not package_name or Path(package_name).name != package_name:
        raise SystemExit("PATCH_INTEGRATION_V6.json has an invalid descendant package name")
    candidates: list[Path] = []
    recorded_path = str(descendant.get("archive_path") or "")
    if recorded_path:
        candidates.append(rooted_path(recorded_path, "source_descendant.archive_path"))
    candidates.append(ROOT / package_name)
    backup_root = ROOT / "backups" / "pre_v6"
    if backup_root.exists():
        candidates.extend(backup_root.rglob(package_name))
    archive = next((path for path in candidates if path.is_file()), None)
    if archive is None:
        raise SystemExit(f"Verified descendant archive is missing: {package_name}")
    return archive


def verify_integration_ledger(external: dict[str, Any]) -> dict[str, Any]:
    if not INTEGRATION_PATH.exists():
        raise SystemExit(
            "Base build mismatch and PATCH_INTEGRATION_V6.json is missing. "
            "Run scripts/write_patch_integration_manifest_v6.py prepare before applying the patch."
        )
    integration = load_json(INTEGRATION_PATH, "PATCH_INTEGRATION_V6.json")
    if integration.get("patch_version") != PATCH_VERSION:
        raise SystemExit("PATCH_INTEGRATION_V6.json belongs to another patch")
    status = str(integration.get("status") or "")
    if status not in {"prepared", "applied"}:
        raise SystemExit(f"PATCH_INTEGRATION_V6.json has invalid status: {status!r}")

    target = require_object(integration.get("declared_target_base") or {}, "declared_target_base")
    expected_target = {
        "package_name": EXPECTED_BASE_PACKAGE,
        "archive_sha256": EXPECTED_BASE_SHA256,
        "built_at": EXPECTED_BASE_BUILT_AT,
    }
    if any(str(target.get(key) or "").lower() != value.lower() for key, value in expected_target.items()):
        raise SystemExit("PATCH_INTEGRATION_V6.json declares a different target base")

    descendant = require_object(integration.get("source_descendant") or {}, "source_descendant")
    package = str(external.get("package_name") or "")
    built_at = str(external.get("built_at") or "")
    if package != descendant.get("package_name") or built_at != descendant.get("built_at"):
        raise SystemExit(
            "Descendant integration record does not match EXTERNAL_AUDIT_MANIFEST.json: "
            f"manifest={package} ({built_at}), ledger={descendant.get('package_name')} ({descendant.get('built_at')})."
        )

    archive = find_descendant_archive(descendant)
    expected_archive_hash = str(descendant.get("archive_sha256") or "").lower()
    actual_archive_hash = sha256(archive)
    if len(expected_archive_hash) != 64 or actual_archive_hash != expected_archive_hash:
        raise SystemExit(
            f"Descendant archive checksum mismatch: expected={expected_archive_hash}, actual={actual_archive_hash}"
        )

    if not BASELINE_PATH.exists():
        raise SystemExit("PATCH_BASELINE_V6.json is missing")
    baseline = load_json(BASELINE_PATH, "PATCH_BASELINE_V6.json")
    expected_hashes = require_object(baseline.get("key_file_hashes") or {}, "key_file_hashes")
    recorded_hashes = require_object(
        descendant.get("verified_baseline_hashes") or {}, "source_descendant.verified_baseline_hashes"
    )
    if not expected_hashes or set(recorded_hashes) != set(expected_hashes):
        raise SystemExit("Descendant ledger does not declare the complete V6 baseline hash set")
    try:
        with zipfile.ZipFile(archive) as zipped:
            names = set(zipped.namelist())
            for relative, expected in expected_hashes.items():
                declared = str(recorded_hashes.get(relative) or "").lower()
                expected = str(expected).lower()
                if declared != expected:
                    raise SystemExit(f"Descendant ledger baseline mismatch: {relative}")
                if relative not in names:
                    raise SystemExit(f"Descendant archive is missing baseline file: {relative}")
                actual = hashlib.sha256(zipped.read(relative)).hexdigest()
                if actual != expected:
                    raise SystemExit(f"Descendant archive baseline mismatch: {relative}")
    except zipfile.BadZipFile as exc:
        raise SystemExit(f"Descendant archive is not a valid ZIP file: {exc}") from exc

    return {
        "ledger": integration,
        "base": {
            "package_name": package,
            "built_at": built_at,
            "validation_mode": "checksum_verified_descendant_ledger",
            "archive_path": archive.relative_to(ROOT).as_posix(),
            "archive_sha256": actual_archive_hash,
            "target_base": expected_target,
            "integration_status": status,
        },
    }


def check_base() -> dict[str, Any]:
    if APPLIED_MARKER_PATH.exists():
        marker = load_json(APPLIED_MARKER_PATH, "PATCH_APPLIED_V6.json")
        if marker.get("patch_version") != PATCH_VERSION:
            raise SystemExit(
                f"PATCH_APPLIED_V6.json belongs to {marker.get('patch_version')!r}; expected {PATCH_VERSION!r}."
            )
        base = marker.get("base") or {}
        return {"base": {**base, "validation_mode": "validated_v6_marker"}, "marker": marker, "ledger": None}
    manifest_path = ROOT / "EXTERNAL_AUDIT_MANIFEST.json"
    if not manifest_path.exists():
        raise SystemExit(
            "EXTERNAL_AUDIT_MANIFEST.json is missing. Apply this patch only to "
            f"{EXPECTED_BASE_PACKAGE}, or merge through Codex after a documented descendant audit."
        )
    payload = load_json(manifest_path, "EXTERNAL_AUDIT_MANIFEST.json")
    package = str(payload.get("package_name") or "")
    built_at = str(payload.get("built_at") or "")
    if package == EXPECTED_BASE_PACKAGE and built_at == EXPECTED_BASE_BUILT_AT:
        return {
            "base": {"package_name": package, "built_at": built_at, "validation_mode": "exact_base_manifest"},
            "marker": None,
            "ledger": None,
        }
    verified = verify_integration_ledger(payload)
    if verified["ledger"].get("status") == "applied":
        raise SystemExit("PATCH_INTEGRATION_V6.json is applied but PATCH_APPLIED_V6.json is missing")
    return {**verified, "marker": None}


def verify_database_marker(marker: dict[str, Any], *, allow_refresh: bool) -> dict[str, str]:
    database = ROOT / "data" / "global_index_platform.sqlite"
    if not database.is_file():
        raise SystemExit("The database recorded by PATCH_APPLIED_V6.json is missing")
    recorded = str(marker.get("database_sha256") or "").lower()
    if len(recorded) != 64:
        raise SystemExit("PATCH_APPLIED_V6.json has no valid database_sha256")
    current = sha256(database)
    if current != recorded and not allow_refresh:
        raise SystemExit(
            "The database changed after PATCH_APPLIED_V6.json. Use --refresh after backing up and confirming "
            f"the official-source change. recorded={recorded}, current={current}"
        )
    return {"recorded": recorded, "current": current}


def backup_database() -> Path | None:
    source = ROOT / "data" / "global_index_platform.sqlite"
    if not source.exists():
        return None
    target_dir = ROOT / "backups"
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / f"pre_final_v6_{datetime.now().strftime('%Y%m%d-%H%M%S')}.sqlite"
    shutil.copy2(source, target)
    return target


def remove(path: Path) -> None:
    if not path.exists():
        return
    if path.is_dir():
        shutil.rmtree(path)
    else:
        path.unlink()


def clean_stale_evidence() -> list[str]:
    candidates = [
        ROOT / "audit_evidence" / "outputs",
        ROOT / "audit_evidence" / "commands",
        ROOT / "audit_evidence" / "EVIDENCE_MANIFEST.json",
        ROOT / "playwright" / "playwright-report",
        ROOT / "playwright" / "test-results",
        ROOT / "outputs" / "playwright-summary.json",
    ]
    playwright_dir = ROOT / "audit_evidence" / "playwright"
    if playwright_dir.exists():
        candidates.extend(path for path in playwright_dir.iterdir() if path.name != ".gitkeep")
    removed: list[str] = []
    for path in candidates:
        if path.exists():
            removed.append(path.relative_to(ROOT).as_posix())
            remove(path)
    playwright_dir.mkdir(parents=True, exist_ok=True)
    (ROOT / "audit_evidence" / "README_FINAL_V6.md").write_text(
        "# Final-v6 Playwright evidence\n\n"
        "Evidence from prior methodology/database/frontend versions was removed when the v6 patch was applied. "
        "Run all eight Playwright projects against the final online-data build, manually inspect visual baselines, "
        "then execute `python scripts/record_playwright_v6_evidence.py`.\n",
        encoding="utf-8",
    )
    return removed




def clean_stale_v5_metadata() -> list[str]:
    candidates = [
        "PATCH_APPLIED_V5.json", "PATCH_BASELINE_V5.json", "PATCH_DELETE_PATHS.txt",
        "PATCH_FILE_LIST.txt", "PATCH_INTEGRATION_V5.json", "PATCH_INTEGRATION_V5.json.sha256",
        "PATCH_MANIFEST_V5.json", "PATCH_README_V5.md", "PATCH_SHA256SUMS.txt",
        "docs/CODEX_FINAL_RELEASE_TZ.md", "docs/CODEX_PATCH_INTEGRATION.md",
        "docs/CODEX_FINAL_ONLINE_DATA_TZ.md", "docs/FRONTEND_V5_INTEGRATION_CONTRACT.md",
        "docs/HTEI_METHODOLOGY_V5.md",
        "scripts/apply_scientific_release_patch.py",
        "scripts/record_playwright_v5_evidence.py", "scripts/write_patch_integration_manifest.py",
    ]
    removed: list[str] = []
    for relative in candidates:
        path = ROOT / relative
        if path.exists():
            removed.append(relative)
            remove(path)
    return removed


def capture_v5_lineage() -> dict[str, Any] | None:
    json_files = {
        "applied_marker": ROOT / "PATCH_APPLIED_V5.json",
        "integration_record": ROOT / "PATCH_INTEGRATION_V5.json",
    }
    artifacts = [
        ROOT / "PATCH_APPLIED_V5.json",
        ROOT / "PATCH_BASELINE_V5.json",
        ROOT / "PATCH_INTEGRATION_V5.json",
        ROOT / "PATCH_INTEGRATION_V5.json.sha256",
        ROOT / "PATCH_MANIFEST_V5.json",
    ]
    existing = [path for path in artifacts if path.is_file()]
    if not existing:
        return None
    lineage: dict[str, Any] = {
        "captured_at": now(),
        "artifacts": {
            path.relative_to(ROOT).as_posix(): {"sha256": sha256(path), "bytes": path.stat().st_size}
            for path in existing
        },
    }
    for key, path in json_files.items():
        if path.is_file():
            lineage[key] = load_json(path, path.name)
    return lineage

def run_script(script: str) -> None:
    subprocess.run([sys.executable, str(ROOT / "scripts" / script)], cwd=ROOT, check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Apply GIIP final-release-v6 migration to the verified 003623 candidate.")
    parser.add_argument("--refresh", action="store_true", help="Rebuild deterministic v6 outputs after official data changed.")
    args = parser.parse_args()

    context = check_base()
    base = context["base"]
    previous_marker = context.get("marker") or {}
    database_marker: dict[str, str] | None = None
    if previous_marker:
        database_marker = verify_database_marker(previous_marker, allow_refresh=args.refresh)
    if base["validation_mode"] == "validated_v6_marker" and not args.refresh:
        print(json.dumps({
            "status": "ok",
            "patch_version": PATCH_VERSION,
            "no_op": True,
            "database_sha256": database_marker["current"] if database_marker else None,
            "marker": APPLIED_MARKER_PATH.relative_to(ROOT).as_posix(),
        }, ensure_ascii=False, indent=2))
        return

    backup = backup_database()
    removed = clean_stale_evidence()
    v5_lineage = previous_marker.get("v5_lineage") or capture_v5_lineage()
    with connect() as conn:
        migrate_schema(conn)
        staging = apply_scientific_release(conn)
        conn.commit()
    final = apply_offline_finalization(build_artifacts=True, normalize_playwright=False)
    run_script("generate_scientific_validation_report.py")
    run_script("generate_release_docs.py")

    removed_v5: list[str] = []
    if context.get("ledger") is not None:
        removed_v5 = clean_stale_v5_metadata()

    marker = {
        "patch_version": PATCH_VERSION,
        "application_version": APP_VERSION,
        "applied_at": now(),
        "base": previous_marker.get("base") or base,
        "integration_lineage": (
            previous_marker.get("integration_lineage")
            or ({
                "manifest": INTEGRATION_PATH.relative_to(ROOT).as_posix(),
                "status_at_apply": context["ledger"].get("status"),
                "declared_target_base": context["ledger"].get("declared_target_base"),
                "source_descendant": context["ledger"].get("source_descendant"),
            } if context.get("ledger") is not None else None)
        ),
        "v5_lineage": v5_lineage,
        "database_backup": backup.relative_to(ROOT).as_posix() if backup else previous_marker.get("database_backup"),
        "database_backup_sha256": sha256(backup) if backup else previous_marker.get("database_backup_sha256"),
        "removed_stale_evidence": removed,
        "removed_stale_v5_metadata": removed_v5,
        "staging_result": staging,
        "final_v6_result": final,
        "database_sha256": sha256(ROOT / "data" / "global_index_platform.sqlite"),
        "refresh_from_database_sha256": (
            database_marker["current"]
            if args.refresh and database_marker and database_marker["current"] != database_marker["recorded"]
            else None
        ),
        "remaining_online_steps": [
            "official HCI+ 2026 country briefs",
            "numeric national-statistics layer",
            "numeric corporate-reporting layer",
            "fresh Playwright v6 evidence",
        ],
        "accepted_methodological_decisions": {
            "htei_weights": "fixed by the approved research report; no renewed weight approval is required",
            "external_method_reviews": "not a mandatory release gate per the project owner's decision",
        },
    }
    APPLIED_MARKER_PATH.write_text(json.dumps(marker, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "ok", **marker}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
