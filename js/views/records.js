// 記録・振り返り
import { store } from '../store.js';
import { esc, fmtDate, sheet, toast, confirmSheet } from '../ui.js';
import { RECIPE_MAP } from '../../data/recipes.js';
import { WORRY_MAP } from '../../data/worries.js';
import { illustSVG } from '../illust.js';
import { exportCSV, exportMonthPNG } from '../exporter.js';

export default function records([ym]) {
  const st = store.get();
  const now = new Date();
  let [y, m] = ym ? ym.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const prev = m === 1 ? `${y - 1}-12` : `${y}-${m - 1}`;
  const next = m === 12 ? `${y + 1}-1` : `${y}-${m + 1}`;
  const inMonth = st.records.filter(r => { const d = new Date(r.at); return d.getFullYear() === y && d.getMonth() + 1 === m; });
  const days = new Set(inMonth.map(r => new Date(r.at).getDate()));
  const first = new Date(y, m - 1, 1).getDay();
  const last = new Date(y, m, 0).getDate();
  const isThisMonth = y === now.getFullYear() && m === now.getMonth() + 1;

  const cal = ['日', '月', '火', '水', '木', '金', '土'].map(w => `<div class="dow">${w}</div>`).join('') +
    Array(first).fill('<div></div>').join('') +
    Array.from({ length: last }, (_, i) => i + 1).map(dd => `<div class="d ${days.has(dd) ? 'has' : ''} ${isThisMonth && dd === now.getDate() ? 'today' : ''}" ${days.has(dd) ? `data-day="${dd}"` : ''}>${dd}</div>`).join('');

  // 集計（この月）
  const wc = {}, ic = {};
  inMonth.forEach(r => {
    (r.worries || []).forEach(w => { const n = WORRY_MAP[w]?.name || '季節の養生'; wc[n] = (wc[n] || 0) + 1; });
    (r.ingredients || []).forEach(i => { ic[i] = (ic[i] || 0) + 1; });
  });
  const bars = obj => { const e = Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, 5); const mx = e[0]?.[1] || 1;
    return e.map(([k, v]) => `<div class="bar-row"><span class="bl">${esc(k)}</span><span class="bb"><i style="width:${v / mx * 100}%"></i></span><span class="bn">${v}</span></div>`).join(''); };

  const html = `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
    <a class="icon-btn" href="#/records/${prev}" aria-label="前の月">‹</a>
    <div class="serif" style="font-weight:600;font-size:1.15em">${y}年${m}月</div>
    <a class="icon-btn" href="#/records/${next}" aria-label="次の月">›</a>
  </div>
  <div class="card flat"><div class="cal">${cal}</div>
    <p class="small center" style="margin:8px 0 0">この月に作った料理：<b>${inMonth.length}</b>品（全${st.records.length}品）</p></div>

  ${inMonth.length ? `
  <h2>この月の記録</h2>
  <div id="rec-list">${inMonth.map(r => `
    <div class="rec-item" data-id="${r.id}" data-day="${new Date(r.at).getDate()}" role="button" tabindex="0">
      ${RECIPE_MAP[r.recipeId] ? illustSVG(RECIPE_MAP[r.recipeId], { size: 'sm' }) : '<div style="width:64px"></div>'}
      <div class="rec-body">
        <div class="rec-date">${fmtDate(r.at)}・${esc(r.term)}・${r.serves}人分</div>
        <div class="rec-name">${esc(r.recipeName)}</div>
        <div>${(r.worries || []).map(w => `<span class="tag">${esc(WORRY_MAP[w]?.name || '季節の養生')}</span>`).join('')}</div>
        ${r.memo ? `<div class="rec-memo">${esc(r.memo)}</div>` : ''}
      </div>
    </div>`).join('')}</div>

  <h2>この月のふりかえり</h2>
  ${Object.keys(wc).length ? `<h3 class="small">よく相談した悩み</h3>${bars(wc)}` : ''}
  <h3 class="small">よく使った食材</h3>${bars(ic)}
  ` : `<div class="empty"><span class="e-icon">📖</span>この月の記録はまだありません。<br><small>レシピ画面の「作った！」を押すと、ここに自動で記録されます。</small></div>`}

  <h2>書き出し</h2>
  <div class="btn-row">
    <button class="btn small" data-act="csv" ${st.records.length ? '' : 'disabled'}>📊 CSV（全期間）</button>
    <button class="btn small" data-act="png" ${inMonth.length ? '' : 'disabled'}>🖼 画像（この月）</button>
  </div>
  <p class="small">CSVはGoogleスプレッドシートやExcelで開けます。画像は月ごとのまとめを保存・共有できます。</p>`;

  return {
    title: '記録', tab: 'records', html, keepScroll: false,
    mount(root) {
      root.querySelectorAll('.cal [data-day]').forEach(c => c.onclick = () => {
        root.querySelector(`.rec-item[data-day="${c.dataset.day}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      root.querySelectorAll('.rec-item[data-id]').forEach(el => el.onclick = () => openRecord(el.dataset.id));
      root.querySelector('[data-act=csv]').onclick = async () => { const r = await exportCSV(st.records); if (r === 'downloaded') toast('CSVを保存しました'); };
      root.querySelector('[data-act=png]').onclick = async () => { toast('画像を作成しています…'); const r = await exportMonthPNG(inMonth, y, m); if (r === 'downloaded') toast('画像を保存しました'); };
    },
  };
}

function openRecord(id) {
  const r = store.get().records.find(x => x.id === id);
  if (!r) return;
  sheet(`<h3>${esc(r.recipeName)}</h3>
    <p class="small">${fmtDate(r.at, true)}・${esc(r.term)}</p>
    <label class="small">ひとことメモ</label>
    <textarea id="memo">${esc(r.memo || '')}</textarea>
    <div class="btn-row" style="margin-top:12px">
      <a class="btn ghost" href="#/recipe/${esc(r.recipeId)}/rec">レシピを見る</a>
      <button class="btn primary" data-act="save">メモを保存</button>
    </div>
    <button class="btn danger block small" style="margin-top:14px" data-act="del">この記録を削除</button>`, {
    onOpen(el, close) {
      el.querySelector('[data-act=save]').onclick = () => { store.updateRecord(id, { memo: el.querySelector('#memo').value.trim() }); close(); toast('保存しました'); window.dispatchEvent(new HashChangeEvent('hashchange')); };
      el.querySelector('[data-act=del]').onclick = async () => {
        close();
        if (await confirmSheet('この記録を削除しますか？', '削除する', { danger: true })) { store.deleteRecord(id); toast('削除しました'); window.dispatchEvent(new HashChangeEvent('hashchange')); }
      };
    },
  });
}
