// AMORA — import / export helpers (personality JSON, rules JSON, full backup JSON, conversation export).
import { download, dayKey, slug, deepClone } from './util.js';
import { normalizePersona, normalizeRule } from '../data/presets.js';

const APP = 'AMORA';

export function exportPersona(p) {
  const clean = deepClone(p);
  download(`amora-${slug(p.name) || 'personality'}-${dayKey()}.json`, JSON.stringify({ app: APP, type: 'personality', version: 1, exportedAt: new Date().toISOString(), persona: clean }, null, 2));
}

export function exportRules(p) {
  download(`amora-rules-${slug(p.name)}-${dayKey()}.json`, JSON.stringify({ app: APP, type: 'rules', version: 1, rules: p.rules, scenarios: p.scenarios }, null, 2));
}

export function parseFile(text) {
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('That file is not valid JSON.'); }
  if (!data || data.app !== APP) throw new Error('This does not look like an AMORA export.');
  return data;
}

/** Returns a normalized persona from a personality export. */
export function personaFromExport(data) {
  if (data.type !== 'personality' || !data.persona) throw new Error('This file is not a personality export.');
  const p = normalizePersona(data.persona);
  return p;
}
export function rulesFromExport(data) {
  if (data.type === 'personality' && data.persona) return { rules: (data.persona.rules || []).map(normalizeRule).filter(Boolean), scenarios: data.persona.scenarios || [] };
  if (data.type !== 'rules') throw new Error('This file does not contain rules.');
  return { rules: (data.rules || []).map(normalizeRule).filter(Boolean), scenarios: data.scenarios || [] };
}

export function exportBackup(A) {
  const S = A.state;
  const threads = {};
  S.personas.forEach((p) => { threads[p.id] = A.threads(p.id); });
  download(`amora-backup-${dayKey()}.json`, JSON.stringify({ app: APP, type: 'backup', version: 1, exportedAt: new Date().toISOString(), settings: S.settings, personas: S.personas, activeId: S.activeId, rel: S.rel, mem: S.mem, threads, journal: S.journal, notes: S.notes }, null, 2));
}

export function importBackup(A, data) {
  if (data.type !== 'backup') throw new Error('This file is not a full backup.');
  const S = A.state;
  S.settings = Object.assign(S.settings, data.settings || {});
  S.personas = (data.personas || []).map(normalizePersona);
  if (!S.personas.length) throw new Error('The backup contains no personalities.');
  S.activeId = data.activeId && S.personas.find((p) => p.id === data.activeId) ? data.activeId : S.personas[0].id;
  S.rel = data.rel || {}; S.mem = Object.assign(S.mem, data.mem || {});
  S.threads = {}; for (const p of S.personas) S.threads[p.id] = (data.threads && data.threads[p.id]) || [];
  S.activeThread = {}; S.journal = data.journal || []; S.notes = data.notes || [];
  A.save('all');
}

export function exportThreadsJSON(A, pid) {
  download(`amora-conversations-${dayKey()}.json`, JSON.stringify({ app: APP, type: 'conversations', version: 1, threads: A.threads(pid) }, null, 2));
}
