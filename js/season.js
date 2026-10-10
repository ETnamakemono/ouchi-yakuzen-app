// 二十四節気・五季・土用の判定（太陽の視黄経を Meeus の略算式で計算）
import { SEASONS, SOLAR_TERMS, DOYO_INFO, TSUYU_INFO } from '../data/seasons.js';

const rad = d => d * Math.PI / 180;
const norm = d => ((d % 360) + 360) % 360;

// UTCミリ秒 → 太陽の視黄経（度）
export function sunLongitude(ms) {
  const jd = ms / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(rad(M))
    + (0.019993 - 0.000101 * T) * Math.sin(rad(2 * M))
    + 0.000289 * Math.sin(rad(3 * M));
  const omega = 125.04 - 1934.136 * T;
  return norm(L0 + C - 0.00569 - 0.00478 * Math.sin(rad(omega)));
}

// 日付（ローカルの年月日）の 24:00 JST 時点の黄経
function lonAtEndOfDayJST(y, m, d) {
  // 24:00 JST = 翌日0:00 JST = 当日15:00 UTC
  return sunLongitude(Date.UTC(y, m - 1, d, 15, 0, 0));
}

export function getSeasonInfo(date = new Date()) {
  const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
  const lon = lonAtEndOfDayJST(y, m, d);
  const termIndex = Math.floor(lon / 15);
  const term = SOLAR_TERMS[termIndex];

  // 土用：黄経 27/117/207/297 〜 次の「立」(45/135/225/315)
  const doyoRanges = [[27, 45, 'spring'], [117, 135, 'summer'], [207, 225, 'autumn'], [297, 315, 'winter']];
  const doyo = doyoRanges.find(([a, b]) => lon >= a && lon < b);

  let season;
  if (lon >= 315 || lon < 45) season = 'spring';
  else if (lon < 117) season = 'summer';
  else if (lon < 135) season = 'longsummer';
  else if (lon < 225) season = 'autumn';
  else season = 'winter';
  // 春・秋・冬の土用は季節はそのまま、土用フラグで「脾」をいたわる表示
  const tsuyu = lon >= 80 && lon < 105;

  // 次の節気までの日数
  let daysToNext = 0;
  for (let i = 1; i <= 16; i++) {
    const nd = new Date(y, m - 1, d + i);
    const l = lonAtEndOfDayJST(nd.getFullYear(), nd.getMonth() + 1, nd.getDate());
    if (Math.floor(l / 15) !== termIndex) { daysToNext = i; break; }
  }
  const nextTerm = SOLAR_TERMS[(termIndex + 1) % 24];

  return {
    date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    lon, termIndex, term, nextTerm, daysToNext,
    season, seasonData: SEASONS[season],
    doyo: doyo ? { ...DOYO_INFO, of: SEASONS[doyo[2] === 'summer' ? 'summer' : doyo[2]].name } : null,
    tsuyu: tsuyu ? TSUYU_INFO : null,
    // レシピの季節タグ照合用（梅雨は 'tsuyu' も含める）
    tags: [season, ...(tsuyu ? ['tsuyu'] : []), ...(doyo ? ['doyo'] : [])],
  };
}

// 指定年の各節気の開始日（学びページ用）
export function termStartDates(year) {
  const out = [];
  let prev = null;
  for (let day = 0; day < 366; day++) {
    const dt = new Date(year, 0, 1 + day);
    if (dt.getFullYear() !== year) break;
    const idx = Math.floor(lonAtEndOfDayJST(year, dt.getMonth() + 1, dt.getDate()) / 15);
    if (prev !== null && idx !== prev) out.push({ index: idx, month: dt.getMonth() + 1, day: dt.getDate() });
    prev = idx;
  }
  return out;
}
