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
- **sessions**: Enveloppe de la séance (id, title, date, status, athlete_id, is_template).
- **exercices_library**: Bibliothèque de modèles d'exercices (id, name, description, category, unit, video_url, image_data).
- **session_exercises**: Table de liaison (id, session_id, exercise_id, sets, reps, weight, order_index, rest_time_seconds, notes).
- **tracking**: Daily wellness metrics (sleep, fatigue, stress).

## Target Query Schema (PostgREST)
```javascript
const { data } = await supabase
  .from('sessions')
  .select(`
    *,
    session_exercises (
      id,
      sets,
      reps,
      weight,
      order_index,
      rest_time_seconds,
      notes,
      exercices_library (
        name,
        category,
        unit
      )
    )
  `)
  .eq('id', sessionId);
```

## Workflow Rules (CRITICAL)
- **Langue**: Toutes les communications et la documentation technique doivent être en français.
- **Git Commits**: After each feature creation or modification, a git commit must be proposed.
- **Validation**: **DO NOT** commit without explicit user validation of the proposed commit message and changes.
- **UI/UX Standard**: 
    - All forms (creation, modification) MUST use styled Modals/Dialogs for success or error messages.
    - **DELETION**: All deletion actions MUST use a styled Confirmation Modal. Native browser pop-ups (`alert`, `confirm`) are STRICTLY FORBIDDEN.
    - **Toasts**: Prefer Success Modals over Toasts for critical validation messages.
- **Database Consistency**: When creating a session, insert data into `sessions` first, then into `session_exercises`. Use the `exercices_library` IDs as references.

## Development
- **Frontend:** `npm run dev` in `frontend` directory.
- **Backend:** `node src/app.js` or `npm run dev` in `backend` directory.
- **Deployment:** Vercel (Frontend & Backend).
