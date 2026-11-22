// AMORA — small local "abilities": calculator, unit converter, dice/coin/picker, date maths and subject extraction.
// Pure functions, no network, no eval. They are what lets her answer practical questions without any AI.

const fmtNum = (n) => {
  if (!isFinite(n)) return String(n);
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return n.toLocaleString('en-US');
  const r = Math.abs(n) >= 1e6 || Math.abs(n) < 1e-4 ? n.toExponential(4) : String(Math.round(n * 1e6) / 1e6);
  return Number(r).toLocaleString('en-US', { maximumFractionDigits: 6 });
};
export { fmtNum };

/* ------------------------------ calculator ------------------------------ */
const WORD_NUM = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, twenty: 20, thirty: 30, forty: 40, fifty: 50, hundred: 100, thousand: 1000 };

function parseExpr(src) {
  // tokens
  const toks = [];
  const re = /\s*(\d+(?:,\d{3})*(?:\.\d+)?|\.\d+|[-+*/^%()]|sqrt|pi|e(?![a-z]))/gy;
  let m, pos = 0;
  while (pos < src.length && (m = re.exec(src))) { toks.push(m[1]); pos = re.lastIndex; }
  if (src.slice(pos).trim()) return null;
  let i = 0;
  const peek = () => toks[i], next = () => toks[i++];
  const num = (t) => parseFloat(String(t).replace(/,/g, ''));
  function primary() {
    const t = next();
    if (t === undefined) throw 0;
    if (t === '(') { const v = add(); if (next() !== ')') throw 0; return v; }
    if (t === '-') return -unary();
    if (t === '+') return unary();
    if (t === 'sqrt') return Math.sqrt(unary());
    if (t === 'pi') return Math.PI;
    if (t === 'e') return Math.E;
    if (/^[\d.]/.test(t)) { let v = num(t); while (peek() === '%') { next(); v /= 100; } return v; }
    throw 0;
  }
  function unary() { return primary(); }
  function pow() { const b = primary(); if (peek() === '^') { next(); return Math.pow(b, pow()); } return b; }
  function mul() { let v = pow(); while (peek() === '*' || peek() === '/') { const o = next(); const r = pow(); v = o === '*' ? v * r : v / r; } return v; }
  function add() { let v = mul(); while (peek() === '+' || peek() === '-') { const o = next(); const r = mul(); v = o === '+' ? v + r : v - r; } return v; }
  try { const v = add(); if (i !== toks.length) return null; return v; } catch { return null; }
}

