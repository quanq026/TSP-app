import React, { useState, useCallback, useEffect, useRef } from 'react';
import Canvas from './components/Canvas';
import ControlPanel from './components/ControlPanel';
import AnalysisModal from './components/AnalysisModal';
import { City, AlgorithmType, AnalysisResult, Language } from './types';
import { translations } from './utils/translations';
import { 
  solveNearestNeighborFull, 
  solveACO, 
  solveSpaceFillingCurve, 
  getTotalDistance 
} from './utils/algorithms';

const App: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [path, setPath] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
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

  const handleRandomize = useCallback((count: number) => {
    // Get actual dimensions from the DOM element to ensure points fill the screen
    let width = 800;
    let height = 600;
    
    if (canvasContainerRef.current) {
      width = canvasContainerRef.current.clientWidth;
      height = canvasContainerRef.current.clientHeight;
    }

    // Add padding to keep points away from the absolute edges
    const padding = 30;
    const safeWidth = width - (padding * 2);
    const safeHeight = height - (padding * 2);

    const newCities: City[] = [];
    for (let i = 0; i < count; i++) {
      newCities.push({
        id: i,
        // Distribute randomly within the safe area + offset by padding
        x: (Math.random() * safeWidth) + padding,
        y: (Math.random() * safeHeight) + padding
      });
    }
    setCities(newCities);
    setPath([]);
    setIsRunning(false);
  }, []);

  const handleClear = useCallback(() => {
    setCities([]);
    setPath([]);
    setIsRunning(false);
  }, []);

  const runVisualization = useCallback(() => {
    if (cities.length < 2) return;
    
    // Calculate the full path immediately based on selected algorithm
    let computedPath: number[] = [];
    
    switch (selectedAlgorithm) {
      case AlgorithmType.NEAREST_NEIGHBOR:
        computedPath = solveNearestNeighborFull(cities);
        break;
      case AlgorithmType.ACO:
        computedPath = solveACO(cities);
        break;
      case AlgorithmType.SPACE_FILLING_CURVE:
        computedPath = solveSpaceFillingCurve(cities);
        break;
    }

    targetPathRef.current = computedPath;
    setPath([]); // Clear current path to redraw
    setIsRunning(true);
  }, [cities, selectedAlgorithm]);

  const handleAnalyze = useCallback(() => {
    if (cities.length < 3) return;

    const results: AnalysisResult[] = [];

    // 1. Nearest Neighbor
    const t1 = performance.now();
    const p1 = solveNearestNeighborFull(cities);
    const t2 = performance.now();
    results.push({
      algorithm: 'Nearest Neighbor',
      distance: getTotalDistance(cities, p1),
      path: p1,
      executionTime: t2 - t1
    });

    // 2. Space Filling Curve
    const t3 = performance.now();
    const p2 = solveSpaceFillingCurve(cities);
    const t4 = performance.now();
    results.push({
      algorithm: 'Space Filling Curve',
      distance: getTotalDistance(cities, p2),
      path: p2,
      executionTime: t4 - t3
    });

    // 3. ACO
    const t5 = performance.now();
    const p3 = solveACO(cities);
    const t6 = performance.now();
    results.push({
      algorithm: 'Ant Colony Opt.',
      distance: getTotalDistance(cities, p3),
      path: p3,
      executionTime: t6 - t5
    });

    setAnalysisResults(results);
    setIsAnalysisOpen(true);
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
               isRunning={isRunning}
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
        isRunning={isRunning}
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