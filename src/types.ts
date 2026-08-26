export type NavSection =
  | 'dashboard'
  | 'jobs'
  | 'jd-analyser'
  | 'resumes'
  | 'cover-letters'
  | 'applications'
  | 'contacts'
  | 'follow-ups'
  | 'interviews'
  | 'analytics'
  | 'settings';

export type SidebarTab = NavSection;

export interface DashboardStats {
  jobsSaved: number;
  applicationsSent: number;
  responsesReceived: number;
  interviewsScheduled: number;
  offersReceived: number;
  rejectionsReceived: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
}

export interface PipelineStage {
  id: ApplicationStage;
  label: string;
  count: number;
  color: string;
  badgeBg: string;
}

export type JobStatus = 'saved' | 'applied' | 'interviewing' | 'offer' | 'archived' | 'rejected';
export type WorkType = 'Remote' | 'Hybrid' | 'Onsite';
export type CompanyTier = 'Dream' | 'Target' | 'Safety';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  workType: WorkType;
  salary: string;
  salaryMin?: number;
  salaryMax?: number;
  matchScore: number;
  matchKeyHighlights: string[];
  status: JobStatus;
  url?: string;
  source: string; // LinkedIn, Indeed, Referral, Greenhouse, Lever, Direct
  description: string;
  postedDate: string;
  tags: string[];
  tier: CompanyTier;
  recruiter?: string;
  recruiterEmail?: string;
  notes?: string;
  savedDate: string;
}

export type ApplicationStage =
  | 'saved'
  | 'applied'
  | 'screening'
  | 'tech_interview'
  | 'final_round'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  stage: ApplicationStage;
  appliedDate: string;
  salaryExpected: string;
  salaryOffered?: string;
  location: string;
  workType: WorkType;
  contactName?: string;
  contactEmail?: string;
  resumeVersion: string;
  coverLetterUsed?: boolean;
  matchScore: number;
  nextStep?: string;
  nextStepDate?: string;
  notes?: string;
  feedback?: string;
  lastUpdated: string;
}

export interface ScoreBreakdownItem {
  score: number; // 0 to 100
  weight: number; // percentage e.g. 30 for skills
  weightedScore?: number;
  explanation: string;
  strengths: string[];
  gaps: string[];
}

export interface MatchScoreBreakdown {
  skillsMatch: ScoreBreakdownItem;       // 30%
  experienceMatch: ScoreBreakdownItem;   // 20%
  domainMatch: ScoreBreakdownItem;       // 20%
  seniorityMatch: ScoreBreakdownItem;    // 15%
  projectsMatch: ScoreBreakdownItem;     // 10%
  educationMatch: ScoreBreakdownItem;    // 5%
}

export interface KeywordEvidence {
  keyword: string;
  category: 'Technical Skill' | 'Soft Skill' | 'Tool / Library' | 'Domain Knowledge' | 'Architecture' | 'Process / Agile';
  importance: 'Critical' | 'Required' | 'Preferred' | 'Bonus';
  jdEvidence: string;
  resumeEvidence: string;
  status: 'matched' | 'partial' | 'missing';
  gapAnalysis?: string;
  recommendation?: string;
}

export interface JDAnalysisResult {
  matchScore: number; // Overall calculated weighted score
  roleCompatibility: number;
  atsScore: number; // Separate ATS parser index
  matchSummary: string;
  breakdown: MatchScoreBreakdown;
  matchedKeywords: (string | KeywordEvidence)[];
  partialKeywords: (string | KeywordEvidence)[];
  missingKeywords: (string | KeywordEvidence)[];
  matchingSkills?: string[]; // backwards compatibility
  missingSkills?: string[];  // backwards compatibility
  atsFeedback: string[];
  bulletRecommendations: string[];
  customInterviewQuestions: string[];
  antiHallucinationVerified?: boolean;
  honestGapsAdvice?: string[];
  verifiedResumeSkillsFound?: string[];
  unverifiedClaimsPrevented?: string[];
}

