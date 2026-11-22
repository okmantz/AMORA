// AMORA — UI primitives: icons, toasts, modals and form-field builders.
import { h, $, clamp, uid, splitList } from '../core/util.js';

const ICONS = {
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.5-6.5 8-6.5s7 2 8 6.5"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  quote: '<path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M8 10h8M8 13h5"/>',
  heart: '<path d="M12 20s-7-4.4-9.3-9A5 5 0 0 1 12 6a5 5 0 0 1 9.3 5c-2.3 4.6-9.3 9-9.3 9z"/>',
  book: '<path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4z"/><path d="M5 16a4 4 0 0 1 4-4h10"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.2-4.2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
  send: '<path d="M4 12l16-8-6 16-3-6.5z"/><path d="M11 13.5L20 4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  trash: '<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  edit: '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  pin: '<path d="M9 4h6l-1 6 3 3H7l3-3z"/><path d="M12 13v7"/>',
  mask: '<path d="M4 6c4-2 12-2 16 0v5c0 5-4 8-8 9-4-1-8-4-8-9z"/><path d="M8.5 10.5h.01M15.5 10.5h.01M9 14.5c1.5 1.3 4.5 1.3 6 0"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14c1 1.6 2.4 2.4 4 2.4s3-.8 4-2.4M9 9.5h.01M15 9.5h.01"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  flame: '<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.5-4M4 4v4h4M4 13a8 8 0 0 0 14.5 4M20 20v-4h-4"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  history: '<path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v4h4"/><path d="M12 8v4l3 2"/>',
  feather: '<path d="M20 4c-8 0-14 5-14 12v4h4c7 0 10-6 10-16z"/><path d="M4 20L14 10"/>',
  bell: '<path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z"/><path d="M10 21h4"/>',
  wand: '<path d="M5 19L17 7"/><path d="M15 5l1-2 1 2 2 1-2 1-1 2-1-2-2-1z"/>',
  play: '<path d="M7 5l12 7-12 7z"/>',
};
export const icon = (name, size = 20, cls = '') => {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', size); s.setAttribute('height', size);
  s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '1.7');
  s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true');
  if (cls) s.setAttribute('class', cls);
  s.innerHTML = ICONS[name] || '';
  return s;
};

/* ------------------------------ toast ------------------------------ */
export function toast(msg, kind = '') {
  const root = $('#toast-root');
  if (!root) return;
  const t = h('div', { class: `toast ${kind}`, role: 'status' }, msg);
  root.append(t);
  requestAnimationFrame(() => t.classList.add('in'));
  setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 300); }, 2800);
}

