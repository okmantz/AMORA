// AMORA — handlers for photos, flirting, steamy talk, stories/poems and the practical tools.
// Content is gated twice: Settings → Content level (0 Sweet … 3 Spicy) and the relationship stage (see Engine.buildX → X.level).
// Everything stays suggestive, never graphic, and photos never show nudity (outfits always cover the body).
import { SPICE_INTENTS, OUTFIT_DESC, COLOR_NAMES } from '../data/spice.js';
import { RANGE_INTENTS, STORY, POEM, CURIOUS } from '../data/range.js';
import { choose, asCands, render, tidy } from './templates.js';
import { OUTFIT_LEVEL, SCENES } from '../ui/portrait.js';
import { localAnswer } from '../data/facts.js';
import { tryCalc, tryConvert, tryRoll, tryDays, subjectOf, fmtNum } from './tools.js';

export const SPICE_IDS = new Set(['photo_request', 'photo_spicy', 'what_wearing', 'explicit', 'sexy_talk', 'play_power', 'story_request', 'poem_request']);
export const TOOL_IDS = new Set(['tool_calc', 'tool_convert', 'tool_roll', 'tool_days', 'lookup_q']);
export const DEFS = { ...SPICE_INTENTS, ...RANGE_INTENTS };

const pick = (arr, rng) => (arr && arr.length ? arr[Math.floor(rng() * arr.length)] : undefined);
const C = (t, extra = {}) => ({ k: 'core', t, p: 10, ...extra });
const art = (w) => (/^[aeiou]/i.test(w) ? 'an' : 'a');
const say = (eng, def, X, id, opts = {}) => eng.say(def, X, id, opts)?.text;
const line = (arr, X, extra) => choose(asCands(arr), X, extra)?.text || pick(arr, X.rng);

/** Message when a request is above the current content level. */
function gate(def, X, need) {
  if (X.level >= need) return null;
  if (X.settingLevel >= need) return line(def.tooSoon || def.off, X);       // setting allows it, relationship stage doesn't (yet)
  return line(def.off, X);                                                    // switched off in Settings
}

/* ------------------------------ photos ------------------------------ */
const OUTFIT_WORDS = [
  [/\b(bikini|swimsuit|bathing suit|swimwear|swim)\b/, 'bikini'], [/\b(lingerie|lacy|lace|panties|underwear|thong|bra|bralette)\b/, 'bralette'], [/\b(corset)\b/, 'corset'],
  [/\b(robe|kimono)\b/, 'robe'], [/\b(slip|nightie|nightgown|negligee|nighty|pajamas?|pjs?)\b/, 'slip'], [/\b(camisole|cami|silk top)\b/, 'camisole'],
  [/\b(sports? bra|workout|gym|leggings|yoga)\b/, 'sportsbra'], [/\b(off[- ]the[- ]shoulder|off shoulder)\b/, 'offshoulder'], [/\b(evening dress|gown|party dress|little black dress|dress)\b/, 'dress'], [/\b(sundress)\b/, 'sundress'],
  [/\b(sweater|knit|cozy)\b/, 'sweater'], [/\b(hoodie)\b/, 'hoodie'], [/\b(blazer|office|work outfit|suit)\b/, 'blazer'], [/\b(t-?shirt|tee|casual)\b/, 'tee'],
];
const SCENE_WORDS = [
  [/\b(bed|bedroom|sheets|pillows?|morning|waking|sleepy|duvet)\b/, 'bedroom'], [/\b(beach|pool|sea|ocean|sand|vacation|swim)\b/, 'beach'], [/\b(gym|workout|training)\b/, 'gym'],
  [/\b(caf[eé]|coffee|latte|brunch)\b/, 'cafe'], [/\b(night|out tonight|city|club|party|date night|rooftop)\b/, 'night'], [/\b(garden|park|flowers?|outside|outdoors|picnic)\b/, 'garden'],
];
const TIER1 = ['camisole', 'slip', 'offshoulder', 'sportsbra', 'dress'];
const TIER2 = ['bralette', 'corset', 'robe', 'bikini'];
const TIER0 = ['tee', 'sweater', 'sundress', 'blazer', 'hoodie'];
export const outfitTier = (o) => OUTFIT_LEVEL[o] ?? 0;
const SCENE_FOR = { bikini: 'beach', bralette: 'bedroom', corset: 'bedroom', robe: 'bedroom', slip: 'bedroom', camisole: 'bedroom', sportsbra: 'gym', dress: 'night', sundress: 'garden', sweater: 'cafe', hoodie: 'cafe', blazer: 'cafe', tee: 'studio', offshoulder: 'studio' };

