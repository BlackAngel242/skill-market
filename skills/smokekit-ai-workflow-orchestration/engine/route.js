#!/usr/bin/env node
/**
 * route.js — SmokeKit v4 multi-AI router.
 *
 * What v3.1 promised but never shipped: a real router. This one:
 *  1. detects which AI CLIs are actually installed (no routing to a ghost),
 *  2. classifies the task type by keywords (v3.1 table kept as priors),
 *  3. applies evolution/policy.json weights learned from your corrections,
 *  4. explains its choice (JSON out, reasons included).
 *
 * Usage:
 *   node engine/route.js "fix the login bug on the API"
 *   node engine/route.js --agent-only "design a landing page"
 */
'use strict';
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SKILL_DIR = path.resolve(__dirname, '..');
const POLICY_PATH = path.join(SKILL_DIR, 'evolution', 'policy.json');

// The four routable AIs. "claude" is always available: the orchestrator IS Claude.
const AI_BINARIES = { claude: 'claude', gemini: 'gemini', cursor: 'cursor', aider: 'aider' };

function isInstalled(bin) {
  try {
    execSync(`command -v ${bin} >/dev/null 2>&1`, { stdio: 'ignore' });
    return true;
  } catch { return false; }
}

function detectInstalled() {
  const out = { claude: true }; // orchestrator, always present
  for (const [ai, bin] of Object.entries(AI_BINARIES)) {
    if (ai === 'claude') continue;
    out[ai] = isInstalled(bin);
  }
  return out;
}

// Task types: v3.1 keyword table kept as priors, extended, each with a default agent.
const TASK_TYPES = [
  { type: 'backend',  keywords: ['backend','api','database','auth','security','deployment','server','sql','migration','endpoint','rest','graphql'], defaultAi: 'claude', defaultAgent: 'fullstack-developer' },
  { type: 'frontend', keywords: ['frontend','ui','ux','design','component','style','animation','css','page','landing','layout','responsive'], defaultAi: 'gemini', defaultAgent: 'ui-ux-designer' },
  { type: 'git',      keywords: ['git','commit','pr ','pull request','merge','branch','push','rebase'], defaultAi: 'aider', defaultAgent: 'git-manager' },
  { type: 'debug',    keywords: ['debug','bug','fix','error','crash','traceback','failing','broken','exception','stacktrace'], defaultAi: 'claude', defaultAgent: 'debugger' },
  { type: 'docs',     keywords: ['doc','readme','changelog','guide','tutorial','comment'], defaultAi: 'claude', defaultAgent: 'docs-manager' },
  { type: 'perf',     keywords: ['perf','optim','cach','slow','cdn','latency','bundle'], defaultAi: 'claude', defaultAgent: 'perf-optimizer' },
  { type: 'data',     keywords: ['schema','table','query','index','seed'], defaultAi: 'claude', defaultAgent: 'database-admin' },
  { type: 'planning', keywords: ['plan','roadmap','architect','spec','estimate','milestone'], defaultAi: 'claude', defaultAgent: 'planner' },
];

function classify(task) {
  const t = task.toLowerCase();
  let best = null, bestScore = 0;
  for (const tt of TASK_TYPES) {
    let score = 0;
    for (const kw of tt.keywords) if (t.includes(kw)) score += kw.length > 5 ? 2 : 1;
    if (score > bestScore) { bestScore = score; best = tt; }
  }
  return best || { type: 'general', keywords: [], defaultAi: 'claude', defaultAgent: 'fullstack-developer' };
}

function loadPolicy() {
  try { return JSON.parse(fs.readFileSync(POLICY_PATH, 'utf8')); }
  catch { return { routing: { weights: {}, rules: [] }, agents: {} }; }
}

function route(task) {
  const classified = classify(task);
  const installed = detectInstalled();
  const policy = loadPolicy();
  const weights = (policy.routing && policy.routing.weights && policy.routing.weights[classified.type]) || {};
  const rules = (policy.routing && policy.routing.rules) || [];

  // Base priors: the task type's default AI leads, claude is the safe fallback.
  const candidates = Object.keys(AI_BINARIES);
  const scores = {};
  const reasons = [];
  for (const ai of candidates) {
    let s = ai === classified.defaultAi ? 0.6 : ai === 'claude' ? 0.25 : 0.05;
    const w = weights[ai];
    if (w !== undefined && w !== 1) { s *= w; reasons.push(`policy weight x${w} on ${ai} for ${classified.type}`); }
    scores[ai] = s;
  }

  // Explicit learned rules (from lessons) boost their preferred target.
  const appliedRules = [];
  for (const r of rules) {
    const when = r.when || {};
    if (when.task_type && when.task_type !== classified.type) continue;
    if (when.keyword && !task.toLowerCase().includes(when.keyword)) continue;
    if (scores[r.prefer] !== undefined) {
      scores[r.prefer] *= (1 + (r.boost || 0.5));
      appliedRules.push(r.id || 'unnamed');
      reasons.push(`rule ${r.id || '?'}: prefer ${r.prefer} (${r.from_lesson || 'manual'})`);
    }
  }

  // Drop AIs that are not installed (except claude, always available).
  for (const ai of candidates) {
    if (!installed[ai]) { scores[ai] = 0; }
  }

  const ranked = candidates.sort((a, b) => scores[b] - scores[a]);
  const winner = ranked[0];
  const total = ranked.reduce((s, ai) => s + scores[ai], 0) || 1;

  // Agent: default for the task type, unless policy disables or biases it.
  let agent = classified.defaultAgent;
  const agentCfg = (policy.agents || {})[agent];
  if (agentCfg && agentCfg.enabled === false) {
    agent = 'fullstack-developer';
    reasons.push(`agent ${classified.defaultAgent} disabled by policy, fell back to fullstack-developer`);
  }

  return {
    task_type: classified.type,
    ai: winner,
    agent,
    confidence: Math.round((scores[winner] / total) * 100) / 100,
    installed,
    scores: Object.fromEntries(ranked.map(ai => [ai, Math.round(scores[ai] * 100) / 100])),
    reasons,
    policy_rules_applied: appliedRules,
  };
}

// CLI
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const task = args.join(' ').trim();
if (!task) {
  console.error('Usage: node engine/route.js "<task description>"');
  process.exit(2);
}
console.log(JSON.stringify(route(task), null, 2));
