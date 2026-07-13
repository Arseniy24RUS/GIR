# GitHub Pages publication

The repository contains the complete customer release, including the SQLite database, permitted raw snapshots, derived exports, reproducibility recipes and provenance records. Large data objects are stored through Git LFS.

GitHub Pages is a static host and cannot execute FastAPI or SQLite queries. The `pages-dist/` artifact therefore publishes an immutable, real-data snapshot of the premium interface:

- the landing page and Russia 2026 country workspace;
- current index workspaces and the HTEI comparable ranking;
- the international comparison snapshot;
- training, policy and methodology workspaces;
- Data Lab catalogue metadata and its default evidence query;
- CSV downloads corresponding to the exported views.

The complete dynamic platform remains available from the repository and runs with `open_platform.cmd` on Windows or `run_platform.sh` on Linux/macOS. No synthetic values are introduced by the Pages export.

## Rebuild

```bash
python scripts/build_github_pages.py
```

The command writes `pages-dist/` and a SHA-256 manifest. GitHub Actions publishes only this directory and deliberately skips Git LFS downloads.
