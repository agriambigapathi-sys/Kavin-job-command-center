import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Plus,
  Bell,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  Send,
  User as UserIcon,
} from 'lucide-react';
import { NavSection, UserProfile, ActivityLog, FollowUp, Interview } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentSection?: NavSection;
  activeTab?: NavSection;
  onSelectSection?: (section: NavSection) => void;
  onOpenMobileSidebar?: () => void;
  onToggleMobileSidebar?: () => void;
  onOpenAddJobModal?: () => void;
  onOpenOutreachModal?: () => void;
  userProfile?: UserProfile;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  followUps?: FollowUp[];
  interviews?: Interview[];
  activityLogs?: ActivityLog[];
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  activeTab,
  onSelectSection,
  onOpenMobileSidebar,
  onToggleMobileSidebar,
  onOpenAddJobModal,
  onOpenOutreachModal,
  userProfile,
  searchQuery = '',
  onSearchChange = (_q: string) => {},
  followUps = [],
  interviews = [],
  activityLogs = [],
}) => {
  const { user } = useAuth();
  const current = activeTab || currentSection || 'dashboard';
  const handleOpenMobile = onToggleMobileSidebar || onOpenMobileSidebar;
  const handleSelect = (sec: NavSection) => {
    if (onSelectSection) onSelectSection(sec);
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  const urgentFollowUps = followUps.filter((f) => f.status === 'due_today' || f.status === 'overdue');
  const upcomingInterviews = interviews.filter((i) => i.status === 'upcoming');
  const totalAlerts = (urgentFollowUps.length || 0) + (upcomingInterviews.length || 0);

  const sectionTitles: Record<NavSection, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Command Dashboard',
      subtitle: 'Overview of pipeline velocity, response rates, and high-priority action items.',
    },
    jobs: {
      title: 'Saved & Discovered Jobs',
      subtitle: 'Personal repository of target positions with match scores and tracking.',
    },
    'jd-analyser': {
      title: 'AI Job Description Analyser',
      subtitle: 'Evaluate JD match percentage, ATS compliance, skill gaps, and STAR bullet tailoring with Gemini 3.7 Flash.',
    },
    resumes: {
      title: 'Resume Versions & Master Vault',
      subtitle: 'Manage target resume versions, format previews, and optimize bullet points with AI.',
    },
    'cover-letters': {
      title: 'AI Cover Letter Studio',
      subtitle: 'Generate tailored, high-converting cover letters matching target role and tone.',
    },
    applications: {
      title: 'Application Pipeline & Stages',
      subtitle: 'Active funnel tracker from initial application through final offer negotiation.',
    },
    contacts: {
      title: 'Networking & Recruiter CRM',
      subtitle: 'Maintain relationships with hiring managers, talent partners, and referrals.',
    },
    'follow-ups': {
      title: 'Follow-ups & Outreach Cadence',
      subtitle: 'Timely reminders for post-interview thank you notes and recruiter check-ins.',
    },
    interviews: {
      title: 'Interview Command & Prep',
      subtitle: 'Interview schedule, prep notes, and company-specific mock technical questions.',
    },
    analytics: {
      title: 'Search Velocity & Funnel Analytics',
      subtitle: 'Deep-dive conversion metrics, response rates, and salary distributions.',
    },
    settings: {
      title: 'Profile & Search Settings',
      subtitle: 'Configure target compensation, remote preferences, core skills, and credentials.',
    },
  };

  const currentMeta = sectionTitles[current] || {
    title: 'Job Command Center',
    subtitle: 'Private personal job-search management system.',
  };

  const displayName = user?.displayName || userProfile?.name || 'User';
  const displayPhoto = user?.photoURL || userProfile?.photoURL;

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 flex flex-col bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Mobile menu button & Title */}
        <div className="flex items-center gap-3">
          {handleOpenMobile && (
            <button
              id="open-mobile-sidebar-btn"
              onClick={handleOpenMobile}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 lg:hidden border border-slate-700"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {currentMeta.title}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Firestore Secure
              </span>
            </div>
            <p className="hidden md:block text-xs text-slate-400 font-normal truncate max-w-xl">
              {currentMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Search, Action Buttons & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search */}
          <div className="relative hidden sm:block w-44 lg:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search in records..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Outreach Action */}
          {onOpenOutreachModal && (
            <button
              id="quick-outreach-btn"
              onClick={onOpenOutreachModal}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-purple-400" />
              <span>Quick Outreach</span>
            </button>
          )}

          {/* Add Job / Application Modal Trigger */}
          {onOpenAddJobModal && (
            <button
              id="header-add-job-btn"
              onClick={onOpenAddJobModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all shadow-md shadow-cyan-950/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Add Job / App</span>
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-xs">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Notification Menu Panel */}
            {showNotifications && (
              <div
                id="notifications-popup-panel"
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-4 text-xs"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Action Center & Alerts</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{currentTime}</span>
                </div>

                <div className="py-2.5 space-y-2 max-h-80 overflow-y-auto">
                  {followUps.length > 0 ? (
                    followUps.slice(0, 3).map((fu) => (
                      <div
                        key={fu.id}
                        onClick={() => {
                          if (handleSelect) handleSelect('follow-ups');
                          setShowNotifications(false);
                        }}
                        className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between font-semibold text-slate-200">
                          <span>{fu.company}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {fu.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {fu.type} with {fu.recipientName}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-slate-500 text-xs">
                      No active alerts. All items up to date!
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Firestore Synchronized</span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Photo & Identifier */}
          <div
            onClick={() => handleSelect('settings')}
            className="flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer group"
          >
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt={displayName}
                className="w-8 h-8 rounded-full border border-slate-700 group-hover:border-cyan-400 object-cover transition-colors"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 group-hover:border-cyan-400 flex items-center justify-center font-bold text-xs">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

