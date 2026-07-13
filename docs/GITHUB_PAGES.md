# GitHub Pages publication

The repository contains the complete customer release, including the SQLite database, permitted raw snapshots, derived exports, reproducibility recipes and provenance records. Large data objects are stored through Git LFS.

GitHub Pages cannot execute FastAPI or SQLite queries, so `pages-dist/` contains precomputed real-data workspaces consumed by the browser runtime. The public online platform includes:

- the landing page and 2026 country workspaces for every public country;
- current workspaces for HDI, HCI+, GTCI, GII, IDI and QS E&T for every public country;
- all four public HTEI workspace modes for every public country;
- international comparison and cross-index matrix views;
- training, policy and methodology workspaces;
- Data Lab catalogue metadata and its default evidence query;
- CSV downloads corresponding to the exported views.

Server-only refresh, administration and arbitrary historical recomputation remain available from the repository through `open_platform.cmd` on Windows or `run_platform.sh` on Linux/macOS. No synthetic values are introduced by the Pages export.

## Rebuild

```bash
python scripts/build_github_pages.py
```

The command writes `pages-dist/` and a SHA-256 manifest. GitHub Actions publishes only this directory and deliberately skips Git LFS downloads.
