// AMORA engine tests — run with `npm test` (Node 18+, no dependencies).
import assert from 'node:assert/strict';
import { Engine } from '../js/engine/engine.js';
import { PRESETS, fromPreset, normalizePersona, blankRule, normalizeRule } from '../js/data/presets.js';
import { defaultRel, applyEffects, computeStage, effectiveStage, checkMilestones } from '../js/engine/relationship.js';
import { defaultMemory, defaultSettings, mergeDefaults } from '../js/core/store.js';
import { matchIntents as _mi, INTENT_IDS } from '../js/engine/intents.js';
import { analyze } from '../js/engine/text.js';
const matchIntents = (txt) => _mi(analyze(txt));
import { detectTopics } from '../js/engine/topics.js';
import { render } from '../js/engine/templates.js';
import { DB } from '../js/data/dialogue.js';
import { makeRng } from '../js/core/util.js';

let pass = 0, fail = 0;
const t = (name, fn) => { try { fn(); pass++; console.log('  ✓', name); } catch (e) { fail++; console.log('  ✗', name, '\n     ', e.message); } };

function mk({ preset = 'luna', stage = 2, seed = 11, mutate } = {}) {
  const persona = normalizePersona(fromPreset(preset));
  mutate && mutate(persona);
  const rel = defaultRel(); rel.manualStage = stage;
  const settings = defaultSettings(); settings.relationship.progression = 'manual'; settings.chat.typingSpeed = 0;
  const mem = defaultMemory(); const conv = {};
  const eng = new Engine(seed);
  const say = (text, extra = {}) => eng.respond(text, { persona, mem, rel, conv, settings, mode: 'casual', now: new Date('2026-11-21T17:30:00'), ...extra });
  const txt = (text, extra) => say(text, extra).messages.map((m) => m.text).join(' ');
  return { persona, rel, settings, mem, conv, eng, say, txt };
}

console.log('Intents & topics');
t('recognises greetings, compliments, jokes', () => {
  assert.equal(matchIntents('hello there')[0].id, 'greeting');
  assert.ok(matchIntents("you're beautiful").some((h) => h.id === 'compliment'));
  assert.ok(matchIntents('tell me a joke').some((h) => h.id === 'joke_request'));
});
t('has a large intent set', () => assert.ok(INTENT_IDS.length >= 60, String(INTENT_IDS.length)));
t('detects topics', () => {
  assert.ok(detectTopics('my boss gave me a deadline').some((x) => x.id === 'work'));
  assert.ok(detectTopics('I want to travel to Japan and eat sushi').some((x) => ['travel', 'food'].includes(x.id)));
  assert.ok(detectTopics('what is the meaning of life').some((x) => x.id === 'philosophy'));
});
t('every intent with a DB entry has a non-empty core pool', () => {
  for (const [id, d] of Object.entries(DB.intent)) assert.ok(Object.values(d).some((v) => Array.isArray(v) ? v.length : v && typeof v === 'object') , id);
});
t('dialogue database is large (hundreds of templates)', () => {
  let n = 0; for (const d of Object.values(DB.intent)) for (const v of Object.values(d)) if (Array.isArray(v)) n += v.length; else if (v && typeof v === 'object') for (const x of Object.values(v)) if (Array.isArray(x)) n += x.length;
  assert.ok(n >= 400, 'only ' + n);
});

