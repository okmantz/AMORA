// AMORA — the rule-based conversation engine. No AI, no network: intent scoring, topic tracking, emotional state,
// memory, personality blending and template assembly. See docs/ENGINE.md for the pipeline.
import { makeRng, clamp, hash, dayKey } from '../core/util.js';
import { analyze, extractFacts, reflectable, keyword, cap, fmtMD } from './text.js';
import { matchIntents } from './intents.js';
import { detectTopics, TOPIC_MAP, TOPICS } from './topics.js';
import { DB } from '../data/dialogue.js';
import { TOPIC_DATA, TRANSITIONS, TOPIC_RETURN } from '../data/topics-data.js';
import { SYS } from '../data/system-data.js';
import { OPTIONS } from '../data/presets.js';
import { render, choose, asCands, entry, eligible, tidy } from './templates.js';
import { applyStyle, emojiFor, stripEmoji, addNickname } from './style.js';
import { learn, summarize, addMention, upcomingDates } from './memory.js';
import { triggerMatches, conditionsMet, markRule } from './rules.js';
import { effectiveStage, MODES, STATUS_LABEL, STAGES } from './relationship.js';

const STYLE_POOLS = { playful: 'playfulness', sarcastic: 'sarcasm', shy: 'shyness', romantic: 'romance', confident: 'confidence', affectionate: 'affection', humor: 'humor', smart: 'intelligence', expressive: 'expressiveness' };
const NO_EMO = new Set(['playful', 'sarcastic', 'humor', 'expressive']);
const INFO = new Set(['recall_all', 'recall_name', 'time_date', 'identity_ai', 'limits', 'knowledge_q', 'forget_cmd', 'remember_cmd', 'weather']);
const REACT_GROUP = { compliment: 'compliment', tease: 'teasing', love_you: 'affection', hug: 'affection', kiss: 'affection', miss_you: 'affection', disagree: 'disagreement', opinion: 'question', her_story: 'question' };
const ROMANCE_STAGE = [0.05, 0.3, 0.6, 1, 1.2, 1.3];
const FLIRTY_OK = new Set(['greeting', 'how_are_you', 'whats_up', 'compliment', 'thanks', 'miss_you', 'hug', 'goodnight', 'goodmorning', 'farewell', 'laugh', 'share_day', 'excited', 'her_looks', 'date_invite', 'love_you', 'ok_filler', 'compliment_user']);
const PREF_LINES = ["Ooh, {topic} is one of my favorite things to talk about!", "You picked one of my favorite topics — {topic}!", "I could chat about {topic} for hours."];
const P = { core: 10, ack: 9, checkin: 9, rule: 9, second: 8, follow: 7, topic: 6, callback: 4, flirt: 4, opener: 3, quirk: 2, note: 1 };
const sw = (t) => Math.max(0, t - 30) / 35;
const pickOne = (arr, rng) => (arr && arr.length ? arr[Math.floor(rng() * arr.length)] : undefined);
const label = (list, v) => (list.find((x) => x[0] === v) || [, v])[1];
const article = (s) => (/^[aeiou]/i.test(s) ? 'an' : 'a');
const AESTHETIC_COLOR = { romantic: 'rose pink', cozy: 'warm amber', elegant: 'deep burgundy', sporty: 'electric blue', bookish: 'forest green', edgy: 'midnight black', sunny: 'golden yellow', dreamy: 'soft lavender' };
const DAYPARTS = (d) => { const h = d.getHours(); return h < 5 ? 'night' : h < 12 ? 'morning' : h < 17 ? 'afternoon' : h < 21 ? 'evening' : 'night'; };

export class Engine {
  constructor(seed) { this.rng = makeRng(seed); }

  /* ----------------------------- context ----------------------------- */
  buildX(c, a) {
    const rng = this.rng, persona = c.persona, mem = c.mem, rel = c.rel, conv = (c.conv ||= {}), settings = c.settings || {};
    const now = c.now || new Date();
    const realStage = effectiveStage(rel, settings);
    const stage = settings.relationship?.gating === false ? 5 : realStage;
    const modeKey = MODES[c.mode] ? c.mode : 'casual';
    const delta = MODES[modeKey].delta;
    const tr = {};
    for (const k of Object.keys(persona.traits)) tr[k] = clamp(persona.traits[k] + (delta[k] || 0), 0, 100);
    tr.shyness = clamp(tr.shyness - stage * 4, 0, 100);
    tr.confidence = clamp(tr.confidence + stage * 2, 0, 100);
    tr.affection = clamp(tr.affection + stage * 2, 0, 100);
    if (conv.noRomance) tr.romance = 0;
    const used = new Set([...(mem.recent || []), ...(conv.used || [])]);
    const cache = {};
    const nicks = (persona.style.nicknames || []).filter(Boolean);
    const L = persona.interests;
    const X = {
      rng, persona, mem, rel, conv, settings, now, a, traits: tr, stage, realStage, mode: modeKey, modeDef: MODES[modeKey], used,
      markUsed(t) { const h = hash(t); used.add(h); (conv.used ||= []).push(h); (mem.recent ||= []).push(h); if (conv.used.length > 120) conv.used.shift(); if (mem.recent.length > 160) mem.recent.shift(); },
    };
    const interest = (key, list, uniqueKey) => {
      if (!list || !list.length) return undefined;
      if (cache[uniqueKey || key] === undefined) {
        const others = cache[key] !== undefined ? list.filter((x) => x !== cache[key]) : list;
        cache[uniqueKey || key] = pickOne(others.length ? others : list, rng);
      }
      return cache[uniqueKey || key];
    };
    X.vars = {
      get(name, extra) {
        if (extra && name in extra) return extra[name];
        if (name.startsWith('mem:')) {
          const k = name.slice(4);
          if (k === 'family') return mem.family[mem.family.length - 1];
          if (k === 'like') return pickOne(mem.likes, rng);
          if (k === 'hobby') return pickOne(mem.hobbies, rng);
          const f = mem.facts[k];
          return f ? String(f.v) : undefined;
        }
        switch (name) {
          case 'user': return mem.facts.name?.v || c.settings?.userName || (nicks.length && stage >= 2 ? pickOne(nicks, rng) : 'you');
          case 'nick': return nicks.length && stage >= 1 ? (cache.nick ||= pickOne(nicks, rng)) : (mem.facts.name?.v || c.settings?.userName || 'you');
          case 'me': return persona.name;
          case 'age': return String(persona.age);
          case 'hobby': return interest('hobby', L.hobbies);
          case 'hobby2': { interest('hobby', L.hobbies); return interest('hobby', L.hobbies, 'hobby2'); }
          case 'music': return interest('music', L.music);
          case 'movie': return interest('movie', L.movies);
          case 'book': return interest('book', L.books);
          case 'activity': return interest('activity', L.activities);
          case 'food': return interest('food', L.foods);
          case 'color': return AESTHETIC_COLOR[persona.look.aesthetic] || 'rose pink';
          case 'daypart': return DAYPARTS(now);
          case 'hair': return `${label(OPTIONS.hairColor, persona.look.hairColor).toLowerCase()} ${label(OPTIONS.hairStyle, persona.look.hairStyle).toLowerCase()} hair`;
          case 'eyes': return `${label(OPTIONS.eyeColor, persona.look.eyeColor).toLowerCase()} eyes`;
          case 'outfit': { const o = label(OPTIONS.outfit, persona.look.outfit).toLowerCase(); return `${article(o)} ${o}`; }
          case 'aesthetic': return label(OPTIONS.aesthetic, persona.look.aesthetic).toLowerCase();
          case 'bio': return persona.bio || `I'm ${persona.name}, ${persona.age}, and I like ${pickOne(L.hobbies, rng) || 'good conversation'}.`;
          case 'status': return rel.status === 'custom' ? (rel.customStatus || 'something special') : (STATUS_LABEL[rel.status] || 'friends').toLowerCase();
          case 'stage_name': return STAGES[realStage].name.toLowerCase();
          case 'shared': return pickOne(rel.shared || [], rng);
          case 'word': return conv.kw;
          case 'topic': return conv.topicLabel;
          case 'reflect': return conv.reflect;
          default: return undefined;
        }
      },
    };
    return X;
  }

