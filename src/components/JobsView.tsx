import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  ExternalLink,
  Sparkles,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Edit3,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  Layers,
  LayoutGrid,
  List,
  AlertCircle,
  Briefcase,
  Link as LinkIcon,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Tag,
  Eye,
  Check,
  X,
  RotateCcw,
  Sparkle,
} from 'lucide-react';
import {
  FirestoreJob,
  FirestoreJobStatus,
  JobPriority,
  WorkType,
} from '../types';
import { JobDetailModal } from './JobDetailModal';
import { EditJobModal } from './EditJobModal';
import { deleteDemoJobs, updateJob, deleteJob } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';

interface JobsViewProps {
  jobs: FirestoreJob[];
  onAnalyzeJob?: (job: FirestoreJob) => void;
  onOpenAddJobModal?: () => void;
  onUpdateJobStatus?: (id: string, status: FirestoreJobStatus) => void;
  onDeleteJob?: (id: string) => void;
  onNavigateToTab?: (tab: any) => void;
}

const ALL_STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Saved', value: 'Saved' },
  { label: 'JD Analyzed', value: 'JD Analyzed' },
  { label: 'Resume Ready', value: 'Resume Ready' },
  { label: 'Ready to Apply', value: 'Ready to Apply' },
  { label: 'Applied', value: 'Applied' },
  { label: 'Acknowledged', value: 'Acknowledged' },
  { label: 'Assessment', value: 'Assessment' },
  { label: 'Interview 1', value: 'Interview 1' },
  { label: 'Interview 2', value: 'Interview 2' },
  { label: 'HR Round', value: 'HR Round' },
  { label: 'Offer', value: 'Offer' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Ghosted', value: 'Ghosted' },
  { label: 'Withdrawn', value: 'Withdrawn' },
];

const ALL_STATUSES_LIST: FirestoreJobStatus[] = [
  'Saved',
  'JD Analyzed',
  'Resume Ready',
  'Ready to Apply',
  'Applied',
  'Acknowledged',
  'Assessment',
  'Interview 1',
  'Interview 2',
  'HR Round',
  'Offer',
  'Rejected',
  'Ghosted',
  'Withdrawn',
];

