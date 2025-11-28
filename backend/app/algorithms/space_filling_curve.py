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


def _hilbert_d2xy(size: int, d: int) -> Tuple[int, int]:
    """Convert Hilbert distance back to (x, y) coordinates."""
    x = y = 0
    step = 1
    while step < size:
        rx = 1 & (d // 2)
        ry = 1 & (d ^ rx)
        if ry == 0:
            if rx == 1:
                x = step - 1 - x
                y = step - 1 - y
            x, y = y, x
        x += step * rx
        y += step * ry
        d //= 4
        step *= 2
    return x, y


def get_sfc_debug_info(cities: List[City], canvas_width: float = 800, canvas_height: float = 600) -> dict:
    """Return debug information for visualizing the Hilbert curve ordering."""
    if not cities:
        return {"cities_debug": [], "max_coord": 0, "grid_size": GRID_SIZE, "hilbert_path": []}

    max_coord = max(max(city.x for city in cities), max(city.y for city in cities), 1)

    cities_debug = []
    for city in cities:
        nx, ny = _normalize_coords(city, max_coord)
        hilbert_value = _hilbert_distance(GRID_SIZE, nx, ny)
        cities_debug.append({
            "city_id": city.id,
            "x": city.x,
            "y": city.y,
            "normalized_x": nx,
            "normalized_y": ny,
            "hilbert_distance": hilbert_value,
        })

    # Sort by hilbert distance
    cities_debug.sort(key=lambda item: item["hilbert_distance"])
    
    # Find where the first city (cities[0]) is in the sorted list
    first_city_id = cities[0].id
    start_index = 0
    for i, item in enumerate(cities_debug):
        if item["city_id"] == first_city_id:
            start_index = i
            break
    
    # Assign order starting from the first city (rotate the order)
    n = len(cities_debug)
    for i in range(n):
        # Rotate so first city gets order 1
        rotated_index = (i - start_index) % n
        cities_debug[i]["order"] = rotated_index + 1

    # Generate Hilbert curve path for visualization (use smaller grid for display)
    display_grid_order = 4  # 2^4 = 16x16 grid
    display_grid_size = 2 ** display_grid_order
    total_cells = display_grid_size * display_grid_size
    
    # Calculate cell size based on canvas
    cell_width = canvas_width / display_grid_size
    cell_height = canvas_height / display_grid_size
    
    hilbert_path = []
    for d in range(total_cells):
        gx, gy = _hilbert_d2xy(display_grid_size, d)
        # Convert grid coords to canvas coords (center of each cell)
        px = (gx + 0.5) * cell_width
        py = (gy + 0.5) * cell_height
        hilbert_path.append({"x": px, "y": py})

    return {
        "cities_debug": cities_debug,
        "max_coord": max_coord,
        "grid_size": GRID_SIZE,
        "hilbert_path": hilbert_path,
        "display_grid_size": display_grid_size,
    }