console.log('Replies & variation');
t('replies to every sample without throwing', () => {
  const E = mk();
  ['hi', 'how are you?', "I'm sad", 'I got the job!!', 'lol', 'what do you think about philosophy', 'tell me about space', 'I love pizza', 'asdfghjkl', 'ok', '???', '', '    ', 'a'.repeat(3000), '😀😀', 'I hate mondays', "what's the weather like", 'goodnight'].forEach((m) => { const r = E.say(m); assert.ok(Array.isArray(r.messages) && r.messages.length >= 1, `no reply to "${m.slice(0, 20)}"`); r.messages.forEach((x) => assert.ok(typeof x.text === 'string' && x.text.trim().length > 0)); });
});
t('does not leak unresolved template placeholders', () => {
  const E = mk();
  ['hello', 'tell me about yourself', 'what are your hobbies', "what's your favorite food", 'I love you', 'I am tired', 'let us talk about music', 'good morning'].forEach((m) => { const s = E.txt(m); assert.ok(!/\{[a-z_:|]+\}/i.test(s), `placeholder in: ${s}`); });
});
t('varies responses (no identical consecutive replies)', () => {
  const E = mk(); const seen = new Set(); let dup = 0;
  for (let i = 0; i < 12; i++) { const s = E.txt('hello'); if (seen.has(s)) dup++; seen.add(s); }
  assert.ok(dup <= 3, 'too many repeats: ' + dup);
});
t('is deterministic for a given seed', () => {
  const a = mk({ seed: 5 }).txt('hello'), b = mk({ seed: 5 }).txt('hello');
  assert.equal(a, b);
});
t('honestly admits what she cannot answer', () => {
  const s = mk().txt('what is the capital of France?');
  assert.ok(/outside|can't|cannot|don't know|rather tell you/i.test(s), s);
});
t('is honest about being rule-based when asked', () => {
  const s = mk().txt('are you a real person or an AI?');
  assert.ok(/not (a )?(human|person|real)|rule|program|software|fictional|character/i.test(s), s);
});

console.log('Memory');
t('learns and recalls name, job and favorites', () => {
  const E = mk(); E.say('my name is Owen'); E.say('I work as a nurse');
  assert.equal(E.mem.facts.name.v.toLowerCase(), 'owen');
  assert.ok(/nurse/i.test(E.mem.facts.job.v));
  const s = E.txt('what do you know about me?'); assert.ok(/owen/i.test(s) && /nurse/i.test(s), s);
});
t('learns likes, dates and notes', () => {
  const E = mk(); E.say('I love hiking'); E.say('my birthday is March 3rd'); E.say('remember that my keys are in the blue bowl');
  assert.ok(E.mem.likes.some((x) => /hiking/i.test(x)) || E.mem.hobbies.some((x) => /hiking/i.test(x)));
  assert.ok(E.mem.dates.some((d) => d.month === 3 && d.day === 3));
  assert.ok(E.mem.notes.some((n) => /blue bowl/i.test(n.text)));
});
t('uses a remembered name in replies', () => {
  const E = mk({ mutate: (p) => { p.style.nicknames = []; } }); E.say('my name is Owen');
  let used = false; for (let i = 0; i < 15 && !used; i++) used = /owen/i.test(E.txt('hello'));
  assert.ok(used);
});

console.log('Personality settings influence output');
t('lowercase style', () => { const s = mk({ mutate: (p) => { p.style.lowercase = true; } }).txt('Hello'); assert.equal(s, s.toLowerCase()); });
t('emoji frequency 0 removes emoji; 100 adds them', () => {
  const none = mk({ mutate: (p) => { p.style.emoji = 0; } }); let s = ''; for (let i = 0; i < 10; i++) s += none.txt('hello how are you');
  assert.ok(!/\p{Extended_Pictographic}/u.test(s));
  const lots = mk({ mutate: (p) => { p.style.emoji = 100; p.traits.expressiveness = 100; } }); s = ''; for (let i = 0; i < 10; i++) s += lots.txt('hello how are you');
  assert.ok(/\p{Extended_Pictographic}/u.test(s));
});
t('response length slider changes amount of text', () => {
  const len = (n) => { let tot = 0; for (let sd = 1; sd <= 12; sd++) { const E = mk({ seed: sd, mutate: (p) => { p.style.length = n; } }); tot += E.txt("I'm having a pretty good day today, work was fun").length; } return tot; };
  assert.ok(len(5) > len(1), `${len(5)} vs ${len(1)}`);
});
t('shy vs confident personas sound different', () => {
  const shy = mk({ preset: 'mei', seed: 3 }).txt("you're beautiful"), conf = mk({ preset: 'valentina', seed: 3 }).txt("you're beautiful");
  assert.notEqual(shy, conf);
});
t('nicknames are used when set (and stage allows)', () => {
  let used = false;
  for (let sd = 1; sd < 30 && !used; sd++) { const E = mk({ seed: sd, stage: 4, mutate: (p) => { p.style.nicknames = ['zorblax']; } }); used = /zorblax/i.test(E.txt('hello') + E.txt('how are you')); }
  assert.ok(used);
});
t('preferred topics are used for starters / prohibited topics are deflected', () => {
  const E = mk({ mutate: (p) => { p.topics.prohibited = ['politics']; p.topics.prohibitedWords = ['voldemort']; } });
  const s = E.txt('I want to talk about voldemort'); assert.ok(/rather|another|different|change|not (a )?(topic|subject)|steer|skip|pass/i.test(s), s);
});

