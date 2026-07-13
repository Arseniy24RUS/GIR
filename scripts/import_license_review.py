#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; sys.path.insert(0,str(ROOT))
from giip.db import connect, migrate_schema
ALLOWED_DECISIONS={'include','exclude_raw_keep_derived'}

def sha(path): h=hashlib.sha256(); h.update(path.read_bytes()); return h.hexdigest()

def main():
 ap=argparse.ArgumentParser(); ap.add_argument('metadata',type=Path); args=ap.parse_args(); m=json.loads(args.metadata.read_text(encoding='utf-8'))
 reviewer=str(m.get('reviewer_name','')).strip(); reviewed=str(m.get('reviewed_at','')).strip(); evidence=(ROOT/m.get('evidence_path','')).resolve()
 if not reviewer or 'FULL LEGAL NAME' in reviewer.upper(): raise SystemExit('A real authorised legal reviewer is required.')
 if not reviewed or not evidence.exists() or ROOT.resolve() not in evidence.parents: raise SystemExit('Signed legal evidence document is missing.')
 evidence_sha=sha(evidence); items=m.get('sources') or []
 with connect() as c:
  migrate_schema(c); registered={r['source_id'] for r in c.execute('select source_id from source_registry')}
  supplied={i.get('source_id') for i in items}
  unknown=supplied-registered
  if unknown: raise SystemExit(f'Unknown source IDs: {sorted(unknown)}')
  for i in items:
   if i.get('review_status')!='approved' or i.get('release_archive_decision') not in ALLOWED_DECISIONS: raise SystemExit(f"Unapproved decision for {i.get('source_id')}")
   if not str(i.get('terms_url','')).startswith('https://'): raise SystemExit(f"Official terms URL required for {i.get('source_id')}")
   c.execute("""insert or replace into license_registry(source_id,terms_url,terms_version_date,storage_allowed,transformation_allowed,
    redistribution_allowed,attribution_required,release_archive_decision,review_status,reviewer_name,reviewed_at,evidence_path,notes)
    values(?,?,?,?,?,?,?,?,?,?,?,?,?)""",(i['source_id'],i['terms_url'],i.get('terms_version_date'),int(bool(i.get('storage_allowed'))),int(bool(i.get('transformation_allowed'))),int(bool(i.get('redistribution_allowed'))),i.get('attribution_required',''),i['release_archive_decision'],'approved',reviewer,reviewed,str(evidence.relative_to(ROOT)),f"{i.get('notes','')} | evidence_sha256={evidence_sha}"))
  c.commit()
 print(json.dumps({'status':'ok','reviewed_sources':len(items),'evidence_sha256':evidence_sha},ensure_ascii=False,indent=2))
if __name__=='__main__': main()
