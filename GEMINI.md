# Prep Athlete - Project Analysis

## Overview
This project is a web application for athlete preparation management. It is a full-stack Next.js application using Server Actions to communicate directly with Supabase.

## Technical Stack
- **Frontend/Backend:** Next.js 15.3.3 (App Router), React 19.
- **Database:** Supabase (PostgreSQL) with Row Level Security (RLS) via `@supabase/ssr`.
- **Styling:** Tailwind CSS 4, Lucide React & Tabler Icons.
- **Data Visualization:** Recharts.
- **UI Components:** Radix UI primitives, Shadcn-like components.

## Project Structure
- `frontend/app/`: Main application routes (Dashboard, Tracking, Athletes, Exercises, Administration).
- `frontend/app/actions/`: Server Actions for database communication (athletes, exercices, lookups, sessions).
- `frontend/components/`: Reusable UI components.
- `frontend/lib/supabase/`: Supabase client configuration (server and client).

## Database Schema (Supabase)
- **athletes**: Profiles (id, first_name, last_name, email, sports, objectives, avatar_url, abonnement_id, mode_paiement_id).
- **abonnements**: List of available subscriptions.
- **groupes**: List of athlete groups.
- **sessions**: Enveloppe de la séance (id, title, date, status, athlete_id, is_template, duration, main_rounds).
- **exercices_library**: Bibliothèque de modèles d'exercices (id, name, description, category, unit, video_url, image_data, intensity).
- **session_exercises**: Table de liaison (id, session_id, exercise_id, sets, reps, weight, order_index, rest_time, notes, intensity, section).

## Workflow Rules (CRITICAL)
- **Langue**: Toutes les communications et la documentation technique doivent être en français.
- **Git Commits**: After each feature creation or modification, a git commit must be proposed but never done alone.
- **Validation**: **DO NOT** commit without explicit user validation of the proposed commit message and changes.
- **UI/UX Standard**: 
    - All forms (creation, modification) MUST use styled Modals/Dialogs for success or error messages.
    - **SUCCESS**: Success Modals MUST close automatically after 2 seconds and trigger the appropriate redirection. They MUST NOT contain a "Close" button to maintain a fluid experience.
    - **SESSION STRUCTURE**: Sessions MUST be divided into 3 distinct blocks: Warmup (optional), Main Body (with a "Rounds/Tours" setting), and Cooldown (optional).
    - **DRAG & DROP**: Exercise reordering MUST be implemented using a fluid Drag & Drop interface, optimized for mobile usage (large touch targets, visual feedback).
    - **DELETION**: All deletion actions MUST use a styled Confirmation Modal. Native browser pop-ups (`alert`, `confirm`) are STRICTLY FORBIDDEN.
    - **Toasts**: Prefer Success Modals over Toasts for critical validation messages.
    - **TABLES**: 
        - In the Session Templates Library (`/sessions`), the "Athlete" and "Transmission" columns must be hidden.
        - In the Session Tracking (`/suivis`), the "Athlete" name must be displayed and the "Transmission" action must be available.
- **Database Consistency**: Use Server Actions for all DB operations. Environment variables MUST use the `NEXT_PUBLIC_` prefix for Supabase keys.

## Development
- **Frontend:** `npm run dev` in `frontend` directory.
- **Deployment:** Vercel.
