# Prep Athlete - Application de Suivi pour Athlètes

Application moderne de gestion et de suivi de préparation physique pour athlètes, construite avec Next.js, Fastify et Supabase.

## 🚀 Fonctionnalités

- **Gestion des Athlètes** : Profils complets, objectifs, abonnements et groupes.
                                -Créer un athlète
                                -Modifier un athelete
                                -supprimer un athelete
- **Bibliothèque d'Exercices** : Base de données centralisée d'exercices avec catégories et unités.
- **Planification de Séances** : Création de séances personnalisées avec une structure normalisée (Many-to-Many).
- **Suivi des Performances** : Monitoring des répétitions, charges, et temps de repos.
- **Tableau de Bord** : Visualisation des données d'entraînement.

## 🛠️ Stack Technique

- **Frontend** : Next.js 15 (App Router), React 19, Tailwind CSS 4, Lucide React, Shadcn UI.
- **Backend** : Fastify 5, Node.js, ESM.
- **Base de données** : Supabase (PostgreSQL) avec RLS.

## 🗄️ Schéma de la Base de Données

### Table: `sessions` (Enveloppe de séance)
| Colonne | Type | Description |
| --- | --- | --- |
| `id` | uuid | Primary Key |
| `title` | text | Titre de la séance |
| `date` | date | Date de réalisation prévue |
| `status` | text | Statut (prévu, terminé, annulé) |
| `athlete_id` | uuid | Référence vers l'athlète |
| `is_template` | boolean | Si vrai, la séance sert de modèle |

### Table: `session_exercises` (Table de liaison)
| Colonne | Type | Description |
| --- | --- | --- |
| `id` | uuid | Primary Key |
| `session_id` | uuid | FK vers `sessions` |
| `exercise_id` | uuid | FK vers `exercices_library` |
| `sets` | integer | Nombre de séries |
| `reps` | integer | Nombre de répétitions |
| `weight` | numeric | Charge utilisée |
| `rest_time_seconds` | integer | Temps de repos en secondes |
| `order_index` | integer | Ordre d'apparition dans la séance |
| `notes` | text | Notes spécifiques |

### Table: `exercices_library` (Modèles d'exercices)
| Colonne | Type | Description |
| --- | --- | --- |
| `id` | uuid | Primary Key |
| `name` | text | Nom de l'exercice |
| `category` | text | Catégorie (Force, Cardio, Souplesse, etc.) |
| `unit` | text | Unité de mesure par défaut |

## 📦 Installation

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
