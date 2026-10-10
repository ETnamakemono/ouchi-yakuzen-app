// 推薦エンジン（Phase 1：ルールベースのアドバイザー）
// Phase 2 で AI アドバイザーに差し替える場合も、diagnose / recommend / advise と同じ入出力にする。
import { RECIPES, CATS } from '../data/recipes.js';
import { ING_MAP, NATURE_VALUE, SUB_GROUPS, SUB_OF } from '../data/ingredients.js';
import { PATTERN_MAP, TAG_LABELS } from '../data/patterns.js';
import { WORRY_MAP, NO_WORRY } from '../data/worries.js';
import { CONST_MAP } from '../data/constitutions.js';
import { SEASONS, DOYO_INFO, TSUYU_INFO } from '../data/seasons.js';
import { COMPANION_MAP, ING_FAMILY } from '../data/companions.js';

export const TIME_LIMITS = { quick: 10, normal: 20, slow: 999 };
export const TIME_LABELS = { quick: '時短（〜10分）', normal: 'ふつう（〜20分）', slow: 'じっくり（30分〜もOK）' };
export const FAT_LIMITS = { main: 10, staple: 7, side: 5, soup: 5, drink: 5 };

// ── 栄養（1人分） ─────────────────
export function nutrition(recipe) {
  let fat = 0, kcal = 0;
  for (const [id, g, , , opt] of recipe.items) {
    if (opt === 'opt') continue;
    const ing = ING_MAP[id];
    if (!ing) continue;
    fat += g * ing.fat / 100;
    kcal += g * ing.kcal / 100;
  }
  return { fat: Math.round(fat / 2 * 10) / 10, kcal: Math.round(kcal / 2) };
}

// レシピに含まれる効能タグ（調味料含む・「あれば」食材は除く）
export function recipeTags(recipe) {
  const s = new Set();
  for (const [id, , , , opt] of recipe.items) {
    if (opt === 'opt') continue;
    (ING_MAP[id]?.tags || []).forEach(t => s.add(t));
  }
  return s;
}

const isStock = (id, settings) => settings.stock.includes(id);

// 確認が必要な食材（常備に入っていない、必須の食材）
export function requiredFresh(recipe, settings) {
  return recipe.items.filter(([id, , , , opt]) => opt !== 'opt' && !isStock(id, settings)).map(([id]) => id);
}

