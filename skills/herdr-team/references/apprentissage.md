# Apprentissage en essaim — protocole commun

Valable pour toutes les IA pilotées par herdr, dans tous les panes et tous les projets. But : que l'expérience de chacune serve à toutes, et que l'équipe s'améliore d'un projet à l'autre sans répéter les mêmes erreurs.

Mémoire commune : `$HERDR_BUS/LECONS.md` (par défaut `~/.herdr-bus/LECONS.md`). Elle se lit en entier avant chaque mission. Pour l'activer : copier ce fichier en `$HERDR_BUS/APPRENTISSAGE.md` ; `herdr-ask` ajoute alors la consigne à chaque tâche.

## 1. Chaque réponse se termine par `## Apprentissage`

Juste avant la sentinelle `<!-- herdr:complete ... -->`. Quatre rubriques, chacune peut valoir « rien » :

- **Erreurs** : ce que j'ai mal fait ou failli mal faire, et comment je m'en suis rendu compte.
- **Astuces** : une technique, une commande ou un piège d'outil qui fait gagner du temps ou évite un faux résultat.
- **Méthode** : la démarche qui a permis d'arriver à la solution (étapes, vérification qui a tranché).
- **Leçons** : numéros de `LECONS.md` appliqués ; leçon contredite ou à nuancer, avec la preuve.

Un apprentissage sans preuve (sortie, ligne de code, fichier) se marque « supposé ».

## 2. Qui corrige explique

Quand une IA corrige le travail d'une autre (ou le sien après coup), elle écrit :

```
### Correction
- Quoi : ce qui était faux (fichier:ligne, sortie observée).
- Pourquoi c'était faux : la cause, pas le symptôme.
- Comment je l'ai corrigé : le changement et la vérification qui prouve qu'il marche.
- Pourquoi ainsi : l'alternative écartée et la raison.
- Pour ne pas la refaire : la règle à suivre, formulée pour toutes les IA.
```

Exemple : un banc de test PowerShell affichait `code=0` pour une commande refusée. Cause : `Start-Process -PassThru` sans lecture de `$p.Handle` rend `ExitCode` nul, converti en 0. Correction : lire `$p.Handle` (ou `$LASTEXITCODE`), code nul = KO. Règle : un résultat qui contredit une autre étape du même banc se vérifie avant d'être rapporté.

## 3. Une seule plume pour la mémoire

Les IA **proposent** ; l'orchestrateur **écrit** dans `LECONS.md` (un fichier = un propriétaire, pas d'écriture concurrente). À la fin de chaque mission, il :
1. relit les sections `Apprentissage` et `Correction` reçues ;
2. vérifie la preuve d'au moins un point par réponse ;
3. ajoute ou met à jour les entrées, avec leur type et leur état ;
4. cite dans le brief suivant, à toutes les IA, les leçons nouvelles et la correction qui les a fait naître.

## 4. Types et états

Types : **ERREUR** (piège rencontré), **ASTUCE** (technique utile), **MÉTHODE** (démarche qui a abouti), **RÔLE** (force ou limite observée d'une IA).

États, pour une évolution consciente plutôt qu'automatique :
- **À VALIDER** : un seul cas.
- **CONFIRMÉ** : vérifié sur preuve, ou revu dans un second cas indépendant (autre projet ou autre IA).
- **REMPLACÉ par L-n** : une meilleure règle existe ; ne pas supprimer, pour garder l'historique.
- **CONTESTÉ** : une IA apporte une preuve contraire ; l'orchestrateur tranche ou demande à l'utilisateur.

Chaque entrée garde : date, projet, source, portée (une IA, toutes, orchestrateur) et « vu N fois » quand elle se répète. Une leçon ne devient pas une règle universelle à partir d'un seul cas.

## 5. Ce que l'essaim ne fait pas

- Pas de leçon inventée pour remplir la rubrique : « rien » est une réponse valable.
- Pas de secret, de donnée personnelle (numéro, adresse, identifiant) ni de contenu privé de projet dans la mémoire commune.
- Pas de changement de comportement imposé par une leçon À VALIDER sans le dire.
