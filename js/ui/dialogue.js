// AMORA — Dialogue studio: custom rules, behavior (reactions & topics), scenarios, built-in database browser and tester.
import { h, deepClone, pickFile, readText, uid } from '../core/util.js';
import { blankRule, normalizeRule, blankScenario, normalizeScenario, REACTION_OPTIONS, TOPIC_CHOICES } from '../data/presets.js';
import { INTENT_IDS } from '../engine/intents.js';
import { TOPICS } from '../engine/topics.js';
import { MODES, STAGES } from '../engine/relationship.js';
import { DB } from '../data/dialogue.js';
import { fText, fSelect, fToggle, fSlider, fChips, fMulti, fTags, section, tabs, toast, confirmBox, modal, empty, icon } from './dom.js';
import { exportRules, parseFile, rulesFromExport } from '../core/io.js';

const MATCH = [['any', 'Any keyword'], ['all', 'All keywords'], ['phrase', 'Exact phrase inside message'], ['exact', 'Whole message equals'], ['regex', 'Regular expression'], ['intent', 'Built-in intent']];
const PLACE = [['replace', 'Replace her normal reply'], ['before', 'Say this first, then continue normally'], ['after', 'Add this after her normal reply']];
const EXPRS = ['', 'happy', 'blush', 'laugh', 'wink', 'think', 'caring', 'surprised', 'sad', 'neutral'];
const topicName = (id) => TOPICS.find((t) => t.id === id)?.label || id;
const stageOpts = STAGES.map((s) => [String(s.id), `${s.id} · ${s.name}`]);

