# FreelanceFlow CRM

FreelanceFlow is an AI-powered CRM designed specifically for independent consultants and freelancers. It provides tools for managing leads, tracking projects, generating AI-powered proposals, and handling invoicing.

## Features

- **Auth**: Secure authentication via Supabase.
- **Client & Lead Management**: Kanban pipeline for tracking client lifecycle stages.
- **Project Tracking**: Linking projects to clients with status updates.
- **Invoicing**: Generate and track invoices. Includes PDF download functionality.
- **AI Proposal Generator**: Uses Groq AI to draft professional proposals based on project scope, budget, and timeline.
- **Client Health AI**: Computes an automated health score for clients based on engagement and outstanding invoices, summarized by Groq AI.
- **Financial Dashboard**: Overview of revenue, outstanding balances, and at-risk clients.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v3, React Query, Zustand, Recharts, React Router
- **Backend**: Node.js, Express, TypeScript, Prisma (SQLite)
- **AI**: Groq API (llama-3.1-8b-instant)
- **Database**: SQLite (via Prisma)

## Getting Started

1. Set up the `.env` file in the root using `.env.example`.
2. Generate the Prisma client: `cd backend && npx prisma generate`
3. Push the Prisma schema: `cd backend && npx prisma db push`
4. Run the development server from the root: `npm run dev`
