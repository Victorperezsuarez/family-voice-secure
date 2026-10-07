# Family Memory Archive

Family Memory Archive is an early-stage family history and memory preservation application built with React, TypeScript, Vite, and Supabase.

## Current status

This repository is an MVP foundation, not a production-ready release.

### Implemented
- React + TypeScript application shell
- Supabase client configuration
- Basic Supabase email/password authentication context
- Basic helpers for recording metadata and family members
- Dashboard, profile, pricing, billing, admin, retention, audit, and compliance UI prototypes
- Responsive UI components

### Planned / not yet fully implemented
- Audio recording and transcription workflow
- Photo management and galleries
- Family tree visualization
- AI-powered search and insights
- Timeline and collections
- Real billing/payment processing
- Production admin analytics and audit logs
- Verified compliance reporting
- Complete role-based authorization
- Database migrations, Row Level Security (RLS), and storage policies in source control

## Security

Never commit Supabase secret/service-role keys or other server-side credentials to this repository.

The browser application should only receive a Supabase public/anon key through environment variables. Before using real family data, configure and verify Supabase Row Level Security and Storage policies so users can only access authorized family data.

If a secret has ever been committed, rotate/revoke it in the provider dashboard. Removing it from the latest README does not invalidate an exposed credential or remove it from Git history.

## Environment variables

Create a local `.env.local` file (do not commit it):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_public_anon_key
```

## Local development

```bash
npm install
npm run dev
```

## Tech stack

- React 18 + TypeScript
- Vite + SWC
- Supabase
- Tailwind CSS + shadcn/ui
- React Router + React Query
<!-- Vercel integration test -->
