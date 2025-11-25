from __future__ import annotations

from typing import List, Tuple

from ..schemas import City
from .geometry import normalize_path

GRID_SIZE = 4096


def _rotate_quadrant(size: int, x: int, y: int, rx: int, ry: int) -> Tuple[int, int]:
    """Rotate a quadrant to follow the Hilbert curve ordering."""
    if ry == 0:
        if rx == 1:
            x = size - 1 - x
            y = size - 1 - y
        x, y = y, x
    return x, y


def _hilbert_distance(size: int, x: int, y: int) -> int:
    """Map 2D grid coordinates to 1D Hilbert curve distance."""
    d = 0
    step = size // 2
    while step > 0:
        rx = 1 if (x & step) else 0
        ry = 1 if (y & step) else 0
        d += step * step * ((3 * rx) ^ ry)
        x, y = _rotate_quadrant(step, x, y, rx, ry)
        step //= 2
    return d


def _normalize_coords(city: City, max_val: float) -> tuple[int, int]:
    scale = GRID_SIZE - 1
    nx = int((city.x / max_val) * scale)
    ny = int((city.y / max_val) * scale)
    return nx, ny


def solve_space_filling_curve(cities: List[City]) -> List[int]:
    """Order cities by Hilbert curve to approximate a short tour."""

    if not cities:
        return []

    max_coord = max(max(city.x for city in cities), max(city.y for city in cities), 1)

    enriched = []
    for city in cities:
        nx, ny = _normalize_coords(city, max_coord)
        hilbert_value = _hilbert_distance(GRID_SIZE, nx, ny)
        enriched.append((hilbert_value, city.id))

    enriched.sort(key=lambda item: item[0])
    path = [city_id for _, city_id in enriched]
    return normalize_path(path, cities[0].id)

