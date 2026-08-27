import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  FileText,
  FileEdit,
  Layers,
  Users,
  Clock,
  Calendar,
  BarChart3,
  Settings,
  Shield,
  Zap,
  ChevronRight,
  X,
} from 'lucide-react';
import { NavSection, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentSection?: NavSection;
  onSelectSection?: (section: NavSection) => void;
  activeTab?: NavSection;
  setActiveTab?: (tab: NavSection) => void;
  userProfile?: UserProfile;
  badges?: {
    jobs?: number;
    applications?: number;
    followUps?: number;
    interviews?: number;
    gmail?: number;
    [key: string]: any;
  };
  followUpsDueCount?: number;
  upcomingInterviewsCount?: number;
  activeOffersCount?: number;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  activeTab,
  setActiveTab,
  userProfile,
  badges,
  followUpsDueCount = badges?.followUps ?? 0,
  upcomingInterviewsCount = badges?.interviews ?? 0,
  activeOffersCount = 0,
  mobileOpen,
  onCloseMobile,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { user, signOut } = useAuth();
  const current = activeTab || currentSection || 'dashboard';
  const handleSelect = (section: NavSection) => {
    if (setActiveTab) setActiveTab(section);
    if (onSelectSection) onSelectSection(section);
    if (onCloseMobile) onCloseMobile();
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const isMobile = isMobileOpen !== undefined ? isMobileOpen : (mobileOpen || false);
  const handleClose = () => {
    if (onCloseMobile) onCloseMobile();
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const navItems = [
    { id: 'dashboard' as NavSection, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs' as NavSection, label: 'Jobs', icon: Briefcase, badge: badges?.jobs !== undefined ? `${badges.jobs}` : '0' },
    { id: 'jd-analyser' as NavSection, label: 'JD Analyser', icon: Sparkles, highlight: true },
    { id: 'resumes' as NavSection, label: 'Resumes', icon: FileText },
    { id: 'cover-letters' as NavSection, label: 'Cover Letters', icon: FileEdit },
    { id: 'applications' as NavSection, label: 'Applications', icon: Layers, badge: badges?.applications !== undefined ? `${badges.applications}` : '0' },
    { id: 'contacts' as NavSection, label: 'Contacts', icon: Users },
    {
      id: 'follow-ups' as NavSection,
      label: 'Follow-ups',
      icon: Clock,
      badge: followUpsDueCount > 0 ? `${followUpsDueCount} due` : undefined,
      badgeColor: followUpsDueCount > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold' : undefined,
    },
    {
      id: 'interviews' as NavSection,
      label: 'Interviews',
      icon: Calendar,
      badge: upcomingInterviewsCount > 0 ? `${upcomingInterviewsCount}` : undefined,
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold',
    },
    { id: 'analytics' as NavSection, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as NavSection, label: 'Settings', icon: Settings },
  ];

  const displayName = user?.displayName || userProfile?.name || 'Candidate';
  const displayEmail = user?.email || userProfile?.email || 'user@commandcenter.io';
  const displayPhoto = user?.photoURL || userProfile?.photoURL;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && (
        <div
          id="mobile-sidebar-backdrop"
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs lg:hidden"
          onClick={handleClose}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-inner">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-tight">
                Job Command Center
              </h1>
              <p className="text-[11px] text-slate-400">Career Workspace</p>
            </div>
          </div>
          <button
            id="close-mobile-sidebar-btn"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Private Personal System Status */}
        <div className="px-4 pt-3 pb-1">
          <div className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-medium truncate max-w-[130px]">
                {userProfile?.searchStatus || 'Active Search'}
              </span>
            </div>
            {activeOffersCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                {activeOffersCount} Offers
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">Authenticated</span>
            )}
          </div>
        </div>

        {/* Nav Items List */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = current === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all group ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[10px] font-mono text-slate-400 w-4 text-right">
                    {index + 1}.
                  </span>
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : item.highlight
                        ? 'bg-purple-500/20 text-purple-300 group-hover:bg-purple-500/30'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`truncate ${item.highlight && !isActive ? 'text-purple-300 font-medium' : ''}`}>
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${
                        item.badgeColor || 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* User Profile Mini Footer Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-900">
          <div
            id="sidebar-user-card"
            onClick={() => handleSelect('settings')}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt={displayName}
                  className="w-8 h-8 rounded-full border border-slate-600 object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{displayName}</div>
                <div className="text-[10px] text-slate-400 truncate">{displayEmail}</div>
              </div>
            </div>
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
};


