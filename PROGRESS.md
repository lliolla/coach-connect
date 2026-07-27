prompte a lancer en debute decession : Lis @PROGRESS.md. On reprend le projet. Attaquons la première tâche de la liste 'Prochaine session'
promte fin de cession :On s'arrête là pour aujourd'hui. Peux-tu mettre à jour PROGRESS.md avec tout ce qu'on vient d'accomplir, supprimer les tâches terminées de la liste 'À faire', et lister précisément les 2 ou 3 prochaines étapes pour la prochaine fois ?"

# Journal du projet

## Dernière session : 27/07/2026
### Ce qui a été fait
- [x] Ajout de l'authentification Supabase
- [x] Composant Accordion Radix UI pour la FAQ
- [x] Uniformisation des styles des composants Accordion (CollapsibleCard) avec les tables
  - Conteneur : `rounded-xl border shadow-sm bg-card overflow-hidden`
  - En-tête : `px-6 py-4 text-left text-xs capitalize`
  - Contenu : `bg-transparent divide-y divide-border px-6 py-4`
- [x] Suppression du soulignement au survol sur les titres des Accordions
- [x] Ajustement du titre "Objectifs (X/Y)" en gras et légèrement plus grand (`text-xl font-bold`)
- [x] Titre des objectifs dans les cards : texte normal avec première lettre en majuscule
- [x] Badge de progression en gris discret (`bg-gray-200 text-gray-700`) et en gras
- [x] Suppression de la barre de progression et du ratio de progression dans les cards
- [x] Mise à jour du README.md avec les styles UI de référence

### Prochaine session
- [ ] Vérifier l'affichage des objectifs sur mobile
- [ ] Tester les interactions utilisateur avec les Accordions
- [ ] Valider la cohérence visuelle avec les autres composants de l'application

### Notes & Décisions techniques
- Utilisation de Server Actions pour les mutations.
- Les styles des Accordions doivent rester alignés avec ceux des tables pour une expérience utilisateur uniforme.