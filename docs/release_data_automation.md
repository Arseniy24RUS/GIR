# Production Data Automation

The baseline international data layer is built by `python -m giip.production_data`. The builder archives official source files under `data/raw/<source_id>/<release>/<retrieved_at>/`, writes SHA-256 metadata, rebuilds `data/global_index_platform.sqlite`, and records transformation runs for every displayed value.

The scientific release layer is then applied by:

```bash
python scripts/apply_scientific_release_patch.py
```

This migration adds HTEI final release v6, the four-block training-system model audit, the structured Russia policy brief, methodology classifications, licence governance and operational logs.

## Implemented connectors

| Source | Mode | Transform / output |
|---|---|---|
| UNDP HDR | Official CSV download | `undp_hdr_2025_csv_to_hdi` |
| World Bank HCI | Official World Bank API JSON archive | `world_bank_hci_api_to_scores` |
| Portulans GTCI | Official report ingestion | `portulans_gtci_2025_pdf_table_extract` |
| WIPO GII | Official XLSX database snapshots | `wipo_gii_xlsx_to_scores` |
| ITU IDI | Official XLSX workbook sheets | `itu_idi_workbook_to_scores` |
| QS Engineering & Technology | Official TopUniversities endpoint snapshots | `topuniversities_endpoint_to_qs_institution_rankings` |
| QS official export fallback | Checksum-verified official CSV/XLSX import | `qs_official_export_to_country_aggregation` |
| ILOSTAT HTEI inputs | Official ILOSTAT bulk CSV snapshots | historical provenance ID `ilostat_bulk_to_htei_v3_observations` |
| OECD HTEI inputs | Official OECD SDMX/CSV snapshots | historical provenance ID `oecd_sdmx_to_htei_v3_observations` |
| Eurostat HTEC inputs | Official Eurostat API JSON snapshots | historical provenance ID `eurostat_api_to_htei_v3_observations` |
| UIS HTEI inputs | Official UIS Data Browser/API snapshots | historical provenance ID `uis_indicator_to_htei_v3_observations` |
| World Bank HTEI inputs | Official World Bank indicator API snapshots | historical provenance ID `world_bank_api_to_htei_v3_observations` |
| HTEI scientific release | Deterministic freshness-aware selection, normalization, eligibility and sensitivity audit | `build_htei_v6`; formula `htei-v6-common-support-2026` |
| National statistics | Configurable official HTTPS CSV/JSON connector | `fetch_national_statistics_metrics.py` |
| Corporate reporting | SEC EDGAR Company Facts | `fetch_sec_corporate_metrics.py` |

The retained `htei_v3` strings are immutable identifiers of earlier ingestion transforms and must not be confused with the current published HTEI methodology.

## HTEI publication modes

```text
Comparable Core:
  ≥4 components; ≥70% weight; ≥3 source groups;
  mandatory labour component; each component lag ≤5 years; ranked.

Comparable Extended:
  same completeness/source rules; component-specific lag thresholds; ranked.

ASOF Diagnostic:
  broad last-available official profile; no rank or percentile.
```

Data confidence, coverage class, freshness class and uncertainty intervals are separate from the substantive score.

## QS workflow

The production builder stores official TopUniversities Engineering & Technology endpoint pages as raw JSON snapshots for 2023–2026, normalizes institution rows into `qs_institution_rankings`, and computes a transparent **project-derived country aggregation**. It is not an official QS country ranking.

The official-file importer remains available if a licensed official export is provided:

```powershell
python scripts/import_qs_official_export.py path/to/qs-engineering-technology.csv `
  --confirm-official-export `
  --expected-sha256 <official-file-sha256>
```

## Scheduled operations

Use `scripts/run_scheduled_refresh.py` or the provided systemd unit/timer in `deploy/systemd/`. Every run is written to `operational_runs`. Refresh failures must retain the prior valid snapshot and must not write inferred country values.

## Release gate

`customer_final_release` is possible only after:

- numeric national-statistics coverage reaches the configured minimum;
- numeric corporate-reporting coverage reaches the configured minimum;
- two independent methodology reviews are imported;
- the legal source register contains final decisions for every source;
- Python/API/Playwright and provenance gates pass.
