// AMORA — procedural SVG avatar with hairstyles, outfits, accessories and expressions. No image assets needed.
import { h } from '../core/util.js';

const BG = {
  romantic: ['#fbe0ea', '#e9a6c4'], cozy: ['#f8e6cf', '#e6b98a'], elegant: ['#ece2f2', '#b9a0cf'], sporty: ['#d9eef8', '#8ec5e6'],
  bookish: ['#e3eedc', '#a9c79b'], edgy: ['#dcd8e8', '#8c86a8'], sunny: ['#fff3cc', '#ffc78a'], dreamy: ['#e6defa', '#a9a7e6'],
};

export function shade(hex, amt) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt / 100) : c + (255 - c) * (amt / 100))));
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, '0')).join('');
}

const EXPRS = ['neutral', 'happy', 'laugh', 'love', 'blush', 'caring', 'think', 'surprised', 'wink'];
export const EXPRESSIONS = EXPRS;
const ALIAS = { typing: 'think', sad: 'caring', angry: 'caring' };

function hairBack(style, c, d) {
  switch (style) {
    case 'long': return `<path d="M56 104C38 168 46 214 64 240H176C194 214 202 168 184 104C180 50 150 24 120 24C90 24 60 50 56 104Z" fill="${c}"/><path d="M62 150C60 190 70 220 84 240" stroke="${d}" stroke-width="3" fill="none" opacity=".35"/>`;
    case 'wavy': return `<path d="M56 104C36 150 58 176 42 206C38 224 54 232 60 240H180C188 232 202 224 198 206C182 176 204 150 184 104C180 50 150 24 120 24C90 24 60 50 56 104Z" fill="${c}"/><path d="M60 160c10 12 0 28 10 44M180 160c-10 12 0 28-10 44" stroke="${d}" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/>`;
    case 'bob': return `<path d="M52 104C42 142 48 176 68 186H172C192 176 198 142 188 104C182 50 150 24 120 24C90 24 58 50 52 104Z" fill="${c}"/>`;
    case 'ponytail': return `<path d="M168 62C216 62 226 122 208 178C202 150 196 124 176 104Z" fill="${c}"/><path d="M200 120c0 20 2 40 6 54" stroke="${d}" stroke-width="3" fill="none" opacity=".4"/>`;
    case 'bun': return `<circle cx="120" cy="24" r="23" fill="${c}"/><path d="M104 18c8-6 18-6 30 0" stroke="${d}" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>`;
    case 'braid': return `<path d="M54 104C46 142 52 172 64 184H176C188 172 194 142 186 104C180 50 150 24 120 24C90 24 58 50 54 104Z" fill="${c}"/>`;
    case 'curls': return [[60, 92, 27], [50, 128, 25], [60, 162, 23], [180, 92, 27], [190, 128, 25], [180, 162, 23], [82, 52, 27], [120, 40, 31], [158, 52, 27]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${d}" stroke-width="2" stroke-opacity=".25"/>`).join('');
    default: return '';
  }
}

function hairFront(style, c, d) {
  const hl = shade(c, 28);
  if (style === 'pixie') return `<path d="M62 118C54 58 90 28 124 28C158 28 184 62 176 116C172 96 164 86 154 80C138 90 108 90 90 78C76 86 66 100 62 118Z" fill="${c}"/><path d="M88 50Q108 36 134 40" stroke="${hl}" stroke-width="4" fill="none" opacity=".4" stroke-linecap="round"/>`;
  const cap = style === 'curls'
    ? `<path d="M68 104C72 62 168 62 172 104C156 82 138 74 120 74C102 74 84 82 68 104Z" fill="${c}"/>`
    : `<path d="M62 116C54 56 90 26 120 26C150 26 186 56 178 116C174 98 166 84 154 74C140 90 108 92 86 76C76 88 66 100 62 116Z" fill="${c}"/>`;
  return cap + `<path d="M86 48Q106 34 134 38" stroke="${hl}" stroke-width="4" fill="none" opacity=".35" stroke-linecap="round"/>` + (style === 'ponytail' ? `<ellipse cx="172" cy="68" rx="7" ry="9" fill="#d95c7c"/>` : '') + (style === 'bun' ? `<path d="M100 40Q120 30 140 40" stroke="#d95c7c" stroke-width="5" fill="none" stroke-linecap="round"/>` : '');
}

function braidFront(c, d) {
  let out = '';
  for (let i = 0; i < 6; i++) out += `<ellipse cx="${182 + (i % 2 ? 4 : -2)}" cy="${150 + i * 14}" rx="11" ry="8" fill="${i % 2 ? c : d}" stroke="${d}" stroke-width="1" stroke-opacity=".4"/>`;
  return out + `<ellipse cx="182" cy="238" rx="6" ry="4" fill="#d95c7c"/>`;
}

function outfitSVG(kind, col, skin, skinSh) {
  const dk = shade(col, -18), lt = shade(col, 22);
  const body = `<path d="M22 240C26 204 66 186 120 186C174 186 214 204 218 240Z" fill="${col}"/>`;
  switch (kind) {
    case 'sweater': return body + `<path d="M24 232C30 206 68 190 120 190" stroke="${dk}" stroke-width="2" fill="none" opacity=".25"/><ellipse cx="120" cy="190" rx="30" ry="10" fill="${lt}"/><ellipse cx="120" cy="190" rx="19" ry="6" fill="${skin}"/><path d="M60 212v28M82 204v36M158 204v36M180 212v28" stroke="${dk}" stroke-width="3" opacity=".18"/>`;
    case 'dress': return body + `<path d="M88 189Q120 232 152 189Z" fill="${skin}"/><path d="M86 190L66 240M154 190L174 240" stroke="${col}" stroke-width="7" stroke-linecap="round"/><path d="M92 196Q120 226 148 196" stroke="${lt}" stroke-width="2.5" fill="none" opacity=".7"/>`;
    case 'blazer': return body + `<path d="M104 188L120 232L136 188Z" fill="#f7f1f1"/><path d="M94 188L120 240H80Z" fill="${dk}"/><path d="M146 188L120 240H160Z" fill="${dk}"/><path d="M104 188Q120 202 136 188" fill="${skin}"/><circle cx="120" cy="236" r="2.4" fill="${lt}"/>`;
    case 'hoodie': return `<ellipse cx="120" cy="192" rx="46" ry="15" fill="${dk}"/>` + body + `<ellipse cx="120" cy="190" rx="22" ry="8" fill="${skin}"/><path d="M108 198v26M132 198v26" stroke="#f3e9ea" stroke-width="2.6" stroke-linecap="round"/><path d="M96 232h48" stroke="${dk}" stroke-width="3" opacity=".3"/>`;
    case 'sundress': return body + `<path d="M86 189Q120 222 154 189Z" fill="${skin}"/><path d="M88 190L78 240M152 190L162 240" stroke="${col}" stroke-width="6" stroke-linecap="round"/>` + [[70, 212], [100, 224], [140, 224], [172, 212], [120, 238]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${lt}" opacity=".8"/>`).join('');
    default: return body + `<path d="M98 188Q120 214 142 188Z" fill="${skin}"/><path d="M98 188Q120 214 142 188" stroke="${dk}" stroke-width="3" fill="none" opacity=".35"/>`; // tee
  }
}

function eyesSVG(x, iris, expr, hairDark) {
  const L = 98, R = 142, Y = 116;
  const lash = (cx, flip) => `<path d="M${cx - 12} ${Y - 1}Q${cx} ${Y - 12} ${cx + 12} ${Y - 1}" stroke="#1a1215" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M${flip ? cx + 12 : cx - 12} ${Y - 1}l${flip ? 4 : -4} -3" stroke="#1a1215" stroke-width="2.4" stroke-linecap="round"/>`;
  const open = (cx, flip, o = {}) => {
    const dx = o.dx || 0, dy = o.dy || 0, ry = o.ry || 9.5;
    return `<g class="av-eye" style="transform-origin:${cx}px ${Y}px"><ellipse cx="${cx}" cy="${Y}" rx="10.5" ry="${ry}" fill="#fff"/><circle cx="${cx + dx}" cy="${Y + 1 + dy}" r="7.3" fill="${iris}"/><circle cx="${cx + dx}" cy="${Y + 1 + dy}" r="3.7" fill="#1a1215"/><circle cx="${cx + dx + 2.6}" cy="${Y - 2 + dy}" r="2.3" fill="#fff"/><circle cx="${cx + dx - 2.4}" cy="${Y + 3.8 + dy}" r="1" fill="#fff" opacity=".8"/>${o.glossy ? `<ellipse cx="${cx}" cy="${Y + 6}" rx="8" ry="2" fill="#fff" opacity=".45"/>` : ''}${lash(cx, flip)}</g>`;
  };
  const arc = (cx) => `<path d="M${cx - 11} ${Y + 3}Q${cx} ${Y - 11} ${cx + 11} ${Y + 3}" stroke="#1a1215" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
  const heart = (cx) => `<path d="M${cx} ${Y + 9}c-9-6-11-12-6-15c3-2 5 0 6 2c1-2 3-4 6-2c5 3 3 9-6 15z" fill="#e8537c"/>`;
  switch (expr) {
    case 'laugh': return arc(L) + arc(R);
    case 'happy': return open(L, false, { glossy: true }) + open(R, true, { glossy: true });
    case 'love': return heart(L) + heart(R);
    case 'wink': return open(L, false) + arc(R);
    case 'blush': return open(L, false, { dx: -2, dy: 2 }) + open(R, true, { dx: -2, dy: 2 });
    case 'caring': return open(L, false, { glossy: true, dy: 1 }) + open(R, true, { glossy: true, dy: 1 });
    case 'think': return open(L, false, { dx: 3, dy: -2 }) + open(R, true, { dx: 3, dy: -2 });
    case 'surprised': return open(L, false, { ry: 11.5 }) + open(R, true, { ry: 11.5 });
    default: return open(L, false) + open(R, true);
  }
}

function browsSVG(expr, col) {
  const s = (d) => `<path d="${d}" stroke="${col}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  switch (expr) {
    case 'caring': return s('M86 101Q98 98 110 92') + s('M130 92Q142 98 154 101');
    case 'surprised': return s('M86 92Q98 85 110 90') + s('M130 90Q142 85 154 92');
    case 'think': return s('M86 98Q98 93 110 98') + s('M130 90Q142 84 154 90');
    case 'happy': case 'love': case 'laugh': return s('M86 97Q98 90 110 96') + s('M130 96Q142 90 154 97');
    case 'wink': return s('M86 98Q98 92 110 97') + s('M130 95Q142 92 154 97');
    default: return s('M86 99Q98 93 110 98') + s('M130 98Q142 93 154 99');
  }
}

function mouthSVG(expr) {
  const lip = '#c0506b', dark = '#8e2d47';
  switch (expr) {
    case 'happy': return `<path d="M104 140Q120 162 136 140Q120 147 104 140Z" fill="${dark}"/><path d="M108 141.5Q120 148 132 141.5Q120 152 108 141.5Z" fill="#fff"/>`;
    case 'laugh': return `<path d="M101 137Q120 172 139 137Q120 143 101 137Z" fill="${dark}"/><path d="M110 153Q120 148 130 153Q120 163 110 153Z" fill="#ef7a95"/><path d="M104 139Q120 145 136 139" stroke="#fff" stroke-width="4" fill="none" opacity=".9"/>`;
    case 'love': case 'blush': return `<path d="M109 144Q120 153 131 144" stroke="${lip}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    case 'caring': return `<path d="M110 147Q120 151 130 147" stroke="${lip}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    case 'surprised': return `<ellipse cx="120" cy="148" rx="6" ry="8" fill="${dark}"/>`;
    case 'think': return `<path d="M111 148Q121 147 131 142" stroke="${lip}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    case 'wink': return `<path d="M107 143Q121 156 135 140" stroke="${lip}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
    default: return `<path d="M108 144Q120 151 132 144" stroke="${lip}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  }
}

function accessorySVG(kind, hairCol, outfit) {
  switch (kind) {
    case 'glasses': return `<g fill="rgba(255,255,255,.12)" stroke="#3a2e35" stroke-width="2.6"><circle cx="98" cy="116" r="16"/><circle cx="142" cy="116" r="16"/></g><path d="M114 114Q120 110 126 114M82 112L72 108M158 112L168 108" stroke="#3a2e35" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    case 'earrings': return `<circle cx="70" cy="130" r="4.5" fill="#fdf6ee" stroke="#d8c7b4"/><circle cx="170" cy="130" r="4.5" fill="#fdf6ee" stroke="#d8c7b4"/>`;
    case 'flower': return `<g transform="translate(152 56)">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-9" rx="6" ry="9" fill="#ff9fbf" transform="rotate(${a})"/>`).join('')}<circle r="5" fill="#ffd36b"/></g>`;
    case 'headband': return `<path d="M64 88C78 40 162 40 176 88" stroke="${outfit}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
    case 'choker': return `<path d="M102 178Q120 190 138 178" stroke="#1d1417" stroke-width="4.5" fill="none" stroke-linecap="round"/><circle cx="120" cy="188" r="3.4" fill="#e7c9a9" stroke="#b99870"/>`;
    case 'beret': return `<path d="M60 72C56 30 184 30 180 72C170 58 70 58 60 72Z" fill="${outfit}"/><circle cx="120" cy="33" r="4" fill="${shade(outfit, -20)}"/>`;
    default: return '';
  }
}

