// 学び：季節の養生・用語集・体の状態（証）・体質
import { esc, glossify, natureBadge, rubyHTML, ruby } from '../ui.js';
import { gogyoSVG, natureScaleHTML, tasteChip, cellRuby, elementCardHTML, GOGYO, GOGYO_ROWS, SEASON_TO_EL } from '../graphics.js';
import { CELL_READINGS } from '../../data/readings.js';
import { ING_MAP } from '../../data/ingredients.js';
import { getSeasonInfo, termStartDates } from '../season.js';
import { SEASONS, SOLAR_TERMS } from '../../data/seasons.js';
import { GLOSSARY, GLOSSARY_CATS } from '../../data/glossary.js';
import { PATTERNS } from '../../data/patterns.js';
import { CONSTITUTIONS } from '../../data/constitutions.js';

const TABS = [['season', '季節'], ['gogyo', '五行'], ['howto', '食べ方の知恵'], ['patterns', '体の状態'], ['const', '体質'], ['glossary', '用語']];

export default function learn([tab = 'season']) {
  const body = { season, gogyo, howto, glossary, patterns, const: consts }[tab] || season;
  return {
    title: '学び', tab: 'learn',
    html: `<div class="seg scroll" style="margin-top:8px" data-noruby>${TABS.map(([k, l]) => `<button class="${k === tab ? 'on' : ''}" onclick="location.hash='#/learn/${k}'">${l}</button>`).join('')}</div>${body()}`,
    mount(root) {
      if (tab !== 'gogyo') return;
      const jump = key => root.querySelector('#el-' + key)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      root.querySelectorAll('[data-jump]').forEach(a => { a.onclick = e => { e.preventDefault(); jump(a.dataset.jump); }; });
      root.querySelectorAll('.gg-node').forEach(n => { n.onclick = () => jump(n.dataset.el); n.onkeydown = e => { if (e.key === 'Enter') jump(n.dataset.el); }; });
    },
  };
}

function gogyo() {
  const si = getSeasonInfo(new Date());
  const now = SEASON_TO_EL[si.season];
  // 今の季節のチームを先頭に
  const order = [now, ...GOGYO.map(g => g.key).filter(k => k !== now)];
  const cols = GOGYO_ROWS.filter(([, k]) => !['direction', 'voice', 'smell'].includes(k));
  return `
  <p style="margin-top:12px">体と自然を<b>5つのチーム</b>に分けて考えるのが「五行」。同じチームの仲間は、弱るときも元気になるときも一緒、と考えます。</p>
  <div class="howto-read">
    <div><b>①</b>自分の体のサインを探す</div>
    <div><b>②</b>そのカードが弱っているチーム</div>
    <div><b>③</b>同じカードの食材で養う</div>
  </div>
  <div class="el-jump">${GOGYO.map(g => `<a href="javascript:void(0)" data-jump="${g.key}" style="background:${g.color};color:${g.text};${g.key === '金' ? 'border:1.5px solid #cfc5b0;' : ''}">${cellRuby(g.organ)}<small>${g.key}・${g.season.replace(/・.*/, '')}</small></a>`).join('')}</div>
  <p class="viz-cap">気になるチームをタップ</p>

  ${order.map(k => elementCardHTML(k, { now: k === now })).join('')}

  <h2>チーム同士の関係</h2>
  ${gogyoSVG({ season: now, size: 'lg', interactive: true })}
  <p class="viz-cap">● が今の季節。丸をタップするとカードへ移動します。<br>外まわりの矢印＝<b>相生</b>（次のチームを育てる）／点線の星＝<b>相剋</b>（行きすぎを抑える）</p>

  <details class="more"><summary>📋 一覧表（五行色体表）で見る</summary><div class="body">
    <p class="small">横1行が1つのチームです。表は横にスクロールできます。</p>
    <div style="overflow-x:auto"><table class="gtable wide">
      <thead><tr><th></th>${cols.map(([l]) => `<th>${l.replace(/（.*/, '')}</th>`).join('')}</tr></thead>
      ${GOGYO.map(g => `<tr><th class="rowh" style="background:${g.color};color:${g.text};${g.key === '金' ? 'border:1px solid #d9cfbb' : ''}">${cellRuby(g.key)}</th>
        ${cols.map(([, k]) => `<td style="background:${g.color}1f">${k === 'taste' ? tasteChip(g.taste) : cellRuby(g[k].replace(/（.*/, ''))}</td>`).join('')}</tr>`).join('')}
    </table></div>
    <p class="small">中医学の古典『黄帝内経』にもとづく対応表です。</p>
  </div></details>

  <h2>気・血・水</h2>
  <p class="small">体をめぐる3つの要素。「足りない」「滞る」「たまる」のどれが起きているかで、選ぶ食材が変わります。</p>
  <div class="principles" style="margin-top:10px">
    <div class="principle"><span class="pi">🔋</span><b>不足（虚）</b>補う食材を<br><small>例：気虚→米・芋・鶏肉</small></div>
    <div class="principle"><span class="pi">〰️</span><b>滞り（滞・瘀）</b>巡らせる食材を<br><small>例：気滞→香りの野菜</small></div>
    <div class="principle"><span class="pi">💧</span><b>たまり（水毒・痰湿）</b>出す食材を<br><small>例：とうもろこし・海藻</small></div>
    <div class="principle"><span class="pi">🌡️</span><b>寒・熱</b>温める／冷ます<br><small>例：冷え→生姜・ねぎ</small></div>
  </div>

  <h2>五性（食材の温度感）</h2>
  ${natureScaleHTML([ING_MAP.cucumber, ING_MAP.banana, ING_MAP.tomato, ING_MAP.tofu, ING_MAP.rice, ING_MAP.carrot, ING_MAP.chicken_breast, ING_MAP.ginger, ING_MAP.cinnamon, ING_MAP.pepper], null)}
  <p class="small">冷え性の人は温・熱を多めに、ほてりやすい人は涼・寒を取り入れて。迷ったら「平」を中心にすると偏りません。</p>`;
}

