import { City } from "../types";
import { normalizePath } from "./geometry";

// Rotate/flip a quadrant appropriately
const rot = (n: number, x: number, y: number, rx: number, ry: number): {x: number, y: number} => {
  if (ry === 0) {
    if (rx === 1) {
      x = n - 1 - x;
      y = n - 1 - y;
    }
    return { x: y, y: x };
  }
  return { x, y };
};

// Convert (x,y) to d (Hilbert distance)
const xy2d = (n: number, x: number, y: number): number => {
  let rx, ry, s, d = 0;
  for (s = n / 2; s > 0; s /= 2) {
    rx = (x & s) > 0 ? 1 : 0;
    ry = (y & s) > 0 ? 1 : 0;
    d += s * s * ((3 * rx) ^ ry);
    const rotated = rot(s, x, y, rx, ry);
    x = rotated.x;
    y = rotated.y;
  }
  return d;
};

export const solveSpaceFillingCurve = (cities: City[]): number[] => {
  if (cities.length === 0) return [];

  // Normalize coordinates to integer grid for Hilbert (e.g., 0-1023 for order 10)
  // We assume canvas is roughly < 2000px, so 4096 (2^12) is safe
  const N = 4096; 
  
  // Find bounds
  const maxX = Math.max(...cities.map(c => c.x), 1);
  const maxY = Math.max(...cities.map(c => c.y), 1);
  const maxVal = Math.max(maxX, maxY);

  const citiesWithHilbert = cities.map(city => {
    // Scale to N
    const nx = Math.floor((city.x / maxVal) * (N - 1));
    const ny = Math.floor((city.y / maxVal) * (N - 1));
    return {
      id: city.id,
      hDist: xy2d(N, nx, ny)
    };
  });

  // Sort by Hilbert distance
  citiesWithHilbert.sort((a, b) => a.hDist - b.hDist);

  const path = citiesWithHilbert.map(c => c.id);

  // Rotate path so it starts with the first city added (cities[0])
  if (cities.length > 0) {
    return normalizePath(path, cities[0].id);
  }

  return path;
};
