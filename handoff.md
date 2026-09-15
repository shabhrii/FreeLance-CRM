# FreelanceFlow CRM — Project Handoff Document

> **Project:** FreelanceFlow CRM MVP  
> **Repo path:** `C:\Rishabh\TY\CC\cp\FreeLance-CRM\freelanceflow`  
> **Handoff Date:** 14 September 2026  
> **Current status: BUILD & TESTS PASSING ✅ — Local SQLite DB Synced & Ready for Run / AWS Migration.**

---

## What This Project Is

An AI-powered CRM built for freelancers and independent consultants. It lets users manage client leads through a Kanban pipeline, track projects and invoices, generate AI-written proposals, and view a financial dashboard with auto-computed client health scores.

---

## Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS v3, React Query, Zustand, Recharts, React Router v6, `@react-pdf/renderer` |
| **Backend** | Node.js, Express, TypeScript |
| **ORM / DB** | Prisma with SQLite (local) or Supabase PostgreSQL (production) |
| **Auth** | Supabase Auth (JWT-based) |
| **AI** | Groq API (`llama-3.1-8b-instant`) |
| **Testing** | Vitest (frontend), Jest + ts-jest (backend) |

---

## Repository Structure

\`\`\`
freelanceflow/
├── frontend/src/
│   ├── pages/
│   │   ├── Dashboard.tsx         # Pipeline Kanban + Financial charts
│   │   ├── Projects.tsx          # Project CRUD
│   │   ├── Invoices.tsx          # Invoice management + PDF download
│   │   └── ProposalGenerator.tsx # AI proposal drafting
│   ├── components/
│   │   ├── Layout.tsx            # Shared nav shell
│   │   ├── ProtectedRoute.tsx    # Auth guard
│   │   └── ClientHealth.tsx      # AI health score badge
│   ├── store/authStore.ts        # Zustand auth state
│   └── lib/
│       ├── api.ts                # Authenticated fetch wrapper
│       └── supabase.ts           # Supabase client
├── backend/src/
│   ├── modules/
│   │   ├── clients/              # Clients CRUD (controller + routes)
│   │   ├── projects/             # Projects CRUD
│   │   ├── invoices/             # Invoices CRUD + status
│   │   ├── ai/                   # Groq proposal + health score
│   │   └── analytics/            # Dashboard metrics endpoint
│   ├── middleware/auth.ts        # Supabase JWT verification
│   └── index.ts                  # Express entry point
├── database/prisma/schema.prisma # Full DB schema
├── docs/
│   ├── README.md
│   └── DECISIONS.md              # Architecture rationale
└── .env.example                  # All required env vars
\`\`\`

---

## ✅ Completed Work (Sprints 0–5)

### Sprint 0 — Scaffolding
- [x] Monorepo via NPM Workspaces (frontend + backend)
- [x] Prisma schema defined: User, Client, Project, Invoice, InvoiceLineItem, ActivityLog
- [x] GitHub Actions CI workflow (.github/workflows/ci.yml)
- [x] .env.example with all required variables

### Sprint 1 — Auth + Core CRM
- [x] Supabase login and registration pages
- [x] JWT auth middleware on all protected backend routes
- [x] Client/Lead pipeline dashboard (Kanban with 5 stages)
- [x] Client CRUD fully wired frontend to backend

### Sprint 2 — Projects + Invoices
- [x] Projects module: create, update status, delete, linked to clients
- [x] Invoices module: create, mark paid/overdue, delete
- [x] In-browser PDF invoice generation (@react-pdf/renderer)

### Sprint 3 — AI Assistant
- [x] Groq SDK integrated in backend
- [x] AI Proposal Generator page (client + scope + budget → full proposal)
- [x] Client health score engine (rule-based 0–100 score + LLM summary)
- [x] Health score displayed on every client card in the pipeline
- [x] Graceful degradation if GROQ_API_KEY is missing

### Sprint 4 — Dashboard + Analytics
- [x] Backend analytics endpoint: revenue by month, outstanding balance
- [x] Financial bar chart (Recharts) on Dashboard
- [x] "Needs Attention" at-risk client list on Dashboard

### Sprint 5 — Testing + Polish
- [x] Vitest installed for frontend; basic test scaffold
- [x] Jest + ts-jest installed for backend; basic test scaffold
- [x] docs/README.md and docs/DECISIONS.md written
- [x] Full monorepo builds with zero TypeScript errors

---

## ✅ Completed Tasks (Including Sprints 0–5 & Handoff Polish)

### 1. Environment & Database Setup — DONE ✅
- Local SQLite database initialized (`dev.db`) and synced via Prisma (`npx prisma db push`).
- Ready for demo and local development with zero external DB dependencies.
- `.env` files created for root, backend, and frontend.
- Prepared for AWS migration (switch `provider = "postgresql"` and set AWS RDS PostgreSQL `DATABASE_URL` when ready).

### 2. Real Test Coverage — DONE ✅
- **Backend Tests (Jest + ts-jest)**:
  - `src/health.test.ts`: base test infrastructure check.
  - `src/modules/clients/clients.test.ts`: full CRUD tests, user ownership verification, stage change activity logs, error handling.
  - `src/modules/ai/ai.test.ts`: Groq API completion, client health score calculation, and graceful degradation/fallback (503) when `GROQ_API_KEY` is not present.
  - `src/modules/notifications/notifications.test.ts`: in-app notifications, mark-as-read, overdue invoice automated checks.
  - **Result: 4 suites passed, 25 tests passed.**
- **Frontend Tests (Vitest + JSDOM + Testing Library)**:
  - `src/App.test.tsx`: base render test.
  - `src/components/ProtectedRoute.test.tsx`: tests for unauthenticated redirect to `/login`, loading spinner state, and authorized `<Outlet />` rendering.
  - **Result: 2 suites passed, 4 tests passed.**

### 3. Notifications & Overdue Alerts — DONE ✅
- Notifications module built (`backend/src/modules/notifications`).
- Endpoints:
  - `GET /api/notifications`: retrieves user's in-app notifications.
  - `PATCH /api/notifications/:id/read`: marks notification as read.
  - `POST /api/notifications/send`: dispatches notification and triggers email alert.
  - `POST /api/notifications/check-overdue`: scans overdue unpaid invoices, changes status to `Overdue`, creates notification alerts, and logs client activity.

---

## ☁️ Future AWS Porting & API Keys Reference

### API Keys Needed:
1. **Groq API Key (`GROQ_API_KEY`)** — *Optional for local tests, required for live AI features*:
   - Used for the AI Proposal Generator (`llama-3.1-8b-instant`) and account health score summaries.
   - Obtain free at: https://console.groq.com.
2. **Supabase Auth (`VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`)**:
   - Currently handles user login, registration, and JWT token issuance.
   - Obtain free at: https://supabase.com.
   *(When porting to AWS, this can either remain as Supabase Auth or be migrated to AWS Cognito).*
3. **Email Provider Key (`RESEND_API_KEY` or `EMAIL_API_KEY`)** — *Optional*:
   - Used for dispatching external email alerts on overdue invoices.
   - Can use Resend, SendGrid, or AWS SES when deployed to AWS.

### Migrating to AWS:
- **Database**: Spin up an **AWS RDS PostgreSQL** (or Aurora Serverless) instance, change `provider = "postgresql"` in `schema.prisma`, and update `DATABASE_URL` in `.env`.
- **Backend**: Containerize using Docker and deploy to **AWS ECS (Fargate)** or **AWS App Runner**.
- **Frontend**: Deploy to **AWS S3 + CloudFront** or **AWS Amplify**.

---

## How to Run Locally

```powershell
# 1. Install all dependencies
cd C:\Rishabh\TY\CC\cp\FreeLance-CRM\freelanceflow
npm install --workspaces

# 2. Create .env with your keys (see section above)

# 3. Push Prisma schema (one time only)
cd backend
npx prisma db push
cd ..

# 4. Start both frontend + backend in parallel
npm run dev
\`\`\`

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

---

## Key Files Reference

| File | Purpose |
|---|---|
| database/prisma/schema.prisma | Full database schema |
| backend/src/index.ts | Backend entry, all routes registered here |
| frontend/src/App.tsx | Frontend routing |
| frontend/src/lib/api.ts | Authenticated API fetch wrapper |
| backend/src/middleware/auth.ts | Supabase JWT verification middleware |
| docs/DECISIONS.md | Why certain technical choices were made |
