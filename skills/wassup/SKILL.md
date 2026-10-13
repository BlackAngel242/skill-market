---
name: wassup
description: "État des lieux d'un dépôt : compare docs, plans, issues et code réel, signale les désynchronisations et propose les 3 prochaines actions. Mode portefeuille multi-dépôts, sortie JSON, contrôles pilotage (licence, doublons, secrets, liens morts). Adapté au pilotage de dépôts GitHub."
---

# Wassup : où en est ce dépôt, et quoi faire ensuite ?

Adapté de `wassup` par anistark (ani-skills, MIT), pour le pilotage de dépôts GitHub : bulletins de santé, suivi d'audits, arbitrage des doublons.

Répond à une question : où en est ce projet, et que faut-il faire ensuite ? Lire large, rendre compte brièvement. Le résultat est une note d'état courte, pas une enquête exhaustive.

## Deux modes

**Dépôt unique** (défaut) : procédure complète ci-dessous, note détaillée.

**Portefeuille** : on passe une liste de dépôts (chemins locaux ou `owner/repo`), on applique la procédure en version condensée à chacun, et on rend un tableau comparatif de santé. C'est le mode des bulletins de santé.

## Étape 1 — Rassembler l'état actuel

Lancer en parallèle. Ignorer sans broncher ce qui n'existe pas.

**Bases du dépôt**

```bash
git rev-parse --abbrev-ref HEAD
git status --porcelain
git log --oneline -30
git log -1 --format=%cd
git tag --sort=-creatordate | head -5
```

**Docs et plans.** Lire ceux qui existent :

- `README.md`, `CONTRIBUTING.md`, `AGENTS.md` / `CLAUDE.md`, `CHANGELOG.md`
- `docs/` (survoler l'index ou les fichiers de premier niveau, pas chaque page)
- `plan/`, `plans/`, `roadmap.md`, `TODO.md`
- Manifeste de version (`package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`...)

**GitHub, si `gh` est disponible et authentifié :**

```bash
gh repo view --json name,description,defaultBranchRef,url
gh issue list --state open --limit 50 --json number,title,labels,createdAt,updatedAt
gh pr list --state open --limit 30 --json number,title,isDraft,createdAt,updatedAt
gh release list --limit 5
```

Si `gh` échoue (non installé, non authentifié, pas de remote), le noter en une ligne et continuer avec les sources locales.

**Forme du code.** Inventaire rapide de ce qui existe vraiment : arborescence de premier niveau, modules, commandes, endpoints. C'est à cela que les docs seront comparées.

**Contrôles ajoutés pour le pilotage** (absents de l'original) :

- Licence : le dépôt a-t-il un fichier LICENSE ?
- Doublons : existe-t-il un dépôt frère au nom proche ou au contenu similaire ? Si oui, proposer une décision : fusionner (garder le plus actif, archiver l'autre) ou archiver le moins actif, en justifiant par l'activité et le contenu.
- Secrets : un `.env` ou des clés sont-ils committés dans l'historique récent ? Ne jamais afficher de secret, signaler seulement sa présence et le fichier concerné.
- Liens morts : extraire les URLs du README.md et tester chacune (`curl -sI --max-time 10`). Lister celles en échec. Un lien en échec peut être temporaire : le signaler comme « à revérifier », pas comme un fait.
- Dernier audit : s'il existe un rapport `rapport-audit-github-*.md`, comparer l'état actuel aux alertes précédentes.

## Étape 2 — Comparer et signaler

Comparer les trois sources : docs/plans, état GitHub (issues/PRs), code réel. Signaler :

- ce qui est désynchronisé (README qui décrit une fonction supprimée, roadmap qui promet ce qui n'existe pas, issue ouverte déjà résolue dans le code...) ;
- nommer UNE chose précise à corriger en premier.

**Progression vs dernier audit** (si rapport disponible) : tableau alerte précédente → état actuel → RÉSOLU / PERSISTE / AGGRAVÉ.

## Étape 3 — Proposer la suite

Si tout est synchronisé, proposer trois prochaines tâches : moindre effort / plus gros impact ; la plus rentable ; la plus ancienne en attente. S'il ne reste rien, proposer une piste (projets similaires, nouvelle fonctionnalité).

## Verdict par dépôt

Attribuer un verdict simple, avec la règle appliquée :

- **SAIN** : activité récente (< 90 jours), pas d'alerte bloquante, docs à jour.
- **À SURVEILLER** : inactivité > 90 jours, ou issues/PRs ouvertes qui stagnent, ou alertes non bloquantes (licence manquante, liens morts).
- **CRITIQUE** : secret committé, faille connue non corrigée, ou doublon non tranché qui crée de la confusion.

## Format de sortie

**Dépôt unique**, note courte en français :

- État en 3 lignes max (branche, dernier commit, version).
- Désynchronisations trouvées, avec fichiers et lignes.
- La chose à corriger en premier.
- Les 3 prochaines tâches proposées.
- Verdict.

**Portefeuille**, tableau comparatif :

| Dépôt | Dernier commit | Issues/PRs ouvertes | Licence | Doublon ? | Alertes | Chose à corriger | Verdict |
|---|---|---|---|---|---|---|---|

Ne pas transformer la note en audit complet : wassup est un pointage rapide, pas un audit.

## Sortie JSON (pour les crons et les bulletins)

Sur demande (`--json`), émettre du JSON exploitable par les automatisations :

```json
{
  "repo": "owner/name",
  "checked_at": "2026-10-07",
  "branch": "main",
  "last_commit": { "sha": "abc1234", "date": "2026-09-20", "age_days": 17 },
  "issues_open": 3,
  "prs_open": 1,
  "license": true,
  "duplicates": ["owner/autre-repo"],
  "secrets_found": false,
  "broken_links": ["https://exemple.com/mort"],
  "desync": ["README décrit une fonction supprimée dans src/x.ts"],
  "audit_progress": [{ "alerte": "pas de licence", "état": "PERSISTE" }],
  "first_fix": "Ajouter le fichier LICENSE (MIT).",
  "next_tasks": ["...", "...", "..."],
  "verdict": "À SURVEILLER"
}
```

En mode portefeuille, émettre un tableau JSON de ces objets.
