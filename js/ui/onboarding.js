// AMORA — first-run welcome: honesty note, 18+ confirmation, name and starting personality.
import { h } from '../core/util.js';
import { PRESETS, fromPreset } from '../data/presets.js';
import { avatarEl } from './avatar.js';
import { modal, icon } from './dom.js';

export function onboarding(A) {
  return new Promise((resolve) => {
    let preset = PRESETS[0]._preset, name = A.settings.userName || '', adult = !!A.settings.ageConfirmed;
    const nameInp = h('input', { type: 'text', placeholder: 'Your name (optional)', maxlength: 30, value: name, 'aria-label': 'Your name' });
    nameInp.addEventListener('input', () => { name = nameInp.value.trim(); });
    const grid = h('div', { class: 'preset-grid', role: 'radiogroup', 'aria-label': 'Starting personality' });
    const paint = () => [...grid.children].forEach((b) => b.classList.toggle('on', b.dataset.k === preset));
    PRESETS.forEach((p) => grid.append(h('button', { type: 'button', class: 'preset', 'data-k': p._preset, role: 'radio', onclick: () => { preset = p._preset; paint(); } }, avatarEl(p, 'happy', { size: 72 }), h('span', p.name), h('small', p._blurb))));
    paint();
    const chk = h('input', { type: 'checkbox', id: 'adult', checked: adult });
    const go = h('button', { class: 'btn primary', disabled: !adult, onclick: finish }, 'Begin ', icon('chevron', 16));
    chk.addEventListener('change', () => { adult = chk.checked; go.disabled = !adult; });
    const body = h('div', { class: 'onboard' },
      h('div', { class: 'logo' }, 'AMORA'),
      h('p', { class: 'muted' }, 'A customizable virtual companion who lives entirely on your device.'),
      h('div', { class: 'card', style: { textAlign: 'left', marginTop: '14px', marginBottom: '10px' } },
        h('p', { style: { margin: 0, fontSize: '.92rem' } }, h('b', 'Please note: '), 'AMORA is a fictional character powered by hand-written rules and templates — ', h('b', 'not AI'), '. She can chat about everyday things, remember what you tell her and react to your mood, but she does not truly understand and cannot discuss arbitrary subjects. Everything is stored locally in your browser; nothing is sent anywhere.')),
      h('label', { class: 'field' }, h('span', { class: 'label' }, 'What should she call you?'), nameInp),
      h('span', { class: 'label', style: { textAlign: 'left' } }, 'Choose a starting personality (everything can be changed later)'), grid,
      h('label', { class: 'row', style: { textAlign: 'left', gap: '12px', margin: '6px 0 4px', cursor: 'pointer' } }, chk, h('span', { style: { fontSize: '.9rem' } }, 'I confirm that I am 18 or older. AMORA is for adults only.')));
    const m = modal({ body, size: 'lg', dismissable: false, actions: [] });
    m.box.querySelector('.modal-body').append(h('div', { style: { display: 'flex', justifyContent: 'center', padding: '10px 0 14px' } }, go));
    function finish() {
      if (!adult) return;
      A.settings.userName = name; A.settings.ageConfirmed = true; A.settings.onboarded = true;
      if (name) A.mem.facts.name = { v: name, ts: Date.now() };
      if (!A.state.personas.length) { const p = A.addPersona(fromPreset(preset), true); void p; }
      A.save('all');
      m.close();
      A.introMessages(name);
      resolve();
    }
  });
}
