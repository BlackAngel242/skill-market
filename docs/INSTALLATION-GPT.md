# Fixit et PRD Table Ronde : installation GPT et Codex

Les skills canoniques de Skill Market sont `skills/fixit` (v2.0.0) et `skills/prd-table-ronde` (v2.2.0). Fixit conserve ses références visuelles et ajoute des modules spécialisés à charger selon le besoin. Les fichiers complémentaires de chaque skill sont inclus dans les archives sans fusion des deux skills.

## Installation sur ordinateur

Télécharger ou cloner le dépôt complet. Sur Windows, double-cliquer sur `Installer Skill Market.bat`, choisir le client et suivre le dialogue. L'installation ne transmet pas de clé API.

Node.js 22 ou plus est requis pour les clients locaux. Sous Windows, l'assistant peut proposer de l'installer via winget, uniquement après confirmation. Sur Linux ou macOS, utiliser `bash scripts/install-linux-macos.sh` (Node 22+ doit être déjà installé).

Exemples pour les utilisateurs avancés :

```bash
node scripts/install-skills.mjs --tool codex
node scripts/install-skills.mjs --tool codex --skill fixit
node scripts/install-skills.mjs --tool codex --skill prd-table-ronde
node scripts/install-skills.mjs --tool claude
node scripts/install-skills.mjs --tool cursor --scope project
node scripts/install-skills.mjs --tool codex --dry-run
```

Par défaut, les skills sont copiés dans le répertoire personnel du client. `--scope project` limite à un projet. `--dir <dossier>` personnalise la destination. Si un skill existe déjà avec un contenu différent, l'installation est refusée sans `--replace` ; ce dernier sauvegarde l'ancienne version dans un dossier frère `.skillmarket-backups/`, hors des répertoires de découverte des skills.

## Import dans ChatGPT

Aucun script lancé sur l'ordinateur ne peut installer silencieusement une compétence dans le compte ChatGPT. Pour générer les archives contenant les deux skills d'origine et leurs références :

```bash
python scripts/build-chatgpt.py
```

Fichiers générés dans `dist/` : `Fixit-ChatGPT.zip`, `TableRonde-ChatGPT.zip`, `SkillMarket-GPT-Plugin.zip`. Les artefacts sont également construits par la CI sur les pull requests.

Dans un compte éligible, ouvrir **Plugins > Compétences > Créer > Importer depuis votre ordinateur** et importer l'une des deux archives de compétence. La plateforme contrôle l'import et les droits éventuels de l'espace de travail.

## Marketplace de plugins locale

Le dépôt contient `.agents/plugins/marketplace.json` et `plugins/drsmoke-quality/plugin.json` pour une distribution en plugin portable. Le dossier `plugins/drsmoke-quality/skills/` reprend exactement les deux skills originaux (y compris leurs références). Ne pas éditer ces miroirs indépendamment.

Pour ajouter cette source dans un client compatible :

```bash
codex plugin marketplace add BlackAngel242/skill-market
```

Puis installer le plugin **Fixit + Table Ronde** dans le répertoire des plugins du client. Il n'apparaît pas automatiquement dans la bibliothèque publique de ChatGPT.

## Vérifications

```bash
node --test tests/installer-gpt.test.mjs
python -m unittest discover -s tests -p 'test_gpt_packaging.py'
python scripts/build-chatgpt.py --check
```

Les tests vérifient la prévisualisation, les conflits, les sauvegardes, la copie complète des références et les archives générées. Ils ne constituent pas un test d'import dans un compte ChatGPT.

Documentation : [Skills ChatGPT](https://help.openai.com/fr-fr/articles/20001066-skills-in-chatgpt) ; [Packaging de plugins OpenAI](https://developers.openai.com/plugins/build/plugins).
