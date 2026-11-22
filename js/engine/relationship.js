// AMORA — relationship progression. Points only ever go UP: nothing is lost for being away,
// nothing is punished, and the whole system can be set to manual or switched off from Settings.
import { dayKey } from '../core/util.js';

export const STAGES = [
  { id: 0, name: 'New', blurb: 'Just getting to know each other.', fp: 0, ap: 0 },
  { id: 1, name: 'Acquainted', blurb: 'Comfortable, curious and friendly.', fp: 15, ap: 5 },
  { id: 2, name: 'Friends', blurb: 'Easy conversation and inside jokes.', fp: 60, ap: 20 },
  { id: 3, name: 'Close', blurb: 'Warm, open and a little flirty.', fp: 160, ap: 60 },
  { id: 4, name: 'Sweethearts', blurb: 'Affectionate and openly romantic.', fp: 320, ap: 140 },
  { id: 5, name: 'Devoted', blurb: 'Deep trust, deep warmth.', fp: 600, ap: 300 },
];

export const STATUS_MIN_STAGE = { 'just-met': 0, friends: 1, 'close-friends': 2, dating: 3, relationship: 4, engaged: 5, married: 5, custom: 0 };
export const STATUS_LABEL = { 'just-met': 'Just met', friends: 'Friends', 'close-friends': 'Close friends', dating: 'Dating', relationship: 'In a relationship', engaged: 'Engaged', married: 'Married', custom: 'Custom' };

export const MODES = {
  casual: { label: 'Casual chat', emoji: '☕', minStage: 0, desc: 'Easygoing everyday conversation.', delta: {}, follow: 0.5, flirt: 1 },
  heart: { label: 'Heart-to-heart', emoji: '🫶', minStage: 0, desc: 'She listens first: supportive, calm, fewer jokes.', delta: { empathy: 25, playfulness: -30, sarcasm: -40, humor: -20, curiosity: 10 }, follow: 0.75, flirt: 0.3 },
  banter: { label: 'Playful banter', emoji: '🎭', minStage: 0, desc: 'Teasing, games and quick-fire silliness.', delta: { playfulness: 30, humor: 25, sarcasm: 15, shyness: -15 }, follow: 0.4, flirt: 1 },
  deep: { label: 'Deep talk', emoji: '🌌', minStage: 1, desc: 'Big questions, ideas and thoughtful tangents.', delta: { intelligence: 25, curiosity: 25, playfulness: -15 }, follow: 0.7, flirt: 0.5 },
  romantic: { label: 'Romantic evening', emoji: '🌹', minStage: 3, desc: 'Candlelight, soft words and affection.', delta: { romance: 35, affection: 20, shyness: 5, sarcasm: -25 }, follow: 0.5, flirt: 2 },
  cheer: { label: 'Cheerleader', emoji: '📣', minStage: 0, desc: 'Motivation, focus and encouragement for goals.', delta: { confidence: 20, expressiveness: 15, sarcasm: -30 }, follow: 0.6, flirt: 0.3 },
};

export function defaultRel() {
  return {
    fp: 0, ap: 0, manualStage: 1, status: 'just-met', customStatus: '', details: '', shared: [],
    msgs: 0, days: 0, streak: 0, lastDay: '', startedAt: Date.now(),
    today: { day: '', fp: 0, ap: 0 }, milestones: {}, mode: 'casual',
  };
}

export function computeStage(rel) {
  let s = 0;
  for (const st of STAGES) if (rel.fp >= st.fp && rel.ap >= st.ap) s = st.id;
  return s;
}

/** The stage the engine actually uses: auto (earned) or manual, never below the chosen relationship status. */
export function effectiveStage(rel, settings) {
  const base = settings?.relationship?.progression === 'manual' ? rel.manualStage : computeStage(rel);
  return Math.max(base, STATUS_MIN_STAGE[rel.status] || 0);
}

export function stageProgress(rel) {
  const s = computeStage(rel);
  const next = STAGES[s + 1];
  if (!next) return { stage: s, pct: 100, next: null };
  const cur = STAGES[s];
  const pf = (rel.fp - cur.fp) / (next.fp - cur.fp), pa = (rel.ap - cur.ap) / (next.ap - cur.ap);
  return { stage: s, pct: Math.round(Math.max(0, Math.min(1, Math.min(pf, pa))) * 100), next, needFP: Math.max(0, next.fp - rel.fp), needAP: Math.max(0, next.ap - rel.ap) };
}

