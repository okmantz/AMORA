// AMORA — procedural SVG avatar with hairstyles, outfits, accessories and expressions. No image assets needed.
import { h } from '../core/util.js';
import { portraitSVG, shade as _shade, EXPRESSIONS as _EX } from './portrait.js';

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
  if (L.avatarKind === 'image' && L.avatarImage) el.innerHTML = `<img src="${L.avatarImage}" alt="${persona.name}" class="av-img">`;
  else if (L.avatarKind === 'monogram') el.innerHTML = monogramHTML(persona.name, L);
  else el.innerHTML = avatarSVG(L, expr, 'g' + (counter++));
}
