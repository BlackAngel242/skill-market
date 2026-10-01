'use strict';
/* UxFix engine library: color math, CSS utils, scoring, auto-fixers. */

const fs = require('fs');
const path = require('path');

/* ============================== colors ============================== */

function parseColor(s) {
  if (!s) return null;
  s = s.trim().toLowerCase();
  let m;
  if ((m = s.match(/^#([0-9a-f]{3,8})$/))) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split('').map(c => c + c).join('');
    if (h.length === 8) h = h.slice(0, 6);
    if (h.length !== 6) return null;
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 };
  }
  if ((m = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/))) {
    return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
  }
  return null;
}

function toHex(c) {
  const h = v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
  return '#' + h(c.r) + h(c.g) + h(c.b);
}

function luminance(c) {
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}

function contrastRatio(c1, c2) {
  const l1 = luminance(c1), l2 = luminance(c2);
  const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

function mix(a, b, t) {
  return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t, a: 1 };
}
const BLACK = { r: 0, g: 0, b: 0, a: 1 };
const WHITE = { r: 255, g: 255, b: 255, a: 1 };

function rgbToHsl(c) {
  const r = c.r / 255, g = c.g / 255, b = c.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h * 60, s, l };
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = t => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return { r: f(h + 1 / 3) * 255, g: f(h) * 255, b: f(h - 1 / 3) * 255, a: 1 };
}

/* Adjust one color so that contrast(fg, bg) >= need. Returns {fg, bg} hex. */
function adjustForContrast(fgStr, bgStr, need) {
  let fg = parseColor(fgStr), bg = parseColor(bgStr);
  if (!fg || !bg) return null;
  if (fg.a < 1) fg = mix(fg, WHITE, 1 - fg.a); // flatten translucent over white
  if (bg.a < 1) bg = mix(bg, WHITE, 1 - bg.a);
  const target = need + 0.05;
  if (contrastRatio(fg, bg) >= target) return { fg: toHex(fg), bg: toHex(bg) };

  const solve = (moving, fixed, toWhite) => {
    const dest = toWhite ? WHITE : BLACK;
    let lo = 0, hi = 1, best = null;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      const c = mix(moving, dest, mid);
      if (contrastRatio(c, fixed) >= target) { hi = mid; best = c; }
      else lo = mid;
    }
    return best; // minimal move reaching target, or null
  };

  const fL = luminance(fg), bL = luminance(bg);
  // plan: [which color moves, towards white?]
  let plan;
  if (fL >= 0.72) plan = ['bg', false];       // near-white text -> darken bg
  else if (bL >= 0.72) plan = ['fg', false];  // near-white bg -> darken text
  else if (fL <= 0.04) plan = ['bg', true];   // near-black text -> lighten bg
  else if (bL <= 0.04) plan = ['fg', true];   // near-black bg -> lighten text
  else if (fL > bL) plan = ['bg', false];
  else plan = ['fg', false];

  let newFg = fg, newBg = bg;
  const get = w => (w === 'fg' ? newFg : newBg);
  const set = (w, c) => { if (w === 'fg') newFg = c; else newBg = c; };
  const other = plan[0] === 'fg' ? 'bg' : 'fg';

  const moved = solve(get(plan[0]), get(other), plan[1]);
  if (moved) set(plan[0], moved);
  else {
    set(plan[0], plan[1] ? WHITE : BLACK);          // push primary fully
    const moved2 = solve(get(other), get(plan[0]), !plan[1]);
    set(other, moved2 || (!plan[1] ? WHITE : BLACK)); // extremes always reach 21:1
  }
  return { fg: toHex(newFg), bg: toHex(newBg) };
}

function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/* ============================== CSS utils ============================== */

