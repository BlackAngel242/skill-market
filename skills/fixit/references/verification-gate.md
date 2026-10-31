# Gate de vérification — commun à toute revue Fixit

**Obligatoire pour toutes les missions Fixit.** Le rapport se fonde sur des preuves datées et une version exacte, non sur le nombre de perspectives ni la quantité d'outils cités.

## Niveaux de défaut

| Gravité | Critère |
|---|---|
| **BLOQUANT** | Objectif principal impossible, comportement ou contenu critique faux, fuite/risque critique démontré, ou défaut de lecture empêchant l'usage. |
| **IMPORTANT** | Dégradation sensible de fiabilité, compréhension, sécurité, accessibilité ou maintenabilité dans le périmètre demandé. |
| **OPTIONNEL** | Finition ou amélioration non nécessaire à la livraison, explicitement distinguée d'une erreur. |

Un problème sans preuve suffisante reste une **hypothèse à vérifier**, pas un défaut avéré. Un test manquant reste **non vérifié**, pas automatiquement « échoué ».

## Gate en six conditions

1. La **version exacte** et les supports examinés sont connus.
2. Chaque exigence **critique** du périmètre possède une preuve correspondante ou une réserve explicite.
3. Les défauts BLOQUANTS et IMPORTANTS sont résolus, ou signalés comme restant.
4. Toute correction autorisée est **réinspectée** sur le même support/scénario ; les régressions pertinentes sont contrôlées.
5. La portée des contrôles est honnête : résultat visuel, comportement réellement exercé, test exécuté ou lecture statique ne se remplacent pas mutuellement.
6. La communication finale distingue clairement **vérifié / non vérifié / hors périmètre** ; aucune validation de ce qui n'a pas été observé.

## Verdicts

- **REJETÉ** : échec majeur observé de l'objectif ou nécessité d'une reprise structurelle.
- **À CORRIGER** : au moins un défaut BLOQUANT ou IMPORTANT reste ; ou preuve indispensable manquante. Ne pas masquer un manque de test obligatoire sous « réserve mineure ».
- **VALIDÉ SOUS RÉSERVE** : aucun défaut majeur dans le périmètre réellement vérifié ; réserves **mineures** seulement ou limites clairement non critiques.
- **VALIDÉ** : toutes les exigences critiques du périmètre ont été contrôlées, sans défaut majeur restant ; les corrections ont été réinspectées. La validation s'arrête **aux versions et environnements observés**.

Si aucun artefact n'a été inspecté, écrire « vérification non effectuée », expliquer ce qui manque et **ne pas délivrer un verdict de validation**. Si le module VISUEL était requis sans rendu accessible, écrire **« vérification visuelle non effectuée »**.

## Modèle de restitution (à compacter selon le cas)

- **Livrable :** version / commit / date / écran ou fichier ; objectif.
- **Modules et outils :** ce qui a été réellement chargé et exécuté ; capacité inaccessible ou non testée.
- **Preuves :** observations, dimensions PC/mobile, commandes et sorties pertinentes ; préciser les limites.
- **Constats prioritaires :** gravité → lieu/scénario → preuve → impact → action ciblée.
- **Modifications :** appliquées avec autorisation, ou seulement recommandées.
- **Réinspection :** mêmes versions/scénarios après correction, tests de non-régression, résultats et ce qui reste non vérifié.
- **Verdict :** un des quatre ci-dessus, assorti du périmètre exact.
- **Leçon :** seulement si une règle vérifiée et transférable est apparue, avec sa portée.

Éviter les scores artificiels et le jargon qui cachent une absence de preuve. Quand un test ne peut pas être réalisé, indiquer comment le reproduire, sans annoncer qu'il a réussi.
