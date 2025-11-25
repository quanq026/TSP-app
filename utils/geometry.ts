import { City } from "../types";

export const calculateDistance = (a: City, b: City): number => {
  return Math.hypot(a.x - b.x, a.y - b.y);
};

export const getTotalDistance = (cities: City[], path: number[]): number => {
  if (path.length < 2) return 0;

  const cityMap = new Map(cities.map(city => [city.id, city]));

  const segmentDistance = (fromId: number, toId: number): number => {
    const from = cityMap.get(fromId);
    const to = cityMap.get(toId);
    if (!from || !to) return 0;
    return calculateDistance(from, to);
  };

  let total = 0;
  for (let i = 0; i < path.length - 1; i += 1) {
    total += segmentDistance(path[i], path[i + 1]);
  }

  const formsClosedLoop =
    path.length === cityMap.size && cityMap.size > 1;
  if (formsClosedLoop) {
    total += segmentDistance(path[path.length - 1], path[0]);
  }

  return total;
};

export const normalizePath = (path: number[], startId: number): number[] => {
  if (path.length === 0) return path;

  const index = path.indexOf(startId);
  if (index <= 0) return path;

  return [...path.slice(index), ...path.slice(0, index)];
};
