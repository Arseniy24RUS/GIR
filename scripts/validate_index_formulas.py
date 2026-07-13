#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import pathlib
import sqlite3
import sys
from typing import Any

DB = pathlib.Path(os.getenv("GIIP_DB", "data/global_index_platform.sqlite"))


def fail(message: str) -> None:
    print(message)
    raise SystemExit(1)


def table_names(conn: sqlite3.Connection) -> set[str]:
    return {r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}


def numeric_weights(payload: dict[str, Any]) -> dict[str, float]:
    result: dict[str, float] = {}
    for key, value in payload.items():
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            continue
        result[str(key)] = float(value)
    return result


def main() -> None:
    if not DB.exists():
        fail(f"DB not found: {DB}")
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    tables = table_names(conn)
    required = {
        "index_definitions",
        "index_components",
        "index_formulas",
        "index_methodology_registry",
        "htei_v6_profiles",
        "htei_v6_component_values",
        "hci_plus_country_scores",
    }
    missing = required - tables
    if missing:
        fail(f"Missing formula/methodology tables: {sorted(missing)}")

    registry = {
        r["index_code"]: dict(r)
        for r in conn.execute("SELECT * FROM index_methodology_registry")
    }
    indices = [r["code"] for r in conn.execute("SELECT code FROM index_definitions")]
    missing_registry = sorted(set(indices) - set(registry))
    if missing_registry:
        fail(f"Missing methodology registry entries: {missing_registry}")

    required_fields = [
        "formula_version",
        "formula_text_ru",
        "formula_text_en",
        "method_notes_ru",
        "method_notes_en",
        "weights_json",
        "normalization_ru",
        "normalization_en",
        "source_id",
    ]
    platform_formula_indices = {
        code
        for code, item in registry.items()
        if str(item.get("formula_status") or "").startswith("platform_formula")
    }

    for code in indices:
        formulas = conn.execute(
            "SELECT * FROM index_formulas WHERE index_code=? ORDER BY formula_version", (code,)
        ).fetchall()
        if not formulas:
            fail(f"Missing formula for index: {code}")
        components = [
            r["component_code"]
            for r in conn.execute(
                "SELECT component_code FROM index_components WHERE index_code=?", (code,)
            )
        ]
        has_complete_platform_formula = False
        for formula in formulas:
            for field in required_fields:
                if formula[field] is None or str(formula[field]).strip() == "":
                    fail(f"Formula {code}/{formula['formula_version']} missing field {field}")
            try:
                weights = json.loads(formula["weights_json"])
            except Exception as exc:
                fail(f"Formula {code}/{formula['formula_version']} weights_json invalid: {exc}")
            if not isinstance(weights, dict):
                fail(f"Formula {code}/{formula['formula_version']} weights_json must be an object")
            numeric = numeric_weights(weights)
            missing_weights = [c for c in components if c not in numeric]
            if not missing_weights and components:
                total = sum(numeric[c] for c in components)
                if not (0.999 <= total <= 1.001):
                    fail(
                        f"Formula {code}/{formula['formula_version']} component weights sum to {total}, not 1"
                    )
                has_complete_platform_formula = True
            elif code in platform_formula_indices:
                # A platform-computed index may retain historical formula notes, but at least
                # one formula version must be complete. The final check below enforces that.
                continue
            else:
                # Imported official scores can have a method-note row with no platform weights.
                # The registry explicitly discloses that the official formula is not recomputed.
                formula_status = str(registry[code].get("formula_status") or "")
                if not ("not_recomputed" in formula_status or formula_status.startswith("official_") or formula_status == "official_methodology"):
                    fail(
                        f"Formula {code}/{formula['formula_version']} missing component weights: {missing_weights}"
                    )
        if code in platform_formula_indices and not has_complete_platform_formula:
            fail(f"Platform-computed index {code} has no complete normalized formula")

    bad_scores = conn.execute(
        """SELECT COUNT(*) AS n FROM index_scores s
           LEFT JOIN index_formulas f
             ON f.index_code=s.index_code AND f.formula_version=s.formula_version
           WHERE f.index_code IS NULL"""
    ).fetchone()["n"]
    if bad_scores:
        fail(f"Scores reference missing formula versions: {bad_scores}")

    bad_components = conn.execute(
        """SELECT COUNT(*) AS n FROM component_values cv
           LEFT JOIN index_formulas f
             ON f.index_code=cv.index_code AND f.formula_version=cv.formula_version
           WHERE f.index_code IS NULL"""
    ).fetchone()["n"]
    if bad_components:
        fail(f"Components reference missing formula versions: {bad_components}")

    # Final HTEI v6 contract: confidence is disclosed separately and does not
    # multiply the substantive score; ASOF profiles never receive a rank.
    asof_ranked = conn.execute(
        "SELECT COUNT(*) n FROM htei_v6_profiles WHERE mode='asof_diagnostic' AND rank IS NOT NULL"
    ).fetchone()["n"]
    if asof_ranked:
        fail(f"HTEI v6 ASOF diagnostic profiles must not have ranks: {asof_ranked}")
    invalid_scores = conn.execute(
        """SELECT COUNT(*) n FROM htei_v6_profiles
           WHERE substantive_score IS NULL OR substantive_score < 0 OR substantive_score > 100
              OR confidence_score IS NULL OR confidence_score < 0 OR confidence_score > 1"""
    ).fetchone()["n"]
    if invalid_scores:
        fail(f"Invalid HTEI v6 score/confidence rows: {invalid_scores}")
    bad_contribution = conn.execute(
        """SELECT COUNT(*) n FROM (
             SELECT c.profile_id, ABS(SUM(c.weighted_contribution)-MAX(p.substantive_score)) AS delta
             FROM htei_v6_component_values c JOIN htei_v6_profiles p ON p.profile_id=c.profile_id GROUP BY c.profile_id
           ) WHERE delta > 0.02"""
    ).fetchone()["n"]
    if bad_contribution:
        fail(f"HTEI v6 component contributions do not reconcile to score: {bad_contribution}")
    common_signatures = conn.execute(
        "SELECT COUNT(DISTINCT component_signature) n FROM htei_v6_profiles WHERE mode='common_support'"
    ).fetchone()["n"]
    if common_signatures != 1:
        fail(f"HTEI v6 Common Support must use exactly one component signature: {common_signatures}")
    ranked_asof_components = conn.execute(
        """SELECT COUNT(*) n FROM htei_v6_component_values c
           JOIN htei_v6_profiles p ON p.profile_id=c.profile_id
           WHERE p.mode='asof_diagnostic' AND p.rank IS NOT NULL"""
    ).fetchone()["n"]
    if ranked_asof_components:
        fail(f"Ranked HTEI v6 ASOF component rows are forbidden: {ranked_asof_components}")

    # HCI+ is optional in the offline candidate but, once present, it must be an
    # official 2026 layer with a meaningful country coverage and valid score range.
    hci_plus_count = conn.execute("SELECT COUNT(*) n FROM hci_plus_country_scores").fetchone()["n"]
    if hci_plus_count:
        invalid_hci_plus = conn.execute(
            """SELECT COUNT(*) n FROM hci_plus_country_scores
               WHERE year<>2026 OR score IS NULL OR score<0 OR score>325
                  OR health_score IS NULL OR education_score IS NULL OR employment_score IS NULL"""
        ).fetchone()["n"]
        if invalid_hci_plus:
            fail(f"Invalid HCI+ 2026 official rows: {invalid_hci_plus}")
        if hci_plus_count < 150:
            fail(f"HCI+ 2026 coverage is below the release threshold: {hci_plus_count}")

    print("formula and methodology gate passed")


if __name__ == "__main__":
    main()
