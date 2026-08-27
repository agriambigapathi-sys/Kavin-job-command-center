import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Trash2,
  Minimize2,
  Maximize2,
  Bot,
  User,
  ExternalLink,
  Linkedin,
  Briefcase,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { Job, Contact, ResumeVersion } from '../types';

interface NovaMessage {
  id: string;
  sender: 'nova' | 'user';
  text: string;
  timestamp: string;
  actionLinks?: { label: string; url?: string; actionType?: string }[];
}

interface NovaCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetJob?: Job | null;
  resumes?: ResumeVersion[];
  onNavigateToTab?: (tab: string) => void;
}

export const NovaCopilotDrawer: React.FC<NovaCopilotDrawerProps> = ({
  isOpen,
  onClose,
  targetJob,
  resumes = [],
  onNavigateToTab,
}) => {
  const [messages, setMessages] = useState<NovaMessage[]>([
    {
      id: 'msg-1',
      sender: 'nova',
      text: "👋 Hi Kavin! I'm Nova, your dedicated AI Job Hunter & Career Copilot.\n\nI can help you tailor resumes for specific roles, draft high-converting LinkedIn messages, formulate STAR interview answers, or review job descriptions. How can I assist you right now?",
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim()) return;

    const userMsg: NovaMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are Nova, an elite Career Copilot and executive talent strategist for Kavin (Senior AI Platform & Full Stack Engineer with expertise in React 19, TypeScript, Node.js, and GenAI Pipelines).
          
User Query: "${textToSend}"
${targetJob ? `Context Job: ${targetJob.title} at ${targetJob.company}. Location: ${targetJob.location}. Match: ${targetJob.matchScore}%` : ''}

Provide a direct, high-impact, actionable answer. If drafting outreach or bullet points, format them crisply with copyable blocks and strategic reasoning.`,
        }),
      });

      const data = await response.json();
      const reply = data.text || 'I analyzed your request. Here are the tailored recommendations based on your master career profile.';

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-reply-${Date.now()}`,
          sender: 'nova',
          text: reply,
          timestamp: 'Just now',
        },
      ]);
    } catch (e) {
      // Fallback assistant response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-reply-${Date.now()}`,
            sender: 'nova',
            text: `🎯 Tailored Recommendation:\n\nBased on your profile and target roles, highlight your hands-on experience in **React 19, TypeScript architecture, and real-time GenAI orchestration pipelines**. \n\nSuggested LinkedIn Pitch:\n"Hi [Recruiter], I noticed your team is scaling full-stack AI applications. I recently architected sub-50ms React/Node micro-frontends and would love to connect!"`,
            timestamp: 'Just now',
          },
        ]);
      }, 700);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `msg-init-${Date.now()}`,
        sender: 'nova',
        text: '🧹 Chat cleared. What would you like to explore next?',
        timestamp: 'Just now',
      },
    ]);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-slate-900 text-slate-100 shadow-2xl border-l border-slate-800 flex flex-col transition-transform duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Nova</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-medium">
                AI Copilot
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Real-time career strategist</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            title="Clear Chat"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            title="Close Panel"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Job Indicator (If opened for a specific role) */}
      {targetJob && (
        <div className="px-4 py-2 bg-slate-800/80 border-b border-slate-700/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 truncate">
            <Briefcase className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="text-slate-300 truncate">Targeting: <strong>{targetJob.title}</strong> @ {targetJob.company}</span>
          </div>
          <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold shrink-0">
            {targetJob.matchScore}%
          </span>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((m) => {
          const isNova = m.sender === 'nova';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isNova ? 'justify-start' : 'justify-end'}`}
            >
              {isNova && (
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3 space-y-1.5 ${
                  isNova
                    ? 'bg-slate-800 border border-slate-700/80 text-slate-200'
                    : 'bg-blue-600 text-white font-medium'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed break-words font-sans">
                  {m.text}
                </div>

                {isNova && (
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-700/40">
                    <span>{m.timestamp}</span>
                    <button
                      onClick={() => copyText(m.text, m.id)}
                      className="hover:text-cyan-400 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
            <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Nova is generating recommendations...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 py-2 border-t border-slate-800 bg-slate-950 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        {[
          'Draft LinkedIn Connection Note',
          'Optimize bullets for ATS',
          'STAR Interview Prep',
          'Find Hiring Managers',
        ].map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2"
      >
        <input
          type="text"
          placeholder="Ask Nova anything or paste a job/LinkedIn URL..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
};
