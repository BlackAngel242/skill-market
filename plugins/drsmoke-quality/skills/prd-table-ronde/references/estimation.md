# Estimation disciplinée des lots

Pas de chiffre unique sorti du chapeau. Chaque lot vertical (phase 8) est estimé
en fourchette, avec un niveau de confiance explicite.

## Méthode : 3 points par lot

Pour chaque lot, estimer en jours-hommes (ou en semaines calendaires si l'équipe
est connue) :

- **O** (optimiste) : tout se passe bien, aucune surprise.
- **M** (médian) : le scénario le plus probable.
- **P** (pessimiste) : les risques connus se matérialisent.

Estimation retenue : `(O + 4M + P) / 6` (PERT). Afficher la fourchette `[O ; P]`,
jamais le seul point médian.

## Confiance

| Niveau | Sens |
|---|---|
| Haute | Déjà fait quelque chose de très proche, risques connus |
| Moyenne | Technologie et périmètre maîtrisés, incertitudes normales |
| Basse | Inconnu technique ou périmètre flou ; la fourchette doit être large |

Une confiance basse n'interdit pas d'avancer : elle impose d'en réduire le coût
(spike technique time-boxé, périmètre coupé) avant d'engager le lot.

## Règles

- Estimer les **lots**, pas les stories une par une (le grain story est trop fin
  pour être fiable et trop coûteux à estimer).
- Inclure dans chaque lot : dev, revue, tests, documentation minimale, déploiement.
  Un lot « dev only » est un mensonge de planification.
- Tracer les dépendances externes (prestataire, validation métier, accès) comme
  des risques calendaires, pas comme des durées.
- Coût de la non-décision : pour chaque arbitrage en attente, noter ce que coûte
  une semaine de retard (opportunité, équipe immobilisée). C'est ce chiffre qui
  justifie le délai de tranche du DACI (voir `gates.md`).

Niveaux : fourchettes + confiance obligatoires dès STANDARD. En LÉGER, une
fourchette simple `[O ; P]` par lot suffit, sans PERT formel.