/* ------------------------------ modal ------------------------------ */
export function modal({ title, body, actions = [], size = 'md', onClose, dismissable = true }) {
  const root = $('#modal-root');
  const close = () => { back.classList.remove('in'); setTimeout(() => back.remove(), 200); onClose && onClose(); document.removeEventListener('keydown', esc); };
  const esc = (e) => { if (e.key === 'Escape' && dismissable) close(); };
  const box = h('div', { class: `modal ${size}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': title || 'Dialog' },
    title && h('div', { class: 'modal-head' }, h('h3', title), dismissable && h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: close }, icon('x'))),
    h('div', { class: 'modal-body' }, body),
    actions.length > 0 && h('div', { class: 'modal-actions' }, actions.map((a) => h('button', { class: `btn ${a.kind || ''}`, onclick: async () => { const r = a.onClick ? await a.onClick(close) : undefined; if (r !== false && !a.keepOpen) close(); } }, a.label))));
  const back = h('div', { class: 'modal-back', onclick: (e) => { if (e.target === back && dismissable) close(); } }, box);
  root.append(back);
  requestAnimationFrame(() => back.classList.add('in'));
  document.addEventListener('keydown', esc);
  const first = box.querySelector('input,textarea,select,button.primary');
  first && setTimeout(() => first.focus(), 60);
  return { close, box };
}

export const confirmBox = (msg, okLabel = 'Confirm', danger = false, title = 'Are you sure?') => new Promise((res) => {
  let done = false;
  modal({ title, body: h('p', { class: 'muted' }, msg), size: 'sm', onClose: () => { if (!done) res(false); }, actions: [{ label: 'Cancel', onClick: () => { done = true; res(false); } }, { label: okLabel, kind: danger ? 'danger' : 'primary', onClick: () => { done = true; res(true); } }] });
});

export const promptBox = (title, label, value = '', { multiline = false, placeholder = '' } = {}) => new Promise((res) => {
  let done = false;
  const inp = multiline ? h('textarea', { rows: 5, placeholder }, value) : h('input', { type: 'text', value, placeholder });
  inp.value = value;
  const submit = (close) => { done = true; res(inp.value); };
  if (!multiline) inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { done = true; res(inp.value); m.close(); } });
  const m = modal({ title, size: 'sm', body: h('label', { class: 'field' }, h('span', { class: 'label' }, label), inp), onClose: () => { if (!done) res(null); }, actions: [{ label: 'Cancel', onClick: () => { done = true; res(null); } }, { label: 'OK', kind: 'primary', onClick: submit }] });
});

/* -------------------------- form-field builders -------------------------- */
export function fSlider(label, desc, get, set, { min = 0, max = 100, step = 1, fmt = (v) => v, marks } = {}) {
  const val = h('span', { class: 'val' }, fmt(get()));
  const inp = h('input', { type: 'range', min, max, step, value: get(), 'aria-label': label });
  inp.addEventListener('input', () => { const v = +inp.value; val.textContent = fmt(v); inp.style.setProperty('--p', ((v - min) / (max - min)) * 100 + '%'); set(v); });
  inp.style.setProperty('--p', ((get() - min) / (max - min)) * 100 + '%');
  return h('div', { class: 'field slider' }, h('div', { class: 'row between' }, h('span', { class: 'label' }, label), val), inp, desc && h('small', { class: 'muted' }, desc), marks && h('div', { class: 'marks' }, marks.map((m) => h('span', m))));
}

export function fText(label, get, set, { type = 'text', placeholder = '', multiline = false, max, rows = 3, hint } = {}) {
  const inp = multiline ? h('textarea', { rows, placeholder, maxlength: max }) : h('input', { type, placeholder, maxlength: max });
  inp.value = get() ?? '';
  inp.addEventListener('input', () => set(type === 'number' ? +inp.value : inp.value));
  return h('label', { class: 'field' }, h('span', { class: 'label' }, label), inp, hint && h('small', { class: 'muted' }, hint));
}

export function fSelect(label, options, get, set, hint) {
  const sel = h('select', options.map(([v, l]) => h('option', { value: v, selected: v === get() }, l)));
  sel.addEventListener('change', () => set(sel.value));
  return h('label', { class: 'field' }, h('span', { class: 'label' }, label), sel, hint && h('small', { class: 'muted' }, hint));
}

export function fToggle(label, desc, get, set) {
  const inp = h('input', { type: 'checkbox', role: 'switch', checked: !!get() });
  inp.addEventListener('change', () => set(inp.checked));
  return h('label', { class: 'field toggle' }, h('span', { class: 'tl' }, h('span', { class: 'label' }, label), desc && h('small', { class: 'muted' }, desc)), inp, h('span', { class: 'switch', 'aria-hidden': 'true' }));
}

/** Single-select chips */
export function fChips(label, options, get, set, hint) {
  const wrap = h('div', { class: 'chips', role: 'radiogroup', 'aria-label': label });
  const paint = () => [...wrap.children].forEach((b) => b.classList.toggle('on', b.dataset.v === String(get())));
  options.forEach(([v, l]) => wrap.append(h('button', { type: 'button', class: 'chip', 'data-v': v, role: 'radio', onclick: () => { set(v); paint(); } }, l)));
  paint();
  return h('div', { class: 'field' }, h('span', { class: 'label' }, label), wrap, hint && h('small', { class: 'muted' }, hint));
}

/** Multi-select chips (array of ids) */
export function fMulti(label, options, get, set, hint) {
  const wrap = h('div', { class: 'chips' });
  const paint = () => [...wrap.children].forEach((b) => b.classList.toggle('on', get().includes(b.dataset.v)));
  options.forEach(([v, l]) => wrap.append(h('button', { type: 'button', class: 'chip', 'data-v': v, 'aria-pressed': 'false', onclick: () => { const cur = new Set(get()); cur.has(v) ? cur.delete(v) : cur.add(v); set([...cur]); paint(); } }, l)));
  paint();
  return h('div', { class: 'field' }, h('span', { class: 'label' }, label), wrap, hint && h('small', { class: 'muted' }, hint));
}

/** List-of-strings editor */
export function fTags(label, get, set, placeholder = 'Add…', hint, { commas = true } = {}) {
  const wrap = h('div', { class: 'tags' });
  const inp = h('input', { type: 'text', placeholder, 'aria-label': label });
  const paint = () => {
    wrap.innerHTML = '';
    get().forEach((t, i) => wrap.append(h('span', { class: 'tag' }, t, h('button', { type: 'button', 'aria-label': `Remove ${t}`, onclick: () => { const a = get().slice(); a.splice(i, 1); set(a); paint(); } }, '×'))));
    wrap.append(inp);
  };
  const add = () => { const items = commas ? splitList(inp.value.replace(/\n/g, ',')) : [inp.value.replace(/\s+/g, ' ').trim()].filter(Boolean); if (!items.length) return; const cur = get().slice(); items.forEach((x) => { if (!cur.some((y) => y.toLowerCase() === x.toLowerCase())) cur.push(x); }); set(cur); inp.value = ''; paint(); inp.focus(); };
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' || (commas && e.key === ',')) { e.preventDefault(); add(); } else if (e.key === 'Backspace' && !inp.value && get().length) { const a = get().slice(); a.pop(); set(a); paint(); inp.focus(); } });
  inp.addEventListener('blur', add);
  paint();
  return h('div', { class: 'field' }, h('span', { class: 'label' }, label), wrap, hint && h('small', { class: 'muted' }, hint));
}

export function fSwatches(label, colors, get, set, { custom = true, names } = {}) {
  const wrap = h('div', { class: 'swatches', role: 'radiogroup', 'aria-label': label });
  const paint = () => [...wrap.querySelectorAll('.sw')].forEach((b) => b.classList.toggle('on', (b.dataset.v || '').toLowerCase() === String(get()).toLowerCase()));
  colors.forEach((c, i) => {
    const v = Array.isArray(c) ? c[0] : c, nm = Array.isArray(c) ? c[1] : (names?.[i] || v);
    wrap.append(h('button', { type: 'button', class: 'sw', 'data-v': v, style: { '--c': v }, title: nm, 'aria-label': nm, role: 'radio', onclick: () => { set(v); paint(); } }));
  });
  if (custom) {
    const inp = h('input', { type: 'color', class: 'sw-custom', value: /^#[0-9a-f]{6}$/i.test(get()) ? get() : '#c2577a', 'aria-label': `Custom ${label}` });
    inp.addEventListener('input', () => { set(inp.value); paint(); });
    wrap.append(h('label', { class: 'sw custom', title: 'Custom color' }, icon('plus', 14), inp));
  }
  paint();
  return h('div', { class: 'field' }, h('span', { class: 'label' }, label), wrap);
}

export const section = (title, ...kids) => h('section', { class: 'card' }, title && h('h3', { class: 'card-title' }, title), ...kids);
export const empty = (msg, ic = 'sparkle') => h('div', { class: 'empty' }, icon(ic, 28), h('p', msg));

/** Segmented tab control. tabs: [[id,label,icon?]] */
export function tabs(items, current, onChange) {
  const el = h('div', { class: 'tabs', role: 'tablist' });
  const paint = (c) => [...el.children].forEach((b) => { b.classList.toggle('on', b.dataset.id === c); b.setAttribute('aria-selected', b.dataset.id === c); });
  items.forEach(([id, label, ic]) => el.append(h('button', { type: 'button', role: 'tab', 'data-id': id, onclick: () => { paint(id); onChange(id); } }, ic && icon(ic, 16), h('span', label))));
  paint(current);
  return el;
}
