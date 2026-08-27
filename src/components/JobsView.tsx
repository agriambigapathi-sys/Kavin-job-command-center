import React, { useState, useMemo, useRef } from 'react';
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
  Building2,
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
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  MoveRight,
  Send,
  UserPlus,
  Users,
  Award,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  Crown,
  Maximize2,
} from 'lucide-react';
import {
  FirestoreJob,
  FirestoreJobStatus,
  JobPriority,
  WorkType,
  Application,
  FollowUp,
  FirestoreInterview,
} from '../types';
import { JobDetailModal } from './JobDetailModal';
import { EditJobModal } from './EditJobModal';
import { FindNetworkModal } from './FindNetworkModal';
import { MessageSequencesModal } from './MessageSequencesModal';
import { deleteDemoJobs, updateJob, deleteJob, logUserActivity } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';

export interface JobsViewProps {
  jobs: FirestoreJob[];
  applications?: Application[];
  followUps?: FollowUp[];
  interviews?: FirestoreInterview[];
  onAnalyzeJob?: (job: FirestoreJob) => void;
  onTailorResume?: (job: FirestoreJob) => void;
  onOpenAddJobModal?: () => void;
  onUpdateJobStatus?: (id: string, status: FirestoreJobStatus) => void;
  onDeleteJob?: (id: string) => void;
  onNavigateToTab?: (tab: any) => void;
  onNavigateToCoverLetter?: (company: string, role: string, jd: string) => void;
  onOpenOutreachModal?: (followUp?: any) => void;
}

// 7 KANBAN PIPELINE STAGES
export type KanbanStageId =
  | 'DISCOVERED'
  | 'SHORTLISTED'
  | 'APPLIED'
  | 'ASSESSMENT'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED';

interface KanbanStageDef {
  id: KanbanStageId;
  label: string;
  sublabel: string;
  defaultStatus: FirestoreJobStatus;
  matchingStatuses: FirestoreJobStatus[];
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
}

const KANBAN_STAGES: KanbanStageDef[] = [
  {
    id: 'DISCOVERED',
    label: 'Discovered',
    sublabel: 'Ingested & Saved',
    defaultStatus: 'Saved',
    matchingStatuses: ['Saved'],
    borderColor: 'border-slate-200',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    dotColor: 'bg-slate-500',
  },
  {
    id: 'SHORTLISTED',
    label: 'Shortlisted',
    sublabel: 'Analyzed & Ready',
    defaultStatus: 'Ready to Apply',
    matchingStatuses: ['JD Analyzed', 'Resume Ready', 'Ready to Apply'],
    borderColor: 'border-slate-200',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    dotColor: 'bg-blue-600',
  },
  {
    id: 'APPLIED',
    label: 'Applied',
    sublabel: 'Submitted & In Review',
    defaultStatus: 'Applied',
    matchingStatuses: ['Applied', 'Acknowledged'],
    borderColor: 'border-slate-200',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    dotColor: 'bg-sky-600',
  },
  {
    id: 'ASSESSMENT',
    label: 'Assessment',
    sublabel: 'Online Tests & Tasks',
    defaultStatus: 'Assessment',
    matchingStatuses: ['Assessment'],
    borderColor: 'border-slate-200',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    dotColor: 'bg-purple-600',
  },
  {
    id: 'INTERVIEW',
    label: 'Interview',
    sublabel: 'Technical & HR Loops',
    defaultStatus: 'Interview 1',
    matchingStatuses: ['Interview 1', 'Interview 2', 'HR Round'],
    borderColor: 'border-slate-200',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    dotColor: 'bg-indigo-600',
  },
  {
    id: 'OFFER',
    label: 'Offer',
    sublabel: 'Packages & Closing',
    defaultStatus: 'Offer',
    matchingStatuses: ['Offer'],
    borderColor: 'border-slate-200',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    dotColor: 'bg-emerald-600',
  },
  {
    id: 'REJECTED',
    label: 'Rejected',
    sublabel: 'Archived / Withdrawn',
    defaultStatus: 'Rejected',
    matchingStatuses: ['Rejected', 'Ghosted', 'Withdrawn'],
    borderColor: 'border-slate-200',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-600',
    dotColor: 'bg-slate-400',
  },
];

