#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import zipfile
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "PATCH_MANIFEST_V6.json"
INTEGRATION = ROOT / "PATCH_INTEGRATION_V6.json"
BASELINE = ROOT / "PATCH_BASELINE_V6.json"
MARKER = ROOT / "PATCH_APPLIED_V6.json"
EXPECTED_PATCH = "6.0.0-scientific-candidate-003623"
EXPECTED_BASE = "global_index_platform_scientific_candidate_20260711-003623.zip"
EXPECTED_BASE_SHA256 = "d0d9c9d5190bcc7a32fe9196dfd15aed7198300432ae6f570214a91abed4d095"
EXPECTED_BUILT_AT = "2026-07-10T21:36:23+00:00"
REQUIRED_ADDITIONAL_FILES = {
    "giip/config.py",
    "giip/db.py",
    "giip/static/ASSET_MANIFEST.json",
    "giip/static/landing/asset-manifest.json",
    "giip/static/landing.js",
    "giip/static/landing.css",
    "giip/static/cooperation.js",
    "giip/static/cooperation.css",
    "giip/static/personal-data-consent.html",
    "giip/static/flags/MANIFEST.json",
    "giip/static/flags/LICENSE-flag-icons.txt",
    "open_platform.cmd",
    "playwright/playwright.config.ts",
    "playwright/tests/flags.spec.ts",
    "playwright/tests/landing.spec.ts",
    "playwright/tests/cooperation.spec.ts",
    "scripts/write_patch_integration_manifest_v6.py",
    "scripts/refresh_landing_asset_manifests.py",
    "tests/test_flag_assets.py",
    "tests/test_landing_assets.py",
    "tests/test_cooperation_module.py",
}
REQUIRED_FINAL_HASHES = {
    "giip/static/index.html",
    "giip/static/app.js",
    "giip/static/styles.css",
    "giip/static/landing.js",
    "giip/static/landing.css",
    "giip/static/cooperation.js",
    "giip/static/cooperation.css",
    "giip/static/personal-data-consent.html",
    "giip/static/ASSET_MANIFEST.json",
    "giip/static/landing/asset-manifest.json",
    "giip/static/flags/MANIFEST.json",
    "giip/api.py",
    "giip/scientific_release.py",
    "giip/final_release_v6.py",
    "open_platform.cmd",
    "data/global_index_platform.sqlite",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def fail(message: str) -> None:
    raise SystemExit(message)


def load_json(path: Path, label: str) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        fail(f"{label} cannot be read: {exc}")
    if not isinstance(payload, dict):
        fail(f"{label} must contain a JSON object")
    return payload


def require_object(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        fail(f"{label} must be a JSON object")
    return value


def rooted_path(relative: str, label: str) -> Path:
    candidate = Path(relative)
    if candidate.is_absolute():
        fail(f"{label} must be relative to the project root: {relative}")
    resolved = (ROOT / candidate).resolve()
    try:
        resolved.relative_to(ROOT.resolve())
    except ValueError:
        fail(f"{label} escapes the project root: {relative}")
    return resolved


def valid_file_record(record: Any, label: str) -> dict[str, Any]:
    if not isinstance(record, dict):
        fail(f"{label} must be an object")
    checksum = str(record.get("sha256") or "").lower()
    try:
        size = int(record.get("bytes"))
    except (TypeError, ValueError):
        fail(f"{label} has invalid bytes")
    if len(checksum) != 64 or any(char not in "0123456789abcdef" for char in checksum):
        fail(f"{label} has invalid sha256")
    if size < 0:
        fail(f"{label} has invalid bytes")
    return {"sha256": checksum, "bytes": size}


def file_matches(path: Path, record: Any, label: str) -> bool:
    expected = valid_file_record(record, label)
    return path.is_file() and path.stat().st_size == expected["bytes"] and sha256(path) == expected["sha256"]


def find_descendant_archive(descendant: dict[str, Any]) -> Path:
    package_name = str(descendant.get("package_name") or "")
    if not package_name or Path(package_name).name != package_name:
        fail("PATCH_INTEGRATION_V6.json has an invalid descendant package name")
    candidates: list[Path] = []
    recorded = str(descendant.get("archive_path") or "")
    if recorded:
        candidates.append(rooted_path(recorded, "source_descendant.archive_path"))
    candidates.append(ROOT / package_name)
    backup_root = ROOT / "backups" / "pre_v6"
    if backup_root.exists():
        candidates.extend(backup_root.rglob(package_name))
    archive = next((path for path in candidates if path.is_file()), None)
    if archive is None:
        fail(f"Verified descendant archive is missing: {package_name}")
    return archive


def verify_integration_ledger(expected_descendant: dict[str, Any] | None) -> dict[str, Any]:
    if not INTEGRATION.exists():
        fail("PATCH_INTEGRATION_V6.json is missing for descendant-base integration")
    integration = load_json(INTEGRATION, "PATCH_INTEGRATION_V6.json")
    if integration.get("patch_version") != EXPECTED_PATCH:
        fail("PATCH_INTEGRATION_V6.json belongs to another patch")
    status = str(integration.get("status") or "")
    if status not in {"prepared", "applied"}:
        fail(f"PATCH_INTEGRATION_V6.json has invalid status: {status!r}")

    target = require_object(integration.get("declared_target_base") or {}, "declared_target_base")
    expected_target = {
        "package_name": EXPECTED_BASE,
        "archive_sha256": EXPECTED_BASE_SHA256,
        "built_at": EXPECTED_BUILT_AT,
    }
    if any(str(target.get(key) or "").lower() != value.lower() for key, value in expected_target.items()):
        fail("PATCH_INTEGRATION_V6.json declares a different target base")

    descendant = require_object(integration.get("source_descendant") or {}, "source_descendant")
    if expected_descendant is not None:
        package = str(expected_descendant.get("package_name") or "")
        built_at = str(expected_descendant.get("built_at") or "")
        if package != descendant.get("package_name") or built_at != descendant.get("built_at"):
            fail(
                "Descendant ledger does not match its trusted lineage: "
                f"expected={package} ({built_at}), ledger={descendant.get('package_name')} ({descendant.get('built_at')})"
            )

    archive = find_descendant_archive(descendant)
    expected_archive_hash = str(descendant.get("archive_sha256") or "").lower()
    actual_archive_hash = sha256(archive)
    if len(expected_archive_hash) != 64 or actual_archive_hash != expected_archive_hash:
        fail(f"Descendant archive checksum mismatch: expected={expected_archive_hash}, actual={actual_archive_hash}")

    if not BASELINE.exists():
        fail("PATCH_BASELINE_V6.json is missing")
    baseline = load_json(BASELINE, "PATCH_BASELINE_V6.json")
    expected_hashes = require_object(baseline.get("key_file_hashes") or {}, "key_file_hashes")
    declared_hashes = require_object(
        descendant.get("verified_baseline_hashes") or {}, "source_descendant.verified_baseline_hashes"
    )
    if not expected_hashes or set(declared_hashes) != set(expected_hashes):
        fail("Descendant ledger does not declare the complete V6 baseline hash set")
    try:
        with zipfile.ZipFile(archive) as zipped:
            names = set(zipped.namelist())
            for relative, expected in expected_hashes.items():
                expected = str(expected).lower()
                if str(declared_hashes.get(relative) or "").lower() != expected:
                    fail(f"Descendant ledger baseline mismatch: {relative}")
                if relative not in names:
                    fail(f"Descendant archive is missing baseline file: {relative}")
                if hashlib.sha256(zipped.read(relative)).hexdigest() != expected:
                    fail(f"Descendant archive baseline mismatch: {relative}")
    except zipfile.BadZipFile as exc:
        fail(f"Descendant archive is not a valid ZIP file: {exc}")
    return integration


def verify_base_or_marker(phase: str) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
    if MARKER.exists():
        marker = load_json(MARKER, "PATCH_APPLIED_V6.json")
        if marker.get("patch_version") != EXPECTED_PATCH:
            fail("PATCH_APPLIED_V6.json belongs to another patch")
        lineage = marker.get("integration_lineage") or {}
        if lineage:
            integration = verify_integration_ledger(lineage.get("source_descendant") or {})
        else:
            integration = None
            base = marker.get("base") or {}
            if base.get("package_name") != EXPECTED_BASE or base.get("built_at") != EXPECTED_BUILT_AT:
                fail("V6 marker has neither exact-base nor descendant integration lineage")
        return marker, integration

    if phase == "post":
        fail("PATCH_APPLIED_V6.json is missing after patch application")
    external_path = ROOT / "EXTERNAL_AUDIT_MANIFEST.json"
    if not external_path.exists():
        fail("EXTERNAL_AUDIT_MANIFEST.json is missing")
    external = load_json(external_path, "EXTERNAL_AUDIT_MANIFEST.json")
    if external.get("package_name") == EXPECTED_BASE and external.get("built_at") == EXPECTED_BUILT_AT:
        return None, None
    integration = verify_integration_ledger(external)
    if integration.get("status") == "applied":
        fail("PATCH_INTEGRATION_V6.json is applied but PATCH_APPLIED_V6.json is missing")
    return None, integration


def verify_payload(integration: dict[str, Any] | None) -> dict[str, Any]:
    if not MANIFEST.exists():
        fail("PATCH_MANIFEST_V6.json is missing")
    payload = load_json(MANIFEST, "PATCH_MANIFEST_V6.json")
    if payload.get("patch_version") != EXPECTED_PATCH:
        fail(f"Unexpected patch version: {payload.get('patch_version')}")
    merged = require_object((integration or {}).get("merged_files") or {}, "merged_files")
    final_hashes = require_object((integration or {}).get("final_hashes") or {}, "final_hashes")
    manifest_paths = {str(item.get("path") or "").replace("\\", "/") for item in payload.get("files") or []}
    undeclared_merged = sorted(set(merged) - manifest_paths)
    if undeclared_merged:
        fail(f"Merged-file declarations are not patch payload files: {undeclared_merged}")

    errors: list[str] = []
    for item in payload.get("files") or []:
        rel = str(item.get("path") or "").replace("\\", "/")
        path = rooted_path(rel, "patch manifest path")
        if not path.is_file():
            errors.append(f"missing: {rel}")
            continue
        expected = {"sha256": item.get("sha256"), "bytes": item.get("bytes")}
        if file_matches(path, expected, f"PATCH_MANIFEST_V6.json:{rel}"):
            continue
        declarations = []
        if rel in merged:
            declarations.append(("merged_files", merged[rel]))
        if rel in final_hashes:
            declarations.append(("final_hashes", final_hashes[rel]))
        if not declarations or not any(file_matches(path, record, f"{section}:{rel}") for section, record in declarations):
            errors.append(f"undeclared sha256/size mismatch: {rel}")
    if errors:
        fail("Patch payload verification failed:\n" + "\n".join(errors[:50]))
    return payload


def verify_integration_files(integration: dict[str, Any] | None, phase: str) -> None:
    if integration is None:
        return
    merged = require_object(integration.get("merged_files") or {}, "merged_files")
    additional = require_object(integration.get("additional_files") or {}, "additional_files")
    final_hashes = require_object(integration.get("final_hashes") or {}, "final_hashes")
    missing_additional = sorted(REQUIRED_ADDITIONAL_FILES - set(additional))
    if missing_additional:
        fail(f"Required additional integration declarations are missing: {missing_additional}")
    missing_final = sorted(REQUIRED_FINAL_HASHES - set(final_hashes))
    if missing_final:
        fail(f"Required final hash declarations are missing: {missing_final}")

    errors: list[str] = []
    for section_name, records in (("merged_files", merged), ("additional_files", additional)):
        for relative, record in records.items():
            path = rooted_path(str(relative), f"{section_name} path")
            if not file_matches(path, record, f"{section_name}:{relative}"):
                errors.append(f"{section_name} mismatch: {relative}")
    check_database_final = phase == "pre" or integration.get("status") == "applied"
    for relative, record in final_hashes.items():
        if relative == "data/global_index_platform.sqlite" and not check_database_final:
            continue
        path = rooted_path(str(relative), "final_hashes path")
        if not file_matches(path, record, f"final_hashes:{relative}"):
            errors.append(f"final_hashes mismatch: {relative}")
    if errors:
        fail("Descendant integration file verification failed:\n" + "\n".join(errors[:50]))


def verify_post_state(marker: dict[str, Any], integration: dict[str, Any] | None) -> dict[str, Any]:
    required = [
        MARKER,
        ROOT / "data" / "global_index_platform.sqlite",
        ROOT / "docs" / "HTEI_METHODOLOGY_V6.md",
        ROOT / "docs" / "HCI_PLUS_2026_METHOD_NOTE.md",
        ROOT / "docs" / "RELEASE_STATUS.md",
        ROOT / "docs" / "RELEASE_EVIDENCE.md",
        ROOT / "outputs" / "release_readiness.json",
    ]
    missing = [path.relative_to(ROOT).as_posix() for path in required if not path.is_file()]
    if missing:
        fail(f"Post-apply files are missing: {missing}")

    database = ROOT / "data" / "global_index_platform.sqlite"
    database_hash = sha256(database)
    marker_hash = str(marker.get("database_sha256") or "").lower()
    if len(marker_hash) != 64 or database_hash != marker_hash:
        fail(f"Post-apply database hash does not match the marker: marker={marker_hash}, actual={database_hash}")

    backup_relative = str(marker.get("database_backup") or "")
    if not backup_relative:
        fail("PATCH_APPLIED_V6.json does not record a database backup")
    backup = rooted_path(backup_relative, "database_backup")
    if not backup.is_file():
        fail(f"Recorded database backup is missing: {backup_relative}")
    backup_hash = sha256(backup)
    marker_backup_hash = str(marker.get("database_backup_sha256") or "").lower()
    if len(marker_backup_hash) != 64 or backup_hash != marker_backup_hash:
        fail(f"Database backup hash does not match the marker: marker={marker_backup_hash}, actual={backup_hash}")

    if integration is not None and integration.get("status") == "applied":
        application = integration.get("application") or {}
        if application.get("patch_version") != EXPECTED_PATCH or application.get("database_sha256") != marker_hash:
            fail("Applied integration ledger does not match the V6 application marker")
        if str(integration.get("database_backup_sha256") or "").lower() != backup_hash:
            fail("Applied integration ledger has a different database backup hash")
        database_record = (integration.get("final_hashes") or {}).get("data/global_index_platform.sqlite")
        if not file_matches(database, database_record, "final_hashes:data/global_index_platform.sqlite"):
            fail("Applied integration ledger has a different final database hash")

    conn = sqlite3.connect(database)
    conn.row_factory = sqlite3.Row
    try:
        tables = {row[0] for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        required_tables = {
            "index_methodology_registry",
            "htei_v6_profiles",
            "htei_v6_component_values",
            "htei_v6_missingness_audit",
            "hci_plus_country_scores",
            "reproducibility_artifacts",
        }
        absent = sorted(required_tables - tables)
        if absent:
            fail(f"Post-apply database tables are missing: {absent}")
        counts: dict[str, int] = {
            mode: int(conn.execute("SELECT COUNT(*) n FROM htei_v6_profiles WHERE release_year=2026 AND mode=?", (mode,)).fetchone()["n"])
            for mode in ("direct_core", "common_support", "proxy_extended", "asof_diagnostic")
        }
        counts.update({
            "component_values": int(conn.execute("SELECT COUNT(*) n FROM htei_v6_component_values WHERE release_year=2026").fetchone()["n"]),
            "hci_plus": int(conn.execute("SELECT COUNT(*) n FROM hci_plus_country_scores WHERE year=2026").fetchone()["n"]),
            "reproducibility_artifacts": int(conn.execute("SELECT COUNT(*) n FROM reproducibility_artifacts").fetchone()["n"]),
            "raw_snapshots": int(conn.execute("SELECT COUNT(*) n FROM raw_snapshots").fetchone()["n"]),
            "asof_ranked": int(conn.execute("SELECT COUNT(*) n FROM htei_v6_profiles WHERE release_year=2026 AND mode='asof_diagnostic' AND rank IS NOT NULL").fetchone()["n"]),
            "common_support_signatures": int(conn.execute("SELECT COUNT(DISTINCT component_signature) n FROM htei_v6_profiles WHERE release_year=2026 AND mode='common_support'").fetchone()["n"]),
        })
    finally:
        conn.close()

    if counts["direct_core"] < 25 or counts["common_support"] < 75:
        fail(f"HTEI v6 ranked coverage is insufficient: {counts}")
    if counts["proxy_extended"] < counts["common_support"] or counts["asof_diagnostic"] < 200:
        fail(f"HTEI v6 extended/diagnostic coverage is insufficient: {counts}")
    if counts["asof_ranked"] != 0 or counts["common_support_signatures"] != 1:
        fail(f"HTEI v6 ranking invariants failed: {counts}")
    if counts["component_values"] < sum(counts[mode] for mode in ("direct_core", "common_support", "proxy_extended", "asof_diagnostic")):
        fail(f"HTEI v6 component coverage is insufficient: {counts}")
    if counts["reproducibility_artifacts"] < counts["raw_snapshots"]:
        fail(f"Reproducibility artifacts do not cover all raw snapshots: {counts}")

    marker_counts = ((marker.get("final_v6_result") or {}).get("htei_v6") or {})
    for mode in ("direct_core", "common_support", "proxy_extended", "asof_diagnostic"):
        if mode in marker_counts and int(marker_counts[mode]) != counts[mode]:
            fail(f"Database count for {mode} does not match PATCH_APPLIED_V6.json")
    return {"database_sha256": database_hash, "database_backup_sha256": backup_hash, "counts": counts}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--phase", choices=("pre", "post"), default="pre")
    args = parser.parse_args()
    marker, integration = verify_base_or_marker(args.phase)
    payload = verify_payload(integration)
    verify_integration_files(integration, args.phase)
    result: dict[str, Any] = {
        "status": "ok",
        "phase": args.phase,
        "patch_version": EXPECTED_PATCH,
        "files": len(payload.get("files") or []),
        "integration_status": integration.get("status") if integration else "exact_base",
    }
    if args.phase == "post":
        if marker is None:
            fail("PATCH_APPLIED_V6.json is missing after patch application")
        result["post_state"] = verify_post_state(marker, integration)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
