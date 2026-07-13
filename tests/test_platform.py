from __future__ import annotations
import json
from pathlib import Path
from fastapi.testclient import TestClient
from giip.api import app
from giip.db import connect, migrate_schema
from giip.scientific_release import apply_scientific_release
from giip.final_release_v6 import apply_offline_finalization

ROOT = Path(__file__).resolve().parents[1]




_CLIENT = TestClient(app)

def client() -> TestClient:
    return _CLIENT


def teardown_module(module) -> None:
    _CLIENT.close()


def test_health_and_inventory():
    data = client().get('/api/health').json()
    assert data['status'] == 'ok'
    assert data['indices'] == 7
    assert data['countries'] >= 200
    assert data['raw_snapshots'] >= 100
    assert data['default_year'] == 2026


def test_htei_v5_modes_and_no_asof_rank():
    c = client()
    core = c.get('/api/htei/v5/ranking?mode=comparable_core&limit=250').json()
    ext = c.get('/api/htei/v5/ranking?mode=comparable_extended&limit=250').json()
    asof = c.get('/api/htei/v5/profile/RUS?mode=asof_diagnostic').json()
    assert core['total'] >= 30
    assert ext['total'] >= core['total']
    assert asof['available'] is True
    assert asof['profile']['mode'] == 'asof_diagnostic'
    assert asof['profile']['rank'] is None
    assert asof['profile']['eligible_for_ranking'] == 0


def test_htei_v5_score_is_substantive_not_quality_multiplied():
    with connect() as conn:
        profiles = conn.execute("select profile_id,substantive_score,confidence_score from htei_v5_profiles where mode='comparable_core' limit 30").fetchall()
        assert profiles
        for p in profiles:
            total = conn.execute('select sum(weighted_contribution) s from htei_v5_component_values where profile_id=?',(p['profile_id'],)).fetchone()['s']
            assert abs(float(p['substantive_score']) - float(total)) < 1e-5
            assert 0 <= p['substantive_score'] <= 100
            assert 0 <= p['confidence_score'] <= 1


def test_htei_country_profile_has_explicit_proxy_and_year_metadata():
    data = client().get('/api/htei/v5/profile/RUS?mode=comparable_extended').json()
    assert data['available']
    assert len(data['components']) == 6
    assert data['profile']['available_weight'] >= .70
    assert data['profile']['source_group_count'] >= 3
    assert all(c['source_data_year'] <= 2026 for c in data['components'])
    assert all(c['proxy_status'] for c in data['components'])
    assert all(c['methodological_tier'] for c in data['components'])


def test_htei_formula_and_sensitivity_contract():
    data = client().get('/api/index/HTEI?country=RUS&year=2026').json()
    assert data['formula']['formula_version'] == 'htei-v6-common-support-2026'
    assert data['index']['score_status'] == 'project_composite_index'
    assert data['methodology']['formula_status'] == 'approved_research_weights_v6'
    audit = data['scientific_audit']
    assert audit['run_count'] >= 200
    assert audit['sensitivity_passed'] == 1
    assert audit['min_spearman'] >= .85


def test_methodology_registry_distinguishes_official_and_project_values():
    rows = client().get('/api/methodology/registry').json()
    by_code = {r['index_code']: r for r in rows}
    assert {'HDI','HCI','GTCI','GII','IDI','QS_ET','HTEI'} <= set(by_code)
    if 'HCI_PLUS' in by_code:
        assert by_code['HCI_PLUS']['score_status'] in {'official_hci_plus_2026','official_hci_plus_2026_pending'}
    assert by_code['HTEI']['score_status'] == 'project_composite_index'
    assert by_code['QS_ET']['score_status'] == 'derived_country_aggregation'
    assert 'historical' in by_code['HCI']['score_status']
    assert by_code['HDI']['formula_status'] == 'official_formula_not_recomputed_by_platform'


