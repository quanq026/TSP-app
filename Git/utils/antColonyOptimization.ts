import { City } from "../types";
import { calculateDistance, normalizePath } from "./geometry";

export const solveACO = (cities: City[]): number[] => {
  if (cities.length < 2) return cities.map(c => c.id);

  // Constants
  const NUM_ANTS = Math.min(20, cities.length);
  const MAX_ITERATIONS = 50; // Keep low for UI responsiveness
  const ALPHA = 1; // Pheromone importance
  const BETA = 3;  // Distance importance
  const EVAPORATION = 0.1;
  const Q = 100;

  const n = cities.length;
  // Initialize Pheromones
  let pheromones: number[][] = Array(n).fill(0).map(() => Array(n).fill(1));
  
  // Precompute distances
  const dists: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
  for(let i=0; i<n; i++){
    for(let j=0; j<n; j++){
       dists[i][j] = calculateDistance(cities[i], cities[j]);
    }
  }

  // Map city IDs to indices 0..n-1 for matrix access
  const idToIndex = new Map<number, number>();
  const indexToId = new Map<number, number>();
  cities.forEach((c, i) => {
    idToIndex.set(c.id, i);
    indexToId.set(i, c.id);
  });

  let bestPathIndices: number[] = [];
  let bestDist = Infinity;

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    const allAntPaths: number[][] = [];
    const allAntDists: number[] = [];

    // Construct solutions
    for (let k = 0; k < NUM_ANTS; k++) {
      const visited = new Set<number>();
      // Random start
      let current = Math.floor(Math.random() * n);
      const path = [current];
      visited.add(current);

      while (visited.size < n) {
        const probs: number[] = [];
        const candidates: number[] = [];
        let probSum = 0;

        // Calculate probabilities for unvisited neighbors
        for (let next = 0; next < n; next++) {
          if (!visited.has(next)) {
            const tau = Math.pow(pheromones[current][next], ALPHA);
            // Avoid division by zero
            const d = dists[current][next] || 0.1; 
            const eta = Math.pow(1 / d, BETA);
            const p = tau * eta;
            probs.push(p);
            candidates.push(next);
            probSum += p;
          }
        }

        // Roulette wheel selection
        let nextCity = -1;
        if (probSum === 0) {
           // Fallback if numerical issues
           const remaining = Array.from({length: n}, (_, i) => i).filter(i => !visited.has(i));
           nextCity = remaining[Math.floor(Math.random() * remaining.length)];
        } else {
          let r = Math.random() * probSum;
          for (let i = 0; i < candidates.length; i++) {
            r -= probs[i];
            if (r <= 0) {
              nextCity = candidates[i];
              break;
            }
          }
          if (nextCity === -1) nextCity = candidates[candidates.length - 1];
        }

        path.push(nextCity);
        visited.add(nextCity);
        current = nextCity;
      }

      allAntPaths.push(path);
      
      // Calculate dist
      let d = 0;
      for(let i=0; i<n-1; i++) d += dists[path[i]][path[i+1]];
      d += dists[path[n-1]][path[0]];
      allAntDists.push(d);

      if (d < bestDist) {
        bestDist = d;
        bestPathIndices = [...path];
      }
    }

    // Update Pheromones
    // Evaporate
    for(let i=0; i<n; i++){
      for(let j=0; j<n; j++){
        pheromones[i][j] *= (1 - EVAPORATION);
      }
    }
    // Deposit
    for(let k=0; k<NUM_ANTS; k++){
       const d = allAntDists[k];
       const deposit = Q / d;
       const p = allAntPaths[k];
       for(let i=0; i<n-1; i++){
         pheromones[p[i]][p[i+1]] += deposit;
         pheromones[p[i+1]][p[i]] += deposit;
       }
       pheromones[p[n-1]][p[0]] += deposit;
       pheromones[p[0]][p[n-1]] += deposit;
    }
  }

  // Convert back to IDs
  const result = bestPathIndices.map(idx => indexToId.get(idx)!);
  
  // Rotate path so it starts with the first city added (cities[0])
  if (cities.length > 0) {
    return normalizePath(result, cities[0].id);
  }

  return result;
};
