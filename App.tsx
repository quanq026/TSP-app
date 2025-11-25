import React, { useState, useCallback, useEffect, useRef } from 'react';
import Canvas from './components/Canvas';
import ControlPanel from './components/ControlPanel';
import AnalysisModal from './components/AnalysisModal';
import { City, AlgorithmType, AnalysisResult, Language } from './types';
import { translations } from './utils/translations';
import { fetchRandomCities, solveTsp, analyzeAlgorithms } from './utils/api';
import { getTotalDistance } from './utils/geometry';

const App: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [path, setPath] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComputing, setIsComputing] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>(AlgorithmType.NEAREST_NEIGHBOR);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('vi'); // Default to Vietnamese based on user language

  // We store the calculated full path here to animate it step-by-step
  const targetPathRef = useRef<number[]>([]);
  const timerRef = useRef<number | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  const handleCanvasClick = useCallback((x: number, y: number) => {
    const newCity: City = {
      id: Date.now(),
      x,
      y
    };
    setCities(prev => [...prev, newCity]);
    setPath([]);
    setIsRunning(false);
  }, []);

  const handleRandomize = useCallback(async (count: number) => {
    // Get actual dimensions from the DOM element to ensure points fill the screen
    let width = 800;
    let height = 600;

    if (canvasContainerRef.current) {
      width = canvasContainerRef.current.clientWidth;
      height = canvasContainerRef.current.clientHeight;
    }

    setIsComputing(true);
    try {
      const generated = await fetchRandomCities(
        count,
        Math.max(width, 100),
        Math.max(height, 100)
      );
      setCities(generated);
      setPath([]);
      setIsRunning(false);
    } catch (error) {
      console.error('Failed to fetch random cities', error);
    } finally {
      setIsComputing(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setCities([]);
    setPath([]);
    setIsRunning(false);
  }, []);

  const runVisualization = useCallback(async () => {
    if (cities.length < 2) return;

    setIsComputing(true);
    try {
      const result = await solveTsp(selectedAlgorithm, cities);
      targetPathRef.current = result.path;
      setPath([]);
      setIsRunning(true);
    } catch (error) {
      console.error('Failed to solve TSP', error);
    } finally {
      setIsComputing(false);
    }
  }, [cities, selectedAlgorithm]);

  const handleAnalyze = useCallback(async () => {
    if (cities.length < 3) return;

    setIsComputing(true);
    try {
      const results = await analyzeAlgorithms(cities);
      setAnalysisResults(results);
      setIsAnalysisOpen(true);
    } catch (error) {
      console.error('Failed to analyze algorithms', error);
    } finally {
      setIsComputing(false);
    }
  }, [cities]);

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

        // Add one city from the target path at a time
        const nextIndex = prevPath.length;
        return [...prevPath, target[nextIndex]];
      });
    };

    // Speed depends on algorithm complexity? No, keep animation uniform
    timerRef.current = window.setTimeout(step, 50);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, path]); // Dependency on path ensures subsequent steps

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-900 text-white overflow-hidden">
      {/* Main Visualizer Area */}
      <div className="flex-1 p-4 h-full flex flex-col">
        <div className="flex-1 relative bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
          {/* Attach ref to this container to measure actual size */}
          <div ref={canvasContainerRef} className="absolute inset-0 p-4">
            <Canvas
              cities={cities}
              path={path}
              onCanvasClick={handleCanvasClick}
              isRunning={isRunning || isComputing}
              language={language}
            />
          </div>

          <div className="absolute top-4 left-8 bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-400 pointer-events-none">
            {t.algorithm}: <span className="text-emerald-400 font-bold">{t.algoNames[selectedAlgorithm]}</span>
          </div>
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
        isRunning={isRunning || isComputing}
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