import React, { useState } from 'react';
import {
  FileEdit,
  Sparkles,
  Copy,
  Download,
  Plus,
  RefreshCw,
  Check,
  Building,
  User,
  Sliders,
  Send,
} from 'lucide-react';
import { CoverLetter } from '../types';

interface CoverLettersViewProps {
  coverLetters?: CoverLetter[];
  initialCompany?: string;
  initialRole?: string;
  initialJD?: string;
  onSaveCoverLetter?: (cl: CoverLetter) => void;
}

export const CoverLettersView: React.FC<CoverLettersViewProps> = ({
  coverLetters = [],
  initialCompany = '',
  initialRole = '',
  initialJD = '',
  onSaveCoverLetter = (_cl: CoverLetter) => {},
}) => {
  const [selectedLetterId, setSelectedLetterId] = useState<string>(coverLetters[0]?.id || 'new');
  const [company, setCompany] = useState(initialCompany || 'Anthropic / Scale AI Labs');
  const [jobTitle, setJobTitle] = useState(initialRole || 'Senior Full-Stack AI Engineer');
  const [hiringManager, setHiringManager] = useState('Sarah Jenkins & Engineering Team');
  const [tone, setTone] = useState<CoverLetter['tone']>('Technical & Architectural');
  const [jobDescription, setJobDescription] = useState(initialJD || '');
  const [content, setContent] = useState(coverLetters[0]?.content || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/gemini/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          jobTitle,
          hiringManager,
          jobDescription,
          tone,
        }),
      });
      const data = await res.json();
      if (data.coverLetter) {
        setContent(data.coverLetter);
      }
    } catch (err) {
      console.error('Cover letter generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    const newCl: CoverLetter = {
      id: `cl-${Date.now()}`,
      title: `${company} - ${jobTitle} Letter`,
      company,
      role: jobTitle,
      jobTitle,
      content,
      tone,
      version: 'v1.0',
      status: 'Final',
      createdAt: new Date().toISOString().split('T')[0],
      lastEdited: new Date().toISOString().split('T')[0],
    };
    onSaveCoverLetter(newCl);
    alert('Cover letter saved to library!');
  };

  return (
    <div id="cover-letters-view" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-cyan-400" />
            <span>Cover Letters</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
              {coverLetters.length} Saved
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Draft and customize cover letters matching target roles and companies.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-cyan-200" />
          <span>{isGenerating ? 'Generating...' : 'Generate Letter'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Target Parameters</span>
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Company Name</label>
            <input
              type="text"
              value={company || ''}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Position</label>
            <input
              type="text"
              value={jobTitle || ''}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Hiring Manager / Team</label>
            <input
              type="text"
              value={hiringManager || ''}
              onChange={(e) => setHiringManager(e.target.value)}
              placeholder="e.g. David Chen or Platform Hiring Team"
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Voice & Tone</label>
            <select
              value={tone || 'Technical & Architectural'}
              onChange={(e) => setTone(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:ring-1 focus:ring-cyan-500"
            >
              <option value="Technical & Architectural">Technical & Architectural (Recommended for Senior Eng)</option>
              <option value="Professional & Direct">Professional & Direct</option>
              <option value="Energetic & Impactful">Energetic & Impactful</option>
              <option value="Executive">Executive / Strategic</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Job Description / Key Focus Points (Optional)
            </label>
            <textarea
              rows={4}
              value={jobDescription || ''}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste snippet of JD requirements or specific team challenges..."
              className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Saved Templates List */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-xs font-bold text-slate-400 mb-2">Saved Letters</div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {coverLetters.map((cl) => (
                <button
                  key={cl.id}
                  onClick={() => {
                    setSelectedLetterId(cl.id);
                    setCompany(cl.company);
                    setJobTitle(cl.jobTitle);
                    setContent(cl.content);
                    setTone(cl.tone);
                  }}
                  className="w-full text-left p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-xs text-slate-300 truncate transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{cl.title}</span>
                  <span className="text-[10px] text-slate-400">{cl.tone.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Editor & Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-3 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100">{company} - {jobTitle}</h3>
                <span className="text-[11px] text-purple-300 font-medium">Tone: {tone}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm"
                >
                  <span>Save to Vault</span>
                </button>
              </div>
            </div>

            <textarea
              rows={16}
              value={content || ''}
              onChange={(e) => setContent(e.target.value)}
              className="w-full mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans leading-relaxed"
            />
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Word count: {content.split(/\s+/).filter(Boolean).length} words</span>
            <span className="text-cyan-400">Ready for application submission</span>
          </div>
        </div>
      </div>
    </div>
  );
};
