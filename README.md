# 🏟️ Prep Athlete - Application de Suivi pour Athlètes

> Application moderne de gestion et de préparation physique pour athlètes, construite avec une stack performante et une interface utilisateur soignée.

## 🚀 Fonctionnalités

### 👤 Gestion des Athlètes
- **Profils complets** : Gestion des informations personnelles, sports pratiqués et objectifs.
- **CRUD Intégral** : Création, modification et suppression sécurisée des athlètes via des interfaces dédiées.
- **Organisation** : Attribution aux groupes et suivi des types d'abonnements.

### 📋 Gestion des Objectifs & Progression
- **Programmation ciblée** : Création d'objectifs avec durée (semaines) et nombre total de séances prévu.
- **Suivi Dynamique** : Calcul automatique de la progression "X / Y" sur les séances liées.
- **Visualisation** : Badges de progression intégrés dans les listes de séances coach et athlète.

### 📋 Gestion des Modèles (Templates)
- **Bibliothèque de séances** : Création et gestion de modèles de séances réutilisables.
- **Structure Granulaire** : Organisation des séances en 3 blocs (Échauffement, Corps de séance, Retour au calme).
- **Gestion des Tours** : Définition du nombre de rounds/tours global pour le corps de séance.
- **Éditeur dynamique** : Ajout d'exercices, gestion des répétitions et temps de repos.
- **Drag & Drop** : Réorganisation intuitive des exercices, optimisée pour le mobile.

### 🏋️ Bibliothèque d'Exercices
- **Référentiel centralisé** : Base de données d'exercices structurée par catégorie (Force, Cardio, Souplesse, etc.).

### 📊 Suivi & Dashboard
- **Statistiques clés** : Vue d'ensemble de l'activité hebdomadaire sur le tableau de bord.
- **Graphiques de progression** : Visualisation interactive des performances via Recharts.
- **Historique des séances** : Suivi détaillé par athlète avec affichage conditionnel des informations.

## 🛠️ Stack Technique

- **Framework** : [Next.js 15](https://nextjs.org/) (App Router, Server Actions).
- **Langage** : [React 19](https://react.dev/), JavaScript.
- **Styling** : [Tailwind CSS 4](https://tailwindcss.com/).
- **Base de données** : [Supabase](https://supabase.com/) (PostgreSQL) avec @supabase/ssr.
- **Icônes & UI** : [Lucide React](https://lucide.dev/), [Tabler Icons](https://tabler-icons.io/), Radix UI.

## 🎨 Standard UI/UX

- **Architecture Unifiée** : Full-stack Next.js. Les Server Actions communiquent directement avec Supabase via `@supabase/ssr`.
- **Automatisation** : Modales de succès avec fermeture et redirection automatique après 2 secondes.
- **Sécurité des actions** : Toutes les suppressions requièrent une confirmation via une modale stylisée. Native browser pop-ups interdits.
- **Affichage Intelligent** : Les tableaux s'adaptent au contexte (ex: masquage des athlètes dans la bibliothèque de modèles).

### 🎨 **Styles UI de Référence**
Pour uniformiser l'affichage des composants (tables, accordions, cartes), utiliser les classes Tailwind suivantes :

#### **Conteneurs**
- **Tables & Cartes** : `rounded-xl border shadow-sm bg-card overflow-hidden`

#### **En-têtes**
- **Cellules (`<th>`)** : `px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider`
- **Titres de section** : `text-xl font-bold text-gray-900`

#### **Cellules de contenu**
- **Cellules (`<td>`)** : `px-6 py-4 whitespace-nowrap text-sm`

#### **Accordions (CollapsibleCard)**
- **En-tête cliquable** : `px-6 py-4 text-left text-xs capitalize`
- **Contenu dépliable** : `bg-transparent divide-y divide-border px-6 py-4`

#### **Badges**
- **Badges neutres** : `text-gray-700 bg-gray-200 px-3 py-1 font-bold`
- **Badges de statut** :
  - Transmis : `bg-green-100 text-green-700`
  - En attente : `bg-orange-100 text-orange-700`
  - Prévu : `bg-blue-100 text-blue-700`

## 🗄️ Schéma de la Base de Données

L'application utilise les tables Supabase suivantes :
- `athletes` : Profils des sportifs.
- `sessions` : Enveloppes de séances (modèles ou réelles).
- `session_exercises` : Détails des exercices au sein d'une séance.
- `exercices_library` : Bibliothèque d'exercices de référence.
- `abonnements`, `groupes`, `objectifs`, `modes_paiement` : Tables de configuration (lookups).

## 📦 Installation & Développement

```bash
cd frontend
npm install
npm run dev
```

### Configuration
Créez un fichier `.env` dans le dossier `frontend` avec vos clés Supabase :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
```
2. Vérifier la clé utilisée par Windows

Dans PowerShell :

echo $env:MISTRAL_API_KEY
Si rien ne s'affiche → la variable n'est pas configurée.
Si une clé apparaît → continuer les tests.
3. Vérifier la configuration de Vibe

Vibe doit utiliser :

api_key_env_var = "MISTRAL_API_KEY"

dans :

C:\Users\<Utilisateur>\.vibe\config.toml

Commande :

type $env:USERPROFILE\.vibe\config.toml
4. Tester la clé directement auprès de Mistral

Utiliser curl.exe (et non curl qui est un alias PowerShell) :

curl.exe https://api.mistral.ai/v1/models -H "Authorization: Bearer $env:MISTRAL_API_KEY"

Résultats :

✅ Clé valide

HTTP/1.1 200 OK

→ Le problème vient de Vibe ou de sa configuration.

❌ Clé invalide

401 Unauthorized

→ La clé API doit être remplacée.

5. Créer une nouvelle clé API Mistral

Dans la console Mistral :

Ouvrir la gestion des clés API.
Révoquer l'ancienne clé si nécessaire.
Générer une nouvelle clé API.
Copier la nouvelle clé.
6. Tester temporairement la nouvelle clé

Dans PowerShell :

$env:MISTRAL_API_KEY="NOUVELLE_CLE"

Tester :

curl.exe https://api.mistral.ai/v1/models -H "Authorization: Bearer $env:MISTRAL_API_KEY"

Si réponse 200 OK → la clé est correcte.

7. Enregistrer la clé définitivement dans Windows
vibe -p "Bonjour"
Pour éviter de refaire la manipulation à chaque ouverture de terminal :
rendre la clef permanante 
[Environment]::SetEnvironmentVariable("MISTRAL_API_KEY","NOUVELLE_CLE","User")
8. Redémarrer PowerShell

Fermer complètement PowerShell puis ouvrir une nouvelle fenêtre.

Vérifier :

echo $env:MISTRAL_API_KEY

La nouvelle clé doit apparaître.
Remove-Item Env:MISTRAL_API_KEY 
9. Reconfigurer Vibe si nécessaire

Si besoin :

vibe --setup

Entrer la nouvelle clé API.

10. Tester Vibe

Commande simple :

vibe -p "Bonjour"

Résultat attendu : une réponse de Mistral.

Points d'attention
Le fichier .env.local du projet n'est pas forcément lu par Vibe.

Vibe utilise principalement la variable Windows :

MISTRAL_API_KEY

Après une modification avec :

[Environment]::SetEnvironmentVariable(...)

il faut ouvrir un nouveau terminal.

Ne jamais partager une clé API complète ; si elle apparaît dans un dépôt, un log ou un échange, la révoquer et en créer une nouvelle.

Cette procédure couvre le cas rencontré : ancienne clé invalide → nouvelle clé valide → mise à jour Windows → validation Vibe.