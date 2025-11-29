import { City } from '../types';

const GRID_SIZE = 4096;

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

export function calculateSFCDebugInfo(cities: City[]): SFCDebugInfo[] {
    if (cities.length === 0) return [];

    const maxCoord = Math.max(
        Math.max(...cities.map(c => c.x)),
        Math.max(...cities.map(c => c.y)),
        1
    );

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
            order: 0
        };
    });

    enriched.sort((a, b) => a.hilbertKey - b.hilbertKey);
    enriched.forEach((item, index) => {
        item.order = index + 1;
    });

    return enriched;
}

export function generateHilbertCurvePoints(
    canvasWidth: number,
    canvasHeight: number,
    order: number = 4
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

export function getSFCPath(cities: City[]): number[] {
    const debugInfo = calculateSFCDebugInfo(cities);
    return debugInfo.map(info => info.cityId);
}

export function formatHilbertKey(key: number): string {
    return key.toLocaleString();
}