// ── 見立て ─────────────────
export function diagnose({ worries = [], constitution = null, season }) {
  const scores = {};
  const add = (p, w) => { scores[p] = (scores[p] || 0) + w; };
  const noWorry = worries.length === 0 || worries.includes(NO_WORRY);
  const constPatterns = {};
  if (constitution?.result) {
    const { main, tendencies } = constitution.result;
    for (const [p, w] of Object.entries(CONST_MAP[main]?.patterns || {})) constPatterns[p] = (constPatterns[p] || 0) + 2 * w;
    for (const t of tendencies.filter(t => t !== main)) for (const [p, w] of Object.entries(CONST_MAP[t]?.patterns || {})) constPatterns[p] = (constPatterns[p] || 0) + w;
  }
  const seasonTheme = { ...SEASONS[season.season].theme };
  if (season.doyo) for (const [p, w] of Object.entries(DOYO_INFO.theme)) seasonTheme[p] = (seasonTheme[p] || 0) + w;
  if (season.tsuyu) for (const [p, w] of Object.entries(TSUYU_INFO.theme)) seasonTheme[p] = (seasonTheme[p] || 0) + w;

  if (noWorry) {
    for (const [p, w] of Object.entries(seasonTheme)) add(p, w);
    for (const [p, w] of Object.entries(constPatterns)) add(p, w);
  } else {
    for (const wid of worries) for (const [p, w] of Object.entries(WORRY_MAP[wid]?.patterns || {})) add(p, w);
    // 体質・季節は「悩みから出てきた証」にだけ上乗せ（季節だけで証を作らない）
    for (const p of Object.keys(scores)) {
      add(p, (constPatterns[p] || 0) * 0.5 + (seasonTheme[p] || 0) * 0.5);
    }
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = [];
  if (sorted[0]) top.push(sorted[0]);
  if (sorted[1] && sorted[1][1] >= sorted[0][1] * 0.5) top.push(sorted[1]);
  const temps = top.map(([p]) => PATTERN_MAP[p].temp);
  // 矛盾：上位〜上位3つの中に冷え方向と熱方向が両方ある
  const top3temps = sorted.slice(0, 3).filter(([, s]) => s >= (sorted[0]?.[1] || 0) * 0.4).map(([p]) => PATTERN_MAP[p].temp);
  const contradiction = top3temps.includes('cold') && top3temps.includes('hot');
  return {
    mode: noWorry ? 'season' : 'worry',
    top: top.map(([id, score]) => ({ id, score, pattern: PATTERN_MAP[id] })),
    scores, contradiction,
    direction: contradiction ? 'mixed' : temps.includes('cold') ? 'cold' : temps.includes('hot') ? 'hot' : 'neutral',
  };
}

// ── 食養生アドバイス ─────────────────
export function advise(diag, season) {
  const main = diag.top[0]?.pattern;
  const sec = diag.top[1]?.pattern;
  const wantTags = new Set([...(main?.mainTags || []), ...(main?.needTags || []), ...(sec?.mainTags || [])]);
  // 合う性：上位の証で共通する性。共通がなければ、冷え側の証があれば寒・涼を、熱側の証があれば熱を除く
  const tops = diag.top.map(t => t.pattern);
  let natures = new Set(tops.reduce((acc, p) => acc.filter(n => p.natures.includes(n)), main?.natures || ['平']));
  if (!natures.size) {
    natures = new Set(tops.flatMap(p => p.natures));
    if (tops.some(p => p.temp === 'cold')) { natures.delete('寒'); natures.delete('涼'); }
    if (tops.some(p => p.temp === 'hot')) natures.delete('熱');
  }
  if (diag.contradiction) natures = new Set(['平']);
  const foods = Object.values(ING_MAP)
    .filter(i => i.group !== 'seasoning' && natures.has(i.nature) && i.tags.some(t => wantTags.has(t)))
    .map(i => {
      let s = i.tags.filter(t => wantTags.has(t)).length;
      if (i.shun.includes(season.season)) s += 1.5;
      if (i.flags.length) s -= 0.5;
      return { ing: i, s };
    })
    .sort((a, b) => b.s - a.s).slice(0, 8).map(x => x.ing);
  const avoid = [...new Set([...(main?.avoid || []), ...(sec?.avoid || [])])].slice(0, 4);
  const tips = [...(main?.advice || []).slice(0, 2), ...(sec?.advice || []).slice(0, 1)];
  return { foods, avoid, tips, cooking: main?.cooking };
}

// ── 合わせる料理とのバランス ─────────────────
export function companionProfile(ids = []) {
  const list = ids.map(id => COMPANION_MAP[id]).filter(Boolean);
  return {
    list,
    cold: list.some(c => c.temp === 'cold' || c.nature === '涼' || c.nature === '寒'),
    oily: list.some(c => c.oily >= 2),
    salty: list.some(c => c.salty >= 2),
    hot: list.some(c => c.nature === '熱'),
    families: new Set(list.flatMap(c => c.main)),
  };
}

export function companionNotes(profile, cat) {
  if (!profile.list.length) return [];
  const notes = [];
  const names = profile.list.map(c => c.name).join('・');
  const coldNames = profile.list.filter(c => c.temp === 'cold' || c.nature === '涼' || c.nature === '寒').map(c => c.name).join('・');
  if (profile.cold) notes.push(`「${coldNames}」は体を冷やす・冷たいものなので、温かい${cat === 'any' ? '料理' : CATS[cat]?.name || '料理'}で温めるのがおすすめ。`);
  if (profile.oily) notes.push('油っこい料理と合わせるので、消化を助けたり余分なものを流したりする、さっぱりした一品でバランスを。');
  if (profile.salty) notes.push('味の濃い料理と合わせるので、薄味でやさしい一品に。');
  if (profile.hot) notes.push('体を温める力の強い料理（スパイス等）と合わせるので、熱を冷ます平性〜涼性の一品で偏りを整えます。');
  if (!notes.length) notes.push(`${names}と合わせて、食材が重ならないものを優先しています。`);
  return notes;
}

// ── 候補の絞り込みとスコア ─────────────────
export function filterReason(recipe, cond, settings) {
  if (cond.cat && cond.cat !== 'any' && recipe.cat !== cond.cat) return 'cat';
  if (recipe.minutes > TIME_LIMITS[cond.time || 'normal']) return 'time';
  if (recipe.tools.some(t => !settings.tools.includes(t))) return 'tool';
  for (const [id, , , , opt] of recipe.items) {
    if (opt === 'opt') continue;
    if (settings.ngSelf.includes(id)) return 'ng';
    if (cond.who === 'pair') {
      const ing = ING_MAP[id];
      if (settings.ngPartner.ids.includes(id)) return 'ng';
      if (ing?.flags.some(f => settings.ngPartner.flags.includes(f))) return 'ng';
    }
  }
  if (settings.lowFat && nutrition(recipe).fat > FAT_LIMITS[recipe.cat]) return 'fat';
  return null;
}

export function scoreRecipe(recipe, ctx) {
  const { diag, season, constitution, companions, who, records } = ctx;
  let score = 0;
  const reasons = [];
  const tags = recipeTags(recipe);
  const nv = NATURE_VALUE[recipe.nature];

  diag.top.forEach(({ id, pattern }, i) => {
    if (recipe.targets.includes(id)) {
      score += i === 0 ? 6 : 3;
      reasons.push(`${pattern.name.replace(/（.*/, '')}に合う`);
    }
    const hits = pattern.mainTags.filter(t => tags.has(t)).length;
    score += Math.min(hits, 3) * (i === 0 ? 1 : 0.5);
    if (pattern.natures.includes(recipe.nature)) score += 1;
    else if (pattern.temp === 'cold' && nv < 0) score -= 4;
    else if (pattern.temp === 'hot' && nv === 2) score -= 4;
    else if (pattern.temp === 'hot' && nv === 1) score -= 1.5;
  });
  // その他の関連する証（少しだけ）
  const others = Object.entries(diag.scores).filter(([p]) => !diag.top.some(t => t.id === p) && recipe.targets.includes(p));
  score += Math.min(others.length, 2) * 0.7;

  if (diag.contradiction) {
    if (recipe.nature === '平') { score += 1.5; reasons.push('寒熱どちらにも偏らない'); }
    if (nv === 2 || nv === -2) score -= 1;
  }

  // 体質
  if (constitution?.result) {
    const cps = [constitution.result.main, ...constitution.result.tendencies].flatMap(c => Object.keys(CONST_MAP[c]?.patterns || {}));
    if (recipe.targets.some(t => cps.includes(t))) { score += 1.5; reasons.push('あなたの体質に合う'); }
  }

  // 季節
  if (recipe.seasons.some(s => season.tags.includes(s))) { score += 1.5; reasons.push(`${SEASONS[season.season].name}の養生に合う`); }
  else if (recipe.seasons.includes('all')) score += 0.5;
  const shun = recipe.items.filter(([id]) => ING_MAP[id]?.group !== 'seasoning' && ING_MAP[id]?.shun.includes(season.season)).length;
  if (shun) { score += Math.min(shun * 0.3, 1); if (shun >= 1) reasons.push('旬の食材を使う'); }

  // 合わせる料理
  if (companions.list.length) {
    if (companions.cold) {
      if (recipe.temp === 'hot' || recipe.temp === 'warm') { score += 2; reasons.push('冷たい料理を温かさで補う'); }
      if (recipe.temp === 'cold') score -= 2;
    }
    if (companions.oily) {
      if (recipe.lightness === 2 && ['digest', 'clear_heat', 'drain_damp', 'phlegm'].some(t => tags.has(t))) { score += 2; reasons.push('油っこい料理の後味をさっぱり'); }
      if (recipe.lightness === 0) score -= 2;
    }
    if (companions.salty && recipe.lightness === 2) score += 1;
    if (companions.hot && nv <= 0) score += 1;
    const fams = recipe.items.filter(([, , , , o]) => o !== 'opt').map(([id]) => ING_FAMILY[id] || id)
      .filter(f => !['salt', 'soy_sauce', 'sake', 'mirin', 'sugar', 'oil', 'sesame_oil', 'pepper', 'ginger', 'garlic'].includes(f));
    if (fams.some(f => companions.families.has(f))) score -= 2;
  }

  if (who === 'pair' && (nv === 2 || nv === -2)) score -= 1;
  const recent = records.find(r => r.recipeId === recipe.id && Date.now() - new Date(r.at).getTime() < 3 * 86400000);
  if (recent) { score -= 1.5; }

  return { score, reasons: [...new Set(reasons)].slice(0, 3) };
}

export function rankCandidates(cond, ctx, settings) {
  return RECIPES
    .filter(r => !filterReason(r, cond, settings))
    .map(r => ({ recipe: r, ...scoreRecipe(r, ctx) }))
    .sort((a, b) => b.score - a.score);
}

// 食材確認リスト（最大12個）：主役の食材だけを聞く。同じグループは「○○（どれか）」にまとめる
export function askList(ranked, settings, max = 12) {
  const count = {};
  const stock = new Set(settings.stock);
  ranked.slice(0, 20).forEach(({ recipe }, idx) => {
    for (const id of coreItems(recipe)) {
      if (stock.has(id)) continue;
      const g = SUB_OF[id];
      if (g && SUB_GROUPS[g].some(x => stock.has(x))) continue; // 同じ仲間が常備にある
      const key = g ? 'g:' + g : id;
      count[key] = (count[key] || 0) + (20 - idx);
    }
  });
  return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, max).map(([k]) => k);
}

