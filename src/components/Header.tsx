import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  Palette,
  ChevronDown,
  Sparkles,
  Linkedin,
  Plus,
  PanelRightClose,
  PanelRightOpen,
  User,
  Settings,
  LogOut,
  Send,
} from 'lucide-react';
import { NavSection, UserProfile, FollowUp, Interview, ActivityLog } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LinkedInToolType } from './LinkedInHubModal';

interface HeaderProps {
  currentSection?: NavSection;
  activeTab?: NavSection;
  onSelectSection?: (section: NavSection) => void;
  onOpenMobileSidebar?: () => void;
  onToggleMobileSidebar?: () => void;
  onOpenAddJobModal?: () => void;
  onOpenOutreachModal?: () => void;
  onOpenLinkedInTool?: (tool: LinkedInToolType) => void;
  onOpenNovaCopilot?: () => void;
  onOpenThemeModal?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
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
  onOpenLinkedInTool,
  onOpenNovaCopilot,
  onOpenThemeModal,
  userProfile,
  searchQuery = '',
  onSearchChange = (_q: string) => {},
  followUps = [],
  interviews = [],
}) => {
  const { user, signOut } = useAuth();
  const { mode, toggleMode, preset } = useTheme();
  const current = activeTab || currentSection || 'dashboard';
  const handleOpenMobile = onToggleMobileSidebar || onOpenMobileSidebar;

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLinkedInDropdown, setShowLinkedInDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const linkedInDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (linkedInDropdownRef.current && !linkedInDropdownRef.current.contains(e.target as Node)) {
        setShowLinkedInDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const sectionDisplayNames: Record<NavSection, string> = {
    dashboard: 'Dashboard',
    jobs: 'Jobs',
    applications: 'Job Pipeline',
    'jd-analyser': 'JD Analyzer',
    resumes: 'Resume Studio',
    'cover-letters': 'Cover Letters',
    'ats-checker': 'Applications',
    contacts: 'Contacts',
    'follow-ups': 'Follow-ups',
    interviews: 'Interviews',
    discovery: 'Job Hunter AI',
    'salary-negotiator': 'Salary Negotiator',
    'app-assistant': 'Application Copilot',
    analytics: 'Analytics',
    settings: 'Settings',
  };

  const displayName = user?.displayName || userProfile?.name || 'Kavin';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'KA';

  const alertsCount = followUps.filter((f) => f.status === 'due_today' || f.status === 'overdue').length;

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3 transition-colors"
    >
      {/* Left: Hamburger + Section Name */}
      <div className="flex items-center gap-3">
        {handleOpenMobile && (
          <button
            onClick={handleOpenMobile}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          {sectionDisplayNames[current] || 'Dashboard'}
        </h1>
      </div>

      {/* Center / Right Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Search Bar with ⌘ K */}
        <div className="relative hidden md:flex items-center w-56 lg:w-72">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search jobs, companies..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-11 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <div className="absolute right-2.5 px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-[10px] font-mono text-slate-500 dark:text-slate-400 pointer-events-none">
            ⌘ K
          </div>
        </div>

        {/* LinkedIn Power Tools Dropdown */}
        {onOpenLinkedInTool && (
          <div className="relative" ref={linkedInDropdownRef}>
            <button
              onClick={() => setShowLinkedInDropdown(!showLinkedInDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] dark:text-[#70b5f9] border border-[#0A66C2]/30 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="LinkedIn Integration & Outreach Tools"
            >
              <Linkedin className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">LinkedIn Tools</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showLinkedInDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showLinkedInDropdown && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2.5 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                    LinkedIn Power Suite
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                    nxtjob.ai engine
                  </span>
                </div>

                <div className="py-1.5 space-y-1">
                  <button
                    onClick={() => {
                      setShowLinkedInDropdown(false);
                      onOpenLinkedInTool('import_url');
                    }}
                    className="w-full flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 group-hover:scale-105 transition-transform">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">1-Click LinkedIn URL Ingest</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Import jobs or recruiter profiles instantly</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowLinkedInDropdown(false);
                      onOpenLinkedInTool('outreach_sequence');
                    }}
                    className="w-full flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">Customized Template Messages</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Connection notes, follow-ups & referrals</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowLinkedInDropdown(false);
                      onOpenLinkedInTool('hiring_manager_finder');
                    }}
                    className="w-full flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 group-hover:scale-105 transition-transform">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">Recruiter & Manager Finder</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Target engineering leads & recruiters</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowLinkedInDropdown(false);
                      onOpenLinkedInTool('inmail_crafter');
                    }}
                    className="w-full flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 group-hover:scale-105 transition-transform">
                      <Send className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">Executive InMail Crafter</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Value-first cold InMails with high response</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowLinkedInDropdown(false);
                      onOpenLinkedInTool('boolean_builder');
                    }}
                    className="w-full flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">Boolean X-Ray Search</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Bypass standard LinkedIn limits</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Add Job Button */}
        {onOpenAddJobModal && (
          <button
            onClick={onOpenAddJobModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Job</span>
          </button>
        )}

        {/* Global Theme Palette Switcher */}
        {onOpenThemeModal && (
          <button
            onClick={onOpenThemeModal}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
            title="Configure Global Theme Colors (All Pages)"
          >
            <Palette className="w-4 h-4 text-purple-500" />
          </button>
        )}

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleMode}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
          title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {mode === 'light' ? (
            <Moon className="w-4 h-4 text-slate-600" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Notifications Bell */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {alertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">Notifications</span>
                <span className="text-[10px] text-slate-400">{alertsCount} action items</span>
              </div>
              <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
                {followUps.slice(0, 3).map((f) => (
                  <div
                    key={f.id}
                    onClick={() => {
                      if (onSelectSection) onSelectSection('follow-ups');
                      setShowNotifications(false);
                    }}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <div className="font-semibold text-slate-900 dark:text-white">{f.company}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Follow-up due: {f.recipientName}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Circle (KA) */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {initials}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* User Profile Menu */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-2 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white">{displayName}</div>
                <div className="text-[10px] text-slate-400 truncate">{userProfile?.email || 'ambigapathikavin2@gmail.com'}</div>
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    if (onSelectSection) onSelectSection('settings');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Profile & Settings</span>
                </button>

                {onOpenThemeModal && (
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenThemeModal();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                  >
                    <Palette className="w-3.5 h-3.5 text-purple-500" />
                    <span>Theme Customizer</span>
                  </button>
                )}

                {signOut && (
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-medium cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right slide panel trigger (Nova AI) */}
        {onOpenNovaCopilot && (
          <button
            onClick={onOpenNovaCopilot}
            className="hidden sm:flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer"
            title="Toggle Nova AI Copilot"
          >
            <Sparkles className="w-4 h-4 text-cyan-500" />
          </button>
        )}

      </div>
    </header>
  );
};
