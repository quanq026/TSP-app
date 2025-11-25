from __future__ import annotations

from typing import List

from ..schemas import City
from .geometry import calculate_distance


def solve_nearest_neighbor(cities: List[City]) -> List[int]:
    if not cities:
        return []

    unvisited = {city.id for city in cities}
    path: List[int] = []
    current_city_id = cities[0].id
    path.append(current_city_id)
    unvisited.remove(current_city_id)

    city_lookup = {city.id: city for city in cities}

    while unvisited:
        current_city = city_lookup[current_city_id]
        nearest_id = None
        min_distance = float("inf")

        for city_id in unvisited:
            candidate = city_lookup[city_id]
            distance = calculate_distance(current_city, candidate)
            if distance < min_distance:
                min_distance = distance
                nearest_id = city_id

        if nearest_id is None:
            break

        path.append(nearest_id)
        unvisited.remove(nearest_id)
        current_city_id = nearest_id

    return path

