# Apprentissage concret : mémoriser sans s'enfermer

Ne jamais confondre modèle IA réentraîné et historique des décisions. AfficheUX ne modifie pas ses poids ; il construit une mémoire portable utilisable lors des sessions futures.

## Données et portée
- Stockage **à l'extérieur du dossier installé du skill**, dans un workspace choisi par l'utilisateur. Sinon, remettre un journal en texte sans prétendre qu'il persiste.
- Seuls les retours effectivement exprimés peuvent être enregistrés comme utilisateur, et seulement dans un lieu autorisé. Séparer « APPROUVÉ », « REFUSÉ », « CORRECTION » et « HYPOTHÈSE AGENT ».
- Une décision porte date, projet, scope (marque/canal/campagne), aspect, décision, motif et source. Ne stocker ni coordonnées privées, ni captures sensibles, ni tokens.
- Enregistrer les références avec URL et attribution; ne pas aspirer des images Pinterest dans la mémoire.
- Les règles préexistantes et directives courantes prévalent sur les règles apprises, les règles globales sont plus faibles que les règles du projet.

## Boucle proposée (réversible)
1. `python engine/learn.py init --workspace <dossier>` (uniquement sur un emplacement autorisé).
2. `python engine/learn.py record --workspace <dossier> --project "formation-windows" --scope "DMAM-PRO-TECH:WhatsApp" --signal approved --aspect "cta" --decision "CTA en pied très contrasté" --reason "lecture mobile validée"`. Enregistrer **sur retour réel**, pas après simulation.
3. `python engine/learn.py candidates --workspace <dossier>` : proposer une règle après **au moins deux confirmations cohérentes**, aucune réfutation pour la même portée/aspect/décision.
4. `python engine/learn.py adopt --workspace <dossier> --scope "..." --aspect "..." --decision "..." --confirm` seulement après validation de la règle par l'utilisateur. Le fichier de politique est versionnable, consultable et révocable via `python engine/learn.py revoke --workspace <dossier> --scope ... --aspect ... --decision ... --confirm`, après accord explicite.
5. À chaque projet, confronter ces règles à l'objectif réel. Si une règle est devenue inadaptée, documenter une exception et proposer sa révocation. Ne pas empiler les règles inutiles.

Le moteur est optionnel : s'il n'est pas exécutable (par exemple ChatGPT sans accès aux fichiers du workspace), rendre le JSON de feedback pour import futur. Ce n'est pas un service hébergé ni une synchronisation automatique entre comptes.

## Auto Tuner des compétences
À la révision du skill, rejouer les cas `evals/cases.json` : déclenchement correct, accès Pinterest absent, statistiques inconnues, absence de logo, choix utilisateur, mémoire, droits et audit. Comparer les écarts aux résultats de la version précédente, changer une règle à la fois, réexécuter les tests de non-régression. Pour une vraie comparaison de qualité visuelle, nécessiter rendus et jugement humain : aucun autotuning textuel ne remplace les yeux.
