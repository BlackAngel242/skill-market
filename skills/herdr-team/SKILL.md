---
name: herdr-team
description: Faire travailler ensemble plusieurs agents IA lancés dans des panes Herdr (codex, opencode, agy, omp, claude...) via le script herdr-ask — consultation, brainstorm en plusieurs tours (propositions, critique croisée, décision), travail parallèle — avec une mémoire commune qui fait progresser l'équipe d'un projet à l'autre. Utiliser quand l'utilisateur demande une review, un avis, un brainstorm ou un travail parallèle de ses agents Herdr, ou tape /herdr-team.
---

# herdr-team

Orchestre plusieurs agents Herdr avec `herdr-ask` : chaque tâche passe par des fichiers (`quest.md` → `response.tmp.md` → `response.md`), sa fin est prouvée par une sentinelle, et chaque agent n'a qu'une tâche à la fois. L'équipe apprend en continu : chaque réponse rapporte ses erreurs, astuces et méthodes, et une mémoire commune (`LECONS.md`) se lit avant chaque mission.

## Prérequis et installation

- [Herdr](https://herdr.dev) avec ses agents dans des panes, et son skill officiel `herdr` pour la syntaxe des commandes (`herdr --help` fait foi).
- `bash` (Git Bash sous Windows).
- Installer le script et la mémoire, une fois :
  ```bash
  mkdir -p ~/.local/bin ~/.herdr-bus
  cp <dossier-du-skill>/scripts/herdr-ask ~/.local/bin/ && chmod +x ~/.local/bin/herdr-ask
  cp <dossier-du-skill>/references/apprentissage.md ~/.herdr-bus/APPRENTISSAGE.md
  [ -f ~/.herdr-bus/LECONS.md ] || cp <dossier-du-skill>/references/lecons-modele.md ~/.herdr-bus/LECONS.md
  ```
  `HERDR_BUS` change le dossier de travail (défaut `~/.herdr-bus`). Ne jamais remplacer `herdr-ask` pendant qu'une instance tourne.
- Facultatif : `~/.herdr-bus/EQUIPE.md`, la table des agents de l'utilisateur (nom, forces, délai conseillé). Le lire s'il existe ; sinon, demander à l'utilisateur les forces de chaque agent et proposer de créer ce fichier.

## Trouver l'équipe (jamais de numéro de pane en dur)

1. `herdr agent list` : repérer les agents de l'espace de travail courant. Les numéros de pane changent d'une session à l'autre.
2. Un agent sans nom n'est pas joignable par `herdr-ask` (code 5). Vérifier son identité (`agent`, écran visible) puis le nommer : `herdr agent rename <pane> <nom>`. Un agent relancé perd son nom.
3. Si un agent attendu manque, le dire à l'utilisateur au lieu de deviner.

Un fichier = un propriétaire : jamais deux agents qui écrivent le même fichier. Un agent qui teste travaille sur une copie figée (ex. `git archive <commit>`), pas sur l'arbre qu'un autre modifie.

## Procédure

1. **Préparer la tâche.** Lire `~/.herdr-bus/LECONS.md` en entier et citer dans le brief les numéros appliqués. Contenu long : écrire le brief dans `~/.herdr-bus/<sujet>.md` et passer `@chemin`.
2. **Lancer chaque agent en arrière-plan**, un appel par agent : `herdr-ask <agent> @<brief.md> <délai_s>`. Délai selon l'agent et la tâche (EQUIPE.md). Jamais deux tâches sur le même agent (code 2).
3. **Ne pas interroger en boucle** : traiter chaque réponse à la fin de sa tâche, dans l'ordre d'arrivée.
4. **Lire et vérifier.** Valable seulement avec `status=ok` et la sentinelle `<!-- herdr:complete ... -->`. Revérifier soi-même au moins un constat clé par réponse (code, commande, fichier sur disque). Un fichier annoncé comme écrit se vérifie sur le disque.
5. **Synthétiser** : points communs, désaccords, décisions, ce qui reste à tester ; dire ce qui n'est pas vérifié.

## Consultation en plusieurs tours

1. **Tour 1 — propositions indépendantes** : même brief pour tous, angle selon les forces de chacun, format imposé (lu, constats avec preuve, propositions `<agent>-P<n>`, non vérifié).
2. **Synthèse** (`<sujet>-synthese-t1.md`) : propositions regroupées (`G<n>`), désaccords numérotés (`D<n>`), ce que l'orchestrateur a vérifié.
3. **Tour 2 — critique croisée** : chacun vote POUR / CONTRE / AMENDER sur chaque `G`, tranche les `D`, donne son top 5 ; tâche propre à son rôle (critique par personas, reproduction par tests, chiffrage).
4. **Décision** (`<sujet>-DECISION.md`) : lots retenus, rejets motivés, désaccords tranchés, actions qui exigent l'accord de l'utilisateur. La présenter et attendre l'accord avant d'implémenter.
5. Une réponse tardive garde son identifiant de tour.

## Apprentissage en essaim

Protocole complet : `references/apprentissage.md`. En bref :
- chaque réponse finit par `## Apprentissage` : 5 puces au plus, taguées (`erreur`, `astuce`, `méthode`, `leçon L-n`, `contesté L-n`), avec preuve ; « Rien à signaler » accepté. `herdr-ask` l'exige dès que `~/.herdr-bus/APPRENTISSAGE.md` existe, et fait lire `LECONS.md` d'abord ;
- qui corrige ce qu'une autre IA pourrait refaire écrit un bloc `### Correction` (cause, vérification, alternative écartée, règle) ; si l'erreur est déjà connue : « L-n, vu 2 » ;
- l'orchestrateur est la seule plume de `LECONS.md` : il vérifie une preuve par réponse (5 minutes au plus), incrémente « vu N » plutôt que de dupliquer, classe (ERREUR, ASTUCE, MÉTHODE, RÔLE ; À VALIDER, CONFIRMÉ, REMPLACÉ, CONTESTÉ) et cite dans le brief suivant les seuls numéros utiles ;
- une leçon d'un seul cas reste À VALIDER ; un second cas indépendant (autre projet, autre IA) la confirme ; toute IA peut contester une entrée avec preuve ;
- 40 entrées actives au plus (archive au-delà) ; après chaque phase de projet, un bilan de 10 lignes généré par commandes montre à l'utilisateur comment l'équipe progresse.

## Codes de sortie de herdr-ask

- `0` : réponse acceptée.
- `1` : timeout ; le verrou est **conservé** (l'agent peut encore travailler).
- `2` : agent occupé.
- `3` : l'agent a écrit `status=error` ; lire sa réponse et le dire à l'utilisateur.
- `4` : renommage impossible ; le `.response.tmp.md` reste lisible.
- `5` : usage invalide ou agent inconnu (souvent : agent non nommé).
- `6` : pause de quota — l'agent a atteint sa limite d'usage (« You've hit your usage limit · try again at 5:42 AM ») ; tâche non terminée, verrou **conservé**. Appliquer « Pause de quota : relais ».

## Pause de quota : relais

Même règle que MyTeam (`src/relais-quota.mjs`, désactivable dans le bureau par `BUREAU_RELAIS_QUOTA=0`) : une mission ne reste pas bloquée pendant qu'un agent attend la fin de sa limite.
`herdr-ask` vérifie toutes les 30 secondes, et seulement quand l'agent ne travaille plus (`idle`, `done`, `blocked`), le bas de son écran (`--source detection`, 12 lignes) : un agent qui lit ou écrit ces phrases n'est pas confondu avec un agent bloqué.

1. **Constater** : `herdr agent read <agent> --source visible` (message et heure de retour) ; noter l'heure dans `EQUIPE.md` si elle se répète.
2. **Relever l'état** (L-33) : `git status`, `git log`, diff non commité du worktree de l'agent, et `<id>.response.tmp.md` s'il existe. Ce qui est commité reste acquis.
3. **Choisir un suppléant** : libre (pas de verrou), même projet, jamais le chef, et de préférence **un autre outil** (un second agent du même outil partage souvent le même compte, donc la même limite). Respecter ses forces (`EQUIPE.md`) et le dire s'il sort de son registre.
4. **Briefer la reprise** : la mission d'origine (le `quest.md`), l'état relevé, la consigne de lire l'écran de l'agent en pause, et la règle « un fichier = un propriétaire ». Le propriétaire des fichiers passe au suppléant pour ce lot.
5. **Libérer l'agent en pause** : arrêter l'attente `herdr-ask`, puis `--unlock` après les trois contrôles ci-dessous (écran = limite affichée, propriétaire = cette tâche, aucune réponse en cours).
6. **À son retour** : lui dire que sa mission a été reprise par le suppléant ; il ne la recommence pas et attend la prochaine consigne.

## Déverrouiller (`herdr-ask --unlock <agent>`)

`--unlock` ne vérifie rien lui-même, et `idle` ne suffit pas (un agent peut travailler en étant affiché `idle`). Vérifier les trois :
1. `herdr agent read <agent> --source visible` : pas de travail en cours, pas de boîte de dialogue ;
2. `cat ~/.herdr-bus/<agent>/.lock/owner` : l'identifiant correspond à une tâche terminée ou abandonnée ;
3. pas de `.response.tmp.md` récent pour cet identifiant.
En cas de doute, garder le verrou et demander à l'utilisateur.

## Règles

- Ne jamais répondre à la place d'un agent bloqué sur une validation : remonter la question à l'utilisateur.
- Ne jamais fermer un pane ni un agent qu'on n'a pas créé ; pas d'Échap chez un agent au travail sans accord.
- Un agent qui échoue ne fait pas échouer les autres : traiter les réponses reçues.
