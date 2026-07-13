#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "PATCH_INTEGRATION_V6.json"
OUTPUT_SHA256 = ROOT / "PATCH_INTEGRATION_V6.json.sha256"
PATCH_VERSION = "6.0.0-scientific-candidate-003623"
PATCH_NAME = "giip_v06_hci_plus_final_release_patch_003623.zip"
PATCH_SHA256 = "4882ac8708082c538290355c17a114bf72ccafd1475c38c60718c8f70fe6466c"
TARGET_BASE_NAME = "global_index_platform_scientific_candidate_20260711-003623.zip"
TARGET_BASE_SHA256 = "d0d9c9d5190bcc7a32fe9196dfd15aed7198300432ae6f570214a91abed4d095"
TARGET_BASE_BUILT_AT = "2026-07-10T21:36:23+00:00"

ALLOWED_MERGED_FILES = {
    "APPLY_PATCH.ps1",
    "APPLY_PATCH.sh",
    "configs/national_statistics_sources.release.json",
    "giip/api.py",
    "giip/static/app.js",
    "giip/static/index.html",
    "giip/static/styles.css",
    "giip/final_release_v6.py",
    "playwright/tests/final-v6.spec.ts",
    "scripts/apply_final_release_v6_patch.py",
    "scripts/build_external_audit_package.py",
    "scripts/fetch_hci_plus_2026.py",
    "scripts/fetch_national_statistics_metrics.py",
    "scripts/fetch_sec_corporate_metrics.py",
    "scripts/patch_candidate_gate.sh",
    "scripts/record_playwright_v6_evidence.py",
    "scripts/release_gate.sh",
    "scripts/verify_patch_files.py",
    "tests/test_descendant_regressions.py",
    "tests/test_hci_plus_loader.py",
}

ADDITIONAL_INTEGRATION_FILES = {
    "giip/config.py": "GIIP_DB override keeps pytest isolated from the production database",
    "giip/db.py": "Verified descendant database schema and migration layer",
    "giip/static/ASSET_MANIFEST.json": "Project asset ledger extended with the local flag collection",
    "giip/static/landing/asset-manifest.json": "Checksum and dimensions ledger for every landing raster variant",
    "giip/static/landing.js": "Immediate RU/EN and light/dark GIR landing renderer",
    "giip/static/landing.css": "Responsive STP-aligned landing composition and local icon system",
    "giip/static/cooperation.js": "Localized cooperation dialog, validation, submission, and fallback flow",
    "giip/static/cooperation.css": "Theme-aware cooperation controls and native dialog styling",
    "giip/static/personal-data-consent.html": "Localized standalone personal-data consent document",
    "giip/static/flags/MANIFEST.json": "SHA-256 manifest for every local ISO2 flag asset",
    "giip/static/flags/LICENSE-flag-icons.txt": "MIT licence for flag-icons 7.5.0",
    "open_platform.cmd": "Verified Windows quick local start retained across the V6 overlay",
    "playwright/playwright.config.ts": "Eight-project release matrix with a fresh controlled server",
    "playwright/tests/api-contract.spec.ts": "Current HCI+ and HTEI v6 API contract coverage",
    "playwright/tests/flags.spec.ts": "Cross-browser country-flag regression coverage",
    "playwright/tests/landing.spec.ts": "Landing routing, localization, asset, icon, and square-index coverage",
    "playwright/tests/cooperation.spec.ts": "Mocked cooperation success and fallback coverage",
    "playwright/tests/accessibility.spec.ts": "Landing and analytics axe accessibility coverage",
    "playwright/tests/indices.spec.ts": "Current seven-index navigation coverage including HCI+",
    "playwright/tests/map-interaction.spec.ts": "Quantile choropleth coverage for every current index",
    "playwright/tests/scientific-v5.spec.ts": "Legacy alias and current methodology-registry coverage",
    "playwright/tests/sidebar-navigation.spec.ts": "Fixed GIR rail alignment and square index-code coverage",
    "playwright/tests/visual.spec.ts": "Viewport-aware visual readiness and HCI+ route coverage",
    "scripts/write_patch_integration_manifest_v6.py": "Checksum-backed V6 descendant integration ledger",
    "scripts/refresh_landing_asset_manifests.py": "Deterministic WebP and asset-ledger refresh for landing media",
    "tests/test_flag_assets.py": "Backend and asset coverage tests for all country flags",
    "tests/test_landing_assets.py": "Landing raster, SVG manifest, MIME, and editorial snapshot coverage",
    "tests/test_cooperation_module.py": "Cooperation module and consent-route backend coverage",
    "tests/test_national_statistics_loader.py": "JSON-stat2, CSV field-mapping, and national-statistics release-config coverage",
    "tests/test_sec_corporate_metrics.py": "SEC Company Facts selection, provenance, retries, and threshold coverage",
}

