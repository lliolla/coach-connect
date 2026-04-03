# Prep Athlete - Project Analysis

## Overview
This project is a web application for athlete preparation management. It consists of a Next.js frontend and a Fastify backend integrated with Supabase.

## Technical Stack
- **Frontend:** Next.js 15.3.3 (App Router), React 19.
- **Backend:** Fastify 5 (Node.js), ESM, optimized for Vercel deployment.
- **Database:** Supabase (PostgreSQL) with Row Level Security (RLS).
- **Styling:** Tailwind CSS 4, Lucide React (icons), Recharts (data visualization).
- **UI Components:** Radix UI primitives, Shadcn-like components.

## Project Structure
- `frontend/app/`: Main application routes (Dashboard, Tracking, Athletes).
- `backend/`: Fastify API.
    - `src/app.js`: API entrypoint and Vercel handler.
    - `src/plugins/supabase.js`: Supabase client integration.
    - `src/routes/`: API endpoints.

## Database Schema (Supabase)
- **athletes**: Profiles (id, email, first_name, last_name, sports, objectives, avatar_url, abonnement, groupe).
- **abonnements**: List of available subscriptions.
- **groupes**: List of athlete groups.
- **sessions**: Training sessions (date, duration, intensity).
- **exercises**: Details within sessions (sets, reps, weight).
- **tracking**: Daily wellness metrics (sleep, fatigue, stress).

## Workflow Rules (CRITICAL)
- **Git Commits**: After each feature creation or modification, a git commit must be proposed.
- **Validation**: **DO NOT** commit without explicit user validation of the proposed commit message and changes.

## Development
- **Frontend:** `npm run dev` in `frontend` directory.
- **Backend:** `node src/app.js` or `npm run dev` in `backend` directory.
- **Deployment:** Vercel (Frontend & Backend).
