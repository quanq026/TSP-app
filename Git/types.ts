export interface Point {
  x: number;
  y: number;
}

export interface City extends Point {
  id: number;
}

export interface TSPState {
  cities: City[];
  path: number[]; // Array of city IDs
  currentDistance: number;
  isRunning: boolean;
  step: number;
}

export enum AlgorithmType {
  NEAREST_NEIGHBOR = 'NEAREST_NEIGHBOR',
  ACO = 'ACO',
  SPACE_FILLING_CURVE = 'SPACE_FILLING_CURVE'
}

export interface AnalysisResult {
  algorithm: string;
  distance: number;
  path: number[];
  executionTime: number; // in ms
}

export type Language = 'en' | 'vi';
