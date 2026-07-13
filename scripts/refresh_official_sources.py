#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from giip.production_data import (
    EUROSTAT_HTEI_URLS,
    GII_XLSX_URLS,
    HCI_INDICATORS,
    HTEI_INDICATORS,
    ILOSTAT_HTEI_URLS,
    ITU_IDI_XLSX_URL,
    OECD_HTEI_URLS,
    PORTULANS_GTCI_PDF_URL,
    UNDP_HDI_CSV_URL,
    WIPO_GII_XLSX_URL,
    Snapshot,
    archived_snapshot_metadata,
    build_production_database,
    ensure_download,
    ensure_multifile_snapshot,
    ensure_uis_snapshot,
    ensure_world_bank_countries_snapshot,
    ensure_world_bank_snapshot,
)
from giip.config import DB_PATH
from giip.db import connect

OUTPUT_PATH = ROOT / "outputs" / "source_refresh.json"
DOC_PATH = ROOT / "docs" / "SOURCE_REFRESH_STATUS.md"


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def latest_by_source() -> dict[str, Snapshot]:
    result: dict[str, Snapshot] = {}
    for snapshot in sorted(archived_snapshot_metadata(), key=lambda item: (item.release_year, item.retrieved_at)):
        result[snapshot.source_id] = snapshot
    return result


def snapshot_record(snapshot: Snapshot) -> dict[str, object]:
    return {
        "snapshot_id": snapshot.snapshot_id,
        "release_year": snapshot.release_year,
        "retrieved_at": snapshot.retrieved_at,
        "source_url": snapshot.source_url,
        "raw_snapshot_path": snapshot.raw_snapshot_path,
        "raw_snapshot_sha256": snapshot.raw_snapshot_sha256,
        "bytes_count": snapshot.bytes_count,
    }


def release_facts() -> dict[str, object]:
    with connect(DB_PATH) as conn:
        return {
            "countries": conn.execute("SELECT COUNT(*) AS n FROM countries").fetchone()["n"],
            "scores": conn.execute("SELECT COUNT(*) AS n FROM index_scores").fetchone()["n"],
            "component_values": conn.execute("SELECT COUNT(*) AS n FROM component_values").fetchone()["n"],
            "raw_snapshots": conn.execute("SELECT COUNT(*) AS n FROM raw_snapshots").fetchone()["n"],
            "source_observations": conn.execute("SELECT COUNT(*) AS n FROM source_observations").fetchone()["n"],
            "htei_2026_countries": conn.execute("SELECT COUNT(*) AS n FROM index_scores WHERE index_code='HTEI' AND year=2026").fetchone()["n"],
            "htei_stem_latest_year": conn.execute("SELECT MAX(source_data_year) AS y FROM component_values WHERE index_code='HTEI' AND year=2026 AND component_code='STEM_PIPELINE'").fetchone()["y"],
        }


def status_doc(payload: dict[str, object]) -> str:
    lines = [
        "# Official Source Refresh Status",
        "",
        f"Checked at: `{payload['checked_at']}`.",
        "",
        "The refresh process uses only free official endpoints. Unavailable sources keep their previously archived snapshot; no replacement or fabricated value is created.",
        "",
        "| Source | Status | Snapshot | Note |",
        "|---|---|---|---|",
    ]
    for item in payload["sources"]:
        snapshot = item.get("snapshot") or {}
        lines.append(
            f"| `{item['source_id']}` | `{item['status']}` | `{snapshot.get('snapshot_id', 'n/a')}` | {item.get('note', '')} |"
        )
    build = payload.get("build") or {}
    facts = payload.get("release_facts") or {}
    lines.extend([
        "",
        "## Rebuild",
        "",
        f"- Status: `{build.get('status', 'not_run')}`",
        f"- Countries: `{facts.get('countries', 'n/a')}`",
        f"- HTEI 2026 coverage: `{facts.get('htei_2026_countries', 'n/a')}`",
        f"- Source observations: `{facts.get('source_observations', 'n/a')}`",
        f"- Component values: `{facts.get('component_values', 'n/a')}`",
        f"- Raw snapshots registered: `{facts.get('raw_snapshots', 'n/a')}`",
        f"- Latest STEM pipeline source year: `{facts.get('htei_stem_latest_year', 'n/a')}`",
        "",
        "`NATIONAL_STATS_HTEI` and `CORPORATE_REPORTS_HTEI` remain evidence-only because comparable official numeric coverage is insufficient for global scoring.",
        "",
    ])
    return "\n".join(lines)


