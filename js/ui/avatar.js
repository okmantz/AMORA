// AMORA — avatar rendering. Default is a real photograph matched to her look (see photoreal.js); the drawn SVG
// portrait is only a fallback if the photo library cannot be loaded.
import { h } from '../core/util.js';
import { portraitSVG, shade as _shade, EXPRESSIONS as _EX } from './portrait.js';
import { pickPortrait, portraitsReady, portraitSrc, portraitFocus } from './photoreal.js';

const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const BG = {
  romantic: ['#fbe0ea', '#e9a6c4'], cozy: ['#f8e6cf', '#e6b98a'], elegant: ['#ece2f2', '#b9a0cf'], sporty: ['#d9eef8', '#8ec5e6'],
  bookish: ['#e3eedc', '#a9c79b'], edgy: ['#dcd8e8', '#8c86a8'], sunny: ['#fff3cc', '#ffc78a'], dreamy: ['#e6defa', '#a9a7e6'],
};

export const shade = _shade;

export const EXPRESSIONS = _EX;
/** Returns SVG markup for the illustrated avatar (cropped glamour portrait). */
export function avatarSVG(look, expr = 'neutral', uid = 'a') { return portraitSVG(look, expr, { uid, crop: 'avatar', scene: 'studio' }); }

function monogramHTML(name, look) {
  const [b1, b2] = BG[look.aesthetic] || BG.romantic;
  return `<div class="av-mono" style="background:linear-gradient(135deg,${b1},${b2})"><span>${(name || '?').trim().charAt(0).toUpperCase()}</span></div>`;
}

let counter = 0;
/** Build an avatar element for a persona. */
export function avatarEl(persona, expr = 'neutral', { size = 48, cls = '' } = {}) {
  const el = h('div', { class: `avatar ${cls}`, style: { width: size + 'px', height: size + 'px' }, 'data-expr': expr });
  paintAvatar(el, persona, expr);
  return el;
}
export function paintAvatar(el, persona, expr = 'neutral') {
  const L = persona.look;
  el.dataset.expr = expr;
  const kind = L.avatarKind === 'illustrated' ? 'photo' : L.avatarKind; // older saves used the drawn avatar
  if (kind === 'image' && L.avatarImage) { el.classList.remove('photo'); el.innerHTML = `<img src="${esc(L.avatarImage)}" alt="${esc(persona.name)}" class="av-img">`; return; }
  if (kind === 'monogram') { el.classList.remove('photo'); el.innerHTML = monogramHTML(persona.name, L); return; }
  const p = portraitsReady() ? pickPortrait(persona) : null;
  if (p) {
    el.classList.add('photo');
    el.innerHTML = `<img class="av-img av-photo" src="${portraitSrc(p)}" alt="${esc(persona.name)}" style="object-position:${portraitFocus(p)}" decoding="async">`;
  } else {
    el.classList.remove('photo');
    el.innerHTML = avatarSVG(L, expr, 'g' + (counter++));
  }
}
