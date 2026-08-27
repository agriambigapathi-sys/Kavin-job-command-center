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
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Contact } from '../types';

interface ContactsViewProps {
  contacts?: Contact[];
  onAddContact?: (contact: Contact) => void;
  onOpenOutreachForContact?: (contact: Contact) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts = [],
  onAddContact = (_contact: Contact) => {},
  onOpenOutreachForContact = (_contact: Contact) => {},
}) => {
  const [search, setSearch] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState<Contact['relationship']>('Recruiter');
  const [notes, setNotes] = useState('');

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase());
    const matchesRel = relationshipFilter === 'all' || c.relationship === relationshipFilter;
    return matchesSearch && matchesRel;
  });

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company) return;
    const newContact: Contact = {
      id: `c-${Date.now()}`,
      name,
      role: role || 'Talent Partner',
      company,
      email: email || `${name.toLowerCase().replace(' ', '.')}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      relationship,
      lastContactDate: new Date().toISOString().split('T')[0],
      notes: notes || 'Met via application outreach.',
      status: 'Active',
      avatarColor: 'bg-cyan-600',
    };
    onAddContact(newContact);
    setShowAddModal(false);
    setName('');
    setRole('');
    setCompany('');
    setEmail('');
    setNotes('');
  };

  return (
    <div id="contacts-view-container" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Networking & Recruiter CRM</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              {contacts.length} Connections
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage relationships with recruiters, engineering directors, and referral partners.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, company, or role..."
            value={search || ''}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <select
          value={relationshipFilter || 'all'}
          onChange={(e) => setRelationshipFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:ring-1 focus:ring-cyan-500"
        >
          <option value="all">All Relationships</option>
          <option value="Recruiter">Recruiters</option>
          <option value="Hiring Manager">Hiring Managers</option>
          <option value="Referral">Referrals</option>
          <option value="Executive Lead">Executive Leads</option>
        </select>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      contact.avatarColor || 'bg-cyan-600'
                    }`}
                  >
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {contact.name}
                    </h3>
                    <div className="text-[11px] text-cyan-400 font-medium">{contact.role}</div>
                    <div className="text-[11px] text-slate-300 font-semibold">{contact.company}</div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    contact.relationship === 'Hiring Manager'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : contact.relationship === 'Referral'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {contact.relationship}
                </span>
              </div>

              {/* Email & Contact Details */}
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 text-xs text-slate-300 space-y-1.5 mb-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="truncate">{contact.email}</span>
                </div>
                {contact.linkedin && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                    <a
                      href={contact.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline truncate"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
              </div>

              {/* Notes */}
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                {contact.notes}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400">Last contacted: {contact.lastContactDate}</span>
              <button
                onClick={() => onOpenOutreachForContact(contact)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-[11px] font-semibold border border-cyan-500/30 transition-colors"
              >
                <Send className="w-3 h-3" />
                <span>Compose Outreach</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Add Recruiter / Contact</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Full Name *</label>
                <input
                  required
                  type="text"
                  value={name || ''}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. David Chen"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Company *</label>
                  <input
                    required
                    type="text"
                    value={company || ''}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Stripe"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Role / Title</label>
                  <input
                    type="text"
                    value={role || ''}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Staff Eng Manager"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email || ''}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dchen@stripe.com"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Relationship</label>
                <select
                  value={relationship || 'Recruiter'}
                  onChange={(e) => setRelationship(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                >
                  <option value="Recruiter">Recruiter</option>
                  <option value="Hiring Manager">Hiring Manager</option>
                  <option value="Referral">Referral Partner</option>
                  <option value="Peer">Peer / Senior Engineer</option>
                  <option value="Executive Lead">Executive Lead</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Notes / Context</label>
                <textarea
                  rows={3}
                  value={notes || ''}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key background, discussion topics, referral details..."
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
