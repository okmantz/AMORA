// AMORA — "Us": relationship progress, milestones and everything she remembers (all editable).
import { h, uid, clamp } from '../core/util.js';
import { STAGES, STATUS_LABEL, MILESTONES, stageProgress, effectiveStage } from '../engine/relationship.js';
import { fmtMD, daysUntil } from '../engine/text.js';
import { factCount } from '../engine/memory.js';
import { avatarEl } from './avatar.js';
import { section, fTags, toast, confirmBox, empty, icon } from './dom.js';

const label = (k) => (k.startsWith('fav_') ? `Favorite ${k.slice(4).replace(/_/g, ' ')}` : k.replace(/_/g, ' ')).replace(/^./, (c) => c.toUpperCase());
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function render(A) {
  const root = h('div', { class: 'view' }), page = h('div', { class: 'page' });
  const mem = () => A.mem, rel = () => A.rel, save = () => A.save('mem');
  const draw = () => {
    page.innerHTML = '';
    const r = rel(), sp = stageProgress(r), st = effectiveStage(r, A.settings), p = A.persona;
    page.append(h('div', { class: 'view-head' }, h('div', h('h2', 'Us'), h('p', `Your story with ${p.name}, and everything she remembers about you. It all lives only on this device.`))));
    // relationship card
    page.append(h('section', { class: 'card' }, h('div', { class: 'hero' }, avatarEl(p, 'happy', { size: 110 }),
      h('div', { class: 'grow', style: { minWidth: '220px' } }, h('h3', { style: { fontSize: '1.8rem' } }, STAGES[st].name), h('p', { class: 'muted', style: { margin: '2px 0 10px' } }, STAGES[st].blurb + ' · ' + (r.status === 'custom' ? r.customStatus || 'Custom' : STATUS_LABEL[r.status])),
        h('div', { class: 'bar' }, h('i', { style: { width: sp.pct + '%' } })),
        h('small', { class: 'muted' }, A.settings.relationship.progression === 'manual' ? 'Stage is set manually in Her → Relationship.' : sp.next ? `${sp.pct}% to “${sp.next.name}” — grows through conversation, never lost.` : 'You have reached the deepest stage.'))),
      h('div', { class: 'grid stats', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: '10px', marginTop: '16px' } },
        [[r.msgs, 'messages'], [r.days, 'days together'], [r.streak, 'day streak'], [factCount(mem()), 'things I know']].map(([n, l]) => h('div', { class: 'stat' }, h('b', String(n)), h('span', l))))));
    // milestones
    const done = MILESTONES.filter((m) => r.milestones[m.id]).length;
    page.append(section(`Milestones · ${done}/${MILESTONES.length}`, h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '8px' } }, MILESTONES.map((m) => h('div', { class: 'ms', style: { opacity: r.milestones[m.id] ? 1 : .5 } }, h('span', { class: 'ic' }, icon(r.milestones[m.id] ? 'check' : 'lock', 14)), h('span', m.label))))));
    // facts
    const keys = Object.keys(mem().facts);
    page.append(section('What she knows about you',
      keys.length ? keys.map((k) => { const inp = h('input', { type: 'text', value: mem().facts[k].v, 'aria-label': label(k) }); inp.addEventListener('change', () => { const v = inp.value.trim(); if (v) { mem().facts[k].v = v; save(); if (k === 'name') A.settings.userName = v; } }); return h('div', { class: 'kv' }, h('span', { class: 'muted' }, label(k)), inp, h('button', { class: 'icon-btn', 'aria-label': `Forget ${label(k)}`, onclick: () => { delete mem().facts[k]; save(); draw(); } }, icon('trash', 16))); })
        : empty('Nothing yet. Tell her your name, job, favorites or pets in chat — or add them below.', 'heart'),
      h('div', { class: 'row wrap', style: { marginTop: '10px' } }, factAdder())));
    page.append(section('Likes, dislikes & family',
      fTags('Things you like', () => mem().likes, (v) => { mem().likes = v; save(); }, 'e.g. jazz'),
      fTags('Things you dislike', () => mem().dislikes, (v) => { mem().dislikes = v; save(); }, 'e.g. mornings'),
      fTags('Your hobbies', () => mem().hobbies, (v) => { mem().hobbies = v; save(); }, 'e.g. climbing'),
      fTags('People in your life', () => mem().family, (v) => { mem().family = v; save(); }, 'e.g. my sister Anna')));
    // dates
    const dates = mem().dates.slice().sort((a, b) => daysUntil(a) - daysUntil(b));
    page.append(section('Important dates', dates.length ? dates.map((d) => h('div', { class: 'item' }, h('span', { style: { fontSize: '1.3rem' } }, d.kind === 'birthday' ? '🎂' : d.kind === 'anniversary' ? '💞' : '📅'), h('div', { class: 't' }, h('b', d.label), h('small', `${MONTHS[d.month - 1]} ${d.day}${d.year ? ', ' + d.year : ''} · in ${daysUntil(d)} day${daysUntil(d) === 1 ? '' : 's'}`)), h('button', { class: 'icon-btn', 'aria-label': 'Delete date', onclick: () => { mem().dates = mem().dates.filter((x) => x.id !== d.id); save(); draw(); } }, icon('trash', 16)))) : empty('No dates yet. Try telling her “my birthday is March 3”.', 'calendar'), dateAdder()));
    // notes
    page.append(section('Things you asked her to remember', mem().notes.length ? mem().notes.map((n) => h('div', { class: 'item' }, h('div', { class: 't' }, h('b', n.text)), h('button', { class: 'icon-btn', 'aria-label': 'Delete note', onclick: () => { mem().notes = mem().notes.filter((x) => x.id !== n.id); save(); draw(); } }, icon('trash', 16)))) : empty('Say “remember that…” in chat and it appears here.', 'pin'), noteAdder()));
    page.append(section('Privacy', h('p', { class: 'muted', style: { marginTop: 0 } }, 'Memory is stored only in this browser. Forgetting is immediate and permanent.'), h('div', { class: 'row wrap' }, h('button', { class: 'btn danger', onclick: async () => { if (await confirmBox('Make her forget everything she has learned about you (facts, likes, dates, notes)? Chats and relationship progress stay.', 'Forget all', true)) { const keep = A.mem; Object.assign(keep, { facts: {}, likes: [], dislikes: [], hobbies: [], family: [], dates: [], notes: [], mentions: [] }); save(); toast('Memory cleared'); draw(); } } }, icon('trash', 16), 'Forget everything about me'))));
  };
  function factAdder() {
    const k = h('input', { type: 'text', placeholder: 'What (e.g. job, pet, city)', 'aria-label': 'Fact name' }), v = h('input', { type: 'text', placeholder: 'Value', 'aria-label': 'Fact value' });
    const add = () => { const key = k.value.trim().toLowerCase().replace(/\s+/g, '_'), val = v.value.trim(); if (!key || !val) return toast('Enter both a name and a value'); const map = { city: 'location', place: 'location', occupation: 'job', work: 'workplace' }; mem().facts[map[key] || key] = { v: val, ts: Date.now() }; save(); draw(); };
    return [k, v, h('button', { class: 'btn', onclick: add }, icon('plus', 16), 'Add')];
  }
  function dateAdder() {
    const l = h('input', { type: 'text', placeholder: 'Label (e.g. Our anniversary)', 'aria-label': 'Date label' }), d = h('input', { type: 'date', 'aria-label': 'Date' });
    const kind = h('select', { 'aria-label': 'Kind' }, [['birthday', 'Birthday'], ['anniversary', 'Anniversary'], ['other', 'Other']].map(([a, b]) => h('option', { value: a }, b)));
    return h('div', { class: 'row wrap', style: { marginTop: '10px' } }, l, d, kind, h('button', { class: 'btn', onclick: () => { if (!l.value.trim() || !d.value) return toast('Enter a label and a date'); const [y, m, dd] = d.value.split('-').map(Number); mem().dates.push({ id: uid('d'), label: l.value.trim(), kind: kind.value, month: m, day: dd, year: y }); save(); draw(); } }, icon('plus', 16), 'Add date'));
  }
  function noteAdder() {
    const t = h('input', { type: 'text', placeholder: 'Something for her to remember…', 'aria-label': 'Note' });
    const add = () => { if (!t.value.trim()) return; mem().notes.push({ id: uid('n'), text: t.value.trim(), ts: Date.now() }); save(); draw(); };
    t.addEventListener('keydown', (e) => e.key === 'Enter' && add());
    return h('div', { class: 'row', style: { marginTop: '10px' } }, t, h('button', { class: 'btn', onclick: add }, icon('plus', 16), 'Add'));
  }
  draw(); root.append(page);
  const off = A.bus.on('rel', () => { if (A.view === 'memory' && !document.activeElement?.closest('.page input')) draw(); });
  void off; void clamp; void fmtMD;
  return root;
}
