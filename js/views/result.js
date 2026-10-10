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
import { cellRuby, gogyoSVG, kksHTML, PATTERN_ORGANS, ORGAN_TO_EL, SEASON_TO_EL, WORRY_SIGNS, GOGYO } from '../graphics.js';

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
      ${item.reasons?.length ? `<div class="r-why">${item.reasons.map(t => `<span class="tag matcha">${esc(t)}</span>`).join('')}</div>` : ''}
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

  const html = `
  <div class="chips" style="gap:4px;margin-top:6px">${condChips.map(c => `<span class="tag">${esc(c)}</span>`).join('')}</div>
  <a href="#/consult/worries" class="small">条件を変える</a>

  <div class="card">
    <div class="label">${noWorry ? '今日の養生テーマ' : '今日の見立て'}</div>
    <div class="viz-row">
      <div>${kksHTML(diag.top.map(t => t.id), diag.direction)}</div>
      <div>${gogyoSVG({ highlight: focusEls, season: SEASON_TO_EL[season.season], size: 'sm', labels: false })}
        <div class="viz-cap">注目：<b>${cellRuby(focusOrgans.join('・'))}</b><br>（今の季節は${cellRuby(sd.organ)}）</div></div>
    </div>
    ${diag.top.map((t, i) => `
      <div class="diag-name">${i ? '<span class="small muted">＋</span> ' : ''}${glossify(t.pattern.name)}</div>
      <p style="margin:0 0 .6em">${glossify(t.pattern.plain)}${noWorry ? '' : 'の傾向が考えられます。'}</p>`).join('')}
    ${diag.contradiction ? `<div class="card tint-ai flat small" style="margin:8px 0 0">冷えのサインと熱のサインが両方あります。「上は熱いのに下は冷える」など寒熱が入り混じった状態のこともあるので、今日はどちらにも偏らない「平」の性質の料理を中心に選んでいます。</div>` : ''}
    ${noWorry ? `<p class="small" style="margin:0">特に不調がない日は、季節${st.constitution ? 'と体質' : ''}に合わせた「予防の養生」を。</p>` : ''}
  </div>

  ${worryNotes.length ? `<h2>あなたの悩みを薬膳で読み解くと</h2>${worryNotes.map(w => `<div class="tip-card"><b>${esc(w.name)}</b><br>${glossify(w.note)}</div>`).join('')}` : ''}

  ${signs.length ? `<h2>五行色体表で見ると</h2>
    <div class="viz-row" style="grid-template-columns:1fr 140px">
      <div>${signs.map(x => { const g = GOGYO.find(e => e.key === x.el); return `<div style="display:flex;gap:8px;align-items:flex-start;margin:6px 0"><span class="el-dot" style="width:30px;height:30px;font-size:.8em;flex:none;background:${g.color};color:${g.text};${g.key === '金' ? 'border:1px solid #d9cfbb' : ''}">${g.organ}</span><span class="small"><b>${esc(x.w.name)}</b><br>${esc(x.why)}</span></div>`; }).join('')}</div>
      <div>${gogyoSVG({ highlight: signEls, season: SEASON_TO_EL[season.season], size: 'sm', labels: false })}</div>
    </div>
    ${signEls.length >= 2 ? `<p class="small">サインが複数の臓腑にまたがっています。五行はお互いに助け合い（相生）・抑え合う（相剋）関係なので、一つを整えるとほかにも良い影響が広がると考えます。</p>` : ''}
    <a class="small" href="#/learn/gogyo">五行色体表を見る ›</a>` : ''}

  <h2>季節との関係</h2>
  <p>${glossify(seasonText)}</p>
  ${season.doyo ? `<p class="small">🍂 今は土用。${glossify(season.doyo.summary)}</p>` : ''}

  <h2>食養生のアドバイス</h2>
  <div class="card flat">
    <div class="label">おすすめの食材</div>
    <div>${adv.foods.map(i => `<span class="food-chip">${natureBadge(i.nature)}${esc(i.name.replace(/（.*/, ''))}</span>`).join('')}</div>
    ${adv.cooking ? `<p class="small" style="margin:.6em 0 0">🍳 料理の目安：${esc(adv.cooking)}</p>` : ''}
  </div>
  <ul class="points">${adv.tips.map(t => `<li>${glossify(t)}</li>`).join('')}</ul>
  ${adv.avoid.length ? `<p class="small">控えめにしたいもの：${adv.avoid.map(a => `<span class="tag beni">${esc(a)}</span>`).join('')}</p>` : ''}

  ${companions.list.length ? `<h2>合わせる料理とのバランス</h2>${companionNotes(companions, cond.cat).map(n => `<p>${esc(n)}</p>`).join('')}
    ${d.companions.includes('yogurt') ? `<div class="tip-card"><b>ヨーグルトを食べるときのひと工夫</b><ul class="points">${ING_MAP.yogurt.howto.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
    ${d.companions.includes('fruit') ? `<div class="tip-card"><b>果物を食べるときのひと工夫</b><ul class="points"><li>果物の多くは涼〜寒性。冷えが気になる日は、常温に戻すか、焼く・煮る・レンジで温めると冷やす性質がやわらぎます。</li><li>${esc(ING_MAP.banana.howto[0])}</li><li>${esc(ING_MAP.kaki.howto[0])}</li></ul><a class="small" href="#/learn/howto">食べ方の知恵をもっと見る ›</a></div>` : ''}` : ''}

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