  gather(def, X, id, opts = {}) {
    const c = [], { stage, traits: tr, persona } = X;
    const coreOk = def.min == null || stage >= def.min;
    const early = def.early ? Object.keys(def.early).filter((k) => stage <= +k).flatMap((k) => def.early[k]) : [];
    if (early.length) c.push(...asCands(early, 4));
    if (coreOk && def.core) c.push(...asCands(def.core, early.length ? 0.6 : 1));
    for (const [pool, trait] of Object.entries(STYLE_POOLS)) {
      if (!def[pool] || (opts.emo && NO_EMO.has(pool))) continue;
      let w = sw(tr[trait]);
      if (pool === 'romantic') w *= ROMANCE_STAGE[stage];
      if (pool === 'affectionate' && opts.emo) w = Math.max(w, 0.8);
      c.push(...asCands(def[pool], w));
    }
    if (def.stage) for (const [k, arr] of Object.entries(def.stage)) if (stage >= +k) c.push(...asCands(arr, stage === +k ? 2 : 0.9));
    if (def.mode?.[X.mode]) c.push(...asCands(def.mode[X.mode], 2.5));
    const grp = REACT_GROUP[id];
    if (grp && def.react && stage >= (def.reactMin || 0)) {
      const st = persona.reactions[grp];
      if (def.react[st]) c.push(...asCands(def.react[st], 5));
    }
    return c;
  }

  say(def, X, id, opts, extra) { return choose(this.gather(def, X, id, opts), X, extra); }

