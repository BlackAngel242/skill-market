---
name: fixit
description: "Revue visuelle des rendus (images, interfaces, documents) : double lecture expert visuel et utilisateur ordinaire, défauts classés BLOQUANT/IMPORTANT/OPTIONNEL, corrections précises, réinspection obligatoire, verdict REJETÉ/À CORRIGER/VALIDÉ SOUS RÉSERVE/VALIDÉ."
---

# Fixit : contrôle visuel et corrections vérifiées

Origine : créé en octobre 2026 pour un projet multi-IA (revue d'interfaces à deux tailles d'écran, ordinateur et téléphone). Version générique pour tout agent.

## Déclenchement

Appliquer ce guide dès que Fixit est demandé : mentions "Fixit", "avis Fixit", "Fixit au travail", "applique les recommandations Fixit". Lire ce fichier intégralement. Examiner chaque nouvelle version visuelle de la tâche avant livraison. Une installation du skill ou une lecture du code n'est pas une revue visuelle.

## Deux lectures complémentaires

Un même agent peut effectuer les deux lectures ; les sous-agents sont facultatifs.

- Expert visuel : composition, hiérarchie, typographie, contraste, marges, collisions, logos, cohérence graphique, artefacts IA. Ne pas fabriquer un défaut sur un élément absent.
- Utilisateur ordinaire : compréhension en trois secondes, lisibilité sur téléphone et ordinateur, facilité d'usage, crédibilité, adéquation au public. Vérifier le grand écran avec autant de soin que le téléphone : largeur de lecture, densité, espaces inutilisés, clavier, interactions souris.

## Références visuelles

Quand une question de composition, de parcours ou d'interaction mérite comparaison, utiliser le guide `references/references-visuelles.md` (Mobbin, Dribbble). Ouvrir les visuels avant de les analyser. Ces recherches complètent la revue sans remplacer l'inspection du résultat ni imposer une nouvelle esthétique.

## Procédure obligatoire

1. Identifier le support et la version exacte, les dimensions, le public, l'objectif, les textes validés et les éléments à préserver. Distinguer maquette proposée et produit fonctionnel. Demander uniquement ce qui manque et change réellement la revue.
2. Examiner le résultat réellement rendu : ouvrir l'image, les captures de l'interface ou les pages du document. Pour une interface, inspecter au minimum ordinateur et téléphone sur la même version, avec une conclusion distincte pour chacun. Noter les dimensions examinées et la référence des preuves. Un build, une lecture du code ou un détecteur automatique ne remplace pas ce contrôle.
3. Effectuer les deux lectures ; contrôler texte, compréhension, hiérarchie, composition, lisibilité et intégrité visuelle. Pour un écran interactif, distinguer ce que la capture montre des comportements effectivement essayés : une image ne prouve ni navigation, ni animation, ni envoi réussi.
4. Classer les défauts réels : BLOQUANT (usage impossible, contenu critique faux ou illisible), IMPORTANT (dégradation sensible de lecture ou usage), OPTIONNEL (amélioration de finition). Justifier par un élément observé, pas par un goût personnel opposé à la direction validée.
5. Décrire pour chaque défaut la correction précise : élément, emplacement, modification attendue et résultat observable. Regrouper les corrections en une passe cohérente. Préserver la direction et les éléments validés.
6. Appliquer les corrections si la demande l'autorise. Une revue seule ne vaut pas autorisation de réécriture ou publication. Si les textes sont intouchables, signaler leurs erreurs séparément sans les modifier.
7. Examiner à nouveau le résultat corrigé avec les mêmes supports et tailles. Vérifier les défauts signalés et les régressions sur les éléments préservés. Chaque nouvelle version visuelle doit être inspectée avant livraison. S'arrêter une fois les corrections vérifiées ; ne pas poursuivre une boucle cosmétique. Si une contrainte empêche de finir, l'indiquer explicitement.

## Preuves et verdict

Si le résultat n'est pas visible, écrire exactement "vérification visuelle non effectuée", expliquer ce qui manque et ne pas conclure à une validation. Si une partie seulement est visible, préciser les supports examinés et ceux manquants. Aucun verdict ne certifie une taille ou interaction non inspectée.

Terminer par un compte rendu court :

- Support, version et dimensions examinés ; références des preuves.
- Défauts prioritaires, avec leur gravité et corrections précises.
- Corrections appliquées, ou absence de modifications et sa raison.
- Résultat de la réinspection, ou mention explicite de son absence.
- Verdict : REJETÉ, À CORRIGER, VALIDÉ SOUS RÉSERVE ou VALIDÉ.

REJETÉ : le résultat examiné échoue à son objectif ou exige une reprise majeure.
À CORRIGER : défaut bloquant ou important restant, ou preuve nécessaire manquante.
VALIDÉ SOUS RÉSERVE : aucun défaut majeur observé dans le périmètre inspecté, avec réserves mineures ou limites explicites ; ne pas masquer un défaut important.
VALIDÉ : aucun défaut bloquant ou important restant dans le périmètre demandé, après réinspection de toute correction et contrôle de toutes les tailles requises.

## Mémoire

À chaque activation, relire la mémoire persistante de l'utilisateur et les décisions de design du projet, puis adapter les critères au support, au public et à l'objectif. Après un retour significatif ou une leçon vérifiée, enregistrer : date, source, portée, état (CONFIRMÉ, À VALIDER, REMPLACÉ). Une recommandation de Fixit ne devient une préférence que si l'utilisateur la confirme. Ne mémoriser ni secrets ni données privées inutiles à la revue ; ne rien transmettre à un service externe.

## Articulation avec les autres guides

Fixit complète les règles de design du projet sans les remplacer. Il ne remplace ni les tests fonctionnels ni les droits d'accès. Une inspection déjà faite peut servir de preuve si elle correspond exactement à la version et aux tailles demandées ; toute modification visuelle impose une nouvelle inspection.
