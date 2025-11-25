import { AlgorithmType, AnalysisResult, City } from '../types';

const DEFAULT_API_URL = 'http://localhost:8000';
const API_BASE_URL = (import.meta as any)?.env?.VITE_API_URL ?? DEFAULT_API_URL;

const withBase = (path: string) => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalized}`;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed with status ${response.status}`);
    }
    return response.json() as Promise<T>;
};

type BackendSolveResponse = {
    algorithm: AlgorithmType;
    path: number[];
    total_distance: number;
    execution_time_ms: number;
};

type BackendAnalysisResponse = {
    results: Array<{
        algorithm: string;
        distance: number;
        path: number[];
        execution_time_ms: number;
    }>;
};

type BackendRandomCitiesResponse = {
    cities: City[];
};

export interface SolveResult {
    algorithm: AlgorithmType;
    path: number[];
    totalDistance: number;
    executionTime: number;
}

export const fetchRandomCities = async (
    count: number,
    width: number,
    height: number
): Promise<City[]> => {
    const params = new URLSearchParams({
        count: count.toString(),
        width: Math.round(width).toString(),
        height: Math.round(height).toString(),
    });
    const response = await fetch(withBase(`/cities/random?${params.toString()}`), {
        method: 'GET',
    });
    const data = await handleResponse<BackendRandomCitiesResponse>(response);
    return data.cities;
};

export const solveTsp = async (
    algorithm: AlgorithmType,
    cities: City[]
): Promise<SolveResult> => {
    const response = await fetch(withBase('/solve'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm, cities }),
    });

    const data = await handleResponse<BackendSolveResponse>(response);
    return {
        algorithm: data.algorithm,
        path: data.path,
        totalDistance: data.total_distance,
        executionTime: data.execution_time_ms,
    };
};

export const analyzeAlgorithms = async (cities: City[]): Promise<AnalysisResult[]> => {
    const response = await fetch(withBase('/analyze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cities }),
    });

    const data = await handleResponse<BackendAnalysisResponse>(response);
    return data.results.map((result) => ({
        algorithm: result.algorithm,
        distance: result.distance,
        path: result.path,
        executionTime: result.execution_time_ms,
    }));
};

