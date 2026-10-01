#!/usr/bin/env node
'use strict';
/* UxFix — boucle autonome : détecte (impeccable), corrige seul, re-vérifie, jusqu'au score cible.
 *
 *   uxfix <fichier-ou-dossier> [--target 99] [--max-iterations 6] [--dry-run] [--json]
 *   IMPECCABLE_BIN : chemin du binaire de détection (défaut : "impeccable" sur le PATH)
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const lib = require('./lib');

const IMPECCABLE = process.env.IMPECCABLE_BIN || 'impeccable';

function parseArgs(argv) {
  const o = { target: 99, maxIterations: 6, dryRun: false, json: false, path: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--target') o.target = parseFloat(argv[++i]);
    else if (a === '--max-iterations') o.maxIterations = parseInt(argv[++i], 10);
    else if (a === '--dry-run') o.dryRun = true;
    else if (a === '--json') o.json = true;
    else if (!a.startsWith('-') && !o.path) o.path = a;
    else { console.error('Option inconnue : ' + a); process.exit(2); }
  }
  if (!o.path) { console.error('Usage : uxfix <fichier-ou-dossier> [--target 99] [--max-iterations 6] [--dry-run] [--json]'); process.exit(2); }
  return o;
}

function collectFiles(target) {
  const paths = [];
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    const walk = dir => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name === '.uxfix-backup' || e.name === 'node_modules') continue;
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(css|html?)$/i.test(e.name)) paths.push(p);
      }
    };
    walk(target);
  } else paths.push(target);
  return paths.map(p => ({
    path: p,
    kind: /\.css$/i.test(p) ? 'css' : 'html',
    content: fs.readFileSync(p, 'utf8'),
    changed: false,
  }));
}

function loadSources(target) {
  const files = collectFiles(target);
  const cssSources = [];
  for (const f of files) {
    if (f.kind === 'css') {
      cssSources.push({
        get css() { return f.content; },
        set css(v) { if (v !== f.content) { f.content = v; f.changed = true; } },
      });
    } else {
      f.blocks = [];
      const re = /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi;
      let m;
      while ((m = re.exec(f.content)) !== null)
        f.blocks.push({ open: m[1], css: m[2], close: m[3], start: m.index, end: m.index + m[0].length });
      f.blocks.forEach((b, i) => {
        cssSources.push({
          get css() { return f.blocks[i].css; },
          set css(v) { if (v !== f.blocks[i].css) { f.blocks[i].css = v; f.changed = true; } },
        });
      });
    }
  }
  return { files, cssSources };
}

function mergeBlocks(files) {
  for (const f of files) {
    if (f.kind !== 'html' || !f.blocks || !f.changed) continue;
    let html = f.content;
    const bs = [...f.blocks].sort((a, b) => b.start - a.start);
    for (const b of bs) html = html.slice(0, b.start) + b.open + b.css + b.close + html.slice(b.end);
    f.content = html;
    // re-parse blocks so offsets stay valid for later steps in this iteration
    f.blocks = [];
    const re = /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi;
    let m;
    while ((m = re.exec(f.content)) !== null)
      f.blocks.push({ open: m[1], css: m[2], close: m[3], start: m.index, end: m.index + m[0].length });
  }
}

function flush(files) {
  let n = 0;
  for (const f of files) {
    if (!f.changed) continue;
    fs.writeFileSync(f.path, f.content, 'utf8');
    n++;
  }
  return n;
}

function backup(target, files) {
  const base = fs.statSync(target).isDirectory() ? target : path.dirname(target);
  const dir = path.join(base, '.uxfix-backup', new Date().toISOString().replace(/[:.]/g, '-'));
  for (const f of files) {
    const rel = path.relative(base, f.path);
    const dest = path.join(dir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(f.path, dest);
  }
  return dir;
}

function detect(target) {
  try {
    const out = execFileSync(IMPECCABLE, ['detect', '--json', target], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return JSON.parse(out.trim() || '[]');
  } catch (e) {
    const out = (e.stdout || '').toString().trim();
    if (out) { try { return JSON.parse(out); } catch (_) {} }
    if (e.status !== 2) console.error('Echec de la détection : ' + (e.message || e));
    return [];
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const target = path.resolve(args.path);
  if (!fs.existsSync(target)) { console.error('Cible introuvable : ' + target); process.exit(2); }

  const log = (...a) => { if (!args.json) console.log(...a); };
  const history = [];
  let backupDir = null;
  let backedUp = false;
  let prevKeys = null, prevScore = null, lastFixCount = -1;

  for (let iter = 1; iter <= args.maxIterations; iter++) {
    const findings = detect(target);
    const { score, primary, advisories } = lib.scoreFindings(findings);
    history.push({ iter, score, findings: primary.length });
    const keys = primary.map(f => f.antipattern + '|' + f.snippet).sort().join('\n');

    if (score >= 100) {
      return finish(true, 'Score 100/100 : page impeccable.', history, primary, advisories, backupDir);
    }
    if (score >= args.target && lastFixCount === 0) {
      return finish(true, `Score ${score}/100 >= ${args.target} : objectif atteint, rien de plus à corriger.`, history, primary, advisories, backupDir);
    }
    if (prevKeys !== null && keys === prevKeys && score <= prevScore) {
      return finish(score >= args.target, 'Aucun progrès entre deux itérations, arrêt.', history, primary, advisories, backupDir, primary);
    }
    prevKeys = keys; prevScore = score;

    log(`Itération ${iter} : score ${score}/100 (${primary.length} finding(s) primaire(s), ${advisories.length} advisory)`);

    const sources = loadSources(target);
    if (!backedUp && !args.dryRun) { backupDir = backup(target, sources.files); backedUp = true; }

    const ctx = { cssSources: sources.cssSources, report: [] };
    const manual = [];
    const seen = new Set();
    let buzzwordFiles = new Set();

    for (const f of primary) {
      const key = f.antipattern + '|' + f.snippet;
      if (seen.has(key)) continue;
      seen.add(key);
      if (f.antipattern === 'marketing-buzzword') { buzzwordFiles.add(f.file); continue; }
      const fixer = lib.fixers[f.antipattern];
      if (!fixer) { manual.push(f); continue; }
      try {
        const n = fixer(f, ctx);
        if (!n) manual.push(f);
      } catch (e) { manual.push(f); }
    }

    mergeBlocks(sources.files);

    // buzzwords: HTML text
    let buzzCount = 0;
    if (buzzwordFiles.size) {
      for (const fl of sources.files) {
        if (fl.kind !== 'html') continue;
        const r = lib.fixBuzzwordsInHtml(fl.content);
        if (r.count) { fl.content = r.html; fl.changed = true; buzzCount += r.count; }
      }
      if (buzzCount) ctx.report.push({ rule: 'marketing-buzzword', detail: `${buzzCount} formulation(s) marketing réécrite(s)` });
    }

    if (!args.dryRun) flush(sources.files);
    const fixCount = ctx.report.length;
    for (const r of ctx.report) log(`  [fix] ${r.rule} : ${r.detail}`);
    if (manual.length) log(`  [manuel] ${manual.length} finding(s) sans correcteur auto : ${[...new Set(manual.map(f => f.antipattern))].join(', ')}`);
    lastFixCount = fixCount;

    if (fixCount === 0) {
      return finish(score >= args.target, 'Aucune correction applicable de plus.', history, primary, advisories, backupDir, manual);
    }
  }

  const findings = detect(target);
  const { score, primary, advisories } = lib.scoreFindings(findings);
  history.push({ iter: 'final', score, findings: primary.length });
  return finish(score >= args.target, `Itérations épuisées. Score final : ${score}/100.`, history, primary, advisories, backupDir, primary);
}

function finish(ok, message, history, remaining, advisories, backupDir, manual) {
  const args = parseArgs(process.argv.slice(2));
  const report = {
    ok, message,
    scoreStart: history.length ? history[0].score : null,
    scoreEnd: history.length ? history[history.length - 1].score : null,
    iterations: history,
    remaining: (manual || remaining || []).map(f => ({ rule: f.antipattern, severity: f.severity, hint: (f.snippet || '').slice(0, 120) })),
    advisories: advisories.map(f => f.antipattern),
    backup: backupDir,
  };
  if (args.json) { console.log(JSON.stringify(report, null, 2)); return; }
  console.log('\n=== UxFix : ' + message + ' ===');
  if (history.length > 1) console.log('Progression : ' + history.map(h => h.score).join(' -> ') + ' /100');
  if (report.remaining.length) {
    console.log('Reste à traiter manuellement :');
    for (const r of report.remaining) console.log(`  - [${r.rule}] ${r.hint}`);
  }
  if (report.advisories.length) console.log('Advisory (informatif) : ' + [...new Set(report.advisories)].join(', '));
  if (backupDir) console.log('Sauvegarde des originaux : ' + backupDir);
  process.exitCode = ok ? 0 : 1;
}

main();
