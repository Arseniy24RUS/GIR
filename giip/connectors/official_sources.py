from __future__ import annotations

from pathlib import Path

from .base import RefreshResult
from ..config import DATA_DIR
from ..production_data import SOURCE_DEFS


class ProductionBuilderConnector:
    def __init__(self, source_code: str):
        self.source_code = source_code

    def refresh(self, target_dir: Path) -> RefreshResult:
        source_dir = DATA_DIR / "raw" / self.source_code
        latest = sorted(source_dir.glob("*/*")) if source_dir.exists() else []
        return RefreshResult(
            source_code=self.source_code,
            status="implemented_via_production_builder",
            snapshot_path=str(latest[-1]) if latest else None,
            rows_loaded=0,
            message="Use python -m giip.production_data to archive official snapshots and rebuild normalized tables.",
        )


class QSOfficialFileConnector:
    source_code = "QS_ET"

    def refresh(self, target_dir: Path) -> RefreshResult:
        return RefreshResult(
            source_code=self.source_code,
            status="official_file_required",
            rows_loaded=0,
            message="Use scripts/import_qs_official_export.py with a checksum-verified official QS Engineering & Technology export.",
        )


CONNECTORS = {
    source_id: (QSOfficialFileConnector() if source_id == "QS_ET" else ProductionBuilderConnector(source_id))
    for source_id in SOURCE_DEFS
}
