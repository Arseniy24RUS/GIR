#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SUMMARY = ROOT / "outputs" / "playwright-summary.json"
DEFAULT_REPORT_DIR = ROOT / "playwright" / "playwright-report"
EVIDENCE_DIR = ROOT / "audit_evidence" / "playwright"
EVIDENCE_OUTPUT_DIR = ROOT / "audit_evidence" / "outputs"
MANIFEST_PATH = EVIDENCE_DIR / "final_v6_playwright_manifest.json"
METHODOLOGY_VERSION = "GIIP-final-release-v6"

HASH_TARGETS = [
    "data/global_index_platform.sqlite",
    "giip/scientific_release.py",
    "giip/final_release_v6.py",
    "giip/release_readiness.py",
    "giip/api.py",
    "giip/acceptance.py",
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
    "giip/static/flags/LICENSE-flag-icons.txt",
    "open_platform.cmd",
    "scripts/fetch_hci_plus_2026.py",
    "scripts/fetch_national_statistics_metrics.py",
    "scripts/fetch_sec_corporate_metrics.py",
    "scripts/validate_release_readiness.py",
    "scripts/validate_index_formulas.py",
    "scripts/refresh_landing_asset_manifests.py",
    "tests/test_landing_assets.py",
    "tests/test_cooperation_module.py",
    "docs/HTEI_METHODOLOGY_V6.md",
    "docs/HCI_PLUS_2026_METHOD_NOTE.md",
    "docs/FRONTEND_V6_INTEGRATION_CONTRACT.md",
    "playwright/playwright.config.ts",
    "playwright/tests/final-v6.spec.ts",
    "playwright/tests/tz-acceptance.spec.ts",
    "requirements.lock",
    "PATCH_INTEGRATION_V6.json",
    "PATCH_INTEGRATION_V6.json.sha256",
]
REQUIRED_PROJECTS = {
    "desktop-ru-dark", "desktop-ru-light", "desktop-en-dark", "desktop-en-light",
    "mobile-ru", "mobile-en", "tablet-ru", "tablet-en",
}


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def iso_from_timestamp(value: float) -> str:
    return datetime.fromtimestamp(value, timezone.utc).replace(microsecond=0).isoformat()


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def walk_suites(suites: Iterable[dict[str, Any]]) -> Iterable[dict[str, Any]]:
    for suite in suites:
        yield from suite.get("specs") or []
        yield from walk_suites(suite.get("suites") or [])


def collect_results(payload: dict[str, Any]) -> dict[str, Any]:
    argv = [str(v) for v in (payload.get("config") or {}).get("argv") or []]
    if "--list" in argv:
        raise SystemExit("The Playwright JSON was produced with --list and is not execution evidence.")
    total = passed = failed = skipped = flaky = 0
    projects: set[str] = set()
    failures: list[dict[str, Any]] = []
    for spec in walk_suites(payload.get("suites") or []):
        title = spec.get("title") or spec.get("file") or "unnamed spec"
        for test in spec.get("tests") or []:
            total += 1
            project = str(test.get("projectName") or "")
            if project:
                projects.add(project)
            results = test.get("results") or []
            statuses = [str(r.get("status") or "") for r in results]
            final = statuses[-1] if statuses else str(test.get("status") or "")
            expected = str(test.get("expectedStatus") or "passed")
            if final == "passed" and expected == "passed":
                passed += 1
                if len(statuses) > 1 and any(status != "passed" for status in statuses[:-1]):
                    flaky += 1
            elif final == "skipped" or expected == "skipped":
                skipped += 1
            else:
                failed += 1
                failures.append({"title": title, "project": project, "statuses": statuses, "expected": expected})
    if total <= 0:
        raise SystemExit("No executed Playwright tests were found.")
    if failed or skipped or flaky:
        raise SystemExit(
            f"Playwright run is not clean: failed={failed}, skipped={skipped}, flaky={flaky}, failures={failures[:5]}"
        )
    missing = sorted(REQUIRED_PROJECTS - projects)
    if missing:
        raise SystemExit(f"Missing Playwright projects: {missing}")
    unexpected = sorted(projects - REQUIRED_PROJECTS)
    if unexpected:
        raise SystemExit(f"Unexpected Playwright projects in the V6 release run: {unexpected}")
    return {
        "total": total,
        "passed": passed,
        "failed": failed,
        "skipped": skipped,
        "flaky": flaky,
        "projects": sorted(projects),
        "argv": argv,
    }


def zip_dir(src: Path, dest_without_suffix: Path) -> Path:
    if not src.exists() or not any(path.is_file() for path in src.rglob("*")):
        raise SystemExit(f"Required evidence directory is missing or empty: {src}")
    dest_without_suffix.parent.mkdir(parents=True, exist_ok=True)
    return Path(shutil.make_archive(str(dest_without_suffix), "zip", root_dir=src))


