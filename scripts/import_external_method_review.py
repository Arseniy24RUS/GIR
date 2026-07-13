#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json, sys
from datetime import datetime, timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; sys.path.insert(0,str(ROOT))
from giip.db import connect, migrate_schema
ALLOWED={'approved','approved_with_conditions','rejected'}

def digest(path:Path)->str:
 h=hashlib.sha256(); h.update(path.read_bytes()); return h.hexdigest()

def main():
 ap=argparse.ArgumentParser(); ap.add_argument('metadata',type=Path); args=ap.parse_args()
 m=json.loads(args.metadata.read_text(encoding='utf-8'))
 required=['review_id','reviewer_name','affiliation','expertise','independence_statement','methodology_version','decision','review_date','document_path']
 missing=[k for k in required if not str(m.get(k,'')).strip()]
 if missing: raise SystemExit(f'Missing fields: {missing}')
 if m['decision'] not in ALLOWED: raise SystemExit(f"Invalid decision: {m['decision']}")
 if 'FULL LEGAL NAME' in m['reviewer_name'].upper() or 'EXAMPLE' in m['reviewer_name'].upper(): raise SystemExit('Template or synthetic reviewer name is forbidden.')
 doc=(ROOT/m['document_path']).resolve()
 if ROOT.resolve() not in doc.parents or not doc.exists(): raise SystemExit('Signed review document is missing or outside the project root.')
 sha=digest(doc); imported=datetime.now(timezone.utc).replace(microsecond=0).isoformat()
 with connect() as c:
  migrate_schema(c)
  duplicate=c.execute("select count(*) n from external_method_reviews where reviewer_name=? and affiliation=?",(m['reviewer_name'],m['affiliation'])).fetchone()['n']
  if duplicate: raise SystemExit('This reviewer/affiliation has already been imported; two independent reviews must be from different reviewers.')
  c.execute("""insert or replace into external_method_reviews(review_id,reviewer_name,affiliation,expertise,independence_statement,
   methodology_version,decision,review_date,document_path,document_sha256,conditions_json,imported_at) values(?,?,?,?,?,?,?,?,?,?,?,?)""",
   (m['review_id'],m['reviewer_name'],m['affiliation'],m['expertise'],m['independence_statement'],m['methodology_version'],m['decision'],m['review_date'],str(doc.relative_to(ROOT)),sha,json.dumps(m.get('conditions',[]),ensure_ascii=False),imported))
  c.commit()
 print(json.dumps({'status':'ok','review_id':m['review_id'],'document_sha256':sha},ensure_ascii=False,indent=2))
if __name__=='__main__': main()
