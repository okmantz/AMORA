// AMORA — personality styling applied after a reply is assembled:
// vocabulary, nicknames, hesitation, exclamation level, lowercase, catchphrases and emoji.
import { EMOJI } from '../data/system-data.js';
import { clamp } from '../core/util.js';

const VOCAB = {
  casual: [[/\bI would\b/g, "I'd"], [/\bdo not\b/gi, "don't"], [/\bcannot\b/gi, "can't"], [/\bkind of\b/gi, 'kinda'], [/\bgoing to\b/g, 'gonna']],
  formal: [[/\bI'm\b/g, 'I am'], [/\bit's\b/gi, 'it is'], [/\bdon't\b/gi, 'do not'], [/\bcan't\b/gi, 'cannot'], [/\byou're\b/gi, 'you are'], [/\bthat's\b/gi, 'that is'], [/\blet's\b/gi, 'let us'], [/\bgonna\b/gi, 'going to'], [/\bkinda\b/gi, 'somewhat'], [/\bYeah\b/g, 'Yes'], [/\bHey\b/g, 'Hello'], [/\bI'll\b/g, 'I will'], [/\bwon't\b/gi, 'will not'], [/\bI've\b/g, 'I have'], [/\bwanna\b/gi, 'want to'], [/\bokay\b/gi, 'all right'], [/\bAww?\b/g, 'Oh'], [/\bUgh\b/g, 'Oh dear']],
  poetic: [[/\breally\b/gi, 'truly'], [/\bnice (?=to|day|evening|chat)/gi, 'lovely '], [/\bI like\b/g, 'I adore'], [/\bbeautiful\b/gi, 'luminous'], [/\bsweet\b/gi, 'tender'], [/\bfun\b/gi, 'delightful']],
  playful: [[/\bso (?=happy|glad|excited|sorry|proud|much|good|nice|cute|sweet|lovely|fun)/g, 'sooo '], [/\bYes\b/g, 'Yesss'], [/\breally\b/gi, 'reeeally'], [/\bamazing\b/gi, 'amaaazing'], [/\bokay\b/gi, 'okie']],
  cozy: [[/\bhello\b/gi, 'hi there'], [/\bwonderful\b/gi, 'lovely'], [/\bgreat idea\b/gi, 'lovely idea']],
};

const HESITATE = ['Um… ', 'Ah… ', 'Well… ', 'I mean… ', 'Uh, '];

export const pickEmoji = (expr, X) => {
  const set = EMOJI[expr] || EMOJI.neutral;
  const mine = (X.persona.style.emojis || '').match(/\p{Extended_Pictographic}(?:️)?/gu) || [];
  const pool = mine.length && X.rng() < 0.55 ? mine : set;
  return pool[Math.floor(X.rng() * pool.length)];
};

/** Apply persona style to the assembled text. opts: {emo, expr, skipStyle} */
export function applyStyle(text, X, opts = {}) {
  if (opts.skipStyle) return text;
  const st = X.persona.style, tr = X.traits, rng = X.rng;
  let s = text;

  // vocabulary
  for (const [re, rep] of VOCAB[st.vocab] || []) {
    s = s.replace(re, (m) => (/^[A-Z]/.test(m) && /^[a-z]/.test(rep) ? rep.charAt(0).toUpperCase() + rep.slice(1) : rep));
  }

  // shyness: occasional hesitation at the start and soft ellipses
  if (tr.shyness > 55 && !opts.emo && rng() < (tr.shyness - 40) / 220 && !/^(um|ah|well|i mean|uh|\*)/i.test(s)) {
    s = HESITATE[Math.floor(rng() * HESITATE.length)] + s.charAt(0).toLowerCase() + s.slice(1);
  }
  if (tr.shyness > 70 && rng() < 0.4) s = s.replace(/\.(\s|$)/, '…$1');

  // expressiveness: more exclamation marks when she's bubbly
  if (tr.expressiveness > 70 && !opts.emo) {
    const p = (tr.expressiveness - 65) / 120;
    s = s.replace(/([^.!?…\n]{14,})\.(\s|$)/g, (m, body, sp) => (rng() < p && !/\b(sorry|rough|hard|sad|hurt)\b/i.test(body) ? `${body}!${sp}` : m));
  } else if (tr.expressiveness < 30) {
    s = s.replace(/!+/g, '.');
  }

  // confident / formal people don't ramble with ellipses
  if (tr.confidence > 75) s = s.replace(/…/g, '.');

  // catchphrase
  const cps = st.catchphrases || [];
  if (cps.length && !opts.emo && !opts.noCatch && !/[?]\s*$/.test(s) && rng() < 0.14) s += ' ' + cps[Math.floor(rng() * cps.length)].replace(/^\s*[a-z]/, (c) => c.toUpperCase()).replace(/[^.!?…)]$/, '$&.');

  if (st.lowercase) s = s.toLowerCase().replace(/\bi\b/g, 'i');
  return s;
}

/** Emoji decision for one message. Returns '' or an emoji string. */
export function emojiFor(expr, X, opts = {}) {
  const lvl = X.persona.style.emoji;
  if (!lvl || opts.skipStyle) return '';
  const p = clamp(lvl / 100 + (X.traits.expressiveness - 50) / 400, 0, 1) * (opts.emo ? 0.5 : 1);
  if (X.rng() > p) return '';
  const n = lvl > 75 && X.rng() < 0.4 ? 2 : 1;
  const out = [];
  for (let i = 0; i < n; i++) { const e = pickEmoji(expr, X); if (!out.includes(e)) out.push(e); }
  return out.join('');
}

export function stripEmoji(s) { return s.replace(/\p{Extended_Pictographic}️?/gu, '').replace(/\s{2,}/g, ' ').trim(); }

/** Insert a pet name naturally when the template didn't: "Good question." -> "Good question, love." */
export function addNickname(text, nick) {
  if (!nick || text.includes(nick)) return text;
  const i = text.search(/[.!?…]/);
  if (i < 4) return text;
  return text.slice(0, i) + ', ' + nick + text.slice(i);
}
