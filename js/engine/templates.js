// AMORA — template rendering, eligibility checks and weighted, repetition-aware selection.
import { hash } from '../core/util.js';

export const entry = (e) => (typeof e === 'string' ? { t: e } : e);

/** Render a template. Returns null when a required variable (e.g. {mem:pet}) is unknown. */
export function render(tpl, vars, rng, extra) {
  let ok = true;
  let s = tpl.replace(/\{([^{}|]*\|[^{}]*)\}/g, (_, alts) => {
    const list = alts.split('|');
    return list[Math.floor(rng() * list.length)];
  });
  s = s.replace(/\{([a-zA-Z_0-9]+(?::[a-zA-Z_0-9]+)?)\}/g, (m, name) => {
    const v = vars.get(name, extra);
    if (v === undefined || v === null || v === '') { ok = false; return ''; }
    return String(v);
  });
  if (!ok) return null;
  return tidy(s);
}

export function tidy(s) {
  return s.replace(/\s+/g, ' ').replace(/\s+([,.!?;:])/g, '$1').replace(/([,;])\s*([.!?])/g, '$2').replace(/^[\s,;]+/, '').trim();
}

/** Conditions an entry can carry: min/max (stage), mode, tr (trait ranges). */
export function eligible(e, X) {
  if (e.min != null && X.stage < e.min) return false;
  if (e.max != null && X.stage > e.max) return false;
  if (e.lvl != null && (X.level ?? 1) < e.lvl) return false;
  if (e.mode) { const m = Array.isArray(e.mode) ? e.mode : [e.mode]; if (!m.includes(X.mode)) return false; }
  if (e.tr) for (const [k, [lo, hi]] of Object.entries(e.tr)) { const v = X.traits[k] ?? 50; if (v < lo || v > hi) return false; }
  return true;
}

/**
 * Pick from weighted candidates [{e: entry|string, w}], skipping recently used lines.
 * Returns {text, raw} or null. Marks the choice as used.
 */
export function choose(cands, X, extra) {
  const rng = X.rng;
  let pool = cands.map((c) => ({ e: entry(c.e), w: c.w })).filter((c) => c.w > 0 && eligible(c.e, X));
  const fresh = pool.filter((c) => !X.used.has(hash(c.e.t)));
  if (fresh.length) pool = fresh;
  let guard = 0;
  while (pool.length && guard++ < 40) {
    const total = pool.reduce((n, c) => n + c.w, 0);
    let r = rng() * total, idx = 0;
    for (; idx < pool.length; idx++) { r -= pool[idx].w; if (r <= 0) break; }
    idx = Math.min(idx, pool.length - 1);
    const c = pool[idx];
    const text = render(c.e.t, X.vars, rng, extra);
    if (text) { X.markUsed(c.e.t); return { text, raw: c.e.t, entry: c.e }; }
    pool.splice(idx, 1);
  }
  return null;
}

export const asCands = (arr, w = 1) => (arr || []).map((e) => ({ e, w }));
