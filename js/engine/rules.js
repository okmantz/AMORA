// AMORA — custom response rules (the Dialogue editor). Rules can match keywords/phrases/regex or target a built-in intent.
import { clamp } from '../core/util.js';

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function phraseRegex(t) {
  const parts = t.trim().toLowerCase().split('*').map(escRe).join('.*');
  return new RegExp(`(?:^|[^a-z0-9'])${parts}(?=$|[^a-z0-9'])`, 'i');
}

/** Does this rule's trigger section match the text? (intent rules are matched elsewhere) */
export function triggerMatches(rule, a) {
  const T = (rule.triggers || []).map((t) => t.trim()).filter(Boolean);
  if (!T.length) return false;
  try {
    switch (rule.match) {
      case 'all': return T.every((t) => phraseRegex(t).test(a.l));
      case 'phrase': return phraseRegex(T[0]).test(a.l);
      case 'exact': return T.some((t) => a.l.replace(/[.!?\s]+$/g, '') === t.toLowerCase().replace(/[.!?\s]+$/g, ''));
      case 'regex': return T.some((t) => new RegExp(t, 'i').test(a.raw));
      case 'any':
      default: return T.some((t) => phraseRegex(t).test(a.l));
    }
  } catch { return false; }
}

/** Contextual conditions shared by all rule types. */
export function conditionsMet(rule, X, a, topicIds, conv, rng) {
  if (!rule.enabled) return false;
  if (X.stage < (rule.minStage || 0)) return false;
  if (rule.mode && rule.mode !== X.mode) return false;
  if (rule.topic && !topicIds.includes(rule.topic)) return false;
  if (rule.sentiment === 'positive' && a.s.score <= 0.05) return false;
  if (rule.sentiment === 'negative' && a.s.score >= -0.05) return false;
  if (rule.sentiment === 'question' && !a.isQuestion) return false;
  const st = (conv.ruleState ||= {})[rule.id] || {};
  if (rule.once && st.count) return false;
  if (rule.cooldown && st.last != null && conv.turn - st.last <= rule.cooldown) return false;
  if (rule.chance < 100 && rng() * 100 >= clamp(rule.chance, 0, 100)) return false;
  return true;
}

export function markRule(rule, conv) {
  const st = ((conv.ruleState ||= {})[rule.id] ||= { count: 0 });
  st.count++; st.last = conv.turn;
}
