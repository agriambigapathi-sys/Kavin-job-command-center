import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Target,
  Zap,
  DollarSign,
  PieChart,
  Calendar,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { DashboardStats, Application } from '../types';

interface AnalyticsViewProps {
  stats?: DashboardStats;
  applications?: Application[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  stats = {
    jobsSaved: 24,
    applicationsSent: 42,
    responsesReceived: 18,
    interviewsScheduled: 14,
    offersReceived: 2,
    rejections: 9,
    responseRate: 42.8,
    interviewRate: 33.3,
    offerRate: 4.8,
  },
  applications = [],
}) => {
  const conversionStages = [
    { label: 'Applications Sent', count: stats?.applicationsSent || 42, pct: 100, color: 'bg-cyan-500' },
    { label: 'Recruiter Responses', count: stats?.responsesReceived || 18, pct: stats?.responseRate || 42.8, color: 'bg-blue-500' },
    { label: 'Interviews Landed', count: stats?.interviewsScheduled || 14, pct: stats?.interviewRate || 33.3, color: 'bg-purple-500' },
    { label: 'Offers Extended', count: stats?.offersReceived || 2, pct: stats?.offerRate || 4.8, color: 'bg-emerald-500' },
  ];

  const weeklyPace = [
    { week: 'Week 1', apps: 8, interviews: 1 },
    { week: 'Week 2', apps: 12, interviews: 3 },
    { week: 'Week 3', apps: 10, interviews: 4 },
    { week: 'Week 4 (Current)', apps: 12, interviews: 6 },
  ];

  const topSkillsInDemand = [
    { skill: 'React 19 & TypeScript Architecture', demand: 94 },
    { skill: 'GenAI Orchestration & LLM Streaming', demand: 89 },
    { skill: 'High-Concurrency Node.js / Express', demand: 82 },
    { skill: 'Distributed State & Cloud Run', demand: 76 },
    { skill: 'Tailwind CSS & Design Systems', demand: 71 },
  ];

  return (
    <div id="analytics-view" className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>Search Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Funnel conversion metrics, weekly velocity, and application distribution.
          </p>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Response Rate</span>
            <div className="text-2xl font-black text-white mt-1">{stats.responseRate}%</div>
            <div className="text-xs text-emerald-400 font-semibold mt-0.5">Industry Avg: 12% (+30.8%)</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Interview Conversion</span>
            <div className="text-2xl font-black text-white mt-1">{stats.interviewRate}%</div>
            <div className="text-xs text-purple-400 font-semibold mt-0.5">Screen-to-Loop: 66.7%</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Target className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Offer Yield Rate</span>
            <div className="text-2xl font-black text-white mt-1">{stats.offerRate}%</div>
            <div className="text-xs text-emerald-400 font-semibold mt-0.5">2 Confirmed Offers</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Funnel Chart & Weekly Pace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Conversion Funnel (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>End-to-End Pipeline Funnel</span>
          </h3>

          <div className="space-y-4 pt-2">
            {conversionStages.map((stage, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{stage.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-300 font-bold">{stage.count}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({stage.pct}%)</span>
                  </div>
                </div>
                <div className="h-3 rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
                  <div
                    className={`h-full rounded-full ${stage.color} transition-all duration-700`}
                    style={{ width: `${stage.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Skills Demand Frequency (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Skill Demand Across Target Roles</span>
          </h3>

          <div className="space-y-3 pt-1">
            {topSkillsInDemand.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 truncate max-w-[200px]">{item.skill}</span>
                  <span className="text-cyan-400 font-bold font-mono">{item.demand}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                    style={{ width: `${item.demand}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
