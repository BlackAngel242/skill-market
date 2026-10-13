---
name: secretscan
description: "Détecte les secrets committés : fichiers .env, clés API et tokens en dur dans le code, clés privées. Signale sans jamais afficher les valeurs."
---

# SecretScan : traquer les secrets committés

Adapté des gardes `guard-secrets` et `guard-key-literals` par EricTechPro (super-board, MIT).

Cherche les secrets qui ont fuité dans le dépôt : fichiers d'environnement committés, clés et tokens écrits en dur, clés privées. Ne modifie rien, ne supprime rien : il signale.

## Contrôles

Lancer en parallèle, avec `git grep` et l'historique récent :

1. **Fichiers d'environnement committés** : `.env`, `.env.*` (hors `.env.example`), `credentials.json`, `secrets.yaml`.
2. **Clés et tokens en dur** : motifs connus (`sk-`, `ghp_`, `gho_`, `xoxb-`, `AKIA`, `AIza`, `-----BEGIN PRIVATE KEY-----`, `id_rsa`, `*.pem`), et chaînes à forte entropie assignées à des variables nommées `*key*`, `*token*`, `*secret*`, `*password*`.
3. **Historique récent** : mêmes motifs dans les 30 derniers commits (un secret supprimé du code reste dans l'historique).
4. **Faux positifs connus** : `.env.example`, clés de test documentées comme telles, placeholders (`xxx`, `votre-clé-ici`). Les écarter, en le notant.

## Règle d'or

**Ne jamais afficher une valeur de secret.** Signaler uniquement : fichier, ligne, type de motif. Pas d'extrait, pas de copie dans un rapport, pas de transmission à un service externe.

## Gravité

- **BLOQUANT** : clé API, token ou mot de passe réel committé (en dur ou dans un `.env` suivi). Action requise : révoquer la clé côté fournisseur, purger l'historique.
- **IMPORTANT** : clé privée ou fichier d'environnement committé sans secret avéré à l'intérieur.
- **OPTIONNEL** : motif douteux à vérifier (forte entropie sans contexte).

## Format de sortie

| Fichier:Ligne | Type | Gravité | Action recommandée |
|---|---|---|---|

Terminer par le verdict : n fichiers scannés, n findings, ou « aucun secret détecté ».
