# 🏟️ Prep Athlete - Application de Suivi pour Athlètes

> Application moderne de gestion et de préparation physique pour athlètes, construite avec une stack performante et une interface utilisateur soignée.

## 🚀 Fonctionnalités

### 👤 Gestion des Athlètes
- **Profils complets** : Gestion des informations personnelles, sports pratiqués et objectifs.
- **CRUD Intégral** : Création, modification et suppression sécurisée des athlètes via des interfaces dédiées.
- **Organisation** : Attribution aux groupes et suivi des types d''abonnements.

### 📋 Gestion des Modèles (Templates)
- **Bibliothèque de séances** : Création et gestion de modèles de séances réutilisables.
- **Structure Granulaire** : Organisation des séances en 3 blocs (Échauffement, Corps de séance, Retour au calme).
- **Gestion des Tours** : Définition du nombre de rounds/tours global pour le corps de séance.
- **Éditeur dynamique** : Ajout d''exercices, gestion des répétitions et temps de repos.
- **Drag & Drop** : Réorganisation intuitive des exercices, optimisée pour le mobile.

### 🏋️ Bibliothèque d''Exercices
- **Référentiel centralisé** : Base de données d''exercices structurée par catégorie (Force, Cardio, Souplesse, etc.).

### 📊 Tableau de Bord
- **Statistiques clés** : Vue d''ensemble de l''activité hebdomadaire.
- **Graphiques de progression** : Visualisation interactive des performances via Recharts.

## 🛠️ Stack Technique

- **Framework** : [Next.js 15](https://nextjs.org/) (App Router, Server Actions).
- **Langage** : [React 19](https://react.dev/), TypeScript / JavaScript.
- **Styling** : [Tailwind CSS 4](https://tailwindcss.com/).
- **Base de données** : [Supabase](https://supabase.com/) (PostgreSQL) avec @supabase/ssr.
- **Icônes & UI** : [Lucide React](https://lucide.dev/), [Tabler Icons](https://tabler-icons.io/), Radix UI.

## 🎨 Standard UI/UX

- **Architecture** : Architecture sans backend séparé (Full-stack Next.js). Les Server Actions communiquent directement avec Supabase via `@supabase/ssr`.
- **Automatisation** : Modales de succès avec fermeture et redirection automatique après 2 secondes.
- **Sécurité des actions** : Toutes les suppressions requièrent une confirmation via une modale stylisée.
- **Design Adaptatif** : Interface entièrement responsive avec sidebar interactive.

## 🗄️ Schéma de la Base de Données

L''application utilise les tables Supabase suivantes :
- `athletes` : Profils des sportifs.
- `sessions` : Enveloppes de séances (modèles ou réelles).
- `session_exercises` : Détails des exercices au sein d''une séance.
- `exercices_library` : Bibliothèque d''exercices de référence.
- `abonnements`, `groupes`, `objectifs` : Tables de lookups.

## 📦 Installation & Développement

L''application est désormais unifiée dans le dossier `frontend`.

```bash
cd frontend
npm install
npm run dev
```

### Configuration
Créez un fichier `.env.local` dans le dossier `frontend` avec vos clés Supabase :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
```
