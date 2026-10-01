# skill-market

Marketplace de skills pour agents IA. Un catalogue hébergé sur GitHub, un CLI qui installe en global, détecte les outils présents sur la machine et gère les mises à jour.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-3-blue.svg)](#catalogue)
[![Platform](https://img.shields.io/badge/platform-linux%20%7C%20macos-lightgrey.svg)](#installer-le-cli)

## Comment ça marche

```mermaid
flowchart LR
    U([Utilisateur]) --> CLI["CLI <b>market</b>"]
    CLI --> CAT[("Catalogue<br/><b>index.json</b> sur GitHub")]
    CLI --> DET{"Détection d'outils<br/>(bins / npm / pip)"}
    DET -->|"tous présents"| INST["<b>~/.skill-market/skills/</b><br/>installation globale"]
    DET -->|"outil manquant"| STOP(["installation stoppée<br/>message clair"])
    INST --> UP["<b>market update</b><br/>mises à jour par version"]
```

## Installer le CLI

```bash
curl -sSL https://raw.githubusercontent.com/BlackAngel242/skill-market/main/cli/market -o ~/.local/bin/market
chmod +x ~/.local/bin/market
```

Prérequis : `curl`, `python3`, `git` (recommandé). `~/.local/bin` doit être dans ton `PATH`.

## Utilisation

```bash
market list              # catalogue distant
market search design     # recherche
market info uxfix        # fiche détaillée
market install uxfix             # installe en global, détecte/installe les outils requis
market install uxfix -y          # sans demander confirmation
market upgrade uxfix             # met à jour un skill
market update                    # met à jour tout ce qui est installé
market installed                 # ce qui est installé localement
market remove uxfix              # désinstalle
```

Les skills s'installent dans `~/.skill-market/skills/<nom>` (variable `MARKET_HOME` pour changer).

## Détection d'outils

Chaque skill déclare ses prérequis dans `skill.json` :

```json
{
  "name": "uxfix",
  "version": "1.0.0",
  "requires": {
    "bins": ["node"],
    "npm": ["impeccable"],
    "pip": []
  }
}
```

À l'installation, le CLI vérifie chaque entrée :

| Clé | Comportement |
|---|---|
| `bins` | le binaire doit exister sur la machine, sinon l'installation s'arrête avec un message clair |
| `npm` / `pip` | si le paquet manque, le CLI propose de l'installer (avec `-y`, il le fait sans demander) |

## Catalogue

| Skill | Version | Description |
|---|---|---|
| `uxfix` | ![1.0.0](https://img.shields.io/badge/v1.0.0-blue) | Corrige seul les défauts UI : boucle détecter → corriger → revérifier jusqu'à 99/100 (contrastes, halos, easings, palettes, copy). |
| `prd-table-ronde` | ![2.2.0](https://img.shields.io/badge/v2.2.0-blue) | Transforme une idée en PRD cadrée via une table ronde d'experts dimensionnée. |
| `smokekit-ai-workflow-orchestration` | ![4.0.0](https://img.shields.io/badge/v4.0.0-blue) | Orchestration multi-IA auto-évolutive : 20 agents SDLC, router réel avec détection d'outils, boucle d'apprentissage qui ajuste le routing selon tes corrections. |

## Publier un skill

```mermaid
flowchart TD
    A["<b>skills/&lt;nom&gt;/</b><br/>SKILL.md + skill.json"] --> B["entrée dans <b>index.json</b>"]
    B --> C["Pull request"]
    C --> D["Merge sur <b>main</b>"]
    D --> E["<b>market list</b> / <b>market update</b><br/>voient le skill"]
    E --> F["<b>market install</b>"]
    F --> G["<b>market upgrade</b>"]
```

1. Crée `skills/<nom>/` avec au minimum `SKILL.md` (la doc du skill) et `skill.json` (nom, version, description, `requires`).
2. Ajoute une entrée dans `index.json` (nom, version, description, chemin, auteur).
3. Ouvre une pull request. Une fois mergée, `market list` et `market update` voient le skill.

## Licence

MIT. Voir [LICENSE](LICENSE).
