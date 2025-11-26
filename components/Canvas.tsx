import React, { useRef, useEffect } from 'react';
import { City, Language } from '../types';
import { translations } from '../utils/translations';

interface CanvasProps {
  cities: City[];
  path: number[];
  onCanvasClick: (x: number, y: number) => void;
  isRunning: boolean;
  language: Language;
}

const Canvas: React.FC<CanvasProps> = ({ cities, path, onCanvasClick, isRunning, language }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

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
      style={{ backgroundColor: '#1f1d2e', border: '1px solid #26233a' }}
    >
      <svg className="w-full h-full pointer-events-none">
        {/* Draw Path */}
        {path.length > 1 && path.map((cityId, index) => {
          if (index === path.length - 1) return null;
          const c1 = cities.find(c => c.id === cityId);
          const c2 = cities.find(c => c.id === path[index + 1]);
          if (!c1 || !c2) return null;
          return (
            <line
              key={`line-${index}`}
              x1={c1.x}
              y1={c1.y}
              x2={c2.x}
              y2={c2.y}
              stroke="#9ccfd8" // foam
              strokeWidth="2"
              className="drop-shadow-md"
            />
          );
        })}

        {/* Draw Closing Line if complete */}
        {path.length === cities.length && cities.length > 1 && (
          <line
            x1={cities.find(c => c.id === path[path.length - 1])?.x}
            y1={cities.find(c => c.id === path[path.length - 1])?.y}
            x2={cities.find(c => c.id === path[0])?.x}
            y2={cities.find(c => c.id === path[0])?.y}
            stroke="#9ccfd8"
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

          return (
            <g key={city.id}>
              <circle
                cx={city.x}
                cy={city.y}
                r={isCurrent ? 8 : 6}
                fill={isStart ? '#31748f' : isCurrent ? '#f6c177' : isVisited ? '#9ccfd8' : '#eb6f92'}
                className="transition-all duration-300"
              />
              <text
                x={city.x + 10}
                y={city.y + 4}
                fill="rgba(224, 222, 244, 0.7)"
                fontSize="10"
                className="pointer-events-none select-none"
              >
                {index + 1}
              </text>
            </g>
          );
        })}
      </svg>

      {cities.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ color: '#6e6a86' }}>
          <p>{t.clickToAdd}</p>
        </div>
      )}
    </div>
  );
};

export default Canvas;
