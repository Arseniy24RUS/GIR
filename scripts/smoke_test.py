from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient  # noqa: E402

from giip.api import app  # noqa: E402
from giip.config import DB_PATH, DEFAULT_YEAR  # noqa: E402
from giip.production_data import build_production_database  # noqa: E402


def get_json(client: TestClient, path: str) -> dict[str, Any]:
    response = client.get(path)
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, dict):
        raise RuntimeError(f"Expected a JSON object from {path}")
    return payload


def run_smoke(*, refresh: bool = False, year: int = DEFAULT_YEAR) -> dict[str, Any]:
    """Exercise the installed release without mutating it by default.

    ``refresh=True`` is an explicit online source-ingestion test.  The default smoke
    test reuses the installed, checksum-bound SQLite release so it is deterministic
    and safe in offline acceptance environments.
    """

    if refresh:
        build_production_database(reset=True)
    elif not DB_PATH.exists():
        raise FileNotFoundError(
            f"Release database is missing: {DB_PATH}. Run with --refresh only in an "
            "environment that has access to all official source hosts."
        )

    with TestClient(app) as client:
        health = get_json(client, "/api/health")
        landing = get_json(client, "/api/landing-summary")
        country = get_json(client, f"/api/country/RUS/profile?year={year}")
        workspace = get_json(client, f"/api/country/RUS/workspace?year={year}")
        command_center = get_json(client, f"/api/country/RUS/command-center?year={year}")
        htei = get_json(client, f"/api/htei/workspace?country=RUS&year={year}&mode=proxy_extended")
        training = get_json(client, f"/api/training/workspace?country=RUS&year={year}")
        policy = get_json(client, f"/api/policy/russia/workspace?year={year}")
        methodology = get_json(client, "/api/methodology/summary")
        catalog = get_json(client, "/api/data-catalog/summary")
        explorer = get_json(
            client,
            "/api/data-explorer/query?dataset=index_scores&measure=score&countries=RUS&limit=50",
        )
        gtci = get_json(client, f"/api/index/GTCI/explainer?country=RUS&year={year}")
        qs = get_json(client, f"/api/qs/RUS?year={year}")
        readiness = get_json(client, "/api/release/readiness")

    index_codes = [item["index_code"] for item in country["indices"]]
    qs_card = next(item for item in country["indices"] if item["index_code"] == "QS_ET")

    return {
        "status": health["status"],
        "mode": "online-refresh" if refresh else "installed-release",
        "database": str(DB_PATH),
        "countries": health["countries"],
        "current_indices": health["indices_current"],
        "scores": health["scores"],
        "components": health["components"],
        "raw_snapshots": health["raw_snapshots"],
        "landing_country": landing["country"]["iso3"],
        "country_workspace_indices": len(workspace["indices"]),
        "command_center_quick_levers": len(command_center["quick_levers"]),
        "htei": {
            "mode": htei["effective_mode"],
            "score": htei["profile"]["score"],
            "rank": htei["profile"]["rank"],
            "components": len(htei["components"]),
        },
        "training_model": {
            "rank": training["score"]["rank"],
            "universe": training["summary"]["universe_count"],
            "blocks": len(training["blocks"]),
        },
        "policy_measures": len(policy["items"]),
        "methodology": {
            "database_tables": methodology["scale"]["database_tables"],
            "index_registry": len(methodology["index_registry"]),
        },
        "data_lab": {
            "catalog_distributions": catalog["catalog_distributions"],
            "explorer_rows": explorer["summary"]["returned_rows"],
            "explorer_datasets": catalog["explorer_dataset_count"],
        },
        "legacy_contracts": {
            "index_modules": index_codes,
            "has_htei": "HTEI" in index_codes,
            "gtci_component_rows_for_country": len(gtci["country_diagnostics"]["components"]),
            "qs_engineering_available": qs_card["available"] is True,
            "qs_value_year": qs_card["value_year"],
            "qs_institution_rows_for_country": len(qs["institutions"]),
        },
        "release": {
            "readiness_level": readiness["readiness_level"],
            "release_ready": readiness["release_ready"],
            "blocker_codes": [item["code"] for item in readiness["blockers"]],
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Smoke-test the installed GIR release; online refresh is opt-in."
    )
    parser.add_argument(
        "--refresh",
        action="store_true",
        help="Rebuild the database from official online sources before testing.",
    )
    parser.add_argument("--year", type=int, default=DEFAULT_YEAR)
    args = parser.parse_args()
    print(json.dumps(run_smoke(refresh=args.refresh, year=args.year), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
