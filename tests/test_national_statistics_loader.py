from __future__ import annotations

import json
from pathlib import Path

import pytest

from scripts.fetch_national_statistics_metrics import flatten_json_stat2, parse_records


ROOT = Path(__file__).resolve().parents[1]


class StaticResponse:
    def __init__(self, payload: dict | None = None, content: bytes = b"") -> None:
        self._payload = payload
        self.content = content

    def json(self) -> dict:
        assert self._payload is not None
        return self._payload


def json_stat_dataset(values: list[float | None] | dict[str, float]) -> dict:
    return {
        "version": "2.0",
        "class": "dataset",
        "label": "R&D full-time equivalents",
        "source": "National statistical office",
        "updated": "2026-01-15T08:00:00Z",
        "id": ["sector", "year"],
        "size": [2, 2],
        "dimension": {
            "sector": {
                "category": {
                    "index": {"TOTAL": 0, "BUSINESS": 1},
                    "label": {"TOTAL": "All sectors", "BUSINESS": "Business sector"},
                }
            },
            "year": {
                "category": {
                    "index": {"2023": 0, "2024": 1},
                    "label": {"2023": "2023", "2024": "2024"},
                }
            },
        },
        "value": values,
    }


def test_flatten_json_stat2_preserves_codes_labels_and_value_order() -> None:
    records = flatten_json_stat2(json_stat_dataset([10.0, 11.0, 20.0, 21.0]))

    assert [(row["sector"], row["year"], row["__value__"]) for row in records] == [
        ("TOTAL", "2023", 10.0),
        ("TOTAL", "2024", 11.0),
        ("BUSINESS", "2023", 20.0),
        ("BUSINESS", "2024", 21.0),
    ]
    assert records[2]["sector__label"] == "Business sector"
    assert records[2]["__source__"] == "National statistical office"
    assert records[2]["__updated__"] == "2026-01-15T08:00:00Z"


def test_flatten_json_stat2_supports_sparse_values() -> None:
    records = flatten_json_stat2(json_stat_dataset({"1": 11.0, "3": 21.0}))

    assert [row["__value__"] for row in records] == [None, 11.0, None, 21.0]


def test_flatten_json_stat2_rejects_value_count_mismatch() -> None:
    with pytest.raises(ValueError, match="value count mismatch"):
        flatten_json_stat2(json_stat_dataset([10.0]))


def test_parse_records_selects_json_stat2_adapter() -> None:
    source = {"source_id": "NSO_RD", "format": "json", "adapter": "pxweb_json_stat2"}

    records = parse_records(StaticResponse(json_stat_dataset([10.0, 11.0, 20.0, 21.0])), source)

    assert len(records) == 4
    assert records[-1]["year"] == "2024"
    assert records[-1]["__value__"] == 21.0


def test_parse_records_reads_semicolon_csv_with_exact_headers() -> None:
    source = {
        "source_id": "DST_RD_FTE",
        "format": "csv",
        "encoding": "utf-8-sig",
        "delimiter": ";",
    }
    content = "SEKTOR;TID;INDHOLD\r\n010;2023;68762\r\n010;2024;71205\r\n".encode("utf-8-sig")

    records = parse_records(StaticResponse(content=content), source)

    assert records == [
        {"SEKTOR": "010", "TID": "2023", "INDHOLD": "68762"},
        {"SEKTOR": "010", "TID": "2024", "INDHOLD": "71205"},
    ]


def test_release_config_declares_four_distinct_official_hosts_and_terms() -> None:
    config = json.loads(
        (ROOT / "configs" / "national_statistics_sources.release.json").read_text(encoding="utf-8")
    )
    sources = config["sources"]

    assert len(sources) == 4
    assert len({source["iso3"] for source in sources}) == 4
    assert len({source["official_host"] for source in sources}) == 4
    assert all(source["url"].startswith("https://") for source in sources)
    assert all(source["license_or_terms"] and source["source_terms_url"] for source in sources)
    assert all(source["source_release_year"] == 2024 for source in sources)
    assert all(source["include_in_htei"] is False for source in sources)
