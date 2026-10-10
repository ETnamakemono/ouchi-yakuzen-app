import { store } from '../store.js';
import { getSeasonInfo } from '../season.js';
import { esc, glossify, fmtDate } from '../ui.js';
import { newDraft } from '../context.js';
import { CATS, RECIPE_MAP } from '../../data/recipes.js';
import { WORRY_MAP } from '../../data/worries.js';
import { CONST_MAP } from '../../data/constitutions.js';
import { illustSVG } from '../illust.js';
import { gogyoSVG, SEASON_TO_EL } from '../graphics.js';

export default function home() {
  const st = store.get();
  const si = getSeasonInfo(new Date());
  const sd = si.seasonData;
  const now = new Date();
  const last = st.lastConsult;
  const rec = st.records[0];
  const draft = st.draft;

  const shortcuts = [
    ['soup', '汁物を1品', 'あと一杯ほしい'],
    ['side', '副菜を1品', '主菜はある日に'],
    ['main', 'メインを作る', 'しっかりおかず'],
    ['drink', 'ほっと一杯', '飲み物・おやつ'],
    ['staple', 'ごはん・麺', '主食を一品で'],
  ];

  const html = `
  <section class="hero">
    <div class="date">${now.getFullYear()}年${fmtDate(now)}</div>
    <div class="term"><ruby>${esc(si.term.name)}<rt>${esc(si.term.kana)}</rt></ruby></div>
    <span class="season-pill" style="background:${sd.color}">${esc(sd.name)}｜五臓は「${esc(sd.organ)}」</span>
    ${si.doyo ? `<span class="tag kaki">土用</span>` : ''}${si.tsuyu ? `<span class="tag ai">梅雨</span>` : ''}
  </section>

  <a class="card tint-matcha" href="#/learn/season" style="display:block;text-decoration:none;color:inherit">
    <div class="viz-row" style="grid-template-columns:1fr 120px;margin:0">
      <div><div class="label">今の季節の養生</div>
      <p style="margin:.3em 0">${glossify(si.term.tip)}</p></div>
      <div>${gogyoSVG({ season: SEASON_TO_EL[si.season], highlight: [SEASON_TO_EL[si.season]], size: 'sm', labels: false })}</div>
    </div>
    <div><small>弱りやすいところ</small><br>${sd.weak.map(w => `<span class="tag">${esc(w)}</span>`).join('')}</div>
    <div style="margin-top:6px"><small>おすすめ食材</small><br>${sd.foods.slice(0, 6).map(w => `<span class="tag matcha">${esc(w)}</span>`).join('')}</div>
    ${si.doyo ? `<p class="small" style="margin:.6em 0 0">🍂 ${glossify(si.doyo.summary)}</p>` : ''}
    <div class="small" style="text-align:right;margin-top:4px">くわしく ›</div>
  </a>

  ${draft && draft.step ? `
  <div class="card tint-kaki flat">
    <div class="label">相談の続き</div>
    <p style="margin:.2em 0 .6em">${draft.worries.length ? esc(draft.worries.map(w => WORRY_MAP[w]?.name || '季節の養生').join('・')) : '入力途中の相談があります'}</p>
    <div class="btn-row"><button class="btn small ghost" data-act="discard">破棄</button><a class="btn small kaki" href="#/consult/${draft.step}">続きから</a></div>
  </div>` : ''}

  <button class="btn primary big block" data-act="start" style="margin-top:8px">🌿 からだの相談をする</button>

  <div class="shortcuts">
    ${shortcuts.map(([c, t, s]) => `<button class="shortcut" data-cat="${c}"><span class="s-icon">${CATS[c].icon}</span><span>${t}<small>${s}</small></span></button>`).join('')}
    ${last ? `<button class="shortcut" data-act="again"><span class="s-icon">🔁</span><span>前回と同じ悩みで<small>${esc(last.worries.map(w => WORRY_MAP[w]?.name || '季節の養生').join('・').slice(0, 18))}</small></span></button>` : ''}
  </div>

  ${!st.constitution ? `
  <a class="card tint-ai" href="#/constitution" style="display:block;text-decoration:none;color:inherit">
    <div class="card-title">🌿 体質チェックをしてみませんか？</div>
    <p class="small" style="margin:0">27問・約3分。あなたの体質に合わせて提案が変わります（スキップしてもOK）。</p>
  </a>` : `
  <a class="card flat" href="#/constitution" style="display:block;text-decoration:none;color:inherit">
    <div class="label">あなたの体質</div>
    <div class="serif" style="font-weight:600">${esc(CONST_MAP[st.constitution.result.main].name)}<small class="muted">（${esc(CONST_MAP[st.constitution.result.main].short)}）</small></div>
  </a>`}

  ${rec ? `
  <h2>最近作ったもの</h2>
  <a class="rec-item" href="#/recipe/${esc(rec.recipeId)}" style="text-decoration:none;color:inherit">
    ${RECIPE_MAP[rec.recipeId] ? illustSVG(RECIPE_MAP[rec.recipeId], { size: 'sm' }) : ''}
    <div class="rec-body"><div class="rec-date">${fmtDate(rec.at)}・${esc(rec.term)}</div><div class="rec-name">${esc(rec.recipeName)}</div>
    ${rec.memo ? `<div class="rec-memo">${esc(rec.memo)}</div>` : ''}</div>
  </a>` : ''}

  <p class="disclaimer">このアプリは食養生の参考情報であり、医療・診断・治療に代わるものではありません。気になる症状が続くときは医療機関にご相談ください。</p>`;

  return {
    title: 'おうち薬膳', tab: 'home', html,
    mount(root) {
      root.querySelector('[data-act=start]').onclick = () => { store.saveDraft(newDraft()); location.hash = '#/consult/who'; };
      root.querySelectorAll('[data-cat]').forEach(b => b.onclick = () => {
        store.saveDraft(newDraft({ cat: b.dataset.cat, shortcut: true }));
        location.hash = '#/consult/who';
      });
      const again = root.querySelector('[data-act=again]');
      if (again) again.onclick = () => {
        store.saveDraft(newDraft({ who: last.who, serves: last.serves, worries: last.worries, step: 'cat' }));
        location.hash = '#/consult/cat';
      };
      const discard = root.querySelector('[data-act=discard]');
      if (discard) discard.onclick = () => { store.clearDraft(); window.dispatchEvent(new HashChangeEvent('hashchange')); };
    },
  };
}
