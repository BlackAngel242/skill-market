# Arbre de métriques et instrumentation

Une métrique listée sans cible ni moyen de mesure est décorative. Chaque objectif
du PRD descend en métriques mesurables, et chaque métrique critique est instrumentée.

## Arbre minimal

```
North Star (1 seule) : la valeur centrale livrée à l'utilisateur
├── Métriques d'entrée (2-4) : ce qui fait bouger la north star
│     ├── ...
├── Garde-fous (1-3) : ce qu'on refuse de sacrifier (perf, qualité, coût)
```

Exemple : north star « dossiers validés par semaine » ; entrées « taux de complétion
du formulaire », « délai médian de traitement » ; garde-fou « taux d'erreur < 1 % ».

## Règles

- Une seule north star. Deux north stars, c'est zéro priorité.
- Chaque métrique : définition précise, cible chiffrée `[À VALIDER]` si non établie,
  horizon temporel, source de données.
- Distinguer métriques **produit** (usage, valeur) et métriques **projet**
  (délai, budget) : ne pas les mélanger dans le même tableau.
- Pas de métrique vaniteuse (inscriptions sans activation, pages vues sans action).

## Instrumentation dans les critères d'acceptation

Toute US qui porte une métrique ajoute un AC d'instrumentation :

```
AC-042 : l'événement « dossier_validé » est émis avec {dossier_id, durée_s, acteur}
         et visible dans [outil de mesure] sous 5 minutes.
```

Si on ne peut pas mesurer, on ne peut pas prétendre que c'est un objectif.
En RENFORCÉ, exiger en plus : qui consulte le tableau de bord, à quelle fréquence,
et quelle décision il déclenche quand la métrique dévie.
