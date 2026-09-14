# Architecture & Technical Decisions

## Monorepo Setup
We used a simple NPM workspaces monorepo setup to keep the frontend and backend together while allowing them to maintain their own `package.json` dependencies.

## Frontend
- **React Query + Zustand**: React Query handles all asynchronous state and caching (e.g., fetching clients, projects), while Zustand is used exclusively for global UI/Auth state. This prevents state duplication.
- **Tailwind v3**: Reverted from Tailwind v4 to v3 due to compatibility issues with the `shadcn/ui` CLI during setup.
- **Components**: Basic unstyled native HTML elements were progressively enhanced with Tailwind to emulate a robust design system.
- **PDF Generation**: `@react-pdf/renderer` is used client-side to dynamically generate invoices without requiring a headless browser on the backend.

## Backend
- **Prisma + SQLite**: Chosen for rapid prototyping. The schema can be easily migrated to PostgreSQL (e.g., Supabase DB) for production.
- **Express**: Standard Node framework. Authentication middleware decodes the Supabase JWT securely.

## AI Integration
- **Groq API**: Selected for ultra-fast Llama 3.1 inference. Used for generating proposals and summarizing client health scores on the fly without heavy latency.
