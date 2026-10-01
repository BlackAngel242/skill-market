# Référence : la boucle d'auto-évolution

C'est le cœur de la v4. La v3.1 écrivait "self-evolving agents" sans aucun
mécanisme. Ici l'évolution est un pipeline concret en 4 temps, exécuté par
`engine/evolve.js` et piloté par les instructions du SKILL.md.

## 1. Observer — `evolve.js log`

Tout événement significatif est appendé à `evolution/events.jsonl`
(une ligne JSON, horodatée, jamais réécrite) :

| type | quand le journaliser |
|---|---|
| `routing` | le router a été consulté (situation + décision + raisons) |
| `correction` | **l'utilisateur a corrigé un choix** (le signal le plus précieux) |
| `override` | l'agent a contourné le router de lui-même (avec pourquoi) |
| `outcome` | fin de tâche : succès/échec, durée |
| `lesson_applied` | une leçon a guidé une décision |

Règle d'or : une correction utilisateur se journalise **toujours**, même si
elle contredit la politique. Surtout si elle la contredit.

## 2. Capitaliser — `evolve.js lesson`

`evolution/lessons.md` est la mémoire lisible par l'humain. Format :

```markdown
## L004 — Titre court
- **Date:** 2026-10-03
- **Situation:** task_type=frontend, petit périmètre
- **Règle:** préférer claude à gemini pour les petits fix CSS
- **Preuve:** 3 corrections utilisateur
- **Source:** retrospective automatique
```

Les leçons manuelles priment sur les automatiques en cas de conflit.

## 3. Adapter — `evolve.js retrospective [--apply]`

Toutes les ~10 sessions (ou le vendredi) :

1. Lit les événements depuis la dernière rétrospective.
2. Regroupe les `correction` par (type de tâche, choix corrigé → choix préféré).
3. **Seuil : 2 corrections similaires = 1 leçon candidate.** En dessous du
   seuil, c'est du bruit, on n'apprend pas d'un accident isolé.
4. Sans `--apply` : affiche les candidates, ne touche à rien.
5. Avec `--apply` : écrit la leçon, ajuste `policy.json` :
   - poids du choix préféré × 1.5, poids du choix rejeté × 0.7,
   - ajoute une règle explicite `{ id: R-L###, when, prefer, from_lesson }`,
   - met à jour `meta.last_retrospective` et le compteur.

Chaque changement porte sa provenance (leçon source, nombre d'événements).
Tout est réversible (git).

## 4. Mesurer — `evolve.js stats`

Des KPIs calculés, pas déclarés :

- `correction_rate` : corrections / tâches (tendance = le skill apprend ?),
- `task_success_rate` : succès / tâches terminées,
- `per_ai` : succès par IA routée (quelle IA performe vraiment, par type).

Si le `correction_rate` ne baisse pas après 3 rétrospectives, le problème
n'est pas le réglage : c'est la classification ou les agents. Le rapport de
rétrospective le signale.

## Garde-fous

- **Une instruction explicite de l'utilisateur bat toujours la politique.**
  La politique est un biais, pas un ordre (leçon L002).
- La rétrospective ne s'applique jamais à une consigne directe, seulement
  aux choix que l'agent a faits seul.
- `policy.json` est versionné : toute dérive se voit dans le diff.