const PAIRS = [
  ['バナナ × はちみつ', 'どちらも腸を潤す食材。便秘ぎみのときに。バナナは寒性なので、温めたりシナモンをふったりすると◎。'],
  ['ヨーグルト × きな粉・はちみつ', 'ヨーグルトの潤す力に、胃腸を元気にするきな粉や、肺と腸を潤すはちみつをプラス。'],
  ['豆腐 × 生姜・ねぎ', '涼性の豆腐に温性の薬味を合わせて、冷やしすぎないように。湯豆腐が理想的。'],
  ['きゅうり × しそ・生姜', '寒性のきゅうりを温性の香味で中和。夏のむくみ対策に。'],
  ['かぼちゃ × あずき（いとこ煮）', '胃腸を補うかぼちゃと、余分な水を出すあずき。冬至の伝統食で、むくみ・冷えに。'],
  ['ほうれん草 × ごま', '血を補う同士の組み合わせ。ごまの油分と香りで、涼性のほうれん草も食べやすく。'],
  ['生姜 × はちみつ（生姜湯）', '体を温める生姜に、のどを潤すはちみつ。冷えとのどの乾燥が同時にある秋冬に。'],
  ['梨・りんご × 生姜（加熱）', '肺を潤す果物を加熱し、生姜で冷えすぎを防ぐ。乾いた咳に。'],
  ['お刺身・ビール × 温かい汁物', '冷たいもの同士が重なる日は、生姜やねぎの効いた温かい汁物を一品足してバランスを。'],
];

