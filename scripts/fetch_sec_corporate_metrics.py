#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from giip.db import connect, migrate_schema
from giip.final_release_v6 import (
    build_reproducibility_artifacts,
    finalize_license_distribution_policy,
    migrate_final_schema,
)

CONFIG_DEFAULT = ROOT / "configs" / "sec_companies.release.json"
SOURCE_ID = "SEC_EDGAR_CORPORATE_NUMERIC"
SOURCE_NAME = "SEC EDGAR Company Facts"
SOURCE_DOC_URL = "https://www.sec.gov/search-filings/edgar-application-programming-interfaces"
FACTS_BASE = "https://data.sec.gov"
TICKERS_URL = "https://www.sec.gov/files/company_tickers.json"
DEFAULT_RAW_DIR = ROOT / "data" / "raw" / SOURCE_ID
TRANSFORM_ID = "sec_companyfacts_annual_v2"
ANNUAL_FORMS = {"10-K", "10-K/A", "20-F", "20-F/A", "40-F", "40-F/A"}

TAG_CANDIDATES = {
    "RND_EXPENSE": [
        ("us-gaap", "ResearchAndDevelopmentExpense"),
        ("us-gaap", "ResearchAndDevelopmentExpenseExcludingAcquiredInProcessCost"),
        ("us-gaap", "ResearchAndDevelopmentExpenseSoftwareExcludingAcquiredInProcessCost"),
        ("us-gaap", "TechnologyAndDevelopmentExpense"),
        ("ifrs-full", "ResearchAndDevelopmentExpense"),
        ("ifrs-full", "ResearchAndDevelopmentCostsRecognisedAsExpense"),
    ],
    "REVENUE": [
        ("us-gaap", "RevenueFromContractWithCustomerExcludingAssessedTax"),
        ("us-gaap", "Revenues"),
        ("us-gaap", "SalesRevenueNet"),
        ("ifrs-full", "Revenue"),
        ("ifrs-full", "RevenueFromContractsWithCustomers"),
    ],
    "NET_INCOME": [
        ("us-gaap", "NetIncomeLoss"),
        ("us-gaap", "ProfitLoss"),
        ("ifrs-full", "ProfitLoss"),
        ("ifrs-full", "ProfitLossAttributableToOwnersOfParent"),
    ],
    "EMPLOYEES": [
        ("dei", "EntityNumberOfEmployees"),
        ("us-gaap", "NumberOfEmployees"),
        ("ifrs-full", "NumberOfEmployees"),
    ],
}
METRIC_PERIOD_TYPES = {
    "RND_EXPENSE": "duration",
    "REVENUE": "duration",
    "NET_INCOME": "duration",
    "EMPLOYEES": "instant",
}
NAMES = {
    "RND_EXPENSE": ("Расходы на исследования и разработки", "Research and development expense"),
    "REVENUE": ("Выручка", "Revenue"),
    "NET_INCOME": ("Чистая прибыль или убыток", "Net income or loss"),
    "EMPLOYEES": ("Численность работников", "Employees"),
}


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as file_handle:
        for chunk in iter(lambda: file_handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def _retry_delay(response: requests.Response | None, attempt: int) -> float:
    if response is not None:
        retry_after = response.headers.get("Retry-After")
        if retry_after:
            try:
                return max(0.0, float(retry_after))
            except ValueError:
                pass
    return float(min(30, attempt * 3))


def get(session: requests.Session, url: str, retries: int = 5) -> requests.Response:
    last: Exception | None = None
    for attempt in range(1, retries + 1):
        response: requests.Response | None = None
        try:
            response = session.get(url, timeout=90)
            if response.status_code == 429 or response.status_code >= 500:
                last = requests.HTTPError(
                    f"retryable HTTP {response.status_code} for {url}", response=response
                )
            else:
                response.raise_for_status()
                return response
        except requests.RequestException as exc:
            last = exc
            if response is not None and response.status_code < 500 and response.status_code != 429:
                break
        if attempt < retries:
            time.sleep(_retry_delay(response, attempt))
    raise RuntimeError(f"Unable to fetch {url}: {last}")


def _iso_date(value: Any) -> date | None:
    try:
        return date.fromisoformat(str(value))
    except (TypeError, ValueError):
        return None


def _is_annual_entry(entry: dict[str, Any], period_type: str) -> bool:
    if entry.get("form") not in ANNUAL_FORMS:
        return False
    value = entry.get("val")
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return False
    end = _iso_date(entry.get("end"))
    if end is None:
        return False
    start = _iso_date(entry.get("start"))
    if period_type == "instant":
        return start is None or start == end
    if period_type != "duration" or start is None:
        return False
    duration_days = (end - start).days + 1
    return 300 <= duration_days <= 430


def annual_fact(
    facts: dict[str, Any],
    candidates: list[tuple[str, str]],
    period_type: str = "duration",
) -> dict[str, Any] | None:
    matches: list[tuple[tuple[str, str, int, int, int], dict[str, Any]]] = []
    for candidate_index, (taxonomy, tag) in enumerate(candidates):
        fact = facts.get(taxonomy, {}).get(tag)
        if not isinstance(fact, dict):
            continue
        units = fact.get("units") or {}
        if not isinstance(units, dict):
            continue
        for unit_index, (unit, entries) in enumerate(units.items()):
            if not isinstance(entries, list):
                continue
            for entry in entries:
                if not isinstance(entry, dict) or not _is_annual_entry(entry, period_type):
                    continue
                sort_key = (
                    str(entry.get("end") or ""),
                    str(entry.get("filed") or ""),
                    int(entry.get("fy") or 0),
                    -candidate_index,
                    -unit_index,
                )
                matches.append(
                    (
                        sort_key,
                        {
                            **entry,
                            "taxonomy": taxonomy,
                            "tag": tag,
                            "unit": unit,
                            "label": fact.get("label"),
                            "description": fact.get("description"),
                            "period_type": period_type,
                        },
                    )
                )
    return max(matches, key=lambda item: item[0])[1] if matches else None


def _stored_snapshot_path(path: Path) -> str:
    resolved = path.resolve()
    try:
        stored = resolved.relative_to(ROOT.resolve())
    except ValueError:
        stored = resolved
    return str(stored).replace("\\", "/")


def fact_quality_flag(fiscal_year: int, retrieved_at: str) -> str:
    retrieved_year = datetime.fromisoformat(retrieved_at).year
    return "official_reported_stale" if fiscal_year < retrieved_year - 2 else "official_reported"


def build_provenance(
    *,
    fact: dict[str, Any],
    cik: int,
    source_url: str,
    snapshot_id: str,
    snapshot_path: str,
    snapshot_sha256: str,
    retrieved_at: str,
    fiscal_year: int,
) -> dict[str, Any]:
    return {
        "source_id": SOURCE_ID,
        "source_name": SOURCE_NAME,
        "source_url": source_url,
        "source_documentation_url": SOURCE_DOC_URL,
        "retrieved_at": retrieved_at,
        "source_release": "live SEC EDGAR Company Facts API snapshot",
        "source_release_year": datetime.fromisoformat(retrieved_at).year,
        "source_api_version": "Company Facts JSON API",
        "snapshot_id": snapshot_id,
        "raw_snapshot_path": snapshot_path,
        "raw_snapshot_sha256": snapshot_sha256,
        "transformation_step": "select latest entity-wide full-year fact across approved standard taxonomy concepts",
        "transform_id": TRANSFORM_ID,
        "formula_version": "not_applicable_direct_reported_fact",
        "quality_flag": fact_quality_flag(fiscal_year, retrieved_at),
        "taxonomy": fact["taxonomy"],
        "tag": fact["tag"],
        "label": fact.get("label"),
        "description": fact.get("description"),
        "unit": fact["unit"],
        "period_type": fact["period_type"],
        "fiscal_year": fiscal_year,
        "form": fact.get("form"),
        "filed": fact.get("filed"),
        "start": fact.get("start"),
        "end": fact.get("end"),
        "frame": fact.get("frame"),
        "accession": fact.get("accn"),
        "company_cik": cik,
    }


def _parse_company_facts(response: requests.Response, expected_cik: int) -> dict[str, Any]:
    try:
        data = response.json()
    except requests.JSONDecodeError as exc:
        raise ValueError("SEC Company Facts response is not valid JSON") from exc
    if not isinstance(data, dict) or not isinstance(data.get("facts"), dict):
        raise ValueError("SEC Company Facts response does not contain a facts object")
    try:
        response_cik = int(data.get("cik"))
    except (TypeError, ValueError) as exc:
        raise ValueError("SEC Company Facts response does not contain a valid CIK") from exc
    if response_cik != expected_cik:
        raise ValueError(f"SEC Company Facts CIK mismatch: expected {expected_cik}, received {response_cik}")
    return data


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(
        description="Load actual numeric corporate-reporting facts from the official SEC EDGAR API."
    )
    parser.add_argument("--config", type=Path, default=CONFIG_DEFAULT)
    parser.add_argument("--user-agent", default=os.getenv("SEC_USER_AGENT"))
    parser.add_argument("--db", type=Path, default=None)
    parser.add_argument("--raw-dir", type=Path, default=DEFAULT_RAW_DIR)
    parser.add_argument(
        "--defer-reproducibility-artifacts",
        action="store_true",
        help="Do not invoke the project-wide artifact writer during an isolated connector verification run.",
    )
    args = parser.parse_args(argv)
    if not args.user_agent or "@" not in args.user_agent:
        raise SystemExit(
            "Set SEC_USER_AGENT to an identifiable project name and contact email, as required by SEC fair-access guidance."
        )
    config = json.loads(args.config.read_text(encoding="utf-8"))
    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": args.user_agent,
            "Accept": "application/json",
            "Accept-Encoding": "gzip, deflate",
        }
    )
    tickers_response = get(session, TICKERS_URL)
    tickers = tickers_response.json()
    ticker_map = {str(value["ticker"]).upper(): int(value["cik_str"]) for value in tickers.values()}
    retrieved = now()
    release_year = datetime.fromisoformat(retrieved).year
    timestamp = retrieved.replace(":", "").replace("-", "")
    rows_loaded = 0
    companies_loaded = 0
    loaded_countries: set[str] = set()
    errors: list[dict[str, str]] = []
    with connect(args.db) if args.db is not None else connect() as conn:
        migrate_schema(conn)
        migrate_final_schema(conn)
        conn.execute(
            """INSERT OR REPLACE INTO source_registry(
              source_id,source_code,source_name,title,owner,url,source_url,access_mode,update_frequency,
              license_or_terms,license_note,automation_status,source_role,retrieved_at,release_year,is_official,free_access)
              VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                SOURCE_ID,
                SOURCE_ID,
                "SEC EDGAR Company Facts - corporate numeric layer",
                SOURCE_NAME,
                "U.S. Securities and Exchange Commission",
                SOURCE_DOC_URL,
                SOURCE_DOC_URL,
                "official JSON API",
                "daily",
                "SEC public data and fair-access policy",
                "Legal redistribution decision remains subject to the project legal register.",
                "automated",
                "numeric_source",
                retrieved,
                release_year,
                1,
                1,
            ),
        )
        for company in config.get("companies", []):
            ticker = company["ticker"].upper()
            cik = ticker_map.get(ticker)
            if not cik:
                errors.append({"ticker": ticker, "error": "CIK not found in official ticker file"})
                continue
            url = f"{FACTS_BASE}/api/xbrl/companyfacts/CIK{cik:010d}.json"
            try:
                response = get(session, url)
                data = _parse_company_facts(response, cik)
                raw_dir = args.raw_dir / ticker
                raw_dir.mkdir(parents=True, exist_ok=True)
                path = raw_dir / f"{timestamp}.json"
                partial_path = path.with_suffix(".json.part")
                partial_path.write_bytes(response.content)
                partial_path.replace(path)
                digest = sha256(path)
                stored_path = _stored_snapshot_path(path)
                snapshot_id = f"{SOURCE_ID}:{ticker}:{timestamp}"
                content_type = response.headers.get("Content-Type", "application/json").split(";", 1)[0]
                conn.execute(
                    """INSERT OR REPLACE INTO raw_snapshots(snapshot_id,source_id,release_year,retrieved_at,source_url,
                        raw_snapshot_path,raw_snapshot_sha256,content_type,bytes_count,is_official,license_or_terms)
                        VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
                    (
                        snapshot_id,
                        SOURCE_ID,
                        release_year,
                        retrieved,
                        url,
                        stored_path,
                        digest,
                        content_type,
                        path.stat().st_size,
                        1,
                        "SEC public data and fair-access policy",
                    ),
                )
                facts = data["facts"]
                company_rows = 0
                for code, candidates in TAG_CANDIDATES.items():
                    fact = annual_fact(facts, candidates, METRIC_PERIOD_TYPES[code])
                    if not fact:
                        continue
                    fiscal_year = int(fact.get("fy") or str(fact["end"])[:4])
                    metric_id = f"{SOURCE_ID}:{ticker}:{code}:{fiscal_year}"
                    name_ru, name_en = NAMES[code]
                    provenance = build_provenance(
                        fact=fact,
                        cik=cik,
                        source_url=url,
                        snapshot_id=snapshot_id,
                        snapshot_path=stored_path,
                        snapshot_sha256=digest,
                        retrieved_at=retrieved,
                        fiscal_year=fiscal_year,
                    )
                    conn.execute(
                        """INSERT OR REPLACE INTO corporate_metrics(metric_id,company_id,company_name,iso3,metric_code,
                            metric_name_ru,metric_name_en,fiscal_year,value,unit,source_system,source_url,retrieved_at,
                            raw_snapshot_path,raw_snapshot_sha256,transform_id,provenance_json)
                            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                        (
                            metric_id,
                            company["company_id"],
                            data.get("entityName") or company["company_name"],
                            company["iso3"],
                            code,
                            name_ru,
                            name_en,
                            fiscal_year,
                            float(fact["val"]),
                            fact["unit"],
                            SOURCE_ID,
                            url,
                            retrieved,
                            stored_path,
                            digest,
                            TRANSFORM_ID,
                            json.dumps(provenance, ensure_ascii=False, sort_keys=True),
                        ),
                    )
                    company_rows += 1
                    rows_loaded += 1
                if company_rows > 0:
                    conn.execute(
                        """INSERT OR REPLACE INTO transformation_runs(transformation_run_id,transform_id,source_id,snapshot_id,
                            started_at,completed_at,code_version,rows_loaded,notes) VALUES(?,?,?,?,?,?,?,?,?)""",
                        (
                            f"SEC_COMPANYFACTS_PARSE:{ticker}:{timestamp}",
                            TRANSFORM_ID,
                            SOURCE_ID,
                            snapshot_id,
                            retrieved,
                            now(),
                            "GIIP-final-release-v6",
                            company_rows,
                            f"Official SEC Company Facts parsed for {ticker}",
                        ),
                    )
                companies_loaded += int(company_rows > 0)
                if company_rows > 0:
                    loaded_countries.add(str(company.get("iso3") or "").upper())
                time.sleep(0.12)
            except Exception as exc:
                errors.append({"ticker": ticker, "error": str(exc)})
        conn.execute(
            """UPDATE source_registry SET retrieved_at=?,release_year=?,latest_snapshot_id=(
                 SELECT snapshot_id FROM raw_snapshots WHERE source_id=? ORDER BY retrieved_at DESC,snapshot_id DESC LIMIT 1
               ) WHERE source_id=?""",
            (retrieved, release_year, SOURCE_ID, SOURCE_ID),
        )
        countries_loaded = len({iso3 for iso3 in loaded_countries if iso3})
        threshold_ok = rows_loaded >= 20 and companies_loaded >= 5 and countries_loaded >= 3
        completed = now()
        conn.execute(
            """INSERT OR REPLACE INTO operational_runs(run_id,job_code,started_at,completed_at,status,attempts,rows_loaded,
              message,log_path,metadata_json) VALUES(?,?,?,?,?,?,?,?,?,?)""",
            (
                f"CORPORATE_REPORTS_REFRESH:{timestamp}",
                "CORPORATE_REPORTS_REFRESH",
                retrieved,
                completed,
                "success" if threshold_ok else "failed",
                1,
                rows_loaded,
                "Official SEC EDGAR corporate numeric layer ingested"
                if threshold_ok
                else "Corporate-reporting release threshold not reached",
                "",
                json.dumps(
                    {
                        "companies_loaded": companies_loaded,
                        "countries_loaded": countries_loaded,
                        "errors": errors,
                        "reproducibility_artifacts_deferred": args.defer_reproducibility_artifacts,
                        "threshold": {"rows": 20, "companies": 5, "countries": 3},
                    },
                    ensure_ascii=False,
                    sort_keys=True,
                ),
            ),
        )
        finalize_license_distribution_policy(conn)
        conn.commit()
        if threshold_ok and not args.defer_reproducibility_artifacts:
            build_reproducibility_artifacts(conn)
            conn.commit()
    result = {
        "status": ("ok" if not errors else "completed_with_errors") if threshold_ok else "failed",
        "rows_loaded": rows_loaded,
        "companies_loaded": companies_loaded,
        "countries_loaded": countries_loaded,
        "release_threshold": {"rows": 20, "companies": 5, "countries": 3},
        "errors": errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if not threshold_ok:
        raise SystemExit(
            "Corporate numeric release threshold not reached: require at least 20 official facts, 5 companies and 3 countries. "
            "Inspect official tags and errors without inventing values."
        )


if __name__ == "__main__":
    main()
