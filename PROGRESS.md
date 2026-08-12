# 📊 Prep Athlete — Suivi du développement

## 🎯 Rôle de ce fichier

`PROGRESS.md` sert de **mémoire entre les sessions de développement**.

Il doit permettre de reprendre le travail sans que l'IA ait besoin de deviner ce qui a été fait.

### Règles

- Mettre ce fichier à jour à la fin d'une session significative.
- Ne pas marquer une tâche comme terminée sans test ou validation.
- Garder uniquement les informations utiles à la reprise.
- Limiter les prochaines étapes à **2 ou 3 actions précises**.

---

# 🚀 État actuel du projet

## Branche de travail

```text
dev
```

La branche `main` doit rester stable.

---

## 🟢 État général

Le projet compile actuellement avec succès.

Dernier build connu :

```bash
npm run build
```

Résultat :

```text
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Collecting build traces
✓ Finalizing page optimization
```

### Version actuelle

```text
Next.js 15.3.8
React 19
Supabase PostgreSQL
```

---

# 📌 MÉTHODE DE TRAVAIL

## Début de session

Utiliser :

```text
Lis @AGENTS.md et @PROGRESS.md.

Nous reprenons le projet.

Ne modifie aucun fichier pour le moment.

1. Résume l'état actuel du projet.
2. Indique la branche Git actuelle.
3. Indique la fonctionnalité actuellement en cours.
4. Indique les fichiers concernés.
5. Donne les 2 ou 3 prochaines étapes prévues.

Attends mes instructions.
```

---

## Pendant une fonctionnalité

### 1. ANALYSE

Comprendre le fonctionnement existant.

### 2. PLAN

Définir la modification minimale.

### 3. MODIFICATION

Modifier uniquement les fichiers nécessaires.

### 4. VÉRIFICATION

```bash
git diff --check
git diff --stat
git diff -- <fichiers>
npm run build
```

### 5. TEST

Tester manuellement la fonctionnalité.

### 6. GIT

Proposer le commit.

**Ne jamais committer sans validation explicite.**

---

# 🗓️ Historique récent

## Session — 10/08/2026

### Statut

`VALIDÉE`

### Ce qui a été vérifié

- [x] Branche de développement utilisée.
- [x] Problème d'import de `CardObjectif` corrigé dans la page de création.
- [x] `app/admin/objectifs/page.jsx` restauré à sa version Git après une modification hors périmètre.
- [x] Fichiers accidentels sans extension identifiés puis supprimés lorsqu'ils étaient clairement des artefacts.
- [x] Le fichier `AGENTS.md` a été renforcé avec une méthode de travail persistante.
- [x] Le build Next.js a réussi.
- [x] `git diff --check` ne signale pas d'erreur de whitespace ; les messages LF/CRLF sont des avertissements de fin de ligne.
- [x] La configuration Aider utilise `AGENTS.md` comme fichier de référence.
- [x] Les commits automatiques Aider sont désactivés.

### Fichiers importants récemment concernés

- `frontend/app/admin/objectifs/new/page.jsx`
- `frontend/app/admin/objectifs/page.jsx`
- `frontend/components/seance/card_seance.jsx`
- `AGENTS.md`
- `PROGRESS.md`

### Point important

`frontend/components/seance/card_seance.jsx` a subi une modification importante.

**Ne pas le refactoriser davantage sans fonctionnalité précise à traiter.**

Toute nouvelle modification de ce composant doit commencer par une analyse ciblée et un diff contrôlé.

---

# 🎯 PROCHAINE FONCTIONNALITÉ

## Statut

`ANALYSE`

### Principe

Nous reprenons maintenant le projet **fonctionnalité par fonctionnalité**.

**Ne pas toucher plusieurs fonctionnalités simultanément.**

---

## Prochaine étape 1

### 🔎 Analyser la fonctionnalité choisie

Avant toute modification :

- identifier la page ;
- identifier le composant principal ;
- identifier les Server Actions ;
- identifier les composants enfants ;
- vérifier le comportement actuel.

**Aucune modification pendant cette phase.**

---

## Prochaine étape 2

### 🧪 Tester le comportement existant

Avant de corriger :

- reproduire le problème ;
- déterminer si le problème est réellement présent ;
- vérifier que les autres parcours fonctionnent.

---

## Prochaine étape 3

### 🛠️ Appliquer la correction minimale

Après validation du plan :

- modifier uniquement les fichiers nécessaires ;
- exécuter `git diff --check` ;
- contrôler `git diff --stat` ;
- lancer `npm run build` ;
- tester la fonctionnalité.

---

# 🧭 Règles pour la prochaine session

## Ne pas faire

- [ ] Ne pas refactoriser `card_seance.jsx` globalement.
- [ ] Ne pas modifier plusieurs fonctionnalités en même temps.
- [ ] Ne pas restaurer un ancien fichier sans vérifier son contenu actuel.
- [ ] Ne pas supprimer un fichier sans vérifier qu'il s'agit bien d'un artefact.
- [ ] Ne pas committer sans validation.

## Faire

- [ ] Lire `AGENTS.md`.
- [ ] Lire `PROGRESS.md`.
- [ ] Vérifier `git status --short`.
- [ ] Vérifier `git branch --show-current`.
- [ ] Choisir une seule fonctionnalité.
- [ ] Analyser avant de modifier.
- [ ] Tester après modification.
- [ ] Mettre à jour `PROGRESS.md`.

---

# 🧠 Décisions techniques importantes

## Supabase

Les opérations DB utilisent les **Server Actions**.

---

## Objectifs

Les objectifs utilisent notamment :

```text
total_sessions
completed
athlete_id
```

Les séances rattachées à un objectif doivent pouvoir afficher leur progression.

---

## Séances

Une nouvelle séance est par défaut :

```text
en attente
```

Après transmission :

```text
transmis
```

---

## Modales

### Succès

- fermeture automatique après 2 secondes ;
- redirection automatique ;
- pas de bouton de fermeture.

### Suppression

- confirmation obligatoire ;
- modale stylisée ;
- jamais de `confirm()` natif.

---

# 🧾 Prompt de fin de session

À utiliser systématiquement :

```text
Nous arrêtons la session ici.

Mets à jour @PROGRESS.md avec :

- ce qui a réellement été fait aujourd'hui ;
- les fichiers modifiés ;
- les tests effectués et leur résultat ;
- les problèmes restant à résoudre ;
- le statut de la fonctionnalité en cours ;
- les 2 ou 3 prochaines étapes précises pour la prochaine session.

Ne marque pas comme terminée une tâche qui n'a pas été testée ou validée.

Ne modifie aucun autre fichier.
```
