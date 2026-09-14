# FreelanceFlow CRM — Project Handoff Document

> **Project:** FreelanceFlow CRM MVP  
> **Repo path:** `C:\Rishabh\TY\CC\cp\FreeLance-CRM\freelanceflow`  
> **Handoff Date:** 14 September 2026  
> **Current status: BUILD PASSING ✅ — Awaiting environment setup before first run.**

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

## 🔴 Remaining Work (Not Yet Done)

### 1. Environment Setup — MUST DO FIRST
The app will not start without these. Create a .env file in freelanceflow/ based on .env.example:

\`\`\`env
PORT=5000
NODE_ENV=development
VITE_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
VITE_SUPABASE_ANON_KEY="eyJ..."
GROQ_API_KEY="gsk_..."
VITE_API_URL="http://localhost:5000/api"
\`\`\`

- Create a free Supabase project at https://supabase.com to get the URL and anon key.
- Create a free Groq API key at https://console.groq.com.

### 2. Database Push — MUST DO FIRST
Push the Prisma schema to create the SQLite database:
\`\`\`powershell
cd freelanceflow\backend
npx prisma db push
\`\`\`

### 3. Real Test Coverage
The test infrastructure is installed but only has placeholder tests. Actual unit and integration tests need to be written for:
- clients.controller.ts — test CRUD operations with a mock Prisma client
- ai.controller.ts — test fallback behavior when Groq key is missing
- Frontend: test that protected routes redirect unauthenticated users

### 4. Email Notifications (from original spec — not implemented)
The spec mentioned email alerts for overdue invoices. This would require:
- A cron job or scheduled function on the backend
- Integration with an email provider (e.g., Resend or SendGrid)
- A POST /api/notifications/send endpoint

### 5. Production Deployment (optional stretch goal)
- Migrate Prisma from SQLite to Supabase PostgreSQL by swapping the DATABASE_URL in .env
- Run: npx prisma migrate deploy
- Deploy backend to Railway or Render
- Deploy frontend to Vercel (set env vars in dashboard)

---

## How to Run Locally

\`\`\`powershell
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