  /* ------------------------------ main ------------------------------ */
  respond(text, c) {
    const rng = this.rng;
    const conv = (c.conv ||= {});
    conv.turn = (conv.turn || 0) + 1;
    conv.moods ||= [];
    const a = analyze(text);
    const X = this.buildX(c, a);
    const persona = c.persona, mem = c.mem;
    const fx = { fam: 1, aff: 0, learned: [], intent: null, topic: null, expression: 'neutral', noPoints: false };
    const dbg = { hits: [], topics: [] };

    conv.kw = keyword(a) || undefined;
    conv.reflect = reflectable(a.raw) || undefined;
    conv.moods.push(a.s.score); if (conv.moods.length > 8) conv.moods.shift();
    conv.mood = clamp((conv.mood || 0) * 0.6 + a.s.score * 0.4, -1, 1);

    const finish = (pieces, meta = {}) => this.compose(pieces, X, a, fx, { ...meta, dbg });

    // 1. safety: crisis and minors are handled before anything else and cannot be overridden by custom rules
    const hits = matchIntents(a);
    dbg.hits = hits.slice(0, 4).map((h) => ({ id: h.id, score: Math.round(h.score) }));
    if (hits[0]?.id === 'crisis') {
      conv.pending = null; conv.scenario = null; fx.intent = 'crisis'; fx.expression = 'caring'; fx.noPoints = true;
      return finish([{ k: 'core', t: pickOne(SYS.crisis, rng), p: P.core }], { skipStyle: true, emo: true, noTrim: true, noEmoji: true });
    }
    const facts = extractFacts(a.raw, conv.pending?.type);
    if (facts.some((f) => f.k === 'age' && f.v < 18)) {
      conv.noRomance = true; conv.pending = null; fx.intent = 'minor'; fx.noPoints = true;
      return finish([{ k: 'core', t: pickOne(SYS.minor, rng), p: P.core }], { skipStyle: true, noTrim: true, noEmoji: true });
    }
    const safeFacts = facts.filter((f) => !(f.k === 'age' && (f.v < 18 || f.v > 110)));

    // 2. scenarios
    const scen = this.scenarioTurn(text, a, X, c, hits, fx);
    // 3. memory
    const learned = learn(mem, safeFacts);
    fx.learned = learned;
    const topicHits = detectTopics(a.l);
    dbg.topics = topicHits.map((t) => t.id);
    const topicIds = topicHits.map((t) => t.id);
    if (scen) return finish(scen.pieces, { expr: scen.expr });
    if (topicHits[0] && a.len > 3) addMention(mem, topicHits[0].id, conv.kw || topicHits[0].id);

    const ackPieces = this.ackFacts(learned, X, hits[0]?.id);

    // 4. custom rules (keyword/regex triggers)
    const rules = (persona.rules || []).slice().sort((x, y) => y.priority - x.priority);
    const before = [], after = [];
    let replaced = null;
    for (const r of rules) {
      if (r.match === 'intent' || r.intent) continue;
      if (!triggerMatches(r, a) || !conditionsMet(r, X, a, topicIds, conv, rng)) continue;
      const t = this.ruleText(r, X);
      if (!t) continue;
      markRule(r, conv);
      const piece = { k: 'rule', t, p: r.placement === 'replace' ? P.core : P.rule, expr: r.expression, pending: r.setPending };
      if (r.placement === 'replace') { replaced = piece; break; }
      (r.placement === 'before' ? before : after).push(piece);
    }
    if (replaced) {
      if (replaced.pending) conv.pending = { type: replaced.pending };
      fx.intent = 'custom-rule'; fx.expression = replaced.expr || 'happy';
      return finish([...ackPieces, ...before, replaced, ...after], { expr: replaced.expr });
    }

    // 5. prohibited topics (user-configured boundaries)
    const proh = this.prohibited(persona, a, topicIds);
    if (proh) {
      fx.intent = 'deflect'; fx.expression = 'neutral'; conv.pending = null;
      return finish([{ k: 'core', t: choose(asCands(SYS.deflect), X)?.text || SYS.deflect[0], p: P.core }], { emo: true });
    }

    // 6. pending question (she asked something last turn)
    const top = hits[0];
    let synth = null;
    if ((!top || top.meta.pr <= 7) && a.len >= 3) {
      if (a.s.score <= -0.3) synth = { id: 'vent', score: 70, meta: { pr: 9, emo: true, expr: 'caring', aff: 1, fam: 1 } };
      else if (a.s.score >= 0.45 && !a.isQuestion) synth = { id: 'good_share', score: 70, meta: { pr: 8, expr: 'happy', aff: 1, fam: 1 } };
    }
    let pend = null, p0 = null;
    if (conv.pending) {
      p0 = conv.pending;
      const kind0 = (p0.type || '').split(':')[0];
      const strong = (top && top.meta.pr >= 9 && !['yes', 'no', 'maybe', 'thanks'].includes(top.id))
        || (synth && !['whathappened', 'listen', 'day', 'feeling', 'wyr', 'tot', 'joke', 'yesno'].includes(kind0))
        || (kind0 === 'joke' && (a.len > 5 || (a.isQuestion && top && top.meta.pr >= 5)))
        || (a.isQuestion && top && top.meta.pr >= 5 && ['whathappened', 'listen', 'open', 'topicq', 'day', 'feeling', 'hobby', 'fav'].includes(kind0));
      conv.pending = null;
      if (!strong) pend = this.handlePending(p0, a, X, hits, fx);
    }

    // 7. choose the primary intent
    let primary = pend ? null : top;
    if (!pend && synth) primary = synth;
    if (primary && primary.id === 'knowledge_q' && hits[1] && hits[1].meta.pr > 6) primary = hits[1];
    const second = !pend && primary && hits.includes(primary) ? hits.find((h) => h !== primary && h.meta.combo && h.score >= 55 && !['yes', 'no', 'maybe', 'ok_filler'].includes(h.id) && h.id !== primary.id) : null;
    const emo = !!(primary && primary.meta.emo) || (conv.mood < -0.5 && a.s.neg > 1);
    fx.intent = pend ? `pending:${(p0 && p0.type) || ''}` : primary?.id || null;

    const pieces = [...ackPieces];
    let expr = pend?.expr || primary?.meta.expr || null;
    let followSources = [];
    let hasCore = false, forceFollow = false;

    // custom rules bound to a built-in intent
    let intentRule = null;
    if (primary) {
      for (const r of rules) {
        if (!(r.match === 'intent' || r.intent) || r.intent !== primary.id) continue;
        if (!conditionsMet(r, X, a, topicIds, conv, rng)) continue;
        const t = this.ruleText(r, X);
        if (!t) continue;
        markRule(r, conv);
        const pc = { k: 'rule', t, p: r.placement === 'replace' ? P.core : P.rule, expr: r.expression, pending: r.setPending };
        if (r.placement === 'replace') { intentRule = pc; break; }
        (r.placement === 'before' ? before : after).push(pc);
      }
    }
    pieces.push(...before);

    if (pend) {
      pieces.push(...pend.pieces);
      hasCore = true;
      followSources = pend.follow || [];
    } else if (intentRule) {
      pieces.push(intentRule);
      hasCore = true;
      if (intentRule.pending) conv.pending = { type: intentRule.pending };
      if (intentRule.expr) expr = intentRule.expr;
    } else if (primary) {
      if (second && ['greeting', 'laugh'].includes(second.id)) {
        const s = this.say(DB.intent[second.id], X, second.id, { emo });
        if (s) pieces.push({ k: 'second', t: s.text, p: P.second, o: -1 });
      }
      const r = this.intentPieces(primary, a, X, emo, fx, topicHits);
      pieces.push(...r.pieces);
      followSources = r.follow || [];
      hasCore = r.pieces.some((x) => x.p >= P.core);
      if (r.expr) expr = r.expr;
      if (second && !['greeting', 'laugh'].includes(second.id)) {
        const s = this.say(DB.intent[second.id], X, second.id, { emo });
        if (s) pieces.push({ k: 'second', t: s.text, p: P.second, o: 4 });
      }
      fx.aff += primary.meta.aff || 0; fx.fam += primary.meta.fam || 0;
    }

    // 8. topics: either the main answer (no strong intent) or an enrichment
    const weakIntent = !primary || primary.meta.pr <= 7 || ['knowledge_q', 'opinion', 'share_day'].includes(primary?.id);
    let topicId = topicHits[0]?.id || null;
    if (!topicId && !pend && weakIntent && conv.topic && conv.topicAge < 3 && a.len >= 3 && a.len <= 12 && !a.isQuestion) topicId = conv.topic;
    if (topicId && !emo && (weakIntent || !hasCore) && !pend) {
      const tp = this.topicPieces(topicId, a, X, hasCore, primary, { noFacts: ackPieces.length > 0 || primary?.id === 'starter' });
      if (primary?.id === 'starter') forceFollow = true;
      pieces.push(...tp.pieces);
      if (tp.pieces.length && !hasCore) hasCore = true;
      if (tp.pieces.length) followSources = followSources.length ? followSources : tp.follow;
      fx.topic = topicId; fx.fam += 1;
      if (tp.expr && !expr) expr = tp.expr;
    }
    if (topicId) { conv.topicLabel = TOPIC_MAP[topicId]?.label.toLowerCase(); }

    // 9. fallback when nothing produced a core line
    if (!hasCore && ackPieces.length) {
      hasCore = true;
      followSources = SYS.getToKnow.map((q) => ({ e: { t: q.q }, w: 1, p: q.p }));
      forceFollow = true;
    }
    if (!hasCore) {
      const fb = this.fallbackPieces(a, X);
      pieces.push(...fb.pieces);
      followSources = followSources.length ? followSources : fb.follow;
      expr = expr || fb.expr;
    }

    // 10. enrichments: mood check-in, callbacks, flirt, quirks
    const recent = conv.moods.slice(-3);
    if (!emo && recent.length === 3 && recent.every((m) => m < -0.15) && conv.turn - (conv.lastCheckin ?? -99) > 10 && !pend) {
      pieces.push({ k: 'checkin', t: pickOne(SYS.checkin, rng), p: P.checkin, o: 6 });
      conv.lastCheckin = conv.turn;
    }
    const quiet = emo || INFO.has(primary?.id) || ['kiss', 'marry'].includes(primary?.id) || ['joke', 'wyr', 'tot'].includes(conv.pending?.type);
    if (!quiet) {
      const cb = this.callback(X, a, !!primary && primary.meta.pr > 9);
      if (cb) pieces.push(cb);
      const fl = ackPieces.length ? null : this.flirt(X, a, primary?.id, topicId);
      if (fl) pieces.push(fl);
      const q = this.quirk(X);
      if (q) pieces.push(q);
    }
    if (X.settings.chat?.honestyNotes && conv.turn % 45 === 0) pieces.push({ k: 'note', t: pickOne(SYS.honesty, rng), p: P.note, o: 11 });
    pieces.push(...after);

    // 11. follow-up question
    const follow = this.followup(X, a, pieces, followSources, emo, !!pend, topicId, forceFollow);
    if (follow) pieces.push(follow);

    fx.expression = expr || (a.s.score > 0.25 ? 'happy' : a.s.score < -0.25 ? 'caring' : 'neutral');
    fx.fam += a.len > 8 ? 1 : 0;
    return finish(pieces, { emo, expr: fx.expression, info: INFO.has(primary?.id) || quiet });
  }

