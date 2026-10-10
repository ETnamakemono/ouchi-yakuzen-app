// レシピ詳細
import { store } from '../store.js';
import { esc, glossify, natureBadge, sheet, toast } from '../ui.js';
import { gogyoSVG, natureScaleHTML, tasteChip, organCounts, cellRuby, GOGYO } from '../graphics.js';
import { nutrition, resolveAvailability, scaleText, scaleStep, recipeTags, TAG_LABELS } from '../engine.js';
import { RECIPE_MAP, CATS } from '../../data/recipes.js';
import { ING_MAP } from '../../data/ingredients.js';
import { PATTERN_MAP } from '../../data/patterns.js';
import { getSeasonInfo } from '../season.js';
import { illustSVG } from '../illust.js';

const TOOL_LABELS = { microwave: '電子レンジ', toaster: 'トースター', ricecooker: '炊飯器' };
const MEMO_CHIPS = ['ぽかぽか', 'ほっとした', 'おいしい', 'また作りたい', 'すっきり', 'もう少し味を濃く'];
let wakeLock = null;
window.addEventListener('hashchange', () => { wakeLock?.release?.(); wakeLock = null; });

export default function recipe([id, from]) {
  const r = RECIPE_MAP[id];
  const back = from === 'r' ? '#/result' : from === 'rec' ? '#/records' : '#/home';
  if (!r) return { title: 'レシピ', back, html: `<div class="empty">レシピが見つかりませんでした。</div>` };
  const st = store.get();
  const d = from === 'r' ? st.draft : null;
  let serves = d?.serves || st.settings.defaultServes;
  const avail = d && Array.isArray(d.have) ? resolveAvailability(r, d.have, st.settings) : { missing: [], subs: [], skips: [] };
  const missing = avail.missing;
  const subOf = Object.fromEntries(avail.subs.map(s => [s.id, s.alt]));
  const n = nutrition(r);
  const tags = recipeTags(r);
  const mainIngs = [...new Set(r.items.map(i => i[0]))].map(x => ING_MAP[x]).filter(i => i && (i.group !== 'seasoning' || i.tags.length));

  const ingRows = factor => r.items.map(([iid, , text, prep, opt]) => {
    const ing = ING_MAP[iid];
    const miss = missing.includes(iid);
    const ngPartner = d?.who === 'pair' && opt === 'opt' && ing.flags.some(f => st.settings.ngPartner.flags.includes(f));
    const alt = subOf[iid];
    return `<tr class="${miss ? 'missing' : ''}"><td>${esc(ing.name)}${opt === 'opt' ? ' <span class="tag">あれば</span>' : ''}${miss ? ' <span class="tag kaki">足りない</span>' : ''}${alt ? ' <span class="tag ai">代用OK</span>' : ''}${avail.skips.includes(iid) ? ' <span class="tag">なくてもOK</span>' : ''}
      ${prep ? `<span class="prep">${esc(prep)}</span>` : ''}
      ${alt ? `<span class="sub" style="color:var(--ai)">→ 家にある「${esc(ING_MAP[alt].name)}」で代用できます</span>` : ''}
      ${miss && ing.subs.length ? `<span class="sub">代わりに：${esc(ing.subs.join('、'))}</span>` : ''}
      ${ngPartner ? `<span class="sub">夫の分には入れない</span>` : ''}</td>
      <td class="amt">${esc(scaleText(text, factor))}</td></tr>`;
  }).join('');

  const foodIngs = r.items.filter(i => i[4] !== 'opt').map(i => ING_MAP[i[0]]).filter(i => i.group !== 'seasoning' || i.tags.length);
  const oc = organCounts(foodIngs);
  const maxOc = Math.max(0, ...Object.values(oc));
  const topOrgans = Object.entries(oc).filter(([, v]) => v >= Math.max(1, maxOc - 1)).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
  const cautions = [r.caution, ...mainIngs.map(i => i.caution && `${i.name.replace(/（.*/, '')}：${i.caution}`)].filter(Boolean);

  const html = `
  <div class="r-hero">${illustSVG(r, { size: 'lg' })}</div>
  <div class="r-title">${esc(r.name)}</div>
  <div class="meta-row">
    <span>${CATS[r.cat].icon} ${CATS[r.cat].name}</span><span>⏱ <b>${r.minutes}分</b></span>
    <span>${r.tools.length ? '🔌 ' + r.tools.map(t => TOOL_LABELS[t]).join('・') : '🔥 コンロ'}</span>
    <span>五性 ${natureBadge(r.nature)}</span>
  </div>
  <div class="meta-row" style="margin-top:4px"><span>1人分：脂質 <b>${n.fat}g</b>・約 <b>${n.kcal}kcal</b></span></div>
  <div class="center" style="margin-top:6px">${r.targets.map(t => `<span class="tag ai">${esc(PATTERN_MAP[t].name)}</span>`).join('')}</div>

  <div class="serves"><span><b>材料</b> <small>（人数を変えると分量も変わります）</small></span>
    <div class="stepper"><button data-s="-1" aria-label="減らす">−</button><output id="serves">${serves}人分</output><button data-s="1" aria-label="増やす">＋</button></div>
  </div>
  <table class="ing" id="ing-table">${ingRows(serves / 2)}</table>
  ${missing.length ? `<p class="small" style="color:var(--kaki)">「足りない」食材は、代わりの食材を使うか、なしでも作れるように調整してください。</p>` : ''}
  ${avail.subs.length ? `<p class="small" style="color:var(--ai)">代用すると、味や薬膳的な働きが少し変わります（例：黒ごまは白ごまより「血」と「腎」を補う力が強いとされます）。気軽に試してみてください。</p>` : ''}

  <h2>作り方</h2>
  <ol class="steps" id="steps">${r.steps.map(s => `<li>${esc(scaleStep(s, serves / 2))}</li>`).join('')}</ol>
  <p class="small muted" id="heat-note" ${serves === 2 ? 'hidden' : ''}>※分量を変えたときは、電子レンジの加熱時間や煮る時間を様子を見て調整してください。</p>

  <h2>レシピのポイント</h2>
  <ul class="points">${r.points.map(p => `<li>${glossify(p)}</li>`).join('')}</ul>

  <h2>薬膳的な考え方</h2>
  <div class="card tint-matcha flat"><p style="margin:0">${glossify(r.explain)}</p></div>
  <div>${[...tags].filter(t => TAG_LABELS[t]).slice(0, 8).map(t => `<span class="tag matcha">${esc(TAG_LABELS[t])}</span>`).join('')}</div>

  <h3>食材の「五性」バランス</h3>
  ${natureScaleHTML(foodIngs, r.nature)}
  <div class="viz-row" style="grid-template-columns:1fr 150px">
    <div>
      <h3 style="margin-top:0">働きかける臓腑</h3>
      <p class="small" style="margin:0">食材の「帰経」を五行の図に重ねると、この料理は<b>${cellRuby(topOrgans.map(e => GOGYO.find(g => g.key === e).organ).join('・'))}</b>に特に働きかける組み合わせです。</p>
      <div style="margin-top:6px">${[...new Set(foodIngs.flatMap(i => i.taste))].map(tasteChip).join('')}</div>
    </div>
    <div>${gogyoSVG({ highlight: topOrgans, size: 'sm', labels: false })}</div>
  </div>

  <h2>食材の解説</h2>
  <div>${mainIngs.map(i => `
    <details class="ing-detail"><summary>${natureBadge(i.nature)}<span><b>${esc(i.name)}</b></span></summary>
      <div class="body">
        <dl class="props">
          <dt>五性</dt><dd>${cellRuby(i.nature)}（${{ '寒': '強く冷やす', '涼': 'やや冷やす', '平': '偏らない', '温': 'やや温める', '熱': '強く温める' }[i.nature]}）</dd>
          <dt>五味</dt><dd>${i.taste.map(tasteChip).join('')}</dd>
          ${i.meridian.length ? `<dt>帰経</dt><dd>${cellRuby(i.meridian.join('・'))}</dd>` : ''}
          ${i.shun[0] !== 'all' ? `<dt>旬</dt><dd>${esc(i.shun.map(s => ({ spring: '春', summer: '夏', tsuyu: '梅雨', longsummer: '夏の終わり', autumn: '秋', winter: '冬' }[s])).join('・'))}</dd>` : ''}
        </dl>
        <ul class="points">${i.actions.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
        ${i.note ? `<p class="small">💡 ${glossify(i.note)}</p>` : ''}
        ${i.howto?.length ? `<div class="howto"><b>食べ方のひと工夫</b><ul class="points">${i.howto.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
      </div></details>`).join('')}</div>
  <p class="small" style="margin-top:8px"><button type="button" class="term" data-term="五性">五性</button>・<button type="button" class="term" data-term="五味">五味</button>・<button type="button" class="term" data-term="帰経">帰経</button>ってなに？</p>

  ${cautions.length ? `<div class="card tint-beni flat small"><b>注意</b><ul class="points">${cautions.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>` : ''}

  <div class="action-bar"><div class="inner">
    <button class="btn ghost back" data-act="cook">🔥 調理モード</button>
    <button class="btn kaki" data-act="made">🍽 作った！</button>
  </div></div>`;

  return {
    title: r.name, back, tabbar: false, html,
    mount(root) {
      const out = root.querySelector('#serves');
      root.querySelectorAll('[data-s]').forEach(b => b.onclick = () => {
        serves = Math.min(6, Math.max(1, serves + +b.dataset.s));
        out.textContent = `${serves}人分`;
        root.querySelector('#ing-table').innerHTML = ingRows(serves / 2);
        root.querySelector('#steps').innerHTML = r.steps.map(s => `<li>${esc(scaleStep(s, serves / 2))}</li>`).join('');
        root.querySelector('#heat-note').hidden = serves === 2;
      });
      const cook = root.querySelector('[data-act=cook]');
      cook.onclick = async () => {
        const on = !document.body.classList.contains('cook-mode');
        document.body.classList.toggle('cook-mode', on);
        cook.textContent = on ? '✓ 調理中' : '🔥 調理モード';
        if (on) {
          try { wakeLock = await navigator.wakeLock?.request('screen'); } catch (e) { /* 非対応 */ }
          toast(wakeLock ? '調理モード：文字を大きくし、画面が消えないようにしました' : '調理モード：文字を大きくしました');
          root.querySelector('#ing-table').scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else { wakeLock?.release?.(); wakeLock = null; }
      };
      root.querySelector('[data-act=made]').onclick = () => made(r, d, serves);
    },
  };
}

function made(r, d, serves) {
  const si = getSeasonInfo(new Date());
  const rec = store.addRecord({
    at: new Date().toISOString(), term: si.term.name, season: si.seasonData.name,
    who: d?.who || (serves === 1 ? 'self' : 'pair'), serves,
    worries: d?.worries || [], companions: d?.companions || [],
    recipeId: r.id, recipeName: r.name, cat: r.cat,
    ingredients: r.items.filter(i => ING_MAP[i[0]].group !== 'seasoning' && i[4] !== 'opt').map(i => ING_MAP[i[0]].name.replace(/（.*/, '')),
  });
  sheet(`<h3>🌿 記録しました</h3>
    <p class="small">ひとことメモ（任意・空欄のままでOK）</p>
    <div class="chips" style="margin-bottom:10px">${MEMO_CHIPS.map(c => `<button class="chip" data-m="${esc(c)}">${esc(c)}</button>`).join('')}</div>
    <textarea id="memo" placeholder="例：体がぽかぽかした"></textarea>
    <div class="btn-row" style="margin-top:12px">
      <button class="btn ghost" data-act="undo">取り消す</button>
      <button class="btn primary" data-act="save">閉じる</button>
    </div>`, {
    onOpen(el, close) {
      const ta = el.querySelector('#memo');
      el.querySelectorAll('[data-m]').forEach(b => b.onclick = () => {
        b.classList.toggle('on');
        const picked = [...el.querySelectorAll('[data-m].on')].map(x => x.dataset.m);
        const free = ta.value.split('／').filter(x => !MEMO_CHIPS.includes(x.trim()) && x.trim());
        ta.value = [...picked, ...free].join('／');
      });
      el.querySelector('[data-act=save]').onclick = () => { store.updateRecord(rec.id, { memo: ta.value.trim() }); close(); toast('記録しました。「記録」タブで見返せます'); };
      el.querySelector('[data-act=undo]').onclick = () => { store.deleteRecord(rec.id); close(); toast('記録を取り消しました'); };
      // 背景タップで閉じてもメモは保存
      el.parentElement.querySelector('.sheet-backdrop').addEventListener('click', () => store.updateRecord(rec.id, { memo: ta.value.trim() }), { capture: true });
    },
  });
}
