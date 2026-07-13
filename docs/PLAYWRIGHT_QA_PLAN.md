# Playwright QA plan

## Test groups

1. `smoke.spec.ts` — app loads, API health, major tabs.
2. `i18n.spec.ts` — RU/EN labels and no forbidden primary labels.
3. `theme.spec.ts` — light/dark/auto mode.
4. `country-profile.spec.ts` — country selector, flags, summary, trends, diagnostics.
5. `indices.spec.ts` — each index tab, formula, components, ranking, source drawer.
6. `provenance.spec.ts` — no number without source metadata.
7. `mobile.spec.ts` — iPhone, Android, tablet layouts.
8. `visual.spec.ts` — reference screenshots for critical pages.
9. `a11y.spec.ts` — basic accessibility and keyboard navigation.
10. `api-contract.spec.ts` — API schema and production data flags.

## Visual snapshots

Use Playwright `toHaveScreenshot()` with deterministic data and stable environment. Dynamic timestamps should be hidden by `playwright/utils/screenshot.css`.

## Failure policy

Any skipped test requires a justification in `docs/RELEASE_EVIDENCE.md`. Skipped visual/data-provenance/i18n tests block release.
