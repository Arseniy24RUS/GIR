#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json, tarfile
from datetime import datetime, timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
INCLUDE=['data/global_index_platform.sqlite','data/raw','configs','docs','outputs']

def sha(path:Path): h=hashlib.sha256(); h.update(path.read_bytes()); return h.hexdigest()

def backup(output:Path):
 output.parent.mkdir(parents=True,exist_ok=True)
 with tarfile.open(output,'w:gz') as tar:
  for rel in INCLUDE:
   p=ROOT/rel
   if p.exists(): tar.add(p,arcname=rel,recursive=True)
 manifest={'created_at':datetime.now(timezone.utc).replace(microsecond=0).isoformat(),'archive':str(output),'sha256':sha(output),'includes':INCLUDE}
 output.with_suffix(output.suffix+'.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps(manifest,ensure_ascii=False,indent=2))

def restore(archive:Path,yes:bool):
 if not yes: raise SystemExit('Restore is destructive. Re-run with --yes after verifying the archive and stopping the service.')
 with tarfile.open(archive,'r:gz') as tar:
  for member in tar.getmembers():
   target=(ROOT/member.name).resolve()
   if ROOT.resolve() not in target.parents and target!=ROOT.resolve(): raise SystemExit(f'Unsafe member: {member.name}')
  tar.extractall(ROOT)
 print(json.dumps({'status':'restored','archive':str(archive),'sha256':sha(archive)},ensure_ascii=False,indent=2))

def main():
 ap=argparse.ArgumentParser(); sp=ap.add_subparsers(dest='cmd',required=True)
 b=sp.add_parser('backup'); b.add_argument('--output',type=Path,default=ROOT/'backups'/'giip_backup.tar.gz')
 r=sp.add_parser('restore'); r.add_argument('archive',type=Path); r.add_argument('--yes',action='store_true')
 a=ap.parse_args(); backup(a.output) if a.cmd=='backup' else restore(a.archive,a.yes)
if __name__=='__main__': main()
