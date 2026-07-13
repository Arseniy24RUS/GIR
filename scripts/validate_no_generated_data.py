#!/usr/bin/env python3
"""Reject synthetic release data without mistaking ordinary UI copy for data.

The historical validator used substring matching for words such as ``sample`` and
``placeholder``. That produced false positives for legitimate controls
(``placeholder=`` / ``::placeholder``) and statistical phrases such as
"common sample". The release gate now looks for data-bearing synthetic markers
and common generation constructs while preserving the strict database scan.
"""
from __future__ import annotations

import argparse
import os
import re
import sqlite3
import sys
from pathlib import Path

DB_FORBIDDEN = [
    "placeholder", "todo", "tbd", "demo", "sample", "seed", "mock", "fake",
    "synthetic", "generated", "lorem", "заглушка", "демо-данные",
    "сгенерировано", "пример страны", "пример значения",
]

# Match evidence of synthetic *data*, not generic interface vocabulary.
UI_FORBIDDEN_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("lorem", re.compile(r"\blorem(?:\s+ipsum)?\b", re.I)),
    ("demo-data", re.compile(r"\bdemo(?:[_\-\s]*(?:data|dataset|value|record|country|row))\b", re.I)),
    ("sample-data", re.compile(r"\bsample(?:[_\-\s]*(?:data|dataset|value|record|country|row))\b", re.I)),
    ("placeholder-data", re.compile(r"\bplaceholder(?:[_\-\s]*(?:data|dataset|value|record|country|row))\b", re.I)),
    ("mock-data", re.compile(r"\bmock(?:[_\-\s]*(?:data|dataset|value|record|response|country|row))\b", re.I)),
    ("fake-data", re.compile(r"\bfake(?:[_\-\s]*(?:data|dataset|value|record|country|row))\b", re.I)),
    ("synthetic-data", re.compile(r"\bsynthetic(?:[_\-\s]*(?:data|dataset|value|record|country|row))\b", re.I)),
    ("generated-data", re.compile(r"\bgenerated(?:[_\-\s]*(?:data|dataset|value|record|country|row))\b", re.I)),
    ("seed-data", re.compile(r"\bseed(?:[_\-\s]*(?:data|dataset|value|record|country|row|snapshot))\b", re.I)),
    ("todo", re.compile(r"(?im)(?:^|[\s/*#;])TODO(?:\s*[:(]|\s*$)")),
    ("tbd", re.compile(r"(?im)(?:^|[\s/*#;])TBD(?:\s*[:(]|\s*$)")),
    ("stable-noise", re.compile(r"\bstable[_\-]?noise\b", re.I)),
    ("js-random", re.compile(r"\bMath\.random\s*\(", re.I)),
    ("ru-placeholder-data", re.compile(r"\b(?:заглушка|демо-данные|сгенерированные\s+данные|пример\s+(?:страны|значения))\b", re.I)),
)

PYTHON_GENERATION_MARKERS = (
    "stable_noise",
    "random.random",
    "seed_snapshot",
)


def scan_files(root: Path) -> list[tuple[str, str]]:
    bad: list[tuple[str, str]] = []
    files: list[Path] = []
    files.extend((root / "giip" / "static").glob("*.html"))
    files.extend((root / "giip" / "static").glob("*.js"))
    files.extend((root / "giip" / "static").glob("*.css"))
    files.extend((root / "giip").glob("*.py"))
    files.extend((root / "giip" / "connectors").glob("*.py"))
    for path in files:
        if not path.exists() or path.name == Path(__file__).name:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        if path.suffix.lower() in {".html", ".js", ".css"}:
            for label, pattern in UI_FORBIDDEN_PATTERNS:
                if pattern.search(text):
                    bad.append((str(path), label))
        elif path.suffix.lower() == ".py":
            lowered = text.lower()
            for marker in PYTHON_GENERATION_MARKERS:
                if marker.lower() in lowered:
                    bad.append((str(path), marker))
    return bad


def scan_db(db_path: Path) -> list[tuple[object, ...]]:
    if not db_path.exists():
        return []
    bad: list[tuple[object, ...]] = []
    conn = sqlite3.connect(db_path)
    try:
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
        for (table,) in cur.fetchall():
            try:
                cur.execute(f"PRAGMA table_info({table})")
                columns = [row[1] for row in cur.fetchall()]
                text_columns = [
                    column for column in columns
                    if any(token in column.lower() for token in (
                        "source_type", "quality_flag", "source_id", "source_code", "value_id"
                    ))
                ]
                for column in text_columns:
                    cur.execute(f"SELECT rowid, {column} FROM {table} WHERE {column} IS NOT NULL LIMIT 10000")
                    for rowid, value in cur.fetchall():
                        lowered = str(value).lower()
                        for term in DB_FORBIDDEN:
                            if term in lowered:
                                bad.append((table, column, rowid, term))
            except sqlite3.DatabaseError:
                continue
    finally:
        conn.close()
    return bad


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    parser.add_argument("--db", default=os.getenv("GIIP_DB", "data/global_index_platform.sqlite"))
    parser.add_argument("--strict", action="store_true")
    args = parser.parse_args()
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    root = Path(args.root)
    bad = scan_files(root)
    db_bad = scan_db(root / args.db)
    if bad or db_bad:
        print("Generated/placeholder data gate FAILED")
        for item in bad[:200]:
            print("FILE", item)
        for item in db_bad[:200]:
            print("DB", item)
        raise SystemExit(1)
    print("Generated/placeholder data gate passed")


if __name__ == "__main__":
    main()
