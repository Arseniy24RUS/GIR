#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from giip.db import connect, migrate_schema
from giip.scientific_release import apply_scientific_release
from giip.final_release_v6 import apply_offline_finalization


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    # New official national-statistics observations may participate in HTEI.
    # Rebuild the deterministic v5 staging layer first, then derive final v6
    # comparison/diagnostic tiers and the reproducibility package.
    with connect() as conn:
        migrate_schema(conn)
        staging = apply_scientific_release(conn)
        conn.commit()
    result = {
        "scientific_v5_staging": staging,
        "final_v6": apply_offline_finalization(build_artifacts=True, normalize_playwright=False),
    }
    for script in ("generate_scientific_validation_report.py", "generate_release_docs.py"):
        subprocess.run([sys.executable, str(ROOT / "scripts" / script)], cwd=ROOT, check=True)
    marker_path = ROOT / "PATCH_APPLIED_V6.json"
    marker = json.loads(marker_path.read_text(encoding="utf-8")) if marker_path.exists() else {}
    marker.update({
        "online_finalized_at": now(),
        "online_finalization_result": result,
        "database_sha256": sha256(ROOT / "data" / "global_index_platform.sqlite"),
        "next_required_step": "Run the complete Playwright matrix, inspect visual baselines and record final-v6 evidence.",
    })
    marker_path.write_text(json.dumps(marker, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "ok", "result": result, "marker": marker_path.relative_to(ROOT).as_posix()}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
