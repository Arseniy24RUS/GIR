#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
STATIC = ROOT / "giip" / "static"
LANDING = STATIC / "landing"
LANDING_MANIFEST = LANDING / "asset-manifest.json"
PROJECT_MANIFEST = STATIC / "ASSET_MANIFEST.json"
RELEASE_SNAPSHOT = "2026-07-11"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def image_size(path: Path) -> tuple[int, int]:
    with Image.open(path) as image:
        return image.size


def write_webp(source: Path, target: Path) -> None:
    with Image.open(source) as image:
        image.save(target, "WEBP", quality=86, method=6)


def asset_record(path: Path) -> dict[str, Any]:
    return {"path": path.relative_to(LANDING).as_posix(), "bytes": path.stat().st_size, "sha256": sha256(path)}


def landing_entries() -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    for png in sorted((LANDING / "hero").glob("*.png")) + sorted((LANDING / "product").glob("*.png")):
        webp = png.with_suffix(".webp")
        write_webp(png, webp)
        stem = png.stem
        role = "hero" if png.parent.name == "hero" else "product-screen"
        if role == "hero":
            theme = stem.removeprefix("hero-")
            locale = "neutral"
            origin = f"User-provided GIR {theme}.png"
        else:
            view, locale, theme = stem.rsplit("-", 2)
            origin = f"Current GIR V6 browser capture: {view}"
        width, height = image_size(png)
        entries.append(
            {
                "id": stem,
                "role": role,
                "theme": theme,
                "locale": locale,
                "origin": origin,
                "width": width,
                "height": height,
                "png": asset_record(png),
                "webp": asset_record(webp),
            }
        )
    return entries


def project_asset(entry: dict[str, Any], variant: str) -> dict[str, Any]:
    relative = f"landing/{entry[variant]['path']}"
    return {
        "path": relative,
        "source": {
            "type": "user_provided" if entry["role"] == "hero" else "local_browser_capture",
            "path": entry["origin"],
        },
        "status": "official" if entry["role"] == "hero" else "derived",
        "locale": entry["locale"] if entry["locale"] != "neutral" else "all",
        "theme": entry["theme"],
        "sha256": entry[variant]["sha256"],
        "bytes": entry[variant]["bytes"],
        "license": "Project-owned visual asset.",
        "note": "Theme-aware GIR landing hero." if entry["role"] == "hero" else "Current product UI capture for the GIR landing page.",
        "dimensions": f"{entry['width']}x{entry['height']}",
    }


def static_asset(relative: str, source_path: str, note: str) -> dict[str, Any]:
    path = STATIC / relative
    return {
        "path": relative,
        "source": {"type": "lucide_static", "path": source_path},
        "status": "official",
        "locale": "all",
        "theme": "all",
        "sha256": sha256(path),
        "bytes": path.stat().st_size,
        "license": "Lucide ISC License; see icons/LICENSE-lucide-static.txt.",
        "note": note,
    }


def main() -> None:
    entries = landing_entries()
    LANDING_MANIFEST.write_text(
        json.dumps(
            {
                "schema_version": "1.0",
                "release_snapshot": RELEASE_SNAPSHOT,
                "base_url": "/static/landing",
                "assets": entries,
            },
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )

    project = json.loads(PROJECT_MANIFEST.read_text(encoding="utf-8"))
    project["runtime_remote_dependencies"] = True
    project["runtime_remote_services"] = [
        {
            "name": "FormSubmit",
            "url": "https://formsubmit.co/ajax/project_office@inno.mgimo.ru",
            "purpose": "User-initiated cooperation form delivery to the MGIMO project office",
            "data": "Contact fields entered by the user after explicit consent",
        }
    ]
    project["notes"] = [
        "Source URLs in asset records are provenance metadata, not runtime asset dependencies.",
        "The optional cooperation form uses the documented FormSubmit endpoint after explicit user consent.",
        "The manifest does not list its own hash because self-hashing is recursive.",
    ]
    prefixes = ("landing/",)
    icon_records = [
        ("icons/house.svg", "house", "Home route icon for the GIR sidebar."),
        ("icons/mail.svg", "mail", "Cooperation action icon for the GIR header."),
        ("icons/map.svg", "map", "Geographic coverage icon for the GIR landing scale section."),
        ("icons/chart-no-axes-combined.svg", "chart-no-axes-combined", "Index observations and analytical pipeline icon."),
        ("icons/server.svg", "server", "Data horizon and storage icon for the GIR landing scale section."),
        ("icons/boxes.svg", "boxes", "Raw snapshots and archival pipeline icon."),
        ("icons/landmark.svg", "landmark", "Official sources and public-sector audience icon."),
        ("icons/graduation-cap.svg", "graduation-cap", "Universities and research organizations audience icon."),
        ("icons/briefcase-business.svg", "briefcase-business", "Corporate and investor audience icon."),
        ("icons/network.svg", "network", "Normalization and international cooperation icon."),
        ("icons/flag.svg", "flag", "Decision and policy output icon."),
    ]
    replaced = {relative for relative, _icon, _note in icon_records}
    assets = [item for item in project.get("assets", []) if not item.get("path", "").startswith(prefixes) and item.get("path") not in replaced]
    for entry in entries:
        assets.extend([project_asset(entry, "png"), project_asset(entry, "webp")])
    assets.extend(
        static_asset(relative, f"https://lucide.dev/icons/{icon}", note)
        for relative, icon, note in icon_records
    )
    project["assets"] = sorted(assets, key=lambda item: item["path"])
    PROJECT_MANIFEST.write_text(json.dumps(project, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
