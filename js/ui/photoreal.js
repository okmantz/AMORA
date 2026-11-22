// AMORA — photoreal portrait library. Her avatar and her photos are real photographs from assets/portraits/,
// matched to the look you choose (skin tone, hair, body type, age). No drawn or cartoon art.
//
// To use your own / higher-resolution images: replace the .jpg files (keep the names) or add entries to
// assets/portraits/manifest.json — see assets/portraits/README.md.
import { OPTIONS } from '../data/presets.js';

const BASE = 'assets/portraits/';
let DB = [];
let loading = null;
const memo = new Map();

/** Fetch the portrait manifest once. Resolves true when portraits are available. */
export function loadPortraits() {
  if (loading) return loading;
  loading = fetch(BASE + 'manifest.json')
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => {
      DB = j && Array.isArray(j.portraits) ? j.portraits.filter((p) => p && p.id && p.file) : [];
      DB.forEach((p) => { p.crop = p.crop || (String(p.src || '').startsWith('A') ? 'face' : 'bust'); });
      memo.clear();
      return DB.length > 0;
    })
    .catch(() => false);
  return loading;
}
export const portraitsReady = () => DB.length > 0;
export const portraitList = () => DB;
export const portraitById = (id) => DB.find((p) => p.id === id) || null;
export const portraitSrc = (p) => BASE + p.file;
/** CSS object-position that keeps the face centred when the image is cropped square. */
export const portraitFocus = (p) => (p.crop === 'face' ? '50% 32%' : '50% 16%');

export const AGE_BANDS = [['young', 'Young adult', 25], ['mid', 'Thirties–forties', 38], ['mature', 'Fifties', 52], ['senior', 'Sixties+', 66]];
export const ageBand = (age) => (age >= 60 ? 'senior' : age >= 45 ? 'mature' : age >= 30 ? 'mid' : 'young');
export const bandAge = (band) => (AGE_BANDS.find((b) => b[0] === band) || AGE_BANDS[0])[2];

const rgb = (hex) => { const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); const n = m ? parseInt(m[1], 16) : 0x808080; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const dist = (a, b) => { const x = rgb(a), y = rgb(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };
export function skinIndex(hex) {
  let best = 0, bd = 1e9;
  OPTIONS.skin.forEach((s, i) => { const d = dist(hex, s[0]); if (d < bd) { bd = d; best = i; } });
  return best;
}
const STYLE_GROUPS = [['long', 'straight', 'wavy', 'lob'], ['bob', 'pixie', 'buzz'], ['curls', 'afro'], ['boxbraids', 'braid'], ['bun', 'ponytail']];
const BODY_ORDER = ['slender', 'athletic', 'average', 'curvy', 'plus'];
const sameGroup = (a, b) => STYLE_GROUPS.some((g) => g.includes(a) && g.includes(b));

/** How much clothing a portrait shows: 0 covered, 1 straps / camisole, 2 lace or bralette. Face-only crops with straps are treated as tame. */
export function allowedAtTier(p, tier) {
  if (tier >= 2) return true;
  if (tier === 1) return p.wear <= 1;
  return p.wear === 0 || (p.wear === 1 && p.crop === 'face');
}

function score(ref, p) {
  let s = 0;
  s -= Math.abs(skinIndex(ref.skin) - p.skin) * 3.2;
  const hc = dist(ref.hairColor, p.hairColor);
  s += hc < 8 ? 4 : Math.max(-4, 3 - hc / 45);
  s += ref.hairStyle === p.hairStyle ? 4 : sameGroup(ref.hairStyle, p.hairStyle) ? 1.6 : -1.5;
  const bi = BODY_ORDER.indexOf(ref.body), pi = BODY_ORDER.indexOf(p.body);
  s += bi === pi ? 2.5 : -Math.abs(bi - pi) * 1.4;
  s += ref.age === p.age ? 5 : -Math.abs(AGE_BANDS.findIndex((b) => b[0] === ref.age) - AGE_BANDS.findIndex((b) => b[0] === p.age)) * 4;
  if (ref.freckles && p.freckles) s += 1;
  if (p.crop === 'bust') s += 1.8; // taller, higher-resolution frames look best at large sizes
  return s;
}

const refOf = (persona) => {
  const L = persona.look || {};
  const pin = L.portraitId && portraitById(L.portraitId);
  if (pin) return { ref: { skin: OPTIONS.skin[pin.skin][0], hairColor: pin.hairColor, hairStyle: pin.hairStyle, body: pin.body, age: pin.age, freckles: pin.freckles }, pin };
  return { ref: { skin: L.skin || OPTIONS.skin[1][0], hairColor: L.hairColor || OPTIONS.hairColor[1][0], hairStyle: L.hairStyle || 'long', body: L.bodyType || 'average', age: ageBand(persona.age || 25), freckles: !!L.freckles }, pin: null };
};

/** Ranked list of portraits for a persona's look (best first). */
export function rankPortraits(persona, { tier = 2 } = {}) {
  const { ref } = refOf(persona);
  return DB.filter((p) => allowedAtTier(p, tier)).map((p) => [score(ref, p), p]).sort((a, b) => b[0] - a[0]).map((x) => x[1]);
}

/**
 * The portrait that represents her. A pinned portrait wins; otherwise the closest match to her look.
 * `tier` (0–2) limits how revealing the frame may be when it is used for a photo she sends.
 */
export function pickPortrait(persona, { tier } = {}) {
  if (!DB.length) return null;
  const L = persona.look || {};
  const t = tier === undefined ? 2 : tier;
  const key = [L.portraitId, L.skin, L.hairColor, L.hairStyle, L.bodyType, L.freckles, persona.age, t].join('|');
  if (memo.has(key)) return memo.get(key);
  const { pin } = refOf(persona);
  let out;
  if (pin && allowedAtTier(pin, t)) out = pin;
  else {
    const ranked = rankPortraits(persona, { tier: t });
    out = ranked.length ? ranked[0] : pin || DB[0];
  }
  if (memo.size > 400) memo.clear();
  memo.set(key, out);
  return out;
}
