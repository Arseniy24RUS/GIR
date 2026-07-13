from __future__ import annotations

import importlib.util
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("hci_plus_loader", ROOT / "scripts" / "fetch_hci_plus_2026.py")
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def test_parse_brief_extracts_official_total_and_pillars(monkeypatch):
    sample = (
        "The HCI+ score is 249. The Health pillar is 42. "
        "The Education pillar is 153. The Employment pillar is 53. "
        "The score for women in the country is 250, compared to 247 for men."
    )
    result = MODULE.parse_brief_text(sample)
    assert result == {
        "score": 249.0,
        "health": 42.0,
        "education": 153.0,
        "employment": 53.0,
        "women": 250.0,
        "men": 247.0,
    }


def test_parse_brief_accepts_world_bank_pdf_text_without_word_spaces():
    sample = (
        "Russian Federation’s HCI+ score is 249 (out of a maximum of 325). "
        "TheHCI+scorefortheHealthpillaris42,slightly lower than the regional average. "
        "The HCI+ score for the Education pillar is 153. "
        "TheHCI+scorefortheEmploymentpillaris53. "
        "TheHCI+scoreforwomeninRussianFederationis250comparedto247formen."
    )
    result = MODULE.parse_brief_text(sample)
    assert result == {
        "score": 249.0,
        "health": 42.0,
        "education": 153.0,
        "employment": 53.0,
        "women": 250.0,
        "men": 247.0,
    }


def test_parse_brief_accepts_official_negative_employment_pillar():
    sample = (
        "São Tomé and Principe’s HCI+ score is 113. "
        "TheHCI+scorefortheHealthpillaris41. "
        "The HCI+ score for the Education pillar is 75. "
        "The HCI+ score for the Employment pillar is -3."
    )
    result = MODULE.parse_brief_text(sample)
    assert result["score"] == 113.0
    assert result["health"] == 41.0
    assert result["education"] == 75.0
    assert result["employment"] == -3.0


def test_iso3_slug_mapping_covers_world_bank_naming():
    names = {"RUS": "Russian Federation", "KOR": "Korea, Rep."}
    assert MODULE.iso3_for_slug("russian-federation", names) == "RUS"
    assert MODULE.iso3_for_slug("korea-rep", names) == "KOR"
    assert MODULE.iso3_for_slug("republic-of-korea", names) == "KOR"
    assert MODULE.iso3_for_slug("drc", names) == "COD"
    assert MODULE.iso3_for_slug("tu-rkiye", names) == "TUR"


def test_component_diagnostics_satisfy_not_null_schema_without_peer_claims():
    result = MODULE.component_diagnostics(42.0, 48.0)
    assert result == {
        "gap_to_frontier": 6.0,
        "gap_to_peer_group": 0.0,
        "weighted_gap": 6.0,
        "rank_leverage": 0.0,
        "actionability": 0.5,
        "priority_score": 3.0,
    }
    assert all(value is not None for value in result.values())


def test_parser_cache_is_checksum_bound(tmp_path, monkeypatch):
    cache = tmp_path / "brief.parsed.json"
    calls = []

    def parse(data):
        calls.append(data)
        return {"score": float(len(data))}

    monkeypatch.setattr(MODULE, "parse_brief", parse)
    assert MODULE.parse_brief_with_cache(b"%PDF-one", cache) == {"score": 8.0}
    assert MODULE.parse_brief_with_cache(b"%PDF-one", cache) == {"score": 8.0}
    assert len(calls) == 1

    assert MODULE.parse_brief_with_cache(b"%PDF-two-long", cache) == {"score": 13.0}
    assert len(calls) == 2
    payload = json.loads(cache.read_text(encoding="utf-8"))
    assert payload["pdf_sha256"] == MODULE.sha256_bytes(b"%PDF-two-long")


def test_finalizer_preserves_loaded_hci_plus_metadata():
    from giip.db import connect
    from giip.final_release_v6 import ensure_hci_plus_pending_metadata

    with connect() as conn:
        result = ensure_hci_plus_pending_metadata(conn)
        registry = conn.execute(
            "SELECT score_status,methodology_version FROM index_methodology_registry WHERE index_code='HCI_PLUS'"
        ).fetchone()
        public_scores = conn.execute(
            "SELECT COUNT(*) FROM index_scores WHERE index_code='HCI_PLUS' AND year=2026"
        ).fetchone()[0]
        public_components = conn.execute(
            "SELECT COUNT(*) FROM component_values WHERE index_code='HCI_PLUS' AND year=2026"
        ).fetchone()[0]
    assert result["status"] == "official_online_ingestion_loaded"
    assert result["countries"] >= 150
    assert public_scores == result["countries"]
    assert public_components == result["countries"] * 3
    assert tuple(registry) == ("official_hci_plus_2026", "world-bank-hci-plus-2026")
