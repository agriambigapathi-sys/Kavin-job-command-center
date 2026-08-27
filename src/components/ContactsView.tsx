import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Linkedin,
  Clock,
  Calendar,
  Send,
  Building,
  Building2,
  CheckCircle2,
  Trash2,
  LayoutGrid,
  List,
  Sparkles,
  ExternalLink,
  Tag,
  ArrowRight,
  Filter,
  RefreshCw,
  AlertCircle,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Crown,
  Briefcase,
  Check,
  Copy,
  MessageSquare,
  FileText,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { Contact } from '../types';
import { MessageSequencesModal } from './MessageSequencesModal';
import { FindNetworkModal } from './FindNetworkModal';

interface ContactsViewProps {
  contacts?: Contact[];
  onAddContact?: (contact: Contact) => void;
  onUpdateContact?: (contact: Contact) => void;
  onDeleteContact?: (id: string) => void;
  onOpenOutreachForContact?: (contact: Contact) => void;
  onOpenLinkedInTool?: (tool: any) => void;
  onNavigateToTab?: (tab: any) => void;
}

export type NetworkStage = 'SENT' | 'ACCEPTED' | 'ENGAGEMENT';

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts = [],
  onAddContact = (_contact: Contact) => {},
  onUpdateContact = (_contact: Contact) => {},
  onDeleteContact = (_id: string) => {},
  onOpenOutreachForContact = (_contact: Contact) => {},
  onOpenLinkedInTool,
  onNavigateToTab,
}) => {
  const [activeTopTab, setActiveTopTab] = useState<'My Jobs' | 'Target Companies' | 'Recruitment Agencies' | 'My Network'>('My Network');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSequenceModalOpen, setIsSequenceModalOpen] = useState(false);
  const [isFindNetworkOpen, setIsFindNetworkOpen] = useState(false);
  const [findNetworkContext, setFindNetworkContext] = useState({ company: 'Time Hack Consulting', role: 'Data Analyst' });
  const [expandedTasksMap, setExpandedTasksMap] = useState<Record<string, boolean>>({
    'c-nihar': true,
    'c-athmiya': true,
  });
  const [completedTasksMap, setCompletedTasksMap] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state for manual Add Connection
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [relationship, setRelationship] = useState<Contact['relationship']>('Hiring Manager');
  const [stage, setStage] = useState<NetworkStage>('SENT');
  const [notes, setNotes] = useState('');

  // Default seed contacts matching Screenshot 4
  const defaultNetworkContacts: Contact[] = [
    {
      id: 'c-serge',
      name: 'Serge Shine',
      role: 'Global P&L Leader | LHH Executive Committee Member | Strategic Growth Partner',
      company: 'Jobgether',
      email: 'serge.shine@jobgether.com',
      linkedin: 'https://www.linkedin.com/search/results/people/?keywords=Serge%20Shine%20Jobgether',
      relationship: 'Hiring Manager',
      lastContactDate: '2026-08-26',
      notes: 'Outreach sent for Analytics and Growth roles.',
      status: 'Active',
      avatarColor: 'bg-blue-600',
      ...( {
        networkStage: 'SENT',
        targetTag: 'Open Job',
        timeAgo: '20h',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      } as any ),
    },
    {
      id: 'c-ryan',
      name: 'Ryan Seeras',
      role: 'CPO & Co-Founder at Jobgether | AI + HRTech Product Visionary',
      company: 'Jobgether',
      email: 'ryan.seeras@jobgether.com',
      linkedin: 'https://www.linkedin.com/search/results/people/?keywords=Ryan%20Seeras%20Jobgether',
      relationship: 'Hiring Manager',
      lastContactDate: '2026-08-26',
      notes: 'Followed up with personalized data analytics portfolio.',
      status: 'Active',
      avatarColor: 'bg-indigo-600',
      ...( {
        networkStage: 'SENT',
        targetTag: 'Open Job',
        timeAgo: '20h',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      } as any ),
    },
    {
      id: 'c-deenaa',
      name: 'Deenaa Mary J',
      role: 'Head of Talent Acquisition & Technical Recruitment Specialist',
      company: 'Jobgether',
      email: 'deenaa.mary@jobgether.com',
      linkedin: 'https://www.linkedin.com/search/results/people/?keywords=Deenaa%20Mary%20Jobgether',
      relationship: 'Hiring Manager',
      lastContactDate: '2026-08-25',
      notes: 'Target Company recruiter connection sent.',
      status: 'Active',
      avatarColor: 'bg-purple-600',
      ...( {
        networkStage: 'SENT',
        targetTag: 'Target Company',
        timeAgo: '1d ago',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      } as any ),
    },
    {
      id: 'c-nihar',
      name: 'Nihar Ranjan Ghatuari',
      role: 'Data Analyst @ Flipkart | Ex - Apexon | BI & SQL Enthusiast',
      company: 'Myntra',
      email: 'nihar.ghatuari@flipkart.com',
      linkedin: 'https://www.linkedin.com/search/results/people/?keywords=Nihar%20Ranjan%20Ghatuari',
      relationship: 'Referral',
      lastContactDate: '2026-08-26',
      notes: 'Accepted connection request! Ready to send pitch message for Data Analyst role.',
      status: 'Warm',
      avatarColor: 'bg-emerald-600',
      ...( {
        networkStage: 'ACCEPTED',
        targetTag: 'Open Job',
        actionNeeded: true,
        tagRole: 'Potential Referer',
        timeAgo: '10h',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        tasks: [
          { id: 't1', title: 'Send Pitch Message (Step 2)', due: 'Due today' },
          { id: 't2', title: 'Send Project Portfolio Breakdown', due: 'In 2 days' },
          { id: 't3', title: 'Ask for Internal Referral Code', due: 'In 4 days' },
          { id: 't4', title: 'Follow-up on Application Status', due: 'In 7 days' },
        ],
      } as any ),
    },
    {
      id: 'c-athmiya',
      name: 'Athmiya Mahesh',
      role: 'People Operations | Talent Acquisition Specialist | Tech Hiring Lead',
      company: 'WorkOnGrid',
      email: 'athmiya.m@workongrid.com',
      linkedin: 'https://www.linkedin.com/search/results/people/?keywords=Athmiya%20Mahesh%20WorkOnGrid',
      relationship: 'Hiring Manager',
      lastContactDate: '2026-08-26',
      notes: 'Accepted connection. Pitch message drafted for Data Analyst opening.',
      status: 'Warm',
      avatarColor: 'bg-pink-600',
      ...( {
        networkStage: 'ACCEPTED',
        targetTag: 'Open Job',
        actionNeeded: true,
        tagRole: 'Hiring Manager',
        timeAgo: '10h',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        tasks: [
          { id: 'at1', title: 'Send Value-First Pitch Note', due: 'Due today' },
          { id: 'at2', title: 'Share Fresher Analytics Case Study', due: 'In 2 days' },
          { id: 'at3', title: 'Confirm Interview Availability', due: 'In 4 days' },
          { id: 'at4', title: 'Final Status Check', due: 'In 6 days' },
        ],
      } as any ),
    },
    {
      id: 'c-elena',
      name: 'Elena Rostova',
      role: 'Director of Talent Acquisition @ Datadog',
      company: 'Datadog',
      email: 'erostova@datadoghq.com',
      linkedin: 'https://www.linkedin.com/search/results/people/?keywords=Elena%20Rostova%20Datadog',
      relationship: 'Recruiter',
      lastContactDate: '2026-08-25',
      notes: 'In active discussion for engineering leadership scope and offer negotiation.',
      status: 'Offer Stage',
      avatarColor: 'bg-purple-600',
      ...( {
        networkStage: 'ENGAGEMENT',
        targetTag: 'Target Company',
        tagRole: 'Recruiter',
        timeAgo: '2d ago',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
      } as any ),
    },
  ];

  // Merge user contacts with initial nxtjob template list
  const combinedContacts = [...defaultNetworkContacts, ...contacts.filter((c) => !defaultNetworkContacts.some((d) => d.id === c.id))];

  const getContactStage = (c: Contact): NetworkStage => {
    if ((c as any).networkStage) return (c as any).networkStage;
    if (c.status === 'Offer Stage' || c.status === 'Warm') return 'ENGAGEMENT';
    if (c.status === 'Active') return 'ACCEPTED';
    return 'SENT';
  };

  const filteredContacts = combinedContacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase());
    const matchesTag =
      tagFilter === 'all' ||
      (c as any).targetTag === tagFilter ||
      c.relationship.toLowerCase() === tagFilter.toLowerCase();
    return matchesSearch && matchesTag;
  });

  const sentList = filteredContacts.filter((c) => getContactStage(c) === 'SENT');
  const acceptedList = filteredContacts.filter((c) => getContactStage(c) === 'ACCEPTED');
  const engagementList = filteredContacts.filter((c) => getContactStage(c) === 'ENGAGEMENT');

  const toggleTaskExpansion = (contactId: string) => {
    setExpandedTasksMap((prev) => ({ ...prev, [contactId]: !prev[contactId] }));
  };

  const toggleTaskDone = (taskId: string) => {
    setCompletedTasksMap((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleCopyPitch = (contact: Contact) => {
    const firstName = contact.name.split(' ')[0];
    const pitch = `Hi ${firstName}, thanks for connecting! I noticed the opening at ${contact.company} and would love to share how my analytics & technical experience can support your team. Would you be open to a quick chat?`;
    navigator.clipboard.writeText(pitch);
    setCopiedId(contact.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleAdvanceStage = (contact: Contact, targetStage: NetworkStage) => {
    const updated = {
      ...contact,
      networkStage: targetStage,
      status: targetStage === 'ENGAGEMENT' ? ('Offer Stage' as const) : targetStage === 'ACCEPTED' ? ('Warm' as const) : ('Active' as const),
    };
    onUpdateContact(updated);
  };

  const handleAddCustomConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company) return;

    const newContact: Contact = {
      id: `c-${Date.now()}`,
      name,
      role: role || 'Hiring Lead',
      company,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      linkedin: linkedin || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(name + ' ' + company)}`,
      relationship,
      lastContactDate: new Date().toISOString().split('T')[0],
      notes: notes || 'Connected via nxtjob networking sequence.',
      status: stage === 'ENGAGEMENT' ? 'Offer Stage' : stage === 'ACCEPTED' ? 'Warm' : 'Active',
      avatarColor: 'bg-blue-600',
    };
    (newContact as any).networkStage = stage;
    (newContact as any).timeAgo = 'Just now';
    (newContact as any).targetTag = 'Open Job';

    onAddContact(newContact);
    setShowAddModal(false);
    setName('');
    setRole('');
    setCompany('');
    setEmail('');
    setLinkedin('');
    setNotes('');
  };

  return (
    <div id="networking-page-container" className="space-y-5 max-w-[1600px] mx-auto pb-12 text-slate-100">
      
      {/* Top Main Navigation Tabs matching Screenshot 1 & Screenshot 4 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B1120] p-2 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <button
            onClick={() => {
              setActiveTopTab('My Jobs');
              if (onNavigateToTab) onNavigateToTab('jobs');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTopTab === 'My Jobs'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>My Jobs</span>
          </button>

          <button
            onClick={() => setActiveTopTab('Target Companies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTopTab === 'Target Companies'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Target Companies</span>
          </button>

          <button
            onClick={() => setActiveTopTab('Recruitment Agencies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTopTab === 'Recruitment Agencies'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Recruitment Agencies</span>
          </button>

          <button
            onClick={() => setActiveTopTab('My Network')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTopTab === 'My Network'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>My Network</span>
          </button>
        </div>

        {/* Upgrade Now Button */}
        <div className="flex items-center gap-2 pr-2">
          <button
            onClick={() => {}}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Upgrade Now</span>
          </button>
        </div>
      </div>

      {/* Page Sub-Header matching Screenshot 4 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0F172A] p-4 rounded-2xl border border-slate-800 shadow-sm">
        
        {/* Left: Title + Sequences Button */}
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>My Connections</span>
            <button
              onClick={() => {}}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh connections"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </h2>

          {/* Message Sequences Modal Trigger */}
          <button
            onClick={() => setIsSequenceModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Message Sequences ✎</span>
          </button>
        </div>

        {/* Right: Search, Filter, View Toggles, and Add Connection */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Tags Dropdown */}
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">🏷 Tags (All)</option>
            <option value="Open Job">Open Job</option>
            <option value="Target Company">Target Company</option>
            <option value="Hiring Manager">Hiring Manager</option>
            <option value="Recruiter">Recruiter</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-slate-800 text-white' : 'hover:text-slate-200'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-slate-800 text-white' : 'hover:text-slate-200'
              }`}
              title="Table / List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Connection Primary CTA */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Connection</span>
          </button>
        </div>
      </div>

      {/* 3-Column Networking Kanban Board matching Screenshot 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
        
        {/* ================= COLUMN 1: SENT ================= */}
        <div className="bg-[#0B1120] rounded-2xl border border-slate-800 p-4 flex flex-col min-h-[580px] shadow-sm space-y-4">
          
          {/* Column Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                SENT
              </h3>
              <span className="text-xs font-mono text-slate-500">{sentList.length}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">
                👥 {sentList.length * 7 + 42} conn • 🏢 {sentList.length * 2 + 14} co
              </span>
              <button
                onClick={() => {}}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0A66C2]/20 text-[#0A66C2] dark:text-[#70b5f9] border border-[#0A66C2]/40 hover:bg-[#0A66C2]/30 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Linkedin className="w-3 h-3 fill-current" />
                <span>Sync</span>
              </button>
            </div>
          </div>

          {/* Sent Cards List */}
          <div className="space-y-3 flex-1 overflow-y-auto">
            {sentList.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No connections in Sent yet. Use <strong>Find Network</strong> on any job card to reach out.
              </div>
            ) : (
              sentList.map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800/90 hover:border-slate-700 hover:shadow-md transition-all space-y-3 group"
                >
                  {/* Top Tags & AI Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-950/60 text-blue-400 border border-blue-800/60 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        {(contact as any).targetTag || 'Open Job'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-300">
                        {contact.relationship}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-950/60 text-purple-300 border border-purple-800/60">
                        <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                        <span>AI</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      </span>

                      <button
                        onClick={() => handleAdvanceStage(contact, 'ACCEPTED')}
                        className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                        title="Mark as Accepted"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={
                          (contact as any).avatarUrl ||
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
                        }
                        alt={contact.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0A66C2] text-white flex items-center justify-center text-[9px] font-bold">
                        in
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={contact.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-xs text-white hover:text-blue-400 truncate flex items-center gap-1"
                        >
                          <span>{contact.name}</span>
                        </a>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{contact.role}</p>

                      <div className="flex items-center justify-between mt-2 text-[11px]">
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(contact.company)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-300 hover:text-white font-semibold flex items-center gap-1"
                        >
                          <span>{contact.company}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                        </a>

                        <span className="text-slate-500 flex items-center gap-1 text-[10px]">
                          <Clock className="w-3 h-3" />
                          <span>{(contact as any).timeAgo || '20h'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Move to Accepted quick action */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Step 1: Connection Sent</span>
                    <button
                      onClick={() => handleAdvanceStage(contact, 'ACCEPTED')}
                      className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                    >
                      <span>Advance to Accepted →</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ================= COLUMN 2: ACCEPTED ================= */}
        <div className="bg-[#0B1120] rounded-2xl border border-slate-800 p-4 flex flex-col min-h-[580px] shadow-sm space-y-4">
          
          {/* Column Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                ACCEPTED
              </h3>
              <span className="text-xs font-mono text-slate-500">
                {acceptedList.length} (0/0 - 0%)
              </span>
            </div>

            <span className="text-[11px] text-slate-400">
              👥 {acceptedList.length * 5 + 22} conn • 🏢 {acceptedList.length * 2 + 12} co
            </span>
          </div>

          {/* Accepted Cards List */}
          <div className="space-y-3 flex-1 overflow-y-auto">
            {acceptedList.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No accepted connections yet. When a recruiter or manager accepts, they move here.
              </div>
            ) : (
              acceptedList.map((contact) => {
                const isExpanded = !!expandedTasksMap[contact.id];
                const isCopied = copiedId === contact.id;

                return (
                  <div
                    key={contact.id}
                    className="p-4 rounded-2xl bg-[#0F172A] border border-blue-950/80 hover:border-blue-800/80 hover:shadow-md transition-all space-y-3 group"
                  >
                    {/* Top Badges: Action Needed + Tags + AI */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                          Action needed
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-950/60 text-blue-400 border border-blue-800/60">
                          {(contact as any).targetTag || 'Open Job'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-300">
                          {(contact as any).tagRole || contact.relationship}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-950/60 text-purple-300 border border-purple-800/60">
                          <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                          <span>AI</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        </span>

                        <button
                          onClick={() => handleAdvanceStage(contact, 'ENGAGEMENT')}
                          className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                          title="Advance to Active Engagement"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={
                            (contact as any).avatarUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
                          }
                          alt={contact.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0A66C2] text-white flex items-center justify-center text-[9px] font-bold">
                          in
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={contact.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-xs text-white hover:text-blue-400 truncate flex items-center gap-1"
                          >
                            <span>{contact.name}</span>
                          </a>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{contact.role}</p>

                        <div className="flex items-center justify-between mt-2 text-[11px]">
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(contact.company)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-300 hover:text-white font-semibold flex items-center gap-1"
                          >
                            <span>{contact.company}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                          </a>

                          <span className="text-slate-500 flex items-center gap-1 text-[10px]">
                            <Clock className="w-3 h-3" />
                            <span>{(contact as any).timeAgo || '10h'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sequence Task Progress Bar matching Screenshot 4 */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-blue-400 flex items-center justify-center text-[8px]">
                            ○
                          </span>
                          <span>0/4 Sequence Tasks</span>
                        </div>

                        <button
                          onClick={() => toggleTaskExpansion(contact.id)}
                          className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>View tasks</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* Expandable Task Sequence Steps */}
                      {isExpanded && (
                        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                          {((contact as any).tasks || [
                            { id: 't1', title: 'Send Pitch Message (Step 2)', due: 'Due today' },
                            { id: 't2', title: 'Send Project Portfolio Breakdown', due: 'In 2 days' },
                            { id: 't3', title: 'Ask for Internal Referral Code', due: 'In 4 days' },
                            { id: 't4', title: 'Follow-up on Application Status', due: 'In 7 days' },
                          ]).map((task: any) => {
                            const isDone = completedTasksMap[task.id];
                            return (
                              <div
                                key={task.id}
                                className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
                              >
                                <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={!!isDone}
                                    onChange={() => toggleTaskDone(task.id)}
                                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                                  />
                                  <span className={`text-[11px] truncate ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                    {task.title}
                                  </span>
                                </label>

                                <span className="text-[10px] text-amber-400/90 font-mono shrink-0">
                                  {task.due}
                                </span>
                              </div>
                            );
                          })}

                          {/* Quick 1-Click Action Button */}
                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                            <button
                              onClick={() => handleCopyPitch(contact)}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-2xs"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Copied Pitch Note!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>1-Click Copy Pitch & Open LinkedIn</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= COLUMN 3: ENGAGEMENT ================= */}
        <div className="bg-[#0B1120] rounded-2xl border border-slate-800 p-4 flex flex-col min-h-[580px] shadow-sm space-y-4">
          
          {/* Column Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                ENGAGEMENT
              </h3>
              <span className="text-xs font-mono text-slate-500">{engagementList.length}</span>
            </div>

            <span className="text-[11px] text-slate-400">
              👥 {engagementList.length} conn • 🏢 {engagementList.length} co
            </span>
          </div>

          {/* Engagement Cards List */}
          <div className="space-y-3 flex-1 overflow-y-auto">
            {engagementList.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No active conversations yet. When candidates reply or schedule calls, they are tracked here.
              </div>
            ) : (
              engagementList.map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 rounded-2xl bg-[#0F172A] border border-amber-950/60 hover:border-amber-700/60 hover:shadow-md transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/60 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        Active Discussion
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-300">
                        {contact.relationship}
                      </span>
                    </div>

                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                      <span>Call Ready</span>
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <img
                      src={
                        (contact as any).avatarUrl ||
                        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80'
                      }
                      alt={contact.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-white truncate">{contact.name}</div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{contact.role}</p>
                      <div className="text-slate-300 text-[11px] font-semibold mt-1.5">{contact.company}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div className="font-bold text-amber-400 text-[10px] uppercase tracking-wider">Latest Notes</div>
                    <p>{contact.notes || 'In active discussion for team scope and compensation.'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Message Sequences Modal */}
      <MessageSequencesModal
        isOpen={isSequenceModalOpen}
        onClose={() => setIsSequenceModalOpen(false)}
        onSave={() => {}}
      />

      {/* Find Network Modal */}
      <FindNetworkModal
        isOpen={isFindNetworkOpen}
        onClose={() => setIsFindNetworkOpen(false)}
        companyName={findNetworkContext.company}
        jobRole={findNetworkContext.role}
        onConnectSuccess={(newContact) => {
          onAddContact(newContact);
        }}
        onOpenMessageSequences={() => {
          setIsSequenceModalOpen(true);
        }}
      />

      {/* Manual Add Connection Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Add LinkedIn Connection</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomConnection} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manisha Jain"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Company</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Time Hack Consulting"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Role / Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Data Analyst & BI Lead"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="SENT">Sent</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="ENGAGEMENT">Engagement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="Hiring Manager">Hiring Manager</option>
                    <option value="Recruiter">Recruiter</option>
                    <option value="Referral">Referral / Peer</option>
                    <option value="Executive Lead">Top Management</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Save Connection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