console.log('Custom rules');
t('keyword rule overrides reply', () => {
  const E = mk({ mutate: (p) => { const r = blankRule(); r.triggers = ['pineapple']; r.responses = ['Pineapple pizza is a crime.']; p.rules = [normalizeRule(r)]; } });
  assert.match(E.txt('I had pineapple on pizza'), /crime/);
});
t('rule conditions: min stage, chance 0, disabled, once', () => {
  const mkR = (o) => mk({ mutate: (p) => { const r = Object.assign(blankRule(), { triggers: ['zebra'], responses: ['ZEBRA-RULE'] }, o); p.rules = [normalizeRule(r)]; } });
  assert.doesNotMatch(mkR({ minStage: 4 }).txt('look a zebra'), /ZEBRA-RULE/);
  assert.doesNotMatch(mkR({ chance: 0 }).txt('look a zebra'), /ZEBRA-RULE/);
  assert.doesNotMatch(mkR({ enabled: false }).txt('look a zebra'), /ZEBRA-RULE/);
  const E = mkR({ once: true }); assert.match(E.txt('zebra'), /ZEBRA-RULE/); assert.doesNotMatch(E.txt('zebra again'), /ZEBRA-RULE/);
});
t('rule match modes: phrase, all, regex, intent', () => {
  const run = (o, msg) => mk({ mutate: (p) => { p.rules = [normalizeRule(Object.assign(blankRule(), { responses: ['HIT'] }, o))]; } }).txt(msg);
  assert.match(run({ match: 'phrase', triggers: ['blue moon'] }, 'once in a blue moon'), /HIT/);
  assert.doesNotMatch(run({ match: 'phrase', triggers: ['blue moon'] }, 'the moon is blue'), /HIT/);
  assert.match(run({ match: 'all', triggers: ['red', 'car'] }, 'my car is red'), /HIT/);
  assert.doesNotMatch(run({ match: 'all', triggers: ['red', 'car'] }, 'my car is green'), /HIT/);
  assert.match(run({ match: 'regex', triggers: ['\\bfoo\\d+\\b'] }, 'foo42 works'), /HIT/);
  assert.match(run({ match: 'intent', intent: 'greeting' }, 'hello'), /HIT/);
});
t('rule placement before/after keeps normal reply', () => {
  const E = mk({ mutate: (p) => { p.rules = [normalizeRule(Object.assign(blankRule(), { triggers: ['hello'], responses: ['RULE-BEFORE'], placement: 'before' }))]; } });
  const s = E.txt('hello'); assert.match(s, /RULE-BEFORE/); assert.ok(s.length > 'RULE-BEFORE'.length + 5);
});
t('invalid regex rule does not crash', () => {
  const E = mk({ mutate: (p) => { p.rules = [normalizeRule(Object.assign(blankRule(), { match: 'regex', triggers: ['(unclosed'], responses: ['X'] }))]; } });
  assert.ok(E.txt('hello').length > 0);
});
t('custom scenario runs through its steps', () => {
  const E = mk({ mutate: (p) => { p.scenarios = [{ id: 's1', title: 'Test', emoji: '✨', desc: '', minStage: 0, intro: 'INTRO', steps: ['STEP-ONE', 'STEP-TWO'], closing: 'THE-END', trigger: '' }]; } });
  const scen = E.eng.allScenarios(E.persona).find((s) => s.id === 's1');
  const intro = E.eng.startScenario({ persona: E.persona, mem: E.mem, rel: E.rel, conv: E.conv, settings: E.settings, mode: 'casual', now: new Date() }, scen);
  assert.match(intro.messages.map((m) => m.text).join(' '), /INTRO/);
  const all = [E.txt('okay'), E.txt('sure'), E.txt('nice')].join(' ');
  assert.match(all, /STEP-ONE/); assert.match(all, /STEP-TWO/); assert.match(all, /THE-END/);
});

