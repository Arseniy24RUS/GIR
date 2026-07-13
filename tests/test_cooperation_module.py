from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from giip.api import app


ROOT = Path(__file__).resolve().parents[1]
STATIC_DIR = ROOT / "giip" / "static"


@pytest.fixture(scope="module")
def api_client():
    with TestClient(app) as client:
        yield client


def test_personal_data_consent_route_serves_the_local_document(api_client: TestClient) -> None:
    response = api_client.get("/personal-data-consent")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/html")
    assert response.content == (STATIC_DIR / "personal-data-consent.html").read_bytes()
    assert 'data-page="personal-data-consent"' in response.text
    assert "project_office@inno.mgimo.ru" in response.text
    assert "/static/cooperation.css" in response.text
    assert "/static/cooperation.js" in response.text


def test_personal_data_consent_route_is_not_added_to_public_openapi(api_client: TestClient) -> None:
    response = api_client.get("/openapi.json")

    assert response.status_code == 200
    assert "/personal-data-consent" not in response.json()["paths"]


def test_cooperation_assets_are_served_from_the_static_mount(api_client: TestClient) -> None:
    javascript = api_client.get("/static/cooperation.js")
    stylesheet = api_client.get("/static/cooperation.css")

    assert javascript.status_code == 200
    assert javascript.headers["content-type"].startswith(("text/javascript", "application/javascript"))
    assert stylesheet.status_code == 200
    assert stylesheet.headers["content-type"].startswith("text/css")
    assert javascript.content == (STATIC_DIR / "cooperation.js").read_bytes()
    assert stylesheet.content == (STATIC_DIR / "cooperation.css").read_bytes()


def test_cooperation_module_exposes_the_integration_contract_and_formsubmit_flow() -> None:
    javascript = (STATIC_DIR / "cooperation.js").read_text(encoding="utf-8")

    assert "window.GIRCooperation = API" in javascript
    assert "Object.freeze({ init, updateLocale, open, bindTriggers })" in javascript
    assert 'endpoint: "https://formsubmit.co/ajax/project_office@inno.mgimo.ru"' in javascript
    assert 'email: "project_office@inno.mgimo.ru"' in javascript
    assert 'subject: "[GIR МГИМО] Новая заявка на сотрудничество"' in javascript
    assert 'project: "GIR — Global Index Ranker"' in javascript
    assert 'name="_honey"' in javascript
    assert 'name="consent"' in javascript
    assert 'href="/personal-data-consent"' in javascript
    assert "new FormData(form)" in javascript
    assert 'headers: { Accept: "application/json" }' in javascript
    assert "lastTrigger.focus()" in javascript
    assert 'mailto:${FORM.email}?subject=${encodeURIComponent(FORM.subject)}' in javascript
    assert "boundTriggers.has(trigger)" in javascript
    assert "ru:" in javascript and "en:" in javascript
