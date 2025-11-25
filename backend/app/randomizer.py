from __future__ import annotations

import random
from typing import List

from .schemas import City


def generate_random_cities(count: int, width: int, height: int) -> List[City]:
    padding = 30
    safe_width = max(width - padding * 2, 1)
    safe_height = max(height - padding * 2, 1)

    cities: List[City] = []
    for idx in range(count):
        x = random.random() * safe_width + padding
        y = random.random() * safe_height + padding
        cities.append(City(id=idx, x=x, y=y))
    return cities

