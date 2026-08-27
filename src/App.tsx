import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { JobsView } from './components/JobsView';
import { JDAnalyserView } from './components/JDAnalyserView';
import { ResumesView } from './components/ResumesView';
import { CoverLettersView } from './components/CoverLettersView';
import { ApplicationsView } from './components/ApplicationsView';
import { ContactsView } from './components/ContactsView';
import { FollowUpsView } from './components/FollowUpsView';
import { InterviewsView } from './components/InterviewsView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { AddJobModal } from './components/AddJobModal';
import { QuickOutreachModal } from './components/QuickOutreachModal';
import { LoginScreen } from './components/LoginScreen';
import { useAuth } from './context/AuthContext';
import {
  subscribeToCollection,
  createDocument,
  updateDocument,
  deleteDocument,
  logActivity,
} from './services/firestoreService';

import {
  mockStats,
  mockJobs,
  mockApplications,
  mockFollowUps,
  mockRecentActivities,
  mockContacts,
  mockInterviews,
  mockResumes,
  mockCoverLetters,
  mockUserProfile,
} from './data/mockData';

import {
  SidebarTab,
  Job,
  Application,
  ApplicationStage,
  FollowUp,
  Contact,
  CoverLetter,
  ResumeVersion,
  UserProfile,
  Interview,
  ActivityLog,
} from './types';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Firestore live collections state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [resumes, setResumes] = useState<ResumeVersion[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(mockUserProfile);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Dynamic context passed between views
  const [analyserTargetJob, setAnalyserTargetJob] = useState<Job | null>(null);
  const [resumeTargetJob, setResumeTargetJob] = useState<Job | null>(null);
  const [clInitialData, setClInitialData] = useState<{ company?: string; role?: string; jd?: string }>({});

  // Modals state
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [isOutreachModalOpen, setIsOutreachModalOpen] = useState(false);
  const [outreachContact, setOutreachContact] = useState<Contact | null>(null);
  const [outreachFollowUp, setOutreachFollowUp] = useState<FollowUp | null>(null);

  // Subscribe to real Firestore data when authenticated
  useEffect(() => {
    if (!user) {
      setJobs([]);
      setApplications([]);
      setFollowUps([]);
      setContacts([]);
      setResumes([]);
      setCoverLetters([]);
      setInterviews([]);
      setActivityLogs([]);
      setDataLoaded(false);
      return;
    }

    // Demo Mode: Seed rich mock pipeline immediately
    if (user.uid.startsWith('demo-')) {
      setJobs(mockJobs);
      setApplications(mockApplications);
      setFollowUps(mockFollowUps);
      setContacts(mockContacts);
      setResumes(mockResumes);
      setCoverLetters(mockCoverLetters);
      setInterviews(mockInterviews);
      setActivityLogs(mockRecentActivities);
      setUserProfile(mockUserProfile);
      setDataLoaded(true);
      return;
    }

    const unsubJobs = subscribeToCollection<Job>(
      'jobs',
      user.uid,
      (liveJobs) => {
        setJobs(liveJobs.length > 0 ? liveJobs : mockJobs);
      },
      (err) => console.warn('Jobs subscription notice:', err?.message)
    );

    const unsubApps = subscribeToCollection<Application>(
      'applications',
      user.uid,
      (liveApps) => {
        setApplications(liveApps.length > 0 ? liveApps : mockApplications);
      },
      (err) => console.warn('Applications subscription notice:', err?.message)
    );

    const unsubFollowUps = subscribeToCollection<FollowUp>(
      'followUps',
      user.uid,
      (liveFollowUps) => {
        setFollowUps(liveFollowUps.length > 0 ? liveFollowUps : mockFollowUps);
      },
      (err) => console.warn('FollowUps subscription notice:', err?.message)
    );

    const unsubContacts = subscribeToCollection<Contact>(
      'contacts',
      user.uid,
      (liveContacts) => {
        setContacts(liveContacts.length > 0 ? liveContacts : mockContacts);
      },
      (err) => console.warn('Contacts subscription notice:', err?.message)
    );

    const unsubResumes = subscribeToCollection<ResumeVersion>(
      'resumes',
      user.uid,
      (liveResumes) => {
        if (liveResumes.length === 0) {
          // If no resumes saved yet, use default mock resumes
          setResumes(mockResumes);
        } else {
          // Preserve baseline templates and include all saved live resume variants
          const liveIds = new Set(liveResumes.map((r) => r.id));
          const baseTemplates = mockResumes.filter((m) => !liveIds.has(m.id));
          setResumes([...baseTemplates, ...liveResumes]);
        }
      },
      (err) => console.warn('Resumes subscription notice:', err?.message)
    );

    const unsubCoverLetters = subscribeToCollection<CoverLetter>(
      'coverLetters',
      user.uid,
      (liveCLs) => {
        setCoverLetters(liveCLs.length > 0 ? liveCLs : mockCoverLetters);
      },
      (err) => console.warn('CoverLetters subscription notice:', err?.message)
    );

    const unsubInterviews = subscribeToCollection<Interview>(
      'interviews',
      user.uid,
      (liveInterviews) => {
        setInterviews(liveInterviews.length > 0 ? liveInterviews : mockInterviews);
      },
      (err) => console.warn('Interviews subscription notice:', err?.message)
    );

    const unsubActivity = subscribeToCollection<ActivityLog>(
      'activity',
      user.uid,
      (liveActivity) => {
        setActivityLogs(liveActivity.length > 0 ? liveActivity : mockRecentActivities);
      },
      (err) => console.warn('Activity subscription notice:', err?.message)
    );

    setDataLoaded(true);

    return () => {
      unsubJobs();
      unsubApps();
      unsubFollowUps();
      unsubContacts();
      unsubResumes();
      unsubCoverLetters();
      unsubInterviews();
      unsubActivity();
    };
  }, [user]);

  // If Auth is checking session
  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Authenticating secure Firebase session...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show LoginScreen
  if (!user) {
    return <LoginScreen />;
  }

  // Badges calculation
  const pendingFollowupsCount = followUps.filter((f) => f.status !== 'completed').length;
  const badges = {
    jobs: jobs.length,
    applications: applications.length,
    followUps: pendingFollowupsCount,
    interviews: interviews.length,
  };

  // Handlers
  const handleAnalyzeJob = (job: Job) => {
    setAnalyserTargetJob(job);
    setActiveTab('jd-analyser');
  };

  const handleTailorResume = (job: Job) => {
    setResumeTargetJob(job);
    setActiveTab('resumes');
  };

  const handleNavigateToCoverLetter = (company: string, role: string, jd: string) => {
    setClInitialData({ company, role, jd });
    setActiveTab('cover-letters');
  };

  const handleAddJob = async (newJob: Job) => {
    if (!user) return;
    try {
      await createDocument('jobs', user.uid, newJob);
      await logActivity(user.uid, 'job_saved', `Saved new job opportunity: ${newJob.title} at ${newJob.company}`, 'job', newJob.id);
    } catch (e) {
      console.error('Error adding job to Firestore:', e);
      // Fallback local update
      setJobs([newJob, ...jobs]);
    }
  };

  const handleUpdateJobStatus = async (id: string, status: Job['status']) => {
    if (!user) return;
    try {
      await updateDocument('jobs', user.uid, id, { status });
      if (status === 'applied') {
        const foundJob = jobs.find((j) => j.id === id);
        if (foundJob && !applications.some((a) => a.company === foundJob.company)) {
          const newApp: Partial<Application> = {
            jobId: foundJob.id,
            company: foundJob.company,
            jobTitle: foundJob.title,
            stage: 'applied',
            appliedDate: new Date().toISOString().split('T')[0],
            salaryExpected: foundJob.salary,
            location: foundJob.location,
            workType: foundJob.workType,
            matchScore: foundJob.matchScore,
            resumeVersion: 'Full-Stack & AI Master v2.4',
            nextStep: 'Awaiting initial recruiter review',
            lastUpdated: new Date().toISOString().split('T')[0],
          };
          await createDocument('applications', user.uid, newApp);
          await logActivity(user.uid, 'application_submitted', `Submitted application for ${foundJob.title} at ${foundJob.company}`, 'application', id);
        }
      }
    } catch (e) {
      console.error('Error updating job status:', e);
      setJobs(jobs.map((j) => (j.id === id ? { ...j, status } : j)));
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!user) return;
    try {
      await deleteDocument('jobs', user.uid, id);
    } catch (e) {
      console.error('Error deleting job:', e);
      setJobs(jobs.filter((j) => j.id !== id));
    }
  };

  const handleUpdateApplicationStage = async (appId: string, newStage: ApplicationStage) => {
    if (!user) return;
    try {
      await updateDocument('applications', user.uid, appId, {
        stage: newStage,
        lastUpdated: new Date().toISOString().split('T')[0],
      });
      await logActivity(user.uid, 'interview_scheduled', `Moved application to stage: ${newStage}`, 'application', appId);
    } catch (e) {
      console.error('Error updating application stage:', e);
      setApplications(
        applications.map((app) => (app.id === appId ? { ...app, stage: newStage } : app))
      );
    }
  };

  const handleMarkFollowUpDone = async (id: string) => {
    if (!user) return;
    try {
      await updateDocument('followUps', user.uid, id, { status: 'completed' });
    } catch (e) {
      console.error('Error marking follow-up completed:', e);
      setFollowUps(
        followUps.map((f) => (f.id === id ? { ...f, status: 'completed' } : f))
      );
    }
  };

  const handleOpenOutreachForContact = (contact: Contact) => {
    setOutreachContact(contact);
    setOutreachFollowUp(null);
    setIsOutreachModalOpen(true);
  };

  const handleOpenOutreachForFollowUp = (fu: FollowUp) => {
    setOutreachFollowUp(fu);
    setOutreachContact(null);
    setIsOutreachModalOpen(true);
  };

  const handleSetMasterResume = async (id: string) => {
    setResumes(
      resumes.map((r) => ({
        ...r,
        isMaster: r.id === id,
      }))
    );
  };

  const handleSaveCoverLetter = async (newCl: CoverLetter) => {
    if (!user) return;
    try {
      await createDocument('coverLetters', user.uid, newCl);
      await logActivity(user.uid, 'cover_letter_generated', `Generated cover letter for ${newCl.jobTitle} at ${newCl.company}`, 'cover_letter', newCl.id);
    } catch (e) {
      console.error('Error saving cover letter:', e);
      setCoverLetters([newCl, ...coverLetters]);
    }
  };

  const handleAddContact = async (newC: Contact) => {
    if (!user) return;
    try {
      await createDocument('contacts', user.uid, newC);
    } catch (e) {
      console.error('Error adding contact:', e);
      setContacts([newC, ...contacts]);
    }
  };

  const handleAddFollowUp = async (newFu: FollowUp) => {
    if (!user) return;
    try {
      await createDocument('followUps', user.uid, newFu);
    } catch (e) {
      console.error('Error adding follow-up:', e);
      setFollowUps([newFu, ...followUps]);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        badges={badges}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-950">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onOpenAddJobModal={() => setIsAddJobModalOpen(true)}
          onOpenOutreachModal={() => {
            setOutreachContact(null);
            setOutreachFollowUp(null);
            setIsOutreachModalOpen(true);
          }}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          followUps={followUps}
          interviews={interviews}
          activityLogs={activityLogs}
        />

        {/* Dynamic Viewport Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              jobs={jobs}
              applications={applications}
              followUps={followUps}
              interviews={interviews}
              activityLogs={activityLogs.length > 0 ? activityLogs : mockRecentActivities}
              userProfile={userProfile}
              onNavigate={setActiveTab}
              onAnalyzeJob={handleAnalyzeJob}
              onOpenOutreachModal={handleOpenOutreachForFollowUp}
              onOpenAddJobModal={() => setIsAddJobModalOpen(true)}
              onMarkFollowUpComplete={handleMarkFollowUpDone}
            />
          )}

          {activeTab === 'jobs' && (
            <JobsView
              jobs={jobs}
              applications={applications}
              followUps={followUps}
              interviews={interviews}
              onAnalyzeJob={handleAnalyzeJob}
              onTailorResume={handleTailorResume}
              onOpenAddJobModal={() => setIsAddJobModalOpen(true)}
              onUpdateJobStatus={handleUpdateJobStatus}
              onDeleteJob={handleDeleteJob}
              onNavigateToTab={setActiveTab}
              onNavigateToCoverLetter={handleNavigateToCoverLetter}
              onOpenOutreachModal={handleOpenOutreachForFollowUp}
            />
          )}

          {activeTab === 'jd-analyser' && (
            <JDAnalyserView
              jobs={jobs}
              resumes={resumes}
              initialSelectedJob={analyserTargetJob}
              onNavigateToCoverLetter={handleNavigateToCoverLetter}
            />
          )}

          {activeTab === 'resumes' && (
            <ResumesView
              resumes={resumes}
              jobs={jobs}
              userProfile={userProfile}
              initialJob={resumeTargetJob}
              onSetMasterResume={handleSetMasterResume}
              onCreateResumeVariant={(newR) => setResumes([newR, ...resumes])}
              onUpdateResume={(upR) => setResumes(resumes.map((r) => (r.id === upR.id ? upR : r)))}
              onDeleteResume={(delId) => setResumes(resumes.filter((r) => r.id !== delId))}
            />
          )}

          {activeTab === 'cover-letters' && (
            <CoverLettersView
              coverLetters={coverLetters}
              initialCompany={clInitialData.company}
              initialRole={clInitialData.role}
              initialJD={clInitialData.jd}
              onSaveCoverLetter={handleSaveCoverLetter}
            />
          )}

          {activeTab === 'applications' && (
            <ApplicationsView
              applications={applications}
              onOpenAddJobModal={() => setIsAddJobModalOpen(true)}
              onUpdateStage={handleUpdateApplicationStage}
            />
          )}

          {activeTab === 'contacts' && (
            <ContactsView
              contacts={contacts}
              onAddContact={handleAddContact}
              onOpenOutreachForContact={handleOpenOutreachForContact}
            />
          )}

          {activeTab === 'follow-ups' && (
            <FollowUpsView
              followUps={followUps}
              onMarkDone={handleMarkFollowUpDone}
              onOpenOutreachModal={handleOpenOutreachForFollowUp}
              onAddFollowUp={handleAddFollowUp}
            />
          )}

          {activeTab === 'interviews' && (
            <InterviewsView interviews={interviews} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView stats={mockStats} applications={applications} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              userProfile={userProfile}
              onUpdateProfile={(updated) => setUserProfile(updated)}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <AddJobModal
        isOpen={isAddJobModalOpen}
        onClose={() => setIsAddJobModalOpen(false)}
        onJobCreated={() => setIsAddJobModalOpen(false)}
        onViewExistingJob={() => {
          setActiveTab('jobs');
          setIsAddJobModalOpen(false);
        }}
      />

      <QuickOutreachModal
        isOpen={isOutreachModalOpen}
        onClose={() => setIsOutreachModalOpen(false)}
        targetContact={outreachContact}
        targetFollowUp={outreachFollowUp}
      />
    </div>
  );
}

