import React, { useState } from 'react';
import {
  Settings,
  User,
  DollarSign,
  Save,
  CheckCircle2,
  Cpu,
  LogOut,
  ShieldCheck,
  Mail,
  MapPin,
  Briefcase,
  AlertCircle,
  Palette,
  Sun,
  Moon,
  Check,
} from 'lucide-react';
import { UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEME_PRESETS, ThemeColor } from '../context/ThemeContext';

interface SettingsViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userProfile,
  onUpdateProfile,
}) => {
  const { user, signOut } = useAuth();
  const { colorTheme, setColorTheme, mode, toggleMode, cardLineStyle, setCardLineStyle } = useTheme();

  const [profile, setProfile] = useState<UserProfile>({ ...userProfile });
  const [saved, setSaved] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

  const themesList = Object.values(THEME_PRESETS);

  return (
    <div id="settings-view" className="space-y-6 max-w-4xl pb-10">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Command Center Configuration</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your personal profile, search parameters, theme colors, compensation floors, and session.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings Saved</span>
            </div>
          )}

          {/* Sign Out Button */}
          <button
            id="settings-signout-btn"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>

      {/* Global Page Theme & Color Settings */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Global Theme & Color System (Across All Pages)</span>
          </h3>
          <span className="text-xs text-slate-400">Controls buttons, cards, charts, indicators</span>
        </div>

        {/* Light / Dark Mode Toggle */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Appearance Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => mode !== 'light' && toggleMode()}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold text-xs transition-all cursor-pointer ${
                mode === 'light'
                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Clean Light</span>
              {mode === 'light' && <Check className="w-3.5 h-3.5 ml-auto text-blue-600" />}
            </button>

            <button
              type="button"
              onClick={() => mode !== 'dark' && toggleMode()}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold text-xs transition-all cursor-pointer ${
                mode === 'dark'
                  ? 'bg-slate-800 border-blue-500 text-white shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Moon className="w-4 h-4 text-blue-400" />
              <span>Refined Dark</span>
              {mode === 'dark' && <Check className="w-3.5 h-3.5 ml-auto text-blue-400" />}
            </button>
          </div>
        </div>

        {/* Palette Preset Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Global Color Palette
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {themesList.map((t) => {
              const isSelected = colorTheme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setColorTheme(t.id as ThemeColor)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-2 border-slate-900 dark:border-white shadow-xs bg-slate-50 dark:bg-slate-800'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full shadow-2xs" style={{ backgroundColor: t.primary }} />
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.cardAccents.emerald }} />
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.cardAccents.amber }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate w-full text-center">
                    {t.name}
                  </span>
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-[9px] font-bold">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Line Styles */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Card Accent Lines (e.g. Blue line for one card, Orange line for another)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'subtle-top', label: 'Color Accent Border', desc: 'Distinct colors for each card' },
              { id: 'left-bar', label: 'Left Accent Line', desc: 'Sleek colored vertical line' },
              { id: 'soft-border', label: 'Tinted Glow Border', desc: 'Gentle colored outer border' },
              { id: 'none', label: 'Clean Borderless', desc: 'Pure neutral minimalist style' },
            ].map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setCardLineStyle(style.id as any)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  cardLineStyle === style.id
                    ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>{style.label}</span>
                  {cardLineStyle === style.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{style.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Basic Information */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            <span>Profile & Identification</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Professional Title</label>
              <input
                type="text"
                value={profile.title || ''}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Contact Email</label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Location</label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Target Compensation & Search Preferences */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>Target Search Filters & Compensation Thresholds</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Target Compensation Range</label>
              <input
                type="text"
                value={profile.targetSalary || ''}
                onChange={(e) => setProfile({ ...profile, targetSalary: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Work Preference</label>
              <select
                value={profile.workPreference || 'Remote Preferred'}
                onChange={(e) => setProfile({ ...profile, workPreference: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Remote Preferred">Remote Preferred</option>
                <option value="Hybrid OK">Hybrid OK</option>
                <option value="On-site OK">On-site OK</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI & Database Sync Status */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-500" />
            <span>AI Reasoning & Firestore Sync Status</span>
          </h3>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Google Cloud Firestore</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Live Persistent Database
                </span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                Protected by Firestore ownerId security rules. Unauthenticated and cross-tenant access blocked.
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
