from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

@dataclass
class RefreshResult:
    source_code: str
    status: str
    snapshot_path: str | None = None
    rows_loaded: int = 0
    message: str = ''

class Connector(Protocol):
    source_code: str
    def refresh(self, target_dir: Path) -> RefreshResult: ...
