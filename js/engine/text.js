// AMORA — text analysis: normalisation, sentiment, pronoun reflection, fact extraction, date parsing.

export const STOP = new Set('a an the and or but if so of to in on at for with about as is are was were be been am i me my mine you your yours we our it its this that these those do does did have has had will would can could should just not no yes very really too also than then there here what when where which who whom how why from by into out up down over again more most some any all each other such only own same so than too s t don doesn didn won isn aren wasn weren hasn haven hadn like get got go going gonna wanna im ive id ill youre thats lets one two much many even still yeah yep nope okay ok oh um uh well got let make made know think said say says tell told thing things stuff something anything'.split(' '));

export function normalize(text) {
  return String(text || '')
    .replace(/[’‘`´]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}
export const lower = (t) => normalize(t).toLowerCase();
export const words = (t) => (lower(t).match(/[a-z0-9']+/g) || []);
export const contentWords = (t) => words(t).filter((w) => !STOP.has(w.replace(/'/g, '')) && w.length > 2);

const POS = new Set('good great amazing awesome wonderful happy love loved lovely nice fun excited exciting glad best beautiful perfect fantastic brilliant sweet cute enjoy enjoyed enjoying yay proud thrilled grateful blessed relaxed calm peaceful hopeful better cool fine super delighted joy joyful haha lol lmao yes win won passed promoted celebrate celebrating wow incredible favorite favourite smile smiling laugh laughing'.split(' '));
const NEG = new Set('bad sad terrible awful horrible hate hated angry mad upset sick tired exhausted lonely alone depressed anxious worried stressed stress scared afraid worst miserable cry crying cried hurt hurts pain broken annoyed annoying frustrated frustrating boring bored lost failed failure fail ugh nervous overwhelmed drained down empty hopeless guilty ashamed jealous disappointed disappointing rough difficult struggling struggle dead dying sucks suck nightmare lonely heartbroken grief grieving miss missing'.split(' '));
const NEGATORS = new Set(["not", "no", "never", "don't", "dont", "isn't", "isnt", "wasn't", "wasnt", "can't", "cant", "won't", "wont", "didn't", "didnt", "hardly", "without", "aren't", "arent", "ain't"]);
const BOOST = new Set(['very', 'really', 'so', 'extremely', 'super', 'totally', 'absolutely', 'completely', 'incredibly', 'soooo', 'sooo']);

/** Returns {score:-1..1, pos, neg, intensity:0..1} */
export function sentiment(text) {
  const ws = words(text);
  let pos = 0, neg = 0;
  ws.forEach((w, i) => {
    const flip = ws.slice(Math.max(0, i - 3), i).some((x) => NEGATORS.has(x));
    const boost = ws.slice(Math.max(0, i - 1), i).some((x) => BOOST.has(x)) ? 1.5 : 1;
    if (POS.has(w)) (flip ? (neg += boost) : (pos += boost));
    else if (NEG.has(w)) (flip ? (pos += 0.7 * boost) : (neg += boost));
  });
  const emojiPos = (text.match(/[😀😃😄😁😊🥰😍😘💕💖❤🎉✨🥳😂🤣]/gu) || []).length;
  const emojiNeg = (text.match(/[😢😭😞😔😡😠💔😩😫🥺😟]/gu) || []).length;
  pos += emojiPos; neg += emojiNeg;
  const total = pos + neg;
  const exclam = (text.match(/!/g) || []).length;
  const caps = (text.match(/\b[A-Z]{3,}\b/g) || []).length;
  return {
    score: total ? (pos - neg) / (total + 1) : 0,
    pos, neg,
    intensity: Math.min(1, (total * 0.18) + exclam * 0.1 + caps * 0.15),
  };
}

export function analyze(text) {
  const raw = normalize(text);
  const l = raw.toLowerCase();
  const ws = words(raw);
  const s = sentiment(raw);
  return {
    raw, l, ws, s,
    isQuestion: /\?\s*$/.test(raw) || /^(what|why|how|when|where|who|which|do|does|did|can|could|would|will|are|is|am|have|has|should|tell me|any)\b/.test(l),
    len: ws.length,
    exclaim: (raw.match(/!/g) || []).length,
    content: contentWords(raw),
  };
}

/** Eliza-style pronoun reflection so "I am tired of my job" -> "you are tired of your job". */
const REFLECT = { i: 'you', "i'm": "you're", im: "you're", am: 'are', my: 'your', me: 'you', mine: 'yours', myself: 'yourself', "i've": "you've", "i'd": "you'd", "i'll": "you'll", was: 'were', you: 'me', your: 'my', yours: 'mine', "you're": "I'm", yourself: 'myself' };
export function reflect(phrase) {
  return phrase.replace(/[.!?]+$/, '').split(/\s+/).map((w) => {
    const lw = w.toLowerCase();
    return REFLECT[lw] || w;
  }).join(' ');
}

/** Extract a statement worth reflecting: "I feel X", "I think X", "I want X", "I'm X" ... */
export function reflectable(text) {
  const t = normalize(text);
  const m = t.match(/\bi(?:'m| am| feel| felt| think| thought| want| wanted| need| needed| have| had| love| hate| wish| hope| keep| can't|'ve| was| will| would like)\b[^.!?]{3,70}/i);
  if (!m) return null;
  const phrase = m[0];
  if (phrase.split(/\s+/).length < 3) return null;
  return reflect(phrase);
}

export function keyword(a) {
  // The most "content-ful" word: longest non-stop word, preferring later words (usually the object of the sentence).
  const c = a.content.filter((w) => !/^\d+$/.test(w));
  if (!c.length) return null;
  let best = c[0];
  c.forEach((w) => { if (w.length >= best.length) best = w; });
  return best;
}

/* ------------------------------ dates ------------------------------ */
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const MON3 = MONTHS.map((m) => m.slice(0, 3));
export function parseDate(str) {
  const s = lower(str).replace(/(\d)(st|nd|rd|th)\b/g, '$1');
  let m = s.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})(?:,?\s+(\d{4}))?/);
  if (m) return mk(MON3.indexOf(m[1].slice(0, 3)) + 1, +m[2], m[3] && +m[3]);
  m = s.match(/\b(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b(?:,?\s+(\d{4}))?/);
  if (m) return mk(MON3.indexOf(m[2].slice(0, 3)) + 1, +m[1], m[3] && +m[3]);
  m = s.match(/\b(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?\b/);
  if (m) { const a = +m[1], b = +m[2]; const y = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : null; return a > 12 ? mk(b, a, y) : mk(a, b, y); }
  return null;
  function mk(month, day, year) { return month >= 1 && month <= 12 && day >= 1 && day <= 31 ? { month, day, year: year || null } : null; }
}
export const fmtMD = (d) => `${MONTHS[d.month - 1][0].toUpperCase()}${MONTHS[d.month - 1].slice(1)} ${d.day}`;

export function daysUntil(d, now = new Date()) {
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let n = new Date(t.getFullYear(), d.month - 1, d.day);
  if (n < t) n = new Date(t.getFullYear() + 1, d.month - 1, d.day);
  return Math.round((n - t) / 86400000);
}

/* --------------------------- fact extraction --------------------------- */
const NOT_NAMES = new Set('sad tired happy fine good great bad okay ok sorry here back home hungry bored angry excited sick ready sure not just so very a an the lonely nervous scared stressed single married busy late early done going gonna from in at on with also still really glad fun curious confused lost free working studying thinking feeling'.split(' '));
const JOBS = 'teacher nurse engineer developer programmer designer student doctor lawyer writer artist chef cook driver manager accountant electrician mechanic musician barista broker analyst scientist researcher professor photographer pilot dentist pharmacist plumber carpenter farmer firefighter paramedic therapist consultant architect marketer salesman saleswoman entrepreneur freelancer waiter waitress bartender cashier receptionist secretary journalist editor actor dancer coach trainer paralegal banker trader soldier veteran librarian technician contractor realtor dispatcher'.split(' ');
const PETS = 'dog cat puppy kitten bunny rabbit hamster parrot bird fish horse turtle guinea pig lizard snake ferret'.split(' ');
const FAMILY = 'mom mother dad father sister brother grandma grandmother grandpa grandfather wife husband partner daughter son kid kids girlfriend boyfriend aunt uncle cousin roommate best friend'.split(' ');
const HOBBY_VERBS = /^(play|playing|read|reading|draw|drawing|paint|painting|cook|cooking|bak(?:e|ing)|hik(?:e|ing)|run|running|gam(?:e|ing)|writ(?:e|ing)|sing|singing|danc(?:e|ing)|knit|knitting|photograph|photography|swim|swimming|cycl(?:e|ing)|bik(?:e|ing)|lift|lifting|travel|traveling|travelling|fish|fishing|garden|gardening|code|coding|climb|climbing|skat(?:e|ing)|surf|surfing|ski|skiing|watch|watching|listen|listening|collect|collecting|build|building|sketch|sketching|craft|crafting|yoga|meditat(?:e|ing))\b/;

const clean = (s) => s.replace(/\b(a lot|so much|very much|too|though|honestly)\b/gi, '').replace(/\s+/g, ' ').replace(/^[\s,.-]+|[\s,.!?-]+$/g, '').trim();

/** Returns array of {k, v, type:'fact'|'like'|'dislike'|'hobby'|'family'|'date'|'note', ...} */
export function extractFacts(text, pending = null) {
  const t = normalize(text);
  const out = [];
  let m;

  // Name
  m = t.match(/\b(?:my name is|my name's|i am called|i'm called|call me|they call me|people call me|name's)\s+([A-Za-z][A-Za-z'-]{1,20})/i);
  if (m && !NOT_NAMES.has(m[1].toLowerCase())) out.push({ k: 'name', v: cap(m[1]), type: 'fact' });
  else if (pending === 'name') {
    m = t.match(/^(?:it'?s|its|i'?m|im|i am|this is)?\s*([A-Za-z][A-Za-z'-]{1,20})(?:\s+[A-Za-z'-]+)?[.!]*$/i);
    if (m && !NOT_NAMES.has(m[1].toLowerCase())) out.push({ k: 'name', v: cap(m[1]), type: 'fact' });
  }

  // Age (adult app: flag minors)
  m = t.match(/\bi(?:['’]?m| am)\s+(?:only |just |still |almost )?(\d{1,2})\s*(?:years? old|yrs? old|yo|y\/o|-year-old)\b/i) || t.match(/\bi(?:['’]?m| am) an? (\d{1,2})[ -]?(?:year|yr)[ -]?old\b/i) || t.match(/\bi(?:['’]?m| am)\s+(?:only |just |still )?(\d{1,2})\b(?!\s*(?:%|percent|minutes?|mins?|hours?|hrs?|km|miles?|days?|weeks?|months?|times|feet|ft|cm|kg|lbs|pounds|steps|away|out of|\/))/i) || t.match(/\bi (?:just )?turned (\d{1,2})\b/i) || (pending === 'age' ? t.match(/^(\d{1,2})$/) : null);
  if (m) out.push({ k: 'age', v: +m[1], type: 'fact' });

  // Job / workplace
  m = t.match(/\bi(?:'m| am| work as| work as an?|'m working as an?)\s+(?:an? )?([a-z]+)\b/i);
  if (m && JOBS.includes(m[1].toLowerCase())) out.push({ k: 'job', v: m[1].toLowerCase(), type: 'fact' });
  m = t.match(/\bi work (?:at|for|in)\s+([A-Za-z0-9&' .-]{2,30}?)(?=[.,!?]|$| and | but | as )/i);
  if (m) out.push({ k: 'workplace', v: clean(m[1]), type: 'fact' });
  m = t.match(/\bi(?:'m| am) (?:studying|a student of|majoring in|in school for)\s+([a-z ]{3,30}?)(?=[.,!?]|$| and | at )/i);
  if (m) out.push({ k: 'studies', v: clean(m[1]).toLowerCase(), type: 'fact' });

  // Location
  m = t.match(/\bi (?:live|stay|am based|'m based) in ([A-Z][A-Za-z .'-]{2,30}?)(?=[.,!?]|$| and | but | with )/) || t.match(/\bi(?:'m| am) from ([A-Z][A-Za-z .'-]{2,30}?)(?=[.,!?]|$| and | but )/) || t.match(/\bi grew up in ([A-Z][A-Za-z .'-]{2,30}?)(?=[.,!?]|$| and | but )/);
  if (m) out.push({ k: 'location', v: clean(m[1]), type: 'fact' });

  // Pets
  m = t.match(new RegExp(`\\bmy (${PETS.join('|')})(?:'s name is| is named| is called| named| called|,? )?\\s*([A-Z][a-z]{1,15})?`, 'i'));
  if (m && /\b(i have|my)\b/i.test(t)) {
    out.push({ k: 'pet', v: m[1].toLowerCase(), type: 'fact' });
    if (m[2] && !/^(Is|Was|Has|Had|And|But|Just|Always|Really|Who|That)$/.test(m[2])) out.push({ k: 'pet_name', v: m[2], type: 'fact' });
  }

  // Favorites
  const favRe = /\bmy fav(?:ou?rite)? (music|song|band|artist|singer|food|meal|movie|film|show|book|author|color|colour|game|season|animal|drink|sport|place|hobby)(?: is|'s| are| would be)?\s+([^.!?]{2,40})/i;
  m = t.match(favRe);
  if (m) {
    const cat = { film: 'movie', colour: 'color', band: 'music', artist: 'music', singer: 'music', song: 'music', meal: 'food', author: 'book', show: 'movie' }[m[1].toLowerCase()] || m[1].toLowerCase();
    out.push({ k: 'fav_' + cat, v: clean(m[2]), type: 'fact' });
  }

  // Family / people
  m = t.match(new RegExp(`\\bmy (${FAMILY.join('|')})(?:'s name is| is named| is called| named| called)?\\s*([A-Z][a-z]{1,15})?`, 'i'));
  if (m && /\bmy (mom|mother|dad|father|sister|brother|grandma|grandmother|grandpa|grandfather|wife|husband|daughter|son|kid|kids|aunt|uncle|cousin|best friend|roommate)\b/i.test(t)) {
    const nm = m[2] && /^[A-Z]/.test(m[2]) && !/^(Is|Was|And|But|Just|Always|Really|Who|That|Has|Had|Said|Called)$/.test(m[2]) ? m[2] : '';
    out.push({ k: 'family', v: nm ? `${m[1].toLowerCase()} ${nm}` : m[1].toLowerCase(), type: 'family' });
  }

  // Likes / dislikes / hobbies
  m = t.match(/\bi (?:really |absolutely |totally |just )?(love|like|enjoy|adore|am into|'m into|am obsessed with|'m obsessed with)\s+([^.!?,;]{2,40})/i);
  if (m && !/^(you|u|her|that|this|it|talking|chatting|being)\b/i.test(m[2].trim())) {
    const obj = clean(m[2]);
    if (obj && obj.split(' ').length <= 6) {
      const v = obj.replace(/^to /, '');
      out.push({ k: 'like', v, type: HOBBY_VERBS.test(v) ? 'hobby' : 'like' });
    }
  }
  m = t.match(/\bi (?:really |absolutely )?(hate|dislike|can't stand|cannot stand|don't like|do not like|am not a fan of|'m not a fan of)\s+([^.!?,;]{2,40})/i);
  if (m && !/^(you|u|this|it|that|myself)\b/i.test(m[2].trim())) {
    const obj = clean(m[2]);
    if (obj && obj.split(' ').length <= 6) out.push({ k: 'dislike', v: obj, type: 'dislike' });
  }

  // Dates
  m = t.match(/\bmy (birthday|b-day|bday)(?: is|'s| falls)?(?: on)?\s+(.{3,25}?)(?=[.,!?]|$| and | but )/i);
  if (m) { const d = parseDate(m[2]); if (d) out.push({ k: 'birthday', v: d, type: 'date', label: 'Your birthday', kind: 'birthday' }); }
  m = t.match(/\b(?:our |my )?(anniversary|exam|interview|wedding|trip|flight|deadline|graduation|presentation|appointment|concert|race)\b[^.!?]{0,30}?\b(?:is|on|falls on|are)\s+(?:on\s+)?(.{3,25}?)(?=[.,!?]|$| and | but )/i);
  if (m) { const d = parseDate(m[2]); if (d) out.push({ k: m[1].toLowerCase(), v: d, type: 'date', label: `Your ${m[1].toLowerCase()}`, kind: m[1].toLowerCase() }); }

  // Explicit notes
  m = t.match(/^(?:please )?(?:remember|don't forget|do not forget|keep in mind|note)(?: that)?[:,]?\s+(.{4,200})$/i);
  if (m) out.push({ k: 'note', v: m[1].trim(), type: 'note' });

  return out;
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export { cap };
