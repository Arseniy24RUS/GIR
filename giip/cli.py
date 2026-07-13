from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

from .config import DB_PATH
from .db import connect, row
from .production_data import build_if_missing, build_production_database
from .scientific_release import apply_scientific_release
from .final_release_v6 import apply_offline_finalization


def main(argv=None):
    parser = argparse.ArgumentParser(prog='giip', description='Global Index Intelligence Platform CLI')
    sub = parser.add_subparsers(dest='cmd', required=True)
    sub.add_parser('init')
    sub.add_parser('validate')
    run = sub.add_parser('runserver')
    run.add_argument('--host', default='127.0.0.1')
    run.add_argument('--port', default='8000')
    args = parser.parse_args(argv)
    if args.cmd == 'init':
        build_production_database(reset=True)
        with connect() as conn:
            scientific = apply_scientific_release(conn)
        final_v6 = apply_offline_finalization(DB_PATH)
        print(json.dumps({'status':'ok','db':str(DB_PATH),'scientific_release':scientific,'final_v6':final_v6}, ensure_ascii=False, indent=2))
    elif args.cmd == 'validate':
        if not DB_PATH.exists():
            build_if_missing(DB_PATH)
        with connect() as conn:
            bad_sources = row(conn, 'SELECT COUNT(*) AS n FROM source_registry WHERE free_access!=1')['n']
            payload = {
                'status': 'ok' if bad_sources == 0 else 'error',
                'free_sources_only': bad_sources == 0,
                'countries': row(conn, 'SELECT COUNT(*) AS n FROM countries')['n'],
                'indices': row(conn, "SELECT COUNT(*) AS n FROM indices WHERE code!='HCI'")['n'],
                'indices_current': row(conn, "SELECT COUNT(*) AS n FROM indices WHERE code!='HCI'")['n'],
                'indices_total_including_historical_editions': row(conn, 'SELECT COUNT(*) AS n FROM indices')['n'],
                'has_htei': bool(row(conn, "SELECT 1 AS ok FROM indices WHERE code='HTEI' AND is_tz_index=1")),
                'has_hci_plus': bool(row(conn, "SELECT 1 AS ok FROM indices WHERE code='HCI_PLUS'")),
                'has_qs': bool(row(conn, "SELECT 1 AS ok FROM indices WHERE code='QS_ET'")),
                'scores': row(conn, 'SELECT COUNT(*) AS n FROM index_scores')['n'],
                'components': row(conn, 'SELECT COUNT(*) AS n FROM component_values')['n'],
                'raw_snapshots': row(conn, 'SELECT COUNT(*) AS n FROM raw_snapshots')['n'],
            }
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        if payload['status'] != 'ok':
            raise SystemExit(1)
    elif args.cmd == 'runserver':
        if not DB_PATH.exists():
            build_if_missing(DB_PATH)
        subprocess.call([sys.executable, '-m', 'uvicorn', 'giip.api:app', '--host', args.host, '--port', args.port])

if __name__ == '__main__':
    main()
