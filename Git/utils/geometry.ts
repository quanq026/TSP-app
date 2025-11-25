import { City } from "../types";

export const calculateDistance = (a: City, b: City): number => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

export const getTotalDistance = (cities: City[], path: number[]): number => {
  if (path.length < 2) return 0;
  
  let dist = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const c1 = cities.find(c => c.id === path[i]);
    const c2 = cities.find(c => c.id === path[i + 1]);
    if (c1 && c2) {
      dist += calculateDistance(c1, c2);
    }
  }
  // Close loop
  if (path.length === cities.length && cities.length > 1) {
    const start = cities.find(c => c.id === path[0]);
    const end = cities.find(c => c.id === path[path.length - 1]);
    if (start && end) {
      dist += calculateDistance(end, start);
    }
  }
  return dist;
};

/**
 * Rotates a path array so that the startId is at index 0.
 * Since TSP is a cycle, A->B->C->A is same as B->C->A->B.
 * This ensures visualization always starts from the first city added.
 */
export const normalizePath = (path: number[], startId: number): number[] => {
  if (path.length === 0) return path;
  
  const index = path.indexOf(startId);
  if (index === -1 || index === 0) return path;

  // Rotate: [...from start to end, ...from beginning to start]
  return [...path.slice(index), ...path.slice(0, index)];
};
