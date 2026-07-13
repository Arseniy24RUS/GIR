from pathlib import Path
from giip.db import connect, migrate_schema
from giip.scientific_release import apply_scientific_release
from giip.final_release_v6 import apply_offline_finalization
from giip.release_readiness import release_readiness_payload




def test_scientific_automated_gates_pass():
    with connect() as conn:
        p=release_readiness_payload(conn)
    codes={b['code'] for b in p['blockers']}
    assert 'HTEI_COMPARABLE_CORE_TOO_SMALL' not in codes
    assert 'HTEI_ASOF_COVERAGE_BELOW_200' not in codes
    assert 'HTEI_ASOF_HAS_RANKS' not in codes
    assert 'HTEI_SCORE_RECONCILIATION_FAILED' not in codes
    assert 'HTEI_SENSITIVITY_NOT_PASSED' not in codes
    assert 'TRAINING_MODEL_SENSITIVITY_NOT_PASSED' not in codes
    with connect() as conn:
        hci_plus_rows=conn.execute("select count(*) n from hci_plus_country_scores").fetchone()['n']
    if hci_plus_rows >= 150:
        assert 'INDEX_METHODOLOGY_REGISTRY_INCOMPLETE' not in codes
    else:
        assert 'HCI_PLUS_2026_INCOMPLETE' in codes
    assert 'HCI_EDITION_NOT_DISCLOSED' not in codes
    assert 'RUSSIA_POLICY_BRIEF_INCOMPLETE' not in codes


def test_final_release_is_not_fabricated_without_online_numeric_and_browser_evidence():
    with connect() as conn:
        p=release_readiness_payload(conn)
    codes={b['code'] for b in p['blockers']}
    allowed_online={
        'ORIGINAL_TOR_RESULTS_NOT_FULLY_CLOSED',
        'NATIONAL_STATISTICS_NUMERIC_LAYER_INCOMPLETE',
        'CORPORATE_REPORTING_NUMERIC_LAYER_INCOMPLETE',
        'HCI_PLUS_2026_INCOMPLETE',
        'INDEX_METHODOLOGY_REGISTRY_INCOMPLETE',
        'OPERATIONAL_REFRESH_EVIDENCE_MISSING',
        'PLAYWRIGHT_EVIDENCE_INVALID',
    }
    # No blockers for renewed weight approval, independent external reviews or external legal sign-off are permitted.
    assert 'EXTERNAL_METHOD_REVIEWS_MISSING' not in codes
    assert 'HTEI_WEIGHT_JUSTIFICATION_MISSING' not in codes
    assert 'LEGAL_SOURCE_REGISTER_INCOMPLETE' not in codes
    unexpected=codes-allowed_online
    assert not unexpected, unexpected
    if codes:
        assert p['release_ready'] is False
        assert p['readiness_level']=='final_release_candidate'
    else:
        assert p['release_ready'] is True
        assert p['readiness_level']=='customer_final_release'


def test_operations_hardening_files_exist():
    root=Path(__file__).resolve().parents[1]
    assert (root/'requirements.lock').exists()
    docker=(root/'Dockerfile').read_text(encoding='utf-8')
    assert 'USER giip' in docker and 'HEALTHCHECK' in docker
    assert (root/'scripts/backup_restore.py').exists()
    assert (root/'scripts/run_scheduled_refresh.py').exists()