export function askLabel(key) {
  if (key.startsWith('g:')) {
    const g = key.slice(2);
    const names = SUB_GROUPS[g].slice(0, 3).map(id => ING_MAP[id].name.replace(/（.*/, ''));
    return `${g}（${names.join('・')}など、どれか）`;
  }
  return ING_MAP[key]?.name || key;
}
export function askGroup(key) {
  const id = key.startsWith('g:') ? SUB_GROUPS[key.slice(2)][0] : key;
  return ING_MAP[id]?.group || 'veg';
}

// 主役の食材：調味料以外・「あれば」以外の食材のうち、先頭の2つ（レシピは主役から順に書く決まり）
// （ごはん・米は主役にしない。レシピに core があればそれを優先）
export function coreItems(recipe) {
  if (recipe.core) return recipe.core;
  return recipe.items.filter(([id, , , , opt]) => opt !== 'opt' && ING_MAP[id]?.group !== 'seasoning' && id !== 'rice' && id !== 'cooked_rice').slice(0, 2).map(([id]) => id);
}

// 手持ちと照合
//  - 同じグループの食材が家にあれば「代用」（subs）
//  - 主役以外の食材がなければ「なくてもOK」（skips）
//  - 主役の食材がなく代用もできなければ「足りない」（missing）
// have には食材IDのほか「g:グループ名」（例 g:きのこ ＝ きのこならどれかある）が入る
export function resolveAvailability(recipe, have, settings) {
  if (have === null) return { missing: [], subs: [], skips: [] };
  const own = new Set([...settings.stock, ...have]);
  const core = coreItems(recipe);
  const missing = [], subs = [], skips = [];
  for (const id of requiredFresh(recipe, settings)) {
    if (own.has(id) || own.has('g:' + SUB_OF[id])) continue;
    const alt = (SUB_GROUPS[SUB_OF[id]] || []).find(x => x !== id && own.has(x));
    if (alt) subs.push({ id, alt });
    else if (!core.includes(id)) skips.push(id);
    else missing.push(id);
  }
  return { missing, subs, skips };
}

