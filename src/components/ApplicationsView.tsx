import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  ArrowRight,
  Sparkles,
  MapPin,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Application, ApplicationStage } from '../types';

interface ApplicationsViewProps {
  applications?: Application[];
  onOpenAddJobModal?: () => void;
  onUpdateStage?: (appId: string, newStage: ApplicationStage) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications = [],
  onOpenAddJobModal = () => {},
  onUpdateStage = (_appId: string, _newStage: ApplicationStage) => {},
}) => {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');

  const columns: { id: ApplicationStage; label: string; color: string }[] = [
    { id: 'applied', label: 'Applied', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
    { id: 'screening', label: 'Screening', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
    { id: 'tech_interview', label: 'Tech Interview', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
    { id: 'final_round', label: 'Final Round', color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10' },
    { id: 'offer', label: 'Offers Extended', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
    { id: 'rejected', label: 'Archived / Rejected', color: 'border-slate-700 text-slate-400 bg-slate-800/40' },
  ];

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(search.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === 'all' || app.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div id="applications-view-container" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Applications</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
              {applications.length} Total
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track interview progression, status updates, and next steps.
          </p>
        </div>

        <button
          onClick={onOpenAddJobModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by company or role..."
            value={search || ''}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="text-xs text-slate-400">
          Tip: Use the stage selector inside each card to advance applications.
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 items-start">
        {columns.map((col) => {
          const colApps = filteredApps.filter((a) => a.stage === col.id);
          return (
            <div
              key={col.id}
              className="bg-slate-900/80 rounded-2xl border border-slate-800 p-3.5 flex flex-col min-h-[480px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${col.color}`}>
                    {col.label}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">{colApps.length}</span>
              </div>

              {/* Cards list */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-0.5">
                {colApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors leading-tight">
                        {app.company}
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300">
                        {app.matchScore}%
                      </span>
                    </div>

                    <div className="text-[11px] font-medium text-slate-300 leading-tight mb-2">
                      {app.jobTitle}
                    </div>

                    {/* Salary Tag */}
                    <div className="text-[10px] text-emerald-400 font-semibold mb-2 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span>{app.salaryOffered || app.salaryExpected}</span>
                    </div>

                    {/* Next step badge */}
                    {app.nextStep && (
                      <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-700/60 text-[10px] text-slate-300 mb-2.5">
                        <div className="font-semibold text-cyan-300 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Next Step:</span>
                        </div>
                        <div className="text-slate-300 mt-0.5 line-clamp-2">{app.nextStep}</div>
                        {app.nextStepDate && (
                          <div className="text-slate-400 text-[9px] mt-0.5 font-mono">{app.nextStepDate}</div>
                        )}
                      </div>
                    )}

                    {/* Contact & Resume info */}
                    <div className="text-[10px] text-slate-400 space-y-0.5 mb-3">
                      {app.contactName && <div>Contact: <span className="text-slate-300">{app.contactName}</span></div>}
                      <div>Resume: <span className="text-slate-400 font-mono">{app.resumeVersion}</span></div>
                    </div>

                    {/* Move Stage Selector */}
                    <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">Stage:</span>
                      <select
                        value={app.stage}
                        onChange={(e) => onUpdateStage(app.id, e.target.value as ApplicationStage)}
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] text-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                      >
                        <option value="applied">Applied</option>
                        <option value="screening">Screening</option>
                        <option value="tech_interview">Tech Interview</option>
                        <option value="final_round">Final Round</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                ))}

                {colApps.length === 0 && (
                  <div className="py-8 text-center text-[11px] text-slate-400 border border-dashed border-slate-800 rounded-xl">
                    No applications in {col.label.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
