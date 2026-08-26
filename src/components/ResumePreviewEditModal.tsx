import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Briefcase,
  Building2,
  FileText,
  Code,
  GraduationCap,
  Award,
  Globe,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { ParsedResumeData, ResumeVersion } from '../types';
import { useAuth } from '../context/AuthContext';
import { createResumeVariant, logUserActivity } from '../services/firestoreService';

interface ResumePreviewEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileType: string;
  extractedText: string;
  initialParsedData: ParsedResumeData | null;
  parsingStatus: 'completed' | 'failed' | 'raw_only';
  parsingError?: string;
  onResumeSaved: (savedResume: ResumeVersion) => void;
}

export const ResumePreviewEditModal: React.FC<ResumePreviewEditModalProps> = ({
  isOpen,
  onClose,
  fileName,
  fileType,
  extractedText,
  initialParsedData,
  parsingStatus,
  parsingError,
  onResumeSaved,
}) => {
  const { user } = useAuth();

  // Personal Info State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [portfolio, setPortfolio] = useState('');

  // Target Metadata
  const [resumeName, setName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [isMaster, setIsMaster] = useState(true);

  // Professional Sections State
  const [summary, setSummary] = useState('');
  const [techSkills, setTechSkills] = useState('');
  const [softSkills, setSoftSkills] = useState('');

  // Lists
  const [workExperience, setWorkExperience] = useState<
    { company: string; jobTitle: string; location: string; dates: string; responsibilitiesText: string }[]
  >([]);
  const [projects, setProjects] = useState<
    { title: string; description: string; techText: string; link: string }[]
  >([]);
  const [education, setEducation] = useState<
    { institution: string; degree: string; field: string; dates: string }[]
  >([]);
  const [certificationsText, setCertificationsText] = useState('');
  const [awardsText, setAwardsText] = useState('');
  const [languagesText, setLanguagesText] = useState('');

  const [activeTab, setActiveTab] = useState<'contact' | 'summary' | 'experience' | 'projects' | 'education' | 'raw'>('contact');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(fileName || 'Master_Resume.pdf');

      const p = initialParsedData?.personalInfo;
      setFullName(p?.fullName || '');
      setEmail(p?.email || '');
      setPhone(p?.phone || '');
      setLocation(p?.location || '');
      setLinkedin(p?.linkedin || '');
      setGithub(p?.github || '');
      setPortfolio(p?.portfolio || '');

      const prof = initialParsedData?.professionalInfo;
      setSummary(prof?.summary || '');

      const tSkills = prof?.skills?.technicalSkills || [];
      const sSkills = prof?.skills?.softSkills || [];
      setTechSkills(tSkills.join(', '));
      setSoftSkills(sSkills.join(', '));

      // Infer target role
      const primaryJob = prof?.workExperience?.[0];
      setTargetRole(primaryJob?.jobTitle || 'Senior Software Engineer');
      setTargetCompany(primaryJob?.company || '');

      // Work experience
      if (prof?.workExperience && prof.workExperience.length > 0) {
        setWorkExperience(
          prof.workExperience.map((w) => ({
            company: w.company || '',
            jobTitle: w.jobTitle || '',
            location: w.location || '',
            dates: w.employmentDates || '',
            responsibilitiesText: (w.responsibilities || []).map((r) => `- ${r}`).join('\n'),
          }))
        );
      } else {
        setWorkExperience([
          {
            company: 'Enterprise Solutions',
            jobTitle: 'Senior Software Engineer',
            location: 'San Francisco, CA',
            dates: '2022 - Present',
            responsibilitiesText:
              '- Architected high-throughput full-stack web applications.\n- Deployed cloud-native microservices with automated CI/CD pipelines.',
          },
        ]);
      }

      // Projects
      if (prof?.projects && prof.projects.length > 0) {
        setProjects(
          prof.projects.map((pr) => ({
            title: pr.title || '',
            description: pr.description || '',
            techText: (pr.technologies || []).join(', '),
            link: pr.link || '',
          }))
        );
      } else {
        setProjects([]);
      }

      // Education
      if (prof?.education && prof.education.length > 0) {
        setEducation(
          prof.education.map((ed) => ({
            institution: ed.institution || '',
            degree: ed.degree || '',
            field: ed.field || '',
            dates: ed.dates || '',
          }))
        );
      } else {
        setEducation([]);
      }

      setCertificationsText((prof?.certifications || []).join(', '));
      setAwardsText((prof?.awards || []).join(', '));
      setLanguagesText((prof?.languages || []).join(', '));

      setErrorMsg(null);
      setIsSaving(false);
    }
  }, [isOpen, initialParsedData, fileName]);

  if (!isOpen) return null;

  const handleAddWorkExp = () => {
    setWorkExperience([
      ...workExperience,
      { company: '', jobTitle: '', location: '', dates: '', responsibilitiesText: '' },
    ]);
  };

  const handleRemoveWorkExp = (idx: number) => {
    setWorkExperience(workExperience.filter((_, i) => i !== idx));
  };

  const handleAddProject = () => {
    setProjects([...projects, { title: '', description: '', techText: '', link: '' }]);
  };

  const handleRemoveProject = (idx: number) => {
    setProjects(projects.filter((_, i) => i !== idx));
  };

  const handleAddEducation = () => {
    setEducation([...education, { institution: '', degree: '', field: '', dates: '' }]);
  };

  const handleRemoveEducation = (idx: number) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  const handleSaveResume = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resumeName.trim()) {
      setErrorMsg('Resume version title is required.');
      return;
    }

    if (!targetRole.trim()) {
      setErrorMsg('Target role title is required.');
      return;
    }

    if (!user) {
      setErrorMsg('User session expired. Please sign in again.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const parsedTechSkills = techSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedSoftSkills = softSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const allSkills = Array.from(new Set([...parsedTechSkills, ...parsedSoftSkills]));

      // Flatten experience highlights for existing UI components
      const highlights: string[] = [];
      workExperience.forEach((w) => {
        const lines = w.responsibilitiesText
          .split('\n')
          .map((line) => line.replace(/^[-*•]\s*/, '').trim())
          .filter(Boolean);
        lines.forEach((l) => {
          highlights.push(w.jobTitle ? `${w.jobTitle} (${w.company}): ${l}` : l);
        });
      });

      const structuredParsedData: ParsedResumeData = {
        personalInfo: {
          fullName: fullName.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
          location: location.trim() || null,
          linkedin: linkedin.trim() || null,
          github: github.trim() || null,
          portfolio: portfolio.trim() || null,
        },
        professionalInfo: {
          summary: summary.trim() || null,
          skills: {
            technicalSkills: parsedTechSkills,
            softSkills: parsedSoftSkills,
          },
          workExperience: workExperience.map((w) => ({
            company: w.company.trim() || null,
            jobTitle: w.jobTitle.trim() || null,
            location: w.location.trim() || null,
            employmentDates: w.dates.trim() || null,
            responsibilities: w.responsibilitiesText
              .split('\n')
              .map((line) => line.replace(/^[-*•]\s*/, '').trim())
              .filter(Boolean),
            achievements: [],
          })),
          projects: projects.map((pr) => ({
            title: pr.title.trim() || null,
            description: pr.description.trim() || null,
            technologies: pr.techText
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
            link: pr.link.trim() || null,
          })),
          education: education.map((ed) => ({
            institution: ed.institution.trim() || null,
            degree: ed.degree.trim() || null,
            field: ed.field.trim() || null,
            dates: ed.dates.trim() || null,
          })),
          certifications: certificationsText
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean),
          awards: awardsText
            .split(',')
            .map((a) => a.trim())
            .filter(Boolean),
          languages: languagesText
            .split(',')
            .map((l) => l.trim())
            .filter(Boolean),
        },
      };

      const payload = {
        name: resumeName.trim(),
        targetRole: targetRole.trim(),
        targetCompany: targetCompany.trim(),
        baseResumeId: 'master-upload',
        baseResumeName: fileName || 'Uploaded Resume File',
        jobId: null,
        variantType: isMaster ? 'Master' : 'Uploaded Master',
        notes: `Parsed from ${fileName} on ${new Date().toLocaleDateString()}`,
        summary: summary.trim() || `Master candidate profile for ${targetRole}`,
        skills: allSkills.length > 0 ? allSkills : ['TypeScript', 'React', 'Node.js', 'SQL'],
        experienceHighlights:
          highlights.length > 0
            ? highlights.slice(0, 8)
            : ['Demonstrated systems development and full-stack technical accomplishments.'],
        isMaster: isMaster,
        format: fileType as any,
        version: 'v1.0-master',
        status: 'Active',
        extractedText: extractedText,
        parsedData: structuredParsedData,
        filename: fileName,
        fileType: fileType,
        uploadTimestamp: new Date().toISOString(),
        parsingStatus: parsingStatus || 'completed',
        parsingError: parsingError,
      };

      const docId = await createResumeVariant(user.uid, payload);

      await logUserActivity(
        user.uid,
        'Resume Generated',
        `Saved master uploaded resume "${payload.name}" for ${payload.targetRole}`
      );

      const createdResumeVersion: ResumeVersion = {
        id: docId,
        name: payload.name,
        targetRole: payload.targetRole,
        targetCompany: payload.targetCompany,
        baseResumeId: payload.baseResumeId,
        baseResumeName: payload.baseResumeName,
        jobId: null,
        type: isMaster ? 'MASTER' : 'ROLE_VARIANT',
        variantType: payload.variantType,
        notes: payload.notes,
        summary: payload.summary,
        skills: payload.skills,
        experienceHighlights: payload.experienceHighlights,
        isMaster: isMaster,
        format: payload.format,
        version: payload.version,
        status: payload.status,
        extractedText: payload.extractedText,
        parsedData: payload.parsedData,
        filename: payload.filename,
        fileType: payload.fileType,
        uploadTimestamp: payload.uploadTimestamp,
        parsingStatus: payload.parsingStatus as any,
        parsingError: payload.parsingError,
        lastModified: new Date().toISOString().split('T')[0],
        downloadCount: 0,
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onResumeSaved(createdResumeVersion);
      onClose();
    } catch (err: any) {
      console.error('Error saving parsed resume:', err);
      setErrorMsg(err.message || 'Failed to save parsed resume to Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="resume-preview-edit-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="resume-preview-edit-modal-container"
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col text-slate-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Review & Edit Parsed Master Resume</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {parsingStatus === 'completed' ? 'AI Parsed' : 'Raw Text Preserved'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify and edit your authentic facts before saving to your master resume repository.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status / Error Banner if any */}
        {parsingError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{parsingError}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`px-3 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
              activeTab === 'contact'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Contact & Target Role
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
              activeTab === 'summary'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Summary & Skills
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('experience')}
            className={`px-3 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
              activeTab === 'experience'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Work Experience ({workExperience.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
              activeTab === 'projects'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            4. Projects & Education
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            className={`px-3 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
              activeTab === 'raw'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Extracted Raw Text
          </button>
        </div>

        {/* Tab Forms Body */}
        <form onSubmit={handleSaveResume} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: CONTACT & TARGET METADATA */}
          {activeTab === 'contact' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Resume Title *
                  </label>
                  <input
                    required
                    type="text"
                    value={resumeName}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Master_FullStack_2026.pdf"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Target Role Title *
                  </label>
                  <input
                    required
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Candidate Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ambigapathi Kavin"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ambigapathikavin2@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (415) 890-3412"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="linkedin.com/in/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">GitHub URL</label>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="github.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Portfolio URL</label>
                  <input
                    type="text"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="portfolio.dev"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-slate-200 font-semibold">
                  <input
                    type="checkbox"
                    checked={isMaster}
                    onChange={(e) => setIsMaster(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span>Mark as primary Master Resume (baseline template for custom job variants)</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: SUMMARY & SKILLS */}
          {activeTab === 'summary' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Professional Executive Summary
                </label>
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="3-4 sentence professional summary..."
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Technical Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={techSkills}
                  onChange={(e) => setTechSkills(e.target.value)}
                  placeholder="TypeScript, React, Node.js, Python, SQL, PostgreSQL, Docker"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Soft Skills & Methodologies (comma-separated)
                </label>
                <input
                  type="text"
                  value={softSkills}
                  onChange={(e) => setSoftSkills(e.target.value)}
                  placeholder="Agile, Distributed Teams, Stakeholder Management"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Certifications</label>
                  <input
                    type="text"
                    value={certificationsText}
                    onChange={(e) => setCertificationsText(e.target.value)}
                    placeholder="AWS Certified, GCP Data Engineer"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Awards</label>
                  <input
                    type="text"
                    value={awardsText}
                    onChange={(e) => setAwardsText(e.target.value)}
                    placeholder="Engineering Excellence Award"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Languages</label>
                  <input
                    type="text"
                    value={languagesText}
                    onChange={(e) => setLanguagesText(e.target.value)}
                    placeholder="English (Native)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORK EXPERIENCE LIST */}
          {activeTab === 'experience' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-200">Parsed Employment History</h4>
                <button
                  type="button"
                  onClick={handleAddWorkExp}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-semibold text-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Role</span>
                </button>
              </div>

              {workExperience.map((work, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400 text-xs">Role #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWorkExp(idx)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={work.company}
                      onChange={(e) => {
                        const copy = [...workExperience];
                        copy[idx].company = e.target.value;
                        setWorkExperience(copy);
                      }}
                      placeholder="Company Name"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={work.jobTitle}
                      onChange={(e) => {
                        const copy = [...workExperience];
                        copy[idx].jobTitle = e.target.value;
                        setWorkExperience(copy);
                      }}
                      placeholder="Job Title / Position"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={work.location}
                      onChange={(e) => {
                        const copy = [...workExperience];
                        copy[idx].location = e.target.value;
                        setWorkExperience(copy);
                      }}
                      placeholder="Location (e.g. San Francisco, CA)"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={work.dates}
                      onChange={(e) => {
                        const copy = [...workExperience];
                        copy[idx].dates = e.target.value;
                        setWorkExperience(copy);
                      }}
                      placeholder="Employment Dates (e.g. 2022 - Present)"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Responsibilities & Bullet Accomplishments (one per line)
                    </label>
                    <textarea
                      rows={3}
                      value={work.responsibilitiesText}
                      onChange={(e) => {
                        const copy = [...workExperience];
                        copy[idx].responsibilitiesText = e.target.value;
                        setWorkExperience(copy);
                      }}
                      placeholder="- High impact accomplishment..."
                      className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: PROJECTS & EDUCATION */}
          {activeTab === 'projects' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Projects */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200">Projects</h4>
                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-semibold text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>

                {projects.map((proj, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-400 text-xs">Project #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(idx)}
                        className="p-1 rounded text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const copy = [...projects];
                          copy[idx].title = e.target.value;
                          setProjects(copy);
                        }}
                        placeholder="Project Title"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={proj.techText}
                        onChange={(e) => {
                          const copy = [...projects];
                          copy[idx].techText = e.target.value;
                          setProjects(copy);
                        }}
                        placeholder="Technologies (comma-separated)"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none"
                      />
                    </div>

                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => {
                        const copy = [...projects];
                        copy[idx].description = e.target.value;
                        setProjects(copy);
                      }}
                      placeholder="Project description and key impact..."
                      className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              {/* Education */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200">Education</h4>
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-semibold text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Degree</span>
                  </button>
                </div>

                {education.map((ed, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-400 text-xs">Education #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(idx)}
                        className="p-1 rounded text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={ed.institution}
                        onChange={(e) => {
                          const copy = [...education];
                          copy[idx].institution = e.target.value;
                          setEducation(copy);
                        }}
                        placeholder="Institution / University Name"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={ed.degree}
                        onChange={(e) => {
                          const copy = [...education];
                          copy[idx].degree = e.target.value;
                          setEducation(copy);
                        }}
                        placeholder="Degree (e.g. Bachelor of Science)"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: RAW EXTRACTED TEXT */}
          {activeTab === 'raw' && (
            <div className="space-y-2 animate-in fade-in">
              <label className="block text-slate-300 font-semibold">
                Authentic Document Raw Text ({extractedText.length} characters)
              </label>
              <textarea
                readOnly
                rows={14}
                value={extractedText}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs leading-relaxed focus:outline-none"
              />
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-slate-500 text-[11px]">
              Saves into your isolated Firestore master resumes repository
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-md shadow-cyan-950/50 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Master Resume...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Master Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