FINAL_HASH_FILES = (
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
)


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def zip_sha256(archive: zipfile.ZipFile, relative: str) -> str:
    return hashlib.sha256(archive.read(relative)).hexdigest()


def verified_patch_manifest(path: Path) -> tuple[dict[str, Any], int]:
    actual = sha256(path)
    if actual != PATCH_SHA256:
        raise SystemExit(f"Patch archive checksum mismatch: expected {PATCH_SHA256}, got {actual}")
    with zipfile.ZipFile(path) as archive:
        names = set(archive.namelist())
        manifest_name = "PATCH_MANIFEST_V6.json"
        if manifest_name not in names:
            raise SystemExit(f"Patch archive is missing {manifest_name}")
        manifest = json.loads(archive.read(manifest_name).decode("utf-8"))
        root_manifest = ROOT / manifest_name
        if not root_manifest.exists() or sha256(root_manifest) != zip_sha256(archive, manifest_name):
            raise SystemExit("The overlaid PATCH_MANIFEST_V6.json differs from the verified archive")
        for item in manifest.get("files", []):
            relative = item["path"]
            if relative not in names:
                raise SystemExit(f"Patch archive is missing {relative}")
            payload = archive.read(relative)
            if len(payload) != int(item["bytes"]) or hashlib.sha256(payload).hexdigest() != item["sha256"]:
                raise SystemExit(f"Patch payload checksum mismatch: {relative}")
    return manifest, len(manifest.get("files", []))


def find_archive(package_name: str) -> Path:
    candidates = [ROOT / package_name]
    backup_root = ROOT / "backups" / "pre_v6"
    if backup_root.exists():
        candidates.extend(backup_root.rglob(package_name))
    archive = next((path for path in candidates if path.exists()), None)
    if archive is None:
        raise SystemExit(f"Verified descendant archive is missing: {package_name}")
    return archive


def descendant_record() -> dict[str, Any]:
    existing: dict[str, Any] = {}
    if OUTPUT.exists():
        existing = json.loads(OUTPUT.read_text(encoding="utf-8"))
    recorded = existing.get("source_descendant") or {}
    if existing.get("patch_version") == PATCH_VERSION and recorded.get("package_name"):
        package_name = str(recorded["package_name"])
        archive = find_archive(package_name)
        actual = sha256(archive)
        if actual != str(recorded.get("archive_sha256") or "").lower():
            raise SystemExit("Recorded descendant archive checksum mismatch")
        return {**recorded, "archive_path": archive.relative_to(ROOT).as_posix()}

    external_path = ROOT / "EXTERNAL_AUDIT_MANIFEST.json"
    if not external_path.exists():
        raise SystemExit("EXTERNAL_AUDIT_MANIFEST.json is missing")
    external = json.loads(external_path.read_text(encoding="utf-8"))
    package_name = str(external.get("package_name") or "")
    archive = find_archive(package_name)
    actual = sha256(archive)
    receipt_path = ROOT / f"{package_name}.receipt.json"
    sidecar_path = ROOT / f"{package_name}.sha256"
    expected = ""
    if receipt_path.exists():
        expected = str(json.loads(receipt_path.read_text(encoding="utf-8")).get("zip_sha256") or "").lower()
    if sidecar_path.exists():
        sidecar_hash = sidecar_path.read_text(encoding="utf-8").split()[0].lower()
        if expected and sidecar_hash != expected:
            raise SystemExit("Descendant receipt and sidecar disagree")
        expected = expected or sidecar_hash
    if not expected or actual != expected:
        raise SystemExit(f"Descendant archive checksum mismatch: expected={expected}, actual={actual}")
    return {
        "package_name": package_name,
        "built_at": external.get("built_at"),
        "archive_path": archive.relative_to(ROOT).as_posix(),
        "archive_sha256": actual,
    }


def verify_descendant_baseline(record: dict[str, Any]) -> dict[str, str]:
    baseline = json.loads((ROOT / "PATCH_BASELINE_V6.json").read_text(encoding="utf-8"))
    expected_hashes = baseline.get("key_file_hashes") or {}
    archive = find_archive(str(record["package_name"]))
    verified: dict[str, str] = {}
    with zipfile.ZipFile(archive) as zipped:
        names = set(zipped.namelist())
        for relative, expected in expected_hashes.items():
            if relative not in names:
                raise SystemExit(f"Descendant archive is missing baseline file: {relative}")
            actual = zip_sha256(zipped, relative)
            if actual != str(expected).lower():
                raise SystemExit(f"Descendant baseline mismatch: {relative}")
            verified[relative] = actual
    return verified


def current_hashes(paths: tuple[str, ...]) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for relative in paths:
        path = ROOT / relative
        if not path.exists():
            raise SystemExit(f"Required integration file is missing: {relative}")
        result[relative] = {"sha256": sha256(path), "bytes": path.stat().st_size}
    return result


