from __future__ import annotations

from enum import Enum
from typing import List

from pydantic import BaseModel, Field


class AlgorithmType(str, Enum):
    NEAREST_NEIGHBOR = "NEAREST_NEIGHBOR"
    ACO = "ACO"
    SPACE_FILLING_CURVE = "SPACE_FILLING_CURVE"


class City(BaseModel):
    id: int = Field(..., ge=0)
    x: float = Field(...)
    y: float = Field(...)


class SolveRequest(BaseModel):
    algorithm: AlgorithmType
    cities: List[City]


class SolveResponse(BaseModel):
    algorithm: AlgorithmType
    path: List[int]
    total_distance: float
    execution_time_ms: float


class AnalysisResult(BaseModel):
    algorithm: str
    distance: float
    path: List[int]
    execution_time_ms: float


class AnalyzeRequest(BaseModel):
    cities: List[City]


class AnalyzeResponse(BaseModel):
    results: List[AnalysisResult]

class RandomCitiesResponse(BaseModel):
    cities: List[City]


class SFCCityDebug(BaseModel):
    city_id: int
    x: float
    y: float
    normalized_x: int
    normalized_y: int
    hilbert_distance: int
    order: int


class SFCDebugRequest(BaseModel):
    cities: List[City]
    canvas_width: float = 800
    canvas_height: float = 600


class HilbertPoint(BaseModel):
    x: float
    y: float


class SFCDebugResponse(BaseModel):
    cities_debug: List[SFCCityDebug]
    max_coord: float
    grid_size: int
    hilbert_path: List[HilbertPoint]
    display_grid_size: int

