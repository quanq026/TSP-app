from __future__ import annotations

from typing import Iterable, List

from ..schemas import City


def calculate_distance(a: City, b: City) -> float:
    """Return Euclidean distance between two cities."""
    return ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) ** 0.5


def get_total_distance(cities: Iterable[City], path: List[int]) -> float:
    """Sum segment distances along a path, optionally closing the loop."""

    if len(path) < 2:
        return 0.0

    city_lookup = {city.id: city for city in cities}

    def lookup(city_id: int) -> City | None:
        return city_lookup.get(city_id)

    def segment_distance(a_id: int, b_id: int) -> float:
        city_a = lookup(a_id)
        city_b = lookup(b_id)
        if not city_a or not city_b:
            return 0.0
        return calculate_distance(city_a, city_b)

    total = 0.0
    for first, second in zip(path, path[1:]):
        total += segment_distance(first, second)

    is_closed_tour = len(path) == len(city_lookup)
    if is_closed_tour:
        total += segment_distance(path[-1], path[0])

    return total


def normalize_path(path: List[int], start_id: int) -> List[int]:
    """Rotate path so it begins with start_id (if present)."""

    if not path:
        return path

    try:
        index = path.index(start_id)
    except ValueError:
        return path

    if index == 0:
        return path

    return path[index:] + path[:index]

