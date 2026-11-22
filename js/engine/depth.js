// AMORA — "depth" handlers: recommendations, recipes, advice playbooks, gifts, outfits, travel, workouts, calming exercises,
// big-concept answers, hypotheticals, riddles, phrasebook, astrology for fun, favourites, drafts — plus a speech-act fallback so she
// answers *something thoughtful* to nearly any sentence even when no specific rule matches.
// Everything is offline and rule-based. Facts here are deliberately well-known; she says so when she's out of her depth.
import { choose, asCands, render, tidy } from './templates.js';
import { parseDate } from './text.js';
import { RECS, REC_GENRE, RECIPES, ADVICE, GIFTS, GIFT_WHO, OUTFITS, OUTFIT_OCC, WORKOUTS, CALM, TRAVEL } from '../data/knowhow.js';
import { CONCEPTS, CONCEPT_RE, HYPO, HYPO_DEFAULT, RIDDLES, LANGS, PHRASES, PHRASE_ALIASES, LANG_HELLO, HELLO_BACK, ZODIAC, HOROSCOPE, FORTUNES, EIGHTBALL, FAVS, FAV_ALIAS, LIKE_LINES, PAIRS, CHOICE_REASONS, DRAFTS, DRAFT_KIND, DRAFT_TO, SPEECH, EMOJI_KIND } from '../data/wisdom.js';

