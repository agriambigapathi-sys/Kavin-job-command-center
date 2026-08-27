import React from 'react';
import {
  Briefcase,
  Layers,
  MessageSquareReply,
  Calendar,
  Award,
  TrendingUp,
  Percent,
  Sparkles,
  ArrowRight,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  Zap,
  Target,
  Send,
  Plus,
  ChevronRight,
  Building2,
  MapPin,
  DollarSign,
  Video,
  FileText,
  ShieldCheck,
  Flame,
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
  userProfile = {
    name: 'Kavin',
    title: 'Senior Full-Stack & AI Systems Engineer',
    email: 'ambigapathikavin2@gmail.com',
    phone: '+1 (415) 890-3412',
    location: 'San Francisco, CA (Remote)',
    targetSalary: '$175k - $220k',
    workPreference: 'Remote Preferred',
    searchStatus: 'Actively Interviewing',
    github: 'github.com/kavin',
    linkedin: 'linkedin.com/in/kavin',
    portfolio: 'kavin.dev',
    yearsExperience: 6,
    coreSkills: ['React', 'TypeScript', 'Node.js', 'LLMs'],
    dailyGoalApps: 5,
  },
  onNavigate,
  onNavigateToTab,
  onAnalyzeJob = (_job: Job) => {},
  onOpenOutreachModal = (_followUp: FollowUp) => {},
  onOpenAddJobModal = () => {},
  onMarkFollowUpComplete = (_id: string) => {},
}) => {
  const navigate = onNavigate || onNavigateToTab || (() => {});
  const effectiveJobs = jobs.length > 0 ? jobs : (topMatches || []);
  const effectiveLogs = activityLogs.length > 0 ? activityLogs : (recentActivities || []);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = userProfile?.name ? userProfile.name.split(' ')[0] : 'Kavin';
    if (hour < 12) return `Good morning, ${firstName} 👋`;
    if (hour < 17) return `Good afternoon, ${firstName} 👋`;
    return `Good evening, ${firstName} 👋`;
  };

  // KPI Calculations from actual Firestore data
  const totalJobsCount = effectiveJobs.length;
  const totalApplicationsCount = applications.length;
  
  // Active Applications (exclude rejected & withdrawn)
  const activeApplications = applications.filter(
    (a) => a.stage !== 'rejected' && a.stage !== 'withdrawn'
  );
  const activeApplicationsCount = activeApplications.length;

  // Active Interviews (screening, tech_interview, final_round, or upcoming interviews array)
  const interviewApps = applications.filter(
    (a) => a.stage === 'screening' || a.stage === 'tech_interview' || a.stage === 'final_round'
  );
  const upcomingInterviewsList = interviews.filter((i) => i.status === 'upcoming');
  const interviewsCount = Math.max(interviewApps.length, upcomingInterviewsList.length);

  // Offers
  const offerApps = applications.filter((a) => a.stage === 'offer');
  const offersCount = offerApps.length;

  // Responded applications (anything moved beyond applied/saved)
  const respondedApps = applications.filter(
    (a) => a.stage !== 'applied' && a.stage !== 'saved' && a.stage !== 'withdrawn'
  );
  const responsesCount = respondedApps.length;

  // Rates with proper fallbacks
  const responseRate = totalApplicationsCount > 0 
    ? ((responsesCount / totalApplicationsCount) * 100).toFixed(1) 
    : '0.0';
  const interviewRate = totalApplicationsCount > 0 
    ? ((interviewApps.length / totalApplicationsCount) * 100).toFixed(1) 
    : '0.0';

  // Follow-up calculations
  const pendingFollowUps = followUps.filter((f) => f.status !== 'completed');
  const overdueFollowUps = pendingFollowUps.filter(
    (f) => f.status === 'overdue' || (typeof f.daysDiff === 'number' && f.daysDiff < 0)
  );
  const todayFollowUps = pendingFollowUps.filter(
    (f) => f.status === 'due_today' || (typeof f.daysDiff === 'number' && f.daysDiff === 0)
  );
  const dueTodayOrOverdueCount = overdueFollowUps.length + todayFollowUps.length;

  // 1. TODAY'S ACTION QUEUE BUILDER
  // Synthesizes high-priority, real actions across follow-ups, upcoming interviews, and high-match unapplied jobs
  interface ActionItem {
    id: string;
    priority: 'urgent' | 'today' | 'upcoming' | 'opportunity';
    priorityLabel: string;
    title: string;
    description: string;
    company?: string;
    badgeColor: string;
    actionLabel: string;
    actionIcon: React.ReactNode;
    onAction: () => void;
    onComplete?: () => void;
  }

  const actionQueue: ActionItem[] = [];

  // 1.1 Overdue Follow-ups (🔴 Urgent)
  overdueFollowUps.forEach((fu) => {
    actionQueue.push({
      id: `fu-overdue-${fu.id}`,
      priority: 'urgent',
      priorityLabel: 'Overdue Follow-up',
      title: `Follow up with ${fu.recipientName || 'Recruiter'} (${fu.company})`,
      description: `${fu.type || 'Status Check-in'} is overdue. Prompt outreach maintains candidate top-of-mind.`,
      company: fu.company,
      badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      actionLabel: 'Send Outreach',
      actionIcon: <Send className="w-3.5 h-3.5" />,
      onAction: () => onOpenOutreachModal(fu),
      onComplete: () => onMarkFollowUpComplete(fu.id),
    });
  });

  // 1.2 Today's Follow-ups (🟡 Due Today)
  todayFollowUps.forEach((fu) => {
    actionQueue.push({
      id: `fu-today-${fu.id}`,
      priority: 'today',
      priorityLabel: 'Due Today',
      title: `Send follow-up for ${fu.jobTitle || 'Role'} at ${fu.company}`,
      description: `Scheduled ${fu.type || 'outreach'} reminder is due today.`,
      company: fu.company,
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      actionLabel: 'Draft Email',
      actionIcon: <Send className="w-3.5 h-3.5" />,
      onAction: () => onOpenOutreachModal(fu),
      onComplete: () => onMarkFollowUpComplete(fu.id),
    });
  });

  // 1.3 Upcoming Interviews (🟢 Interview Preparation)
  upcomingInterviewsList.slice(0, 2).forEach((interview) => {
    actionQueue.push({
      id: `interview-${interview.id}`,
      priority: 'upcoming',
      priorityLabel: 'Interview Upcoming',
      title: `${interview.round || 'Technical Loop'} with ${interview.company}`,
      description: `Scheduled for ${interview.date} at ${interview.time || 'TBD'}. Review system design and STAR bullets.`,
      company: interview.company,
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      actionLabel: 'Open Prep Station',
      actionIcon: <Video className="w-3.5 h-3.5" />,
      onAction: () => navigate('interviews'),
    });
  });

  // 1.4 Unanalyzed or High-Match Jobs needing tailored resume (🟡 Customize Resume)
  const unappliedHighMatchJobs = effectiveJobs
    .filter((j) => (j.status === 'saved' || !j.status) && (j.matchScore || 0) >= 80)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  unappliedHighMatchJobs.slice(0, 2).forEach((job) => {
    actionQueue.push({
      id: `job-tailor-${job.id}`,
      priority: 'opportunity',
      priorityLabel: `${job.matchScore}% High Match`,
      title: `Tailor resume for ${job.title} at ${job.company}`,
      description: `High keyword fit (${job.matchKeyHighlights?.slice(0, 2).join(', ') || 'Core Skills'}). Optimize bullets before submitting.`,
      company: job.company,
      badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      actionLabel: 'Tailor Resume',
      actionIcon: <FileSearch className="w-3.5 h-3.5" />,
      onAction: () => onAnalyzeJob(job),
    });
  });

  // 2. ACTIVE PIPELINE SNAPSHOT DATA
  const pipelineStages = [
    {
      key: 'discovered',
      label: 'Discovered',
      count: effectiveJobs.filter((j) => j.status === 'saved' || !j.status).length,
      color: 'border-slate-700 bg-slate-900/60 text-slate-300',
      tab: 'jobs' as NavSection,
    },
    {
      key: 'shortlisted',
      label: 'Shortlisted',
      count: effectiveJobs.filter((j) => j.tier === 'Dream' || j.tier === 'Target').length,
      color: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300',
      tab: 'jobs' as NavSection,
    },
    {
      key: 'applied',
      label: 'Applied',
      count: applications.filter((a) => a.stage === 'applied').length,
      color: 'border-blue-500/30 bg-blue-950/20 text-blue-300',
      tab: 'applications' as NavSection,
    },
    {
      key: 'screening',
      label: 'Screening',
      count: applications.filter((a) => a.stage === 'screening').length,
      color: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
      tab: 'applications' as NavSection,
    },
    {
      key: 'interview',
      label: 'Interview',
      count: applications.filter((a) => a.stage === 'tech_interview' || a.stage === 'final_round').length,
      color: 'border-purple-500/30 bg-purple-950/20 text-purple-300',
      tab: 'interviews' as NavSection,
    },
    {
      key: 'offer',
      label: 'Offer',
      count: offersCount,
      color: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300 font-bold',
      tab: 'applications' as NavSection,
    },
  ];

  // 3. TOP MATCH OPPORTUNITIES
  const sortedTopJobs = [...effectiveJobs]
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, 4);

  return (
    <div id="kavin-command-center-dashboard" className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* 1. Header Command Strip */}
      <div 
        id="dashboard-header-banner"
        className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800/90 to-slate-900 border border-slate-700/60 p-5 sm:p-6 shadow-xl relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-cyan-500/10 via-indigo-500/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {userProfile.targetSalary && (
                <span className="text-xs text-slate-400 font-medium">
                  Target Band: <span className="text-slate-200">{userProfile.targetSalary}</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              {getGreeting()}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {actionQueue.length > 0 ? (
                <span>
                  <strong className="text-amber-300 font-semibold">{actionQueue.length} action item{actionQueue.length > 1 ? 's' : ''}</strong> require attention today.
                </span>
              ) : (
                <span>All pipeline actions are up to date.</span>
              )}
            </p>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex items-center gap-2.5 self-start md:self-auto flex-shrink-0">
            {dueTodayOrOverdueCount > 0 && (
              <button
                id="header-due-today-btn"
                onClick={() => navigate('follow-ups')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all shadow-sm"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{dueTodayOrOverdueCount} Due Today</span>
              </button>
            )}

            <button
              id="header-add-job-btn"
              onClick={onOpenAddJobModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-950/60 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Job</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Strip (5 Core Metric Cards as per specification) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Active Applications */}
        <div
          id="kpi-active-applications"
          onClick={() => navigate('applications')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:-translate-y-0.5 group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-300">Active Apps</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-100 tabular-nums">
              {activeApplicationsCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>{totalApplicationsCount} total sent</span>
              <span className="text-cyan-400 font-medium">{totalJobsCount} saved</span>
            </div>
          </div>
        </div>

        {/* Interviews */}
        <div
          id="kpi-interviews"
          onClick={() => navigate('interviews')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:-translate-y-0.5 group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-300">Interviews</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-purple-300 tabular-nums">
              {interviewsCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>{upcomingInterviewsList.length} scheduled</span>
              <span className="text-purple-400 font-medium">Active Loops</span>
            </div>
          </div>
        </div>

        {/* Offers */}
        <div
          id="kpi-offers"
          onClick={() => navigate('applications')}
          className="p-4 rounded-xl bg-gradient-to-b from-emerald-950/30 to-slate-900/90 border border-emerald-500/40 hover:border-emerald-400 cursor-pointer transition-all hover:-translate-y-0.5 group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-emerald-300">Offers</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 tabular-nums">
              {offersCount}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-1">
              {offersCount > 0 ? `${offersCount} package${offersCount > 1 ? 's' : ''} extended` : '0 current offers'}
            </div>
          </div>
        </div>

        {/* Response Rate */}
        <div
          id="kpi-response-rate"
          onClick={() => navigate('analytics')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:-translate-y-0.5 group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-300">Response Rate</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-colors">
              <MessageSquareReply className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 tabular-nums">
              {responseRate}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>{responsesCount} responses</span>
              <span className="text-emerald-400 text-[10px]">Bench: 15%</span>
            </div>
          </div>
        </div>

        {/* Interview Rate */}
        <div
          id="kpi-interview-rate"
          onClick={() => navigate('analytics')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:-translate-y-0.5 group flex flex-col justify-between col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-300">Interview Rate</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-300 tabular-nums">
              {interviewRate}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>{interviewApps.length} converted</span>
              <span className="text-indigo-400 text-[10px]">Bench: 8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TODAY'S ACTION QUEUE (Priority-Ranked Action Cards) */}
      <div id="todays-action-queue-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Today's Actions
              </h2>
              <p className="text-xs text-slate-400">
                Tasks across follow-ups, scheduled rounds, and applications
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">
            {actionQueue.length} Pending
          </span>
        </div>

        {actionQueue.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {actionQueue.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${item.badgeColor}`}>
                      {item.priorityLabel}
                    </span>
                    {item.company && (
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1 truncate">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {item.company}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {item.onComplete ? (
                    <button
                      onClick={item.onComplete}
                      className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-medium transition-colors"
                      title="Mark task completed"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Done</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500">Live Queue</span>
                  )}

                  <button
                    onClick={item.onAction}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 text-xs font-bold transition-all active:scale-95"
                  >
                    {item.actionIcon}
                    <span>{item.actionLabel}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-200">All Queue Actions Cleared!</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No overdue follow-ups or pending urgent actions for today. Add new target roles or run an AI JD analysis to populate your queue.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => navigate('jobs')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                Browse Saved Jobs
              </button>
              <button
                onClick={onOpenAddJobModal}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
              >
                + Add New Job
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. ACTIVE PIPELINE SNAPSHOT */}
      <div id="active-pipeline-snapshot" className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Active Pipeline Snapshot
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live funnel stages showing distribution of active opportunities across your pipeline.
            </p>
          </div>
          <button
            onClick={() => navigate('applications')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold transition-colors"
          >
            <span>Open Kanban Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {pipelineStages.map((stage, idx) => (
            <div
              key={stage.key}
              onClick={() => navigate(stage.tab)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:-translate-y-0.5 ${stage.color}`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold">{stage.label}</span>
                <span className="text-[10px] opacity-75 font-mono">#{idx + 1}</span>
              </div>
              <div className="text-2xl font-black tabular-nums">{stage.count}</div>
              <div className="text-[10px] opacity-80 mt-1">
                {stage.key === 'offer'
                  ? 'Active Packages'
                  : `${totalApplicationsCount > 0 ? ((stage.count / Math.max(totalApplicationsCount, 1)) * 100).toFixed(0) : 0}% of pipeline`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. TOP MATCH OPPORTUNITIES & UPCOMING INTERVIEWS (2-Column Desktop Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Match Opportunities (7 Cols) */}
        <div id="top-match-opportunities-section" className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                  <Target className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Top Match Opportunities</h3>
                  <p className="text-xs text-slate-400">Highest compatibility roles matched to your Master Profile</p>
                </div>
              </div>
              <button
                onClick={() => navigate('jobs')}
                className="text-xs text-cyan-400 hover:underline font-semibold"
              >
                View all ({totalJobsCount})
              </button>
            </div>

            {sortedTopJobs.length > 0 ? (
              <div className="space-y-3">
                {sortedTopJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                            {job.title}
                          </span>
                          {job.tier && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-slate-300 flex-shrink-0">
                              {job.tier}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-semibold text-slate-300 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {job.company}
                          </span>
                          {job.location && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {job.location}
                            </span>
                          )}
                          {job.salary && (
                            <span className="text-emerald-400 font-medium">
                              {job.salary}
                            </span>
                          )}
                        </div>

                        {/* Skill highlight tags */}
                        {job.matchKeyHighlights && job.matchKeyHighlights.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {job.matchKeyHighlights.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Match Score & Action Buttons */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold">
                          <span>{job.matchScore || 0}%</span>
                          <span className="text-[10px] font-medium text-emerald-400">Fit</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onAnalyzeJob(job)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-[11px] font-semibold border border-purple-500/30 transition-colors"
                            title="Analyze JD with AI"
                          >
                            <FileSearch className="w-3 h-3" />
                            <span>Analyze</span>
                          </button>
                          <button
                            onClick={() => navigate('jobs')}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700"
                            title="View full job details"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Building2 className="w-8 h-8 text-slate-500 mx-auto" />
                <div className="text-xs font-medium text-slate-300">No jobs saved yet</div>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Add target roles from job boards or paste a URL to score match compatibility.
                </p>
                <button
                  onClick={onOpenAddJobModal}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
                >
                  + Add First Job
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Grounded in Master Resume Skills</span>
            </span>
            <button
              onClick={() => navigate('jd-analyser')}
              className="text-purple-300 hover:text-purple-200 font-semibold flex items-center gap-1"
            >
              <span>Custom JD Analyzer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Upcoming Interviews & Quick Follow-ups (5 Cols) */}
        <div id="upcoming-interviews-section" className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                  <Calendar className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Upcoming Interviews</h3>
                  <p className="text-xs text-slate-400">Scheduled loops and technical screens</p>
                </div>
              </div>
              <button
                onClick={() => navigate('interviews')}
                className="text-xs text-cyan-400 hover:underline font-semibold"
              >
                View all ({interviews.length})
              </button>
            </div>

            {upcomingInterviewsList.length > 0 ? (
              <div className="space-y-3">
                {upcomingInterviewsList.slice(0, 3).map((interview) => (
                  <div
                    key={interview.id}
                    className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-purple-200 block truncate">
                          {interview.company}
                        </span>
                        <div className="text-xs text-slate-300 mt-0.5">
                          {interview.role} • <span className="text-purple-300 font-medium">{interview.round}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          <span className="text-slate-300 font-semibold">{interview.date}</span>
                          {interview.time && <span>• {interview.time}</span>}
                          {interview.durationMinutes && <span>({interview.durationMinutes}m)</span>}
                        </div>
                      </div>

                      <button
                        onClick={() => navigate('interviews')}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 flex-shrink-0"
                      >
                        <Video className="w-3 h-3" />
                        <span>Prep Kit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
                <div className="text-xs font-medium text-slate-300">No upcoming interviews</div>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  As applications convert, your scheduled technical and behavioral loops will appear here.
                </p>
                <button
                  onClick={() => navigate('applications')}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                >
                  View Active Applications
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Company question banks & STAR review</span>
            <button
              onClick={() => navigate('interviews')}
              className="text-purple-300 hover:text-purple-200 font-semibold"
            >
              Open Interview Station →
            </button>
          </div>
        </div>
      </div>

      {/* 6. RECENT ACTIVITY TIMELINE */}
      <div id="recent-activity-timeline-section" className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Recent Activity Timeline</h3>
              <p className="text-xs text-slate-400">
                Audit log of applications, interview stages, and system milestones
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">Real-time Stream</span>
        </div>

        {effectiveLogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {effectiveLogs.slice(0, 6).map((act) => (
              <div
                key={act.id}
                className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/70 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {act.badge || 'Activity'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{act.timestamp}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200">{act.title}</div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{act.description}</p>
                </div>

                {act.company && (
                  <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-300">{act.company}</span>
                    <span className="text-cyan-400">Synced</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs">
            No recent activity recorded yet. Actions taken across jobs, applications, and analyses will be logged here.
          </div>
        )}
      </div>
    </div>
  );
};
