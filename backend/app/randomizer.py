from __future__ import annotations

import random
from typing import List

from .schemas import City

PADDING = 30


def generate_random_cities(count: int, width: int, height: int) -> List[City]:
    """Create `count` pseudo-random cities within a padded rectangle."""

    safe_width = max(width - PADDING * 2, 1)
    safe_height = max(height - PADDING * 2, 1)

    def random_coord(range_size: int) -> float:
        return random.random() * range_size + PADDING

    cities: List[City] = []
    for idx in range(count):
        x = random_coord(safe_width)
        y = random_coord(safe_height)
        cities.append(City(id=idx, x=x, y=y))
    return cities

