from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from giip.api import app


client = TestClient(app)
ROOT = Path(__file__).resolve().parents[1]


def test_data_lab_page_and_assets_are_published() -> None:
    response = client.get("/data-lab")
    assert response.status_code == 200
    assert "Data Lab" in response.text
    assert "/static/stage5_data_lab.js" in response.text
    assert "/static/stage5.css" in response.text
    assert (ROOT / "giip/static/stage5_data_lab.js").exists()
    assert (ROOT / "giip/static/stage5.css").exists()


def test_catalog_summary_is_derived_from_live_database() -> None:
    response = client.get("/api/data-catalog/summary")
    assert response.status_code == 200
    payload = response.json()
    assert payload["source_count"] > 0
    assert payload["catalog_distributions"] > 0
    assert payload["registered_snapshots"] > 0
    assert payload["reproducibility_artifacts"] > 0
    assert payload["explorer_dataset_count"] >= 4
    assert payload["database_rows"]["index_scores"] > 0
    assert payload["formats"]


def test_source_catalog_exposes_rights_and_distributions() -> None:
    response = client.get("/api/data-catalog/sources")
    assert response.status_code == 200
    sources = response.json()["sources"]
    assert sources
    source = sources[0]
    assert "redistribution_allowed" in source
    assert "release_archive_decision" in source
    detail = client.get(f"/api/data-catalog/sources/{source['source_id']}")
    assert detail.status_code == 200
    assert "distributions" in detail.json()


def test_file_library_is_paginated_and_rejects_unknown_ids() -> None:
    response = client.get("/api/data-catalog/files", params={"page": 1, "page_size": 7})
    assert response.status_code == 200
    payload = response.json()
    assert payload["page_size"] == 7
    assert len(payload["files"]) <= 7
    assert payload["total"] >= len(payload["files"])
    assert client.get("/api/data-catalog/files/raw.not-base64").status_code == 404


def test_restricted_distribution_cannot_be_downloaded() -> None:
    response = client.get("/api/data-catalog/files", params={"access": "restricted", "page_size": 100})
    assert response.status_code == 200
    files = response.json()["files"]
    if not files:
        response = client.get("/api/data-catalog/files", params={"access": "metadata_only", "page_size": 100})
        files = response.json()["files"]
    assert files, "The project should contain at least one non-public catalog record"
    item = files[0]
    content = client.get(f"/api/data-catalog/files/{item['file_id']}/content")
    assert content.status_code in {403, 404}


def test_explorer_schema_and_query_cover_multiple_analytical_layers() -> None:
    response = client.get("/api/data-explorer/schema")
    assert response.status_code == 200
    schema = response.json()
    dataset_ids = {item["id"] for item in schema["datasets"]}
    assert "index_scores" in dataset_ids
    assert "component_values" in dataset_ids
    assert "source_observations" in dataset_ids
    assert "training_model_scores" in dataset_ids

    index_dataset = next(item for item in schema["datasets"] if item["id"] == "index_scores")
    query = client.get(
        "/api/data-explorer/query",
        params={
            "dataset": "index_scores",
            "measure": "score",
            "countries": "RUS,CHN,USA",
            "limit": 500,
        },
    )
    assert query.status_code == 200
    payload = query.json()
    assert payload["dataset"] == "index_scores"
    assert payload["summary"]["returned_rows"] > 0
    assert set(row["iso3"] for row in payload["rows"]) <= {"RUS", "CHN", "USA"}
    assert index_dataset["row_count"] >= payload["summary"]["total_rows"]


def test_explorer_csv_and_machine_readable_metadata() -> None:
    export = client.get(
        "/api/data-explorer/export.csv",
        params={"dataset": "index_scores", "measure": "score", "countries": "RUS"},
    )
    assert export.status_code == 200
    assert export.headers["content-type"].startswith("text/csv")
    assert "value_id" in export.text.splitlines()[0]

    metadata = client.get("/api/data-explorer/datasets/index_scores/metadata.json")
    assert metadata.status_code == 200
    assert metadata.json()["tableSchema"]["columns"]

    dcat = client.get("/api/data-catalog/dcat.jsonld")
    assert dcat.status_code == 200
    assert dcat.json()["@type"] == "dcat:Catalog"

    manifest = client.get("/api/data-catalog/manifest.csv")
    assert manifest.status_code == 200
    assert "sha256" in manifest.text.splitlines()[0]


def test_base_database_is_not_modified_by_catalog_requests() -> None:
    database = ROOT / "data/global_index_platform.sqlite"
    before = database.stat().st_mtime_ns
    client.get("/api/data-catalog/summary")
    client.get("/api/data-explorer/query", params={"dataset": "index_scores", "measure": "score", "limit": 10})
    after = database.stat().st_mtime_ns
    assert before == after
