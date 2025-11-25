from __future__ import annotations

from typing import List

from ..schemas import City
from .geometry import calculate_distance


def solve_nearest_neighbor(cities: List[City]) -> List[int]:
    """Greedy TSP heuristic that always visits the closest unvisited city."""

    if not cities:
        return []

    city_lookup = {city.id: city for city in cities}
    unvisited = set(city_lookup.keys())
    current_city_id = cities[0].id
    path: List[int] = [current_city_id]
    unvisited.remove(current_city_id)

    def find_nearest(current_id: int) -> int | None:
        current_city = city_lookup[current_id]
        nearest_id = None
        min_distance = float("inf")

        for candidate_id in unvisited:
            candidate = city_lookup[candidate_id]
            distance = calculate_distance(current_city, candidate)
            if distance < min_distance:
                min_distance = distance
                nearest_id = candidate_id
        return nearest_id

    while unvisited:
        nearest_id = find_nearest(current_city_id)
        if nearest_id is None:
            break
        path.append(nearest_id)
        unvisited.remove(nearest_id)
        current_city_id = nearest_id

    return path

