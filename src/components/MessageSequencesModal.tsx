import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Save,
  Check,
  AlertTriangle,
  RotateCcw,
  Plus,
  ChevronDown,
  ChevronUp,
  Clock,
  Briefcase,
  Layers,
  Building,
  UserCheck,
  Code,
  Copy,
  ChevronRight,
  Edit2,
} from 'lucide-react';

interface MessageStep {
  id: number;
  title: string;
  badge: string;
  charLimit?: number;
  delayDays: number;
  delayLabel: string;
  content: string;
  isExpanded: boolean;
  statusDotColor?: string;
  premiumNotice?: string;
}

interface SequenceCategory {
  id: string;
  label: string;
  subcategories: {
    id: string;
    label: string;
  }[];
}

interface MessageSequencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (sequences: any) => void;
}

export const MessageSequencesModal: React.FC<MessageSequencesModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [sequenceMode, setSequenceMode] = useState<'Default' | 'Custom'>('Default');
  const [selectedCategory, setSelectedCategory] = useState<string>('open_jobs');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('hiring_team');
  const [customJobTitle, setCustomJobTitle] = useState('Data Analyst');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showVariableDropdown, setShowVariableDropdown] = useState<number | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 5 Step Message Sequence
  const [steps, setSteps] = useState<MessageStep[]>([
    {
      id: 1,
      title: 'Connection Request',
      badge: '1',
      charLimit: 300,
      delayDays: 0,
      delayLabel: 'Sent 0 days after accepting',
      content:
        "Hi {{firstName}}! I noticed the {{jobTitle}} opening at {{companyName}} and have an interesting story about why I'm drawn to working with you. My experience aligns well with the JD. Can we connect?",
      isExpanded: true,
      statusDotColor: 'bg-emerald-500',
      premiumNotice: 'LinkedIn Premium only. Limit: 300 characters.',
    },
    {
      id: 2,
      title: 'Pitch Message',
      badge: '2',
      charLimit: 600,
      delayDays: 1,
      delayLabel: 'Wait 1 day if no reply',
      content:
        'Thanks for connecting, {{firstName}}! I recently analyzed {{companyName}}\'s latest data initiatives and put together a few thoughts on optimizing reporting ETL pipelines for the {{jobTitle}} position. Would you be open to a brief 5-minute chat this week?',
      isExpanded: false,
      statusDotColor: 'bg-emerald-500',
    },
    {
      id: 3,
      title: 'Follow Up 1',
      badge: '3',
      charLimit: 500,
      delayDays: 3,
      delayLabel: 'Wait 3 days if no reply',
      content:
        'Hi {{firstName}}, bumping this in case it got buried! I have attached a 1-page breakdown of my recent business analytics projects. Let me know if you would like me to send over my portfolio or resume directly.',
      isExpanded: false,
      statusDotColor: 'bg-slate-500',
    },
    {
      id: 4,
      title: 'Referral / Value Ask',
      badge: '4',
      charLimit: 600,
      delayDays: 5,
      delayLabel: 'Wait 5 days if no reply',
      content:
        'Hey {{firstName}}, hope your week is going well! I officially submitted my application for {{jobTitle}} via {{companyName}}\'s portal. If your team has a referral program, I would be grateful for a referral link or quick internal introduction.',
      isExpanded: false,
      statusDotColor: 'bg-slate-500',
    },
    {
      id: 5,
      title: 'Final Nudge / Break-up',
      badge: '5',
      charLimit: 400,
      delayDays: 7,
      delayLabel: 'Wait 7 days if no reply',
      content:
        'Hi {{firstName}}, I know you are super busy, so I will pause follow-ups here. Always cheering for {{companyName}}\'s growth and would love to stay in touch for future analytics collaborations down the line!',
      isExpanded: false,
      statusDotColor: 'bg-slate-500',
    },
  ]);

  if (!isOpen) return null;

  const categories: SequenceCategory[] = [
    {
      id: 'open_jobs',
      label: 'Open Jobs',
      subcategories: [
        { id: 'hiring_team', label: 'Hiring Team' },
        { id: 'potential_referer', label: 'Potential Referer' },
        { id: 'top_management', label: 'Top Management' },
      ],
    },
    {
      id: 'target_companies',
      label: 'Target Companies',
      subcategories: [
        { id: 'tc_hiring_team', label: 'Hiring Team' },
        { id: 'tc_potential_referer', label: 'Potential Referer' },
        { id: 'tc_top_management', label: 'Top Management' },
      ],
    },
    {
      id: 'recruitment_firms',
      label: 'Recruitment Firms',
      subcategories: [
        { id: 'recruiter', label: 'Recruiter' },
        { id: 'account_lead', label: 'Account Lead' },
      ],
    },
  ];

  const toggleStepExpanded = (id: number) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, isExpanded: !step.isExpanded } : step))
    );
  };

  const handleContentChange = (id: number, text: string) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, content: text } : step))
    );
  };

  const handleInsertVariable = (id: number, variable: string) => {
    setSteps((prev) =>
      prev.map((step) => {
        if (step.id !== id) return step;
        return {
          ...step,
          content: `${step.content} {{${variable}}}`,
        };
      })
    );
    setShowVariableDropdown(null);
  };

  const handleResetStep = (id: number) => {
    if (id === 1) {
      handleContentChange(
        1,
        "Hi {{firstName}}! I noticed the {{jobTitle}} opening at {{companyName}} and have an interesting story about why I'm drawn to working with you. My experience aligns well with the JD. Can we connect?"
      );
    }
  };

  const handleSaveAll = () => {
    if (onSave) {
      onSave(steps);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  return (
    <div
      id="message-sequences-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="message-sequences-modal-container"
        className="w-full max-w-4xl bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Message Sequences</span>
            </h2>

            {/* Default vs Custom toggle pills */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs">
              <button
                onClick={() => setSequenceMode('Default')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  sequenceMode === 'Default'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Default
              </button>
              <button
                onClick={() => setSequenceMode('Custom')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  sequenceMode === 'Custom'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save All Changes</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left Sidebar + Right Sequences Editor */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Navigation Sidebar */}
          <div className="w-full md:w-64 bg-[#0B1120] border-r border-slate-800 p-4 space-y-5 overflow-y-auto shrink-0">
            {categories.map((cat) => (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span>{cat.label}</span>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </div>

                <div className="pl-3 space-y-1">
                  {cat.subcategories.map((sub) => {
                    const isSelected = selectedSubcategory === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setSelectedSubcategory(sub.id);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-900/40 text-blue-300 border border-blue-700/50 shadow-2xs font-bold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Variable Info helper card */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-2">
              <p>
                Variables like <code className="text-blue-400 bg-blue-950 px-1 py-0.5 rounded">{'{{firstName}}'}</code> auto-fill when messages are sent.
              </p>
            </div>

            {/* Target Role Chip Editor */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>jobTitle</span>
                <button
                  onClick={() => setIsEditingTitle(!isEditingTitle)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>

              {isEditingTitle ? (
                <input
                  type="text"
                  value={customJobTitle}
                  onChange={(e) => setCustomJobTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  autoFocus
                  className="w-full px-2 py-1 rounded bg-slate-800 border border-blue-500 text-xs text-white"
                />
              ) : (
                <div className="text-xs font-bold text-white">{customJobTitle}</div>
              )}
              <div className="text-[10px] text-slate-500">
                Uses job posting title, or your profile title if no job attached
              </div>
            </div>
          </div>

          {/* Right Main Sequence Editor */}
          <div className="flex-1 bg-[#0F172A] p-5 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Message Sequence</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  5 messages in sequence • Sent if no reply received
                </p>
              </div>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-4">
              {steps.map((step, idx) => {
                const charCount = step.content.length;
                const isOverLimit = step.charLimit ? charCount > step.charLimit : false;

                return (
                  <div key={step.id} className="space-y-3">
                    {/* Step Card */}
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
                      
                      {/* Step Header */}
                      <div className="flex items-center justify-between">
                        <div
                          onClick={() => toggleStepExpanded(step.id)}
                          className="flex items-center gap-2.5 cursor-pointer select-none"
                        >
                          <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-bold">
                            {step.badge}
                          </span>
                          <span className="text-sm font-bold text-white">{step.title}</span>
                          {!step.isExpanded && (
                            <span className="text-xs text-slate-400 font-mono">
                              {charCount} chars
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {step.id === 1 && (
                            <button
                              onClick={() => handleResetStep(step.id)}
                              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reset ⌵</span>
                            </button>
                          )}
                          <button
                            onClick={() => toggleStepExpanded(step.id)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            {step.isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Step Body */}
                      {step.isExpanded && (
                        <div className="space-y-3 pt-2">
                          {/* Premium Notice Banner */}
                          {step.premiumNotice && (
                            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>{step.premiumNotice}</span>
                            </div>
                          )}

                          {/* Message Editor Box */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span className="font-semibold">Message</span>
                              
                              {/* Variable Insertion Dropdown */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowVariableDropdown(
                                      showVariableDropdown === step.id ? null : step.id
                                    )
                                  }
                                  className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <Code className="w-3 h-3" />
                                  <span>{'{}'} Insert Variable</span>
                                </button>

                                {showVariableDropdown === step.id && (
                                  <div className="absolute right-0 mt-1 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 p-1 text-xs">
                                    {[
                                      { key: 'firstName', label: 'First Name' },
                                      { key: 'lastName', label: 'Last Name' },
                                      { key: 'jobTitle', label: 'Job Title' },
                                      { key: 'companyName', label: 'Company Name' },
                                      { key: 'mySkills', label: 'My Core Skills' },
                                    ].map((v) => (
                                      <button
                                        key={v.key}
                                        type="button"
                                        onClick={() => handleInsertVariable(step.id, v.key)}
                                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                                      >
                                        {'{{' + v.key + '}}'} - {v.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <textarea
                              rows={4}
                              value={step.content}
                              onChange={(e) => handleContentChange(step.id, e.target.value)}
                              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white leading-relaxed focus:outline-none focus:border-blue-500 font-sans resize-y"
                            />

                            {/* Character Count */}
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-500">
                                Click variables to highlight placeholders
                              </span>
                              <span
                                className={`font-mono font-bold ${
                                  isOverLimit ? 'text-rose-400' : 'text-slate-400'
                                }`}
                              >
                                {charCount} / {step.charLimit || 500} characters
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Timeline Node Connector */}
                    {idx < steps.length - 1 && (
                      <div className="flex items-center justify-center my-1">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-400 shadow-2xs">
                          <Clock className="w-3 h-3 text-blue-400" />
                          <span>{steps[idx + 1].delayLabel}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