def test_acceptance_contains_exactly_four_original_tor_pairs():
    data = client().get('/api/acceptance/tz?lang=ru').json()
    assert data['summary']['items_total'] == 4
    assert [(i['id'], i['result_id']) for i in data['items']] == [
        ('2.1','3.1.2'),('2.2','3.2.1'),('2.3','3.3.1'),('2.4','3.4.1')
    ]
    text = json.dumps(data, ensure_ascii=False)
    assert '8/8' not in text
    assert 'Создание интегрированной базы данных по трудовым ресурсам в высокотехнологичных отраслях' in text
    assert 'Формирование системы индикаторов для мониторинга развития технологических кадров' in text
    assert 'Разработка модели оценки конкурентоспособности национальных систем подготовки кадров' in text
    assert 'Подготовка практических рекомендаций по формированию трудовых ресурсов' in text


def test_national_and_corporate_layers_are_not_falsely_counted_when_empty():
    data = client().get('/api/acceptance/tz?lang=ru').json()
    item = next(i for i in data['items'] if i['id']=='2.1')
    with connect() as conn:
        national = conn.execute('select count(*) n from national_statistics_metrics').fetchone()['n']
        corporate = conn.execute('select count(*) n from corporate_metrics').fetchone()['n']
    if national < 20 or corporate < 20:
        assert item['status'] != 'closed_numeric'


def test_gtci_components_and_qs_transparency():
    c = client()
    gtci = c.get('/api/index/GTCI?country=RUS&year=2026').json()
    assert len(gtci['country_diagnostics']['components']) == 6
    assert gtci['index']['score_status'] == 'official_score'
    qs = c.get('/api/qs/RUS?year=2026&lang=ru').json()
    assert qs['institutions']
    assert qs['summary']['top500_count'] >= qs['summary']['top250_count'] >= qs['summary']['top100_count']
    assert qs['summary']['institution_contributions']


def test_training_model_has_four_tor_blocks_and_audit():
    data = client().get('/api/training-competitiveness?country=RUS&year=2026').json()
    block_names = {b['code'] for b in data['blocks']}
    assert {'institutional_environment','educational_infrastructure','corporate_strategies','international_cooperation'} <= block_names
    with connect() as conn:
        audit = conn.execute("select * from methodology_audit_runs where model_code='TRAINING_MODEL_V2' order by release_year desc limit 1").fetchone()
    assert audit['run_count'] >= 200
    assert audit['sensitivity_passed'] == 1


def test_russia_policy_brief_is_structured_and_substantive():
    data = client().get('/api/policy/russia').json()
    assert len(data['items']) >= 8
    required = {'problem_ru','indicator_ru','current_value','source_data_year','source_id','benchmark_ru','measure_ru','actor_ru','horizon','target_kpi_ru','expected_effect_ru','risk_ru','resources_ru','monitoring_ru','relation_to_tz'}
    for item in data['items']:
        assert required <= set(item)
        assert all(str(item[k]).strip() for k in required if k not in {'current_value'})


def test_paginated_ranking_api_and_filters():
    c = client()
    page1 = c.get('/api/htei/v5/ranking?mode=comparable_core&limit=10&offset=0').json()
    page2 = c.get('/api/htei/v5/ranking?mode=comparable_core&limit=10&offset=10').json()
    assert len(page1['ranking']) == 10
    assert len(page2['ranking']) == 10
    assert page1['ranking'][0]['iso3'] != page2['ranking'][0]['iso3']
    filtered = c.get('/api/htei/v5/ranking?mode=comparable_core&limit=20&region=Europe').json()
    assert all(r['region'].lower() == 'europe' for r in filtered['ranking'])


def test_country_metadata_matrix_and_clickable_design_assets_exist():
    c = client()
    countries = c.get('/api/countries').json()
    assert any(x['region']=='Europe' for x in countries)
    matrix = c.get('/api/cross-matrix?year=2026&income_group=High%20income&topN=10&sort_index=HTEI&sort_metric=rank&sort_dir=asc').json()
    assert matrix['countries']
    assert all(x['income_group']=='High income' for x in matrix['countries'])
    html = c.get('/').text
    js = (ROOT/'giip/static/app.js').read_text(encoding='utf-8')
    assert 'GIR — Глобальный рейтинг индексов' in html
    assert 'map-country' in js and 'selectMapCountry' in js
    assert 'hteiMode' in js and 'rankingPageSize' in js


