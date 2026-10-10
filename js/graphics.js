// インフォグラフィック部品：五行の五角形・気血水・五性スケール・五味
import { esc } from './ui.js';
import { SINGLE_READINGS, CELL_READINGS } from '../data/readings.js';

const rb = (t, y) => y ? `<ruby>${t}<rt>${y}</rt></ruby>` : t;
// 「肝・心」のような並びや色体表のセルにルビを振る
export const cellRuby = v => String(v).split('・').map(x => rb(esc(x), CELL_READINGS[x])).join('・');

// ── 五行 ─────────────────
// 五行色体表（『黄帝内経素問』陰陽応象大論・宣明五気篇などにもとづく一般的な対応）
export const GOGYO = [
  { key: '木', organ: '肝', fu: '胆', season: '春', color: '#5f9a5a', text: '#fff', hue: '青（緑）', direction: '東', climate: '風', taste: '酸', emotion: '怒', sense: '目', tissue: '筋', flower: '爪', fluid: '涙', voice: '呼', smell: '臊（あぶらくさい）',
    desc: 'のびやかに巡らせる。気と血の流れを調整し、血を蓄える。ストレスに弱い。' },
  { key: '火', organ: '心', fu: '小腸', season: '夏', color: '#cf4f3c', text: '#fff', hue: '赤', direction: '南', climate: '暑', taste: '苦', emotion: '喜', sense: '舌', tissue: '血脈', flower: '顔色', fluid: '汗', voice: '笑', smell: '焦（こげくさい）',
    desc: '血を全身に送り、こころ（精神活動）をつかさどる。睡眠と関係が深い。' },
  { key: '土', organ: '脾', fu: '胃', season: '長夏・土用', color: '#d6a22a', text: '#fff', hue: '黄', direction: '中央', climate: '湿', taste: '甘', emotion: '思', sense: '口', tissue: '肌肉', flower: '唇', fluid: '涎（よだれ）', voice: '歌', smell: '香（かんばしい）',
    desc: '食べ物から気と血をつくる胃腸の働き。湿気と冷たいものに弱い。' },
  { key: '金', organ: '肺', fu: '大腸', season: '秋', color: '#f4f1e8', text: '#3d3a33', hue: '白', direction: '西', climate: '燥', taste: '辛', emotion: '悲（憂）', sense: '鼻', tissue: '皮', flower: '体毛', fluid: '涕（鼻水）', voice: '哭（泣く）', smell: '腥（なまぐさい）',
    desc: '呼吸と、体の表面（皮膚・鼻・のど）のバリアを守る。乾燥に弱い。' },
  { key: '水', organ: '腎', fu: '膀胱', season: '冬', color: '#34343e', text: '#fff', hue: '黒', direction: '北', climate: '寒', taste: '鹹', emotion: '恐（驚）', sense: '耳', tissue: '骨', flower: '髪', fluid: '唾（つば）', voice: '呻（うめく）', smell: '腐（くさる）',
    desc: '生命力の源。成長・老化・水分代謝と、体を温める力のもと。冷えに弱い。' },
];

// 色体表の行（表示順）
export const GOGYO_ROWS = [
  ['五臓', 'organ'], ['五腑', 'fu'], ['五季', 'season'], ['五色', 'hue'], ['五方', 'direction'], ['五気（苦手な気候）', 'climate'],
  ['五味', 'taste'], ['五志（感情）', 'emotion'], ['五官（感覚器）', 'sense'], ['五主（体の部位）', 'tissue'], ['五華（表れる所）', 'flower'],
  ['五液（分泌液）', 'fluid'], ['五声', 'voice'], ['五香（におい）', 'smell'],
];