/** Is a mode / scenario / content block currently unlocked? */
export function unlocked(minStage, rel, settings) {
  if (!settings?.relationship?.gating) return true;
  return effectiveStage(rel, settings) >= minStage;
}

/** Apply effects from one exchange. Returns {stageUp, milestones[]}. Mutates rel. */
export function applyEffects(rel, fx, settings, now = new Date()) {
  const before = effectiveStage(rel, settings);
  const out = { stageUp: false, milestones: [], newDay: false };
  const today = dayKey(now);
  if (rel.today.day !== today) {
    rel.today = { day: today, fp: 0, ap: 0 };
    out.newDay = true;
    rel.days += 1;
    const yest = new Date(now); yest.setDate(now.getDate() - 1);
    rel.streak = rel.lastDay === dayKey(yest) ? rel.streak + 1 : 1;
    rel.lastDay = today;
    fx = { ...fx, fam: (fx.fam || 0) + 5, aff: (fx.aff || 0) + (rel.streak > 1 ? 2 : 0) };
  }
  rel.msgs += 1;
  const sp = settings?.relationship?.speed ?? 1;
  const capF = settings?.relationship?.dailyCapFP ?? 40, capA = settings?.relationship?.dailyCapAP ?? 24;
  const f = Math.min(Math.round((fx.fam || 0) * sp), Math.max(0, capF - rel.today.fp));
  const a = Math.min(Math.round((fx.aff || 0) * sp), Math.max(0, capA - rel.today.ap));
  rel.fp += f; rel.ap += a; rel.today.fp += f; rel.today.ap += a;
  out.stageUp = effectiveStage(rel, settings) > before;
  out.stage = effectiveStage(rel, settings);
  return out;
}

export const MILESTONES = [
  { id: 'hello', label: 'First hello', test: (c) => c.rel.msgs >= 1 },
  { id: 'm10', label: '10 messages', test: (c) => c.rel.msgs >= 10 },
  { id: 'm50', label: '50 messages', test: (c) => c.rel.msgs >= 50 },
  { id: 'm100', label: '100 messages', test: (c) => c.rel.msgs >= 100 },
  { id: 'm500', label: '500 messages', test: (c) => c.rel.msgs >= 500 },
  { id: 'streak3', label: '3-day streak', test: (c) => c.rel.streak >= 3 },
  { id: 'streak7', label: '7-day streak', test: (c) => c.rel.streak >= 7 },
  { id: 'days14', label: '14 days together', test: (c) => c.rel.days >= 14 },
  { id: 'days30', label: '30 days together', test: (c) => c.rel.days >= 30 },
  { id: 'facts5', label: 'Learned 5 things about you', test: (c) => Object.keys(c.mem.facts).length + c.mem.likes.length >= 5 },
  { id: 'facts15', label: 'Learned 15 things about you', test: (c) => Object.keys(c.mem.facts).length + c.mem.likes.length + c.mem.hobbies.length + c.mem.family.length >= 15 },
  { id: 'friends', label: 'Became friends', test: (c) => c.stage >= 2 },
  { id: 'close', label: 'Grew close', test: (c) => c.stage >= 3 },
  { id: 'sweet', label: 'Sweethearts', test: (c) => c.stage >= 4 },
  { id: 'devoted', label: 'Devoted', test: (c) => c.stage >= 5 },
  { id: 'journal', label: 'First journal entry', test: (c) => (c.journal || 0) >= 1 },
  { id: 'scenario', label: 'First shared scenario', test: (c) => (c.scenarios || 0) >= 1 },
];

/** Returns the milestones newly reached (and marks them on rel). */
export function checkMilestones(rel, mem, settings, extra = {}) {
  const c = { rel, mem, stage: effectiveStage(rel, settings), ...extra };
  const fresh = [];
  for (const m of MILESTONES) {
    if (!rel.milestones[m.id] && m.test(c)) { rel.milestones[m.id] = Date.now(); fresh.push(m); }
  }
  return fresh;
}
