// AMORA — glamour portrait renderer. One illustrated, adult character drawn from her "look" settings: face, makeup, 14 hairstyles,
// 5 body types, 14 outfits and photo scenes. Used for the avatar (cropped) and for selfies / photos (full 3:4 frame).
// Everything is procedural SVG — no image assets. Photos are suggestive at most: outfits always cover the body (no nudity).

export function shade(hex, amt) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt / 100) : c + (255 - c) * (amt / 100))));
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, '0')).join('');
}
const mix = (a, b, t) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return '#' + [16, 8, 0].map((s) => ch(s).toString(16).padStart(2, '0')).join('');
};
const f1 = (n) => Math.round(n * 10) / 10;

export const EXPRESSIONS = ['neutral', 'happy', 'laugh', 'love', 'blush', 'caring', 'think', 'surprised', 'wink', 'sultry', 'kiss'];
const ALIAS = { typing: 'think', sad: 'caring', angry: 'caring', flirt: 'sultry', smirk: 'sultry' };

export const BODY = {
  slender: { sw: 80, arm: 18, bust: 15, label: 'Slender' },
  athletic: { sw: 96, arm: 26, bust: 16, label: 'Athletic' },
  average: { sw: 90, arm: 21, bust: 19, label: 'Average' },
  curvy: { sw: 98, arm: 23, bust: 26, label: 'Curvy' },
  plus: { sw: 114, arm: 32, bust: 30, label: 'Full-figured' },
};
export const MAKEUP = { natural: 'Natural glow', glam: 'Soft glam', smoky: 'Smoky eye', bold: 'Bold lip' };

const BG = {
  romantic: ['#fbe0ea', '#e9a6c4'], cozy: ['#f8e6cf', '#e6b98a'], elegant: ['#ece2f2', '#b9a0cf'], sporty: ['#d9eef8', '#8ec5e6'],
  bookish: ['#e3eedc', '#a9c79b'], edgy: ['#dcd8e8', '#8c86a8'], sunny: ['#fff3cc', '#ffc78a'], dreamy: ['#e6defa', '#a9a7e6'],
};