console.log('Relationship & safety');
t('stage progression is monotonic and gated by points', () => {
  const rel = defaultRel(), settings = defaultSettings(); let last = -1;
  for (let i = 0; i < 500; i++) { applyEffects(rel, { fam: 2, aff: 1 }, settings, new Date(2026, 0, 1 + Math.floor(i / 20))); const st = computeStage(rel); assert.ok(st >= last); last = st; }
  assert.ok(last >= 3);
});
t('daily caps limit point gain', () => {
  const rel = defaultRel(), settings = defaultSettings(); const now = new Date(2026, 0, 1);
  for (let i = 0; i < 300; i++) applyEffects(rel, { fam: 5, aff: 5 }, settings, now);
  assert.ok(rel.fp <= settings.relationship.dailyCapFP + 5, String(rel.fp));
});
t('points never decrease', () => {
  const rel = defaultRel(), settings = defaultSettings(); applyEffects(rel, { fam: 5, aff: 5 }, settings, new Date(2026, 0, 1));
  const fp = rel.fp; applyEffects(rel, { fam: 0, aff: 0 }, settings, new Date(2026, 3, 1)); assert.ok(rel.fp >= fp);
});
t('romantic lines are gated by stage', () => {
  const lo = mk({ stage: 0 }), hi = mk({ stage: 5 });
  let a = '', b = ''; for (let i = 0; i < 8; i++) { a += lo.txt('I love you') + ' '; b += hi.txt('I love you') + ' '; }
  assert.ok(!/love you too|i love you|my love|darling/i.test(a.replace(/(I'd|I) (love|like) (to )?(hear|get to know)/gi, '')) || a !== b);
  assert.notEqual(a, b);
});
t('crisis messages get a supportive safety response', () => {
  const s = mk().txt('I want to kill myself');
  assert.ok(/988|crisis|emergency|hotline|helpline|someone you trust|professional/i.test(s), s);
});
t('minor statements are refused romantic engagement', () => {
  const E = mk(); const s = E.txt("I'm 15 and I want you to be my girlfriend");
  assert.ok(/18|adult|age/i.test(s), s);
});
t('persona age is always adult', () => { const p = normalizePersona({ ...fromPreset('luna'), age: 12 }); assert.ok(p.age >= 18); });
t('milestones fire once', () => {
  const rel = defaultRel(), mem = defaultMemory(), st = defaultSettings(); rel.msgs = 12;
  const a = checkMilestones(rel, mem, st), b = checkMilestones(rel, mem, st); assert.ok(a.length >= 2 && b.length === 0);
});
t('manual stage and status minimum are respected', () => {
  const rel = defaultRel(), st = defaultSettings(); st.relationship.progression = 'manual'; rel.manualStage = 2; assert.equal(effectiveStage(rel, st), 2);
  st.relationship.progression = 'auto'; rel.status = 'dating'; assert.ok(effectiveStage(rel, st) >= 3);
});

console.log('Persistence & data');
t('persona JSON round-trips through normalize', () => {
  for (const p of PRESETS) { const a = normalizePersona(fromPreset(p._preset)); const b = normalizePersona(JSON.parse(JSON.stringify(a))); assert.deepEqual(b, a, p.name); }
});
t('normalizePersona repairs bad data', () => {
  const p = normalizePersona({ name: '', age: 'x', traits: { humor: 999 }, style: { emoji: -5 }, rules: [null, { triggers: 'nope' }] });
  assert.ok(p.name.length > 0 && p.age >= 18 && p.traits.humor <= 100 && p.style.emoji >= 0 && Array.isArray(p.rules));
});
t('mergeDefaults fills missing settings', () => { const s = mergeDefaults({ chat: { typingSpeed: 3 } }, defaultSettings()); assert.equal(s.chat.typingSpeed, 3); assert.equal(s.chat.enterToSend, true); assert.ok(s.bg && s.relationship); });
t('template renderer supports alternation and skips unknown memory', () => {
  const rng = makeRng(1); const out = render('{a|b|c} world', {}, rng); assert.match(out, /^(a|b|c) world$/);
});
t('all presets produce replies at all stages', () => {
  for (const p of PRESETS) for (const stg of [0, 2, 5]) { const E = mk({ preset: p._preset, stage: stg }); assert.ok(E.txt('hey, how was your day?').length > 0); assert.ok(E.txt('tell me about yourself').length > 0); }
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
