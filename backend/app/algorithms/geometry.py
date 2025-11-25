from __future__ import annotations

from typing import Iterable, List

from ..schemas import City


def calculate_distance(a: City, b: City) -> float:
    return ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) ** 0.5


def get_total_distance(cities: Iterable[City], path: List[int]) -> float:
    if len(path) < 2:
        return 0.0

    city_lookup = {city.id: city for city in cities}
    dist = 0.0
    for i in range(len(path) - 1):
        c1 = city_lookup.get(path[i])
        c2 = city_lookup.get(path[i + 1])
        if c1 and c2:
            dist += calculate_distance(c1, c2)

    if len(path) == len(city_lookup) and len(path) > 1:
        start = city_lookup.get(path[0])
        end = city_lookup.get(path[-1])
        if start and end:
            dist += calculate_distance(start, end)

    return dist


def normalize_path(path: List[int], start_id: int) -> List[int]:
    if not path:
        return path

    if (index := path.index(start_id) if start_id in path else -1) <= 0:
        return path

    return path[index:] + path[:index]

