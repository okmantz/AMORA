// AMORA — the chat view: threads, messages, typing indicator, modes, scenarios, suggestions.
import { h, uid, fmtTime, fmtDay, dayKey, download, clamp } from '../core/util.js';
import { icon, toast, modal, confirmBox as cb, promptBox } from './dom.js';
import { avatarEl, paintAvatar } from './avatar.js';
import { portraitSVG } from './portrait.js';
import { MODES, STAGES, stageProgress, effectiveStage, unlocked } from '../engine/relationship.js';
import { SYS } from '../data/system-data.js';

const EMOJIS = ['😊', '😂', '🥰', '😘', '😍', '😉', '🥺', '😭', '😅', '🤔', '😴', '😎', '🙈', '💕', '❤️', '✨', '🌹', '🎉', '👍', '🙏', '☕', '🌙', '🔥', '🤗'];

/** Anchor a popover to an element. Closes on outside click or Escape. */
export function popover(anchor, content, { align = 'left', up = false } = {}) {
  document.querySelectorAll('.popover').forEach((p) => p.remove());
  const pop = h('div', { class: 'popover', role: 'menu' }, content);
  document.body.append(pop);
  const r = anchor.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
  let left = align === 'right' ? r.right - pw : r.left;
  left = clamp(left, 8, window.innerWidth - pw - 8);
  let top = up ? r.top - ph - 8 : r.bottom + 8;
  if (top + ph > window.innerHeight - 8) top = Math.max(8, r.top - ph - 8);
  Object.assign(pop.style, { position: 'fixed', left: left + 'px', top: top + 'px' });
  const off = (e) => { if (!pop.contains(e.target) && !anchor.contains(e.target)) close(); };
  const key = (e) => { if (e.key === 'Escape') close(); };
  const close = () => { pop.remove(); document.removeEventListener('mousedown', off); document.removeEventListener('keydown', key); document.removeEventListener('touchstart', off); };
  setTimeout(() => { document.addEventListener('mousedown', off); document.addEventListener('touchstart', off, { passive: true }); document.addEventListener('keydown', key); }, 0);
  pop.close = close;
  return pop;
}
export const popItem = (em, title, sub, onclick, locked) => h('button', { class: `pop-item${locked ? ' locked' : ''}`, role: 'menuitem', onclick }, h('span', { class: 'em' }, em), h('span', h('b', { style: { fontWeight: 600 } }, title), sub && h('small', sub)), locked && icon('lock', 14));

function fmt(text, html) {
  if (html) { const s = h('span'); s.innerHTML = text; return s; }
  const frag = document.createDocumentFragment();
  String(text).split(/(\*[^*\n]{1,120}\*)/g).forEach((p) => {
    if (/^\*[^*\n]+\*$/.test(p)) frag.append(h('em', { class: 'act' }, p));
    else if (p) frag.append(document.createTextNode(p));
  });
  return frag;
}

