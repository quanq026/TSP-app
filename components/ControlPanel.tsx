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
    <div className="w-full lg:w-80 p-6 flex flex-col gap-6 h-full overflow-y-auto" style={{ backgroundColor: '#1f1d2e', borderLeft: '1px solid #26233a' }}>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-2" style={{ background: 'linear-gradient(to right, #31748f, #9ccfd8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {t.title}
          </h1>
          <p className="text-sm" style={{ color: '#908caa' }}>
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Language Switcher */}
      <div className="flex rounded-lg p-1" style={{ backgroundColor: '#191724', border: '1px solid #26233a' }}>
        <button
          onClick={() => onLanguageChange('en')}
          className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-all ${language === 'en' ? 'shadow-sm' : ''}`}
          style={language === 'en' ? { backgroundColor: '#26233a', color: '#e0def4' } : { color: '#6e6a86' }}
          onMouseEnter={(e) => { if (language !== 'en') e.currentTarget.style.color = '#908caa'; }}
          onMouseLeave={(e) => { if (language !== 'en') e.currentTarget.style.color = '#6e6a86'; }}
        >
          English
        </button>
        <button
          onClick={() => onLanguageChange('vi')}
          className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-all ${language === 'vi' ? 'shadow-sm' : ''}`}
          style={language === 'vi' ? { backgroundColor: '#26233a', color: '#e0def4' } : { color: '#6e6a86' }}
          onMouseEnter={(e) => { if (language !== 'vi') e.currentTarget.style.color = '#908caa'; }}
          onMouseLeave={(e) => { if (language !== 'vi') e.currentTarget.style.color = '#6e6a86'; }}
        >
          Tiếng Việt
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#908caa' }}>{t.algorithm}</label>
          <select
            value={selectedAlgorithm}
            onChange={(e) => onAlgorithmChange(e.target.value as AlgorithmType)}
            disabled={isRunning}
            className="w-full rounded-lg p-3 outline-none transition-colors"
            style={{ backgroundColor: '#191724', border: '1px solid #6e6a86', color: '#e0def4' }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#31748f'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#6e6a86'}
          >
            <option value={AlgorithmType.NEAREST_NEIGHBOR}>{t.algoNames[AlgorithmType.NEAREST_NEIGHBOR]}</option>
            <option value={AlgorithmType.ACO}>{t.algoNames[AlgorithmType.ACO]}</option>
            <option value={AlgorithmType.SPACE_FILLING_CURVE}>{t.algoNames[AlgorithmType.SPACE_FILLING_CURVE]}</option>
          </select>
          <p className="mt-2 text-xs italic leading-relaxed" style={{ color: '#6e6a86' }}>
            {t.algoDescriptions[selectedAlgorithm]}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(38, 35, 58, 0.5)' }}>
            <span className="text-xs block" style={{ color: '#908caa' }}>{t.cities}</span>
            <span className="text-xl font-mono font-semibold" style={{ color: '#e0def4' }}>{cityCount}</span>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(38, 35, 58, 0.5)' }}>
            <span className="text-xs block" style={{ color: '#908caa' }}>{t.distance}</span>
            <span className="text-xl font-mono font-semibold" style={{ color: '#9ccfd8' }}>
              {totalDistance.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onRun}
          disabled={isRunning || cityCount < 2}
          className="flex items-center justify-center gap-2 p-3 rounded-lg font-medium transition-all"
          style={isRunning || cityCount < 2
            ? { backgroundColor: '#26233a', color: '#6e6a86', cursor: 'not-allowed' }
            : { backgroundColor: '#31748f', color: '#e0def4' }
          }
          onMouseEnter={(e) => { if (!isRunning && cityCount >= 2) e.currentTarget.style.backgroundColor = '#286983'; }}
          onMouseLeave={(e) => { if (!isRunning && cityCount >= 2) e.currentTarget.style.backgroundColor = '#31748f'; }}
        >
          <Play size={18} />
          {isRunning ? t.running : t.run}
        </button>

        <button
          onClick={onAnalyze}
          disabled={isRunning || cityCount < 3}
          className="flex items-center justify-center gap-2 p-3 rounded-lg font-medium transition-all border"
          style={isRunning || cityCount < 3
            ? { borderColor: '#26233a', color: '#6e6a86', cursor: 'not-allowed' }
            : { borderColor: 'rgba(156, 207, 216, 0.5)', color: '#9ccfd8' }
          }
          onMouseEnter={(e) => { if (!isRunning && cityCount >= 3) e.currentTarget.style.backgroundColor = 'rgba(156, 207, 216, 0.1)'; }}
          onMouseLeave={(e) => { if (!isRunning && cityCount >= 3) e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <Activity size={18} />
          {t.analyze}
        </button>

        <div className="h-px my-1" style={{ backgroundColor: '#26233a' }}></div>

        <div className="flex gap-2">
          <div className="w-1/4">
            <input
              type="text"
              inputMode="numeric"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={(e) => {
                handleBlur();
                e.currentTarget.style.borderColor = '#6e6a86';
              }}
              disabled={isRunning}
              className="w-full rounded-lg p-3 outline-none text-center transition-colors"
              style={{ backgroundColor: '#191724', border: '1px solid #6e6a86', color: '#e0def4' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#31748f'}
              title="Number of cities"
            />
          </div>
          <button
            onClick={handleRandomizeClick}
            disabled={isRunning}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg transition-all"
            style={{ backgroundColor: '#26233a', color: '#e0def4' }}
            onMouseEnter={(e) => { if (!isRunning) e.currentTarget.style.backgroundColor = '#403d52'; }}
            onMouseLeave={(e) => { if (!isRunning) e.currentTarget.style.backgroundColor = '#26233a'; }}
          >
            <RotateCcw size={18} />
            {t.randomize}
          </button>
        </div>

        <button
          onClick={onClear}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 p-3 rounded-lg transition-all border"
          style={{ backgroundColor: '#26233a', color: '#908caa', borderColor: 'transparent' }}
          onMouseEnter={(e) => { if (!isRunning) { e.currentTarget.style.backgroundColor = 'rgba(235, 111, 146, 0.2)'; e.currentTarget.style.color = '#eb6f92'; e.currentTarget.style.borderColor = 'rgba(235, 111, 146, 0.5)'; } }}
          onMouseLeave={(e) => { if (!isRunning) { e.currentTarget.style.backgroundColor = '#26233a'; e.currentTarget.style.color = '#908caa'; e.currentTarget.style.borderColor = 'transparent'; } }}
        >
          <Trash2 size={18} />
          {t.clear}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
