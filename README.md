# Prep Athlete - Documentation

## 🚀 API Routes

### Athletes
- `GET /api/athletes`: Get all athletes.
- `GET /api/athletes/:id`: Get a specific athlete.
- `POST /api/athletes`: Create a new athlete.
- `PUT /api/athletes/:id`: Update an athlete.
- `DELETE /api/athletes/:id`: Delete an athlete.

### Sessions (To be fully implemented)
- `GET /api/sessions`: List training sessions.

---

## 🗄️ Database Schema (Supabase)

### Table: `athletes`
| Column | Type | Description |
| --- | --- | --- |
| `id` | uuid | Primary Key |
| `first_name` | text | Athlete's first name |
| `last_name` | text | Athlete's last name |
| `email` | text | Unique email |
| `avatar_url` | text | URL to profile picture |
| `sports` | jsonb/text[] | List of practiced sports |
| `objectives` | jsonb/text[] | List of current objectives |
| `abonnement` | text | Subscription type (Essentiel, Premium, Performance) |
| `groupe` | text | Athlete group (Groupe A, B, C) |

### Table: `abonnements` (Proposed)
| Column | Type | Description |
| --- | --- | --- |
| `id` | serial | Primary Key |
| `label` | text | Subscription name |
| `price` | numeric | Monthly price |

### Table: `groupes` (Proposed)
| Column | Type | Description |
| --- | --- | --- |
| `id` | serial | Primary Key |
| `name` | text | Group name |
| `description` | text | Group description |

---

## 🛠️ Database Setup (SQL)

To create the new tables and update the `athletes` table, run the following SQL in your Supabase SQL Editor:

```sql
-- Create abonnements table
CREATE TABLE IF NOT EXISTS abonnements (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  price NUMERIC DEFAULT 0
);

-- Insert default subscriptions
INSERT INTO abonnements (label) VALUES ('Essentiel'), ('Premium'), ('Performance')
ON CONFLICT (label) DO NOTHING;

-- Create groupes table
CREATE TABLE IF NOT EXISTS groupes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

-- Insert default groups
INSERT INTO groupes (name) VALUES ('Groupe A'), ('Groupe B'), ('Groupe C')
ON CONFLICT (name) DO NOTHING;

-- Update athletes table with new columns
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS abonnement TEXT DEFAULT 'Essentiel';
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS groupe TEXT DEFAULT 'Groupe A';
```