/** Returns { expr, value, text } or null when the message isn't maths. */
export function tryCalc(raw) {
  let s = raw.toLowerCase().trim().replace(/[?=]+$/, '').replace(/^(?:what(?:'s| is)|calculate|calc|compute|solve|work out|how much is|whats)\s*/, '').trim();
  s = s.replace(/\bplus\b/g, '+').replace(/\bminus\b/g, '-').replace(/\b(times|multiplied by)\b/g, '*').replace(/\b(divided by|over)\b/g, '/').replace(/[×x](?=\s*[\d(])/g, '*').replace(/÷/g, '/').replace(/\bto the power of\b/g, '^').replace(/\*\*/g, '^');
  s = s.replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty)\b/g, (w) => WORD_NUM[w]);
  // percent forms
  let m = s.match(/^(\d+(?:\.\d+)?)\s*%\s*(?:of|off)\s*\$?(\d+(?:,\d{3})*(?:\.\d+)?)$/);
  if (m) { const p = +m[1], v = +m[2].replace(/,/g, ''); return { expr: `${p}% of ${fmtNum(v)}`, value: (p / 100) * v }; }
  m = s.match(/^(\d+(?:\.\d+)?)\s*%\s*tip\s*(?:on|for)?\s*\$?(\d+(?:\.\d+)?)$/);
  if (m) { const p = +m[1], v = +m[2]; return { expr: `${p}% tip on ${fmtNum(v)}`, value: (p / 100) * v, extra: `total ${fmtNum(v + (p / 100) * v)}` }; }
  m = s.match(/^(?:the )?square root of (\d+(?:\.\d+)?)$/);
  if (m) return { expr: `√${m[1]}`, value: Math.sqrt(+m[1]) };
  m = s.match(/^(\d+(?:\.\d+)?)\s*(squared|cubed)$/);
  if (m) return { expr: `${m[1]} ${m[2]}`, value: Math.pow(+m[1], m[2] === 'squared' ? 2 : 3) };
  m = s.match(/^(\d+(?:\.\d+)?)\s*(?:as a )?%\s*of\s*(\d+(?:\.\d+)?)$/);
  if (m) return null;
  if (!/\d/.test(s) || !/[-+*/^%()]|sqrt/.test(s)) return null;
  if (/[a-df-wyz]/.test(s.replace(/sqrt|pi/g, ''))) return null;
  if (/^[\d\s,.]+$/.test(s)) return null;           // just a number
  if (/^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/.test(s)) return null; // a date
  const v = parseExpr(s);
  if (v === null || !isFinite(v)) return null;
  return { expr: s.replace(/\*/g, '×').replace(/\//g, '÷').replace(/\s+/g, ' '), value: v };
}

/* ------------------------------ units ------------------------------ */
const U = {
  // length (m)
  mm: ['len', 0.001], millimeter: ['len', 0.001], millimeters: ['len', 0.001], cm: ['len', 0.01], centimeter: ['len', 0.01], centimeters: ['len', 0.01], m: ['len', 1], meter: ['len', 1], meters: ['len', 1], metre: ['len', 1], metres: ['len', 1],
  km: ['len', 1000], kilometer: ['len', 1000], kilometers: ['len', 1000], kilometre: ['len', 1000], kilometres: ['len', 1000], in: ['len', 0.0254], inch: ['len', 0.0254], inches: ['len', 0.0254],
  ft: ['len', 0.3048], foot: ['len', 0.3048], feet: ['len', 0.3048], yd: ['len', 0.9144], yard: ['len', 0.9144], yards: ['len', 0.9144], mi: ['len', 1609.344], mile: ['len', 1609.344], miles: ['len', 1609.344],
  // mass (kg)
  mg: ['mass', 1e-6], g: ['mass', 0.001], gram: ['mass', 0.001], grams: ['mass', 0.001], kg: ['mass', 1], kilogram: ['mass', 1], kilograms: ['mass', 1], kilo: ['mass', 1], kilos: ['mass', 1],
  oz: ['mass', 0.0283495], ounce: ['mass', 0.0283495], ounces: ['mass', 0.0283495], lb: ['mass', 0.453592], lbs: ['mass', 0.453592], pound: ['mass', 0.453592], pounds: ['mass', 0.453592], stone: ['mass', 6.35029], st: ['mass', 6.35029],
  // volume (l)
  ml: ['vol', 0.001], milliliter: ['vol', 0.001], milliliters: ['vol', 0.001], l: ['vol', 1], liter: ['vol', 1], liters: ['vol', 1], litre: ['vol', 1], litres: ['vol', 1],
  tsp: ['vol', 0.00492892], teaspoon: ['vol', 0.00492892], teaspoons: ['vol', 0.00492892], tbsp: ['vol', 0.0147868], tablespoon: ['vol', 0.0147868], tablespoons: ['vol', 0.0147868],
  cup: ['vol', 0.236588], cups: ['vol', 0.236588], pint: ['vol', 0.473176], pints: ['vol', 0.473176], quart: ['vol', 0.946353], quarts: ['vol', 0.946353], gallon: ['vol', 3.78541], gallons: ['vol', 3.78541], gal: ['vol', 3.78541],
  floz: ['vol', 0.0295735],
  // speed (m/s)
  kmh: ['spd', 0.277778], kph: ['spd', 0.277778], mph: ['spd', 0.44704], mps: ['spd', 1], knots: ['spd', 0.514444], knot: ['spd', 0.514444],
  // time (s)
  sec: ['time', 1], second: ['time', 1], seconds: ['time', 1], min: ['time', 60], minute: ['time', 60], minutes: ['time', 60], hr: ['time', 3600], hour: ['time', 3600], hours: ['time', 3600],
  day: ['time', 86400], days: ['time', 86400], week: ['time', 604800], weeks: ['time', 604800], year: ['time', 31557600], years: ['time', 31557600],
  // data (bytes)
  byte: ['data', 1], bytes: ['data', 1], kb: ['data', 1e3], mb: ['data', 1e6], gb: ['data', 1e9], tb: ['data', 1e12],
  // temperature handled separately
  c: ['temp', 'c'], celsius: ['temp', 'c'], centigrade: ['temp', 'c'], f: ['temp', 'f'], fahrenheit: ['temp', 'f'], k: ['temp', 'k'], kelvin: ['temp', 'k'],
};
const NICE = { len: { mm: 'mm', cm: 'cm', m: 'm', km: 'km', in: 'in', ft: 'ft', yd: 'yd', mi: 'mi' }, };
const normUnit = (u) => u.toLowerCase().replace(/\./g, '').replace(/°/g, '').replace(/^fl\s*oz$/, 'floz').replace(/^fluid ounces?$/, 'floz').replace(/^degrees?\s*/, '').replace(/\s+/g, '');
export function tryConvert(raw) {
  const s = raw.toLowerCase().replace(/[?!.]+$/, '').replace(/°/g, '').replace(/\bdegrees?\b/g, '').replace(/\bper hour\b/g, 'ph').replace(/\bfluid ounces?\b/g, 'floz').replace(/\bfl oz\b/g, 'floz');
  let m = s.match(/(-?\d+(?:\.\d+)?)\s*([a-z]+)\s*(?:to|in|into|as|=)\s*([a-z]+)/);
  let amt, from, to;
  if (m) { amt = +m[1]; from = normUnit(m[2]); to = normUnit(m[3]); }
  else {
    m = s.match(/how many ([a-z ]+?) (?:are |is )?(?:in|per) (?:a |an |one )?(-?\d+(?:\.\d+)?)?\s*([a-z]+)/);
    if (!m) return null;
    amt = m[2] ? +m[2] : 1; to = normUnit(m[1]); from = normUnit(m[3]);
  }
  const fu = U[from], tu = U[to];
  if (!fu || !tu || fu[0] !== tu[0]) return null;
  let value;
  if (fu[0] === 'temp') {
    const toC = { c: (v) => v, f: (v) => (v - 32) * 5 / 9, k: (v) => v - 273.15 }[fu[1]](amt);
    value = { c: (v) => v, f: (v) => v * 9 / 5 + 32, k: (v) => v + 273.15 }[tu[1]](toC);
  } else value = (amt * fu[1]) / tu[1];
  const label = (u, n) => (u === 'f' || u === 'c' || u === 'k' ? { c: '°C', f: '°F', k: 'K' }[u] : u);
  void NICE; void label;
  return { amt, from, to, value, text: `${fmtNum(amt)} ${from} ≈ ${fmtNum(Math.round(value * 1e4) / 1e4)} ${to}` };
}

/* ------------------------------ dice / coin / picks ------------------------------ */
export function tryRoll(raw, rng) {
  const l = raw.toLowerCase();
  if (/\b(flip|toss) (a |the )?coin\b|\bheads or tails\b/.test(l)) return { kind: 'coin', text: rng() < 0.5 ? 'Heads' : 'Tails' };
  let m = l.match(/\b(\d{1,2})?\s*d\s?(\d{1,3})\b/);
  if (m && /\b(roll|dice|die|d\d)/.test(l)) {
    const n = Math.min(10, +(m[1] || 1)), sides = Math.max(2, Math.min(1000, +m[2]));
    const rolls = Array.from({ length: n }, () => 1 + Math.floor(rng() * sides));
    return { kind: 'dice', text: n === 1 ? `${rolls[0]} (d${sides})` : `${rolls.join(' + ')} = ${rolls.reduce((a, b) => a + b, 0)} (${n}d${sides})`, rolls };
  }
  if (/\broll (a |the |some )?(dice|die)\b/.test(l)) { const r = 1 + Math.floor(rng() * 6); return { kind: 'dice', text: `${r} (d6)` }; }
  m = l.match(/\b(?:pick|choose|give me|random) (?:a )?(?:random )?number\b.*?(\d+)\s*(?:and|to|-)\s*(\d+)/);
  if (m) { const lo = Math.min(+m[1], +m[2]), hi = Math.max(+m[1], +m[2]); return { kind: 'number', text: String(lo + Math.floor(rng() * (hi - lo + 1))) }; }
  m = l.match(/\b(?:pick|choose|decide|help me (?:pick|choose|decide))(?: for me)?[^:]*?(?:between|:|from)?\s*([a-z0-9' ]+(?:,\s*[a-z0-9' ]+)*(?:,?\s+or\s+[a-z0-9' ]+))\??$/);
  if (m) {
    const parts = m[1].split(/,\s*|\s+or\s+/).map((x) => x.trim()).filter(Boolean);
    if (parts.length >= 2 && parts.length <= 10) return { kind: 'pick', text: parts[Math.floor(rng() * parts.length)], options: parts };
  }
  return null;
}

/* ------------------------------ date maths ------------------------------ */
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const HOLIDAYS = {
  christmas: [11, 25], 'christmas eve': [11, 24], halloween: [9, 31], "new year's": [0, 1], 'new years': [0, 1], "new year's eve": [11, 31], 'new year': [0, 1], valentines: [1, 14], "valentine's day": [1, 14], "valentine's": [1, 14],
  'independence day': [6, 4], 'fourth of july': [6, 4], '4th of july': [6, 4], "st patrick's day": [2, 17], 'april fools': [3, 1], "april fool's day": [3, 1],
};
function parseDateWords(s, now) {
  for (const [k, [mo, d]] of Object.entries(HOLIDAYS)) if (s.includes(k)) { let y = now.getFullYear(); let t = new Date(y, mo, d); if (t < startOfDay(now)) t = new Date(y + 1, mo, d); return { date: t, label: k.replace(/\b\w/g, (c) => c.toUpperCase()).replace("'S", "'s") }; }
  let m = s.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (m) return { date: new Date(+m[1], +m[2] - 1, +m[3]), label: `${m[1]}-${m[2]}-${m[3]}`, exact: true };
  m = s.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?\b/);
  if (m) { const mo = MONTHS.indexOf(m[1]); let y = m[3] ? +m[3] : now.getFullYear(); let t = new Date(y, mo, +m[2]); if (!m[3] && t < startOfDay(now)) t = new Date(y + 1, mo, +m[2]); return { date: t, label: `${m[1][0].toUpperCase()}${m[1].slice(1)} ${m[2]}${m[3] ? ', ' + m[3] : ''}`, exact: !!m[3] }; }
  m = s.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december)(?:,?\s*(\d{4}))?\b/);
  if (m) { const mo = MONTHS.indexOf(m[2]); let y = m[3] ? +m[3] : now.getFullYear(); let t = new Date(y, mo, +m[1]); if (!m[3] && t < startOfDay(now)) t = new Date(y + 1, mo, +m[1]); return { date: t, label: `${m[2][0].toUpperCase()}${m[2].slice(1)} ${m[1]}${m[3] ? ', ' + m[3] : ''}`, exact: !!m[3] }; }
  m = s.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if (m) return { date: new Date(+m[3], +m[1] - 1, +m[2]), label: m[0], exact: true };
  return null;
}
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const dayDiff = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / 86400000);
const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export function tryDays(raw, now, mem) {
  const l = raw.toLowerCase().replace(/[?!.]+$/, '');
  const isUntil = /\b(how many days|how long|how much time|how far|days)\b.*\b(until|till|to|before|since|from)\b|\bcountdown\b|\bhow (long|many days) (until|till|since)\b/.test(l);
  const dow = /\bwhat day (of the week )?(is|was|will)\b/.test(l) || /\bwhich day\b/.test(l);
  if (!isUntil && !dow) return null;
  let d = parseDateWords(l, now);
  if (!d && /\b(my birthday|birthday)\b/.test(l) && mem?.dates) {
    const b = mem.dates.find((x) => x.kind === 'birthday');
    if (b) { let y = now.getFullYear(); let t = new Date(y, b.month - 1, b.day); if (t < startOfDay(now)) t = new Date(y + 1, b.month - 1, b.day); d = { date: t, label: 'your birthday' }; }
  }
  if (!d) return null;
  const n = dayDiff(now, d.date);
  const wk = WD[d.date.getDay()];
  if (dow && !isUntil) return { text: `${d.label} ${n < 0 ? 'was' : 'is'} a ${wk}${d.exact ? '' : ` (this year's: ${d.date.getFullYear()})`}.` };
  const abs = Math.abs(n);
  const wks = abs >= 14 ? ` (about ${Math.round(abs / 7)} weeks)` : '';
  if (n === 0) return { text: `${d.label} is today!` };
  if (/\bsince\b/.test(l) || n < 0) return { text: `It's been ${abs} day${abs === 1 ? '' : 's'}${wks} since ${d.label} (${wk}).` };
  return { text: `${n} day${n === 1 ? '' : 's'}${wks} until ${d.label} — that's a ${wk}.` };
}

/* ------------------------------ subject extraction for lookups ------------------------------ */
export function subjectOf(raw) {
  let s = raw.trim().replace(/[?!.]+$/, '');
  const pats = [
    /^(?:please |can you |could you |hey )?(?:tell me|teach me|explain|describe)(?: to me)?(?: (?:all )?(?:about|what|who))?\s+(.{2,})$/i,
    /^(?:what|who)(?:'s| is| are| was| were)(?: a| an| the)?\s+(.{2,})$/i,
    /^(?:what do you know about|do you know (?:anything )?about|have you heard of)\s+(.{2,})$/i,
    /^(?:define|definition of|meaning of|what does)\s+(.{2,}?)(?:\s+mean)?$/i,
    /^how (?:does|do|did)\s+(.{3,})\s+work$/i,
    /^(?:why (?:is|are|do|does)|how (?:is|are|many|much|old|big|tall|far|long|fast))\s+(.{3,})$/i,
    /^(?:look up|google|search(?: for)?|wiki(?:pedia)?|find (?:out )?(?:about|info on))\s+(.{2,})$/i,
    /^(?:where is|when (?:was|did|is))\s+(.{3,})$/i,
  ];
  for (const re of pats) {
    const m = s.match(re);
    if (m) {
      let subj = m[1].replace(/^(?:the )/i, '').replace(/\b(?:please|for me)\b/gi, '').trim();
      if (subj.length < 2 || /^(you|me|it|that|this|your|my|us|time|the time)$/i.test(subj)) return null;
      return { subject: subj, whole: s, kind: /^(?:define|definition|meaning of|what does)/i.test(s) ? 'define' : 'topic' };
    }
  }
  return null;
}
