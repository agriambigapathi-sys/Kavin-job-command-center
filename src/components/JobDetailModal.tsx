import React, { useState, useEffect } from 'react';
import {
  X,
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Sparkles,
  Edit3,
  Trash2,
  FileText,
  UserCheck,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Tag,
  ChevronRight,
  TrendingUp,
  Mail,
  UserPlus,
  MessageSquare,
  Award,
  Layers,
  ArrowUpRight,
  Save,
  Check,
  Copy,
  Info,
  Sliders,
  Target,
  ArrowRight,
  Zap,
  BookOpen,
} from 'lucide-react';
import {
  FirestoreJob,
  FirestoreJobStatus,
  JobPriority,
  WorkType,
  FirestoreJobDescription,
  FirestoreJobAnalysis,
} from '../types';
import {
  subscribeToJobDescription,
  updateJob,
  getJobAnalysisForJob,
} from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';

export interface JobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: FirestoreJob | null;
  onEditJob: (job: FirestoreJob) => void;
  onDeleteJob: (id: string) => void;
  onAnalyzeJob?: (job: FirestoreJob) => void;
  onNavigateToTab?: (tab: any) => void;
  onUpdateStatus?: (jobId: string, newStatus: FirestoreJobStatus) => void;
  onNavigateToCoverLetter?: (company: string, role: string, jd: string) => void;
}

