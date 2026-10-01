---
name: smokekit-ai-workflow-orchestration
description: "SmokeKit AI v4.0 - Orchestration multi-IA auto-evolutive : 20 agents SDLC, router reel avec detection d'outils, et vraie boucle d'apprentissage (journal d'evenements, lecons, politique de routing qui s'ajuste selon tes corrections). Evolue de la v3.1."
---

# SmokeKit AI — Workflow Orchestration v4.0

Orchestrateur multi-IA qui **apprend de tes choix**. La v3.1 promettait des
agents "self-evolving" sans aucun mécanisme. La v4 apporte le mécanisme :
chaque correction que tu fais devient une donnée, chaque donnée répétée
devient une règle.

## Ce que la v4 change par rapport à la v3.1

- **Router réel** (`engine/route.js`) : le script `multi-ai-router.sh` promis
  n'existait pas. Le nouveau router détecte les IA installées, classifie la
  tâche, applique ta politique apprise, et explique son choix.
- **20 agents définis** (la v3.1 en annonçait 20 et en listait 19) dans
  `agents/`, chacun avec rôle, déclencheurs, entrées, sorties et critère de
  "terminé". Le 20e, `security-auditor`, manquait pour tenir la promesse
  "100 % des failles détectées".
- **Boucle d'auto-évolution réelle** (`engine/evolve.js`) : observer,
  capitaliser, adapter, mesurer. Détail dans `references/evolution-loop.md`.
- **Conflits entre règles résolus** : ordre de précédence explicite ci-dessous.
- **Snippet d'auto-activation fourni** (`templates/CLAUDE.md`) : la v3.1
  l'annonçait sans le livrer.
- **KPIs calculés** (`evolve.js stats`), pas déclarés.

## La boucle d'auto-évolution (comportement obligatoire)

1. **Début de session** — lis `evolution/policy.json` et `evolution/lessons.md`,
   puis MEMORY.md / JOURNAL.md / HANDOFF.md du projet s'ils existent.
2. **Route via le moteur** — toute tâche non triviale passe par
   `node engine/route.js "<tâche>"`. Suis sa recommandation (IA + agent).
   Si tu la contournes, journalise pourquoi (`--type override`).
3. **Journalise les corrections** — l'utilisateur corrige un de tes choix ?
   `node engine/evolve.js log --type correction ...` avec la situation, la
   décision et la correction. C'est le signal le plus précieux du système.
4. **Journalise les fins de tâche** — `--type outcome` avec succès/échec.
5. **Rétrospective** — toutes les ~10 sessions ou chaque vendredi :
   `node engine/evolve.js retrospective --apply`. Relis les candidates avant
   d'appliquer sur un projet sensible.

Garde-fou : **une instruction explicite de l'utilisateur bat toujours la
politique apprise.** La politique est un biais, pas un ordre.

## Les 7 règles core (toujours actives, par ordre de précédence)

En cas de conflit, la règle de plus petit numéro gagne, sauf instruction
explicite de l'utilisateur qui bat tout.

- **01 Plan First** (planner) — plan obligatoire pour 3+ étapes ou décision
  architecturale. Un bug en 5 étapes se planifie d'abord (plan court), puis
  se corrige en autonomie : c'est la résolution du conflit 01 vs 06.
- **02 Subagent Strategy** (researcher) — délègue recherche et exploration aux
  subagents, garde ta fenêtre de contexte propre. Une tâche par subagent.
- **03 Self-Improvement Loop** (journal-writer) — alimenté par `evolve.js`,
  plus `tasks/lessons.md` pour les leçons purement projet.
- **04 Verification Before Done** (tester) — jamais "terminé" sans preuve :
  tests, logs, démonstration. "Un senior validerait-il ça ?"
- **05 Demand Elegance** (code-reviewer) — "y a-t-il plus élégant ?" avant de
  présenter. Un fix hacky se remplace par la solution élégante.
- **06 Autonomous Bug Fixing** (debugger) — bug reçu = corrigé directement.
  Zéro aller-retour inutile.
- **07 Creative Solutions** (brainstormer) — explorer les alternatives avant
  l'évidence, prioriser par impact vs effort.

## Déclenchement automatique par type de tâche

| Situation | Action |
|---|---|
| Tâche 3+ étapes ou décision architecturale | `route.js` puis plan dans `tasks/todo.md` avant d'implémenter |
| Bug report / erreur reçue | root cause via debugger, fix direct, test de non-régression |
| Nouvelle feature | plan détaillé, puis agents design/dev/test |
| Review de code | code-reviewer + security-auditor si auth/données/paiements |
| Fichiers MEMORY/JOURNAL/HANDOFF présents | continuité active, les lire d'abord |

## Les 20 agents

Définitions complètes dans `agents/` (rôle, déclencheurs, entrées, sorties,
critère de terminé, relais).

**Planning & Research :** planner, researcher, brainstormer, scout-external
**Design & Architecture :** ui-ux-designer, database-admin, scout
**Development & Testing :** tester, code-reviewer, debugger, code-simplifier, fullstack-developer
**Deployment & Operations :** deployer, perf-optimizer
**Documentation & Communication :** docs-manager, project-manager, journal-writer, copywriter
**Git & Sécurité :** git-manager, security-auditor

## Continuité projet

`node engine/evolve.js init-project [dir]` scaffold MEMORY.md, JOURNAL.md et
HANDOFF.md depuis `templates/` (ne touche jamais aux fichiers existants).

- **Milestone terminée** → journal-writer met à jour les trois fichiers.
- **Bug résolu** → root cause dans JOURNAL.md.
- **Décision importante** → justification dans JOURNAL.md + leçon si générique.

## Sévérités bugs & SLA

| Sévérité | Définition | SLA |
|---|---|---|
| Critical | Prod down, perte de données, sécurité | < 24h |
| High | Feature cassée, impact utilisateur | < 48h |
| Medium | Feature dégradée, contournement possible | < 7 jours |
| Low | Mineur, cosmétique | < 2 semaines |

## Fichiers

```
engine/route.js          le router (détection outils + politique apprise)
engine/evolve.js         le moteur d'évolution (log, lesson, retrospective, stats, policy, init-project)
evolution/policy.json    politique de routing et des agents (réécrite par les rétrospectives)
evolution/lessons.md     leçons lisibles par l'humain, avec preuves
evolution/events.jsonl   journal brut append-only (carburant de l'évolution)
agents/                  les 20 définitions d'agents
templates/               MEMORY.md, JOURNAL.md, HANDOFF.md, CLAUDE.md
references/              routing.md, evolution-loop.md
```

---

**Version :** 4.0 | **Auteur :** DrSmoke | **Licence :** MIT
**Changelog v4.0 :** évolution de la v3.1 — router réel avec détection d'outils,
20 agents définis (dont security-auditor), boucle d'auto-évolution complète
(events → leçons → politique), snippet CLAUDE.md d'auto-activation, KPIs calculés.
