import React, { useMemo } from 'react';
import { X, Trophy, Timer, BarChart3, Ruler } from 'lucide-react';
import { AnalysisResult, City, Language, AlgorithmType } from '../types';
import { translations } from '../utils/translations';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: AnalysisResult[];
  cities: City[];
  language: Language;
}

const PathPreview: React.FC<{ cities: City[]; path: number[]; color: string }> = ({ cities, path, color }) => {
  // Calculate bounding box to create a perfect viewBox
  const bounds = useMemo(() => {
    if (cities.length === 0) return { minX: 0, minY: 0, width: 100, height: 100 };
    const xs = cities.map(c => c.x);
    const ys = cities.map(c => c.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const padding = 20;
    return {
      minX: minX - padding,
      minY: minY - padding,
      width: (maxX - minX) + (padding * 2),
      height: (maxY - minY) + (padding * 2)
    };
  }, [cities]);

  return (
    <div className="w-full h-32 rounded-md overflow-hidden" style={{ backgroundColor: '#191724', border: '1px solid rgba(38, 35, 58, 0.5)' }}>
      <svg
        viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Draw Path */}
        <polyline
          points={path.map(id => {
            const c = cities.find(city => city.id === id);
            return c ? `${c.x},${c.y}` : '';
          }).join(' ')}
          fill="none"
          stroke={color}
          strokeWidth={Math.max(2, bounds.width / 150)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Close Loop */}
        {path.length > 0 && (
          <line
            x1={cities.find(c => c.id === path[path.length - 1])?.x}
            y1={cities.find(c => c.id === path[path.length - 1])?.y}
            x2={cities.find(c => c.id === path[0])?.x}
            y2={cities.find(c => c.id === path[0])?.y}
            stroke={color}
            strokeWidth={Math.max(2, bounds.width / 150)}
            strokeDasharray={`${Math.max(4, bounds.width / 100)},${Math.max(4, bounds.width / 100)}`}
            className="opacity-50"
          />
        )}
        {/* Draw Dots */}
        {cities.map(c => (
          <circle
            key={c.id}
            cx={c.x}
            cy={c.y}
            r={Math.max(3, bounds.width / 200)}
            fill="#6e6a86"
          />
        ))}
      </svg>
    </div>
  );
};

interface ChartProps {
  title: string;
  icon: React.ReactNode;
  data: { label: string; value: number; color: string }[];
  unit: string;
  lowerIsBetter?: boolean;
}

