// 学び：季節の養生・用語集・体の状態（証）・体質
import { esc, glossify, natureBadge, rubyHTML, ruby } from '../ui.js';
import { gogyoSVG, kksHTML, natureScaleHTML, tasteChip, cellRuby, GOGYO, GOGYO_ROWS, SEASON_TO_EL } from '../graphics.js';
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
      const show = key => {
        const g = GOGYO.find(x => x.key === key);
        root.querySelector('#el-detail').innerHTML = rubyHTML(`<div class="el-card"><div class="el-dot" style="background:${g.color};color:${g.text};${g.key === '金' ? 'border:2px solid #d9cfbb' : ''}">${g.organ}</div>
          <div><b class="serif">${cellRuby(g.key)}（${g.hue}）― ${cellRuby(g.organ)}・${cellRuby(g.fu)}</b><br><span class="small">${esc(g.desc)}</span></div></div>
          <table class="gtable" style="margin-top:8px"><tr><th>季節</th><td>${g.season}</td><th>五味</th><td>${tasteChip(g.taste)}</td></tr>
          <tr><th>苦手</th><td>${g.climate}</td><th>感情</th><td>${g.emotion}</td></tr>
          <tr><th>感覚器</th><td>${g.sense}</td><th>体の部位</th><td>${g.tissue}</td></tr>
          <tr><th>表れる所</th><td>${g.flower}</td><th>分泌液</th><td>${esc(g.fluid)}</td></tr>
          <tr><th>方角</th><td>${g.direction}</td><th>声</th><td>${esc(g.voice)}</td></tr></table>`);
        root.querySelectorAll('.gg-node').forEach(n => n.style.opacity = n.dataset.el === key ? 1 : .55);
      };
      root.querySelectorAll('.gg-node').forEach(n => { n.onclick = () => show(n.dataset.el); n.onkeydown = e => { if (e.key === 'Enter') show(n.dataset.el); }; });
      show(SEASON_TO_EL[getSeasonInfo(new Date()).season]);
    },
  };
}

function gogyo() {
  const si = getSeasonInfo(new Date());
  const rows = GOGYO_ROWS;
  return `
  <p class="small" style="margin-top:12px">自然も体も「木・火・土・金・水」の5つの要素でできている、という考え方が<b>五行</b>。季節・臓器・色・味がつながっていて、たとえば<b>秋＝金＝肺＝白＝辛</b>。だから秋は「白い食材」で肺を潤す、と考えます。</p>
  ${gogyoSVG({ season: SEASON_TO_EL[si.season], size: 'lg', interactive: true })}
  <p class="viz-cap">● が今の季節。丸をタップすると詳しく見られます。<br>外まわりの矢印＝<b>相生</b>（育てる関係：木→火→土→金→水）／点線の星＝<b>相剋</b>（抑える関係）</p>
  <div class="card" id="el-detail"></div>

  <h2>五行色体表</h2>
  <p class="small">中医学の古典『黄帝内経』にもとづく、自然と体の対応表。横に読むと「どの五行のグループか」がわかります。体のサインがどこに表れているかで、弱っている臓腑を推しはかるヒントになります。</p>
  <div style="overflow-x:auto"><table class="gtable fit">
    <tr><th></th>${GOGYO.map(g => `<td style="background:${g.color};color:${g.text};font-weight:700;${g.key === '金' ? 'border:1px solid #d9cfbb' : ''}">${cellRuby(g.key)}</td>`).join('')}</tr>
    ${rows.map(([l, k]) => `<tr><th>${l.replace(/（(.*)）/, '<small>$1</small>')}</th>${GOGYO.map(g => `<td style="background:${g.color}1f">${k === 'taste' ? tasteChip(g.taste) : cellRuby(g[k].replace(/（.*/, ''))}</td>`).join('')}</tr>`).join('')}
  </table></div>
  <div class="tip-card"><b>色体表で体のサインを読む例</b><ul class="points">
    <li><b>水っぽい鼻水</b>：五液の「涕（鼻水）」・五官の「鼻」→ <b>金＝肺</b></li>
    <li><b>二枚爪</b>：五華の「爪」→ <b>木＝肝</b>（肝が蓄える血の不足）</li>
    <li><b>食いしばり</b>：五主の「筋」・五志の「怒」→ <b>木＝肝</b></li>
    <li><b>腰から下の冷え</b>：五気の「寒」・腰は腎の府 → <b>水＝腎</b></li>
    <li><b>胃もたれ・ガス</b>：五腑の「胃」→ <b>土＝脾</b></li></ul></div>

  <h2>気・血・水</h2>
  <p class="small">体をめぐる3つの要素。「足りない」「滞る」「たまる」のどれが起きているかで、選ぶ食材が変わります。</p>
  ${kksHTML([], 'neutral')}
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
