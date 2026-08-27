import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Building2,
  MapPin,
  DollarSign,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  Globe,
  Briefcase,
  Layers,
  ChevronRight,
  TrendingUp,
  Tag,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Job, UserProfile } from '../types';

interface DiscoveredJob {
  id: string;
  title: string;
  company: string;
  location: string;
  workType: 'Remote' | 'Hybrid' | 'Onsite';
  salary: string;
  matchScore: number;
  matchKeyHighlights: string[];
  tier: 'Dream' | 'Target' | 'Safety';
  source: string;
  postedDate: string;
  description: string;
  mustHaveSkills: string[];
  preferredSkills: string[];
  url?: string;
}

interface JobDiscoveryViewProps {
  userProfile?: UserProfile;
  onImportJobToPipeline?: (job: Partial<Job>) => void;
  onAnalyzeJobInJDAnalyzer?: (job: Partial<Job>) => void;
}

export const JobDiscoveryView: React.FC<JobDiscoveryViewProps> = ({
  userProfile,
  onImportJobToPipeline,
  onAnalyzeJobInJDAnalyzer,
}) => {
  const [targetRole, setTargetRole] = useState(userProfile?.title || 'Senior Full-Stack & AI Systems Engineer');
  const [targetLocation, setTargetLocation] = useState('Remote (US/Global)');
  const [workTypeFilter, setWorkTypeFilter] = useState<'All' | 'Remote' | 'Hybrid' | 'Onsite'>('All');
  const [tierFilter, setTierFilter] = useState<'All' | 'Dream' | 'Target' | 'Safety'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importedJobIds, setImportedJobIds] = useState<Set<string>>(new Set());

  const [discoveredJobs, setDiscoveredJobs] = useState<DiscoveredJob[]>([
    {
      id: 'hunter-1',
      title: 'Senior Full-Stack AI Engineer',
      company: 'Stripe',
      location: 'Remote (US/Global)',
      workType: 'Remote',
      salary: '$185,000 - $235,000 + Equity',
      matchScore: 96,
      matchKeyHighlights: ['TypeScript & React 19', 'High-Throughput APIs', 'Gemini & LLM Pipelines'],
      tier: 'Dream',
      source: 'Company Career Page',
      postedDate: '2 days ago',
      description: 'Stripe is looking for a Senior Full-Stack Engineer to architect next-generation AI payment intelligence and automated merchant onboarding systems.',
      mustHaveSkills: ['TypeScript', 'React', 'Node.js', 'Distributed Systems'],
      preferredSkills: ['LLM Integrations', 'PostgreSQL', 'Kafka'],
      url: 'https://stripe.com/jobs',
    },
    {
      id: 'hunter-2',
      title: 'Staff Frontend Architect',
      company: 'Datadog',
      location: 'San Francisco, CA / Remote',
      workType: 'Hybrid',
      salary: '$190,000 - $240,000',
      matchScore: 94,
      matchKeyHighlights: ['React 19 & TypeScript', 'Performance Tuning', 'Telemetry Visualizations'],
      tier: 'Dream',
      source: 'Direct Referral Network',
      postedDate: 'Today',
      description: 'Lead UI engineering for high-density observability dashboards processing millions of events per second with sub-100ms render budgets.',
      mustHaveSkills: ['React', 'TypeScript', 'State Management', 'Web Performance'],
      preferredSkills: ['WebSockets', 'Canvas / D3'],
      url: 'https://datadoghq.com/careers',
    },
    {
      id: 'hunter-3',
      title: 'Lead AI Application Engineer',
      company: 'Vercel',
      location: 'Remote',
      workType: 'Remote',
      salary: '$175,000 - $225,000 + RSUs',
      matchScore: 92,
      matchKeyHighlights: ['Next.js & Server Actions', 'AI SDK', 'Edge Compute'],
      tier: 'Target',
      source: 'LinkedIn Hidden Listing',
      postedDate: '1 day ago',
      description: 'Build delightful developer tooling, AI integrations, and real-time collaborative workspace primitives at global scale.',
      mustHaveSkills: ['TypeScript', 'Node.js', 'AI/LLM Pipelines'],
      preferredSkills: ['Vite', 'Serverless', 'Tailwind CSS'],
      url: 'https://vercel.com/careers',
    },
    {
      id: 'hunter-4',
      title: 'Senior Platform Engineer',
      company: 'Linear',
      location: 'Remote (US/EU)',
      workType: 'Remote',
      salary: '$180,000 - $220,000 + 0.15% Equity',
      matchScore: 91,
      matchKeyHighlights: ['Fast Local State Sync', 'React/TypeScript', 'Offline-First'],
      tier: 'Dream',
      source: 'Company Career Page',
      postedDate: '3 days ago',
      description: 'Craft high-performance, keyboard-first issue tracking and project planning experiences with offline-first synchronization.',
      mustHaveSkills: ['TypeScript', 'React', 'State Management', 'SQL'],
      preferredSkills: ['CRDTs', 'IndexedDB', 'WebSockets'],
      url: 'https://linear.app/careers',
    },
    {
      id: 'hunter-5',
      title: 'Senior Full-Stack Cloud Engineer',
      company: 'Anthropic',
      location: 'San Francisco, CA (Hybrid)',
      workType: 'Hybrid',
      salary: '$200,000 - $260,000 + Equity',
      matchScore: 89,
      matchKeyHighlights: ['Full-Stack Reliability', 'Python & TypeScript', 'Safety Systems'],
      tier: 'Dream',
      source: 'Verified Portal',
      postedDate: '4 days ago',
      description: 'Build mission-critical interfaces and internal evaluation harnesses for next-generation generative intelligence models.',
      mustHaveSkills: ['TypeScript', 'Python', 'Docker', 'PostgreSQL'],
      preferredSkills: ['Kubernetes', 'Cloud Infrastructure'],
      url: 'https://anthropic.com/careers',
    },
  ]);

  const handleFetchAiJobs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/job-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          location: targetLocation,
          workType: workTypeFilter !== 'All' ? workTypeFilter : undefined,
          skills: userProfile?.coreSkills || ['TypeScript', 'React', 'Node.js', 'AI/LLMs'],
          minSalary: userProfile?.targetSalary || '$160,000',
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.jobs) && data.jobs.length > 0) {
        setDiscoveredJobs(data.jobs);
      }
    } catch (err) {
      console.error('Job discovery fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = (job: DiscoveredJob) => {
    setImportedJobIds((prev) => new Set(prev).add(job.id));
    if (onImportJobToPipeline) {
      onImportJobToPipeline({
        title: job.title,
        company: job.company,
        location: job.location,
        workType: job.workType,
        salary: job.salary,
        matchScore: job.matchScore,
        matchKeyHighlights: job.matchKeyHighlights,
        tier: job.tier,
        source: job.source,
        description: job.description,
        status: 'saved',
        url: job.url,
      });
    }
  };

  const handleAnalyze = (job: DiscoveredJob) => {
    if (onAnalyzeJobInJDAnalyzer) {
      onAnalyzeJobInJDAnalyzer({
        title: job.title,
        company: job.company,
        location: job.location,
        workType: job.workType,
        salary: job.salary,
        matchScore: job.matchScore,
        description: `${job.description}\n\nKey Requirements:\n${job.mustHaveSkills.map((s) => `• ${s}`).join('\n')}`,
        url: job.url,
      });
    }
  };

  const filteredJobs = discoveredJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.mustHaveSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesWorkType = workTypeFilter === 'All' || job.workType === workTypeFilter;
    const matchesTier = tierFilter === 'All' || job.tier === tierFilter;
    return matchesSearch && matchesWorkType && matchesTier;
  });

  return (
    <div id="job-discovery-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Hunter AI Agent
              </span>
              <span className="text-xs text-slate-400">• Deep Career Pages & Hidden Listings</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">AI Job Discovery & Market Radar</h1>
            <p className="text-sm text-slate-600 mt-1">
              Continuously scans company career portals and matches requirements against your verified skills profile.
            </p>
          </div>

          <button
            id="run-hunter-discovery-btn"
            onClick={handleFetchAiJobs}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shrink-0 shadow-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scanning Portals...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Scan for New Matches</span>
              </>
            )}
          </button>
        </div>

        {/* Discovery Parameter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Target Title / Specialization</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Full-Stack AI Engineer"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Target Location / Geography</label>
            <input
              type="text"
              value={targetLocation}
              onChange={(e) => setTargetLocation(e.target.value)}
              placeholder="e.g. Remote (US) or San Francisco, CA"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <div className="flex items-end">
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 w-full">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Matching against your verified Master Resume skills.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by role, company, or tech..."
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-500 font-medium mr-1">Work Type:</span>
            {(['All', 'Remote', 'Hybrid', 'Onsite'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setWorkTypeFilter(type)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                  workTypeFilter === type
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}

            <span className="text-xs text-slate-500 font-medium ml-2 mr-1">Tier:</span>
            {(['All', 'Dream', 'Target', 'Safety'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                  tierFilter === tier
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Discovered Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.map((job) => {
          const isImported = importedJobIds.has(job.id);
          const tierColors = {
            Dream: 'bg-purple-50 text-purple-700 border-purple-200',
            Target: 'bg-blue-50 text-blue-700 border-blue-200',
            Safety: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          }[job.tier];

          return (
            <div
              key={job.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                      {job.company.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600">{job.company}</span>
                        <span className={`px-2 py-0.2 rounded-full text-[11px] font-semibold border ${tierColors}`}>
                          {job.tier}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{job.title}</h3>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1 text-sm font-bold text-blue-600">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{job.matchScore}% Match</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{job.postedDate}</span>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mb-3 font-medium">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.source}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                  {job.description}
                </p>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.mustHaveSkills.slice(0, 4).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.matchKeyHighlights?.[0] && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ {job.matchKeyHighlights[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 mt-2">
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors"
                  >
                    <span>View Listing</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => handleAnalyze(job)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    Audit in JD Analyzer
                  </button>

                  <button
                    onClick={() => handleImport(job)}
                    disabled={isImported}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isImported
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    }`}
                  >
                    {isImported ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Saved to Pipeline</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Save to Pipeline</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
