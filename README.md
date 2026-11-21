# CV Insight AI — Production-Grade AI Resume & ATS Analyzer SaaS

A complete, enterprise-ready full-stack AI resume intelligence platform engineered to simulate and reverse-engineer Applicant Tracking Systems (**Workday**, **Greenhouse**, **Lever**). Features dual-score assessment (General ATS Hygiene vs. Job-Specific Alignment), Google XYZ bullet-point rewrites, strategic learning roadmaps, version differential comparison, vector PDF report exports, and rigorous tenant isolation.

---

## 🏗 System Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CV INSIGHT AI ARCHITECTURE                    │
├───────────────────────────────────┬────────────────────────────────────┤
│           FRONTEND LAYER          │           BACKEND LAYER            │
│  • React 18 & Vite (ESM)          │  • Node.js & Express.js REST API   │
│  • Plain CSS (Variables, Navy/    │  • Document Parsing:               │
│    Purple Design System)          │    - PDF: Magic bytes (%PDF-)      │
│  • React Router v6 Route Guards   │    - DOCX: ZIP headers (PK\x03\x04) │
│  • Context API (Auth & App State) │  • PDFKit Vector Report Generation │
│  • Responsive (Desktop/Tab/Mobile)│  • PostgreSQL 16 & Prisma ORM      │
│  • Lucide React Icons             │  • Google Gemini 2.5 Flash +       │
│  • Vercel Deployment Ready        │    Resilient ATS Heuristic Fallback│
│  • Zero Tailwind, Zero Bootstrap  │  • Render Deployment Ready         │
└───────────────────────────────────┴────────────────────────────────────┘
```

- **Frontend**: React 18, Vite, JavaScript, Plain CSS (CSS Variables), React Router v6, Context API, Lucide React.
  - *Zero Tailwind, Zero Bootstrap, Zero TypeScript on frontend.*
- **Backend**: Node.js, Express.js, PostgreSQL 16, Prisma ORM, PDFKit, Multer, Mammoth, PDF-Parse, Bcrypt (12 salt rounds), JWT (HTTP-only cookies), Express Rate Limit.
  - *Zero MongoDB, Zero TypeScript on backend.*
- **AI & ATS Intelligence Engine**: Google Gemini 2.5 Flash via `@google/genai` with prompt injection barriers (`<untrusted_resume_content>`) + SHA-256 cost-control caching + local heuristic scoring engine.
- **Database & Cloud Hosting**: PostgreSQL (compatible with Neon serverless Postgres) + Render (Backend Web Service) + Vercel (Frontend SPA).

---

## 🚀 Key Production Features

### 1. Resume Ingestion & Parsing Hygiene
- **Drag-and-Drop & File Selection**: Supports `.pdf`, `.docx`, `.doc`, and `.txt` files up to **5 MB**.
- **Magic Byte Signature Inspection**: Verifies `%PDF-` and `PK\x03\x04` headers before parsing to prevent extension spoofing.
- **Scanned / Empty Document Guard**: Detects image-only scans or unreadable PDFs (< 50 text characters) and guides users to upload text-based resumes.

### 2. Dual Scoring & 6-Dimensional Rubric
- **General ATS Compatibility Score (0–100)**: Evaluates layout parsability, header hierarchy, contact readability, and font safety across Workday, Greenhouse, and Lever.
- **Job-Specific Match Score (0–100)**: Compares resume competencies against a pasted target Job Description.
- **Transparent Scoring Rubric**: Exact weight distribution (*Keywords 35%, Structure 25%, Quantified Impact 20%, Grammar & Tone 20%*) with a documented $\pm4\%$ confidence margin.

### 3. Bullet-Point Rewrite Studio & Learning Recommendations
- **Google XYZ Bullet Rewrites**: Restructures passive text into *Accomplished [X] as measured by [Y] by doing [Z]*.
  - **Zero Fabrication Policy**: Reconstructs real milestones using active verbs without inventing unearned credentials.
  - One-click **Copy Optimized Bullet** to clipboard.
- **Recommended Learning Topics**: Strategic competencies, priority tiers, estimated study hours (e.g. *12–16 hrs*), and rationale for bridging target qualification gaps.
- **1-Click Keyword Gaps**: Copy missing recruiter keywords directly to the clipboard.

### 4. Differential Version Comparison (`/dashboard/compare`)
- Side-by-side comparative analysis between any two historical scans.
- Calculates score deltas for `Overall Match`, `ATS Hygiene`, `Job Match Score`, and `Keyword Saturation`.
- Lists resolved gaps from Version A to Version B, as well as newly introduced proficiencies.

### 5. Downloadable Executive PDF Reports
- Built with **PDFKit**; exports vector-quality, two-page executive reports (`GET /api/analysis/:id/pdf`).
- Includes branded cover, dual radial metrics, dimensional performance bars, strengths/weaknesses side-by-side, Google XYZ rewrites, learning topics, and ATS disclaimer.

### 6. Privacy & Data Governance Controls (`/dashboard/profile`)
- **Data Retention Window**: Configurable auto-purge periods (30, 90, 180, or 365 days).
- **Raw Text Scrubbing**: Option to discard raw extracted resume text immediately after scoring.
- **GDPR Data Export**: One-click download of all user profile metadata, resumes, and analysis records as JSON (`GET /api/auth/export-data`).
- **Danger Zone**: Clear audit history timeline or permanently purge entire account and all associated documents with cascade deletion.

### 7. Production Security & Cost Controls
- **Bcrypt Hashing**: 12 salt rounds for all user credentials.
- **Session Tokens**: JWT stored in secure `HTTP-only` cookies (`SameSite: 'lax'` in dev, `'none'` + `secure: true` in production).
- **Tenant Isolation**: Strict `where: { userId: req.user.id }` checks on every database query.
- **Rate Limiting**:
  - API Limiter: 200 requests / 15 min.
  - Auth Limiter: 20 login/signup attempts / 15 min.
  - AI Analysis Limiter: 25 document scans / 15 min.
- **SHA-256 AI Cost Caching**: Identical resume text and role queries are served from in-memory cache for 1 hour to prevent redundant Gemini API consumption.

---

## ⚙️ Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `PORT` | Backend listening port | `5001` (avoid macOS 5000 AirPlay collision) |
| `NODE_ENV` | Runtime environment | `development` or `production` |
| `CLIENT_ORIGIN` | Allowed CORS frontend origin | `http://localhost:5173` or `https://cv-insight-ai.vercel.app` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@ep-xyz.aws.neon.tech/cv_insight_db?sslmode=require` |
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

