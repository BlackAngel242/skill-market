import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cp, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../scripts/install-skills.mjs', import.meta.url));
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'skillmarket-'));
  await mkdir(join(root, 'scripts'));
  await cp(source, join(root, 'scripts', 'install-skills.mjs'));
  for (const name of ['fixit', 'prd-table-ronde']) {
    await mkdir(join(root, 'skills', name, 'references'), { recursive: true });
    await writeFile(join(root, 'skills', name, 'SKILL.md'), `---\nname: ${name}\ndescription: Test\n---\nContenu original.\n`);
    await writeFile(join(root, 'skills', name, 'skill.json'), JSON.stringify({ name, version: '1.0.0' }));
    await writeFile(join(root, 'skills', name, 'references', 'detail.md'), 'Références intégrales');
  }
  return root;
}
function run(root, ...args) {
  const r = spawnSync(process.execPath, [join(root, 'scripts', 'install-skills.mjs'), ...args], { encoding: 'utf8', timeout: 20000 });
  if (r.error) throw r.error;
  return r;
}
test('prévisualisation : aucune écriture', async () => {
  const root = await fixture();
  try {
    const dest = join(root, 'destination');
    const result = run(root, '--tool', 'codex', '--dir', dest, '--dry-run');
    assert.equal(result.status, 0, result.stderr);
    await assert.rejects(readdir(dest), { code: 'ENOENT' });
  } finally { await rm(root, { recursive: true, force: true }); }
});
test('installation complète, références conservées, idempotence', async () => {
  const root = await fixture();
  try {
    const dest = join(root, 'destination');
    assert.equal(run(root, '--dir', dest).status, 0);
    for (const name of ['fixit', 'prd-table-ronde']) {
      assert.equal(await readFile(join(dest, name, 'references', 'detail.md'), 'utf8'), 'Références intégrales');
    }
    assert.match(run(root, '--dir', dest).stdout, /Déjà à jour/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
test('conflit protégé et sauvegarde lors de --replace', async () => {
  const root = await fixture();
  try {
    const dest = join(root, 'destination');
    await mkdir(join(dest, 'fixit'), { recursive: true });
    await writeFile(join(dest, 'fixit', 'SKILL.md'), 'Personnalisation privée');
    assert.notEqual(run(root, '--dir', dest).status, 0);
    assert.deepEqual(await readdir(dest), ['fixit']);
    assert.equal(await readFile(join(dest, 'fixit', 'SKILL.md'), 'utf8'), 'Personnalisation privée');
    assert.equal(run(root, '--dir', dest, '--replace').status, 0);
    const backup = (await readdir(dest)).find(n => n.startsWith('fixit.backup-'));
    assert.ok(backup);
    assert.equal(await readFile(join(dest, backup, 'SKILL.md'), 'utf8'), 'Personnalisation privée');
  } finally { await rm(root, { recursive: true, force: true }); }
});
test('ChatGPT n’est pas une destination locale ; noms invalides refusés', async () => {
  const root = await fixture();
  try {
    assert.notEqual(run(root, '--tool', 'chatgpt', '--dry-run').status, 0);
    assert.notEqual(run(root, '--skill', '../escape', '--dry-run').status, 0);
  } finally { await rm(root, { recursive: true, force: true }); }
});
