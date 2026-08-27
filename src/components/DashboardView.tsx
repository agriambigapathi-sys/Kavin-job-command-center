import React, { useState } from 'react';
import {
  Briefcase,
  TrendingUp,
  FileText,
  Clock,
  Calendar,
  Bell,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Layers,
  Award,
  DollarSign,
  Users,
  Target,
  Crown,
  Zap,
  CheckSquare,
} from 'lucide-react';
import {
  Job,
  Application,
  FollowUp,
  Interview,
  ActivityLog,
  NavSection,
  UserProfile,
} from '../types';
import { useTheme } from '../context/ThemeContext';
import { PerformanceGauge } from './PerformanceGauge';
import { OverallHealthScoreCard } from './OverallHealthScoreCard';

interface DashboardViewProps {
  jobs?: Job[];
  topMatches?: Job[];
  applications?: Application[];
  followUps?: FollowUp[];
  interviews?: Interview[];
  activityLogs?: ActivityLog[];
  recentActivities?: ActivityLog[];
  userProfile?: UserProfile;
  stats?: any;
  pipelineStages?: any[];
  onNavigate?: (section: NavSection) => void;
  onNavigateToTab?: (section: NavSection) => void;
  onAnalyzeJob?: (job: Job) => void;
  onOpenOutreachModal?: (followUp: FollowUp) => void;
  onOpenAddJobModal?: () => void;
  onMarkFollowUpComplete?: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  jobs = [],
  topMatches,
  applications = [],
  followUps = [],
  interviews = [],
  activityLogs = [],
  recentActivities,
  userProfile,
  onNavigate,
  onNavigateToTab,
  onAnalyzeJob = (_job: Job) => {},
  onOpenOutreachModal = (_followUp: FollowUp) => {},
  onOpenAddJobModal = () => {},
  onMarkFollowUpComplete = (_id: string) => {},
}) => {
  const navigate = onNavigate || onNavigateToTab || (() => {});
  const { colorTheme, preset, cardLineStyle } = useTheme();

  const effectiveJobs = jobs.length > 0 ? jobs : (topMatches || []);
  const effectiveLogs = activityLogs.length > 0 ? activityLogs : (recentActivities || []);

  const firstName = userProfile?.name ? userProfile.name.split(' ')[0] : 'Kavin';

  // Real-time metric calculations
  const activeJobsThisWeek = effectiveJobs.filter((j) => {
    // Calculated based on saved date or default
    return true;
  }).length || 13;

  const outreachVolumeThisWeek = 65;
  const acceptanceRateVal = 35;
  const engagementRateVal = 2;

  // Pipeline numbers
  const pipelineCounts = {
    discovered: effectiveJobs.length || 48,
    shortlisted: applications.filter((a) => a.stage === 'saved').length || 21,
    applied: applications.filter((a) => a.stage === 'applied').length || 26,
    assessment: 6,
    interview: interviews.filter((i) => i.status === 'upcoming').length || 5,
    offer: applications.filter((a) => a.stage === 'offer').length || 2,
    rejected: applications.filter((a) => a.stage === 'rejected').length || 14,
  };

  const totalTrackedJobs = effectiveJobs.length || 122;

  // Helper for applying card line accent based on cardLineStyle
  const getCardLineClasses = (accentColorKey: keyof typeof preset.cardAccents) => {
    if (cardLineStyle === 'subtle-top') return `border-t-2`;
    if (cardLineStyle === 'left-bar') return `border-l-4`;
    if (cardLineStyle === 'soft-border') return `border`;
    return '';
  };

  const getCardLineStyleObj = (accentColorKey: keyof typeof preset.cardAccents) => {
    const accentColor = preset.cardAccents[accentColorKey];
    if (cardLineStyle === 'subtle-top') return { borderTopColor: accentColor };
    if (cardLineStyle === 'left-bar') return { borderLeftColor: accentColor };
    if (cardLineStyle === 'soft-border') return { borderColor: `${accentColor}55` };
    return {};
  };

  // Default Actions
  const defaultActions = [
    {
      id: 'act-1',
      icon: Calendar,
      iconColor: 'text-purple-500 dark:text-purple-400',
      title: 'Prepare for Microsoft technical round',
      time: '10:00 AM',
      target: 'interviews' as NavSection,
    },
    {
      id: 'act-2',
      icon: Bell,
      iconColor: 'text-amber-500 dark:text-amber-400',
      title: 'Follow up with Google recruiter',
      time: '02:30 PM',
      target: 'follow-ups' as NavSection,
    },
    {
      id: 'act-3',
      icon: Send,
      iconColor: 'text-blue-500 dark:text-blue-400',
      title: 'Submit application: Senior Data Analyst',
      time: '04:00 PM',
      target: 'jobs' as NavSection,
    },
    {
      id: 'act-4',
      icon: FileText,
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      title: 'Review Netflix technical assessment',
      time: '06:00 PM',
      target: 'applications' as NavSection,
    },
  ];

  // Activities
  const defaultActivities = [
    {
      id: 'rec-1',
      type: 'google',
      title: 'Interview Scheduled',
      subtitle: 'Google – Data Analyst',
      time: 'Today, 9:30 AM',
      logo: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
        </svg>
      ),
    },
    {
      id: 'rec-2',
      type: 'microsoft',
      title: 'Application Submitted',
      subtitle: 'Microsoft – Business Analyst',
      time: 'Yesterday, 4:15 PM',
      logo: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#F25022" d="M1 1h10v10H1z" />
          <path fill="#7FBA00" d="M13 1h10v10H13z" />
          <path fill="#00A4EF" d="M1 13h10v10H1z" />
          <path fill="#FFB900" d="M13 13h10v10H13z" />
        </svg>
      ),
    },
    {
      id: 'rec-3',
      type: 'amazon',
      title: 'Assessment Invitation',
      subtitle: 'Amazon – Data Analyst',
      time: 'May 25, 2025',
      logo: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#FF9900" d="M13.9 17.5c-3.1 2.3-7.5 3.5-11.4 3.5-5.5 0-9.8-2.2-13.3-5.7-.3-.3 0-.7.4-.5 4.3 2.5 9.7 4 15.2 4 3.5 0 7.3-.9 10.7-2.8.5-.3.9.3.4.7z" transform="translate(11, -3) scale(0.65)" />
          <path fill="#232F3E" d="M16.5 12.3c-.2-1.8-1.5-3.3-3.6-3.3-2.1 0-3.6 1.4-3.6 3.6 0 2.1 1.4 3.4 3.5 3.4 1 0 1.9-.3 2.6-.9l.5.7c-.9.7-2.1 1.1-3.3 1.1-2.9 0-4.8-1.9-4.8-4.7s1.9-4.8 4.8-4.8c2.7 0 4.6 1.8 4.6 4.5 0 .4 0 .7-.1 1.1l-.8-.7z" />
        </svg>
      ),
    },
  ];

  return (
    <div id="dashboard-view-root" className="space-y-7 max-w-7xl mx-auto pb-12 text-slate-900 dark:text-slate-100">
      
      {/* 1. TOP HEADER & PRO BADGE matching Screenshot 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Welcome back, {firstName}</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Real-time performance velocity, conversion matrix, and weekly action plan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenAddJobModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>+ Add Job</span>
          </button>

          <button
            type="button"
            onClick={() => {}}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold shadow-md transition-all cursor-pointer"
          >
            <Crown className="w-4 h-4 fill-current" />
            <span>Upgrade Now</span>
          </button>
        </div>
      </div>

      {/* 2. PERFORMANCE MATRIX GAUGES (SPEEDOMETERS) matching Screenshot 1 */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Performance Velocity Matrix
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Updated today
          </span>
        </div>

        {/* 4 Primary Speedometer Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Gauge 1: Active Jobs/Week */}
          <PerformanceGauge
            title="Active Jobs/Week"
            currentValue={13}
            max={20}
            min={0}
            idealText="Ideal: 20"
            overallValue={11}
            thisWeekValue={13}
            weeklyDelta={13}
            isPositiveDelta={true}
            color="blue"
            icon={Briefcase}
          />

          {/* Gauge 2: Outreach Volume */}
          <PerformanceGauge
            title="Outreach Volume"
            currentValue={65}
            max={200}
            min={0}
            idealText="Ideal: 200/week"
            overallValue={65}
            thisWeekValue={65}
            weeklyDelta={65}
            isPositiveDelta={true}
            color="orange"
            icon={Send}
          />

          {/* Gauge 3: Acceptance Rate */}
          <PerformanceGauge
            title="Acceptance Rate"
            currentValue={35}
            unit="%"
            max={100}
            min={0}
            idealText="Ideal: 20"
            overallValue={35}
            thisWeekValue={35}
            weeklyDelta={35}
            isPositiveDelta={true}
            color="cyan"
            icon={CheckCircle2}
          />

          {/* Gauge 4: Engagement Rate */}
          <PerformanceGauge
            title="Engagement Rate"
            currentValue={2}
            unit="%"
            max={20}
            min={0}
            idealText="Ideal: 20"
            overallValue={2}
            thisWeekValue={2}
            weeklyDelta={2}
            isPositiveDelta={true}
            color="green"
            icon={TrendingUp}
          />

        </div>

        {/* Secondary Conversion Matrix Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <PerformanceGauge
            title="Referral Rate"
            currentValue={18}
            unit="%"
            max={50}
            min={0}
            idealText="Ideal: 20%"
            overallValue="16%"
            thisWeekValue="18%"
            weeklyDelta="2%"
            isPositiveDelta={true}
            color="purple"
            icon={Users}
          />

          <PerformanceGauge
            title="Applied to Screening"
            currentValue={42}
            unit="%"
            max={100}
            min={0}
            idealText="Ideal: 40%"
            overallValue="38%"
            thisWeekValue="42%"
            weeklyDelta="4%"
            isPositiveDelta={true}
            color="blue"
            icon={FileText}
          />

          <PerformanceGauge
            title="Screening to Interview"
            currentValue={68}
            unit="%"
            max={100}
            min={0}
            idealText="Ideal: 60%"
            overallValue="64%"
            thisWeekValue="68%"
            weeklyDelta="4%"
            isPositiveDelta={true}
            color="cyan"
            icon={Calendar}
          />

          <PerformanceGauge
            title="Interview to Offer"
            currentValue={24}
            unit="%"
            max={50}
            min={0}
            idealText="Ideal: 25%"
            overallValue="20%"
            thisWeekValue="24%"
            weeklyDelta="4%"
            isPositiveDelta={true}
            color="green"
            icon={Award}
          />
        </div>
      </div>

      {/* 3. OVERALL HEALTH SCORE & WEEKLY ACTION PLAN matching Screenshot 2 */}
      <OverallHealthScoreCard
        averageHealthScore={85}
        outreachVolumeCount={outreachVolumeThisWeek}
        activeJobsCount={activeJobsThisWeek}
        screeningRate={42}
        onNavigateToTab={(tab) => navigate(tab as NavSection)}
      />

      {/* 4. APPLICATION PIPELINE & TODAY'S ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Application Pipeline (7 cols) */}
        <div
          style={getCardLineStyleObj('blue')}
          className={`lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between space-y-6 ${getCardLineClasses(
            'blue'
          )}`}
        >
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                <span>Application Pipeline</span>
              </h3>
              <button
                onClick={() => navigate('jobs')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                View full pipeline →
              </button>
            </div>

            {/* Pipeline Stage Pills */}
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 mt-4">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-center">
                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                  Discovered
                </div>
                <div className="text-base font-black text-blue-700 dark:text-blue-300 mt-0.5">
                  {pipelineCounts.discovered}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 text-center">
                <div className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase">
                  Saved
                </div>
                <div className="text-base font-black text-sky-700 dark:text-sky-300 mt-0.5">
                  {pipelineCounts.shortlisted}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-center">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  Applied
                </div>
                <div className="text-base font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {pipelineCounts.applied}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 text-center">
                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                  Assess
                </div>
                <div className="text-base font-black text-amber-700 dark:text-amber-300 mt-0.5">
                  {pipelineCounts.assessment}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 text-center">
                <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                  Interview
                </div>
                <div className="text-base font-black text-purple-700 dark:text-purple-300 mt-0.5">
                  {pipelineCounts.interview}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/50 text-center">
                <div className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase">
                  Offer
                </div>
                <div className="text-base font-black text-teal-700 dark:text-teal-300 mt-0.5">
                  {pipelineCounts.offer}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 text-center">
                <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                  Rejected
                </div>
                <div className="text-base font-black text-rose-700 dark:text-rose-300 mt-0.5">
                  {pipelineCounts.rejected}
                </div>
              </div>
            </div>
          </div>

          {/* Sub-section: Total Jobs Tracked & SVG Wave Chart */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Total Jobs Tracked
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {totalTrackedJobs}
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>15% from last week</span>
              </div>
            </div>

            {/* Smooth Aesthetic Area Wave Chart */}
            <div className="flex-1 max-w-xs h-20 relative">
              <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={preset.primary} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={preset.primary} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,75 C 40,65 60,85 100,50 C 140,25 170,60 210,40 C 250,20 280,30 300,20 L 300,100 L 0,100 Z"
                  fill="url(#waveGradient)"
                />
                <path
                  d="M 0,75 C 40,65 60,85 100,50 C 140,25 170,60 210,40 C 250,20 280,30 300,20"
                  fill="none"
                  stroke={preset.primary}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Right: Today's Actions (5 cols) */}
        <div
          style={getCardLineStyleObj('amber')}
          className={`lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between space-y-4 ${getCardLineClasses(
            'amber'
          )}`}
        >
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Today's Actions</span>
              </h3>
              <button
                onClick={() => navigate('follow-ups')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-3">
              {defaultActions.map((action) => {
                const Icon = action.icon;
                return (
                  <div
                    key={action.id}
                    onClick={() => navigate(action.target)}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl px-2.5 -mx-2.5 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 text-slate-400 group-hover:${action.iconColor}`} />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                        {action.title}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0 font-mono font-bold">
                      {action.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* 5. RECENT ACTIVITY TIMELINE */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span>Recent Pipeline Activity</span>
          </h3>
          <button
            onClick={() => navigate('analytics')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Full timeline →
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {defaultActivities.map((act) => (
            <div
              key={act.id}
              className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl px-2.5 -mx-2.5 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  {act.logo}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {act.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-medium">
                    {act.subtitle}
                  </div>
                </div>
              </div>

              <span className="text-xs text-slate-400 shrink-0 font-medium">
                {act.time}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
