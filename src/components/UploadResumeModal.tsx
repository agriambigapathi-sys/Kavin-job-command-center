import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { ParsedResumeData } from '../types';

interface UploadResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParsedSuccess: (result: {
    fileName: string;
    fileType: string;
    extractedText: string;
    parsedData: ParsedResumeData | null;
    parsingStatus: 'completed' | 'failed' | 'raw_only';
    parsingError?: string;
  }) => void;
}

export const UploadResumeModal: React.FC<UploadResumeModalProps> = ({
  isOpen,
  onClose,
  onParsedSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setSelectedFile(null);
    setIsDragOver(false);
    setIsUploading(false);
    setUploadProgress(0);
    setStatusMessage('');
    setErrorMsg(null);
    setCanRetry(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const processFileUpload = async (file: File) => {
    // 1. Validate file extension
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExtensions = ['pdf', 'docx', 'doc', 'txt', 'md', 'tex'];
    if (!allowedExtensions.includes(ext)) {
      setErrorMsg('Unsupported file format. Please upload a PDF, DOCX, or TXT resume file.');
      return;
    }

    // 2. Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 10MB limit. Please upload a smaller resume document.');
      return;
    }

    // 3. Validate non-empty file
    if (file.size === 0) {
      setErrorMsg('The selected file is empty (0 bytes). Please upload a valid resume document.');
      return;
    }

    setSelectedFile(file);
    setErrorMsg(null);
    setCanRetry(false);
    setIsUploading(true);
    setUploadProgress(20);
    setStatusMessage('Reading resume document contents...');

    try {
      let fileBase64 = '';
      let textContent = '';

      if (['txt', 'md', 'tex', 'json'].includes(ext)) {
        textContent = await file.text();
      } else {
        // Read binary file as base64
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        fileBase64 = btoa(binary);
      }

      setUploadProgress(50);
      setStatusMessage('Extracting text and parsing structured facts with AI...');

      const response = await fetch('/api/resumes/upload-and-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: ext,
          fileBase64,
          textContent,
        }),
      });

      setUploadProgress(85);

      const json = await response.json();

      if (!response.ok || (json.error && !json.extractedText)) {
        throw new Error(json.error || 'Failed to upload and parse resume file.');
      }

      setUploadProgress(100);
      setStatusMessage('Parsing complete!');

      setTimeout(() => {
        onParsedSuccess({
          fileName: file.name,
          fileType: ext.toUpperCase(),
          extractedText: json.extractedText || '',
          parsedData: json.parsedData || null,
          parsingStatus: json.parsingStatus || (json.parsedData ? 'completed' : 'raw_only'),
          parsingError: json.error,
        });
        handleClose();
      }, 500);
    } catch (err: any) {
      console.error('Resume upload error:', err);
      setIsUploading(false);
      setUploadProgress(0);
      setErrorMsg(err.message || 'Error occurred while parsing the resume file.');
      setCanRetry(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      id="upload-resume-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUploading) {
          handleClose();
        }
      }}
    >
      <div
        id="upload-resume-modal-container"
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-200"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Upload & Parse Resume</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  PDF / DOCX / TXT
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload your resume file to automatically extract structured experience, skills, and facts.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold">{errorMsg}</div>
              </div>

              {canRetry && selectedFile && (
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => processFileUpload(selectedFile)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Parse</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Drag and Drop Zone */}
          {!isUploading && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-950/50'
                  : 'border-slate-700 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-800/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md,.tex"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto mb-3 shadow-inner">
                <Upload className="w-6 h-6" />
              </div>

              <div className="font-bold text-slate-100 text-sm mb-1">
                Drag & drop your resume file here
              </div>
              <p className="text-slate-400 text-xs mb-4">
                or <span className="text-cyan-400 underline font-semibold">browse files</span> on your computer
              </p>

              <div className="inline-flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500">
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">PDF</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">DOCX</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">TXT</span>
                <span>• Max 10MB</span>
              </div>
            </div>
          )}

          {/* Upload Progress State */}
          {isUploading && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>

              <div>
                <div className="font-bold text-white text-sm">{selectedFile?.name}</div>
                <div className="text-xs text-cyan-400 font-medium mt-1">{statusMessage}</div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500">
                Processing document with zero hallucination enforcement...
              </p>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">
              Strict privacy isolation • Encrypted in transit
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
