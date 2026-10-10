// 結果：見立て・季節・アドバイス・レシピ候補
import { store } from '../store.js';
import { esc, glossify, natureBadge } from '../ui.js';
import { buildContext } from '../context.js';
import { advise, splitByAvailability, relaxOptions, companionNotes, nutrition, TIME_LABELS } from '../engine.js';
import { WORRY_MAP, NO_WORRY } from '../../data/worries.js';
import { CATS } from '../../data/recipes.js';
import { COMPANION_MAP } from '../../data/companions.js';
import { ING_MAP } from '../../data/ingredients.js';
import { SEASONS } from '../../data/seasons.js';
import { illustSVG } from '../illust.js';
import { kksHTML, organStripHTML, PATTERN_ORGANS, ORGAN_TO_EL, SEASON_TO_EL, WORRY_SIGNS, GOGYO } from '../graphics.js';

const short = id => ING_MAP[id].name.replace(/（.*/, '');

export function recipeCard(item, from = 'r') {
  const r = item.recipe;
  const n = nutrition(r);
  return `<a class="rcard" href="#/recipe/${r.id}/${from}">
    ${illustSVG(r, { size: 'sm' })}
    <div class="r-body">
      <div class="r-name">${esc(r.name)}</div>
      <div class="r-meta">${CATS[r.cat].icon} ${CATS[r.cat].name}・${r.minutes}分・脂質${n.fat}g ${natureBadge(r.nature)}</div>
      ${item.missing?.length ? `<div class="r-missing">あと「${esc(item.missing.map(id => ING_MAP[id].name).join('・'))}」があれば</div>` : ''}
      ${item.subs?.length ? `<div class="r-missing" style="color:var(--ai)">${esc(item.subs.map(s => `${short(s.id)}→${short(s.alt)}`).join('、'))}で代用</div>` : ''}
      ${item.skips?.length ? `<div class="r-missing" style="color:var(--ink-3)">${esc(item.skips.map(short).join('・'))}はなくてもOK</div>` : ''}
      ${item.reasons?.length ? `<div class="r-why">${item.reasons.slice(0, 2).map(t => `<span class="tag matcha">${esc(t)}</span>`).join('')}</div>` : ''}
    </div></a>`;
}

