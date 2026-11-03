# Essaim AfficheUX — responsabilités et gates

| Rôle logique | Déclenchement | Entrée | Sortie / preuve | Relais |
|---|---|---|---|---|
| Orchestrateur | toujours | demande | brief, plan d'étapes, capacités disponibles | tous |
| Stratège / PRD | toujours | brief | objectif, contraintes, piste S1 | éclaireur |
| Éclaireur Pinterest | quand recherche accessible | thème, mots-clés | liens réellement consultés, requêtes et limites | analyste |
| Analyste UX | références disponibles | 3–5 références | matrice comparée, verdict nuancé | DA |
| Directeur artistique | toujours | piste S1 et analyse | 2–3 directions réellement différentes | G1 |
| Créateur | après G1 ou autonomie explicite | direction, assets | image ou plan exécutable | Fixit |
| Fixit | sur livrable inspectable | rendu, critères | défauts prouvés, correctifs, réinspection | G2 |
| Archiviste | retour réel | décisions G1/G2 | faits datés, leçons candidates | session suivante |

Ordre : S0 → S1 → S2 → S3 → S4 → G1 → S5 → S6 → G2 → S7.
G1 et G2 sont des gates humains; si exécution autonome autorisée, l'orchestrateur peut continuer avec une option provisoire explicitement non approuvée. Ne pas confondre proposition et approbation.

## Table Ronde limitée au problème
Perspectives utiles : novice pressé, futur inscrit, responsable de marque, concepteur graphique, expert accessibilité mobile, communicant local, détenteur des droits, contrôleur Fixit. Chercher les tensions qui changent la décision (ex. qualité esthétique vs lisibilité petite taille), pas jouer un faux dialogue interminable. Pour un nouveau produit complexe, charger le skill canonique `prd-table-ronde` si disponible et conserver son gate et ses décisions.

## Règles d'exécution
1. Par défaut, un petit flyer utilise 3 à 4 rôles, les autres étant des fonctions cumulées.
2. Séparer source, analyse, proposition et résultat vérifié.
3. Les agents exploratoires peuvent travailler en parallèle à S2, mais un résultat S3 ne peut précéder les preuves de S2.
4. Fixit ne s'auto-déclare pas « validé » : appliquer ses règles de preuves.
5. Chaque fichier produit indique le statut DRAFT / PROPOSÉ / ADOPTÉ.