function howto() {
  const list = Object.values(ING_MAP).filter(i => i.howto?.length);
  return `
  <p class="small" style="margin-top:12px">体を冷やす性質（寒・涼）の食材も、食べ方しだいで作用をやわらげられます。</p>
  <div class="principles">
    <div class="principle"><span class="pi">🔥</span><b>加熱する</b>焼く・煮る・レンジ<br><small>焼きバナナ・煮りんご</small></div>
    <div class="principle"><span class="pi">🫚</span><b>温性と合わせる</b>生姜・ねぎ・しそ・シナモン<br><small>冷奴に生姜</small></div>
    <div class="principle"><span class="pi">☀️</span><b>干す</b>天日干しで性質がおだやかに<br><small>干し柿・切り干し大根</small></div>
    <div class="principle"><span class="pi">🌡️</span><b>常温に戻す</b>冷蔵庫から出してすぐを避ける<br><small>ヨーグルト・果物</small></div>
  </div>
  <h2>相性のよい食べ合わせ</h2>
  ${PAIRS.map(([t, d]) => `<div class="tip-card"><b>${esc(t)}</b><br>${esc(d)}</div>`).join('')}
  <p class="small">※昔から言われる「食い合わせ（うなぎと梅干し など）」には、科学的な根拠がはっきりしない言い伝えも多く含まれます。ここでは薬膳の「性質のバランス」の考え方にもとづく組み合わせを紹介しています。</p>
  <h2>食材別のひと工夫</h2>
  ${list.map(i => `<details class="ing-detail"><summary>${natureBadge(i.nature)}<b>${esc(i.name)}</b></summary><div class="body"><ul class="points">${i.howto.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div></details>`).join('')}`;
}

function season() {
  const si = getSeasonInfo(new Date());
  const sd = si.seasonData;
  const year = new Date().getFullYear();
  const starts = termStartDates(year);
  const dateOf = idx => { const s = starts.find(x => x.index === idx); return s ? `${s.month}/${s.day}` : ''; };
  // 立春(21)から並べる
  const order = Array.from({ length: 24 }, (_, i) => (21 + i) % 24);
  return `
  <div class="card tint-matcha" style="margin-top:14px">
    <div class="label">いまは</div>
    <div class="diag-name">${ruby(si.term.name, si.term.kana)}</div>
    <p style="margin:0">${esc(si.term.meaning)}${glossify(si.term.tip)}</p>
    ${si.daysToNext ? `<p class="small" style="margin:.4em 0 0">次の「${esc(si.nextTerm.name)}」まであと${si.daysToNext}日</p>` : ''}
  </div>
  <h2>${esc(sd.name)}の養生</h2>
  <p>${glossify(sd.summary)}</p>
  <ul class="points">${sd.tips.map(t => `<li>${glossify(t)}</li>`).join('')}</ul>
  <p class="small">おすすめ食材：${sd.foods.map(f => `<span class="tag matcha">${esc(f)}</span>`).join('')}</p>
  ${si.doyo ? `<div class="card tint-kaki flat small">🍂 <b>土用</b>：${glossify(si.doyo.summary)}</div>` : ''}

  <h2>五季と五臓</h2>
  ${['spring', 'summer', 'longsummer', 'autumn', 'winter'].map(k => { const s = SEASONS[k]; return `
    <details class="ing-detail" ${k === si.season ? 'open' : ''}><summary><span class="tag" style="background:${s.color};color:#fff">${esc(s.name)}</span><span>五臓：<b>${esc(s.organ)}</b>・苦手：${esc(s.evil)}</span></summary>
    <div class="body"><p>${glossify(s.summary)}</p><p class="small">弱りやすい：${s.weak.map(w => esc(w)).join('、')}</p></div></details>`; }).join('')}

  <h2>${year}年の二十四節気</h2>
  <div class="term-list">${order.map(i => `
    <div class="row ${i === si.termIndex ? 'now' : ''}"><span class="tn">${esc(SOLAR_TERMS[i].name)}</span><span class="td">${dateOf(i)}〜</span><span class="tt">${esc(SOLAR_TERMS[i].tip)}</span></div>`).join('')}</div>
  <p class="small">日付は太陽の位置から計算しています（±1日の誤差がある場合があります）。</p>`;
}

function glossary() {
  return GLOSSARY_CATS.map(c => `<h2>${esc(c)}</h2><dl class="gloss">${GLOSSARY.filter(g => g.cat === c).map(g => `<dt data-noruby>${esc(g.term)}</dt><dd>${esc(g.text)}</dd>`).join('')}</dl>`).join('');
}

function patterns() {
  return `<p class="small" style="margin-top:12px">「証（しょう）」は、今の体の状態を中医学の見方で表したものです。前半の8つは神奈川県「未病を改善する薬膳」の分類にもとづいています。</p>` +
    PATTERNS.map(p => `
    <details class="ing-detail"><summary><span><b>${esc(p.name)}</b></span></summary>
      <div class="body"><p>${glossify(p.plain)}</p>
      <p class="small">よくあるサイン：${p.signs.map(s => esc(s)).join('、')}</p>
      <p class="small">料理の目安：${esc(p.cooking)}（合う性質：${p.natures.join('・')}）</p>
      <ul class="points">${p.advice.map(a => `<li>${glossify(a)}</li>`).join('')}</ul></div></details>`).join('');
}

function consts() {
  return `<p class="small" style="margin-top:12px">中華中医薬学会「中医体質分類と判定」の9つの体質です。<a href="#/constitution">体質チェック</a>であなたの傾向がわかります。</p>` +
    CONSTITUTIONS.map(c => `
    <details class="ing-detail"><summary><span><b>${esc(c.name)}</b> <small class="muted">${esc(c.short)}</small></span></summary>
      <div class="body"><p>${glossify(c.desc)}</p>
      <p class="small">おすすめ：${c.good.map(g => `<span class="tag matcha">${esc(g)}</span>`).join('')}</p></div></details>`).join('');
}
