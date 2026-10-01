# Référence : le routing multi-IA

## Principe

`engine/route.js "<description de la tâche>"` répond en JSON :
`{ task_type, ai, agent, confidence, installed, scores, reasons, policy_rules_applied }`.

## Les 4 étapes

1. **Détection des outils** — `command -v` sur `claude`, `gemini`, `cursor`, `aider`.
   `claude` est toujours disponible (l'orchestrateur, c'est toi). On ne route
   jamais vers un outil absent : c'est la leçon L001, apprise de la v3.1 dont
   le script n'existait même pas.

2. **Classification** — mots-clés par type de tâche (`backend`, `frontend`, `git`,
   `debug`, `docs`, `perf`, `data`, `planning`, sinon `general`). La table v3.1
   est conservée comme *priors*, pas comme vérité.

3. **Application de la politique** — `evolution/policy.json` contient :
   - `routing.weights[task_type][ai]` : multiplicateurs appris (1.0 = neutre),
   - `routing.rules[]` : règles explicites issues des leçons
     (`{ when: { task_type }, prefer, boost, from_lesson }`).
   Les poids se multiplient aux priors, les règles boostent leur cible.

4. **Sélection de l'agent** — agent par défaut du type de tâche (ex. `debug` →
   `debugger`), sauf si la politique le désactive (repli sur `fullstack-developer`).

## Exemple

```bash
$ node engine/route.js "fix the login bug on the API"
{
  "task_type": "debug",
  "ai": "claude",
  "agent": "debugger",
  "confidence": 0.72,
  "installed": { "claude": true, "gemini": false, "cursor": false, "aider": false },
  "reasons": [],
  "policy_rules_applied": []
}
```

## Corriger le router

Tu n'aimes pas son choix ? Ne te contente pas de le contourner :

```bash
node engine/evolve.js log --type correction \
  --situation '{"task_type":"frontend"}' \
  --decision '{"ai":"gemini","agent":"ui-ux-designer"}' \
  --correction '{"ai":"claude","agent":"ui-ux-designer"}' \
  --note "je préfère claude pour les petits fix CSS"
```

Deux corrections similaires et la prochaine rétrospective transforme ça en
règle de routing permanente. Voir `evolution-loop.md`.
