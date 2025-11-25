from __future__ import annotations

import math
import random
from typing import List

from ..schemas import City
from .geometry import calculate_distance, normalize_path


def solve_ant_colony(cities: List[City]) -> List[int]:
    if len(cities) < 2:
        return [city.id for city in cities]

    num_ants = min(20, len(cities))
    max_iterations = 50
    alpha = 1
    beta = 3
    evaporation = 0.1
    q = 100

    n = len(cities)
    pheromones = [[1.0 for _ in range(n)] for _ in range(n)]

    dists = [[0.0 for _ in range(n)] for _ in range(n)]
    for i in range(n):
        for j in range(n):
            dists[i][j] = calculate_distance(cities[i], cities[j])

    index_to_id = {i: city.id for i, city in enumerate(cities)}

    best_path: List[int] = []
    best_distance = math.inf

    for _ in range(max_iterations):
        all_paths: List[List[int]] = []
        all_distances: List[float] = []

        for _ in range(num_ants):
            visited = set()
            current = random.randrange(n)
            path = [current]
            visited.add(current)

            while len(visited) < n:
                probs = []
                candidates = []
                prob_sum = 0.0

                for next_city in range(n):
                    if next_city in visited:
                        continue

                    tau = pheromones[current][next_city] ** alpha
                    distance = dists[current][next_city] or 0.1
                    eta = (1.0 / distance) ** beta
                    probability = tau * eta
                    probs.append(probability)
                    candidates.append(next_city)
                    prob_sum += probability

                if prob_sum == 0:
                    remaining = [i for i in range(n) if i not in visited]
                    next_city = random.choice(remaining)
                else:
                    r = random.random() * prob_sum
                    next_city = candidates[-1]
                    for idx, candidate in enumerate(candidates):
                        r -= probs[idx]
                        if r <= 0:
                            next_city = candidate
                            break

                path.append(next_city)
                visited.add(next_city)
                current = next_city

            all_paths.append(path)
            total = 0.0
            for i in range(n - 1):
                total += dists[path[i]][path[i + 1]]
            total += dists[path[-1]][path[0]]
            all_distances.append(total)

            if total < best_distance:
                best_distance = total
                best_path = path[:]

        for i in range(n):
            for j in range(n):
                pheromones[i][j] *= (1 - evaporation)

        for path, total in zip(all_paths, all_distances):
            deposit = q / total if total else 0
            for i in range(n - 1):
                pheromones[path[i]][path[i + 1]] += deposit
                pheromones[path[i + 1]][path[i]] += deposit
            pheromones[path[-1]][path[0]] += deposit
            pheromones[path[0]][path[-1]] += deposit

    result = [index_to_id[idx] for idx in best_path]
    if cities:
        return normalize_path(result, cities[0].id)
    return result

