# GIR landing: content and integration snapshot

Date: 2026-07-11

## Runtime contract

Load `/static/landing.css` and `/static/landing.js`, then mount the returned string:

```js
view.innerHTML = window.GIRLanding.render({ lang: "ru", theme: "dark" });
```

`render({ lang, theme })` is deterministic and does not read or modify application state, the DOM, storage, URL, locale or theme settings. Unsupported values resolve to `ru` and `dark`.

The application shell owns event delegation:

- `[data-route-target="country"]` opens the country analytics route.
- `[data-open-cooperation]` opens the cooperation flow.
- `.landing-page` is the page root and `.landing-hero` is the hero.
- `img[data-landing-hero]` identifies the active hero asset.
- `[data-landing-metric]` identifies release metrics.
- `img[data-landing-product]` identifies product screens.
- Stable section IDs are `landing-scale`, `landing-system`, `landing-product`, `landing-pipeline`, `landing-audiences`, `landing-engineering` and `landing-cta`.

Every `<picture>` publishes `data-theme`, `data-locale`, `data-asset-role` and `data-asset-name`. WebP is preferred and PNG remains the fallback.

## Content invariants

- RU and EN contain equivalent sections and facts.
- Light and dark use separate hero and product assets.
- RU index headings use full Russian names; index codes are secondary labels.
- The page has no Team section.
- Release metrics are a dated editorial snapshot: 225 countries and territories, 1990–2026, 10,076 scores, 275 archived source snapshots, 19,472 lines of code and tests, 178.7 MB SQLite, 702.7 MB raw archive, 36 tables, 64 Python tests, 536 Playwright scenarios, zero skipped and zero flaky scenarios.

## Asset provenance

- Hero PNG files are byte-identical copies of the two user-provided GIR images.
- Product screens are reproducible browser captures of the current V6 country profile, cross-index matrix and HTEI diagnostics in RU/EN and light/dark states.
- `/static/landing/asset-manifest.json` records dimensions, byte sizes and SHA-256 checksums for every PNG and WebP variant.
- `python scripts/refresh_landing_asset_manifests.py` regenerates WebP variants and synchronizes the landing and project asset ledgers.
