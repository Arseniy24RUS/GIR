#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from giip.db import connect
from giip.config import DB_PATH
from giip.release_readiness import release_readiness_payload
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

parser = argparse.ArgumentParser()
parser.add_argument('--strict', action='store_true')
args = parser.parse_args()
with connect(DB_PATH) as conn:
    payload = release_readiness_payload(conn)
print(json.dumps(payload, ensure_ascii=False, indent=2))
if args.strict and not payload.get('release_ready'):
    sys.exit(1)
