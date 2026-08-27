import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Sliders,
  RefreshCw,
  Copy,
  Check,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { ResumeVersion } from '../types';

interface AtsCheckerViewProps {
  resumes?: ResumeVersion[];
}

export const AtsCheckerView: React.FC<AtsCheckerViewProps> = ({ resumes = [] }) => {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id || 'custom');
  const [resumeText, setResumeText] = useState(
    resumes[0]?.rawText ||
      `Ambigapathi
Senior Full-Stack & AI Systems Engineer
ambigapathikavin2@gmail.com | +1 (415) 890-3412 | San Francisco, CA | linkedin.com/in/kavin

PROFESSIONAL SUMMARY
Accomplished Senior Full-Stack Engineer with 6+ years of verified production experience architecting scalable React/TypeScript web applications, distributed Node.js microservices, and AI-enabled workflows. Proven track record improving application latency by 45% and leading high-velocity engineering pods.

CORE TECHNICAL SKILLS
Languages & Frameworks: TypeScript, JavaScript (ES6+), React 19, Node.js, Next.js, Python, Tailwind CSS, Express
Databases & Cloud: PostgreSQL, Redis, Google Cloud Platform (Cloud Run), Docker, REST APIs, GraphQL
AI & Tooling: Gemini API, LLM Prompt Engineering, Vector Search, Git, CI/CD GitHub Actions, Jest

PROFESSIONAL EXPERIENCE
Senior Full-Stack Engineer | Enterprise Cloud Platform | 2022 - Present
• Spearheaded frontend architecture for multi-tenant SaaS analytics platform using React 19 and TypeScript, reducing client-side bundle size by 38% and supporting 150,000+ daily active users.
• Architected resilient asynchronous data processing pipelines with Node.js and PostgreSQL, decreasing average API response latency from 480ms to 85ms under peak load.
• Integrated Gemini GenAI models with server-side proxy validation, automating 40% of manual customer report generation with zero data leaks.
• Mentored 5 mid-level engineers and instituted automated end-to-end testing, increasing test coverage from 62% to 94%.

Full-Stack Developer | Innovative Tech Studio | 2019 - 2022
• Developed and deployed 12+ responsive web applications using React, TypeScript, and Node.js with 99.9% uptime SLA.
• Optimized relational database queries and indexed hot data in Redis, cutting query execution times by 55%.
• Engineered CI/CD deployment pipelines on GCP Cloud Run, accelerating release cycles from bi-weekly to daily.

EDUCATION & CERTIFICATIONS
Bachelor of Science in Computer Science | 2018
Google Cloud Certified Professional Cloud Developer (GCP)`
  );

  const [targetJd, setTargetJd] = useState(
    `Target Role: Senior Full-Stack Engineer
Requirements:
• 5+ years of experience with TypeScript, React, and Node.js
• Deep understanding of distributed architectures, PostgreSQL, and REST API design
• Experience with cloud deployments (Docker, GCP or AWS) and CI/CD pipelines
• Familiarity with AI/LLM integrations is a strong plus
• Strong track record of quantifying performance improvements`
  );

  const [isAuditing, setIsAuditing] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const [auditResult, setAuditResult] = useState({
    overallAtsScore: 93,
    passStatus: 'Passed - High Interview Likelihood',
    formatScore: 96,
    contentScore: 91,
    keywordDensityScore: 92,
    quantifiedMetricsScore: 94,
    criticalChecks: [
      { label: 'Standard Section Headers', passed: true, detail: 'Summary, Skills, Experience, Education, Certifications accurately formatted.' },
      { label: 'ATS Parsable Contact Info', passed: true, detail: 'Email, phone, location, and LinkedIn links are clear.' },
      { label: 'Quantified Impact Metrics', passed: true, detail: '94% of bullet points contain quantifiable numbers, percentages, or latencies.' },
      { label: 'Technical Keyword Match', passed: true, detail: 'Strong alignment with target role prerequisites (TypeScript, React, Node, Cloud).' },
      { label: 'Layout Density & Font Structure', passed: true, detail: 'Standard single-column flow with no complex parsing traps.' },
    ],
    matchedKeywords: [
      'TypeScript',
      'React 19',
      'Node.js',
      'PostgreSQL',
      'Redis',
      'Docker',
      'GCP',
      'REST APIs',
      'CI/CD',
      'Gemini API',
    ],
    missingHighValueKeywords: ['System Architecture', 'Microservices', 'Distributed Caching'],
    actionableRecommendations: [
      'Include explicit mentions of "Distributed Systems Architecture" in your summary or first bullet point.',
      'Highlight cross-functional collaboration and agile sprint ownership.',
      'Ensure all date formats follow standard MMM YYYY or YYYY - Present format consistently.',
    ],
  });

  const handleSelectResume = (id: string) => {
    setSelectedResumeId(id);
    const found = resumes.find((r) => r.id === id);
    if (found && found.rawText) {
      setResumeText(found.rawText);
    }
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/gemini/ats-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          targetJdText: targetJd,
          role: 'Senior Full-Stack Engineer',
          company: 'Target Tech Company',
        }),
      });
      const data = await res.json();
      if (data.success && data.audit) {
        setAuditResult(data.audit);
      }
    } catch (err) {
      console.error('ATS audit error:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div id="ats-checker-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Auditor AI Agent
              </span>
              <span className="text-xs text-slate-400">• ATS Compliance & Keyword Scanner</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">ATS Resume Checker & Keyword Gap Audit</h1>
            <p className="text-sm text-slate-600 mt-1">
              Verify ATS parsability, identify missing high-value keywords, and audit quantified impact metrics before submitting applications.
            </p>
          </div>

          <button
            id="run-ats-audit-btn"
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shrink-0 shadow-xs"
          >
            {isAuditing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Auditing ATS Parsability...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Run Full ATS Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Score Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Overall ATS Score</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-slate-900">{auditResult.overallAtsScore}</span>
            <span className="text-xs font-medium text-slate-400">/ 100</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-2">
            {auditResult.passStatus}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Structure & Format</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900">{auditResult.formatScore}%</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2">Standard headers detected</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Keyword Alignment</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900">{auditResult.keywordDensityScore}%</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2">{auditResult.matchedKeywords.length} verified matches</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Quantified Metrics</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900">{auditResult.quantifiedMetricsScore}%</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-2">Strong %, $, and numbers</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Content Quality</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900">{auditResult.contentScore}%</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2">STAR phrasing verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input text editors (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Resume Content to Audit
              </label>
              {resumes.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Select Version:</span>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => handleSelectResume(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                    <option value="custom">Custom Text</option>
                  </select>
                </div>
              )}
            </div>

            <textarea
              rows={12}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white resize-y leading-relaxed"
              placeholder="Paste plain text resume content here..."
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Target Job Description (Optional - For Keyword Gap Matching)
            </label>
            <textarea
              rows={5}
              value={targetJd}
              onChange={(e) => setTargetJd(e.target.value)}
              className="w-full p-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white resize-y leading-relaxed"
              placeholder="Paste job description requirements to benchmark missing keywords..."
            />
          </div>
        </div>

        {/* Right Column: Detailed Audit Findings (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Critical Parsability Checks */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ATS Parsability Checklist</span>
            </h3>

            <div className="space-y-3">
              {auditResult.criticalChecks.map((check, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  {check.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{check.label}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{check.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Keyword Gaps & Matched */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Keyword Analysis</h3>

            <div className="mb-4">
              <div className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Matched Keywords ({auditResult.matchedKeywords.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {auditResult.matchedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 rounded border border-emerald-200"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {auditResult.missingHighValueKeywords.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Missing High-Value Keywords ({auditResult.missingHighValueKeywords.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {auditResult.missingHighValueKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-700 rounded border border-amber-200"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actionable Recommendations */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Actionable Recommendations</span>
            </h3>

            <div className="space-y-2.5">
              {auditResult.actionableRecommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
