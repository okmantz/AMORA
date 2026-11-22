// AMORA — application core: state, persistence, theming, navigation and the send/reply pipeline.
import { loadPortraits } from './ui/photoreal.js';
import { h, $, uid, debounce, bus, dayKey, deepClone, clamp, sleep } from './core/util.js';
import { Auth } from './core/auth.js';
import { lookup } from './core/lookup.js';
import { Store, defaultSettings, mergeDefaults, defaultMemory, trimThreads, onStorageError } from './core/store.js';
import { Engine } from './engine/engine.js';
import { defaultRel, applyEffects, checkMilestones, effectiveStage, MODES, unlocked, STAGES } from './engine/relationship.js';
import { PRESETS, fromPreset, normalizePersona, blankPersona } from './data/presets.js';
import { SYS } from './data/system-data.js';
import { shade } from './ui/avatar.js';
import { icon, toast, modal } from './ui/dom.js';

const VIEWS = {
  chat: () => import('./ui/chat.js'),
  her: () => import('./ui/her.js'),
  dialogue: () => import('./ui/dialogue.js'),
  memory: () => import('./ui/memory.js'),
  journal: () => import('./ui/journal.js'),
  history: () => import('./ui/history.js'),
  settings: () => import('./ui/settings.js'),
};
export const NAV = [['chat', 'Chat', 'chat'], ['her', 'Her', 'sparkle'], ['dialogue', 'Dialogue', 'quote'], ['memory', 'Us', 'heart'], ['journal', 'Journal', 'feather'], ['history', 'History', 'search'], ['settings', 'Settings', 'settings']];
const TAB_PRIMARY = ['chat', 'her', 'dialogue', 'memory', 'more'];

