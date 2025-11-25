from __future__ import annotations

from typing import List

from ..schemas import City
from .geometry import normalize_path


def _rot(n: int, x: int, y: int, rx: int, ry: int) -> tuple[int, int]:
    if ry == 0:
        if rx == 1:
            x = n - 1 - x
            y = n - 1 - y
        x, y = y, x
    return x, y


def _xy2d(n: int, x: int, y: int) -> int:
    rx = ry = s = 0
    d = 0
    s = n // 2
    while s > 0:
        rx = 1 if (x & s) > 0 else 0
        ry = 1 if (y & s) > 0 else 0
        d += s * s * ((3 * rx) ^ ry)
        x, y = _rot(s, x, y, rx, ry)
        s //= 2
    return d


def solve_space_filling_curve(cities: List[City]) -> List[int]:
    if not cities:
        return []

    grid_size = 4096
    max_x = max(max(city.x for city in cities), 1)
    max_y = max(max(city.y for city in cities), 1)
    max_val = max(max_x, max_y)

    enriched = []
    for city in cities:
        nx = int((city.x / max_val) * (grid_size - 1))
        ny = int((city.y / max_val) * (grid_size - 1))
        enriched.append({"id": city.id, "hilbert": _xy2d(grid_size, nx, ny)})

    enriched.sort(key=lambda c: c["hilbert"])
    path = [c["id"] for c in enriched]
    if cities:
        return normalize_path(path, cities[0].id)
    return path

