from __future__ import annotations

import json
from typing import Any

import pytest
import requests

from scripts import fetch_sec_corporate_metrics as sec


def annual_entry(
    *,
    value: int | float,
    start: str | None,
    end: str,
    fiscal_year: int,
    filed: str,
    form: str = "10-K",
) -> dict[str, Any]:
    entry: dict[str, Any] = {
        "val": value,
        "end": end,
        "fy": fiscal_year,
        "fp": "FY",
        "form": form,
        "filed": filed,
        "accn": "0000000000-25-000001",
    }
    if start is not None:
        entry["start"] = start
    return entry


def response(status: int, payload: object, **headers: str) -> requests.Response:
    result = requests.Response()
    result.status_code = status
    result.url = "https://data.sec.gov/test"
    result.headers.update(headers)
    result._content = json.dumps(payload).encode("utf-8")
    result.encoding = "utf-8"
    return result


def test_annual_fact_selects_freshest_period_across_candidate_tags() -> None:
    facts = {
        "us-gaap": {
            "RevenueFromContractWithCustomerExcludingAssessedTax": {
                "label": "Revenue",
                "units": {
                    "USD": [
                        annual_entry(
                            value=350_018_000_000,
                            start="2024-01-01",
                            end="2024-12-31",
                            fiscal_year=2024,
                            filed="2025-02-05",
                        )
                    ]
                },
            },
            "Revenues": {
                "label": "Revenues",
                "units": {
                    "USD": [
                        annual_entry(
                            value=402_836_000_000,
                            start="2025-01-01",
                            end="2025-12-31",
                            fiscal_year=2025,
                            filed="2026-02-05",
                        )
                    ]
                },
            },
        }
    }

    selected = sec.annual_fact(facts, sec.TAG_CANDIDATES["REVENUE"], "duration")

    assert selected is not None
    assert selected["tag"] == "Revenues"
    assert selected["end"] == "2025-12-31"
    assert selected["val"] == 402_836_000_000


def test_annual_fact_rejects_quarterly_duration_and_accepts_amendment() -> None:
    facts = {
        "us-gaap": {
            "NetIncomeLoss": {
                "units": {
                    "USD": [
                        annual_entry(
                            value=10,
                            start="2025-10-01",
                            end="2025-12-31",
                            fiscal_year=2025,
                            filed="2026-03-01",
                        ),
                        annual_entry(
                            value=40,
                            start="2025-01-01",
                            end="2025-12-31",
                            fiscal_year=2025,
                            filed="2026-03-15",
                            form="10-K/A",
                        ),
                    ]
                }
            }
        }
    }

    selected = sec.annual_fact(facts, [("us-gaap", "NetIncomeLoss")], "duration")

    assert selected is not None
    assert selected["val"] == 40
    assert selected["form"] == "10-K/A"


def test_instant_fact_selects_current_standard_concept_over_stale_first_candidate() -> None:
    facts = {
        "dei": {
            "EntityNumberOfEmployees": {
                "units": {
                    "Employees": [
                        annual_entry(
                            value=14_072,
                            start=None,
                            end="2014-12-31",
                            fiscal_year=2014,
                            filed="2015-02-11",
                            form="20-F",
                        )
                    ]
                }
            }
        },
        "ifrs-full": {
            "NumberOfEmployees": {
                "units": {
                    "employee": [
                        annual_entry(
                            value=110_650,
                            start=None,
                            end="2025-12-31",
                            fiscal_year=2025,
                            filed="2026-02-26",
                            form="20-F",
                        )
                    ]
                }
            }
        },
    }

    selected = sec.annual_fact(facts, sec.TAG_CANDIDATES["EMPLOYEES"], "instant")

    assert selected is not None
    assert selected["taxonomy"] == "ifrs-full"
    assert selected["tag"] == "NumberOfEmployees"
    assert selected["val"] == 110_650


def test_annual_fact_rejects_boolean_and_missing_period_boundaries() -> None:
    facts = {
        "us-gaap": {
            "NetIncomeLoss": {
                "units": {
                    "USD": [
                        annual_entry(
                            value=True,
                            start="2025-01-01",
                            end="2025-12-31",
                            fiscal_year=2025,
                            filed="2026-02-01",
                        ),
                        {"val": 100, "fy": 2025, "fp": "FY", "form": "10-K"},
                    ]
                }
            }
        }
    }

    assert sec.annual_fact(facts, [("us-gaap", "NetIncomeLoss")], "duration") is None


def test_get_retries_retryable_status_and_honors_retry_after(monkeypatch: pytest.MonkeyPatch) -> None:
    responses = [response(429, {}, **{"Retry-After": "0"}), response(200, {"ok": True})]
    calls: list[tuple[str, int]] = []
    sleeps: list[float] = []

    class Session:
        def get(self, url: str, timeout: int) -> requests.Response:
            calls.append((url, timeout))
            return responses.pop(0)

    monkeypatch.setattr(sec.time, "sleep", sleeps.append)

    result = sec.get(Session(), "https://data.sec.gov/test", retries=2)  # type: ignore[arg-type]

    assert result.status_code == 200
    assert calls == [("https://data.sec.gov/test", 90), ("https://data.sec.gov/test", 90)]
    assert sleeps == [0.0]


def test_get_does_not_retry_nonretryable_client_error(monkeypatch: pytest.MonkeyPatch) -> None:
    calls = 0

    class Session:
        def get(self, url: str, timeout: int) -> requests.Response:
            nonlocal calls
            calls += 1
            return response(404, {"error": "not found"})

    monkeypatch.setattr(sec.time, "sleep", lambda delay: pytest.fail(f"unexpected sleep {delay}"))

    with pytest.raises(RuntimeError, match="404 Client Error"):
        sec.get(Session(), "https://data.sec.gov/test", retries=5)  # type: ignore[arg-type]
    assert calls == 1


def test_company_facts_validation_rejects_cik_mismatch() -> None:
    result = response(200, {"cik": 123, "facts": {}})

    with pytest.raises(ValueError, match="CIK mismatch"):
        sec._parse_company_facts(result, expected_cik=456)


def test_provenance_contains_release_transform_formula_and_quality_fields() -> None:
    fact = {
        "taxonomy": "us-gaap",
        "tag": "NetIncomeLoss",
        "unit": "USD",
        "period_type": "duration",
        "form": "10-K",
        "filed": "2026-02-05",
        "start": "2025-01-01",
        "end": "2025-12-31",
        "accn": "0000000000-26-000001",
    }

    provenance = sec.build_provenance(
        fact=fact,
        cik=1_656_410,
        source_url="https://data.sec.gov/api/xbrl/companyfacts/CIK0001656410.json",
        snapshot_id="SEC_EDGAR_CORPORATE_NUMERIC:GOOGL:20260711T120000+0000",
        snapshot_path="data/raw/sec/googl.json",
        snapshot_sha256="a" * 64,
        retrieved_at="2026-07-11T12:00:00+00:00",
        fiscal_year=2025,
    )

    assert provenance["source_name"] == sec.SOURCE_NAME
    assert provenance["source_release_year"] == 2026
    assert provenance["raw_snapshot_sha256"] == "a" * 64
    assert provenance["transform_id"] == sec.TRANSFORM_ID
    assert provenance["formula_version"] == "not_applicable_direct_reported_fact"
    assert provenance["quality_flag"] == "official_reported"
    assert provenance["company_cik"] == 1_656_410
