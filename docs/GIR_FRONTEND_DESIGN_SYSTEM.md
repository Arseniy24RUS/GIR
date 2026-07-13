# GIR Frontend Design System

## Reference

The production interface adapts the visual system from the Figma file
`STP MGIMO - landing page concepts dark light` without copying its landing-page
composition into analytical screens.

- Dark reference: frame `11:2`.
- Light reference: frame `11:193`.
- Design tokens: frame `11:384`.
- Product name RU: `GIR - Глобальный рейтинг индексов`.
- Product name EN: `GIR - Global Index Ranker`.

## Fidelity Ledger

| Area | Figma reference | GIR implementation |
|---|---|---|
| Typography | Onest Regular and Medium | Local Onest 400/500 WOFF2, `font-display: swap`, Arial fallback |
| Dark palette | `#0A132D`, `#031E4F`, `#2947A0`, `#192F70`, `#539D96`, `#FFFFFF` | Semantic CSS variables for page, panels, controls, charts and maps |
| Light palette | White, `#F4F6FA`, `#D9DEE8`, primary blue and accent green | Flat light surfaces, readable controls and theme-specific map tokens |
| Institutional header | 96 px desktop header with partner marks | 96 px desktop strip: MGIMO, FCTAS RAS, Priority 2030, Ministry |
| Geometry | Flat rectangular modules, restrained corners | 0-4 px radii, 1 px borders, no glass, glow or decorative orbs |
| Logo system | Institutional lockups and compact graphic modules | Local theme/locale assets plus GIR wordmark, compact mark and favicons |
| Controls | Strong hierarchy, compact institutional layout | Icon theme/menu controls, one RU/EN toggle and shared country/year context bar |
| Spacing | Structured 8 px-based rhythm | Dense dashboard rhythm with 12/16/24/28 px layout intervals |
| Responsive | Reference translated to product shell | 264 px sidebar, 72 px rail, tablet overlay and mobile off-canvas drawer |

## Navigation

The GIR wordmark is the first element in the institutional header at every
breakpoint. The left sidebar contains navigation only and groups the existing
hash routes into Overview, Indices, Analytics and Methodology. Expanded
navigation shows localized full names and a secondary code. Collapsed
navigation uses index codes or local Lucide icons. The active item uses a flat
fill and a three-pixel accent strip.

On desktop and in the tablet rail, the sidebar participates in normal document
flow and scrolls with the whole page; it has no independent scrollbar. Sidebar
state is stored under `gir-sidebar`. Tablet/mobile overlays use their own
scrollable modal surface only while open, close after navigation and on Escape,
trap keyboard focus, and restore focus to the opener.

## Assets

All production brand assets are local under `giip/static/brand`. The machine-
readable `giip/static/ASSET_MANIFEST.json` records source, locale, theme,
variant and whether each asset is official or derived. Lucide icons and their
license are stored under `giip/static/icons`; Onest font files and the OFL are
stored under `giip/static/fonts`. Remote Figma image URLs are not used at
runtime.

## Compatibility

The rebrand changes public presentation only. The `giip` Python package,
`GIIP_DB`, SQLite path, API routes, hash routes and Playwright compatibility
environment variables remain unchanged.
