import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Sparkles,
  MessageSquare,
  Copy,
  Check,
  Send,
  Sliders,
  Shield,
  HelpCircle,
  Briefcase,
  Layers,
  Award,
  Loader2,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { UserProfile } from '../types';

interface SalaryNegotiatorViewProps {
  userProfile?: UserProfile;
}

export const SalaryNegotiatorView: React.FC<SalaryNegotiatorViewProps> = ({ userProfile }) => {
  const [activeSubTab, setActiveSubTab] = useState<'benchmark' | 'counter-script' | 'pushback-simulator'>('benchmark');

  // Benchmark Form
  const [role, setRole] = useState(userProfile?.title || 'Senior Full-Stack Engineer');
  const [company, setCompany] = useState('Stripe');
  const [location, setLocation] = useState('San Francisco, CA / Remote');
  const [experienceYears, setExperienceYears] = useState(6);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  const [benchmarkData, setBenchmarkData] = useState({
    role: 'Senior Full-Stack Engineer',
    location: 'San Francisco, CA / Remote',
    company: 'Stripe',
    experienceYears: 6,
    currency: 'USD',
    p25: 165000,
    p50: 190000,
    p75: 220000,
    p90: 255000,
    equityRange: '$40,000 - $85,000 / year RSUs',
    signOnBonusRange: '$15,000 - $35,000',
    totalCompMedian: 250000,
    marketInsight:
      'Current tech market data indicates that candidates possessing combined full-stack and GenAI production experience command a 15-20% compensation premium over pure frontend or backend roles.',
    negotiationLeveragePoints: [
      'Base salary at Tier-1 companies has a strict internal grade band, whereas sign-on bonuses have high flexibility for one-time budget approvals.',
      'Requesting an accelerated 6-month performance review cycle guarantees an early raise checkpoint with zero downside to the recruiter.',
      'Equity refreshes can often be adjusted if you demonstrate competing timeline constraints or existing unvested grants.',
    ],
  });

  // Counter-Script Generator State
  const [currentOffer, setCurrentOffer] = useState('$175,000');
  const [targetOffer, setTargetOffer] = useState('$195,000');
  const [compType, setCompType] = useState('Base Salary + Sign-on Bonus');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const [generatedScript, setGeneratedScript] = useState({
    emailSubject: 'Excited about the offer - Senior Full-Stack Engineer at Stripe',
    emailBody: `Hi Sarah,

Thank you so much for extending the formal offer for the Senior Full-Stack Engineer role at Stripe. I am genuinely thrilled about the team's roadmap and the opportunity to make an immediate, high-leverage impact on your merchant onboarding and AI infrastructure.

After carefully reviewing the total compensation package against market benchmarks and my verified track record architecting high-throughput full-stack systems, I would love to explore aligning the base compensation closer to $195,000. Alternatively, if base salary bands have strict limits, bridging this through a $20,000 sign-on bonus or adjusted initial equity grant would make this an effortless decision for me.

If we can reach this target, I would be delighted to sign immediately and begin onboarding with the team.

Thank you again for your genuine partnership throughout the interview process. I look forward to your thoughts!

Warm regards,
Kavin`,
    phoneTalkingPoints: [
      'Reiterate sincere enthusiasm for the team culture and mission in the first 30 seconds.',
      'Anchor directly to $195,000 with calm, data-backed justification on your specialized delivery velocity.',
      'Offer flexible levers: "If base has a hard ceiling, we can bridge the delta via a sign-on bonus or additional initial equity."',
      'Close with a firm close commitment: "If we can solve for this, I am ready to sign today."',
    ],
    pushbackDefenses: [
      {
        objection: 'This is the absolute top of our band for this level.',
        rebuttal: 'I completely understand and respect internal equity. Would you have flexibility to bridge the difference through a one-time sign-on bonus or higher initial equity grant?',
      },
      {
        objection: 'We do not negotiate initial offers for this department.',
        rebuttal: 'I understand company policy. Because I am very eager to join, could we agree to an accelerated 6-month compensation review milestone in writing?',
      },
    ],
  });

  // Pushback Simulator State
  const [simulatorMessages, setSimulatorMessages] = useState<
    Array<{ sender: 'recruiter' | 'candidate'; text: string; time: string; analysis?: string }>
  >([
    {
      sender: 'recruiter',
      text: "Hi Kavin! The hiring manager and team were super impressed with your technical architecture interview. We'd love to extend an offer: $175k base salary with $35k/year in RSUs. We are really excited to have you join!",
      time: '10:00 AM',
    },
  ]);
  const [candidateInput, setCandidateInput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const handleRunBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const res = await fetch('/api/gemini/salary-negotiator/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, company, location, experienceYears }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setBenchmarkData(data.data);
      }
    } catch (err) {
      console.error('Benchmark fetch error:', err);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const handleGenerateCounterScript = async () => {
    setIsGeneratingScript(true);
    try {
      const res = await fetch('/api/gemini/salary-negotiator/generate-counter-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          company,
          currentOffer,
          targetOffer,
          compType,
        }),
      });
      const data = await res.json();
      if (data.success && data.script) {
        setGeneratedScript(data.script);
      }
    } catch (err) {
      console.error('Counter script error:', err);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleSendSimulatorMessage = async (textToSend?: string) => {
    const text = textToSend || candidateInput;
    if (!text.trim()) return;

    const newMessages = [
      ...simulatorMessages,
      { sender: 'candidate' as const, text, time: 'Just now' },
    ];
    setSimulatorMessages(newMessages);
    setCandidateInput('');
    setIsSimulating(true);

    try {
      const res = await fetch('/api/gemini/salary-negotiator/simulate-pushback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userResponse: text,
          negotiationHistory: newMessages.map((m) => `${m.sender.toUpperCase()}: ${m.text}`),
          role,
          company,
        }),
      });
      const data = await res.json();
      if (data.success && data.simulation) {
        setSimulatorMessages((prev) => [
          ...prev,
          {
            sender: 'recruiter' as const,
            text: data.simulation.recruiterReply,
            time: 'Just now',
            analysis: data.simulation.strategyAnalysis,
          },
        ]);
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(generatedScript.emailBody);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div id="salary-negotiator-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Negotiator AI Agent
              </span>
              <span className="text-xs text-slate-400">• Compensation Intelligence & Pushback Studio</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Salary Benchmarking & Negotiation Studio</h1>
            <p className="text-sm text-slate-600 mt-1">
              Maximize your total compensation using data-backed market percentiles, persuasive counter-offer scripts, and interactive recruiter simulations.
            </p>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setActiveSubTab('benchmark')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeSubTab === 'benchmark'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Market Benchmark
            </button>
            <button
              onClick={() => setActiveSubTab('counter-script')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeSubTab === 'counter-script'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Counter-Offer Script
            </button>
            <button
              onClick={() => setActiveSubTab('pushback-simulator')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeSubTab === 'pushback-simulator'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pushback Simulator
            </button>
          </div>
        </div>
      </div>

      {/* 1. BENCHMARK TAB */}
      {activeSubTab === 'benchmark' && (
        <div className="space-y-6">
          {/* Parameter Search Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleRunBenchmark}
                  disabled={isBenchmarking}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isBenchmarking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Pulling Bands...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Benchmark Compensation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Percentile Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <span className="text-xs font-medium text-slate-500">25th Percentile (P25)</span>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                ${benchmarkData.p25.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Entry/Mid Senior baseline</span>
            </div>

            <div className="bg-white rounded-xl border border-blue-200 bg-blue-50/20 p-4">
              <span className="text-xs font-semibold text-blue-700">50th Percentile (Median)</span>
              <div className="text-2xl font-bold text-blue-900 mt-2">
                ${benchmarkData.p50.toLocaleString()}
              </div>
              <span className="text-[11px] text-blue-600 mt-1 block">Standard target base salary</span>
            </div>

            <div className="bg-white rounded-xl border border-emerald-200 bg-emerald-50/20 p-4">
              <span className="text-xs font-semibold text-emerald-700">75th Percentile (P75)</span>
              <div className="text-2xl font-bold text-emerald-900 mt-2">
                ${benchmarkData.p75.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-600 mt-1 block">Strong candidate target</span>
            </div>

            <div className="bg-white rounded-xl border border-purple-200 bg-purple-50/20 p-4">
              <span className="text-xs font-semibold text-purple-700">90th Percentile (Top Band)</span>
              <div className="text-2xl font-bold text-purple-900 mt-2">
                ${benchmarkData.p90.toLocaleString()}
              </div>
              <span className="text-[11px] text-purple-600 mt-1 block">Top-tier specialist band</span>
            </div>
          </div>

          {/* Breakdown & Market Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Total Compensation Levers</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Equity / RSU Grant</div>
                    <div className="text-[11px] text-slate-500">Annual recurring vesting schedule</div>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{benchmarkData.equityRange}</div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Sign-on Bonus</div>
                    <div className="text-[11px] text-slate-500">Year 1 one-time cash incentive</div>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{benchmarkData.signOnBonusRange}</div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
                  <div>
                    <div className="text-xs font-bold text-emerald-900">Median Total Comp (TC)</div>
                    <div className="text-[11px] text-emerald-700">Base + Equity + Bonus</div>
                  </div>
                  <div className="text-base font-bold text-emerald-900">
                    ${benchmarkData.totalCompMedian.toLocaleString()} / yr
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>High-Leverage Negotiation Angles</span>
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {benchmarkData.marketInsight}
              </p>

              <div className="space-y-2.5">
                {benchmarkData.negotiationLeveragePoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                    <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                      ✓
                    </span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. COUNTER-SCRIPT TAB */}
      {activeSubTab === 'counter-script' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Current Offer</label>
                <input
                  type="text"
                  value={currentOffer}
                  onChange={(e) => setCurrentOffer(e.target.value)}
                  placeholder="e.g. $175,000"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Desired</label>
                <input
                  type="text"
                  value={targetOffer}
                  onChange={(e) => setTargetOffer(e.target.value)}
                  placeholder="e.g. $195,000"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerateCounterScript}
                  disabled={isGeneratingScript}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isGeneratingScript ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Persuasive Script...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Counter Script</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Email Body (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Counter-Offer Email Draft
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 cursor-pointer"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'Copied!' : 'Copy Email'}</span>
                  </button>
                </div>

                <div className="text-xs font-medium text-slate-700 mb-2 pb-2 border-b border-slate-100">
                  <span className="text-slate-400">Subject: </span>
                  <span className="font-semibold text-slate-900">{generatedScript.emailSubject}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
                  {generatedScript.emailBody}
                </div>
              </div>
            </div>

            {/* Phone Talking Points & Rebuttals (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Verbal Call Talking Points</span>
                </h3>

                <div className="space-y-2.5">
                  {generatedScript.phoneTalkingPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span>Objection Defense Cheat Sheet</span>
                </h3>

                <div className="space-y-3">
                  {generatedScript.pushbackDefenses.map((def, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="text-[11px] font-semibold text-rose-700">
                        Objection: "{def.objection}"
                      </div>
                      <div className="text-xs text-slate-700 leading-relaxed">
                        <span className="font-semibold text-emerald-700">Rebuttal: </span>
                        {def.rebuttal}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PUSHBACK SIMULATOR TAB */}
      {activeSubTab === 'pushback-simulator' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recruiter Negotiation Roleplay</h3>
              <p className="text-xs text-slate-500">
                Practice countering objections in real time before your live phone call.
              </p>
            </div>

            <button
              onClick={() =>
                setSimulatorMessages([
                  {
                    sender: 'recruiter',
                    text: `Hi Kavin! We are so excited to extend an offer for ${role} at ${company}. The initial package is $175k base + $35k/yr equity.`,
                    time: 'Just now',
                  },
                ])
              }
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Simulator</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="space-y-3 max-h-96 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
            {simulatorMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'candidate' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-xl text-xs leading-relaxed ${
                    msg.sender === 'candidate'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                  }`}
                >
                  <div className="text-[10px] font-semibold mb-1 opacity-75">
                    {msg.sender === 'candidate' ? 'You (Candidate)' : `Recruiter (${company})`}
                  </div>
                  <div>{msg.text}</div>
                </div>

                {msg.analysis && (
                  <div className="max-w-[85%] mt-1.5 p-2 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                    <span className="font-semibold">💡 Coach Strategy Insight: </span>
                    {msg.analysis}
                  </div>
                )}
              </div>
            ))}

            {isSimulating && (
              <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Recruiter is reviewing internal bands and typing...</span>
              </div>
            )}
          </div>

          {/* Quick Response Starters */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-medium py-1">Quick Counters:</span>
            <button
              onClick={() =>
                handleSendSimulatorMessage(
                  "Thank you for the offer! Based on market benchmarks for senior full-stack roles, could we explore $195k base or an adjusted sign-on bonus?"
                )
              }
              className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              "Could we explore $195k base or an adjusted sign-on bonus?"
            </button>
            <button
              onClick={() =>
                handleSendSimulatorMessage(
                  "If base compensation has a hard ceiling, could we bridge the gap with a $20k sign-on bonus or additional initial equity grant?"
                )
              }
              className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              "Bridge with a $20k sign-on bonus or additional equity?"
            </button>
          </div>

          {/* Input box */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={candidateInput}
              onChange={(e) => setCandidateInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendSimulatorMessage();
              }}
              placeholder="Type your verbal negotiation response..."
              className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
            <button
              onClick={() => handleSendSimulatorMessage()}
              disabled={isSimulating || !candidateInput.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
