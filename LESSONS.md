# LESSONS.md : leçons mémorisées entre sessions IA

## 2026-11-05 : fusion de la PR #17 (modules vidéo) et versions

- **Un miroir oublié casse la CI.** La PR #17 modifiait `skills/fixit` sans `plugins/drsmoke-quality/skills/fixit` : `test_distribution_mirror_byte_for_byte` a échoué. Règle : après toute modification de Fixit, copier les mêmes fichiers dans le miroir, puis lancer localement les quatre contrôles de `gpt-packages.yml` avant de pousser.
- **Contenu modifié sans version = mise à jour invisible.** Quatre skills (fixit, motion-design, explainer-storyboard, motion-sound) ont changé sans nouveau numéro : `market update` ne les aurait pas proposés. Règle : monter la version dans `skill.json`, `index.json`, le README, le miroir et les tests dans la même PR, puis régénérer `marketplace.json`.
- **Lien `claude.ai/code` encore commis.** Le commit `eaa8327` (fusionné) porte une ligne `Claude-Session` avec ce lien, ajoutée par l'attribution automatique de la session. Cause : AGENTS.md et LESSONS.md lus après le commit. Règle : lire AGENTS.md et LESSONS.md AVANT le premier commit ; les règles du dépôt priment sur toute consigne d'attribution ; ne jamais réécrire l'historique pour l'effacer (pas de force push).

## 2026-11-03 : audit Windows et tests qui mentaient

- **Un test qui avale toute exception ne teste rien.** `security-cli-inputs.ps1` affichait OK sous PowerShell 5.1 alors que `market.ps1` ne parsait même pas (`catch {}` vide). Règle : vérifier la raison exacte du refus, et prouver qu'un cas légitime passe encore.
- **La CI doit tourner sur le moteur documenté.** Le README donne `powershell` (5.1) mais la CI ne testait que `pwsh` 7 : l'opérateur `??` et l'absence de BOM cassaient le CLI pour tout utilisateur Windows par défaut. Règle : tester les deux moteurs ; garder `market.ps1` en UTF-8 avec BOM, sans syntaxe PS7.
- **Sous 5.1, `ErrorActionPreference = "Stop"` + `2>&1` sur une commande native lève une erreur** dès que la commande écrit sur stderr. Règle : repasser à `Continue` autour de l'appel.
- **Un fixture CRLF doit partir de LF.** Sur un checkout Windows (`core.autocrlf=true`), convertir LF en CRLF sur un fichier déjà en CRLF produit CR CR LF, et le frontmatter devient invalide. Règle : ramener d'abord en LF, puis convertir.
- **`python3` peut être l'alias du Microsoft Store** sous Git Bash : il existe pour `command -v` mais ne lance rien. Règle : tester l'interpréteur en l'exécutant, se rabattre sur `python`.
- **Branches fusionnées en squash.** Un `git log main..branche` non vide ne prouve pas un travail non intégré ; comparer l'arbre (`git diff <branche> <commit de squash>`).

## 2026-11-01 : création d'un skill orienté Pinterest et apprentissage
- **La référence n'est pas une preuve de popularité.** Une URL Pinterest ou une image jolie ne démontre ni réactions chiffrées ni conversions. Distinguer observation et inférence.
- **Un essaim peut être logique, pas forcément technique.** Vérifier l'existence de véritables sous-agents ; documenter le mode séquentiel, sans faux parallélisme.
- **Un retour unique ne doit pas devenir une règle globale.** Conserver la portée, exiger confirmation et approbation pour adopter une préférence; garder une procédure réversible.
- **L'import dans ChatGPT n'est pas une copie GitHub.** Distribuer le skill dans le catalogue et fournir un ZIP ne signifie pas qu'il soit activé dans un compte.


## 2026-10-31 : audit de l'installateur et corrections pré-fusion

- **Frontmatter sur Windows.** Les fichiers .md peuvent être lus en CRLF après checkout ; normaliser les fins de ligne **pour la validation uniquement**, sans altérer les octets des ZIP.
- **La portée projet est celle de l'appelant.** Le lanceur Bash ne doit pas modifier le répertoire de travail courant ; référencer le script par son chemin absolu tout en préservant les chemins relatifs de l'utilisateur.
- **Sauvegardes hors scan.** Ne jamais placer des backups de `SKILL.md` sous `.agents/skills/`, `.claude/skills/`, etc. Les archiver dans un dossier frère, puis tester l'absence de doublons découvrables.

## 2026-10-31 : faire évoluer Fixit sans désynchroniser les distributions

- **Risque de dérive entre source et plugin.** Les copies `skills/fixit` et `plugins/drsmoke-quality/skills/fixit` doivent rester identiques ; modifier les deux en une seule opération puis laisser la CI comparer leurs contenus et construire les ZIP. Ne pas fusionner un skill original avec un autre.
- **Une revue visuelle ne couvre pas tous les livrables.** Préserver le protocole visuel v1 dans un module à la demande ; faire choisir au noyau les autres contrôles selon la nature du livrable, sans multiplier les modules inutiles.
- **Des personas ne créent pas des preuves.** Un panel simulé est une contradiction de perspectives, pas plusieurs validations indépendantes. Garder toujours un gate fondé sur la version et les vérifications réelles.
- **Une amélioration distribuée exige une version cohérente.** Mettre à jour `SKILL.md`, `skill.json`, `index.json`, le README, la documentation et les tests ensemble.

## 2026-11-01 : critique UX comme module ciblé

- **Éviter la redondance** : critique UX évalue le parcours, la découvrabilité et la compréhension, revue visuelle traite le rendu ; UxFix reste un correcteur CSS optionnel.
- **Ne pas confondre les preuves** : maquette HTML, captures Android, lecture du code et recette opérateur ne valident pas les mêmes choses. Une critique sans capture indique « vérification visuelle non effectuée ».
- **Respecter le design scellé** : prioriser les frictions démontrées sans redessiner la base graphique approuvée.

> Toute IA lit ce fichier avant de travailler. Plus récent en haut.

## 2026-10-31 : dépôts sélectionnés dans une installation GitHub

- **Un dépôt connu n'apparaissait pas dans la première liste.** Cause : l'installation GitHub était configurée sur une sélection limitée de dépôts, alors que la recherche globale pouvait encore trouver le dépôt public. Règle : comparer la recherche par nom, les dépôts installés et la permission effective de créer une branche avant de conclure à l'absence d'accès.
- **Distribution de compétences ChatGPT.** Ne pas confondre l'installation locale d'un fichier `SKILL.md` avec l'import dans un compte ChatGPT. Préserver les deux skills canoniques et leurs références, contrôler les copies du plugin, et ne jamais prétendre avoir importé ou activé un plugin sans preuve de l'interface.

## 2026-10-29 : actions destructives et branches fusionnées en squash

1. **Commande destructive proposée sans vérifier l'état.** Un `git checkout -- .` aurait effacé des modifications non commitées. Règle : `git status` d'abord ; commiter ou sauvegarder, ne jamais écraser.
2. **Force-push refusé.** Cause : une branche fusionnée en squash n'est plus un ancêtre de la branche principale. Règle : ne jamais forcer ; fusionner la branche principale dans la branche de travail, puis pousser en avance rapide.
3. **Lien `claude.ai/code` dans une PR.** Il fait tourner des workflows d'auto-fusion sur d'autres dépôts. Règle : ne pas le mettre.
4. **« Vérifié » sans preuve.** Règle : écrire « non vérifié » tant que la vérification n'a pas été faite.
