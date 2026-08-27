import React, { useState } from 'react';
import { X, Target, CheckCircle2, TrendingUp, Sparkles, Award, Plus, Calendar } from 'lucide-react';

interface WeeklyGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoals?: {
    activeJobsTarget: number;
    outreachVolumeTarget: number;
    acceptanceRateTarget: number;
    mockInterviewsTarget: number;
  };
  onSaveGoals?: (goals: any) => void;
}

export const WeeklyGoalsModal: React.FC<WeeklyGoalsModalProps> = ({
  isOpen,
  onClose,
  currentGoals = {
    activeJobsTarget: 20,
    outreachVolumeTarget: 200,
    acceptanceRateTarget: 20,
    mockInterviewsTarget: 2,
  },
  onSaveGoals,
}) => {
  const [goals, setGoals] = useState(currentGoals);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (onSaveGoals) onSaveGoals(goals);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0B132B] border border-slate-700/80 text-white shadow-2xl p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Weekly Job Search Goals
              </h3>
              <p className="text-xs text-slate-400">
                Calibrate weekly targets to optimize your conversion pipeline velocity.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Goals Configuration Inputs */}
        <div className="space-y-4">
          {/* Goal 1: Active Jobs Target */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-200">Active Jobs Added / Week</div>
              <div className="text-[11px] text-slate-400">Ideal pipeline intake threshold</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={goals.activeJobsTarget}
                onChange={(e) => setGoals({ ...goals, activeJobsTarget: Number(e.target.value) })}
                className="w-20 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm font-bold text-blue-400 text-center focus:outline-none focus:border-blue-500"
              />
              <span className="text-xs font-bold text-slate-400">jobs</span>
            </div>
          </div>

          {/* Goal 2: Outreach Volume */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-200">Outreach Volume Target</div>
              <div className="text-[11px] text-slate-400">Connection requests & recruiter InMails</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10"
                max="500"
                value={goals.outreachVolumeTarget}
                onChange={(e) => setGoals({ ...goals, outreachVolumeTarget: Number(e.target.value) })}
                className="w-20 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm font-bold text-amber-400 text-center focus:outline-none focus:border-amber-500"
              />
              <span className="text-xs font-bold text-slate-400">/week</span>
            </div>
          </div>

          {/* Goal 3: Acceptance Rate */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-200">Target Acceptance Rate</div>
              <div className="text-[11px] text-slate-400">Networking acceptance percentage benchmark</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="100"
                value={goals.acceptanceRateTarget}
                onChange={(e) => setGoals({ ...goals, acceptanceRateTarget: Number(e.target.value) })}
                className="w-20 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm font-bold text-cyan-400 text-center focus:outline-none focus:border-cyan-500"
              />
              <span className="text-xs font-bold text-slate-400">%</span>
            </div>
          </div>

          {/* Goal 4: Mock Interviews */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-200">Mock Prep Sessions</div>
              <div className="text-[11px] text-slate-400">Technical & behavioral rehearsals</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="10"
                value={goals.mockInterviewsTarget}
                onChange={(e) => setGoals({ ...goals, mockInterviewsTarget: Number(e.target.value) })}
                className="w-20 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm font-bold text-emerald-400 text-center focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs font-bold text-slate-400">sessions</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI calculates recommendations dynamically</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition-all"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Goals Saved!</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Update Weekly Goals</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
