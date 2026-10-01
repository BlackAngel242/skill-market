#!/usr/bin/env node
/**
 * evolve.js — SmokeKit v4 self-evolution engine.
 *
 * This is the piece v3.1 claimed but never built: a real learning loop.
 *
 *   1. OBSERVE  — every significant decision / correction / outcome is logged
 *                 to evolution/events.jsonl (append-only, timestamped).
 *   2. LESSON   — lessons are recorded in evolution/lessons.md (human-readable,
 *                 each with an id, the situation it applies to, and the rule).
 *   3. ADAPT    — `retrospective` turns repeated corrections into policy changes
 *                 in evolution/policy.json (routing weights + explicit rules),
 *                 always with provenance (which lesson, how many events).
 *   4. MEASURE  — `stats` computes real KPIs from the event log.
 *
 * Nothing here overrides an explicit user instruction. Policy is a bias,
 * not an order. Every automated change is provenance-tracked and reversible.
 *
 * Usage:
 *   node engine/evolve.js log --type correction --situation '{"task_type":"frontend"}' \
 *       --decision '{"ai":"gemini"}' --correction '{"ai":"claude"}' --note "user prefers claude for quick CSS"
 *   node engine/evolve.js lesson --title "Quick CSS fixes stay local" \
 *       --when "task_type=frontend, small scope" --rule "prefer claude over gemini for small CSS fixes"
 *   node engine/evolve.js retrospective [--apply]
 *   node engine/evolve.js stats
 *   node engine/evolve.js policy
 *   node engine/evolve.js init-project [dir]
 */
'use strict';
const fs = require('fs');
const path = require('path');

const SKILL_DIR = path.resolve(__dirname, '..');
const EVO_DIR = path.join(SKILL_DIR, 'evolution');
const EVENTS_PATH = path.join(EVO_DIR, 'events.jsonl');
const LESSONS_PATH = path.join(EVO_DIR, 'lessons.md');
const POLICY_PATH = path.join(EVO_DIR, 'policy.json');

function ensureDir() { fs.mkdirSync(EVO_DIR, { recursive: true }); }
function now() { return new Date().toISOString(); }

function loadPolicy() {
  try { return JSON.parse(fs.readFileSync(POLICY_PATH, 'utf8')); }
  catch { return null; }
}
function savePolicy(p) {
  ensureDir();
  fs.writeFileSync(POLICY_PATH, JSON.stringify(p, null, 2) + '\n');
}
function readEvents() {
  try {
    return fs.readFileSync(EVENTS_PATH, 'utf8').split('\n')
      .filter(l => l.trim()).map(l => JSON.parse(l));
  } catch { return []; }
}

// ---------- log ----------
function cmdLog(opts) {
  const type = opts.type || 'note';
  const ev = { ts: now(), type };
  for (const k of ['situation', 'decision', 'correction', 'outcome']) {
    if (opts[k]) { try { ev[k] = JSON.parse(opts[k]); } catch { ev[k] = opts[k]; } }
  }
  if (opts.note) ev.note = opts.note;
  if (opts.actor) ev.actor = opts.actor; else ev.actor = 'agent';
  ensureDir();
  fs.appendFileSync(EVENTS_PATH, JSON.stringify(ev) + '\n');
  console.log(JSON.stringify({ logged: true, ts: ev.ts, type }));
}

