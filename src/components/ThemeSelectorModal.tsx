import React from 'react';
import { Palette, Check, Sun, Moon, Sparkles, X, Layout, Sliders } from 'lucide-react';
import { useTheme, THEME_PRESETS, ThemeColor } from '../context/ThemeContext';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { colorTheme, setColorTheme, mode, toggleMode, cardLineStyle, setCardLineStyle } = useTheme();

  if (!isOpen) return null;

  const themesList = Object.values(THEME_PRESETS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Global Theme & Color System
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Applied across all dashboard pages & features
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          
          {/* Light / Dark Mode Toggle */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2">
              Appearance Mode
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => mode !== 'light' && toggleMode()}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                  mode === 'light'
                    ? 'bg-blue-50/80 border-blue-500 text-blue-700 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Clean Light</span>
                {mode === 'light' && <Check className="w-3.5 h-3.5 ml-auto text-blue-600" />}
              </button>

              <button
                type="button"
                onClick={() => mode !== 'dark' && toggleMode()}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                  mode === 'dark'
                    ? 'bg-slate-800 border-blue-500 text-white shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Moon className="w-4 h-4 text-blue-400" />
                <span>Refined Dark</span>
                {mode === 'dark' && <Check className="w-3.5 h-3.5 ml-auto text-blue-400" />}
              </button>
            </div>
          </div>

          {/* Primary Theme Palettes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-slate-700 dark:text-slate-300 font-bold">
                Global Palette & Accents
              </label>
              <span className="text-[10px] text-slate-400">Updates buttons, charts & indicators</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {themesList.map((t) => {
                const isSelected = colorTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setColorTheme(t.id as ThemeColor)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer relative text-left ${
                      isSelected
                        ? 'border-2 border-slate-900 dark:border-white shadow-xs bg-slate-50 dark:bg-slate-800'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                    }`}
                  >
                    {/* Color Swatch Dots */}
                    <div className="flex items-center gap-1">
                      <span
                        className="w-4 h-4 rounded-full shadow-2xs"
                        style={{ backgroundColor: t.primary }}
                      />
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: t.cardAccents.emerald }}
                      />
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: t.cardAccents.amber }}
                      />
                    </div>

                    <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate w-full text-center">
                      {t.name}
                    </span>

                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-[9px] font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Accent Line Styles */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-slate-700 dark:text-slate-300 font-bold">
                Card Accent Colors & Lines
              </label>
              <span className="text-[10px] text-slate-400">Blue, orange & multi-card accents</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'subtle-top', label: 'Color Accent Border', desc: 'Distinct colors for each card' },
                { id: 'left-bar', label: 'Left Accent Line', desc: 'Sleek colored vertical line' },
                { id: 'soft-border', label: 'Tinted Glow Border', desc: 'Gentle colored outer border' },
                { id: 'none', label: 'Clean Borderless', desc: 'Pure neutral minimalist style' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setCardLineStyle(style.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    cardLineStyle === style.id
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-[11px] flex items-center justify-between">
                    <span>{style.label}</span>
                    {cardLineStyle === style.id && <Check className="w-3 h-3 text-blue-600" />}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Sample */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Live Color Palette Preview
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 border-t-2 border-t-blue-500 text-center">
                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">Blue Card</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 border-t-2 border-t-emerald-500 text-center">
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Green Card</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 border-t-2 border-t-purple-500 text-center">
                <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400">Purple Card</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 border-t-2 border-t-amber-500 text-center">
                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">Orange Card</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs transition-colors cursor-pointer"
          >
            Apply & Done
          </button>
        </div>

      </div>
    </div>
  );
};
