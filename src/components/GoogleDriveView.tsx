import React, { useState } from 'react';
import {
  HardDrive,
  Folder,
  FileText,
  Download,
  Upload,
  ExternalLink,
  Search,
  Plus,
  CheckCircle2,
  FileCheck,
  Award,
} from 'lucide-react';
import { DriveFile } from '../types';

interface GoogleDriveViewProps {
  files?: DriveFile[];
}

export const GoogleDriveView: React.FC<GoogleDriveViewProps> = ({ files = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredFiles = files.filter((f) => {
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div id="google-drive-view" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-amber-400" />
            <span>Google Drive Career Document Vault</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
              Synced to Drive
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized repository of master resumes, customized variants, system design portfolios, and offer packages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Uploaded file to Kavin Job Command Center folder in Google Drive.')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Folder Categories & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'Resumes', 'Portfolios', 'Offer Letters', 'Certifications'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Files' : cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search document vault..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                      {file.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 mt-0.5">{file.category} • {file.size}</div>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {file.type}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 mb-3">
                Last modified: <strong className="text-slate-300">{file.lastModified}</strong>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <a
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Drive</span>
              </a>

              <button
                onClick={() => alert(`Downloading ${file.name}...`)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
