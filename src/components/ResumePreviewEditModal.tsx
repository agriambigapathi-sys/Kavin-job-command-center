import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Save,
  Download,
  Copy,
  Check,
  Sparkles,
  Plus,
  Trash2,
  Code2,
  Eye,
  Building2,
  Briefcase,
  AlertCircle,
  Loader2,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { ResumeVersion, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { updateResume } from '../services/firestoreService';

interface ResumePreviewEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeVersion | null;
  userProfile?: UserProfile;
  onSaveUpdatedResume?: (updated: ResumeVersion) => void;
}

export const ResumePreviewEditModal: React.FC<ResumePreviewEditModalProps> = ({
  isOpen,
  onClose,
  resume,
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
  onSaveUpdatedResume,
}) => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'latex'>('preview');
  const [formData, setFormData] = useState<Partial<ResumeVersion>>({});
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (resume) {
      setFormData({
        name: resume.name,
        targetRole: resume.targetRole,
        targetCompany: resume.targetCompany || '',
        summary: resume.summary,
        skills: [...(resume.skills || [])],
        experienceHighlights: [...(resume.experienceHighlights || [])],
        notes: resume.notes || '',
        isMaster: resume.isMaster,
        version: resume.version,
        status: resume.status,
      });
      setSaveSuccess(false);
      setErrorMsg(null);
    }
  }, [resume, isOpen]);

  if (!isOpen || !resume) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    const currentSkills = formData.skills || [];
    if (!currentSkills.includes(newSkillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...currentSkills, newSkillInput.trim()],
      });
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: (formData.skills || []).filter((s) => s !== skillToRemove),
    });
  };

  const handleAddHighlight = () => {
    setFormData({
      ...formData,
      experienceHighlights: [
        ...(formData.experienceHighlights || []),
        'Engineered high-performance web service modules achieving sub-100ms response times.',
      ],
    });
  };

  const handleUpdateHighlight = (index: number, val: string) => {
    const updated = [...(formData.experienceHighlights || [])];
    updated[index] = val;
    setFormData({
      ...formData,
      experienceHighlights: updated,
    });
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData({
      ...formData,
      experienceHighlights: (formData.experienceHighlights || []).filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    if (!user) {
      setErrorMsg('You must be authenticated to update this resume.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const updates: any = {
        name: formData.name,
        targetRole: formData.targetRole,
        role: formData.targetRole,
        targetCompany: formData.targetCompany,
        company: formData.targetCompany,
        summary: formData.summary,
        skills: formData.skills,
        experienceHighlights: formData.experienceHighlights,
        notes: formData.notes,
        isMaster: !!formData.isMaster,
        lastModified: new Date().toISOString().split('T')[0],
      };

      await updateResume(resume.id, user.uid, updates);

      const updatedResume: ResumeVersion = {
        ...resume,
        ...updates,
      };

      if (onSaveUpdatedResume) {
        onSaveUpdatedResume(updatedResume);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating resume in Firestore:', err);
      setErrorMsg(err.message || 'Failed to update resume.');
    } finally {
      setIsSaving(false);
    }
  };

  // Generate clean LaTeX source
  const latexContent = `\\documentclass[letterpaper,10pt]{article}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{\\vspace{-4pt}\\scshape\\raggedright\\large}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\begin{document}

%---------- HEADING ----------
\\begin{center}
  \\textbf{\\Huge \\scshape ${userProfile.name}} \\\\ \\vspace{1pt}
  \\small ${userProfile.phone} $|$ \\href{mailto:${userProfile.email}}{\\underline{${userProfile.email}}} $|$ 
  \\href{https://${userProfile.linkedin}}{\\underline{${userProfile.linkedin}}} $|$
  \\href{https://${userProfile.github}}{\\underline{${userProfile.github}}}
\\end{center}

%---------- SUMMARY ----------
\\section{Professional Summary}
\\small{${formData.summary || resume.summary}}

%---------- SKILLS ----------
\\section{Technical Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\small{\\item{
   \\textbf{Core Technologies}{: ${(formData.skills || resume.skills || []).join(', ')}}
  }}
\\end{itemize}

%---------- EXPERIENCE HIGHLIGHTS ----------
\\section{Selected Experience Highlights}
\\begin{itemize}[leftmargin=0.15in, label={$\\bullet$}]
${(formData.experienceHighlights || resume.experienceHighlights || [])
  .map((h) => `  \\item \\small{${h}}`)
  .join('\n')}
\\end{itemize}

\\end{document}`;

  return (
    <div
      id="resume-preview-edit-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) {
          onClose();
        }
      }}
    >
      <div
        id="resume-preview-edit-modal-container"
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">{formData.name || resume.name}</h2>
                {formData.isMaster && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Master Resume
                  </span>
                )}
                {formData.targetCompany && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    {formData.targetCompany}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Targeting: <span className="text-cyan-400 font-medium">{formData.targetRole || resume.targetRole}</span> • Version: {resume.version || 'v1.0'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'preview'
                    ? 'bg-slate-800 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visual View</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'edit'
                    ? 'bg-slate-800 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('latex')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'latex'
                    ? 'bg-slate-800 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>LaTeX Code</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">Resume updated successfully in Firestore!</span>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-5 shadow-inner">
              {/* Document Header */}
              <div className="text-center pb-4 border-b border-slate-800 space-y-1">
                <h1 className="text-2xl font-black text-white tracking-wide uppercase">
                  {userProfile.name}
                </h1>
                <div className="text-cyan-400 font-semibold text-sm">
                  {formData.targetRole || resume.targetRole}
                </div>
                <div className="text-slate-400 text-[11px] font-sans">
                  {userProfile.location} • {userProfile.email} • {userProfile.phone}
                </div>
                <div className="text-slate-400 text-[11px] font-mono">
                  {userProfile.linkedin} • {userProfile.github} • {userProfile.portfolio}
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-1.5 border-b border-slate-800 pb-1 flex items-center justify-between">
                  <span>Professional Summary</span>
                  <span className="text-[10px] text-slate-500 lowercase font-normal">ATS optimized</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {formData.summary || resume.summary}
                </p>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-2 border-b border-slate-800 pb-1">
                  Technical Core Competencies
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(formData.skills || resume.skills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-slate-900 text-slate-200 border border-slate-800 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience Highlights */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-2 border-b border-slate-800 pb-1">
                  Selected Experience Highlights (STAR Framework)
                </h3>
                <ul className="space-y-2 list-disc list-inside text-slate-300 leading-relaxed">
                  {(formData.experienceHighlights || resume.experienceHighlights || []).map(
                    (highlight, idx) => (
                      <li key={idx} className="leading-relaxed">
                        <span>{highlight}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Notes */}
              {formData.notes && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Variant Notes: </span>
                  {formData.notes}
                </div>
              )}
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="space-y-4">
              {/* Metadata Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Document Filename / Title
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Target Job Title / Role
                  </label>
                  <input
                    type="text"
                    value={formData.targetRole || ''}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Target Company (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.targetCompany || ''}
                    onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value })}
                    placeholder="e.g. Notion, Datadog"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.isMaster}
                      onChange={(e) => setFormData({ ...formData, isMaster: e.target.checked })}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-950"
                    />
                    <span className="text-xs font-semibold text-slate-200">
                      Designate as Primary Master Resume
                    </span>
                  </label>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Professional Summary
                </label>
                <textarea
                  rows={3}
                  value={formData.summary || ''}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:ring-1 focus:ring-cyan-500 resize-none"
                />
              </div>

              {/* Skills */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Skills & Technical Keywords ({(formData.skills || []).length})
                </label>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 min-h-[50px]">
                  {(formData.skills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-500 hover:text-rose-400 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput || ''}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Add a skill or tool..."
                    className="flex-1 px-3.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:ring-1 focus:ring-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Experience Highlights */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Experience Highlights (STAR Method)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Bullet</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(formData.experienceHighlights || []).map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-xs font-mono text-cyan-400 mt-2 shrink-0">
                        {idx + 1}.
                      </span>
                      <textarea
                        rows={2}
                        value={highlight || ''}
                        onChange={(e) => handleUpdateHighlight(idx, e.target.value)}
                        className="flex-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:ring-1 focus:ring-cyan-500 resize-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(idx)}
                        className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 mt-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'latex' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Ready-to-compile LaTeX source code compatible with Overleaf, MacTeX, and TeXLive.
                </p>
                <button
                  type="button"
                  onClick={() => handleCopy(latexContent, 'latex')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-400 font-semibold border border-slate-700"
                >
                  {copiedType === 'latex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'latex' ? 'Copied LaTeX' : 'Copy LaTeX'}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={16}
                value={latexContent || ''}
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 selection:bg-cyan-900 selection:text-white resize-none"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const plainText = `${userProfile.name} - ${formData.targetRole || resume.targetRole}\nEmail: ${userProfile.email} | Phone: ${userProfile.phone}\n\nSUMMARY:\n${formData.summary || resume.summary}\n\nSKILLS:\n${(formData.skills || resume.skills || []).join(', ')}\n\nEXPERIENCE:\n${(formData.experienceHighlights || resume.experienceHighlights || []).map((h) => `- ${h}`).join('\n')}`;
                handleCopy(plainText, 'text');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              {copiedType === 'text' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'text' ? 'Copied Text' : 'Copy Plain Text'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-cyan-900/30 transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