export function splitByAvailability(ranked, have, settings) {
  const ready = [], subbed = [], almost = [], two = [], rest = [];
  for (const c of ranked) {
    const { missing, subs, skips } = resolveAvailability(c.recipe, have, settings);
    const item = { ...c, missing, subs, skips };
    if (!missing.length && !subs.length && !skips.length) ready.push(item);
    else if (!missing.length) subbed.push(item);
    else if (missing.length === 1) almost.push(item);
    else if (missing.length === 2) two.push(item);
    else rest.push(item);
  }
  return { ready, subbed, almost, two, rest };
}

// 条件を緩めたときの件数（該当0件時の提案用）
export function relaxOptions(cond, ctx, settings, have) {
  const tryCond = (patch, haveOverride = have) => {
    const r = rankCandidates({ ...cond, ...patch }, ctx, settings);
    const s = splitByAvailability(r, haveOverride, settings);
    return s.ready.length + s.subbed.length + s.almost.length;
  };
  const opts = [];
  if (cond.time !== 'slow') opts.push({ key: 'time', label: '時間を「じっくり」に広げる', count: tryCond({ time: 'slow' }), patch: { time: 'slow' } });
  if (cond.cat !== 'any') opts.push({ key: 'cat', label: '料理の種類を「おまかせ」にする', count: tryCond({ cat: 'any' }), patch: { cat: 'any' } });
  if (have !== null) opts.push({ key: 'have', label: '食材がそろっている前提で見る', count: tryCond({}, null), patch: { have: null } });
  return opts.filter(o => o.count > 0);
}