export const A = {
  engine: new Engine(),
  bus: bus(),
  state: null,
  view: 'chat',
  chat: null,            // chat view bindings when mounted
  unread: false,
  _queue: Promise.resolve(),
  installPrompt: null,

  /* ----------------------------- persistence ----------------------------- */
  load() {
    const S = {};
    S.settings = mergeDefaults(Store.get('settings', {}), defaultSettings());
    S.personas = (Store.get('personas', []) || []).map(normalizePersona);
    S.activeId = Store.get('activeId', null);
    S.rel = Store.get('rel', {}) || {};
    S.mem = mergeDefaults(Store.get('mem', {}), defaultMemory());
    S.threads = {};            // lazy per-persona
    S.activeThread = Store.get('activeThread', {}) || {};
    S.journal = Store.get('journal', []) || [];
    S.notes = Store.get('notes', []) || [];
    S.lastDaily = Store.get('lastDaily', {}) || {};
    this.state = S;
    if (S.personas.length && !S.personas.find((p) => p.id === S.activeId)) S.activeId = S.personas[0].id;
    for (const p of S.personas) { S.rel[p.id] = Object.assign(defaultRel(), S.rel[p.id] || {}); }
  },
  _savers: {},
  save(what = 'all') {
    const keys = what === 'all' ? ['settings', 'personas', 'rel', 'mem', 'journal', 'notes', 'meta', 'threads'] : [].concat(what);
    for (const k of keys) (this._savers[k] ||= debounce(() => this._write(k), 350))();
  },
  flush() { Object.values(this._savers).forEach((d) => d.flush && d.flush()); },
  _write(k) {
    const S = this.state;
    if (!S) return;
    let ok = true;
    switch (k) {
      case 'settings': ok = Store.set('settings', S.settings); break;
      case 'personas': ok = Store.set('personas', S.personas); break;
      case 'rel': ok = Store.set('rel', S.rel); break;
      case 'mem': ok = Store.set('mem', S.mem); break;
      case 'journal': ok = Store.set('journal', S.journal); break;
      case 'notes': ok = Store.set('notes', S.notes); break;
      case 'meta': ok = Store.set('activeId', S.activeId) && Store.set('activeThread', S.activeThread) && Store.set('lastDaily', S.lastDaily); break;
      case 'threads': for (const [pid, list] of Object.entries(S.threads)) { if (!Store.set('threads.' + pid, list)) { trimThreads(list, 800); ok = Store.set('threads.' + pid, list); } } break;
      default: break;
    }
    if (!ok) toast('Storage is full — export a backup and clear old chats in History.', 'err');
  },

  /* ------------------------------- getters ------------------------------- */
  get settings() { return this.state.settings; },
  get persona() { return this.state.personas.find((p) => p.id === this.state.activeId); },
  get rel() { return this.state.rel[this.state.activeId]; },
  get mem() { return this.state.mem; },
  stage() { return effectiveStage(this.rel, this.settings); },
  threads(pid = this.state.activeId) { return (this.state.threads[pid] ||= Store.get('threads.' + pid, []) || []); },
  thread() {
    const list = this.threads();
    let t = list.find((x) => x.id === this.state.activeThread[this.state.activeId]);
    if (!t) t = list[0] || this.newThread(true);
    return t;
  },
  ctx(extra = {}) { const t = this.thread(); return { persona: this.persona, mem: this.mem, rel: this.rel, conv: t.conv, settings: this.settings, mode: t.mode, now: new Date(), ...extra }; },

  /* ------------------------------- threads ------------------------------- */
  newThread(quiet = false) {
    const t = { id: uid('t'), title: 'New chat', created: Date.now(), updated: Date.now(), mode: 'casual', conv: {}, messages: [] };
    this.threads().unshift(t);
    this.state.activeThread[this.state.activeId] = t.id;
    this.save(['threads', 'meta']);
    if (!quiet) this.bus.emit('threads');
    return t;
  },
  switchThread(id) { this.state.activeThread[this.state.activeId] = id; this.save('meta'); this.go('chat', true); },
  deleteThread(id) {
    const list = this.threads(); const i = list.findIndex((t) => t.id === id);
    if (i >= 0) list.splice(i, 1);
    if (this.state.activeThread[this.state.activeId] === id) delete this.state.activeThread[this.state.activeId];
    this.save(['threads', 'meta']);
  },
  /** The content level actually in effect: Settings → Content level, capped by relationship stage when gating is on. */
  contentLevel() {
    const lvl = clamp(this.settings.content?.level ?? 1, 0, 3);
    if (this.settings.relationship?.gating === false) return lvl;
    return Math.min(lvl, [0, 1, 1, 2, 3, 3][effectiveStage(this.rel, this.settings)]);
  },

  addMessage(role, text, extra = {}) {
    const t = this.thread();
    const m = { id: uid('m'), role, text, ts: Date.now(), ...extra };
    t.messages.push(m); t.updated = Date.now();
    this.save('threads');
    return m;
  },

  /* ------------------------------ companions ------------------------------ */
  addPersona(p, activate = true) {
    p = normalizePersona(p);
    if (this.state.personas.some((x) => x.id === p.id)) p.id = uid('p');
    this.state.personas.push(p);
    this.state.rel[p.id] = defaultRel();
    if (activate) { this.state.activeId = p.id; }
    this.save(['personas', 'rel', 'meta']);
    return p;
  },
  switchPersona(id) { this.state.activeId = id; this.save('meta'); this.applyTheme(); this.go(this.view, true); this.bus.emit('persona'); },
  deletePersona(id) {
    const S = this.state;
    if (S.personas.length <= 1) return false;
    S.personas = S.personas.filter((p) => p.id !== id);
    delete S.rel[id]; delete S.threads[id]; Store.remove('threads.' + id);
    if (S.activeId === id) S.activeId = S.personas[0].id;
    this.save(['personas', 'rel', 'meta']);
    return true;
  },
  touchPersona() { this.save('personas'); this.bus.emit('persona-edit'); },

  /* ------------------------------- send flow ------------------------------- */
  send(text) {
    text = String(text || '').trim();
    if (!text) return;
    const t = this.thread();
    const um = this.addMessage('user', text);
    if (t.title === 'New chat') t.title = text.length > 44 ? text.slice(0, 42) + '…' : text;
    this.chat?.addMessage(um);
    this.bus.emit('threads');
    this._queue = this._queue.then(() => this._reply(text, t)).catch((e) => { console.error(e); this.chat?.setTyping(false); toast('Something went wrong — but your message is saved.', 'err'); });
  },

  async _reply(text, thread) {
    const ctx = { ...this.ctx(), conv: thread.conv, mode: thread.mode };
    const r = this.engine.respond(text, ctx);
    const fx = r.fx;
    // relationship progress
    const notes = [];
    if (!fx.noPoints) {
      const before = effectiveStage(this.rel, this.settings);
      const out = applyEffects(this.rel, fx, this.settings);
      if (fx.scenarioDone) this.rel.scenarios = (this.rel.scenarios || 0) + 1;
      const fresh = checkMilestones(this.rel, this.mem, this.settings, { journal: this.state.journal.length, scenarios: this.rel.scenarios || 0 });
      if (out.stageUp) notes.push({ kind: 'stage', text: `<b>${STAGES[out.stage].name}</b> — your relationship has deepened. New lines and modes may have unlocked.` });
      for (const m of fresh) if (SYS.milestone[m.id] && !(m.id === 'friends' || m.id === 'close' || m.id === 'sweet' || m.id === 'devoted') ) notes.push({ kind: 'milestone', text: `<b>${m.label}</b> — ${SYS.milestone[m.id]}` });
      void before;
    }
    this.save(['rel', 'mem', 'threads']);
    // display with typing delays
    const quick = this.settings.chat.typingSpeed === 0;
    for (let i = 0; i < r.messages.length; i++) {
      const m = r.messages[i];
      if (!quick && this.settings.chat.showTyping) { this.chat?.setTyping(true, 'think'); await sleep(m.delay); }
      else if (!quick) await sleep(Math.min(600, m.delay));
      this.chat?.setTyping(false);
      const hm = this.addMessage('her', m.text, { expr: m.expression });
      this.chat?.addMessage(hm, true);
      if (!this.chat) { this.unread = true; this.bus.emit('unread'); }
      if (i < r.messages.length - 1) await sleep(quick ? 0 : 350);
    }
    // a photo of herself (rendered from her current look when shown; only the recipe is stored)
    if (fx.photo) {
      if (!quick && this.settings.chat.showTyping) { this.chat?.setTyping(true, 'think'); await sleep(900); }
      this.chat?.setTyping(false);
      const pm = this.addMessage('her', '📷 Photo', { photo: fx.photo, expr: fx.photo.expr });
      this.chat?.addMessage(pm, true);
      if (!this.chat) { this.unread = true; this.bus.emit('unread'); }
      if (fx.photoAfter) { await sleep(quick ? 0 : 700); const am = this.addMessage('her', fx.photoAfter, { expr: fx.photo.tier >= 1 ? 'sultry' : 'happy' }); this.chat?.addMessage(am, true); }
    }
    // optional knowledge lookup (opt-in)
    if (fx.lookup && this.settings.lookup?.enabled) {
      this.chat?.setTyping(true, 'think');
      let res = null; try { res = await lookup(fx.lookup); } catch { res = null; }
      this.chat?.setTyping(false);
      const intro = res ? (res.kind === 'dict' ? res.text : `${res.text}`) : `I couldn't find anything solid on “${fx.lookup.subject}” — want to tell me what you know instead?`;
      const lm = this.addMessage('her', intro, { expr: res ? 'happy' : 'think', ...(res ? { source: { title: res.title, url: res.url, kind: res.kind } } : {}) });
      this.chat?.addMessage(lm, true);
    }
    for (const n of notes) { const sm = this.addMessage('sys', n.text, { kind: n.kind, html: true }); this.chat?.addMessage(sm); }
    if (fx.scenarioDone) { const sm = this.addMessage('sys', `Scenario complete. ${SYS.scenarioEnd[0]}`, { kind: 'info' }); this.chat?.addMessage(sm); }
    this.chat?.refreshHeader();
    this.chat?.refreshSuggestions();
    this.bus.emit('rel');
  },

  /* ---------------------------- modes & scenarios ---------------------------- */
  setMode(mode) {
    const M = MODES[mode]; if (!M) return;
    if (!unlocked(M.minStage, this.rel, this.settings)) { toast(SYS.modeLock[0]); return; }
    const t = this.thread(); t.mode = mode;
    const sm = this.addMessage('sys', `Mode: <b>${M.emoji} ${M.label}</b>`, { kind: 'info', html: true });
    this.chat?.addMessage(sm);
    const r = this.engine.modeIntro({ ...this.ctx(), mode }, mode);
    r.messages.forEach((m) => { const hm = this.addMessage('her', m.text, { expr: m.expression }); this.chat?.addMessage(hm, true); });
    this.save('threads'); this.chat?.refreshHeader(); this.chat?.refreshSuggestions();
  },
  startScenario(id) {
    const scen = this.engine.allScenarios(this.persona).find((s) => s.id === id); if (!scen) return;
    if (!unlocked(scen.minStage || 0, this.rel, this.settings)) { toast(`“${scen.title}” unlocks at a closer relationship stage.`); return; }
    if (this.view !== 'chat') this.go('chat');
    const r = this.engine.startScenario(this.ctx(), scen);
    const sm = this.addMessage('sys', `${scen.emoji || '✨'} Scenario: <b>${scen.title}</b> — type <i>stop</i> to end it.`, { kind: 'info', html: true });
    this.chat?.addMessage(sm);
    r.messages.forEach((m) => { const hm = this.addMessage('her', m.text, { expr: m.expression }); this.chat?.addMessage(hm, true); });
    this.save('threads');
  },

  /** Run the engine on throw-away copies of state (used by the previews and the rule tester). */
  preview(text, { persona, mode, stage, conv, keepConv } = {}) {
    const p = persona || this.persona;
    const rel = deepClone(this.rel); if (stage != null) { rel.manualStage = stage; rel.status = 'custom'; }
    const settings = deepClone(this.settings); if (stage != null) { settings.relationship.progression = 'manual'; settings.relationship.gating = true; }
    settings.chat.typingSpeed = 0;
    const c = { persona: p, mem: deepClone(this.mem), rel, conv: conv || {}, settings, mode: mode || 'casual', now: new Date() };
    const r = this.engine.respond(text, c);
    return { ...r, conv: c.conv };
  },

  /* ---------------------------- daily message ---------------------------- */
  maybeDaily() {
    if (!this.settings.chat.dailyMessage) return;
    const pid = this.state.activeId, today = dayKey();
    if (this.state.lastDaily[pid] === today) return;
    this.state.lastDaily[pid] = today; this.save('meta');
    const t = this.thread();
    if (t.messages.length === 0) return; // brand-new chat gets a greeting instead
    const r = this.engine.daily(this.ctx());
    setTimeout(() => {
      r.messages.forEach((m) => { const hm = this.addMessage('her', m.text, { expr: m.expression, kind: 'daily' }); this.chat?.addMessage(hm, true); });
    }, 900);
  },

  introMessages(userName) {
    const p = this.persona;
    const name = userName ? userName : '';
    const lines = [
      `Hi${name ? ' ' + name : ''}! I'm ${p.name}. It's really nice to meet you.`,
      `One honest note: I'm a fictional, rule-based character — no AI, no internet. I'll remember what you tell me on this device, and you can change almost everything about me. What's on your mind?`,
    ];
    lines.forEach((l) => { if (p.style.lowercase) l = l.toLowerCase(); const m = this.addMessage('her', l, { expr: 'happy' }); this.chat?.addMessage(m, true); });
  },

  /* -------------------------------- theming -------------------------------- */
  applyTheme() {
    const s = this.settings, root = document.documentElement;
    const dark = s.theme === 'dark' || (s.theme === 'auto' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
    root.dataset.theme = dark ? 'dark' : 'light';
    root.dataset.font = s.font; root.dataset.bubble = s.bubbleStyle; root.dataset.pattern = s.bg.pattern || 'none';
    root.style.setProperty('--fs', `${(16 * s.fontScale) / 100}px`);
    const ac = /^#[0-9a-f]{6}$/i.test(s.accent) ? s.accent : '#c2577a';
    const n = parseInt(ac.slice(1), 16);
    root.style.setProperty('--accent', ac);
    root.style.setProperty('--accent-rgb', `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`);
    root.style.setProperty('--accent-dark', shade(ac, -22)); root.style.setProperty('--accent-light', shade(ac, 30));
    const bg = s.bg;
    root.style.setProperty('--chat-bg', `var(--bg-${(bg.preset || 'rose-dusk')})`);
    root.style.setProperty('--chat-bg-img', bg.kind === 'image' && bg.image ? `url("${bg.image}")` : 'none');
    root.style.setProperty('--bg-blur', `${bg.blur || 0}px`); root.style.setProperty('--bg-dim', String((bg.dim ?? 20) / 100));
    root.classList.toggle('reduce-motion', !!s.chat.reducedMotion);
    $('meta[name=theme-color]')?.setAttribute('content', dark ? '#130f14' : '#fbf5f3');
  },

  /* ------------------------------ navigation ------------------------------ */
  async go(view, force = false) {
    if (!VIEWS[view]) view = 'chat';
    if (view === this.view && !force && $('#view-host').firstChild) return;
    this.view = view;
    this.chat = null;
    const host = $('#view-host');
    document.querySelectorAll('.popover').forEach((p) => p.remove());
    host.innerHTML = '';
    try {
      const mod = await VIEWS[view]();
      const el = await mod.render(this);
      host.append(el);
      if (view === 'chat') { this.unread = false; }
    } catch (e) {
      console.error(e);
      host.append(h('div', { class: 'view' }, h('div', { class: 'card' }, h('h3', 'Something went wrong'), h('p', { class: 'muted' }, String(e.message || e)), h('button', { class: 'btn', onclick: () => location.reload() }, 'Reload'))));
    }
    this.paintNav();
    try { history.replaceState(null, '', '#' + view); } catch { /* ignore */ }
  },
  paintNav() {
    document.querySelectorAll('[data-nav]').forEach((b) => {
      const v = b.dataset.nav;
      const on = v === this.view || (v === 'more' && ['journal', 'history', 'settings'].includes(this.view));
      b.classList.toggle('on', on);
      b.setAttribute('aria-current', on ? 'page' : 'false');
      const dot = b.querySelector('.dot'); if (dot) dot.classList.toggle('hidden', !(v === 'chat' && this.unread));
    });
  },

  /* -------------------------------- shell -------------------------------- */
  mountShell() {
    const app = $('#app');
    app.innerHTML = '';
    const navBtn = ([v, l, ic], mini) => h('button', { class: 'nav-btn', 'data-nav': v, onclick: () => (v === 'more' ? this.moreMenu() : this.go(v)), 'aria-label': l }, icon(ic, 22), h('span', l), v === 'chat' && h('i', { class: 'dot hidden' }));
    const rail = h('nav', { class: 'rail', 'aria-label': 'Main' }, h('div', { class: 'logo' }, 'AMORA'), NAV.map((n) => navBtn(n)), h('div', { class: 'spacer' }),
      h('button', { class: 'nav-btn', onclick: () => this.toggleTheme(), 'aria-label': 'Toggle theme' }, icon('moon', 22), h('span', 'Theme')),
      h('button', { class: 'nav-btn', onclick: () => this.logout(), 'aria-label': 'Sign out', title: `Signed in as ${Auth.current?.username || ''}` }, icon('lock', 22), h('span', 'Sign out')));
    const main = h('main', { class: 'main', id: 'view-host' });
    const tabbar = h('nav', { class: 'tabbar', 'aria-label': 'Main' }, TAB_PRIMARY.map((id) => {
      const n = NAV.find((x) => x[0] === id) || ['more', 'More', 'more'];
      return navBtn([n[0], n[1], n[2]]);
    }));
    app.append(rail, main, tabbar);
  },
  moreMenu() {
    const body = h('div', { class: 'grid' }, ['journal', 'history', 'settings'].map((v) => { const n = NAV.find((x) => x[0] === v); return h('button', { class: 'item', style: { border: 0, width: '100%', textAlign: 'left' }, onclick: () => { m.close(); this.go(v); } }, icon(n[2], 22), h('span', { class: 't' }, h('b', n[1])), icon('chevron', 16)); }));
    const m = modal({ title: 'More', body, size: 'sm' });
  },
  logout() { this.flush(); Auth.logout(); location.hash = ''; location.reload(); },
  toggleTheme() {
    const dark = document.documentElement.dataset.theme === 'dark';
    this.settings.theme = dark ? 'light' : 'dark';
    this.applyTheme(); this.save('settings'); this.bus.emit('theme');
  },
};

/** Called once from index.html */
export async function boot() {
  try {
    if (!Store.available()) toast('Local storage is unavailable — nothing will be saved this session.', 'err');
    onStorageError(() => { /* surfaced in _write */ });
    hideSplash();
    let entry = Auth.resume() ? { created: false } : null;
    if (!entry) { const { authScreen } = await import('./ui/auth.js'); entry = await authScreen(); }
    A.load();
    if (entry.created && !entry.adopted) { A.settings.ageConfirmed = true; const d = Auth.current.display; if (d && d !== Auth.current.username) A.settings.userName = d; A.save('settings'); }
    if (entry.created && entry.adopted) { A.settings.ageConfirmed = true; A.save('settings'); }
    await loadPortraits(); // real-photo avatar library (falls back gracefully if missing)
    A.applyTheme();
    window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => A.settings.theme === 'auto' && A.applyTheme());
    A.mountShell();
    hideSplash();
    if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => {});

    if (!A.state.personas.length || !A.settings.onboarded) {
      const { onboarding } = await import('./ui/onboarding.js');
      await onboarding(A);
    }
    A.applyTheme();
    const start = (location.hash || '').replace('#', '');
    await A.go(VIEWS[start] ? start : 'chat', true);
    window.addEventListener('beforeunload', () => A.flush());
    document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && A.flush());
    A.bus.on('unread', () => A.paintNav());
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); A.installPrompt = e; A.bus.emit('install'); });
    window.__AMORA = A;
  } catch (e) {
    console.error(e);
    document.body.append(h('div', { style: { padding: '24px', fontFamily: 'sans-serif' } }, h('h2', 'AMORA could not start'), h('p', String(e && e.message || e)), h('button', { onclick: () => { try { localStorage.clear(); } catch {} location.reload(); } }, 'Reset local data & reload')));
  } finally {
    hideSplash();
  }
}
function hideSplash() { const sp = $('#splash'); if (sp) { sp.classList.add('out'); setTimeout(() => sp.remove(), 600); } }
