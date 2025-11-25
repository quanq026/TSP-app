import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Trash2, Activity, Globe } from 'lucide-react';
import { AlgorithmType, Language } from '../types';
import { translations } from '../utils/translations';

interface ControlPanelProps {
  onRun: () => void;
  onClear: () => void;
  onRandomize: (count: number) => void;
  onAlgorithmChange: (algo: AlgorithmType) => void;
  onAnalyze: () => void;
  onLanguageChange: (lang: Language) => void;
  selectedAlgorithm: AlgorithmType;
  isRunning: boolean;
  cityCount: number;
  totalDistance: number;
  language: Language;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onRun,
  onClear,
  onRandomize,
  onAlgorithmChange,
  onAnalyze,
  onLanguageChange,
  selectedAlgorithm,
  isRunning,
  cityCount,
  totalDistance,
  language
}) => {
  // Use string state to allow empty input during typing
  const [inputValue, setInputValue] = useState<string>("30");
  const t = translations[language];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow digits and empty string
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
      setInputValue(val);
    }
  };

  const handleBlur = () => {
    // Validate on blur
    let num = parseInt(inputValue, 10);
    if (isNaN(num) || num < 3) num = 3;
    if (num > 500) num = 500;
    setInputValue(num.toString());
  };

  const handleRandomizeClick = () => {
    let num = parseInt(inputValue, 10);
    if (isNaN(num) || num < 3) num = 3;
    if (num > 500) num = 500;
    
    // Update input if it was corrected
    setInputValue(num.toString());
    onRandomize(num);
  };

  return (
    <div className="w-full lg:w-80 bg-slate-800 p-6 flex flex-col gap-6 border-l border-slate-700 h-full overflow-y-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
            {t.title}
          </h1>
          <p className="text-slate-400 text-sm">
            {t.subtitle}
          </p>
        </div>
      </div>
      
      {/* Language Switcher */}
      <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
        <button 
          onClick={() => onLanguageChange('en')}
          className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-all ${language === 'en' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
        >
          English
        </button>
        <button 
          onClick={() => onLanguageChange('vi')}
          className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-all ${language === 'vi' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Tiếng Việt
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t.algorithm}</label>
          <select 
            value={selectedAlgorithm}
            onChange={(e) => onAlgorithmChange(e.target.value as AlgorithmType)}
            disabled={isRunning}
            className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 outline-none focus:border-blue-500 transition-colors"
          >
            <option value={AlgorithmType.NEAREST_NEIGHBOR}>{t.algoNames[AlgorithmType.NEAREST_NEIGHBOR]}</option>
            <option value={AlgorithmType.ACO}>{t.algoNames[AlgorithmType.ACO]}</option>
            <option value={AlgorithmType.SPACE_FILLING_CURVE}>{t.algoNames[AlgorithmType.SPACE_FILLING_CURVE]}</option>
          </select>
          <p className="mt-2 text-xs text-slate-500 italic leading-relaxed">
            {t.algoDescriptions[selectedAlgorithm]}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div className="bg-slate-700/50 p-3 rounded-lg">
             <span className="text-xs text-slate-400 block">{t.cities}</span>
             <span className="text-xl font-mono font-semibold text-white">{cityCount}</span>
           </div>
           <div className="bg-slate-700/50 p-3 rounded-lg">
             <span className="text-xs text-slate-400 block">{t.distance}</span>
             <span className="text-xl font-mono font-semibold text-emerald-400">
               {totalDistance.toFixed(0)}
             </span>
           </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onRun}
          disabled={isRunning || cityCount < 2}
          className={`flex items-center justify-center gap-2 p-3 rounded-lg font-medium transition-all ${
            isRunning || cityCount < 2
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
          }`}
        >
          <Play size={18} />
          {isRunning ? t.running : t.run}
        </button>

        <button
          onClick={onAnalyze}
          disabled={isRunning || cityCount < 3}
          className={`flex items-center justify-center gap-2 p-3 rounded-lg font-medium transition-all border ${
            isRunning || cityCount < 3 
            ? 'border-slate-700 text-slate-600 cursor-not-allowed'
            : 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10'
          }`}
        >
          <Activity size={18} />
          {t.analyze}
        </button>

        <div className="h-px bg-slate-700 my-1"></div>

        <div className="flex gap-2">
           <div className="w-1/4">
             <input 
                type="text" 
                inputMode="numeric"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={isRunning}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 outline-none text-center focus:border-blue-500 transition-colors"
                title="Number of cities"
             />
           </div>
           <button
            onClick={handleRandomizeClick}
            disabled={isRunning}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-all"
          >
            <RotateCcw size={18} />
            {t.randomize}
          </button>
        </div>

        <button
          onClick={onClear}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 transition-all border border-transparent hover:border-red-500/50"
        >
          <Trash2 size={18} />
          {t.clear}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
