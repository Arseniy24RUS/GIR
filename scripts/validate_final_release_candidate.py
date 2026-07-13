#!/usr/bin/env python3
"""Validate the fully automated/offline portion of the final v6 release patch.

This gate deliberately allows only blockers that require a live official data fetch
or a fresh browser run. It does not allow software, methodology, documentation,
provenance, formula, acceptance-matrix, or distribution-policy defects.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from giip.acceptance import acceptance_payload
from giip.config import DB_PATH
from giip.db import connect, row
from giip.release_readiness import release_readiness_payload
from giip.scientific_release import RELEASE_YEAR

# These are the only blockers allowed immediately after an offline patch install.
# Codex must close every one through official online ingestion and a fresh Playwright run.
ALLOWED_ONLINE_BLOCKERS = {
    "ORIGINAL_TOR_RESULTS_NOT_FULLY_CLOSED",
    "NATIONAL_STATISTICS_NUMERIC_LAYER_INCOMPLETE",
    "CORPORATE_REPORTING_NUMERIC_LAYER_INCOMPLETE",
    "HCI_PLUS_2026_INCOMPLETE",
    "INDEX_METHODOLOGY_REGISTRY_INCOMPLETE",  # HCI+ row is created by the official loader.
    "OPERATIONAL_REFRESH_EVIDENCE_MISSING",
    "PLAYWRIGHT_EVIDENCE_INVALID",
}


def fail(message: str, evidence: object | None = None) -> None:
    payload: dict[str, object] = {"status": "failed", "message": message}
    if evidence is not None:
        payload["evidence"] = evidence
    print(json.dumps(payload, ensure_ascii=False, indent=2, default=str))
    raise SystemExit(1)


def main() -> None:
    with connect(DB_PATH) as conn:
        readiness = release_readiness_payload(conn)
        acceptance = acceptance_payload(conn, "ru")
        counts = {
            mode: int((row(conn, "SELECT COUNT(*) n FROM htei_v6_profiles WHERE release_year=? AND mode=?", (RELEASE_YEAR, mode)) or {}).get("n") or 0)
            for mode in ("direct_core", "common_support", "proxy_extended", "asof_diagnostic")
        }
        asof_ranked = int((row(conn, "SELECT COUNT(*) n FROM htei_v6_profiles WHERE release_year=? AND mode='asof_diagnostic' AND rank IS NOT NULL", (RELEASE_YEAR,)) or {}).get("n") or 0)
        signatures = int((row(conn, "SELECT COUNT(DISTINCT component_signature) n FROM htei_v6_profiles WHERE release_year=? AND mode='common_support'", (RELEASE_YEAR,)) or {}).get("n") or 0)
        score_mismatch = int((row(conn, """SELECT COUNT(*) n FROM (
            SELECT p.profile_id,p.substantive_score,SUM(c.weighted_contribution) component_sum
            FROM htei_v6_profiles p JOIN htei_v6_component_values c ON c.profile_id=p.profile_id
            WHERE p.release_year=? GROUP BY p.profile_id
            HAVING ABS(p.substantive_score-component_sum)>0.0001)""", (RELEASE_YEAR,)) or {}).get("n") or 0)
        missingness_groups = int((row(conn, "SELECT COUNT(*) n FROM htei_v6_missingness_audit WHERE release_year=?", (RELEASE_YEAR,)) or {}).get("n") or 0)
        policy_count = int((row(conn, "SELECT COUNT(*) n FROM policy_brief_items WHERE iso3='RUS' AND editorial_status='release_bilingual_reviewed'") or {}).get("n") or 0)
        cyrillic_en = int((row(conn, """SELECT COUNT(*) n FROM policy_brief_items WHERE iso3='RUS' AND (
            title_en GLOB '*[А-Яа-яЁё]*' OR problem_en GLOB '*[А-Яа-яЁё]*' OR measure_en GLOB '*[А-Яа-яЁё]*' OR
            actor_en GLOB '*[А-Яа-яЁё]*' OR target_kpi_en GLOB '*[А-Яа-яЁё]*' OR expected_effect_en GLOB '*[А-Яа-яЁё]*' OR
            risk_en GLOB '*[А-Яа-яЁё]*' OR resources_en GLOB '*[А-Яа-яЁё]*' OR monitoring_en GLOB '*[А-Яа-яЁё]*')""") or {}).get("n") or 0)
        historical_hci = int((row(conn, "SELECT COUNT(*) n FROM index_scores WHERE index_code='HCI' AND year<=2020") or {}).get("n") or 0)
        artifacts = int((row(conn, "SELECT COUNT(*) n FROM reproducibility_artifacts") or {}).get("n") or 0)
        snapshots = int((row(conn, "SELECT COUNT(*) n FROM raw_snapshots") or {}).get("n") or 0)

    if acceptance.get("summary", {}).get("items_total") != 4:
        fail("The acceptance matrix must contain exactly four original ToR results.", acceptance)
    expected_pairs = [("2.1", "3.1.2"), ("2.2", "3.2.1"), ("2.3", "3.3.1"), ("2.4", "3.4.1")]
    actual_pairs = [(str(i.get("id")), str(i.get("result_id"))) for i in acceptance.get("items", [])]
    if actual_pairs != expected_pairs:
        fail("The acceptance matrix does not reproduce the exact ToR pairs.", actual_pairs)
    if counts["direct_core"] < 25:
        fail("HTEI direct-data core is below the final-candidate threshold.", counts)
    if counts["common_support"] < 75:
        fail("HTEI common-support universe is below the final-candidate threshold.", counts)
    if counts["proxy_extended"] < counts["common_support"]:
        fail("HTEI extended proxy universe is smaller than common support.", counts)
    if counts["asof_diagnostic"] < 200 or asof_ranked:
        fail("HTEI ASOF diagnostic must cover at least 200 profiles and must never have ranks.", {**counts, "asof_ranked": asof_ranked})
    if signatures != 1:
        fail("HTEI common-support ranking must use one identical component signature.", {"signatures": signatures})
    if score_mismatch:
        fail("HTEI substantive scores do not reconcile with component contributions.", {"profiles": score_mismatch})
    if missingness_groups < 4:
        fail("HTEI missingness-pattern audit is incomplete.", {"groups": missingness_groups})
    if policy_count < 8 or cyrillic_en:
        fail("Russia policy brief is not release-edited in both languages.", {"items": policy_count, "english_rows_with_cyrillic": cyrillic_en})
    if historical_hci < 100:
        fail("Historical HCI is not retained for the methodology-break chart.", {"rows": historical_hci})
    if artifacts < snapshots:
        fail("Reproducibility artifacts do not cover all registered snapshots.", {"snapshots": snapshots, "artifacts": artifacts})

    blockers = readiness.get("blockers") or []
    unexpected = [b for b in blockers if b.get("code") not in ALLOWED_ONLINE_BLOCKERS]
    if unexpected:
        fail("Unexpected software, methodology, documentation or provenance blockers remain.", unexpected)

    payload = {
        "status": "ok",
        "readiness_level": readiness.get("readiness_level"),
        "customer_release_ready": bool(readiness.get("release_ready")),
        "htei_v6": {**counts, "asof_ranked": asof_ranked, "common_support_signatures": signatures},
        "policy_brief_items": policy_count,
        "historical_hci_rows": historical_hci,
        "reproducibility": {"snapshots": snapshots, "artifacts": artifacts},
        "allowed_online_blockers": [b.get("code") for b in blockers],
        "note_ru": "Офлайн-часть патча полностью прошла. Codex должен закрыть только официальные онлайн-загрузки HCI+, национальной статистики и корпоративной отчётности, после чего выполнить свежий Playwright-прогон.",
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2, default=str))


if __name__ == "__main__":
    main()
