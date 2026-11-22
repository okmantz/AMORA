// AMORA — searchable conversation history with export and clearing.
import { h, fmtDateTime, fmtDay, download, dayKey, esc } from '../core/util.js';
import { section, toast, confirmBox, empty, icon } from './dom.js';
import { exportThreadsJSON } from '../core/io.js';

function mark(text, term) {
  const frag = document.createDocumentFragment();
  if (!term) { frag.append(text); return frag; }
  const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  text.split(re).forEach((p, i) => frag.append(i % 2 ? h('mark', p) : document.createTextNode(p)));
  return frag;
}

export function render(A) {
  let q = '', who = 'all', from = '';
  const root = h('div', { class: 'view' }), page = h('div', { class: 'page' }), out = h('div');
  const name = () => A.persona.name;
  const search = h('input', { type: 'search', placeholder: 'Search every conversation…', 'aria-label': 'Search messages' });
  const whoSel = h('select', { 'aria-label': 'Speaker' }, [['all', 'Everyone'], ['user', 'Only me'], ['her', `Only ${name()}`]].map(([v, l]) => h('option', { value: v }, l)));
  const fromInp = h('input', { type: 'date', 'aria-label': 'From date' });
  const run = () => { q = search.value.trim(); who = whoSel.value; from = fromInp.value; draw(); };
  search.addEventListener('input', run); whoSel.addEventListener('change', run); fromInp.addEventListener('change', run);

  function draw() {
    out.innerHTML = '';
    const threads = A.threads().slice().sort((a, b) => b.updated - a.updated);
    const fromTs = from ? new Date(from + 'T00:00:00').getTime() : 0;
    if (q || who !== 'all' || from) {
      let n = 0;
      const box = h('div');
      for (const t of threads) for (const m of t.messages) {
        if (m.role === 'sys' || (who !== 'all' && m.role !== who) || m.ts < fromTs) continue;
        if (q && !m.text.toLowerCase().includes(q.toLowerCase())) continue;
        if (++n > 150) continue;
        box.append(h('button', { class: 'hit', onclick: () => A.switchThread(t.id) }, h('small', `${m.role === 'user' ? 'You' : name()} · ${t.title} · ${fmtDateTime(m.ts)}`), h('div', mark(m.text, q))));
      }
      out.append(h('p', { class: 'muted' }, n ? `${Math.min(n, 150)}${n > 150 ? '+' : ''} matching message${n === 1 ? '' : 's'}. Tap one to open that conversation.` : ''), n ? box : empty('No messages match.', 'search'));
      return;
    }
    if (!threads.length) return out.append(empty('No conversations yet.', 'history'));
    threads.forEach((t) => out.append(h('div', { class: 'item' }, h('div', { class: 't', style: { cursor: 'pointer' }, onclick: () => A.switchThread(t.id) }, h('b', t.title), h('small', `${fmtDay(t.updated)} · ${t.messages.length} messages`)),
      h('button', { class: 'icon-btn', 'aria-label': 'Export conversation', onclick: () => { download(`amora-${dayKey(new Date(t.created))}.txt`, t.messages.filter((m) => m.role !== 'sys').map((m) => `[${new Date(m.ts).toLocaleString()}] ${m.role === 'user' ? (A.mem.facts.name?.v || 'You') : name()}: ${m.text}`).join('\n') || '(empty)', 'text/plain'); } }, icon('download', 18)),
      h('button', { class: 'icon-btn', 'aria-label': 'Delete conversation', onclick: async () => { if (await confirmBox('Delete this conversation?', 'Delete', true)) { A.deleteThread(t.id); draw(); } } }, icon('trash', 18)))));
  }
  draw();
  page.append(h('div', { class: 'view-head' }, h('div', h('h2', 'History'), h('p', `Every conversation with ${name()}, searchable.`))),
    h('div', { class: 'row wrap', style: { marginBottom: '14px' } }, h('div', { class: 'grow' }, search), whoSel, fromInp),
    out,
    section('Manage', h('div', { class: 'row wrap' },
      h('button', { class: 'btn', onclick: () => exportThreadsJSON(A) }, icon('download', 16), 'Export all (JSON)'),
      h('button', { class: 'btn', onclick: () => { const txt = A.threads().slice().reverse().map((t) => `=== ${t.title} (${new Date(t.created).toLocaleString()}) ===\n` + t.messages.filter((m) => m.role !== 'sys').map((m) => `${m.role === 'user' ? 'You' : name()}: ${m.text}`).join('\n')).join('\n\n'); download(`amora-all-${dayKey()}.txt`, txt || '(empty)', 'text/plain'); } }, icon('download', 16), 'Export all (text)'),
      h('button', { class: 'btn danger', onclick: async () => { if (await confirmBox(`Delete every conversation with ${name()}? This cannot be undone.`, 'Delete all', true)) { A.threads().length = 0; delete A.state.activeThread[A.state.activeId]; A.save(['threads', 'meta']); draw(); toast('History cleared'); } } }, icon('trash', 16), 'Clear all conversations'))));
  root.append(page); void esc;
  return root;
}
