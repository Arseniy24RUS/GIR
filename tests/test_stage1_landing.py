from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from giip.api import app

ROOT = Path(__file__).resolve().parents[1]


def test_landing_summary_is_compact_and_matches_the_release_database() -> None:
    with TestClient(app) as client:
        response = client.get('/api/landing-summary?country=RUS')
    assert response.status_code == 200
    assert len(response.content) < 20_000

    payload = response.json()
    assert payload['release']['year'] == 2026
    assert payload['scale'] == {
        'countries': 225,
        'scored_countries': 219,
        'current_indices': 7,
        'year_min': 1990,
        'year_max': 2026,
        'index_scores': 10_076,
        'component_values': 36_945,
        'source_observations': 18_569,
        'analytical_records': 65_590,
        'raw_snapshots': 275,
        'pdf_snapshots': 159,
        'registered_sources': 21,
        'database_tables': 36,
        'policy_actions': 8,
    }

    htei = payload['htei']
    assert htei['mode'] == 'proxy_extended'
    assert round(htei['score'], 1) == 54.9
    assert (htei['rank'], htei['rank_total']) == (25, 105)
    assert htei['available_components'] == 6
    assert len(htei['components']) == 6
    assert htei['strongest_component']['component_code'] == 'HIGH_TECH_OCCUPATIONS'
    assert htei['weakest_component']['component_code'] == 'TECH_OUTPUTS'

    model = payload['training_model']
    assert round(model['score'], 1) == 42.0
    assert (model['rank'], model['rank_total']) == (87, 135)
    assert model['strongest_block']['block_code'] == 'educational_infrastructure'
    assert payload['policy']['count'] == 8


def test_landing_endpoint_rejects_unknown_country() -> None:
    with TestClient(app) as client:
        response = client.get('/api/landing-summary?country=ZZZ')
    assert response.status_code == 404


def test_public_landing_uses_research_routes_not_internal_delivery_metrics() -> None:
    landing = (ROOT / 'giip/static/landing.js').read_text(encoding='utf-8')
    app_js = (ROOT / 'giip/static/app.js').read_text(encoding='utf-8')
    html = (ROOT / 'giip/static/index.html').read_text(encoding='utf-8')

    assert 'Глобальная аналитика человеческого капитала и технологических кадров' in landing
    assert 'Пять способов начать исследование' in landing
    assert 'Масштаб доказательной базы' in landing
    assert 'Python-тест' not in landing
    assert 'Playwright-сценар' not in landing
    assert 'строк кода' not in landing
    assert "fetch(`/api/landing-summary" in app_js
    assert 'gir-u2-stage8-20260713-2' in html


def test_acceptance_route_remains_available_but_is_not_in_public_navigation() -> None:
    app_js = (ROOT / 'giip/static/app.js').read_text(encoding='utf-8')
    nav_section = app_js[app_js.index('function navGroups()'):app_js.index('function countryOptions()')]
    assert 'acceptance' not in nav_section
    assert 'function renderAcceptance()' in app_js
