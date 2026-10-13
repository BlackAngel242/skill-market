---
name: collect
description: "Trouve les problèmes d'un projet depuis plusieurs sources et les classe en tickets vérifiés, sans rien modifier. Dry-run par défaut, déduplication."
---

# Collect : trouver les problèmes, les classer en tickets

Adapté de `super-collect` par EricTechPro (super-board, MIT).

Un seul travail : trouver les problèmes et les classer en tickets. Collect ne construit rien, ne modifie aucun code, ne déplace aucune carte. Par défaut il montre son plan (dry-run) et ne classe qu'après confirmation.

## Sources

Activer celles qui existent pour le projet. Ignorer sans broncher les sources inaccessibles, en le notant en une ligne.

| Source | Ce qu'on y cherche |
|---|---|
| `github` | Issues ouvertes non encore suivies ; les adopter, jamais les dupliquer |
| `prs` | Commentaires de review des PR mergées → causes racines récurrentes (un même reproche qui revient = un ticket `refactor`) |
| `architecture` | Findings de relecture : couplages cachés, dérive d'architecture |
| `audit` | Alertes non résolues du dernier rapport d'audit |

## Règles

1. **Vérification fraîche.** Chaque candidat est revérifié avant classement : le problème existe-t-il encore dans le code actuel ? Un problème déjà corrigé ou déjà suivi ne devient pas un ticket.
2. **Déduplication.** Ne jamais classer deux fois le même problème. Si un ticket existe déjà (board, issue), le signaler au lieu d'en créer un.
3. **Dry-run par défaut.** Montrer d'abord le tableau des candidats (titre, source, preuve, gravité). Classer après confirmation explicite. `--yes` permet de classer sans l'étape de confirmation, sans jamais sauter la vérification ni la déduplication.
4. **Jamais de secrets.** Les sources peuvent contenir des clés ou tokens : ne jamais les afficher, ne citer que le fichier et le type.

## Format de sortie

Tableau des candidats :

| Titre | Source | Preuve | Gravité | Action |
|---|---|---|---|---|

Puis, après confirmation : tickets classés avec leur référence. Terminer par le résumé : n sources lues, n candidats, n tickets classés, n doublons écartés.
