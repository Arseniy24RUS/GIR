#!/usr/bin/env python3
from __future__ import annotations

import json
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE_DIR = ROOT / "audit_evidence"


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def sha256(path: Path) -> str:
    import hashlib

    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def copy_if_exists(src: Path, dst: Path) -> Path | None:
    if not src.exists():
        return None
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
    return dst


def file_record(path: Path) -> dict[str, Any]:
    return {
        "path": path.relative_to(ROOT).as_posix(),
        "bytes": path.stat().st_size,
        "sha256": sha256(path),
    }


def main() -> None:
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    copied: list[Path] = []

    output_dir = EVIDENCE_DIR / "outputs"
    compact_playwright_summary = output_dir / "playwright-summary.json"
    preserved_playwright_summary = (
        compact_playwright_summary.read_bytes()
        if compact_playwright_summary.exists()
        else None
    )
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    for src in sorted((ROOT / "outputs").glob("*.json")) if (ROOT / "outputs").exists() else []:
        copied_path = copy_if_exists(src, output_dir / src.name)
        if copied_path:
            copied.append(copied_path)
    if not compact_playwright_summary.exists() and preserved_playwright_summary is not None:
        compact_playwright_summary.write_bytes(preserved_playwright_summary)
        copied.append(compact_playwright_summary)

    playwright_dir = EVIDENCE_DIR / "playwright"
    for legacy in [playwright_dir / "playwright-report.zip", playwright_dir / "visual-baseline-snapshots.zip"]:
        if legacy.exists():
            legacy.unlink()
    required_v6 = [
        playwright_dir / "playwright-report-v6.zip",
        playwright_dir / "visual-baseline-snapshots-v6.zip",
        playwright_dir / "final_v6_playwright_manifest.json",
    ]
    missing_v6 = [path.relative_to(ROOT).as_posix() for path in required_v6 if not path.exists()]
    if missing_v6:
        raise SystemExit(
            "Fresh final-v6 Playwright evidence is required before collection: "
            + ", ".join(missing_v6)
        )

    command_logs = sorted((EVIDENCE_DIR / "commands").glob("*.log")) if (EVIDENCE_DIR / "commands").exists() else []
    copied.extend(command_logs)

    evidence_files = [
        path
        for path in sorted(EVIDENCE_DIR.rglob("*"))
        if path.is_file() and path.name != "EVIDENCE_MANIFEST.json"
    ]

    manifest = {
        "built_at": now_iso(),
        "purpose": "Compact release evidence for external audit.",
        "commands": [
            "python -m giip.cli validate",
            "python scripts/generate_release_docs.py",
            "python -m pytest -q",
            "python scripts/validate_no_generated_data.py --strict",
            "python scripts/validate_i18n_labels.py --strict",
            "python scripts/validate_source_provenance.py --strict",
            "python scripts/validate_index_formulas.py --strict",
            "python scripts/validate_release_readiness.py --strict",
            "bash scripts/playwright_install.sh",
            "cd playwright && npx playwright test",
            "python scripts/record_playwright_v6_evidence.py",
        ],
        "evidence_files": [file_record(path) for path in evidence_files],
        "excluded_heavy_runtime_paths": [
            "playwright/node_modules/**",
            "playwright/test-results/**",
            "playwright/playwright-report/**",
            "outputs/**",
        ],
    }
    manifest_path = EVIDENCE_DIR / "EVIDENCE_MANIFEST.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "ok", "evidence_dir": str(EVIDENCE_DIR), "files": len(manifest["evidence_files"])}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