/** Decide what the photo shows. Returns { plan, note } where note says why it changed. */
export function planPhoto(a, X, opts = {}) {
  const spicy = !!opts.spicy;
  const l = a.l, look = X.persona.look, rng = X.rng;
  const wantsNude = /\b(nudes?|naked|topless|nothing on|no clothes|without (any )?clothes|bare|undressed|completely)\b/.test(l);
  let want = opts.outfit || null;
  if (!want) for (const [re, o] of OUTFIT_WORDS) if (re.test(l)) { want = o; break; }
  let scene = null;
  for (const [re, s] of SCENE_WORDS) if (re.test(l)) { scene = s; break; }
  let outfit = want, degraded = false, blocked = false;
  const level = X.level;
  if (!outfit) {
    if (spicy || wantsNude) outfit = level >= 2 ? (outfitTier(look.outfit) === 2 ? look.outfit : pick(TIER2, rng)) : pick(TIER1, rng);
    else outfit = look.outfit || 'tee';
  }
  let tier = outfitTier(outfit);
  if (tier > level) {
    if (want && tier === 2 && level < 2) { blocked = true; }
    else if (want && tier === 1 && level < 1) { blocked = true; }
    if (!blocked || spicy) {
      // degrade quietly to something she is allowed to send at this level
      const allowed = level >= 2 ? TIER2 : level >= 1 ? TIER1 : TIER0;
      if (tier > level) { outfit = pick(allowed, rng); tier = outfitTier(outfit); degraded = true; if (want) blocked = blocked && level < 1; }
    }
  }
  scene = scene || SCENE_FOR[outfit] || 'studio';
  if (outfit === 'bikini' && !scene) scene = 'beach';
  const expr = tier >= 2 ? 'sultry' : tier === 1 ? (rng() < 0.5 ? 'sultry' : 'wink') : (X.traits.shyness > 70 ? 'blush' : rng() < 0.6 ? 'happy' : 'wink');
  const pose = rng() < 0.45 ? 'neutral' : rng() < 0.5 ? 'tilt' : 'hair';
  return { plan: { scene, outfit, expr, pose, tier, ts: Date.now() }, wantsNude, blocked, degraded, spicyAsked: spicy };
}

export function photoPieces(eng, id, a, X, fx, opts = {}) {
  const settings = X.settings;
  const def = DEFS[id === 'photo_spicy' ? 'photo_spicy' : 'photo_request'];
  const rng = X.rng;
  if (settings.photos?.enabled === false) return { pieces: [C("I'd love to, but photos are switched off in Settings right now — you can turn them back on under Content & abilities.")], expr: 'neutral' };
  const spicy = id === 'photo_spicy';
  const r = planPhoto(a, X, { spicy, outfit: opts.outfit });
  const pieces = [];
  const spicyDef = DEFS.photo_spicy;
  // hard "no" to nudity — stated in character, then she offers something covered
  if (r.wantsNude && X.level >= 1) pieces.push(C(line(spicyDef.nude, X)));
  const need = Math.max(r.plan.tier, spicy && !r.wantsNude ? 1 : 0);
  if (r.blocked || (spicy && X.level < 1)) {
    const g = gate(spicyDef, X, Math.max(1, r.plan.tier));
    pieces.push(C(g));
    // offer a tamer one
    X.conv.pending = { type: 'offerphoto', outfit: pick(TIER0, rng) };
    pieces.push({ k: 'follow', t: pick(["Want a cute one instead?", "Can I send you a regular selfie instead?", "How about a sweet one for now?"], rng), p: 7, pending: X.conv.pending });
    return { pieces, expr: 'wink' };
  }
  const useDef = r.plan.tier >= 2 ? spicyDef : DEFS.photo_request;
  const cap = say(eng, useDef, X, r.plan.tier >= 2 ? 'photo_spicy' : 'photo_request', {});
  if (r.degraded && spicy) pieces.push(C(pick(["That's as far as I'll go for now — but I think you'll like this.", "I'll stay a little more covered for the moment. Still pretty, though.", "Let's say this is the polite preview."], rng)));
  if (cap) pieces.push(C(cap));
  const after = line(useDef.after, X);
  if (after) fx.photoAfter = after;
  fx.photo = r.plan;
  return { pieces, expr: r.plan.expr };
}

