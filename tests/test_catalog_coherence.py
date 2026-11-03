"""Cohérence du catalogue : index.json, skill.json, frontmatter de SKILL.md et nom de dossier."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEMVER = re.compile(r"^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$")
SAFE_NAME = re.compile(r"^[a-z0-9][a-z0-9-]*$")


def frontmatter_name(skill_md):
    text = skill_md.read_text(encoding="utf-8-sig").replace("\r\n", "\n")
    match = re.match(r"---\n(.*?)\n---\n", text, re.S)
    if not match:
        return None
    found = re.search(r"^name:\s*(\S+)\s*$", match.group(1), re.M)
    return found.group(1) if found else None


class CatalogCoherenceTest(unittest.TestCase):
    def setUp(self):
        self.index = json.loads((ROOT / "index.json").read_text(encoding="utf-8"))["skills"]

    def test_names_are_unique_and_safe(self):
        names = [entry["name"] for entry in self.index]
        self.assertEqual(len(names), len(set(names)), "nom en double dans index.json")
        for name in names:
            self.assertRegex(name, SAFE_NAME)

    def test_each_entry_matches_its_folder(self):
        for entry in self.index:
            name = entry["name"]
            with self.subTest(skill=name):
                self.assertEqual(entry["path"], f"skills/{name}")
                folder = ROOT / entry["path"]
                manifest = json.loads((folder / "skill.json").read_text(encoding="utf-8"))
                self.assertEqual(manifest["name"], name)
                self.assertEqual(manifest["version"], entry["version"])
                self.assertRegex(entry["version"], SEMVER)
                self.assertEqual(frontmatter_name(folder / "SKILL.md"), name)

    def test_every_skill_folder_is_indexed(self):
        indexed = {entry["name"] for entry in self.index}
        folders = {p.parent.name for p in (ROOT / "skills").glob("*/skill.json")}
        self.assertEqual(folders - indexed, set(), "dossier de skill absent de index.json")


if __name__ == "__main__":
    unittest.main()
