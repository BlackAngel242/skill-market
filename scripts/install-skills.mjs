#!/usr/bin/env node
/**
 * Installation locale des deux skills canoniques de Skill Market.
 * Aucune requête réseau, aucune dépendance npm, sauvegarde avant remplacement.
 */
import { cp, lstat, mkdir, readdir, readFile, rename, rm } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const SKILLS = ['fixit', 'prd-table-ronde'];
const TOOLS = ['codex', 'claude', 'cursor'];
const HELP = [
  'Skill Market — Fixit et PRD Table Ronde',
  '  node scripts/install-skills.mjs [options]',
  '  --tool codex|claude|cursor           Client (défaut : codex)',
  '  --scope user|project                Personnel ou projet (défaut : user)',
  '  --skill all|fixit|prd-table-ronde   Skills (défaut : all)',
  '  --dir CHEMIN                       Dossier de destination',
  '  --replace                          Sauvegarder avant de remplacer',
  '  --dry-run                          Simulation sans écriture',
  '  --list, --help                      Lister ou afficher cette aide',
  'ChatGPT web : créer les ZIP avec python scripts/build-chatgpt.py'
].join('\n');

function fail(text) { throw new Error(text); }
function parse(args) {
  const opts = { tool: 'codex', scope: 'user', skill: 'all', dir: '', replace: false, dryRun: false, list: false, help: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--replace') opts.replace = true;
    else if (arg === '--list') opts.list = true;
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else if (['--tool', '--scope', '--skill', '--dir'].includes(arg)) {
      if (!args[i + 1] || args[i + 1].startsWith('--')) fail('Valeur manquante : ' + arg);
      opts[arg.slice(2)] = args[++i];
    } else fail('Option inconnue : ' + arg);
  }
  if (!opts.help && !opts.list) {
    if (opts.tool === 'chatgpt' || opts.tool === 'gpt') fail('Impossible d’installer un skill dans ChatGPT depuis le PC. Préparer puis importer les ZIP.');
    if (!TOOLS.includes(opts.tool)) fail('Client inconnu : ' + opts.tool);
    if (!['user', 'project'].includes(opts.scope)) fail('Portée inconnue : ' + opts.scope);
    if (opts.skill !== 'all' && !SKILLS.includes(opts.skill)) fail('Skill inconnu : ' + opts.skill);
  }
  return opts;
}
function destination(opts) {
  if (opts.dir) return resolve(opts.dir);
  const mapping = {
    codex: { user: ['.codex','skills'], project: ['.agents','skills'] },
    claude: { user: ['.claude','skills'], project: ['.claude','skills'] },
    cursor: { user: ['.cursor','skills'], project: ['.cursor','skills'] }
  };
  return join(opts.scope === 'user' ? homedir() : process.cwd(), ...mapping[opts.tool][opts.scope]);
}
async function stat(file) {
  try { return await lstat(file); }
  catch (e) { if (e.code === 'ENOENT') return null; throw e; }
}
async function snapshot(folder) {
  const hash = createHash('sha256');
  async function walk(base, prefix = '') {
    const entries = (await readdir(base, { withFileTypes: true })).sort((a,b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (entry.isSymbolicLink()) fail('Lien symbolique interdit : ' + entry.name);
      const relative = prefix + entry.name;
      const full = join(base, entry.name);
      if (entry.isDirectory()) await walk(full, relative + '/');
      else if (entry.isFile()) {
        hash.update(relative + '\0');
        hash.update(await readFile(full));
        hash.update('\0');
      } else fail('Type de fichier interdit : ' + relative);
    }
  }
  await walk(folder);
  return hash.digest('hex');
}
async function main() {
  const opts = parse(process.argv.slice(2));
  if (opts.help) { console.log(HELP); return; }
  if (opts.list) { console.log(SKILLS.join('\n')); return; }
  const base = destination(opts);
  const selected = opts.skill === 'all' ? SKILLS : [opts.skill];
  const plan = [];
  for (const skill of selected) {
    const source = join(ROOT, 'skills', skill);
    if (!(await stat(source))?.isDirectory()) fail('Source absente : ' + source);
    const content = await readFile(join(source, 'SKILL.md'), 'utf8');
    if (!new RegExp('^---\\r?\\nname: ' + skill + '\\r?\\n').test(content)) fail('SKILL.md incorrect : ' + skill);
    const target = join(base, skill);
    const found = await stat(target);
    if (found && !found.isDirectory()) fail('Destination non répertoire ou lien : ' + target);
    const same = found && await snapshot(source) === await snapshot(target);
    const action = !found ? 'installer' : same ? 'déjà identique' : opts.replace ? 'sauvegarder puis remplacer' : 'conflit';
    plan.push({ skill, source, target, action });
  }
  console.log('Destination : ' + base);
  for (const p of plan) console.log(' ' + p.skill + ' : ' + p.action);
  if (plan.some(p => p.action === 'conflit')) fail('Un skill diffère : aucune écriture. Utiliser --replace pour sauvegarder puis remplacer.');
  if (opts.dryRun) { console.log('Simulation terminée : aucune écriture.'); return; }
  if (plan.every(p => p.action === 'déjà identique')) { console.log('Déjà à jour.'); return; }
  await mkdir(base, { recursive: true });
  for (const p of plan) {
    if (p.action === 'déjà identique') continue;
    const temp = join(base, '.skillmarket-stage-' + randomUUID());
    let backup = null;
    try {
      await cp(p.source, temp, { recursive: true, force: false, errorOnExist: true });
      if (p.action === 'sauvegarder puis remplacer') {
        const backupDir = join(base, '..', '.skillmarket-backups');
        await mkdir(backupDir, { recursive: true });
        backup = join(backupDir, p.skill + '-' + randomUUID());
        await rename(p.target, backup);
      }
      await rename(temp, p.target);
      console.log(p.skill + ' : OK' + (backup ? ' ; sauvegarde : ' + backup : ''));
    } catch (error) {
      await rm(temp, { recursive: true, force: true }).catch(() => {});
      if (backup && !(await stat(p.target))) await rename(backup, p.target);
      throw error;
    }
  }
  console.log('Relancer ou actualiser le client pour charger les skills.');
}
main().catch(e => { console.error('Erreur Skill Market : ' + e.message); process.exitCode = 1; });
