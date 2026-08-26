import React, { useState } from 'react';
import {
  X,
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Sparkles,
  Link as LinkIcon,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Plus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Info,
  RefreshCw,
  Check,
} from 'lucide-react';
import {
  FirestoreJob,
  FirestoreJobStatus,
  JobPriority,
  WorkType,
  FirestoreJobDescription,
} from '../types';
import {
  createJob,
  updateJob,
  saveJobDescription,
  checkDuplicateJob,
} from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated?: (newJobId: string) => void;
  onViewExistingJob?: (job: FirestoreJob) => void;
}

type IntakeMode = 'url' | 'manual' | 'form';
type StepStatus = 'idle' | 'saving' | 'analyzing' | 'completed' | 'analysis-failed' | 'save-failed';

export const AddJobModal: React.FC<AddJobModalProps> = ({
  isOpen,
  onClose,
  onJobCreated,
  onViewExistingJob,
}) => {
  const { user } = useAuth();

  const [mode, setMode] = useState<IntakeMode>('url');

  // URL Intake state
  const [urlInput, setUrlInput] = useState('');
  const [isExtractingUrl, setIsExtractingUrl] = useState(false);
  const [urlExtractionError, setUrlExtractionError] = useState<string | null>(null);

  // Manual JD Intake state
  const [manualCompany, setManualCompany] = useState('');
  const [manualRole, setManualRole] = useState('');
  const [manualLocation, setManualLocation] = useState('Remote');
  const [manualJobUrl, setManualJobUrl] = useState('');
  const [manualAppUrl, setManualAppUrl] = useState('');
  const [manualRawJd, setManualRawJd] = useState('');
  
  // Explicit Workflow States
  const [manualStep, setManualStep] = useState<StepStatus>('idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastSavedJobId, setLastSavedJobId] = useState<string | null>(null);
  const [analysisErrorDetail, setAnalysisErrorDetail] = useState<string | null>(null);

  // Direct Form fields
  const [formCompany, setFormCompany] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formLocation, setFormLocation] = useState('Remote (US/Global)');
  const [formWorkType, setFormWorkType] = useState<WorkType>('Remote');
  const [formSalary, setFormSalary] = useState('');
  const [formExperience, setFormExperience] = useState('5+ Years');
  const [formSource, setFormSource] = useState('LinkedIn');
  const [formJobUrl, setFormJobUrl] = useState('');
  const [formApplicationUrl, setFormApplicationUrl] = useState('');
  const [formJobId, setFormJobId] = useState('');
  const [formPostedDate, setFormPostedDate] = useState('Recent');
  const [formPriority, setFormPriority] = useState<JobPriority>('Target');
  const [formStatus, setFormStatus] = useState<FirestoreJobStatus>('Saved');
  const [formNotes, setFormNotes] = useState('');
  const [formTags, setFormTags] = useState('TypeScript, React, Node.js');
  const [formRawJd, setFormRawJd] = useState('');

  // General processing & duplicate detection states
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Duplicate Warning state
  const [duplicateJob, setDuplicateJob] = useState<FirestoreJob | null>(null);
  const [pendingJobData, setPendingJobData] = useState<{
    job: Omit<FirestoreJob, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>;
    jd?: Omit<FirestoreJobDescription, 'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'jobId'>;
    action?: 'form' | 'manual' | 'url';
  } | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setUrlInput('');
    setIsExtractingUrl(false);
    setUrlExtractionError(null);
    setManualCompany('');
    setManualRole('');
    setManualLocation('Remote');
    setManualJobUrl('');
    setManualAppUrl('');
    setManualRawJd('');
    setManualStep('idle');
    setIsProcessing(false);
    setIsRetrying(false);
    setLastSavedJobId(null);
    setAnalysisErrorDetail(null);
    setFormCompany('');
    setFormRole('');
    setFormLocation('Remote (US/Global)');
    setFormSalary('');
    setFormExperience('5+ Years');
    setFormJobUrl('');
    setFormApplicationUrl('');
    setFormJobId('');
    setFormRawJd('');
    setFormNotes('');
    setDuplicateJob(null);
    setPendingJobData(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Perform duplicate check and save for Standard Form
  const proceedWithSave = async (
    jobData: Omit<FirestoreJob, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>,
    jdData?: Omit<FirestoreJobDescription, 'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'jobId'>,
    bypassDuplicateCheck = false
  ) => {
    if (!user) {
      setErrorMessage('User session expired. Please sign in again.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (!bypassDuplicateCheck) {
        const existing = await checkDuplicateJob(user.uid, {
          jobUrl: jobData.jobUrl,
          applicationUrl: jobData.applicationUrl,
          company: jobData.company,
          role: jobData.role,
          jobId: jobData.jobId,
        });

        if (existing) {
          setDuplicateJob(existing);
          setPendingJobData({ job: jobData, jd: jdData, action: 'form' });
          setIsSaving(false);
          return;
        }
      }

      // Create Job in Firestore
      const newJobId = await createJob(user.uid, jobData);

      // If JD data exists, save linked record in jobDescriptions
      if (jdData && (jdData.rawText || jdData.summary)) {
        await saveJobDescription(user.uid, {
          ...jdData,
          jobId: newJobId,
        });
      }

      setSuccessMessage(`Opportunity for ${jobData.role} at ${jobData.company} successfully saved!`);
      setTimeout(() => {
        if (onJobCreated) onJobCreated(newJobId);
        handleClose();
      }, 900);
    } catch (err: any) {
      console.error('Error saving job:', err);
      setErrorMessage(err.message || 'Failed to save job to Firestore. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // URL Extraction Handler
  const handleExtractUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsExtractingUrl(true);
    setUrlExtractionError(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/jobs/extract-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      const json = await res.json();

      if (!json.success || !json.data) {
        setUrlExtractionError(
          json.error || 'Automatic extraction was not available for this page.'
        );
        setManualJobUrl(urlInput.trim());
        setManualAppUrl(urlInput.trim());
        return;
      }

      const d = json.data;

      const jobPayload: Omit<FirestoreJob, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'> = {
        company: d.company || 'Target Company',
        role: d.role || 'Software Engineer',
        location: d.location || 'Remote',
        workType: (d.workType as WorkType) || 'Remote',
        salary: d.salary || '',
        experience: d.experience || '',
        source: d.source || 'Public Web Extraction',
        jobUrl: d.jobUrl || urlInput.trim(),
        applicationUrl: d.applicationUrl || urlInput.trim(),
        jobId: d.jobId || '',
        postedDate: d.postedDate || new Date().toISOString().split('T')[0],
        status: 'JD Analyzed',
        fitnessScore: typeof d.matchScore === 'number' ? d.matchScore : 0,
        priority: (d.priority as JobPriority) || 'Target',
        description: d.summary || d.rawText?.slice(0, 400) || '',
        tags: d.keywords || ['TypeScript', 'Full-Stack'],
        notes: `Extracted via URL intake on ${new Date().toLocaleDateString()}`,
        matchKeyHighlights: [
          `Aligned with ${d.company} role requirements`,
          'Direct full-stack tech stack match',
        ],
        analysisStatus: 'completed',
      };

      const jdPayload: Omit<FirestoreJobDescription, 'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'jobId'> = {
        rawText: d.rawText || '',
        summary: d.summary || '',
        skills: [...(d.mustHaveSkills || []), ...(d.preferredSkills || [])],
        mustHaveSkills: d.mustHaveSkills || [],
        preferredSkills: d.preferredSkills || [],
        responsibilities: d.responsibilities || [],
        qualifications: d.qualifications || [],
        experienceRequirements: d.experienceRequirements || '',
        educationRequirements: d.educationRequirements || '',
        keywords: d.keywords || [],
        analysisStatus: 'completed',
      };

      await proceedWithSave(jobPayload, jdPayload);
    } catch (err: any) {
      console.error('URL extraction error:', err);
      setUrlExtractionError(
        'Automatic extraction was not available for this page. Please paste the JD manually.'
      );
      setManualJobUrl(urlInput.trim());
    } finally {
      setIsExtractingUrl(false);
    }
  };

  // ROBUST 5-STEP MANUAL JD INTAKE HANDLER
  const handleSaveManualJd = async (e: React.FormEvent, bypassDuplicate = false) => {
    if (e) e.preventDefault();
    if (!manualCompany.trim() || !manualRole.trim() || !manualRawJd.trim()) {
      setErrorMessage('Company, Role, and Job Description content are required.');
      return;
    }

    if (!user) {
      setErrorMessage('User session expired. Please sign in again.');
      return;
    }

    setIsProcessing(true);
    setManualStep('saving');
    setErrorMessage(null);
    setSuccessMessage(null);
    setAnalysisErrorDetail(null);

    let createdJobId: string | null = null;

    try {
      // Step 0: Duplicate Check
      if (!bypassDuplicate) {
        const existing = await checkDuplicateJob(user.uid, {
          company: manualCompany.trim(),
          role: manualRole.trim(),
          jobUrl: manualJobUrl.trim(),
          applicationUrl: manualAppUrl.trim() || manualJobUrl.trim(),
        });

        if (existing) {
          setDuplicateJob(existing);
          setPendingJobData({
            job: {
              company: manualCompany.trim(),
              role: manualRole.trim(),
              location: manualLocation.trim() || 'Remote',
              workType: 'Remote',
              salary: '',
              experience: '5+ Years',
              source: 'Direct / Manual Input',
              jobUrl: manualJobUrl.trim(),
              applicationUrl: manualAppUrl.trim() || manualJobUrl.trim(),
              jobId: '',
              postedDate: new Date().toISOString().split('T')[0],
              status: 'Saved',
              fitnessScore: 0,
              priority: 'Target',
              description: manualRawJd.trim().slice(0, 400),
              tags: ['TypeScript', 'Full-Stack'],
              notes: `Manual JD pasted on ${new Date().toLocaleDateString()}`,
              analysisStatus: 'pending',
            },
            jd: {
              rawText: manualRawJd.trim(),
              summary: `Job description for ${manualRole.trim()} at ${manualCompany.trim()}`,
              skills: [],
              mustHaveSkills: [],
              preferredSkills: [],
              responsibilities: [],
              qualifications: [],
              keywords: [],
              analysisStatus: 'pending',
            },
            action: 'manual',
          });
          setManualStep('idle');
          setIsProcessing(false);
          return;
        }
      }

      // STEP 1: Save the job and raw JD immediately to Firestore
      setManualStep('saving');

      const initialJob: Omit<FirestoreJob, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'> = {
        company: manualCompany.trim(),
        role: manualRole.trim(),
        location: manualLocation.trim() || 'Remote',
        workType: 'Remote',
        salary: '',
        experience: '5+ Years',
        source: 'Direct / Manual Input',
        jobUrl: manualJobUrl.trim(),
        applicationUrl: manualAppUrl.trim() || manualJobUrl.trim(),
        jobId: '',
        postedDate: new Date().toISOString().split('T')[0],
        status: 'Saved',
        fitnessScore: 0,
        priority: 'Target',
        description: manualRawJd.trim().slice(0, 400),
        tags: ['TypeScript', 'Full-Stack'],
        notes: `Manual JD pasted on ${new Date().toLocaleDateString()}`,
        analysisStatus: 'pending',
      };

      createdJobId = await createJob(user.uid, initialJob);
      setLastSavedJobId(createdJobId);

      const initialJd: Omit<FirestoreJobDescription, 'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'jobId'> = {
        rawText: manualRawJd.trim(),
        summary: `Job description for ${manualRole.trim()} at ${manualCompany.trim()}`,
        skills: [],
        mustHaveSkills: [],
        preferredSkills: [],
        responsibilities: [],
        qualifications: [],
        keywords: [],
        analysisStatus: 'pending',
      };

      await saveJobDescription(user.uid, {
        ...initialJd,
        jobId: createdJobId,
      });

      // STEP 2: Attempt Gemini analysis with strict timeout
      setManualStep('analyzing');

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 18000);

        const res = await fetch('/api/jobs/parse-manual-jd', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            company: manualCompany.trim(),
            role: manualRole.trim(),
            location: manualLocation.trim(),
            jobUrl: manualJobUrl.trim(),
            applicationUrl: manualAppUrl.trim() || manualJobUrl.trim(),
            rawJd: manualRawJd.trim(),
          }),
        });
        clearTimeout(timeoutId);

        const json = await res.json();

        if (json.success && json.data) {
          // STEP 3: If analysis succeeds, save the structured analysis
          const d = json.data;
          const updatedJobFields: Partial<FirestoreJob> = {
            location: manualLocation.trim() || d.location || 'Remote',
            workType: (d.workType as WorkType) || 'Remote',
            salary: d.salary || '',
            experience: d.experience || '5+ Years',
            status: 'JD Analyzed',
            fitnessScore: typeof d.matchScore === 'number' ? d.matchScore : 0,
            priority: (d.priority as JobPriority) || 'Target',
            description: d.summary || manualRawJd.trim().slice(0, 400),
            tags: Array.isArray(d.keywords) && d.keywords.length > 0 ? d.keywords : ['TypeScript', 'Full-Stack'],
            matchKeyHighlights: [
              `Analyzed against ${manualCompany.trim()} job requirements`,
              'Core engineering competencies verified',
            ],
            analysisStatus: 'completed',
            analysisError: undefined,
          };
          await updateJob(createdJobId, user.uid, updatedJobFields);

          await saveJobDescription(user.uid, {
            jobId: createdJobId,
            rawText: manualRawJd.trim(),
            summary: d.summary || `Position for ${manualRole} at ${manualCompany}`,
            skills: [...(d.mustHaveSkills || []), ...(d.preferredSkills || [])],
            mustHaveSkills: d.mustHaveSkills || [],
            preferredSkills: d.preferredSkills || [],
            responsibilities: d.responsibilities || [],
            qualifications: d.qualifications || [],
            experienceRequirements: d.experienceRequirements || '',
            educationRequirements: d.educationRequirements || '',
            keywords: d.keywords || [],
            analysisStatus: 'completed',
            analysisError: undefined,
          });

          setManualStep('completed');
          setSuccessMessage('JD saved and AI analysis complete!');
          if (onJobCreated) onJobCreated(createdJobId);
          setTimeout(() => {
            handleClose();
          }, 1200);
        } else {
          throw new Error(json.error || 'AI service could not extract structured data.');
        }
      } catch (analysisErr: any) {
        // STEP 4: If analysis fails, keep the job and raw JD saved and mark analysisStatus = "failed"
        console.warn('Gemini analysis failed, raw JD is safely preserved in Firestore:', analysisErr);
        if (createdJobId) {
          await updateJob(createdJobId, user.uid, {
            analysisStatus: 'failed',
            analysisError: analysisErr.message || 'AI analysis could not be completed.',
          });
          await saveJobDescription(user.uid, {
            jobId: createdJobId,
            rawText: manualRawJd.trim(),
            summary: `Job description for ${manualRole.trim()} at ${manualCompany.trim()}`,
            skills: [],
            mustHaveSkills: [],
            preferredSkills: [],
            responsibilities: [],
            qualifications: [],
            keywords: [],
            analysisStatus: 'failed',
            analysisError: analysisErr.message || 'AI analysis could not be completed.',
          });
        }
        setManualStep('analysis-failed');
        setAnalysisErrorDetail(analysisErr.message || 'AI service timed out or was unavailable.');
        setErrorMessage('JD saved, but AI analysis could not be completed.');
        if (onJobCreated && createdJobId) onJobCreated(createdJobId);
      }
    } catch (saveErr: any) {
      console.error('Failed to save job to Firestore:', saveErr);
      setManualStep('save-failed');
      setErrorMessage(saveErr.message || 'Failed to save job to Firestore.');
    } finally {
      // STEP 5: Always stop the loading state
      setIsProcessing(false);
    }
  };

  // RETRY ANALYSIS HANDLER
  const handleRetryAnalysis = async () => {
    if (!lastSavedJobId || !user || !manualRawJd.trim()) return;

    setIsRetrying(true);
    setManualStep('analyzing');
    setErrorMessage(null);
    setAnalysisErrorDetail(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000);

      const res = await fetch('/api/jobs/parse-manual-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          company: manualCompany.trim(),
          role: manualRole.trim(),
          location: manualLocation.trim(),
          jobUrl: manualJobUrl.trim(),
          applicationUrl: manualAppUrl.trim() || manualJobUrl.trim(),
          rawJd: manualRawJd.trim(),
        }),
      });
      clearTimeout(timeoutId);

      const json = await res.json();

      if (json.success && json.data) {
        const d = json.data;
        const updatedJobFields: Partial<FirestoreJob> = {
          location: manualLocation.trim() || d.location || 'Remote',
          workType: (d.workType as WorkType) || 'Remote',
          salary: d.salary || '',
          experience: d.experience || '5+ Years',
          status: 'JD Analyzed',
          fitnessScore: typeof d.matchScore === 'number' ? d.matchScore : 0,
          priority: (d.priority as JobPriority) || 'Target',
          description: d.summary || manualRawJd.trim().slice(0, 400),
          tags: Array.isArray(d.keywords) && d.keywords.length > 0 ? d.keywords : ['TypeScript', 'Full-Stack'],
          matchKeyHighlights: [
            `Analyzed against ${manualCompany.trim()} job requirements`,
            'Core engineering competencies matched',
          ],
          analysisStatus: 'completed',
          analysisError: undefined,
        };
        await updateJob(lastSavedJobId, user.uid, updatedJobFields);

        await saveJobDescription(user.uid, {
          jobId: lastSavedJobId,
          rawText: manualRawJd.trim(),
          summary: d.summary || `Position for ${manualRole} at ${manualCompany}`,
          skills: [...(d.mustHaveSkills || []), ...(d.preferredSkills || [])],
          mustHaveSkills: d.mustHaveSkills || [],
          preferredSkills: d.preferredSkills || [],
          responsibilities: d.responsibilities || [],
          qualifications: d.qualifications || [],
          experienceRequirements: d.experienceRequirements || '',
          educationRequirements: d.educationRequirements || '',
          keywords: d.keywords || [],
          analysisStatus: 'completed',
          analysisError: undefined,
        });

        setManualStep('completed');
        setSuccessMessage('AI Analysis successfully completed and synced!');
        setTimeout(() => {
          handleClose();
        }, 1200);
      } else {
        throw new Error(json.error || 'AI analysis could not extract structured data.');
      }
    } catch (err: any) {
      console.warn('Retry analysis failed:', err);
      setManualStep('analysis-failed');
      setAnalysisErrorDetail(err.message || 'AI analysis timed out or failed.');
      setErrorMessage('JD saved, but AI analysis could not be completed.');
    } finally {
      setIsRetrying(false);
    }
  };

  // Direct Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCompany.trim() || !formRole.trim()) {
      setErrorMessage('Company and Role are required.');
      return;
    }

    if (!formJobUrl.trim() && !formRawJd.trim()) {
      setErrorMessage('Please provide either a Job URL or paste the Job Description.');
      return;
    }

    const jobPayload: Omit<FirestoreJob, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'> = {
      company: formCompany.trim(),
      role: formRole.trim(),
      location: formLocation.trim() || 'Remote',
      workType: formWorkType,
      salary: formSalary.trim(),
      experience: formExperience.trim(),
      source: formSource.trim() || 'Direct',
      jobUrl: formJobUrl.trim(),
      applicationUrl: formApplicationUrl.trim() || formJobUrl.trim(),
      jobId: formJobId.trim(),
      postedDate: formPostedDate.trim() || 'Recent',
      status: formStatus,
      priority: formPriority,
      fitnessScore: 0,
      description: formRawJd ? formRawJd.slice(0, 400) : `Opportunity at ${formCompany}`,
      tags: formTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      notes: formNotes.trim(),
      analysisStatus: formRawJd.trim() ? 'pending' : undefined,
    };

    const jdPayload = formRawJd.trim()
      ? {
          rawText: formRawJd.trim(),
          summary: `Job description for ${formRole} at ${formCompany}`,
          skills: formTags.split(',').map((t) => t.trim()).filter(Boolean),
          mustHaveSkills: formTags.split(',').map((t) => t.trim()).filter(Boolean),
          preferredSkills: [],
          responsibilities: [],
          qualifications: [],
          keywords: formTags.split(',').map((t) => t.trim()).filter(Boolean),
          analysisStatus: 'pending' as const,
        }
      : undefined;

    await proceedWithSave(jobPayload, jdPayload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div
        id="add-job-modal-container"
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-150 text-slate-200"
      >
        {/* Header */}
        <div className="p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Save a Job & Intake JD</h3>
              <p className="text-xs text-slate-400">
                Extract from public posting URL or paste job requirements manually
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('url');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold transition-all ${
              mode === 'url'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Paste Job URL (Auto-Extract)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('manual');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold transition-all ${
              mode === 'manual'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste JD Manually</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('form');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold transition-all ${
              mode === 'form'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Standard Form</span>
          </button>
        </div>

        {/* Feedback / Notification Banners */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div className="space-y-1 flex-1">
              <div className="font-semibold">{errorMessage}</div>
              {analysisErrorDetail && (
                <div className="text-[11px] text-amber-300/80 font-mono">
                  {analysisErrorDetail}
                </div>
              )}
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div className="font-semibold">{successMessage}</div>
          </div>
        )}

        {/* DUPLICATE WARNING MODAL OVERLAY */}
        {duplicateJob && (
          <div className="p-6 m-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs space-y-3.5 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-200">
                  This job may already exist in your command center.
                </h4>
                <p className="text-slate-300 mt-1">
                  Matching record:{' '}
                  <strong className="text-white">
                    {duplicateJob.role} at {duplicateJob.company}
                  </strong>{' '}
                  ({duplicateJob.location || 'Remote'}) • Status: {duplicateJob.status}
                </p>
                {duplicateJob.jobUrl && (
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-md">
                    URL: {duplicateJob.jobUrl}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-amber-500/20">
              <button
                type="button"
                onClick={() => {
                  setDuplicateJob(null);
                  setPendingJobData(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Cancel
              </button>

              {onViewExistingJob && (
                <button
                  type="button"
                  onClick={() => {
                    const existing = duplicateJob;
                    handleClose();
                    onViewExistingJob(existing);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-semibold"
                >
                  View Existing Job
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (pendingJobData) {
                    if (pendingJobData.action === 'manual') {
                      handleSaveManualJd(null as any, true);
                    } else {
                      proceedWithSave(pendingJobData.job, pendingJobData.jd, true);
                    }
                    setDuplicateJob(null);
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-xs"
              >
                Save Anyway
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: URL INTAKE */}
        {mode === 'url' && !duplicateJob && (
          <form onSubmit={handleExtractUrl} className="p-6 overflow-y-auto space-y-5 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>One-Click Public Job Intake</span>
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Paste a public job posting URL from <strong>LinkedIn, Indeed, Naukri, Greenhouse, Lever, Ashby, Workday</strong>, or company career portals. We will automatically extract and structure the role, company, qualifications, and full JD.
              </p>
            </div>

            <div>
              <label className="block text-slate-200 font-semibold mb-1.5">
                Paste Public Job Posting URL *
              </label>
              <div className="relative">
                <input
                  required
                  type="url"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setUrlExtractionError(null);
                  }}
                  placeholder="https://www.linkedin.com/jobs/view/..."
                  className="w-full pl-3.5 pr-10 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-xs"
                />
                <LinkIcon className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Error Fallback when URL cannot be extracted */}
            {urlExtractionError && (
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-slate-200 space-y-2.5">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-300">
                      Automatic extraction was not available for this page.
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      This posting may require login, CAPTCHA verification, or have bot restrictions. You can paste the job description text manually in one click.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('manual');
                    setUrlExtractionError(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Paste JD Manually Instead</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMode('manual')}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Or paste JD manually →
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isExtractingUrl || isSaving || !urlInput.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-md shadow-cyan-950/50 disabled:opacity-50"
                >
                  {isExtractingUrl ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Extracting & Parsing JD...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Extract & Save JD</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: MANUAL JD INPUT */}
        {mode === 'manual' && !duplicateJob && (
          <form onSubmit={handleSaveManualJd} className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Name *</label>
                <input
                  required
                  type="text"
                  value={manualCompany}
                  onChange={(e) => setManualCompany(e.target.value)}
                  placeholder="e.g. Anthropic, Scale AI, Google"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Role / Title *</label>
                <input
                  required
                  type="text"
                  value={manualRole}
                  onChange={(e) => setManualRole(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Location</label>
                <input
                  type="text"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder="San Francisco, CA or Remote"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Job Posting URL (Optional)</label>
                <input
                  type="url"
                  value={manualJobUrl}
                  onChange={(e) => setManualJobUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Application URL (Optional)</label>
                <input
                  type="url"
                  value={manualAppUrl}
                  onChange={(e) => setManualAppUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-300 font-semibold">
                  Full Job Description Text *
                </label>
                <span className="text-[11px] text-slate-500">
                  {manualRawJd.length} characters
                </span>
              </div>
              <textarea
                required
                rows={8}
                value={manualRawJd}
                onChange={(e) => setManualRawJd(e.target.value)}
                placeholder="Paste the full job description, responsibilities, requirements, benefits, and tech stack text here..."
                className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 font-mono text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Workflow Step Notification Bar */}
            {manualStep === 'analysis-failed' && lastSavedJobId && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-amber-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    <strong>JD Saved in Firestore!</strong> AI analysis encountered an issue.
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleRetryAnalysis}
                    disabled={isRetrying}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-xs disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                    <span>{isRetrying ? 'Retrying...' : 'Retry Analysis'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onJobCreated && lastSavedJobId) onJobCreated(lastSavedJobId);
                      handleClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
                  >
                    View Job & Done
                  </button>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              {/* Progress Indicator */}
              <div className="text-xs">
                {manualStep === 'saving' && (
                  <span className="inline-flex items-center gap-1.5 text-cyan-400 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving JD to Firestore...</span>
                  </span>
                )}
                {manualStep === 'analyzing' && (
                  <span className="inline-flex items-center gap-1.5 text-purple-400 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing JD with Gemini AI...</span>
                  </span>
                )}
                {manualStep === 'completed' && (
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Analysis Complete</span>
                  </span>
                )}
                {manualStep === 'analysis-failed' && (
                  <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Analysis Failed (JD Safely Stored)</span>
                  </span>
                )}
                {manualStep === 'save-failed' && (
                  <span className="inline-flex items-center gap-1.5 text-rose-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Save Failed</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || isRetrying}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-md shadow-cyan-950/50 disabled:opacity-50"
                >
                  {isProcessing || isRetrying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {manualStep === 'saving'
                          ? 'Saving JD...'
                          : manualStep === 'analyzing'
                          ? 'Analyzing JD...'
                          : 'Processing...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save & Analyze JD</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 3: STANDARD COMPREHENSIVE FORM */}
        {mode === 'form' && !duplicateJob && (
          <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Name *</label>
                <input
                  required
                  type="text"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  placeholder="e.g. OpenAI, Stripe"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role / Job Title *</label>
                <input
                  required
                  type="text"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  placeholder="e.g. Staff Full-Stack Engineer"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Location</label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="San Francisco, CA or Remote"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Work Type</label>
                <select
                  value={formWorkType}
                  onChange={(e) => setFormWorkType(e.target.value as WorkType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">On-site</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as JobPriority)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="Dream">Dream</option>
                  <option value="Target">Target</option>
                  <option value="Safety">Safety</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Salary Range</label>
                <input
                  type="text"
                  value={formSalary}
                  onChange={(e) => setFormSalary(e.target.value)}
                  placeholder="e.g. $185k - $225k"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Experience Required</label>
                <input
                  type="text"
                  value={formExperience}
                  onChange={(e) => setFormExperience(e.target.value)}
                  placeholder="e.g. 5+ Years"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as FirestoreJobStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-cyan-300 font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="Saved">Saved</option>
                  <option value="JD Analyzed">JD Analyzed</option>
                  <option value="Ready to Apply">Ready to Apply</option>
                  <option value="Applied">Applied</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Job URL</label>
                <input
                  type="url"
                  value={formJobUrl}
                  onChange={(e) => setFormJobUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Application URL</label>
                <input
                  type="url"
                  value={formApplicationUrl}
                  onChange={(e) => setFormApplicationUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Job Description / Requirements Snippet
              </label>
              <textarea
                rows={3}
                value={formRawJd}
                onChange={(e) => setFormRawJd(e.target.value)}
                placeholder="Paste key responsibilities or full JD..."
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Notes / Outreach Target</label>
              <textarea
                rows={2}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Notes on team size, interview prep..."
                className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-md shadow-cyan-950/50 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{isSaving ? 'Saving Job...' : 'Save Job to Command Center'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
