# Contribuer à skill-market

Tu veux publier un skill ? La procédure tient en 4 étapes.

## 1. Structure du skill

Crée un dossier `skills/<nom>/` avec au minimum :

```
skills/<nom>/
  SKILL.md      # avec un frontmatter YAML : name + description
  skill.json    # name, version (X.Y.Z), description, requires (optionnel)
```

Exemple de frontmatter :

```yaml
---
name: mon-skill
description: Ce que fait le skill, en une phrase.
---
```

Exemple de `skill.json` :

```json
{
  "name": "mon-skill",
  "version": "1.0.0",
  "description": "Ce que fait le skill, en une phrase.",
  "requires": { "bins": ["node"], "npm": ["un-paquet"], "pip": [] }
}
```

Règles : le `name` doit être identique dans `SKILL.md`, `skill.json` et le nom du dossier. La version suit semver (`1.2.3`).

## 2. Valide avec `market publish`

```bash
./cli/market publish skills/<nom>
```

La commande vérifie 12 points : frontmatter, JSON valide, cohérence des noms,
version semver, collision de version dans `index.json`, absence de secrets,
taille raisonnable. Elle refuse la publication si un check échoue (exit 1) et
affiche l'entrée `index.json` à ajouter quand tout passe.

## 3. Déclare le skill dans `index.json`

Ajoute l'entrée affichée par `market publish` au tableau `skills` de `index.json`.

## 4. Ouvre une PR

```bash
git checkout -b publish/<nom>
git add skills/<nom> index.json
git commit -m "publish: <nom> <version>"
git push -u origin publish/<nom>
gh pr create --title "publish: <nom> <version>" --body "Validation \`market publish\` : OK"
```

## Mettre à jour un skill existant

Bumpe la version dans `skill.json` (et dans `index.json`), puis `market publish`
vérifiera que la nouvelle version n'est pas déjà publiée.

## Notes

- Pas de secrets ni de clés dans les fichiers du skill. Le scan de `market publish`
  n'est qu'un filet de sécurité, la revue manuelle reste de mise.
- Garde les skills légers (< 5 Mo si possible).
- Teste l'installation en local avant la PR : `MARKET_HOME=/tmp/test ./cli/market install <nom>` ne marche que pour les skills déjà dans `index.json` distant ; en local, vérifie au moins que les outils listés dans `requires` sont détectables.
