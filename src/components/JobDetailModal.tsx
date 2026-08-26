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
} from 'lucide-react';
import {
  FirestoreJob,
  FirestoreJobStatus,
  JobPriority,
  WorkType,
  FirestoreJobDescription,
  Contact,
  FollowUp,
  Application,
  ActivityLog,
} from '../types';
import {
  subscribeToJobDescription,
  saveJobDescription,
  updateJob,
  logUserActivity,
} from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';

interface JobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: FirestoreJob | null;
  onEditJob: (job: FirestoreJob) => void;
  onDeleteJob: (id: string) => void;
  onAnalyzeJob?: (job: FirestoreJob) => void;
  onNavigateToTab?: (tab: any) => void;
  onUpdateStatus?: (jobId: string, newStatus: FirestoreJobStatus) => void;
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
}) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<
    | 'overview'
    | 'jd'
    | 'requirements'
    | 'skills'
    | 'application'
    | 'analysis'
    | 'resume'
    | 'contacts'
    | 'interview'
    | 'activity'
    | 'notes'
  >('overview');

  const [jobDescription, setJobDescription] = useState<FirestoreJobDescription | null>(null);
  const [loadingJd, setLoadingJd] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Subscribe to real JD from Firestore
  useEffect(() => {
    if (!job || !user || !isOpen) {
      setJobDescription(null);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div
        id="job-detail-modal-container"
        className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto text-slate-200 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-slate-900 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-cyan-400 font-bold text-lg flex-shrink-0 shadow-inner">
              {job.company.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
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
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {job.role}
              </h2>
              <div className="text-sm font-semibold text-slate-300 flex items-center gap-2 mt-0.5">
                <span>{job.company}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400 font-normal">{job.location}</span>
                {job.workType && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-cyan-400 font-medium text-xs">{job.workType}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* AI Score Badge */}
            {job.fitnessScore ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-black">{job.fitnessScore}% Match</span>
              </div>
            ) : null}

            <button
              onClick={() => onEditJob(job)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Edit Job Details"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Temporary Feedback Notice */}
        {noticeMessage && (
          <div className="px-6 py-2 bg-cyan-950/80 border-b border-cyan-800/60 text-xs text-cyan-200 flex items-center gap-2 animate-in fade-in">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>{noticeMessage}</span>
          </div>
        )}

        {/* Status & Action Bar */}
        <div className="px-5 sm:px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Select */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Status:</span>
              <select
                value={job.status}
                onChange={(e) => handleStatusChange(e.target.value as FirestoreJobStatus)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300 font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Select */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Priority:</span>
              <select
                value={job.priority || 'Target'}
                onChange={(e) => handlePriorityChange(e.target.value as JobPriority)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {ALL_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick External Actions */}
          <div className="flex items-center gap-2">
            {job.jobUrl && (
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>Job Posting</span>
              </a>
            )}
            {job.applicationUrl && job.applicationUrl !== job.jobUrl && (
              <a
                href={job.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 transition-colors font-semibold"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Apply Link</span>
              </a>
            )}
            {job.status !== 'Applied' && (
              <button
                onClick={() => handleStatusChange('Applied')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Applied</span>
              </button>
            )}
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center overflow-x-auto border-b border-slate-800 bg-slate-900/60 px-5 sm:px-6 scrollbar-none text-xs">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'jd', label: 'Job Description' },
            { id: 'requirements', label: 'Requirements & Responsibilities' },
            { id: 'skills', label: 'Skills & Keywords' },
            { id: 'analysis', label: 'AI Analysis' },
            { id: 'resume', label: 'Resume & Cover Letter' },
            { id: 'contacts', label: 'Contacts & Follow-ups' },
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
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs sm:text-sm">
          {/* SECTION: OVERVIEW */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Primary Key Stats Grid */}
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

              {/* Requisition and Tracking Information */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Requisition & Tracking Metadata
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Job Requisition ID: </span>
                    <span className="text-slate-300 font-mono">
                      {job.jobId || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Source Platform: </span>
                    <span className="text-slate-300">{job.source}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Work Model: </span>
                    <span className="text-slate-300">{job.workType || 'Remote'}</span>
                  </div>
                </div>
              </div>

              {/* Summary or Description preview */}
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
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </div>
              ) : null}

              {/* Action Toolbar */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  onClick={() => {
                    if (onAnalyzeJob) onAnalyzeJob(job);
                    else setActiveSection('analysis');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-950/50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze JD with AI</span>
                </button>

                <button
                  onClick={() => setActiveSection('resume')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Resume & Cover Letter</span>
                </button>

                <button
                  onClick={() => setActiveSection('contacts')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Add Company Contact</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION: RAW & FORMATTED JOB DESCRIPTION */}
          {activeSection === 'jd' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Original Job Description Content</span>
                </h3>
                {jobDescription?.rawText && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(jobDescription.rawText);
                      showTemporaryNotice('Raw JD copied to clipboard');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </button>
                )}
              </div>

              {jobDescription?.rawText ? (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                  {jobDescription.rawText}
                </div>
              ) : job.description ? (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-400 space-y-3">
                  <p>No full job description stored yet for this record.</p>
                  <button
                    onClick={() => onEditJob(job)}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                  >
                    Edit & Paste Full JD
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SECTION: REQUIREMENTS & RESPONSIBILITIES */}
          {activeSection === 'requirements' && (
            <div className="space-y-6">
              {/* Responsibilities */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Key Responsibilities</span>
                </h3>
                {jobDescription?.responsibilities && jobDescription.responsibilities.length > 0 ? (
                  <ul className="space-y-2">
                    {jobDescription.responsibilities.map((resp, i) => (
                      <li
                        key={i}
                        className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Responsibilities not yet broken down. Run "Analyze JD with AI" to extract them automatically.
                  </p>
                )}
              </div>

              {/* Qualifications */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Qualifications & Requirements</span>
                </h3>
                {jobDescription?.qualifications && jobDescription.qualifications.length > 0 ? (
                  <ul className="space-y-2">
                    {jobDescription.qualifications.map((qual, i) => (
                      <li
                        key={i}
                        className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                        <span>{qual}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Qualifications not explicitly itemized.
                  </p>
                )}
              </div>

              {/* Experience & Education Requirements */}
              {(jobDescription?.experienceRequirements || jobDescription?.educationRequirements) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {jobDescription.experienceRequirements && (
                    <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                      <div className="text-[11px] text-slate-400 font-medium">Experience Requirement</div>
                      <div className="text-xs font-semibold text-slate-200 mt-1">
                        {jobDescription.experienceRequirements}
                      </div>
                    </div>
                  )}
                  {jobDescription.educationRequirements && (
                    <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                      <div className="text-[11px] text-slate-400 font-medium">Education Requirement</div>
                      <div className="text-xs font-semibold text-slate-200 mt-1">
                        {jobDescription.educationRequirements}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SECTION: SKILLS & KEYWORDS */}
          {activeSection === 'skills' && (
            <div className="space-y-6">
              {/* Must Have Skills */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Must-Have / Core Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {jobDescription?.mustHaveSkills && jobDescription.mustHaveSkills.length > 0 ? (
                    jobDescription.mustHaveSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No must-have skills extracted yet</span>
                  )}
                </div>
              </div>

              {/* Preferred Skills */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Preferred / Nice-to-Have Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {jobDescription?.preferredSkills && jobDescription.preferredSkills.length > 0 ? (
                    jobDescription.preferredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No preferred skills extracted yet</span>
                  )}
                </div>
              </div>

              {/* Keywords Cloud */}
              <div className="space-y-2.5">
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

          {/* SECTION: AI ANALYSIS */}
          {activeSection === 'analysis' && (
            <div className="space-y-6">
              {job.analysisStatus === 'failed' && (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div>
                      <span className="font-semibold">Initial AI analysis could not be completed.</span>
                      <p className="text-[11px] text-amber-300/80 mt-0.5">
                        Raw job description is securely preserved. You can re-run analysis at any time.
                      </p>
                    </div>
                  </div>
                  {onAnalyzeJob && (
                    <button
                      onClick={() => onAnalyzeJob(job)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Run Analysis</span>
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-cyan-950/40 border border-purple-800/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AI Alignment & Fitness Score</h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Evaluated against Kavin's Senior Full-Stack & AI Systems Engineering profile.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400">
                    {job.fitnessScore ? `${job.fitnessScore}%` : 'Not Analyzed'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase">
                    {job.fitnessScore ? 'Match Grade' : 'Status'}
                  </div>
                </div>
              </div>

              {/* Match Highlights */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Candidate Strengths for this Role
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(job.matchKeyHighlights && job.matchKeyHighlights.length > 0
                    ? job.matchKeyHighlights
                    : [
                        'Matches TypeScript & React 19 architecture expectations',
                        'Strong alignment with target compensation package',
                        'Proven track record in high-throughput backend services',
                      ]
                  ).map((hl, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                    >
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (onAnalyzeJob) onAnalyzeJob(job);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-950/50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Open Deep JD Analyser & ATS Optimizer</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION: RESUME & COVER LETTER */}
          {activeSection === 'resume' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Resume Card */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span>Tailored Resume</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                      Full-Stack Master v2.4
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Generate an ATS-optimized, customized resume specifically targeting {job.company}'s keywords.
                  </p>
                  <button
                    onClick={() => {
                      showTemporaryNotice('Resume Tailoring engine is coming in the next stage.');
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tailor Resume for this Job</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-200 font-normal">
                      Next Stage
                    </span>
                  </button>
                </div>

                {/* Cover Letter Card */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <Send className="w-4 h-4 text-purple-400" />
                      <span>Custom Cover Letter</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                      AI Generated
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Draft a tailored cover letter referencing your specific technical achievements for {job.role}.
                  </p>
                  <button
                    onClick={() => {
                      if (onNavigateToTab) {
                        onClose();
                        onNavigateToTab('cover-letters');
                      } else {
                        showTemporaryNotice('Navigating to Cover Letters module...');
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Cover Letter</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: CONTACTS & FOLLOW-UPS */}
          {activeSection === 'contacts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">Company Contacts & Outreach</h3>
                  <p className="text-xs text-slate-400">
                    Recruiters, hiring managers, and referral contacts at {job.company}.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (onNavigateToTab) {
                      onClose();
                      onNavigateToTab('contacts');
                    } else {
                      showTemporaryNotice('Opening Contacts module...');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Contact</span>
                </button>
              </div>

              <div className="p-6 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-400 space-y-2">
                <UserCheck className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs">No contacts linked directly to this job yet.</p>
                <button
                  onClick={() => {
                    if (onNavigateToTab) {
                      onClose();
                      onNavigateToTab('contacts');
                    }
                  }}
                  className="text-xs text-cyan-400 font-semibold hover:underline"
                >
                  View All Network Contacts →
                </button>
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
                  <span>Schedule Interview</span>
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
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Record interview impressions, recruiter names, referral codes, salary negotiation targets..."
                  className="w-full p-4 rounded-xl bg-slate-950 border border-cyan-500/50 text-slate-200 placeholder:text-slate-600 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                />
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[140px]">
                  {job.notes || 'No personal notes added yet. Click "Edit Notes" to write scratchpad items.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Bar */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to remove ${job.role} at ${job.company}?`)) {
                if (job.id) onDeleteJob(job.id);
                onClose();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors font-medium"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Job</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
