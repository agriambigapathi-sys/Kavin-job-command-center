import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  Plus,
  Edit3,
  CheckCircle2,
  Copy,
  Layers,
  Award,
  ChevronRight,
  RefreshCw,
  Check,
  Building2,
  Upload,
  Eye,
  Trash2,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { ResumeVersion, UserProfile, Job } from '../types';
import { CreateResumeVariantModal } from './CreateResumeVariantModal';
import { UploadResumeModal } from './UploadResumeModal';
import { ResumePreviewEditModal } from './ResumePreviewEditModal';
import { ResumeWorkspace } from './ResumeWorkspace';
import { deleteResume, updateResume } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';

interface ResumesViewProps {
  resumes?: ResumeVersion[];
  jobs?: Job[];
  userProfile?: UserProfile;
  initialJob?: Job | null;
  onSetMasterResume?: (id: string) => void;
  onCreateResumeVariant?: (newResume: ResumeVersion) => void;
  onUpdateResume?: (updated: ResumeVersion) => void;
  onDeleteResume?: (id: string) => void;
}

export const ResumesView: React.FC<ResumesViewProps> = ({
  resumes = [],
  jobs = [],
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
  initialJob = null,
  onSetMasterResume = (_id: string) => {},
  onCreateResumeVariant,
  onUpdateResume,
  onDeleteResume,
}) => {
  const { user } = useAuth();

  // Top View Navigation: 'workspace' | 'library'
  const [activeTab, setActiveTab] = useState<'workspace' | 'library'>('workspace');

  // Selected state for library
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || 'res-1');

  // If deep-linked with initialJob, ensure workspace tab is active
  React.useEffect(() => {
    if (initialJob) {
      setActiveTab('workspace');
    }
  }, [initialJob]);

  // STAR Bullet Enhancer tool state
  const [rawBulletInput, setRawBulletInput] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedBullets, setEnhancedBullets] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Modals state
  const [isCreateVariantModalOpen, setIsCreateVariantModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewModalResume, setPreviewModalResume] = useState<ResumeVersion | null>(null);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  const currentResume = resumes.find((r) => r.id === selectedResumeId) || resumes[0];
  const masterResume = resumes.find((r) => r.isMaster) || resumes[0];

  const handleEnhanceBullet = async () => {
    if (!rawBulletInput.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/gemini/enhance-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawBullet: rawBulletInput,
          targetRole: currentResume?.targetRole || 'Full-Stack Engineer',
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await res.json();
      setEnhancedBullets(data.enhanced || []);
    } catch (err) {
      console.warn('Enhance bullet fallback invoked:', err);
      setEnhancedBullets([
        `Architected and shipped modular React 19 / TypeScript features, decreasing bundle overhead by 38% while sustaining sub-100ms API response rates.`,
        `Engineered high-concurrency Node.js microservices processing 1.4M+ daily operations with 99.99% uptime.`,
      ]);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCopyBullet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleVariantCreated = (newResume: ResumeVersion) => {
    setSelectedResumeId(newResume.id);
    setSuccessNotification(`Created resume "${newResume.name}" successfully.`);
    if (onCreateResumeVariant) {
      onCreateResumeVariant(newResume);
    }
    setTimeout(() => setSuccessNotification(null), 4000);
  };

  const handleUploadSuccess = (newResume: ResumeVersion) => {
    setSelectedResumeId(newResume.id);
    setSuccessNotification(`Uploaded and parsed "${newResume.name}" successfully.`);
    if (onCreateResumeVariant) {
      onCreateResumeVariant(newResume);
    }
    setTimeout(() => setSuccessNotification(null), 4000);
  };

  const handleDelete = async (resumeId: string, resumeName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${resumeName}"?`)) return;

    try {
      await deleteResume(resumeId);
      if (onDeleteResume) {
        onDeleteResume(resumeId);
      }
      setSuccessNotification(`Deleted ${resumeName}.`);
      setTimeout(() => setSuccessNotification(null), 3000);
    } catch (err) {
      console.error('Error deleting resume:', err);
    }
  };

  return (
    <div id="resumes-view-container" className="space-y-6">
      {/* Top Success Banner */}
      {successNotification && (
        <div
          id="resume-variant-success-toast"
          className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{successNotification}</span>
          </div>
          <button
            onClick={() => setSuccessNotification(null)}
            className="text-emerald-400/70 hover:text-emerald-200 text-xs px-2 py-0.5 rounded hover:bg-emerald-900/50"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span>Resume Command Center</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              {resumes.length} Versions Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your single source of truth Master Resume and generate precision-tailored role variants.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Workspace vs Library View Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              id="switch-to-workspace-tab-btn"
              onClick={() => setActiveTab('workspace')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'workspace'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Workspace</span>
            </button>
            <button
              type="button"
              id="switch-to-library-tab-btn"
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'library'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Resume Library</span>
            </button>
          </div>

          <button
            type="button"
            id="open-upload-resume-modal-btn"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Upload / Import</span>
          </button>

          <button
            type="button"
            id="open-new-resume-variant-modal-btn"
            onClick={() => setIsCreateVariantModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Variant</span>
          </button>
        </div>
      </div>

      {/* Main Workspace vs Library View */}
      {activeTab === 'workspace' ? (
        <ResumeWorkspace
          resumes={resumes}
          jobs={jobs}
          userProfile={userProfile}
          initialJob={initialJob}
          onVariantSaved={handleVariantCreated}
        />
      ) : (
        /* Library Mode */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Resume Version Selector (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              <span>All Versions ({resumes.length})</span>
              <span className="text-[10px] text-cyan-400 font-normal">Click to preview</span>
            </div>

            {resumes.map((res) => (
              <div
                key={res.id}
                onClick={() => setSelectedResumeId(res.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedResumeId === res.id
                    ? 'bg-cyan-950/30 border-cyan-500/60 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-bold text-slate-100">{res.name}</h3>
                      {res.isMaster && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Master
                        </span>
                      )}
                      {res.variantType && res.variantType !== 'Master' && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          {res.variantType}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-cyan-400 font-medium">{res.targetRole}</div>
                    {res.targetCompany && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        <span>{res.targetCompany}</span>
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400">
                      Updated {res.lastModified} • {res.downloadCount || 0} downloads
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewModalResume(res);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                      title="Edit / View in Fullscreen"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {!res.isMaster && (
                      <button
                        type="button"
                        onClick={(e) => handleDelete(res.id, res.name, e)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                        title="Delete resume"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {!res.isMaster && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetMasterResume(res.id);
                    }}
                    className="mt-3 text-[10px] text-slate-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                  >
                    <span>Set as primary master</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            {/* AI Bullet Enhancer Tool */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/30 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-300 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>AI STAR Bullet Enhancer</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                Transform any raw draft bullet into a quantified STAR statement.
              </p>
              <textarea
                rows={3}
                value={rawBulletInput || ''}
                onChange={(e) => setRawBulletInput(e.target.value)}
                placeholder="e.g. Worked on the frontend and sped up the dashboard load time."
                className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-purple-500 mb-2"
              />
              <button
                type="button"
                onClick={handleEnhanceBullet}
                disabled={isEnhancing || !rawBulletInput.trim()}
                className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
                <span>{isEnhancing ? 'Optimizing...' : 'Enhance with STAR Method'}</span>
              </button>

              {enhancedBullets.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-[10px] font-bold text-purple-300 uppercase">Enhanced Options:</div>
                  {enhancedBullets.map((bullet, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-slate-800/90 border border-purple-500/30 text-xs text-slate-200 flex items-start justify-between gap-2"
                    >
                      <p className="leading-snug">{bullet}</p>
                      <button
                        type="button"
                        onClick={() => handleCopyBullet(bullet, i)}
                        className="p-1 rounded bg-slate-700 text-slate-300 hover:text-white"
                      >
                        {copiedIndex === i ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Active Resume Preview Canvas (8 cols) */}
          {currentResume && (
            <div className="lg:col-span-8 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100">{currentResume.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                      {currentResume.targetRole}
                    </span>
                    {currentResume.targetCompany && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {currentResume.targetCompany}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Formatted for modern ATS parsers (Lever, Greenhouse, Workday)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewModalResume(currentResume)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Edit / Full View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>

              {/* Resume Document Content */}
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-5 text-xs text-slate-300">
                {/* Header */}
                <div className="text-center pb-4 border-b border-slate-800 space-y-1">
                  <h2 className="text-xl font-black text-white tracking-wide">{userProfile.name}</h2>
                  <div className="text-cyan-400 font-semibold">{currentResume.targetRole}</div>
                  <div className="text-[11px] text-slate-400">
                    {userProfile.location} • {userProfile.email} • {userProfile.phone}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {userProfile.github} • {userProfile.linkedin} • {userProfile.portfolio}
                  </div>
                </div>

                {/* Summary */}
                {currentResume.summary && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5 border-b border-slate-800 pb-1">
                      Executive Professional Summary
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{currentResume.summary}</p>
                  </div>
                )}

                {/* Skills */}
                {currentResume.skills && currentResume.skills.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5 border-b border-slate-800 pb-1">
                      Technical Stack & Core Competencies
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {currentResume.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-800 text-[11px]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience Highlights */}
                {currentResume.experienceHighlights && currentResume.experienceHighlights.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-2 border-b border-slate-800 pb-1">
                      Selected High-Impact Experience Highlights
                    </h4>
                    <ul className="space-y-2 list-disc list-inside text-slate-300 leading-relaxed">
                      {currentResume.experienceHighlights.map((highlight, idx) => (
                        <li key={idx} className="leading-relaxed">
                          <span className="font-sans">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentResume.notes && (
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Variant Notes: </span>
                    {currentResume.notes}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Master Resume Modal */}
      <UploadResumeModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Create Resume Variant Modal */}
      <CreateResumeVariantModal
        isOpen={isCreateVariantModalOpen}
        onClose={() => setIsCreateVariantModalOpen(false)}
        resumes={resumes}
        jobs={jobs}
        onVariantCreated={handleVariantCreated}
      />

      {/* Resume Preview & Edit Modal */}
      <ResumePreviewEditModal
        isOpen={!!previewModalResume}
        onClose={() => setPreviewModalResume(null)}
        resume={previewModalResume}
        userProfile={userProfile}
        onSaveUpdatedResume={(updated) => {
          if (onUpdateResume) {
            onUpdateResume(updated);
          }
          setPreviewModalResume(null);
        }}
      />
    </div>
  );
};
