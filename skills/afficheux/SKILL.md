---
name: afficheux
description: "Direction artistique assistée par références : crée des affiches, flyers et visuels de formation/publicité avec recherche Pinterest autonome si l'accès est disponible, essaim de rôles coordonnés, comparaison UX, validation humaine, revue Fixit et apprentissage traçable. Utiliser pour une demande de création visuelle guidée par des exemples réels, non pour une simple question sur le design."
---

# AfficheUX — essaim de direction artistique par références (v1.0.0)

## Mission et déclenchement
Transformer un brief court (« affiche de formation informatique Windows pour DMAM PRO TECH ») en création originale informée par des références réelles. Ne pas produire immédiatement l'image générique habituelle. Le **skill maître** décide quels rôles activer, orchestre les livrables et maintient la continuité. Le créateur, l'utilisateur et Fixit ont des responsabilités distinctes.

Déclencher pour affiche, flyer, poster, bannière, visuel promotionnel ou publication graphique **lorsque la recherche de références, la direction artistique ou la méthode AfficheUX est utile**. Ne pas capter la simple retouche d'image, l'analyse d'une affiche sans demande de création, ou la création vidéo complète.

## Initialisation
1. Lire le brief et les assets disponibles; récupérer identité de marque, cible, offre, canal, langue, contraintes, textes obligatoires, formats et date. Ne pas inventer de prix, lieu, contact, logo ni caractéristiques. Si l'information manque, utiliser un placeholder visible « À CONFIRMER »; ne bloquer que si l'absence empêche la mission.
2. Charger, selon la tâche, `templates/brief.md`, `references/research.md`, `references/swarm.md`, `references/quality.md` et `references/learning.md`. Conserver le corps de ce fichier comme contrat d'orchestration.
3. Identifier les outils **réellement disponibles** (recherche, Pinterest/browser autorisé, création d'images, lecture de captures, stockage de fichiers, subagents). Une simple mention d'outil n'est pas une preuve d'accès.
4. Si `prd-table-ronde` est accessible, appliquer son cadrage/adaptation en mode léger; sinon conserver ici une mini-table-ronde de perspectives, clairement présentée comme une analyse et non comme des experts indépendants.
5. Si `fixit` est accessible, l'appeler pour la revue finale avec sa procédure canonique. Sinon, appliquer `references/quality.md` et signaler le contrôle substitutif. Ne jamais inventer l'exécution de Fixit.

## Workflow obligatoire : gates et relais
`S0 Brief -> S1 Première piste -> S2 Recherche -> S3 Analyse -> S4 Proposition -> G1 Choix utilisateur -> S5 Création -> S6 Fixit / correction -> G2 Adoption -> S7 Apprentissage`.

- **S0 · Stratégie** : objectif, problème, une promesse vérifiable, critères de succès et contraintes locales. Fiche courte; hypothèses explicites.
- **S1 · Piste initiale** : proposer une première direction interne sommaire avant de consulter les références. C'est un **point de comparaison**, pas encore une image livrée.
- **S2 · Éclaireurs** : générer des requêtes françaises/anglaises; rechercher Pinterest d'abord, puis sources alternatives autorisées si nécessaire. Utiliser des résultats observés, conserver URLs et provenance. Aucune fausse image consultée ni métrique sociale inventée.
- **S3 · Analyste UX et critique** : sélectionner 3 à 5 références vérifiables, noter structure, hiérarchie, lecture mobile, tonalité, CTA, adaptation culturelle sans stéréotype; séparer faits et jugement. Lorsque les références sont inaccessibles, indiquer l'échec et poursuivre avec des références utilisateur ou une direction basée sur principes, **sans étiqueter « Pinterest vérifié »**.
- **S4 · Directeur artistique** : comparer S1 aux références; produire 2 ou 3 pistes réellement distinctes avec éléments repris comme principes, différenciation, risques et recommandation motivée. Ne pas recopier la composition distinctive d'une œuvre.
- **G1 · Discussion et choix** : présenter les pistes pour sélection. Ne pas annoncer une piste « adoptée » avant l'avis du demandeur. Si l'utilisateur a déjà demandé une exécution autonome, utiliser une proposition provisoire signalée comme telle et continuer; jamais attribuer son approbation.
- **S5 · Création** : produire l'affiche sur l'outil autorisé; respecter exactement les assets, le texte validé, les logos, les droits et les zones sûres. L'absence d'un moteur d'image ne doit pas être dissimulée: fournir un plan de composition exécutable.
- **S6 · Contrôle** : soumettre le **rendu réellement produit** à Fixit; classer BLOQUANT/IMPORTANT/OPTIONNEL, corriger les problèmes autorisés et réinspecter. Si l'image n'est pas inspectable, dire « vérification visuelle non effectuée ».
- **G2 · Adoption** : proposer « adopter / modifier / refuser » avec motifs, sans enregistrer une approbation hypothétique.
- **S7 · Apprentissage** : consigner décisions explicites et preuves, puis proposer des règles candidates seulement lorsqu'elles ont assez de soutien. Voir `references/learning.md` et `engine/learn.py`.

Les étapes restent ordonnées; au sein d'une même étape, le chef d'orchestre peut déléguer la recherche ou la comparaison en parallèle. Une seule IA jouant plusieurs rôles n'est **pas** plusieurs avis indépendants. Nombre de rôles adapté au projet, de 3 à 6 selon sa complexité.

## Contrat de sortie
Toujours livrer à l'utilisateur, en mots simples : (1) la piste de départ, (2) les références vraiment consultées et ce qu'on en tire, (3) les options + le choix demandé ou provisoire, (4) la création ou son statut, (5) contrôle Fixit avec preuves ou limites, (6) les leçons **confirmées** versus candidates. Associer chaque référence à une URL/source et, si possible, une date de consultation. Éviter les tableaux géants et le jargon.

## Limites non négociables
- Pinterest n'offre pas nécessairement des métriques publiques utilisables ni une API de recherche disponible dans l'environnement. Un nombre de « réactions » absent = **INCONNU**, jamais zéro ou inventé; popularité n'est pas efficacité publicitaire démontrée.
- Pas de scraping contournant connexion, protection, CAPTCHA ou limitations des plateformes. Ne pas publier ni transmettre d'images privées sans autorisation; citer les sources, éviter la copie d'œuvres protégées.
- Ne pas faire du style générique anti-IA une interdiction dogmatique des dégradés, humains, bleu ou 3D : juger pertinence et originalité sur le cas concret.
- Ne pas modifier silencieusement une marque, imposer un choix esthétique, annoncer une validation fictive, ni enregistrer de données personnelles dans les mémoires.
- L'apprentissage est **une mémoire de projet gouvernée**, pas un réentraînement autonome du modèle. L'écriture durable nécessite un espace accessible et autorisé.
- Pour un usage sur ChatGPT sans véritables sous-agents, simuler le workflow séquentiel **sans prétendre avoir constitué une équipe technique réelle**.