const MetricChart: React.FC<ChartProps> = ({ title, icon, data, unit, lowerIsBetter = true }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="p-4 rounded-xl flex-1" style={{ backgroundColor: 'rgba(25, 23, 36, 0.5)', border: '1px solid rgba(38, 35, 58, 0.5)' }}>
      <div className="flex items-center gap-2 mb-4" style={{ color: '#908caa' }}>
        {icon}
        <h3 className="font-semibold text-sm uppercase tracking-wide">{title}</h3>
      </div>
      <div className="space-y-3">
        {data.map((item) => {
          const percent = (item.value / maxValue) * 100;
          return (
            <div key={item.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium" style={{ color: '#908caa' }}>{item.label}</span>
                <span className="font-mono" style={{ color: '#e0def4' }}>
                  {item.value.toFixed(1)}{unit}
                </span>
              </div>
              <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ backgroundColor: '#1f1d2e' }}>
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out relative"
                  style={{ width: `${percent}%`, backgroundColor: item.color }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, results, cities, language }) => {
  const t = translations[language];

  if (!isOpen) return null;

  // Find the best algorithm (shortest distance)
  const sortedResults = [...results].sort((a, b) => a.distance - b.distance);
  const winner = sortedResults[0];

  // Helper to get translated name
  const getAlgoName = (key: string) => {
    // Attempt to match the string key back to the enum, or just display raw if not found
    // Since we store raw string keys in AnalysisResult, we might need to map them.
    // However, in App.tsx we should store the Enum value in results for cleaner mapping.
    // For now, we'll try to map based on known strings or just show the string.
    if (key === 'Nearest Neighbor') return t.algoNames[AlgorithmType.NEAREST_NEIGHBOR];
    if (key === 'Ant Colony Opt.') return t.algoNames[AlgorithmType.ACO];
    if (key === 'Space Filling Curve') return t.algoNames[AlgorithmType.SPACE_FILLING_CURVE];
    return key;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
      <div className="rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh]" style={{ backgroundColor: '#1f1d2e', border: '1px solid #26233a' }}>
        <div className="flex items-center justify-between p-5 shrink-0" style={{ borderBottom: '1px solid #26233a', backgroundColor: '#1f1d2e' }}>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#e0def4' }}>
            <span style={{ color: '#9ccfd8' }}>📊</span> {t.analysis.title}
          </h2>
          <button onClick={onClose} className="transition-colors" style={{ color: '#908caa' }} onMouseEnter={(e) => e.currentTarget.style.color = '#e0def4'} onMouseLeave={(e) => e.currentTarget.style.color = '#908caa'}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarColor: '#26233a transparent' }}>

          {/* Winner Banner */}
          <div className="p-4 rounded-lg flex items-center gap-4 mb-8" style={{ background: 'linear-gradient(to right, rgba(156, 207, 216, 0.1), rgba(49, 116, 143, 0.1))', border: '1px solid rgba(156, 207, 216, 0.3)' }}>
            <div className="p-3 rounded-full shrink-0" style={{ backgroundColor: 'rgba(156, 207, 216, 0.2)' }}>
              <Trophy style={{ color: '#9ccfd8' }} size={32} />
            </div>
            <div>
              <p className="font-medium text-sm" style={{ color: '#9ccfd8' }}>{t.analysis.winnerTitle}</p>
              <p className="text-2xl font-bold" style={{ color: '#e0def4' }}>{getAlgoName(winner?.algorithm)}</p>
              <p className="text-sm" style={{ color: '#908caa' }}>{t.analysis.totalDist}: <span className="font-mono" style={{ color: '#e0def4' }}>{winner?.distance.toFixed(1)}</span></p>
            </div>
          </div>

          {/* Detailed Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {sortedResults.map((result, idx) => {
              const isWinner = idx === 0;
              const relative = ((result.distance / winner.distance) * 100).toFixed(1);
              const color = isWinner ? '#9ccfd8' : '#6e6a86';

              return (
                <div key={result.algorithm} className="flex flex-col p-4 rounded-lg border h-full" style={isWinner ? { backgroundColor: 'rgba(156, 207, 216, 0.1)', borderColor: 'rgba(156, 207, 216, 0.5)' } : { backgroundColor: 'rgba(38, 35, 58, 0.3)', borderColor: '#26233a' }}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-sm" style={{ color: isWinner ? '#e0def4' : '#908caa' }}>{getAlgoName(result.algorithm)}</h3>
                      <div className="text-xs flex items-center gap-1 mt-1" style={{ color: '#6e6a86' }}>
                        <Timer size={10} /> {result.executionTime.toFixed(1)}ms
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full" style={isWinner ? { backgroundColor: 'rgba(156, 207, 216, 0.2)', color: '#9ccfd8' } : { backgroundColor: '#26233a', color: '#908caa' }}>
                      {relative}%
                    </span>
                  </div>

                  <div className="mb-3">
                    <span className="text-2xl font-mono font-medium block" style={{ color: '#e0def4' }}>
                      {result.distance.toFixed(0)}
                    </span>
                    <span className="text-xs uppercase tracking-wider" style={{ color: '#6e6a86' }}>{t.analysis.totalDist}</span>
                  </div>

                  <div className="mt-auto pt-2">
                    <PathPreview cities={cities} path={result.path} color={color} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Charts Section */}
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#e0def4' }}>
            <BarChart3 style={{ color: '#31748f' }} size={20} />
            Performance Comparison
          </h3>

          <div className="flex flex-col lg:flex-row gap-6">
            <MetricChart
              title={t.analysis.chartDist}
              icon={<Ruler size={16} />}
              unit=" px"
              data={results.map(r => ({
                label: getAlgoName(r.algorithm),
                value: r.distance,
                color: r.distance === winner.distance ? '#9ccfd8' : '#6e6a86'
              }))}
            />

            <MetricChart
              title={t.analysis.chartTime}
              icon={<Timer size={16} />}
              unit=" ms"
              data={results.map(r => ({
                label: getAlgoName(r.algorithm),
                value: r.executionTime,
                color: r.executionTime < 1 ? '#31748f' : (r.executionTime > 20 ? '#f6c177' : '#c4a7e7')
              }))}
            />
          </div>

        </div>

        <div className="p-4 text-center shrink-0" style={{ backgroundColor: 'rgba(25, 23, 36, 0.5)', borderTop: '1px solid #26233a' }}>
          <p className="text-xs" style={{ color: '#6e6a86' }}>
            {t.analysis.note}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;