def test_v5_provenance_contains_checksum_for_component_and_profile():
    c=client()
    p=c.get('/api/htei/v5/profile/RUS?mode=comparable_extended').json()
    component=c.get('/api/provenance/value/'+p['components'][0]['value_id']).json()
    profile=c.get('/api/provenance/value/'+p['profile']['profile_id']).json()
    assert component['raw_snapshot_sha256']
    assert profile['raw_snapshot_sha256']
    assert profile['is_official'] is False


def test_app_data_contains_scientific_registry_and_audits():
    data=client().get('/api/app-data?country=RUS&year=2026').json()
    assert len(data['methodology_registry']) >= 7
    assert data['scientific_audit']['htei']['sensitivity_passed'] == 1
    assert data['scientific_audit']['training_model']['sensitivity_passed'] == 1
    assert len(data['policy_brief']['items']) >= 8


def test_scientific_release_alias_endpoints_are_stable():
    c = client()
    assert c.get('/api/htei/v5?iso3=RUS&mode=asof_diagnostic').status_code == 200
    assert c.get('/api/htei/v5/validation').status_code == 200
    methods = c.get('/api/index-methodology').json()
    assert len(methods) >= 7
    assert any(m['index_code']=='HCI_PLUS' for m in methods)
    htei = c.get('/api/index-methodology/HTEI').json()
    assert htei['score_status'] == 'project_composite_index'
    policy = c.get('/api/policy-brief/RUS').json()
    assert len(policy['items']) >= 8
    assert c.get('/api/governance/licenses').status_code == 200
    assert c.get('/api/governance/external-reviews').status_code == 200


def test_unranked_asof_country_command_center_does_not_crash() -> None:
    """Countries outside Comparable Core must fall back to an unranked ASOF profile."""
    with TestClient(app) as client:
        response = client.get('/api/country/AFG/command-center?year=2026')
        assert response.status_code == 200
        payload = response.json()
        htei = next(item for item in payload['indices'] if item['index_code'] == 'HTEI')
        assert htei['available'] is True
        assert htei['rank'] is None
        assert payload['htei_scientific_profile']['profile']['rank'] is None


def test_app_data_handles_country_missing_from_some_external_indices() -> None:
    """A missing QS/GTCI country score must not break the entire application bootstrap."""
    with TestClient(app) as client:
        response = client.get('/api/app-data?country=AFG')
        assert response.status_code == 200
        payload = response.json()
        assert payload['country']['country']['iso3'] == 'AFG'
        assert payload['index_payloads']['HTEI']['scientific_profile']['profile']['iso3'] == 'AFG'
        assert payload['index_payloads']['QS_ET']['country_diagnostics']['score'] is None


def test_htei_v6_common_support_and_unranked_asof_contract():
    c=client()
    common=c.get('/api/htei/v6/ranking?mode=common_support&limit=250').json()
    direct=c.get('/api/htei/v6/ranking?mode=direct_core&limit=250').json()
    asof=c.get('/api/htei/v6/profile/AFG?mode=asof_diagnostic').json()
    assert common['total'] >= 75
    assert direct['total'] >= 25
    assert asof['available'] is True
    assert asof['profile']['rank'] is None
    assert asof['profile']['eligible_for_ranking'] == 0
    with connect() as conn:
        signatures=conn.execute("select count(distinct component_signature) n from htei_v6_profiles where mode='common_support'").fetchone()['n']
    assert signatures == 1


def test_htei_v6_score_reconciles_and_quality_is_separate():
    with connect() as conn:
        profiles=conn.execute("select profile_id,substantive_score,confidence_score from htei_v6_profiles where mode='common_support' limit 50").fetchall()
        assert profiles
        for profile in profiles:
            total=conn.execute("select sum(weighted_contribution) s from htei_v6_component_values where profile_id=?",(profile['profile_id'],)).fetchone()['s']
            assert abs(float(profile['substantive_score'])-float(total)) < 1e-5
            assert 0 <= float(profile['confidence_score']) <= 1


