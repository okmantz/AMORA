// AMORA — small shared helpers (no dependencies)

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Hyperscript-style element builder: h('div', {class:'x', onclick:fn}, child, 'text') */
export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) {
    kids.unshift(attrs);
    attrs = null;
  }
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v == null) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') { for (const [sk, sv] of Object.entries(v)) { if (sv == null) continue; if (sk.startsWith('--')) el.style.setProperty(sk, sv); else el.style[sk] = sv; } }
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'value') el.value = v;
    else if (k === 'checked' || k === 'disabled' || k === 'selected') el[k] = !!v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  const add = (c) => {
    if (c == null || c === false) return;
    if (Array.isArray(c)) c.forEach(add);
    else el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  };
  kids.forEach(add);
  return el;
}

export const uid = (p = 'id') => p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const deepClone = (o) => JSON.parse(JSON.stringify(o));

export function debounce(fn, ms = 300) {
  let t;
  const d = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  d.flush = (...a) => { clearTimeout(t); fn(...a); };
  return d;
}

/** Deterministic PRNG (mulberry32) so the engine can be tested with a seed. */
export function makeRng(seed) {
  if (seed == null) return Math.random;
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export const pad = (n) => String(n).padStart(2, '0');
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fmtTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
export function fmtDay(ts) {
  const d = new Date(ts), t = new Date();
  const y = new Date(); y.setDate(t.getDate() - 1);
  if (dayKey(d) === dayKey(t)) return 'Today';
  if (dayKey(d) === dayKey(y)) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: d.getFullYear() !== t.getFullYear() ? 'numeric' : undefined });
}
export const fmtDateTime = (ts) => new Date(ts).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export function download(filename, text, mime = 'application/json') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: filename });
  document.body.append(a);
  a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 500);
}

export function pickFile(accept) {
  return new Promise((resolve) => {
    const inp = h('input', { type: 'file', accept, style: { display: 'none' } });
    inp.addEventListener('change', () => { resolve(inp.files[0] || null); inp.remove(); });
    document.body.append(inp);
    inp.click();
  });
}
export const readText = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsText(file); });

/** Downscale an image file to a JPEG/PNG data URL so it fits comfortably in localStorage. */
export function resizeImage(file, max = 512, quality = 0.82, type = 'image/jpeg') {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL(type, quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image.')); };
    img.src = url;
  });
}

export const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());
export const uniq = (a) => [...new Set(a)];
export const splitList = (s) => uniq(String(s || '').split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean));
export const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Minimal event bus */
export function bus() {
  const m = new Map();
  return {
    on(e, f) { (m.get(e) || m.set(e, new Set()).get(e)).add(f); return () => m.get(e)?.delete(f); },
    emit(e, ...a) { m.get(e)?.forEach((f) => { try { f(...a); } catch (err) { console.error(err); } }); },
  };
}
