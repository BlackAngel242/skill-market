# Registre d'hypothèses et invalidation

Les hypothèses taguées `[HYPOTHÈSE]` ne doivent pas survivre par inertie. Chacune
reçoit un score de risque et, pour les plus risquées, une expérience d'invalidation
bon marché **avant** le MVP.

## Registre

| ID | Hypothèse | Si fausse, conséquence | Proba d'être fausse | Coût si fausse | Score | Expérience | Statut |
|---|---|---|---|---|---|---|---|
| HYP-001 | ... | ... | F/M/E | F/M/E | ... | ... | À tester / Invalidée / Confirmée |

- **Proba** : Faible / Moyenne / Élevée (d'après données, terrain, analogues).
- **Coût si fausse** : ce que coûte la découverte tardive (rebuild, réputation, argent).
- **Score** : traiter en priorité les `Élevée × Élevé`, puis `Moyenne × Élevé`.

## Expériences d'invalidation (riskiest assumption first)

Pour chaque hypothèse à score élevé, concevoir le test le moins cher qui peut la tuer :
- entretien ciblé avec 5 utilisateurs du segment (pas des proches) ;
- page d'attente avec mesure d'inscriptions réelles ;
- prototype jetable / Wizard of Oz (humain derrière une interface simulée) ;
- analyse d'un analogue : qui a déjà tenté, pourquoi ça a marché ou raté ;
- test de prix : demander un pré-paiement ou une lettre d'intention.

Règle : si l'hypothèse ne peut pas être testée à coût raisonnable **et** qu'elle est
mortelle, c'est un critère de KILL au gate (voir `gates.md`).

## Traçabilité

`HYP-xxx -> DEC-xxx -> US-xxx -> AC-xxx`

Une décision structurante motivée par une hypothèse garde le lien vers `HYP-xxx`.
Quand l'hypothèse est invalidée, les décisions et stories liées sont rouvertes
(voir `reentry.md`), pas silencieusement conservées.
