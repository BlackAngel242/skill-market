"""Contrats statiques de Fixit 2.0 : routage, preuves, catalogue et miroir plugin."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL = ROOT / "skills" / "fixit"
PLUGIN = ROOT / "plugins" / "drsmoke-quality" / "skills" / "fixit"

MODULES = {
    "revue-visuelle.md": ["téléphone", "ordinateur", "vérification visuelle non effectuée", "réinspect"],
    "revue-technique.md": ["non testé", "secrets", "tests", "autorisation"],
    "revue-contenu.md": ["source", "public", "contrôle éditorial uniquement"],
    "revue-equipe.md": ["deux à quatre", "perspectives simulées", "bloquant"],
    "verification-gate.md": ["REJETÉ", "À CORRIGER", "VALIDÉ SOUS RÉSERVE", "VALIDÉ", "version", "preuve"],
    "memoire-apprentissage.md": ["CONFIRMÉ", "À VALIDER", "REMPLACÉ", "source", "portée"],
}

class FixitModularContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.core = (SKILL / "SKILL.md").read_text(encoding="utf-8")
        cls.meta = json.loads((SKILL / "skill.json").read_text(encoding="utf-8"))
        cls.index = json.loads((ROOT / "index.json").read_text(encoding="utf-8"))

    def test_core_metadata_and_catalogue(self):
        self.assertTrue(self.core.startswith("---\nname: fixit\n"))
        self.assertEqual(self.meta["name"], "fixit")
        self.assertEqual(self.meta["version"], "2.0.0")
        index_fixit = next(s for s in self.index["skills"] if s["name"] == "fixit")
        self.assertEqual(index_fixit["version"], self.meta["version"])
        self.assertEqual(index_fixit["description"], self.meta["description"])

    def test_modules_present_referenced_and_meaningful(self):
        for filename, required in MODULES.items():
            with self.subTest(filename=filename):
                path = SKILL / "references" / filename
                self.assertTrue(path.is_file(), f"Missing module {path}")
                self.assertIn("references/" + filename, self.core)
                content = path.read_text(encoding="utf-8").lower()
                for term in required:
                    self.assertIn(term.lower(), content)
        self.assertIn("references/references-visuelles.md", self.core)

    def test_router_selectivity_and_permission_gates(self):
        for label in ("Image", "Code", "Texte", "Mission multidomaine"):
            with self.subTest(label=label):
                self.assertIn(label, self.core)
        for term in ("uniquement", "autorisé", "réinspect", "pas tous les outils", "non testé"):
            with self.subTest(term=term):
                self.assertIn(term, self.core)
        gate = (SKILL / "references" / "verification-gate.md").read_text(encoding="utf-8")
        self.assertIn("preuve indispensable manquante", gate)
        self.assertIn("Si aucun artefact n'a été inspecté", gate)

    def test_distribution_mirror_byte_for_byte(self):
        src = {p.relative_to(SKILL): p.read_bytes() for p in SKILL.rglob("*") if p.is_file()}
        dst = {p.relative_to(PLUGIN): p.read_bytes() for p in PLUGIN.rglob("*") if p.is_file()}
        self.assertEqual(src, dst)
        self.assertGreaterEqual(len(src), 9)  # skill + json + 7 references

    def test_installer_and_packager_copy_entire_skill(self):
        local = (ROOT / "scripts" / "install-skills.mjs").read_text(encoding="utf-8")
        zip_script = (ROOT / "scripts" / "build-chatgpt.py").read_text(encoding="utf-8")
        self.assertIn("await cp(p.source, temp", local)
        self.assertIn("folder.rglob", zip_script)
        self.assertIn("mirror", zip_script)

if __name__ == "__main__":
    unittest.main()