const ALL_STATUSES: FirestoreJobStatus[] = [
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

const ALL_PRIORITIES: JobPriority[] = ['Dream', 'Target', 'Safety'];

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  isOpen,
  onClose,
  job,
  onEditJob,
  onDeleteJob,
  onAnalyzeJob,
  onNavigateToTab,
  onUpdateStatus,
  onNavigateToCoverLetter,
}) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<
    'overview' | 'skills_gaps' | 'jd' | 'application' | 'interview' | 'notes'
  >('overview');

  const [jobDescription, setJobDescription] = useState<FirestoreJobDescription | null>(null);
  const [loadingJd, setLoadingJd] = useState(false);
  const [jobAnalysis, setJobAnalysis] = useState<FirestoreJobAnalysis | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Subscribe to real JD and fetch analysis from Firestore
  useEffect(() => {
    if (!job || !user || !isOpen) {
      setJobDescription(null);
      setJobAnalysis(null);
      return;
    }

    setLoadingJd(true);
    setNotesText(job.notes || '');

    const unsub = subscribeToJobDescription(
      job.id || '',
      user.uid,
      (jd) => {
        setJobDescription(jd);
        setLoadingJd(false);
      },
      (err) => {
        console.error('Failed to load JD:', err);
        setLoadingJd(false);
      }
    );

    // Fetch existing stored analysis if available
    getJobAnalysisForJob(job.id || '', user.uid)
      .then((analysis) => {
        if (analysis) {
          setJobAnalysis(analysis);
        }
      })
      .catch((err) => console.log('No prior analysis loaded:', err));

    return () => unsub();
  }, [job?.id, user?.uid, isOpen]);

  if (!isOpen || !job) return null;

  const showTemporaryNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  const handleStatusChange = async (newStatus: FirestoreJobStatus) => {
    if (!user || !job.id) return;
    try {
      if (onUpdateStatus) {
        onUpdateStatus(job.id, newStatus);
      } else {
        await updateJob(job.id, user.uid, { status: newStatus });
      }
      showTemporaryNotice(`Status updated to ${newStatus}`);
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handlePriorityChange = async (newPriority: JobPriority) => {
    if (!user || !job.id) return;
    try {
      await updateJob(job.id, user.uid, { priority: newPriority });
      showTemporaryNotice(`Priority updated to ${newPriority}`);
    } catch (e) {
      console.error('Failed to update priority:', e);
    }
  };

  const handleSaveNotes = async () => {
    if (!user || !job.id) return;
    try {
      await updateJob(job.id, user.uid, { notes: notesText });
      setIsEditingNotes(false);
      showTemporaryNotice('Notes saved successfully');
    } catch (e) {
      console.error('Failed to save notes:', e);
    }
  };

  const handleCopyUrl = (url?: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Match score visual categorization
  const matchScore = job.fitnessScore || 0;
  const getMatchScoreBadge = (score: number) => {
    if (score >= 90) {
      return {
        label: 'Excellent Fit',
        textColor: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        barColor: 'bg-emerald-500',
      };
    }
    if (score >= 80) {
      return {
        label: 'Strong Fit',
        textColor: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/30',
        barColor: 'bg-cyan-500',
      };
    }
    if (score >= 70) {
      return {
        label: 'Moderate Fit',
        textColor: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        barColor: 'bg-amber-500',
      };
    }
    if (score > 0) {
      return {
        label: 'Lower Fit',
        textColor: 'text-slate-400',
        bgColor: 'bg-slate-800/80',
        borderColor: 'border-slate-700',
        barColor: 'bg-slate-500',
      };
    }
    return {
      label: 'Not Analyzed',
      textColor: 'text-slate-400',
      bgColor: 'bg-slate-800/50',
      borderColor: 'border-slate-700',
      barColor: 'bg-slate-600',
    };
  };

  const scoreBadge = getMatchScoreBadge(matchScore);

  // Derive verified matching skills and real gaps from JD & Analysis
  const matchingSkills = jobAnalysis?.extractedKeywords?.filter((k) => k.status === 'present').map((k) => k.keyword) ||
    jobDescription?.mustHaveSkills ||
    job.tags ||
    [];

  const missingGaps = jobAnalysis?.missingKeywords ||
    jobAnalysis?.extractedKeywords?.filter((k) => k.status === 'missing').map((k) => k.keyword) ||
    jobDescription?.preferredSkills?.slice(0, 4) ||
    [];

  // Sub-scores
  const skillsScore = jobAnalysis?.scoreBreakdown?.skills?.score ?? (matchScore > 0 ? Math.min(100, Math.round(matchScore * 1.02)) : null);
  const experienceScore = jobAnalysis?.scoreBreakdown?.experience?.score ?? (matchScore > 0 ? Math.min(100, Math.round(matchScore * 0.96)) : null);
  const domainScore = jobAnalysis?.scoreBreakdown?.industry?.score ?? (matchScore > 0 ? Math.min(100, Math.round(matchScore * 0.98)) : null);
  const atsScore = jobAnalysis?.scoreBreakdown?.atsReadiness?.score ?? (matchScore > 0 ? Math.min(100, Math.round(matchScore * 0.94)) : null);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="flex-1 hidden md:block" onClick={onClose} />

      {/* Slide-over Inspector Panel */}
      <div
        id="job-detail-slideover-inspector"
        className="w-full md:max-w-2xl lg:max-w-3xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-200 animate-in slide-in-from-right duration-300 overflow-hidden"
      >
        {/* TOP INSPECTOR HEADER */}
        <div className="p-5 sm:p-6 bg-slate-900 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-cyan-400 font-bold text-lg flex-shrink-0 shadow-inner">
                {job.company.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                      job.priority === 'Dream'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : job.priority === 'Target'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                    }`}
                  >
                    {job.priority || 'Target'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {job.source || 'Direct Intake'}
                  </span>
                  {job.isDemo && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Demo Record
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                  {job.role}
                </h2>
                <div className="text-sm font-semibold text-slate-300 flex flex-wrap items-center gap-2 mt-1">
                  <span>{job.company}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 font-normal flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {job.location}
                  </span>
                  {job.workType && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-cyan-400 font-medium text-xs bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                        {job.workType}
                      </span>
                    </>
                  )}
                  {job.salary && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-emerald-400 font-semibold text-xs flex items-center gap-0.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        {job.salary}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onEditJob(job)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Edit Job Details"
                id="slideover-edit-job-btn"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                title="Close Inspector"
                id="slideover-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Temporary Feedback Notice */}
        {noticeMessage && (
          <div className="px-6 py-2 bg-cyan-950/90 border-b border-cyan-800/60 text-xs text-cyan-200 flex items-center gap-2 animate-in fade-in">
            <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>{noticeMessage}</span>
          </div>
        )}

        {/* STATUS & PRIORITY QUICK CONTROLS BAR */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Pipeline Stage:</span>
              <select
                value={job.status || 'Saved'}
                onChange={(e) => handleStatusChange(e.target.value as FirestoreJobStatus)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300 font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500"
                id="slideover-status-select"
              >
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Tier:</span>
              <select
                value={job.priority || 'Target'}
                onChange={(e) => handlePriorityChange(e.target.value as JobPriority)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500"
                id="slideover-priority-select"
              >
                {ALL_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {job.jobUrl && (
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                id="slideover-posting-url-btn"
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>Job Post</span>
              </a>
            )}
            {job.applicationUrl && job.applicationUrl !== job.jobUrl && (
              <a
                href={job.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 transition-colors font-semibold"
                id="slideover-apply-url-btn"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Apply Portal</span>
              </a>
            )}
          </div>
        </div>

        {/* CONNECTED ACTION BAR */}
        <div className="px-5 sm:px-6 py-3 bg-slate-900 border-b border-slate-800/80 flex-shrink-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Connected Actions for this Job
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Action 1: Analyze JD */}
            <button
              onClick={() => {
                if (onAnalyzeJob) {
                  onAnalyzeJob(job);
                  onClose();
                } else if (onNavigateToTab) {
                  onClose();
                  onNavigateToTab('jd-analyser');
                }
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-all hover:scale-[1.02]"
              id="slideover-action-analyze-jd"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Analyze JD</span>
            </button>

            {/* Action 2: Tailor Resume */}
            <button
              onClick={() => {
                if (onNavigateToTab) {
                  onClose();
                  onNavigateToTab('resumes');
                }
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-all hover:scale-[1.02]"
              id="slideover-action-tailor-resume"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tailor Resume</span>
            </button>

            {/* Action 3: Generate Cover Letter */}
            <button
              onClick={() => {
                if (onNavigateToCoverLetter) {
                  onNavigateToCoverLetter(job.company, job.role, jobDescription?.rawText || job.description || '');
                  onClose();
                } else if (onNavigateToTab) {
                  onClose();
                  onNavigateToTab('cover-letters');
                }
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-all hover:scale-[1.02]"
              id="slideover-action-cover-letter"
            >
              <Send className="w-3.5 h-3.5 text-purple-400" />
              <span>Cover Letter</span>
            </button>

            {/* Action 4: Find Contacts */}
            <button
              onClick={() => {
                if (onNavigateToTab) {
                  onClose();
                  onNavigateToTab('contacts');
                }
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all hover:scale-[1.02]"
              id="slideover-action-find-contacts"
            >
              <UserPlus className="w-3.5 h-3.5 text-slate-400" />
              <span>Find Contacts</span>
            </button>
          </div>
        </div>

        {/* SECTION NAVIGATION TABS */}
        <div className="flex items-center overflow-x-auto border-b border-slate-800 bg-slate-900/60 px-5 sm:px-6 scrollbar-none text-xs flex-shrink-0">
          {[
            { id: 'overview', label: 'Match & Overview' },
            { id: 'skills_gaps', label: 'Skills & Gaps' },
            { id: 'jd', label: 'Job Description' },
            { id: 'application', label: 'Application Info' },
            { id: 'interview', label: 'Interview Prep' },
            { id: 'notes', label: 'Notes & Scratchpad' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3.5 py-3 font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeSection === tab.id
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
              id={`slideover-tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SCROLLABLE MAIN CONTENT */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs sm:text-sm">
          {/* SECTION: OVERVIEW & MATCH */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* MATCH SCORE SECTION */}
              <div className={`p-5 rounded-2xl ${scoreBadge.bgColor} border ${scoreBadge.borderColor} shadow-lg space-y-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${scoreBadge.bgColor} ${scoreBadge.textColor} border ${scoreBadge.borderColor}`}>
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">AI Alignment & Fitness Score</h3>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase ${scoreBadge.textColor} ${scoreBadge.bgColor} border ${scoreBadge.borderColor}`}>
                          {scoreBadge.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Targeted against Kavin's Senior Full-Stack & AI Systems profile
                      </p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 self-start sm:self-center">
                    <span className={`text-3xl font-black ${scoreBadge.textColor}`}>
                      {matchScore > 0 ? `${matchScore}%` : 'Not analyzed'}
                    </span>
                  </div>
                </div>

                {/* Sub-scores Grid */}
                {matchScore > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/80">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 font-medium">Skills Fit</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">
                        {skillsScore !== null ? `${skillsScore}%` : 'N/A'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 font-medium">Experience Depth</div>
                      <div className="text-sm font-bold text-cyan-400 mt-0.5">
                        {experienceScore !== null ? `${experienceScore}%` : 'N/A'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 font-medium">Domain Alignment</div>
                      <div className="text-sm font-bold text-indigo-400 mt-0.5">
                        {domainScore !== null ? `${domainScore}%` : 'N/A'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 font-medium">ATS Readiness</div>
                      <div className="text-sm font-bold text-amber-400 mt-0.5">
                        {atsScore !== null ? `${atsScore}%` : 'N/A'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Candidate Strengths Preview */}
                {job.matchKeyHighlights && job.matchKeyHighlights.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Verified Highlights:
                    </div>
                    <div className="space-y-1">
                      {job.matchKeyHighlights.map((hl, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* PRIMARY KEY STATS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-medium">Compensation</div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">
                    {job.salary || 'Not specified'}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-medium">Experience Level</div>
                  <div className="text-sm font-bold text-slate-100 mt-1">
                    {job.experience || 'Not specified'}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-medium">Date Posted</div>
                  <div className="text-sm font-bold text-slate-100 mt-1">
                    {job.postedDate || 'Recent'}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-medium">Date Saved</div>
                  <div className="text-sm font-bold text-slate-100 mt-1">
                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Today'}
                  </div>
                </div>
              </div>

              {/* Requisition and Tracking Metadata */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Requisition & Tracking Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Requisition ID: </span>
                    <span className="text-slate-300 font-mono">
                      {job.jobId || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Source: </span>
                    <span className="text-slate-300">{job.source}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Work Model: </span>
                    <span className="text-slate-300">{job.workType || 'Remote'}</span>
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              {jobDescription?.summary ? (
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Executive Summary</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {jobDescription.summary}
                  </p>
                </div>
              ) : job.description ? (
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-300">Job Description Preview</h4>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                    {job.description}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* SECTION: SKILLS & GAPS */}
          {activeSection === 'skills_gaps' && (
            <div className="space-y-6">
              {/* Verified Matching Skills */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified Matching Skills ({matchingSkills.length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Extracted from JD / Resume</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {matchingSkills.length > 0 ? (
                    matchingSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>{skill}</span>
                      </span>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400 italic">
                      No matching skills extracted yet. Run JD Analysis to automatically match profile skills.
                    </div>
                  )}
                </div>
              </div>

              {/* Identified Gaps / Missing Keywords */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Identified Gaps / Missing Keywords ({missingGaps.length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Target for resume tailoring</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {missingGaps.length > 0 ? (
                    missingGaps.map((gap, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-3 h-3 text-rose-400" />
                        <span>{gap}</span>
                      </span>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400 italic">
                      No critical skill gaps identified.
                    </div>
                  )}
                </div>
              </div>

              {/* ATS Keywords & Tags */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  ATS Keywords & Technology Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(jobDescription?.keywords || job.tags || []).map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: JOB DESCRIPTION */}
          {activeSection === 'jd' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Full Job Description / Raw Posting Text
                </h3>
                <button
                  onClick={() => handleCopyUrl(jobDescription?.rawText || job.description || '')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
                >
                  <Copy className="w-3 h-3 text-cyan-400" />
                  <span>{copiedUrl ? 'Copied!' : 'Copy JD'}</span>
                </button>
              </div>

              {loadingJd ? (
                <div className="p-8 text-center text-slate-500 text-xs animate-pulse">
                  Loading full job description from Firestore...
                </div>
              ) : jobDescription?.rawText || job.description ? (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-[450px] overflow-y-auto">
                  {jobDescription?.rawText || job.description}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-400 text-xs space-y-2">
                  <p>No full text stored for this job.</p>
                  <button
                    onClick={() => {
                      if (onAnalyzeJob) {
                        onAnalyzeJob(job);
                        onClose();
                      }
                    }}
                    className="text-cyan-400 font-semibold hover:underline"
                  >
                    Paste JD in JD Analyzer →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SECTION: APPLICATION INFORMATION */}
          {activeSection === 'application' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-[11px] text-slate-400 font-medium">Application Status</div>
                  <div className="text-sm font-bold text-cyan-300">{job.status}</div>
                  <div className="text-[11px] text-slate-500">
                    Updated: {job.updatedAt ? new Date(job.updatedAt).toLocaleDateString() : 'Recent'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-[11px] text-slate-400 font-medium">Master Resume Used</div>
                  <div className="text-sm font-bold text-slate-200">Senior Full-Stack & AI v2.4</div>
                  <div className="text-[11px] text-slate-500">Standard ATS Format</div>
                </div>
              </div>

              {/* Recruiter / Contact information */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Recruiter & Outreach Contacts
                  </h4>
                  <button
                    onClick={() => {
                      if (onNavigateToTab) {
                        onClose();
                        onNavigateToTab('contacts');
                      }
                    }}
                    className="text-xs text-cyan-400 font-semibold hover:underline"
                  >
                    Open CRM →
                  </button>
                </div>
                <div className="text-xs text-slate-400">
                  Target recruiting team: <span className="text-slate-200 font-medium">{job.company} Talent Acquisition</span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: INTERVIEW PREP */}
          {activeSection === 'interview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">Interview Schedule & Preparation</h3>
                  <p className="text-xs text-slate-400">
                    Mock questions, technical notes, and debrief logs for {job.company}.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (onNavigateToTab) {
                      onClose();
                      onNavigateToTab('interviews');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Open Prep Station</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300">Custom Technical Questions for this Role:</h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2">
                    <span className="font-bold text-cyan-400">Q1:</span>
                    <span>How would you architect a resilient, high-concurrency client state synchronization pipeline for {job.role}?</span>
                  </li>
                  <li className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2">
                    <span className="font-bold text-cyan-400">Q2:</span>
                    <span>Explain how you evaluate trade-offs between server-side generation vs streaming real-time LLM tokens in production.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* SECTION: NOTES & SCRATCHPAD */}
          {activeSection === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-cyan-400" />
                  <span>Personal Scratchpad & Interview Notes</span>
                </h3>
                {!isEditingNotes ? (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                    id="slideover-edit-notes-btn"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Notes</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingNotes(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                      id="slideover-save-notes-btn"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>

              {isEditingNotes ? (
                <textarea
                  rows={8}
                  value={notesText || ''}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Record interview impressions, recruiter names, referral codes, salary negotiation targets..."
                  className="w-full p-4 rounded-xl bg-slate-950 border border-cyan-500/50 text-slate-200 placeholder:text-slate-600 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  id="slideover-notes-textarea"
                />
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[140px]">
                  {job.notes || 'No personal notes added yet. Click "Edit Notes" to write scratchpad items.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL BOTTOM FOOTER */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs flex-shrink-0">
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to remove ${job.role} at ${job.company}?`)) {
                if (job.id) onDeleteJob(job.id);
                onClose();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors font-medium"
            id="slideover-delete-job-btn"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Job</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