// 悩み → 色体表で読むとどの五行か
export const WORRY_SIGNS = {
  runny_nose: ['金', '五液の「涕（鼻水）」と五官の「鼻」は、どちらも肺のグループ'],
  stuffy_nose: ['金', '五官の「鼻」は肺のグループ'],
  dry_throat: ['金', 'のど・呼吸は肺の担当。肺は五気の「燥（乾燥）」が苦手'],
  cough: ['金', '呼吸は肺の担当。肺は乾燥が苦手'],
  chill_cold: ['金', '体の表面（皮）を守るのは肺の役目'],
  dry_skin: ['金', '五主の「皮（皮膚）」は肺のグループ'],
  constipation: ['金', '五腑の「大腸」は肺とペア'],
  low_mood: ['金', '五志の「悲（憂い）」は肺のグループ。秋は気分が沈みやすい季節'],
  nails: ['木', '五華の「爪」は肝のグループ（爪は筋の余り）'],
  clench: ['木', '五主の「筋（筋肉）」と五志の「怒（緊張・ストレス）」は肝のグループ'],
  irritable: ['木', '五志の「怒」は肝のグループ'],
  eye_strain: ['木', '五官の「目」は肝のグループ'],
  stiff_shoulder: ['木', '五主の「筋」は肝のグループ'],
  leg_cramp: ['木', '五主の「筋」は肝のグループ'],
  headache: ['木', '肝の気が上へのぼると頭痛やのぼせに'],
  period_pain: ['木', '血を蓄え、巡らせるのは肝の役目'],
  pms: ['木', '気と血の巡りを調整するのは肝の役目'],
  anemia: ['木', '血を蓄えるのは肝の役目'],
  hangover: ['木', 'お酒は肝に負担をかけるとされます'],
  cold_belly: ['水', '五気の「寒（冷え）」は腎の苦手。腰は「腎の府」'],
  lower_back: ['水', '腰は「腎の府」と呼ばれます'],
  frequent_urine: ['水', '五腑の「膀胱」は腎とペア'],
  hair: ['水', '五華の「髪」は腎のグループ'],
  cold_limbs: ['水', '体を温める陽気の源は腎'],
  hot_flash: ['水', '体を潤し冷ます「陰」の源は腎'],
  insomnia: ['火', '眠りとこころ（精神活動）は心の担当'],
  anxious: ['火', '動悸とこころの安定は心の担当'],
  sweaty: ['火', '五液の「汗」は心のグループ'],
  mouth_ulcer: ['火', '五官の「舌」は心のグループ'],
  summer_fatigue: ['火', '夏（五気の「暑」）は心の季節'],
  poor_appetite: ['土', '胃腸の働きは脾のグループ'],
  overeating: ['土', '五腑の「胃」は脾とペア'],
  gas_bloating: ['土', '胃腸の働きは脾のグループ'],
  stomach_tight: ['土', '五腑の「胃」は脾とペア'],
  loose_stool: ['土', '脾は五気の「湿」が苦手'],
  sweet_craving: ['土', '五味の「甘」は脾のグループ'],
  sleepy_after_meal: ['土', '食べたものを気に変えるのは脾の役目'],
  dry_mouth: ['土', '五官の「口」は脾のグループ'],
  swelling: ['土', '脾は五気の「湿」が苦手で、水の巡りも担当'],
  heavy_head: ['土', '湿気（湿）がたまると頭が重くなりやすい'],
  weather: ['土', '湿気（湿）は脾の苦手'],
  dizzy: ['土', '水の滞りは脾の不調から'],
  fatigue: ['土', '気をつくるのは脾（胃腸）'],
  hard_morning: ['土', '気をつくるのは脾（胃腸）'],
  acne: ['土', '五主の「肌肉」は脾のグループ'],
};

export const ORGAN_TO_EL = { 肝: '木', 胆: '木', 心: '火', 小腸: '火', 脾: '土', 胃: '土', 肺: '金', 大腸: '金', 腎: '水', 膀胱: '水' };
export const TASTE_COLOR = { 酸: '#5f9a5a', 苦: '#cf4f3c', 甘: '#d6a22a', 辛: '#9a9285', 鹹: '#34343e', 渋: '#8a6a4a' };
export const SEASON_TO_EL = { spring: '木', summer: '火', longsummer: '土', autumn: '金', winter: '水' };

// 証 → 注目する臓腑
export const PATTERN_ORGANS = {
  kikyo: ['脾', '肺'], kitai: ['肝'], kigyaku: ['肝'], gesho: ['腎'], kekkyo: ['肝', '心'], oketsu: ['肝', '心'],
  suidoku: ['脾', '腎'], boshin: ['肺', '腎'], yokyo: ['腎', '脾'], inkyo: ['腎', '肝'], tanshitsu: ['脾'], shitsunetsu: ['脾'],
  fukan: ['肺'], funetsu: ['肺'], haiso: ['肺'], shokuseki: ['脾'],
};

/**
 * 五行の五角形
 * @param {object} o  highlight: ['木',…] 強調する要素 / season: 今の季節の要素 / size: 'sm'|'md'|'lg' / interactive: タップ可能に
 */
