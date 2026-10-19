---
name: motion-web
description: "Anime une interface web à partir d'une phrase : boutons, cartes, transitions de pages. Code CSS/JS propre et performant."
---

# Motion-Web : une phrase, une interface qui bouge

Concepts issus de la vidéo « 8 outils motion design » de Simon De Lima (oct. 2026). Skill rédigé de zéro, sans reprise de son contenu.

Décrit en langage naturel l'animation voulue, obtient le plan puis le code CSS/JS correspondant.

## Procédure

1. **Comprendre la phrase.** Identifier : les éléments concernés (boutons, cartes, menus, transitions de page), le déclencheur (survol, clic, scroll, chargement), l'effet voulu.
2. **Plan d'animation.** Pour chaque élément : propriété animée (transform, opacity — jamais width/height/margin pour la performance), durée (0,2-0,4 s pour les micro-interactions, 0,5-0,8 s pour les transitions de page), easing (ease-out en entrée).
3. **Accessibilité.** Respecter `prefers-reduced-motion` : proposer une version sans animation. Ne jamais animer ce qui porte une information critique de façon à la rendre illisible.
4. **Code.** Produire le CSS (transitions/animations, keyframes si besoin) et le JS minimal pour les déclencheurs. Préférer les classes CSS aux styles inline, et `transform`/`opacity` pour rester à 60 fps.
5. **Vérifier.** La page reste utilisable sans l'animation (progressive enhancement) ; aucun élément ne saute au chargement.

## Familles d'effets courants

- Boutons : soulèvement + ombre au survol, ripple au clic.
- Cartes : lift au survol, apparition en cascade au scroll (stagger).
- Transitions de page : fondu + léger déplacement vertical.
- Chargement : skeleton screens plutôt que spinners.
- Feedback : micro-vibration (shake) sur erreur, check animé sur succès.
