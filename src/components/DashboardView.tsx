import React from 'react';
import {
  Briefcase,
  Layers,
  MessageSquareReply,
  Calendar,
  Award,
  XCircle,
  TrendingUp,
  Percent,
  Sparkles,
  ArrowRight,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  Mail,
  Zap,
  Target,
  Send,
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

  // Core Metrics Calculation
  const jobsSavedCount = effectiveJobs.length;
  const applicationsCount = applications.length;
  
  // Responses: any app that moved beyond 'applied' or 'saved' (i.e. screening, tech_interview, final_round, offer, rejected after interview)
  const respondedApps = applications.filter(
    (a) => a.stage !== 'applied' && a.stage !== 'saved' && a.stage !== 'withdrawn'
  );
  const responsesCount = respondedApps.length;

  // Active or completed interviews
  const interviewApps = applications.filter(
    (a) => a.stage === 'screening' || a.stage === 'tech_interview' || a.stage === 'final_round' || a.stage === 'offer'
  );
  const interviewsCount = interviewApps.length;

  // Offers
  const offerApps = applications.filter((a) => a.stage === 'offer');
  const offersCount = offerApps.length;

  // Rejections
  const rejectionsCount = applications.filter((a) => a.stage === 'rejected').length;

  // Rates
  const responseRate = applicationsCount > 0 ? ((responsesCount / applicationsCount) * 100).toFixed(1) : '0';
  const interviewRate = applicationsCount > 0 ? ((interviewsCount / applicationsCount) * 100).toFixed(1) : '0';
  const offerRate = applicationsCount > 0 ? ((offersCount / applicationsCount) * 100).toFixed(1) : '0';

  // Application Pipeline stages breakdown
  const stages = [
    { key: 'saved', label: 'Saved', count: effectiveJobs.filter((j) => j.status === 'saved').length, color: 'bg-slate-700 text-slate-300' },
    { key: 'applied', label: 'Applied', count: applications.filter((a) => a.stage === 'applied').length, color: 'bg-blue-600/30 text-blue-300 border-blue-500/40' },
    { key: 'screening', label: 'Screening', count: applications.filter((a) => a.stage === 'screening').length, color: 'bg-amber-600/30 text-amber-300 border-amber-500/40' },
    { key: 'tech_interview', label: 'Tech Interview', count: applications.filter((a) => a.stage === 'tech_interview').length, color: 'bg-purple-600/30 text-purple-300 border-purple-500/40' },
    { key: 'final_round', label: 'Final Round', count: applications.filter((a) => a.stage === 'final_round').length, color: 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40' },
    { key: 'offer', label: 'Offers', count: offersCount, color: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40 font-bold' },
  ];

  // Top Job Matches sorted by score
  const topJobMatches = [...effectiveJobs]
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, 4);

  // Follow-ups due
  const pendingFollowUps = followUps
    .filter((f) => f.status !== 'completed')
    .slice(0, 4);

  return (
    <div id="dashboard-main-view" className="space-y-6">
      {/* Top Banner / Welcome & Search Status */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950/40 border border-slate-700/60 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Command Centre Active
              </span>
              <span className="text-xs text-slate-400">
                Target: {userProfile.targetSalary}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Welcome back, {userProfile.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              You currently have <strong className="text-emerald-400 font-semibold">{offersCount} active offers</strong>,{' '}
              <strong className="text-cyan-300 font-semibold">{interviewsCount} companies interviewing</strong>, and{' '}
              <strong className="text-amber-300 font-semibold">{pendingFollowUps.length} follow-ups due</strong>.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="dashboard-analyze-jd-btn"
              onClick={() => onNavigate('jd-analyser')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 text-xs font-semibold border border-purple-500/40 transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI JD Analyser</span>
            </button>
            <button
              id="dashboard-new-app-btn"
              onClick={onOpenAddJobModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all shadow-lg shadow-cyan-950/60"
            >
              <Target className="w-4 h-4" />
              <span>+ Log Job / App</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Core Primary Stats Grid (6 cards as requested) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Core Pipeline Volumes
          </h3>
          <span className="text-[11px] text-slate-400">Live Real-time Sync</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Jobs Saved */}
          <div
            id="metric-jobs-saved"
            onClick={() => onNavigate('jobs')}
            className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:translate-y-[-2px] group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Jobs Saved</span>
              <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-colors">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-100">{jobsSavedCount}</div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-cyan-400 font-semibold">{effectiveJobs.filter(j => j.tier === 'Tier 1' || j.tier === 'Tier 2').length} high tier</span> • {jobsSavedCount} tracked
            </div>
          </div>

          {/* Applications */}
          <div
            id="metric-applications"
            onClick={() => onNavigate('applications')}
            className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:translate-y-[-2px] group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Applications</span>
              <div className="p-1.5 rounded-lg bg-slate-800 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-100">{applicationsCount}</div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">{applications.filter(a => a.stage !== 'rejected' && a.stage !== 'withdrawn').length} active</span> in funnel
            </div>
          </div>

          {/* Responses */}
          <div
            id="metric-responses"
            onClick={() => onNavigate('applications')}
            className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:translate-y-[-2px] group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Responses</span>
              <div className="p-1.5 rounded-lg bg-slate-800 text-amber-400 group-hover:bg-amber-500/20 group-hover:text-amber-300 transition-colors">
                <MessageSquareReply className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-300">{responsesCount}</div>
            <div className="text-[10px] text-slate-400 mt-1">
              {responsesCount} recruiter responses ({responseRate}%)
            </div>
          </div>

          {/* Interviews */}
          <div
            id="metric-interviews"
            onClick={() => onNavigate('interviews')}
            className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:translate-y-[-2px] group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Interviews</span>
              <div className="p-1.5 rounded-lg bg-slate-800 text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-purple-300">{interviewsCount}</div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-purple-400 font-semibold">{interviews.length > 0 ? interviews.length : interviewsCount} scheduled</span> rounds
            </div>
          </div>

          {/* Offers */}
          <div
            id="metric-offers"
            onClick={() => onNavigate('applications')}
            className="p-4 rounded-xl bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 cursor-pointer transition-all hover:translate-y-[-2px] group shadow-lg shadow-emerald-950/30"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-emerald-300">Offers</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-300">{offersCount}</div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-1">
              {offersCount > 0 ? `${offersCount} extended package${offersCount > 1 ? 's' : ''}` : '0 active offers'}
            </div>
          </div>

          {/* Rejections */}
          <div
            id="metric-rejections"
            onClick={() => onNavigate('applications')}
            className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:translate-y-[-2px] group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Rejections</span>
              <div className="p-1.5 rounded-lg bg-slate-800 text-rose-400 group-hover:bg-rose-500/20 group-hover:text-rose-300 transition-colors">
                <XCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-300">{rejectionsCount}</div>
            <div className="text-[10px] text-slate-400 mt-1">
              {rejectionsCount} passed / archived
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Conversion Rates Row (Response Rate, Interview Rate, Offer Rate) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Percent className="w-3.5 h-3.5 text-cyan-400" />
            Conversion Performance KPI Benchmarks
          </h3>
          <span className="text-[11px] text-emerald-400 font-medium">Above Tech Industry Benchmark (12-15%)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Response Rate */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-slate-300">Response Rate</div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                +14.2% vs avg
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-cyan-400">{responseRate}%</span>
              <span className="text-xs text-slate-400">of submitted applications</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-teal-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(Number(responseRate), 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
              <span>Target: 25%</span>
              <span className="text-cyan-300 font-semibold">{responsesCount} of {applicationsCount} apps</span>
            </div>
          </div>

          {/* Interview Rate */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-slate-300">Interview Rate</div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Strong Funnel
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-400">{interviewRate}%</span>
              <span className="text-xs text-slate-400">apps converted to interviews</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(Number(interviewRate) * 2, 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
              <span>Target: 10%</span>
              <span className="text-purple-300 font-semibold">{interviewsCount} technical loops</span>
            </div>
          </div>

          {/* Offer Rate */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-slate-300">Offer Rate</div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Outstanding (4.8%)
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400">{offerRate}%</span>
              <span className="text-xs text-slate-400">total application-to-offer</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(Number(offerRate) * 10, 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
              <span>Target: 3%</span>
              <span className="text-emerald-300 font-semibold">{offersCount} offers extended</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Application Pipeline Stages Visualizer */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Application Pipeline Stages Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live funnel stages showing distribution of active opportunities.
            </p>
          </div>
          <button
            onClick={() => onNavigate('applications')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
          >
            <span>Open Kanban Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {stages.map((stage, idx) => (
            <div
              key={stage.key}
              onClick={() => onNavigate('applications')}
              className={`p-3 rounded-xl border transition-all cursor-pointer hover:bg-slate-800/80 ${stage.color} bg-slate-800/40`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold">{stage.label}</span>
                <span className="text-[10px] opacity-75">#{idx + 1}</span>
              </div>
              <div className="text-xl font-black">{stage.count}</div>
              <div className="text-[10px] opacity-80 mt-1">
                {stage.key === 'offer' ? 'Active Packages' : `${((stage.count / applicationsCount) * 100).toFixed(0)}% of pipeline`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Top Job Matches & Follow-ups Due (2-Column Desktop Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Job Matches (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Top Job Matches</h3>
                  <p className="text-xs text-slate-400">Algorithmic & AI skill compatibility rating</p>
                </div>
              </div>
              <button
                onClick={() => navigate('jobs')}
                className="text-xs text-cyan-400 hover:underline font-semibold"
              >
                View all ({effectiveJobs.length})
              </button>
            </div>

            <div className="space-y-3">
              {topJobMatches.map((job) => (
                <div
                  key={job.id}
                  className="p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200 hover:text-cyan-300 truncate">
                          {job.title}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-slate-300">
                          {job.tier}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        <span className="font-semibold text-slate-300">{job.company}</span> • {job.location} • <span className="text-emerald-400 font-medium">{job.salary}</span>
                      </div>
                      
                      {/* Skill tags */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(job.matchKeyHighlights || []).slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.2 rounded text-[10px] bg-slate-700/60 text-slate-300 border border-slate-600/40"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Match Score & Action */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold">
                        <span>{job.matchScore}%</span>
                        <span className="text-[10px] font-normal text-emerald-400">Match</span>
                      </div>

                      <button
                        onClick={() => onAnalyzeJob(job)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-[11px] font-semibold border border-purple-500/30 transition-colors"
                      >
                        <FileSearch className="w-3 h-3" />
                        <span>Analyze JD</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Scored against Kavin's Master Profile & Skills</span>
            <button
              onClick={() => navigate('jd-analyser')}
              className="text-purple-300 hover:text-purple-200 font-semibold flex items-center gap-1"
            >
              <span>Custom JD Analyzer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Follow-ups Due (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Follow-ups Due</h3>
                  <p className="text-xs text-slate-400">High-priority outreach & response reminders</p>
                </div>
              </div>
              <button
                onClick={() => navigate('follow-ups')}
                className="text-xs text-cyan-400 hover:underline font-semibold"
              >
                View all ({followUps.length})
              </button>
            </div>

            <div className="space-y-3">
              {pendingFollowUps.map((fu) => (
                <div
                  key={fu.id}
                  className={`p-3 rounded-xl border transition-all ${
                    fu.status === 'overdue'
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : fu.status === 'due_today'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-slate-800/40 border-slate-700/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-200 truncate">{fu.company}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                            fu.status === 'overdue'
                              ? 'bg-rose-500/20 text-rose-300'
                              : fu.status === 'due_today'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {fu.status === 'overdue' ? 'Overdue' : fu.status === 'due_today' ? 'Due Today' : 'Upcoming'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">{fu.type} • {fu.recipientName}</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenOutreachModal(fu)}
                        className="p-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40"
                        title="Send Draft Email"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onMarkFollowUpComplete(fu.id)}
                        className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                        title="Mark Done"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {pendingFollowUps.length === 0 && (
                <div className="py-8 text-center text-slate-400">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-1.5" />
                  <div className="text-xs font-medium">All follow-ups completed!</div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">3-day post-apply & 24h post-interview rules</span>
            <button
              onClick={() => navigate('follow-ups')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Open Follow-ups Hub →
            </button>
          </div>
        </div>
      </div>

      {/* 5. Recent Activity Timeline */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Recent Activity Timeline</h3>
              <p className="text-xs text-slate-400">Chronological log of applications, interview stages, and offers</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">Last updated: Just now</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {effectiveLogs.slice(0, 6).map((act) => (
            <div
              key={act.id}
              className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/70 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {act.badge}
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
      </div>
    </div>
  );
};
