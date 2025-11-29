from __future__ import annotations

import time
from typing import Dict

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .algorithms import (
    get_total_distance,
    solve_ant_colony,
    solve_nearest_neighbor,
    solve_space_filling_curve,
)
from .randomizer import generate_random_cities
from .schemas import (
    AlgorithmType,
    AnalyzeRequest,
    AnalyzeResponse,
    AnalysisResult,
    RandomCitiesResponse,
    SolveRequest,
    SolveResponse,
)

app = FastAPI(title="TSP Algorithms API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


ALGORITHM_DISPATCH = {
    AlgorithmType.NEAREST_NEIGHBOR: solve_nearest_neighbor,
    AlgorithmType.ACO: solve_ant_colony,
    AlgorithmType.SPACE_FILLING_CURVE: solve_space_filling_curve,
}

ALGORITHM_LABELS = {
    AlgorithmType.NEAREST_NEIGHBOR: AlgorithmType.NEAREST_NEIGHBOR.value,
    AlgorithmType.ACO: AlgorithmType.ACO.value,
    AlgorithmType.SPACE_FILLING_CURVE: AlgorithmType.SPACE_FILLING_CURVE.value,
}

ACO_RUNS = 3


@app.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/algorithms")
def list_algorithms() -> Dict[str, list[str]]:
    return {
        "algorithms": [
            algo.value for algo in AlgorithmType
        ]
    }


@app.get("/cities/random", response_model=RandomCitiesResponse)
def random_cities(
    count: int = Query(30, ge=3, le=500),
    width: int = Query(800, ge=100, le=4000),
    height: int = Query(600, ge=100, le=4000),
) -> RandomCitiesResponse:
    cities = generate_random_cities(count, width, height)
    return RandomCitiesResponse(cities=cities)


@app.post("/solve", response_model=SolveResponse)
def solve_tsp(request: SolveRequest) -> SolveResponse:
    if not request.cities:
        raise HTTPException(status_code=400, detail="No cities provided")

    solver = ALGORITHM_DISPATCH.get(request.algorithm)
    if solver is None:
        raise HTTPException(status_code=400, detail="Unsupported algorithm")

    if request.algorithm == AlgorithmType.ACO:
        best_path = []
        best_distance = float("inf")
        total_duration = 0.0

        for _ in range(ACO_RUNS):
            start = time.perf_counter()
            path = solver(request.cities)
            duration = (time.perf_counter() - start) * 1000
            total_duration += duration
            distance = get_total_distance(request.cities, path)

            if distance < best_distance:
                best_distance = distance
                best_path = path

        return SolveResponse(
            algorithm=request.algorithm,
            path=best_path,
            total_distance=best_distance,
            execution_time_ms=total_duration,
        )
    else:
        start = time.perf_counter()
        path = solver(request.cities)
        duration = (time.perf_counter() - start) * 1000
        distance = get_total_distance(request.cities, path)

        return SolveResponse(
            algorithm=request.algorithm,
            path=path,
            total_distance=distance,
            execution_time_ms=duration,
        )


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_algorithms(request: AnalyzeRequest) -> AnalyzeResponse:
    if len(request.cities) < 3:
        raise HTTPException(status_code=400, detail="Need at least 3 cities for analysis")

    results: list[AnalysisResult] = []

    for algorithm, solver in ALGORITHM_DISPATCH.items():
        if algorithm == AlgorithmType.ACO:
            best_path = []
            best_distance = float("inf")
            total_duration = 0.0

            for _ in range(ACO_RUNS):
                start = time.perf_counter()
                path = solver(request.cities)
                duration = (time.perf_counter() - start) * 1000
                total_duration += duration
                distance = get_total_distance(request.cities, path)

                if distance < best_distance:
                    best_distance = distance
                    best_path = path

            results.append(
                AnalysisResult(
                    algorithm=ALGORITHM_LABELS[algorithm],
                    distance=best_distance,
                    path=best_path,
                    execution_time_ms=total_duration,
                )
            )
        else:
            start = time.perf_counter()
            path = solver(request.cities)
            duration = (time.perf_counter() - start) * 1000
            distance = get_total_distance(request.cities, path)
            results.append(
                AnalysisResult(
                    algorithm=ALGORITHM_LABELS[algorithm],
                    distance=distance,
                    path=path,
                    execution_time_ms=duration,
                )
            )

    return AnalyzeResponse(results=results)