def collect_visual_baselines(staging: Path) -> Path:
    snapshot_dirs = sorted(path for path in (ROOT / "playwright" / "tests").glob("*-snapshots") if path.is_dir())
    if not snapshot_dirs:
        raise SystemExit("No Playwright visual snapshot directories were found.")
    staging.mkdir(parents=True)
    png_count = 0
    for source_dir in snapshot_dirs:
        target = staging / source_dir.name
        shutil.copytree(source_dir, target)
        png_count += sum(1 for path in target.rglob("*.png") if path.is_file())
    if png_count < 8:
        raise SystemExit(f"Only {png_count} visual baseline PNGs were found; at least 8 are required.")
    return staging


def hash_targets() -> list[str]:
    targets = set(HASH_TARGETS)
    targets.update({"playwright/package.json", "playwright/package-lock.json"})
    for path in (ROOT / "playwright" / "tests").rglob("*"):
        if path.is_file() and path.suffix.lower() in {".ts", ".png"}:
            targets.add(path.relative_to(ROOT).as_posix())
    return sorted(targets)


def verify_fresh_run(summary: Path, report_dir: Path, run_started_at: float | None) -> None:
    if run_started_at is None:
        return
    tolerance_seconds = 2.0
    if summary.stat().st_mtime < run_started_at - tolerance_seconds:
        raise SystemExit(
            f"Playwright summary predates this run: {summary} "
            f"(mtime={summary.stat().st_mtime}, run_started_at={run_started_at})"
        )
    report_files = [path for path in report_dir.rglob("*") if path.is_file()]
    if not report_files or max(path.stat().st_mtime for path in report_files) < run_started_at - tolerance_seconds:
        raise SystemExit("Playwright HTML report was not refreshed by this run.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Bind a real Playwright run to GIIP final-release-v6 files.")
    parser.add_argument("--summary", type=Path, default=DEFAULT_SUMMARY)
    parser.add_argument("--report-dir", type=Path, default=DEFAULT_REPORT_DIR)
    parser.add_argument("--minimum-tests", type=int, default=200)
    parser.add_argument(
        "--run-started-at",
        type=float,
        help="Unix timestamp captured immediately before Playwright started; rejects stale summary/report evidence.",
    )
    args = parser.parse_args()

    summary = args.summary if args.summary.is_absolute() else ROOT / args.summary
    report_dir = args.report_dir if args.report_dir.is_absolute() else ROOT / args.report_dir
    if not summary.exists():
        raise SystemExit(f"Playwright summary is missing: {summary}")
    verify_fresh_run(summary, report_dir, args.run_started_at)
    source_summary_sha256 = sha256(summary)
    payload = json.loads(summary.read_text(encoding="utf-8"))
    stats = collect_results(payload)
    if stats["total"] < args.minimum_tests:
        raise SystemExit(f"Only {stats['total']} tests executed; minimum is {args.minimum_tests}.")

    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    EVIDENCE_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    compact_summary = EVIDENCE_OUTPUT_DIR / "playwright-summary.json"
    compact_payload = {
        "methodology_version": METHODOLOGY_VERSION,
        "recorded_at": now(),
        "run_started_at": iso_from_timestamp(args.run_started_at) if args.run_started_at is not None else None,
        "source_summary_path": summary.relative_to(ROOT).as_posix(),
        "source_summary_sha256": source_summary_sha256,
        "test_stats": stats,
    }
    compact_summary.write_text(json.dumps(compact_payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report_zip = zip_dir(report_dir, EVIDENCE_DIR / "playwright-report-v6")
    with tempfile.TemporaryDirectory(prefix="giip-v6-visual-baselines-") as temporary:
        staging = collect_visual_baselines(Path(temporary) / "visual-baselines")
        snapshots_zip = zip_dir(staging, EVIDENCE_DIR / "visual-baseline-snapshots-v6")

    file_hashes: dict[str, str] = {}
    for rel in hash_targets():
        path = ROOT / rel
        if not path.exists():
            raise SystemExit(f"Hash target is missing: {rel}")
        file_hashes[rel] = sha256(path)

    manifest = {
        "methodology_version": METHODOLOGY_VERSION,
        "generated_at": now(),
        "run_started_at": iso_from_timestamp(args.run_started_at) if args.run_started_at is not None else None,
        "summary_path": compact_summary.relative_to(ROOT).as_posix(),
        "source_summary_path": summary.relative_to(ROOT).as_posix(),
        "source_summary_sha256": source_summary_sha256,
        "summary_sha256": sha256(compact_summary),
        "test_stats": stats,
        "required_projects": sorted(REQUIRED_PROJECTS),
        "file_hashes": file_hashes,
        "report_zip": report_zip.relative_to(ROOT).as_posix(),
        "report_zip_sha256": sha256(report_zip),
        "visual_baselines_zip": snapshots_zip.relative_to(ROOT).as_posix(),
        "visual_baselines_zip_sha256": sha256(snapshots_zip),
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "ok", "manifest": MANIFEST_PATH.relative_to(ROOT).as_posix(), **stats}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
