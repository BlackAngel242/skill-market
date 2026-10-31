# Protocole de ré-entrée : faire évoluer le PRD

Un PRD n'est pas gravé dans le marbre. Quand une information structurante change,
on ne recommence pas tout : on rejoue les phases touchées.

## Déclencheurs et phases à rejouer

| Événement | Rejouer |
|---|---|
| Hypothèse invalidée (`HYP-xxx`) | Phases 3-4 : rouvrir tensions et arbitrages liés, puis 5-6 pour les stories impactées |
| `[BLOQUANT]` levé | Phase 4 : finaliser l'arbitrage en attente, puis 5-8 si le périmètre bouge |
| Nouveau risque majeur (réglementaire, sécu, coût) | Phases 2 (ajouter le regard manquant) puis 4 et 7 |
| PIVOT décidé au gate | Phases 3-4 sur la nouvelle direction, puis 5-8 |
| Retour terrain contredisant un arbitrage | Phase 4 : rouvrir la `DEC-xxx` (statut, contrepartie, révision) |
| Changement de décideur / d'Approver | Phase 4 : revalider les arbitrages ouverts (DACI) |

## Règles

- Toute ré-entrée est tracée : entrée datée dans `DECISIONS.md` (ou JOURNAL.md)
  avec l'événement déclencheur et les IDs rouverts.
- On ne rejoue jamais une phase sans dire laquelle ni pourquoi : « on refait tout »
  est interdit.
- Les IDs existants sont conservés ; les décisions modifiées gardent leur ID avec
  un suffixe de version (`DEC-004 v2`) et l'historique de la raison du changement.
- `spec.json` est régénéré après chaque ré-entrée (voir `spec-json.md`).
- Fréquence saine : une ré-entrée par déclencheur réel. Si le PRD est rejoué en
  boucle, le problème est le cadrage (phase 1), pas le protocole.