export default function result() {
  const st = store.get();
  const d = st.draft;
  if (!d) return { title: '結果', back: '#/home', html: `<div class="empty"><span class="e-icon">🍵</span>相談内容がありません。<br><br><a class="btn primary" href="#/home">ホームへ</a></div>` };

  const { ctx, cond, ranked, season, diag, companions, settings } = buildContext(d);
  const have = d.have === undefined ? null : d.have;
  const split = splitByAvailability(ranked, have, settings);
  const adv = advise(diag, season);
  const sd = SEASONS[season.season];
  const noWorry = diag.mode === 'season';
  const main = diag.top[0]?.pattern;

  // 前回の相談として保存（「前回と同じ悩みで」用）
  store.update(s => { s.lastConsult = { who: d.who, serves: d.serves, worries: d.worries, companions: d.companions, at: new Date().toISOString() }; });

  const condChips = [
    d.who === 'self' ? '自分だけ（1人分）' : '夫と2人（2人分）',
    ...(noWorry ? ['季節の養生'] : d.worries.map(w => WORRY_MAP[w]?.name)),
    d.cat && d.cat !== 'any' ? CATS[d.cat].name : 'おまかせ',
    TIME_LABELS[d.time].replace(/（.*/, ''),
    ...d.companions.map(c => '＋' + COMPANION_MAP[c]?.name),
  ];

  // 季節との関係
  const inSeason = diag.top.filter(t => (sd.theme[t.id] || 0) > 0);
  const seasonText = `${season.term.name}のころ（${sd.name}）は「${sd.organ}」が影響を受けやすい時期。${sd.summary}` +
    (inSeason.length && !noWorry ? `今日の見立て「${inSeason[0].pattern.name}」は、この季節に起こりやすい状態でもあります。` : '');

  const shown = { ready: split.ready.slice(0, 5), subbed: split.subbed.slice(0, 4), almost: split.almost.slice(0, 3) };
  const more = [...split.ready.slice(5), ...split.subbed.slice(4), ...split.almost.slice(3)];
  const few = shown.ready.length + shown.subbed.length + shown.almost.length;
  const two = few < 3 ? split.two.slice(0, 3) : [];
  const zero = !few;
  // 図：注目の臓腑（見立て）と今の季節
  const focusOrgans = [...new Set(diag.top.flatMap(t => PATTERN_ORGANS[t.id] || []))];
  const focusEls = focusOrgans.map(o => ORGAN_TO_EL[o]);
  const worryNotes = d.worries.map(w => WORRY_MAP[w]).filter(w => w?.note);
  const signs = d.worries.filter(w => WORRY_SIGNS[w]).map(w => ({ w: WORRY_MAP[w], el: WORRY_SIGNS[w][0], why: WORRY_SIGNS[w][1] }));
  const signEls = [...new Set(signs.map(s => s.el))];
  const relax = zero ? relaxOptions(cond, ctx, settings, have) : [];
  const flags = d.worries.map(w => WORRY_MAP[w]).filter(w => w?.redflag);

  const seasonEl = SEASON_TO_EL[season.season];
  const seasonIcon = { spring: '🌸', summer: '☀️', longsummer: '🌾', autumn: '🍁', winter: '❄️' }[season.season];
  const evilPlain = { 風: '風', 暑: '暑さ', 湿: '湿気', 燥: '乾燥', 寒: '寒さ' }[sd.evil];
  const compNotes = companions.list.length ? companionNotes(companions, cond.cat) : [];
  const dot = x => { const g = GOGYO.find(e => e.key === x.el); return `<span class="el-dot" style="width:30px;height:30px;font-size:.8em;flex:none;background:${g.color};color:${g.text};${g.key === '金' ? 'border:1px solid #d9cfbb' : ''}">${g.organ}</span>`; };

  // ページの方針：上から「見立て → 食べ方 → レシピ」の要点だけ。くわしい解説は「もっと知る」に折りたたむ
  const html = `
  <div class="cond-line">${condChips.map(c => `<span class="tag">${esc(c)}</span>`).join('')}</div>
  <a href="#/consult/worries" class="small">条件を変える</a>

  <div class="card">
    <div class="label">${noWorry ? '今日の養生テーマ' : '今日の見立て'}</div>
    ${diag.top.map(t => `
      <div class="sum-pill"><span class="sp-icon">${t.pattern.icon}</span>
        <div><div class="sp-name">${glossify(t.pattern.name)}</div><div class="sp-short">${esc(t.pattern.short)}</div></div></div>`).join('')}
    <div class="mini-h">からだの状態</div>
    ${kksHTML(diag.top.map(t => t.id), diag.direction)}
    <div class="mini-h">注目の臓腑</div>
    ${organStripHTML(focusEls, seasonEl)}
    ${diag.contradiction ? `<p class="small" style="margin:.6em 0 0">🌗 冷えと熱のサインが両方あるので、どちらにも偏らない「平」の料理を中心に選んでいます。</p>` : ''}
  </div>

  <div class="season-banner" style="background:${sd.color}22"><span style="font-size:1.6em">${seasonIcon}</span>
    <span><b>${esc(season.term.name)}・${esc(sd.name)}</b>は「${esc(sd.organ)}」が弱りやすい季節（${evilPlain}に注意）${inSeason.length && !noWorry ? '。今日の不調は季節の影響も' : ''}${season.doyo ? '。いまは土用、胃腸をいたわって' : ''}</span></div>

  <h2>食べ方のポイント</h2>
  <div class="two-col">
    <div class="gb good"><h4>◎ とりたい食材</h4>${adv.foods.slice(0, 6).map(i => `<span class="food-chip">${natureBadge(i.nature)}${esc(i.name.replace(/（.*/, ''))}</span>`).join('')}</div>
    <div class="gb bad"><h4>△ 控えめに</h4><ul>${adv.avoid.slice(0, 3).map(a => `<li>${esc(a)}</li>`).join('')}</ul></div>
  </div>
  ${adv.cooking ? `<div class="tips-line"><span class="ti2">🍳</span><span>${esc(adv.cooking)}がおすすめ</span></div>` : ''}
  ${compNotes[0] ? `<div class="tips-line"><span class="ti2">🍽️</span><span>${esc(compNotes[0])}</span></div>` : ''}

  <h2>おすすめレシピ</h2>
  ${shown.ready.length ? `<div class="label small">${have === null ? '食材がそろっている前提' : '今ある食材で作れる'}</div>${shown.ready.map(x => recipeCard(x)).join('')}` : ''}
  ${shown.subbed.length ? `<div class="label small" style="margin-top:14px">代用・省略して作れる</div>${shown.subbed.map(x => recipeCard(x)).join('')}` : ''}
  ${shown.almost.length ? `<div class="label small" style="margin-top:14px">あと1つで作れる</div>${shown.almost.map(x => recipeCard(x)).join('')}` : ''}
  ${two.length ? `<div class="label small" style="margin-top:14px">あと2つで作れる（買い物ついでに）</div>${two.map(x => recipeCard(x)).join('')}` : ''}
  ${more.length ? `<div id="more" class="hidden">${more.slice(0, 8).map(x => recipeCard(x)).join('')}</div><button class="btn ghost block" data-act="more">別の候補を見る（${Math.min(more.length, 8)}件）</button>` : ''}
  ${zero ? `<div class="card tint-kaki">
    <p style="margin-top:0">この条件に合うレシピが見つかりませんでした。条件を少し広げてみませんか？</p>
    ${relax.length ? relax.map((o, i) => `<button class="btn block" style="margin:6px 0" data-relax="${i}">${esc(o.label)}（${o.count}件）</button>`).join('') : '<p class="small">悩みや料理の種類を変えて、もう一度お試しください。</p>'}
  </div>` : ''}

  <h2>もっと知る</h2>
  <details class="more"><summary>📖 見立てをくわしく</summary><div class="body">
    ${diag.top.map(t => `<p><b>${esc(t.pattern.name)}</b>：${glossify(t.pattern.plain)}${noWorry ? '' : 'の傾向が考えられます。'}</p>`).join('')}
    <ul class="points">${adv.tips.map(t => `<li>${glossify(t)}</li>`).join('')}</ul>
    ${noWorry ? `<p class="small">特に不調がない日は、季節${st.constitution ? 'と体質' : ''}に合わせた「予防の養生」を。</p>` : ''}
  </div></details>
  ${worryNotes.length ? `<details class="more"><summary>🔍 悩みを薬膳で読み解くと</summary><div class="body">${worryNotes.map(w => `<p><b>${esc(w.name)}</b><br>${glossify(w.note)}</p>`).join('')}</div></details>` : ''}
  ${signs.length ? `<details class="more"><summary>🎨 五行色体表で見ると</summary><div class="body">
    ${signs.map(x => `<div style="display:flex;gap:8px;align-items:flex-start;margin:8px 0">${dot(x)}<span><b>${esc(x.w.name)}</b><br><span class="small">${esc(x.why)}</span></span></div>`).join('')}
    <a class="small" href="#/learn/gogyo">五行のカードを見る ›</a></div></details>` : ''}
  <details class="more"><summary>${seasonIcon} 季節との関係</summary><div class="body"><p>${glossify(seasonText)}</p>
    ${season.doyo ? `<p class="small">🍂 今は土用。${glossify(season.doyo.summary)}</p>` : ''}</div></details>
  ${compNotes.length > 1 || d.companions.includes('yogurt') || d.companions.includes('fruit') ? `<details class="more"><summary>🍽️ 一緒に食べるもののひと工夫</summary><div class="body">
    ${compNotes.slice(1).map(n => `<p>${esc(n)}</p>`).join('')}
    ${d.companions.includes('yogurt') ? `<p><b>ヨーグルト</b></p><ul class="points">${ING_MAP.yogurt.howto.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
    ${d.companions.includes('fruit') ? `<p><b>果物</b></p><ul class="points"><li>果物の多くは涼〜寒性。冷えが気になる日は、常温に戻すか、焼く・煮る・レンジで温めると冷やす性質がやわらぎます。</li><li>${esc(ING_MAP.banana.howto[0])}</li><li>${esc(ING_MAP.kaki.howto[0])}</li></ul><a class="small" href="#/learn/howto">食べ方の知恵をもっと見る ›</a>` : ''}
  </div></details>` : ''}

  ${flags.length ? `<div class="card tint-beni flat small"><b>⚠️ 受診の目安</b><ul class="points">${flags.map(w => `<li>${esc(w.redflag)}</li>`).join('')}</ul></div>` : ''}
  <p class="disclaimer">見立ては、選んだ症状と季節${st.constitution ? '・体質' : ''}から薬膳の考え方で導いた目安で、診断ではありません。不調が続く・強いときは医療機関へ。</p>
  `;

  return {
    title: '今日の提案', back: '#/consult/have', tabbar: false,
    right: `<a class="icon-btn" href="#/home" aria-label="ホーム">🏠</a>`,
    html,
    mount(root) {
      const mb = root.querySelector('[data-act=more]');
      if (mb) mb.onclick = () => { root.querySelector('#more').classList.remove('hidden'); mb.remove(); };
      root.querySelectorAll('[data-relax]').forEach(b => b.onclick = () => {
        const o = relax[+b.dataset.relax];
        store.update(s => {
          if (o.patch.time) s.draft.time = o.patch.time;
          if (o.patch.cat) s.draft.cat = o.patch.cat;
          if ('have' in o.patch) s.draft.have = null;
        });
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    },
  };
}
