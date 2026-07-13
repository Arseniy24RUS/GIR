#!/usr/bin/env python3
"""Run the operational refresh pipeline and retain auditable execution evidence.

The normal scheduled mode refreshes every configured official source that is
available in the deployment. ``--strict-release`` is intended for the final
Codex/customer build and fails unless HCI+, national-statistics and corporate
connectors all execute successfully.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from giip.db import connect, migrate_schema


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def execute(command: list[str]) -> dict[str, object]:
    process = subprocess.run(command, cwd=ROOT, text=True, capture_output=True, check=False)
    return {
        "command": command,
        "returncode": process.returncode,
        "stdout": process.stdout[-20_000:],
        "stderr": process.stderr[-20_000:],
    }


def national_config_ready() -> bool:
    path = ROOT / "configs" / "national_statistics_sources.release.json"
    if not path.exists():
        return False
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return False
    return len(payload.get("sources") or []) >= 4


def hci_plus_loaded() -> bool:
    with connect() as conn:
        exists = conn.execute(
            "SELECT COUNT(*) n FROM sqlite_master WHERE type='table' AND name='hci_plus_country_scores'"
        ).fetchone()["n"]
        if not exists:
            return False
        return conn.execute(
            "SELECT COUNT(*) n FROM hci_plus_country_scores WHERE year=2026"
        ).fetchone()["n"] >= 150


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--strict-release", action="store_true", help="Require every release connector to succeed.")
    parser.add_argument("--force-hci-plus", action="store_true", help="Refresh HCI+ even when >=150 briefs are loaded.")
    parser.add_argument("--skip-core", action="store_true", help="Skip the ordinary official-source refresh builder.")
    args = parser.parse_args()

    run_id = f"scheduled-refresh:{uuid.uuid4()}"
    started = now()
    log = ROOT / "outputs" / f"scheduled_refresh_{started.replace(':', '').replace('-', '')}.json"
    log.parent.mkdir(exist_ok=True)

    with connect() as conn:
        migrate_schema(conn)
        conn.execute(
            """INSERT INTO operational_runs(run_id,job_code,started_at,status,attempts,metadata_json)
               VALUES(?,?,?,?,?,?)""",
            (run_id, "OFFICIAL_REFRESH_PIPELINE_V6", started, "running", 1,
             json.dumps({"strict_release": args.strict_release}, sort_keys=True)),
        )
        conn.commit()

    commands: list[tuple[str, list[str], bool]] = []
    if not args.skip_core:
        commands.append(("core_official_sources", [sys.executable, "scripts/refresh_official_sources.py"], True))

    hci_command = [sys.executable, "scripts/fetch_hci_plus_2026.py", "--minimum-countries", "150"]
    if args.force_hci_plus or not hci_plus_loaded():
        commands.append(("hci_plus_2026", hci_command, args.strict_release))

    national_ready = national_config_ready()
    if national_ready:
        commands.append((
            "national_statistics",
            [sys.executable, "scripts/fetch_national_statistics_metrics.py", "--config", "configs/national_statistics_sources.release.json"],
            args.strict_release,
        ))
    elif args.strict_release:
        commands.append(("national_statistics", [sys.executable, "-c", "raise SystemExit('National statistics release config is not populated')"], True))

    if os.getenv("SEC_USER_AGENT"):
        commands.append(("corporate_reporting", [sys.executable, "scripts/fetch_sec_corporate_metrics.py"], args.strict_release))
    elif args.strict_release:
        commands.append(("corporate_reporting", [sys.executable, "-c", "raise SystemExit('SEC_USER_AGENT is not configured')"], True))

    # Rebuild HTEI v5 staging, final v6 tiers, reproducibility artifacts and docs
    # after every source-ingestion cycle.
    commands.append(("finalize_v6", [sys.executable, "scripts/finalize_online_release_v6.py"], True))

    results: list[dict[str, object]] = []
    failed_required = False
    for name, command, required in commands:
        result = execute(command)
        result.update({"name": name, "required": required})
        results.append(result)
        if int(result["returncode"]) != 0 and required:
            failed_required = True
            break

    status = "failed" if failed_required else "success"
    completed = now()
    log.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    rows_loaded = 0
    with connect() as conn:
        conn.execute(
            """UPDATE operational_runs SET completed_at=?,status=?,rows_loaded=?,message=?,log_path=?,metadata_json=?
               WHERE run_id=?""",
            (
                completed,
                status,
                rows_loaded,
                "v6 official refresh pipeline completed" if status == "success" else "v6 official refresh pipeline failed",
                str(log.relative_to(ROOT)),
                json.dumps(results, ensure_ascii=False),
                run_id,
            ),
        )
        conn.commit()

    print(json.dumps({"run_id": run_id, "status": status, "log": str(log.relative_to(ROOT)), "steps": results}, ensure_ascii=False, indent=2))
    if failed_required:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
