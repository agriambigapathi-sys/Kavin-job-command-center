import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Briefcase,
  Building2,
  Layers,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { ResumeVersion, Job } from '../types';
import { useAuth } from '../context/AuthContext';
import { createResumeVariant } from '../services/firestoreService';

interface CreateResumeVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumes: ResumeVersion[];
  jobs: Job[];
  onVariantCreated: (newResume: ResumeVersion) => void;
}

const VARIANT_TYPES = [
  'Custom Role',
  'Data Analyst',
  'Business Intelligence',
  'Business Analyst',
  'Master',
];

export const CreateResumeVariantModal: React.FC<CreateResumeVariantModalProps> = ({
  isOpen,
  onClose,
  resumes = [],
  jobs = [],
  onVariantCreated,
}) => {
  const { user } = useAuth();

  // Find default master or first resume
  const defaultBaseResume = resumes.find((r) => r.isMaster) || resumes[0];

  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [baseResumeId, setBaseResumeId] = useState(defaultBaseResume?.id || '');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [variantType, setVariantType] = useState<string>('Custom Role');
  const [notes, setNotes] = useState('');

  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync default base resume if resumes load
  useEffect(() => {
    if (isOpen) {
      const master = resumes.find((r) => r.isMaster) || resumes[0];
      if (master && !baseResumeId) {
        setBaseResumeId(master.id);
      }
      setValidationError(null);
      setServerError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, resumes]);

  if (!isOpen) return null;

  // Handle Base Resume change
  const handleBaseResumeChange = (newBaseId: string) => {
    setBaseResumeId(newBaseId);
    setValidationError(null);
    const selectedBase = resumes.find((r) => r.id === newBaseId);
    if (selectedBase && !targetRole) {
      setTargetRole(selectedBase.targetRole);
    }
  };

  // Handle Job selection
  const handleJobChange = (newJobId: string) => {
    setSelectedJobId(newJobId);
    setValidationError(null);
    if (newJobId) {
      const foundJob = jobs.find((j) => j.id === newJobId);
      if (foundJob) {
        if (!targetCompany || targetCompany.trim() === '') {
          setTargetCompany(foundJob.company);
        }
        if (!targetRole || targetRole.trim() === '') {
          setTargetRole(foundJob.title);
        }
        if (!name || name.trim() === '') {
          setName(`${foundJob.title} — ${foundJob.company}`);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setServerError(null);

    const trimmedName = name.trim();
    const trimmedRole = targetRole.trim();
    const trimmedCompany = targetCompany.trim();

    // 1. Validation: Name, Role, Base Resume are required
    if (!trimmedName) {
      setValidationError('Resume variant name is required.');
      return;
    }
    if (!trimmedRole) {
      setValidationError('Target role is required.');
      return;
    }
    if (!baseResumeId) {
      setValidationError('Please select a base resume.');
      return;
    }

    const selectedBase = resumes.find((r) => r.id === baseResumeId) || defaultBaseResume;
    if (!selectedBase) {
      setValidationError('Selected base resume could not be found.');
      return;
    }

    // 2. Duplicate Check: name + jobId + baseResumeId
    const effectiveJobId = selectedJobId ? selectedJobId : null;
    const isDuplicate = resumes.some((r) => {
      const sameName = r.name?.toLowerCase().trim() === trimmedName.toLowerCase();
      const rJobId = r.jobId || null;
      const sameJob = rJobId === effectiveJobId;
      const sameBase = (r.baseResumeId || r.id) === baseResumeId;
      return sameName && sameJob && sameBase;
    });

    if (isDuplicate) {
      setValidationError('A resume variant with this configuration already exists.');
      return;
    }

    if (!user) {
      setServerError('You must be authenticated to create a resume variant.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Inherit tailored summary and skills from base resume
      const tailoredSummary =
        trimmedCompany && trimmedRole
          ? `${trimmedRole} specialist targeted for ${trimmedCompany}. ${selectedBase.summary}`
          : selectedBase.summary;

      const newVariantPayload = {
        name: trimmedName.endsWith('.pdf') ? trimmedName : `${trimmedName}.pdf`,
        targetRole: trimmedRole,
        targetCompany: trimmedCompany,
        baseResumeId: selectedBase.id,
        baseResumeName: selectedBase.name,
        jobId: effectiveJobId,
        variantType: variantType,
        notes: notes.trim(),
        summary: tailoredSummary,
        skills: [...selectedBase.skills],
        experienceHighlights: [...selectedBase.experienceHighlights],
        isMaster: variantType === 'Master',
        format: selectedBase.format || 'PDF',
        version: `v${(resumes.filter((r) => r.baseResumeId === selectedBase.id).length + 1).toFixed(1)}`,
        status: 'Active',
      };

      const docId = await createResumeVariant(user.uid, newVariantPayload);

      const createdResumeVersion: ResumeVersion = {
        id: docId,
        name: newVariantPayload.name,
        targetRole: newVariantPayload.targetRole,
        targetCompany: newVariantPayload.targetCompany,
        baseResumeId: newVariantPayload.baseResumeId,
        baseResumeName: newVariantPayload.baseResumeName,
        jobId: newVariantPayload.jobId,
        type: newVariantPayload.isMaster ? 'MASTER' : (newVariantPayload.jobId ? 'JOB_SPECIFIC' : 'ROLE_VARIANT'),
        variantType: newVariantPayload.variantType,
        notes: newVariantPayload.notes,
        summary: newVariantPayload.summary,
        skills: newVariantPayload.skills,
        experienceHighlights: newVariantPayload.experienceHighlights,
        isMaster: newVariantPayload.isMaster,
        format: newVariantPayload.format,
        version: newVariantPayload.version,
        status: newVariantPayload.status,
        lastModified: new Date().toISOString().split('T')[0],
        downloadCount: 0,
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Reset form
      setName('');
      setTargetRole('');
      setTargetCompany('');
      setSelectedJobId('');
      setNotes('');
      setVariantType('Custom Role');

      onVariantCreated(createdResumeVersion);
      onClose();
    } catch (err: any) {
      console.error('Error creating resume variant in Firestore:', err);
      setServerError('Unable to create resume variant. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="create-resume-variant-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        id="create-resume-variant-modal-container"
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Create Resume Variant</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Role-Specific
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Create a role-specific version from your master resume.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-resume-variant-modal-btn"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Validation Alert */}
          {validationError && (
            <div
              id="variant-validation-error"
              className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Server Error Alert */}
          {serverError && (
            <div
              id="variant-server-error"
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Resume Variant Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Resume Variant Name <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              id="variant-name-input"
              value={name || ''}
              onChange={(e) => {
                setName(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="e.g. Data Analyst — PhonePe"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Role */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                <span>Target Role</span>
                <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                id="variant-role-input"
                value={targetRole || ''}
                onChange={(e) => {
                  setTargetRole(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="e.g. Data Analyst"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
            </div>

            {/* Target Company */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Target Company</span>
              </label>
              <input
                type="text"
                id="variant-company-input"
                value={targetCompany || ''}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g. PhonePe"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          {/* Base Resume Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Base Resume</span>
                <span className="text-cyan-400">*</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Template to inherit skills & highlights
              </span>
            </label>
            <select
              id="variant-base-resume-select"
              value={baseResumeId || ''}
              onChange={(e) => handleBaseResumeChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            >
              {resumes.length === 0 && <option value="">No resumes found</option>}
              {resumes.map((res) => (
                <option key={res.id} value={res.id}>
                  {res.name} {res.isMaster ? '★ (Master)' : ''} — {res.targetRole}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* JD / Job Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                JD / Saved Job <span className="text-[10px] text-slate-500 font-normal">(Optional)</span>
              </label>
              <select
                id="variant-job-select"
                value={selectedJobId || ''}
                onChange={(e) => handleJobChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              >
                <option value="">-- No Job Attached --</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.company} — {j.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Variant Type Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Variant Type
              </label>
              <select
                id="variant-type-select"
                value={variantType || 'Targeted'}
                onChange={(e) => setVariantType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              >
                {VARIANT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Customization Notes <span className="text-[10px] text-slate-500 font-normal">(Optional)</span>
            </label>
            <textarea
              id="variant-notes-textarea"
              rows={3}
              value={notes || ''}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Focus on SQL optimization, business dashboard metrics, and stakeholder reporting..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              id="cancel-variant-btn"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="create-variant-submit-btn"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-cyan-900/30 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Variant</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
