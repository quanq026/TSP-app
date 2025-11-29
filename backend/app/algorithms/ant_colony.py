from __future__ import annotations

import math
import random
from typing import List

from ..schemas import City
from .geometry import calculate_distance, normalize_path


def solve_ant_colony(cities: List[City]) -> List[int]:
    """Solve TSP with Ant Colony Optimization and return ordered city IDs."""

    if len(cities) < 2:
        return [city.id for city in cities]

    seen_positions: set[tuple[float, float]] = set()
    unique_cities: List[City] = []
    for city in cities:
        pos = (city.x, city.y)
        if pos not in seen_positions:
            seen_positions.add(pos)
            unique_cities.append(city)
    
    if len(unique_cities) < 2:
        return [city.id for city in unique_cities]
    
    cities = unique_cities

    num_ants = min(30, len(cities))
    max_iterations = 150
    alpha = 1
    beta = 3
    evaporation = 0.1
    q = 100

    n = len(cities)
    pheromones = [[1.0 for _ in range(n)] for _ in range(n)]

    def build_distance_matrix() -> List[List[float]]:
        matrix = [[0.0 for _ in range(n)] for _ in range(n)]
        for i in range(n):
            for j in range(n):
                matrix[i][j] = calculate_distance(cities[i], cities[j])
        return matrix

    dists = build_distance_matrix()
    index_to_id = {i: city.id for i, city in enumerate(cities)}
    best_path: List[int] = []
    best_distance = math.inf

    def path_distance(path: List[int]) -> float:
        total = 0.0
        for idx in range(n - 1):
            total += dists[path[idx]][path[idx + 1]]
        total += dists[path[-1]][path[0]]
        return total

    def choose_next_city(current: int, visited: set[int]) -> int:
        candidates: List[int] = []
        weights: List[float] = []

        for next_city in range(n):
            if next_city in visited:
                continue
            tau = pheromones[current][next_city] ** alpha
            distance = dists[current][next_city]
            eta = (1.0 / max(distance, 0.001)) ** beta
            probability = tau * eta
            candidates.append(next_city)
            weights.append(probability)

        if not candidates:
            return current

        total_weight = sum(weights)
        if total_weight == 0:
            return random.choice(candidates)

        threshold = random.random() * total_weight
        for candidate, weight in zip(candidates, weights):
            threshold -= weight
            if threshold <= 0:
                return candidate
        return candidates[-1]

    def construct_path() -> List[int]:
        visited: set[int] = set()
        current = random.randrange(n)
        path = [current]
        visited.add(current)

        while len(path) < n:
            current = choose_next_city(current, visited)
            path.append(current)
            visited.add(current)
        return path

    def evaporate_pheromones() -> None:
        for i in range(n):
            for j in range(n):
                pheromones[i][j] *= (1 - evaporation)

    def deposit_pheromones(path: List[int], total: float) -> None:
        deposit = q / total if total else 0
        for idx in range(n - 1):
            a, b = path[idx], path[idx + 1]
            pheromones[a][b] += deposit
            pheromones[b][a] += deposit
        a, b = path[-1], path[0]
        pheromones[a][b] += deposit
        pheromones[b][a] += deposit

    for _ in range(max_iterations):
        all_paths: List[List[int]] = []
        all_distances: List[float] = []

        for _ in range(num_ants):
            path = construct_path()
            total = path_distance(path)
            all_paths.append(path)
            all_distances.append(total)

            if total < best_distance:
                best_distance = total
                best_path = path[:]

        evaporate_pheromones()
        for path, total in zip(all_paths, all_distances):
            deposit_pheromones(path, total)

    result = [index_to_id[idx] for idx in best_path]
    if cities:
        return normalize_path(result, cities[0].id)
    return result