  /* --------------------------- intent bodies --------------------------- */
  intentPieces(hit, a, X, emo, fx, topicHits) {
    const id = hit.id, rng = X.rng, def = DB.intent[id], conv = X.conv, mem = X.mem;
    const pieces = [];
    const core = (t, extra = {}) => pieces.push({ k: 'core', t, p: P.core, ...extra });
    let follow = [], expr = null;
    const askOf = () => (def?.ask || []).map((e) => ({ e: { t: e.q, ...(e.min ? { min: e.min } : {}) }, w: 1, p: e.p }));

    switch (id) {
      case 'time_date': {
        const d = X.now;
        const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const date = d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
        core(pickOne([`It's ${time} on ${date} — at least on your device's clock.`, `According to your device it's ${time}, ${date}.`, `Right now it's ${time}, ${date}. (I can only read your device's clock — no internet needed!)`], rng));
        follow = [{ e: { t: 'Is it a good time for a break?' }, w: 1, p: 'yesno' }];
        break;
      }
      case 'recall_name': {
        const has = mem.facts.name?.v;
        const s = has ? this.say({ core: def.core }, X, id, {}) : { text: pickOne(def.none, rng) };
        core(s.text);
        if (!has) conv.pending = { type: 'name' };
        break;
      }
      case 'recall_all': {
        const lines = summarize(mem);
        if (!lines.length) core(pickOne(def.none, rng));
        else core(`${pickOne(def.head, rng)} ${lines.slice(0, 8).join('. ')}. ${pickOne(def.tail, rng)}`);
        break;
      }
      case 'joke_request': return this.jokePieces(X, def);
      case 'game': return this.gamePieces(a, X, def);
      case 'starter': {
        if (topicHits[0]) break;
        const s = this.say(def, X, id, {});
        const q = this.starterQuestion(X);
        if (s) core(s.text + ' ' + q);
        conv.pending = { type: 'open' };
        break;
      }
      case 'her_favorite': {
        const cat = /music|song|band|artist|listen/.test(a.l) ? 'music' : /movie|film|show|watch/.test(a.l) ? 'movie' : /book|read/.test(a.l) ? 'book' : /food|eat|drink/.test(a.l) ? 'food' : /colou?r/.test(a.l) ? 'color' : /activity|hobby|do for fun/.test(a.l) ? 'activity' : 'any';
        const s = choose(asCands(def.by[cat]), X) || choose(asCands(def.by.any), X);
        if (s) core(s.text);
        follow = [{ e: { t: `What's yours${cat === 'any' ? '?' : ` — your favorite ${cat === 'activity' ? 'thing to do' : cat}?`}` }, w: 1, p: cat === 'any' ? 'open' : `fav:${cat}` }];
        break;
      }
      case 'knowledge_q': {
        const s = this.say(def, X, id, {});
        if (s) core(s.text);
        const t = topicHits[0]?.id;
        const facts = t && TOPIC_DATA[t]?.facts;
        const f = facts && choose(asCands(facts), X);
        if (f) pieces.push({ k: 'topic', t: `${pickOne(def.factIntro, rng)} ${f.text}`, p: P.topic, o: 5 });
        else follow = [{ e: { t: 'Want a fun fact I do know instead?' }, w: 1, p: 'yesno:fact' }];
        expr = 'think';
        break;
      }
      case 'insult': {
        const s = this.say(def, X, id, { emo: true });
        if (s) core(s.text);
        fx.aff += 0; fx.fam = 0;
        follow = askOf();
        break;
      }
      case 'farewell': case 'goodnight': {
        const s = this.say(def, X, id, { emo });
        if (s) core(s.text);
        conv.pending = null;
        break;
      }
      default: {
        if (!def) break;
        const s = this.say(def, X, id, { emo });
        if (s) core(s.text);
        follow = askOf();
        if (id === 'greeting' || id === 'goodmorning') this.dateGreeting(X, pieces);
      }
    }
    return { pieces, follow, expr };
  }

  dateGreeting(X, pieces) {
    const up = upcomingDates(X.mem, X.now, 7).filter((d) => d.in <= 7);
    const d = up[0];
    if (!d) return;
    if (d.in === 0) pieces.push({ k: 'callback', t: d.kind === 'birthday' ? tidy(render(SYS.daily.birthday, X.vars, X.rng)) : tidy(SYS.daily.today.replace('{label}', d.label.replace(/^Your /, ''))), p: P.ack, o: 2 });
    else pieces.push({ k: 'callback', t: SYS.daily.soon.replace('{label}', d.label.replace(/^Your /, 'your ')).replace('{n}', d.in).replace('{s}', d.in === 1 ? '' : 's').replace('{date}', fmtMD(d)), p: P.callback + 1, o: 6 });
  }

  jokePieces(X, def) {
    const { rng, conv } = X;
    conv.jokes ||= [];
    const left = SYS.jokes.map((j, i) => i).filter((i) => !conv.jokes.includes(i));
    if (!left.length) { conv.jokes = []; return { pieces: [{ k: 'core', t: pickOne(def.noJokes, rng), p: P.core }], follow: [] }; }
    const i = pickOne(left, rng), j = SYS.jokes[i];
    conv.jokes.push(i);
    conv.pending = { type: 'joke', a: j.a };
    return { pieces: [{ k: 'core', t: pickOne(SYS.jokeSetup, rng).replace('{q}', j.q), p: P.core }], follow: [], expr: 'laugh' };
  }

  gamePieces(a, X, def) {
    const { rng, conv } = X;
    const intro = this.say(def, X, 'game', {});
    if (/truth or dare/.test(a.l)) {
      const q = this.starterQuestion(X, 'deep');
      conv.pending = { type: 'open' };
      return { pieces: [{ k: 'core', t: `I'm a truth-only kind of girl — dares are hard to do through a chat window! Truth: ${q}`, p: P.core }], follow: [], expr: 'wink' };
    }
    if (/this or that/.test(a.l)) return this.totPiece(X, intro?.text);
    if (/trivia|quiz|20 questions|twenty questions/.test(a.l)) {
      return { pieces: [{ k: 'core', t: "I can't run real trivia — I'm a rule-based companion with no question bank to quiz you with. But I can do “would you rather” or “this or that”. Which one?", p: P.core }], follow: [], expr: 'think' };
    }
    return this.wyrPiece(X, intro?.text);
  }
  wyrPiece(X, lead) {
    const { rng, conv } = X;
    conv.wyr ||= [];
    let left = SYS.wyr.map((_, i) => i).filter((i) => !conv.wyr.includes(i));
    if (!left.length) { conv.wyr = []; left = SYS.wyr.map((_, i) => i); }
    const i = pickOne(left, rng), item = SYS.wyr[i];
    conv.wyr.push(i);
    conv.pending = { type: 'wyr', item };
    const q = pickOne(SYS.wyrSetup, rng).replace('{a}', item.a).replace('{b}', item.b);
    return { pieces: [{ k: 'core', t: `${lead ? lead + ' ' : ''}${q}`, p: P.core }], follow: [], expr: 'wink' };
  }
  totPiece(X, lead) {
    const { rng, conv } = X;
    const pair = pickOne(SYS.thisOrThat, rng);
    conv.pending = { type: 'tot', pair };
    return { pieces: [{ k: 'core', t: `${lead ? lead + ' ' : ''}Quick-fire: ${pair[0]} or ${pair[1]}?`, p: P.core }], follow: [], expr: 'wink' };
  }
  starterQuestion(X, force) {
    const { rng, mode, stage } = X;
    const cat = force || { romantic: stage >= 3 ? 'romantic' : 'fun', deep: 'deep', heart: 'daily', banter: 'fun', cheer: 'daily', casual: pickOne(['fun', 'hypo', 'daily', 'deep'], rng) }[mode] || 'fun';
    const pool = SYS.starters[cat].map((t) => ({ e: t, w: 1 }));
    return choose(pool, X)?.text || SYS.starters.fun[0];
  }

  /* ------------------------------ topics ------------------------------ */
  topicPieces(topicId, a, X, hasCore, primary, o = {}) {
    const D = TOPIC_DATA[topicId];
    if (!D) return { pieces: [], follow: [] };
    const { rng, conv, persona, traits: tr } = X;
    const pieces = [];
    const tlabel = TOPIC_MAP[topicId].label.toLowerCase();
    conv.topicLabel = tlabel;
    const asMain = !hasCore;
    const pri = asMain ? P.core : P.topic;
    // transition / return
    if (conv.topic && conv.topic !== topicId && X.rng() < 0.55 && asMain) {
      const back = (conv.recentTopics || []).includes(topicId);
      const tpl = pickOne(back ? TOPIC_RETURN : TRANSITIONS, rng);
      pieces.push({ k: 'topic', t: render(tpl, X.vars, rng), p: P.topic + 1, o: 2 });
    }
    // preferred topic enthusiasm
    if (persona.topics.preferred.includes(topicId) && rng() < 0.5 && conv.topic !== topicId) pieces.push({ k: 'topic', t: render(pickOne(PREF_LINES, rng), X.vars, rng), p: P.topic, o: 3 });
    const cands = [];
    const asking = a.isQuestion;
    if (!asking) cands.push(...asCands(D.react, 1));
    cands.push(...asCands(D.opinions, 1.3));
    if (!o.noFacts) cands.push(...asCands(D.facts, 0.3 + tr.intelligence / 90));
    if (X.mode === 'deep') cands.push(...asCands(D.deep, 4));
    const pick = choose(cands, X);
    if (pick) {
      let t = pick.text;
      if (D.facts.some((f) => f === pick.raw)) t = `${pickOne(['Fun fact:', 'Here\'s something I love:', 'A little tidbit:', 'Did you know?'], rng)} ${t}`;
      pieces.push({ k: 'topic', t, p: pri, o: 3 });
    }
    // remember topic state
    const rt = (conv.recentTopics ||= []);
    if (conv.topic !== topicId) { rt.push(topicId); if (rt.length > 8) rt.shift(); }
    conv.topic = topicId; conv.topicAge = 0;
    const asks = D.asks.map((q) => ({ e: { t: q.q }, w: 1, p: q.p }));
    return { pieces, follow: asks, expr: 'happy' };
  }

