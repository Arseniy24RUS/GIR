# Data Source Automation Plan

## Current connector strategy

| Module | Release strategy | Status |
|---|---|---|
| HDI | UNDP official HDR time-series CSV download with component extraction | Implemented |
| HCI | World Bank Human Capital source archive; UI explicitly labels the current loaded edition as historical HCI 2020 | Implemented; HCI+ 2026 remains an online upgrade task |
| GTCI | Portulans / INSEAD official report ingestion | Implemented |
| GII | WIPO official GII database XLSX snapshots | Implemented |
| IDI | ITU official IDI workbook ingestion | Implemented |
| QS Engineering & Technology | Official TopUniversities endpoint snapshots for 2023–2026; checksum-verified official export importer retained as fallback | Implemented |
| HTEI official-input layer | ILOSTAT, OECD, Eurostat, UNESCO UIS and World Bank observations archived as source candidates | Implemented |
| HTEI final release v6 | Freshness-aware source selection, comparable core/extended universes, non-ranked ASOF diagnostic profiles, explicit proxy status and statistical sensitivity audit | Implemented |
| National statistics numeric layer | Configurable official-host connector; requires online ingestion from at least four national statistical offices | Connector implemented; release blocker until populated |
| Corporate reporting numeric layer | SEC EDGAR Company Facts connector | Connector implemented; release blocker until populated |
| Training-system competitiveness model | Separate four-block analytical model covering institutional environment, educational infrastructure, corporate strategies and international cooperation | Implemented; external expert validation remains a release blocker |

## Versioning note

Several ingestion transform identifiers contain `htei_v3` because they describe the historical raw-to-observation normalization layer. They are retained for provenance stability. The published project index is **HTEI final release v6** (`htei-v6-common-support-2026`) and is computed from those archived official observations by `build_htei_v6`.

## Connector rules

1. Raw source material is archived before transformation.
2. Every normalized value stores source URL, retrieval time, snapshot path, SHA-256, transformation run, formula version and quality flag.
3. Failed refreshes fail visibly and do not write country values.
4. Sources without a stable public API use official-file import with checksum verification.
5. Source licence/terms metadata is recorded in `source_registry` and reviewed in `license_registry`.
6. HTEI source candidates remain in `source_observations`; v5 selections are deterministic, freshness-aware and provenance-backed.
7. No missing country score is filled by imputation, placeholders or generated values.
8. National statistics and corporate reporting are not counted as numeric ToR evidence until actual numeric rows pass minimum coverage gates.
9. HTEI ASOF diagnostic profiles never receive a synchronous international rank.
10. Data confidence is published separately and never multiplies the substantive HTEI score.
