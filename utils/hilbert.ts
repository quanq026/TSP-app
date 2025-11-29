/**
 * Hilbert Curve Utilities for SFC Debug Visualization
 * Tính toán Hilbert key hoàn toàn ở frontend để debug
 */

import { City } from '../types';

const GRID_SIZE = 4096;

/**
 * Rotate quadrant to follow Hilbert curve ordering
 */
function rotateQuadrant(size: number, x: number, y: number, rx: number, ry: number): [number, number] {
    if (ry === 0) {
        if (rx === 1) {
            x = size - 1 - x;
            y = size - 1 - y;
        }
        [x, y] = [y, x];
    }
    return [x, y];
}

/**
 * Map 2D grid coordinates to 1D Hilbert curve distance
 */
function hilbertDistance(size: number, x: number, y: number): number {
    let d = 0;
    let step = Math.floor(size / 2);

    while (step > 0) {
        const rx = (x & step) ? 1 : 0;
        const ry = (y & step) ? 1 : 0;
        d += step * step * ((3 * rx) ^ ry);
        [x, y] = rotateQuadrant(step, x, y, rx, ry);
        step = Math.floor(step / 2);
    }

    return d;
}

/**
 * Convert Hilbert distance back to 2D coordinates (for drawing curve)
 */
function hilbertToXY(size: number, d: number): [number, number] {
    let x = 0, y = 0;
    let step = 1;

    while (step < size) {
        const rx = 1 & Math.floor(d / 2);
        const ry = 1 & (d ^ rx);

        if (ry === 0) {
            if (rx === 1) {
                x = step - 1 - x;
                y = step - 1 - y;
            }
            [x, y] = [y, x];
        }

        x += step * rx;
        y += step * ry;
        d = Math.floor(d / 4);
        step *= 2;
    }

    return [x, y];
}

export interface SFCDebugInfo {
    cityId: number;
    originalX: number;
    originalY: number;
    normalizedX: number;
    normalizedY: number;
    hilbertKey: number;
    order: number;
}

/**
 * Calculate SFC debug info for all cities
 */
export function calculateSFCDebugInfo(cities: City[]): SFCDebugInfo[] {
    if (cities.length === 0) return [];

    // Find max coordinate for normalization
    const maxCoord = Math.max(
        Math.max(...cities.map(c => c.x)),
        Math.max(...cities.map(c => c.y)),
        1
    );

    // Calculate Hilbert key for each city
    const enriched = cities.map(city => {
        const scale = GRID_SIZE - 1;
        const nx = Math.floor((city.x / maxCoord) * scale);
        const ny = Math.floor((city.y / maxCoord) * scale);
        const hilbertKey = hilbertDistance(GRID_SIZE, nx, ny);

        return {
            cityId: city.id,
            originalX: city.x,
            originalY: city.y,
            normalizedX: nx,
            normalizedY: ny,
            hilbertKey,
            order: 0 // Will be set after sorting
        };
    });

    // Sort by Hilbert key and assign order
    enriched.sort((a, b) => a.hilbertKey - b.hilbertKey);
    enriched.forEach((item, index) => {
        item.order = index + 1;
    });

    return enriched;
}

/**
 * Generate Hilbert curve points for visualization
 * Returns points in canvas coordinates
 */
export function generateHilbertCurvePoints(
    canvasWidth: number,
    canvasHeight: number,
    order: number = 4 // 2^4 = 16x16 grid, good balance of detail vs performance
): Array<{ x: number; y: number }> {
    const size = Math.pow(2, order);
    const totalPoints = size * size;
    const points: Array<{ x: number; y: number }> = [];

    const scaleX = canvasWidth / size;
    const scaleY = canvasHeight / size;

    for (let d = 0; d < totalPoints; d++) {
        const [gx, gy] = hilbertToXY(size, d);
        points.push({
            x: (gx + 0.5) * scaleX,
            y: (gy + 0.5) * scaleY
        });
    }

    return points;
}

/**
 * Get the predicted SFC path (order of city IDs)
 */
export function getSFCPath(cities: City[]): number[] {
    const debugInfo = calculateSFCDebugInfo(cities);
    return debugInfo.map(info => info.cityId);
}

/**
 * Format Hilbert key for display (with thousand separators)
 */
export function formatHilbertKey(key: number): string {
    return key.toLocaleString();
}