  prohibited(persona, a, topicIds) {
    const t = persona.topics || {};
    if ((t.prohibited || []).some((id) => topicIds.includes(id))) return true;
    for (const w of t.prohibitedWords || []) {
      const wd = w.trim().toLowerCase();
      if (wd && new RegExp(`(?:^|[^a-z0-9])${wd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[^a-z0-9])`, 'i').test(a.l)) return true;
    }
    return false;
  }

  /* ------------------------------ fallbacks ------------------------------ */
  fallbackPieces(a, X) {
    const { rng, conv } = X;
    const F = SYS.fallback;
    const pieces = [];
    const cand = (arr, w = 1) => asCands(arr, w);
    let follow = [];
    const add = (t, extra = {}) => pieces.push({ k: 'core', t, p: P.core, ...extra });
    const opener = (a.s.score > 0.2 ? 'pos' : a.s.score < -0.2 ? 'neg' : a.isQuestion ? 'ques' : 'neu');
    if (a.len > 40) { add(choose(cand(F.long), X).text); return { pieces, follow, expr: 'caring' }; }
    const c = [];
    if (conv.reflect && !a.isQuestion) c.push(...cand(F.reflect, 3));
    if (a.s.score > 0.3) c.push(...cand(F.positive, 1.5));
    if (a.s.score < -0.3) c.push(...cand(F.negative, 1.5));
    if (conv.kw && !a.isQuestion) c.push(...cand(F.echoWord, 1.2));
    c.push(...cand(F.tellmore, 1));
    if (a.isQuestion || a.len > 12 || (!conv.kw && !conv.reflect)) c.push(...cand(F.honest, a.isQuestion ? 3 : 1.2));
    const s = choose(c, X);
    let text = s?.text || F.honest[0];
    if (X.traits.expressiveness > 50 && rng() < 0.4 && a.len > 2 && !F.honest.includes(s?.raw)) text = `${pickOne(SYS.openers[opener], rng)} ${text}`;
    add(text);
    if (a.s.score > 0.3 || a.s.score < -0.3) follow = [{ e: { t: 'What happened?' }, w: 1, p: 'whathappened' }];
    else {
      const t = this.suggestTopics(X);
      if (t.length >= 2 && rng() < 0.35) pieces.push({ k: 'topic', t: render(pickOne(F.suggest, rng), X.vars, rng, { topic1: t[0], topic2: t[1] }), p: P.topic, o: 5 });
    }
    return { pieces, follow, expr: 'think' };
  }

  suggestTopics(X) {
    const pref = X.persona.topics.preferred.map((id) => TOPIC_MAP[id]?.label.toLowerCase()).filter(Boolean);
    const proh = new Set(X.persona.topics.prohibited);
    const rest = TOPICS.filter((t) => !proh.has(t.id) && !X.persona.topics.preferred.includes(t.id)).map((t) => t.label.toLowerCase());
    const out = [...pref.sort(() => X.rng() - 0.5), ...rest.sort(() => X.rng() - 0.5)];
    return out.slice(0, 2);
  }

  /* ------------------------- enrichments ------------------------- */
  callback(X, a, skip) {
    const { rng, conv, mem, traits: tr } = X;
    if (skip || conv.turn < 4 || conv.turn - (conv.lastCallback ?? -99) < 9) return null;
    if (rng() > 0.1 + tr.affection / 700 + tr.curiosity / 900) return null;
    const cands = [];
    for (const f of SYS.callback.fact) if (mem.facts[f.need]) cands.push({ e: f.t, w: 1 });
    if (mem.likes.length) cands.push(...SYS.callback.like.map((t) => ({ e: t, w: 0.6 })));
    const old = mem.mentions.filter((m) => Date.now() - m.ts > 3 * 60 * 1000 && m.kw);
    if (old.length) { const m = pickOne(old, rng); conv.cbWord = m.kw; cands.push(...SYS.callback.topic.map((t) => ({ e: t, w: 0.8 }))); }
    if (X.stage >= 2) cands.push(...SYS.callback.stage.map((t) => ({ e: t, w: 0.3 })));
    if (X.stage >= 1 && (X.rel.shared || []).length) cands.push(...SYS.callback.shared.map((t) => ({ e: t, w: 1.4 })));
    const s = choose(cands, X, { v: pickOne(mem.likes, rng), word: conv.cbWord });
    if (!s) return null;
    conv.lastCallback = conv.turn;
    return { k: 'callback', t: s.text, p: P.callback, o: 6 };
  }

  flirt(X, a, intentId, topicId) {
    const { rng, conv, persona, traits: tr, stage } = X;
    const f = persona.style.flirt;
    if (!f || stage < 1 || conv.noRomance || a.s.score < -0.1 || X.mode === 'heart') return null;
    if (conv.turn - (conv.lastFlirt ?? -99) < 4) return null;
    if (intentId && !FLIRTY_OK.has(intentId)) return null;
    if (!intentId && !topicId && rng() > 0.4) return null;
    const p = (f / 100) * (tr.romance / 100) * X.modeDef.flirt * ROMANCE_STAGE[stage] * 0.4;
    if (rng() > p) return null;
    const tier = Math.min(4, stage);
    const cands = [];
    for (let t = 1; t <= tier; t++) cands.push(...asCands(SYS.flirt[t], t === tier ? 2 : 0.6));
    const s = choose(cands, X);
    if (!s) return null;
    conv.lastFlirt = conv.turn;
    return { k: 'flirt', t: s.text, p: P.flirt, o: 7 };
  }

  quirk(X) {
    const { rng, traits: tr, conv } = X;
    if (rng() > 0.2) return null;
    const opts = [];
    for (const [pool, trait] of Object.entries({ shy: 'shyness', sarcastic: 'sarcasm', playful: 'playfulness', confident: 'confidence', smart: 'intelligence', affectionate: 'affection' })) {
      const w = sw(tr[trait]) * (pool === 'smart' ? 0.4 : 1);
      if (w > 0.5 && !(X.mode === 'heart' && ['sarcastic', 'playful'].includes(pool))) opts.push(...asCands(SYS.quirk[pool], w));
    }
    const s = choose(opts, X);
    return s ? { k: 'quirk', t: s.text, p: P.quirk, o: 8 } : null;
  }

