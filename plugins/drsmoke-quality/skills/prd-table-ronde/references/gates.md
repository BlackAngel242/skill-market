# Gate GO / NO-GO et arbitrage DACI

## Gate après les arbitrages (phase 4)

Avant de produire le PRD, la table ronde se prononce explicitement : on construit,
on pivote ou on arrête. Un PRD qui ne sait pas dire non est un distributeur de features.

### Critères de KILL (un seul suffit pour recommander l'arrêt)
- Pas de problème réel : aucun utilisateur ne paierait (en argent, temps ou effort)
  pour que ce problème disparaisse.
- Hypothèse mortelle non invalidable à coût raisonnable (voir `hypotheses.md`).
- Alternative existante strictement meilleure et accessible (voir phase 4, options écartées).
- Coût total (build + exploitation + maintenance 12 mois) supérieur à la valeur
  attendue, sans chemin crédible vers l'équilibre.
- Contrainte réglementaire ou légale bloquante sans contournement licite.

### Issues du gate
- **GO** : le MVP est cadré, les hypothèses critiques ont un plan d'invalidation.
- **PIVOT** : le problème est réel mais la solution doit changer ; rejouer phases 3-4
  sur la nouvelle direction (voir `reentry.md`).
- **NO-GO** : on ne construit pas. Livrer une note d'arrêt d'une page : problème,
  ce qui a été exploré, pourquoi on arrête, à quelles conditions on rouvrirait.

Le NO-GO est un succès du processus, pas un échec. Le tracer comme une décision
`DEC-000` avec statut `[CONFIRMÉ]`.

## DACI light : qui tranche

« Synthétiser sans faux consensus » ne dit pas qui décide. Pour chaque décision
structurante `DEC-xxx`, nommer :

| Rôle | Sens |
|---|---|
| **D**river | Porte la décision, fait avancer, propose l'arbitrage |
| **A**pprover | UNE seule personne. Tranche en cas de désaccord persistant |
| **C**ontributors | Regards consultés (personas de la table ronde concernés) |
| **I**nformed | Personnes informées du résultat, sans droit de veto |

Règles :
- Un seul Approver par décision. Si deux personnes doivent approuver, ce sont deux
  décisions ou le périmètre est mal découpé.
- L'Approver par défaut est le décideur métier identifié en phase 1, sauf délégation
  explicite tracée.
- Délai de tranche : si aucun consensus après le débat, l'Approver tranche sous
  48 h ouvrées (ou le délai convenu en phase 1). L'indécision a un coût, le tracer.
- Enregistrer le DACI dans le Decision Log, colonne « Approver ».

Niveaux : DACI complet pour STANDARD/RENFORCÉ. En LÉGER, seul l'Approver est nommé
(le Driver est l'utilisateur par défaut).