function extrasSVG(expr) {
  const heart = (x, y, s, o) => `<path class="av-float" style="animation-delay:${o}s" d="M${x} ${y + 8 * s}c${-9 * s}-${6 * s} ${-11 * s}-${12 * s} ${-6 * s}-${15 * s}c${3 * s}-${2 * s} ${5 * s} 0 ${6 * s} ${2 * s}c${1 * s}-${2 * s} ${3 * s}-${4 * s} ${6 * s}-${2 * s}c${5 * s} ${3 * s} ${3 * s} ${9 * s} ${-6 * s} ${15 * s}z" fill="#ff7a9c" opacity=".9"/>`;
  if (expr === 'love') return heart(200, 40, 1, 0) + heart(36, 54, .8, .6) + heart(212, 84, .6, 1.1);
  if (expr === 'happy' || expr === 'laugh') return `<path class="av-spark" d="M206 40l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#ffd36b"/><path class="av-spark" style="animation-delay:.7s" d="M34 62l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#ffd36b"/>`;
  if (expr === 'think') return `<g fill="#fff" stroke="rgba(0,0,0,.18)"><circle cx="190" cy="52" r="4"/><circle cx="202" cy="38" r="6"/><ellipse cx="218" cy="22" rx="14" ry="10"/></g><g fill="#9a8fa0"><circle cx="212" cy="22" r="1.8"/><circle cx="218" cy="22" r="1.8"/><circle cx="224" cy="22" r="1.8"/></g>`;
  if (expr === 'surprised') return `<path d="M44 40l8 6M36 60h10M196 40l-8 6M204 60h-10" stroke="#ffb454" stroke-width="3" stroke-linecap="round"/>`;
  return '';
}

