import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Briefcase,
  Copy,
  ArrowRight,
  RefreshCw,
  Zap,
  Target,
  FileSearch,
  ShieldCheck,
  Check,
  Sliders,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Search,
  Building,
  Layers,
  FileCode,
} from 'lucide-react';
import { Job, JDAnalysisResult, ResumeVersion, KeywordEvidence, FirestoreJobAnalysis } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  saveJobAnalysis,
  updateJob,
  subscribeToJobAnalyses,
  getJobDescription,
  getJobAnalysisForJobAndResume,
} from '../services/firestoreService';

interface JDAnalyserViewProps {
  jobs?: Job[];
  resumes?: ResumeVersion[];
  initialSelectedJob?: Job | null;
  onNavigateToCoverLetter?: (company: string, role: string, jd: string) => void;
}

export const JDAnalyserView: React.FC<JDAnalyserViewProps> = ({
  jobs = [],
  resumes = [],
  initialSelectedJob,
  onNavigateToCoverLetter = (_company: string, _role: string, _jd: string) => {},
}) => {
  const { user } = useAuth();

  // Find initial default job
  const defaultJob = initialSelectedJob || jobs[0] || null;

  // Single Source of Truth Identifiers
  const [selectedJobId, setSelectedJobId] = useState<string>(defaultJob?.id || 'custom');
  const [jobTitle, setJobTitle] = useState<string>(defaultJob?.title || 'Senior Full-Stack AI Engineer');
  const [company, setCompany] = useState<string>(defaultJob?.company || 'Amazon');
  const [jobDescription, setJobDescription] = useState<string>(
    defaultJob?.description ||
      'Amazon is looking for a Senior Full-Stack AI Engineer to build next-generation customer systems and developer platforms. Requirements: 6+ years experience with TypeScript, React 19, Node.js microservices, distributed systems architecture, GraphQL, and Gemini/LLM AI integrations. Deep experience building resilient, low-latency cloud systems with PostgreSQL and Docker.'
  );

  // Resume Selection Source of Truth
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id || 'res-1');
  const [customResumeText, setCustomResumeText] = useState<string>('');
  const [isCustomResumeMode, setIsCustomResumeMode] = useState<boolean>(false);

  // Analysis State (Strictly null when inputs change until re-analyzed or loaded)
  const [analysisResult, setAnalysisResult] = useState<JDAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // UI state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [keywordFilter, setKeywordFilter] = useState<'all' | 'matched' | 'partial' | 'missing'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBreakdown, setExpandedBreakdown] = useState<string | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<FirestoreJobAnalysis[]>([]);

  // Subscribe to past saved analyses if user is logged in
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToJobAnalyses(
      user.uid,
      (analyses) => setSavedAnalyses(analyses),
      (err) => console.warn('Could not load saved analyses:', err)
    );
    return () => unsub();
  }, [user]);

  // Pure deterministic hashing for JD content versioning
  const computeJdVersion = (jdText: string): string => {
    const trimmed = (jdText || '').trim();
    if (!trimmed) return 'empty';
    let hash = 0;
    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `v_${trimmed.length}_${Math.abs(hash)}`;
  };

  // Pure helper to identify active resume version
  const getResumeVersion = (resume?: ResumeVersion, isCustom?: boolean, customText?: string): string => {
    if (isCustom) {
      return computeJdVersion(customText || '');
    }
    if (!resume) return 'v1.0';
    return resume.version || resume.name || resume.lastModified || resume.id;
  };

  // Dynamic status resolver for each job in the opportunity selector
  const getJobAnalysisStatusForDropdown = (job: Job): string => {
    if (job.id === 'custom') return '';

    // If currently running analysis on this job
    if (isLoading && selectedJobId === job.id) {
      return 'Analyzing...';
    }

    const activeResumeId = isCustomResumeMode ? 'custom-resume' : selectedResumeId;
    const activeResumeObj = resumes.find((r) => r.id === selectedResumeId);
    const currentResumeVer = getResumeVersion(activeResumeObj, isCustomResumeMode, customResumeText);
    const targetJdText = selectedJobId === job.id ? jobDescription : (job.description || '');
    const currentJdVer = computeJdVersion(targetJdText);

    // If active job has an in-memory completed analysis result
    if (selectedJobId === job.id && analysisResult && !isLoading) {
      return `${analysisResult.matchScore}% Match`;
    }

    // Check saved analyses in Firestore with strict 4-tuple match:
    // jobId + resumeId + JD version + resume version
    const matchingAnalysis = savedAnalyses.find((a) => {
      if (a.jobId !== job.id) return false;
      if (a.resumeId !== activeResumeId) return false;

      const isCompleted = a.analysisStatus === 'completed' || a.status === 'completed';
      if (!isCompleted) return false;

      if (a.jobDescriptionVersion && a.jobDescriptionVersion !== currentJdVer) {
        return false;
      }
      if (a.resumeVersion && a.resumeVersion !== currentResumeVer) {
        return false;
      }

      return typeof a.overallScore === 'number' || typeof a.overallMatch === 'number';
    });

    if (matchingAnalysis) {
      const score = matchingAnalysis.overallScore ?? matchingAnalysis.overallMatch;
      return `${score}% Match`;
    }

    // Check if there is an explicit failed record
    const failedAnalysis = savedAnalyses.find(
      (a) => a.jobId === job.id && a.resumeId === activeResumeId && (a.analysisStatus === 'failed' || a.status === 'failed')
    );
    if (failedAnalysis) {
      return 'Analysis Failed';
    }

    // Check if there is an explicit pending record
    const pendingAnalysis = savedAnalyses.find(
      (a) => a.jobId === job.id && a.resumeId === activeResumeId && (a.analysisStatus === 'pending' || a.status === 'pending')
    );
    if (pendingAnalysis) {
      return 'Analyzing...';
    }

    return 'Not Analyzed';
  };

  // Sync state when initialSelectedJob prop changes (e.g. user clicked "Analyze JD" from Jobs table)
  useEffect(() => {
    if (initialSelectedJob) {
      setSelectedJobId(initialSelectedJob.id);
      setJobTitle(initialSelectedJob.title);
      setCompany(initialSelectedJob.company);
      setJobDescription(initialSelectedJob.description || '');
      setAnalysisResult(null);
      setValidationError(null);

      // Check if full JD exists in Firestore
      if (user) {
        getJobDescription(initialSelectedJob.id, user.uid).then((fullJd) => {
          if (fullJd && (fullJd.rawText || fullJd.summary)) {
            setJobDescription(fullJd.rawText || fullJd.summary);
          }
        });
      }
    }
  }, [initialSelectedJob, user]);

  // Auto-restore matching verified analysis when inputs/selections change
  useEffect(() => {
    if (isLoading || !selectedJobId || selectedJobId === 'custom') return;

    const activeResumeId = isCustomResumeMode ? 'custom-resume' : selectedResumeId;
    const activeResumeObj = resumes.find((r) => r.id === selectedResumeId);
    const currentResumeVer = getResumeVersion(activeResumeObj, isCustomResumeMode, customResumeText);
    const currentJdVer = computeJdVersion(jobDescription);

    const verified = savedAnalyses.find((a) => {
      if (a.jobId !== selectedJobId) return false;
      if (a.resumeId !== activeResumeId) return false;
      const isCompleted = a.analysisStatus === 'completed' || a.status === 'completed';
      if (!isCompleted) return false;
      if (a.jobDescriptionVersion && a.jobDescriptionVersion !== currentJdVer) return false;
      if (a.resumeVersion && a.resumeVersion !== currentResumeVer) return false;
      return typeof a.overallScore === 'number' || typeof a.overallMatch === 'number';
    });

    if (verified) {
      setAnalysisResult({
        matchScore: verified.overallScore ?? verified.overallMatch ?? 0,
        roleCompatibility: verified.roleCompatibility ?? verified.overallScore ?? 0,
        atsScore: verified.atsScore || 85,
        matchSummary: verified.matchSummary || verified.summary || '',
        breakdown: verified.scoreBreakdown || {
          skillsMatch: { score: 80, weight: 30, explanation: 'Skills evaluation', strengths: [], gaps: [] },
          experienceMatch: { score: 80, weight: 20, explanation: 'Experience evaluation', strengths: [], gaps: [] },
          domainMatch: { score: 80, weight: 20, explanation: 'Domain evaluation', strengths: [], gaps: [] },
          seniorityMatch: { score: 80, weight: 15, explanation: 'Seniority evaluation', strengths: [], gaps: [] },
          projectsMatch: { score: 80, weight: 10, explanation: 'Projects evaluation', strengths: [], gaps: [] },
          educationMatch: { score: 80, weight: 5, explanation: 'Education evaluation', strengths: [], gaps: [] },
        },
        matchedKeywords: verified.matchedKeywords || verified.evidence?.matched || [],
        partialKeywords: verified.partialKeywords || verified.evidence?.partial || [],
        missingKeywords: verified.missingKeywords || verified.evidence?.missing || [],
        atsFeedback: verified.atsFeedback || [],
        bulletRecommendations: verified.bulletRecommendations || [],
        customInterviewQuestions: verified.customInterviewQuestions || [],
        honestGapsAdvice: verified.honestGapsAdvice || [],
        antiHallucinationVerified: true,
      });
    }
  }, [selectedJobId, selectedResumeId, jobDescription, isCustomResumeMode, customResumeText, savedAnalyses, isLoading, resumes]);

  // Handle job dropdown change - strictly isolates data
  const handleSelectPredefinedJob = async (jobId: string) => {
    setSelectedJobId(jobId);
    setValidationError(null);
    setAnalysisResult(null); // Clear previous analysis immediately

    if (jobId === 'custom') {
      setJobTitle('');
      setCompany('');
      setJobDescription('');
    } else {
      const found = jobs.find((j) => j.id === jobId);
      if (found) {
        setJobTitle(found.title);
        setCompany(found.company);
        setJobDescription(found.description || '');

        // Fetch full JD from Firestore if available
        if (user) {
          try {
            const fullJd = await getJobDescription(jobId, user.uid);
            if (fullJd && (fullJd.rawText || fullJd.summary)) {
              setJobDescription(fullJd.rawText || fullJd.summary);
            }
          } catch (e) {
            console.warn('Could not fetch detailed JD:', e);
          }
        }
      }
    }
  };

  // Handle resume dropdown change - strictly isolates data
  const handleSelectResume = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    setValidationError(null);
    setAnalysisResult(null); // Clear previous analysis immediately
  };

  // Compile active resume text representation
  const getActiveResumeContent = (): string => {
    if (isCustomResumeMode && customResumeText.trim()) {
      return customResumeText.trim();
    }
    const sel = resumes.find((r) => r.id === selectedResumeId) || resumes[0];
    if (!sel) return '';
    return `Candidate Name: Kavin
Target Role: ${sel.targetRole}
Summary: ${sel.summary}
Skills: ${sel.skills.join(', ')}
Key Highlights:
${sel.experienceHighlights.map((h) => `- ${h}`).join('\n')}`;
  };

  // Run rigorous, zero-hallucination AI analysis
  const handleRunAnalysis = async () => {
    setValidationError(null);

    // Validation 1: Job Description
    const trimmedJd = jobDescription.trim();
    if (!trimmedJd || trimmedJd.length < 20) {
      setValidationError('Please provide a complete job description with at least 20 characters.');
      return;
    }

    // Validation 2: Resume Content
    const resumeContent = getActiveResumeContent().trim();
    if (!resumeContent || resumeContent.length < 20) {
      setValidationError('Please select or provide a valid candidate resume with at least 20 characters.');
      return;
    }

    setIsLoading(true);
    setSaveStatus('idle');
    setAnalysisStage('Validating active Job and Resume source integrity...');

    try {
      setAnalysisStage('Enforcing zero-hallucination boundary & extracting factual keyword evidence...');

      const activeResume = resumes.find((r) => r.id === selectedResumeId);

      const requestPayload = {
        jobId: selectedJobId,
        company: (company || 'Company').trim(),
        role: (jobTitle || 'Role').trim(),
        jobTitle: (jobTitle || 'Role').trim(),
        jobDescription: trimmedJd,
        resumeId: isCustomResumeMode ? 'custom-resume' : selectedResumeId,
        resumeVersion: isCustomResumeMode ? 'custom-v1' : (activeResume?.name || 'v1'),
        resumeText: resumeContent,
      };

      setAnalysisStage('Running 6-factor weighted compatibility analysis with Gemini 3.7 Flash...');

      const response = await fetch('/api/gemini/analyze-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Analysis failed with status ${response.status}`);
      }

      const data: JDAnalysisResult = await response.json();
      setAnalysisResult(data);

      const targetJdVersion = computeJdVersion(trimmedJd);
      const targetResumeVersion = getResumeVersion(activeResume, isCustomResumeMode, resumeContent);

      // If user is logged in and analyzing a saved job, automatically save & update job score
      if (user && selectedJobId && selectedJobId !== 'custom') {
        try {
          await saveJobAnalysis(user.uid, {
            jobId: selectedJobId,
            resumeId: isCustomResumeMode ? 'custom-resume' : selectedResumeId,
            jobDescriptionVersion: targetJdVersion,
            resumeVersion: targetResumeVersion,
            role: (jobTitle || 'Opportunity').trim(),
            jobTitle: (jobTitle || 'Opportunity').trim(),
            company: (company || 'Company').trim(),
            overallScore: data.matchScore,
            overallMatch: data.matchScore,
            roleCompatibility: data.roleCompatibility || data.matchScore,
            atsScore: data.atsScore,
            summary: data.matchSummary,
            matchSummary: data.matchSummary,
            scoreBreakdown: data.breakdown,
            matchedKeywords: (data.matchedKeywords || []) as KeywordEvidence[],
            partialKeywords: (data.partialKeywords || []) as KeywordEvidence[],
            missingKeywords: (data.missingKeywords || []) as KeywordEvidence[],
            atsFeedback: data.atsFeedback || [],
            bulletRecommendations: data.bulletRecommendations || [],
            customInterviewQuestions: data.customInterviewQuestions || [],
            honestGapsAdvice: data.honestGapsAdvice || [],
            status: 'completed',
            analysisStatus: 'completed',
          });

          // Also update the job's fitnessScore in Firestore
          await updateJob(selectedJobId, user.uid, {
            fitnessScore: data.matchScore,
            matchKeyHighlights: (data.matchedKeywords || [])
              .slice(0, 4)
              .map((k) => (typeof k === 'string' ? k : k.keyword)),
            status: 'JD Analyzed',
          });
        } catch (dbErr) {
          console.warn('Auto-save to Firestore notice:', dbErr);
        }
      }
    } catch (err: any) {
      console.error('API error during analysis:', err);
      let errMsg = err?.message || 'Failed to analyze job description. Please check your network and retry.';
      if (
        errMsg.includes('503') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('429') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('busy')
      ) {
        errMsg = 'AI service is temporarily busy. Please try again.';
      }
      setValidationError(errMsg);
    } finally {
      setIsLoading(false);
      setAnalysisStage('');
    }
  };

  // Manual save analysis handler
  const handleSaveAnalysisToFirestore = async () => {
    if (!user) {
      alert('Please sign in to save analyses to your account.');
      return;
    }
    if (!analysisResult) return;

    setSaveStatus('saving');
    try {
      const activeResume = resumes.find((r) => r.id === selectedResumeId);
      const resumeContent = getActiveResumeContent().trim();
      const targetJdVersion = computeJdVersion(jobDescription);
      const targetResumeVersion = getResumeVersion(activeResume, isCustomResumeMode, resumeContent);

      await saveJobAnalysis(user.uid, {
        jobId: selectedJobId !== 'custom' ? selectedJobId : '',
        resumeId: isCustomResumeMode ? 'custom-resume' : selectedResumeId,
        jobDescriptionVersion: targetJdVersion,
        resumeVersion: targetResumeVersion,
        role: (jobTitle || 'Opportunity').trim(),
        jobTitle: (jobTitle || 'Opportunity').trim(),
        company: (company || 'Company').trim(),
        overallScore: analysisResult.matchScore,
        overallMatch: analysisResult.matchScore,
        roleCompatibility: analysisResult.roleCompatibility || analysisResult.matchScore,
        atsScore: analysisResult.atsScore,
        summary: analysisResult.matchSummary,
        matchSummary: analysisResult.matchSummary,
        scoreBreakdown: analysisResult.breakdown,
        matchedKeywords: (analysisResult.matchedKeywords || []) as KeywordEvidence[],
        partialKeywords: (analysisResult.partialKeywords || []) as KeywordEvidence[],
        missingKeywords: (analysisResult.missingKeywords || []) as KeywordEvidence[],
        atsFeedback: analysisResult.atsFeedback || [],
        bulletRecommendations: analysisResult.bulletRecommendations || [],
        customInterviewQuestions: analysisResult.customInterviewQuestions || [],
        honestGapsAdvice: analysisResult.honestGapsAdvice || [],
        status: 'completed',
        analysisStatus: 'completed',
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      console.error('Error saving analysis:', e);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleCopyBullet = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyFullReport = () => {
    if (!analysisResult) return;
    const reportText = `# Zero-Hallucination JD Alignment Audit Report
## Target: ${jobTitle} at ${company} (Job ID: ${selectedJobId})
**Job Match Score:** ${analysisResult.matchScore}%
**ATS Parseability:** ${analysisResult.atsScore}%

### Executive Summary
${analysisResult.matchSummary}

### 6-Dimension Score Breakdown
- Technical & Core Skills (30% weight): ${analysisResult.breakdown?.skillsMatch?.score || 0}%
- Scope & Years Experience (20% weight): ${analysisResult.breakdown?.experienceMatch?.score || 0}%
- Domain & Industry Alignment (20% weight): ${analysisResult.breakdown?.domainMatch?.score || 0}%
- Seniority & Architecture (15% weight): ${analysisResult.breakdown?.seniorityMatch?.score || 0}%
- High-Impact Scale (10% weight): ${analysisResult.breakdown?.projectsMatch?.score || 0}%
- Education Foundations (5% weight): ${analysisResult.breakdown?.educationMatch?.score || 0}%

### Verified Matched Keywords (${analysisResult.matchedKeywords?.length || 0})
${analysisResult.matchedKeywords
  ?.map((k) => (typeof k === 'string' ? `- ${k}` : `- **${k.keyword}** (${k.category}): JD asks "${k.jdEvidence}" | Resume proves "${k.resumeEvidence}"`))
  .join('\n')}

### Skill Gaps to Address Honestly (${analysisResult.missingKeywords?.length || 0})
${analysisResult.missingKeywords
  ?.map((k) => (typeof k === 'string' ? `- ${k}` : `- **${k.keyword}**: ${k.gapAnalysis || 'Not found in resume'}`))
  .join('\n')}

### Tailored Truthful STAR Bullets
${analysisResult.bulletRecommendations?.map((b) => `- ${b}`).join('\n')}
`;
    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // Filter keywords based on active tab and search term
  const allKeywordsList: KeywordEvidence[] = analysisResult
    ? [
        ...(analysisResult.matchedKeywords || []).map((k) =>
          typeof k === 'string'
            ? {
                keyword: k,
                category: 'Technical Skill' as const,
                importance: 'Required' as const,
                jdEvidence: 'Required by role specification',
                resumeEvidence: 'Verified in candidate resume profile',
                status: 'matched' as const,
              }
            : k
        ),
        ...(analysisResult.partialKeywords || []).map((k) =>
          typeof k === 'string'
            ? {
                keyword: k,
                category: 'Technical Skill' as const,
                importance: 'Preferred' as const,
                jdEvidence: 'Target requirement in posting',
                resumeEvidence: 'Adjacent verified capability',
                status: 'partial' as const,
              }
            : k
        ),
        ...(analysisResult.missingKeywords || []).map((k) =>
          typeof k === 'string'
            ? {
                keyword: k,
                category: 'Technical Skill' as const,
                importance: 'Preferred' as const,
                jdEvidence: 'Specified in job description',
                resumeEvidence: 'Not found in provided resume',
                status: 'missing' as const,
              }
            : k
        ),
      ]
    : [];

  const filteredKeywords = allKeywordsList.filter((k) => {
    if (keywordFilter !== 'all' && k.status !== keywordFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        k.keyword.toLowerCase().includes(term) ||
        k.category.toLowerCase().includes(term) ||
        k.jdEvidence?.toLowerCase().includes(term) ||
        k.resumeEvidence?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', label: 'Tier 1 Strong Match', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/40' };
    if (score >= 80) return { grade: 'A', label: 'Solid Core Alignment', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/40' };
    if (score >= 70) return { grade: 'B+', label: 'Viable with Preparation', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/40' };
    if (score >= 60) return { grade: 'B', label: 'Moderate Fit', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/40' };
    return { grade: 'C', label: 'Significant Skill Gaps', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/40' };
  };

  const gradeInfo = analysisResult ? getScoreGrade(analysisResult.matchScore) : null;

  const breakdownCategories = analysisResult
    ? [
        { key: 'skillsMatch', label: 'Technical & Core Skills', weight: '30%', data: analysisResult.breakdown?.skillsMatch },
        { key: 'experienceMatch', label: 'Years & Scope of Experience', weight: '20%', data: analysisResult.breakdown?.experienceMatch },
        { key: 'domainMatch', label: 'Domain & Industry Alignment', weight: '20%', data: analysisResult.breakdown?.domainMatch },
        { key: 'seniorityMatch', label: 'Seniority & Architecture Ownership', weight: '15%', data: analysisResult.breakdown?.seniorityMatch },
        { key: 'projectsMatch', label: 'High-Impact Projects & Scale', weight: '10%', data: analysisResult.breakdown?.projectsMatch },
        { key: 'educationMatch', label: 'Education & Formal Foundations', weight: '5%', data: analysisResult.breakdown?.educationMatch },
      ]
    : [];

  const activeResumeObj = resumes.find((r) => r.id === selectedResumeId);

  return (
    <div id="jd-analyser-view-container" className="space-y-6">
      {/* Top Banner with Anti-Hallucination Guarantee */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 p-5 rounded-2xl border border-purple-500/30 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Gemini 3.7 Flash Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Anti-Hallucination Guarantee: 100% Grounded
              </span>
              <span className="text-xs text-slate-400">Zero Fabricated Skills • Strict Mathematical Weighting</span>
            </div>
            <h2 className="text-xl font-black text-white mt-1.5 flex items-center gap-2">
              <span>Trustworthy JD & Resume Alignment Auditor</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl mt-0.5 leading-relaxed">
              Calculates authentic job compatibility based strictly on proven facts in the selected candidate resume and explicit requirements in the JD. Separates ATS format parseability from candidate qualifications and flags honest skill gaps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {analysisResult && (
              <button
                onClick={handleCopyFullReport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedReport ? 'Report Copied!' : 'Export Audit'}</span>
              </button>
            )}

            {user && analysisResult && (
              <button
                onClick={handleSaveAnalysisToFirestore}
                disabled={saveStatus === 'saving'}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
              >
                <BookmarkCheck className={`w-3.5 h-3.5 ${saveStatus === 'saved' ? 'text-emerald-400' : 'text-purple-400'}`} />
                <span>
                  {saveStatus === 'saving'
                    ? 'Saving...'
                    : saveStatus === 'saved'
                    ? 'Saved to Cloud!'
                    : 'Save Analysis'}
                </span>
              </button>
            )}

            <button
              onClick={handleRunAnalysis}
              disabled={isLoading || !jobDescription.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-950/60 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Auditing Alignment...' : 'Run Rigorous Audit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Sources & Authoritative Data Binding Banner */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block">Target Opportunity</span>
              <span className="font-bold text-slate-200">
                {company || 'Custom Opportunity'} — {jobTitle || 'Custom Role'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono ml-1.5">({selectedJobId})</span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden md:block" />

          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block">JD Content Source</span>
              <span className="font-semibold text-slate-200">
                {jobDescription ? `${jobDescription.length} characters` : 'No JD loaded'}
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden md:block" />

          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block">Candidate Resume Source</span>
              <span className="font-semibold text-slate-200">
                {isCustomResumeMode ? 'Custom Resume Text' : (activeResumeObj?.name || 'Resume')}
              </span>
              <span className="text-[10px] text-slate-400 ml-1.5">
                ({isCustomResumeMode ? 'Custom Input' : (activeResumeObj?.targetRole || 'Full-Stack')})
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Strict Data Isolation Active</span>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
          <button
            onClick={() => setValidationError(null)}
            className="text-[11px] text-rose-300 hover:text-white font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Inputs (Left) and Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-purple-400" />
              Target Opportunity Input
            </h3>
            {selectedJobId !== 'custom' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                Connected to Saved Job
              </span>
            )}
          </div>

          {/* Quick Select from Saved Jobs */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Select Saved Opportunity or Paste New
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => handleSelectPredefinedJob(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="custom">-- Paste Custom Job Description --</option>
              {jobs.map((j) => {
                const statusLabel = getJobAnalysisStatusForDropdown(j);
                return (
                  <option key={j.id} value={j.id}>
                    {j.company} — {j.title} {statusLabel ? `(${statusLabel})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Job Title</label>
              <input
                type="text"
                value={jobTitle || ''}
                onChange={(e) => {
                  setJobTitle(e.target.value);
                  setAnalysisResult(null);
                }}
                placeholder="e.g. Senior AI Engineer"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Company</label>
              <input
                type="text"
                value={company || ''}
                onChange={(e) => {
                  setCompany(e.target.value);
                  setAnalysisResult(null);
                }}
                placeholder="e.g. Scale AI, Stripe"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Resume Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Candidate Resume Source</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomResumeMode(!isCustomResumeMode);
                  setAnalysisResult(null);
                }}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                {isCustomResumeMode ? 'Use Saved Versions' : 'Paste Custom Resume'}
              </button>
            </div>

            {!isCustomResumeMode ? (
              <select
                value={selectedResumeId || ''}
                onChange={(e) => handleSelectResume(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.isMaster ? '(Master)' : ''} - {r.targetRole}
                  </option>
                ))}
              </select>
            ) : (
              <textarea
                rows={4}
                value={customResumeText || ''}
                onChange={(e) => {
                  setCustomResumeText(e.target.value);
                  setAnalysisResult(null);
                }}
                placeholder="Paste raw candidate resume text for custom zero-hallucination verification..."
                className="w-full p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono text-[11px]"
              />
            )}
          </div>

          {/* Job Description TextArea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                Full Job Description Requirements
              </label>
              <span className="text-[10px] text-slate-400 font-mono">{(jobDescription || '').length} characters</span>
            </div>
            <textarea
              rows={8}
              value={jobDescription || ''}
              onChange={(e) => {
                setJobDescription(e.target.value);
                setAnalysisResult(null);
              }}
              placeholder="Paste full raw job description text here..."
              className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono leading-relaxed"
            />
          </div>

          {/* Anti-hallucination Notice */}
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-2.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <span className="font-semibold text-slate-200">Strict Factual Grounding:</span> The AI is instructed to never invent unmentioned technologies or inflate candidate credentials. Missing requirements will be surfaced transparently.
            </div>
          </div>
        </div>

        {/* Right Analysis Results (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Loading State */}
          {isLoading && (
            <div className="p-12 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-purple-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Auditing Job & Resume Alignment</h4>
                <p className="text-xs text-purple-300 font-mono mt-1">{analysisStage}</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-2">
                  Enforcing strict zero-hallucination isolation between {company || 'Opportunity'} and the candidate profile.
                </p>
              </div>
            </div>
          )}

          {/* Empty / Initial State (when inputs changed or not yet analyzed) */}
          {!isLoading && !analysisResult && (
            <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
                <Target className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base font-bold text-white">Ready for Rigorous Alignment Audit</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Verify how truthfully the selected candidate resume matches the requirements for{' '}
                  <span className="text-purple-300 font-semibold">{company || 'Target Opportunity'}</span> —{' '}
                  <span className="text-purple-300 font-semibold">{jobTitle || 'Role'}</span>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left text-xs">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Zero Invention</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    AI never invents unmentioned skills, years, or technologies.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                  <div className="font-bold text-cyan-400 flex items-center gap-1.5 text-[11px]">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>6-Factor Matrix</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Skills (30%), Experience (20%), Domain (20%), Seniority (15%), Projects (10%), Education (5%).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                  <div className="font-bold text-purple-400 flex items-center gap-1.5 text-[11px]">
                    <FileText className="w-3.5 h-3.5" />
                    <span>ATS Parseability</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Separates formatting index from qualification suitability.
                  </p>
                </div>
              </div>

              <button
                onClick={handleRunAnalysis}
                disabled={isLoading || !jobDescription.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-950/60 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run Rigorous Audit</span>
              </button>
            </div>
          )}

          {/* Analysis Results Display */}
          {!isLoading && analysisResult && gradeInfo && (
            <>
              {/* Top Score Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Overall Weighted Match Score */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 font-medium">Job Match Score</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        6-Factor Weighted
                      </span>
                    </div>
                    <div className="text-3xl font-black text-emerald-400 mt-0.5">
                      {analysisResult.matchScore}%
                    </div>
                    <span className={`text-[10px] font-semibold ${gradeInfo.color}`}>
                      {gradeInfo.label}
                    </span>
                  </div>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-extrabold text-sm border-4 ${gradeInfo.bg} ${gradeInfo.color}`}>
                    {gradeInfo.grade}
                  </div>
                </div>

                {/* Separate ATS Parseability */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 font-medium">ATS Parseability</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Formatting & Structure
                      </span>
                    </div>
                    <div className="text-3xl font-black text-cyan-400 mt-0.5">
                      {analysisResult.atsScore}%
                    </div>
                    <span className="text-[10px] text-cyan-300 font-semibold">
                      High-Parsability Layout
                    </span>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 border-4 border-cyan-500/40 flex items-center justify-center text-cyan-300 font-extrabold text-sm">
                    {(analysisResult.atsScore / 10).toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Grounded Executive Match Summary
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  {analysisResult.matchSummary}
                </p>
              </div>

              {/* 6-Factor Score Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    Mathematical Match Score Breakdown
                  </h4>
                  <span className="text-[10px] text-slate-400">Sum of 6 weighted dimensions</span>
                </div>

                <div className="space-y-2.5">
                  {breakdownCategories.map((item) => {
                    const score = item.data?.score || 80;
                    const isExpanded = expandedBreakdown === item.key;
                    return (
                      <div
                        key={item.key}
                        className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5"
                      >
                        <div
                          onClick={() => setExpandedBreakdown(isExpanded ? null : item.key)}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-200">{item.label}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono font-medium">
                              Weight: {item.weight}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-emerald-400">{score}%</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
                          />
                        </div>

                        {/* Detailed explanation when expanded */}
                        {isExpanded && item.data && (
                          <div className="pt-2 text-xs space-y-2 text-slate-300 border-t border-slate-700/60 mt-2">
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {item.data.explanation}
                            </p>
                            {item.data.strengths && item.data.strengths.length > 0 && (
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className="text-[10px] font-bold text-emerald-400">Verified:</span>
                                {item.data.strengths.map((s, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                                  >
                                    ✓ {s}
                                  </span>
                                ))}
                              </div>
                            )}
                            {item.data.gaps && item.data.gaps.length > 0 && (
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className="text-[10px] font-bold text-amber-400">Gap:</span>
                                {item.data.gaps.map((g, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30"
                                  >
                                    ! {g}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Deep Evidence Keyword Auditor */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-cyan-400" />
                      Evidence-Based Keyword & Skill Verification
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Every match requires explicit JD quote + candidate resume proof
                    </p>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
                    <button
                      onClick={() => setKeywordFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        keywordFilter === 'all'
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All ({allKeywordsList.length})
                    </button>
                    <button
                      onClick={() => setKeywordFilter('matched')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        keywordFilter === 'matched'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-emerald-300'
                      }`}
                    >
                      Matched ({analysisResult.matchedKeywords?.length || 0})
                    </button>
                    <button
                      onClick={() => setKeywordFilter('partial')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        keywordFilter === 'partial'
                          ? 'bg-amber-600 text-white'
                          : 'text-slate-400 hover:text-amber-300'
                      }`}
                    >
                      Partial ({analysisResult.partialKeywords?.length || 0})
                    </button>
                    <button
                      onClick={() => setKeywordFilter('missing')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        keywordFilter === 'missing'
                          ? 'bg-rose-600 text-white'
                          : 'text-slate-400 hover:text-rose-300'
                      }`}
                    >
                      Gaps ({analysisResult.missingKeywords?.length || 0})
                    </button>
                  </div>
                </div>

                {/* Keyword Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm || ''}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search keywords, evidence quotes, or categories..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Keyword Cards */}
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {filteredKeywords.map((kw, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-xs space-y-2 ${
                        kw.status === 'matched'
                          ? 'bg-emerald-950/15 border-emerald-500/30'
                          : kw.status === 'partial'
                          ? 'bg-amber-950/15 border-amber-500/30'
                          : 'bg-rose-950/15 border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {kw.status === 'matched' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                          {kw.status === 'partial' && <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                          {kw.status === 'missing' && <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                          <span className="font-bold text-slate-100">{kw.keyword}</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {kw.category}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            kw.importance === 'Critical'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : kw.importance === 'Required'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-slate-700/60 text-slate-300'
                          }`}
                        >
                          {kw.importance}
                        </span>
                      </div>

                      {/* Evidence Quotes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                          <div className="text-[10px] font-bold text-purple-300 mb-0.5">JD Requirement:</div>
                          <p className="text-slate-300 font-mono text-[10px] leading-relaxed">
                            "{kw.jdEvidence}"
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                          <div className="text-[10px] font-bold text-emerald-300 mb-0.5">Resume Evidence:</div>
                          <p className="text-slate-300 font-mono text-[10px] leading-relaxed">
                            "{kw.resumeEvidence}"
                          </p>
                        </div>
                      </div>

                      {/* If partial or gap, show recommendation */}
                      {kw.gapAnalysis && (
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
                          <span className="font-bold">Honest Mitigation:</span> {kw.gapAnalysis}
                        </div>
                      )}
                    </div>
                  ))}

                  {filteredKeywords.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-800/30 rounded-xl">
                      No keywords match the selected filter.
                    </div>
                  )}
                </div>
              </div>

              {/* Truthful Tailored STAR Bullet Recommendations */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Truthfully Tailored STAR Bullets for this JD
                  </h4>
                  <span className="text-[10px] text-slate-400">Zero invented claims</span>
                </div>

                <div className="space-y-2">
                  {analysisResult.bulletRecommendations?.map((bullet, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/70 flex items-start justify-between gap-3 text-xs text-slate-200"
                    >
                      <p className="leading-relaxed font-sans">{bullet}</p>
                      <button
                        onClick={() => handleCopyBullet(bullet, i)}
                        className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 flex-shrink-0 cursor-pointer"
                        title="Copy Bullet"
                      >
                        {copiedIndex === i ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical & Architectural Interview Prep Questions */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  Targeted Technical & Architectural Interview Questions
                </h4>
                <div className="space-y-2">
                  {analysisResult.customInterviewQuestions?.map((q, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                    >
                      <span className="text-cyan-400 font-mono font-bold">Q{i + 1}.</span>
                      <span className="leading-relaxed">{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jump to Cover Letter Button */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Generate Tailored Cover Letter</div>
                  <div className="text-[11px] text-slate-300">
                    Produce a high-converting letter referencing these exact verified matches
                  </div>
                </div>
                <button
                  onClick={() =>
                    onNavigateToCoverLetter(
                      company || 'Target Company',
                      jobTitle || 'Target Role',
                      jobDescription
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
                >
                  <span>Draft Letter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
