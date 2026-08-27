import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle, enterDemoMode, error, clearError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'run.app';
  const activeError = error || localError;
  const isUnauthorizedDomain =
    activeError?.includes('auth/unauthorized-domain') ||
    activeError?.includes('unauthorized-domain');

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setLocalError(null);
    clearError();
    try {
      await signInWithGoogle();
    } catch (err: any) {
      const isUnauthDomain =
        err?.code === 'auth/unauthorized-domain' ||
        err?.message?.includes('unauthorized-domain');
      if (isUnauthDomain) {
        setLocalError('Firebase: Error (auth/unauthorized-domain).');
      } else {
        setLocalError(err?.message || 'Failed to authenticate with Google. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const copyDomain = () => {
    navigator.clipboard.writeText(currentHostname);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Gradient Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 shadow-inner mb-2">
            <Briefcase className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Job Command Center
          </h1>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Personal & Secure Career Command Center with live Firestore synchronization.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>Private Access Verification</span>
            </h2>
            <p className="text-xs text-slate-400">
              Authenticate using your Google Account to access your personal pipeline, resumes, and analytics.
            </p>
          </div>

          {/* Unauthorized Domain Special Diagnostic Card */}
          {isUnauthorizedDomain ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-amber-300 text-sm">
                    Firebase Authorized Domain Required
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    Firebase Authentication requires this Cloud Run / preview domain to be allowlisted in the Firebase Console before Google OAuth popup can proceed.
                  </p>
                </div>
              </div>

              {/* Current Domain Box */}
              <div className="bg-slate-950/80 border border-amber-500/20 rounded-lg p-2.5 flex items-center justify-between gap-2">
                <code className="text-[11px] text-cyan-300 font-mono break-all select-all">
                  {currentHostname}
                </code>
                <button
                  onClick={copyDomain}
                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium text-[11px] flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Domain</span>
                    </>
                  )}
                </button>
              </div>

              {/* 3 Step Instructions */}
              <div className="text-[11px] text-slate-300 space-y-1.5 pl-1">
                <p className="font-semibold text-slate-200 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>How to authorize Google OAuth (Optional):</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>
                    Open{' '}
                    <a
                      href="https://console.firebase.google.com/project/kavin-job-command-center/authentication/settings"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 underline font-medium inline-flex items-center gap-0.5"
                    >
                      Firebase Authentication &gt; Settings &gt; Authorized domains
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </li>
                  <li>Click <strong>Add domain</strong>, paste <code>{currentHostname}</code> and Save</li>
                </ol>
              </div>

              {/* Instant Access Bypass Button */}
              <button
                onClick={enterDemoMode}
                className="w-full mt-1 py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-amber-300" />
                <span>Skip Authorization &amp; Enter Candidate Mode Immediately</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
              </button>
            </div>
          ) : activeError ? (
            /* General Error Banner */
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Authentication Error</p>
                <p className="mt-0.5 text-slate-300">{activeError}</p>
              </div>
              <button
                onClick={() => {
                  clearError();
                  setLocalError(null);
                }}
                className="text-rose-400 hover:text-rose-200 text-xs font-semibold underline shrink-0"
              >
                Dismiss
              </button>
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Google Sign-in Button */}
            <button
              id="google-signin-btn"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-all duration-150 shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSigningIn ? (
                <>
                  <RefreshCw className="w-4 h-4 text-slate-700 animate-spin" />
                  <span>Signing in with Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                  <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
                </>
              )}
            </button>

            {/* Instant Demo / Preview Mode Button */}
            <button
              id="demo-mode-btn"
              onClick={enterDemoMode}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-cyan-300 border border-slate-700 font-medium text-xs transition-all duration-150 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Explore Full App in Demo / Preview Mode</span>
            </button>
          </div>

          {/* Privacy & Security Assurances */}
          <div className="space-y-2.5 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Isolated Firestore Database per Google user ID.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Strict Firestore security rules prevent cross-tenant access.</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Interactive AI Resume tailoring &amp; JD match engines.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-500">
          Job Command Center &copy; {new Date().getFullYear()} &middot; Personal Edition
        </p>
      </div>
    </div>
  );
};
