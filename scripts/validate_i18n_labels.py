#!/usr/bin/env python3
from __future__ import annotations

import pathlib
import re
import sqlite3
import sys

ROOT = pathlib.Path(".")
DB = ROOT / "data" / "global_index_platform.sqlite"
if not DB.exists():
    print("DB not found for i18n validation")
    raise SystemExit(1)

RU_REQUIRED = [
    "ИЧР",
    "Индекс человеческого капитала плюс",
    "Индекс глобальной конкурентоспособности талантов",
    "Глобальный инновационный индекс",
    "Индекс развития ИКТ",
    "QS: инженерия и технологии",
    "Индекс занятости в высокотехнологичных отраслях",
]
FORBIDDEN_PRIMARY_RU = {
    "HDI", "HCI", "GTCI", "GII", "IDI", "HTEI", "Human Development Index",
    "ICT Development Index", "High-Tech Employment Index", "Human Capital Index Plus",
}
CYRILLIC = re.compile(r"[А-Яа-яЁё]")

conn = sqlite3.connect(DB)
conn.row_factory = sqlite3.Row
ru_labels = [r["display_label"] for r in conn.execute("SELECT display_label FROM index_aliases WHERE lang='ru' AND is_primary=1")]
joined = "\n".join(ru_labels)
missing = [item for item in RU_REQUIRED if item not in joined]
if missing:
    print("Missing RU primary labels:", missing)
    raise SystemExit(1)
bad = [label for label in ru_labels if label in FORBIDDEN_PRIMARY_RU]
if bad:
    print("Forbidden RU primary labels:", bad)
    raise SystemExit(1)

# Historical HCI must remain secondary, while HCI+ is primary.
hci_primary = conn.execute("SELECT COUNT(*) n FROM index_aliases WHERE index_code='HCI' AND lang='ru' AND is_primary=1").fetchone()["n"]
hcip_primary = conn.execute("SELECT COUNT(*) n FROM index_aliases WHERE index_code='HCI_PLUS' AND lang='ru' AND is_primary=1").fetchone()["n"]
if hci_primary or not hcip_primary:
    print("HCI/HCI+ primary-label hierarchy is invalid:", {"historical_hci_primary": hci_primary, "hci_plus_primary": hcip_primary})
    raise SystemExit(1)

# English policy brief must be genuinely English, not merely non-empty.
english_fields = (
    "title_en", "problem_en", "measure_en", "actor_en", "target_kpi_en",
    "expected_effect_en", "risk_en", "resources_en", "monitoring_en",
)
for row in conn.execute("SELECT * FROM policy_brief_items WHERE iso3='RUS'"):
    for field in english_fields:
        value = str(row[field] or "").strip()
        if not value or CYRILLIC.search(value):
            print("Invalid English policy brief field:", row["item_id"], field, value[:120])
            raise SystemExit(1)

static_html = (ROOT / "giip" / "static" / "index.html").read_text(encoding="utf-8", errors="ignore")
static_js = (ROOT / "giip" / "static" / "app.js").read_text(encoding="utf-8", errors="ignore")
if re.search(r"HDI\s*[·|]\s*HCI|QS E&T\s*[·|]\s*HTEI", static_html):
    print("Static shell hard-codes index acronyms as primary labels")
    raise SystemExit(1)
if 'const INDEX_ORDER = ["HDI", "HCI",' in static_js:
    print("Frontend still uses historical HCI as a primary module")
    raise SystemExit(1)
if 'HCI_PLUS' not in static_js or 'humanCapitalCombinedChart' not in static_js:
    print("Frontend does not expose HCI+ as the primary module with the historical continuity chart")
    raise SystemExit(1)
print("i18n and semantic-language gate passed")
