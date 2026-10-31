# Module VISUEL — revue d'un rendu effectivement observable

**Activer** pour image, interface, PDF ou document mis en page, écran PC/mobile, logo, affiche, animation et vidéo dont le rendu est inspectable. Ce module **préserve les exigences de Fixit 1.0** : double lecture, deux tailles lorsque pertinentes, défauts classés et réinspection après correction.

## Première lecture : expert visuel

- Vérifier composition, cadrage, hiérarchie, espaces, typographie, contrastes, alignements, collisions, cohérence graphique et lisibilité des textes **réels**.
- Vérifier l'authenticité et l'intégrité des logos, symboles, couleurs, visages, mains, illustrations et mentions obligatoires lorsqu'ils sont présents ; relever les artefacts IA observables, pas des soupçons gratuits.
- Préserver le style approuvé ; une esthétique différente n'est pas un défaut. Vérifier les zones de sécurité pour les formats sociaux et les périphériques concernés.
- Pour documents/PDF, ouvrir les pages rendues ; pour vidéo, inspecter les frames et transitions représentatives, et vérifier les éléments sonores seulement si le média sonore a été réellement examiné.

## Seconde lecture : utilisateur ordinaire

- Le sens se comprend-il dans les **trois premières secondes** pour le public ciblé ? Le titre, le message, la prochaine action et la valeur sont-ils clairs ?
- Sur téléphone : corps de texte, cibles tactiles, contraste, débordements, lisibilité sans zoom.
- Sur ordinateur : densité, largeur de lecture, espaces vides, interactions souris, navigation clavier **si réellement essayées**.
- Vérifier au minimum **téléphone et ordinateur** pour une interface multi-support ; indiquer les dimensions et versions **réellement examinées**, avec un verdict distinct sur chaque taille. Pour un support statique exclusivement vertical (ex. story), examiner le format cible plutôt que prétendre avoir vérifié un desktop inutile.

## Procédure

1. Identifier support, version exacte, dimensions, public, objectif, textes figés, assets et direction graphique validée.
2. Ouvrir le rendu (capture, pages, build exécuté, vidéo) ; les résultats d'analyse statique du code ne remplacent **jamais** l'inspection.
3. Réaliser les deux lectures et relier chaque défaut à un endroit et une preuve observable. Pour les écrans interactifs, **séparer rendu observé et actions vraiment testées** : une capture ne prouve ni navigation ni paiement ni animation.
4. Classer **BLOQUANT** (usage critique impossible ou texte faux/illisible), **IMPORTANT** (dégradation forte), **OPTIONNEL** (finition). Pas de défaut imaginé pour un élément absent.
5. Proposer la correction précise, puis appliquer uniquement si autorisé. Ne pas retoucher des contenus déclarés intouchables.
6. **Revoir le nouveau rendu sur les mêmes dimensions** et chercher les régressions. Une maquette plus jolie n'est pas automatiquement un produit fonctionnel.

## Inspiration sans imitation

Quand une question d'interface ou de composition a besoin de références, ouvrir `references-visuelles.md` (Mobbin, Dribbble) et inspecter les **images originales**, pas leurs titres. Ne pas transmettre de données privées à ces recherches. Une référence valide une piste, pas le comportement de l'interface ; ne pas copier les marques et assets.

## Échec d'observabilité

Si le résultat visuel n'est pas visible, écrire exactement **« vérification visuelle non effectuée »** et préciser les preuves manquantes. Si une seule taille a été vérifiée, indiquer clairement laquelle ; **VALIDÉ** est interdit si une taille obligatoire manque. Revenir au gate commun.