export function gogyoSVG({ highlight = [], season = null, size = 'md', interactive = false, labels = true } = {}) {
  const cx = 150, cy = 150, R = 100, r = size === 'sm' ? 30 : 33;
  const pos = GOGYO.map((g, i) => {
    const a = (-90 + i * 72) * Math.PI / 180;
    return { ...g, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), a };
  });
  // 相生（木→火→土→金→水→木）：外周の矢印
  const arcs = pos.map((p, i) => {
    const q = pos[(i + 1) % 5];
    const a1 = p.a + 0.36, a2 = q.a - 0.36;
    const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1), x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2);
    return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="#c9bfa9" stroke-width="2.4" marker-end="url(#gg-arrow)"/>`;
  }).join('');
  // 相剋（星形）：うすい点線
  const star = pos.map((p, i) => { const q = pos[(i + 2) % 5]; return `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" stroke="#d9cfbb" stroke-width="1.2" stroke-dasharray="3 4"/>`; }).join('');
  const nodes = pos.map(p => {
    const hi = highlight.includes(p.key), now = season === p.key;
    const lx = cx + (R + r + 18) * Math.cos(p.a), ly = cy + (R + r + 18) * Math.sin(p.a);
    return `<g class="gg-node" data-el="${p.key}" ${interactive ? 'role="button" tabindex="0" style="cursor:pointer"' : ''}>
      ${hi ? `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r + 7}" fill="none" stroke="#d9822b" stroke-width="3.5"><animate attributeName="r" values="${r + 5};${r + 9};${r + 5}" dur="2.4s" repeatCount="indefinite"/></circle>` : ''}
      ${now && !hi ? `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r + 6}" fill="none" stroke="#9a9285" stroke-width="2" stroke-dasharray="4 4"/>` : ''}
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" fill="${p.color}" stroke="${p.key === '金' ? '#c9bfa9' : 'none'}" stroke-width="2" opacity="${highlight.length && !hi && !now ? 0.55 : 1}"/>
      ${size === 'lg' ? `<text x="${p.x.toFixed(1)}" y="${(p.y - 19).toFixed(1)}" text-anchor="middle" font-size="8.5" fill="${p.text}" opacity=".85">${CELL_READINGS[p.organ]}</text>` : ''}
      <text x="${p.x.toFixed(1)}" y="${(p.y + (size === 'lg' ? 2 : -2)).toFixed(1)}" text-anchor="middle" font-size="${size === 'sm' ? 20 : 22}" font-weight="700" fill="${p.text}" font-family="serif">${p.organ}</text>
      <text x="${p.x.toFixed(1)}" y="${(p.y + 17).toFixed(1)}" text-anchor="middle" font-size="11" fill="${p.text}" opacity=".85">${p.key}・${p.hue.replace(/（.*/, '')}</text>
      ${labels ? `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle" font-size="12" fill="${now ? '#d9822b' : '#6b655a'}" font-weight="${now ? 700 : 400}">${now ? '● ' : ''}${p.season}</text>` : ''}
    </g>`;
  }).join('');
  return `<svg class="gogyo gogyo-${size}" viewBox="-30 -22 360 350" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="五行と五臓の図">
    <defs><marker id="gg-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#c9bfa9"/></marker></defs>
    ${star}${arcs}${nodes}
  </svg>`;
}

// ── 気・血・水 ─────────────────
const KKS = {
  ki: { name: '気', color: '#d6a22a', role: 'エネルギー' },
  ketsu: { name: '血', color: '#c0504a', role: '栄養' },
  sui: { name: '水', color: '#4f7f95', role: '潤い' },
};
const PATTERN_KKS = {
  kikyo: [['ki', 'low']], yokyo: [['ki', 'low']], gesho: [['ki', 'low']], kitai: [['ki', 'stuck']], shokuseki: [['ki', 'stuck']], kigyaku: [['ki', 'up']],
  kekkyo: [['ketsu', 'low']], oketsu: [['ketsu', 'stuck']],
  suidoku: [['sui', 'over']], tanshitsu: [['sui', 'over']], shitsunetsu: [['sui', 'over']],
  boshin: [['sui', 'low']], inkyo: [['sui', 'low']], haiso: [['sui', 'low']],
};
const STATE = { ok: ['ちょうど', 0.62], low: ['不足', 0.25], stuck: ['滞り', 0.62], over: ['たまり', 0.92], up: ['上に偏る', 0.62] };

export function kksStates(patternIds) {
  const st = { ki: 'ok', ketsu: 'ok', sui: 'ok' };
  for (const p of [...patternIds].reverse()) for (const [k, s] of PATTERN_KKS[p] || []) st[k] = s;
  return st;
}

export function kksHTML(patternIds, direction = 'neutral') {
  const st = kksStates(patternIds);
  const gauge = (k) => {
    const c = KKS[k], s = st[k], [label, level] = STATE[s];
    const h = 64, fillH = h * level;
    const wave = s === 'stuck' ? `<path d="M6 ${h - fillH + 6} q6 -6 12 0 t12 0 t12 0" stroke="#fff" stroke-width="2.4" fill="none"/><circle cx="24" cy="${h - fillH / 2}" r="5" fill="#fff" opacity=".85"/>` : '';
    const arrow = s === 'up' ? `<path d="M24 ${h - fillH - 4} l-7 9 h14z" fill="${c.color}"/>` : '';
    return `<div class="kks-item ${s !== 'ok' ? 'warn' : ''}">
      <svg viewBox="0 0 48 ${h + 4}" width="44" height="${h}"><rect x="2" y="2" width="44" height="${h}" rx="12" fill="#f3ede0" stroke="${c.color}" stroke-width="2"/>
        <clipPath id="kc-${k}"><rect x="2" y="2" width="44" height="${h}" rx="12"/></clipPath>
        <rect clip-path="url(#kc-${k})" x="2" y="${2 + h - fillH}" width="44" height="${fillH}" fill="${c.color}" opacity=".85"/>${wave}${arrow}
      </svg>
      <div class="kks-name" style="color:${c.color}">${rb(c.name, SINGLE_READINGS[c.name])}<small>${c.role}</small></div>
      <div class="kks-state">${label}</div></div>`;
  };
  const temp = { cold: ['❄️', '冷え寄り', '#4f7f95'], hot: ['🔥', '熱寄り', '#cf4f3c'], mixed: ['🌗', '寒熱まじり', '#8a6aa0'], neutral: ['⚖️', '寒熱は中ほど', '#9a9285'] }[direction];
  return `<div class="kks">${['ki', 'ketsu', 'sui'].map(gauge).join('')}
    <div class="kks-item"><div class="kks-temp" style="background:${temp[2]}1f;color:${temp[2]}">${temp[0]}</div><div class="kks-name" style="color:${temp[2]}">寒熱</div><div class="kks-state">${temp[1]}</div></div></div>`;
}

// ── 五性スケール（料理の食材を寒〜熱に並べる） ─────────────────
export const NATURES = ['寒', '涼', '平', '温', '熱'];
const NATURE_BG = { 寒: '#dbe7f1', 涼: '#e5eff3', 平: '#efeadf', 温: '#fbe6d2', 熱: '#f7d6cf' };
const NATURE_FG = { 寒: '#3e6688', 涼: '#4f7f95', 平: '#7d7360', 温: '#b9661f', 熱: '#b5483c' };
export function natureScaleHTML(ings, overall) {
  const cols = NATURES.map(n => {
    const list = ings.filter(i => i.nature === n);
    return `<div class="ns-col ${n === overall ? 'on' : ''}" style="--bg:${NATURE_BG[n]};--fg:${NATURE_FG[n]}">
      <div class="ns-head">${n === overall ? '<span class="ns-mark">▼この料理</span>' : ''}${rb(n, SINGLE_READINGS[n])}</div>
      <div class="ns-list">${list.map(i => `<span>${esc(i.name.replace(/（.*/, ''))}</span>`).join('')}</div></div>`;
  }).join('');
  return `<div class="ns"><div class="ns-cols">${cols}</div><div class="ns-axis"><span>❄️ 冷やす</span><span>温める 🔥</span></div></div>`;
}

export function tasteChip(t) {
  const c = TASTE_COLOR[t] || '#9a9285';
  return `<span class="taste" style="--c:${c}">${rb(esc(t), SINGLE_READINGS[t])}</span>`;
}

// 帰経を五臓に集計
export function organCounts(ings) {
  const cnt = {};
  for (const i of ings) for (const m of new Set(i.meridian.map(x => ORGAN_TO_EL[x]).filter(Boolean))) cnt[m] = (cnt[m] || 0) + 1;
  return cnt;
}
