from __future__ import annotations

import os
import shutil
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DB = ROOT / "data" / "global_index_platform.sqlite"
TEST_DIR = Path(tempfile.mkdtemp(prefix="gir-pytest-"))
TEST_DB = TEST_DIR / "global_index_platform.test.sqlite"

if not SOURCE_DB.exists():
    raise RuntimeError(f"Production database is missing: {SOURCE_DB}")

shutil.copy2(SOURCE_DB, TEST_DB)
os.environ["GIIP_DB"] = str(TEST_DB)

# Initialise the deterministic staging layer and the final v6 layer exactly once.
# Rebuilding them independently in every test module mutates shared reproducibility
# artifacts and can invalidate checksums while a single pytest session is running.
from giip.db import connect, migrate_schema
from giip.scientific_release import apply_scientific_release
from giip.final_release_v6 import apply_offline_finalization

with connect() as conn:
    migrate_schema(conn)
    apply_scientific_release(conn)
    conn.commit()
apply_offline_finalization()


def pytest_sessionfinish(session, exitstatus) -> None:
    shutil.rmtree(TEST_DIR, ignore_errors=True)