def main() -> None:
    before = latest_by_source()
    refreshers: list[tuple[str, Callable[[], Snapshot]]] = [
        ("UNDP_HDR", lambda: ensure_download("UNDP_HDR", 2025, UNDP_HDI_CSV_URL, "HDR25_Composite_indices_complete_time_series.csv", refresh=True)),
        ("WORLD_BANK_HCI", lambda: ensure_world_bank_snapshot("WORLD_BANK_HCI", 2020, HCI_INDICATORS, "world_bank_hci_indicators.json", refresh=True)),
        ("WORLD_BANK_COUNTRIES", lambda: ensure_world_bank_countries_snapshot(refresh=True)),
        ("PORTULANS_GTCI", lambda: ensure_download("PORTULANS_GTCI", 2025, PORTULANS_GTCI_PDF_URL, "GTCI_2025_report.pdf", refresh=True)),
        ("WIPO_GII", lambda: ensure_download("WIPO_GII", 2025, WIPO_GII_XLSX_URL, "wipo-pub-2000-2025-gii-tech1.xlsx", refresh=True)),
        ("ITU_IDI", lambda: ensure_download("ITU_IDI", 2025, ITU_IDI_XLSX_URL, "IDIDataset_2025.xlsx", refresh=True)),
        ("WORLD_BANK_HTEI", lambda: ensure_world_bank_snapshot("WORLD_BANK_HTEI", 2025, HTEI_INDICATORS, "world_bank_htei_indicators.json", refresh=True)),
        ("UIS_HTEI", lambda: ensure_uis_snapshot(refresh=True)),
        ("ILOSTAT_HTEI", lambda: ensure_multifile_snapshot("ILOSTAT_HTEI", 2025, ILOSTAT_HTEI_URLS, "ilostat_htei_manifest.json", refresh=True)),
        ("OECD_HTEI", lambda: ensure_multifile_snapshot("OECD_HTEI", 2025, OECD_HTEI_URLS, "oecd_htei_manifest.json", accept="text/csv", refresh=True)),
        ("EUROSTAT_HTEC", lambda: ensure_multifile_snapshot("EUROSTAT_HTEC", 2025, EUROSTAT_HTEI_URLS, "eurostat_htei_manifest.json", accept="application/json", refresh=True)),
    ]
    results: list[dict[str, object]] = []
    for source_id, refresh in refreshers:
        try:
            snapshot = refresh()
            old = before.get(source_id)
            status = "updated" if old is None or old.snapshot_id != snapshot.snapshot_id else "current_snapshot_preserved"
            note = "Official source response archived and selected for rebuild." if status == "updated" else "Remote content matches the archived snapshot."
            results.append({"source_id": source_id, "status": status, "snapshot": snapshot_record(snapshot), "note": note})
        except Exception as exc:
            old = before.get(source_id)
            results.append({
                "source_id": source_id,
                "status": "unavailable_previous_preserved" if old else "unavailable_no_snapshot",
                "snapshot": snapshot_record(old) if old else None,
                "note": f"{type(exc).__name__}: {exc}",
            })

    qs = before.get("QS_ET")
    results.append({
        "source_id": "QS_ET",
        "status": "current_snapshot_preserved" if qs else "unavailable_no_snapshot",
        "snapshot": snapshot_record(qs) if qs else None,
        "note": "Existing official 2023-2026 endpoint archive preserved; refresh does not bypass TopUniversities access controls.",
    })

    build = build_production_database(reset=True)
    payload = {
        "checked_at": now_iso(),
        "policy": "free official endpoints only; preserve prior snapshot on failure; no synthetic data",
        "sources": results,
        "build": {"status": build.get("status"), "db": build.get("db")},
        "release_facts": release_facts(),
        "historical_gii_snapshots": sorted(GII_XLSX_URLS),
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    DOC_PATH.write_text(status_doc(payload), encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