export const JobsView: React.FC<JobsViewProps> = ({
  jobs,
  onAnalyzeJob,
  onOpenAddJobModal,
  onUpdateJobStatus,
  onDeleteJob,
  onNavigateToTab,
}) => {
  const { user } = useAuth();

  // Quick Top Intake State
  const [quickUrl, setQuickUrl] = useState('');
  const [quickExtractLoading, setQuickExtractLoading] = useState(false);
  const [quickExtractError, setQuickExtractError] = useState<string | null>(null);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [workTypeFilter, setWorkTypeFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [minMatchFilter, setMinMatchFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'match' | 'company' | 'role' | 'priority'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [selectedDetailJob, setSelectedDetailJob] = useState<FirestoreJob | null>(null);
  const [selectedEditJob, setSelectedEditJob] = useState<FirestoreJob | null>(null);
  const [isDeletingDemo, setIsDeletingDemo] = useState(false);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  // Check if demo jobs exist in the user's data
  const hasDemoJobs = useMemo(() => {
    return jobs.some((j) => j.isDemo);
  }, [jobs]);

  // Extract unique sources for filter dropdown
  const uniqueSources = useMemo(() => {
    const s = new Set<string>();
    jobs.forEach((j) => {
      if (j.source) s.add(j.source);
    });
    return Array.from(s);
  }, [jobs]);

  // Filter & Sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCompany = (job.company || '').toLowerCase().includes(q);
          const matchRole = (job.role || '').toLowerCase().includes(q);
          const matchLocation = (job.location || '').toLowerCase().includes(q);
          const matchSource = (job.source || '').toLowerCase().includes(q);
          const matchTags = (job.tags || []).some((t) => t.toLowerCase().includes(q));
          if (!matchCompany && !matchRole && !matchLocation && !matchSource && !matchTags) {
            return false;
          }
        }

        // Status filter
        if (statusFilter !== 'ALL' && job.status !== statusFilter) {
          return false;
        }

        // Priority filter
        if (priorityFilter !== 'ALL' && job.priority !== priorityFilter) {
          return false;
        }

        // Work Type filter
        if (workTypeFilter !== 'ALL' && job.workType !== workTypeFilter) {
          return false;
        }

        // Source filter
        if (sourceFilter !== 'ALL' && job.source !== sourceFilter) {
          return false;
        }

        // Min Match Score filter
        if (minMatchFilter !== 'ALL') {
          const score = job.fitnessScore || 0;
          if (minMatchFilter === '90' && score < 90) return false;
          if (minMatchFilter === '80' && score < 80) return false;
          if (minMatchFilter === '70' && score < 70) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        }
        if (sortBy === 'oldest') {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tA - tB;
        }
        if (sortBy === 'match') {
          return (b.fitnessScore || 0) - (a.fitnessScore || 0);
        }
        if (sortBy === 'company') {
          return (a.company || '').localeCompare(b.company || '');
        }
        if (sortBy === 'role') {
          return (a.role || '').localeCompare(b.role || '');
        }
        if (sortBy === 'priority') {
          const rank = { Dream: 3, Target: 2, Safety: 1 };
          const pA = rank[(a.priority as keyof typeof rank) || 'Target'] || 2;
          const pB = rank[(b.priority as keyof typeof rank) || 'Target'] || 2;
          return pB - pA;
        }
        return 0;
      });
  }, [jobs, searchQuery, statusFilter, priorityFilter, workTypeFilter, sourceFilter, minMatchFilter, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    workTypeFilter !== 'ALL' ||
    sourceFilter !== 'ALL' ||
    minMatchFilter !== 'ALL';

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setWorkTypeFilter('ALL');
    setSourceFilter('ALL');
    setMinMatchFilter('ALL');
  };

  const handleQuickExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;
    if (onOpenAddJobModal) {
      onOpenAddJobModal();
    }
  };

  const handlePurgeDemoData = async () => {
    if (!user) return;
    if (!confirm('Are you sure you want to remove all pre-loaded demo jobs? Your personal jobs will be preserved.')) {
      return;
    }
    setIsDeletingDemo(true);
    try {
      const count = await deleteDemoJobs(user.uid);
      setDemoNotice(`Successfully purged ${count} demo job records.`);
      setTimeout(() => setDemoNotice(null), 4000);
    } catch (e) {
      console.error('Failed to delete demo jobs:', e);
      setDemoNotice('Failed to purge demo data.');
    } finally {
      setIsDeletingDemo(false);
    }
  };

  const handleUpdateStatus = async (jobId: string, newStatus: FirestoreJobStatus) => {
    if (onUpdateJobStatus) {
      onUpdateJobStatus(jobId, newStatus);
    } else if (user) {
      await updateJob(jobId, user.uid, { status: newStatus });
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (onDeleteJob) {
      onDeleteJob(id);
    } else if (user) {
      await deleteJob(id, user.uid);
    }
  };

  const handleSaveEdit = async (jobId: string, updates: Partial<FirestoreJob>) => {
    if (!user) return;
    await updateJob(jobId, user.uid, updates);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP PROMINENT INTAKE BAR ("SAVE A JOB") */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-cyan-950/30 border border-slate-800/90 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">
                Save a Job & Ingest JD
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Paste any public job URL from LinkedIn, Naukri, Indeed, or Greenhouse for automated parsing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAddJobModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-950/50 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              <span>Save / Add Job</span>
            </button>

            <button
              onClick={onOpenAddJobModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Paste JD Manually</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demo Data Notice / Purge Bar */}
      {hasDemoJobs && (
        <div className="px-4 py-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>
              Your workspace currently includes sample demo job opportunities.
            </span>
          </div>
          <button
            onClick={handlePurgeDemoData}
            disabled={isDeletingDemo}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 border border-amber-500/40 font-semibold transition-colors text-xs disabled:opacity-50"
          >
            {isDeletingDemo ? 'Purging Demo Jobs...' : 'Remove Demo Data'}
          </button>
        </div>
      )}

      {demoNotice && (
        <div className="px-4 py-2.5 rounded-xl bg-cyan-950/60 border border-cyan-800 text-cyan-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{demoNotice}</span>
        </div>
      )}

      {/* 2. SEARCH, FILTERS & VIEW CONTROLS */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-3.5 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Real-time Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, company, location, skills, or tags..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort & View Mode */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="newest" className="bg-slate-900">Newest Saved</option>
                <option value="oldest" className="bg-slate-900">Oldest Saved</option>
                <option value="match" className="bg-slate-900">Highest Match</option>
                <option value="company" className="bg-slate-900">Company (A-Z)</option>
                <option value="role" className="bg-slate-900">Role Title (A-Z)</option>
                <option value="priority" className="bg-slate-900">Priority (Dream first)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex rounded-xl bg-slate-800/80 border border-slate-700/80 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Dense Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium mr-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filters:</span>
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          >
            {ALL_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="Dream">Dream</option>
            <option value="Target">Target</option>
            <option value="Safety">Safety</option>
          </select>

          {/* Work Type filter */}
          <select
            value={workTypeFilter}
            onChange={(e) => setWorkTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="ALL">All Work Types</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">On-site</option>
          </select>

          {/* Match Score filter */}
          <select
            value={minMatchFilter}
            onChange={(e) => setMinMatchFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="ALL">Any AI Match Score</option>
            <option value="90">90%+ Strong Match</option>
            <option value="80">80%+ Good Match</option>
            <option value="70">70%+ Moderate Match</option>
          </select>

          {/* Source filter (if any) */}
          {uniqueSources.length > 0 && (
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="ALL">All Sources</option>
              {uniqueSources.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          )}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}

          <div className="ml-auto text-slate-400 text-xs font-medium">
            Showing <strong className="text-white">{filteredAndSortedJobs.length}</strong> of{' '}
            <strong className="text-white">{jobs.length}</strong> opportunities
          </div>
        </div>
      </div>

      {/* 3. JOBS LIST / EMPTY STATE */}
      {filteredAndSortedJobs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Opportunities Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {hasActiveFilters
                ? 'No jobs match your current search and filter criteria. Try resetting filters.'
                : 'Your jobs repository is currently empty. Ingest your first opportunity via URL or manual paste.'}
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            {hasActiveFilters ? (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={onOpenAddJobModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-950/50"
              >
                <Plus className="w-4 h-4" />
                <span>Track Your First Job</span>
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAndSortedJobs.map((job) => {
            const priorityClass =
              job.priority === 'Dream'
                ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                : job.priority === 'Target'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                : 'bg-slate-700/40 text-slate-300 border-slate-600';

            return (
              <div
                key={job.id}
                className="rounded-2xl bg-slate-900 border border-slate-800/90 hover:border-slate-700 p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-lg transition-all text-xs group"
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 text-sm shadow-inner flex-shrink-0">
                        {job.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {job.role}
                        </h3>
                        <div className="text-slate-300 font-semibold flex items-center gap-1.5 text-xs mt-0.5">
                          <span>{job.company}</span>
                          {job.isDemo && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Demo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {job.fitnessScore ? (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>{job.fitnessScore}%</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Badges Bar */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${priorityClass}`}
                    >
                      {job.priority || 'Target'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {job.source || 'Direct'}
                    </span>
                    {job.workType && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-400">
                        {job.workType}
                      </span>
                    )}
                    {job.analysisStatus === 'failed' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        AI Analysis Incomplete
                      </span>
                    )}
                  </div>

                  {/* Metadata key points */}
                  <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{job.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-emerald-400 font-medium truncate">
                        {job.salary || 'Undisclosed'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span>{job.experience || '5+ Years'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span>{job.postedDate || 'Recent'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Status & Actions Footer */}
                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  {/* Status Dropdown */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">Status:</span>
                    <select
                      value={job.status}
                      onChange={(e) =>
                        handleUpdateStatus(job.id || '', e.target.value as FirestoreJobStatus)
                      }
                      className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                    >
                      {ALL_STATUSES_LIST.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Button Toolbar */}
                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    <button
                      onClick={() => setSelectedDetailJob(job)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>View Job</span>
                    </button>

                    {job.status !== 'Applied' ? (
                      <button
                        onClick={() => handleUpdateStatus(job.id || '', 'Applied')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-semibold transition-colors"
                        title="Mark Applied"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Applied</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (onAnalyzeJob) onAnalyzeJob(job);
                          else setSelectedDetailJob(job);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-semibold transition-colors"
                        title="Analyze JD"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>Analyze</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedEditJob(job)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                      title="Edit Job"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete ${job.role} at ${job.company}?`)) {
                          handleDeleteJob(job.id || '');
                        }
                      }}
                      className="p-1.5 rounded-xl text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      title="Delete Job"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DENSE TABLE VIEW */
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-3 px-4">Role & Company</th>
                  <th className="py-3 px-3">Location / Work</th>
                  <th className="py-3 px-3">Compensation</th>
                  <th className="py-3 px-3">Source</th>
                  <th className="py-3 px-3">Match</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAndSortedJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white group-hover:text-cyan-300">
                        {job.role}
                      </div>
                      <div className="text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                        <span>{job.company}</span>
                        {job.isDemo && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Demo
                          </span>
                        )}
                        {job.analysisStatus === 'failed' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                            AI Incomplete
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-slate-300">
                      <div>{job.location || 'Remote'}</div>
                      <div className="text-[10px] text-cyan-400">{job.workType || 'Remote'}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="text-emerald-400 font-semibold">
                        {job.salary || 'Undisclosed'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-400">
                      {job.source || 'Direct'}
                    </td>

                    <td className="py-3.5 px-3">
                      {job.fitnessScore ? (
                        <span className="font-bold text-emerald-400">
                          {job.fitnessScore}%
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          job.priority === 'Dream'
                            ? 'bg-purple-500/20 text-purple-300'
                            : job.priority === 'Target'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {job.priority || 'Target'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <select
                        value={job.status}
                        onChange={(e) =>
                          handleUpdateStatus(job.id || '', e.target.value as FirestoreJobStatus)
                        }
                        className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-semibold text-xs focus:outline-none"
                      >
                        {ALL_STATUSES_LIST.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDetailJob(job)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setSelectedEditJob(job)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${job.role} at ${job.company}?`)) {
                              handleDeleteJob(job.id || '');
                            }
                          }}
                          className="p-1 rounded-lg text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MODALS */}
      {selectedDetailJob && (
        <JobDetailModal
          isOpen={Boolean(selectedDetailJob)}
          onClose={() => setSelectedDetailJob(null)}
          job={selectedDetailJob}
          onEditJob={(j) => {
            setSelectedDetailJob(null);
            setSelectedEditJob(j);
          }}
          onDeleteJob={(id) => {
            handleDeleteJob(id);
            setSelectedDetailJob(null);
          }}
          onAnalyzeJob={onAnalyzeJob}
          onNavigateToTab={onNavigateToTab}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {selectedEditJob && (
        <EditJobModal
          isOpen={Boolean(selectedEditJob)}
          onClose={() => setSelectedEditJob(null)}
          job={selectedEditJob}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};
