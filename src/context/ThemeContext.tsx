import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeColor = 
  | 'blue'
  | 'indigo'
  | 'emerald'
  | 'purple'
  | 'amber'
  | 'rose'
  | 'cyan'
  | 'slate';

export type ThemeMode = 'light' | 'dark';

export interface ThemePreset {
  id: ThemeColor;
  name: string;
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryText: string;
  cardAccents: {
    blue: string;
    emerald: string;
    purple: string;
    amber: string;
    rose: string;
    cyan: string;
  };
  chartGradient: [string, string];
}

export const THEME_PRESETS: Record<ThemeColor, ThemePreset> = {
  blue: {
    id: 'blue',
    name: 'Ocean Blue',
    primary: '#2563eb', // blue-600
    primaryHover: '#1d4ed8',
    primaryLight: '#eff6ff',
    primaryText: '#1d4ed8',
    cardAccents: {
      blue: '#3b82f6',
      emerald: '#10b981',
      purple: '#8b5cf6',
      amber: '#f59e0b',
      rose: '#f43f5e',
      cyan: '#06b6d4',
    },
    chartGradient: ['#3b82f6', '#93c5fd'],
  },
  indigo: {
    id: 'indigo',
    name: 'Modern Indigo',
    primary: '#4f46e5', // indigo-600
    primaryHover: '#4338ca',
    primaryLight: '#eef2ff',
    primaryText: '#4338ca',
    cardAccents: {
      blue: '#6366f1',
      emerald: '#059669',
      purple: '#7c3aed',
      amber: '#d97706',
      rose: '#e11d48',
      cyan: '#0891b2',
    },
    chartGradient: ['#6366f1', '#a5b4fc'],
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Forest',
    primary: '#059669', // emerald-600
    primaryHover: '#047857',
    primaryLight: '#ecfdf5',
    primaryText: '#047857',
    cardAccents: {
      blue: '#0284c7',
      emerald: '#10b981',
      purple: '#7c3aed',
      amber: '#f59e0b',
      rose: '#e11d48',
      cyan: '#14b8a6',
    },
    chartGradient: ['#10b981', '#6ee7b7'],
  },
  purple: {
    id: 'purple',
    name: 'Royal Violet',
    primary: '#7c3aed', // violet-600
    primaryHover: '#6d28d9',
    primaryLight: '#f5f3ff',
    primaryText: '#6d28d9',
    cardAccents: {
      blue: '#3b82f6',
      emerald: '#10b981',
      purple: '#8b5cf6',
      amber: '#f59e0b',
      rose: '#ec4899',
      cyan: '#06b6d4',
    },
    chartGradient: ['#8b5cf6', '#c4b5fd'],
  },
  amber: {
    id: 'amber',
    name: 'Sunset Amber',
    primary: '#d97706', // amber-600
    primaryHover: '#b45309',
    primaryLight: '#fffbeb',
    primaryText: '#b45309',
    cardAccents: {
      blue: '#2563eb',
      emerald: '#059669',
      purple: '#7c3aed',
      amber: '#f59e0b',
      rose: '#e11d48',
      cyan: '#0891b2',
    },
    chartGradient: ['#f59e0b', '#fde68a'],
  },
  rose: {
    id: 'rose',
    name: 'Crimson Rose',
    primary: '#e11d48', // rose-600
    primaryHover: '#be123c',
    primaryLight: '#fff1f2',
    primaryText: '#be123c',
    cardAccents: {
      blue: '#3b82f6',
      emerald: '#10b981',
      purple: '#8b5cf6',
      amber: '#f59e0b',
      rose: '#f43f5e',
      cyan: '#06b6d4',
    },
    chartGradient: ['#f43f5e', '#fecdd3'],
  },
  cyan: {
    id: 'cyan',
    name: 'Electric Cyan',
    primary: '#0891b2', // cyan-600
    primaryHover: '#0e7490',
    primaryLight: '#ecfeff',
    primaryText: '#0e7490',
    cardAccents: {
      blue: '#3b82f6',
      emerald: '#10b981',
      purple: '#8b5cf6',
      amber: '#f59e0b',
      rose: '#f43f5e',
      cyan: '#06b6d4',
    },
    chartGradient: ['#06b6d4', '#67e8f9'],
  },
  slate: {
    id: 'slate',
    name: 'Minimal Slate',
    primary: '#334155', // slate-700
    primaryHover: '#1e293b',
    primaryLight: '#f8fafc',
    primaryText: '#0f172a',
    cardAccents: {
      blue: '#475569',
      emerald: '#059669',
      purple: '#64748b',
      amber: '#d97706',
      rose: '#e11d48',
      cyan: '#0891b2',
    },
    chartGradient: ['#475569', '#cbd5e1'],
  },
};

interface ThemeContextType {
  colorTheme: ThemeColor;
  setColorTheme: (color: ThemeColor) => void;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  preset: ThemePreset;
  cardLineStyle: 'subtle-top' | 'left-bar' | 'soft-border' | 'none';
  setCardLineStyle: (style: 'subtle-top' | 'left-bar' | 'soft-border' | 'none') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorTheme, setColorThemeState] = useState<ThemeColor>(() => {
    return (localStorage.getItem('nxtjob_theme_color') as ThemeColor) || 'blue';
  });

  const [mode, setModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('nxtjob_theme_mode') as ThemeMode) || 'light';
  });

  const [cardLineStyle, setCardLineStyleState] = useState<'subtle-top' | 'left-bar' | 'soft-border' | 'none'>(() => {
    return (localStorage.getItem('nxtjob_card_line_style') as any) || 'subtle-top';
  });

  const setColorTheme = (color: ThemeColor) => {
    setColorThemeState(color);
    localStorage.setItem('nxtjob_theme_color', color);
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('nxtjob_theme_mode', newMode);
  };

  const toggleMode = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
  };

  const setCardLineStyle = (style: 'subtle-top' | 'left-bar' | 'soft-border' | 'none') => {
    setCardLineStyleState(style);
    localStorage.setItem('nxtjob_card_line_style', style);
  };

  // Sync to root HTML/DOM & CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const currentPreset = THEME_PRESETS[colorTheme] || THEME_PRESETS.blue;

    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    root.style.setProperty('--primary-color', currentPreset.primary);
    root.style.setProperty('--primary-hover', currentPreset.primaryHover);
    root.style.setProperty('--primary-light', currentPreset.primaryLight);
    root.style.setProperty('--primary-text', currentPreset.primaryText);
    
    // Card accent lines
    root.style.setProperty('--card-blue', currentPreset.cardAccents.blue);
    root.style.setProperty('--card-emerald', currentPreset.cardAccents.emerald);
    root.style.setProperty('--card-purple', currentPreset.cardAccents.purple);
    root.style.setProperty('--card-amber', currentPreset.cardAccents.amber);
    root.style.setProperty('--card-rose', currentPreset.cardAccents.rose);
    root.style.setProperty('--card-cyan', currentPreset.cardAccents.cyan);

  }, [colorTheme, mode]);

  const preset = THEME_PRESETS[colorTheme] || THEME_PRESETS.blue;

  return (
    <ThemeContext.Provider
      value={{
        colorTheme,
        setColorTheme,
        mode,
        setMode,
        toggleMode,
        preset,
        cardLineStyle,
        setCardLineStyle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