/* ------------------------------ main dispatcher ------------------------------ */
export function spiceIntent(eng, id, a, X, fx) {
  const rng = X.rng, conv = X.conv, persona = X.persona, look = persona.look;
  const def = DEFS[id];
  switch (id) {
    case 'photo_request': case 'photo_spicy': return photoPieces(eng, id, a, X, fx);
    case 'what_wearing': {
      const col = COLOR_NAMES[look.outfitColor] || '';
      const noun = OUTFIT_DESC[look.outfit] || 'something comfy';
      const outfit = col ? `${art(col)} ${col} ${noun}` : `${art(noun)} ${noun}`;
      const tier = Math.min(X.level, outfitTier(look.outfit));
      const tone = pick(def[`tones${Math.max(0, Math.min(3, tier))}`], rng);
      const t = render(pick(def.core, rng), { get: (n) => (n === 'outfit' ? outfit : n === 'tone' ? tone : undefined) }, rng);
      conv.pending = { type: 'offerphoto', outfit: look.outfit };
      return { pieces: [C(t), { k: 'follow', t: pick(def.offer, rng), p: 7, pending: conv.pending }], expr: tier >= 2 ? 'sultry' : 'blush' };
    }
    case 'explicit': case 'sexy_talk': {
      const need = id === 'explicit' ? 1 : def.need;
      const g = gate(def, X, need);
      if (g) return { pieces: [C(g)], expr: 'blush', follow: [] };
      if (X.level >= 2 && id === 'sexy_talk') conv.heat = (conv.heat || 0) + 1;
      const t = say(eng, def, X, id, {});
      const follow = (def.ask || []).map((e) => ({ e: { t: e.q }, w: 1, p: e.p }));
      return { pieces: t ? [C(t)] : [], follow, expr: 'sultry' };
    }
    case 'play_power': {
      const g = gate(def, X, def.need);
      if (g) return { pieces: [C(g)], expr: 'wink' };
      const lead = /\b(tell me what to do|boss me|be (in charge|bossy|dominant|my (boss|mistress))|take (control|charge)|you'?re (in charge|the boss)|order me|command me|dominate me|punish me|put me in my place|i'?ve been (bad|naughty)|i was (bad|naughty))\b/.test(a.l);
      const sub = { ...def, core: lead ? def.lead : def.follow };
      const t = say(eng, sub, X, id, {});
      const follow = (def.ask || []).map((e) => ({ e: { t: e.q }, w: 1, p: e.p }));
      return { pieces: t ? [C(t)] : [], follow, expr: 'wink' };
    }
    case 'story_request': return storyPieces(a, X, fx);
    case 'poem_request': return poemPieces(a, X, fx);
    default: return { pieces: [], follow: [] };
  }
}

/** Extra heat for goodnight / goodmorning once she and the user are close and the content level allows it. */
export function heatExtra(eng, id, X) {
  if (X.level < 1 || X.stage < 3 || X.conv.noRomance || X.traits.romance < 40) return null;
  if (X.rng() > 0.25 + (X.traits.spice || 0) / 250) return null;
  const def = DEFS[id === 'goodnight' ? 'night_heat' : 'morning_heat'];
  const t = say(eng, def, X, id, {});
  return t ? { k: 'flirt', t, p: 6, o: 6 } : null;
}

