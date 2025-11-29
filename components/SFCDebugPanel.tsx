import React, { useMemo, useState } from 'react';
import { City, Language } from '../types';
import { calculateSFCDebugInfo, formatHilbertKey, SFCDebugInfo } from '../utils/hilbert';
import { theme, withOpacity } from '../utils/theme';

interface SFCDebugPanelProps {
    cities: City[];
    language: Language;
    isVisible: boolean;
    onClose: () => void;
    onHighlightCity: (cityId: number | null) => void;
    currentStep: number; // For animation sync
}

const translations = {
    en: {
        title: '🔍 SFC Debug Panel',
        subtitle: 'Understanding How Space Filling Curve Works',
        step1Title: 'Step 1: Normalize Coordinates',
        step1Desc: 'Convert canvas coordinates to a 4096×4096 grid',
        step2Title: 'Step 2: Calculate Hilbert Key',
        step2Desc: 'Map 2D position to 1D distance on Hilbert curve',
        step3Title: 'Step 3: Sort by Key',
        step3Desc: 'Cities with smaller keys are visited first',
        tableHeaders: {
            order: '#',
            city: 'City',
            original: 'Original (x, y)',
            normalized: 'Normalized',
            hilbertKey: 'Hilbert Key',
        },
        whyThisOrder: 'Why this order?',
        explanation: 'The Hilbert curve fills 2D space in a continuous path. Points close in 2D tend to have similar Hilbert keys, creating a reasonably short tour without computing distances!',
        close: 'Close',
        showOnCanvas: 'Show Hilbert Curve',
        hideOnCanvas: 'Hide Hilbert Curve',
    },
    vi: {
        title: '🔍 Debug Panel SFC',
        subtitle: 'Hiểu cách thuật toán Đường Điền Đầy hoạt động',
        step1Title: 'Bước 1: Chuẩn hóa tọa độ',
        step1Desc: 'Chuyển tọa độ canvas sang lưới 4096×4096',
        step2Title: 'Bước 2: Tính Hilbert Key',
        step2Desc: 'Ánh xạ vị trí 2D thành khoảng cách 1D trên đường Hilbert',
        step3Title: 'Bước 3: Sắp xếp theo Key',
        step3Desc: 'Thành phố có key nhỏ hơn được ghé thăm trước',
        tableHeaders: {
            order: 'TT',
            city: 'TP',
            original: 'Gốc (x, y)',
            normalized: 'Chuẩn hóa',
            hilbertKey: 'Hilbert Key',
        },
        whyThisOrder: 'Tại sao theo thứ tự này?',
        explanation: 'Đường cong Hilbert phủ không gian 2D theo đường liên tục. Các điểm gần nhau trong 2D thường có Hilbert key tương tự, tạo ra tour khá ngắn mà không cần tính khoảng cách!',
        close: 'Đóng',
        showOnCanvas: 'Hiện đường Hilbert',
        hideOnCanvas: 'Ẩn đường Hilbert',
    }
};

