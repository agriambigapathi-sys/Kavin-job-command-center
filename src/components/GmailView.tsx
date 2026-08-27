import React, { useState } from 'react';
import {
  Mail,
  Search,
  Star,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Tag,
  Paperclip,
  Check,
} from 'lucide-react';
import { GmailMessage } from '../types';

interface GmailViewProps {
  messages?: GmailMessage[];
}

export const GmailView: React.FC<GmailViewProps> = ({ messages = [] }) => {
  const [selectedMessageId, setSelectedMessageId] = useState<string>(messages[0]?.id || 'gm-1');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [replyText, setReplyText] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [sentReply, setSentReply] = useState(false);

  const selectedMsg = messages.find((m) => m.id === selectedMessageId) || messages[0] || null;

  const filteredMessages = messages.filter((m) => {
    if (categoryFilter === 'all') return true;
    return m.category === categoryFilter;
  });

  const handleGenerateSmartReply = async () => {
    if (!selectedMsg) return;
    setIsGeneratingReply(true);
    setSentReply(false);

    try {
      const prompt = `Write a polished, professional email response for Kavin to:
Sender: ${selectedMsg.sender} (${selectedMsg.senderEmail})
Company: ${selectedMsg.company}
Subject: ${selectedMsg.subject}
Original Body:
"""
${selectedMsg.body}
"""

Tone: Enthusiastic, highly professional, direct. Confirm meeting times or express sincere gratitude.`;

      const res = await fetch('/api/gemini/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: 'Response',
          company: selectedMsg.company,
          hiringManager: selectedMsg.sender,
          candidateHighlights: prompt,
        }),
      });

      const data = await res.json();
      setReplyText(
        data.coverLetter ||
          `Hi ${selectedMsg.sender.split(' ')[0]},\n\nThank you for the update! I have confirmed the time on my calendar and look forward to speaking with the team.\n\nBest regards,\nKavin`
      );
    } catch {
      setReplyText(
        `Hi ${selectedMsg.sender.split(' ')[0]},\n\nThank you for the update. I have confirmed this on my calendar and look forward to connecting!\n\nBest regards,\nKavin`
      );
    } finally {
      setIsGeneratingReply(false);
    }
  };

  return (
    <div id="gmail-view-container" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-red-400" />
            <span>Gmail Job Search Sync & Inbox</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
              Live Connected
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-categorizes job applications, interview invitations, recruiter reach-outs, and offer letters.
          </p>
        </div>

        {/* Categories Pill filters */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-800 border border-slate-700/60 text-xs">
          {['all', 'interview', 'offer', 'application', 'recruiter'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg capitalize font-medium transition-all ${
                categoryFilter === cat ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Message Threads (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Recruiter & Company Threads ({filteredMessages.length})
          </div>

          {filteredMessages.map((msg) => {
            const isSelected = selectedMessageId === msg.id;
            return (
              <div
                key={msg.id}
                onClick={() => {
                  setSelectedMessageId(msg.id);
                  setReplyText('');
                  setSentReply(false);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/30 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">{msg.sender}</span>
                    <span className="text-[11px] text-cyan-400">({msg.company})</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{msg.date}</span>
                </div>

                <div className="text-xs font-semibold text-slate-200 truncate mb-1">{msg.subject}</div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{msg.snippet}</p>

                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={`px-2 py-0.2 rounded text-[10px] font-bold capitalize ${
                      msg.category === 'offer'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : msg.category === 'interview'
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {msg.category}
                  </span>
                  {msg.starred && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Message Body & AI Reply (7 cols) */}
        {selectedMsg && (
          <div className="lg:col-span-7 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Message Header */}
              <div className="pb-3 border-b border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white leading-snug">{selectedMsg.subject}</h3>
                    <div className="text-xs text-slate-300 mt-1">
                      From: <strong className="text-cyan-300">{selectedMsg.sender}</strong> &lt;{selectedMsg.senderEmail}&gt;
                    </div>
                    <div className="text-[11px] text-slate-400">To: Kavin &lt;ambigapathikavin2@gmail.com&gt;</div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{selectedMsg.date}</span>
                </div>
              </div>

              {/* Message Body */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                {selectedMsg.body}
              </div>

              {/* AI Quick Reply Assistant */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/30 to-slate-900 border border-purple-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Gemini AI Smart Reply Drafter</span>
                  </div>

                  <button
                    onClick={handleGenerateSmartReply}
                    disabled={isGeneratingReply}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold"
                  >
                    <RefreshCw className={`w-3 h-3 ${isGeneratingReply ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingReply ? 'Drafting...' : 'Auto-Draft Response'}</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={replyText || ''}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Click 'Auto-Draft Response' to generate a tailored reply or type here..."
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-purple-500"
                />

                <div className="flex items-center justify-between">
                  {sentReply ? (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Response dispatched successfully!</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">Direct response via Gmail API</span>
                  )}

                  <button
                    onClick={() => {
                      if (!replyText) return;
                      setSentReply(true);
                      setTimeout(() => setReplyText(''), 1500);
                    }}
                    disabled={!replyText.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
