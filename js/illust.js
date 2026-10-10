// 手描き風の完成イメージ（SVG）を生成
// 器テンプレート × 具材パーツ（色・形・数）× 湯気。線を少し揺らして手描きの風合いに。

const INK = '#5a4a3a';
let uid = 0;

function rng(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) { h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const VESSELS = {
  // area: 具材を置く楕円 [cx, cy, rx, ry]
  bowl: { area: [100, 72, 52, 14], draw: (liq) => `
    <ellipse cx="100" cy="135" rx="28" ry="6" fill="#6e2e24" stroke="${INK}" stroke-width="1.5"/>
    <path d="M36 72 Q40 132 100 134 Q160 132 164 72 Z" fill="#9b3d2f" stroke="${INK}" stroke-width="1.8"/>
    <path d="M50 96 Q100 112 150 96" fill="none" stroke="#c46a4f" stroke-width="2" opacity=".5"/>
    <ellipse cx="100" cy="72" rx="64" ry="19" fill="#7a2c22" stroke="${INK}" stroke-width="1.8"/>
    <ellipse cx="100" cy="73" rx="58" ry="15.5" fill="${liq || '#f3e6c4'}" />
    <ellipse cx="88" cy="68" rx="26" ry="4" fill="#fff" opacity=".25"/>` },
  deep: { area: [100, 66, 56, 14], draw: (liq) => `
    <ellipse cx="100" cy="138" rx="30" ry="6" fill="#d8ccb2" stroke="${INK}" stroke-width="1.5"/>
    <path d="M30 66 Q34 136 100 138 Q166 136 170 66 Z" fill="#efe7d4" stroke="${INK}" stroke-width="1.8"/>
    <path d="M38 92 Q100 112 162 92" fill="none" stroke="#5f7d95" stroke-width="3" opacity=".7"/>
    <path d="M44 104 Q100 122 156 104" fill="none" stroke="#5f7d95" stroke-width="1.5" opacity=".6"/>
    <ellipse cx="100" cy="66" rx="70" ry="20" fill="#e3d9c2" stroke="${INK}" stroke-width="1.8"/>
    <ellipse cx="100" cy="67" rx="63" ry="16.5" fill="${liq || '#f7ecd0'}"/>` },
  small: { area: [100, 80, 40, 11], draw: (liq) => `
    <ellipse cx="100" cy="132" rx="22" ry="5" fill="#4e6a80" stroke="${INK}" stroke-width="1.4"/>
    <path d="M50 80 Q54 130 100 132 Q146 130 150 80 Z" fill="#6f8fa6" stroke="${INK}" stroke-width="1.8"/>
    <path d="M62 100 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6" fill="none" stroke="#e9eef2" stroke-width="1.4" opacity=".7"/>
    <ellipse cx="100" cy="80" rx="52" ry="15" fill="#58768c" stroke="${INK}" stroke-width="1.8"/>
    <ellipse cx="100" cy="81" rx="46" ry="12" fill="${liq || '#efe6d2'}"/>` },
  plate: { area: [100, 86, 54, 16], draw: () => `
    <ellipse cx="100" cy="98" rx="84" ry="30" fill="#d9cfbb" opacity=".6"/>
    <ellipse cx="100" cy="92" rx="82" ry="30" fill="#f4eee2" stroke="${INK}" stroke-width="1.8"/>
    <ellipse cx="100" cy="92" rx="66" ry="22" fill="#efe7d6" stroke="#5f7d95" stroke-width="1.4" stroke-dasharray="4 5"/>` },
  mug: { area: [96, 52, 30, 7], draw: (liq) => `
    <path d="M136 66 q26 4 22 28 q-4 18 -22 16" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
    <path d="M136 66 q26 4 22 28 q-4 18 -22 16" fill="none" stroke="#c9a77c" stroke-width="4" stroke-linecap="round"/>
    <path d="M60 52 L64 128 Q96 138 128 128 L132 52 Z" fill="#c9a77c" stroke="${INK}" stroke-width="1.8"/>
    <path d="M66 86 Q96 94 126 86" fill="none" stroke="#a2805a" stroke-width="2" opacity=".6"/>
    <ellipse cx="96" cy="52" rx="36" ry="9" fill="#b18d62" stroke="${INK}" stroke-width="1.8"/>
    <ellipse cx="96" cy="53" rx="32" ry="7" fill="${liq || '#d9b48a'}"/>` },
  glass: { area: [100, 50, 28, 6], draw: (liq) => `
    <path d="M70 50 L76 128 Q100 134 124 128 L130 50 Z" fill="${liq || '#f3e2a9'}" opacity=".85" stroke="${INK}" stroke-width="1.8"/>
    <path d="M78 60 L82 120" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/>
    <ellipse cx="100" cy="50" rx="30" ry="7" fill="${liq || '#f3e2a9'}" stroke="${INK}" stroke-width="1.6"/>` },
};

function shape(kind, x, y, color, r) {
  const rot = Math.round(r() * 360);
  const s = 0.8 + r() * 0.5;
  const st = `stroke="${INK}" stroke-width="1" stroke-opacity=".55"`;
  const T = `transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot}) scale(${s.toFixed(2)})"`;
  switch (kind) {
    case 'slice': return `<rect ${T} x="-8" y="-4" width="16" height="8" rx="3" fill="${color}" ${st}/>`;
    case 'chunk': return `<path ${T} d="M-7 -3 Q-4 -8 3 -6 Q9 -3 7 3 Q3 8 -4 6 Q-9 3 -7 -3Z" fill="${color}" ${st}/>`;
    case 'ring': return `<circle ${T} r="3.6" fill="none" stroke="${color}" stroke-width="2.4"/>`;
    case 'strip': return `<rect ${T} x="-7" y="-1" width="14" height="2.2" rx="1" fill="${color}"/>`;
    case 'dot': return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.4 + r() * 1).toFixed(1)}" fill="${color}"/>`;
    case 'grain': return `<ellipse ${T} rx="2.4" ry="1.3" fill="${color}" stroke="#d8cfb8" stroke-width=".5"/>`;
    case 'leaf': return `<g ${T}><path d="M-9 0 Q0 -7 9 0 Q0 7 -9 0Z" fill="${color}" ${st}/><path d="M-7 0 L7 0" stroke="#fff" stroke-opacity=".4" stroke-width=".8"/></g>`;
    case 'cube': return `<rect ${T} x="-4" y="-4" width="8" height="8" rx="1.5" fill="${color}" ${st}/>`;
    case 'round': return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(5 + r() * 2).toFixed(1)}" fill="${color}" ${st}/>`;
    case 'lotus': return `<g ${T}><circle r="9" fill="${color}" ${st}/>${[0, 72, 144, 216, 288].map(a => `<circle cx="${(5 * Math.cos(a * Math.PI / 180)).toFixed(1)}" cy="${(5 * Math.sin(a * Math.PI / 180)).toFixed(1)}" r="1.8" fill="#cbb994"/>`).join('')}<circle r="1.6" fill="#cbb994"/></g>`;
    case 'mushroom': return `<g ${T}><rect x="-1.6" y="-1" width="3.2" height="9" rx="1.5" fill="#f3ead8" ${st}/><path d="M-6 0 Q0 -9 6 0 Z" fill="${color}" ${st}/></g>`;
    case 'fillet': return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${-8 + Math.round(r() * 16)})"><path d="M-30 -10 Q-10 -16 26 -9 Q34 0 26 9 Q-10 16 -30 10 Q-36 0 -30 -10Z" fill="${color}" stroke="${INK}" stroke-width="1.4"/>${[-18, -8, 2, 12].map(dx => `<path d="M${dx} -11 Q${dx + 5} 0 ${dx} 11" fill="none" stroke="#fbd3c4" stroke-width="1.4"/>`).join('')}</g>`;
    case 'swirl': return `<path ${T} d="M-12 0 Q-6 -6 0 0 T12 0" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/>`;
    case 'wedge': return `<path ${T} d="M-12 4 Q0 -12 12 4 Q0 0 -12 4Z" fill="${color}" ${st}/>`;
    case 'flake': return `<path ${T} d="M-3 -2 L2 -3 L4 1 L0 3 L-3 1Z" fill="${color}"/>`;
    case 'noodle': return `<path ${T} d="M-14 0 Q-7 -5 0 0 T14 0" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round"/>`;
    default: return `<circle cx="${x}" cy="${y}" r="3" fill="${color}"/>`;
  }
}