// ---------- lesson ----------
function cmdLesson(opts) {
  if (!opts.title || !opts.rule) {
    console.error('lesson needs --title and --rule (and preferably --when)');
    process.exit(2);
  }
  ensureDir();
  let existing = '';
  try { existing = fs.readFileSync(LESSONS_PATH, 'utf8'); } catch {}
  const ids = [...existing.matchAll(/^## (L\d+)/gm)].map(m => parseInt(m[1].slice(1), 10));
  const id = 'L' + String((ids.length ? Math.max(...ids) : 0) + 1).padStart(3, '0');
  const entry = `\n## ${id} — ${opts.title}\n\n` +
    `- **Date:** ${now().slice(0, 10)}\n` +
    `- **Situation:** ${opts.when || 'general'}\n` +
    `- **Règle:** ${opts.rule}\n` +
    (opts.evidence ? `- **Preuve:** ${opts.evidence}\n` : '') +
    (opts.source ? `- **Source:** ${opts.source}\n` : '');
  fs.appendFileSync(LESSONS_PATH, entry);
  console.log(JSON.stringify({ lesson: id, title: opts.title }));
  return id;
}

// ---------- retrospective ----------
function cmdRetrospective(opts) {
  const policy = loadPolicy();
  if (!policy) { console.error('No policy.json found.'); process.exit(2); }
  const events = readEvents();
  const since = (policy.meta && policy.meta.last_retrospective) || '1970-01-01T00:00:00Z';
  const fresh = events.filter(e => e.ts > since);

  // Group corrections by (task_type, corrected-to AI): repeated corrections = lesson.
  const groups = {};
  for (const e of fresh) {
    if (e.type !== 'correction' || !e.correction) continue;
    const tt = (e.situation && e.situation.task_type) || 'general';
    const to = e.correction.ai || e.correction.agent || '?';
    const from = (e.decision && (e.decision.ai || e.decision.agent)) || '?';
    const key = `${tt}||${from}->${to}`;
    (groups[key] = groups[key] || { task_type: tt, from, to, count: 0, notes: [] });
    groups[key].count++;
    if (e.note) groups[key].notes.push(e.note);
  }

  const candidates = Object.values(groups).filter(g => g.count >= 2);
  const stats = cmdStats({ quiet: true });

  const report = {
    since,
    events_analyzed: fresh.length,
    correction_groups: groups,
    lesson_candidates: candidates.map(c => ({
      situation: `task_type=${c.task_type}`,
      proposed_rule: `prefer ${c.to} over ${c.from} for ${c.task_type} tasks`,
      evidence: `${c.count} corrections`,
      notes: [...new Set(c.notes)].slice(0, 3),
    })),
    stats,
  };

  if (!opts.apply) {
    console.log(JSON.stringify(report, null, 2));
    if (candidates.length) console.log('\nRun with --apply to turn candidates into lessons + policy updates.');
    return;
  }

  // Apply: one lesson per candidate + policy weight/rule updates with provenance.
  ensureDir();
  let existing = '';
  try { existing = fs.readFileSync(LESSONS_PATH, 'utf8'); } catch {}
  const ids = [...existing.matchAll(/^## (L\d+)/gm)].map(m => parseInt(m[1].slice(1), 10));
  let n = ids.length ? Math.max(...ids) : 0;
  const applied = [];

  for (const c of candidates) {
    n++;
    const lid = 'L' + String(n).padStart(3, '0');
    const title = `Prefer ${c.to} over ${c.from} for ${c.task_type} tasks`;
    fs.appendFileSync(LESSONS_PATH,
      `\n## ${lid} — ${title}\n\n` +
      `- **Date:** ${now().slice(0, 10)}\n` +
      `- **Situation:** task_type=${c.task_type}\n` +
      `- **Règle:** prefer ${c.to} over ${c.from} for ${c.task_type} tasks\n` +
      `- **Preuve:** ${c.count} corrections utilisateur\n` +
      `- **Source:** retrospective automatique\n`);

    // Policy: boost the preferred AI, dampen the rejected one, add explicit rule.
    policy.routing.weights[c.task_type] = policy.routing.weights[c.task_type] || {};
    const w = policy.routing.weights[c.task_type];
    w[c.to] = Math.round(((w[c.to] || 1) * 1.5) * 100) / 100;
    if (c.from !== c.to) w[c.from] = Math.round(((w[c.from] || 1) * 0.7) * 100) / 100;

    const rid = 'R-' + lid;
    policy.routing.rules = (policy.routing.rules || []).filter(r => r.id !== rid);
    policy.routing.rules.push({
      id: rid, when: { task_type: c.task_type }, prefer: c.to, boost: 0.5, from_lesson: lid,
    });
    applied.push({ lesson: lid, rule: rid, change: `${c.task_type}: ${c.to} x${w[c.to]}, ${c.from} x${w[c.from]}` });
  }

  policy.meta = policy.meta || {};
  policy.meta.retrospectives = (policy.meta.retrospectives || 0) + 1;
  policy.meta.last_retrospective = now();
  savePolicy(policy);
  report.applied = applied;
  console.log(JSON.stringify(report, null, 2));
}

// ---------- stats (real KPIs from the event log) ----------
function cmdStats(opts) {
  const events = readEvents();
  const byType = {};
  let corrections = 0, outcomes = 0, successes = 0;
  const perAi = {};
  for (const e of events) {
    byType[e.type] = (byType[e.type] || 0) + 1;
    if (e.type === 'correction') corrections++;
    if (e.type === 'outcome') {
      outcomes++;
      const ok = e.outcome && (e.outcome.result === 'success' || e.outcome.success === true);
      if (ok) successes++;
      const ai = (e.decision && e.decision.ai) || (e.situation && e.situation.ai) || '?';
      perAi[ai] = perAi[ai] || { tasks: 0, success: 0 };
      perAi[ai].tasks++;
      if (ok) perAi[ai].success++;
    }
  }
  const s = {
    total_events: events.length,
    by_type: byType,
    correction_rate: outcomes ? Math.round((corrections / Math.max(outcomes, 1)) * 100) / 100 : 0,
    task_success_rate: outcomes ? Math.round((successes / outcomes) * 100) / 100 : null,
    per_ai: perAi,
  };
  if (!opts || !opts.quiet) console.log(JSON.stringify(s, null, 2));
  return s;
}

// ---------- policy ----------
function cmdPolicy() {
  const p = loadPolicy();
  console.log(JSON.stringify(p, null, 2));
}

// ---------- init-project ----------
const TPL = (name, fallback) => {
  const p = path.join(SKILL_DIR, 'templates', name);
  try { return fs.readFileSync(p, 'utf8'); } catch { return fallback; }
};
function cmdInitProject(opts) {
  const dir = opts._[0] || process.cwd();
  const files = { 'MEMORY.md': '# Project Memory\n', 'JOURNAL.md': '# Project Journal\n', 'HANDOFF.md': '# Project Handoff\n' };
  let created = [];
  for (const [name, fallback] of Object.entries(files)) {
    const dest = path.join(dir, name);
    if (!fs.existsSync(dest)) {
      fs.writeFileSync(dest, TPL(name, fallback));
      created.push(name);
    }
  }
  console.log(JSON.stringify({ dir, created }));
}

// ---------- arg parsing ----------
function parseArgs(argv) {
  const out = { _: [] };
  let key = null;
  for (const a of argv) {
    if (a.startsWith('--')) { key = a.slice(2); out[key] = true; }
    else if (key) { out[key] = a; key = null; }
    else out._.push(a);
  }
  return out;
}

const [cmd, ...rest] = process.argv.slice(2);
const opts = parseArgs(rest);
switch (cmd) {
  case 'log': cmdLog(opts); break;
  case 'lesson': cmdLesson(opts); break;
  case 'retrospective': cmdRetrospective(opts); break;
  case 'stats': cmdStats(opts); break;
  case 'policy': cmdPolicy(); break;
  case 'init-project': cmdInitProject(opts); break;
  default:
    console.error('Usage: evolve.js <log|lesson|retrospective|stats|policy|init-project> [options]');
    process.exit(2);
}
