import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Layers,
  FileSearch,
  FileText,
  Mail,
  CheckSquare,
  Users,
  Bell,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Palette,
  Sparkles,
} from 'lucide-react';
import { NavSection, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LinkedInToolType } from './LinkedInHubModal';

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
    [key: string]: any;
  };
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  onOpenThemeModal?: () => void;
  onOpenLinkedInTool?: (tool?: LinkedInToolType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  activeTab,
  setActiveTab,
  userProfile,
  badges,
  mobileOpen,
  onCloseMobile,
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed = false,
  setIsCollapsed,
  onOpenThemeModal,
  onOpenLinkedInTool,
}) => {
  const { user } = useAuth();
  const { preset } = useTheme();
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
    { id: 'jobs' as NavSection, label: 'Jobs', icon: Briefcase, badge: badges?.jobs },
    { id: 'applications' as NavSection, label: 'Job Pipeline', icon: Layers, badge: badges?.applications },
    { id: 'jd-analyser' as NavSection, label: 'JD Analyzer', icon: FileSearch },
    { id: 'resumes' as NavSection, label: 'Resume Studio', icon: FileText },
    { id: 'cover-letters' as NavSection, label: 'Cover Letters', icon: Mail },
    { id: 'ats-checker' as NavSection, label: 'Applications', icon: CheckSquare },
    { id: 'contacts' as NavSection, label: 'Contacts', icon: Users },
    { id: 'follow-ups' as NavSection, label: 'Follow-ups', icon: Bell, badge: badges?.followUps },
    { id: 'interviews' as NavSection, label: 'Interviews', icon: Calendar, badge: badges?.interviews },
    { id: 'analytics' as NavSection, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as NavSection, label: 'Settings', icon: Settings },
  ];

  const displayName = user?.displayName || userProfile?.name || 'Kavin';

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={handleClose}
        />
      )}

      {/* Main Sidebar */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isCollapsed ? 'w-18 min-w-[4.5rem] max-w-[4.5rem]' : 'w-60 min-w-[15rem] max-w-[15rem]'
        } ${isMobile ? 'translate-x-0 !w-60' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Brand Header */}
        <div className="flex items-center justify-between px-4 py-4.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo Badge */}
            <div
              style={{ backgroundColor: preset.primary }}
              className="w-8 h-8 rounded-xl text-white flex items-center justify-center shadow-xs shrink-0 font-bold text-sm tracking-tighter"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                  {displayName}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-400 truncate">
                  Job Command Center
                </div>
              </div>
            )}
          </div>

          {/* Mobile close */}
          {isMobile && (
            <button
              onClick={handleClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = current === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3 py-2'
                } rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50/80 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
                title={item.label}
              >
                <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* LinkedIn Power Suite Sidebar Action matching user request */}
          {onOpenLinkedInTool && (
            <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                id="sidebar-linkedin-tools-btn"
                onClick={() => onOpenLinkedInTool('import_url')}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3 py-2.5'
                } rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600/10 to-indigo-600/10 hover:from-blue-600/20 hover:to-indigo-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-2xs transition-all cursor-pointer group`}
                title="Open LinkedIn AI Power Suite"
              >
                <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
                  <div className="w-5 h-5 rounded-md bg-[#0A66C2] text-white flex items-center justify-center font-bold text-[10px] shrink-0 group-hover:scale-105 transition-transform">
                    in
                  </div>
                  {!isCollapsed && <span className="truncate">LinkedIn Tools</span>}
                </div>

                {!isCollapsed && (
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-blue-600 text-white tracking-wider">
                    6 Tools
                  </span>
                )}
              </button>
            </div>
          )}
        </nav>

        {/* Bottom Bar with Theme Picker & Collapse Button */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
          {onOpenThemeModal && (
            <button
              onClick={onOpenThemeModal}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
              } rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer`}
              title="Change Global Theme Colors"
            >
              <Palette className="w-4 h-4 text-purple-500" />
              {!isCollapsed && <span>Theme Colors</span>}
            </button>
          )}

          {setIsCollapsed && (
            <button
              id="sidebar-collapse-btn"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
              } rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer`}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