const SFCDebugPanel: React.FC<SFCDebugPanelProps> = ({
    cities,
    language,
    isVisible,
    onClose,
    onHighlightCity,
    currentStep
}) => {
    const t = translations[language];
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);

    const debugInfo = useMemo(() => calculateSFCDebugInfo(cities), [cities]);

    if (!isVisible) return null;

    const handleRowHover = (cityId: number | null) => {
        setHoveredRow(cityId);
        onHighlightCity(cityId);
    };

    return (
        <>
            {/* Backdrop - only on mobile, covers top half */}
            <div
                className="fixed inset-x-0 top-0 h-[50vh] z-40 lg:hidden"
                style={{ backgroundColor: withOpacity(theme.colors.base, 0.3) }}
                onClick={onClose}
            />
            {/* Panel - bottom half on mobile, sidebar overlay on desktop */}
            <div
                className="fixed inset-x-0 bottom-0 h-[50vh] lg:inset-auto lg:right-0 lg:top-0 lg:bottom-0 lg:h-full lg:w-96 xl:w-[420px] z-50 flex flex-col rounded-t-xl lg:rounded-none"
                style={{ backgroundColor: theme.colors.surface, borderTop: `1px solid ${theme.colors.overlay}`, borderLeft: `1px solid ${theme.colors.overlay}` }}
            >
                {/* Header */}
                <div className="p-3 lg:p-4 border-b" style={{ borderColor: theme.colors.overlay }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg lg:text-xl font-bold" style={{ color: theme.colors.foam }}>
                                {t.title}
                            </h2>
                            <p className="text-xs lg:text-sm mt-1 hidden sm:block" style={{ color: theme.colors.muted }}>
                                {t.subtitle}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-opacity-20 transition-colors"
                            style={{ backgroundColor: withOpacity(theme.colors.love, 0.1), color: theme.colors.love }}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Steps Explanation */}
                <div className="p-2 lg:p-4 grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-3 border-b" style={{ borderColor: theme.colors.overlay }}>
                    <StepCard
                        number={1}
                        title={t.step1Title}
                        description={t.step1Desc}
                        icon="📐"
                        isActive={currentStep >= 0}
                    />
                    <StepCard
                        number={2}
                        title={t.step2Title}
                        description={t.step2Desc}
                        icon="🔢"
                        isActive={currentStep >= 1}
                    />
                    <StepCard
                        number={3}
                        title={t.step3Title}
                        description={t.step3Desc}
                        icon="📊"
                        isActive={currentStep >= 2}
                    />
                </div>

                {/* Data Table */}
                <div className="flex-1 overflow-auto p-2 lg:p-4">
                    <table className="w-full text-xs lg:text-sm">
                        <thead>
                            <tr style={{ color: theme.colors.subtle }}>
                                <th className="text-left p-2 sticky top-0" style={{ backgroundColor: theme.colors.surface }}>
                                    {t.tableHeaders.order}
                                </th>
                                <th className="text-left p-2 sticky top-0" style={{ backgroundColor: theme.colors.surface }}>
                                    {t.tableHeaders.city}
                                </th>
                                <th className="text-left p-2 sticky top-0 hidden sm:table-cell" style={{ backgroundColor: theme.colors.surface }}>
                                    {t.tableHeaders.original}
                                </th>
                                <th className="text-left p-2 sticky top-0 hidden lg:table-cell" style={{ backgroundColor: theme.colors.surface }}>
                                    {t.tableHeaders.normalized}
                                </th>
                                <th className="text-right p-2 sticky top-0" style={{ backgroundColor: theme.colors.surface }}>
                                    {t.tableHeaders.hilbertKey}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {debugInfo.map((info, index) => (
                                <tr
                                    key={info.cityId}
                                    className="transition-colors cursor-pointer"
                                    style={{
                                        backgroundColor: hoveredRow === info.cityId
                                            ? withOpacity(theme.colors.foam, 0.2)
                                            : index <= currentStep
                                                ? withOpacity(theme.colors.pine, 0.1)
                                                : 'transparent',
                                        color: theme.colors.text
                                    }}
                                    onMouseEnter={() => handleRowHover(info.cityId)}
                                    onMouseLeave={() => handleRowHover(null)}
                                >
                                    <td className="p-2 font-mono font-bold" style={{ color: theme.colors.gold }}>
                                        {info.order}
                                    </td>
                                    <td className="p-2">
                                        <span
                                            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                                            style={{ backgroundColor: theme.colors.pine, color: theme.colors.text }}
                                        >
                                            {cities.findIndex(c => c.id === info.cityId) + 1}
                                        </span>
                                    </td>
                                    <td className="p-2 font-mono text-xs hidden sm:table-cell">
                                        ({Math.round(info.originalX)}, {Math.round(info.originalY)})
                                    </td>
                                    <td className="p-2 font-mono text-xs hidden lg:table-cell" style={{ color: theme.colors.iris }}>
                                        ({info.normalizedX}, {info.normalizedY})
                                    </td>
                                    <td className="p-2 text-right font-mono" style={{ color: theme.colors.foam }}>
                                        {formatHilbertKey(info.hilbertKey)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Explanation */}
                <div className="p-3 lg:p-4 border-t" style={{ borderColor: theme.colors.overlay, backgroundColor: withOpacity(theme.colors.pine, 0.1) }}>
                    <h4 className="font-bold mb-1 lg:mb-2 text-sm lg:text-base" style={{ color: theme.colors.gold }}>
                        💡 {t.whyThisOrder}
                    </h4>
                    <p className="text-xs lg:text-sm" style={{ color: theme.colors.subtle }}>
                        {t.explanation}
                    </p>
                </div>
            </div>
        </>
    );
};

interface StepCardProps {
    number: number;
    title: string;
    description: string;
    icon: string;
    isActive: boolean;
}

const StepCard: React.FC<StepCardProps> = ({ number, title, description, icon, isActive }) => (
    <div
        className="p-2 lg:p-3 rounded-lg transition-all duration-300 flex sm:flex-col items-center sm:items-start gap-2 sm:gap-0"
        style={{
            backgroundColor: isActive ? withOpacity(theme.colors.pine, 0.2) : withOpacity(theme.colors.overlay, 0.3),
            border: `1px solid ${isActive ? theme.colors.pine : theme.colors.overlay}`,
            opacity: isActive ? 1 : 0.6
        }}
    >
        <div className="flex items-center gap-2 sm:mb-1">
            <span className="text-base lg:text-lg">{icon}</span>
            <span
                className="text-[10px] lg:text-xs font-bold px-1.5 lg:px-2 py-0.5 rounded"
                style={{ backgroundColor: theme.colors.pine, color: theme.colors.text }}
            >
                {number}
            </span>
        </div>
        <div className="flex-1 sm:flex-none">
            <h4 className="font-medium text-xs lg:text-sm" style={{ color: theme.colors.text }}>
                {title}
            </h4>
            <p className="text-[10px] lg:text-xs mt-0.5 lg:mt-1 hidden sm:block" style={{ color: theme.colors.muted }}>
                {description}
            </p>
        </div>
    </div>
);

export default SFCDebugPanel;
