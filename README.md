# skill-market

Marketplace de skills pour agents IA. Un catalogue hébergé sur GitHub, un CLI qui installe en global, détecte les outils présents sur la machine et gère les mises à jour.

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
market info impeccable   # fiche détaillée
market install impeccable        # installe en global, détecte/installe les outils requis
market install impeccable -y     # sans demander confirmation
market upgrade impeccable        # met à jour un skill
market update                    # met à jour tout ce qui est installé
market installed                 # ce qui est installé localement
market remove impeccable         # désinstalle
```

Les skills s'installent dans `~/.skill-market/skills/<nom>` (variable `MARKET_HOME` pour changer).

## Détection d'outils

Chaque skill déclare ses prérequis dans `skill.json` :

```json
{
  "name": "impeccable",
  "version": "1.0.0",
  "requires": {
    "bins": ["node", "npm"],
    "npm": ["impeccable"],
    "pip": []
  }
}
```

À l'installation, le CLI vérifie chaque entrée :
- `bins` : le binaire doit exister sur la machine, sinon l'installation s'arrête avec un message clair.
- `npm` / `pip` : si le paquet manque, le CLI propose de l'installer (avec `-y`, il le fait sans demander).

## Publier un skill

1. Crée `skills/<nom>/` avec au minimum `SKILL.md` (la doc du skill) et `skill.json` (nom, version, description, `requires`).
2. Ajoute une entrée dans `index.json` (nom, version, description, chemin, auteur).
3. Ouvre une pull request. Une fois mergée, `market list` et `market update` voient le skill.

## Catalogue actuel

| Skill | Version | Description |
|---|---|---|
| `impeccable` | 1.0.0 | Détecte et corrige l'AI slop dans les interfaces : scan HTML/CSS et playbooks de design. |
| `prd-table-ronde` | 2.2.0 | Transforme une idée en PRD cadrée via une table ronde d'experts dimensionnée. |
