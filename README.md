# CV Insight AI — Production-Grade AI Career Intelligence & Resume SaaS

A complete, enterprise-ready full-stack AI career intelligence platform engineered to simulate and reverse-engineer Applicant Tracking Systems (**Workday**, **Greenhouse**, **Lever**). Features dual-score assessment (General ATS Hygiene vs. Job-Specific Alignment), Google XYZ bullet-point rewrites, 30-60-90 day learning roadmaps with database persistence, STAR interview preparation and evaluation, longitudinal career analytics, an ATS resume builder with vector PDF export, and rigorous tenant isolation.

---

## 🏗 System Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                      CV INSIGHT AI ARCHITECTURE                        │
├───────────────────────────────────┬────────────────────────────────────┤
│           FRONTEND LAYER          │           BACKEND LAYER            │
│  • React 18 & Vite (ESM)          │  • Node.js & Express.js REST API   │
│  • Plain CSS (Design Tokens, Dark │  • Document Parsing:               │
│    #070A12 & Purple #8B5CF6)      │    - PDF: Magic bytes (%PDF-)      │
│  • React Router v6 Route Guards   │    - DOCX: ZIP headers (PK\x03\x04) │
│  • Context API (Auth & App State) │  • PDFKit Vector Report Generation │
│  • Responsive (Desktop/Tab/Mobile)│  • PostgreSQL 16 & Prisma ORM      │
│  • Lucide React Icons             │  • Google Gemini 2.5 Flash SDK     │
│  • Vector SVG Charts & Progress   │  • Deterministic Resilient ATS &   │
│  • Vercel Deployment Ready        │    Interview Fallback Engine       │
│  • Zero Tailwind, Zero Bootstrap  │  • Render Deployment Ready         │
│  • Zero TypeScript (Pure JS)      │  • Zero MongoDB, Zero TypeScript   │
└───────────────────────────────────┴────────────────────────────────────┘
```

- **Frontend**: React 18, Vite, JavaScript, Plain CSS (CSS Variables), React Router v6, Context API, Lucide React.
  - *Zero Tailwind, Zero Bootstrap, Zero TypeScript on frontend.*
- **Backend**: Node.js, Express.js, PostgreSQL 16, Prisma ORM, PDFKit, Multer, Mammoth, PDF-Parse, Bcrypt (12 salt rounds), JWT (HTTP-only cookies), Express Rate Limit.
  - *Zero MongoDB, Zero TypeScript on backend.*
- **AI & ATS Intelligence Engine**: Google Gemini 2.5 Flash via official `@google/genai` SDK with prompt injection barriers (`<untrusted_resume_content>`) + SHA-256 cost-control caching + deterministic heuristic fallback engine.
- **Database & Cloud Hosting**: PostgreSQL 16 (compatible with Neon serverless Postgres) + Render (Backend Web Service) + Vercel (Frontend SPA).

---

## 🚀 Key Production Features

### 1. Resume Ingestion & Parsing Hygiene
- **Drag-and-Drop & File Selection**: Supports `.pdf`, `.docx`, `.doc`, and `.txt` files up to **5 MB**.
- **Magic Byte Signature Inspection**: Verifies `%PDF-` and `PK\x03\x04` headers before parsing to prevent extension spoofing.
- **Scanned / Empty Document Guard**: Detects image-only scans or unreadable PDFs (< 50 text characters) and guides users to upload text-based resumes.

### 2. Dual Scoring & 6-Dimensional ATS Rubric
- **General ATS Compatibility Score (0–100)**: Evaluates layout parsability, header hierarchy, contact readability, and font safety across Workday, Greenhouse, and Lever.
- **Job-Specific Match Score (0–100)**: Compares resume competencies against a pasted target Job Description.
- **Transparent Scoring Rubric**: Exact weight distribution (*Keywords 35%, Structure 25%, Quantified Impact 20%, Grammar & Tone 20%*) with a documented $\pm4\%$ confidence margin.
- **Non-Hiring Disclaimer**: Clearly states that scores simulate heuristic ATS filtering and do not represent guaranteed human recruiter decisions.

### 3. Bullet-Point Rewrite Studio & Skill Gap Analysis
- **Google XYZ Bullet Rewrites**: Restructures passive text into *Accomplished [X] as measured by [Y] by doing [Z]*.
  - **Zero Fabrication Policy**: Reconstructs real milestones using active verbs without inventing unearned credentials.
  - One-click **Copy Optimized Bullet** to clipboard.
- **3-Tier Skill Gap Categorization**: Separates demonstrated skills, missing resume evidence, and confirmed missing qualifications.

### 4. 30-60-90 Day Personalized Learning Roadmap (`/dashboard/roadmap`)
- **Phased Milestones**: Generates actionable 30-day (foundations), 60-day (applied projects), and 90-day (specialized mastery) roadmaps tailored to the candidate's target role.
- **Database Persistence**: Task completion status and progress toggles persist directly to PostgreSQL (`LearningRoadmap` model) across devices.
- **Real-Time Progress Tracking**: Calculates overall completion percentage and individual phase statistics.

### 5. AI Interview Preparation & STAR Evaluator (`/dashboard/interview`)
- **Multimodal Question Generation**: Technical deep-dives, behavioral scenarios, and resume-specific challenge questions.
- **STAR Framework Evaluation**: Evaluates candidate answers on Situation, Task, Action, and Result dimensions with constructive feedback and suggested answer polish.
- **Historical Practice Tracking**: Persists past practice sessions to PostgreSQL (`InterviewPractice` model) for continuous interview readiness review.

### 6. Career Analytics Dashboard (`/dashboard/analytics`)
- **Zero Fabricated Metrics**: All analytics are computed strictly from real database records (`AnalysisHistory`, `Analysis`, `LearningRoadmap`, `InterviewPractice`).
- **Interactive Visualizations**:
  - Longitudinal ATS improvement trend line (SVG).
  - Target role compatibility comparison matrix.
  - 30-60-90 day learning roadmap progress bars.
  - Interview competency radar breakdown.
- **Filters**: Filter analytics by specific resume, target role, or time window (7d, 30d, 90d, All).

### 7. Generative AI Resume Builder & Optimizer (`/dashboard/builder`)
- **Split-Screen Editor**: Side-by-side editing with live A4 preview.
- **Professional ATS Templates**: Classic Professional, Modern Minimal, and Technical Developer.
- **AI Writing Assistant**: Live bullet point rewriting, action verb enhancement, and missing metric prompts.
- **Vector PDF Export**: Generates pixel-perfect, selectable-text vector PDFs using PDFKit with zero HTML canvas distortion.
- **Version History & Autosave**: Named version snapshots and debounced autosaving to prevent data loss.

### 8. Differential Version Comparison (`/dashboard/compare`)
- Side-by-side comparative analysis between any two historical scans.
- Calculates score deltas for `Overall Match`, `ATS Hygiene`, `Job Match Score`, and `Keyword Saturation`.
- Lists resolved gaps from Version A to Version B, as well as newly introduced proficiencies.

### 9. Privacy, Security & Data Governance Controls (`/dashboard/profile`)
- **Bcrypt Hashing**: 12 salt rounds for all user credentials.
- **Session Tokens**: JWT stored in secure `HTTP-only` cookies (`SameSite: 'lax'` in dev, `'none'` + `secure: true` in production).
- **Strict Tenant Isolation**: `where: { userId: req.user.id }` enforced on every database query.
- **Rate Limiting**:
  - General API: 200 requests / 15 min.
  - Auth Limiter: 20 login/signup attempts / 15 min.
  - AI Analysis Limiter: 25 document scans / 15 min.
- **SHA-256 AI Cost Caching**: Identical resume text and role queries are served from in-memory cache for 1 hour to prevent redundant Gemini API consumption.
- **GDPR Data Export & Cascade Deletion**: Full JSON archive export (`GET /api/auth/export-data`) and complete cascade account purge.

---

## 🔌 API Routes Reference

### Authentication & User
- `POST /api/auth/signup` — Create new user account
- `POST /api/auth/login` — Sign in and issue HTTP-only cookie
- `POST /api/auth/logout` — Invalidate session cookie
- `GET /api/auth/me` — Get authenticated user profile
- `PUT /api/auth/profile` — Update user profile preferences
- `PUT /api/auth/change-password` — Secure password update
- `GET /api/auth/export-data` — GDPR JSON data export
- `DELETE /api/auth/delete-account` — Complete cascade account purge

### Resumes & Analyses
- `POST /api/resumes/upload` — Upload and parse PDF/DOCX resume
- `GET /api/resumes` — List candidate's uploaded resumes
- `GET /api/resumes/:id` — Get single resume details
- `DELETE /api/resumes/:id` — Delete resume and associated analyses
- `POST /api/analysis/:id/rematch` — Re-analyze with new job description
- `GET /api/analysis/:id` — Get complete analysis report
- `GET /api/analysis/:id/pdf` — Download executive vector PDF report
- `GET /api/analysis/history` — List analysis history records
- `DELETE /api/analysis/history/:id` — Delete specific history record

### Career Intelligence
- `GET /api/roadmap` — Fetch user's active learning roadmap
- `POST /api/roadmap` — Generate/regenerate 30-60-90 day learning roadmap
- `PATCH /api/roadmap/:id/tasks/:phase/:taskId` — Toggle task completion in PostgreSQL
- `DELETE /api/roadmap/:id` — Delete roadmap
- `POST /api/interview/questions` — Generate technical/behavioral/resume interview questions
- `POST /api/interview/evaluate` — Evaluate candidate answer using STAR rubric
- `GET /api/interview/history` — Get candidate's interview practice history
- `GET /api/analytics` — Aggregate real career analytics across scans, roadmaps, and interviews

### AI Resume Builder
- `GET /api/builder` — List user's builder resumes
- `POST /api/builder` — Create new resume from scratch or import from upload
- `GET /api/builder/:id` — Get full builder resume
- `PUT /api/builder/:id` — Update resume content
- `DELETE /api/builder/:id` — Delete builder resume
- `POST /api/builder/:id/duplicate` — Clone existing builder resume
- `POST /api/builder/:id/versions` — Create named version snapshot
- `GET /api/builder/:id/versions` — List saved version snapshots
- `POST /api/builder/:id/versions/:vId/restore` — Restore version snapshot
- `POST /api/builder/optimize-bullet` — AI bullet rewrite with Google XYZ format
- `POST /api/builder/tailor-summary` — AI role-tailored summary generation
- `GET /api/builder/:id/pdf` — Export selectable-text vector PDF

### Interactive AI Assistant
- `POST /api/chat` — Context-grounded career assistant conversation

---

## ⚙️ Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `PORT` | Backend listening port | `5001` (avoids macOS 5000 AirPlay collision) |
| `NODE_ENV` | Runtime environment | `development`, `production`, or `test` |
| `CLIENT_ORIGIN` | Allowed CORS frontend origin | `http://localhost:5173` or `https://cv-insight-ai.vercel.app` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/cv_insight_db` |
| `JWT_SECRET` | Secret key for signing JWTs | Strong 64-character random string |
| `COOKIE_SECRET` | Secret key for signed cookie parser | Strong 64-character random string |
| `GEMINI_API_KEY` | Google Gemini API Key | From Google AI Studio (fallback engine active if empty) |

### Frontend (`frontend/.env`)

| Variable | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base API URL prefix | `/api` (local Vite proxy) or `https://backend.onrender.com/api` (prod) |

---

## 🛠 Local Setup & Installation

### Prerequisites
- **Node.js** v18+ (tested on Node.js v24.19)
- **PostgreSQL 14+** (local or hosted on Neon)
- **npm** v9+

### 1. Database Setup
```bash
# Create local PostgreSQL database
createdb cv_insight_db
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your DATABASE_URL and secrets

# Push Prisma schema to PostgreSQL & generate client
npm run prisma:push

# Seed demo user and sample analysis records
npm run prisma:seed

# Start backend development server
npm run dev
# Backend runs at http://localhost:5001
```

*Demo Login Credentials:*
- Email: `alex.morgan@cvinsight.ai`
- Password: `Password123!`

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start Vite dev server
npm run dev
# Frontend runs at http://localhost:5173 (proxies /api -> http://localhost:5001)
```

---

## 🧪 Automated Testing Suite

The application includes an extensive automated test suite leveraging Node.js native test runner (`node:test` and `node:assert/strict`):

```bash
# Run backend test suite (49 unit, integration & security tests across 8 suites)
cd backend && npm test

# Run frontend test suite & production bundle build
cd frontend && npm test && npm run build

# Run all test suites in a single command
(cd backend && npm test) && (cd frontend && npm test && npm run build)
```

### Test Coverage Highlights
- **Authentication**: Password hashing, duplicate email rejection, short password prevention.
- **Tenant Isolation**: Cross-tenant data isolation, verified that User B cannot read, modify, or delete User A's resumes, roadmaps, interview records, or analysis records.
- **Document Parser**: `%PDF-` and `PK\x03\x04` magic byte validation, spoofed file rejection, empty/scanned document detection.
- **Gemini Service**: Prompt injection sanitization, 10-dimension schema validation, Google XYZ rewrites, learning topics, STAR evaluations, SHA-256 caching.
- **AI Career Intelligence**: Roadmap generation and PostgreSQL persistence, interview question generator and STAR evaluator with non-hiring disclaimer, career analytics aggregations from real stored data.
- **Job Matching**: Version comparison, score delta calculation, keyword coverage categorization.
- **Resume Builder**: Autosaving, version snapshots, cloning, vector PDF export.
- **Frontend Architecture**: Route contract checks, API client completeness, forbidden library absence (0 Tailwind, 0 Bootstrap, 0 TypeScript).

---

## ☁️ Production Deployment Guide

### A. Database on Neon (Serverless PostgreSQL)
1. Sign in to [Neon.tech](https://neon.tech) and create a new project (e.g., `cv-insight-db`).
2. Copy the connection string with SSL:
   ```
   postgresql://[user]:[password]@[ep-xyz.aws.neon.tech]/neondb?sslmode=require
   ```
3. In `backend/.env`, set `DATABASE_URL` to this connection string.
4. Run `npx prisma db push` to initialize tables and indexes on Neon.

### B. Backend on Render
1. Create a **Web Service** on [Render.com](https://render.com) connected to your repository.
2. Select root directory: `backend`.
3. Build Command: `npm install && npx prisma generate`
4. Start Command: `npm start`
5. Configure Environment Variables in Render Dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `CLIENT_ORIGIN`: `https://your-frontend-app.vercel.app`
   - `JWT_SECRET`: Generate a secure 64-char key.
   - `COOKIE_SECRET`: Generate a secure 64-char key.
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
6. Health Check Path: `/health`

### C. Frontend on Vercel
1. Create a new project on [Vercel](https://vercel.com) and import the repository.
2. Set Root Directory to: `frontend`.
3. Framework Preset: `Vite`.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables:
   - `VITE_API_URL`: `/api` (when using `vercel.json` rewrite proxy) or `https://your-backend.onrender.com/api`
7. The included `frontend/vercel.json` automatically handles SPA routing and reverse-proxies `/api/(.*)` to the backend while enforcing security headers.

---

## ✅ Verified Production Checklist

- [x] Complete React 18 + Vite + Plain CSS frontend (Dark navy `#070A12`, Purple `#8B5CF6`).
- [x] Node.js + Express backend with PostgreSQL 16 & Prisma ORM.
- [x] Secure authentication with bcrypt (12 rounds) and JWT in HTTP-only cookies.
- [x] Strict tenant isolation across all database operations (`where: { userId: req.user.id }`).
- [x] PDF and DOCX binary parsing with magic byte signature verification (`%PDF-`, `PK\x03\x04`).
- [x] 5 MB file size limit and scanned/empty document detection.
- [x] Google Gemini 2.5 Flash integration with `<untrusted_resume_content>` prompt injection defenses.
- [x] Built-in resilient heuristic ATS and interview fallback engine.
- [x] Dual scoring system: General ATS Compatibility vs. Job-Specific Match.
- [x] Transparent rubric weighting and $\pm4\%$ uncertainty disclaimer.
- [x] Non-hiring decision disclaimer on all evaluations.
- [x] Suggested bullet-point rewrites in Google XYZ format with zero unverified fabrication.
- [x] 30-60-90 Day Personalized Learning Roadmap with PostgreSQL persistence (`/dashboard/roadmap`).
- [x] AI Interview Practice & STAR Evaluator with history tracking (`/dashboard/interview`).
- [x] Real-Data Career Analytics Dashboard (`/dashboard/analytics`) with zero fabricated metrics.
- [x] Generative AI Resume Builder with ATS templates, autosave, and vector PDF export (`/dashboard/builder`).
- [x] Version comparison differential view (`/dashboard/compare`) with score deltas and resolved gaps.
- [x] Vector PDF audit report downloads using PDFKit (`/api/analysis/:id/pdf`).
- [x] Audit history with search, score band filters, sorting, and compare selection.
- [x] Account settings, password change, GDPR data archive export, and cascade account deletion.
- [x] Production rate limiting (API, Auth, and AI analysis limits) and SHA-256 cost caching.
- [x] 60 passing automated tests across 9 suites (49 backend + 11 frontend) with 0 failures.
- [x] Clean production build with Vite (`npm run build` in <1s, 0 errors).
- [x] Vercel (`vercel.json`) and Render (`render.yaml`) deployment configurations.