  followup(X, a, pieces, sources, emo, wasPending, topicId, force) {
    const { rng, conv, traits: tr, persona } = X;
    if (pieces.some((p) => p.k === 'core' && /\?\s*$/.test(p.t)) || conv.pending) return null;
    if (pieces.some((p) => p.k === 'rule' && /\?\s*$/.test(p.t))) return null;
    let p = (tr.curiosity / 100) * 0.75 * X.modeDef.follow;
    if (a.isQuestion && persona.reactions.question !== 'reverse') p *= 0.45;
    if (a.isQuestion && persona.reactions.question === 'reverse') p *= 1.3;
    if (emo) p = Math.max(p, 0.8);
    if ((conv.sinceQ ?? 9) < 1) p *= 0.4;
    if (force) p = 1;
    if (pieces.some((q) => q.k === 'checkin')) p *= 0.2;
    if (rng() > p) return null;
    // prefer preferred topics, avoid prohibited
    const cands = sources.filter((s) => s && s.e);
    if (!cands.length) {
      if (!topicId && !emo && rng() < 0.4) {
        const q = this.starterQuestion(X);
        return { k: 'follow', t: q, p: P.follow, pending: { type: 'open' }, o: 9 };
      }
      return null;
    }
    const s = choose(cands, X);
    if (!s) return null;
    const src = cands.find((c) => (typeof c.e === 'string' ? c.e : c.e.t) === s.raw);
    return { k: 'follow', t: s.text, p: emo ? P.core - 1 : P.follow, pending: { type: src?.p || 'open', topic: topicId }, o: 9 };
  }

  ackFacts(learned, X, intentId) {
    const out = [];
    if (intentId === 'remember_cmd') return out;
    for (const f of learned.slice(0, 2)) {
      let key, extra = { v: f.v, cat: (f.k || '').replace('fav_', '') };
      if (f.type === 'fact') key = f.k.startsWith('fav_') ? 'fav' : f.k;
      else if (f.type === 'date') key = f.kind === 'birthday' ? 'birthday' : 'date';
      else key = f.type;
      const pool = SYS.learned[key];
      if (!pool) continue;
      const s = choose(asCands(pool), X, extra);
      if (s) out.push({ k: 'ack', t: s.text, p: P.ack, o: 1 });
      if (f.k === 'name') X.conv.nameKnown = true;
    }
    return out;
  }

  ruleText(rule, X) {
    const s = choose(asCands(rule.responses), X);
    return s ? s.text : null;
  }

  /* ----------------------------- pending ----------------------------- */
  handlePending(p, a, X, hits, fx) {
    const { rng, conv } = X;
    const T = p.type || '';
    const [kind, arg] = T.split(':');
    const pc = (t, extra = {}) => ({ k: 'core', t, p: P.core, ...extra });
    const S = SYS.pending;
    const pickAck = (arr, extra) => choose(asCands(arr), X, extra)?.text || arr[0];
    const sent = a.s.score > 0.15 ? 'pos' : a.s.score < -0.15 ? 'neg' : 'neu';
    const topHit = hits[0]?.id;

    if (kind === 'name') {
      if (X.mem.facts.name) return { pieces: [], expr: 'happy' };
      return null;
    }
    if (kind === 'day' || kind === 'feeling') {
      const pool = kind === 'day' ? S[`day_${sent}`] : sent === 'pos' ? S.feeling_pos : sent === 'neg' ? S.feeling_neg : S.day_neu;
      const pieces = [pc(pickAck(pool, {}))];
      let follow = [];
      if (sent === 'neg') { follow = [{ e: { t: "Do you want to tell me what's been going on?" }, w: 1, p: 'whathappened' }]; fx.aff += 1; }
      else if (sent === 'pos') follow = [{ e: { t: 'What was the highlight?' }, w: 1, p: 'open' }];
      return { pieces, follow, expr: sent === 'neg' ? 'caring' : sent === 'pos' ? 'happy' : 'neutral' };
    }
    if (kind === 'whathappened') {
      const pieces = [pc(pickAck(S.whathappened, {}))];
      if (conv.reflect) pieces.push({ k: 'topic', t: tidy(`So ${conv.reflect}.`), p: P.topic, o: 3 });
      fx.aff += 1; fx.fam += 1;
      conv.pending = { type: 'listen' };
      pieces.push({ k: 'follow', t: 'Do you want advice, or would you just like me to listen?', p: P.follow, o: 9 });
      return { pieces, expr: 'caring' };
    }
    if (kind === 'listen') {
      if (/advice|suggest|help|what should|tips/.test(a.l)) {
        const s = this.say(DB.intent.advice, X, 'advice', { emo: true });
        return { pieces: [pc(s.text)], expr: 'think' };
      }
      if (/listen|vent|just/.test(a.l)) return { pieces: [pc("Then I'm all ears. Take your time, say anything.")], expr: 'caring' };
      return { pieces: [pc(pickAck(SYS.fallback.tellmore, {}))], expr: 'caring' };
    }
    if (kind === 'fav') {
      let ans = a.raw.replace(/^(it'?s|its|probably|i think|i'd say|i guess|mostly|definitely|my favou?rite is|i love|i like|um+|well|hmm+)[:,]?\s+/i, '').replace(/[.!]+$/, '').trim();
      if (!ans || ans.split(/\s+/).length > 7 || a.isQuestion) return null;
      if (!X.mem.facts['fav_' + arg]) { X.mem.facts['fav_' + arg] = { v: ans, ts: Date.now() }; fx.learned.push({ type: 'fact', k: 'fav_' + arg, v: ans }); }
      return { pieces: [pc(pickAck(S.fav, { answer: ans }))], follow: this.followFor(arg, X), expr: 'happy' };
    }
    if (kind === 'hobby') {
      const ans = a.raw.replace(/^(i (really )?(like|love|enjoy)( to)?|mostly|probably)\s+/i, '').replace(/[.!]+$/, '').trim();
      if (!ans || ans.split(/\s+/).length > 7 || a.isQuestion) return null;
      if (!X.mem.hobbies.includes(ans)) { X.mem.hobbies.push(ans); fx.learned.push({ type: 'hobby', v: ans }); }
      return { pieces: [pc(pickAck(S.hobby, { answer: ans }))], expr: 'happy', follow: [{ e: { t: 'How did you get into it?' }, w: 1, p: 'open' }] };
    }
    if (kind === 'topicq') {
      if (a.isQuestion && !a.s.pos) return null;
      if (fx.learned.length) return { pieces: [], expr: 'happy', follow: TOPIC_DATA[arg] ? TOPIC_DATA[arg].asks.map((q) => ({ e: { t: q.q }, w: 1, p: q.p })) : [] };
      const D = TOPIC_DATA[arg];
      const pieces = [pc(pickAck(S.topicq, {}))];
      if (D && X.rng() < 0.7) { const o = choose(asCands(D.opinions), X); if (o) pieces.push({ k: 'topic', t: o.text, p: P.topic, o: 3 }); }
      if (conv.reflect && X.rng() < 0.3) pieces.push({ k: 'topic', t: tidy(`So ${conv.reflect}.`), p: P.topic - 1, o: 4 });
      conv.topic = arg; conv.topicAge = 0; conv.topicLabel = TOPIC_MAP[arg]?.label.toLowerCase();
      return { pieces, follow: D ? D.asks.map((q) => ({ e: { t: q.q }, w: 1, p: q.p })) : [], expr: 'happy' };
    }
    if (kind === 'open') {
      if (a.isQuestion && a.len < 8) return null;
      if (fx.learned.length) return { pieces: [], expr: 'happy' };
      const pieces = [pc(pickAck(S.open, {}))];
      if (conv.reflect) pieces.push({ k: 'topic', t: tidy(pickOne(SYS.fallback.reflect, rng).replace('{reflect}', conv.reflect)), p: P.topic, o: 3 });
      return { pieces, expr: 'happy' };
    }
    if (kind === 'yesno') {
      const yes = topHit === 'yes', no = topHit === 'no';
      if (!yes && !no && a.len > 6) return null;
      if (no) return { pieces: [pc(pickAck(S.no_generic, {}))], expr: 'neutral' };
      if (!yes && topHit !== 'maybe') return null;
      if (arg === 'wyr') { const r = this.wyrPiece(X, pickAck(S.yes_generic, {})); return { pieces: r.pieces, expr: 'wink' }; }
      if (arg === 'joke') { const r = this.jokePieces(X, DB.intent.joke_request); return { pieces: r.pieces, expr: 'laugh' }; }
      if (arg === 'fact') {
        const ids = (X.persona.topics.preferred.length ? X.persona.topics.preferred : Object.keys(TOPIC_DATA)).filter((i) => TOPIC_DATA[i] && !X.persona.topics.prohibited.includes(i));
        const t = pickOne(ids, rng);
        const f = choose(asCands(TOPIC_DATA[t].facts), X);
        return { pieces: [pc(`Okay! ${f ? f.text : "Here's one: honey never spoils."}`)], expr: 'happy', follow: TOPIC_DATA[t].asks.map((q) => ({ e: { t: q.q }, w: 1, p: q.p })) };
      }
      const pieces = [pc(topHit === 'maybe' ? pickAck(DB.intent.maybe.core, {}) : pickAck(S.yes_generic, {}))];
      return { pieces, expr: 'happy', follow: [{ e: { t: this.starterQuestion(X) }, w: 1, p: 'open' }] };
    }
    if (kind === 'wyr') {
      const it = p.item;
      const words = (s) => s.toLowerCase().match(/[a-z]{4,}/g) || [];
      const sa = words(it.a).filter((w) => a.l.includes(w)).length, sb = words(it.b).filter((w) => a.l.includes(w)).length;
      const pickA = /^(a|first|1)\b/.test(a.l) ? true : /^(b|second|2)\b/.test(a.l) ? false : sa === sb ? null : sa > sb;
      const herText = it.her === 'a' ? it.a : it.b;
      const same = pickA === null ? false : (pickA && it.her === 'a') || (!pickA && it.her === 'b');
      const lead = pickA === null ? "Ha, can't pick? That's fair." : same ? 'Same! Great minds.' : 'Interesting — we differ on that one!';
      const react = pickOne(SYS.wyrReact, rng).replace('{her_text}', herText).replace('{why}', it.why);
      conv.pending = { type: 'yesno:wyr' };
      return { pieces: [pc(`${lead} ${react}`), { k: 'follow', t: 'Another one?', p: P.follow, o: 9 }], expr: 'laugh' };
    }
    if (kind === 'tot') {
      const [x, y] = p.pair;
      const pick = a.l.includes(x) ? x : a.l.includes(y) ? y : null;
      const mine = pickOne(p.pair, rng);
      if (pick && !X.mem.likes.includes(pick) && X.rng() < 0.5) { X.mem.likes.push(pick); fx.learned.push({ type: 'like', v: pick }); }
      const t = pick ? (pick === mine ? `${cap(pick)}! Me too — we match.` : `${cap(pick)}, huh — I'm more of a ${mine} person, but I respect it.`) : `Hmm, can't decide? I'd pick ${mine}.`;
      conv.pending = { type: 'yesno:tot' };
      return { pieces: [pc(t), { k: 'follow', t: 'Want another?', p: P.follow, o: 9 }], expr: 'wink' };
    }
    if (kind === 'joke') {
      conv.pending = { type: 'yesno:joke' };
      return { pieces: [pc(`${p.a} ${pickOne(SYS.jokeAfter, rng)}`), { k: 'follow', t: 'Want another one?', p: P.follow, o: 9 }], expr: 'laugh' };
    }
    return null;
  }

