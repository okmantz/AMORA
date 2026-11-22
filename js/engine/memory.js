// AMORA — user memory helpers (facts, likes, dates, notes). The memory object lives in localStorage via the store.
import { uid } from '../core/util.js';
import { fmtMD, daysUntil } from './text.js';

const addUnique = (arr, v, cap = 40) => {
  const k = String(v).toLowerCase();
  if (arr.some((x) => String(x).toLowerCase() === k)) return false;
  arr.push(v);
  while (arr.length > cap) arr.shift();
  return true;
};

/** Apply extracted facts to memory. Returns the list of newly learned items. */
export function learn(mem, facts, now = Date.now()) {
  const fresh = [];
  for (const f of facts) {
    if (f.type === 'fact') {
      const old = mem.facts[f.k];
      if (old && String(old.v).toLowerCase() === String(f.v).toLowerCase()) continue;
      mem.facts[f.k] = { v: f.v, ts: now };
      fresh.push(f);
    } else if (f.type === 'like') { if (addUnique(mem.likes, f.v)) fresh.push(f); }
    else if (f.type === 'hobby') { if (addUnique(mem.hobbies, f.v)) fresh.push(f); }
    else if (f.type === 'dislike') { if (addUnique(mem.dislikes, f.v)) fresh.push(f); }
    else if (f.type === 'family') { if (addUnique(mem.family, f.v)) fresh.push(f); }
    else if (f.type === 'date') {
      const d = f.v;
      if (!mem.dates.some((x) => x.kind === f.kind && x.month === d.month && x.day === d.day)) {
        mem.dates = mem.dates.filter((x) => !(x.kind === 'birthday' && f.kind === 'birthday'));
        mem.dates.push({ id: uid('d'), label: f.label, kind: f.kind, month: d.month, day: d.day, year: d.year || null });
        fresh.push({ ...f, v: fmtMD(d) });
      }
    } else if (f.type === 'note') {
      mem.notes.push({ id: uid('n'), text: f.v, ts: now });
      fresh.push(f);
    }
  }
  return fresh;
}

export function addMention(mem, topic, kw, ts = Date.now()) {
  mem.mentions.push({ topic, kw, ts });
  while (mem.mentions.length > 14) mem.mentions.shift();
}

/** Human-readable memory summary lines. */
export function summarize(mem) {
  const out = [];
  const F = mem.facts, g = (k) => F[k]?.v;
  if (g('name')) out.push(`Your name is ${g('name')}`);
  if (g('age')) out.push(`You're ${g('age')}`);
  if (g('job')) out.push(`You work as a ${g('job')}`);
  if (g('workplace')) out.push(`You work at ${g('workplace')}`);
  if (g('studies')) out.push(`You study ${g('studies')}`);
  if (g('location')) out.push(`You're in ${g('location')}`);
  if (g('pet')) out.push(`You have a ${g('pet')}${g('pet_name') ? ` named ${g('pet_name')}` : ''}`);
  for (const k of Object.keys(F)) if (k.startsWith('fav_')) out.push(`Your favorite ${k.slice(4)} is ${F[k].v}`);
  if (mem.likes.length) out.push(`You like ${mem.likes.slice(-4).join(', ')}`);
  if (mem.hobbies.length) out.push(`Hobbies: ${mem.hobbies.slice(-4).join(', ')}`);
  if (mem.dislikes.length) out.push(`You don't like ${mem.dislikes.slice(-3).join(', ')}`);
  if (mem.family.length) out.push(`People in your life: ${mem.family.slice(-4).join(', ')}`);
  for (const d of mem.dates) out.push(`${d.label}: ${fmtMD(d)}`);
  if (mem.notes.length) out.push(`You asked me to remember: “${mem.notes[mem.notes.length - 1].text}”`);
  return out;
}

/** Important dates that are today or within `window` days. */
export function upcomingDates(mem, now = new Date(), window = 7) {
  return mem.dates.map((d) => ({ ...d, in: daysUntil(d, now) })).filter((d) => d.in <= window).sort((a, b) => a.in - b.in);
}

export function factCount(mem) {
  return Object.keys(mem.facts).length + mem.likes.length + mem.hobbies.length + mem.dislikes.length + mem.family.length + mem.dates.length + mem.notes.length;
}
