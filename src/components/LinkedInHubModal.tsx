import React, { useState } from 'react';
import {
  Linkedin,
  X,
  Sparkles,
  Search,
  Send,
  Copy,
  Check,
  ExternalLink,
  Users,
  Building,
  Briefcase,
  FileText,
  MessageSquare,
  Shield,
  ArrowRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { Contact, Job } from '../types';

export type LinkedInToolType =
  | 'import_url'
  | 'hiring_manager_finder'
  | 'outreach_sequence'
  | 'inmail_crafter'
  | 'boolean_builder'
  | 'profile_optimizer';

interface LinkedInHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTool?: LinkedInToolType;
  jobs?: Job[];
  contacts?: Contact[];
  onSaveJob?: (jobData: Partial<Job>) => void;
  onSaveContact?: (contactData: Partial<Contact>) => void;
}

export const LinkedInHubModal: React.FC<LinkedInHubModalProps> = ({
  isOpen,
  onClose,
  initialTool = 'import_url',
  jobs = [],
  contacts = [],
  onSaveJob,
  onSaveContact,
}) => {
  const [activeTool, setActiveTool] = useState<LinkedInToolType>(initialTool);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Tool 1: URL Import State
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Tool 2: Hiring Manager Finder State
  const [targetCompany, setTargetCompany] = useState('Google');
  const [targetRoleCategory, setTargetRoleCategory] = useState('Engineering / Software');
  const [targetLocation, setTargetLocation] = useState('United States / Remote');

  // Tool 3: 3-Step Sequence State
  const [candidateName, setCandidateName] = useState('Kavin');
  const [candidateRole, setCandidateRole] = useState('Senior AI Platform Engineer');
  const [recruiterName, setRecruiterName] = useState('Alex');
  const [sequenceCompany, setSequenceCompany] = useState('Datadog');
  const [selectedJobTitle, setSelectedJobTitle] = useState('Senior Full Stack Engineer');

  // Tool 4: InMail Crafter State
  const [inmailTone, setInmailTone] = useState<'Executive' | 'Casual' | 'High Impact'>('High Impact');
  const [inmailValueProp, setInmailValueProp] = useState('Built real-time GenAI orchestration engines scaling to 50k+ daily queries.');

  // Tool 5: Boolean X-Ray State
  const [booleanKeywords, setBooleanKeywords] = useState('"Engineering Manager" OR "Tech Lead" OR "Head of Engineering"');
  const [booleanCompany, setBooleanCompany] = useState('Stripe');
  const [booleanLocation, setBooleanLocation] = useState('Remote OR "San Francisco"');

  // Tool 6: Profile Optimizer State
  const [profileHeadline, setProfileHeadline] = useState('Senior Full-Stack Engineer | React 19 • TypeScript • GenAI Systems | Ex-Fintech Lead');
  const [optimizedHeadlines, setOptimizedHeadlines] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. Simulate LinkedIn Job / Profile URL Parsing
  const handleParseLinkedInUrl = () => {
    if (!importUrl.trim()) return;
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      const isProfile = importUrl.includes('/in/');
      if (isProfile) {
        setImportResult({
          type: 'profile',
          name: 'Sarah Jenkins',
          title: 'Staff Technical Recruiter @ Snowflake',
          company: 'Snowflake',
          location: 'San Mateo, CA (Hybrid)',
          notes: 'Specializes in Distributed Systems & AI Infrastructure hiring.',
        });
      } else {
        setImportResult({
          type: 'job',
          title: 'Senior AI Platform Engineer',
          company: 'Datadog',
          location: 'New York, NY (Hybrid / Remote)',
          salary: '$185,000 - $225,000',
          matchScore: 94,
          tags: ['React 19', 'TypeScript', 'Node.js', 'LLM Agents', 'Distributed Systems'],
          summary: 'Leading development of next-generation observability telemetry tools powered by Gemini models and cloud-native microservices.',
        });
      }
    }, 900);
  };

  // 2. Generate Google / LinkedIn Boolean Search
  const googleXRayQuery = `site:linkedin.com/in/ (${booleanKeywords}) "${booleanCompany}" (${booleanLocation}) -intitle:"profiles"`;
  const linkedinDirectUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
    `${booleanCompany} ${booleanKeywords.replace(/"/g, '')}`
  )}`;

  // 3. 3-Step Sequence Templates
  const sequenceStep1 = `Hi ${recruiterName}, noticed your team at ${sequenceCompany} is building exceptional developer tools. As a ${candidateRole} passionate about robust UI architecture & high-throughput systems, I'd love to connect and follow your team's engineering growth!`;
  
  const sequenceStep2 = `Thanks for connecting, ${recruiterName}! I saw the ${selectedJobTitle} opening at ${sequenceCompany}. In my recent projects, I architected scalable full-stack React/Node systems with sub-50ms latency. Would love to share a 1-page technical summary if helpful for the hiring team!`;

  const sequenceStep3 = `Hi ${recruiterName}, hope you're having a productive week! Following up on the ${selectedJobTitle} role at ${sequenceCompany}. I've formally submitted my application (Ref #KV-${Math.floor(Math.random()*8999+1000)}). If you have 5 minutes, I'd welcome the chance to introduce myself directly. Thanks again!`;

  // 4. InMail Pitch
  const inmailSubject = `Mutual Interest: ${candidateRole} exploring ${selectedJobTitle} at ${sequenceCompany}`;
  const inmailBody = `Hi ${recruiterName},\n\nI’ve been following ${sequenceCompany}'s recent engineering milestones and love the focus on developer velocity. With my background as a ${candidateRole}, ${inmailValueProp.toLowerCase()}.\n\nI’d love to explore how my hands-on background in full-stack architecture can add immediate firepower to your current sprints. Open to a brief 10-minute sync this Thursday or Friday?\n\nBest regards,\n${candidateName}\nambigapathikavin2@gmail.com`;

  // 6. Profile Headline Optimization
  const handleOptimizeProfile = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setOptimizedHeadlines([
        `🚀 Senior AI Platform Engineer @ Enterprise | React 19 • TypeScript • GenAI Pipelines | Scaling Distributed Web Apps to Millions`,
        `💡 Full Stack Tech Lead | Ex-Fintech | Building Autonomous Agent Hubs & High-Performance UI (TypeScript, Node, Cloud Run)`,
        `⚡ Senior Software Engineer | React, Next.js, Node.js, Gemini API | Passionate about Production Systems Architecture & UX Craft`,
      ]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center shadow-xs">
              <Linkedin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">LinkedIn Power Suite</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  Unified Hub
                </span>
              </div>
              <p className="text-xs text-slate-500">
                All LinkedIn outreach, URL scrapers, boolean searches, and InMail crafters in one place.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Navigation Bar */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-200 bg-white overflow-x-auto">
          {[
            { id: 'import_url', label: '1-Click URL Import', icon: Briefcase },
            { id: 'hiring_manager_finder', label: 'Hiring Manager Finder', icon: Users },
            { id: 'outreach_sequence', label: '3-Step Sequence', icon: Send },
            { id: 'inmail_crafter', label: 'InMail Crafter', icon: MessageSquare },
            { id: 'boolean_builder', label: 'Boolean X-Ray', icon: Search },
            { id: 'profile_optimizer', label: 'Headline Optimizer', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTool === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTool(tab.id as LinkedInToolType)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TOOL 1: URL IMPORT */}
          {activeTool === 'import_url' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-900 leading-relaxed">
                  Paste any <strong>LinkedIn Job Posting URL</strong> or <strong>LinkedIn Recruiter Profile URL</strong>. Our extractor captures job requirements, company profiles, and hiring manager records directly into your tracker.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  LinkedIn URL (Job or Profile)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Linkedin className="w-4 h-4 text-[#0A66C2] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://www.linkedin.com/jobs/view/..."
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleParseLinkedInUrl}
                    disabled={isImporting || !importUrl.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Parsing...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Extract & Ingest</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sample Quick Links */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Quick Test Examples:</span>
                <button
                  onClick={() => {
                    setImportUrl('https://www.linkedin.com/jobs/view/4159827391');
                  }}
                  className="text-blue-600 hover:underline"
                >
                  [Sample Job Link]
                </button>
                <span>•</span>
                <button
                  onClick={() => {
                    setImportUrl('https://www.linkedin.com/in/sarah-jenkins-tech-talent');
                  }}
                  className="text-blue-600 hover:underline"
                >
                  [Sample Recruiter Link]
                </button>
              </div>

              {/* Parsed Result Card */}
              {importResult && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">
                        {importResult.type === 'job' ? 'Extracted Job Record' : 'Extracted Recruiter Profile'}
                      </span>
                    </div>
                    {importResult.matchScore && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {importResult.matchScore}% Match
                      </span>
                    )}
                  </div>

                  {importResult.type === 'job' ? (
                    <div className="space-y-2.5 text-xs text-slate-700">
                      <div className="text-sm font-bold text-slate-900">{importResult.title}</div>
                      <div className="flex items-center gap-3 text-slate-500">
                        <span>🏢 {importResult.company}</span>
                        <span>📍 {importResult.location}</span>
                        <span>💰 {importResult.salary}</span>
                      </div>
                      <p className="text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                        {importResult.summary}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {importResult.tags.map((t: string) => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium text-[11px] border border-blue-200">
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="pt-3 flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            if (onSaveJob) {
                              onSaveJob({
                                title: importResult.title,
                                company: importResult.company,
                                location: importResult.location,
                                salary: importResult.salary,
                                matchScore: importResult.matchScore,
                                description: importResult.summary,
                                tags: importResult.tags,
                                source: 'LinkedIn Ingest',
                                status: 'saved',
                              });
                            }
                            onClose();
                          }}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save to My Jobs Pipeline</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-xs text-slate-700">
                      <div className="text-sm font-bold text-slate-900">{importResult.name}</div>
                      <div className="text-slate-500">{importResult.title}</div>
                      <div className="text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                        {importResult.notes}
                      </div>
                      <div className="pt-3 flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            if (onSaveContact) {
                              onSaveContact({
                                name: importResult.name,
                                role: importResult.title,
                                company: importResult.company,
                                notes: importResult.notes,
                                relationship: 'Recruiter',
                                status: 'Warm',
                              });
                            }
                            onClose();
                          }}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Add to Contacts Network</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TOOL 2: HIRING MANAGER FINDER */}
          {activeTool === 'hiring_manager_finder' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                <Users className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-900 leading-relaxed">
                  Identify specific Engineering Managers, VP of Engineering, and Technical Recruiters actively hiring at your target company with 1-click targeted searches.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role Discipline</label>
                  <select
                    value={targetRoleCategory}
                    onChange={(e) => setTargetRoleCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  >
                    <option value="Engineering / Software">Engineering / Software</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                    <option value="Product Management">Product Management</option>
                    <option value="Talent & Technical Recruiting">Talent & Technical Recruiting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={targetLocation}
                    onChange={(e) => setTargetLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Direct Action Links */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Instant LinkedIn Search Shortcuts for {targetCompany}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      title: '🎯 Direct Hiring Managers',
                      desc: `Engineering Managers, Directors & VP of Tech at ${targetCompany}`,
                      url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
                        `"${targetCompany}" ("Engineering Manager" OR "Director of Engineering" OR "Head of Engineering")`
                      )}`,
                    },
                    {
                      title: '⚡ Technical Recruiters & Leads',
                      desc: `In-house Talent Acquisition Partners at ${targetCompany}`,
                      url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
                        `"${targetCompany}" ("Technical Recruiter" OR "Talent Partner" OR "Lead Recruiter")`
                      )}`,
                    },
                    {
                      title: '👥 Team Peers & Senior Engineers',
                      desc: `Staff / Principal Engineers working in ${targetCompany}`,
                      url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
                        `"${targetCompany}" ("Senior Software Engineer" OR "Staff Engineer" OR "AI Engineer")`
                      )}`,
                    },
                    {
                      title: '🎓 University & Alumni Network',
                      desc: `Alumni from your background working at ${targetCompany}`,
                      url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
                        `"${targetCompany}" "Engineering"`
                      )}`,
                    },
                  ].map((searchCard, idx) => (
                    <a
                      key={idx}
                      href={searchCard.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all flex items-start justify-between group"
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 flex items-center gap-1.5">
                          <span>{searchCard.title}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                        </div>
                        <p className="text-[11px] text-slate-500">{searchCard.desc}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TOOL 3: 3-STEP OUTREACH SEQUENCE */}
          {activeTool === 'outreach_sequence' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                <Send className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-900 leading-relaxed">
                  Proven 3-message sequence adhering to LinkedIn's 300-character connection limit and high-conversion follow-up timing.
                </p>
              </div>

              {/* Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Recruiter Name</label>
                  <input
                    type="text"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={sequenceCompany}
                    onChange={(e) => setSequenceCompany(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Job Title</label>
                  <input
                    type="text"
                    value={selectedJobTitle}
                    onChange={(e) => setSelectedJobTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Message Cards */}
              <div className="space-y-4 pt-2">
                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                        1
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        Step 1: 300-Char Connection Note (Pre-Connection)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {sequenceStep1.length}/300 chars
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(sequenceStep1, 'step1')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
                    >
                      {copiedKey === 'step1' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'step1' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-sans whitespace-pre-wrap">
                    {sequenceStep1}
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                        2
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        Step 2: Value-Add Message (Send 24-48 hrs after acceptance)
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(sequenceStep2, 'step2')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
                    >
                      {copiedKey === 'step2' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'step2' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-sans whitespace-pre-wrap">
                    {sequenceStep2}
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                        3
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        Step 3: Post-Application Referral Check-In (Day 5)
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(sequenceStep3, 'step3')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
                    >
                      {copiedKey === 'step3' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'step3' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-sans whitespace-pre-wrap">
                    {sequenceStep3}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TOOL 4: INMAIL CRAFTER */}
          {activeTool === 'inmail_crafter' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-900 leading-relaxed">
                  Draft executive-level InMail pitches with custom value propositions, crisp subject lines, and low-friction calls to action.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Key Value Proposition</label>
                  <input
                    type="text"
                    value={inmailValueProp}
                    onChange={(e) => setInmailValueProp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    placeholder="e.g. Built real-time GenAI orchestration engines scaling to 50k+ daily queries"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-900">Generated InMail Pitch</span>
                    <button
                      onClick={() => copyToClipboard(`Subject: ${inmailSubject}\n\n${inmailBody}`, 'inmail')}
                      className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      {copiedKey === 'inmail' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'inmail' ? 'Copied to Clipboard' : 'Copy Entire InMail'}</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">Subject: </span>
                      <strong className="text-slate-900">{inmailSubject}</strong>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                      {inmailBody}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TOOL 5: BOOLEAN X-RAY BUILDER */}
          {activeTool === 'boolean_builder' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                <Search className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-900 leading-relaxed">
                  Bypass LinkedIn commercial search limits using <strong>Google X-Ray queries</strong> to directly index hiring managers, team leads, and unadvertised jobs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Company</label>
                  <input
                    type="text"
                    value={booleanCompany}
                    onChange={(e) => setBooleanCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Titles (Boolean OR)</label>
                  <input
                    type="text"
                    value={booleanKeywords}
                    onChange={(e) => setBooleanKeywords(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location Filter</label>
                  <input
                    type="text"
                    value={booleanLocation}
                    onChange={(e) => setBooleanLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Generated Query Box */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Google X-Ray String (Copy & Paste to Google):</span>
                  <button
                    onClick={() => copyToClipboard(googleXRayQuery, 'xray')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 border border-slate-700"
                  >
                    {copiedKey === 'xray' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'xray' ? 'Copied' : 'Copy Query'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs break-all select-all">
                  {googleXRayQuery}
                </div>
                <div className="flex items-center justify-between pt-1 text-xs">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(googleXRayQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Run X-Ray on Google Search</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={linkedinDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Open in LinkedIn Search</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TOOL 6: PROFILE HEADLINE OPTIMIZER */}
          {activeTool === 'profile_optimizer' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-900 leading-relaxed">
                  Optimize your LinkedIn Headline with recruiter keyword indexing to rank higher in recruiter LinkedIn Recruiter search filters.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Current Headline</label>
                <input
                  type="text"
                  value={profileHeadline}
                  onChange={(e) => setProfileHeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleOptimizeProfile}
                  disabled={isOptimizing}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isOptimizing ? 'Analyzing Recruiter Keywords...' : 'Generate High-Rank Headlines'}</span>
                </button>
              </div>

              {optimizedHeadlines.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Recommended High-Conversion Headlines
                  </h4>
                  {optimizedHeadlines.map((h, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">{h}</p>
                      <button
                        onClick={() => copyToClipboard(h, `h-${i}`)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 shrink-0 flex items-center gap-1"
                      >
                        {copiedKey === `h-${i}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === `h-${i}` ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Encrypted local workspace • Direct LinkedIn URL sync</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
