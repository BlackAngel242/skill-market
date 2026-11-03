# Instructions pour les IA (skill-market)

## Lecture obligatoire pour toute IA (avant tout travail)

Toute IA doit lire, en entier et avec son outil de lecture, avant toute lecture de code, analyse, modification, commit, pull request ou publication :
1. ce fichier (`AGENTS.md`) ;
2. `LESSONS.md` (erreurs déjà commises, avec leur cause et la règle) ;
3. `README.md` (fonctionnement du catalogue et du CLI).

Une IA qui n'a pas lu ces fichiers ne modifie rien. Après chaque mission : consigner chaque erreur ou piège dans `LESSONS.md`.

## Si on te demande d'installer un skill de ce catalogue pour toi-même

Pas besoin de lire le code : `index.json` liste les skills (`name`, `version`, `path`). Chaque skill est un dossier `skills/<nom>/` avec un `SKILL.md` (frontmatter `name`, `description`) et un `skill.json` (`requires` : binaires, paquets npm/pip nécessaires).
1. Demande à l'utilisateur quel(s) skill(s) installer, ou propose d'après sa demande.
2. Vérifie les outils de `requires` sur la machine ; signale ce qui manque sans l'installer à son insu.
3. Copie le dossier entier `skills/<nom>/` dans ton dossier de skills (ex. Claude Code `~/.claude/skills/<nom>/`, Codex, Cursor, Gemini CLI, OpenCode `~/.agents/skills/<nom>/`), ou utilise `market install <nom> --tool <client>` si le CLI est disponible. N'écrase jamais un dossier existant sans accord ; sauvegarde-le d'abord hors du dossier de skills.
4. Si tu es Claude Code, préfère `/plugin marketplace add BlackAngel242/skill-market` puis `/plugin install <nom>@blackangel242-skill-market`.
5. Dis à l'utilisateur ce qui est installé, où, et qu'il faut peut-être redémarrer la session pour que le skill soit découvert.

## Règles Git (leçons du 29 octobre 2026)
- Lancer `git status` avant toute commande qui réécrit ou supprime (`checkout --`, `reset --hard`, `clean`, `stash drop`).
- Ne jamais forcer un push. Une branche fusionnée en squash se réconcilie par une fusion de la branche principale.
- Ne pas mettre le lien `claude.ai/code` dans une PR ou un commit.
