# AfficheUX v1.0.0 — dossier de revue et adoption

## Table Ronde (regards analytiques, pas des agents indépendants)
- Utilisateur non-technicien : fiche courte et réponse en langage simple; pas de jargon et pas de recherche à remplir manuellement.
- Éclaireur : Pinterest en priorité, sources alternatives, liens et traces d'accès.
- UX : esthétique ≠ conversion prouvée; score visuel présenté comme jugement.
- Direction artistique : transformer des principes et non recopier une œuvre.
- Juridique / marque : droits, logo exact, aucun contact inventé.
- Fixit : inspecter le résultat réel, signaler ce qui reste non vérifié.
- Archiviste : preuve et consentement avant mémoire, règles révocables.
- Ingénieur skill : livrable portable, pas de dépendances obligatoires.

### Tensions et décisions
1. « Recherche autonome » vs « Pinterest inaccessible » → mode dégradé honnête avec indicateur de source non vérifiée.
2. « Réactions populaires » vs « performances réelles » → métriques seulement si visibles et sourcées; jamais inférer des conversions.
3. « Tout automatiser » vs « appropriation par l'utilisateur » → G1 et G2 humains; autonomie provisoire permise si demandée.
4. « Essaim » vs « plateforme mono-agent » → rôles logiques séquentiels sans sur-promesse.
5. « Apprentissage continu » vs « surapprentissage de goûts ponctuels » → 2 confirmations + adoption explicite, portée limitée.

Verdict conceptuel : **GO sur un MVP skill portable**; accès natif Pinterest, création visuelle et apprentissage inter-apps **conditionnels aux outils réellement connectés**.

## Auto Tuner — protocole reproductible
- Ensemble de 10 situations dans `skills/afficheux/evals/cases.json`, positives, négatives et limites d'accès.
- Tester manuellement avec et sans skill sur une plateforme qui permet des sessions indépendantes; noter l'usage effectif du skill, l'exactitude des références, la qualité du choix, les informations fabriquées, le coût et la qualité du visuel.
- Ajuster la description si faux déclenchement; ajuster les phases si saut de gate; ne jamais optimiser un score au détriment de l'originalité ou de la fiabilité.
- Les tests Python vérifient **la structure et le moteur de mémoire**, pas la réussite des recherches Pinterest ni la qualité graphique.
- **Non exécutés dans cette revue** : tests sur un compte Pinterest réel, vraie comparaison A/B de deux images et import ChatGPT de l'archive. À effectuer avant verdict production.

## Skill Creator — recommandations retenues
Skill concis, frontmatter explicite, ressources à chargement progressif, cas d'évaluation, non-déclenchements, itération mesurée; pas de copie automatique d'un skill externe dans le dépôt.

## Fixit — auto-audit statique initial
- Visuel : non effectué (aucune affiche finale dans la PR).
- Fonctionnel : les tests inclus couvrent les modes d'échec de base, nécessitent exécution CI ou locale pour preuve.
- Sécurité : sans clé API, sans scraping caché, sans écriture à l'insu de l'utilisateur.
- Originalité : références analysées par principes, copier/coller et retrait de filigrane interdits.
- Verdict initial : **VALIDÉ SOUS RÉSERVE pour la conception statique**, pas pour la génération visuelle réelle.

## Adoption / exploitation
Installer depuis Skill Market avec `market install afficheux` après fusion, ou `npx skills add BlackAngel242/skill-market --skill afficheux -g -y`. Sur ChatGPT, l'import effectif d'une archive ZIP reste une action de l'utilisateur et dépend du compte. Le skill ne peut pas être activé silencieusement dans les capacités internes de ChatGPT.

### Exercice terrain d'acceptation
Brief : « Affiche DMAM PRO TECH pour formation Windows débutants, WhatsApp, Congo. Ne pas inventer date, prix et contact. »
Résultats attendus : piste S1, sources Pinterest effectivement consultées ou limite claire, 2–3 directions, choix utilisateur, rendu, vraie revue Fixit, retour enregistré seulement après validation.
