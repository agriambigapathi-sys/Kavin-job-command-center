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
} from 'lucide-react';
import { UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';

interface SettingsViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userProfile,
  onUpdateProfile,
}) => {
  const { user, signOut } = useAuth();
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

  return (
    <div id="settings-view" className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <span>Command Center Configuration</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your personal profile, search parameters, compensation floors, and Firebase session.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings Saved</span>
            </div>
          )}

          {/* Sign Out Button */}
          <button
            id="settings-signout-btn"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>

      {/* Authenticated User Banner */}
      {user && (
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-bold text-sm">
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{user.displayName || profile.name}</span>
                <span className="px-2 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Google Authenticated
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">{user.email}</div>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">User ID</div>
            <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs">{user.uid}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Personal Profile & Identity</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Primary Email</label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
              <input
                type="text"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Current Base Location</label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">LinkedIn URL</label>
              <input
                type="text"
                value={profile.linkedin || ''}
                onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">GitHub Profile</label>
              <input
                type="text"
                value={profile.github || ''}
                onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Target Compensation & Search Preferences */}
        <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Target Search Filters & Compensation Thresholds</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Compensation Range</label>
              <input
                type="text"
                value={profile.targetSalary || ''}
                onChange={(e) => setProfile({ ...profile, targetSalary: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:ring-1 focus:ring-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Work Preference</label>
              <select
                value={profile.workPreference || 'Remote Preferred'}
                onChange={(e) => setProfile({ ...profile, workPreference: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:ring-1 focus:ring-cyan-500"
              >
                <option value="Remote Preferred">Remote Preferred</option>
                <option value="Hybrid OK">Hybrid OK</option>
                <option value="On-site OK">On-site OK</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI & Model Configuration */}
        <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>AI Reasoning & Firestore Sync Status</span>
          </h3>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>Google Cloud Firestore</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Live Persistent Database
                </span>
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Protected by Firestore ownerId security rules. Unauthenticated and cross-tenant access blocked.
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};

