// AMORA — Discreet mode. Makes the app look and behave like an ordinary utility so a glance over your shoulder reveals nothing.
//
//  • Disguise  — tab title, favicon, install name/icon, splash and sign-in screen show a neutral app (Notes, Calculator, Tasks, Reading list).
//  • Plain look — neutral colours, initials instead of her photo, no emoji, no mode/mood labels, neutral menu names and chat titles.
//  • Privacy   — messages blur until tapped, photos stay veiled until tapped, and the URL hash never names a screen.
//  • Quick hide — Esc twice, the eye button in the chat header, switching apps/tabs, or idling swaps the whole app for a working decoy
//                 (calculator / notepad / checklist). Five quick taps on the decoy's title (or PIN + "=" on the calculator) bring you back.
//
// Honest limits: this hides the screen from onlookers. It does not encrypt browser storage, and an installed app's home-screen name
// and icon are fixed by the browser when you install it (install while Discreet mode is on to get the disguise).
import { h } from './util.js';
import { Store } from './store.js';

export const DISGUISES = {
  notes:  { name: 'Notes',        color: '#f2b632', kind: 'notepad',   desc: 'A notes app' },
  calc:   { name: 'Calculator',   color: '#2d2f36', kind: 'calc',      desc: 'A calculator' },
  tasks:  { name: 'Tasks',        color: '#2f7de1', kind: 'checklist', desc: 'A to-do list' },
  reader: { name: 'Reading list', color: '#3f9b6b', kind: 'checklist', desc: 'A reading list' },
};
export const NEUTRAL_NAV = { chat: 'Messages', her: 'Profile', dialogue: 'Replies', memory: 'Overview', journal: 'Notes', history: 'Archive', settings: 'Settings', more: 'More' };

export const defaultDiscreet = () => ({
  enabled: false, disguise: 'notes', alias: '',
  plain: true,          // neutral colours + initials instead of her photo
  blur: true,           // blur message text until tapped / hovered
  hidePhotos: true,     // photos stay veiled until tapped
  plainText: true,      // no emoji in her replies
  neutralLabels: true,  // neutral menu names, chat titles and URL hash
  autoCover: true,      // cover the app when the tab / app goes to the background
  idleMin: 5,           // cover after N idle minutes (0 = never)
  quickButton: true,    // eye button in the chat header
  escHide: true,        // press Esc twice to hide
  panicSignOut: false,  // hiding also signs out (password needed to return)
  pin: null,            // { salt, hash } — optional code needed to leave the decoy
});

let APP = null;          // the app object (set by init)
let covered = false;
let coverEl = null;
let idleTimer = null, lastActive = Date.now(), installed = false, lastEsc = 0;