const P_CORE = 10;
const pick = (arr, rng) => (arr && arr.length ? arr[Math.floor(rng() * arr.length)] : undefined);
const C = (t, extra = {}) => ({ k: 'core', t, p: P_CORE, ...extra });
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const list = (arr) => (arr.length <= 1 ? arr.join('') : arr.length === 2 ? arr.join(' and ') : `${arr.slice(0, -1).join(', ')}, and ${arr[arr.length - 1]}`);
const R = (tpl, X, extra) => render(tpl, X.vars, X.rng, extra) || tidy(tpl.replace(/\{[^{}]*\}/g, ''));
const ln = (arr, X, extra) => choose(asCands(arr), X, extra)?.text || R(pick(arr, X.rng) || '', X, extra);
const shuffle = (arr, rng) => arr.map((v) => [rng(), v]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
const out = (text, o = {}) => ({ pieces: [C(text)], follow: o.follow || [], expr: o.expr || 'happy' });
const fu = (q, p = 'open') => ({ e: { t: q }, w: 1, p });

/* ------------------------------ intent handlers ------------------------------ */
export function depthIntent(eng, id, a, X, fx) {
  const { rng, conv } = X;
  const l = a.l;
  switch (id) {
    case 'recommend': {
      const kind = /\b(movies?|films?|cinema)\b/.test(l) ? 'movie'
        : /\b(shows?|series|tv|netflix|binge|anime)\b/.test(l) ? 'show'
        : /\b(books?|novels?|read|reading)\b/.test(l) ? 'book'
        : /\b(music|songs?|albums?|playlist|band|artist|listen|podcast)\b/.test(l) ? 'music'
        : /\b(games?|gaming|play)\b/.test(l) ? 'game'
        : /\b(eat|dinner|lunch|breakfast|snack|food|meal|recipe|cook|dessert)\b/.test(l) ? 'food' : null;
      if (!kind) {
        conv.pending = { type: 'recpick' };
        return out("Happy to! What are you after — a movie, a show, a book, some music, a game, or something to eat?", { expr: 'happy' });
      }
      return recOut(X, kind, l, conv);
    }
    case 'recipe_q': {
      const r = RECIPES.find((x) => x.names.test(l));
      if (!r) {
        return out(ln(["I don't have that exact recipe memorised, and I'd rather not guess at measurements. I know a few reliable basics — scrambled eggs, omelettes, pancakes, fried rice, aglio e olio, tomato soup, cookies and more. Want one of those, or tell me what's in your fridge and I'll suggest something?"], X), { expr: 'think', follow: [fu("What ingredients do you have?", 'open')] });
      }
      const steps = r.steps.map((s, i) => `${i + 1}. ${s}`).join(' ');
      return out(`${r.title} (${r.time}). You'll need ${r.ing}. ${steps} Tip: ${r.tip}`, { follow: [fu("Want a side to go with it?", 'yesno')] });
    }
    case 'gift_ideas': {
      const who = (GIFT_WHO.find(([re]) => re.test(l)) || [null, 'default'])[1];
      const ideas = shuffle(GIFTS[who], rng).slice(0, 3);
      const lead = who === 'default' ? "A few ideas that rarely miss:" : `For ${{ partner: 'someone you love', mom: 'your mom', dad: 'your dad', friend: 'a friend', coworker: 'a coworker', kid: 'a kid' }[who]}:`;
      return out(`${lead} ${list(ideas)}. The best gifts say "I noticed you". Tell me a bit about them and I'll narrow it down.`, { follow: [fu("What are they into?", 'open')] });
    }
    case 'outfit_help': {
      const occ = (OUTFIT_OCC.find(([re]) => re.test(l)) || [null, 'default'])[1];
      const tips = shuffle(OUTFITS[occ], rng).slice(0, 3);
      return out(`Here's how I'd think about it: ${list(tips)}. What's the occasion, and what's the weather like?`, { follow: [] });
    }
    case 'travel_recs': {
      const t = TRAVEL.find((x) => x.re.test(l));
      if (!t) return out("I love planning trips! I only have detailed notes on a few places — Paris, Tokyo, Rome, Barcelona, Lisbon, New York, London, Kyoto and some others. Where are you headed, and what do you like — food, museums, nature, nightlife?", { expr: 'happy', follow: [fu("What kind of trip is it?", 'open')] });
      const picks = shuffle(t.picks, rng).slice(0, 3);
      return out(`${t.name} is wonderful. I'd try ${list(picks)}. One practical tip: ${t.tip}. I'm going from general knowledge, so double-check opening hours and bookings before you go.`, { follow: [fu("How many days will you have?", 'open')] });
    }
    case 'workout_plan': {
      const key = /stretch|mobility|sore/.test(l) ? 'stretch' : /yoga/.test(l) ? 'yoga' : /walk/.test(l) ? 'walk' : 'quick';
      return out(`${WORKOUTS[key]} I'm not a trainer, so listen to your body and check with a doctor if you have any health concerns.`, { follow: [fu("How did it go?", 'feeling')] });
    }
    case 'calm_exercise': {
      const c = /box/.test(l) ? CALM[0] : /ground|5-4-3|panic/.test(l) ? CALM[1] : /scan|meditat/.test(l) ? CALM[3] : pick(CALM, rng);
      return { pieces: [C(c.text)], follow: [fu("How do you feel now?", 'feeling')], expr: 'caring' };
    }
    case 'concept_q': {
      let key = (l.match(CONCEPT_RE) || [])[1];
      if (/meaning of life/.test(l)) key = 'the meaning of life';
      if (/love at first sight|soulmate|true love/.test(l)) key = 'love';
      if (/fate|destiny|karma/.test(l)) key = 'fate';
      if (!key || !CONCEPTS[key]) {
        return out(ln(["Big question. I'm a rule-based character so I can't claim certainty, but I think the honest answer usually involves a bit of mystery and a bit of choice. What's your take?", "I love questions like this — they don't have tidy answers. I'd say it's something we figure out through living it. What do you think?"], X), { expr: 'think', follow: [fu("What's your answer?", 'open')] });
      }
      return out(CONCEPTS[key], { expr: 'think', follow: [fu("What does it mean to you?", 'open')] });
    }
    case 'hypothetical': {
      const h = HYPO.find((x) => x.re.test(l));
      const text = h ? ln(h.lines, X) : ln(HYPO_DEFAULT, X);
      return out(R(text, X), { expr: 'happy', follow: [fu("What about you?", 'open')] });
    }
    case 'likes_q': return likesOut(X, a);
    case 'choice_q': return choiceOut(X, a);
    case 'fav_any': return favOut(X, a, eng, fx);
    case 'zodiac': return zodiacOut(X, a);
    case 'fortune': {
      if (/8[- ]?ball|will i|am i|is it|will it|is this|is that/.test(l) && /\?\s*$/.test(a.raw)) return out(`🎱 ${pick(EIGHTBALL, rng)} (Playful guess only — I'm a rule-based companion, not a crystal ball.)`, { expr: 'wink' });
      return out(`${pick(FORTUNES, rng)} (Just playing — I can't actually see the future.)`, { expr: 'wink' });
    }
    case 'riddle': {
      const used = (conv.riddles ||= []);
      let left = RIDDLES.map((_, i) => i).filter((i) => !used.includes(i));
      if (!left.length) { conv.riddles = []; left = RIDDLES.map((_, i) => i); }
      const i = pick(left, rng); conv.riddles.push(i);
      conv.pending = { type: 'riddle', i, tries: 0 };
      return out(`Okay, here's one: ${RIDDLES[i].q}`, { expr: 'wink' });
    }
    case 'draft_message': return draftOut(X, a, fx);
    case 'translate_phrase': return translateOut(X, a);
    case 'speak_language_q':
      return out("A few words and phrases in Spanish, French, German, Italian, Portuguese, Japanese, Korean and Mandarin — a small phrasebook, nowhere near fluent. Ask me “how do you say thank you in French?” and I'll tell you if I know it.", { follow: [fu("Which language are you learning?", 'open')] });
    case 'greet_lang': {
      const word = Object.keys(LANG_HELLO).sort((x, y) => y.length - x.length).find((w) => l.startsWith(w));
      const lang = word && LANG_HELLO[word];
      if (!lang) return null;
      return out(`${HELLO_BACK[lang]} Do you speak ${cap(lang)}? I only know a few words, but I like practising.`, { follow: [fu("Where did you learn it?", 'open')] });
    }
    case 'fun_fact':
      return null; // data-driven (DB.intent.fun_fact)
    case 'really_q': {
      const L = conv.last2;
      return out(L ? ln(["Really. I wouldn't say it if I didn't mean it.", "Yes — I meant that. Why, does it sound too good to be true?", "I did, and I do. Want me to explain what I meant?"], X) : ln(["Really, really. What made you doubt it?", "Yes! Why — what's making you wonder?"], X), { expr: 'caring' });
    }
    case 'more_please': return moreOut(eng, X, a, fx);
  }
  return null;
}

function recOut(X, kind, l, conv) {
  const { rng } = X;
  const g = (REC_GENRE.find(([re, key]) => re.test(l) && RECS[kind][key]) || [null, 'default'])[1];
  const pool = RECS[kind][g] || RECS[kind].default;
  const seen = (conv.recSeen ||= []);
  let fresh = pool.filter((x) => !seen.includes(x));
  if (fresh.length < 2) { conv.recSeen = []; fresh = pool; }
  const picks = shuffle(fresh, rng).slice(0, Math.min(3, fresh.length));
  conv.recSeen.push(...picks);
  const noun = { movie: 'movies', show: 'shows', book: 'books', music: 'listens', game: 'games', food: 'ideas' }[kind];
  const lead = g === 'default' ? `A few ${noun} I'd happily vouch for:` : `If you're in a ${g === 'cozy' ? 'cosy' : g} mood, ${noun} to try:`;
  return out(`${lead} ${list(picks)}. These come from my own well-worn favourites, so tell me what you've liked before and I'll aim better.`, { expr: 'happy', follow: [fu(`What's the last ${kind === 'music' ? 'album you loved' : kind === 'food' ? 'meal you really enjoyed' : kind} you really enjoyed?`, 'open')] });
}

function likesOut(X, a) {
  const { rng } = X;
  const m = a.l.match(/^(?:do you|are you(?: a fan of| into| obsessed with| interested in| afraid of| scared of| good at| bad at| allergic to)?|have you(?: ever)?(?: been to| tried| seen| read| played| heard| eaten| tasted| watched| visited| met| done)?|would you(?: ever)?(?: try| go| eat| visit| date| marry| move| live| wear| learn)?)\s+(?:(?:like|love|enjoy|hate|dislike|prefer|eat|watch|play|listen to|read|drink|have|use|know|speak|believe in|follow|support|appreciate|collect|own|wear|cook|bake|go to|go for)\s+)?(.+?)\??$/);
  let x = (m && m[1] || '').replace(/^(a|an|the|to|any|some)\s+/, '').trim();
  if (!x || x.length > 40) x = 'that';
  const hate = /\b(hate|dislike|afraid|scared|allergic|tired of)\b/.test(a.l);
  const never = /^(have you (ever )?|would you (ever )?)/.test(a.l);
  let cat;
  if (hate) cat = rng() < 0.5 ? 'dislike' : 'meh';
  else cat = pick(['love', 'love', 'like', 'like', 'curious', 'meh'], rng);
  if (never) {
    const t = ln(cat === 'meh' || cat === 'dislike' ? ["Not yet, and I'm not sure I'm in a hurry. Why, would you recommend {x}?", "I haven't, honestly — {x} isn't high on my list. Convince me?"] : ["Not yet! But {x} is on my wish list. Have you?", "I haven't, but I'd love to. What's it like — {x}?"], X, { x });
    return out(t, { expr: 'happy', follow: [fu(`What about you?`, 'open')] });
  }
  return out(cap(ln(LIKE_LINES[cat], X, { x })), { expr: cat === 'dislike' || cat === 'meh' ? 'think' : 'happy', follow: [fu(`What do you like about ${x === 'that' ? 'it' : x}?`, 'open')] });
}

function choiceOut(X, a) {
  const { rng } = X;
  const m = a.l.match(/(?:prefer|like|want|rather|choose|pick|better|best|cooler|nicer|hotter|stronger)?\s*([a-z0-9' -]{2,30}?)\s+(?:or|vs\.?|versus)\s+([a-z0-9' -]{2,30}?)\??$/);
  if (!m) return null;
  const strip = (s) => s.replace(/^(do you (prefer|like|want)|would you (rather|prefer|choose|pick)( be| have| do)?|which (is|one is) (better|best|cooler|nicer)|who'?s? (better|cooler|hotter|stronger)|which do you (prefer|like|choose|pick)|pick one|what do you (prefer|like))\s*[:,]?\s*/, '').replace(/^(a|an|the)\s+/, '').trim();
  let x = strip(m[1]), y = strip(m[2]);
  if (!x || !y) return null;
  const pair = PAIRS.find((p) => (p.a === x && p.b === y) || (p.a === y && p.b === x));
  if (pair) {
    const first = rng() < 0.5;
    const ch = first ? pair.a : pair.b;
    return out(`${ch === pair.a ? pair.ra : pair.rb} You?`, { expr: 'happy', follow: [] });
  }
  const win = rng() < 0.5 ? x : y;
  return out(`${cap(win)} — ${pick(CHOICE_REASONS, rng)} What's your pick?`, { expr: 'wink', follow: [] });
}

function favOut(X, a, eng, fx) {
  const { rng } = X;
  const l = a.l.replace(/[?.!]+$/, '');
  let m = l.match(/(?:favou?rite|fav|favs)\s+(.+)$/);
  let cat = m ? m[1].replace(/^(kind of|type of|sort of)\s+/, '').trim() : '';
  cat = cat.replace(/\s+(is|are|do you|would you).*$/, '').trim();
  const key = FAV_ALIAS[cat] || cat;
  const pool = FAVS[key];
  if (pool && pool.length) return out(`${cap(pick(pool, rng))}. What's yours?`, { expr: 'happy', follow: [] });
  if (!cat && eng) return eng.intentPieces({ id: 'her_favorite', meta: { pr: 9 }, score: 90 }, a, X, false, fx, []);
  if (!cat) return out("Ooh, depends on the category! Ask me about a specific one — animal, season, flower, dessert, city, word, number — and I'll commit to an answer.", { expr: 'happy' });
  if (eng) return eng.intentPieces({ id: 'her_favorite', meta: { pr: 9 }, score: 90 }, a, X, false, fx, []);
  return out(ln([`Favourite ${cat}? Great question. I don't have a firm answer without thinking — I'd say whichever one has a good story behind it. What's yours?`, `I haven't settled on a favourite ${cat}. I'd love to hear yours first — it'll help me decide.`], X), { expr: 'think' });
}

function zodiacOut(X, a) {
  const { rng, conv } = X;
  const sign = ZODIAC.find((z) => new RegExp(`\\b${z.sign.toLowerCase()}\\b`).test(a.l));
  if (sign) return zodiacText(X, sign);
  const d = parseDate(a.l);
  if (d) { const z = signFor(d); return z ? zodiacText(X, z) : null; }
  if (/compatib/.test(a.l)) return out("Astrology isn't science, so take it lightly, but I'm happy to play — tell me your sign and theirs and I'll say what the stars (mostly my imagination) suggest.", { expr: 'wink' });
  conv.pending = { type: 'zodiac' };
  return out("I'm happy to play astrologer — just for fun, since it isn't science. What's your sign, or your birthday?", { expr: 'wink' });
}
function signFor(d) {
  return ZODIAC.find((z) => (d.month === z.from[0] && d.day >= z.from[1]) || (d.month === z.to[0] && d.day <= z.to[1]));
}
function zodiacText(X, z) {
  return out(`${z.sign}: ${z.blurb}. Today's nudge: ${pick(HOROSCOPE, X.rng)} Just playful, of course — I can't read the stars, I'm a rule-based companion.`, { expr: 'wink' });
}

function draftOut(X, a, fx) {
  const { rng } = X;
  const l = a.l;
  const kind = (DRAFT_KIND.find(([re]) => re.test(l)) || [null, null])[1];
  if (!kind) return out("I can help you draft it. Who's it for, and what do you want to say — an apology, a thank-you, an invitation, a check-in? Give me the gist and I'll write a first version you can tweak.", { expr: 'think', follow: [fu("Who's it for?", 'open')] });
  const to = (DRAFT_TO.find(([re]) => re.test(l)) || [null, 'there'])[1];
  const what = (l.match(/\bfor ([a-z' ]{3,40}?)(?:[.?!]|$)/) || [])[1] || 'what you did';
  const tpl = pick(DRAFTS[kind], rng);
  const text = tpl.replace(/\{to\}/g, to).replace(/\{what\}/g, what);
  const hi = to === 'there' ? text.replace('Hi there,', 'Hi,').replace('Hey there,', 'Hey,') : text;
  const body = hi.replace(/^((?:Hi|Hey|Happy birthday|Congratulations)[^,!]*[,!])\s+/, '$1\n\n').replace(/\n\n([a-z])/, (m, c) => `\n\n${c.toUpperCase()}`);
  const intro = "Here's a first draft you can tweak:";
  const outro = 'Want it warmer, shorter or more formal?';
  fx.bubbles = [intro, body, outro];
  return out(`${intro} ${hi} ${outro}`, { expr: 'happy', follow: [] });
}

function translateOut(X, a) {
  const { rng } = X;
  const l = a.l.replace(/[?!.]+$/, '');
  const langWord = (l.match(/\b(spanish|french|german|italian|portuguese|japanese|korean|mandarin|chinese)\b/) || [])[1];
  if (!langWord) return null;
  const lang = langWord === 'chinese' ? 'mandarin' : langWord;
  if (/\b(teach me|learn)\b/.test(l) && !/\b(say|how|translate)\b/.test(l)) {
    const keys = shuffle(['hello', 'thank you', 'please', 'good morning', 'cheers', 'i love you', 'goodbye'], rng).slice(0, 4);
    return out(`A few to start with in ${cap(LANGS[lang] ? LANGS[lang] : lang)}: ${keys.map((k) => `“${k}” is ${PHRASES[k][lang]}`).join('; ')}. Want more?`, { expr: 'happy', follow: [fu("Want to practise one together?", 'yesno')] });
  }
  let phrase = (l.match(/(?:how (?:do|would|can) (?:you|i|we) say|translate|say|what'?s|what is)\s+["“']?(.+?)["”']?\s+(?:in|into|to)\s+(?:spanish|french|german|italian|portuguese|japanese|korean|mandarin|chinese)/) || [])[1];
  if (!phrase) phrase = (l.match(/["“'](.+?)["”']/) || [])[1];
  if (!phrase) return out(`I can try! Which word or phrase would you like in ${cap(lang)}? I know the everyday basics.`, { follow: [] });
  phrase = phrase.replace(/^(the word|the phrase|a|an)\s+/, '').trim();
  const norm = PHRASE_ALIASES[phrase] || phrase;
  const key = Object.keys(PHRASES).find((k) => k === norm) || Object.keys(PHRASES).sort((x, y) => y.length - x.length).find((k) => norm.includes(k));
  if (key && PHRASES[key][lang]) return out(`“${cap(key)}” in ${cap(lang)} is “${PHRASES[key][lang]}”. (My phrasebook is small, so for anything important, double-check with a proper dictionary.)`, { follow: [fu("Want another one?", 'yesno')] });
  return out(`I don't have “${phrase}” in my little phrasebook — I know the basics: hello, thank you, please, I love you, good morning, goodnight, sorry, cheers, goodbye and a few more. For anything beyond that, a proper dictionary will serve you better than my guess.`, { expr: 'think', follow: [] });
}

function moreOut(eng, X, a, fx) {
  const { conv } = X;
  const last = conv.last2;
  if (!last) return out("More of what? Give me a hint and I'm all yours — a story, a joke, a fact, a recommendation…", { expr: 'happy' });
  const sub = { ...a, l: last.l, raw: last.l };
  if (last.id === 'recommend' || last.id === 'riddle' || last.id === 'recipe_q') {
    if (last.id === 'recipe_q') return out("That's all I have for that one — want another recipe, or help with a side dish?", { expr: 'happy' });
    return depthIntent(eng, last.id, sub, X, fx);
  }
  if (['fun_fact', 'affirmation', 'story_request', 'poem_request', 'pickup_line', 'dare', 'confess', 'joke', 'compliment_user', 'hype_me', 'roast_me'].includes(last.id)) {
    const hit = { id: last.id, meta: { pr: 9 }, score: 90 };
    const r = eng.intentPieces(hit, sub, X, false, fx, []);
    if (r && r.pieces.length) { conv.last = last; return r; }
  }
  if (DEPTH_REPLAYABLE.has(last.id)) return depthIntent(eng, last.id, sub, X, fx);
  return out("Tell me more about what you'd like — I'm happy to keep going, I just want to point it the right way.", { expr: 'happy' });
}
const DEPTH_REPLAYABLE = new Set(['hypothetical', 'fortune', 'concept_q', 'gift_ideas', 'outfit_help', 'workout_plan', 'zodiac']);

/* ------------------------------ pending (riddle, zodiac, recpick) ------------------------------ */
export function depthPending(eng, p, a, X, fx) {
  const T = (p.type || '');
  const { conv, rng } = X;
  if (T === 'riddle') {
    const r = RIDDLES[p.i];
    const guess = a.l;
    if (r.a.some((x) => guess.includes(x.trim()))) { fx.aff += 1; return { pieces: [C(`${ln(["Yes! You got it.", "Correct! Nicely done.", "Right! You're good at this."], X)} ${r.show}`)], follow: [fu("Want another riddle?", 'yesno')], expr: 'happy', done: true }; }
    if (/give up|i (don'?t|do not) know|idk|no idea|tell me|reveal|answer\??$|what is it|what'?s the answer|i surrender|stumped/.test(guess)) return { pieces: [C(`${r.show} Sneaky, right?`)], follow: [fu("Want another one?", 'yesno')], expr: 'wink', done: true };
    if ((p.tries || 0) < 2) { conv.pending = { ...p, tries: (p.tries || 0) + 1 }; return { pieces: [C(ln(["Not quite — think about it a bit differently.", "Close, but no. Try again, or say “give up”.", "Hmm, nope! One more try?"], X))], follow: [], expr: 'wink' }; }
    return { pieces: [C(`Nope — it was: ${r.show} Better luck next time!`)], follow: [fu("Another riddle?", 'yesno')], expr: 'laugh', done: true };
  }
  if (T === 'zodiac') {
    const sign = ZODIAC.find((z) => new RegExp(`\\b${z.sign.toLowerCase()}\\b`).test(a.l));
    const d = parseDate(a.l);
    const z = sign || (d && signFor(d));
    if (z) { const r = zodiacText(X, z); return { ...r, done: true }; }
    return null;
  }
  if (T === 'recpick') {
    const kind = /\b(movies?|films?)\b/.test(a.l) ? 'movie' : /\b(shows?|series|tv)\b/.test(a.l) ? 'show' : /\b(books?|read)\b/.test(a.l) ? 'book' : /\b(music|songs?|album|listen)\b/.test(a.l) ? 'music' : /\b(games?)\b/.test(a.l) ? 'game' : /\b(food|eat|dinner|lunch|something to eat)\b/.test(a.l) ? 'food' : null;
    if (kind) return { ...recOut(X, kind, a.l, conv), done: true };
    return null;
  }
  return null;
}

/* ------------------------------ speech-act fallback ------------------------------ */
const RELS = 'mom|mum|mother|dad|father|sister|brother|boss|manager|coworker|colleague|friend|best friend|roommate|neighbou?r|teacher|professor|cousin|aunt|uncle|grandma|grandpa|grandmother|grandfather|boyfriend|girlfriend|wife|husband|partner|ex|landlord|dog|cat|kid|son|daughter|crush|date|team|class|school|landlady|therapist|doctor|in-laws?|stepmom|stepdad|neighbors?';
const NEG_RE = /\b(hate|hates|mad|angry|annoy\w*|rude|yell\w*|fought|fight|argu\w*|ignor\w*|lied|lies|cheat\w*|upset|mean|unfair|terrible|awful|bad|sick|ill|died|passed away|fired|dumped|broke up|ghost\w*|cancel\w*|late|forgot|selfish|toxic|difficult|stress\w*|worried|sad|crying|cried)\b/;
const POS_RE = /\b(love|loves|loved|sweet|kind|proud|helped|surprised|amazing|great|wonderful|awesome|happy|funny|nice|visiting|visit|came over|got engaged|got married|got promoted|supports?|supportive|thoughtful|best)\b/;
const TIME_RE = '(tomorrow|tonight|today|later|this (?:weekend|week|evening|morning|afternoon|month)|next (?:week|month|year|weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|on (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|in (?:a few|\\d+|an?) (?:days?|weeks?|hours?|minutes?|months?)|at \\d{1,2}(?::\\d{2})? ?(?:am|pm)?|this (?:friday|saturday|sunday|monday|tuesday|wednesday|thursday))';
const HARD_ACT = /\b(interview|exam|test|surgery|appointment|meeting|presentation|court|audit|review|deadline|move|moving|funeral|dentist|doctor|biopsy|trial|recital|audition|flight)\b/;

export function depthFallback(eng, a, X, fx) {
  const { rng, conv } = X;
  const raw = a.raw, l = a.l;
  const prev = conv.prevL;
  const S = SPEECH;
  const done = (text, expr = 'think', follow = []) => ({ pieces: [C(text)], follow, expr });
  const letters = (raw.match(/[a-zÀ-ɏ]/gi) || []).length;

  // emoji / symbols only
  if (!letters && /\p{Extended_Pictographic}/u.test(raw)) {
    const kind = (EMOJI_KIND.find(([re]) => re.test(raw)) || [null, 'neutral'])[1];
    return done(ln(S.emoji[kind], X), kind === 'sad' || kind === 'cry' ? 'caring' : 'happy');
  }
  if (!letters) return null;
  // keyboard mash
  if (a.len <= 2 && /^[a-z]{5,}$/.test(l.replace(/\s/g, '')) && (!/[aeiouy]/.test(l) || /([a-z]{2,3})\1{2,}/.test(l) || /^(asdf|sdf|qwer|zxcv|hjkl|jkl|fghj)/.test(l) || /[^aeiouy\s]{6,}/.test(l))) return done(ln(S.gibberish, X), 'laugh');
  // shouting
  if (a.len >= 3 && raw.length > 12 && (raw.match(/[A-Z]/g) || []).length / letters > 0.85) return done(ln(S.caps, X), 'caring');
  // exact repeat
  if (prev && prev === l && a.len >= 2) return done(ln(S.repeat, X), 'think');

  // "my {rel} ..." statements
  let m = l.match(new RegExp(`\\bmy (${RELS})\\b(.*)`));
  if (m && !a.isQuestion && a.len >= 4) {
    const rel = m[1];
    const they = /^(mom|mum|mother|sister|grandma|grandmother|girlfriend|wife|aunt|landlady|teacher)$/.test(rel) ? 'she' : /^(dad|father|brother|grandpa|grandfather|boyfriend|husband|uncle|landlord)$/.test(rel) ? 'he' : 'they';
    const kind = NEG_RE.test(l) ? 'other_neg' : POS_RE.test(l) ? 'other_pos' : 'other_neu';
    conv.last2 = { id: 'other', l };
    return done(ln(S[kind], X, { rel, they }), kind === 'other_neg' ? 'caring' : 'happy', kind === 'other_neg' ? [fu("Do you want advice, or would you like me to just listen?", 'listen')] : []);
  }

  // plans
  m = l.match(new RegExp(`\\bi(?:'?m| am| have to| need to| must|'ll| will| gotta| got to)?\\s*(?:going to|gonna|have to|need to|must|will|'ll|want to|plan to|planning to|about to|am)?\\s+(.{3,60}?)\\s+${TIME_RE}`));
  if (m && !a.isQuestion) {
    const act = m[1].replace(/^(to|be)\s+/, '').trim();
    const time = (l.match(new RegExp(TIME_RE)) || [''])[0];
    if (act && act.split(' ').length <= 8) {
      const hard = HARD_ACT.test(act) || /\b(nervous|worried|stressed|scared|dreading)\b/.test(l);
      return done(ln(hard ? S.plan_hard : S.plan, X, { act, Act: cap(act), time }).replace(/\{[^}]*\}/g, ''), hard ? 'caring' : 'happy');
    }
  }

  // decisions
  if (/\b(should i|can'?t decide|torn between|which (one )?should i|not sure (if|whether) i should|help me (decide|choose)|what would you do|pros and cons|am i (doing|making) the right|is it (a )?(good|bad) idea (to|if))\b/.test(l)) {
    return done(ln(S.decide, X), 'think', [fu("What are the options you're weighing?", 'open')]);
  }

  // advice playbooks
  const adv = ADVICE.find((x) => x.re.test(l));
  if (adv && (a.isQuestion || /\b(how|tips?|advice|help|ideas?|want to|wanna|need to|trying to|struggling)\b/.test(l))) {
    const tips = shuffle(adv.tips, rng).slice(0, 3);
    conv.last2 = { id: 'advice', l };
    return done(`Here's how I'd approach ${adv.label}: ${tips.map((t, i) => `${['First', 'Second', 'Third'][i]}, ${t}`).join('. ')}. ${adv.outro}`, 'think', [fu("Which of those feels most doable?", 'open')]);
  }

  // how-to
  m = l.match(/^(?:how (?:do|can|should|would|could) (?:i|you|we|one)|how to|what'?s the best way to|what is the best way to|any (?:tips|advice) (?:on|for)|tips (?:on|for)|can you help me (?:with|to))\s+(.{3,70}?)\??$/);
  if (m) return done(R(pick(S.howto, rng), X, { topic: m[1] }), 'think', [fu("What's your goal here, exactly?", 'open')]);

  // why-questions
  if (/^why (do|am|is|does|are|can'?t|don'?t|did|would|won'?t|isn'?t|aren'?t|has|have)\b/.test(l)) {
    const self = /^why (do|am|can'?t|don'?t|did|would|won'?t) i\b|^why (is|does|are|has|have) (my|it so hard for me)/.test(l);
    return done(ln(self ? S.why_self : S.why_world, X), 'think', [fu(self ? "When did you first notice it?" : "What's your theory?", 'open')]);
  }

  // asking about her experience
  if (/^(have you ever|did you ever|were you ever|when did you (last|first)|what('?s| was| is) (the|your) (last|first|most|best|worst)|tell me about a time)\b/.test(l)) return done(ln(S.experience, X), 'happy', [fu("What about you?", 'open')]);

  // opinions
  if (/^(i (think|believe|feel like|guess|reckon|honestly think|personally think)|in my opinion|imo|honestly|personally|unpopular opinion|hot take)\b/.test(l) || /\b(is|are) (so |really |totally |kinda |way |just )?(overrated|underrated|the worst|the best|trash|garbage|overhyped|boring|dumb|stupid|pointless|a scam|fake|toxic)\b/.test(l)) {
    const pushback = /\b(hate|worst|trash|garbage|overrated|stupid|dumb|pointless|scam|fake)\b/.test(l) && rng() < 0.4;
    conv.last2 = { id: 'opinion', l };
    return done(ln(pushback ? S.opinion_pushback : S.opinion, X), 'think');
  }

  // statements about her feelings toward topic words or short noun phrases
  if (a.len <= 2 && !a.isQuestion && letters >= 3 && !/^(ok|okay|yes|no|yeah|yep|nope|sure|fine|lol|haha|hmm+|hm+|nice|cool|wow|oh|ah|k|kk|thanks|thx)$/.test(l)) {
    const w = a.ws.filter((x) => x.length > 2).slice(-1)[0] || l;
    return { ...done(ln(S.noun, X, { word: w, Word: cap(w) }).replace(/\{[^}]*\}/g, ''), 'think'), weak: true };
  }
  return null;
}
