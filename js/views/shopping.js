// 買い物リスト
import { store } from '../store.js';
import { esc, toast, confirmSheet } from '../ui.js';
import { GROUP_LABELS } from '../../data/ingredients.js';
import { newDraft } from '../context.js';

const refresh = () => window.dispatchEvent(new HashChangeEvent('hashchange'));

function listText(sh) {
  const lines = ['【買い物リスト】'];
  for (const g of Object.keys(GROUP_LABELS)) {
    const items = sh.items.filter(i => i.group === g && !i.done);
    if (!items.length) continue;
    lines.push('', `■ ${GROUP_LABELS[g]}`);
    items.forEach(i => lines.push(`□ ${i.name}（${i.uses.map(u => u.text).join('＋')}）`));
  }
  if (sh.recipes.length) lines.push('', '作る予定：' + sh.recipes.map(r => r.name).join('、'));
  return lines.join('\n');
}

export default function shopping() {
  const sh = store.get().shopping;
  const left = sh.items.filter(i => !i.done).length;

  if (!sh.items.length) {
    return {
      title: '買い物リスト', back: '#/home', tab: 'home',
      html: `<div class="empty"><span class="e-icon">🛒</span>買い物リストは空です。<br>
        <small>買い物の前に悩みからレシピを調べて、足りない食材をここに入れられます。</small><br><br>
        <button class="btn primary" data-act="start">🛒 買い物前にレシピを調べる</button></div>`,
      mount(root) {
        root.querySelector('[data-act=start]').onclick = () => { store.saveDraft(newDraft({ mode: 'shop' })); location.hash = '#/consult/who'; };
      },
    };
  }

  const row = i => `<button class="shop-row ${i.done ? 'done' : ''}" data-id="${esc(i.id)}">
      <span class="shop-check">${i.done ? '✓' : ''}</span>
      <span class="shop-body"><span class="shop-name">${esc(i.name)}</span>
        <span class="shop-use">${i.uses.map(u => `${esc(u.text)}｜${esc(u.recipeName)}`).join('<br>')}</span></span></button>`;

  const html = `
  <p class="small" style="margin-top:10px">お店で買ったらタップしてチェック。チェックした食材は、次に相談するとき「家にある」として扱います。</p>
  <div class="card flat" style="padding:12px 14px">
    <div class="label">作る予定のレシピ</div>
    ${sh.recipes.map(r => `<div class="shop-recipe"><a href="#/recipe/${esc(r.id)}/shop">${esc(r.name)}</a><button class="icon-btn" data-rm="${esc(r.id)}" aria-label="${esc(r.name)}をリストから外す">✕</button></div>`).join('')}
  </div>

  <div class="serif" style="font-weight:600;margin:16px 0 4px">買うもの　<span class="small">残り <b>${left}</b> ／ ${sh.items.length}品</span></div>
  ${Object.keys(GROUP_LABELS).map(g => {
    const items = sh.items.filter(i => i.group === g).sort((a, b) => a.done - b.done);
    return items.length ? `<div class="cat-head">${esc(GROUP_LABELS[g])}</div>${items.map(row).join('')}` : '';
  }).join('')}

  <div class="btn-row" style="margin-top:20px">
    <button class="btn small" data-act="share">📤 共有・コピー</button>
    <button class="btn small ghost" data-act="cleardone" ${sh.items.some(i => i.done) ? '' : 'disabled'}>買ったものを消す</button>
  </div>
  <button class="btn small danger block" style="margin-top:10px" data-act="clear">リストを空にする</button>`;

  return {
    title: '買い物リスト', back: '#/home', tab: 'home', html, keepScroll: true,
    mount(root) {
      root.querySelectorAll('[data-id]').forEach(b => b.onclick = () => { store.toggleShopping(b.dataset.id); refresh(); });
      root.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { store.removeShoppingRecipe(b.dataset.rm); refresh(); });
      root.querySelector('[data-act=share]').onclick = async () => {
        const text = listText(store.get().shopping);
        if (navigator.share) { try { await navigator.share({ title: '買い物リスト', text }); return; } catch (e) { if (e.name === 'AbortError') return; } }
        try { await navigator.clipboard.writeText(text); toast('買い物リストをコピーしました'); }
        catch (e) { toast('コピーできませんでした'); }
      };
      root.querySelector('[data-act=cleardone]').onclick = () => { store.clearShopping(true); refresh(); };
      root.querySelector('[data-act=clear]').onclick = async () => {
        if (await confirmSheet('買い物リストと「作る予定のレシピ」を空にします。', '空にする', { danger: true })) { store.clearShopping(); refresh(); }
      };
    },
  };
}