The application includes an automated test suite leveraging Node.js native test runner (`node:test` and `node:assert/strict`):

```bash
# Run backend test suite (22 unit & integration tests)
cd backend && npm test

# Run frontend test suite & production bundle build
cd frontend && npm test && npm run build

# Run all test suites in a single command
(cd backend && npm test) && (cd frontend && npm test && npm run build)
```

### Test Coverage Highlights
- **Authentication**: Password hashing, duplicate email rejection, short password prevention.
- **Document Parser**: `%PDF-` and `PK\x03\x04` magic byte validation, spoofed file rejection, empty/scanned document detection.
- **Gemini Service**: Prompt injection sanitization, 6-dimension schema validation, Google XYZ rewrites, learning topics, SHA-256 caching.
- **Tenant Isolation**: Cross-tenant data isolation, verified that User B cannot read or delete User A's resumes or analysis records.
- **Job Matching**: Version comparison, score delta calculation, keyword coverage categorization.
- **PDF Export**: Stream generation, valid `%PDF-` header check, buffer size validation (> 2KB).
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

## ✅ Verified Features Checklist

- [x] Complete React + Vite + Plain CSS frontend (Dark navy `#070A12`, Purple `#8B5CF6`).
- [x] Node.js + Express backend with PostgreSQL 16 & Prisma ORM.
- [x] Secure authentication with bcrypt (12 rounds) and JWT in HTTP-only cookies.
- [x] PDF and DOCX binary parsing with magic byte signature verification (`%PDF-`, `PK\x03\x04`).
- [x] 5 MB file size limit and scanned/empty document detection.
- [x] Google Gemini 2.5 Flash integration with `<untrusted_resume_content>` prompt injection defenses.
- [x] Built-in resilient 6-dimension heuristic ATS fallback engine.
- [x] Dual scoring system: General ATS Compatibility vs. Job-Specific Match.
- [x] Transparent rubric weighting and $\pm4\%$ uncertainty disclaimer.
- [x] Suggested bullet-point rewrites in Google XYZ format with zero unverified fabrication.
- [x] Recommended learning topics with study hour estimates and priority categorization.
- [x] Version comparison differential view (`/dashboard/compare`) with score deltas and resolved gaps.
- [x] Vector PDF audit report downloads using PDFKit (`/api/analysis/:id/pdf`).
- [x] Audit history with search, score band filters, sorting, and compare selection.
- [x] Account settings, password change, GDPR data archive export, and cascade account deletion.
- [x] Production rate limiting (API, Auth, and AI analysis limits) and SHA-256 cost caching.
- [x] 26 passing automated unit and integration tests across frontend and backend.
- [x] Vercel (`vercel.json`) and Render (`render.yaml`) deployment configurations.

---

## ⚠️ Remaining Limitations & Manual Setup Requirements

1. **Gemini API Key**: If `GEMINI_API_KEY` is not provided in the environment, the application will automatically fall back to its high-precision built-in ATS heuristic engine. To enable live LLM synthesis, generate an API key at [Google AI Studio](https://aistudio.google.com/app/apikey).
2. **PostgreSQL Service**: Requires a running PostgreSQL instance (local or hosted on Neon/Supabase). Running `npx prisma db push` and `npm run prisma:seed` is required on initial setup.
3. **Cross-Site Cookies on Separate Domains**: When deploying frontend on Vercel (`*.vercel.app`) and backend on Render (`*.onrender.com`), browsers require `SameSite: None` and `Secure: true` (configured automatically when `NODE_ENV=production`).
