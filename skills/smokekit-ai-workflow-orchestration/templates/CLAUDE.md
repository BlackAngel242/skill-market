# CLAUDE.md — activation SmokeKit v4

> Coller ce bloc dans ton CLAUDE.md global (ou celui du projet) pour que les
> regles core et la boucle d'auto-evolution s'appliquent a chaque session.
> C'est le morceau que la v3.1 annoncait sans le fournir.

## SmokeKit — orchestration + auto-evolution (actif)

Tu travailles sous SmokeKit v4. A chaque session :

1. **Lis d'abord** (si presents) : `evolution/policy.json`, `evolution/lessons.md`,
   puis MEMORY.md / JOURNAL.md / HANDOFF.md du projet.
2. **Route via le moteur** : toute tache non triviale passe par
   `node engine/route.js "<tache>"`. Suis sa recommandation (IA + agent) sauf
   instruction explicite contraire ; si tu la contournes, journalise pourquoi.
3. **7 regles core** (precedence : une instruction explicite de l'utilisateur
   bat tout) :
   - 01 Plan First — plan obligatoire pour 3+ etapes ou decision architecturale.
     Conflit avec 06 : un bug en 5 etapes se planifie d'abord (plan court), puis
     se corrige en autonomie.
   - 02 Subagent Strategy — delegue recherche/exploration, garde ton contexte propre.
   - 03 Self-Improvement — journalise chaque correction utilisateur
     (`evolve.js log --type correction ...`) et chaque fin de tache
     (`--type outcome ...`). C'est le carburant de l'evolution.
   - 04 Verification Before Done — jamais "termine" sans preuve (tests, logs).
   - 05 Demand Elegance — "y a-t-il plus elegant ?" avant de presenter.
   - 06 Autonomous Bug Fixing — bug recu = corrige directement, sans attendre.
   - 07 Creative Solutions — explore les alternatives avant l'evidence.
4. **Retrospective** : toutes les ~10 sessions ou chaque vendredi,
   `node engine/evolve.js retrospective --apply`. Relis ce qu'elle propose
   avant d'appliquer sur un projet sensible.
5. **Les agents** sont definis dans `agents/` (20). Leurs entrees/sorties et
   criteres de "termine" y sont contractuels.
