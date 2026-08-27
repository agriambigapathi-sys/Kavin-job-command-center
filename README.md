# Kavin Job Command Center

A full-stack, personal career management application designed to organize job search pipelines, analyze job descriptions, maintain master and tailored resumes with clean LaTeX generation, track recruiter contacts, prepare for interviews, and monitor search analytics.

---

## 1. Overview

Kavin Job Command Center provides an end-to-end workspace for active job seekers:
- **Pipeline Kanban & Tracking:** Manage target roles across application stages (Saved, Applied, Screening, Technical, Onsite, Offer, Archived).
- **Job Description & Resume Alignment:** Evaluate role match scores, identify missing keywords, and assess requirement coverage using evidence strictly grounded in candidate resume data.
- **Resume Studio & Master Vault:** Maintain a master resume profile and generate role-specific tailored versions formatted in clean, professional LaTeX code.
- **AI Cover Letter Studio:** Generate concise, role-tailored cover letters based on target job details and verified experience.
- **Recruiter & Contact CRM:** Organize recruiter, hiring manager, and referral contacts with templates for outreach and follow-ups.
- **Interview Preparation:** Track upcoming interview loops, access technical & behavioral prep notes, and manage meeting links.
- **Follow-up Cadence:** Schedule and monitor thank-you notes, application check-ins, and post-interview follow-ups.
- **Search Analytics:** View pipeline velocity, response rates, conversion percentages, and target salary distributions.

---

## 2. Main Workflow

1. **Profile Setup:** Set your target role, compensation band, and core technical skills in the Settings panel.
2. **Resume Import:** Upload your existing resume (PDF, DOCX, or text) to populate your Master Resume profile.
3. **Job Discovery & Ingestion:** Add target job postings with titles, company names, job descriptions, and salary ranges.
4. **Job Description Alignment Audit:** Run the JD Analyzer to compute match scores, ATS keyword matches, and skill gaps without hallucinations.
5. **Resume Tailoring:** Create tailored resume variants highlighting verified relevant achievements for specific positions, ready for LaTeX export.
6. **Application Pipeline:** Move applications through stages as you apply, schedule screens, and advance to technical and onsite interviews.
7. **Follow-ups & Outreach:** Generate polite, customized LinkedIn and email outreach notes to maintain momentum.
8. **Interview Prep:** Use the interview station for company-specific research, behavioral talking points, and technical questions.

---

## 3. Application Structure

```
├── .env.example               # Required environment variable declarations
├── firestore.rules            # Firestore security rules enforcing user data isolation
├── metadata.json              # App metadata and major capabilities
├── package.json               # Node.js project manifest and scripts
├── server.ts                  # Express full-stack backend with Gemini API proxy and document parsers
├── src/
│   ├── App.tsx                # Main application component & layout state
│   ├── main.tsx               # React application entry point
│   ├── index.css              # Global styles & Tailwind imports
│   ├── types.ts               # TypeScript interfaces, types, and stage definitions
│   ├── context/
│   │   └── AuthContext.tsx    # Firebase authentication and user state provider
│   ├── services/
│   │   ├── api.ts             # Client-side API caller for backend endpoints
│   │   ├── firebase.ts        # Firebase client SDK initialization
│   │   └── firestoreService.ts# Real-time Firestore sync & CRUD operations
│   ├── utils/
│   │   ├── latexResumeGenerator.ts # Clean LaTeX template generator for resumes
│   │   └── mockData.ts        # Initial baseline seed data for offline / demo mode
│   └── components/
│       ├── Header.tsx         # Top navigation header and quick actions
│       ├── Sidebar.tsx        # Collapsible navigation drawer
│       ├── DashboardView.tsx  # Executive dashboard with KPIs, action queue & pipeline snapshot
│       ├── JobsView.tsx       # Job pipeline view (Kanban & Table formats)
│       ├── JDAnalyserView.tsx # Job description alignment and gap auditor
│       ├── ResumesView.tsx    # Resume versions gallery & upload interface
│       ├── ResumeWorkspace.tsx# Document editor, bullet tailor & LaTeX preview
│       ├── ApplicationsView.tsx# Application funnel & stage progression
│       ├── CoverLettersView.tsx# Cover letter generator & library
│       ├── ContactsView.tsx   # Recruiter and networking CRM
│       ├── FollowUpsView.tsx  # Cadence-based outreach manager
│       ├── InterviewsView.tsx # Interview loop scheduler and prep station
│       ├── AnalyticsView.tsx  # Performance metrics and conversion charts
│       └── SettingsView.tsx   # User profile preferences and search criteria
```

---

## 4. Data Flow & State Management

1. **Authentication:** The `AuthContext` listens to Firebase Auth state (`onAuthStateChanged`). Users can authenticate anonymously or via credentials.
2. **Real-time Persistence:** When authenticated, `firestoreService` subscribes to real-time Firestore collections (`jobs`, `resumes`, `applications`, `contacts`, `interviews`, `followUps`, `coverLetters`, `activity`, `userProfile`) scoped under `/users/{userId}/...`.
3. **Local Fallback:** When offline or unauthenticated, the application seamlessly operates using structured state initialized from `mockData.ts` to ensure zero disruption.
4. **Backend Proxy:** All AI operations (Gemini API calls, document text extraction from PDF/DOCX) are routed through server-side endpoints on port `3000` to keep API keys secure.

---

## 5. AI Workflow & Multi-Model Resilience

The backend implements resilient LLM processing with automatic fallback and retry logic:

- **Primary Model:** `gemini-3.7-flash` is used for deep analysis, nuanced JD alignment, STAR bullet tailoring, and cover letter generation.
- **Fallback Model:** `gemini-3.1-flash-lite` provides automatic fallback if the primary model encounters temporary capacity or rate limits (HTTP 503/429).
- **Deterministic Heuristic Backup:** If all AI services are unreachable, the backend falls back to deterministic rule-based algorithms for keyword matching and text parsing.
- **Anti-Hallucination Directives:** All prompts enforce strict evidence grounding. The model is explicitly forbidden from inventing skills, past companies, dates, or inflated numbers.

---

## 6. Resume Workflow & LaTeX Architecture

Resumes are represented as structured documents and exported as clean LaTeX:

- **Master Resume:** Serves as the single source of truth for candidate employment history, skills, and education.
- **Role-Tailored Variants:** Highlights verified achievements and reorders bullet points to match the target job description.
- **LaTeX Source Generation:** `latexResumeGenerator.ts` generates industry-standard LaTeX using clean typography packages (`geometry`, `hyperref`, `enumitem`, `titlesec`).
- **LaTeX Preview & Download:** Users can view the formatted LaTeX code, copy it directly, or download `.tex` files for compilation via Overleaf, TeX Live, or standard LaTeX engines.

---

## 7. Local Development

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd kavin-job-command-center

# Install dependencies
npm install
```

### Environment Configuration
Copy the sample environment file and configure your Gemini API key:
```bash
cp .env.example .env
```
Edit `.env`:
```env
GEMINI_API_KEY="your-gemini-api-key"
```

### Starting Development Server
```bash
npm run dev
```
The application will run at `http://localhost:3000`.

### Type Checking & Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```
This compiles the Vite frontend into `dist/` and bundles `server.ts` into `dist/server.cjs` via `esbuild`.

### Running Production Server
```bash
npm start
```

---

## 8. Environment Variables

| Variable | Required | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Yes (for AI features) | API key for Google Gemini models. Kept securely on the server. |
| `APP_URL` | Optional | Application public URL (injected automatically in Cloud Run). |
| `NODE_ENV` | Optional | Environment mode (`development` or `production`). |

---

## 9. API Endpoints

All backend endpoints are prefixed with `/api/`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint returning server status. |
| `POST` | `/api/gemini/analyze-jd` | Analyzes JD alignment against resume; returns match scores and skill gaps. |
| `POST` | `/api/gemini/tailor-resume` | Tailors resume summary, skills, and bullets for a specific role and company. |
| `POST` | `/api/gemini/generate-cover-letter` | Generates a tailored cover letter based on JD and candidate experience. |
| `POST` | `/api/gemini/generate-outreach` | Generates customized LinkedIn and email recruiter messages. |
| `POST` | `/api/gemini/parse-resume` | Extracts structured JSON data from raw resume text. |
| `POST` | `/api/resumes/upload-and-parse` | Parses uploaded resume files (PDF, DOCX, TXT) into structured JSON. |

---

## 10. Firestore Schema & Security Rules

All user data is stored within private subcollections scoped under the authenticated user document:

```
users/{userId}
  ├── profile/info         (Candidate preferences, salary bands, core skills)
  ├── jobs/{jobId}         (Saved and pipeline job listings)
  ├── resumes/{resumeId}   (Master and tailored resume documents)
  ├── coverLetters/{id}    (Saved cover letters)
  ├── applications/{id}    (Active application stages and interview records)
  ├── contacts/{contactId} (Recruiters and networking contacts)
  ├── followUps/{id}       (Pending and completed follow-up items)
  ├── interviews/{id}      (Scheduled interview rounds and prep notes)
  └── activity/{id}        (Audit log of user actions)
```

### Security Rules
- `firestore.rules` enforces that `request.auth.uid == userId` for all read, write, and list operations.
- Unauthenticated access is completely blocked at the rule level.

---

## 11. How to Add or Update Features

1. **Adding a New Data Type:**
   - Define the interface in `src/types.ts`.
   - Add CRUD methods in `src/services/firestoreService.ts`.
   - Update Firestore rules in `firestore.rules` if introducing a new subcollection.

2. **Adding a New AI Capability:**
   - Add the server-side endpoint in `server.ts` using `getGeminiClient()` and `generateWithFallbackAndRetry()`.
   - Add the client-side API helper in `src/services/api.ts`.
   - Call the helper from the relevant React component with proper error and loading state handling.

3. **Updating UI Components:**
   - Place shared components in `src/components/`.
   - Follow clean Tailwind utility classes with accessible contrast ratios.
   - Maintain mobile-first responsive styling (`sm:`, `md:`, `lg:`, `xl:`).

---

## 12. Rules for AI Coding Agents

When working with this codebase, automated agents must strictly follow these rules:

1. **Respect Architectural Boundaries:**
   - Do NOT rebuild the application from scratch or delete existing modules.
   - Keep the full-stack architecture (Express server + Vite React SPA) intact.
   - Ensure the server binds to `0.0.0.0` and port `3000`.

2. **API Key Security:**
   - Never expose `GEMINI_API_KEY` to client-side code.
   - All AI interactions must pass through server-side `/api/*` endpoints.

3. **Data Integrity & Zero Hallucination:**
   - Never fabricate candidate employment history, skills, degrees, or achievements.
   - Keep all resume generation strictly grounded in user-provided resume data.

4. **UI Craftsmanship:**
   - Avoid decorative AI clichés, promotional banners, or hyperbolic badges.
   - Use clean, professional typography and mathematical layout spacing.
   - Keep document previews formatted like real documents rather than dashboard cards.