/** Returns SVG markup for the illustrated avatar. */
export function avatarSVG(look, expr = 'neutral', uid = 'a') {
  expr = ALIAS[expr] || (EXPRS.includes(expr) ? expr : 'neutral');
  const L = look, hair = L.hairColor, hd = shade(hair, -26), skin = L.skin, ssh = shade(skin, -12);
  const [b1, b2] = BG[L.aesthetic] || BG.romantic;
  const blush = expr === 'blush' || expr === 'love' ? 0.75 : expr === 'happy' || expr === 'laugh' ? 0.4 : 0.22;
  const style = L.hairStyle;
  const frontHairOverBody = style === 'braid';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="Avatar, ${expr}" class="av-svg">
<defs><linearGradient id="bg${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b1}"/><stop offset="1" stop-color="${b2}"/></linearGradient><clipPath id="cp${uid}"><rect width="240" height="240" rx="48"/></clipPath><radialGradient id="gl${uid}" cx=".3" cy=".2" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
<g clip-path="url(#cp${uid})">
<rect width="240" height="240" fill="url(#bg${uid})"/><circle cx="196" cy="48" r="64" fill="url(#gl${uid})"/>
<g class="av-body">
${hairBack(style, hair, hd)}
<path d="M104 146V192Q120 204 136 192V146Z" fill="${ssh}"/>
${outfitSVG(L.outfit, L.outfitColor, skin, ssh)}
<ellipse cx="120" cy="170" rx="22" ry="8" fill="${ssh}" opacity=".0"/>
<ellipse cx="70" cy="116" rx="6.5" ry="10" fill="${skin}"/><ellipse cx="170" cy="116" rx="6.5" ry="10" fill="${skin}"/>
<path d="M70 108C70 64 96 50 120 50C144 50 170 64 170 108C170 142 148 170 120 170C92 170 70 142 70 108Z" fill="${skin}"/>
<path d="M92 168Q120 184 148 168Q120 176 92 168Z" fill="${ssh}" opacity=".25"/>
<ellipse cx="86" cy="134" rx="11" ry="7" fill="#ff7a9c" opacity="${blush}"/><ellipse cx="154" cy="134" rx="11" ry="7" fill="#ff7a9c" opacity="${blush}"/>
${eyesSVG(0, L.eyeColor, expr, hd)}
${browsSVG(expr, hd)}
<path d="M118 128Q120 133 125 131" stroke="${ssh}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>
${mouthSVG(expr)}
${hairFront(style, hair, hd)}
${frontHairOverBody ? braidFront(hair, hd) : ''}
${accessorySVG(L.accessory, hair, L.outfitColor)}
</g>
${extrasSVG(expr)}
</g></svg>`;
}

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