function maskComments(css) {
  // replace comments with spaces (keeps offsets stable)
  return css.replace(/\/\*[\s\S]*?\*\//g, m => ' '.repeat(m.length));
}

function parseRules(css) {
  // returns [{selector, body, bodyStart, bodyEnd, keyframes}]
  const rules = [];
  const masked = maskComments(css);
  const n = masked.length;
  let i = 0;
  const isStr = c => c === '"' || c === "'";
  while (i < n) {
    // find next '{' outside strings
    let j = i, quote = null;
    while (j < n) {
      const c = masked[j];
      if (quote) { if (c === quote && masked[j - 1] !== '\\') quote = null; }
      else if (isStr(c)) quote = c;
      else if (c === '{') break;
      j++;
    }
    if (j >= n) break;
    const selector = masked.slice(i, j).trim();
    // find matching '}'
    let depth = 1, k = j + 1; quote = null;
    while (k < n && depth > 0) {
      const c = masked[k];
      if (quote) { if (c === quote && masked[k - 1] !== '\\') quote = null; }
      else if (isStr(c)) quote = c;
      else if (c === '{') depth++;
      else if (c === '}') depth--;
      k++;
    }
    const bodyStart = j + 1, bodyEnd = k - 1;
    const body = css.slice(bodyStart, bodyEnd);
    if (/^@media|^@supports|^@container/i.test(selector)) {
      for (const r of parseRules(body)) {
        r.bodyStart += bodyStart; r.bodyEnd += bodyStart;
        rules.push(r);
      }
    } else if (/^@keyframes/i.test(selector)) {
      rules.push({ selector, body, bodyStart, bodyEnd, keyframes: true });
    } else if (/^@/.test(selector)) {
      // @font-face, @import... skip
    } else if (selector) {
      rules.push({ selector, body, bodyStart, bodyEnd, keyframes: false });
    }
    i = k;
  }
  return rules;
}

function getDecl(body, prop) {
  const m = body.match(new RegExp('(?:^|;)\\s*' + escapeRegExp(prop) + '\\s*:\\s*([^;]+)', 'i'));
  return m ? m[1].trim() : null;
}

function setDecl(body, prop, value) {
  const re = new RegExp('((?:^|;)\\s*' + escapeRegExp(prop) + '\\s*:\\s*)[^;]+', 'i');
  if (re.test(body)) return body.replace(re, '$1' + value);
  const sep = body.trim().length && !body.trim().endsWith(';') ? ';' : '';
  return body + sep + ' ' + prop + ': ' + value + ';';
}

function delDecl(body, prop) {
  // preserve the separator: "; -webkit-x: v;" -> ";" (not "")
  return body.replace(new RegExp('(^|;)\\s*' + escapeRegExp(prop) + '\\s*:[^;]+;?', 'gi'), '$1');
}

/* Iterate declarations: cb(propLower, value) -> new value | null (keep) */
function mapDecls(body, cb) {
  return body.replace(/(^|;)\s*([a-zA-Z-]+)\s*:\s*([^;]+)/g, (full, sep, prop, val) => {
    const nv = cb(prop.toLowerCase(), val.trim());
    if (nv === null || nv === undefined || nv === val.trim()) return full;
    return sep + ' ' + prop + ': ' + nv;
  });
}

function colorTokenIn(val, hexNorm) {
  let found = false;
  COLOR_TOKEN.lastIndex = 0;
  let m;
  while ((m = COLOR_TOKEN.exec(val)) !== null) {
    const c = parseColor(m[0]);
    if (c && toHex(c) === hexNorm) { found = true; break; }
  }
  return found;
}

function replaceColorToken(val, hexNorm, replacement) {
  COLOR_TOKEN.lastIndex = 0;
  return val.replace(COLOR_TOKEN, t => {
    const c = parseColor(t);
    return (c && toHex(c) === hexNorm) ? replacement : t;
  });
}

const COLOR_TOKEN = /#(?:[0-9a-fA-F]{3,8})\b|rgba?\([^)]*\)/g;

function eachColorToken(css, cb) {
  // cb(token, offset) ; return replacement string or null
  let out = '', last = 0, count = 0;
  COLOR_TOKEN.lastIndex = 0;
  let m;
  while ((m = COLOR_TOKEN.exec(css)) !== null) {
    const rep = cb(m[0], m.index);
    if (rep && rep !== m[0]) {
      out += css.slice(last, m.index) + rep;
      last = m.index + m[0].length;
      count++;
    }
  }
  out += css.slice(last);
  return { css: out, count };
}

/* ============================== scoring ============================== */

function scoreFindings(findings) {
  const seen = new Set();
  let penalty = 0;
  const primary = [], advisories = [];
  for (const f of findings) {
    const key = f.antipattern + '|' + f.snippet;
    if (seen.has(key)) continue;
    seen.add(key);
    if (f.severity === 'error') { penalty += 5; primary.push(f); }
    else if (f.severity === 'warning') { penalty += 1; primary.push(f); }
    else { advisories.push(f); }
  }
  return { score: Math.max(0, 100 - penalty), primary, advisories, unique: seen.size };
}

/* ============================== fixers ============================== */

function replaceTokenEverywhere(ctx, token, replacement) {
  // replace exact token (case-insensitive) in all CSS sources
  if (!token || token.toLowerCase() === replacement.toLowerCase()) return 0;
  const re = new RegExp(escapeRegExp(token), 'gi');
  let n = 0;
  for (const s of ctx.cssSources) {
    const next = s.css.replace(re, () => { n++; return replacement; });
    if (next !== s.css) { s.css = next; s.changed = true; }
  }
  return n;
}

const fixers = {
  'low-contrast'(f, ctx) {
    const m = f.snippet.match(/([\d.]+):1\s*\(need\s*([\d.]+):1\)\s*[—–-]\s*text\s+(\S+)\s+on\s+(\S+)/);
    if (!m) return 0;
    const need = parseFloat(m[2]), fgTok = m[3], bgTok = m[4];
    const adj = adjustForContrast(fgTok, bgTok, need);
    if (!adj) return 0;
    const norm = t => { const c = parseColor(t); return c ? toHex(c) : String(t).toLowerCase(); };
    const fgN = norm(fgTok), bgN = norm(bgTok);
    let n = 0;
    for (const s of ctx.cssSources) {
      const rules = parseRules(s.css);
      const edits = [];
      for (const r of rules) {
        if (r.keyframes) continue;
        let hit = false;
        const body = mapDecls(r.body, (prop, val) => {
          if (prop === 'color' && colorTokenIn(val, fgN)) { hit = true; return replaceColorToken(val, fgN, adj.fg); }
          if ((prop === 'background-color' || prop === 'background') && colorTokenIn(val, bgN)) { hit = true; return replaceColorToken(val, bgN, adj.bg); }
          return null;
        });
        if (hit) { edits.push({ start: r.bodyStart, end: r.bodyEnd, text: body }); n++; }
      }
      if (edits.length) {
        edits.sort((a, b) => b.start - a.start);
        for (const e of edits) s.css = s.css.slice(0, e.start) + e.text + s.css.slice(e.end);
        s.changed = true;
      }
    }
    if (n) ctx.report.push({ rule: 'low-contrast', detail: `text ${fgTok} on ${bgTok} -> ${adj.fg} on ${adj.bg} (${need}:1)` });
    return n;
  },

  'gradient-text'(f, ctx) {
    let n = 0;
    for (const s of ctx.cssSources) {
      const rules = parseRules(s.css);
      const edits = [];
      for (const r of rules) {
        if (r.keyframes) continue;
        if (!/background-clip\s*:\s*text/i.test(r.body)) continue;
        const bgM = r.body.match(/background(?:-image)?\s*:\s*([^;]*?(?:linear|radial)-gradient\([^;]*)/i);
        if (!bgM) continue;
        // pick darkest stop color
        let darkest = null, darkestLum = Infinity;
        const grad = bgM[1];
        let cm;
        COLOR_TOKEN.lastIndex = 0;
        while ((cm = COLOR_TOKEN.exec(grad)) !== null) {
          const c = parseColor(cm[0]);
          if (!c) continue;
          const l = luminance(c);
          if (l < darkestLum) { darkestLum = l; darkest = toHex(c); }
        }
        if (!darkest) darkest = '#1f2937';
        let body = r.body;
        body = body.replace(/background(?:-image)?\s*:\s*[^;]*?(?:linear|radial)-gradient\([^;]*;?/gi, '');
        body = delDecl(body, 'background-clip');
        body = delDecl(body, '-webkit-background-clip');
        body = delDecl(body, '-webkit-text-fill-color');
        body = delDecl(body, 'color'); // the transparent ink of the gradient technique
        body = setDecl(body, 'color', darkest);
        if (body !== r.body) { edits.push({ start: r.bodyStart, end: r.bodyEnd, text: body }); n++; }
      }
      if (edits.length) {
        edits.sort((a, b) => b.start - a.start);
        for (const e of edits) s.css = s.css.slice(0, e.start) + e.text + s.css.slice(e.end);
        s.changed = true;
      }
    }
    if (n) ctx.report.push({ rule: 'gradient-text', detail: `${n} texte(s) en dégradé -> couleur unie` });
    return n;
  },

  'dark-glow'(f, ctx) {
    let n = 0;
    const fixShadow = (val) => {
      // split comma shadows (naive: commas inside parens are color funcs)
      const parts = val.split(/,(?![^(]*\))/);
      let changed = false;
      const out = parts.map(p => {
        const t = p.trim();
        if (/^(0(?:px|rem|em)?\s+){2}/.test(t)) {
          let cm; COLOR_TOKEN.lastIndex = 0;
          let chromatic = false;
          while ((cm = COLOR_TOKEN.exec(t)) !== null) {
            const c = parseColor(cm[0]); if (!c) continue;
            const { s } = rgbToHsl(c);
            if (s > 0.12) { chromatic = true; break; }
          }
          if (chromatic) { changed = true; return '0 1px 3px rgba(0,0,0,0.12)'; }
        }
        return p;
      });
      return changed ? out.join(', ') : null;
    };
    for (const s of ctx.cssSources) {
      const rules = parseRules(s.css);
      const edits = [];
      for (const r of rules) {
        if (r.keyframes) continue;
        let body = r.body, hit = false;
        const bs = getDecl(body, 'box-shadow');
        if (bs && bs !== 'none') { const fixed = fixShadow(bs); if (fixed) { body = setDecl(body, 'box-shadow', fixed); hit = true; } }
        const ts = getDecl(body, 'text-shadow');
        if (ts && ts !== 'none') {
          let cm, chromatic = false; COLOR_TOKEN.lastIndex = 0;
          while ((cm = COLOR_TOKEN.exec(ts)) !== null) {
            const c = parseColor(cm[0]); if (!c) continue;
            if (rgbToHsl(c).s > 0.12) { chromatic = true; break; }
          }
          if (chromatic) { body = setDecl(body, 'text-shadow', 'none'); hit = true; }
        }
        if (hit) { edits.push({ start: r.bodyStart, end: r.bodyEnd, text: body }); n++; }
      }
      if (edits.length) {
        edits.sort((a, b) => b.start - a.start);
        for (const e of edits) s.css = s.css.slice(0, e.start) + e.text + s.css.slice(e.end);
        s.changed = true;
      }
    }
    if (n) ctx.report.push({ rule: 'dark-glow', detail: `${n} halo(s) coloré(s) -> ombre neutre` });
    return n;
  },

  'wide-tracking'(f, ctx) {
    let n = 0;
    for (const s of ctx.cssSources) {
      const rules = parseRules(s.css);
      const edits = [];
      for (const r of rules) {
        if (r.keyframes) continue;
        const ls = getDecl(r.body, 'letter-spacing');
        if (!ls || ls === 'normal') continue;
        const m = ls.match(/^([\d.]+)(px|r?em|rem)?$/i);
        if (!m) continue;
        const unit = (m[2] || 'em').toLowerCase();
        const em = unit === 'px' ? parseFloat(m[1]) / 16 : parseFloat(m[1]);
        if (em <= 0.05) continue;
        const upper = /text-transform\s*:\s*uppercase/i.test(r.body);
        const target = upper ? '0.04em' : '0.02em';
        const body = setDecl(r.body, 'letter-spacing', target);
        if (body !== r.body) { edits.push({ start: r.bodyStart, end: r.bodyEnd, text: body }); n++; }
      }
      if (edits.length) {
        edits.sort((a, b) => b.start - a.start);
        for (const e of edits) s.css = s.css.slice(0, e.start) + e.text + s.css.slice(e.end);
        s.changed = true;
      }
    }
    if (n) ctx.report.push({ rule: 'wide-tracking', detail: `${n} interlettrage(s) réduit(s)` });
    return n;
  },

  'cream-palette'(f, ctx) {
    const m = f.snippet.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (!m) return 0;
    const c = { r: +m[1], g: +m[2], b: +m[3], a: 1 };
    const hex = toHex(c);
    let n = 0;
    n += replaceTokenEverywhere(ctx, m[0], '#ffffff');
    n += replaceTokenEverywhere(ctx, hex, '#ffffff');
    if (n) ctx.report.push({ rule: 'cream-palette', detail: `fond crème ${hex} -> #ffffff` });
    return n;
  },

  'ai-color-palette'(f, ctx) {
    // rotate violet/purple hues toward blue, keep saturation/lightness
    let n = 0;
    for (const s of ctx.cssSources) {
      const r = eachColorToken(s.css, tok => {
        const c = parseColor(tok); if (!c) return null;
        const { h, s: sat, l } = rgbToHsl(c);
        if (sat > 0.25 && h >= 265 && h <= 300) {
          return toHex(hslToRgb(222, Math.min(sat, 0.75), l));
        }
        return null;
      });
      if (r.count) { s.css = r.css; s.changed = true; n += r.count; }
    }
    if (n) ctx.report.push({ rule: 'ai-color-palette', detail: `${n} teinte(s) violette(s) -> bleu (à valider : choix de palette)` });
    return n;
  },

  'bounce-easing'(f, ctx) {
    let n = 0;
    for (const s of ctx.cssSources) {
      const next = s.css.replace(/cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/gi,
        (full, a, b, c, d) => {
          if (+b < 0 || +b > 1 || +d < 0 || +d > 1) { n++; return 'cubic-bezier(0.4, 0, 0.2, 1)'; }
          return full;
        });
      if (next !== s.css) { s.css = next; s.changed = true; }
    }
    if (n) ctx.report.push({ rule: 'bounce-easing', detail: `${n} easing(s) rebond -> standard` });
    return n;
  },

  'pulsing-dot'(f, ctx) {
    const m = f.snippet.match(/^(.+?)\s*—\s*[\d.]+x[\d.]+px dot with infinite "([^"]+)" animation/);
    if (!m) return 0;
    const sel = m[1].trim(), anim = m[2];
    let n = 0;
    for (const s of ctx.cssSources) {
      const rules = parseRules(s.css);
      const edits = [];
      for (const r of rules) {
        if (r.keyframes) continue;
        if (r.selector.replace(/\s+/g, ' ').trim() !== sel) continue;
        const a = getDecl(r.body, 'animation');
        if (a && a.includes(anim) && /infinite/.test(a)) {
          const body = setDecl(r.body, 'animation', 'none');
          edits.push({ start: r.bodyStart, end: r.bodyEnd, text: body }); n++;
        }
      }
      if (edits.length) {
        edits.sort((a, b) => b.start - a.start);
        for (const e of edits) s.css = s.css.slice(0, e.start) + e.text + s.css.slice(e.end);
        s.changed = true;
      }
    }
    if (n) ctx.report.push({ rule: 'pulsing-dot', detail: `pulsation ${sel} désactivée` });
    return n;
  },
};

/* Buzzwords: applied to HTML text nodes (not CSS). */
const BUZZWORDS = [
  [/seamlessly/gi, 'smoothly'], [/seamless/gi, 'smooth'],
  [/supercharged/gi, 'improved'], [/supercharges/gi, 'improves'], [/supercharge/gi, 'improve'],
  [/empowering/gi, 'helping'], [/empowered/gi, 'helped'], [/empowers/gi, 'helps'], [/empower/gi, 'help'],
  [/\btapestry\b/gi, 'range'],
  [/\bdelve into\b/gi, 'explore'], [/\bdelve\b/gi, 'explore'],
  [/unlocked/gi, 'opened'], [/unlocks/gi, 'opens'], [/\bunlock\b/gi, 'open'],
  [/elevated/gi, 'improved'], [/elevates/gi, 'improves'], [/\belevate\b/gi, 'improve'],
  [/game-?changers?/gi, 'big improvements'], [/game-?changer/gi, 'big improvement'],
  [/cutting-?edge/gi, 'modern'],
  [/revolutionized/gi, 'changed'], [/revolutionizes/gi, 'changes'], [/revolutionize/gi, 'change'], [/revolutionary/gi, 'new'],
  [/leveraging/gi, 'using'], [/\bleverage\b/gi, 'use'],
  [/synergies/gi, 'combined efforts'], [/\bsynergy\b/gi, 'teamwork'],
  [/\bholistic\b/gi, 'complete'],
  [/world-?class/gi, 'high-quality'],
  [/next-?generation/gi, 'new'],
  [/groundbreaking/gi, 'new'],
  [/unleashed/gi, 'released'], [/\bunleash\b/gi, 'release'],
  [/\bskyrocket\b/gi, 'grow quickly'],
  [/\bdisruptive\b/gi, 'new'],
  [/deep dives?/gi, 'close looks'], [/deep dive/gi, 'close look'],
  [/move the needle/gi, 'make a difference'],
  [/thought leaders?/gi, 'experts'],
  [/end-?to-?end/gi, 'complete'],
  [/best-?in-?class/gi, 'high-quality'],
  [/\brobust\b/gi, 'solid'],
  [/\bscalable\b/gi, 'flexible'],
  [/plongez dans/gi, 'découvrez'], [/plonger dans/gi, 'découvrir'],
  [/révolutionnaires/gi, 'hors norme'], [/révolutionnaire/gi, 'hors norme'],
  [/de pointe/gi, 'moderne'],
  [/propulser/gi, 'faire progresser'],
  [/libérer le potentiel/gi, 'tirer le meilleur'],
  [/sans précédent/gi, 'rare'],
  [/repousser les limites/gi, 'aller plus loin'],
];

function fixCase(match, replacement) {
  if (/^[A-ZÀ-Þ]/.test(match) && /^[a-zà-þ]/.test(replacement))
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  return replacement;
}

function fixBuzzwordsInHtml(html) {
  // replace in text nodes only, skip script/style/code/pre/textarea
  const skip = new Set(['script', 'style', 'code', 'pre', 'textarea']);
  let out = '', last = 0, count = 0;
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>|([^<]+)/g;
  const stack = [];
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    if (m[2] !== undefined) {
      let text = m[2];
      if (!stack.some(t => skip.has(t))) {
        for (const [re, rep] of BUZZWORDS) {
          text = text.replace(re, mt => { count++; return fixCase(mt, rep); });
        }
      }
      out += html.slice(last, m.index) + text;
      last = m.index + m[0].length;
    } else {
      const closing = m[0][1] === '/';
      const name = m[1].toLowerCase();
      if (!closing) stack.push(name); else { const i = stack.lastIndexOf(name); if (i >= 0) stack.splice(i); }
    }
  }
  out += html.slice(last);
  return { html: out, count };
}

module.exports = {
  parseColor, toHex, luminance, contrastRatio, adjustForContrast, rgbToHsl, hslToRgb,
  parseRules, getDecl, setDecl, delDecl, mapDecls, colorTokenIn, replaceColorToken,
  eachColorToken, escapeRegExp,
  scoreFindings, fixers, fixBuzzwordsInHtml,
};