// ── 分量の換算 ─────────────────
const NICE = [[1 / 4, '1/4'], [1 / 3, '1/3'], [1 / 2, '1/2'], [2 / 3, '2/3'], [3 / 4, '3/4']];
export function formatNum(v) {
  if (Math.abs(v - Math.round(v)) < 0.05) return String(Math.round(v));
  const whole = Math.floor(v), frac = v - whole;
  const nice = NICE.find(([f]) => Math.abs(f - frac) < 0.04);
  if (nice) return whole ? `${whole}と${nice[1]}` : nice[1];
  // 1/8・1/6・1/10 などの分数で表せるか
  for (const den of [5, 6, 8, 10, 12]) {
    const num = Math.round(frac * den);
    if (num > 0 && Math.abs(num / den - frac) < 0.01) return whole ? `${whole}と${num}/${den}` : `${num}/${den}`;
  }
  return (Math.round(v * 10) / 10).toString();
}
function parseNum(s) {
  let m = s.match(/^(\d+)と(\d+)\/(\d+)$/);
  if (m) return +m[1] + m[2] / m[3];
  m = s.match(/^(\d+)\/(\d+)$/);
  if (m) return m[1] / m[2];
  return parseFloat(s);
}
export function scaleText(text, factor) {
  if (factor === 1 || !text) return text;
  return text.replace(/\d+と\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?/g, (s, offset, whole) => {
    // 「600W」など加熱条件は換算しない
    if (/^\d+W/.test(whole.slice(offset))) return s;
    return formatNum(parseNum(s) * factor);
  });
}
// 手順中の {400} を換算
export function scaleStep(step, factor) {
  return step.replace(/\{([^}]+)\}/g, (_, n) => factor === 1 ? n : formatNum(parseNum(n) * factor));
}

export function natureBalance(recipe) {
  return NATURE_VALUE[recipe.nature];
}

export { TAG_LABELS };
