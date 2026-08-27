import React, { useState } from 'react';
import {
  X,
  Search,
  Building2,
  Users,
  UserCheck,
  Briefcase,
  ExternalLink,
  MapPin,
  Sparkles,
  Check,
  Copy,
  ChevronDown,
  Linkedin,
  MessageSquare,
  GraduationCap,
  Award,
  Filter,
} from 'lucide-react';
import { Contact } from '../types';

interface ProfessionalProfile {
  id: string;
  name: string;
  degree: '1st' | '2nd' | '3rd';
  role: string;
  company: string;
  location: string;
  avatar: string;
  category: 'Employees' | 'Recruiters' | 'Top Management';
  alumniType?: 'Work Alumni' | 'Education Alumni' | 'All';
  linkedinUrl: string;
  mutualConnections?: number;
}

interface FindNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName?: string;
  company?: string;
  jobRole?: string;
  role?: string;
  onConnectSuccess?: (newContact: Contact) => void;
  onAddContact?: (newContact: Contact) => void;
  onOpenMessageSequences?: () => void;
}

export const FindNetworkModal: React.FC<FindNetworkModalProps> = ({
  isOpen,
  onClose,
  companyName,
  company,
  jobRole,
  role,
  onConnectSuccess,
  onAddContact,
  onOpenMessageSequences,
}) => {
  const targetCompany = companyName || company || 'Target Company';
  const targetRole = jobRole || role || 'Data Analyst';
  const [activeTab, setActiveTab] = useState<'Employees' | 'Recruiters' | 'Top Management'>('Employees');
  const [activeAlumniFilter, setActiveAlumniFilter] = useState<'All' | 'Work Alumni' | 'Education Alumni'>('All');
  const [searchQuery, setSearchQuery] = useState(targetRole);
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('Default Sequence');
  const [connectedIds, setConnectedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [connectingProfile, setConnectingProfile] = useState<ProfessionalProfile | null>(null);

  if (!isOpen) return null;

  // Rich professional candidate database tailored to the company and role
  const mockProfessionals: ProfessionalProfile[] = [
    {
      id: 'p-1',
      name: 'Manisha Jain',
      degree: '3rd',
      role: `Associate Consultant at ${companyName || 'Time Hack Consulting'}`,
      company: companyName || 'Time Hack Consulting',
      location: 'Bengaluru, Karnataka, India',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      category: 'Employees',
      alumniType: 'All',
      linkedinUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent('Manisha Jain ' + companyName)}`,
      mutualConnections: 4,
    },
    {
      id: 'p-2',
      name: 'Tanushree K.',
      degree: '2nd',
      role: `Founding Member @ ${companyName || 'Time Hack Consulting'} | Hustler 💪🚀`,
      company: companyName || 'Time Hack Consulting',
      location: 'Bengaluru, Karnataka, India',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      category: 'Employees',
      alumniType: 'Work Alumni',
      linkedinUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent('Tanushree K ' + companyName)}`,
      mutualConnections: 12,
    },
    {
      id: 'p-3',
      name: 'Saurabh Verma',
      degree: '2nd',
      role: `Senior ${jobRole || 'Data Analyst'} & BI Lead @ ${companyName || 'Time Hack Consulting'}`,
      company: companyName || 'Time Hack Consulting',
      location: 'Mumbai / Remote',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      category: 'Employees',
      alumniType: 'Education Alumni',
      linkedinUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent('Saurabh Verma ' + companyName)}`,
      mutualConnections: 8,
    },
    {
      id: 'p-4',
      name: 'Priyanka Ghosh',
      degree: '2nd',
      role: `Lead Talent Acquisition Partner @ ${companyName || 'Time Hack Consulting'} (Hiring ${jobRole || 'Data Analyst'})`,
      company: companyName || 'Time Hack Consulting',
      location: 'Bengaluru, Karnataka',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      category: 'Recruiters',
      alumniType: 'All',
      linkedinUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent('Priyanka Ghosh Recruiter ' + companyName)}`,
      mutualConnections: 19,
    },
    {
      id: 'p-5',
      name: 'Vikramaditya Nair',
      degree: '3rd',
      role: `Head of People & Engineering Hiring @ ${companyName || 'Time Hack Consulting'}`,
      company: companyName || 'Time Hack Consulting',
      location: 'Delhi NCR / Hybrid',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      category: 'Recruiters',
      alumniType: 'Work Alumni',
      linkedinUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent('Vikramaditya Talent ' + companyName)}`,
      mutualConnections: 6,
    },
    {
      id: 'p-6',
      name: 'Rajesh Subramanian',
      degree: '2nd',
      role: `VP of Analytics & Engineering Strategy @ ${companyName || 'Time Hack Consulting'}`,
      company: companyName || 'Time Hack Consulting',
      location: 'Bengaluru / San Francisco',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      category: 'Top Management',
      alumniType: 'All',
      linkedinUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent('Rajesh VP ' + companyName)}`,
      mutualConnections: 24,
    },
    {
      id: 'p-7',
      name: 'Aditi Deshmukh',
      degree: '3rd',
      role: `Director of Product Operations @ ${companyName || 'Time Hack Consulting'}`,
      company: companyName || 'Time Hack Consulting',
      location: 'Hyderabad, India',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      category: 'Top Management',
      alumniType: 'Education Alumni',
      linkedinUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent('Aditi Director ' + companyName)}`,
      mutualConnections: 11,
    },
    {
      id: 'p-8',
      name: 'Nitin Sharma',
      degree: '2nd',
      role: `Principal Data Engineer & Analytics Architect @ ${companyName || 'Time Hack Consulting'}`,
      company: companyName || 'Time Hack Consulting',
      location: 'Bengaluru, India',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      category: 'Employees',
      alumniType: 'Work Alumni',
      linkedinUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent('Nitin Sharma ' + companyName)}`,
      mutualConnections: 7,
    },
  ];

  const filteredProfessionals = mockProfessionals.filter((p) => {
    const matchesCategory = p.category === activeTab;
    const matchesAlumni = activeAlumniFilter === 'All' || p.alumniType === activeAlumniFilter || p.alumniType === 'All';
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesAlumni && matchesSearch;
  });

  const getCustomMessageNote = (profile: ProfessionalProfile) => {
    const firstName = profile.name.split(' ')[0];
    return `Hi ${firstName}! I noticed the ${jobRole || 'Data Analyst'} opening at ${companyName || 'your team'} and have an interesting story about why I'm drawn to working with you. My experience aligns well with the JD. Can we connect?`;
  };

  const handleConnectClick = (profile: ProfessionalProfile) => {
    setConnectingProfile(profile);
    const messageNote = getCustomMessageNote(profile);

    // Copy personalized connection note to clipboard
    navigator.clipboard.writeText(messageNote);
    setCopiedId(profile.id);
    setConnectedIds((prev) => ({ ...prev, [profile.id]: true }));

    // Create a new contact in the SENT networking board
    const newContact: Contact = {
      id: `conn-${Date.now()}-${profile.id}`,
      name: profile.name,
      role: profile.role,
      company: targetCompany || profile.company,
      email: `${profile.name.toLowerCase().replace(/\s+/g, '.')}@${(targetCompany || profile.company).toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      linkedin: profile.linkedinUrl,
      relationship: profile.category === 'Recruiters' ? 'Recruiter' : profile.category === 'Top Management' ? 'Executive Lead' : 'Peer',
      lastContactDate: new Date().toISOString().split('T')[0],
      notes: `Sent connection note via nxtjob Sequence: "${messageNote.slice(0, 80)}..."`,
      status: 'Active',
      avatarColor: 'bg-blue-600',
    };
    (newContact as any).networkStage = 'SENT';
    (newContact as any).sentTimeAgo = 'Just now';
    (newContact as any).sequenceStep = 1;
    (newContact as any).targetTag = 'Open Job';

    if (onConnectSuccess) {
      onConnectSuccess(newContact);
    }
    if (onAddContact) {
      onAddContact(newContact);
    }

    setTimeout(() => {
      setCopiedId(null);
    }, 3500);
  };

  return (
    <div
      id="find-network-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="find-network-modal-container"
        className="w-full max-w-2xl bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Find people at</span>
                <span className="text-blue-400">{targetCompany}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {targetRole} · {mockProfessionals.length} professionals available
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs: Employees / Recruiters / Top Management */}
        <div className="px-5 pt-4 border-b border-slate-800 bg-[#0B1120] flex items-center gap-2">
          <button
            onClick={() => setActiveTab('Employees')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'Employees'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Employees</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {mockProfessionals.filter((p) => p.category === 'Employees').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('Recruiters')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'Recruiters'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🤠</span>
            <span>Recruiters</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {mockProfessionals.filter((p) => p.category === 'Recruiters').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('Top Management')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'Top Management'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>👔</span>
            <span>Top Management</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700">
              BETA
            </span>
          </button>
        </div>

        {/* Sub-Filters: All / Work Alumni / Education Alumni */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-[#0B1120]/60 flex items-center gap-2">
          {(['All', 'Work Alumni', 'Education Alumni'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveAlumniFilter(filter)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeAlumniFilter === filter
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-800 bg-[#0F172A] flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role or name..."
              className="w-full pl-3 pr-20 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => {}}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Search
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-medium text-slate-300">
            <span>{companyName || 'Time Hack Consulting'}</span>
            <button
              onClick={() => {}}
              className="text-slate-400 hover:text-white"
              title="Remove filter"
            >
              ✕
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>+ Location</span>
            </button>

            {showLocationDropdown && (
              <div className="absolute right-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 p-1 text-xs">
                {['All Locations', 'Bengaluru, India', 'Mumbai / Pune', 'Delhi NCR', 'Remote / US'].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setLocationFilter(loc);
                      setShowLocationDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div className="px-5 py-2.5 bg-[#0B1120]/40 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/50">
          <span>{filteredProfessionals.length} professionals found</span>
          <a
            href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
              `${companyName} ${searchQuery || jobRole}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
          >
            <span>View all on LinkedIn</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Profiles List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-800/60">
          {filteredProfessionals.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No matching professionals found for this filter. Try adjusting your search query or tab.
            </div>
          ) : (
            filteredProfessionals.map((prof) => {
              const isConnected = connectedIds[prof.id];
              const isCopied = copiedId === prof.id;

              return (
                <div
                  key={prof.id}
                  className="pt-3 first:pt-0 flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={prof.avatar}
                        alt={prof.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 group-hover:border-blue-500/60 transition-colors"
                      />
                      <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded text-[9px] font-bold bg-slate-800 border border-slate-600 text-slate-300">
                        {prof.degree}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">{prof.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({prof.degree})</span>
                      </div>
                      <p className="text-xs text-slate-300 truncate max-w-md">{prof.role}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px]">
                        <a
                          href={prof.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                        >
                          <span>View Profile →</span>
                        </a>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{prof.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Connect Action Button */}
                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => handleConnectClick(prof)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                        isConnected
                          ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600/30'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                      }`}
                    >
                      {isConnected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Connected</span>
                        </>
                      ) : (
                        <>
                          <Linkedin className="w-3.5 h-3.5 fill-current" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Live Copied Notification Toast */}
        {copiedId && (
          <div className="px-5 py-2.5 bg-blue-950/80 border-t border-blue-800 text-xs flex items-center justify-between text-blue-200 animate-in slide-in-from-bottom duration-150">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>Note copied to clipboard!</strong> Added connection to <strong>Sent</strong> pipeline.
              </span>
            </div>
            <a
              href={mockProfessionals.find((p) => p.id === copiedId)?.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1 text-[11px]"
            >
              <span>Open LinkedIn & Paste</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Modal Footer: Template Selector */}
        <div className="p-4 border-t border-slate-800 bg-[#0B1120] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Message template:</span>
            <div className="relative">
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Default Sequence">Default Sequence (5 Steps)</option>
                <option value="Hiring Manager Direct">Hiring Manager Direct</option>
                <option value="Alumni Referral Ask">Alumni Referral Ask</option>
                <option value="Recruiter Pitch">Recruiter Pitch</option>
              </select>
            </div>
          </div>

          {onOpenMessageSequences && (
            <button
              onClick={() => {
                onClose();
                onOpenMessageSequences();
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>Edit Sequences ✎</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
