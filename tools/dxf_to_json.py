"""
Đọc DXF bằng ezdxf, nhóm thực thể theo layer và trích cao độ tầng.
Đầu ra: building.json (metadata). Hình học 3D (GLB) cần bước dựng mesh riêng.

Cài đặt:  py -m pip install -r requirements.txt
Chạy:     py dxf_to_json.py sample\\plan.dxf ..\\public\\models\\building.json
"""
import json
import re
import sys
from collections import defaultdict

import ezdxf

LAYER_CATEGORIES = {
    "A-WALL": "wall",
    "A-DOOR": "door",
    "A-FLOR": "floor",
    "A-ROOF": "roof",
}
ELEVATION_RE = re.compile(r"FL\s*([+-]?\d+(?:\.\d+)?)", re.IGNORECASE)


def categorize(layer_name: str) -> str:
    upper = layer_name.upper()
    for prefix, cat in LAYER_CATEGORIES.items():
        if upper.startswith(prefix):
            return cat
    return "other"


def extract_floors(doc) -> list[dict]:
    """Tìm text dạng 'FL+3.600' để suy ra cao độ từng tầng."""
    elevations = set()
    for text in doc.modelspace().query("TEXT MTEXT"):
        content = text.dxf.text if text.dxftype() == "TEXT" else text.text
        for m in ELEVATION_RE.finditer(content):
            elevations.add(float(m.group(1)))

    sorted_elev = sorted(elevations) or [0.0]
    floors = []
    for i, elev in enumerate(sorted_elev):
        height = (sorted_elev[i + 1] - elev) if i + 1 < len(sorted_elev) else 3.6
        floors.append({
            "id": f"L{i + 1}",
            "name": f"Tầng {i + 1}",
            "elevation": elev,
            "height": round(height, 3),
        })
    return floors


def main(dxf_path: str, out_path: str) -> None:
    doc = ezdxf.readfile(dxf_path)
    msp = doc.modelspace()

    counts = defaultdict(int)
    for entity in msp:
        counts[categorize(entity.dxf.layer)] += 1

    meta = {
        "source": dxf_path,
        "units": "meter",
        "floors": extract_floors(doc),
        "layers": dict(LAYER_CATEGORIES),
        "entity_counts": dict(counts),
    }

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
    print(f"Đã ghi metadata: {out_path}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("Cách dùng: py dxf_to_json.py <input.dxf> <output.json>")
    main(sys.argv[1], sys.argv[2])