  followFor(cat, X) {
    const map = { music: 'music', food: 'food', movie: 'movies', book: 'books' };
    const D = TOPIC_DATA[map[cat]];
    return D ? D.asks.filter((q) => !/favorite|best|all-time/i.test(q.q)).map((q) => ({ e: { t: q.q }, w: 1, p: q.p })) : [];
  }

  /* ----------------------------- scenarios ----------------------------- */
  allScenarios(persona) { return [...SYS.scenarios, ...(persona.scenarios || [])]; }

  startScenario(c, scen) {
    const conv = (c.conv ||= {});
    const a = analyze('start');
    const X = this.buildX(c, a);
    conv.scenario = { id: scen.id, step: 0 };
    conv.pending = null;
    const t = render(scen.intro || "Let's begin.", X.vars, X.rng) || scen.intro;
    return this.compose([{ k: 'core', t, p: P.core }], X, a, { fam: 0, aff: 0, learned: [] }, { expr: 'happy', noTrim: true, scenario: true });
  }

  scenarioTurn(text, a, X, c, hits, fx) {
    const conv = X.conv;
    // custom scenario triggers
    if (!conv.scenario) {
      for (const s of X.persona.scenarios || []) {
        if (s.trigger && X.stage >= (s.minStage || 0) && new RegExp(`(?:^|\\W)${s.trigger.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|\\W)`, 'i').test(a.l)) {
          fx.scenarioStart = s.id;
          const r = this.startScenario(c, s);
          return { pieces: [{ k: 'core', t: r.messages.map((m) => m.text).join(' '), p: P.core }], expr: 'happy' };
        }
      }
      return null;
    }
    const scen = this.allScenarios(X.persona).find((s) => s.id === conv.scenario.id);
    if (!scen) { conv.scenario = null; return null; }
    const top = hits[0];
    if (/^(stop|quit|end( the)?( scene| scenario)?|exit|leave scene)[.!]*$/i.test(a.l) || (top && top.meta.pr >= 13 && top.meta.emo)) {
      conv.scenario = null; fx.scenarioEnd = scen.id;
      if (top && top.meta.emo) return null;
      return { pieces: [{ k: 'core', t: pickOne(SYS.scenarioQuit, X.rng), p: P.core }], expr: 'happy' };
    }
    const sent = a.s.score > 0.15 ? 'pos' : a.s.score < -0.15 ? 'neg' : 'neu';
    const ack = pickOne(SYS.scenarioAck[sent], X.rng);
    const st = conv.scenario.step;
    const pieces = [];
    pieces.push({ k: 'ack', t: ack, p: P.ack, o: 1 });
    if (conv.reflect && X.rng() < 0.2) pieces.push({ k: 'topic', t: tidy(`So ${conv.reflect}.`), p: P.topic, o: 2 });
    if (st < scen.steps.length) {
      const t = render(scen.steps[st], X.vars, X.rng) || scen.steps[st].replace(/\{[^}]+\}/g, 'something nice');
      pieces.push({ k: 'core', t, p: P.core, o: 3 });
      conv.scenario.step++;
    } else {
      const t = render(scen.closing || 'That was lovely.', X.vars, X.rng) || scen.closing;
      pieces.push({ k: 'core', t, p: P.core, o: 3 });
      pieces.push({ k: 'note', t: pickOne(SYS.scenarioEnd, X.rng), p: P.core - 1, o: 4 });
      conv.scenario = null; fx.scenarioDone = scen.id; fx.aff += 3; fx.fam += 3;
    }
    fx.fam += 1;
    return { pieces, expr: 'happy' };
  }

  /* ----------------------------- composing ----------------------------- */
  compose(pieces, X, a, fx, meta = {}) {
    const { rng, conv, persona, settings } = X;
    const len = clamp(persona.style.length || 3, 1, 5);
    const maxPieces = [0, 1, 2, 3, 4, 6][len];
    let list = pieces.filter((p) => p && p.t);
    // pieces are numbered in insertion order; core pieces always survive
    list.forEach((p, i) => { p.i = i; });
    if (!meta.noTrim) {
      const keep = new Set(list.slice().sort((x, y) => y.p - x.p || x.i - y.i).slice(0, maxPieces).map((p) => p.i));
      list = list.filter((p) => keep.has(p.i) || (p.k === 'ack' && len >= 2 && keep.size < maxPieces));
      if (len === 1) list.forEach((p) => { if (p.k === 'core' && p.t.length > 240) p.t = firstSentences(p.t, 2); });
    }
    const orderOf = (p) => (p.o != null ? p.o : p.k === 'ack' ? 1 : p.k === 'core' || p.k === 'rule' ? 3 : 5);
    list.sort((x, y) => orderOf(x) - orderOf(y) || x.i - y.i);

    const fol = list.find((p) => p.k === 'follow');
    if (fol && fol.pending) conv.pending = fol.pending;
    else if (fol && !conv.pending) conv.pending = { type: 'open' };
    const body = list.filter((p) => p.k !== 'follow').map((p) => p.t);
    let main = tidy(body.join(' '));
    if (!main && fol) main = fol.t;

    const emoMeta = !!meta.emo;
    // nickname: sprinkle in when she doesn't already use one
    const nicks = (persona.style.nicknames || []).filter(Boolean);
    if (!meta.skipStyle && !meta.info && nicks.length && X.stage >= 1 && rng() < (X.traits.affection / 100) * (0.12 + X.stage * 0.05) && !nicks.some((n) => main.includes(n))) main = addNickname(main, pickOne(nicks, rng));

    // style
    const opts = { emo: emoMeta || !!meta.info, skipStyle: meta.skipStyle };
    main = applyStyle(main, X, opts);

    // split into bubbles
    let bubbles = [main];
    if (settings.chat?.splitMessages !== false && !meta.skipStyle) {
      if (main.length > 230) {
        const sent = main.match(/[^.!?…]+[.!?…]+(?:\s|$)|[^.!?…]+$/g) || [main];
        if (sent.length >= 3) { const mid = Math.ceil(sent.length / 2); bubbles = [sent.slice(0, mid).join('').trim(), sent.slice(mid).join('').trim()]; }
      }
      if (fol && len >= 2 && main !== fol.t) bubbles.push(applyStyle(fol.t, X, { ...opts, emo: true }));
    } else if (fol && main !== fol.t) bubbles[0] = tidy(bubbles[0] + ' ' + applyStyle(fol.t, X, { ...opts, emo: true }));

    const expr = meta.expr || fx.expression || 'neutral';
    fx.expression = expr;
    const emoji = meta.noEmoji ? '' : emojiFor(expr, X, opts);
    if (emoji && !/\p{Extended_Pictographic}/u.test(bubbles[bubbles.length - 1])) bubbles[bubbles.length - 1] = bubbles[bubbles.length - 1].replace(/\s*$/, ' ') + emoji;
    bubbles = bubbles.map((b) => { let n = 0; return b.replace(/\s?\p{Extended_Pictographic}\uFE0F?/gu, (m) => (++n > 2 ? '' : m)); });
    if (persona.style.emoji === 0 || meta.noEmoji) bubbles = bubbles.map(stripEmoji);

    const speed = settings.chat?.typingSpeed ?? 50;
    const messages = bubbles.filter(Boolean).map((t, i) => ({
      text: t, expression: expr,
      delay: speed === 0 ? 0 : Math.round(clamp(350 + t.length * (speed * 0.7) + rng() * 450 + (i ? 250 : 0), 450, 4200)),
    }));

    // conversation bookkeeping
    conv.topicAge = (conv.topicAge ?? 9) + 1;
    conv.lastIntent = fx.intent;
    conv.sinceQ = messages.some((m) => /\?\s*(\p{Extended_Pictographic}️?\s*)*$/u.test(m.text)) ? 0 : (conv.sinceQ ?? 9) + 1;
    return { messages, fx, debug: { ...(meta.dbg || {}), pieces: list.map((p) => ({ k: p.k, t: p.t })), pending: conv.pending || null, mood: +(conv.mood || 0).toFixed(2), stage: X.stage, mode: X.mode } };
  }

  /* ------------------------ other generated messages ------------------------ */
  modeIntro(c, mode) {
    const X = this.buildX({ ...c, mode }, analyze('mode'));
    const t = render(pickOne(SYS.modeIntro[mode] || SYS.modeIntro.casual, X.rng), X.vars, X.rng);
    return this.compose([{ k: 'core', t, p: P.core }], X, X.a, { fam: 0, aff: 0, learned: [] }, { expr: 'happy', noTrim: true });
  }

  /** A message she can open the day with (time-of-day aware, mentions upcoming important dates). */
  daily(c) {
    const now = c.now || new Date();
    const conv = (c.conv ||= {});
    const X = this.buildX(c, analyze('daily'));
    const part = { morning: 'morning', afternoon: 'afternoon', evening: 'evening', night: 'night' }[DAYPARTS(now)];
    const pieces = [];
    const up = upcomingDates(c.mem, now, 3)[0];
    if (up && up.in === 0 && up.kind === 'birthday') return this.compose([{ k: 'core', t: render(SYS.daily.birthday, X.vars, X.rng), p: P.core }], X, X.a, { fam: 0, aff: 0, learned: [] }, { expr: 'laugh', noTrim: true });
    const s = choose(asCands(SYS.daily[part]), X);
    pieces.push({ k: 'core', t: s?.text || 'Hi! I was thinking of you.', p: P.core });
    if (up) this.dateGreeting(X, pieces);
    if (!up) {
      const q = this.starterQuestion(X, 'daily');
      if (X.rng() < 0.4) pieces.push({ k: 'follow', t: q, p: P.follow, pending: { type: 'open' } });
    }
    return this.compose(pieces, X, X.a, { fam: 0, aff: 0, learned: [] }, { expr: 'happy', noTrim: true });
  }

  /** Three conversation-starter suggestions for the chips above the composer. */
  suggestions(c) {
    const X = this.buildX(c, analyze('hi'));
    const out = [];
    const rng = X.rng;
    const pool = [
      ...SYS.starters.fun.map((t) => ({ t, k: 'fun' })), ...SYS.starters.hypo.map((t) => ({ t, k: 'fun' })), ...SYS.starters.daily.map((t) => ({ t, k: 'daily' })),
      ...(X.mode === 'deep' ? SYS.starters.deep.map((t) => ({ t, k: 'deep' })) : []),
      ...(X.stage >= 3 && X.mode === 'romantic' ? SYS.starters.romantic.map((t) => ({ t, k: 'rom' })) : []),
    ];
    const short = ['Tell me a joke', "Let's play would you rather", 'Say something sweet', 'What are you up to?', 'Tell me about yourself', 'I need a hug'];
    const prefs = X.persona.topics.preferred.slice(0, 3).map((id) => `Let's talk about ${TOPIC_MAP[id]?.label.toLowerCase()}`);
    const cands = [...short.map((t) => ({ t })), ...prefs.map((t) => ({ t })), ...pool.slice().sort(() => rng() - 0.5).slice(0, 4).map((x) => ({ t: x.t }))];
    cands.sort(() => rng() - 0.5);
    for (const cnd of cands) { if (out.length >= 3) break; if (!out.includes(cnd.t) && cnd.t.length < 60) out.push(cnd.t); }
    return out;
  }
}

function firstSentences(t, n) {
  const s = t.match(/[^.!?…]+[.!?…]+(?:\s|$)/g);
  return s ? s.slice(0, n).join('').trim() : t;
}