export function render(A) {
  let tab = A._dlgTab || 'rules', selRule = null, selScen = null;
  const p = () => A.persona;
  const root = h('div', { class: 'view' });
  const body = h('div');
  const bar = tabs([['rules', 'Rules', 'quote'], ['behavior', 'Behavior', 'sliders'], ['scenarios', 'Scenarios', 'play'], ['browse', 'Built-in dialogue', 'book'], ['test', 'Tester', 'wand']], tab, (t) => { tab = A._dlgTab = t; paint(); });
  const paint = () => { body.innerHTML = ''; body.append({ rules, behavior, scenarios, browse, test }[tab]()); };
  const save = () => A.touchPersona();

  /* =============================== RULES =============================== */
  function rules() {
    const list = p().rules;
    if (selRule) return ruleEditor(list.find((r) => r.id === selRule));
    const items = list.slice().sort((a, b) => b.priority - a.priority).map((r) => h('div', { class: `item${r.enabled ? '' : ' off'}` },
      h('div', { class: 't', style: { cursor: 'pointer' }, onclick: () => { selRule = r.id; paint(); } }, h('b', r.name || '(unnamed)'), h('small', `${r.match === 'intent' ? 'Intent: ' + (r.intent || '—') : MATCH.find((m) => m[0] === r.match)[1] + ': ' + (r.triggers.slice(0, 4).join(', ') || '—')} · ${r.responses.length} repl${r.responses.length === 1 ? 'y' : 'ies'} · priority ${r.priority}`)),
      h('label', { class: 'mini-switch', title: 'Enabled' }, h('input', { type: 'checkbox', checked: r.enabled, 'aria-label': 'Enable rule', onchange: (e) => { r.enabled = e.target.checked; save(); paint(); } }), h('span')),
      h('button', { class: 'icon-btn', 'aria-label': 'Edit', onclick: () => { selRule = r.id; paint(); } }, icon('edit', 18)),
      h('button', { class: 'icon-btn', 'aria-label': 'Duplicate', onclick: () => { const c = deepClone(r); c.id = uid('r'); c.name += ' (copy)'; list.push(c); save(); paint(); } }, icon('copy', 18)),
      h('button', { class: 'icon-btn', 'aria-label': 'Delete', onclick: async () => { if (await confirmBox(`Delete rule “${r.name}”?`, 'Delete', true)) { p().rules = list.filter((x) => x.id !== r.id); save(); paint(); } } }, icon('trash', 18))));
    return h('div',
      h('p', { class: 'muted' }, 'Rules run before the built-in dialogue. When a rule matches, her answer comes from your replies — written in her voice. Templates like ', h('code', '{user}'), ', ', h('code', '{nick}'), ' and ', h('code', '{hobby}'), ' work here.'),
      h('div', { class: 'row wrap', style: { margin: '0 0 12px' } },
        h('button', { class: 'btn primary', onclick: () => { const r = blankRule(); p().rules.push(r); selRule = r.id; save(); paint(); } }, icon('plus', 16), 'New rule'),
        h('button', { class: 'btn', onclick: importRules }, icon('upload', 16), 'Import'),
        h('button', { class: 'btn', onclick: () => exportRules(p()) }, icon('download', 16), 'Export rules & scenarios')),
      items.length ? h('div', { class: 'card list' }, items) : empty('No custom rules yet. Create one to make her react to your own keywords.', 'quote'));
  }
  async function importRules() {
    const f = await pickFile('.json,application/json'); if (!f) return;
    try {
      const { rules: rs, scenarios: sc } = rulesFromExport(parseFile(await readText(f)));
      rs.forEach((r) => { r.id = uid('r'); p().rules.push(r); });
      (sc || []).map(normalizeScenario).filter(Boolean).forEach((s) => { s.id = uid('s'); p().scenarios.push(s); });
      save(); paint(); toast(`Imported ${rs.length} rule(s) and ${(sc || []).length} scenario(s)`);
    } catch (e) { toast(e.message, 'err'); }
  }

  function ruleEditor(r) {
    if (!r) { selRule = null; return rules(); }
    const dyn = h('div');
    const paintDyn = () => {
      dyn.innerHTML = '';
      if (r.match === 'intent') dyn.append(fSelect('Built-in intent', [['', 'Choose…'], ...INTENT_IDS.filter((i) => i !== 'crisis').map((i) => [i, i.replace(/_/g, ' ')])], () => r.intent, (v) => { r.intent = v; save(); }, 'Fires whenever the engine recognises this intent — handy for overriding built-in answers such as “compliment” or “greeting”.'));
      else dyn.append(fTags(r.match === 'regex' ? 'Patterns' : 'Triggers', () => r.triggers, (v) => { r.triggers = v; save(); }, r.match === 'regex' ? 'e.g. \\bpizza\\b' : 'Type a keyword or phrase and press Enter', r.match === 'regex' ? 'JavaScript regex, case-insensitive. Any pattern matching fires the rule.' : 'Matching ignores case and punctuation and works on whole words.', { commas: r.match === 'regex' }));
    };
    paintDyn();
    const resp = fTags('Her replies', () => r.responses, (v) => { r.responses = v; save(); }, 'Write a reply and press Enter', 'Add several for variety — she picks one at random and avoids repeating. Use {a|b|c} for inline variation.', { commas: false });
    return h('div',
      h('button', { class: 'btn ghost', onclick: () => { selRule = null; paint(); } }, icon('back', 16), 'All rules'),
      section('Rule',
        fText('Name', () => r.name, (v) => { r.name = v; save(); }, { max: 60 }),
        fToggle('Enabled', '', () => r.enabled, (v) => { r.enabled = v; save(); }),
        fSelect('When the message…', MATCH, () => r.match, (v) => { r.match = v; save(); paintDyn(); }), dyn, resp,
        fSelect('How she uses it', PLACE, () => r.placement, (v) => { r.placement = v; save(); }),
        fSelect('Avatar expression', EXPRS.map((e) => [e, e || '(automatic)']), () => r.expression, (v) => { r.expression = v; save(); })),
      section('Conditions & behavior',
        fSlider('Priority', 'Higher priority rules are checked first.', () => r.priority, (v) => { r.priority = v; save(); }),
        fSlider('Chance to fire', 'Lower for occasional surprises.', () => r.chance, (v) => { r.chance = v; save(); }, { fmt: (v) => v + '%' }),
        fSelect('Minimum relationship stage', stageOpts, () => String(r.minStage), (v) => { r.minStage = +v; save(); }),
        fSelect('Only in mode', [['', 'Any mode'], ...Object.entries(MODES).map(([k, m]) => [k, m.label])], () => r.mode, (v) => { r.mode = v; save(); }),
        fSelect('Only when topic is', [['', 'Any topic'], ...TOPICS.map((t) => [t.id, t.label])], () => r.topic, (v) => { r.topic = v; save(); }),
        fSelect('Only when message is', [['any', 'Anything'], ['positive', 'Positive'], ['negative', 'Negative'], ['question', 'A question']], () => r.sentiment, (v) => { r.sentiment = v; save(); }),
        fSlider('Cooldown (messages)', 'Skip the rule for this many messages after it fires.', () => r.cooldown, (v) => { r.cooldown = v; save(); }, { min: 0, max: 30 }),
        fToggle('Only once per conversation', 'Great for special one-off reactions.', () => r.once, (v) => { r.once = v; save(); }),
        fSelect('Then expect…', [['', 'Nothing special'], ['open', 'An open answer from you'], ['yesno', 'Yes / no'], ['feeling', 'A feeling'], ['day', 'A summary of your day']], () => r.setPending, (v) => { r.setPending = v; save(); }, 'Sets what her next reply understands if you answer her question.')),
      section('Try this rule', ruleTry(r)));
  }
  function ruleTry(r) {
    const inp = h('input', { type: 'text', placeholder: 'Type a message that should trigger this rule…', 'aria-label': 'Test message' });
    const out = h('div', { class: 'preview-box' });
    const run = () => {
      out.innerHTML = '';
      const res = A.preview(inp.value, { persona: p(), stage: Math.max(r.minStage, 0), mode: r.mode || 'casual' });
      res.messages.forEach((m) => out.append(h('div', { class: 'bubble' }, m.text)));
      const hit = (res.debug.hits || []).some((x) => String(x).includes(r.id) || String(x).includes('rule'));
      out.append(h('div', { class: 'dbg' }, hit ? '✓ A custom rule fired' : 'Built-in dialogue answered (rule did not fire — check triggers, conditions or chance)'));
    };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
    return h('div', h('div', { class: 'row' }, inp, h('button', { class: 'btn primary', onclick: run }, 'Test')), out);
  }

  /* ============================== BEHAVIOR ============================== */
  function behavior() {
    const P = p(), R = P.reactions, T = P.topics;
    const topicOpts = TOPIC_CHOICES.map((id) => [id, topicName(id)]);
    return h('div',
      section('How she reacts',
        h('p', { class: 'muted', style: { marginTop: 0 } }, 'Choose her default reaction to each type of message. These change which built-in lines she picks.'),
        fSelect('When you compliment her', REACTION_OPTIONS.compliment, () => R.compliment, (v) => { R.compliment = v; save(); }),
        fSelect('When you tease her', REACTION_OPTIONS.teasing, () => R.teasing, (v) => { R.teasing = v; save(); }),
        fSelect('When you show affection', REACTION_OPTIONS.affection, () => R.affection, (v) => { R.affection = v; save(); }),
        fSelect('When you disagree with her', REACTION_OPTIONS.disagreement, () => R.disagreement, (v) => { R.disagreement = v; save(); }),
        fSelect('When you ask her a question', REACTION_OPTIONS.question, () => R.question, (v) => { R.question = v; save(); })),
      section('Topics',
        fMulti('Topics she loves', topicOpts, () => T.preferred, (v) => { T.preferred = v; T.prohibited = T.prohibited.filter((x) => !v.includes(x)); save(); paint(); }, 'She brings these up more, asks about them and shares opinions eagerly.'),
        fMulti('Topics she avoids', topicOpts, () => T.prohibited, (v) => { T.prohibited = v; T.preferred = T.preferred.filter((x) => !v.includes(x)); save(); paint(); }, 'She politely steers away and suggests something else — she never lectures.'),
        fTags('Words she won’t discuss', () => T.prohibitedWords, (v) => { T.prohibitedWords = v; save(); }, 'Add a word or phrase…', 'If your message contains one, she gently changes the subject.', { commas: false })),
      h('p', { class: 'muted' }, 'Safety replies for crisis or underage statements are built in and cannot be disabled.'));
  }

  /* ============================== SCENARIOS ============================== */
  function scenarios() {
    const list = p().scenarios;
    if (selScen) return scenEditor(list.find((s) => s.id === selScen));
    return h('div',
      h('p', { class: 'muted' }, 'A scenario is a short scripted scene: she says the intro, then one line per step as you reply, then a closing. Start them from the chat’s ', icon('plus', 14), ' menu or by typing the trigger phrase.'),
      h('button', { class: 'btn primary', style: { marginBottom: '12px' }, onclick: () => { const s = blankScenario(); list.push(s); selScen = s.id; save(); paint(); } }, icon('plus', 16), 'New scenario'),
      list.length ? h('div', { class: 'card list' }, list.map((s) => h('div', { class: 'item' }, h('span', { style: { fontSize: '1.5rem' } }, s.emoji), h('div', { class: 't', style: { cursor: 'pointer' }, onclick: () => { selScen = s.id; paint(); } }, h('b', s.title), h('small', `${s.steps.length} steps · unlocks at ${STAGES[s.minStage]?.name}`)),
        h('button', { class: 'btn sm', onclick: () => { A.startScenario(s.id); } }, 'Play'),
        h('button', { class: 'icon-btn', 'aria-label': 'Edit', onclick: () => { selScen = s.id; paint(); } }, icon('edit', 18)),
        h('button', { class: 'icon-btn', 'aria-label': 'Delete', onclick: async () => { if (await confirmBox(`Delete “${s.title}”?`, 'Delete', true)) { p().scenarios = list.filter((x) => x.id !== s.id); save(); paint(); } } }, icon('trash', 18))))) : empty('No custom scenarios yet. Built-in scenarios (coffee, stargazing, rainy day…) are always available.', 'play'));
  }
  function scenEditor(s) {
    if (!s) { selScen = null; return scenarios(); }
    return h('div', h('button', { class: 'btn ghost', onclick: () => { selScen = null; paint(); } }, icon('back', 16), 'All scenarios'),
      section('Scenario',
        fText('Title', () => s.title, (v) => { s.title = v; save(); }, { max: 50 }), fText('Emoji', () => s.emoji, (v) => { s.emoji = v.slice(0, 4); save(); }, { max: 4 }),
        fText('Short description', () => s.desc, (v) => { s.desc = v; save(); }, { max: 120 }),
        fSelect('Unlocks at stage', stageOpts, () => String(s.minStage), (v) => { s.minStage = +v; save(); }),
        fText('Trigger phrase (optional)', () => s.trigger, (v) => { s.trigger = v; save(); }, { hint: 'Typing this phrase starts the scenario, e.g. “let’s go stargazing”.' }),
        fText('Opening line', () => s.intro, (v) => { s.intro = v; save(); }, { multiline: true, hint: 'Her first message when the scene begins. Templates allowed.' }),
        fTags('Steps (one reply each)', () => s.steps, (v) => { s.steps = v; save(); }, 'Her next line…', 'After each of your replies she says the next step, in order.', { commas: false }),
        fText('Closing line', () => s.closing, (v) => { s.closing = v; save(); }, { multiline: true })));
  }

  /* ============================ BUILT-IN DIALOGUE ============================ */
  function browse() {
    const q = h('input', { type: 'search', placeholder: 'Search intents or lines…', 'aria-label': 'Search built-in dialogue' });
    const out = h('div');
    const count = (d) => Object.values(d).reduce((n, v) => n + (Array.isArray(v) ? v.length : v && typeof v === 'object' ? Object.values(v).reduce((m, x) => m + (Array.isArray(x) ? x.length : 0), 0) : 0), 0);
    const total = Object.values(DB.intent).reduce((n, d) => n + count(d), 0);
    const draw = () => {
      out.innerHTML = '';
      const term = q.value.toLowerCase();
      let shown = 0;
      Object.entries(DB.intent).forEach(([id, d]) => {
        const lines = (d.core || []).map((e) => (typeof e === 'string' ? e : e.t));
        if (term && !id.includes(term) && !lines.some((l) => l.toLowerCase().includes(term))) return;
        if (++shown > 60) return;
        out.append(h('details', { class: 'card' }, h('summary', h('b', id.replace(/_/g, ' ')), h('small', { class: 'muted' }, ` · ${count(d)} lines`)),
          h('ul', { class: 'lines' }, lines.slice(0, 40).map((l) => h('li', l))),
          h('button', { class: 'btn sm', onclick: () => { const r = blankRule(); r.name = `My answer to ${id.replace(/_/g, ' ')}`; r.match = 'intent'; r.intent = id; p().rules.push(r); selRule = r.id; tab = A._dlgTab = 'rules'; save(); bar.querySelector('[data-id=rules]').click(); } }, icon('edit', 14), 'Create override rule')));
      });
      if (!shown) out.append(empty('No match.', 'search'));
    };
    q.addEventListener('input', draw); draw();
    return h('div', h('p', { class: 'muted' }, `The built-in database holds about ${total.toLocaleString()} lines across ${Object.keys(DB.intent).length} intents, plus topic opinions, jokes, games and scenarios. Browse it here and write your own overrides. See docs/EXTENDING.md to add lines directly in the code.`), q, out);
  }

  /* ================================ TESTER ================================ */
  function test() {
    let conv = {};
    const stSel = h('select', STAGES.map((s) => h('option', { value: s.id }, `${s.id} · ${s.name}`)));
    stSel.value = String(A.stage());
    const modeSel = h('select', Object.entries(MODES).map(([k, m]) => h('option', { value: k }, m.label)));
    const log = h('div', { class: 'preview-box tall' });
    const inp = h('input', { type: 'text', placeholder: 'Say something to test her…', 'aria-label': 'Test message' });
    const dbg = h('pre', { class: 'dbg-pre' });
    const run = () => {
      const t = inp.value.trim(); if (!t) return; inp.value = '';
      log.append(h('div', { class: 'bubble me' }, t));
      const r = A.preview(t, { persona: p(), stage: +stSel.value, mode: modeSel.value, conv });
      conv = r.conv;
      r.messages.forEach((m) => log.append(h('div', { class: 'bubble' }, m.text)));
      dbg.textContent = JSON.stringify({ intent: r.fx.intent, topic: r.fx.topic, hits: r.debug.hits, topics: r.debug.topics, pending: r.debug.pending, mood: r.debug.mood, pieces: r.debug.pieces }, null, 1);
      log.scrollTop = log.scrollHeight;
    };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
    return section('Rule & personality tester',
      h('p', { class: 'muted', style: { marginTop: 0 } }, 'Talk to her using a throw-away copy of her state: nothing is saved, no points are earned and memory isn’t changed. Your rules, traits and style are all applied.'),
      h('div', { class: 'row wrap' }, h('label', { class: 'field grow' }, h('span', { class: 'label' }, 'Relationship stage'), stSel), h('label', { class: 'field grow' }, h('span', { class: 'label' }, 'Mode'), modeSel), h('button', { class: 'btn', onclick: () => { conv = {}; log.innerHTML = ''; dbg.textContent = ''; } }, icon('refresh', 16), 'Reset')),
      log, h('div', { class: 'row' }, inp, h('button', { class: 'btn primary', onclick: run }, 'Send')),
      h('details', { class: 'dbg-wrap' }, h('summary', 'Why did she say that? (engine details)'), dbg));
  }

  root.append(h('div', { class: 'page' }, h('div', { class: 'view-head' }, h('div', h('h2', 'Dialogue'), h('p', `Write rules and reactions for ${p().name}. Everything here directly drives her replies.`))), bar, body));
  paint();
  void modal;
  return root;
}
