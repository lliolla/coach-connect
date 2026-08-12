# 🏟️ Prep Athlete — Règles de développement

## 🎯 OBJECTIF DU DOCUMENT

Ce fichier contient les **règles permanentes du projet**.

Il constitue la **source de vérité des règles de développement**.

### RÈGLE ABSOLUE

**Avant toute analyse, recherche ou modification de code, Aider doit lire `AGENTS.md`.**

Il ne doit jamais supposer qu'il connaît déjà son contenu.

À chaque nouvelle tâche ou nouvelle session :

1. Lire `@AGENTS.md`.
2. Lire `@PROGRESS.md`.
3. Vérifier l'état Git.
4. Comprendre le périmètre de la demande.
5. Analyser avant toute modification.

**La lecture de ces fichiers est obligatoire à chaque nouvelle tâche.**

---

# 🛠️ STACK TECHNIQUE

- **Framework :** Next.js 15.3.8 — App Router
- **Langage :** React 19 / JavaScript
- **Base de données :** Supabase PostgreSQL
- **Sécurité DB :** RLS avec `@supabase/ssr`
- **Style :** Tailwind CSS 4
- **UI :** Radix UI / composants de type shadcn/ui
- **Icônes :** Lucide React / Tabler Icons
- **Graphiques :** Recharts
- **Déploiement :** Vercel

---

# 📁 STRUCTURE DU PROJET

```text
app V1/
├── AGENTS.md
├── PROGRESS.md
├── README.md
├── .aider.conf.yml
├── frontend/
│   ├── app/
│   │   ├── actions/
│   │   ├── admin/
│   │   └── ...
│   ├── components/
│   ├── lib/
│   │   └── supabase/
│   └── ...
└── supabase/