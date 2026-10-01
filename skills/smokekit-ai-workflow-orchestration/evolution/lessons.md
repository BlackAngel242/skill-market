# Leçons apprises

Ce fichier est la mémoire à long terme du skill. Chaque leçon a un identifiant,
une situation d'application et une règle. Les leçons créées par `evolve.js
retrospective --apply` portent la source "retrospective automatique" et la
preuve (nombre de corrections). Une leçon manuelle l'emporte sur une leçon
automatique en cas de conflit.

## L001 — Le router ne route jamais vers un outil absent

- **Date:** 2026-10-01
- **Situation:** general
- **Règle:** avant de router vers gemini/cursor/aider, vérifier que le binaire existe ; sinon replier sur claude (toujours disponible).
- **Source:** audit v4.0 (le script v3.1 n'existait pas)

## L002 — Un choix utilisateur explicite bat toujours la politique

- **Date:** 2026-10-01
- **Situation:** general
- **Règle:** si l'utilisateur nomme une IA ou un agent, l'utiliser sans discuter ; journaliser quand même l'écart avec la recommandation du router pour nourrir la rétrospective.
- **Source:** audit v4.0