export const JobsView: React.FC<JobsViewProps> = ({
  jobs,
  applications = [],
  followUps = [],
  interviews = [],
  onAnalyzeJob,
  onTailorResume,
  onOpenAddJobModal,
  onUpdateJobStatus,
  onDeleteJob,
  onNavigateToTab,
  onNavigateToCoverLetter,
  onOpenOutreachModal,
}) => {
  const { user } = useAuth();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [workTypeFilter, setWorkTypeFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [matchScoreFilter, setMatchScoreFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'match' | 'company' | 'role' | 'priority'>('newest');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Top Navigation Tabs & Resume Selector matching Screenshot 1
  const [activeTopTab, setActiveTopTab] = useState<'My Jobs' | 'Target Companies' | 'Recruitment Agencies' | 'My Network'>('My Jobs');
  const [selectedResume, setSelectedResume] = useState<string>('Ambigapathi_Data_Analyst_Resume.pdf');

  // Networking modals state
  const [isFindNetworkOpen, setIsFindNetworkOpen] = useState(false);
  const [findNetworkContext, setFindNetworkContext] = useState({ company: '', role: '' });
  const [isSequenceModalOpen, setIsSequenceModalOpen] = useState(false);

  // Mobile active stage tab
  const [activeMobileStage, setActiveMobileStage] = useState<KanbanStageId>('DISCOVERED');

  // Horizontal Sideways Scroll ref and handlers
  const kanbanScrollRef = useRef<HTMLDivElement>(null);
  const handleScrollKanban = (direction: 'left' | 'right') => {
    if (kanbanScrollRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      kanbanScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Modals & Slide-over State
  const [selectedDetailJob, setSelectedDetailJob] = useState<FirestoreJob | null>(null);
  const [selectedEditJob, setSelectedEditJob] = useState<FirestoreJob | null>(null);
  const [isDeletingDemo, setIsDeletingDemo] = useState(false);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  // Drag & Drop State
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<KanbanStageId | null>(null);

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

  // Helper to resolve which Kanban Stage a job belongs to
  const getJobStage = (job: FirestoreJob): KanbanStageId => {
    const status = job.status || 'Saved';
    for (const stage of KANBAN_STAGES) {
      if (stage.matchingStatuses.includes(status)) {
        return stage.id;
      }
    }
    return 'DISCOVERED';
  };

  // Filter & Sort jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
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

      // Stage filter
      if (stageFilter !== 'ALL') {
        const jobStage = getJobStage(job);
        if (jobStage !== stageFilter) return false;
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

      // Match Score filter
      if (matchScoreFilter !== 'ALL') {
        const score = job.fitnessScore || 0;
        if (matchScoreFilter === '90' && score < 90) return false;
        if (matchScoreFilter === '80' && (score < 80 || score >= 90)) return false;
        if (matchScoreFilter === '70' && (score < 70 || score >= 80)) return false;
        if (matchScoreFilter === 'low' && (score >= 70 || score === 0)) return false;
        if (matchScoreFilter === 'not_analyzed' && score > 0) return false;
      }

      return true;
    }).sort((a, b) => {
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
  }, [jobs, searchQuery, stageFilter, priorityFilter, workTypeFilter, sourceFilter, matchScoreFilter, sortBy]);

  // Group filtered jobs by 7 Kanban Stages
  const jobsByStage = useMemo(() => {
    const map: Record<KanbanStageId, FirestoreJob[]> = {
      DISCOVERED: [],
      SHORTLISTED: [],
      APPLIED: [],
      ASSESSMENT: [],
      INTERVIEW: [],
      OFFER: [],
      REJECTED: [],
    };

    filteredJobs.forEach((job) => {
      const stage = getJobStage(job);
      if (map[stage]) {
        map[stage].push(job);
      } else {
        map.DISCOVERED.push(job);
      }
    });

    return map;
  }, [filteredJobs]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    stageFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    workTypeFilter !== 'ALL' ||
    sourceFilter !== 'ALL' ||
    matchScoreFilter !== 'ALL';

  const clearAllFilters = () => {
    setSearchQuery('');
    setStageFilter('ALL');
    setPriorityFilter('ALL');
    setWorkTypeFilter('ALL');
    setSourceFilter('ALL');
    setMatchScoreFilter('ALL');
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
      await logUserActivity(user.uid, 'Status Changed', `Job moved to ${newStatus}`, jobId);
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

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    e.dataTransfer.setData('text/plain', jobId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedJobId(jobId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: KanbanStageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStageId: KanbanStageId) => {
    e.preventDefault();
    setDragOverStage(null);
    const jobId = e.dataTransfer.getData('text/plain') || draggedJobId;
    setDraggedJobId(null);

    if (!jobId || !user) return;

    const stageDef = KANBAN_STAGES.find((s) => s.id === targetStageId);
    if (!stageDef) return;

    const newStatus = stageDef.defaultStatus;
    await handleUpdateStatus(jobId, newStatus);
  };

  // Render Match Score Visual Element
  const renderMatchScoreBadge = (score?: number) => {
    if (score && score > 0) {
      if (score >= 90) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>{score}% • Excellent fit</span>
          </span>
        );
      }
      if (score >= 80) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 border border-blue-200 text-blue-700">
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>{score}% • Strong fit</span>
          </span>
        );
      }
      if (score >= 70) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 border border-amber-200 text-amber-800">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>{score}% • Moderate fit</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <span>{score}% • Lower fit</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-500 border border-slate-200">
        <span>Not analyzed</span>
      </span>
    );
  };

  // Check if job has an active follow-up due
  const getJobFollowUpStatus = (job: FirestoreJob) => {
    const fu = followUps.find((f) => f.company.toLowerCase() === job.company.toLowerCase() && f.status !== 'completed');
    if (!fu) return null;
    return fu;
  };

  // Smart Contextual Action for each card based on Stage
  const renderCardSmartAction = (job: FirestoreJob, stageId: KanbanStageId) => {
    switch (stageId) {
      case 'DISCOVERED':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onAnalyzeJob) onAnalyzeJob(job);
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors"
            id={`card-action-analyze-${job.id}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Analyze JD</span>
          </button>
        );

      case 'SHORTLISTED':
        return (
          <div className="flex-1 flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onAnalyzeJob) onAnalyzeJob(job);
              }}
              className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors truncate"
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Analyze</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onTailorResume) onTailorResume(job);
                else if (onNavigateToTab) onNavigateToTab('resumes');
              }}
              className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold transition-colors truncate"
            >
              <FileText className="w-3 h-3 text-purple-600" />
              <span>Tailor</span>
            </button>
          </div>
        );

      case 'APPLIED':
        return (
          <div className="flex-1 flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDetailJob(job);
              }}
              className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors truncate"
            >
              <Eye className="w-3 h-3 text-slate-600" />
              <span>View App</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenOutreachModal) onOpenOutreachModal();
                else if (onNavigateToTab) onNavigateToTab('follow-ups');
              }}
              className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors truncate"
            >
              <Clock className="w-3 h-3 text-amber-600" />
              <span>Follow Up</span>
            </button>
          </div>
        );

      case 'ASSESSMENT':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDetailJob(job);
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-purple-600" />
            <span>Prep Assessment</span>
          </button>
        );

      case 'INTERVIEW':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onNavigateToTab) onNavigateToTab('interviews');
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Open Prep Station</span>
          </button>
        );

      case 'OFFER':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDetailJob(job);
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-emerald-600" />
            <span>View Offer</span>
          </button>
        );

      case 'REJECTED':
      default:
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDetailJob(job);
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            <span>View Details</span>
          </button>
        );
    }
  };

  return (
    <div className="space-y-5 text-slate-900">
      
      {/* TOP MAIN SUB-NAV TABS matching Screenshot 1 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0B1120] p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTopTab('My Jobs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTopTab === 'My Jobs'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>My Jobs</span>
          </button>

          <button
            onClick={() => setActiveTopTab('Target Companies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTopTab === 'Target Companies'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Target Companies</span>
          </button>

          <button
            onClick={() => setActiveTopTab('Recruitment Agencies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTopTab === 'Recruitment Agencies'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Recruitment Agencies</span>
          </button>

          <button
            onClick={() => {
              setActiveTopTab('My Network');
              if (onNavigateToTab) onNavigateToTab('contacts');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTopTab === 'My Network'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>My Network</span>
          </button>
        </div>

        {/* Upgrade Now Badge */}
        <div className="flex items-center gap-2 pr-2">
          <button
            onClick={() => {}}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Upgrade Now</span>
          </button>
        </div>
      </div>

      {/* 1. RESUME PICKER & ACTION HUB BAR matching Screenshot 1 */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left: Select Resume Dropdown matching Screenshot 1 */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Select Resume:</span>
            <div className="relative">
              <select
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="Ambigapathi_Data_Analyst_Resume.pdf">📄 Ambigapathi_Data_Analyst_Resume.pdf (Primary)</option>
                <option value="FullStack-AI-Lead-2026.pdf">📄 FullStack-AI-Lead-2026.pdf</option>
                <option value="Data-Analyst-Fresher-2026.pdf">📄 Data-Analyst-Fresher-2026.pdf</option>
                <option value="Engineering-Manager-v2.pdf">📄 Engineering-Manager-v2.pdf</option>
              </select>
            </div>
          </div>

          {/* Right: View Toggles & Add Job CTA */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                id="view-mode-kanban-btn"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                id="view-mode-table-btn"
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>

            {hasDemoJobs && (
              <button
                onClick={handlePurgeDemoData}
                disabled={isDeletingDemo}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                title="Remove pre-loaded demo jobs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isDeletingDemo ? 'Purging...' : 'Purge Demo'}</span>
              </button>
            )}

            <button
              onClick={onOpenAddJobModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              id="header-add-job-btn"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add a Job</span>
            </button>
          </div>
        </div>

        {demoNotice && (
          <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>{demoNotice}</span>
          </div>
        )}
      </div>

      {/* 2. SEARCH AND FILTER CONTROLS BAR */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, role title, location, or tech tags..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              id="job-pipeline-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority Filter */}
            <select
              value={priorityFilter || 'ALL'}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              id="filter-priority-select"
            >
              <option value="ALL">All Priorities</option>
              <option value="Dream">Dream Tier</option>
              <option value="Target">Target Tier</option>
              <option value="Safety">Safety Tier</option>
            </select>

            {/* Match Score Filter */}
            <select
              value={matchScoreFilter || 'ALL'}
              onChange={(e) => setMatchScoreFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              id="filter-match-score-select"
            >
              <option value="ALL">All Match Grades</option>
              <option value="90">90%+ (Excellent Fit)</option>
              <option value="80">80%–89% (Strong Fit)</option>
              <option value="70">70%–79% (Moderate Fit)</option>
              <option value="low">&lt;70% (Lower Fit)</option>
              <option value="not_analyzed">Not Analyzed</option>
            </select>

            {/* Work Type Filter */}
            <select
              value={workTypeFilter || 'ALL'}
              onChange={(e) => setWorkTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              id="filter-work-type-select"
            >
              <option value="ALL">All Work Models</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy || 'newest'}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              id="sort-jobs-select"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="match">Sort: Highest Match</option>
              <option value="priority">Sort: Priority Tier</option>
              <option value="company">Sort: Company Name</option>
              <option value="role">Sort: Role Title</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                id="clear-all-filters-btn"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Metrics */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Showing <span className="font-semibold text-slate-800">{filteredJobs.length}</span> of{' '}
            <span className="font-semibold text-slate-800">{jobs.length}</span> total pipeline opportunities
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> 90%+ Fit
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> 80%+ Fit
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> 70%+ Fit
            </span>
          </div>
        </div>
      </div>

      {/* 3. MOBILE STAGE SELECTOR TABS (< 1024px) */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {KANBAN_STAGES.map((stage) => {
          const count = jobsByStage[stage.id]?.length || 0;
          const isActive = activeMobileStage === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setActiveMobileStage(stage.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                isActive
                  ? `${stage.badgeBg} ${stage.badgeText} border-blue-300 shadow-xs`
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
              <span>{stage.label}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. MAIN KANBAN PIPELINE VIEW */}
      {viewMode === 'kanban' ? (
        <div className="space-y-3">
          {/* Sideways Scroll Toolbar */}
          <div className="hidden lg:flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-semibold">Sideways Kanban Board:</span>
              <span className="text-[11px]">Scroll horizontally or use arrow buttons to navigate all 7 stages</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleScrollKanban('left')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
                title="Scroll Sideways Left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Scroll Left</span>
              </button>

              <button
                type="button"
                onClick={() => handleScrollKanban('right')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
                title="Scroll Sideways Right"
              >
                <span>Scroll Right</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Smooth Horizontal Sideways Scroll Container */}
          <div
            ref={kanbanScrollRef}
            className="flex flex-row items-start gap-4 overflow-x-auto pb-6 pt-1 scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 select-none min-w-full"
          >
            {KANBAN_STAGES.map((stage) => {
              const stageJobs = jobsByStage[stage.id] || [];
              const isOver = dragOverStage === stage.id;

              return (
                <div
                  key={stage.id}
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.id)}
                  className={`flex flex-col rounded-2xl bg-slate-50/80 dark:bg-[#0B132B] border transition-all w-[320px] min-w-[320px] max-w-[320px] shrink-0 shadow-sm ${
                    isOver
                      ? 'border-blue-400 bg-blue-50/30 shadow-md'
                      : stage.borderColor
                  } ${
                    // On mobile, hide columns that are not activeMobileStage
                    activeMobileStage === stage.id ? 'flex w-full min-w-full' : 'hidden lg:flex'
                  }`}
                  id={`kanban-column-${stage.id.toLowerCase()}`}
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-xl">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
                      <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase">
                        {stage.label}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${stage.badgeBg} ${stage.badgeText}`}>
                        {stageJobs.length}
                      </span>
                    </div>

                    <button
                      onClick={onOpenAddJobModal}
                      className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                      title={`Add job to ${stage.label}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Column Cards Container */}
                  <div className="p-2.5 space-y-3 min-h-[320px] max-h-[calc(100vh-280px)] overflow-y-auto">
                    {stageJobs.length > 0 ? (
                      stageJobs.map((job) => {
                        const fu = getJobFollowUpStatus(job);
                        const isDragging = draggedJobId === job.id;

                        return (
                          <div
                            key={job.id}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, job.id || '')}
                            onClick={() => setSelectedDetailJob(job)}
                            className={`group relative p-3.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/60 transition-all cursor-grab active:cursor-grabbing shadow-xs hover:shadow-md space-y-2.5 text-slate-900 dark:text-slate-100 ${
                              isDragging ? 'opacity-40 scale-95' : 'opacity-100'
                            }`}
                            id={`job-card-${job.id}`}
                          >
                            {/* Card Top Banner / Quick Action matching Screenshot 1 */}
                            {stage.id === 'DISCOVERED' ? (
                              <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFindNetworkContext({ company: job.company, role: job.role });
                                    setIsFindNetworkOpen(true);
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                                  <span>Find Network</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDetailJob(job);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-slate-200"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : stage.id === 'APPLIED' || stage.id === 'INTERVIEW' ? (
                              <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-1.5">
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                                    <span>Take Interview!</span>
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                  {job.fitnessScore ? `${job.fitnessScore}% MATCH` : '97% MATCH'}
                                </span>
                              </div>
                            ) : null}

                            {/* Card Header: Monogram, Company, Role, Tier */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs shrink-0">
                                  {job.company.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors truncate">
                                    {job.role}
                                  </h4>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                                    {job.company}
                                  </div>
                                </div>
                              </div>

                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                  job.priority === 'Dream'
                                    ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                    : job.priority === 'Target'
                                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                {job.priority || 'Target'}
                              </span>
                            </div>

                            {/* Location & Compensation Row */}
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span className="truncate max-w-[110px]">{job.location}</span>
                              </span>
                              {job.workType && (
                                <span className="text-blue-600 dark:text-blue-400 font-medium text-[10px] bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                  {job.workType}
                                </span>
                              )}
                              {job.salary && (
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-0.5">
                                  <DollarSign className="w-3 h-3 text-emerald-500" />
                                  <span className="truncate max-w-[100px]">{job.salary}</span>
                                </span>
                              )}
                            </div>

                            {/* Networking Connection Badge & Ask Nova Row */}
                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFindNetworkContext({ company: job.company, role: job.role });
                                  setIsFindNetworkOpen(true);
                                }}
                                className="text-slate-500 dark:text-slate-400 hover:text-blue-400 flex items-center gap-1 font-semibold"
                              >
                                <Users className="w-3 h-3 text-blue-500" />
                                <span>{stage.id === 'APPLIED' ? '👥 3 Accepted' : '👥 2 Sent'}</span>
                              </button>

                              <span className="text-[10px] text-slate-400 font-mono">today</span>
                            </div>

                            {/* Smart Action & Quick Stage Mover */}
                            <div className="pt-1 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800">
                              {renderCardSmartAction(job, stage.id)}

                              {/* Stage Mover Selector */}
                              <select
                                value={stage.id}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  const targetStage = KANBAN_STAGES.find((s) => s.id === e.target.value);
                                  if (targetStage && job.id) {
                                    handleUpdateStatus(job.id, targetStage.defaultStatus);
                                  }
                                }}
                                className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200 focus:outline-none"
                                title="Move to stage"
                              >
                                {KANBAN_STAGES.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    ➔ {s.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      /* Empty Column State */
                      <div className="py-10 px-3 text-center rounded-xl bg-white border border-dashed border-slate-200 text-slate-400 space-y-2">
                        <Briefcase className="w-6 h-6 mx-auto text-slate-400 opacity-60" />
                        <div className="text-xs font-semibold text-slate-600">
                          No {stage.label.toLowerCase()} jobs
                        </div>
                        <button
                          onClick={onOpenAddJobModal}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-blue-600 text-[11px] font-semibold border border-slate-200 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Job</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 5. TABLE / LIST VIEW */
        <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Role & Company</th>
                  <th className="py-3 px-4">Location / Work Type</th>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4">Match Score</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Compensation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => {
                    return (
                      <tr
                        key={job.id}
                        onClick={() => setSelectedDetailJob(job)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                        id={`job-row-${job.id}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-600 font-bold text-[11px] flex-shrink-0">
                              {job.company.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                                {job.role}
                              </div>
                              <div className="text-slate-500 text-[11px]">{job.company}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-700">{job.location}</div>
                          {job.workType && (
                            <span className="text-[10px] text-blue-700 font-medium">{job.workType}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-semibold">
                            {job.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {renderMatchScoreBadge(job.fitnessScore)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              job.priority === 'Dream'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : job.priority === 'Target'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {job.priority || 'Target'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-emerald-700">
                          {job.salary || '—'}
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {onAnalyzeJob && (
                              <button
                                onClick={() => onAnalyzeJob(job)}
                                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                                title="Analyze JD"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedEditJob(job)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                              title="Edit Job"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remove ${job.role} at ${job.company}?`)) {
                                  if (job.id) handleDeleteJob(job.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                              title="Delete Job"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No jobs matched your filter criteria.{' '}
                      <button onClick={clearAllFilters} className="text-blue-600 underline font-semibold">
                        Reset filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. SLIDE-OVER INSPECTOR MODAL */}
      <JobDetailModal
        isOpen={!!selectedDetailJob}
        onClose={() => setSelectedDetailJob(null)}
        job={selectedDetailJob}
        onEditJob={(job) => {
          setSelectedDetailJob(null);
          setSelectedEditJob(job);
        }}
        onDeleteJob={(id) => {
          handleDeleteJob(id);
          setSelectedDetailJob(null);
        }}
        onAnalyzeJob={onAnalyzeJob}
        onNavigateToTab={onNavigateToTab}
        onUpdateStatus={handleUpdateStatus}
        onNavigateToCoverLetter={onNavigateToCoverLetter}
      />

      {/* 7. EDIT JOB MODAL */}
      <EditJobModal
        isOpen={!!selectedEditJob}
        onClose={() => setSelectedEditJob(null)}
        job={selectedEditJob}
        onSave={handleSaveEdit}
      />

      {/* 8. FIND NETWORK MODAL */}
      <FindNetworkModal
        isOpen={isFindNetworkOpen}
        onClose={() => setIsFindNetworkOpen(false)}
        company={findNetworkContext.company}
        role={findNetworkContext.role}
        onAddContact={(contact) => {
          if (onNavigateToTab) onNavigateToTab('contacts');
        }}
      />

      {/* 9. MESSAGE SEQUENCES MODAL */}
      <MessageSequencesModal
        isOpen={isSequenceModalOpen}
        onClose={() => setIsSequenceModalOpen(false)}
      />
    </div>
  );
};
