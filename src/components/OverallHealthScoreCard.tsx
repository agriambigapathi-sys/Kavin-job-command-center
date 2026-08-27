import React, { useState } from 'react';
import { FileText, CheckSquare, Sparkles, Target, ArrowRight } from 'lucide-react';
import { WeeklyGoalsModal } from './WeeklyGoalsModal';

interface OverallHealthScoreCardProps {
  averageHealthScore?: number;
  outreachVolumeCount?: number;
  activeJobsCount?: number;
  screeningRate?: number;
  onOpenGoalsModal?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const OverallHealthScoreCard: React.FC<OverallHealthScoreCardProps> = ({
  averageHealthScore = 85,
  outreachVolumeCount = 65,
  activeJobsCount = 11,
  screeningRate = 42,
  onNavigateToTab,
}) => {
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<string | null>('Sat');

  const days = [
    { label: 'Mon', score: 55, x: 25, y: 75 },
    { label: 'Tues', score: 80, x: 65, y: 35 },
    { label: 'Wed', score: 62, x: 105, y: 60 },
    { label: 'Thu', score: 45, x: 145, y: 85 },
    { label: 'Fri', score: 78, x: 185, y: 38 },
    { label: 'Sat', score: 85, x: 225, y: 28, isPeak: true },
    { label: 'Sun', score: 48, x: 265, y: 80 },
  ];

  const actionItems = [
    {
      id: 'plan-1',
      title: 'Increase Outreach Volume',
      description: `Send ${Math.max(0, 200 - outreachVolumeCount)} more connection requests to reach your goal.`,
      targetTab: 'contacts',
    },
    {
      id: 'plan-2',
      title: 'Improve Referral to Screening Rate',
      description: 'Improve your screening rate by 25% to reach your goal.',
      targetTab: 'jobs',
    },
    {
      id: 'plan-3',
      title: 'Schedule Mock Interview',
      description: 'Book 2 more mock interviews to maintain prep momentum.',
      targetTab: 'interviews',
    },
    {
      id: 'plan-4',
      title: 'Add Active Jobs',
      description: `Research and add ${Math.max(0, 20 - activeJobsCount)} more jobs to reach weekly target.`,
      targetTab: 'jobs',
    },
  ];

  return (
    <>
      <div className="p-6 rounded-2xl bg-[#091122] dark:bg-[#0B132B] border border-slate-800/90 shadow-xl text-white">
        
        {/* Card Title */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-6 h-6 rounded-lg bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-base font-bold text-slate-100 tracking-tight">
            Overall Health Score
          </h3>
        </div>

        {/* 2-Column Layout matching Screenshot 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Chart: Multi-day Health Score Curve (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-2xl bg-[#0F172A]/80 border border-slate-800/80">
            <div className="relative w-full h-56">
              <svg viewBox="0 0 290 140" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="healthLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>

                  {/* Vertical pillar highlight on Saturday */}
                  <linearGradient id="saturdayPillarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.03" />
                  </linearGradient>
                </defs>

                {/* Shaded highlight pillar behind Saturday */}
                <rect x="210" y="10" width="30" height="110" rx="4" fill="url(#saturdayPillarGrad)" />

                {/* Smooth Multi-point Spline Wave */}
                <path
                  d="M 10,95 C 20,95 22,40 30,35 C 38,30 55,68 65,65 C 75,62 85,90 105,92 C 125,94 135,55 145,52 C 155,49 175,25 185,28 C 195,31 210,65 225,62 C 240,59 265,95 280,92"
                  fill="none"
                  stroke="url(#healthLineGradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Data point dot on Saturday */}
                <circle
                  cx="225"
                  cy="62"
                  r="5"
                  fill="#1E293B"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  className="animate-pulse"
                />

                {/* Glowing Badge Tooltip: "85% Average" */}
                <g transform="translate(205, 42)">
                  <rect
                    x="-5"
                    y="-18"
                    width="82"
                    height="24"
                    rx="8"
                    fill="#1E293B"
                    stroke="#3B82F6"
                    strokeWidth="1.5"
                    filter="drop-shadow(0 2px 6px rgba(59, 130, 246, 0.4))"
                  />
                  <text x="3" y="-3" fill="#60A5FA" fontSize="10.5" fontWeight="800" fontFamily="sans-serif">
                    {averageHealthScore}%
                  </text>
                  <text x="29" y="-3" fill="#94A3B8" fontSize="9.5" fontWeight="500" fontFamily="sans-serif">
                    Average
                  </text>
                </g>
              </svg>
            </div>

            {/* Day Labels Mon -> Sun */}
            <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-800/80 text-xs font-bold text-slate-400">
              {days.map((d) => (
                <span
                  key={d.label}
                  className={`transition-colors cursor-pointer ${
                    d.label === 'Sat' ? 'text-blue-400 font-extrabold' : 'hover:text-slate-200'
                  }`}
                >
                  {d.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right Section: Weekly Action Plan (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="text-sm font-bold text-white mb-4 tracking-tight">
                Weekly Action Plan
              </h4>

              {/* Action List with Coral/Red Square Markers matching Screenshot 2 */}
              <div className="space-y-3.5">
                {actionItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigateToTab && onNavigateToTab(item.targetTab)}
                    className="flex items-start gap-3 p-2 -mx-2 rounded-xl hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Coral / Salmon Rounded Square Icon */}
                    <div className="w-3.5 h-3.5 mt-1 rounded-xs bg-[#F87171] dark:bg-[#EF4444] shrink-0 shadow-2xs group-hover:scale-110 transition-transform" />

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Right: Weekly Goals Action Button */}
            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setIsGoalsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md hover:shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Weekly Goals</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Weekly Goals Interactive Configuration Modal */}
      <WeeklyGoalsModal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        currentGoals={{
          activeJobsTarget: 20,
          outreachVolumeTarget: 200,
          acceptanceRateTarget: 20,
          mockInterviewsTarget: 2,
        }}
      />
    </>
  );
};
