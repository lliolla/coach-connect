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

To create the new tables and update the `athletes` table with many-to-many relationships, run the following SQL in your Supabase SQL Editor:

```sql
-- 1. Create Lookup Tables
CREATE TABLE IF NOT EXISTS abonnements (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  price NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS modes_paiement (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS groupes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS objectifs (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,ON CLIQUE SUR ENREGISTRER ET QUE LA MODAL DE SUCCES EST FERME ON DOIT RETOURNER SUR LA PAGE ATHELETE
  
  description TEXT
);

-- 2. Insert Default Data
INSERT INTO abonnements (label, price) VALUES 
('Essentiel', 29), ('Premium', 49), ('Performance', 89)
ON CONFLICT (label) DO NOTHING;

INSERT INTO modes_paiement (label) VALUES 
('Carte Bancaire'), ('Virement'), ('Prélèvement'), ('Espèces')
ON CONFLICT (label) DO NOTHING;

INSERT INTO groupes (name) VALUES 
('Groupe A'), ('Groupe B'), ('Groupe C')
ON CONFLICT (name) DO NOTHING;

INSERT INTO objectifs (label) VALUES 
('Perte de poids'), ('Prise de masse'), ('Préparation Marathon'), 
('Finir un Ironman'), ('Amélioration de la VMA'), ('Remise en forme'), 
('Récupération après blessure')
ON CONFLICT (label) DO NOTHING;

-- 3. Update Athletes Table
-- Fix the 'abonnement' column error and add foreign keys
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS sports JSONB DEFAULT '[]'::jsonb;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS abonnement TEXT DEFAULT 'Essentiel';
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS abonnement_id INTEGER REFERENCES abonnements(id);
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS mode_paiement_id INTEGER REFERENCES modes_paiement(id);

-- 4. Create Join Tables for Many-to-Many Relationships
CREATE TABLE IF NOT EXISTS athletes_groupes (
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  groupe_id INTEGER REFERENCES groupes(id) ON DELETE CASCADE,
  PRIMARY KEY (athlete_id, groupe_id)
);

CREATE TABLE IF NOT EXISTS athletes_objectifs (
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  objectif_id INTEGER REFERENCES objectifs(id) ON DELETE CASCADE,
  PRIMARY KEY (athlete_id, objectif_id)
);
```
