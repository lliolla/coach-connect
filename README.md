# 🏟️ Prep Athlete - Application de Suivi pour Athlètes

> Application moderne de gestion et de préparation physique pour athlètes, construite avec une stack performante et une interface utilisateur soignée.

## 🚀 Fonctionnalités

### 👤 Gestion des Athlètes
- **Profils complets** : Gestion des informations personnelles, sports pratiqués et objectifs.
- **CRUD Intégral** : Création, modification et suppression sécurisée des athlètes via des interfaces dédiées.
- **Organisation** : Attribution aux groupes et suivi des types d'abonnements.

### 📋 Gestion des Modèles (Templates)
- **Bibliothèque de séances** : Création et gestion de modèles de séances réutilisables.
- **Duplication intelligente** : Dupliquer un modèle existant en un clic pour une adaptation rapide.
- **Éditeur dynamique** : Ajout d'exercices, gestion des séries, répétitions et temps de repos au sein d'une interface fluide.

### 📅 Planification & Suivi des Séances
- **Calendrier interactif** : Visualisation globale des séances réelles planifiées par date.
- **Affectation Athlète** : Assignation précise des séances aux athlètes avec suivi de l'intensité (RPE) et des notes.
- **Interface de Suivi** : Liste paginée des séances réalisées avec filtrage par athlète ou titre.

### 🏋️ Bibliothèque d'Exercices
- **Référentiel centralisé** : Base de données d'exercices structurée par catégorie (Force, Cardio, Souplesse, etc.).
- **Unités flexibles** : Support de différentes unités de mesure selon le type d'exercice.

### 📊 Tableau de Bord
- **Statistiques clés** : Vue d'ensemble de l'activité hebdomadaire et des objectifs validés.
- **Graphiques de progression** : Visualisation interactive des performances via Recharts.

## 🛠️ Stack Technique

- **Frontend** : [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/).
- **Backend** : [Fastify 5](https://fastify.dev/) (Node.js, ESM), optimisé pour le déploiement sur Vercel.
- **Base de données** : [Supabase](https://supabase.com/) (PostgreSQL) avec Row Level Security (RLS).
- **Icônes & UI** : [Lucide React](https://lucide.dev/), [Tabler Icons](https://tabler-icons.io/), Radix UI / Shadcn UI.

## 🎨 Standard UI/UX

- **Automatisation** : Modales de succès avec fermeture et redirection automatique après 2 secondes.
- **Sécurité des actions** : Toutes les suppressions requièrent une confirmation via une modale stylisée (pas d'alertes natives).
- **Feedback visuel** : États de chargement (loaders) et notifications (Toasts) intégrés.
- **Design Adaptatif** : Interface entièrement responsive avec sidebar interactive.

## 🗄️ Schéma de la Base de Données

### Table: `sessions` (Enveloppe de séance)
| Colonne | Type | Description |
| --- | --- | --- |
| `id` | uuid | Clé primaire |
| `title` | text | Titre de la séance ou du modèle |
| `date` | date | Date de réalisation prévue |
| `athlete_id` | uuid | FK vers `athletes` |
| `is_template` | boolean | Identifie s'il s'agit d'un modèle réutilisable |
| `duration` | integer | Durée estimée en minutes |

### Table: `session_exercises` (Liaison)
| Colonne | Type | Description |
| --- | --- | --- |
| `id` | uuid | Clé primaire |
| `session_id` | uuid | FK vers `sessions` |
| `exercise_id` | uuid | FK vers `exercices_library` |
| `sets` | integer | Nombre de séries |
| `reps` | integer | Nombre de répétitions |
| `weight` | numeric | Charge utilisée |
| `rest_time` | integer | Temps de repos (secondes) |
| `intensity` | text | Intensité ressentie (RPE) |

## 📦 Installation & Développement

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
