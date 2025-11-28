import React from 'react';
import { SFCDebugData } from '../types';
import { theme, withOpacity } from '../utils/theme';

interface SFCDebugOverlayProps {
    debugData: SFCDebugData;
    canvasWidth: number;
    canvasHeight: number;
}

const SFCDebugOverlay: React.FC<SFCDebugOverlayProps> = ({
    debugData,
    canvasWidth,
    canvasHeight,
}) => {
    const { cities_debug, hilbert_path, display_grid_size } = debugData;

    // Calculate cell size for grid
    const cellWidth = canvasWidth / display_grid_size;
    const cellHeight = canvasHeight / display_grid_size;

    // Generate Hilbert curve path string (points already in canvas coords from backend)
    const hilbertPathString = hilbert_path
        .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ');

    // Sort cities by order for drawing the Hilbert path
    const sortedCities = [...cities_debug].sort((a, b) => a.order - b.order);

    // Generate path points for the Hilbert ordering line (cities already in canvas coords)
    const pathPoints = sortedCities
        .map((city) => `${city.x},${city.y}`)
        .join(' ');

    return (
        <g className="sfc-debug-overlay">
            {/* Draw grid lines */}
            {Array.from({ length: display_grid_size + 1 }).map((_, i) => (
                <g key={`grid-${i}`}>
                    {/* Vertical lines */}
                    <line
                        x1={i * cellWidth}
                        y1={0}
                        x2={i * cellWidth}
                        y2={canvasHeight}
                        stroke={withOpacity(theme.colors.muted, 0.3)}
                        strokeWidth="0.5"
                    />
                    {/* Horizontal lines */}
                    <line
                        x1={0}
                        y1={i * cellHeight}
                        x2={canvasWidth}
                        y2={i * cellHeight}
                        stroke={withOpacity(theme.colors.muted, 0.3)}
                        strokeWidth="0.5"
                    />
                </g>
            ))}

            {/* Draw Hilbert curve path (RED line) */}
            <path
                d={hilbertPathString}
                fill="none"
                stroke="#ff4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.7}
                className="pointer-events-none"
            />

            {/* Draw Hilbert ordering path (dashed line showing the order) */}
            <polyline
                points={pathPoints}
                fill="none"
                stroke={withOpacity(theme.colors.iris, 0.6)}
                strokeWidth="1.5"
                strokeDasharray="4,4"
                className="pointer-events-none"
            />

            {/* Draw order labels for each city */}
            {cities_debug.map((city) => (
                <g key={`debug-${city.city_id}`}>
                    {/* Order badge background */}
                    <circle
                        cx={city.x - 12}
                        cy={city.y - 12}
                        r={10}
                        fill={theme.colors.iris}
                        opacity={0.9}
                    />
                    {/* Order number */}
                    <text
                        x={city.x - 12}
                        y={city.y - 8}
                        fill={theme.colors.text}
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="pointer-events-none select-none"
                    >
                        {city.order}
                    </text>

                    {/* Hilbert distance label (smaller, below city) */}
                    <text
                        x={city.x}
                        y={city.y + 18}
                        fill={withOpacity(theme.colors.gold, 0.9)}
                        fontSize="8"
                        textAnchor="middle"
                        className="pointer-events-none select-none"
                    >
                        H:{Math.round(city.hilbert_distance / 1000)}k
                    </text>
                </g>
            ))}
        </g>
    );
};

export default SFCDebugOverlay;
