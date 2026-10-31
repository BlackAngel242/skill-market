# Definition of Ready / Definition of Done

## DoR : une story entre en lot si et seulement si

- [ ] Liée à une décision `DEC-xxx` (traçabilité, voir `traceability.md`).
- [ ] Critères d'acceptation observables écrits (pas de « doit bien marcher »).
- [ ] Dépendances identifiées (autres stories, accès, validations externes).
- [ ] Données nécessaires disponibles ou simulables.
- [ ] Pas de `[BLOQUANT]` non levé sur son périmètre.
- [ ] En STANDARD/RENFORCÉ : maquette ou description d'interface suffisante pour
      coder sans deviner ; AC d'instrumentation si la story porte une métrique.

Une story qui ne passe pas la DoR retourne en cadrage, elle ne « commence presque ».

## DoD : un lot est terminé si et seulement si

- [ ] Tous les AC des stories du lot sont vérifiés (pas « à peu près »).
- [ ] Revue de code faite (ou relecture croisée si solo).
- [ ] Tests pertinents au niveau : au minimum les chemins critiques et les AC.
- [ ] Déployé là où l'utilisateur peut le voir (staging ou production selon le lot).
- [ ] Documentation minimale à jour (README, HANDOFF.md, DECISIONS.md si arbitrage).
- [ ] Métriques du lot visibles (événements émis, tableau de bord à jour).
- [ ] En RENFORCÉ : revue sécurité du lot (voir `security-lens.md`), plan de rollback
      connu, sauvegardes vérifiées.

Un lot non « Done » n'est pas « presque fini » : il est ouvert, avec la liste de
ce qui manque et un responsable.
