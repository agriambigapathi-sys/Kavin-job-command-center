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
  Mic,
  Send,
  Loader2,
  Award,
  RefreshCw,
  Play,
  RotateCcw,
  Check,
  Copy,
} from 'lucide-react';
import { Interview } from '../types';

interface InterviewsViewProps {
  interviews?: Interview[];
  onAddInterview?: (interview: Interview) => void;
}

export const InterviewsView: React.FC<InterviewsViewProps> = ({
  interviews = [
    {
      id: 'int-1',
      jobId: 'job-1',
      company: 'Stripe',
      role: 'Senior Full-Stack AI Engineer',
      round: 'System Design & Architecture',
      date: 'Tomorrow',
      time: '2:00 PM EST',
      durationMinutes: 45,
      interviewers: ['Sarah Jenkins (VP Eng)', 'David Chen (Staff Architect)'],
      meetingLink: 'https://meet.google.com/xyz-mock',
      prepNotes: 'Focus on distributed asynchronous queuing, PostgreSQL horizontal partitioning, and sub-100ms API SLA guarantees.',
      mockQuestions: [
        'How would you architect a payment idempotency key store handling 50k requests/sec with zero duplicate charges?',
        'Describe a time you negotiated a major technical tradeoff under strict executive product deadlines.',
      ],
      completed: false,
    },
    {
      id: 'int-2',
      jobId: 'job-2',
      company: 'Datadog',
      role: 'Staff Frontend Architect',
      round: 'Technical Deep-Dive',
      date: 'In 3 days',
      time: '11:00 AM PST',
      durationMinutes: 60,
      interviewers: ['Marcus Brody (Director of Engineering)'],
      meetingLink: 'https://zoom.us/j/mock-datadog',
      prepNotes: 'Be prepared for React 19 performance profiling, WebSockets state synchronization, and Canvas/D3 rendering pipelines.',
      mockQuestions: [
        'How do you prevent UI thread blocking when receiving 10,000 real-time telemetry events per second?',
      ],
      completed: false,
    },
  ],
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'mock-studio'>('mock-studio');
  const [selectedInterviewId, setSelectedInterviewId] = useState<string>(interviews[0]?.id || 'int-1');
  const [debriefText, setDebriefText] = useState('');

  // Mock Studio State
  const [targetRole, setTargetRole] = useState('Senior Full-Stack Engineer');
  const [targetCompany, setTargetCompany] = useState('Stripe');
  const [roundType, setRoundType] = useState('STAR Behavioral & Architecture');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const [currentQuestions, setCurrentQuestions] = useState<
    Array<{
      id: string;
      category: string;
      question: string;
      context: string;
      evaluationRubric: string[];
      suggestedKeywords: string[];
      sampleIdealAnswer: string;
    }>
  >([
    {
      id: 'q-1',
      category: 'STAR Behavioral',
      question:
        'Describe a high-stakes technical disagreement you had with a principal engineer or product manager. How did you resolve it with data?',
      context: 'Evaluates executive alignment, egoless communication, and technical decision making.',
      evaluationRubric: [
        'Clear Situation & Task context (5W+1H)',
        'Specific Action candidate personally took with objective tradeoffs',
        'Quantifiable Result with business or architectural metric',
      ],
      suggestedKeywords: ['Tradeoffs', 'Data-driven', 'Alignment', 'Architecture', 'Customer impact'],
      sampleIdealAnswer:
        'In my previous project, we debated between synchronous REST vs event-driven Kafka for order processing. I benchmarked throughput under peak traffic, demonstrated 4x latency reduction with Kafka, and built a phased rollout that satisfied reliability concerns.',
    },
    {
      id: 'q-2',
      category: 'System Design & Scalability',
      question:
        'How would you architect a real-time event streaming pipeline that processes 50,000 updates/sec with sub-200ms end-to-end latency and zero data loss?',
      context: 'Tests distributed systems fundamentals, partition strategies, backpressure handling, and failure modes.',
      evaluationRubric: [
        'Partitioning & sharding strategy',
        'Idempotency and deduplication guarantees',
        'Cache invalidation and fallback mechanisms',
      ],
      suggestedKeywords: ['Kafka / PubSub', 'Idempotent Consumers', 'Redis Caching', 'Dead Letter Queue', 'Backpressure'],
      sampleIdealAnswer:
        'I would utilize Kafka partitioned by entity ID with exactly-once consumer semantics, write-through caching in Redis, and dead-letter queues with exponential backoff for transient failures.',
    },
  ]);

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [evaluationResult, setEvaluationResult] = useState<{
    overallScore: number;
    starBreakdown: {
      situation: { score: number; feedback: string };
      task: { score: number; feedback: string };
      action: { score: number; feedback: string };
      result: { score: number; feedback: string };
    };
    clarityScore: number;
    technicalDepthScore: number;
    strengths: string[];
    improvementAreas: string[];
    coachingTip: string;
    polishedAnswer: string;
  } | null>(null);

  const activeQuestion = currentQuestions[activeQuestionIndex] || currentQuestions[0];
  const selectedInterview = interviews.find((i) => i.id === selectedInterviewId) || interviews[0];

  const handleGenerateQuestions = async () => {
    setIsGeneratingPlan(true);
    try {
      const res = await fetch('/api/gemini/mock-interview/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: targetRole,
          company: targetCompany,
          roundType,
        }),
      });
      const data = await res.json();
      if (data.success && data.interviewPlan?.questions?.length > 0) {
        setCurrentQuestions(data.interviewPlan.questions);
        setActiveQuestionIndex(0);
        setEvaluationResult(null);
        setCandidateAnswer('');
      }
    } catch (err) {
      console.error('Failed to generate mock questions:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!candidateAnswer.trim()) return;
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/gemini/mock-interview/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: activeQuestion.question,
          candidateAnswer,
          role: targetRole,
          company: targetCompany,
        }),
      });
      const data = await res.json();
      if (data.success && data.evaluation) {
        setEvaluationResult(data.evaluation);
      }
    } catch (err) {
      console.error('Answer evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div id="interviews-view-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                Interviewer AI Agent
              </span>
              <span className="text-xs text-slate-400">• Interactive Mock Studio & STAR Scoring</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">AI Mock Interview Studio & Schedule</h1>
            <p className="text-sm text-slate-600 mt-1">
              Practice role-specific mock interviews with real-time STAR criteria feedback, rubric scoring, and debrief notes.
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setActiveTab('mock-studio')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'mock-studio'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AI Mock Studio
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Scheduled Rounds ({interviews.length})
            </button>
          </div>
        </div>
      </div>

      {/* 1. AI MOCK STUDIO TAB */}
      {activeTab === 'mock-studio' && (
        <div className="space-y-6">
          {/* Setup Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Company</label>
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerateQuestions}
                  disabled={isGeneratingPlan}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isGeneratingPlan ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Crafting Simulation...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Mock Questions</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Questions Navigation & Active Prompt (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    {activeQuestion.category}
                  </span>
                  <div className="flex items-center gap-1">
                    {currentQuestions.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveQuestionIndex(idx);
                          setEvaluationResult(null);
                          setCandidateAnswer('');
                        }}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          activeQuestionIndex === idx
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    "{activeQuestion.question}"
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {activeQuestion.context}
                  </p>
                </div>

                {/* Rubric Points */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                    Evaluation Criteria (STAR Rubric):
                  </div>
                  {activeQuestion.evaluationRubric.map((r, i) => (
                    <div key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                {/* Candidate Answer Box */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Your Answer (Type or Practice Verbal STAR Response)
                    </label>
                  </div>
                  <textarea
                    rows={6}
                    value={candidateAnswer}
                    onChange={(e) => setCandidateAnswer(e.target.value)}
                    placeholder="Provide your response following the STAR framework: Situation, Task, Action, Result..."
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white resize-y leading-relaxed"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() =>
                        setCandidateAnswer(
                          "In my previous project, we faced a high-volume latency bottleneck on our customer transaction pipeline. As lead engineer, I benchmarked PostgreSQL execution plans and decoupled write operations using an asynchronous queue. This slashed API response times by 68% and handled a 3x traffic surge with zero downtime."
                        )
                      }
                      className="text-xs text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
                    >
                      Fill Sample Answer
                    </button>

                    <button
                      onClick={handleEvaluateAnswer}
                      disabled={isEvaluating || !candidateAnswer.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {isEvaluating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Grading STAR Response...</span>
                        </>
                      ) : (
                        <>
                          <Award className="w-3.5 h-3.5" />
                          <span>Evaluate with AI Coach</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Real-Time STAR Feedback & Scorecard (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              {evaluationResult ? (
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
                  {/* Header Score */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Interview Readiness Score
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-bold text-purple-700">
                          {evaluationResult.overallScore}
                        </span>
                        <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="text-[11px] text-slate-500 font-medium">Clarity</div>
                        <div className="text-sm font-bold text-slate-900">
                          {evaluationResult.clarityScore}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-500 font-medium">Tech Depth</div>
                        <div className="text-sm font-bold text-slate-900">
                          {evaluationResult.technicalDepthScore}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STAR Breakdown Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>Situation</span>
                        <span className="text-purple-600">
                          {evaluationResult.starBreakdown.situation.score}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                        {evaluationResult.starBreakdown.situation.feedback}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>Task</span>
                        <span className="text-purple-600">
                          {evaluationResult.starBreakdown.task.score}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                        {evaluationResult.starBreakdown.task.feedback}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>Action (Execution)</span>
                        <span className="text-purple-600">
                          {evaluationResult.starBreakdown.action.score}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                        {evaluationResult.starBreakdown.action.feedback}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>Result (Metrics)</span>
                        <span className="text-purple-600">
                          {evaluationResult.starBreakdown.result.score}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                        {evaluationResult.starBreakdown.result.feedback}
                      </p>
                    </div>
                  </div>

                  {/* Coaching Tip */}
                  <div className="p-3 bg-purple-50/70 rounded-lg border border-purple-200 text-xs text-purple-900 leading-relaxed">
                    <span className="font-bold">💡 Executive Coaching Tip: </span>
                    {evaluationResult.coachingTip}
                  </div>

                  {/* Polished Model Answer */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Elevated Exemplary STAR Response
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 font-mono leading-relaxed whitespace-pre-wrap">
                      {evaluationResult.polishedAnswer}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">AI Evaluation Standby</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Type your answer to Question #{activeQuestionIndex + 1} and click "Evaluate with AI Coach" to receive rubric scores and actionable suggestions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. SCHEDULED ROUNDS TAB */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Interview List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Upcoming Rounds ({interviews.length})
            </div>

            {interviews.map((int) => {
              const isSelected = selectedInterviewId === int.id;
              return (
                <div
                  key={int.id}
                  onClick={() => setSelectedInterviewId(int.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-50/50 border-purple-300 ring-1 ring-purple-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900">{int.company}</h3>
                        <span className="px-2 py-0.2 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          {int.round}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5 font-medium">{int.role}</div>
                    </div>

                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {int.durationMinutes}m
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-blue-600 font-semibold font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{int.date} ({int.time})</span>
                    </div>

                    {int.meetingLink && (
                      <a
                        href={int.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-purple-600 hover:text-purple-700 flex items-center gap-1 font-semibold"
                      >
                        <Video className="w-3.5 h-3.5" />
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
            <div className="lg:col-span-7 space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedInterview.company}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      {selectedInterview.round}
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 font-semibold mt-0.5">{selectedInterview.role}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedInterview.date} at {selectedInterview.time} ({selectedInterview.durationMinutes} mins)</span>
                  </div>
                </div>

                {selectedInterview.meetingLink && (
                  <a
                    href={selectedInterview.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Launch Meeting Link</span>
                  </a>
                )}
              </div>

              {/* Interviewers Panel */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Interviewers & Panel</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedInterview.interviewers.map((person, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700 font-medium shadow-2xs"
                    >
                      👤 {person}
                    </span>
                  ))}
                </div>
              </div>

              {/* Prep Guide & Focus Notes */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-1.5">
                <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>High-Priority Prep Focus & System Architecture</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedInterview.prepNotes}
                </p>
              </div>

              {/* Post-Interview Debrief Notes */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Post-Interview Debrief & Notes
                </label>
                <textarea
                  rows={3}
                  value={debriefText}
                  onChange={(e) => setDebriefText(e.target.value)}
                  placeholder="Log questions they asked, how you felt about your technical answers, and follow-up topics..."
                  className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => alert('Debrief notes saved to interview record!')}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                  >
                    Save Debrief Notes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
