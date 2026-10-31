#!/usr/bin/env python3
"""Archive les skills canoniques de Skill Market pour ChatGPT/Plugins sans réseau."""
from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

SKILLS = ("fixit", "prd-table-ronde")
OUTPUTS = {"fixit": "Fixit-ChatGPT.zip", "prd-table-ronde": "TableRonde-ChatGPT.zip"}
PLUGIN = "drsmoke-quality"
DENIED = {".env", ".env.local", ".env.production", ".git", "__pycache__", ".DS_Store"}
LIMIT = 5 * 1024 * 1024

def content(folder):
    if not folder.is_dir() or folder.is_symlink():
        raise ValueError(f"Dossier absent ou non sûr : {folder}")
    entries = []
    total = 0
    for path in sorted(folder.rglob("*")):
        rel = path.relative_to(folder)
        if any(part in DENIED or part.startswith(".env.") for part in rel.parts):
            raise ValueError(f"Fichier sensible ou temporaire : {path}")
        if path.is_symlink():
            raise ValueError(f"Lien symbolique refusé : {path}")
        if path.is_file():
            data = path.read_bytes()
            total += len(data)
            if total > LIMIT:
                raise ValueError(f"Skill trop volumineux : {folder}")
            entries.append((rel.as_posix(), data))
        elif not path.is_dir():
            raise ValueError(f"Entrée inconnue : {path}")
    if "SKILL.md" not in dict(entries):
        raise ValueError(f"SKILL.md manquant : {folder}")
    return entries

def validate_skill(root, skill):
    entries = content(root / "skills" / skill)
    markdown = dict(entries)["SKILL.md"].decode("utf-8-sig")
    if not markdown.startswith("---\nname: " + skill + "\n"):
        raise ValueError(f"Frontmatter du skill invalide : {skill}")
    manifest = json.loads(dict(entries)["skill.json"].decode("utf-8"))
    if manifest.get("name") != skill:
        raise ValueError(f"skill.json incohérent : {skill}")
    return entries

def write_zip(path, entries):
    path.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(path, "w", compression=ZIP_DEFLATED) as archive:
        for name, data in sorted(entries):
            info = ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, data)
    print("Créé : " + str(path))

def build(root, check=False):
    skills = {name: validate_skill(root, name) for name in SKILLS}
    plugin_dir = root / "plugins" / PLUGIN
    manifest = json.loads((plugin_dir / "plugin.json").read_text(encoding="utf-8"))
    if manifest.get("name") != PLUGIN:
        raise ValueError("Manifeste du plugin incorrect")
    for name, entries in skills.items():
        mirror = plugin_dir / "skills" / name
        if dict(content(mirror)) != dict(entries):
            raise ValueError(f"Miroir de {name} désynchronisé : conserver les sources exactes")
    if check:
        print("Miroirs et manifestes conformes aux sources.")
        return
    dist = root / "dist"
    for name, entries in skills.items():
        write_zip(dist / OUTPUTS[name], [(name + "/" + path, data) for path, data in entries])
    combined = [(PLUGIN + "/plugin.json", (plugin_dir / "plugin.json").read_bytes())]
    for name, entries in skills.items():
        combined.extend((PLUGIN + "/skills/" + name + "/" + path, data) for path, data in entries)
    write_zip(dist / "SkillMarket-GPT-Plugin.zip", combined)

def main():
    parser = argparse.ArgumentParser(description="Préparer les ZIP des skills pour GPT")
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parent.parent)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        build(args.repo_root.resolve(), check=args.check)
    except (ValueError, FileNotFoundError, json.JSONDecodeError) as error:
        print("Erreur : " + str(error), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
