---
name: fixit
description: "Contrôle qualité adaptatif et modulaire des livrables IA : sélection des capacités, revues visuelle/technique/contenu, contradiction ciblée, corrections autorisées, preuves, réinspection et apprentissage sans sur-promesse."
---

# Fixit 2.0 — contrôle qualité adaptatif

Fixit examine un **livrable déjà produit** pour identifier des défauts démontrables, proposer ou appliquer les corrections autorisées, vérifier le résultat et transmettre des leçons utiles. Ce n'est ni un générateur de PRD (voir `prd-table-ronde`), ni un outil de refonte automatique, ni un vote de personas fictifs.

## Déclenchement et proportionnalité

Activer pour « Fixit », « avis Fixit », « passe Fixit », « revue finale », « contrôle qualité », ou une demande explicite de revue avant livraison. Lire ce `SKILL.md` intégralement, puis **uniquement** les modules requis ci-dessous. Pour une tâche ponctuelle sans livrable inspectable, répondre simplement sans inventer de revue.

| Signal de la mission | Module à lire |
|---|---|
| Image, interface, page, maquette, PDF rendu, animation visible | `references/revue-visuelle.md` |
| Code, sécurité, performance, base, déploiement, tests, infrastructure | `references/revue-technique.md` |
| Texte, publication, documentation, voix, vidéo, storyboard, marketing | `references/revue-contenu.md` |
| Mission multidomaine à risque, désaccord sérieux, demande de revue collective | `references/revue-equipe.md` |

Toujours lire **`references/verification-gate.md`**, qui définit les verdicts et le format de restitution. En cas de retour important ou de continuité de projet, lire `references/memoire-apprentissage.md`. Une mission mixte peut activer deux modules ; ne pas charger les quatre par réflexe. La revue visuelle conserve le guide optionnel `references/references-visuelles.md`.

## Protocole CORE

1. **Situer.** Identifier livrable, version exacte, objectif, public, supports, risques, contraintes et décisions validées ; distinguer hypothèses, observations et exigences. Ne demander que les informations réellement bloquantes.
2. **Repérer les capacités.** Examiner les outils, skills et plugins **effectivement accessibles** pertinents, en distinguant : (a) skill documenté, (b) plugin installé, (c) outil exposé, (d) connexion/action réellement testée. Choisir le minimum utile ; ne pas prétendre qu'une capacité fonctionne parce qu'elle existe dans un catalogue. Lire les guides retenus et ne jamais installer, connecter ou payer sans autorisation.
3. **Router.** Choisir les modules de la table, annoncer brièvement les axes de contrôle et ce qui restera hors périmètre. Les modules spécialisés et leurs tests gardent leurs propres règles : Fixit les coordonne, ne les réécrit pas.
4. **Inspecter des preuves réelles.** Ouvrir le rendu, exécuter les tests ou consulter l'artefact réel selon le support. Noter version, environnement, action effectuée, résultats et limites. Aucune conclusion tirée du seul code ne valide un affichage ; aucune capture ne valide un comportement. Ne jamais inventer l'outil, l'exécution, la source ou le résultat.
5. **Contredire et prioriser.** Séparer faits, interprétations et préférences. Retirer les faux défauts ; classer **BLOQUANT / IMPORTANT / OPTIONNEL**. Formuler chaque correction avec emplacement, cause, action attendue et preuve de réussite ; préserver les choix approuvés.
6. **Corriger uniquement si autorisé**, idéalement en une passe cohérente. Une demande d'avis n'autorise pas un push, un déploiement, une publication, une dépense ni la réécriture des textes figés. Ne jamais court-circuiter la sécurité ou la hiérarchie du projet.
7. **Réinspecter la version modifiée** sur les mêmes supports et scénarios, rechercher les régressions et appliquer le **gate de vérification**. Arrêter quand les corrections nécessaires sont vérifiées, sans boucle cosmétique infinie. Indiquer explicitement les éléments impossibles à vérifier.
8. **Apprendre avec discernement.** Capitaliser une leçon vérifiée avec date, source, portée et état ; consulter le module de mémoire si pertinent. Une suggestion ne devient pas une préférence personnelle sans confirmation de l'utilisateur.

## Règles permanentes

- Le coût et le niveau de contrôle sont proportionnés au risque ; mobiliser les meilleurs outils **disponibles**, pas tous les outils.
- Les contrôles d'autrui sont une source de preuve uniquement si leur version, périmètre et résultats sont connus. Plusieurs « rôles » simulés par un seul agent ne valent pas plusieurs tests indépendants.
- Distinguer **non testé**, **échec démontré** et **vérifié conforme**. Si un contrôle obligatoire manque, le verdict ne peut être « VALIDÉ ».
- Ne collecter, publier ou mémoriser aucun secret ni donnée privée inutile. Ne pas transférer des fichiers de projet vers un service externe sans consentement.
- Les instructions explicites du projet et du demandeur priment sur les préférences stylistiques génériques ; aucune leçon n'autorise une action interdite.

## Sortie

Suivre `references/verification-gate.md` : périmètre et versions, modules/capacités réellement utilisés, preuves, défauts classés, correctifs, recontrôles, limites et verdict parmi **REJETÉ**, **À CORRIGER**, **VALIDÉ SOUS RÉSERVE**, **VALIDÉ**. Rester clair pour un non-technicien et adapter la longueur à la mission.
