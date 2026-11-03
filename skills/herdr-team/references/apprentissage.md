# Apprentissage en essaim — protocole commun (v2)

Valable pour toutes les IA pilotées par herdr, dans tous les panes et tous les projets. But : que l'expérience de chacune serve à toutes, et que l'équipe s'améliore d'un projet à l'autre sans répéter les mêmes erreurs — sans transformer chaque réponse en pavé.

Mémoire commune : `$HERDR_BUS/LECONS.md` (par défaut `~/.herdr-bus/LECONS.md`), lue en entier avant chaque mission. Pour activer le protocole : copier ce fichier en `$HERDR_BUS/APPRENTISSAGE.md` ; `herdr-ask` ajoute alors la consigne à chaque tâche.

## 1. Chaque réponse se termine par `## Apprentissage`

Juste avant la sentinelle. **5 puces au plus**, chacune préfixée par un tag : `erreur` · `astuce` · `méthode` · `leçon L-n` · `contesté L-n`.
Preuve obligatoire (commande + 2-3 lignes de sortie, ou fichier:ligne), sinon tag `supposé`.
Rien à signaler → une seule ligne « Rien à signaler ». Jamais de puce écrite pour remplir : une leçon fabriquée coûte plus cher que le silence.

## 2. Qui corrige explique

Seulement si une autre IA pourrait refaire l'erreur (sinon, une ligne suffit) :

```
### Correction
- Quoi / cause : fichier:ligne + sortie observée ; la cause derrière le symptôme.
- Vérification : la commande ou l'exécution qui prouve que c'est corrigé.
- Alternative écartée : pourquoi pas l'autre choix (une phrase).
- Règle : une phrase pour toutes les IA, candidate à LECONS.md.
```

Si l'erreur est déjà dans `LECONS.md` : écrire « L-n, vu 2 » au lieu du bloc.

## 3. Une seule plume pour la mémoire

Les IA **proposent** ; l'orchestrateur **écrit** dans `LECONS.md` (un fichier = un propriétaire). À la fin de chaque mission :
1. relire les sections `Apprentissage` et `Correction` reçues ;
2. vérifier la preuve d'un point par réponse, **5 minutes au plus** ; au-delà, noter « preuve non revue » ;
3. avant toute nouvelle entrée, se demander si une entrée couvre déjà le cas : si oui, incrémenter « vu N » ;
4. dans le brief suivant, citer **seulement les numéros utiles au travail demandé** (`L-n (projet)`), pas la liste des nouveautés.

## 4. Types, états et portée

Types : **ERREUR**, **ASTUCE**, **MÉTHODE**, **RÔLE** (force ou limite observée d'une IA).

États, pour une évolution consciente :
- **À VALIDER** : un seul cas ; jamais appliquée comme règle sans le dire.
- **CONFIRMÉ** : second cas indépendant (autre projet ou autre IA), ou preuve vérifiée. L'accord des pairs ne suffit pas.
- **REMPLACÉ par L-n** : garder l'entrée pour l'historique.
- **CONTESTÉ** : toute IA peut l'ouvrir dans sa section Apprentissage (`contesté L-n` + preuve) ; l'orchestrateur tranche ou demande à l'utilisateur. Quand tout le monde est d'accord, l'écrire : le silence n'est pas un vote.

En-tête : `L-<n> · date · projet · source · portée · type · état`. Le projet est obligatoire ; la portée par défaut est **ce projet** ; l'élargir à « toutes » est un changement explicite.

Plafond : **40 entrées actives**. Au-delà, les CONFIRMÉ de plus de deux mois partent dans `LECONS-ARCHIVE.md` (une ligne d'index chacune dans `LECONS.md`).

## 5. Garde-fous

- Pas de secret, de donnée personnelle (numéro, adresse, identifiant) ni de contenu privé de projet dans la mémoire commune.
- Le protocole lui-même évolue par proposition dans une section Apprentissage, puis accord de l'utilisateur. On modifie `herdr-ask` seulement quand aucune instance ne tourne (nouveau fichier puis `mv`).

## 6. Bilan pour l'utilisateur

Après chaque phase de projet, l'orchestrateur produit **10 lignes au plus**, générées par commande :

```bash
grep '^## L-' LECONS.md | grep -oE 'CONFIRMÉ|À VALIDER|CONTESTÉ|REMPLACÉ' | sort | uniq -c   # états
grep '^## L-' LECONS.md | grep -c 'vu [2-9]'                                                  # récidives
grep -l 'L-<n>' "$HERDR_BUS"/*/*.response.md | wc -l                                          # leçon citée
```

Puis 3 phrases : nouvelles entrées, passages d'état, récidives ou contestations. Une citation prouve la lecture, pas l'application ; l'application se voit dans un bloc Correction ou une vérification citée à côté du numéro.
