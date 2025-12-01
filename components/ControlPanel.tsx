import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Trash2, Activity, Globe } from 'lucide-react';
import { AlgorithmType, Language } from '../types';
import { translations } from '../utils/translations';
import { theme, withOpacity } from '../utils/theme';

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
  // SFC Debug controls
  showHilbertCurve?: boolean;
  showSFCOrder?: boolean;
  onToggleHilbertCurve?: () => void;
  onToggleSFCOrder?: () => void;
  onOpenSFCDebug?: () => void;
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
  language,
  showHilbertCurve = false,
  showSFCOrder = false,
  onToggleHilbertCurve,
  onToggleSFCOrder,
  onOpenSFCDebug
}) => {
  const [inputValue, setInputValue] = useState<string>("30");
  const t = translations[language];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
      setInputValue(val);
    }
  };

  const handleBlur = () => {
    let num = parseInt(inputValue, 10);
    if (isNaN(num) || num < 3) num = 3;
    if (num > 500) num = 500;
    setInputValue(num.toString());
  };

  const handleRandomizeClick = () => {
    let num = parseInt(inputValue, 10);
    if (isNaN(num) || num < 3) num = 3;
    if (num > 500) num = 500;

    setInputValue(num.toString());
    onRandomize(num);
  };

  return (
    <div className="w-full lg:w-72 xl:w-80 p-3 lg:p-5 flex flex-col gap-3 lg:gap-4 lg:h-full lg:overflow-y-auto shrink-0 safe-area-bottom" style={{ backgroundColor: theme.colors.surface, borderTop: `1px solid ${theme.colors.overlay}` }}>
      {/* Sidebar: full width on mobile, fixed width on desktop */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold mb-1 lg:mb-2" style={{ background: `linear-gradient(to right, ${theme.colors.pine}, ${theme.colors.foam})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {t.title}
          </h1>
          <p className="text-xs lg:text-sm hidden lg:block" style={{ color: theme.colors.subtle }}>
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Language Switcher */}
      <div className="flex rounded-lg p-1" style={{ backgroundColor: theme.colors.base, border: `1px solid ${theme.colors.overlay}` }}>
        <button
          onClick={() => onLanguageChange('en')}
          className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-all ${language === 'en' ? 'shadow-sm' : ''}`}
          style={language === 'en' ? { backgroundColor: theme.colors.overlay, color: theme.colors.text } : { color: theme.colors.muted }}
          onMouseEnter={(e) => { if (language !== 'en') e.currentTarget.style.color = theme.colors.subtle; }}
          onMouseLeave={(e) => { if (language !== 'en') e.currentTarget.style.color = theme.colors.muted; }}
        >
          English
        </button>
        <button
          onClick={() => onLanguageChange('vi')}
          className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-all ${language === 'vi' ? 'shadow-sm' : ''}`}
          style={language === 'vi' ? { backgroundColor: theme.colors.overlay, color: theme.colors.text } : { color: theme.colors.muted }}
          onMouseEnter={(e) => { if (language !== 'vi') e.currentTarget.style.color = theme.colors.subtle; }}
          onMouseLeave={(e) => { if (language !== 'vi') e.currentTarget.style.color = theme.colors.muted; }}
        >
          Tiếng Việt
        </button>
      </div>

      <div className="space-y-2 lg:space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: theme.colors.subtle }}>{t.algorithm}</label>
          <select
            value={selectedAlgorithm}
            onChange={(e) => onAlgorithmChange(e.target.value as AlgorithmType)}
            disabled={isRunning}
            className="w-full rounded-lg p-3 outline-none transition-colors"
            style={{ backgroundColor: theme.colors.base, border: `1px solid ${theme.colors.muted}`, color: theme.colors.text }}
            onFocus={(e) => e.currentTarget.style.borderColor = theme.colors.pine}
            onBlur={(e) => e.currentTarget.style.borderColor = theme.colors.muted}
          >
            <option value={AlgorithmType.NEAREST_NEIGHBOR}>{t.algoNames[AlgorithmType.NEAREST_NEIGHBOR]}</option>
            <option value={AlgorithmType.ACO}>{t.algoNames[AlgorithmType.ACO]}</option>
            <option value={AlgorithmType.SPACE_FILLING_CURVE}>{t.algoNames[AlgorithmType.SPACE_FILLING_CURVE]}</option>
          </select>
          <p className="mt-2 text-xs italic leading-relaxed" style={{ color: theme.colors.muted }}>
            {t.algoDescriptions[selectedAlgorithm]}
          </p>

          {/* SFC Debug Controls */}
          {selectedAlgorithm === AlgorithmType.SPACE_FILLING_CURVE && cityCount >= 2 && (
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={onToggleHilbertCurve}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    backgroundColor: showHilbertCurve ? withOpacity(theme.colors.gold, 0.3) : theme.colors.base,
                    border: `1px solid ${showHilbertCurve ? theme.colors.gold : theme.colors.overlay}`,
                    color: showHilbertCurve ? theme.colors.gold : theme.colors.subtle
                  }}
                >
                  🌀 {showHilbertCurve ? 'Ẩn Hilbert' : 'Hiện Hilbert'}
                </button>
                <button
                  onClick={onToggleSFCOrder}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    backgroundColor: showSFCOrder ? withOpacity(theme.colors.iris, 0.3) : theme.colors.base,
                    border: `1px solid ${showSFCOrder ? theme.colors.iris : theme.colors.overlay}`,
                    color: showSFCOrder ? theme.colors.iris : theme.colors.subtle
                  }}
                >
                  🔢 {showSFCOrder ? 'Ẩn thứ tự' : 'Hiện thứ tự'}
                </button>
              </div>
              <button
                onClick={onOpenSFCDebug}
                className="w-full px-3 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  backgroundColor: withOpacity(theme.colors.pine, 0.2),
                  border: `1px solid ${theme.colors.pine}`,
                  color: theme.colors.pine
                }}
              >
                🔍 Debug SFC - Xem chi tiết
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 lg:gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: withOpacity(theme.colors.overlay, 0.5) }}>
            <span className="text-xs block" style={{ color: theme.colors.subtle }}>{t.cities}</span>
            <span className="text-xl font-mono font-semibold" style={{ color: theme.colors.text }}>{cityCount}</span>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: withOpacity(theme.colors.overlay, 0.5) }}>
            <span className="text-xs block" style={{ color: theme.colors.subtle }}>{t.distance}</span>
            <span className="text-xl font-mono font-semibold" style={{ color: theme.colors.foam }}>
              {totalDistance.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 lg:gap-3">
        <button
          onClick={onRun}
          disabled={isRunning || cityCount < 2}
          className="flex items-center justify-center gap-2 p-2 lg:p-3 rounded-lg font-medium text-sm lg:text-base transition-all"
          style={isRunning || cityCount < 2
            ? { backgroundColor: theme.colors.overlay, color: theme.colors.muted, cursor: 'not-allowed' }
            : { backgroundColor: theme.colors.pine, color: theme.colors.text }
          }
          onMouseEnter={(e) => { if (!isRunning && cityCount >= 2) e.currentTarget.style.backgroundColor = theme.colors.info; }}
          onMouseLeave={(e) => { if (!isRunning && cityCount >= 2) e.currentTarget.style.backgroundColor = theme.colors.pine; }}
        >
          <Play size={18} />
          {isRunning ? t.running : t.run}
        </button>

        <button
          onClick={onAnalyze}
          disabled={isRunning || cityCount < 3}
          className="flex items-center justify-center gap-2 p-2 lg:p-3 rounded-lg font-medium text-sm lg:text-base transition-all border"
          style={isRunning || cityCount < 3
            ? { borderColor: theme.colors.overlay, color: theme.colors.muted, cursor: 'not-allowed' }
            : { borderColor: withOpacity(theme.colors.foam, 0.5), color: theme.colors.foam }
          }
          onMouseEnter={(e) => { if (!isRunning && cityCount >= 3) e.currentTarget.style.backgroundColor = withOpacity(theme.colors.foam, 0.1); }}
          onMouseLeave={(e) => { if (!isRunning && cityCount >= 3) e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <Activity size={18} />
          {t.analyze}
        </button>

        <div className="h-px my-1" style={{ backgroundColor: theme.colors.overlay }}></div>

        <div className="flex gap-2">
          <div className="w-1/4">
            <input
              type="text"
              inputMode="numeric"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={(e) => {
                handleBlur();
                e.currentTarget.style.borderColor = theme.colors.muted;
              }}
              disabled={isRunning}
              className="w-full rounded-lg p-2 lg:p-3 outline-none text-center transition-colors"
              style={{ backgroundColor: theme.colors.base, border: `1px solid ${theme.colors.muted}`, color: theme.colors.text }}
              onFocus={(e) => e.currentTarget.style.borderColor = theme.colors.pine}
              title="Number of cities"
            />
          </div>
          <button
            onClick={handleRandomizeClick}
            disabled={isRunning}
            className="flex-1 flex items-center justify-center gap-2 p-2 lg:p-3 rounded-lg text-sm lg:text-base transition-all"
            style={{ backgroundColor: theme.colors.overlay, color: theme.colors.text }}
            onMouseEnter={(e) => { if (!isRunning) e.currentTarget.style.backgroundColor = theme.colors.highlightMed; }}
            onMouseLeave={(e) => { if (!isRunning) e.currentTarget.style.backgroundColor = theme.colors.overlay; }}
          >
            <RotateCcw size={18} />
            {t.randomize}
          </button>
        </div>

        <button
          onClick={onClear}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 p-3 rounded-lg transition-all border"
          style={{ backgroundColor: theme.colors.overlay, color: theme.colors.subtle, borderColor: 'transparent' }}
          onMouseEnter={(e) => { if (!isRunning) { e.currentTarget.style.backgroundColor = withOpacity(theme.colors.love, 0.2); e.currentTarget.style.color = theme.colors.love; e.currentTarget.style.borderColor = withOpacity(theme.colors.love, 0.5); } }}
          onMouseLeave={(e) => { if (!isRunning) { e.currentTarget.style.backgroundColor = theme.colors.overlay; e.currentTarget.style.color = theme.colors.subtle; e.currentTarget.style.borderColor = 'transparent'; } }}
        >
          <Trash2 size={18} />
          {t.clear}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
