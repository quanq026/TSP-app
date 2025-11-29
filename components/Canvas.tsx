import React, { useRef, useMemo } from 'react';
import { City, Language, AlgorithmType } from '../types';
import { translations } from '../utils/translations';
import { theme, withOpacity } from '../utils/theme';
import { generateHilbertCurvePoints, calculateSFCDebugInfo } from '../utils/hilbert';

interface CanvasProps {
  cities: City[];
  path: number[];
  onCanvasClick: (x: number, y: number) => void;
  isRunning: boolean;
  language: Language;
  showHilbertCurve?: boolean;
  highlightedCityId?: number | null;
  selectedAlgorithm?: AlgorithmType;
}

const Canvas: React.FC<CanvasProps> = ({
  cities,
  path,
  onCanvasClick,
  isRunning,
  language,
  showHilbertCurve = false,
  highlightedCityId = null,
  selectedAlgorithm
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  const cityMap = useMemo(() => new Map(cities.map(c => [c.id, c])), [cities]);

  const hilbertCurvePoints = useMemo(() => {
    if (!showHilbertCurve || !containerRef.current) return [];
    const rect = containerRef.current.getBoundingClientRect();
    return generateHilbertCurvePoints(rect.width, rect.height, 5);
  }, [showHilbertCurve]);

  const sfcDebugInfo = useMemo(() => {
    if (selectedAlgorithm !== AlgorithmType.SPACE_FILLING_CURVE) return null;
    return calculateSFCDebugInfo(cities);
  }, [cities, selectedAlgorithm]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isRunning) return;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onCanvasClick(x, y);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="relative w-full h-full rounded-lg overflow-hidden shadow-inner cursor-crosshair"
      style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.overlay}` }}
    >
      <svg className="w-full h-full pointer-events-none">
        {/* Draw Hilbert Curve Background */}
        {showHilbertCurve && hilbertCurvePoints.length > 1 && (
          <path
            d={`M ${hilbertCurvePoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
            fill="none"
            stroke={withOpacity(theme.colors.iris, 0.3)}
            strokeWidth="1"
            className="transition-opacity duration-500"
          />
        )}

        {/* Draw Path */}
        {path.length > 1 && path.map((cityId, index) => {
          if (index === path.length - 1) return null;
          const c1 = cityMap.get(cityId);
          const c2 = cityMap.get(path[index + 1]);
          if (!c1 || !c2) return null;
          return (
            <line
              key={`line-${index}`}
              x1={c1.x}
              y1={c1.y}
              x2={c2.x}
              y2={c2.y}
              stroke={theme.colors.foam}
              strokeWidth="2"
              className="drop-shadow-md"
            />
          );
        })}

        {/* Draw Closing Line if complete */}
        {path.length === cities.length && cities.length > 1 && (
          <line
            x1={cityMap.get(path[path.length - 1])?.x}
            y1={cityMap.get(path[path.length - 1])?.y}
            x2={cityMap.get(path[0])?.x}
            y2={cityMap.get(path[0])?.y}
            stroke={theme.colors.foam}
            strokeWidth="2"
            strokeDasharray="5,5"
            className="opacity-50"
          />
        )}

        {/* Draw Cities */}
        {cities.map((city, index) => {
          const isStart = path[0] === city.id;
          const isCurrent = path[path.length - 1] === city.id;
          const isVisited = path.includes(city.id);
          const isHighlighted = highlightedCityId === city.id;

          const sfcOrder = sfcDebugInfo?.find(info => info.cityId === city.id)?.order;

          return (
            <g key={city.id}>
              {/* Highlight ring for hovered city */}
              {isHighlighted && (
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={14}
                  fill="none"
                  stroke={theme.colors.gold}
                  strokeWidth="3"
                  className="animate-pulse"
                />
              )}
              <circle
                cx={city.x}
                cy={city.y}
                r={isHighlighted ? 10 : isCurrent ? 8 : 6}
                fill={isStart ? theme.colors.pine : isCurrent ? theme.colors.gold : isVisited ? theme.colors.foam : theme.colors.love}
                className="transition-all duration-300"
              />
              {/* Show SFC order when in SFC mode */}
              {sfcOrder !== undefined && selectedAlgorithm === AlgorithmType.SPACE_FILLING_CURVE && (
                <g>
                  <circle
                    cx={city.x + 12}
                    cy={city.y - 12}
                    r={9}
                    fill={theme.colors.iris}
                    stroke={theme.colors.surface}
                    strokeWidth="1"
                  />
                  <text
                    x={city.x + 12}
                    y={city.y - 8}
                    fill={theme.colors.text}
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="pointer-events-none select-none"
                  >
                    {sfcOrder}
                  </text>
                </g>
              )}
              <text
                x={city.x + (sfcOrder !== undefined ? -12 : 10)}
                y={city.y + 4}
                fill={withOpacity(theme.colors.text, 0.7)}
                fontSize="10"
                textAnchor={sfcOrder !== undefined ? 'end' : 'start'}
                className="pointer-events-none select-none"
              >
                {index + 1}
              </text>
            </g>
          );
        })}
      </svg>

      {cities.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ color: theme.colors.muted }}>
          <p>{t.clickToAdd}</p>
        </div>
      )}
    </div>
  );
};

export default Canvas;
