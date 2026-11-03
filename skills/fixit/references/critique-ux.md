# Module UX / Design Critique : parcours et décisions d'interface

**Activer uniquement** lorsqu'un livrable est une interface interactive, un écran à parcourir, une maquette d'app ou un flux utilisateur. Ce module complète `revue-visuelle.md`, qui contrôle le rendu et sa finition. Il n'est pas une copie du skill tiers ni un substitut aux tests fonctionnels.

## Origine et frontière

Principes adaptés du skill public Anthropic **design-critique** : https://github.com/anthropics/knowledge-work-plugins/tree/main/design/skills/design-critique (consulté le 1er novembre 2026). L'apport spécialisé est une critique de l'intention, des parcours et de la découvrabilité ; Fixit conserve les preuves, le gate et les verdicts. UxFix/Impeccable peut corriger des règles CSS mécaniques, mais un score de détecteur ne valide ni un parcours, ni un choix de SIM, ni un SMS.

## Protocole spécifique

1. **Périmètre** : consigner produit, version/commit, parcours, public, support, contraintes, décisions de design scellées et état (maquette vs code vs appareil). Ne pas faire passer un prototype interactif pour l'application réelle.
2. **Preuves visuelles** : si possible capturer des écrans consécutifs du parcours depuis le rendu effectivement lancé, avec dimensions, états (vide/chargement/erreur), clavier, police agrandie, clair/sombre, navigation et animations. Si aucune capture fiable n'est disponible, écrire « vérification visuelle non effectuée » ; faire une revue de structure/code clairement étiquetée, sans prétendre juger le rendu.
3. **Première impression en 2 secondes** : identifier ce qui attire l'oeil, la tâche principale, l'action primaire, les informations secondaires et les distractions. Dire ce qu'un novice comprend ou ne comprend pas, avec observation concrète.
4. **Utilisabilité** : pour chaque parcours numéroter les étapes et demander : où toucher, que se passe-t-il, comment revenir, que faire en erreur/refus/absence de données, peut-on annuler une action risquée ? Repérer les gestes cachés et fonctions en doublon. Les tâches critiques doivent rester découvrables sans geste secret.
5. **Hiérarchie visuelle** : évaluer ordre de lecture, poids du titre, densité, contraste, espaces, regroupement, longueur des libellés, comportement sous clavier et police à 200 %. Comparer uniquement ce qui a été observé.
6. **Cohérence** : confronter les composants et rôles sémantiques du thème, les boutons et les retours d'état aux autres écrans, thèmes, langues et modes clair/sombre. Ne jamais « corriger » une palette approuvée pour suivre une mode.
7. **Accessibilité** : mesurer les couples texte/fond réellement utilisés si les valeurs sont disponibles ; indiquer explicitement si c'est un calcul de tokens seulement. Examiner cibles tactiles, navigation TalkBack, descriptions, focus, taille de texte, alternatives aux couleurs ; les résultats supposés restent « à tester ».
8. **Vérité fonctionnelle et sécurité** : les mots et pictogrammes doivent exprimer exactement les preuves métier (envoyé ≠ livré ≠ lu, coffre local ≠ base entière chiffrée). Les incidents de confidentialité ou coûts involontaires remontent au module technique/sécurité. Ne pas effacer un avertissement pour simplifier l'écran.
9. **Contradiction** : expliciter au moins une force constatée, la friction principale, ses alternatives et le compromis ; distinguer défaut reproductible, risque étayé et préférence esthétique.
10. **Priorisation** : classer BLOQUANT / IMPORTANT / OPTIONNEL selon Fixit. Pour chaque constat fournir : écran/étape, preuve ou code source, utilisateur lésé, cause probable, correction minimale sans changement d'identité, scénario et preuve attendue après correction.
11. **Réinspection** : après modifications autorisées seulement, rejouer les mêmes étapes, tailles, thèmes et paramètres. Ne pas annoncer VALIDÉ si l'appareil/rendu requis manque.

## Contrôles supplémentaires, sur activation pertinente

- **Mobile Afrique centrale / SMS** : réseau intermittent, double SIM, libellés d'opérateurs longs, Android bas/milieu de gamme, coût `segments × destinataires`, distinction envoi/livraison, clavier compact, français simple. Ce sont des scénarios à tester, pas des stéréotypes.
- **Vie privée** : OTP visibles en listes/notifications, coffre accessible autrement que par geste invisible, droit au refus des permissions, non-divulgation d'un message dans les captures et journaux.
- **Parcours longs** : première utilisation, recherche, réponse, nouveau message, automatisations, erreur, sortie et retour ; pas de validation par un seul écran d'accueil.

## Sortie attendue

`Version / Source visuelle ou absence / Étapes / Ce qui fonctionne / Constats et preuves / Risques d'accessibilité / Plan P0-P1-P2 / Tests à réaliser / Verdict Fixit`.

Ne jamais annoncer une conformité WCAG complète à partir de tokens, ni une validation Android à partir de la maquette web. Ne pas ajouter de fonctionnalité spéculative, copier le code d'une app tierce ou changer un choix produit figé sans arbitrage.
