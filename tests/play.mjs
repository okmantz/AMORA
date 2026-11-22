import { Engine } from '../js/engine/engine.js';
import { PRESETS, fromPreset, normalizePersona } from '../js/data/presets.js';
import { defaultRel } from '../js/engine/relationship.js';
import { defaultMemory, defaultSettings } from '../js/core/store.js';

const key = process.argv[2] || 'luna';
const stage = +(process.argv[3] ?? 2);
const persona = normalizePersona(fromPreset(key));
const rel = defaultRel(); rel.manualStage = stage;
const settings = defaultSettings(); settings.relationship.progression = 'manual'; settings.chat.typingSpeed = 0;
const mem = defaultMemory(); const conv = {};
const eng = new Engine(+(process.argv[4] || 7));
const lines = (await import('fs')).readFileSync(0, 'utf8').split('\n').filter(Boolean);
for (const l of lines) {
  const r = eng.respond(l, { persona, mem, rel, conv, settings, mode: 'casual', now: new Date('2026-11-21T17:30:00') });
  console.log('\n> ' + l + `   [${r.fx.intent} | topics ${r.debug.topics} | pend ${conv.pending?.type || '-'}]`);
  for (const m of r.messages) console.log('  ' + persona.name + ': ' + m.text);
}