/** Render a stored photo recipe as an SVG string using her current look. */
export function photoSVG(persona, ph, uid) {
  return portraitSVG(persona.look, ph.expr || 'happy', { uid, crop: 'full', scene: ph.scene, outfit: ph.outfit, pose: ph.pose });
}
/** Convert an SVG string to a PNG blob (for saving). */
export function svgToPng(svg, w = 900, h = 1200) {
  return new Promise((res, rej) => {
    const src = svg.replace('<svg ', `<svg width="${w}" height="${h}" `);
    const img = new Image();
    img.onload = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.drawImage(img, 0, 0, w, h); c.toBlob((b) => (b ? res(b) : rej(new Error('Could not create image'))), 'image/png'); };
    img.onerror = () => rej(new Error('Could not render image'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src);
  });
}
export function openPhoto(persona, ph, uid) {
  const svg = photoSVG(persona, ph, uid + 'L');
  const wrap = h('div', { class: 'photo-lightbox' }); wrap.innerHTML = svg;
  modal({ title: '', body: wrap, size: 'sm', actions: [
    { label: 'Save image', onClick: async () => { try { const b = await svgToPng(photoSVG(persona, ph, uid + 'S')); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `${persona.name.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast('Saved'); } catch (e) { toast(e.message, 'err'); } return false; } },
    { label: 'Close', kind: 'primary' }] });
}

export function render(A) {
  const persona = () => A.persona;
  let thread = A.thread();
  const root = h('div', { class: 'view chat-view' });

  /* ----------------------- thread list ----------------------- */
  const listEl = h('div', { class: 'thread-list', role: 'list' });
  const tSearch = h('input', { type: 'search', placeholder: 'Search chat titles…', 'aria-label': 'Search chats' });
  tSearch.addEventListener('input', paintThreads);
  function paintThreads() {
    const q = tSearch.value.toLowerCase();
    listEl.innerHTML = '';
    A.threads().filter((t) => !q || t.title.toLowerCase().includes(q)).sort((a, b) => b.updated - a.updated).forEach((t) => {
      listEl.append(h('button', { class: `thread${t.id === thread.id ? ' on' : ''}`, role: 'listitem', onclick: () => { if (t.id !== thread.id) A.switchThread(t.id); else closeDrawer(); } },
        h('b', t.title), h('span', h('span', fmtDay(t.updated)), h('span', `${t.messages.length} msgs`), t.mode !== 'casual' && h('span', MODES[t.mode]?.emoji)),
        h('span', { class: 'icon-btn del', role: 'button', tabindex: 0, 'aria-label': 'Delete chat', onclick: async (e) => { e.stopPropagation(); if (await cb('Delete this conversation? This cannot be undone.', 'Delete', true)) { A.deleteThread(t.id); A.go('chat', true); } } }, icon('trash', 16))));
    });
    if (!listEl.children.length) listEl.append(h('p', { class: 'muted', style: { padding: '12px' } }, 'No conversations found.'));
  }
  const scrim = h('div', { class: 'threads-scrim', onclick: closeDrawer });
  const threadsEl = h('aside', { class: 'threads', 'aria-label': 'Conversations' },
    h('div', { class: 'threads-head' }, h('div', { class: 'row between' }, h('h3', 'Conversations'), h('button', { class: 'icon-btn threads-toggle', 'aria-label': 'Close', onclick: closeDrawer }, icon('x'))),
      h('button', { class: 'btn primary', onclick: newChat }, icon('plus', 16), 'New chat'), tSearch), listEl);
  function openDrawer() { threadsEl.classList.add('open'); scrim.classList.add('on'); }
  function closeDrawer() { threadsEl.classList.remove('open'); scrim.classList.remove('on'); }

  async function newChat() {
    thread = A.newThread(true);
    await A.go('chat', true);
    const r = A.engine.daily(A.ctx());
    r.messages.forEach((m) => { const hm = A.addMessage('her', m.text, { expr: m.expression }); A.chat?.addMessage(hm, true); });
  }

  /* ----------------------- header ----------------------- */
  const headAv = avatarEl(persona(), 'neutral', { size: 46 });
  const nameEl = h('h3', persona().name);
  const statusEl = h('div', { class: 'status' }, 'Online');
  const modeLbl = h('span', { class: 'lbl' });
  const modeBtn = h('button', { class: 'mode-pill', 'aria-haspopup': 'menu', onclick: (e) => modeMenu(e.currentTarget) }, h('span', { class: 'mode-em' }), modeLbl);
  const whoBtn = h('button', { class: 'who', onclick: profile, 'aria-label': `About ${persona().name}` }, headAv, h('div', nameEl, statusEl));
  const head = h('header', { class: 'chat-head' },
    h('button', { class: 'icon-btn threads-toggle', 'aria-label': 'Conversations', onclick: openDrawer }, icon('menu')),
    whoBtn, modeBtn,
    h('button', { class: 'icon-btn', 'aria-label': 'Chat menu', onclick: (e) => chatMenu(e.currentTarget) }, icon('more')));

  function refreshHeader() {
    thread = A.thread();
    const M = MODES[thread.mode] || MODES.casual;
    modeBtn.querySelector('.mode-em').textContent = M.emoji; modeLbl.textContent = M.label;
    const mood = thread.conv?.mood || 0;
    statusEl.textContent = mood > 0.35 ? 'Online · feeling happy' : mood < -0.35 ? 'Online · feeling for you' : 'Online';
    nameEl.textContent = persona().name;
    paintThreads();
  }

  function modeMenu(anchor) {
    const stage = A.stage();
    const pop = popover(anchor, h('div', Object.entries(MODES).map(([k, M]) => {
      const lock = !unlocked(M.minStage, A.rel, A.settings);
      return popItem(M.emoji, M.label + (thread.mode === k ? ' ✓' : ''), lock ? `Unlocks at “${STAGES[M.minStage].name}”` : M.desc, () => { pop.close(); A.setMode(k); }, lock);
    })), { align: 'right' });
    void stage;
  }
  function chatMenu(anchor) {
    const pop = popover(anchor, h('div',
      popItem('✨', 'New chat', 'Start a fresh conversation', () => { pop.close(); newChat(); }),
      popItem('🎭', 'Scenarios', 'Coffee dates, stargazing and more', () => { pop.close(); scenarios(); }),
      popItem('🎲', 'Play a game', 'Would you rather', () => { pop.close(); A.send("Let's play would you rather"); }),
      popItem('💬', 'Conversation starter', 'Ask me something', () => { pop.close(); A.send('Ask me something'); }),
      popItem('⬇️', 'Export this chat', 'Text file', () => { pop.close(); exportThread(); }),
      popItem('🧹', 'Clear this chat', 'Remove all messages here', async () => { pop.close(); if (await cb('Clear every message in this conversation?', 'Clear', true)) { thread.messages = []; thread.conv = {}; A.save('threads'); A.go('chat', true); } })), { align: 'right' });
  }
  function exportThread() {
    const txt = thread.messages.filter((m) => m.role !== 'sys').map((m) => `[${new Date(m.ts).toLocaleString()}] ${m.role === 'user' ? (A.mem.facts.name?.v || 'You') : persona().name}: ${m.text}`).join('\n');
    download(`amora-chat-${dayKey()}.txt`, txt || '(empty)', 'text/plain');
  }
  function scenarios() {
    const list = A.engine.allScenarios(persona());
    const body = h('div', list.map((s) => {
      const lock = !unlocked(s.minStage || 0, A.rel, A.settings);
      return h('button', { class: 'item', style: { border: 0, width: '100%', textAlign: 'left', opacity: lock ? .55 : 1 }, onclick: () => { m.close(); A.startScenario(s.id); } }, h('span', { style: { fontSize: '1.6rem' } }, s.emoji || '✨'), h('span', { class: 't' }, h('b', s.title), h('small', lock ? `Unlocks at “${STAGES[s.minStage].name}”` : s.desc)), lock ? icon('lock', 16) : icon('play', 16));
    }));
    const m = modal({ title: 'Scenarios', body: h('div', h('p', { class: 'muted' }, 'Short guided scenes. Say “stop” any time to end one. You can write your own in the Dialogue tab.'), body), size: 'md' });
  }
  function profile() {
    const p = persona(), rel = A.rel, sp = stageProgress(rel);
    const big = avatarEl(p, 'happy', { size: 150, cls: 'big' });
    const body = h('div', { style: { textAlign: 'center' } }, big, h('h3', { style: { fontSize: '1.8rem', marginTop: '10px' } }, `${p.name}, ${p.age}`),
      h('p', { class: 'muted' }, p.bio || 'A customizable companion.'),
      h('div', { class: 'row', style: { justifyContent: 'center', margin: '10px 0' } }, h('span', { class: 'badge' }, STAGES[effectiveStage(rel, A.settings)].name), h('span', { class: 'badge' }, `${rel.days} day${rel.days === 1 ? '' : 's'} together`), rel.streak > 1 && h('span', { class: 'badge' }, `🔥 ${rel.streak}-day streak`)),
      h('div', { class: 'bar', title: 'Progress to next stage' }, h('i', { style: { width: sp.pct + '%' } })),
      h('p', { class: 'muted', style: { fontSize: '.8rem' } }, sp.next ? `${sp.pct}% towards “${sp.next.name}”` : 'Deepest stage reached'));
    modal({ title: '', body, size: 'sm', actions: [{ label: 'Customize her', onClick: () => A.go('her') }, { label: 'Close', kind: 'primary' }] });
  }

  /* ----------------------- messages ----------------------- */
  const msgsEl = h('div', { class: 'messages', role: 'log', 'aria-live': 'polite', 'aria-label': 'Conversation' });
  const typingRow = h('div', { class: 'msg her typing-row', 'aria-hidden': 'true' }, avatarEl(persona(), 'think', { size: 34 }), h('div', { class: 'bubble' }, h('span', { class: 'dots' }, h('i'), h('i'), h('i'))));
  let lastDay = '', lastRole = null, lastTs = 0, exprTimer;

  function setExpr(expr) {
    paintAvatar(headAv, persona(), expr || 'neutral');
    clearTimeout(exprTimer);
    if (expr && expr !== 'neutral') exprTimer = setTimeout(() => paintAvatar(headAv, persona(), 'neutral'), 7000);
  }
  function setTyping(on, expr) {
    typingRow.classList.toggle('on', on);
    statusEl.classList.toggle('typing', on);
    if (on) { statusEl.textContent = 'typing…'; msgsEl.append(typingRow); paintAvatar(typingRow.querySelector('.avatar'), persona(), 'think'); scrollEnd(); setExpr('think'); }
    else if (statusEl.classList.contains('typing') || statusEl.textContent === 'typing…') { statusEl.classList.remove('typing'); refreshHeader(); }
  }
  function scrollEnd(smooth = true) { requestAnimationFrame(() => msgsEl.scrollTo({ top: msgsEl.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })); }

  function photoBubble(m) {
    const box = h('button', { type: 'button', class: `photo-card tier${m.photo.tier || 0}`, 'aria-label': 'Open photo', onclick: () => openPhoto(persona(), m.photo, m.id) });
    box.innerHTML = photoSVG(persona(), m.photo, 'p' + m.id);
    return box;
  }
  function addMessage(m, fromHer) {
    emptyEl.classList.add('hidden');
    const dk = dayKey(new Date(m.ts));
    if (dk !== lastDay) { msgsEl.insertBefore(h('div', { class: 'day-sep' }, fmtDay(m.ts)), typingRow.parentNode === msgsEl ? typingRow : null); lastDay = dk; lastRole = null; }
    let el;
    if (m.role === 'sys') {
      el = h('div', { class: `sys ${m.kind || ''}`, role: 'status' }, fmt(m.text, m.html));
      lastRole = null;
    } else {
      const cont = lastRole === m.role && m.ts - lastTs < 120000;
      const tools = h('div', { class: 'msg-tools' },
        h('button', { class: 'icon-btn', 'aria-label': 'Copy message', onclick: () => { navigator.clipboard?.writeText(m.text).then(() => toast('Copied')); } }, icon('copy', 14)),
        h('button', { class: 'icon-btn', 'aria-label': 'Delete message', onclick: () => { const i = thread.messages.findIndex((x) => x.id === m.id); if (i >= 0) { thread.messages.splice(i, 1); A.save('threads'); el.remove(); } } }, icon('trash', 14)));
      el = h('div', { class: `msg ${m.role}${cont ? ' cont' : ''}`, 'data-id': m.id },
        m.role === 'her' && avatarEl(persona(), m.expr || 'neutral', { size: 34 }),
        h('div', { class: 'bwrap' }, m.photo ? photoBubble(m) : h('div', { class: 'bubble' }, fmt(m.text), m.source && h('a', { class: 'src', href: m.source.url, target: '_blank', rel: 'noopener noreferrer' }, m.source.kind === 'dict' ? 'Wiktionary' : 'Wikipedia')), A.settings.chat.showTimestamps && h('div', { class: 'meta' }, fmtTime(m.ts), m.kind === 'daily' && ' · daily message')),
        tools);
      lastRole = m.role; lastTs = m.ts;
      if (m.role === 'her') setExpr(m.expr);
    }
    msgsEl.insertBefore(el, typingRow.parentNode === msgsEl ? typingRow : null);
    scrollEnd(fromHer !== undefined);
    return el;
  }

  const emptyEl = h('div', { class: 'sys', style: { margin: 'auto' } }, h('div', { style: { display: 'grid', placeItems: 'center', gap: '8px' } }, avatarEl(persona(), 'happy', { size: 96, cls: 'big' }), h('h3', `Say hi to ${persona().name}`), h('p', { class: 'muted', style: { margin: 0 } }, 'Type a message below, or pick a suggestion.')));
  msgsEl.append(emptyEl, typingRow);
  thread.messages.forEach((m) => addMessage(m));
  emptyEl.classList.toggle('hidden', thread.messages.length > 0);
  setTimeout(() => scrollEnd(false), 30);

  /* ----------------------- composer ----------------------- */
  const sugEl = h('div', { class: 'suggest', 'aria-label': 'Conversation starters' });
  function refreshSuggestions() {
    sugEl.innerHTML = '';
    if (!A.settings.chat.suggestions) return;
    A.engine.suggestions(A.ctx()).forEach((s) => sugEl.append(h('button', { onclick: () => A.send(s) }, s)));
  }
  const ta = h('textarea', { rows: 1, placeholder: `Message ${persona().name}…`, 'aria-label': 'Message', maxlength: 2000 });
  const sendBtn = h('button', { class: 'send', 'aria-label': 'Send', disabled: true, onclick: submit }, icon('send', 20));
  function submit() { const v = ta.value.trim(); if (!v) return; ta.value = ''; grow(); sendBtn.disabled = true; A.send(v); ta.focus(); }
  function grow() { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'; }
  ta.addEventListener('input', () => { grow(); sendBtn.disabled = !ta.value.trim(); });
  ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && A.settings.chat.enterToSend) { e.preventDefault(); submit(); } });
  const plus = h('button', { class: 'icon-btn', 'aria-label': 'More actions', onclick: (e) => toolsMenu(e.currentTarget) }, icon('plus'));
  function toolsMenu(anchor) {
    const pop = popover(anchor, h('div',
      popItem('🎭', 'Scenarios', 'Guided scenes', () => { pop.close(); scenarios(); }),
      popItem('🎲', 'Would you rather', 'A quick game', () => { pop.close(); A.send("Let's play would you rather"); }),
      popItem('😄', 'Tell me a joke', '', () => { pop.close(); A.send('Tell me a joke'); }),
      popItem('💬', 'Conversation starter', '', () => { pop.close(); A.send('Ask me something'); }),
      popItem('🌗', 'Change mode', MODES[thread.mode]?.label, () => { pop.close(); modeMenu(modeBtn); })), { up: true });
  }
  const emo = h('button', { class: 'icon-btn', 'aria-label': 'Emoji', onclick: (e) => { const pop = popover(e.currentTarget, h('div', { class: 'emoji-grid' }, EMOJIS.map((x) => h('button', { type: 'button', onclick: () => { ta.value += x; ta.dispatchEvent(new Event('input')); ta.focus(); } }, x))), { up: true }); void pop; } }, icon('smile'));
  const cam = h('button', { class: 'icon-btn', 'aria-label': 'Ask for a photo', title: 'Ask for a photo', onclick: (e) => cameraMenu(e.currentTarget) }, icon('camera'));
  function cameraMenu(anchor) {
    const lvl = A.contentLevel();
    const item = (em, title, sub, ask, need = 0) => popItem(em, title, need > lvl ? (A.settings.content.level >= need ? 'Unlocks as you grow closer' : 'Turn up Content level in Settings') : sub, () => { pop.close(); if (need > lvl) { toast(A.settings.content.level >= need ? 'You two need a little more time together for that one.' : 'That one is switched off — see Settings → Content & abilities.'); return; } A.send(ask); }, need > lvl);
    const pop = popover(anchor, h('div',
      item('🤳', 'Selfie', 'What she looks like right now', 'Send me a selfie'),
      item('☕', 'At a café', 'Cozy daytime photo', 'Send me a pic at a cafe'),
      item('🌿', 'In the garden', 'Sunlit and relaxed', 'Send me a pic in the garden'),
      item('💪', 'Gym selfie', 'Post-workout glow', 'Send me a gym selfie'),
      item('🌃', 'Dressed up', 'Out on the town', 'Send me a pic in a dress at night', 1),
      item('🛏️', 'Cozy in bed', 'Silky and sleepy', 'Send me a pic in a slip in bed', 1),
      item('👙', 'Beach', 'Swimsuit photo', 'Send me a pic in a bikini at the beach', 2),
      item('🖤', 'Boudoir', 'Lingerie, always covered', 'Send me a sexy pic in lingerie', 2),
      item('🎲', 'Surprise me', 'Her choice', 'Send me a surprise pic')), { up: true });
  }
  const compose = h('div', { class: 'compose' }, sugEl, h('div', { class: 'composer' }, plus, cam, emo, ta, sendBtn));

  const col = h('section', { class: 'chat-col' }, h('div', { class: 'chat-bg' }), h('div', { class: 'chat-dim' }), head, msgsEl, compose);
  root.append(h('div', { class: 'chat' }, scrim, threadsEl, col));

  paintThreads(); refreshHeader(); refreshSuggestions();
  A.chat = { addMessage, setTyping, refreshHeader, refreshSuggestions, setExpr };
  const off = A.bus.on('persona-edit', () => { nameEl.textContent = persona().name; paintAvatar(headAv, persona(), 'neutral'); ta.placeholder = `Message ${persona().name}…`; });
  void off; void uid; void promptBox;
  setTimeout(() => { A.maybeDaily(); if (matchMedia('(min-width: 821px)').matches) ta.focus(); }, 200);
  return root;
}
