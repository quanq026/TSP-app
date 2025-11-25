import { City } from "../types";
import { calculateDistance } from "./geometry";

export const solveNearestNeighborFull = (cities: City[]): number[] => {
  if (cities.length === 0) return [];
  
  const unvisited = new Set(cities.map(c => c.id));
  const path: number[] = [];
  
  // Start at the first city (arbitrary or user defined logic)
  let currentCityId = cities[0].id;
  path.push(currentCityId);
  unvisited.delete(currentCityId);

  while (unvisited.size > 0) {
    const currentCity = cities.find(c => c.id === currentCityId)!;
    let nearestId = -1;
    let minDist = Infinity;

    for (const cityId of unvisited) {
      const candidate = cities.find(c => c.id === cityId)!;
      const d = calculateDistance(currentCity, candidate);
      if (d < minDist) {
        minDist = d;
        nearestId = cityId;
      }
    }

    if (nearestId !== -1) {
      path.push(nearestId);
      unvisited.delete(nearestId);
      currentCityId = nearestId;
    } else {
      break; 
    }
  }

  return path;
};