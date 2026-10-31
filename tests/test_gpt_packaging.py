import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile

SCRIPT = Path(__file__).resolve().parent.parent / 'scripts' / 'build-chatgpt.py'

class PackagingTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='skillmarket-gpt-')
        self.root = Path(self.temp.name)
        for name in ('fixit', 'prd-table-ronde'):
            folder = self.root / 'skills' / name
            (folder / 'references').mkdir(parents=True)
            (folder / 'SKILL.md').write_text(f'---\nname: {name}\ndescription: Test.\n---\nContenu', encoding='utf-8')
            (folder / 'skill.json').write_text(json.dumps({'name': name, 'version': '1.0.0'}), encoding='utf-8')
            (folder / 'references' / 'detail.md').write_text('Références intégrales', encoding='utf-8')
        plugin = self.root / 'plugins' / 'drsmoke-quality'
        plugin.mkdir(parents=True)
        (plugin / 'plugin.json').write_text(json.dumps({'name':'drsmoke-quality','version':'0.1.0'}), encoding='utf-8')
        for name in ('fixit', 'prd-table-ronde'):
            src = self.root / 'skills' / name
            dest = plugin / 'skills' / name
            import shutil
            shutil.copytree(src, dest)

    def tearDown(self):
        self.temp.cleanup()

    def run_script(self, *args):
        return subprocess.run([sys.executable, str(SCRIPT), '--repo-root', str(self.root), *args], capture_output=True, text=True)

    def test_complete_archives_and_check(self):
        self.assertEqual(self.run_script('--check').returncode, 0)
        r = self.run_script()
        self.assertEqual(r.returncode, 0, r.stderr)
        with ZipFile(self.root / 'dist' / 'TableRonde-ChatGPT.zip') as z:
            self.assertIn('prd-table-ronde/references/detail.md', z.namelist())
        with ZipFile(self.root / 'dist' / 'SkillMarket-GPT-Plugin.zip') as z:
            self.assertIn('drsmoke-quality/plugin.json', z.namelist())
            self.assertIn('drsmoke-quality/skills/fixit/SKILL.md', z.namelist())

    def test_accepts_crlf_windows_checkout_and_preserves_archive_bytes(self):
        for name in ('fixit', 'prd-table-ronde'):
            for prefix in (self.root / 'skills', self.root / 'plugins' / 'drsmoke-quality' / 'skills'):
                path = prefix / name / 'SKILL.md'
                path.write_bytes(path.read_bytes().replace(b'\n', b'\r\n'))
        r = self.run_script()
        self.assertEqual(r.returncode, 0, r.stderr)
        with ZipFile(self.root / 'dist' / 'Fixit-ChatGPT.zip') as z:
            self.assertIn(b'\r\n', z.read('fixit/SKILL.md'))

    def test_detects_desynchronized_mirror(self):
        (self.root / 'skills' / 'fixit' / 'SKILL.md').write_text('Modification', encoding='utf-8')
        r = self.run_script('--check')
        self.assertNotEqual(r.returncode, 0)
        self.assertIn('Frontmatter', r.stderr)

    def test_rejects_sensitive_files(self):
        (self.root / 'skills' / 'fixit' / '.env').write_text('dummy-data', encoding='utf-8')
        r = self.run_script()
        self.assertNotEqual(r.returncode, 0)
        self.assertIn('sensible', r.stderr)

if __name__ == '__main__':
    unittest.main()
