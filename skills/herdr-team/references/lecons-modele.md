# Leçons communes de l'essaim herdr — à lire en entier avant chaque mission

Modèle de départ : copier en `$HERDR_BUS/LECONS.md`, puis l'enrichir selon `apprentissage.md`. Ces leçons viennent de missions réelles (octobre-novembre 2026) ; elles sont générales et ne contiennent aucune donnée de projet.

Format : `L-<n> · date · projet · source · portée · type · état` puis **Quoi**, **Pourquoi**, **Comment appliquer**.

## L-1 · 2026-10-16 · général · orchestrateur · toutes · MÉTHODE · CONFIRMÉ
- **Quoi** : aucun constat sans preuve observable (capture, mesure, extrait de code cité). Un texte extrait n'est pas un rendu.
- **Pourquoi** : un relevé de texte annonçait un défaut d'affichage absent à l'écran ; un avis affirmait l'absence d'un lien présent dans le code.
- **Comment appliquer** : citer la source de chaque constat et séparer « vu » de « supposé ».

## L-2 · 2026-10-16 · général · orchestrateur · toutes · ERREUR · CONFIRMÉ
- **Quoi** : ne pas inventer de chiffre (poids, pourcentage, durée). Mesurer, ou écrire « non mesuré ».
- **Pourquoi** : un poids de 15 Mo annoncé sans mesure ; le réel était 1,15 Mo.
- **Comment appliquer** : tout chiffre cité est accompagné de sa méthode de mesure.

## L-3 · 2026-10-16 · général · orchestrateur · toutes · ERREUR · CONFIRMÉ
- **Quoi** : quand une tâche bloque (outil indisponible, lecture impossible), le dire tout de suite avec l'erreur exacte. Ne pas répondre « fait » à la place.
- **Pourquoi** : un agent annonçait l'écriture d'un fichier qui n'existait pas sur le disque.
- **Comment appliquer** : l'orchestrateur vérifie sur le disque tout fichier annoncé comme écrit.

## L-4 · 2026-10-19 · général · orchestrateur · toutes · ASTUCE · CONFIRMÉ
- **Quoi** : dans Git Bash, un argument qui commence par `/` (ex. `/quit`) est converti en chemin Windows avant d'atteindre l'agent.
- **Comment appliquer** : `MSYS_NO_PATHCONV=1` avant tout `herdr agent prompt` ou `herdr pane send-text` portant une commande slash, puis relire l'écran de l'agent.

## L-5 · 2026-10-19 · général · utilisateur · toutes · RÔLE · CONFIRMÉ
- **Quoi** : ne jamais appuyer sur Échap chez un agent au travail, ni répondre à sa place à une boîte de dialogue (confiance du dossier, autorisation), sans l'accord de l'utilisateur.
- **Comment appliquer** : remonter la question et attendre.

## L-6 · 2026-10-19 · général · orchestrateur · orchestrateur · ERREUR · CONFIRMÉ
- **Quoi** : un agent relancé perd son nom herdr (`agent_not_found`) et peut garder un ancien verrou de `herdr-ask` (code 2).
- **Comment appliquer** : `herdr agent list`, `herdr agent rename <pane> <nom>`, puis vérifier le verrou selon SKILL.md avant tout `--unlock`.

## L-7 · 2026-10-19 · général · orchestrateur · toutes · ASTUCE · CONFIRMÉ
- **Quoi** : `agent_prompt_stalled` ne prouve pas l'échec ; un texte collé peut rester dans la zone de saisie. Un agent affiché `idle` peut travailler encore ou cacher une boîte de dialogue.
- **Comment appliquer** : `herdr agent read <nom> --source visible` avant tout renvoi ; changer d'approche après deux tentatives.

## L-8 · 2026-11-03 · général · orchestrateur · toutes · ERREUR · CONFIRMÉ
- **Quoi** : ne jamais modifier un script shell (dont `herdr-ask`) pendant qu'une de ses instances tourne.
- **Pourquoi** : bash lit le script au fil de l'exécution ; une instance en attente a planté (`unexpected EOF`) après une modification, alors que la réponse de l'agent était complète sur le disque.
- **Comment appliquer** : attendre la fin des instances, ou écrire un nouveau fichier puis `mv`. Après un plantage, lire `$HERDR_BUS/<agent>/<id>.response.md` directement.

## L-9 · 2026-11-03 · général · orchestrateur · toutes · ERREUR · CONFIRMÉ
- **Quoi** : sous PowerShell 5.1, `Start-Process -PassThru` puis `WaitForExit()` peut rendre `ExitCode = $null` si `$p.Handle` n'a pas été lu. Ne jamais convertir un code inconnu en 0.
- **Comment appliquer** : `$null = $p.Handle` après `Start-Process`, ou appel direct puis `$LASTEXITCODE`.

## L-10 · 2026-11-03 · général · orchestrateur · toutes · MÉTHODE · À VALIDER
- **Quoi** : pour un outil destiné à Windows, tester dans Windows Sandbox (Windows neuf, sans git, python ni node) avec un journal horodaté continu ; faire relire le diff complet par une IA critique avec des personas (expert sécurité, mainteneur, contributeur, débutant).
- **Pourquoi** : la Sandbox a trouvé une installation impossible sans git, invisible sur la machine de développement ; la relecture par personas a trouvé des écarts entre la décision et le code.