function steamPaths(cx, top) {
  return [-18, 0, 18].map((dx, i) => `<path d="M${cx + dx} ${top} q-6 -9 0 -18 q6 -9 0 -18" fill="none" stroke="#9c8f80" stroke-width="2.2" stroke-linecap="round" opacity=".45">
      <animate attributeName="opacity" values=".15;.5;.15" dur="${3 + i * 0.6}s" repeatCount="indefinite"/></path>`).join('');
}

export function illustSVG(recipe, { size = 'md' } = {}) {
  const spec = recipe.illust || { vessel: 'plate', items: [] };
  const v = VESSELS[spec.vessel] || VESSELS.plate;
  const r = rng(recipe.id);
  const id = `ink${++uid}`;
  const [cx, cy, rx, ry] = v.area;
  let items = '';
  if (spec.foil) {
    items += `<path d="M${cx - 62} ${cy + 2} l10 -18 l20 6 l18 -12 l22 8 l20 -8 l16 14 l10 18 l-14 14 l-24 -4 l-20 10 l-24 -6 l-20 8 Z" fill="#dfe3e6" stroke="${INK}" stroke-width="1.2" opacity=".95"/>`;
  }
  // 具材ごとに角度をずらしながら均等に散らす（偏り防止）
  let layer = 0;
  for (const [color, kind, n] of spec.items || []) {
    const offset = r() * Math.PI * 2;
    for (let k = 0; k < n; k++) {
      if (kind === 'fillet') { items += shape(kind, cx, cy - 2, color, r); continue; }
      const a = offset + (k / n) * Math.PI * 2 + (r() - 0.5) * 0.9;
      const d = n === 1 ? 0.15 : 0.3 + ((k + layer) % 3) * 0.22 + r() * 0.12;
      items += shape(kind, cx + Math.cos(a) * rx * Math.min(d, 0.85), cy + Math.sin(a) * ry * Math.min(d, 0.85), color, r);
    }
    layer++;
  }
  const steamTop = spec.vessel === 'mug' ? 40 : spec.vessel === 'plate' ? 66 : cy - 18;
  return `<svg class="illust illust-${size}" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${recipe.name}の完成イメージ">
    <defs>
      <filter id="${id}" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${Math.floor(r() * 50)}"/>
        <feDisplacementMap in="SourceGraphic" scale="2.6"/>
      </filter>
    </defs>
    <ellipse cx="100" cy="92" rx="92" ry="62" fill="var(--wash, #efe6d3)" opacity=".7"/>
    <g filter="url(#${id})">
      ${v.draw(spec.liquid)}
      ${items}
    </g>
    ${spec.steam ? steamPaths(spec.vessel === 'mug' ? 96 : 100, steamTop) : ''}
  </svg>`;
}
