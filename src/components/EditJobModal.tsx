import React, { useState, useEffect } from 'react';
import {
  X,
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Save,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import {
  FirestoreJob,
  FirestoreJobStatus,
  JobPriority,
  WorkType,
} from '../types';

interface EditJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: FirestoreJob | null;
  onSave: (jobId: string, updates: Partial<FirestoreJob>) => Promise<void>;
}

const ALL_STATUSES: FirestoreJobStatus[] = [
  'Saved',
  'JD Analyzed',
  'Resume Ready',
  'Ready to Apply',
  'Applied',
  'Acknowledged',
  'Assessment',
  'Interview 1',
  'Interview 2',
  'HR Round',
  'Offer',
  'Rejected',
  'Ghosted',
  'Withdrawn',
];

const ALL_PRIORITIES: JobPriority[] = ['Dream', 'Target', 'Safety'];

export const EditJobModal: React.FC<EditJobModalProps> = ({
  isOpen,
  onClose,
  job,
  onSave,
}) => {
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [workType, setWorkType] = useState<WorkType>('Remote');
  const [salary, setSalary] = useState('');
  const [experience, setExperience] = useState('');
  const [source, setSource] = useState('Direct / Company Website');
  const [jobUrl, setJobUrl] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [jobId, setJobId] = useState('');
  const [postedDate, setPostedDate] = useState('');
  const [status, setStatus] = useState<FirestoreJobStatus>('Saved');
  const [priority, setPriority] = useState<JobPriority>('Target');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (job && isOpen) {
      setRole(job.role || '');
      setCompany(job.company || '');
      setLocation(job.location || 'Remote');
      setWorkType(job.workType || 'Remote');
      setSalary(job.salary || '');
      setExperience(job.experience || '');
      setSource(job.source || 'Direct');
      setJobUrl(job.jobUrl || '');
      setApplicationUrl(job.applicationUrl || '');
      setJobId(job.jobId || '');
      setPostedDate(job.postedDate || '');
      setStatus(job.status || 'Saved');
      setPriority((job.priority as JobPriority) || 'Target');
      setNotes(job.notes || '');
      setTags((job.tags || []).join(', '));
      setErrorMsg(null);
    }
  }, [job, isOpen]);

  if (!isOpen || !job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim() || !company.trim()) {
      setErrorMsg('Role and Company are required.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const updates: Partial<FirestoreJob> = {
        role: role.trim(),
        company: company.trim(),
        location: location.trim() || 'Remote',
        workType,
        salary: salary.trim(),
        experience: experience.trim(),
        source: source.trim() || 'Direct',
        jobUrl: jobUrl.trim(),
        applicationUrl: applicationUrl.trim() || jobUrl.trim(),
        jobId: jobId.trim(),
        postedDate: postedDate.trim(),
        status,
        priority,
        notes: notes.trim(),
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      await onSave(job.id || '', updates);
      onClose();
    } catch (err: any) {
      console.error('Failed to save job updates:', err);
      setErrorMsg(err.message || 'Failed to save job modifications.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Job Opportunity</h3>
              <p className="text-xs text-slate-400">Update tracking and compensation parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Role Title *</label>
              <input
                required
                type="text"
                value={role || ''}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer"
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Company Name *</label>
              <input
                required
                type="text"
                value={company || ''}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe, Anthropic"
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Location</label>
              <input
                type="text"
                value={location || ''}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA / Remote"
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Work Type</label>
              <select
                value={workType || 'Remote'}
                onChange={(e) => setWorkType(e.target.value as WorkType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">On-site</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Priority</label>
              <select
                value={priority || 'Target'}
                onChange={(e) => setPriority(e.target.value as JobPriority)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="Dream">Dream</option>
                <option value="Target">Target</option>
                <option value="Safety">Safety</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Salary / Compensation</label>
              <input
                type="text"
                value={salary || ''}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. $180,000 - $220,000"
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Experience Required</label>
              <input
                type="text"
                value={experience || ''}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 5+ Years"
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Current Status</label>
              <select
                value={status || 'Saved'}
                onChange={(e) => setStatus(e.target.value as FirestoreJobStatus)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-cyan-300 font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Source Platform</label>
              <input
                type="text"
                value={source || ''}
                onChange={(e) => setSource(e.target.value)}
                placeholder="LinkedIn, Indeed, Company Site"
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Requisition / Job ID</label>
              <input
                type="text"
                value={jobId || ''}
                onChange={(e) => setJobId(e.target.value)}
                placeholder="e.g. REQ-9842"
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Date Posted</label>
              <input
                type="text"
                value={postedDate || ''}
                onChange={(e) => setPostedDate(e.target.value)}
                placeholder="e.g. 2 days ago or YYYY-MM-DD"
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Job URL</label>
              <input
                type="url"
                value={jobUrl || ''}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://linkedin.com/jobs/..."
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Direct Application URL</label>
              <input
                type="url"
                value={applicationUrl || ''}
                onChange={(e) => setApplicationUrl(e.target.value)}
                placeholder="https://boards.greenhouse.io/..."
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Technology Tags (comma-separated)</label>
            <input
              type="text"
              value={tags || ''}
              onChange={(e) => setTags(e.target.value)}
              placeholder="TypeScript, React, Node.js, Cloud Run"
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Personal Notes / Scratchpad</label>
            <textarea
              rows={3}
              value={notes || ''}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes on hiring manager, referral status, team sizing..."
              className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-md shadow-cyan-950/50 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Updates...' : 'Save Job Updates'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
