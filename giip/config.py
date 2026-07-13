import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
DB_PATH = Path(os.environ.get("GIIP_DB", DATA_DIR / "global_index_platform.sqlite")).resolve()
STATIC_DIR = Path(__file__).resolve().parent / "static"
SOURCE_REGISTRY = Path(__file__).resolve().parent / "data" / "source_registry.json"
DEFAULT_YEAR = 2026
YEARS = [2023, 2024, 2025, 2026]
