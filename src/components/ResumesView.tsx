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
  ArrowLeft,
  Upload,
  Check,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { ResumeVersion, UserProfile, Job } from '../types';
import { CreateResumeVariantModal } from './CreateResumeVariantModal';
import { UploadResumeModal } from './UploadResumeModal';
import { ResumePreviewEditModal } from './ResumePreviewEditModal';
import { ResumeWorkspace } from './ResumeWorkspace';
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
    name: 'Ambigapathi',
    title: 'Data Analyst / Business Intelligence',
    email: 'ambigapathikavin2@gmail.com',
    phone: '+1 (415) 890-3412',
    location: 'San Francisco, CA (Remote)',
    targetSalary: '$120k - $155k',
    workPreference: 'Remote Preferred' as const,
    searchStatus: 'Actively Interviewing' as const,
    github: 'github.com/kavin',
    linkedin: 'linkedin.com/in/kavin',
    portfolio: 'kavin.dev',
    yearsExperience: 2,
    coreSkills: ['SQL', 'Python', 'Power BI', 'Excel', 'Data Analysis', 'Tableau', 'ETL'],
    dailyGoalApps: 5,
  },
  initialJob = null,
  onSetMasterResume = (_id: string) => {},
  onCreateResumeVariant,
  onUpdateResume,
  onDeleteResume,
}) => {
  const { user } = useAuth();

  // Find active master
  const masterResume = resumes.find((r) => r.isMaster) || resumes[0];
  const activeRoleSubtitle = masterResume?.targetRole || 'Data Analyst';

  // Modals state
  const [isCreateVariantModalOpen, setIsCreateVariantModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewModalResume, setPreviewModalResume] = useState<ResumeVersion | null>(null);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  const handleVariantCreated = (newResume: ResumeVersion) => {
    setSuccessNotification(`Created resume "${newResume.name}" successfully.`);
    if (onCreateResumeVariant) {
      onCreateResumeVariant(newResume);
    }
    setTimeout(() => setSuccessNotification(null), 4000);
  };

  const handleUploadSuccess = (newResume: ResumeVersion) => {
    setSuccessNotification(`Uploaded and parsed "${newResume.name}" successfully.`);
    if (onCreateResumeVariant) {
      onCreateResumeVariant(newResume);
    }
    setTimeout(() => setSuccessNotification(null), 4000);
  };

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <div id="resumes-view-container" className="space-y-4">
      {/* Top Success Banner */}
      {successNotification && (
        <div
          id="resume-variant-success-toast"
          className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-2">
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

      {/* REFINED RESUME STUDIO TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-800/80">
        <div>
          {/* Subtle Back link & Status */}
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-1">
            <span className="text-slate-400 flex items-center gap-1 font-medium hover:text-slate-200 cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Resumes</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Saved</span>
            </span>
          </div>

          {/* Title & Active Role Subtitle */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Resume Studio
            </h1>
            <span className="text-slate-600">·</span>
            <span className="text-sm font-medium text-slate-300">
              Master Resume · {activeRoleSubtitle}
            </span>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            id="top-upload-resume-btn"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload / Import</span>
          </button>

          <button
            type="button"
            id="top-new-variant-btn"
            onClick={() => setIsCreateVariantModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tailor for Job</span>
          </button>

          <button
            type="button"
            id="top-export-pdf-btn"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-900/30 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Resume Studio Core (3-Column Desktop Layout / Mobile Stack) */}
      <ResumeWorkspace
        resumes={resumes}
        jobs={jobs}
        userProfile={userProfile}
        initialJob={initialJob}
        onVariantSaved={handleVariantCreated}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenEditModal={(r) => setPreviewModalResume(r)}
      />

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