/* ------------------------------ HAIR ------------------------------ */
function wave(x, y0, y1, amp, dir, n = 5) {
  // vertical wavy edge from (x,y0) to (x,y1); returns path commands (no leading M)
  let d = '', seg = (y1 - y0) / n;
  for (let i = 0; i < n; i++) { const ya = y0 + seg * i, yb = ya + seg, o = (i % 2 ? -1 : 1) * amp * dir; d += `C${f1(x + o)} ${f1(ya + seg * 0.3)} ${f1(x - o)} ${f1(ya + seg * 0.7)} ${f1(x)} ${f1(yb)} `; }
  return d;
}
function hairParts(style, c, d, hl, uid) {
  const g = `url(#hg${uid})`;
  const shine = (path, o = 0.35) => `<path d="${path}" stroke="${hl}" stroke-width="4" fill="none" opacity="${o}" stroke-linecap="round"/>`;
  const cap = `<path d="M97 152C90 98 116 66 150 66C184 66 210 98 203 152C199 128 190 110 172 100C164 96 156 93 150 92C144 93 136 96 128 100C110 110 101 128 97 152Z" fill="${g}"/>` + shine('M118 90Q136 72 160 74', 0.4);
  const sweep = `<path d="M97 154C88 98 116 64 152 64C192 64 212 100 203 154C198 126 186 106 166 96C150 114 122 124 104 132C100 140 98 148 97 154Z" fill="${g}"/>` + shine('M120 86Q146 68 176 78', 0.4);
  const longBack = `<path d="M96 130C74 200 84 300 70 400L230 400C216 300 226 200 204 130C206 72 178 52 150 52C122 52 94 72 96 130Z" fill="${g}"/>`;
  const out = { back: '', over: '', front: cap };
  switch (style) {
    case 'long':
      out.back = longBack;
      out.over = `<path d="M103 146C90 210 98 300 88 372C104 340 114 270 116 190Z" fill="${g}"/><path d="M197 146C210 210 202 300 212 372C196 340 186 270 184 190Z" fill="${g}"/>` + shine('M100 200Q96 270 94 330', 0.3) + shine('M200 200Q204 270 206 330', 0.3);
      break;
    case 'straight':
      out.back = `<path d="M97 130C84 210 88 310 80 400L220 400C212 310 216 210 203 130C205 72 178 54 150 54C122 54 95 72 97 130Z" fill="${g}"/>`;
      out.over = `<path d="M102 140C96 220 104 320 96 396L112 396C120 320 116 220 118 160Z" fill="${g}"/><path d="M198 140C204 220 196 320 204 396L188 396C180 320 184 220 182 160Z" fill="${g}"/>` + shine('M106 190L102 330', 0.3) + shine('M194 190L198 330', 0.3);
      out.front = sweep;
      break;
    case 'wavy':
      out.back = `<path d="M96 130C86 150 84 170 84 190 ${wave(84, 190, 440, 14, 1, 6)}L216 440 ${wave(216, 440, 190, 14, -1, 6)}C216 170 214 150 204 130C206 72 178 52 150 52C122 52 94 72 96 130Z" fill="${g}"/>`;
      out.over = `<path d="M102 146C86 200 108 230 94 290C92 330 108 350 100 376C122 340 120 300 124 270C114 240 116 200 118 170Z" fill="${g}"/><path d="M198 146C214 200 192 230 206 290C208 330 192 350 200 376C178 340 180 300 176 270C186 240 184 200 182 170Z" fill="${g}"/>` + shine('M98 220Q108 260 100 330', 0.3);
      out.front = sweep;
      break;
    case 'bob':
      out.back = `<path d="M95 130C82 172 88 216 106 240L194 240C212 216 218 172 205 130C206 72 178 54 150 54C122 54 94 72 95 130Z" fill="${g}"/>`;
      out.over = `<path d="M100 150C92 190 100 224 118 238C112 214 112 190 116 166Z" fill="${g}"/><path d="M200 150C208 190 200 224 182 238C188 214 188 190 184 166Z" fill="${g}"/>`;
      break;
    case 'lob':
      out.back = `<path d="M95 130C80 190 86 250 98 292L202 292C214 250 220 190 205 130C206 72 178 54 150 54C122 54 94 72 95 130Z" fill="${g}"/>`;
      out.over = `<path d="M101 148C90 200 98 262 108 290C116 250 116 200 118 168Z" fill="${g}"/><path d="M199 148C210 200 202 262 192 290C184 250 184 200 182 168Z" fill="${g}"/>`;
      out.front = sweep;
      break;
    case 'pixie':
      out.back = '';
      out.front = `<path d="M92 152C82 92 112 60 150 60C190 60 218 92 208 152C204 124 196 104 178 92C150 108 122 102 106 94C98 110 94 130 92 152Z" fill="${g}"/><path d="M96 150C96 170 98 178 102 186C102 168 102 158 100 150Z" fill="${g}"/><path d="M204 150C204 170 202 178 198 186C198 168 198 158 200 150Z" fill="${g}"/>` + shine('M116 86Q144 66 180 82', 0.45);
      break;
    case 'buzz':
      out.front = `<path d="M99 148C94 98 118 70 150 70C182 70 206 98 201 148C198 120 188 104 150 100C112 104 102 120 99 148Z" fill="${shade(c, -5)}" opacity=".88"/>`;
      break;
    case 'ponytail':
      out.back = `<path d="M200 112C252 118 268 200 244 300C238 244 228 196 204 150Z" fill="${g}"/><path d="M96 130C94 72 120 52 150 52C180 52 206 72 204 130Z" fill="${g}"/>`;
      out.front = sweep + `<ellipse cx="206" cy="116" rx="8" ry="10" fill="${shade(c, 35)}"/>`;
      break;
    case 'bun':
      out.back = `<circle cx="150" cy="46" r="30" fill="${g}"/><path d="M96 130C94 72 120 52 150 52C180 52 206 72 204 130Z" fill="${g}"/>`;
      out.front = cap + shine('M132 34Q150 24 170 36', 0.45) + `<path d="M104 78C126 62 174 62 196 78" stroke="${d}" stroke-width="3" fill="none" opacity=".35"/>`;
      break;
    case 'braid': {
      out.back = `<path d="M96 130C84 190 90 250 98 290L202 290C210 250 216 190 204 130C206 72 178 52 150 52C122 52 94 72 96 130Z" fill="${g}"/>`;
      let br = '';
      for (let i = 0; i < 9; i++) br += `<ellipse cx="${f1(196 + (i % 2 ? 5 : -2) + i * 1.5)}" cy="${150 + i * 26}" rx="13" ry="15" fill="${i % 2 ? c : d}" stroke="${d}" stroke-opacity=".45"/>`;
      out.over = br + `<ellipse cx="212" cy="390" rx="7" ry="5" fill="${shade(c, 35)}"/>`;
      out.front = sweep;
      break;
    }
    case 'curls': {
      let b = '', ov = '';
      const pts = [[88, 120, 30], [76, 168, 28], [82, 214, 28], [90, 262, 26], [212, 120, 30], [224, 168, 28], [218, 214, 28], [210, 262, 26], [110, 74, 32], [150, 58, 36], [190, 74, 32], [96, 306, 24], [204, 306, 24]];
      for (const [x, y, r] of pts) b += `<circle cx="${x}" cy="${y}" r="${r}" fill="${g}" stroke="${d}" stroke-opacity=".25"/>`;
      for (const [x, y, r] of [[104, 190, 22], [98, 240, 22], [196, 190, 22], [202, 240, 22], [108, 290, 20], [192, 290, 20]]) ov += `<circle cx="${x}" cy="${y}" r="${r}" fill="${g}" stroke="${d}" stroke-opacity=".25"/>`;
      out.back = b; out.over = ov;
      out.front = `<path d="M97 150C92 100 116 76 150 76C184 76 208 100 203 150C196 118 176 100 150 100C124 100 104 118 97 150Z" fill="${g}"/>` + [[122, 88], [150, 82], [178, 88]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="${g}" stroke="${d}" stroke-opacity=".22"/>`).join('');
      break;
    }
    case 'afro': {
      let b = '';
      const pts = [[150, 92, 78], [86, 120, 40], [214, 120, 40], [100, 72, 40], [200, 72, 40], [150, 30, 42], [72, 168, 30], [228, 168, 30], [120, 44, 36], [180, 44, 36]];
      for (const [x, y, r] of pts) b += `<circle cx="${x}" cy="${y}" r="${r}" fill="${g}" stroke="${d}" stroke-opacity=".2"/>`;
      out.back = b;
      out.front = `<path d="M97 150C92 104 114 80 150 80C186 80 208 104 203 150C196 122 178 108 150 108C122 108 104 122 97 150Z" fill="${g}"/>` + shine('M110 80Q150 56 190 80', 0.35);
      break;
    }
    case 'boxbraids': {
      let b = '', ov = '';
      const strand = (x0, y0, x1, n, w) => { let s = ''; for (let i = 0; i < n; i++) { const t = i / n; s += `<ellipse cx="${f1(x0 + (x1 - x0) * t)}" cy="${f1(y0 + (440 - y0) * t)}" rx="${w}" ry="${w * 1.35}" fill="${i % 2 ? c : d}" stroke="${d}" stroke-opacity=".4"/>`; } return s; };
      for (const [x0, x1] of [[100, 70], [112, 90], [124, 108], [176, 192], [188, 210], [200, 230]]) b += strand(x0, 96, x1, 14, 6.5);
      for (const [x0, x1] of [[100, 84], [108, 104], [200, 216], [192, 196]]) ov += strand(x0, 130, x1, 10, 6.5);
      out.back = `<path d="M96 130C94 72 120 52 150 52C180 52 206 72 204 130Z" fill="${g}"/>` + b;
      out.over = ov;
      out.front = cap;
      break;
    }
    default: out.back = longBack;
  }
  return out;
}

/* ------------------------------ OUTFITS ------------------------------ */
// Each garment is drawn over the torso (clipped to it). Bust geometry is passed in so cups sit correctly for every body type.
function garment(kind, col, B, skin, sh, uid) {
  const dk = shade(col, -22), lt = shade(col, 24), by = B.by, bo = B.bo, r = B.r, sw = B.sw;
  const satin = `url(#sat${uid})`, lace = `url(#lace${uid})`;
  const strap = (x1, y1, x2, y2, w = 6, fill = col) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${fill}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
  const cups = (fill, overlay, rim) => [-1, 1].map((s) => {
    const cx = 150 + s * bo;
    const path = `M${f1(150 + s * 4)} ${f1(by - r * 1.15)}C${f1(150 + s * (bo + r * 0.3))} ${f1(by - r * 1.0)} ${f1(150 + s * (bo + r * 1.2))} ${f1(by - r * 0.55)} ${f1(150 + s * (bo + r * 1.28))} ${f1(by + r * 0.35)}C${f1(150 + s * (bo + r * 1.0))} ${f1(by + r * 1.25)} ${f1(150 + s * (bo - r * 0.3))} ${f1(by + r * 1.3)} ${f1(150 + s * 4)} ${f1(by + r * 0.6)}Z`;
    return `<path d="${path}" fill="${fill}"/>${overlay ? `<path d="${path}" fill="${overlay}" opacity=".8"/>` : ''}<path d="${path}" fill="none" stroke="${rim}" stroke-width="1.6" opacity=".7"/>`;
  }).join('');
  switch (kind) {
    case 'bralette': case 'lingerie':
      return strap(150 - bo - r * 0.9, by - r * 0.7, 150 - 36, 250, 5) + strap(150 + bo + r * 0.9, by - r * 0.7, 150 + 36, 250, 5)
        + `<path d="M${150 - sw + 14} ${by + r * 1.15}Q150 ${by + r * 1.5} ${150 + sw - 14} ${by + r * 1.15}L${150 + sw - 14} ${by + r * 1.15 + 11}Q150 ${by + r * 1.5 + 11} ${150 - sw + 14} ${by + r * 1.15 + 11}Z" fill="${col}"/><path d="M${150 - sw + 14} ${by + r * 1.15 + 11}Q150 ${by + r * 1.5 + 11} ${150 + sw - 14} ${by + r * 1.15 + 11}" stroke="${lt}" stroke-width="2" fill="none" stroke-dasharray="2 3"/>`
        + cups(col, lace, dk) + `<circle cx="150" cy="${f1(by + r * 0.35)}" r="3.6" fill="${lt}" stroke="${dk}"/>`;
    case 'bikini':
      return strap(150 - bo - r * 0.8, by - r * 0.6, 150 - 28, 250, 4) + strap(150 + bo + r * 0.8, by - r * 0.6, 150 + 28, 250, 4) + cups(satin, '', dk)
        + `<circle cx="150" cy="${f1(by + r * 0.2)}" r="4" fill="${lt}" stroke="${dk}"/>`;
    case 'sportsbra':
      return `<path d="M${150 - sw + 10} ${by + r * 1.2}L${150 - 38} 252L${150 - 24} 252C${150 - 12} ${by - r * 0.9} ${150 + 12} ${by - r * 0.9} ${150 + 24} 252L${150 + 38} 252L${150 + sw - 10} ${by + r * 1.2}Z" fill="${col}"/><path d="M${150 - sw + 10} ${by + r * 1.05}H${150 + sw - 10}" stroke="${dk}" stroke-width="3" opacity=".4"/>`
        + `<path d="M${150 - sw + 10} ${by + r * 1.2}H${150 + sw - 10}V${by + r * 1.7}H${150 - sw + 10}Z" fill="${dk}"/>`;
    case 'camisole':
      return `<path d="M${150 - 36} 250Q${150 - 34} ${by - r * 1.2} ${150 - bo - r * 1.4} ${by + r * 0.4}L${150 - sw + 12} 400H${150 + sw - 12}L${150 + bo + r * 1.4} ${by + r * 0.4}Q${150 + 34} ${by - r * 1.2} ${150 + 36} 250L${150 + 24} 250Q150 ${by - r * 0.4 + 14} ${150 - 24} 250Z" fill="${satin}"/>`
        + `<path d="M${150 - 24} 250Q150 ${by - r * 0.4 + 14} ${150 + 24} 250" stroke="${lt}" stroke-width="5" fill="none" opacity=".6" stroke-dasharray="1.5 3.5" stroke-linecap="round"/>` + strap(150 - 30, 252, 150 - 33, 244, 5) + strap(150 + 30, 252, 150 + 33, 244, 5);
    case 'slip':
      return `<path d="M${150 - 34} 248C${150 - 30} ${by - r * 0.5} ${150 - bo - r * 1.2} ${by - r * 0.1} ${150 - bo - r * 1.3} ${by + r * 0.8}L${150 - sw + 10} 400H${150 + sw - 10}L${150 + bo + r * 1.3} ${by + r * 0.8}C${150 + bo + r * 1.2} ${by - r * 0.1} ${150 + 30} ${by - r * 0.5} ${150 + 34} 248L${150 + 24} 248C${150 + 14} ${by - r * 0.1} ${150 - 14} ${by - r * 0.1} ${150 - 24} 248Z" fill="${satin}"/>`
        + `<path d="M${150 - 40} ${by + r * 1.6}L${150 - 20} 400M${150 + 40} ${by + r * 1.6}L${150 + 20} 400" stroke="#fff" stroke-width="5" opacity=".14"/>` + strap(150 - 29, 250, 150 - 33, 242, 4) + strap(150 + 29, 250, 150 + 33, 242, 4);
    case 'corset':
      return `<path d="M${150 - bo - r * 1.35} ${by - r * 0.1}Q${150 - bo} ${by - r * 1.5} 150 ${by - r * 0.6}Q${150 + bo} ${by - r * 1.5} ${150 + bo + r * 1.35} ${by - r * 0.1}L${150 + sw - 14} 400H${150 - sw + 14}Z" fill="${col}"/>`
        + `<path d="M${150 - bo - r * 1.35} ${by - r * 0.1}Q${150 - bo} ${by - r * 1.5} 150 ${by - r * 0.6}Q${150 + bo} ${by - r * 1.5} ${150 + bo + r * 1.35} ${by - r * 0.1}" stroke="${lt}" stroke-width="2" fill="none"/>`
        + [-46, -30, -14, 14, 30, 46].map((x) => `<path d="M${150 + x * 0.9} ${by + r * 0.9}L${150 + x * 1.0} 400" stroke="${dk}" stroke-width="2" opacity=".5"/>`).join('')
        + `<path d="M150 ${by - r * 0.4}V400" stroke="${lt}" stroke-width="3" stroke-dasharray="3 4" opacity=".8"/>`;
    case 'offshoulder':
      return `<path d="M${150 - sw - 8} 268Q150 ${250 + 6} ${150 + sw + 8} 268L${150 + sw + 12} 400H${150 - sw - 12}Z" fill="${col}"/><path d="M${150 - sw - 8} 268Q150 256 ${150 + sw + 8} 268" stroke="${lt}" stroke-width="6" fill="none" opacity=".7"/>`
        + `<path d="M${150 - sw - 12} 268L${150 - sw - 12} 400M${150 + sw + 12} 268L${150 + sw + 12} 400" stroke="${col}" stroke-width="10"/>`;
    case 'robe':
      return strap(150 - bo - r * 0.9, by - r * 0.7, 150 - 36, 250, 4, shade(col, -40)) + strap(150 + bo + r * 0.9, by - r * 0.7, 150 + 36, 250, 4, shade(col, -40)) + cups('#2a2025', lace, '#150f12')
        + `<path d="M${150 - sw - 10} 262C${150 - sw - 6} 300 ${150 - 40} 330 ${150 - 34} 400H${150 - sw - 14}Z" fill="${satin}"/><path d="M${150 + sw + 10} 262C${150 + sw + 6} 300 ${150 + 40} 330 ${150 + 34} 400H${150 + sw + 14}Z" fill="${satin}"/>`
        + `<path d="M${150 - sw + 4} 256C${150 - 60} 300 ${150 - 40} 340 ${150 - 34} 400" stroke="${lt}" stroke-width="5" fill="none" opacity=".7"/><path d="M${150 + sw - 4} 256C${150 + 60} 300 ${150 + 40} 340 ${150 + 34} 400" stroke="${lt}" stroke-width="5" fill="none" opacity=".7"/>`;
    case 'sweater':
      return `<path d="M${150 - sw - 10} 262Q150 236 ${150 + sw + 10} 262L${150 + sw + 12} 400H${150 - sw - 12}Z" fill="${col}"/><path d="M${150 - 34} 244Q150 276 ${150 + 34} 244" stroke="${dk}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M${150 - 34} 244Q150 276 ${150 + 34} 244" stroke="${lt}" stroke-width="3" fill="none" stroke-dasharray="2 4"/>`
        + [-30, -10, 10, 30].map((x) => `<path d="M${150 + x * 2} 300V400" stroke="${dk}" stroke-width="2" opacity=".18"/>`).join('');
    case 'dress':
      return `<path d="M${150 - 36} 248C${150 - 20} ${by - r * 0.2} ${150 - bo - r * 1.3} ${by - r * 0.6} ${150 - bo - r * 1.3} ${by + r * 0.5}L${150 - sw + 6} 400H${150 + sw - 6}L${150 + bo + r * 1.3} ${by + r * 0.5}C${150 + bo + r * 1.3} ${by - r * 0.6} ${150 + 20} ${by - r * 0.2} ${150 + 36} 248L${150 + 20} 248Q150 ${by - r * 0.9 + 18} ${150 - 20} 248Z" fill="${satin}"/>` + strap(150 - 30, 250, 150 - 34, 242, 7) + strap(150 + 30, 250, 150 + 34, 242, 7);
    case 'blazer':
      return `<path d="M${150 - sw - 10} 262Q150 240 ${150 + sw + 10} 262L${150 + sw + 12} 400H${150 - sw - 12}Z" fill="${col}"/><path d="M${150 - 22} 250L150 ${by + r * 1.4}L${150 - sw + 14} 400H${150 - 10}Z" fill="${dk}"/><path d="M${150 + 22} 250L150 ${by + r * 1.4}L${150 + sw - 14} 400H${150 + 10}Z" fill="${dk}"/><path d="M${150 - 22} 250L${150 - 8} ${by - r * 0.3}L${150 - 30} ${by - r * 0.3}Z" fill="${lt}" opacity=".4"/>`
        + `<path d="M${150 - 22} 250Q150 ${by - r * 0.2} ${150 + 22} 250L150 ${by + r * 1.4}Z" fill="#f7f1f1"/>`;
    case 'hoodie':
      return `<path d="M${150 - sw - 10} 262Q150 236 ${150 + sw + 10} 262L${150 + sw + 12} 400H${150 - sw - 12}Z" fill="${col}"/><ellipse cx="150" cy="246" rx="44" ry="16" fill="${dk}"/><ellipse cx="150" cy="248" rx="30" ry="11" fill="${sh}"/><path d="M138 262V310M162 262V310" stroke="#f3e9ea" stroke-width="3" stroke-linecap="round"/><path d="M${150 - 46} 364H${150 + 46}" stroke="${dk}" stroke-width="3" opacity=".3"/>`;
    case 'sundress':
      return `<path d="M${150 - 34} 248C${150 - 24} ${by - r * 0.6} ${150 - bo - r * 1.3} ${by - r * 0.3} ${150 - bo - r * 1.3} ${by + r * 0.5}L${150 - sw + 6} 400H${150 + sw - 6}L${150 + bo + r * 1.3} ${by + r * 0.5}C${150 + bo + r * 1.3} ${by - r * 0.3} ${150 + 24} ${by - r * 0.6} ${150 + 34} 248L${150 + 20} 248Q150 ${by - r * 0.5} ${150 - 20} 248Z" fill="${col}"/>`
        + [[130, 310], [168, 330], [150, 360], [118, 372], [184, 372], [140, 396]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="#fff" opacity=".7"/>`).join('') + strap(150 - 28, 250, 150 - 34, 242, 6) + strap(150 + 28, 250, 150 + 34, 242, 6);
    default: // tee
      return `<path d="M${150 - sw - 10} 262Q150 240 ${150 + sw + 10} 262L${150 + sw + 12} 330H${150 + sw - 12}L${150 + sw - 14} 400H${150 - sw + 14}L${150 - sw + 12} 330H${150 - sw - 12}Z" fill="${col}"/><path d="M${150 - 30} 246Q150 274 ${150 + 30} 246" stroke="${dk}" stroke-width="3" fill="none" opacity=".4"/><path d="M${150 - 30} 246Q150 270 ${150 + 30} 246L${150 + 30} 244Q150 262 ${150 - 30} 244Z" fill="${sh}"/>`;
  }
}
export const OUTFIT_LEVEL = { tee: 0, sweater: 0, hoodie: 0, blazer: 0, sundress: 0, dress: 1, camisole: 1, slip: 1, sportsbra: 1, offshoulder: 1, bikini: 2, corset: 2, bralette: 2, robe: 2, lingerie: 2 };

/* ------------------------------ FACE ------------------------------ */
function eyeShape(cx, s, o = {}) {
  // s = -1 for viewer-left eye (outer corner to the left), +1 for right
  const inner = cx - s * 13, outer = cx + s * 14, top = o.top ?? 138, bot = o.bot ?? 157;
  return { inner, outer, top, bot, d: `M${inner} 151C${f1(cx - s * 6)} ${top} ${f1(cx + s * 8)} ${top - 1} ${outer} 148C${f1(cx + s * 8)} ${bot} ${f1(cx - s * 5)} ${bot + 1} ${inner} 151Z` };
}
function eyes(expr, L, uid, mk) {
  const iris = L.eyeColor, hd = shade(L.hairColor, -50), liner = '#17100f';
  const wing = mk === 'glam' || mk === 'smoky' || mk === 'bold' ? 7 : 4;
  const shadow = mk === 'smoky' ? '#3d2a3a' : mk === 'glam' ? mix(L.lip || '#c0506b', '#d9a441', 0.5) : mk === 'bold' ? shade(L.lip || '#c0506b', 30) : shade(L.skin, -22);
  const shAlpha = mk === 'smoky' ? 0.55 : mk === 'natural' ? 0.18 : 0.38;
  const open = (cx, s, p = {}) => {
    const E = eyeShape(cx, s, { top: p.top, bot: p.bot });
    const dx = p.dx || 0, dy = p.dy || 0, ir = p.ir || 9.3;
    const lidSh = `<path d="M${E.inner} 149C${f1(cx - s * 6)} ${E.top - 6} ${f1(cx + s * 8)} ${E.top - 8} ${f1(E.outer + s * 3)} 145C${f1(cx + s * 8)} ${E.top - 2} ${f1(cx - s * 6)} ${E.top - 1} ${E.inner} 151Z" fill="${shadow}" opacity="${shAlpha}"/>`;
    return `<g transform="translate(${cx} 148) scale(1.12) translate(${-cx} -148)"><g class="av-eye">${lidSh}
<clipPath id="ec${uid}${s}"><path d="${E.d}"/></clipPath><path d="${E.d}" fill="#fffafa"/>
<g clip-path="url(#ec${uid}${s})"><circle cx="${cx + dx}" cy="${148 + dy}" r="${ir}" fill="url(#ir${uid})"/><circle cx="${cx + dx}" cy="${148 + dy}" r="${ir * 0.46}" fill="#0d0809"/><circle cx="${cx + dx - 3}" cy="${145 + dy}" r="2.6" fill="#fff"/><circle cx="${cx + dx + 3}" cy="${151 + dy}" r="1.3" fill="#fff" opacity=".8"/><path d="M${E.inner - 4} ${E.top - 2}H${E.outer + 4 * s}V${E.top + 6}H${E.inner - 4}Z" fill="#000" opacity=".12"/></g>
<path d="M${E.inner - s * 1} 151C${f1(cx - s * 6)} ${E.top - 1} ${f1(cx + s * 8)} ${E.top - 2} ${E.outer} 148" stroke="${liner}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
<path d="M${E.outer} 148L${E.outer + s * wing} ${148 - wing * 0.6}" stroke="${liner}" stroke-width="2.8" stroke-linecap="round"/>
<path d="M${E.outer - s * 3} 147l${s * 4} -4M${E.outer - s * 8} 143l${s * 3} -5" stroke="${liner}" stroke-width="1.3" stroke-linecap="round"/>
<path d="M${E.inner} 152C${f1(cx - s * 5)} ${E.bot + 1} ${f1(cx + s * 8)} ${E.bot} ${E.outer} 150" stroke="${hd}" stroke-width="1.1" fill="none" opacity=".5"/>
<path d="M${f1(E.inner + s * 2)} ${E.top - 4}C${f1(cx - s * 4)} ${E.top - 9} ${f1(cx + s * 6)} ${E.top - 10} ${f1(E.outer)} ${E.top - 2}" stroke="${shade(L.skin, -30)}" stroke-width="1.4" fill="none" opacity=".45"/></g></g>`;
  };
  const arc = (cx, s) => `<path d="M${cx - s * 13} 150C${cx - s * 6} 160 ${cx + s * 7} 161 ${cx + s * 14} 148" stroke="${liner}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M${cx + s * 14} 148l${s * 6} 4M${cx + s * 10} 154l${s * 4} 6M${cx + s * 4} 158l${s * 2} 6" stroke="${liner}" stroke-width="1.8" stroke-linecap="round"/><path d="M${cx - s * 11} 146C${cx - s * 4} 137 ${cx + s * 6} 137 ${cx + s * 13} 145" stroke="${shadow}" stroke-width="5" fill="none" opacity="${shAlpha}" stroke-linecap="round"/>`;
  const heart = (cx) => `<path d="M${cx} ${157}c-10-7-13-14-7-18c4-2 6 0 7 3c1-3 3-5 7-3c6 4 3 11-7 18z" fill="#e8537c" stroke="#b83a5c" stroke-width="1"/><circle cx="${cx - 3}" cy="143" r="1.8" fill="#fff"/>`;
  const L0 = 124, R0 = 176;
  switch (expr) {
    case 'laugh': return arc(L0, -1) + arc(R0, 1);
    case 'happy': return open(L0, -1) + open(R0, 1);
    case 'love': return heart(L0) + heart(R0);
    case 'wink': return open(L0, -1) + arc(R0, 1);
    case 'blush': return open(L0, -1, { dx: -2.5, dy: 3, top: 141 }) + open(R0, 1, { dx: -2.5, dy: 3, top: 141 });
    case 'caring': return open(L0, -1, { dy: 1.5 }) + open(R0, 1, { dy: 1.5 });
    case 'think': return open(L0, -1, { dx: 3.5, dy: -2.5 }) + open(R0, 1, { dx: 3.5, dy: -2.5 });
    case 'surprised': return open(L0, -1, { top: 134, bot: 159, ir: 9.8 }) + open(R0, 1, { top: 134, bot: 159, ir: 9.8 });
    case 'sultry': return open(L0, -1, { top: 143.5, bot: 156, dy: 1.2 }) + open(R0, 1, { top: 143.5, bot: 156, dy: 1.2 });
    case 'kiss': return open(L0, -1, { top: 141, dy: 1 }) + open(R0, 1, { top: 141, dy: 1 });
    default: return open(L0, -1) + open(R0, 1);
  }
}
function brows(expr, col) {
  const s = (d) => `<path d="${d}" stroke="${col}" stroke-width="4.2" fill="none" stroke-linecap="round" opacity=".92"/>`;
  switch (expr) {
    case 'caring': return s('M105 128Q119 122 136 117') + s('M164 117Q181 122 195 128');
    case 'surprised': return s('M106 120Q121 108 136 114') + s('M164 114Q179 108 194 120');
    case 'think': return s('M106 126Q121 119 136 124') + s('M164 114Q180 108 195 116');
    case 'happy': case 'love': case 'laugh': return s('M106 124Q121 113 137 120') + s('M163 120Q179 113 194 124');
    case 'wink': return s('M106 125Q121 115 137 121') + s('M163 117Q179 111 194 119');
    case 'sultry': return s('M105 127Q120 116 137 122') + s('M163 120Q180 115 195 127');
    default: return s('M105 126Q121 114 137 121') + s('M163 121Q179 114 195 126');
  }
}
function mouth(expr, lip, mk) {
  const dk = shade(lip, -42), hi = shade(lip, 45);
  const grad = `url(#lp${'' /* replaced below */})`;
  void grad;
  const upper = 'M126 192C136 185 144 183 150 187C156 183 164 185 174 192C164 194 156 195 150 195C144 195 136 194 126 192Z';
  const lower = 'M126 192C136 194 144 195 150 195C156 195 164 194 174 192C168 206 158 211 150 211C142 211 132 206 126 192Z';
  const lips = (up, lo, extra = '') => `<path d="${lo}" fill="__LIP__"/><path d="${up}" fill="${shade(lip, -12)}"/>${extra}`;
  const gloss = `<ellipse cx="150" cy="202" rx="9" ry="2.6" fill="#fff" opacity=".55"/><path d="M134 188Q142 185 148 187" stroke="#fff" stroke-width="1.6" fill="none" opacity=".4" stroke-linecap="round"/>`;
  const line = (d) => `<path d="${d}" stroke="${dk}" stroke-width="1.5" fill="none" opacity=".6" stroke-linecap="round"/>`;
  switch (expr) {
    case 'happy': return `<path d="M128 192C138 190 144 191 150 192C156 191 162 190 172 192C168 199 160 202 150 202C140 202 132 199 128 192Z" fill="${dk}"/><path d="M131 192.6C139 191.6 144 192.2 150 192.4C156 192.2 161 191.6 169 192.6C166 197 159 198.6 150 198.6C141 198.6 134 197 131 192.6Z" fill="#fffafa"/><path d="M124 191C136 186 144 184 150 187.5C156 184 164 186 176 191C164 193.5 156 194 150 194C144 194 136 193.5 124 191Z" fill="${shade(lip, -12)}"/><path d="M126 192.5C136 195 144 196 150 196C156 196 164 195 174 192.5C170 205 160 209 150 209C140 209 130 205 126 192.5Z" fill="__LIP__"/><ellipse cx="150" cy="203" rx="8" ry="2" fill="#fff" opacity=".5"/>`;
    case 'laugh': return `<path d="M126 191C138 189 144 190 150 191C156 190 162 189 174 191C171 203 162 208 150 208C138 208 129 203 126 191Z" fill="${dk}"/><path d="M129 191.6C139 190.6 144 191.2 150 191.4C156 191.2 161 190.6 171 191.6C168 197 160 199 150 199C140 199 132 197 129 191.6Z" fill="#fffafa"/><path d="M138 204C144 200 156 200 162 204C157 208 143 208 138 204Z" fill="#e8738f"/><path d="M122 190C135 184.5 144 183.5 150 187C156 183.5 165 184.5 178 190C165 192.5 156 193 150 193C144 193 135 192.5 122 190Z" fill="${shade(lip, -12)}"/><path d="M124 191C134 194 144 195 150 195C156 195 166 194 176 191C172 208 162 213 150 213C138 213 128 208 124 191Z" fill="__LIP__"/>`;
    case 'love': case 'blush': return lips('M127 192C136 186 144 184 150 188C156 184 164 186 173 192C164 194 156 195 150 195C144 195 136 194 127 192Z', 'M127 192C136 194 144 195 150 195C156 195 164 194 173 192C167 204 158 208 150 208C142 208 133 204 127 192Z') + gloss;
    case 'caring': return lips(upper, 'M126 192C136 194 144 195 150 195C156 195 164 194 174 192C168 203 158 207 150 207C142 207 132 203 126 192Z') + gloss;
    case 'surprised': return `<ellipse cx="150" cy="199" rx="9" ry="11" fill="${dk}"/><ellipse cx="150" cy="199" rx="9" ry="11" fill="none" stroke="__LIP__" stroke-width="4"/><path d="M143 190Q150 186 157 190" stroke="${hi}" stroke-width="1.6" fill="none" opacity=".5"/>`;
    case 'think': return lips('M128 194C136 189 144 187 150 189C156 187 164 188 172 190C164 195 156 196 150 196C144 196 136 196 128 194Z', 'M128 194C136 196 144 197 150 197C156 197 164 196 172 190C166 204 156 207 150 207C142 207 134 203 128 194Z') + gloss;
    case 'wink': return `<path d="M128 192C138 190 144 191 150 192C156 191 162 190 172 192C168 199 160 202 150 202C140 202 132 199 128 192Z" fill="${dk}"/><path d="M131 192.6C139 191.6 144 192.2 150 192.4C156 192.2 161 191.6 169 192.6C166 197 159 198.6 150 198.6C141 198.6 134 197 131 192.6Z" fill="#fffafa"/><path d="M124 190C136 185 144 184 150 187.5C156 184 164 186 176 191C164 193.5 156 194 150 194C144 194 136 193.5 124 191Z" fill="${shade(lip, -12)}"/><path d="M126 192C136 195 144 196 150 196C156 196 164 195 174 192.5C170 205 160 209 150 209C140 209 130 205 126 192.5Z" fill="__LIP__"/><ellipse cx="150" cy="203" rx="8" ry="2" fill="#fff" opacity=".5"/>`;
    case 'sultry': return `<path d="M126 192C136 185 144 183 150 187C156 183 164 185 174 192C164 196 156 197 150 197C144 197 136 196 126 192Z" fill="${shade(lip, -12)}"/><path d="M128 193C138 197 144 198 150 198C156 198 162 197 172 193C168 207 158 211 150 211C142 211 132 207 128 193Z" fill="__LIP__"/><path d="M134 194C144 195.6 156 195.6 166 194" stroke="${dk}" stroke-width="1.3" fill="none" opacity=".7"/><path d="M140 199C146 197 154 197 160 199" stroke="#fffafa" stroke-width="1.8" fill="none" opacity=".75" stroke-linecap="round"/>` + gloss;
    case 'kiss': return `<path d="M138 190C142 184 146 184 150 187C154 184 158 184 162 190C158 193 154 194 150 194C146 194 142 193 138 190Z" fill="${shade(lip, -12)}"/><path d="M138 190C142 194 146 195 150 195C154 195 158 194 162 190C160 200 156 205 150 205C144 205 140 200 138 190Z" fill="__LIP__"/><ellipse cx="150" cy="199" rx="5" ry="2" fill="#fff" opacity=".5"/>` + `<path d="M138 190L150 193L162 190" stroke="${dk}" stroke-width="1.2" fill="none" opacity=".6"/>`;
    default: return lips(upper, lower) + gloss + line('M126 192C136 194 144 195 150 195C156 195 164 194 174 192');
  }
}

/* ------------------------------ SCENES ------------------------------ */
function sceneSVG(scene, L, uid) {
  const [b1, b2] = BG[L.aesthetic] || BG.romantic;
  const bokeh = (n, cols, seed = 1) => { let s = '', k = seed * 9301; const rnd = () => { k = (k * 9301 + 49297) % 233280; return k / 233280; }; for (let i = 0; i < n; i++) s += `<circle cx="${Math.round(rnd() * 300)}" cy="${Math.round(rnd() * 240)}" r="${6 + Math.round(rnd() * 16)}" fill="${cols[i % cols.length]}" opacity="${(0.16 + rnd() * 0.25).toFixed(2)}"/>`; return s; };
  switch (scene) {
    case 'bedroom': return `<defs><linearGradient id="sc${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2433"/><stop offset="1" stop-color="#7a4458"/></linearGradient><radialGradient id="lamp${uid}" cx=".82" cy=".22" r=".55"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".9"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></radialGradient></defs><rect width="300" height="400" fill="url(#sc${uid})"/><rect x="0" y="40" width="300" height="190" fill="#5a3347" opacity=".55"/><path d="M0 250Q80 220 150 236T300 226V400H0Z" fill="#e9c9d4" opacity=".55"/><ellipse cx="70" cy="262" rx="70" ry="30" fill="#f6e3ea" opacity=".6"/><ellipse cx="250" cy="270" rx="60" ry="26" fill="#f6e3ea" opacity=".5"/><rect width="300" height="400" fill="url(#lamp${uid})"/>` + bokeh(8, ['#ffd9a0', '#ffb3c8'], 3);
    case 'beach': return `<defs><linearGradient id="sc${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd3a8"/><stop offset=".45" stop-color="#ff9fb4"/><stop offset=".62" stop-color="#7cc3d9"/><stop offset="1" stop-color="#e9cf9f"/></linearGradient></defs><rect width="300" height="400" fill="url(#sc${uid})"/><circle cx="226" cy="150" r="34" fill="#fff4d6" opacity=".9"/><rect y="188" width="300" height="3" fill="#fff" opacity=".35"/><path d="M0 228Q60 216 120 228T240 226T300 224V400H0Z" fill="#e9cf9f"/><path d="M0 216Q50 206 100 214T200 212T300 208" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>`;
    case 'gym': return `<defs><linearGradient id="sc${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4f5c"/><stop offset="1" stop-color="#262932"/></linearGradient></defs><rect width="300" height="400" fill="url(#sc${uid})"/><rect x="14" y="40" width="120" height="190" rx="6" fill="#aeb9c8" opacity=".22"/><rect x="170" y="70" width="110" height="10" rx="4" fill="#111" opacity=".5"/><g fill="#111" opacity=".55"><circle cx="190" cy="104" r="14"/><circle cx="250" cy="104" r="14"/><rect x="190" y="101" width="60" height="6"/></g><path d="M0 260H300" stroke="#fff" stroke-opacity=".08" stroke-width="2"/>` + bokeh(4, ['#7ad7ff', '#ff7ab8'], 5);
    case 'cafe': return `<defs><linearGradient id="sc${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8c9a4"/><stop offset="1" stop-color="#9c6b4b"/></linearGradient></defs><rect width="300" height="400" fill="url(#sc${uid})"/><rect x="190" y="30" width="96" height="140" rx="6" fill="#fff3d9" opacity=".55"/><path d="M190 100H286M238 30V170" stroke="#9c6b4b" stroke-width="3" opacity=".6"/>` + bokeh(10, ['#fff0c4', '#ffd08a', '#ffe9b8'], 7);
    case 'night': return `<defs><linearGradient id="sc${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1636"/><stop offset="1" stop-color="#5a2f64"/></linearGradient></defs><rect width="300" height="400" fill="url(#sc${uid})"/><g fill="#0f0c24" opacity=".85"><rect x="0" y="150" width="40" height="120"/><rect x="46" y="110" width="34" height="160"/><rect x="86" y="170" width="48" height="100"/><rect x="200" y="130" width="40" height="140"/><rect x="246" y="160" width="54" height="110"/></g>` + bokeh(16, ['#ffd36b', '#ff7ab8', '#7ad7ff'], 11);
    case 'garden': return `<defs><linearGradient id="sc${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9f0d0"/><stop offset="1" stop-color="#6fae7c"/></linearGradient></defs><rect width="300" height="400" fill="url(#sc${uid})"/>` + bokeh(12, ['#fff', '#ffc1d6', '#ffe48a', '#c6f0a8'], 13);
    case 'studio': default: return `<defs><linearGradient id="sc${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b1}"/><stop offset="1" stop-color="${b2}"/></linearGradient><radialGradient id="gl${uid}" cx=".8" cy=".12" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="300" height="400" fill="url(#sc${uid})"/><rect width="300" height="400" fill="url(#gl${uid})"/>` + bokeh(6, ['#ffffff'], 2);
  }
}
export const SCENES = { studio: 'Studio', bedroom: 'Bedroom', beach: 'Beach', gym: 'Gym', cafe: 'Café', night: 'City night', garden: 'Garden' };

/* ------------------------------ MAIN ------------------------------ */
/**
 * @param look   persona.look
 * @param expr   expression name
 * @param o      { uid, scene, outfit, pose: 'neutral'|'tilt'|'hair', crop: 'avatar'|'full', outfitColor }
 */
export function portraitSVG(look, expr = 'neutral', o = {}) {
  expr = ALIAS[expr] || (EXPRESSIONS.includes(expr) ? expr : 'neutral');
  const uid = o.uid || 'p', L = look;
  const crop = o.crop || 'avatar';
  const skin = L.skin, sh = shade(skin, -14), sh2 = shade(skin, -26), hl = shade(skin, 12);
  const hair = L.hairColor, hd = shade(hair, -30), hh = shade(hair, 30);
  const lip = L.lip || '#c0506b', mk = L.makeup || 'natural';
  const body = BODY[L.bodyType] || BODY.average;
  const outfit = o.outfit || L.outfit || 'tee', outCol = o.outfitColor || L.outfitColor || '#c2577a';
  const scene = o.scene || 'studio', pose = o.pose || 'neutral';
  const bo = 28 + body.bust * 0.8, r = body.bust * 0.9, by = 318 + body.bust * 0.5;
  const B = { bo, r, by, sw: body.sw };
  const sw = body.sw, arm = body.arm;
  const parts = hairParts(L.hairStyle, hair, hd, hh, uid);
  const blush = (expr === 'blush' || expr === 'love' ? 0.55 : expr === 'happy' || expr === 'laugh' || expr === 'sultry' ? 0.38 : 0.24) * (mk === 'natural' ? 1 : 1.15);
  const blushCol = mk === 'bold' ? '#ff6f93' : '#ff8fa6';
  const vb = crop === 'full' ? '0 0 300 400' : '40 56 220 220';
  const torso = `M135 236C130 250 112 254 ${150 - sw + 12} 260C${150 - sw - 2} 264 ${150 - sw - 8} 280 ${150 - sw - 8} 310L${150 - sw - 6} 400H${150 + sw + 6}L${150 + sw + 8} 310C${150 + sw + 8} 280 ${150 + sw + 2} 264 ${150 + sw - 12} 260C188 254 170 250 165 236Z`;
  const tilt = pose === 'tilt' ? 'rotate(-5 150 236)' : pose === 'hair' ? 'rotate(4 150 236)' : '';
  const freckles = L.freckles ? [[118, 168], [124, 172], [131, 169], [137, 174], [163, 174], [169, 169], [176, 172], [182, 168], [150, 166], [143, 162], [157, 162], [112, 174], [188, 174]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="${shade(skin, -38)}" opacity=".55"/>`).join('') : '';
  const mole = L.beautyMark ? `<circle cx="172" cy="196" r="1.8" fill="#3a2220" opacity=".85"/>` : '';
  const acc = accessory(L.accessory, outCol, hair, uid);
  const handUp = pose === 'hair' ? `<g><path d="M${150 + sw + 2} 270C${150 + sw + 40} 292 ${150 + sw + 44} 350 ${150 + sw + 20} 384" stroke="${skin}" stroke-width="${arm + 4}" fill="none" stroke-linecap="round"/><path d="M${150 + sw - 2} 268C${150 + sw + 34} 280 ${150 + sw + 34} 200 ${f1(150 + 56)} 160" stroke="${skin}" stroke-width="${arm - 2}" fill="none" stroke-linecap="round"/><ellipse cx="206" cy="150" rx="11" ry="15" fill="${skin}" transform="rotate(18 206 150)"/><path d="M198 140l-4 -12M204 136l-1 -14M211 138l3 -13M215 146l7 -9" stroke="${skin}" stroke-width="5" stroke-linecap="round"/><path d="M${150 + sw - 2} 268C${150 + sw + 34} 280 ${150 + sw + 34} 200 ${f1(150 + 56)} 160" stroke="${sh}" stroke-width="2" fill="none" opacity=".3" transform="translate(4 3)"/></g>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="Portrait, ${expr}" class="av-svg" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="hg${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(hair, 14)}"/><stop offset=".55" stop-color="${hair}"/><stop offset="1" stop-color="${shade(hair, -26)}"/></linearGradient>
<radialGradient id="fg${uid}" cx=".42" cy=".34" r=".78"><stop offset="0" stop-color="${hl}"/><stop offset=".65" stop-color="${skin}"/><stop offset="1" stop-color="${sh}"/></radialGradient>
<radialGradient id="ir${uid}" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="${shade(L.eyeColor, 38)}"/><stop offset=".6" stop-color="${L.eyeColor}"/><stop offset="1" stop-color="${shade(L.eyeColor, -45)}"/></radialGradient>
<linearGradient id="bg${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hl}"/><stop offset="1" stop-color="${sh}"/></linearGradient>
<linearGradient id="nk${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sh2}"/><stop offset=".4" stop-color="${sh}"/><stop offset="1" stop-color="${skin}"/></linearGradient>
<radialGradient id="bs${uid}" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="${hl}"/><stop offset=".7" stop-color="${skin}"/><stop offset="1" stop-color="${sh2}"/></radialGradient>
<linearGradient id="lp${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(lip, 14)}"/><stop offset="1" stop-color="${shade(lip, -14)}"/></linearGradient>
<linearGradient id="sat${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(outCol, 26)}"/><stop offset=".45" stop-color="${outCol}"/><stop offset=".6" stop-color="${shade(outCol, 14)}"/><stop offset="1" stop-color="${shade(outCol, -28)}"/></linearGradient>
<pattern id="lace${uid}" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0 3.5Q3.5 0 7 3.5Q3.5 7 0 3.5Z" fill="none" stroke="#fff" stroke-opacity=".42" stroke-width=".9"/><circle cx="3.5" cy="3.5" r=".8" fill="#fff" opacity=".4"/></pattern>
<clipPath id="tc${uid}"><path d="${torso}"/></clipPath>
<clipPath id="fr${uid}"><rect width="300" height="400" rx="${crop === 'full' ? 22 : 48}" x="0"/></clipPath>
</defs>
<g clip-path="${crop === 'full' ? '' : `url(#fr${uid})`}">
${sceneSVG(scene, L, uid)}
<g class="av-body" transform="${tilt}">
<g transform="translate(150 228) scale(.9) translate(-150 -228)">${parts.back}</g>
<path d="M134 190V254C142 264 158 264 166 254V190Z" fill="url(#nk${uid})"/>
<path d="${torso}" fill="url(#bg${uid})"/>
<g clip-path="url(#tc${uid})">
<ellipse cx="${150 - bo}" cy="${by}" rx="${r * 1.2}" ry="${r * 1.1}" fill="url(#bs${uid})"/><ellipse cx="${150 + bo}" cy="${by}" rx="${r * 1.2}" ry="${r * 1.1}" fill="url(#bs${uid})"/>
<path d="M150 ${by - r * 0.8}Q150 ${by + r * 0.4} 150 ${by + r * 1.3}" stroke="${sh2}" stroke-width="${3 + body.bust * 0.12}" opacity=".5" stroke-linecap="round" fill="none"/>
<path d="M${150 - sw + arm + 4} 292C${150 - sw + arm} 330 ${150 - sw + arm - 2} 370 ${150 - sw + arm - 4} 400M${150 + sw - arm - 4} 292C${150 + sw - arm} 330 ${150 + sw - arm + 2} 370 ${150 + sw - arm + 4} 400" stroke="${sh2}" stroke-width="2.4" opacity=".28" fill="none"/>
<path d="M136 258Q118 252 104 258M164 258Q182 252 196 258" stroke="${sh2}" stroke-width="2" opacity=".35" fill="none" stroke-linecap="round"/>
${garment(outfit, outCol, B, skin, sh, uid)}
</g>
${acc.neck}
${handUp}
<g transform="translate(150 228) scale(.9) translate(-150 -228)">
${parts.over}
<ellipse cx="97" cy="160" rx="7" ry="12" fill="${skin}"/><ellipse cx="203" cy="160" rx="7" ry="12" fill="${skin}"/>
<path d="M97 150C94 106 116 84 150 84C184 84 206 106 203 150C201 186 182 214 150 220C118 214 99 186 97 150Z" fill="url(#fg${uid})"/>
<path d="M104 176C112 202 130 216 150 219C170 216 188 202 196 176C190 196 172 210 150 212C128 210 110 196 104 176Z" fill="${sh2}" opacity=".22"/>
<path d="M99 150C100 176 108 196 122 208M201 150C200 176 192 196 178 208" stroke="${sh2}" stroke-width="5" fill="none" opacity=".12" stroke-linecap="round"/>
<ellipse cx="112" cy="172" rx="15" ry="9" fill="${blushCol}" opacity="${blush}"/><ellipse cx="188" cy="172" rx="15" ry="9" fill="${blushCol}" opacity="${blush}"/>
<path d="M118 104C132 96 168 96 182 104C168 100 132 100 118 104Z" fill="${hl}" opacity=".35"/>
<ellipse cx="150" cy="168" rx="4" ry="9" fill="${hl}" opacity=".35"/><ellipse cx="124" cy="164" rx="12" ry="4" fill="${sh2}" opacity=".1"/>
<path d="M146 152C145 164 142 170 140 174C144 178 156 178 160 174C158 170 155 164 154 152" stroke="${sh2}" stroke-width="1.6" fill="none" opacity=".42" stroke-linecap="round"/>
<ellipse cx="141" cy="176" rx="2.4" ry="1.5" fill="${sh2}" opacity=".55"/><ellipse cx="159" cy="176" rx="2.4" ry="1.5" fill="${sh2}" opacity=".55"/>
${freckles}
${eyes(expr, L, uid, mk)}
${brows(expr, shade(hair, -45))}
${mouth(expr, lip, mk).replace(/__LIP__/g, `url(#lp${uid})`)}
${mole}
${parts.front}
${acc.head}
</g>
</g>
${extras(expr, crop)}
</g></svg>`;
}

function accessory(kind, col, hair, uid) {
  const out = { head: '', neck: '' };
  switch (kind) {
    case 'glasses': out.head = `<g fill="rgba(255,255,255,.1)" stroke="#2f2429" stroke-width="2.6"><circle cx="124" cy="148" r="19"/><circle cx="176" cy="148" r="19"/></g><path d="M143 146Q150 142 157 146M105 144L96 140M195 144L204 140" stroke="#2f2429" stroke-width="2.4" fill="none"/>`; break;
    case 'earrings': out.head = `<circle cx="96" cy="176" r="4.5" fill="#fdf6ee" stroke="#d8c7b4"/><circle cx="204" cy="176" r="4.5" fill="#fdf6ee" stroke="#d8c7b4"/>`; break;
    case 'hoops': out.head = `<circle cx="96" cy="184" r="10" fill="none" stroke="#e7c36a" stroke-width="2.8"/><circle cx="204" cy="184" r="10" fill="none" stroke="#e7c36a" stroke-width="2.8"/>`; break;
    case 'flower': out.head = `<g transform="translate(196 92)">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-10" rx="7" ry="10" fill="#ff9fbf" transform="rotate(${a})"/>`).join('')}<circle r="5" fill="#ffd36b"/></g>`; break;
    case 'headband': out.head = `<path d="M98 112C106 58 194 58 202 112" stroke="${col}" stroke-width="9" fill="none" stroke-linecap="round"/>`; break;
    case 'choker': out.neck = `<path d="M131 232Q150 246 169 232" stroke="#17100f" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="150" cy="243" r="3.6" fill="#e7c9a9" stroke="#b99870"/>`; break;
    case 'pendant': out.neck = `<path d="M130 236Q150 290 170 236" stroke="#e7c36a" stroke-width="1.6" fill="none"/><path d="M150 288l-5 -7l5 -6l5 6z" fill="#f5e6a8" stroke="#c9a54c"/>`; break;
    case 'beret': out.head = `<path d="M96 100C90 48 210 48 204 100C192 80 108 80 96 100Z" fill="${col}"/><circle cx="150" cy="56" r="5" fill="${shade(col, -22)}"/>`; break;
    default: break;
  }
  void hair; void uid;
  return out;
}

function extras(expr, crop) {
  if (crop === 'full') return '';
  const heart = (x, y, s, o) => `<path class="av-float" style="animation-delay:${o}s" d="M${x} ${y + 8 * s}c${-9 * s}-${6 * s} ${-11 * s}-${12 * s} ${-6 * s}-${15 * s}c${3 * s}-${2 * s} ${5 * s} 0 ${6 * s} ${2 * s}c${1 * s}-${2 * s} ${3 * s}-${4 * s} ${6 * s}-${2 * s}c${5 * s} ${3 * s} ${3 * s} ${9 * s}-${6 * s} ${15 * s}z" fill="#ff7a9c"/>`;
  if (expr === 'love') return heart(234, 70, 1.1, 0) + heart(62, 82, 0.9, 0.6) + heart(240, 116, 0.7, 1.1);
  if (expr === 'sultry') return `<path class="av-spark" d="M236 76l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#ffd36b"/>`;
  if (expr === 'kiss') return heart(222, 150, 0.9, 0) + heart(238, 124, 0.6, 0.5);
  if (expr === 'happy' || expr === 'laugh') return `<path class="av-spark" d="M236 70l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#ffd36b"/><path class="av-spark" style="animation-delay:.7s" d="M58 92l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff"/>`;
  if (expr === 'surprised') return `<path d="M64 76l8 6M54 98h10M236 76l-8 6M246 98h-10" stroke="#ffb454" stroke-width="3" stroke-linecap="round"/>`;
  return '';
}
