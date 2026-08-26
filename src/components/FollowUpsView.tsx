import React, { useState } from 'react';
import {
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  Plus,
  RefreshCw,
  MessageSquare,
  Copy,
  Check,
} from 'lucide-react';
import { FollowUp } from '../types';

interface FollowUpsViewProps {
  followUps?: FollowUp[];
  onMarkDone?: (id: string) => void;
  onOpenOutreachModal?: (fu: FollowUp) => void;
  onAddFollowUp?: (fu: FollowUp) => void;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({
  followUps = [],
  onMarkDone = (_id: string) => {},
  onOpenOutreachModal = (_fu: FollowUp) => {},
  onAddFollowUp = (_fu: FollowUp) => {},
}) => {
  const [tab, setTab] = useState<'pending' | 'completed'>('pending');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const pending = followUps.filter((f) => f.status !== 'completed');
  const completed = followUps.filter((f) => f.status === 'completed');

  const handleCopyTemplate = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="follow-ups-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Follow-up & Outreach Command</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
              {pending.length} Pending Actions
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated cadence tracker for 3-day application check-ins, 24h interview thank-you notes, and offer negotiations.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-800 border border-slate-700/60 text-xs">
          <button
            onClick={() => setTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              tab === 'pending' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Due & Pending ({pending.length})
          </button>
          <button
            onClick={() => setTab('completed')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              tab === 'completed' ? 'bg-slate-700 text-slate-200 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed ({completed.length})
          </button>
        </div>
      </div>

      {/* Follow-up Cards List */}
      <div className="space-y-4">
        {(tab === 'pending' ? pending : completed).map((fu) => (
          <div
            key={fu.id}
            className={`p-5 rounded-2xl border transition-all ${
              fu.status === 'completed'
                ? 'bg-slate-900/60 border-slate-800/80 opacity-75'
                : fu.status === 'overdue'
                ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/20'
                : fu.status === 'due_today'
                ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-950/20'
                : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      fu.status === 'overdue'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : fu.status === 'due_today'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : fu.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {fu.status === 'overdue'
                      ? 'Overdue'
                      : fu.status === 'due_today'
                      ? 'Due Today'
                      : fu.status === 'completed'
                      ? 'Completed'
                      : 'Upcoming'}
                  </span>

                  <span className="text-xs font-semibold text-cyan-400">{fu.type}</span>
                  <span className="text-[11px] text-slate-400 font-mono">Due: {fu.dueDate}</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">
                    {fu.company} - <span className="text-slate-300 font-normal">{fu.jobTitle}</span>
                  </h3>
                  <div className="text-xs text-slate-300 font-medium mt-0.5">
                    Recipient: <strong className="text-slate-100">{fu.recipientName}</strong> ({fu.recipientEmail})
                  </div>
                </div>

                {/* Pre-drafted Template View */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-line relative">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Pre-Drafted Outreach Note:
                  </div>
                  {fu.templateText}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 flex-shrink-0">
                <button
                  onClick={() => onOpenOutreachModal(fu)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send / Edit Email</span>
                </button>

                <button
                  onClick={() => handleCopyTemplate(fu.templateText, fu.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                >
                  {copiedId === fu.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === fu.id ? 'Copied' : 'Copy Template'}</span>
                </button>

                {fu.status !== 'completed' && (
                  <button
                    onClick={() => onMarkDone(fu.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium border border-emerald-500/30"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Done</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {((tab === 'pending' && pending.length === 0) || (tab === 'completed' && completed.length === 0)) && (
          <div className="py-12 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <div className="text-sm font-semibold text-slate-200">No {tab} follow-ups</div>
            <div className="text-xs text-slate-400 mt-1">All recruiter follow-ups are up to date.</div>
          </div>
        )}
      </div>
    </div>
  );
};
