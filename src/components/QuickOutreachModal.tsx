import React, { useState } from 'react';
import { Send, X, Sparkles, Check, RefreshCw } from 'lucide-react';
import { Contact, FollowUp } from '../types';

interface QuickOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetContact?: Contact | null;
  targetFollowUp?: FollowUp | null;
}

export const QuickOutreachModal: React.FC<QuickOutreachModalProps> = ({
  isOpen,
  onClose,
  targetContact,
  targetFollowUp,
}) => {
  const recipientName = targetContact?.name || targetFollowUp?.recipientName || 'Recruiter';
  const recipientEmail = targetContact?.email || targetFollowUp?.recipientEmail || 'recruiter@company.com';
  const company = targetContact?.company || targetFollowUp?.company || 'Company';

  const [subject, setSubject] = useState(
    targetFollowUp
      ? `Following Up: Kavin / ${targetFollowUp.jobTitle} at ${company}`
      : `Introduction & Mutual Interest - Kavin / Senior AI Platform Engineer`
  );

  const [message, setMessage] = useState(
    targetFollowUp?.templateText ||
      `Hi ${recipientName.split(' ')[0]},\n\nI hope you're having a great week. I wanted to reach out regarding the engineering opportunities at ${company}. With my background in React 19, TypeScript architecture, and GenAI orchestration pipelines, I'm confident I can make an immediate impact on your team's core roadmap.\n\nWould you be open to a brief 10-minute introductory conversation this week?\n\nBest regards,\nKavin\nambigapathikavin2@gmail.com`
  );

  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSent(true);
      setTimeout(() => {
        setSent(false);
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-cyan-400" />
            <span>Compose Recruiter Outreach</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSend} className="space-y-3.5 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400">
              To: <strong className="text-slate-200">{recipientName}</strong> &lt;{recipientEmail}&gt;
            </div>
            <div className="text-slate-400">
              Company: <span className="text-cyan-400 font-semibold">{company}</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Outreach Message</label>
            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:ring-1 focus:ring-cyan-500 leading-relaxed font-sans"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Sending from ambigapathikavin2@gmail.com</span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending || sent}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md disabled:opacity-50"
              >
                {sent ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Sent!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isSending ? 'Dispatching...' : 'Send Message'}</span>
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
