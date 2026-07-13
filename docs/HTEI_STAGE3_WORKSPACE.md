# HTEI Stage 3 Research Workspace

## Purpose

This change turns the High-Tech Employment Index (HTEI) from a generic index page into a dedicated research workspace. It does **not** replace the HTEI v6 calculations already stored in the project database. It publishes those calculations in a form that a non-technical reviewer can understand and an expert can audit.

The workspace is built around six questions:

1. What is the selected country's result?
2. Which methodological mode is being used and why?
3. Which components form the score?
4. How fresh, complete and uncertain is the evidence?
5. How robust is the result across methodological modes?
6. Which source observation, snapshot and transformation produced each value?

## Public route

The existing HTEI navigation item continues to use the `index-HTEI` route:

```text
/?country=RUS&year=2026&lang=ru&theme=dark&htei_mode=proxy_extended#index-HTEI
```

The query string stores the selected country, release year, interface language, theme and requested HTEI mode. The route remains compatible with the existing application shell, country selector, map and sidebar.

## API contract

### Workspace

```http
GET /api/htei/workspace?iso3=RUS&year=2026&mode=proxy_extended
```

The response contains:

- `mode_catalog`: the four methodological modes and country eligibility;
- `profile`: score, rank, percentile, uncertainty, coverage and freshness;
- `components`: raw values, normalised scores, weights, contributions and source metadata;
- `ranking`: the international universe belonging to the effective mode;
- `summary`: score reconciliation, strongest component and priority gap;
- `distribution`: quartiles and mean for the selected mode;
- `comparisons`: direct/common modes compared with the extended ranking on shared countries only;
- `sources`: source organisations used in the selected profile;
- `formula`: weights, expression and methodological notes;
- `audit`: statistical sensitivity results already stored in the project;
- `policies`: evidence-linked recommendations for Russia.

The payload is intentionally compact. It avoids repeating full provenance objects for every row; detailed provenance is loaded only when the user requests it.

### Ranked CSV export

```http
GET /api/htei/workspace.csv?mode=proxy_extended
```

CSV export is available only for ranked modes:

- `direct_core`;
- `common_support`;
- `proxy_extended`.

`asof_diagnostic` returns HTTP 422 because an ASOF profile is explicitly unranked.

### Provenance

The existing endpoint now resolves HTEI v6 identifiers:

```http
GET /api/provenance/value/HTEI_V6:proxy_extended:2026:RUS
GET /api/provenance/value/HTEI_V6:proxy_extended:2026:RUS:RND_PERSONNEL
```

A profile record exposes the final HTEI v6 snapshot, formula version, mode, coverage, source groups and all component value IDs. A component record exposes the source organisation, official URL, source year, raw value, unit, normalised score, weight, contribution, snapshot path, SHA-256 and selection rule.

## Methodological modes

### Strict direct-data layer (`direct_core`)

The narrowest robustness layer. Its labour inputs come from direct high-tech/HRST or national-statistics series. Conceptual proxy labels remain visible at component level: a direct source series does not make a broad occupational construct identical to a narrow list of high-tech occupations.

### Primary international ranking (`common_support`)

A fixed four-component signature for all eligible countries. It is the strictest common-support comparison universe.

### Extended international ranking (`proxy_extended`)

The fullest approved profile where the minimum component and weight requirements are met. Proxy status, quality and freshness are disclosed separately from the substantive score.

### Latest-data diagnostic profile (`asof_diagnostic`)

Uses latest available official observations that may refer to different source years. It is a diagnostic coverage layer and never receives an international rank.

## Fallback behaviour

The API never silently presents an unavailable requested mode as if it had been selected. It returns both:

- `requested_mode`;
- `effective_mode`;
- a bilingual `fallback` explanation.

Unavailable mode cards remain visible in the interface. Activating one shows the reason for ineligibility without changing the current result. This makes the scientific architecture visible while preventing a misleading zero or empty ranking.

## Score anatomy

For each selected profile, the workspace publishes:

```text
HTEI = Σ(normalised component score × effective component weight)
```

The API reports `contribution_sum` and `score_reconciliation_error`. The automated test requires the sum of contributions to reproduce the published substantive score within `1e-5`.

Data confidence, freshness and coverage are **not** hidden penalties. They are shown as separate evidence-quality attributes.

## Component benchmarking

Each component includes a benchmark computed within the selected mode:

- competition rank, with equal scores receiving the same place;
- number of countries with the component;
- percentile;
- median;
- upper quartile;
- mean of the top ten values;
- five leading countries.

The benchmark universe is kept separate for every component because coverage differs between source indicators.

## Cross-mode comparison

Two comparisons are published:

1. `direct_core` ↔ `proxy_extended`;
2. `common_support` ↔ `proxy_extended`.

Only countries that are ranked in both compared modes are included. The API calculates:

- Pearson correlation of scores;
- Spearman correlation of scores;
- Spearman correlation of ranks;
- mean and maximum absolute score difference;
- mean and maximum absolute rank difference.

These diagnostics do not create an alternative official ranking. They show how much the result changes when the methodological universe is expanded.

## Frontend architecture

The implementation intentionally separates the HTEI workspace from the legacy generic index renderer:

- `giip/static/htei-workspace.js` owns HTEI-specific layout and interactions;
- `giip/static/htei-workspace.css` owns scoped HTEI visual rules;
- `giip/static/app.js` remains responsible for the shared shell, route state, map, country context and provenance drawer;
- `giip/htei_workspace.py` builds the compact scientific API contract.

The HTEI page contains:

1. result-first hero;
2. sticky section navigation;
3. methodological mode catalog;
4. weighted contribution and component diagnostics;
5. uncertainty, freshness and distribution;
6. cross-mode scatterplots;
7. lineage, formula, audit and source register;
8. map, searchable ranking and CSV export;
9. evidence-linked actions for Russia.

## Accessibility

The stage includes:

- one page-level `h1`;
- semantic sections and headings;
- focusable mode and comparison controls;
- keyboard-accessible provenance buttons;
- focus movement into the drawer;
- focus trapping while the drawer is open;
- Escape-to-close;
- focus restoration to the originating control;
- accessible map/ranking controls inherited from the application shell;
- document-level horizontal-overflow checks at 390 px.

## Tests

### Python contract tests

```bash
python -m pytest -q tests/test_htei_stage3_workspace.py
```

The tests verify mode eligibility and fallback, contribution reconciliation, ASOF rank suppression, direct-mode availability, cross-mode metrics, HTEI v6 provenance, CSV export, payload size and frontend asset integration.

### Browser tests

```bash
cd playwright
GIIP_BASE_URL=http://127.0.0.1:8011 \
GIIP_SKIP_WEBSERVER=1 \
GIIP_PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium \
GIIP_DISABLE_VIDEO=1 \
npx playwright test tests/htei-workspace.spec.ts
```

The browser specification verifies the result page, unavailable-mode explanation, provenance keyboard flow, ASOF behaviour and mobile result-first ordering.

## Release-readiness note

Changing `api.py`, `app.js`, `index.html` and other release-bound files correctly invalidates the previous Playwright evidence manifest. The immutable final-release evidence must be regenerated only after all planned product stages have been completed. The Stage 3 patch does not weaken that gate or rewrite its hashes.
