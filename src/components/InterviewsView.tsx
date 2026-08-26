import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Users,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Plus,
  Target,
  Edit3,
} from 'lucide-react';
import { Interview } from '../types';

interface InterviewsViewProps {
  interviews?: Interview[];
  onAddInterview?: (interview: Interview) => void;
}

export const InterviewsView: React.FC<InterviewsViewProps> = ({ interviews = [] }) => {
  const [selectedInterviewId, setSelectedInterviewId] = useState<string>(interviews[0]?.id || 'int-1');
  const [debriefText, setDebriefText] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const selectedInterview =
    interviews.find((i) => i.id === selectedInterviewId) || interviews[0] || null;

  return (
    <div id="interviews-view-container" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span>Interview Command & Preparation Station</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
              {interviews.length} Scheduled Loops
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Countdown timers, Google Meet/Zoom links, system design prep guides, and AI mock questions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            🎯 4 Active Rounds This Week
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interview List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Interview Schedule
          </div>

          {interviews.map((int) => {
            const isSelected = selectedInterviewId === int.id;
            return (
              <div
                key={int.id}
                onClick={() => setSelectedInterviewId(int.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-950/30 border-purple-500/60 shadow-md shadow-purple-950/40 ring-1 ring-purple-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-100">{int.company}</h3>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                        {int.round}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5 font-medium">{int.role}</div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {int.durationMinutes}m
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-semibold font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{int.date} ({int.time})</span>
                  </div>

                  {int.meetingLink && (
                    <a
                      href={int.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Video className="w-3 h-3" />
                      <span>Join Room</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Interview Prep Deep-Dive Station (7 cols) */}
        {selectedInterview && (
          <div className="lg:col-span-7 space-y-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm">
            {/* Top Detail */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{selectedInterview.company}</h3>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    {selectedInterview.round}
                  </span>
                </div>
                <div className="text-xs text-cyan-400 font-semibold mt-0.5">{selectedInterview.role}</div>
                <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedInterview.date} at {selectedInterview.time} ({selectedInterview.durationMinutes} mins)</span>
                </div>
              </div>

              {selectedInterview.meetingLink && (
                <a
                  href={selectedInterview.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Launch Meeting Link</span>
                </a>
              )}
            </div>

            {/* Interviewers Panel */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Interviewers & Panel</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedInterview.interviewers.map((person, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-medium"
                  >
                    👤 {person}
                  </span>
                ))}
              </div>
            </div>

            {/* Prep Guide & Focus Notes */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>High-Priority Prep Focus & System Architecture</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedInterview.prepNotes}
              </p>
            </div>

            {/* AI Mock Technical Questions */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
              <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Predicted Questions & STAR Framework Answers</span>
              </div>
              <div className="space-y-2">
                {selectedInterview.mockQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300"
                  >
                    <div className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-purple-400" />
                      <span>Question #{idx + 1}</span>
                    </div>
                    <p className="leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Post-Interview Debrief Notes */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Post-Interview Debrief & Questions Asked
              </label>
              <textarea
                rows={3}
                value={debriefText}
                onChange={(e) => setDebriefText(e.target.value)}
                placeholder="Log questions they asked, how you felt about your technical answers, and follow-up topics..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-purple-500"
              />
              <div className="flex justify-end mt-1.5">
                <button
                  onClick={() => alert('Debrief notes saved to application record!')}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Save Debrief Notes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
