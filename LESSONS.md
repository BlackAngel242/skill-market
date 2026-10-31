# LESSONS.md : leçons mémorisées entre sessions IA

## 2026-10-31 : audit de l'installateur et corrections pré-fusion

- **Frontmatter sur Windows.** Les fichiers .md peuvent être lus en CRLF après checkout ; normaliser les fins de ligne **pour la validation uniquement**, sans altérer les octets des ZIP.
- **La portée projet est celle de l'appelant.** Le lanceur Bash ne doit pas modifier le répertoire de travail courant ; référencer le script par son chemin absolu tout en préservant les chemins relatifs de l'utilisateur.
- **Sauvegardes hors scan.** Ne jamais placer des backups de `SKILL.md` sous `.agents/skills/`, `.claude/skills/`, etc. Les archiver dans un dossier frère, puis tester l'absence de doublons découvrables.

## 2026-10-31 : faire évoluer Fixit sans désynchroniser les distributions

- **Risque de dérive entre source et plugin.** Les copies `skills/fixit` et `plugins/drsmoke-quality/skills/fixit` doivent rester identiques ; modifier les deux en une seule opération puis laisser la CI comparer leurs contenus et construire les ZIP. Ne pas fusionner un skill original avec un autre.
- **Une revue visuelle ne couvre pas tous les livrables.** Préserver le protocole visuel v1 dans un module à la demande ; faire choisir au noyau les autres contrôles selon la nature du livrable, sans multiplier les modules inutiles.
- **Des personas ne créent pas des preuves.** Un panel simulé est une contradiction de perspectives, pas plusieurs validations indépendantes. Garder toujours un gate fondé sur la version et les vérifications réelles.
- **Une amélioration distribuée exige une version cohérente.** Mettre à jour `SKILL.md`, `skill.json`, `index.json`, le README, la documentation et les tests ensemble.

> Toute IA lit ce fichier avant de travailler. Plus récent en haut.

## 2026-10-31 : dépôts sélectionnés dans une installation GitHub

- **Un dépôt connu n'apparaissait pas dans la première liste.** Cause : l'installation GitHub était configurée sur une sélection limitée de dépôts, alors que la recherche globale pouvait encore trouver le dépôt public. Règle : comparer la recherche par nom, les dépôts installés et la permission effective de créer une branche avant de conclure à l'absence d'accès.
- **Distribution de compétences ChatGPT.** Ne pas confondre l'installation locale d'un fichier `SKILL.md` avec l'import dans un compte ChatGPT. Préserver les deux skills canoniques et leurs références, contrôler les copies du plugin, et ne jamais prétendre avoir importé ou activé un plugin sans preuve de l'interface.

## 2026-10-29 : actions destructives et branches fusionnées en squash

1. **Commande destructive proposée sans vérifier l'état.** Un `git checkout -- .` aurait effacé des modifications non commitées. Règle : `git status` d'abord ; commiter ou sauvegarder, ne jamais écraser.
2. **Force-push refusé.** Cause : une branche fusionnée en squash n'est plus un ancêtre de la branche principale. Règle : ne jamais forcer ; fusionner la branche principale dans la branche de travail, puis pousser en avance rapide.
3. **Lien `claude.ai/code` dans une PR.** Il fait tourner des workflows d'auto-fusion sur d'autres dépôts. Règle : ne pas le mettre.
4. **« Vérifié » sans preuve.** Règle : écrire « non vérifié » tant que la vérification n'a pas été faite.
