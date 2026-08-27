import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Search,
  Plus,
  RefreshCw,
  ExternalLink,
  Filter,
  CheckCircle2,
  Table,
} from 'lucide-react';
import { Application, Job } from '../types';

interface GoogleSheetsViewProps {
  applications?: Application[];
  jobs?: Job[];
}

export const GoogleSheetsView: React.FC<GoogleSheetsViewProps> = ({
  applications = [],
  jobs = [],
}) => {
  const [search, setSearch] = useState('');
  const [activeSheet, setActiveSheet] = useState<'applications' | 'jobs'>('applications');

  const exportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (activeSheet === 'applications') {
      headers = ['Company', 'Job Title', 'Stage', 'Applied Date', 'Expected Salary', 'Offered Salary', 'Contact', 'Match Score', 'Next Step'];
      rows = applications.map((a) => [
        `"${a.company}"`,
        `"${a.jobTitle}"`,
        `"${a.stage}"`,
        `"${a.appliedDate}"`,
        `"${a.salaryExpected}"`,
        `"${a.salaryOffered || ''}"`,
        `"${a.contactName || ''}"`,
        `"${a.matchScore}%"`,
        `"${a.nextStep || ''}"`,
      ]);
    } else {
      headers = ['Company', 'Job Title', 'Tier', 'Location', 'Work Type', 'Salary', 'Match Score', 'Status', 'Source'];
      rows = jobs.map((j) => [
        `"${j.company}"`,
        `"${j.title}"`,
        `"${j.tier}"`,
        `"${j.location}"`,
        `"${j.workType}"`,
        `"${j.salary}"`,
        `"${j.matchScore}%"`,
        `"${j.status}"`,
        `"${j.source}"`,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kavin_${activeSheet}_sheet_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredApps = applications.filter(
    (a) =>
      a.company.toLowerCase().includes(search.toLowerCase()) ||
      a.jobTitle.toLowerCase().includes(search.toLowerCase())
  );

  const filteredJobs = jobs.filter(
    (j) =>
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="google-sheets-view" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <span>Google Sheets Real-time Data Grid</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
              Live Two-Way Sync
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized tabular spreadsheet database. Edits here reflect immediately across Kanban and analytics pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Sheet Tabs & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSheet('applications')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSheet === 'applications'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Applications Sheet ({applications.length})
          </button>
          <button
            onClick={() => setActiveSheet('jobs')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSheet === 'jobs'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Saved Jobs Sheet ({jobs.length})
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search cells..."
            value={search || ''}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Spreadsheet Grid Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {activeSheet === 'applications' ? (
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead className="bg-slate-800/90 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Expected Comp</th>
                  <th className="py-3 px-4">Offered Comp</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Match</th>
                  <th className="py-3 px-4">Next Step</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[11px]">
                {filteredApps.map((app, index) => (
                  <tr key={app.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="py-2.5 px-4 text-slate-400 font-bold">{index + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-100">{app.company}</td>
                    <td className="py-2.5 px-4 text-slate-300">{app.jobTitle}</td>
                    <td className="py-2.5 px-4">
                      <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300">
                        {app.stage.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">{app.appliedDate}</td>
                    <td className="py-2.5 px-4 text-emerald-400 font-semibold">{app.salaryExpected}</td>
                    <td className="py-2.5 px-4 text-purple-300 font-bold">{app.salaryOffered || '-'}</td>
                    <td className="py-2.5 px-4 text-slate-300">{app.contactName || '-'}</td>
                    <td className="py-2.5 px-4 font-bold text-emerald-400">{app.matchScore}%</td>
                    <td className="py-2.5 px-4 text-slate-300 max-w-xs truncate">{app.nextStep || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead className="bg-slate-800/90 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Work Type</th>
                  <th className="py-3 px-4">Salary Range</th>
                  <th className="py-3 px-4">Match</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[11px]">
                {filteredJobs.map((job, index) => (
                  <tr key={job.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="py-2.5 px-4 text-slate-400 font-bold">{index + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-100">{job.company}</td>
                    <td className="py-2.5 px-4 text-slate-300">{job.title}</td>
                    <td className="py-2.5 px-4 text-purple-300">{job.tier}</td>
                    <td className="py-2.5 px-4 text-slate-300">{job.location}</td>
                    <td className="py-2.5 px-4 text-cyan-400">{job.workType}</td>
                    <td className="py-2.5 px-4 text-emerald-400 font-semibold">{job.salary}</td>
                    <td className="py-2.5 px-4 font-bold text-emerald-400">{job.matchScore}%</td>
                    <td className="py-2.5 px-4 capitalize text-slate-300">{job.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
