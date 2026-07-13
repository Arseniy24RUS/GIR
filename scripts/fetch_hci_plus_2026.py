#!/usr/bin/env python3
"""Download and ingest the official World Bank HCI+ 2026 country briefs.

The script uses only the official World Bank country-brief page and PDF files.
No interpolation, synthetic values or manual country scores are permitted.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ProcessPoolExecutor, as_completed
import hashlib
import io
import json
import re
import sys
import time
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlparse, unquote

import pdfplumber
import pycountry
import requests

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from giip.db import connect, migrate_schema
from giip.final_release_v6 import (
    migrate_final_schema,
    finalize_license_distribution_policy,
    build_reproducibility_artifacts,
)

SOURCE_ID = "WORLD_BANK_HCIPLUS"
INDEX_CODE = "HCI_PLUS"
YEAR = 2026
INDEX_PAGE = "https://humancapital.worldbank.org/en/country-briefs"
OFFICIAL_HOSTS = {"humancapital.worldbank.org", "thedocs.worldbank.org"}


class PdfLinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "a":
            return
        href = dict(attrs).get("href")
        if href and ".pdf" in href.lower():
            self.links.append(href)


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def get(session: requests.Session, url: str, retries: int = 5) -> requests.Response:
    host = (urlparse(url).hostname or "").lower()
    if host not in OFFICIAL_HOSTS:
        raise RuntimeError(f"Refusing non-World-Bank HCI+ host: {host}")
    last: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            response = session.get(url, timeout=120)
            if response.status_code == 429 or response.status_code >= 500:
                time.sleep(min(30, attempt * 3))
                continue
            response.raise_for_status()
            return response
        except Exception as exc:  # pragma: no cover - network path
            last = exc
            time.sleep(min(30, attempt * 3))
    raise RuntimeError(f"Unable to fetch {url}: {last}")


def compact(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def pdf_text(data: bytes) -> str:
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        return compact(" ".join((page.extract_text() or "") for page in pdf.pages))


def number(patterns: list[str], text: str, required: bool = True) -> float | None:
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.I)
        if match:
            return float(match.group(1))
    if required:
        raise ValueError(f"Required HCI+ value not found; patterns={patterns}")
    return None


def parse_brief_text(text: str) -> dict[str, float | None]:
    """Parse the official April-2026 World Bank country-brief wording.

    The publisher currently uses sentences such as ``The HCI+ score for the
    Health pillar is 42``.  Alternative patterns are retained for harmless
    typography changes, but the loader refuses a brief when the total or any
    of the three official pillars is absent.
    """
    text = compact(text)
    values = {
        "score": number([
            r"HCI\+\s*score\s*is\s*(\d+(?:\.\d+)?)",
            r"HCI\+\s*score\s*\((\d+(?:\.\d+)?)\)",
        ], text),
        "health": number([
            r"HCI\+\s*score\s*for\s*(?:the\s*)?Health\s*pillar\s*is\s*(-?\d+(?:\.\d+)?)",
            r"Health\s*pillar\s*is\s*(-?\d+(?:\.\d+)?)",
        ], text),
        "education": number([
            r"HCI\+\s*score\s*for\s*(?:the\s*)?Education\s*pillar\s*is\s*(-?\d+(?:\.\d+)?)",
            r"Education\s*pillar\s*is\s*(-?\d+(?:\.\d+)?)",
        ], text),
        "employment": number([
            r"HCI\+\s*score\s*for\s*(?:the\s*)?Employment\s*pillar\s*is\s*(-?\d+(?:\.\d+)?)",
            r"Employment\s*pillar\s*is\s*(-?\d+(?:\.\d+)?)",
        ], text),
        "women": number([
            r"HCI\+\s*score\s*for\s*women.*?\s*is\s*(\d+(?:\.\d+)?)",
            r"(?:The\s*)?score\s*for\s*women.*?\s*is\s*(\d+(?:\.\d+)?)",
        ], text, required=False),
        "men": number([
            r"compared\s*to\s*(\d+(?:\.\d+)?)\s*for\s*men",
            r"HCI\+\s*score\s*for\s*men.*?\s*is\s*(\d+(?:\.\d+)?)",
        ], text, required=False),
    }
    pillars = sum(float(values[key] or 0) for key in ("health", "education", "employment"))
    score = float(values["score"] or -1)
    # Published country briefs contain rounded integer pillars; a two-point
    # tolerance accommodates independent rounding of the three contributions.
    if abs(pillars - score) > 2.1:
        raise ValueError(f"HCI+ pillar sum mismatch: total={score}, pillars={pillars}")
    if not (0 <= score <= 325):
        raise ValueError(f"HCI+ score outside official scale: {score}")
    for key in ("health", "education", "employment"):
        value = float(values[key] or -1)
        # Official employment contributions can be negative; São Tomé and
        # Príncipe's 2026 brief publishes -3 points and an additive total.
        if not (-100 <= value <= 325):
            raise ValueError(f"HCI+ {key} pillar outside official scale: {value}")
    return values


def component_diagnostics(raw_value: float, frontier_value: float) -> dict[str, float]:
    """Return schema-required diagnostics derived only from official pillar values."""
    gap = max(float(frontier_value) - float(raw_value), 0.0)
    return {
        "gap_to_frontier": gap,
        "gap_to_peer_group": 0.0,
        "weighted_gap": gap,
        "rank_leverage": 0.0,
        "actionability": 0.5,
        "priority_score": gap * 0.5,
    }


def parse_brief_with_cache(data: bytes, cache_path: Path) -> dict[str, float | None]:
    """Cache deterministic PDF parsing while binding the result to source bytes."""
    digest = sha256_bytes(data)
    if cache_path.is_file():
        try:
            cached = json.loads(cache_path.read_text(encoding="utf-8"))
            if (
                cached.get("pdf_sha256") == digest
                and cached.get("transform_id") == "hci_plus_country_brief_v1"
                and isinstance(cached.get("values"), dict)
            ):
                return cached["values"]
        except (OSError, UnicodeError, json.JSONDecodeError):
            pass
    values = parse_brief(data)
    cache_path.write_text(
        json.dumps(
            {
                "pdf_sha256": digest,
                "transform_id": "hci_plus_country_brief_v1",
                "values": values,
            },
            ensure_ascii=False,
            sort_keys=True,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    return values


def cache_pdf_parse(path_text: str) -> str:
    path = Path(path_text)
    parse_brief_with_cache(path.read_bytes(), path.with_suffix(".parsed.json"))
    return path.name


def parse_brief(data: bytes) -> dict[str, float | None]:
    if not data.startswith(b"%PDF"):
        raise ValueError("World Bank HCI+ response is not a PDF")
    return parse_brief_text(pdf_text(data))


ALIASES = {
    "bahamas-the": "BHS", "gambia-the": "GMB", "congo-dem-rep": "COD", "congo-rep": "COG",
    "cote-divoire": "CIV", "côte-divoire": "CIV", "egypt-arab-rep": "EGY", "iran-islamic-rep": "IRN",
    "korea-rep": "KOR", "kyrgyz-republic": "KGZ", "lao-pdr": "LAO", "russian-federation": "RUS",
    "slovak-republic": "SVK", "turkiye": "TUR", "venezuela-rb": "VEN", "viet-nam": "VNM",
    "vietnam": "VNM", "west-bank-and-gaza": "PSE", "yemen-rep": "YEM", "czechia": "CZE",
    "brunei-darussalam": "BRN", "cabo-verde": "CPV", "eswatini": "SWZ", "micronesia-fed-sts": "FSM",
    "moldova": "MDA", "north-macedonia": "MKD", "sao-tome-and-principe": "STP", "tanzania": "TZA",
    "bolivia": "BOL", "kosovo": "XKX", "drc": "COD", "republic-of-congo": "COG",
    "republic-of-korea": "KOR", "sa-o-tome-and-principe": "STP", "st-lucia": "LCA",
    "st-vincent-and-the-grenadines": "VCT", "tu-rkiye": "TUR",
}


def slug_from_url(url: str) -> str:
    name = Path(unquote(urlparse(url).path)).stem
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def iso3_for_slug(slug: str, db_names: dict[str, str]) -> str | None:
    if slug in ALIASES:
        return ALIASES[slug]
    normalized = slug.replace("-", " ")
    for iso3, name in db_names.items():
        key = re.sub(r"[^a-z0-9]+", " ", name.lower()).strip()
        if key == normalized:
            return iso3
    try:
        country = pycountry.countries.lookup(normalized)
        return str(country.alpha_3)
    except LookupError:
        return None


def ensure_metadata(conn, retrieved: str) -> None:
    source_url = INDEX_PAGE
    conn.execute(
        """INSERT INTO source_registry(source_id,source_code,source_name,title,owner,url,source_url,
        access_mode,update_frequency,license_or_terms,license_note,automation_status,source_role,retrieved_at,
        release_year,is_official,free_access) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(source_id) DO UPDATE SET
          source_code=excluded.source_code,source_name=excluded.source_name,title=excluded.title,
          owner=excluded.owner,url=excluded.url,source_url=excluded.source_url,
          access_mode=excluded.access_mode,update_frequency=excluded.update_frequency,
          license_or_terms=excluded.license_or_terms,license_note=excluded.license_note,
          automation_status=excluded.automation_status,source_role=excluded.source_role,
          retrieved_at=excluded.retrieved_at,release_year=excluded.release_year,
          is_official=excluded.is_official,free_access=excluded.free_access""",
        (SOURCE_ID, SOURCE_ID, "World Bank Human Capital Index Plus 2026", "HCI+ 2026 country briefs",
         "World Bank", source_url, source_url, "official country-brief PDFs", "edition based",
         "World Bank Open Knowledge / country-brief terms", "Release uses official country briefs and source attribution.",
         "automated", "official_index", retrieved, YEAR, 1, 1),
    )
    values = (
        INDEX_CODE, "Human Capital Index Plus", "HCI+", "Индекс человеческого капитала плюс (HCI+)",
        "Индекс человеческого капитала плюс", "Human Capital Index Plus", "HCI+", "human_capital",
        "World Bank", source_url,
        "Основной актуальный индекс человеческого капитала Всемирного банка 2026 года, учитывающий здоровье, образование и занятость на протяжении трудовой жизни.",
        "The World Bank's current 2026 human-capital index covering health, education and employment over the working life.",
        "0-325 official score", "desc", "official HCI+ 2026 country-brief import", "official_index", 0,
    )
    placeholders = ",".join("?" for _ in values)
    for table in ("index_definitions", "indices"):
        columns = [str(row["name"]) for row in conn.execute(f"PRAGMA table_info({table})")]
        if len(columns) != len(values) or columns[0] != "code":
            raise RuntimeError(f"Unexpected {table} schema for HCI+ metadata upsert")
        updates = ",".join(f"{column}=excluded.{column}" for column in columns[1:])
        conn.execute(
            f"INSERT INTO {table}({','.join(columns)}) VALUES({placeholders}) "
            f"ON CONFLICT(code) DO UPDATE SET {updates}",
            values,
        )
    conn.execute("DELETE FROM index_aliases WHERE index_code=?", (INDEX_CODE,))
    for alias, lang, label, primary in [
        ("HCI_PLUS:ru:primary", "ru", "Индекс человеческого капитала плюс", 1),
        ("HCI_PLUS:ru:name", "ru", "Индекс человеческого капитала плюс (HCI+)", 0),
        ("HCI_PLUS:en:primary", "en", "HCI+", 1),
        ("HCI_PLUS:en:name", "en", "Human Capital Index Plus", 0),
    ]:
        conn.execute("INSERT OR REPLACE INTO index_aliases(alias,index_code,lang,display_label,is_primary) VALUES(?,?,?,?,?)",
                     (alias, INDEX_CODE, lang, label, primary))
    for table in ("components", "index_components"):
        conn.execute(f"DELETE FROM {table} WHERE index_code=?", (INDEX_CODE,))
        for code, nru, nen in [
            ("HEALTH", "Здоровье", "Health"), ("EDUCATION", "Образование", "Education"),
            ("EMPLOYMENT", "Занятость", "Employment")
        ]:
            conn.execute(f"INSERT INTO {table}(index_code,component_code,name_ru,name_en,weight,source_note) VALUES(?,?,?,?,?,?)",
                         (INDEX_CODE, code, nru, nen, 1.0, "Official World Bank HCI+ pillar score; pillars are additive on the 0-325 scale; this field is not used to recompute the official score."))
    conn.execute(
        """INSERT OR REPLACE INTO index_formulas(index_code,formula_version,formula_text_ru,formula_text_en,
        method_notes_ru,method_notes_en,weights_json,normalization_ru,normalization_en,official_formula_available,source_id)
        VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
        (INDEX_CODE, "official-hci-plus-2026", "HCI+ = здоровье + образование + занятость; официальный балл Всемирного банка на шкале 0–325.",
         "HCI+ = health + education + employment; official World Bank score on the 0–325 scale.",
         "HCI+ является основной актуальной редакцией. Исторический HCI показывается отдельно и не образует непрерывный официальный ряд с HCI+.",
         "HCI+ is the current primary edition. Historical HCI is shown separately and does not form a continuous official series with HCI+.",
         json.dumps({"HEALTH": "official pillar", "EDUCATION": "official pillar", "EMPLOYMENT": "official pillar"}, ensure_ascii=False),
         "Официальные баллы и баллы трёх направлений используются без перенормировки.",
         "Official total and three pillar scores are used without renormalisation.", 1, SOURCE_ID),
    )
    conn.execute(
        """INSERT OR REPLACE INTO index_methodology_registry(index_code,score_status,component_status,formula_status,
        methodology_version,label_ru,label_en,warning_ru,warning_en,source_url,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
        (INDEX_CODE, "official_hci_plus_2026", "official_pillar_scores", "official_additive_score",
         "world-bank-hci-plus-2026", "официальное значение HCI+ 2026", "official HCI+ 2026 value",
         "Методологический разрыв с историческим HCI: на графике редакции различаются цветом и формой маркера.",
         "Methodological break from historical HCI: chart editions use different colours and marker shapes.", source_url, retrieved),
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--minimum-countries", type=int, default=150)
    parser.add_argument("--sleep", type=float, default=0.08)
    parser.add_argument(
        "--reuse-existing",
        action="store_true",
        help="Reuse checksum-verified PDFs already downloaded into the official raw directory.",
    )
    parser.add_argument("--cache-only", action="store_true", help="Build checksum-bound parser caches and exit.")
    parser.add_argument("--parse-workers", type=int, default=4)
    args = parser.parse_args()
    if args.cache_only:
        raw_root = ROOT / "data" / "raw" / SOURCE_ID / str(YEAR)
        pdfs = sorted(raw_root.glob("*.pdf"))
        if len(pdfs) < args.minimum_countries:
            raise SystemExit(f"Only {len(pdfs)} local HCI+ PDFs found; expected at least {args.minimum_countries}.")
        failures: list[dict[str, str]] = []
        completed = 0
        with ProcessPoolExecutor(max_workers=max(1, args.parse_workers)) as executor:
            futures = {executor.submit(cache_pdf_parse, str(path)): path for path in pdfs}
            for future in as_completed(futures):
                path = futures[future]
                try:
                    future.result()
                    completed += 1
                except Exception as exc:
                    failures.append({"path": str(path), "error": str(exc)})
        if failures or completed < args.minimum_countries:
            raise SystemExit(json.dumps({"cached": completed, "failures": failures}, ensure_ascii=False, indent=2))
        print(json.dumps({"status": "ok", "cached_parses": completed}, ensure_ascii=False, indent=2))
        return
    retrieved = now()
    stamp = retrieved.replace(":", "").replace("-", "")
    session = requests.Session()
    session.headers.update({"User-Agent": "MGIMO-GIIP/1.0 HCI+ official-data ingestion; contact supplied by project operator"})
    page_response = get(session, INDEX_PAGE)
    parser_html = PdfLinkParser(); parser_html.feed(page_response.text)
    links = sorted({urljoin(INDEX_PAGE, href) for href in parser_html.links})
    if len(links) < args.minimum_countries:
        raise SystemExit(f"Only {len(links)} official HCI+ PDF links found; expected at least {args.minimum_countries}.")

    with connect() as conn:
        migrate_schema(conn); migrate_final_schema(conn); ensure_metadata(conn, retrieved)
        db_names = {r["iso3"]: r["name_en"] for r in conn.execute("SELECT iso3,name_en FROM countries")}
        raw_root = ROOT / "data" / "raw" / SOURCE_ID / str(YEAR); raw_root.mkdir(parents=True, exist_ok=True)
        page_path = raw_root / f"country-briefs-{stamp}.html"; page_path.write_bytes(page_response.content)
        page_digest = sha256_file(page_path)
        page_snapshot = f"{SOURCE_ID}:INDEX:{stamp}"
        conn.execute("""INSERT OR REPLACE INTO raw_snapshots(snapshot_id,source_id,release_year,retrieved_at,source_url,
          raw_snapshot_path,raw_snapshot_sha256,content_type,bytes_count,is_official,license_or_terms)
          VALUES(?,?,?,?,?,?,?,?,?,?,?)""", (page_snapshot,SOURCE_ID,YEAR,retrieved,INDEX_PAGE,str(page_path.relative_to(ROOT)),page_digest,
          page_response.headers.get("content-type") or "text/html",page_path.stat().st_size,1,"World Bank official country-brief page"))
        conn.execute("DELETE FROM hci_plus_country_scores WHERE year=?", (YEAR,))
        conn.execute("DELETE FROM component_values WHERE index_code=? AND year=?", (INDEX_CODE,YEAR))
        conn.execute("DELETE FROM index_scores WHERE index_code=? AND year=?", (INDEX_CODE,YEAR))
        parsed: list[dict[str, Any]] = []
        unmatched: list[str] = []; errors: list[dict[str,str]] = []
        for i, url in enumerate(links, start=1):
            slug = slug_from_url(url); iso3 = iso3_for_slug(slug, db_names)
            if not iso3 or iso3 not in db_names:
                unmatched.append(slug); continue
            try:
                path = raw_root / f"{slug}.pdf"
                if args.reuse_existing and path.is_file():
                    content = path.read_bytes()
                    content_type = "application/pdf"
                else:
                    response = get(session, url)
                    content = response.content
                    content_type = (response.headers.get("content-type") or "").lower()
                if "pdf" not in content_type and not content.startswith(b"%PDF"):
                    raise ValueError(f"Official country-brief response is not PDF: {content_type}")
                if not content.startswith(b"%PDF"):
                    raise ValueError("Official country-brief snapshot has no PDF signature")
                if not (args.reuse_existing and path.is_file()):
                    path.write_bytes(content)
                values = parse_brief_with_cache(content, path.with_suffix(".parsed.json"))
                digest = sha256_file(path)
                snapshot_id = f"{SOURCE_ID}:{iso3}:{YEAR}"
                conn.execute("""INSERT OR REPLACE INTO raw_snapshots(snapshot_id,source_id,release_year,retrieved_at,source_url,
                  raw_snapshot_path,raw_snapshot_sha256,content_type,bytes_count,is_official,license_or_terms)
                  VALUES(?,?,?,?,?,?,?,?,?,?,?)""", (snapshot_id,SOURCE_ID,YEAR,retrieved,url,str(path.relative_to(ROOT)),digest,
                  "application/pdf",path.stat().st_size,1,"World Bank HCI+ country brief"))
                run_id = f"{SOURCE_ID}:PARSE:{iso3}:{YEAR}"
                conn.execute("""INSERT OR REPLACE INTO transformation_runs(transformation_run_id,transform_id,source_id,snapshot_id,
                  started_at,completed_at,code_version,rows_loaded,notes) VALUES(?,?,?,?,?,?,?,?,?)""",
                  (run_id,"hci_plus_country_brief_v1",SOURCE_ID,snapshot_id,retrieved,retrieved,"GIIP-final-release-v6",4,"Official PDF text extraction"))
                parsed.append({"iso3":iso3,"url":url,"path":str(path.relative_to(ROOT)),"sha":digest,"snapshot":snapshot_id,"run":run_id,**values})
            except Exception as exc:
                errors.append({"url":url,"error":str(exc)})
            if args.sleep: time.sleep(args.sleep)
        if len(parsed) < args.minimum_countries:
            raise SystemExit(json.dumps({"error":"HCI+ coverage threshold not reached","parsed":len(parsed),"unmatched":unmatched,"errors":errors[:10]},ensure_ascii=False,indent=2))
        parsed.sort(key=lambda r:(-float(r["score"]),r["iso3"]))
        total=len(parsed)
        pillar_max={k:max(float(r[k]) for r in parsed) for k in ("health","education","employment")}
        for rank, r in enumerate(parsed, start=1):
            pct=(total-rank+1)/total*100
            provenance={"official_edition":"HCI+ 2026","source_url":r["url"],"snapshot_id":r["snapshot"],"scale":"0-325","methodological_break_from_hci_2020":True}
            conn.execute("""INSERT OR REPLACE INTO hci_plus_country_scores(value_id,iso3,year,score,rank,percentile,health_score,
              education_score,employment_score,women_score,men_score,source_id,source_url,retrieved_at,raw_snapshot_path,
              raw_snapshot_sha256,quality_flag,provenance_json) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
              (f"HCI_PLUS:{r['iso3']}:{YEAR}",r["iso3"],YEAR,r["score"],rank,pct,r["health"],r["education"],r["employment"],r["women"],r["men"],SOURCE_ID,r["url"],retrieved,r["path"],r["sha"],"official_value",json.dumps(provenance,ensure_ascii=False,sort_keys=True)))
            conn.execute("""INSERT OR REPLACE INTO index_scores(value_id,index_code,iso3,year,source_data_year,score,rank,percentile,
              rank_delta_1y,rank_delta_5y,data_quality,source_type,source_id,source_url,retrieved_at,release_year,raw_snapshot_path,
              raw_snapshot_sha256,transformation_run_id,transform_id,formula_version,quality_flag,is_official,is_recomputed,provenance_json)
              VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
              (f"HCI_PLUS:{r['iso3']}:{YEAR}",INDEX_CODE,r["iso3"],YEAR,YEAR,r["score"],rank,pct,None,None,1.0,"official_country_brief",SOURCE_ID,r["url"],retrieved,YEAR,r["path"],r["sha"],r["run"],"hci_plus_country_brief_v1","official-hci-plus-2026","official_value",1,0,json.dumps(provenance,ensure_ascii=False,sort_keys=True)))
            for code,key,nru,nen in [("HEALTH","health","Здоровье","Health"),("EDUCATION","education","Образование","Education"),("EMPLOYMENT","employment","Занятость","Employment")]:
                raw=float(r[key]); norm=raw/pillar_max[key]*100 if pillar_max[key] else 0
                diagnostics = component_diagnostics(raw, pillar_max[key])
                cp={
                    **provenance,
                    "pillar":code,
                    "official_pillar_score":raw,
                    "diagnostic_normalized_score":norm,
                    "diagnostic_formulas": {
                        "gap_to_frontier": "max(observed pillar maximum - official pillar score, 0)",
                        "gap_to_peer_group": "0; no comparable peer benchmark is defined for HCI+ pillars",
                        "weighted_gap": "gap_to_frontier; official HCI+ pillars are additive points",
                        "rank_leverage": "0; no causal rank leverage is claimed",
                        "actionability": "0.5 neutral diagnostic constant",
                        "priority_score": "gap_to_frontier * actionability",
                    },
                }
                conn.execute("""INSERT OR REPLACE INTO component_values(value_id,index_code,component_code,iso3,year,source_data_year,
                  raw_value,unit,normalized_score,weighted_contribution,gap_to_frontier,gap_to_peer_group,weighted_gap,rank_leverage,
                  actionability,priority_score,source_id,source_url,retrieved_at,release_year,raw_snapshot_path,raw_snapshot_sha256,
                  transformation_run_id,transform_id,formula_version,quality_flag,is_official,is_recomputed,source_note,provenance_json)
                  VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                  (f"HCI_PLUS:{r['iso3']}:{YEAR}:{code}",INDEX_CODE,code,r["iso3"],YEAR,YEAR,raw,"points",norm,raw,
                   diagnostics["gap_to_frontier"],diagnostics["gap_to_peer_group"],diagnostics["weighted_gap"],
                   diagnostics["rank_leverage"],diagnostics["actionability"],diagnostics["priority_score"],
                   SOURCE_ID,r["url"],retrieved,YEAR,r["path"],r["sha"],r["run"],
                   "hci_plus_country_brief_v1","official-hci-plus-2026","official_value",1,0,"Official World Bank HCI+ pillar score; normalized_score is diagnostic only.",json.dumps(cp,ensure_ascii=False,sort_keys=True)))
        conn.execute("UPDATE source_registry SET latest_snapshot_id=?,retrieved_at=?,release_year=? WHERE source_id=?",(page_snapshot,retrieved,YEAR,SOURCE_ID))
        conn.execute("""INSERT INTO operational_runs(run_id,job_code,started_at,completed_at,status,attempts,rows_loaded,message,log_path,metadata_json)
          VALUES(?,?,?,?,?,?,?,?,?,?)""",(f"HCI_PLUS_REFRESH:{stamp}","HCI_PLUS_REFRESH",retrieved,now(),"success",1,len(parsed),
          "Official World Bank HCI+ 2026 country briefs ingested","",json.dumps({"countries":len(parsed),"unmatched":unmatched,"errors":errors},ensure_ascii=False)))
        # Bind every new snapshot to the conservative distribution policy and
        # rebuild the reproducibility package in the same successful transaction.
        finalize_license_distribution_policy(conn)
        conn.commit()
        build_reproducibility_artifacts(conn)
        conn.commit()
    print(json.dumps({"status":"ok","official_hci_plus_countries":len(parsed),"unmatched":unmatched,"errors":errors},ensure_ascii=False,indent=2))

if __name__ == "__main__":
    main()
