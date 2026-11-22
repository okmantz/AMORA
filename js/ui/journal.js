// AMORA — journal (with optional reply from her) and sticky notes.
import { h, uid, fmtDateTime } from '../core/util.js';
import { section, tabs, toast, confirmBox, empty, icon } from './dom.js';

const MOODS = [['😄', 'great'], ['🙂', 'good'], ['😐', 'okay'], ['😔', 'low'], ['😢', 'sad']];
const COLORS = ['#fff3c4', '#ffd9e4', '#d9efe3', '#dde6ff', '#f1dcff', '#ffe3cf'];

export function render(A) {
  let tab = A._jTab || 'journal', mood = '🙂', q = '';
  const root = h('div', { class: 'view' }), page = h('div', { class: 'page' }), body = h('div');
  const bar = tabs([['journal', 'Journal', 'feather'], ['notes', 'Sticky notes', 'pin']], tab, (t) => { tab = A._jTab = t; paint(); });
  const paint = () => { body.innerHTML = ''; body.append(tab === 'journal' ? journal() : notes()); };

  function journal() {
    const S = A.state;
    const ta = h('textarea', { rows: 5, placeholder: 'Write about your day, a worry, a hope…', 'aria-label': 'Journal entry', maxlength: 8000 });
    const moodEl = h('div', { class: 'mood', role: 'radiogroup', 'aria-label': 'Mood' }, MOODS.map(([e, n]) => h('button', { type: 'button', class: e === mood ? 'on' : '', title: n, 'aria-label': n, onclick: (ev) => { mood = e; [...moodEl.children].forEach((b) => b.classList.toggle('on', b === ev.currentTarget)); } }, e)));
    const add = (share) => {
      const text = ta.value.trim(); if (!text) return toast('Write something first');
      const entry = { id: uid('j'), ts: Date.now(), mood, text, reply: '' };
      if (share) {
        const r = A.preview(`${moodWord(mood)} ${text}`, { persona: A.persona, stage: A.stage(), mode: 'heart' });
        entry.reply = r.messages.map((m) => m.text).join(' ');
        entry.replyBy = A.persona.name;
      }
      S.journal.unshift(entry); A.save('journal'); A.bus.emit('rel');
      ta.value = ''; paint(); toast(share ? `${A.persona.name} read your entry` : 'Saved');
    };
    const moodWord = (m) => ({ '😄': "I'm feeling great.", '🙂': "I'm doing alright.", '😐': 'I feel kind of meh.', '😔': "I'm feeling low.", '😢': "I'm sad." }[m] || '');
    const list = S.journal.filter((j) => !q || j.text.toLowerCase().includes(q.toLowerCase()));
    const search = h('input', { type: 'search', placeholder: 'Search entries…', 'aria-label': 'Search journal', value: q });
    search.addEventListener('input', () => { q = search.value; paintList(); });
    const listEl = h('div');
    function paintList() {
      listEl.innerHTML = '';
      const l = S.journal.filter((j) => !q || j.text.toLowerCase().includes(q.toLowerCase()));
      if (!l.length) return listEl.append(empty(S.journal.length ? 'No entries match.' : 'Your journal is empty. Everything you write stays on this device.', 'feather'));
      l.forEach((j) => listEl.append(h('article', { class: 'card' }, h('div', { class: 'row between' }, h('small', { class: 'muted' }, `${j.mood} ${fmtDateTime(j.ts)}`),
        h('div', h('button', { class: 'icon-btn', 'aria-label': 'Copy entry', onclick: () => navigator.clipboard?.writeText(j.text).then(() => toast('Copied')) }, icon('copy', 16)), h('button', { class: 'icon-btn', 'aria-label': 'Delete entry', onclick: async () => { if (await confirmBox('Delete this journal entry?', 'Delete', true)) { S.journal = S.journal.filter((x) => x.id !== j.id); A.save('journal'); paintList(); } } }, icon('trash', 16)))),
        h('p', { style: { whiteSpace: 'pre-wrap', margin: '8px 0' } }, j.text),
        j.reply && h('div', { class: 'preview-box' }, h('small', { class: 'muted' }, `${j.replyBy || 'Her'} replied`), h('div', { class: 'bubble' }, j.reply)))));
    }
    paintList(); void list;
    return h('div', section('New entry', moodEl, ta, h('div', { class: 'row wrap', style: { marginTop: '10px' } }, h('button', { class: 'btn primary', onclick: () => add(false) }, icon('check', 16), 'Save'), h('button', { class: 'btn', onclick: () => add(true) }, icon('heart', 16), `Save & share with ${A.persona.name}`)),
      h('small', { class: 'muted' }, 'Sharing gets a kind reply from her rule-based engine; it doesn’t change her memory or chat.')), search, listEl);
  }

  function notes() {
    const S = A.state;
    const grid = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: '14px', marginTop: '14px' } });
    const draw = () => {
      grid.innerHTML = '';
      if (!S.notes.length) return grid.append(empty('No notes yet — jot down anything: gift ideas, things to tell her, to-dos.', 'pin'));
      S.notes.slice().sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || b.ts - a.ts).forEach((n) => {
        const ta = h('textarea', { rows: 5, 'aria-label': 'Note text' }, n.text); ta.value = n.text;
        ta.addEventListener('input', () => { n.text = ta.value; n.ts = Date.now(); A.save('notes'); });
        grid.append(h('div', { class: 'note', style: { '--c': n.color } }, ta, h('div', { class: 'row between' },
          h('span', COLORS.map((c) => h('button', { type: 'button', class: 'sw', style: { '--c': c, width: '18px', height: '18px', marginRight: '4px' }, 'aria-label': 'Color', onclick: () => { n.color = c; A.save('notes'); draw(); } }))),
          h('span', h('button', { class: 'icon-btn', 'aria-label': n.pin ? 'Unpin' : 'Pin', onclick: () => { n.pin = !n.pin; A.save('notes'); draw(); } }, icon('pin', 16)), h('button', { class: 'icon-btn', 'aria-label': 'Delete note', onclick: () => { S.notes = S.notes.filter((x) => x.id !== n.id); A.save('notes'); draw(); } }, icon('trash', 16))))));
      });
    };
    draw();
    return h('div', h('button', { class: 'btn primary', onclick: () => { S.notes.unshift({ id: uid('n'), text: '', ts: Date.now(), color: COLORS[S.notes.length % COLORS.length] }); A.save('notes'); draw(); grid.querySelector('textarea')?.focus(); } }, icon('plus', 16), 'New note'), grid);
  }

  page.append(h('div', { class: 'view-head' }, h('div', h('h2', 'Journal'), h('p', 'A private place to write. Entries are stored only on this device.'))), bar, body);
  root.append(page); paint();
  return root;
}
