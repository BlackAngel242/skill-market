#!/usr/bin/env python3
"""Génère les distributions de tout le catalogue à partir de index.json.

- .claude-plugin/marketplace.json : un plugin Claude Code par skill
  (`/plugin marketplace add BlackAngel242/skill-market`).
- dist/skills/<nom>.zip (avec --zips) : une archive par skill, dossier `<nom>/` à la racine,
  pour l'import manuel dans Claude (desktop, web) ou ChatGPT.

--check vérifie que marketplace.json est à jour, sans rien écrire.
"""
from __future__ import annotations
import argparse
import importlib.util
import json
import sys
from pathlib import Path

MARKETPLACE = "blackangel242-skill-market"
# Claude Code refuse les noms de plugin réservés (préfixe "claude-", etc.) : seul l'identifiant du plugin change.
PLUGIN_NAMES = {"claude-motion": "motion-kit-whaleyxbt"}


def load_packager(root):
    # Réutilise le contrôle de contenu (fichiers sensibles, liens, taille) et l'écriture ZIP déterministe.
    spec = importlib.util.spec_from_file_location("build_chatgpt", root / "scripts" / "build-chatgpt.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def marketplace(root):
    index = json.loads((root / "index.json").read_text(encoding="utf-8"))
    plugins = []
    for entry in index["skills"]:
        manifest = json.loads((root / entry["path"] / "skill.json").read_text(encoding="utf-8"))
        plugin = {
            "name": PLUGIN_NAMES.get(entry["name"], entry["name"]),
            "source": "./" + entry["path"],
            "description": entry["description"] + (f" (skill : {entry['name']})" if entry["name"] in PLUGIN_NAMES else ""),
            "version": entry["version"],
            "author": {"name": entry.get("author", "BlackAngel242")},
        }
        license_ = manifest.get("license") or entry.get("license")
        if license_:
            plugin["license"] = license_
        if entry.get("upstream"):
            plugin["homepage"] = entry["upstream"]
        plugins.append(plugin)
    return {
        "name": MARKETPLACE,
        "description": "Catalogue skill-market : un plugin Claude Code par skill.",
        "owner": {"name": "BlackAngel242", "url": "https://github.com/" + index["repo"]},
        "plugins": plugins,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parent.parent)
    parser.add_argument("--check", action="store_true", help="vérifier marketplace.json sans écrire")
    parser.add_argument("--zips", action="store_true", help="créer aussi dist/skills/<nom>.zip")
    args = parser.parse_args()
    root = args.repo_root.resolve()

    target = root / ".claude-plugin" / "marketplace.json"
    expected = json.dumps(marketplace(root), ensure_ascii=False, indent=2) + "\n"
    current = target.read_text(encoding="utf-8").replace("\r\n", "\n") if target.exists() else ""
    if args.check:
        if current != expected:
            print("Erreur : .claude-plugin/marketplace.json n'est pas à jour ; lance scripts/build-distributions.py", file=sys.stderr)
            return 1
        print("marketplace.json conforme à index.json.")
    else:
        target.parent.mkdir(exist_ok=True)
        target.write_text(expected, encoding="utf-8", newline="\n")
        print("Écrit : " + str(target))

    if args.zips:
        packager = load_packager(root)
        index = json.loads((root / "index.json").read_text(encoding="utf-8"))
        for entry in index["skills"]:
            files = packager.content(root / entry["path"])
            packager.write_zip(root / "dist" / "skills" / f"{entry['name']}.zip",
                               [(f"{entry['name']}/{name}", data) for name, data in files])
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError, KeyError, json.JSONDecodeError) as exc:
        print("Erreur : " + str(exc), file=sys.stderr)
        sys.exit(1)