def test_human_capital_combined_contract_preserves_methodology_break():
    payload=client().get('/api/human-capital/combined/RUS').json()
    assert payload['historical_hci']
    assert payload['methodology_break'] is True
    assert 'не является официальным пересчётом' in payload['warning_ru']
    if payload['hci_plus']:
        assert payload['hci_plus']['year'] == 2026
        assert any(p['edition']=='HCI_PLUS_2026' and p['marker']=='diamond' for p in payload['display_series'])


def test_reproducibility_artifacts_cover_every_snapshot():
    root=ROOT
    import hashlib
    with connect() as conn:
        snapshots=conn.execute('select snapshot_id from raw_snapshots').fetchall()
        for snapshot in snapshots:
            arts=conn.execute('select * from reproducibility_artifacts where snapshot_id=?',(snapshot['snapshot_id'],)).fetchall()
            assert arts
            kinds={a['artifact_type'] for a in arts}
            assert 'raw_included' in kinds or {'derived_export','download_recipe'} <= kinds
            for art in arts:
                path=root/str(art['artifact_path']).replace('\\','/')
                assert path.exists(), path
                assert hashlib.sha256(path.read_bytes()).hexdigest()==art['artifact_sha256']


def test_policy_brief_english_fields_are_actually_english():
    import re
    with connect() as conn:
        rows=conn.execute("select * from policy_brief_items where iso3='RUS'").fetchall()
    assert len(rows) >= 8
    fields=['title_en','problem_en','measure_en','actor_en','target_kpi_en','expected_effect_en','risk_en','resources_en','monitoring_en']
    for item in rows:
        for field in fields:
            assert item[field]
            assert not re.search(r'[А-Яа-яЁё]', item[field]), (field,item[field])


def test_hci_plus_is_current_primary_module_even_before_online_ingestion():
    c = client()
    health = c.get('/api/health').json()
    assert health['indices_current'] == 7
    indices = c.get('/api/indices').json()
    codes = [item['code'] for item in indices]
    assert codes == ['HDI', 'HCI_PLUS', 'GTCI', 'GII', 'IDI', 'QS_ET', 'HTEI']
    assert 'HCI' not in codes
    data = c.get('/api/app-data?country=RUS&year=2026').json()
    assert 'HCI_PLUS' in data['index_payloads']
    cards = {item['index_code']: item for item in data['country']['indices']}
    assert 'HCI_PLUS' in cards and 'HCI' not in cards
    if not data['human_capital_combined']['hci_plus']:
        assert cards['HCI_PLUS']['available'] is False
        assert cards['HCI_PLUS']['pending_official_ingestion'] is True


def test_cross_matrix_uses_hci_plus_as_current_column_not_historical_hci():
    payload = client().get('/api/cross-matrix?year=2026&topN=5').json()
    codes = [item['code'] for item in payload['indices']]
    assert codes == ['HDI', 'HCI_PLUS', 'GTCI', 'GII', 'IDI', 'QS_ET', 'HTEI']
    assert payload['countries']
    assert all('HCI_PLUS' in item['indices'] and 'HCI' not in item['indices'] for item in payload['countries'])


def test_htei_v6_sensitivity_audits_the_actual_common_support_formula():
    with connect() as conn:
        audit = conn.execute(
            "SELECT * FROM methodology_audit_runs WHERE model_code='HTEI_V6' AND release_year=2026"
        ).fetchone()
        common = conn.execute(
            "SELECT COUNT(*) n FROM htei_v6_profiles WHERE release_year=2026 AND mode='common_support'"
        ).fetchone()['n']
    assert audit is not None
    assert audit['countries'] == common
    assert audit['run_count'] >= 206
    assert audit['sensitivity_passed'] == 1
    assert audit['min_spearman'] >= 0.85
