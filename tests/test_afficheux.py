"""Non-régression pour le skill et son moteur de mémoire sans réseau."""
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "skills" / "afficheux"
ENGINE = SKILL / "engine" / "learn.py"

class AfficheUXTest(unittest.TestCase):
    def test_manifest_and_frontmatter(self):
        meta = json.loads((SKILL / "skill.json").read_text(encoding="utf-8"))
        doc = (SKILL / "SKILL.md").read_text(encoding="utf-8")
        self.assertEqual(meta["name"], "afficheux")
        self.assertEqual(meta["version"], "1.0.0")
        self.assertTrue(doc.startswith("---\nname: afficheux\n"))
        reg = json.loads((ROOT / "index.json").read_text(encoding="utf-8"))
        entries = [e for e in reg["skills"] if e["name"] == "afficheux"]
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0]["version"], meta["version"])
        self.assertEqual(entries[0]["path"], "skills/afficheux")

    def test_evaluation_cases(self):
        cases = json.loads((SKILL / "evals" / "cases.json").read_text(encoding="utf-8"))
        self.assertGreaterEqual(len(cases), 8)
        self.assertEqual(len({c["id"] for c in cases}), len(cases))
        self.assertTrue(all(c["assertions"] for c in cases))

    def test_learning_approval_and_adoption(self):
        spec = importlib.util.spec_from_file_location("afficheux_learning", ENGINE)
        module = importlib.util.module_from_spec(spec)
        old_flag = sys.dont_write_bytecode
        sys.dont_write_bytecode = True
        try:
            spec.loader.exec_module(module)
        finally:
            sys.dont_write_bytecode = old_flag
        with tempfile.TemporaryDirectory() as tmp:
            module.init(tmp)
            folder = module.base(tmp)
            event = {"project":"demo","scope":"marque:mobile","aspect":"cta",
                     "decision":"contraste fort","reason":"validé","signal":"approved"}
            with (folder / "events.jsonl").open("a", encoding="utf-8") as f:
                f.write(json.dumps(event)+"\n")
            self.assertEqual(module.candidates(module.read_events(folder)), [])
            with (folder / "events.jsonl").open("a", encoding="utf-8") as f:
                f.write(json.dumps(event)+"\n")
            self.assertEqual(len(module.candidates(module.read_events(folder))), 1)
            denied = subprocess.run([sys.executable,str(ENGINE),"adopt","--workspace",tmp,
                                     "--scope","marque:mobile","--aspect","cta",
                                     "--decision","contraste fort"],capture_output=True,text=True)
            self.assertNotEqual(denied.returncode,0)
            allowed = subprocess.run([sys.executable,str(ENGINE),"adopt","--workspace",tmp,
                                      "--scope","marque:mobile","--aspect","cta",
                                      "--decision","contraste fort","--confirm"],
                                     capture_output=True,text=True)
            self.assertEqual(allowed.returncode,0,allowed.stderr)
            adopted = json.loads((folder / "policy.json").read_text(encoding="utf-8"))["adopted"]
            self.assertEqual(len(adopted),1)
            with (folder / "events.jsonl").open("a", encoding="utf-8") as f:
                f.write(json.dumps({**event,"signal":"rejected"})+"\n")
            self.assertEqual(module.candidates(module.read_events(folder)), [])

if __name__ == "__main__":
    unittest.main()
