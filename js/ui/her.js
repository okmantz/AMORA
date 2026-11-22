// AMORA — "Her": customize appearance, personality, interests, style, relationship and manage saved personalities.
import { h, deepClone, clamp, pickFile, readText, resizeImage, uid } from '../core/util.js';
import { OPTIONS, TRAITS, PRESETS, fromPreset, normalizePersona } from '../data/presets.js';
import { avatarEl, paintAvatar, EXPRESSIONS } from './avatar.js';
import { fText, fSelect, fToggle, fSlider, fChips, fTags, fSwatches, section, tabs, toast, confirmBox, modal, icon } from './dom.js';
import { exportPersona, parseFile, personaFromExport } from '../core/io.js';
import { STAGES, STATUS_LABEL } from '../engine/relationship.js';

const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const SAMPLES = ['Hi, how was your day?', "You're beautiful", "I'm so stressed today", 'Tell me about yourself', "Let's talk about music", 'I love you', "I'm bored"];

export function render(A) {
  let tab = A._herTab || 'look';
  const root = h('div', { class: 'view' });
  const page = h('div', { class: 'page' });
  const persona = () => A.persona;

  /* live preview column */
  const big = avatarEl(persona(), 'neutral', { size: 200, cls: 'big' });
  const pName = h('h3', { style: { fontSize: '1.7rem' } });
  const pSub = h('p', { class: 'muted', style: { margin: 0 } });
  const exprRow = h('div', { class: 'chips', style: { justifyContent: 'center', marginTop: '10px' } }, EXPRESSIONS.map((e) => h('button', { class: 'chip', style: { padding: '4px 10px', fontSize: '.74rem' }, onclick: () => paintAvatar(big, persona(), e) }, e)));
  const sideInfo = h('div', pName, pSub);
  const side = h('aside', { class: 'her-preview' }, big, h('div', { class: 'grow' }, sideInfo, exprRow));
  function refreshPreview() {
    paintAvatar(big, persona(), big.dataset.expr || 'neutral');
    pName.textContent = persona().name;
    pSub.textContent = `${persona().age} · ${OPTIONS.aesthetic.find((a) => a[0] === persona().look.aesthetic)?.[1] || ''}`;
  }
  const commit = () => { A.touchPersona(); refreshPreview(); };
  refreshPreview();

  const body = h('div');
  const tabBar = tabs([['look', 'Look', 'sparkle'], ['traits', 'Personality', 'sliders'], ['interests', 'Interests', 'star'], ['style', 'Style', 'feather'], ['rel', 'Relationship', 'heart'], ['library', 'Library', 'book']], tab, (t) => { tab = A._herTab = t; paint(); });

  function paint() {
    body.innerHTML = '';
    body.append({ look, traits, interests, style, rel, library }[tab]());
    root.scrollTo?.({ top: 0 });
  }

  /* ----------------------------- Look ----------------------------- */
  function look() {
    const p = persona(), L = p.look;
    const photo = h('div', { class: 'row wrap' },
      h('button', { class: 'btn', onclick: async () => { const f = await pickFile('image/*'); if (!f) return; try { L.avatarImage = await resizeImage(f, 320, 0.85); L.avatarKind = 'image'; commit(); paint(); toast('Avatar updated'); } catch (e) { toast(e.message, 'err'); } } }, icon('upload', 16), 'Upload image'),
      L.avatarImage && h('button', { class: 'btn ghost', onclick: () => { L.avatarImage = null; if (L.avatarKind === 'image') L.avatarKind = 'illustrated'; commit(); paint(); } }, 'Remove image'));
    return h('div',
      section('Identity',
        fText('Name', () => p.name, (v) => { p.name = v.slice(0, 30) || 'Amora'; commit(); }, { max: 30 }),
        fText('Age (adult characters only, 18+)', () => p.age, (v) => { p.age = clamp(Math.round(+v) || 18, 18, 99); commit(); }, { type: 'number' }),
        fText('About her', () => p.bio, (v) => { p.bio = v; A.touchPersona(); }, { multiline: true, max: 400, hint: 'Shown in her profile; she uses this when you ask her to tell you about herself.' })),
      section('Avatar',
        fChips('Avatar type', [['illustrated', 'Illustrated'], ['monogram', 'Monogram'], ['image', 'Your own image']], () => L.avatarKind, (v) => { L.avatarKind = v; commit(); paint(); }),
        (L.avatarKind === 'image' || true) && photo),
      section('Appearance',
        fSwatches('Skin tone', OPTIONS.skin, () => L.skin, (v) => { L.skin = v; commit(); }),
        fChips('Hairstyle', OPTIONS.hairStyle, () => L.hairStyle, (v) => { L.hairStyle = v; commit(); }),
        fSwatches('Hair color', OPTIONS.hairColor, () => L.hairColor, (v) => { L.hairColor = v; commit(); }),
        fSwatches('Eye color', OPTIONS.eyeColor, () => L.eyeColor, (v) => { L.eyeColor = v; commit(); }),
        fChips('Body type', OPTIONS.bodyType, () => L.bodyType || 'average', (v) => { L.bodyType = v; commit(); }),
        fChips('Makeup', OPTIONS.makeup, () => L.makeup || 'glam', (v) => { L.makeup = v; commit(); }),
        fSwatches('Lip color', OPTIONS.lipColor, () => L.lip || '#c0506b', (v) => { L.lip = v; commit(); }),
        fToggle('Freckles', '', () => !!L.freckles, (v) => { L.freckles = v; commit(); }),
        fToggle('Beauty mark', '', () => !!L.beautyMark, (v) => { L.beautyMark = v; commit(); }),
        fChips('Clothing', OPTIONS.outfit, () => L.outfit, (v) => { L.outfit = v; commit(); }),
        fSwatches('Clothing color', OPTIONS.outfitColors, () => L.outfitColor, (v) => { L.outfitColor = v; commit(); }),
        fChips('Accessory', OPTIONS.accessory, () => L.accessory, (v) => { L.accessory = v; commit(); }),
        fChips('Aesthetic', OPTIONS.aesthetic, () => L.aesthetic, (v) => { L.aesthetic = v; commit(); }, 'Sets her avatar backdrop colors and how she describes her style.'),
        h('button', { class: 'btn', onclick: () => { Object.assign(L, { skin: rnd(OPTIONS.skin)[0], hairStyle: rnd(OPTIONS.hairStyle)[0], hairColor: rnd(OPTIONS.hairColor)[0], eyeColor: rnd(OPTIONS.eyeColor)[0], outfit: rnd(OPTIONS.outfit.filter((o) => ['tee','sweater','hoodie','blazer','sundress','dress','offshoulder','camisole'].includes(o[0])))[0], bodyType: rnd(OPTIONS.bodyType)[0], makeup: rnd(OPTIONS.makeup)[0], lip: rnd(OPTIONS.lipColor), freckles: Math.random() < 0.3, outfitColor: rnd(OPTIONS.outfitColors), accessory: rnd(OPTIONS.accessory)[0], aesthetic: rnd(OPTIONS.aesthetic)[0] }); commit(); paint(); } }, icon('dice', 16), 'Randomize look')));
  }

  /* -------------------------- try-it widget -------------------------- */
  function tryIt() {
    const out = h('div', { class: 'preview-box' }, h('span', { class: 'label' }, 'Live preview'), h('p', { class: 'muted', style: { margin: 0, fontSize: '.85rem' } }, 'Send a sample message to hear how your current settings sound. (Nothing is saved.)'));
    const inp = h('input', { type: 'text', value: SAMPLES[0], 'aria-label': 'Sample message' });
    let conv = {};
    const run = (t) => { const r = A.preview(t ?? inp.value, { persona: persona(), conv, stage: A.stage() }); conv = r.conv; out.querySelectorAll('.bubble,.dbg').forEach((x) => x.remove()); r.messages.forEach((m) => out.append(h('div', { class: 'bubble' }, m.text))); out.append(h('div', { class: 'dbg' }, 'Intent: ', h('b', r.fx.intent || 'none'), ' · mood ', h('b', String(r.debug.mood)))); };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
    return section('Try it', h('div', { class: 'row' }, inp, h('button', { class: 'btn primary', onclick: () => run() }, 'Send')), h('div', { class: 'chips', style: { margin: '10px 0' } }, SAMPLES.map((s) => h('button', { class: 'chip', onclick: () => { inp.value = s; run(s); } }, s))), out);
  }

  /* --------------------------- Personality --------------------------- */
  function traits() {
    const p = persona();
    const presetSel = h('select', h('option', { value: '' }, 'Copy traits from a preset…'), PRESETS.map((x) => h('option', { value: x._preset }, `${x.name} — ${x._blurb}`)));
    presetSel.addEventListener('change', () => { const x = PRESETS.find((y) => y._preset === presetSel.value); if (x) { Object.assign(p.traits, deepClone(x.traits)); commit(); paint(); toast(`Traits copied from ${x.name}`); } });
    return h('div',
      section('Personality traits',
        h('p', { class: 'muted', style: { marginTop: 0 } }, 'Each slider changes which lines she chooses and how she phrases them. Try the preview below after adjusting.'),
        TRAITS.map(([k, label, desc]) => fSlider(label, desc, () => p.traits[k], (v) => { p.traits[k] = v; A.touchPersona(); })),
        h('div', { class: 'row wrap' }, h('button', { class: 'btn', onclick: () => { TRAITS.forEach(([k]) => { p.traits[k] = Math.round(Math.random() * 100); }); commit(); paint(); } }, icon('dice', 16), 'Randomize'), h('div', { class: 'grow' }, presetSel))),
      tryIt());
  }

  /* ---------------------------- Interests ---------------------------- */
  function interests() {
    const p = persona(), I = p.interests;
    const tag = (label, key, ph) => fTags(label, () => I[key], (v) => { I[key] = v; A.touchPersona(); }, ph);
    return h('div', section('Her interests',
      h('p', { class: 'muted', style: { marginTop: 0 } }, 'She mentions these when she talks about herself, shares opinions and answers “what’s your favorite…?”.'),
      tag('Hobbies', 'hobbies', 'e.g. painting, hiking…'), tag('Favorite music', 'music', 'e.g. jazz, synthwave…'), tag('Favorite movies & shows', 'movies', 'e.g. Amélie…'), tag('Favorite books', 'books', 'e.g. poetry…'), tag('Activities she loves', 'activities', 'e.g. evening walks…'), tag('Favorite foods & drinks', 'foods', 'e.g. pasta, matcha…')),
      section('Topics', h('p', { class: 'muted', style: { margin: '0 0 10px' } }, 'Choose which conversation topics she loves — and which she avoids — in the Dialogue tab.'), h('button', { class: 'btn', onclick: () => { A._dlgTab = 'behavior'; A.go('dialogue'); } }, 'Open topic preferences ', icon('chevron', 14))));
  }

  /* ------------------------------ Style ------------------------------ */
  function style() {
    const p = persona(), S = p.style;
    const lenLabel = ['', 'Very short', 'Short', 'Balanced', 'Detailed', 'Expressive'];
    return h('div',
      section('How she talks',
        fChips('Vocabulary', OPTIONS.vocab, () => S.vocab, (v) => { S.vocab = v; A.touchPersona(); }, 'Changes word choice: contractions, poetic or playful wording, and more.'),
        fSlider('Response length', 'More pieces per reply: reactions, extra remarks, follow-ups and callbacks.', () => S.length, (v) => { S.length = v; A.touchPersona(); }, { min: 1, max: 5, fmt: (v) => lenLabel[v], marks: ['Short', 'Long'] }),
        fSlider('Emoji frequency', 'How often replies end with an emoji (0 = never).', () => S.emoji, (v) => { S.emoji = v; A.touchPersona(); }, { fmt: (v) => (v ? v + '%' : 'Off') }),
        fText('Favorite emoji (optional)', () => S.emojis, (v) => { S.emojis = v; A.touchPersona(); }, { placeholder: '🌸 ✨ 💕', hint: 'She mixes these in with the usual ones.' }),
        fToggle('all lowercase typing', 'A relaxed texting style.', () => S.lowercase, (v) => { S.lowercase = v; A.touchPersona(); })),
      section('Pet names & flirting',
        fTags('What she calls you', () => S.nicknames, (v) => { S.nicknames = v; A.touchPersona(); }, 'darling, love, handsome…', 'Used in her replies once you’re at least acquainted. Leave empty to use only your name.'),
        fSlider('Flirting frequency', 'How often she adds a flirty remark. Always gated by relationship stage and her Romance trait.', () => S.flirt, (v) => { S.flirt = v; A.touchPersona(); }, { fmt: (v) => (v ? v + '%' : 'Never') }),
        fTags('Signature phrases', () => S.catchphrases, (v) => { S.catchphrases = v; A.touchPersona(); }, 'Add a catchphrase…', 'Occasionally added to the end of a reply.', { commas: false })),
      tryIt());
  }

  /* --------------------------- Relationship --------------------------- */
  function rel() {
    const r = A.rel, st = A.settings.relationship;
    const custom = h('div');
    const paintCustom = () => { custom.innerHTML = ''; if (r.status === 'custom') custom.append(fText('Custom status', () => r.customStatus, (v) => { r.customStatus = v; A.save('rel'); }, { placeholder: 'e.g. “soulmates”', max: 40 })); };
    paintCustom();
    return h('div',
      section('Relationship status',
        fChips('Status', OPTIONS.relationship, () => r.status, (v) => { r.status = v; A.save('rel'); paintCustom(); A.chat?.refreshHeader(); }, 'The status sets a minimum closeness: e.g. “Dating” unlocks warm, flirty dialogue right away.'),
        custom,
        fTags('Shared memories & inside jokes', () => r.shared || [], (v) => { r.shared = v; A.save('rel'); }, 'e.g. our rainy picnic', 'Short phrases she will weave into callbacks: “Remember our rainy picnic?”', { commas: false }),
        fText('Relationship notes (just for you)', () => r.details, (v) => { r.details = v; A.save('rel'); }, { multiline: true, rows: 3, hint: 'How you met, anniversaries, in-jokes — add important dates in the Us tab.' })),
      section('Progression',
        fChips('How closeness grows', [['auto', 'Earned by chatting'], ['manual', 'I set it manually']], () => A.settings.relationship.progression, (v) => { A.settings.relationship.progression = v; A.save('settings'); paint(); }, 'Progress only ever goes up. Nothing is lost if you are away, and she never withholds affection as a reward or punishment.'),
        A.settings.relationship.progression === 'manual' && fChips('Current stage', STAGES.map((s) => [String(s.id), s.name]), () => String(r.manualStage), (v) => { r.manualStage = +v; A.save('rel'); }),
        fSlider('Progression speed', 'How quickly familiarity and affection points accumulate.', () => st.speed, (v) => { st.speed = v; A.save('settings'); }, { min: 0.5, max: 3, step: 0.5, fmt: (v) => v + '×' }),
        fToggle('Lock content by stage', 'Romantic lines, some modes and scenarios unlock as you grow closer. Turn off to unlock everything.', () => st.gating, (v) => { st.gating = v; A.save('settings'); }),
        fSlider('Daily familiarity cap', 'Maximum points from chatting per day.', () => st.dailyCapFP, (v) => { st.dailyCapFP = v; A.save('settings'); }, { min: 10, max: 150, step: 5 })),
      h('p', { class: 'muted' }, 'See your progress, milestones and everything she remembers in the ', h('b', 'Us'), ' tab.'));
  }

  /* ------------------------------ Library ------------------------------ */
  function library() {
    const mine = A.state.personas;
    const card = (p, kind) => h('div', { class: 'item' }, avatarEl(p, 'happy', { size: 54 }),
      h('div', { class: 't' }, h('b', p.name + (kind === 'mine' && p.id === A.state.activeId ? ' · active' : '')), h('small', kind === 'mine' ? `${p.age} · ${OPTIONS.vocab.find((v) => v[0] === p.style.vocab)?.[1]} · ${p.rules.length} custom rules` : p._blurb)),
      kind === 'mine'
        ? [p.id !== A.state.activeId && h('button', { class: 'btn sm primary', onclick: () => { A.switchPersona(p.id); } }, 'Switch'),
          h('button', { class: 'btn sm', title: 'Save a copy', onclick: () => { const c = deepClone(p); c.id = uid('p'); c.name = p.name + ' (copy)'; A.addPersona(c, false); toast('Copy saved'); paint(); } }, 'Duplicate'),
          h('button', { class: 'icon-btn', 'aria-label': 'Export', onclick: () => exportPersona(p) }, icon('download', 18)),
          mine.length > 1 && h('button', { class: 'icon-btn', 'aria-label': 'Delete', onclick: async () => { if (await confirmBox(`Delete ${p.name} and her conversations? Your shared memories of you stay.`, 'Delete', true)) { A.deletePersona(p.id); A.go('her', true); } } }, icon('trash', 18))]
        : [h('button', { class: 'btn sm primary', onclick: () => { A.addPersona(fromPreset(p._preset), true); toast(`${p.name} joined — say hello!`); A.applyTheme(); A.go('her', true); } }, 'New companion'),
          h('button', { class: 'btn sm', onclick: async () => { if (await confirmBox(`Replace the look and personality of ${persona().name} with ${p.name}'s? Your chat history, memories and relationship stay.`, 'Apply')) { const np = fromPreset(p._preset); const cur = persona(); Object.assign(cur, { name: np.name, age: np.age, bio: np.bio, look: np.look, traits: np.traits, interests: np.interests, style: np.style, reactions: np.reactions }); A.touchPersona(); toast('Preset applied'); A.go('her', true); } } }, 'Apply to current')]);
    return h('div',
      section('My personalities', h('p', { class: 'muted', style: { marginTop: 0 } }, 'Every personality is its own companion with her own conversations and relationship. Save as many as you like.'), mine.map((p) => card(p, 'mine')),
        h('div', { class: 'row wrap', style: { marginTop: '12px' } },
          h('button', { class: 'btn', onclick: () => { const c = deepClone(persona()); c.id = uid('p'); c.name = persona().name + ' II'; A.addPersona(c, false); toast('Saved as a new personality'); paint(); } }, icon('plus', 16), 'Save current as new'),
          h('button', { class: 'btn', onclick: () => exportPersona(persona()) }, icon('download', 16), 'Export current (JSON)'),
          h('button', { class: 'btn', onclick: importPersona }, icon('upload', 16), 'Import JSON'))),
      section('Presets', PRESETS.map((p) => card(p, 'preset'))));
  }
  async function importPersona() {
    const f = await pickFile('.json,application/json'); if (!f) return;
    try {
      const data = parseFile(await readText(f)); const p = personaFromExport(data);
      const m = modal({ title: `Import “${p.name}”`, size: 'sm', body: h('p', { class: 'muted' }, 'Add as a new companion, or apply it to the companion you are talking to now (your chat history, memories and relationship are kept).'), actions: [
        { label: 'Cancel' },
        { label: 'Apply to current', onClick: () => { const cur = persona(); const keep = cur.id; Object.assign(cur, p, { id: keep }); A.touchPersona(); toast('Personality applied'); A.go('her', true); } },
        { label: 'Add as new', kind: 'primary', onClick: () => { A.addPersona(p, true); A.applyTheme(); toast('Personality imported'); A.go('her', true); } }] });
      void m;
    } catch (e) { toast(e.message, 'err'); }
  }

  page.append(h('div', { class: 'view-head' }, h('div', h('h2', 'Her'), h('p', 'Shape every part of her: how she looks, how she thinks and how she talks.'))), h('div', { class: 'her-layout' }, side, h('div', { style: { minWidth: 0 } }, tabBar, body)));
  root.append(page);
  paint();
  return root;
}