/* ------------------------------ state ------------------------------ */
const cfg = () => (APP?.state?.settings?.discreet) || null;
const globalFlag = () => Store.getGlobal('discreet', null);
export const Discreet = {
  /** Is Discreet mode on? Before sign-in only the global flag is known. */
  on() { const c = cfg(); return c ? !!c.enabled : !!globalFlag()?.on; },
  opt(k) { const c = cfg(); return !!(c && c.enabled && c[k]); },
  disguiseKey() { const c = cfg(); const k = c ? c.disguise : globalFlag()?.disguise; return DISGUISES[k] ? k : 'notes'; },
  brand() { return this.on() ? DISGUISES[this.disguiseKey()].name : 'AMORA'; },
  navLabel(id, fallback) { return this.opt('neutralLabels') ? (NEUTRAL_NAV[id] || fallback) : fallback; },
  displayName(name) { const c = cfg(); return c && c.enabled && c.alias && c.alias.trim() ? c.alias.trim() : name; },
  threadTitle(t) { return this.opt('neutralLabels') ? `Chat · ${new Date(t.created).toLocaleDateString([], { month: 'short', day: 'numeric' })}` : t.title; },
  hash(view) { return this.opt('neutralLabels') ? '' : '#' + view; },
  isCovered() { return covered; },

  /** Call once after the account's settings are loaded. */
  init(app) {
    APP = app;
    const c = APP.state.settings;
    c.discreet = Object.assign(defaultDiscreet(), c.discreet || {});
    this.apply();
    if (installed) return;
    installed = true;
    document.addEventListener('keydown', (e) => {
      lastActive = Date.now();
      if (e.key === 'Escape' && this.opt('escHide')) {
        const now = Date.now();
        if (now - lastEsc < 650) { lastEsc = 0; this.cover(); } else lastEsc = now;
      }
    });
    ['pointerdown', 'touchstart', 'scroll'].forEach((ev) => document.addEventListener(ev, () => { lastActive = Date.now(); }, { passive: true, capture: true }));
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && this.opt('autoCover')) this.cover(true); });
    window.addEventListener('pagehide', () => { if (this.opt('autoCover')) this.cover(true); });
    // tap-to-reveal for blurred messages (touch screens)
    document.addEventListener('click', (e) => {
      if (!this.opt('blur')) return;
      const b = e.target.closest && e.target.closest('.msg .bubble');
      if (!b) return;
      b.classList.add('reveal');
      clearTimeout(b._rv); b._rv = setTimeout(() => b.classList.remove('reveal'), 6000);
    });
    setInterval(() => {
      const m = cfg()?.idleMin;
      if (this.on() && m && !covered && Date.now() - lastActive > m * 60000) this.cover(true);
    }, 15000);
  },

  /** Before sign-in: apply the disguise from the global flag so even the login screen is neutral. */
  applyGlobal() { this.paintHead(); document.documentElement.classList.toggle('d-on', this.on()); },

  /** Re-apply everything after a setting changes. */
  apply() {
    const on = this.on(), root = document.documentElement, c = cfg();
    if (c) Store.setGlobal('discreet', c.enabled ? { on: true, disguise: this.disguiseKey() } : null);
    root.classList.toggle('d-on', on);
    root.classList.toggle('d-plain', this.opt('plain'));
    root.classList.toggle('d-blur', this.opt('blur'));
    root.classList.toggle('d-veil', this.opt('hidePhotos'));
    this.paintHead();
    document.querySelectorAll('.rail .logo, #splash .logo, .auth-card .logo, .onboard .logo').forEach((el) => { el.textContent = this.brand(); });
  },

  /** Tab title, favicon, install name / icon, theme colour. */
  paintHead() {
    const on = this.on(), key = this.disguiseKey(), D = DISGUISES[key];
    const set = (sel, make, attrs) => { let el = document.head.querySelector(sel); if (!el) { el = document.createElement(make); document.head.append(el); } Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v)); };
    if (!this.__orig) {
      this.__orig = {
        title: document.title,
        icon: document.querySelector('link[rel=icon]')?.getAttribute('href') || 'icons/icon.svg',
        touch: document.querySelector('link[rel=apple-touch-icon]')?.getAttribute('href') || 'icons/apple-touch-icon.png',
        manifest: document.querySelector('link[rel=manifest]')?.getAttribute('href') || 'manifest.webmanifest',
        desc: document.querySelector('meta[name=description]')?.getAttribute('content') || '',
        appTitle: document.querySelector('meta[name="apple-mobile-web-app-title"]')?.getAttribute('content') || 'AMORA',
      };
    }
    const O = this.__orig;
    document.title = on ? D.name : O.title;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='14' fill='${D.color}'/><rect x='18' y='16' width='28' height='4' rx='2' fill='#fff' opacity='.9'/><rect x='18' y='28' width='28' height='4' rx='2' fill='#fff' opacity='.9'/><rect x='18' y='40' width='18' height='4' rx='2' fill='#fff' opacity='.9'/></svg>`;
    set('link[rel=icon]', 'link', { rel: 'icon', type: on ? 'image/svg+xml' : 'image/svg+xml', href: on ? 'data:image/svg+xml,' + encodeURIComponent(svg) : O.icon });
    set('link[rel=apple-touch-icon]', 'link', { rel: 'apple-touch-icon', href: on ? `icons/disguise/${key}-180.png` : O.touch });
    set('link[rel=manifest]', 'link', { rel: 'manifest', href: on ? `icons/disguise/${key}.webmanifest` : O.manifest });
    set('meta[name=description]', 'meta', { name: 'description', content: on ? D.desc : O.desc });
    set('meta[name="apple-mobile-web-app-title"]', 'meta', { name: 'apple-mobile-web-app-title', content: on ? D.name : O.appTitle });
  },

  /* ------------------------------ PIN ------------------------------ */
  async setPin(pin) {
    const c = cfg(); if (!c) return;
    if (!pin) { c.pin = null; return; }
    const salt = Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, '0')).join('');
    c.pin = { salt, hash: await sha(salt + pin) };
  },
  async checkPin(pin) {
    const p = cfg()?.pin;
    if (!p) return true;
    return (await sha(p.salt + String(pin))) === p.hash;
  },
  hasPin() { return !!cfg()?.pin; },

  /* ------------------------- toggling & panic ------------------------- */
  setEnabled(on) {
    const c = cfg(); if (!c) return;
    c.enabled = !!on;
    APP.save('settings');
    APP.applyTheme();          // applyTheme calls apply()
    APP.go(APP.view, true);
  },

  /** Hide everything behind a working decoy. `soft` = triggered automatically (background / idle). */
  cover(soft = false) {
    if (covered || !this.on()) return;
    if (!soft && cfg()?.panicSignOut) { try { APP.flush(); } catch { /* ignore */ } APP.logout(); return; }
    covered = true;
    try { APP?.flush(); } catch { /* ignore */ }
    const app = document.getElementById('app'), modal = document.getElementById('modal-root');
    [app, modal].forEach((n) => { if (n) { n.inert = true; n.setAttribute('aria-hidden', 'true'); } });
    document.querySelectorAll('.popover').forEach((p) => p.remove());
    coverEl = buildDecoy(DISGUISES[this.disguiseKey()].kind, this.brand(), () => this.uncover());
    document.body.append(coverEl);
  },
  uncover() {
    covered = false; lastActive = Date.now();
    coverEl?.remove(); coverEl = null;
    const app = document.getElementById('app'), modal = document.getElementById('modal-root');
    [app, modal].forEach((n) => { if (n) { n.inert = false; n.removeAttribute('aria-hidden'); } });
  },
};

async function sha(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

/* ================================ decoys ================================ */

/** Five quick taps on `el` call `ok()`. If a PIN is set the user is asked for it first. */
function secretTap(el, ok) {
  let n = 0, t0 = 0;
  el.addEventListener('click', () => {
    const now = Date.now();
    if (now - t0 > 3000) n = 0;
    t0 = now; n++;
    if (n >= 5) { n = 0; askPin(el, ok); }
  });
}
async function askPin(host, ok) {
  if (!Discreet.hasPin()) return ok();
  const inp = h('input', { type: 'password', inputmode: 'numeric', autocomplete: 'off', placeholder: 'Code', 'aria-label': 'Code', style: { font: 'inherit', padding: '8px 10px', width: '120px', border: '1px solid #bbb', borderRadius: '8px' } });
  const box = h('div', { style: { position: 'fixed', left: 0, right: 0, bottom: '14%', display: 'flex', justifyContent: 'center', zIndex: 10001 } },
    h('div', { style: { background: '#fff', color: '#222', padding: '12px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,.25)', display: 'flex', gap: '8px' } }, inp,
      h('button', { style: { padding: '8px 12px', borderRadius: '8px', border: 0, background: '#2f7de1', color: '#fff' }, onclick: go }, 'OK')));
  async function go() { if (await Discreet.checkPin(inp.value)) { box.remove(); ok(); } else { inp.value = ''; inp.placeholder = '—'; } }
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); if (e.key === 'Escape') box.remove(); });
  document.body.append(box); inp.focus();
}

function shell(title, kind, body, onTitleOk) {
  const head = h('div', { class: 'dcy-head' }, h('b', title));
  secretTap(head, onTitleOk);
  return h('div', { id: 'discreet-cover', class: `dcy dcy-${kind}`, role: 'application', 'aria-label': title }, head, body);
}

function buildDecoy(kind, title, unlock) {
  if (kind === 'calc') return calcDecoy(title, unlock);
  if (kind === 'checklist') return checklistDecoy(title, unlock);
  return notepadDecoy(title, unlock);
}

function notepadDecoy(title, unlock) {
  const notes = [
    ['Groceries', 'oats\nbananas\ncoffee\nrice\ntomatoes\nolive oil\nspinach'],
    ['Meeting notes', 'Follow up on the schedule\nSend the revised draft by Thursday\nBook the room for next week'],
    ['Ideas', 'Weekend: farmers market, long walk, finally fix the bike\nRead more before bed'],
  ];
  const ta = h('textarea', { class: 'dcy-ta', 'aria-label': 'Note' });
  const list = h('div', { class: 'dcy-list' });
  let cur = 0;
  const show = (i) => { cur = i; ta.value = notes[i][1]; [...list.children].forEach((c, j) => c.classList.toggle('on', j === i)); };
  notes.forEach((n, i) => list.append(h('button', { class: 'dcy-item', onclick: () => show(i) }, h('b', n[0]), h('span', n[1].split('\n')[0]))));
  ta.addEventListener('input', () => { notes[cur][1] = ta.value; });
  show(0);
  return shell(title, 'notes', h('div', { class: 'dcy-split' }, list, ta), unlock);
}

function checklistDecoy(title, unlock) {
  const sets = {
    Tasks: ['Renew car registration', 'Book dentist appointment', 'Call the plumber', 'Pick up dry cleaning', 'Pay electricity bill', 'Reply to Sam about Saturday', 'Back up the laptop'],
    'Reading list': ['How to keep houseplants alive', 'A short history of the bicycle', 'Why we sleep: a summary', 'Ten pasta sauces worth learning', 'Notes on minimalist travel', 'The case for walking meetings'],
  };
  const items = sets[title] || sets.Tasks;
  const body = h('div', { class: 'dcy-checks' }, items.map((t, i) => h('label', { class: 'dcy-check' }, h('input', { type: 'checkbox', checked: i === 2 }), h('span', t))));
  return shell(title, 'checklist', body, unlock);
}

function calcDecoy(title, unlock) {
  let cur = '0', acc = null, op = null, fresh = true, typed = '';
  const disp = h('div', { class: 'dcy-disp', 'aria-live': 'polite' }, '0');
  const fmt = (v) => { let s = String(+v.toFixed(10)); if (s.length > 12) s = (+v).toExponential(5); return s; };
  const show = () => { disp.textContent = cur.length > 12 && !/e/.test(cur) ? (+cur).toExponential(5) : cur; };
  const compute = () => {
    if (op == null || acc == null) return +cur;
    const b = +cur;
    return op === '+' ? acc + b : op === '−' ? acc - b : op === '×' ? acc * b : (b === 0 ? NaN : acc / b);
  };
  async function press(k) {
    if (/^\d$/.test(k)) { typed += k; cur = fresh || cur === '0' ? k : cur + k; fresh = false; }
    else if (k === '.') { typed = ''; if (fresh) { cur = '0.'; fresh = false; } else if (!cur.includes('.')) cur += '.'; }
    else if (k === 'C') { cur = '0'; acc = null; op = null; fresh = true; typed = ''; }
    else if (k === '±') cur = cur.startsWith('-') ? cur.slice(1) : cur === '0' ? cur : '-' + cur;
    else if (k === '%') { cur = fmt(+cur / 100); fresh = true; }
    else if (k === '=') {
      if (typed.length >= 3 && Discreet.hasPin() && await Discreet.checkPin(typed)) { unlock(); return; }
      if (op != null) { const r = compute(); cur = Number.isNaN(r) || !Number.isFinite(r) ? 'Error' : fmt(r); acc = null; op = null; fresh = true; }
      typed = '';
    } else { // operator
      typed = '';
      if (op != null && !fresh) { const r = compute(); cur = Number.isNaN(r) || !Number.isFinite(r) ? 'Error' : fmt(r); }
      acc = cur === 'Error' ? null : +cur; op = k; fresh = true;
    }
    show();
  }
  const keys = ['C', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '.', '='];
  const pad = h('div', { class: 'dcy-keys' }, keys.map((k) => h('button', { class: `dcy-key${'÷×−+='.includes(k) ? ' op' : ''}${k === '0' ? ' zero' : ''}`, onclick: () => press(k) }, k)));
  const el = shell(title, 'calc', h('div', { class: 'dcy-calcbox' }, disp, pad), unlock);
  secretTap(disp, unlock);
  return el;
}