def prepare(patch_archive: Path) -> dict[str, Any]:
    patch_manifest, files_verified = verified_patch_manifest(patch_archive)
    source_descendant = descendant_record()
    baseline_hashes = verify_descendant_baseline(source_descendant)
    merged: dict[str, dict[str, Any]] = {}
    for item in patch_manifest.get("files", []):
        relative = item["path"]
        path = ROOT / relative
        if not path.exists():
            raise SystemExit(f"Overlaid patch file is missing: {relative}")
        actual = sha256(path)
        if actual != item["sha256"]:
            if relative not in ALLOWED_MERGED_FILES:
                raise SystemExit(f"Unreviewed V6 payload drift is not allowed: {relative}")
            merged[relative] = {
                "sha256": actual,
                "bytes": path.stat().st_size,
                "reason": "Reviewed descendant merge, release hardening, or local flag restoration",
            }
    additional: dict[str, dict[str, Any]] = {}
    for relative, reason in ADDITIONAL_INTEGRATION_FILES.items():
        path = ROOT / relative
        if not path.exists():
            raise SystemExit(f"Required descendant integration file is missing: {relative}")
        additional[relative] = {"sha256": sha256(path), "bytes": path.stat().st_size, "reason": reason}
    payload: dict[str, Any] = {
        "status": "prepared",
        "patch_version": PATCH_VERSION,
        "prepared_at": now(),
        "incoming_patch": {
            "archive_name": PATCH_NAME,
            "archive_sha256": PATCH_SHA256,
            "payload_files_verified": files_verified,
            "checksum_list_note": "PATCH_MANIFEST_V6.json is authoritative; the bundled text checksum list covers 68 payload files.",
        },
        "declared_target_base": {
            "package_name": TARGET_BASE_NAME,
            "archive_sha256": TARGET_BASE_SHA256,
            "built_at": TARGET_BASE_BUILT_AT,
        },
        "source_descendant": {**source_descendant, "verified_baseline_hashes": baseline_hashes},
        "preserved_descendant_changes": [
            "Quantile choropleths and dominant GIR header",
            "Safe Windows open_platform.cmd launcher",
            "Read-only validation and isolated pytest database",
            "Local licensed SVG country flags with deterministic fallback",
            "Theme-aware RU/EN landing, cooperation flow, icon modules, and square seven-index row",
        ],
        "merged_files": merged,
        "additional_files": additional,
        "final_hashes": current_hashes(FINAL_HASH_FILES),
    }
    if OUTPUT_SHA256.exists():
        OUTPUT_SHA256.unlink()
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return payload


def finalize() -> dict[str, Any]:
    if not OUTPUT.exists():
        raise SystemExit("PATCH_INTEGRATION_V6.json is missing; run prepare first")
    marker_path = ROOT / "PATCH_APPLIED_V6.json"
    if not marker_path.exists():
        raise SystemExit("PATCH_APPLIED_V6.json is missing; apply the V6 migration first")
    payload = json.loads(OUTPUT.read_text(encoding="utf-8"))
    marker = json.loads(marker_path.read_text(encoding="utf-8"))
    for section in ("merged_files", "additional_files"):
        for relative, expected in (payload.get(section) or {}).items():
            path = ROOT / relative
            if not path.exists() or sha256(path) != expected["sha256"] or path.stat().st_size != expected["bytes"]:
                raise SystemExit(f"{relative} changed after V6 integration prepare")
    backup_relative = marker.get("database_backup")
    backup = ROOT / backup_relative if backup_relative else None
    if backup is not None and not backup.exists():
        raise SystemExit(f"Recorded V6 database backup is missing: {backup_relative}")
    payload.update({
        "status": "applied",
        "finalized_at": now(),
        "application": marker,
        "database_backup_sha256": sha256(backup) if backup else None,
        "final_hashes": current_hashes(FINAL_HASH_FILES),
    })
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUTPUT_SHA256.write_text(f"{sha256(OUTPUT)}  {OUTPUT.name}\n", encoding="ascii")
    return payload


def main() -> None:
    parser = argparse.ArgumentParser(description="Create or finalize the checksum-backed V6 descendant integration record")
    sub = parser.add_subparsers(dest="command", required=True)
    prepare_parser = sub.add_parser("prepare")
    prepare_parser.add_argument("--patch-archive", type=Path, default=Path.home() / "Downloads" / PATCH_NAME)
    sub.add_parser("finalize")
    args = parser.parse_args()
    payload = prepare(args.patch_archive.resolve()) if args.command == "prepare" else finalize()
    print(json.dumps({
        "status": payload["status"],
        "patch_version": payload["patch_version"],
        "merged_files": len(payload.get("merged_files") or {}),
        "manifest": str(OUTPUT),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