export interface FirestoreJobAnalysis extends BaseFirestoreDoc {
  jobId: string;
  resumeId: string;
  jobDescriptionVersion?: string;
  resumeVersion?: string;
  company: string;
  role: string;
  jobTitle?: string;
  overallScore: number;
  overallMatch?: number;
  roleCompatibility?: number;
  atsScore: number;
  summary: string;
  matchSummary?: string;
  scoreBreakdown: MatchScoreBreakdown;
  matchedKeywords: KeywordEvidence[];
  partialKeywords: KeywordEvidence[];
  missingKeywords: KeywordEvidence[];
  evidence?: {
    matched: KeywordEvidence[];
    partial: KeywordEvidence[];
    missing: KeywordEvidence[];
  };
  recommendations?: string[];
  atsFeedback?: string[];
  bulletRecommendations?: string[];
  customInterviewQuestions?: string[];
  honestGapsAdvice?: string[];
  analysisStatus: 'pending' | 'completed' | 'failed';
  status?: 'pending' | 'completed' | 'failed';
  error?: string;
}

export type ResumeType = 'MASTER' | 'ROLE_VARIANT' | 'JOB_SPECIFIC';
export type ResumeStatus = 'draft' | 'active' | 'archived';

export interface ResumeVersion {
  id: string;
  name: string;
  role?: string;
  targetRole: string;
  company?: string;
  targetCompany?: string;
  jobId?: string | null;
  jdId?: string | null;
  resumeVersionId?: string;
  baseResumeId?: string;
  baseResumeName?: string;
  version: string;
  type: ResumeType;
  variantType?: 'Master' | 'Data Analyst' | 'Business Intelligence' | 'Business Analyst' | 'Custom Role' | string;
  status: ResumeStatus | string;
  latexSource?: string;
  pdfFile?: string;
  pdfUrl?: string;
  sourceText?: string;
  content?: string;
  summary: string;
  skills: string[];
  experienceHighlights: string[];
  verifiedEvidence?: any;
  notes?: string;
  lastModified: string;
  isMaster: boolean;
  format: 'PDF' | 'DOCX' | 'Markdown';
  downloadCount: number;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CoverLetterTemplate =
  | 'Standard Professional'
  | 'Technical & Architectural'
  | 'Energetic Startup'
  | 'Executive Lead';

export interface CoverLetter {
  id: string;
  jobId?: string | null;
  jdId?: string | null;
  resumeVersionId?: string | null;
  company: string;
  role: string;
  jobTitle?: string;
  title: string;
  content: string;
  template?: CoverLetterTemplate;
  tone?: 'Professional & Direct' | 'Energetic & Impactful' | 'Technical & Architectural' | 'Executive';
  version: string;
  status: 'Draft' | 'Final' | 'Sent' | string;
  createdAt: string;
  updatedAt?: string;
  lastEdited?: string;
  ownerId?: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  linkedin?: string;
  phone?: string;
  relationship: 'Recruiter' | 'Hiring Manager' | 'Referral' | 'Peer' | 'Executive Lead';
  lastContactDate: string;
  nextFollowUpDate?: string;
  notes: string;
  status: 'Active' | 'Warm' | 'Cold' | 'Offer Stage';
  avatarColor?: string;
}

export interface FollowUp {
  id: string;
  applicationId?: string;
  jobTitle: string;
  company: string;
  recipientName: string;
  recipientEmail: string;
  type: 'Post-Application' | 'Post-Interview Thank You' | 'Status Check-in' | 'Offer Negotiation' | 'Networking Referral';
  dueDate: string;
  status: 'overdue' | 'due_today' | 'upcoming' | 'completed';
  templateText: string;
  daysDiff: number; // negative = overdue, 0 = today, positive = days away
  priority: 'Urgent' | 'High' | 'Normal';
}

export interface Interview {
  id: string;
  applicationId: string;
  company: string;
  role: string;
  round: 'HR Screening' | 'Technical Coding' | 'System Design' | 'Behavioral & Leadership' | 'Executive / Founder';
  date: string;
  time: string;
  durationMinutes: number;
  interviewers: string[];
  meetingLink?: string;
  prepNotes: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  mockQuestions: string[];
  debriefNotes?: string;
}

export interface GmailMessage {
  id: string;
  sender: string;
  senderEmail: string;
  company: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  category: 'interview' | 'application' | 'rejection' | 'offer' | 'recruiter';
  isUnread: boolean;
  starred: boolean;
}

export interface DriveFile {
  id: string;
  name: string;
  type: 'resume' | 'cover_letter' | 'portfolio' | 'offer_letter' | 'reference' | 'system_design';
  size: string;
  updatedDate: string;
  driveLink: string;
  isFavorite: boolean;
  folder: string;
}

export interface ActivityLog {
  id: string;
  type: 'apply' | 'interview' | 'offer' | 'rejection' | 'ai_analysis' | 'resume_update' | 'followup' | 'email_received';
  title: string;
  description: string;
  timestamp: string;
  company?: string;
  badge: string;
}

export interface BaseFirestoreDoc {
  id?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreUserProfile extends BaseFirestoreDoc {
  name: string;
  email: string;
  photoURL?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  portfolio?: string;
  targetRoles: string[];
  targetLocations: string[];
  experienceLevel?: string;
}

export type FirestoreJobStatus =
  | 'Saved'
  | 'JD Analyzed'
  | 'Resume Ready'
  | 'Ready to Apply'
  | 'Applied'
  | 'Acknowledged'
  | 'Assessment'
  | 'Interview 1'
  | 'Interview 2'
  | 'HR Round'
  | 'Offer'
  | 'Rejected'
  | 'Ghosted'
  | 'Withdrawn';

export type JobPriority = 'Dream' | 'Target' | 'Safety';

export interface FirestoreJob extends BaseFirestoreDoc {
  company: string;
  role: string;
  location: string;
  workType?: WorkType;
  source: string;
  jobUrl?: string;
  applicationUrl?: string;
  jobId?: string;
  postedDate?: string;
  salary?: string;
  experience?: string;
  status: FirestoreJobStatus;
  fitnessScore: number;
  priority?: JobPriority | 'Urgent' | 'High' | 'Normal';
  notes?: string;
  tags?: string[];
  description?: string;
  isDemo?: boolean;
  matchKeyHighlights?: string[];
  analysisStatus?: 'pending' | 'completed' | 'failed';
  analysisError?: string;
}

export interface FirestoreJobDescription extends BaseFirestoreDoc {
  jobId: string;
  jdId?: string;
  fullText?: string;
  rawText: string;
  sourceUrl?: string;
  version?: string;
  summary: string;
  skills: string[];
  mustHaveSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  qualifications: string[];
  experienceRequirements?: string;
  educationRequirements?: string;
  keywords: string[];
  analysisStatus?: 'pending' | 'completed' | 'failed';
  analysisError?: string;
}

export interface FirestoreApplication extends BaseFirestoreDoc {
  jobId: string;
  company: string;
  role: string;
  appliedDate: string;
  status: string;
  applicationUrl?: string;
  resumeId?: string;
  coverLetterId?: string;
  responseDate?: string;
  interviewStage?: string;
  notes?: string;
}

export type ContactType =
  | 'HR'
  | 'Recruiter'
  | 'Hiring Manager'
  | 'Employee'
  | 'Co-worker'
  | 'Alumni'
  | 'Referral'
  | 'Team Lead'
  | 'Department Head';

export interface FirestoreContact extends BaseFirestoreDoc {
  jobId?: string;
  name: string;
  company: string;
  role: string;
  contactType: ContactType;
  linkedin?: string;
  email?: string;
  relationship?: string;
  notes?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
}

export type FollowUpChannel = 'LinkedIn' | 'Gmail' | 'Phone' | 'Other';
export type FollowUpStatus = 'Draft' | 'Ready' | 'Sent' | 'Replied' | 'No Response' | 'Closed';

export interface FirestoreFollowUp extends BaseFirestoreDoc {
  jobId?: string;
  contactId?: string;
  company: string;
  person: string;
  channel: FollowUpChannel;
  followUpType: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  followUpNumber?: number;
  message: string;
  status: FollowUpStatus;
  response?: string;
  notes?: string;
}

export interface FirestoreInterview extends BaseFirestoreDoc {
  jobId?: string;
  company: string;
  role: string;
  round: string;
  date: string;
  interviewer?: string;
  questions?: string[];
  result?: string;
  nextStep?: string;
  notes?: string;
}

export type ResumeValidationStatus = 'Draft' | 'Generating' | 'Verified' | 'Failed';

export interface FirestoreResume extends BaseFirestoreDoc {
  jobId?: string | null;
  jdId?: string | null;
  resumeVersionId?: string;
  company?: string;
  role?: string;
  targetCompany?: string;
  targetRole?: string;
  name?: string;
  baseResumeId?: string;
  baseResumeName?: string;
  type?: ResumeType;
  variantType?: string;
  version: string;
  isMaster?: boolean;
  notes?: string;
  summary?: string;
  skills?: string[];
  experienceHighlights?: string[];
  format?: 'PDF' | 'DOCX' | 'Markdown' | string;
  downloadCount?: number;
  lastModified?: string;
  latexSource?: string;
  pdfFileId?: string;
  pdfFile?: string;
  pdfUrl?: string;
  sourceText?: string;
  verifiedEvidence?: any;
  pageCount?: number;
  validationStatus?: ResumeValidationStatus;
  status?: ResumeStatus | string;
}

export interface FirestoreCoverLetter extends BaseFirestoreDoc {
  jobId?: string | null;
  jdId?: string | null;
  resumeVersionId?: string | null;
  company: string;
  role: string;
  jobTitle?: string;
  title?: string;
  content: string;
  template?: CoverLetterTemplate | string;
  tone?: string;
  version: string;
  status?: string;
  fileId?: string;
  fileUrl?: string;
}

export type MessageChannel = 'LinkedIn' | 'Gmail';
export type MessageType =
  | 'Connection Request'
  | 'Post Connection'
  | 'HR Outreach'
  | 'Recruiter Outreach'
  | 'Hiring Manager Outreach'
  | 'Employee Networking'
  | 'Referral Request'
  | 'Application Follow-up'
  | 'Interview Thank You'
  | 'Interview Follow-up'
  | 'Reconnect';

export interface FirestoreMessage extends BaseFirestoreDoc {
  jobId?: string;
  contactId?: string;
  channel: MessageChannel;
  messageType: MessageType;
  subject?: string;
  body: string;
  status: string;
  sentAt?: string;
  response?: string;
}

export type ActivityType =
  | 'Job Saved'
  | 'JD Analyzed'
  | 'Resume Generated'
  | 'Application Submitted'
  | 'Contact Added'
  | 'Message Drafted'
  | 'Follow-up Created'
  | 'Interview Added'
  | 'Status Changed';

export interface FirestoreActivity {
  id?: string;
  ownerId: string;
  jobId?: string;
  type: ActivityType;
  description: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  targetSalary: string;
  workPreference: 'Remote Preferred' | 'Hybrid OK' | 'On-site OK';
  github: string;
  linkedin: string;
  portfolio: string;
  yearsExperience: number;
  coreSkills: string[];
  searchStatus: 'Actively Interviewing' | 'Open to Offers' | 'Negotiating Offers' | 'Passively Browsing';
  dailyGoalApps: number;
  photoURL?: string;
}

