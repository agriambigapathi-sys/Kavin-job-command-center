import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Plus,
  Trash2,
  HelpCircle,
  Briefcase,
  Layers,
  Send,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { UserProfile } from '../types';

interface ApplicationAssistantViewProps {
  userProfile?: UserProfile;
}

interface QuestionAnswerItem {
  id: string;
  question: string;
  answer: string;
  wordCount: number;
}

export const ApplicationAssistantView: React.FC<ApplicationAssistantViewProps> = ({ userProfile }) => {
  const [company, setCompany] = useState('Stripe');
  const [role, setRole] = useState(userProfile?.title || 'Senior Full-Stack Engineer');
  const [candidateBackground, setCandidateBackground] = useState(
    '6+ years of verified production experience architecting React 19 / TypeScript web applications, distributed Node.js microservices, and AI-enabled workflows.'
  );

  const [questions, setQuestions] = useState<string[]>([
    'Why do you want to work at our company?',
    'Describe a complex technical challenge you solved and how you measured success.',
    'What are your compensation expectations?',
  ]);

  const [answers, setAnswers] = useState<QuestionAnswerItem[]>([
    {
      id: 'ans-1',
      question: 'Why do you want to work at our company?',
      answer:
        "I have long admired Stripe's exceptional engineering bar, developer-first philosophy, and ability to build infrastructure that powers global economic connectivity. Having spent the last several years architecting resilient full-stack systems and high-throughput APIs, I am eager to bring my experience in distributed reliability and GenAI tooling to accelerate Stripe's merchant developer tooling and financial services workflows.",
      wordCount: 63,
    },
    {
      id: 'ans-2',
      question: 'Describe a complex technical challenge you solved and how you measured success.',
      answer:
        'At my previous company, our customer analytics ingestion pipeline suffered from severe latency spikes during daily peak query windows. I investigated the database query execution plans, decoupled write operations using an asynchronous event queue in Redis, and introduced indexed caching for frequent multi-tenant aggregates. This reduced average API latency by 68% (from 480ms to 85ms) and supported a 3x traffic surge without provisioning additional server instances.',
      wordCount: 71,
    },
    {
      id: 'ans-3',
      question: 'What are your compensation expectations?',
      answer:
        'Based on current market data for a Senior Full-Stack Engineer with deep experience in TypeScript, scalable backend architectures, and AI integrations, my target compensation is in the range of $185,000 - $225,000 total compensation. I am open to discussing the structure of the package, including base salary, performance incentives, and equity grants for the right long-term match.',
      wordCount: 59,
    },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAddQuestion = () => {
    setQuestions([...questions, '']);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, val: string) => {
    const updated = [...questions];
    updated[index] = val;
    setQuestions(updated);
  };

  const handleGenerateAnswers = async () => {
    const validQuestions = questions.filter((q) => q.trim().length > 0);
    if (validQuestions.length === 0) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/gemini/application-assistant/generate-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          role,
          candidateBackground,
          questions: validQuestions,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.answers)) {
        setAnswers(
          data.answers.map((a: any, idx: number) => ({
            id: `ans-gen-${idx}`,
            question: a.question,
            answer: a.answer,
            wordCount: a.wordCount || a.answer.split(/\s+/).length,
          }))
        );
      }
    } catch (err) {
      console.error('Application assistant error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="application-assistant-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Application Copilot
              </span>
              <span className="text-xs text-slate-400">• Portal Essay & Form Question Assistant</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Application Portal Question Generator</h1>
            <p className="text-sm text-slate-600 mt-1">
              Generate authentic, impactful responses for tricky application portal questions (Workday, Greenhouse, Lever, Ashby) in seconds.
            </p>
          </div>

          <button
            onClick={handleGenerateAnswers}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shrink-0 shadow-xs"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting Answers...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Answers</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Context & Questions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Application Context</h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
            </div>

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
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Candidate Core Strengths / Summary
              </label>
              <textarea
                rows={3}
                value={candidateBackground}
                onChange={(e) => setCandidateBackground(e.target.value)}
                className="w-full p-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white resize-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Portal Questions</h3>
              <button
                onClick={handleAddQuestion}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {questions.map((q, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => handleQuestionChange(idx, e.target.value)}
                    placeholder={`e.g. Question ${idx + 1}...`}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                  {questions.length > 1 && (
                    <button
                      onClick={() => handleRemoveQuestion(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Suggestions */}
            <div className="pt-2">
              <span className="text-[11px] text-slate-400 font-medium block mb-1.5">
                Popular Portal Questions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setQuestions([...questions, 'Tell me about yourself.'])}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  + Tell me about yourself
                </button>
                <button
                  onClick={() =>
                    setQuestions([...questions, 'Describe a time you handled conflict in a team.'])
                  }
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  + Handling conflict
                </button>
                <button
                  onClick={() => setQuestions([...questions, 'Why are you leaving your current role?'])}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  + Why leaving current role
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Generated Answers (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Ready-to-Paste Responses ({answers.length})
            </span>
          </div>

          <div className="space-y-4">
            {answers.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 hover:border-slate-300 transition-all shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <h4 className="text-xs font-bold text-slate-900">{item.question}</h4>
                    </div>

                    <button
                      onClick={() => handleCopy(item.answer, item.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 cursor-pointer shrink-0"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-800 font-mono leading-relaxed whitespace-pre-wrap">
                    {item.answer}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>{item.wordCount} words (~{Math.round(item.wordCount / 2.5)}s read)</span>
                    <span className="text-emerald-600 font-medium">✓ ATS & Recruiter optimized</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
