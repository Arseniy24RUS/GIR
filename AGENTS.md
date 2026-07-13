# AGENTS.md — Global Index Intelligence Platform / MGIMO Release Mission

## Mission

Bring the platform to a fully release-ready state on real data. Do not stop at prototypes, seed snapshots, synthetic data, partial integrations, placeholders, or screenshots. The goal is a production-grade educational analytical platform for decision-makers that explains international indices, country positions, formulas, components, data sources, trends, bottlenecks, and recommendations.

## Non-negotiable rules

1. **No synthetic country data in release.** Any table, chart, map, rank, country score, component value, time series, source card, or diagnostic shown to users must come from a real source snapshot or from a reproducible computation based on real component data.
2. **No placeholders in release UI.** Forbidden strings: `placeholder`, `TODO`, `TBD`, `demo`, `sample`, `seed`, `mock`, `fake`, `lorem`, `generated`, `synthetic`, `example country`, `example score`, `заглушка`, `пример`, `демо-данные`, `сгенерировано`.
3. **If an API is hard, do not give up.** Search official documentation, inspect network responses, implement legal file-based ingestion if no stable API exists, cache raw snapshots, write tests, and document limitations. Do not replace missing data with generated values.
4. **Every number needs provenance.** A displayed score/component must expose: source name, source URL, retrieved_at, source release/version/year, raw snapshot path/hash, transformation step, formula version, and quality flag.
5. **RU interface must be fully Russian.** In Russian UI: not `HDI`, but `ИЧР`; not `GII`, but `Глобальный инновационный индекс`; not `IDI`, but `Индекс развития ИКТ`; not `QS E&T`, but `QS: инженерия и технологии`; not `HTEI`, but `Индекс занятости в высокотехнологичных отраслях`. Acronyms may appear only as small secondary aliases.
6. **EN interface must be fully English.** No Russian UI labels in English mode except organization names when official.
7. **Theme and locale must be automatic and manually switchable.** Respect `prefers-color-scheme` and browser locale; also provide explicit toggles.
8. **Real PlaywrightQA is mandatory.** Desktop, tablet, mobile, RU/EN, light/dark, visual snapshots, data-provenance tests, accessibility tests, and API contract tests must pass.
9. **Codex must use subagents for long work.** Delegate data connectors, methodology, frontend, QA, i18n, security, and documentation to specialized subagents. Return distilled summaries; avoid polluting the main thread.
10. **Do not break the premium UI.** Preserve the current expensive dark/light visual language, flags, map, advanced charts, cards, animation quality, and responsive behavior unless a change improves them measurably.

## Release gate

The release is acceptable only when all of the following pass locally and in CI:

```bash
python -m pytest -q
python scripts/validate_no_generated_data.py --strict
python scripts/validate_i18n_labels.py --strict
python scripts/validate_source_provenance.py --strict
python scripts/validate_index_formulas.py --strict
bash scripts/playwright_install.sh
cd playwright && npm ci && npx playwright test
bash scripts/release_gate.sh
```

## Review guidelines

Codex review must treat the following as P0/P1 issues:

- any generated/fake country data in production;
- missing source provenance for any displayed number;
- Russian UI containing English primary index labels;
- English UI containing Russian labels;
- broken mobile layout;
- light/dark theme mismatch or unreadable contrast;
- components shown without formulas or source links;
- inaccessible charts without textual explanations;
- failures masked by skipped tests;
- disabling Playwright visual tests to pass CI.

## Final-v6 scientific invariants

- Current human-capital module is `HCI_PLUS`; historical `HCI` is secondary chart context only.
- HCI and HCI+ are different official editions. Never draw a continuous official series across the methodology break.
- HTEI public modes are `direct_core`, `common_support`, `proxy_extended`, and `asof_diagnostic`.
- `common_support` is the primary comparable ranking and must have exactly one component signature.
- `asof_diagnostic` never receives a rank.
- HTEI confidence, coverage and freshness are separate from the substantive score and must never modify the rank.
- HTEI weights are fixed by the approved research report; do not reopen weight approval or add external-review blockers.
- The original MGIMO ToR has exactly four result pairs: 2.1→3.1.2, 2.2→3.2.1, 2.3→3.3.1, 2.4→3.4.1.
- National-statistics and corporate-reporting evidence registers do not close ToR 2.1 until real numeric rows meet the release thresholds.
- Do not declare `customer_final_release` until official HCI+, national-statistics, corporate-reporting and fresh Playwright-v6 evidence all pass the strict gate.