/* ------------------------------ stories & poems ------------------------------ */
function storyPieces(a, X, fx) {
  const rng = X.rng, vars = X.vars, l = a.l;
  const wantsHeat = /\b(steamy|spicy|sexy|naughty|hot|dirty|erotic|adult)\b/.test(l);
  const funny = /\b(funny|silly|comedy|humou?r|joke)\b/.test(l);
  const lvl = X.level;
  const parts = [pick(STORY.opens, rng), pick(STORY.mids, rng)];
  let note = null;
  if (wantsHeat && lvl < 2) note = "I'll keep this one sweet — the steamier stories unlock with the Content setting (and a little more time together).";
  if (lvl >= 2 && (wantsHeat || (lvl >= 3 && X.traits.spice > 55 && rng() < 0.5))) {
    parts.push(pick(STORY.steam, rng));
    if (lvl >= 3 && wantsHeat) { parts.push(pick(STORY.heat, rng)); }
    parts.push(pick(STORY.fade, rng));
  } else if (funny || rng() < 0.2) parts.push(pick(STORY.comedic, rng));
  else parts.push(pick(STORY.ends, rng));
  const rendered = parts.map((p) => render(p, vars, rng) || tidy(p.replace(/\{[^}]+\}/g, 'you'))).map((t) => t.charAt(0).toUpperCase() + t.slice(1));
  if (note) rendered.unshift(note);
  fx.bubbles = rendered;
  return { pieces: [C(rendered.join(' '))], expr: 'love', follow: [{ e: { t: 'Want me to tell another one?' }, w: 1, p: 'yesno' }] };
}
function poemPieces(a, X, fx) {
  const rng = X.rng, spicy = /\b(sexy|steamy|spicy|naughty)\b/.test(a.l) && X.level >= 2;
  const lines = [pick(POEM.open, rng), pick(POEM.mid, rng), spicy ? pick(POEM.spicy, rng) : pick(POEM.mid.filter((m) => !m.startsWith('I')), rng), pick(POEM.close, rng)];
  const poem = lines.join('\n');
  fx.bubbles = [`${pick(['Okay, here goes —', 'Something I wrote for you:', 'Give me a second… okay:'], rng)}\n${poem}`];
  return { pieces: [C(poem)], expr: 'love' };
}

/* ------------------------------ tools ------------------------------ */
export function toolIntent(eng, id, a, X, fx) {
  const rng = X.rng, conv = X.conv;
  switch (id) {
    case 'tool_calc': {
      const r = tryCalc(a.raw);
      if (!r) return null;
      const v = fmtNum(Math.round(r.value * 1e8) / 1e8);
      const lead = pick(['That comes to', 'I get', 'The answer is', 'Quick maths:'], rng);
      return { pieces: [C(`${lead} ${v}${r.extra ? ` (${r.extra})` : ''}.`, { calc: true })], expr: 'think', follow: [] };
    }
    case 'tool_convert': {
      const r = tryConvert(a.raw);
      if (!r) return null;
      return { pieces: [C(`${pick(['Here you go:', 'Quick conversion —', 'So:'], rng)} ${r.text}.`)], expr: 'think', follow: [] };
    }
    case 'tool_roll': {
      const r = tryRoll(a.raw, rng);
      if (!r) return null;
      const lead = { coin: ['Flipping… it lands on', 'The coin says'], dice: ['Rolling… you got', 'The dice say'], number: ['My number is', 'How about'], pick: ['I pick', 'Go with', 'My vote:'] }[r.kind];
      return { pieces: [C(`${pick(lead, rng)} ${r.text}${r.kind === 'pick' ? '. Trust me on this one.' : '!'}`)], expr: 'wink', follow: [] };
    }
    case 'tool_days': {
      const r = tryDays(a.raw, X.now, X.mem);
      if (!r) return null;
      return { pieces: [C(r.text)], expr: 'think', follow: [] };
    }
    case 'lookup_q': return lookupPieces(eng, a, X, fx);
  }
  return null;
}

/** Subject lookup: asks the app to fetch a summary when Lookup is enabled; otherwise explains how to switch it on. */
export function lookupPieces(eng, a, X, fx, quiet = false) {
  const subj = subjectOf(a.raw);
  const local = localAnswer(a.raw, subj?.subject);
  if (local) return { pieces: [C(local)], expr: 'think', follow: [] };
  if (!subj) return null;
  const on = !!X.settings.lookup?.enabled;
  if (on) {
    fx.lookup = subj;
    const lead = pick(['Let me look that up for you…', 'Good question — checking Wikipedia…', 'One sec, I\'ll look it up…', 'Hmm, let me find out…'], X.rng);
    return { pieces: [C(lead)], expr: 'think', follow: [] };
  }
  if (quiet) return null;
  const hint = pick(["I don't have that one in my head — but if you switch on Knowledge lookup (Settings → Content & abilities), I can check Wikipedia for you.", "That's beyond what I know offline. Turn on Knowledge lookup in Settings and I'll look it up properly — or tell me what you know and I'll listen!", "I'd only be guessing, and I'd rather not. Knowledge lookup (in Settings) lets me check Wikipedia — want to enable it?"], X.rng);
  return { pieces: [C(subj.kind === 'define' || !X.conv.lookupHinted ? hint : pick(CURIOUS, X.rng))], expr: 'think', follow: [] };
}
