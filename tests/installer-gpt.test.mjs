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
    const backupDir = join(root, '.skillmarket-backups');
    const backup = (await readdir(backupDir)).find(n => n.startsWith('fixit-'));
    assert.ok(backup);
    assert.deepEqual((await readdir(dest)).sort(), ['fixit', 'prd-table-ronde']);
    assert.equal(await readFile(join(backupDir, backup, 'SKILL.md'), 'utf8'), 'Personnalisation privée');
  } finally { await rm(root, { recursive: true, force: true }); }
});
test('ChatGPT n’est pas une destination locale ; noms invalides refusés', async () => {
  const root = await fixture();
  try {
    assert.notEqual(run(root, '--tool', 'chatgpt', '--dry-run').status, 0);
    assert.notEqual(run(root, '--skill', '../escape', '--dry-run').status, 0);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('le lanceur Linux/macOS préserve le projet appelant et les chemins relatifs', { skip: process.platform === 'win32' }, async () => {
  const root = await fixture();
  try {
    const project = join(root, 'projet externe');
    await mkdir(project);
    const wrapper = fileURLToPath(new URL('../scripts/install-linux-macos.sh', import.meta.url));
    const r = spawnSync('bash', [wrapper, '--tool', 'codex', '--scope', 'project', '--skill', 'fixit', '--dry-run'], { cwd: project, encoding: 'utf8', timeout: 20000 });
    if (r.error) throw r.error;
    assert.equal(r.status, 0, r.stderr);
    assert.ok(r.stdout.includes(join(project, '.agents', 'skills')), r.stdout);
    const relative = spawnSync('bash', [wrapper, '--dir', 'custom-skills', '--skill', 'fixit', '--dry-run'], { cwd: project, encoding: 'utf8', timeout: 20000 });
    if (relative.error) throw relative.error;
    assert.equal(relative.status, 0, relative.stderr);
    assert.ok(relative.stdout.includes(join(project, 'custom-skills')), relative.stdout);
  } finally { await rm(root, { recursive: true, force: true }); }
});
