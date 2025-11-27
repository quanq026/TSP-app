import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Canvas from './components/Canvas';
import ControlPanel from './components/ControlPanel';
import AnalysisModal from './components/AnalysisModal';
import { City, AlgorithmType, AnalysisResult, Language } from './types';
import { translations } from './utils/translations';
import { fetchRandomCities, solveTsp, analyzeAlgorithms } from './utils/api';
import { getTotalDistance } from './utils/geometry';
import { theme, withOpacity } from './utils/theme';

const DEFAULT_CANVAS_SIZE = { width: 800, height: 600 };
const MIN_DIMENSION = 100;
const STEP_DELAY_MS = 50;

const ensureMinDimension = (value: number) => Math.max(value, MIN_DIMENSION);

// Counter for unique city IDs (avoids Date.now() collision on rapid clicks)
let cityIdCounter = 0;
const getNextCityId = () => ++cityIdCounter;

const App: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [path, setPath] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComputing, setIsComputing] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>(AlgorithmType.NEAREST_NEIGHBOR);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('vi'); // Default to Vietnamese based on user language
  const [error, setError] = useState<string | null>(null);

  // We store the calculated full path here to animate it step-by-step
  const targetPathRef = useRef<number[]>([]);
  const timerRef = useRef<number | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const t = useMemo(() => translations[language], [language]);
  const isBusy = isRunning || isComputing;

  const resetRunState = useCallback(() => {
    setPath([]);
    setIsRunning(false);
  }, []);

  const measureCanvas = useCallback(() => {
    const width = ensureMinDimension(
      canvasContainerRef.current?.clientWidth ?? DEFAULT_CANVAS_SIZE.width
    );
    const height = ensureMinDimension(
      canvasContainerRef.current?.clientHeight ?? DEFAULT_CANVAS_SIZE.height
    );
    return { width, height };
  }, []);

  const handleCanvasClick = useCallback(
    (x: number, y: number) => {
      const newCity: City = {
        id: getNextCityId(),
        x,
        y
      };
      setCities(prev => [...prev, newCity]);
      resetRunState();
      setError(null);
    },
    [resetRunState]
  );

  const handleRandomize = useCallback(
    async (count: number) => {
      setIsComputing(true);
      setError(null);
      try {
        const { width, height } = measureCanvas();
        const generated = await fetchRandomCities(count, width, height);
        // Update counter to avoid ID collision with fetched cities
        const maxId = Math.max(...generated.map(c => c.id), cityIdCounter);
        cityIdCounter = maxId;
        setCities(generated);
        resetRunState();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch random cities';
        setError(message);
        console.error('Failed to fetch random cities', err);
      } finally {
        setIsComputing(false);
      }
    },
    [measureCanvas, resetRunState]
  );

  const handleClear = useCallback(() => {
    setCities([]);
    resetRunState();
  }, [resetRunState]);

  const runVisualization = useCallback(async () => {
    if (cities.length < 2) return;

    setIsComputing(true);
    setError(null);
    try {
      const result = await solveTsp(selectedAlgorithm, cities);
      targetPathRef.current = result.path;
      resetRunState();
      setIsRunning(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to solve TSP';
      setError(message);
      console.error('Failed to solve TSP', err);
    } finally {
      setIsComputing(false);
    }
  }, [cities, selectedAlgorithm, resetRunState]);

  const handleAnalyze = useCallback(async () => {
    if (cities.length < 3) return;

    setIsComputing(true);
    setError(null);
    try {
      const results = await analyzeAlgorithms(cities);
      setAnalysisResults(results);
      setIsAnalysisOpen(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze algorithms';
      setError(message);
      console.error('Failed to analyze algorithms', err);
    } finally {
      setIsComputing(false);
    }
  }, [cities]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Animation Loop
  useEffect(() => {
    if (!isRunning) return;

    const step = () => {
      setPath(prevPath => {
        const target = targetPathRef.current;
        if (prevPath.length >= target.length) {
          setIsRunning(false);
          return prevPath;
        }

        const nextIndex = prevPath.length;
        return [...prevPath, target[nextIndex]];
      });
    };

    timerRef.current = window.setTimeout(step, STEP_DELAY_MS);

    return clearTimer;
  }, [isRunning, path, clearTimer]); // Dependency on path ensures subsequent steps

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden" style={{ backgroundColor: theme.colors.base, color: theme.colors.text }}>
      {/* Main Visualizer Area */}
      <div className="flex-1 p-4 h-full flex flex-col">
        <div className="flex-1 relative rounded-xl overflow-hidden shadow-2xl" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.overlay}` }}>
          {/* Attach ref to this container to measure actual size */}
          <div ref={canvasContainerRef} className="absolute inset-0 p-4">
            <Canvas
              cities={cities}
              path={path}
              onCanvasClick={handleCanvasClick}
              isRunning={isBusy}
              language={language}
            />
          </div>

          <div className="absolute top-4 left-8 backdrop-blur px-4 py-2 rounded-lg text-xs pointer-events-none" style={{ backgroundColor: withOpacity(theme.colors.base, 0.8), border: `1px solid ${theme.colors.overlay}`, color: theme.colors.subtle }}>
            {t.algorithm}: <span className="font-bold" style={{ color: theme.colors.foam }}>{t.algoNames[selectedAlgorithm]}</span>
          </div>

          {/* Error Toast */}
          {error && (
            <div
              className="absolute bottom-4 left-4 right-4 p-3 rounded-lg text-sm flex items-center justify-between cursor-pointer"
              style={{ backgroundColor: withOpacity(theme.colors.love, 0.9), color: theme.colors.text }}
              onClick={() => setError(null)}
            >
              <span>⚠️ {error}</span>
              <span className="text-xs opacity-70">Click to dismiss</span>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Controls */}
      <ControlPanel
        onRun={runVisualization}
        onClear={handleClear}
        onRandomize={handleRandomize}
        onAlgorithmChange={setSelectedAlgorithm}
        onAnalyze={handleAnalyze}
        onLanguageChange={setLanguage}
        selectedAlgorithm={selectedAlgorithm}
        isRunning={isBusy}
        cityCount={cities.length}
        totalDistance={getTotalDistance(cities, path)}
        language={language}
      />

      {/* Analysis Modal */}
      <AnalysisModal
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        results={analysisResults}
        cities={cities}
        language={language}
      />
    </div>
  );
};

export default App;