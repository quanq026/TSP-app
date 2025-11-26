// Theme Configuration
// Chỉ cần thay đổi theme name ở đây để chuyển đổi toàn bộ ứng dụng

export type ThemeName = 'rosePine' | 'rosePineMoon' | 'rosePineDawn' | 'moonlight';

export interface Theme {
    name: string;
    colors: {
        // Base colors
        base: string;
        surface: string;
        overlay: string;
        muted: string;
        subtle: string;
        text: string;

        // Accent colors
        love: string;    // Red/Pink
        gold: string;    // Yellow/Gold
        rose: string;    // Rose
        pine: string;    // Blue
        foam: string;    // Light Blue/Cyan
        iris: string;    // Purple

        // UI elements
        highlightLow: string;
        highlightMed: string;
        highlightHigh: string;

        // Semantic colors
        success: string;
        warning: string;
        error: string;
        info: string;
    };
}

// Rosé Pine (Base - Dark)
const rosePine: Theme = {
    name: 'Rosé Pine',
    colors: {
        base: '#191724',
        surface: '#1f1d2e',
        overlay: '#26233a',
        muted: '#6e6a86',
        subtle: '#908caa',
        text: '#e0def4',
        love: '#eb6f92',
        gold: '#f6c177',
        rose: '#ebbcba',
        pine: '#31748f',
        foam: '#9ccfd8',
        iris: '#c4a7e7',
        highlightLow: '#21202e',
        highlightMed: '#403d52',
        highlightHigh: '#524f67',
        success: '#9ccfd8',
        warning: '#f6c177',
        error: '#eb6f92',
        info: '#31748f',
    },
};

// Rosé Pine Moon (Darker variant)
const rosePineMoon: Theme = {
    name: 'Rosé Pine Moon',
    colors: {
        base: '#232136',
        surface: '#2a273f',
        overlay: '#393552',
        muted: '#6e6a86',
        subtle: '#908caa',
        text: '#e0def4',
        love: '#eb6f92',
        gold: '#f6c177',
        rose: '#ea9a97',
        pine: '#3e8fb0',
        foam: '#9ccfd8',
        iris: '#c4a7e7',
        highlightLow: '#2a273f',
        highlightMed: '#393552',
        highlightHigh: '#6e6a86',
        success: '#9ccfd8',
        warning: '#f6c177',
        error: '#eb6f92',
        info: '#3e8fb0',
    },
};

// Rosé Pine Dawn (Light variant)
const rosePineDawn: Theme = {
    name: 'Rosé Pine Dawn',
    colors: {
        base: '#faf4ed',
        surface: '#fffaf3',
        overlay: '#f2e9e1',
        muted: '#9893a5',
        subtle: '#797593',
        text: '#575279',
        love: '#b4637a',
        gold: '#ea9d34',
        rose: '#d7827e',
        pine: '#286983',
        foam: '#56949f',
        iris: '#907aa9',
        highlightLow: '#f2e9e1',
        highlightMed: '#eaddcf',
        highlightHigh: '#f4ede8',
        success: '#56949f',
        warning: '#ea9d34',
        error: '#b4637a',
        info: '#286983',
    },
};

// Moonlight by atomiks
const moonlight: Theme = {
    name: 'Moonlight',
    colors: {
        base: '#1e1e2e',
        surface: '#252538',
        overlay: '#2d2d44',
        muted: '#6b6b8a',
        subtle: '#8b8ba7',
        text: '#e4e4e7',
        love: '#ff6b9d',
        gold: '#ffcc00',
        rose: '#ff9f66',
        pine: '#5dade2',
        foam: '#7dd3fc',
        iris: '#a78bfa',
        highlightLow: '#2a2a3e',
        highlightMed: '#3a3a52',
        highlightHigh: '#4a4a66',
        success: '#7dd3fc',
        warning: '#ffcc00',
        error: '#ff6b9d',
        info: '#5dade2',
    },
};

// Theme registry
const themes: Record<ThemeName, Theme> = {
    rosePine,
    rosePineMoon,
    rosePineDawn,
    moonlight,
};

// ============================================
// CHỈ CẦN THAY ĐỔI DÒNG NÀY ĐỂ CHUYỂN THEME
// ============================================
export const CURRENT_THEME: ThemeName = 'rosePineDawn';

// Export current theme
export const theme = themes[CURRENT_THEME];

// Helper functions for common color operations
export const getTheme = (themeName: ThemeName = CURRENT_THEME): Theme => {
    return themes[themeName];
};

export const withOpacity = (color: string, opacity: number): string => {
    // Convert hex to rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

