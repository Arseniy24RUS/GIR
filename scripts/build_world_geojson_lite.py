from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from shapely.geometry import mapping, shape

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "giip" / "static" / "world_countries.geojson"
DEFAULT_TARGET = ROOT / "giip" / "static" / "world_countries_lite.geojson"


def _round_coordinates(value: Any, precision: int) -> Any:
    if isinstance(value, (list, tuple)):
        if value and isinstance(value[0], (int, float)):
            return [round(float(item), precision) for item in value]
        return [_round_coordinates(item, precision) for item in value]
    return value


def build(source: Path, target: Path, tolerance: float = 0.03, precision: int = 4) -> dict[str, Any]:
    payload = json.loads(source.read_text(encoding="utf-8"))
    features = []
    invalid_before = 0
    invalid_after = 0
    for feature in payload.get("features", []):
        geometry = shape(feature["geometry"])
        if not geometry.is_valid:
            invalid_before += 1
            geometry = geometry.buffer(0)
        simplified = geometry.simplify(tolerance, preserve_topology=True)
        if simplified.is_empty:
            simplified = geometry
        if not simplified.is_valid:
            invalid_after += 1
            simplified = simplified.buffer(0)
        geom = mapping(simplified)
        geom["coordinates"] = _round_coordinates(geom["coordinates"], precision)
        features.append({
            "type": "Feature",
            "properties": feature.get("properties") or {},
            "geometry": geom,
        })
    output = {
        "type": "FeatureCollection",
        "name": payload.get("name") or "world_countries_lite",
        "metadata": {
            **(payload.get("metadata") or {}),
            "derived_from": source.name,
            "purpose": "interactive dashboard rendering; source geometry remains unchanged",
            "simplification_tolerance_degrees": tolerance,
            "coordinate_precision": precision,
            "feature_count": len(features),
        },
        "features": features,
    }
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    return {
        "source": str(source),
        "target": str(target),
        "source_bytes": source.stat().st_size,
        "target_bytes": target.stat().st_size,
        "reduction_percent": round((1 - target.stat().st_size / source.stat().st_size) * 100, 2),
        "features": len(features),
        "invalid_before": invalid_before,
        "invalid_after": invalid_after,
        "tolerance": tolerance,
        "precision": precision,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--target", type=Path, default=DEFAULT_TARGET)
    parser.add_argument("--tolerance", type=float, default=0.03)
    parser.add_argument("--precision", type=int, default=4)
    args = parser.parse_args()
    print(json.dumps(build(args.source, args.target, args.tolerance, args.precision), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
