# GIR Stage 6 — methodology documentation centre

## Purpose

The public **Methodology** route is a bilingual scientific documentation centre rather than an operational release dashboard. It explains how GIR moves from a source publication to a displayed result and separates:

1. official values imported from publishers;
2. official components retained for analysis;
3. derived GIR diagnostics;
4. original GIR research models.

Operational blockers, Playwright hashes and acceptance status remain available in the project's service and delivery evidence. They are not used as the opening narrative of the public methodology page.

## Runtime architecture

The route is intentionally independent of `/api/app-data`.

- `/static/methodology/content/methodology.ru.json` — precompiled Russian chapters and search index;
- `/static/methodology/content/methodology.en.json` — precompiled English chapters and search index;
- `/api/methodology/summary` — compact live passport calculated from the installed SQLite database;
- `/static/methodology/figures/{lang}-{theme}/` — nine synchronized figures for each language/theme combination;
- `/static/methodology/downloads/` — publication source documents offered for download;
- `methodology.js` and `methodology.css` — reader, search, routes, atlas and responsive presentation.

The browser does not require a Markdown parser or BeautifulSoup. Markdown is compiled before release.

## Reader functions

The page provides:

- local grouped table of contents;
- chapter and continuous reading modes;
- full-text search with `Ctrl/Cmd + K`;
- shareable chapter and section state in the URL;
- four task-oriented reading routes;
- live database scale metrics;
- index passports linked to the corresponding methodology chapter;
- bilingual/theme-aware figure switching;
- figure lightbox and visual atlas;
- printable reading view;
- Markdown and DOCX downloads where supplied.

## Regenerating the content

After editing either source Markdown file, run:

```bash
python scripts/build_methodology_wiki.py
python scripts/build_methodology_wiki.py --check
```

Regeneration requires `markdown-it-py` and `beautifulsoup4` in the development environment. The committed JSON remains runtime-ready even when these packages are not installed in production.

The builder:

- splits the long document into semantic chapters;
- assigns stable chapter keys and heading anchors;
- compiles tables, code, callouts and figures to safe HTML (`html=False` in the Markdown renderer);
- generates reading-time estimates and a search index;
- validates all four sets of nine figures;
- fails on missing semantic roles, duplicate identifiers or script content.

## Updating figures

Canonical file names must remain stable:

```text
01_taxonomy.png
02_pipeline.png
03_database_layers.png
04_htei_modes.png
05_htei_weights.png
06_index_coverage.png
07_primary_sources_archive.png
08_release_gates.png
09_methodology_page_architecture.png
```

Every file must exist in all four folders:

```text
ru-light  ru-dark  en-light  en-dark
```

The figures supplied in `GIR_methodology_web_bundle_bilingual_4variants_20260712(1).zip` are registered in `giip/static/ASSET_MANIFEST.json` with SHA-256, dimensions, locale and theme. Do not silently replace one language or theme with another.

## Public and technical material

Technical appendices are not deleted. They are presented later in the reader and explicitly marked as audit material. The public opening surface must not show:

- `final_release_candidate`;
- unresolved blocker counts;
- hash mismatch lists;
- internal source-file names;
- Playwright evidence status.

Those controls belong to acceptance and operational evidence, not to the methodological explanation of the research.

## Verification

Run:

```bash
pytest -q tests/test_methodology_wiki_stage6.py
node --check giip/static/methodology.js
node --check giip/static/app.js
python -m py_compile giip/api.py giip/methodology_wiki.py scripts/build_methodology_wiki.py
```

A final customer release must also record a new full Playwright evidence manifest after all product stages are complete. Stage 6 deliberately does not rewrite the immutable manifest from the previous frontend version.
