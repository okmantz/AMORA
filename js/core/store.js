// AMORA — persistent local storage layer. Everything lives in localStorage on this device.
// Keys are namespaced and versioned; every access is wrapped so a full or blocked storage never crashes the app.

const NS = 'amora.v1.';
let memoryFallback = {}; // used if localStorage is unavailable (private mode etc.)
let listeners = [];
export const onStorageError = (fn) => listeners.push(fn);
const report = (e, key) => listeners.forEach((f) => f(e, key));

function ls() {
  try { return window.localStorage; } catch { return null; }
}

export const Store = {
  available() {
    try { const s = ls(); if (!s) return false; s.setItem(NS + '__t', '1'); s.removeItem(NS + '__t'); return true; } catch { return false; }
  },
  get(key, fallback = null) {
    try {
      const s = ls();
      const raw = s ? s.getItem(NS + key) : memoryFallback[key];
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) { report(e, key); return fallback; }
  },
  set(key, value) {
    try {
      const raw = JSON.stringify(value);
      const s = ls();
      if (s) s.setItem(NS + key, raw); else memoryFallback[key] = raw;
      return true;
    } catch (e) { report(e, key); return false; }
  },
  remove(key) { try { const s = ls(); if (s) s.removeItem(NS + key); else delete memoryFallback[key]; } catch (e) { report(e, key); } },
  keys() {
    try { const s = ls(); if (!s) return Object.keys(memoryFallback); return Object.keys(s).filter((k) => k.startsWith(NS)).map((k) => k.slice(NS.length)); } catch { return []; }
  },
  /** Approximate bytes used by AMORA */
  usage() {
    let n = 0;
    try { const s = ls(); if (s) for (const k of Object.keys(s)) if (k.startsWith(NS)) n += (k.length + (s.getItem(k) || '').length) * 2; } catch { /* ignore */ }
    return n;
  },
  clearAll() { this.keys().forEach((k) => this.remove(k)); memoryFallback = {}; },
};

export const defaultSettings = () => ({
  theme: 'auto',            // auto | light | dark
  accent: '#c2577a',
  font: 'serif',            // serif | sans | rounded
  fontScale: 100,
  bg: { kind: 'preset', preset: 'rose-dusk', image: null, blur: 0, dim: 20, pattern: 'none' },
  bubbleStyle: 'soft',      // soft | glass | solid
  chat: {
    typingSpeed: 50,        // 0 instant .. 100 slow
    showTyping: true,
    showTimestamps: true,
    enterToSend: true,
    suggestions: true,      // show conversation-starter chips
    dailyMessage: true,
    splitMessages: true,
    sound: false,
    reducedMotion: false,
    honestyNotes: true,     // occasional gentle reminders that she is a rule-based program
  },
  relationship: {
    progression: 'auto',    // auto | manual
    speed: 1,               // 0.5 – 3
    gating: true,           // lock romantic content/modes behind relationship stage
    dailyCapFP: 40,
    dailyCapAP: 24,
  },
  ageConfirmed: false,
  onboarded: false,
  userName: '',
  lastDaily: '',
  version: 1,
});

export function mergeDefaults(target, defaults) {
  const out = Array.isArray(defaults) ? [...(target || defaults)] : { ...defaults };
  if (Array.isArray(defaults)) return out;
  for (const k of Object.keys(target || {})) {
    const dv = defaults[k], tv = target[k];
    out[k] = dv && typeof dv === 'object' && !Array.isArray(dv) && tv && typeof tv === 'object' ? mergeDefaults(tv, dv) : tv;
  }
  return out;
}

export const defaultMemory = () => ({
  facts: {},          // key -> {v, ts, src}
  likes: [], dislikes: [], hobbies: [], family: [],
  dates: [],          // {id,label,month,day,year?,kind}
  notes: [],          // "remember that ..." items {id,text,ts}
  recent: [],         // recently used template hashes
  mentions: [],       // recent topics for callbacks {topic,text,ts}
});

/** Trim the oldest messages when storage is nearly full. */
export function trimThreads(threads, maxMessages = 3000) {
  let total = threads.reduce((n, t) => n + t.messages.length, 0);
  if (total <= maxMessages) return threads;
  const sorted = [...threads].sort((a, b) => a.updated - b.updated);
  for (const t of sorted) {
    while (total > maxMessages && t.messages.length > 20) { t.messages.shift(); total--; }
    if (total <= maxMessages) break;
  }
  return threads;
}
