# Instructions pour les IA (skill-market)

## Lecture obligatoire pour toute IA (avant tout travail)

Toute IA doit lire, en entier et avec son outil de lecture, avant toute lecture de code, analyse, modification, commit, pull request ou publication :
1. ce fichier (`AGENTS.md`) ;
2. `LESSONS.md` (erreurs déjà commises, avec leur cause et la règle) ;
3. `README.md` (fonctionnement du catalogue et du CLI).

Une IA qui n'a pas lu ces fichiers ne modifie rien. Après chaque mission : consigner chaque erreur ou piège dans `LESSONS.md`.

## Règles Git (leçons du 29 octobre 2026)
- Lancer `git status` avant toute commande qui réécrit ou supprime (`checkout --`, `reset --hard`, `clean`, `stash drop`).
- Ne jamais forcer un push. Une branche fusionnée en squash se réconcilie par une fusion de la branche principale.
- Ne pas mettre le lien `claude.ai/code` dans une PR ou un commit.
