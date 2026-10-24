// 初回のオンボーディング（5画面）
import { store } from '../store.js';
import { esc } from '../ui.js';
import { INSTALL_HELP, DISCLAIMER, stockCatsHTML, bindStockCats } from './settings.js';
import { WORRIES, WORRY_CATS } from '../../data/worries.js';

export default function onboarding([n]) {
  const i = +n || 0;
  const s = store.settings();
  const slides = [
    {
      body: `<div class="big-emoji">🍲</div>
        <h1 class="center">おうち薬膳へようこそ</h1>
        <p>その日のからだの調子と季節から、<b>家にある食材でつくれる</b>薬膳レシピを提案します。</p>
        <div class="card flat small">
          <p style="margin:0">① 家にある食材をタップ<br>② あなたの悩みと季節に合うレシピを、作れる順に表示<br>③ 作ったら食材の働きや薬膳の考え方を読んで、体験と一緒に覚える</p>
        </div>
        <p class="small">作るたびに、自分のからだを通して薬膳の知識が少しずつ身についていきます。</p>`,
    },
    { body: `<div class="big-emoji">🌿</div><h1 class="center">はじめにお読みください</h1><div class="card flat small">${DISCLAIMER}</div>` },
    {
      body: `<h1>だいたい家にあるものは？</h1>
        <p class="small">ざっくりでOK。選んだものは「常備」として毎回の確認を省きます。足りないときは、代わりの食材や「なくてもOK」で柔軟に提案します。あとから設定で変更できます。</p>
        ${stockCatsHTML(s)}`,
    },
    {
      body: `<h1>くり返し気になる不調は？</h1>
        <p class="small">「いつもの悩み」として登録すると、家の食材からレシピをさがすときに、それに合うものを優先します。あとから変更できます（スキップしてもOK）。</p>
        ${WORRY_CATS.map(c => `<div class="cat-head">${esc(c)}</div><div class="chips">${WORRIES.filter(w => w.cat === c).map(w => `<button class="chip ${(s.myWorries || []).includes(w.id) ? 'on' : ''}" data-w="${w.id}">${esc(w.name)}</button>`).join('')}</div>`).join('')}`,
    },
    { body: `<div class="big-emoji">📱</div><h1 class="center">ホーム画面に追加しよう</h1><div class="card flat small">${INSTALL_HELP}</div><p class="small center">いつでも「設定」から見られます。</p>` },
  ];
  const last = i === slides.length - 1;
  return {
    title: '', tabbar: false,
    html: `<div class="onb">${slides[i].body}</div>
      <div class="dots">${slides.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="action-bar"><div class="inner">
        ${i ? `<a class="btn ghost back" href="#/onboarding/${i - 1}">‹ 戻る</a>` : ''}
        <button class="btn primary" data-act="next">${last ? 'はじめる' : i === 1 ? '同意して次へ' : '次へ'}</button>
      </div></div>`,
    mount(root) {
      bindStockCats(root);
      root.querySelectorAll('[data-w]').forEach(b => b.onclick = () => {
        const my = new Set(store.settings().myWorries || []);
        my.has(b.dataset.w) ? my.delete(b.dataset.w) : my.add(b.dataset.w);
        store.setSettings({ myWorries: [...my] }); b.classList.toggle('on');
      });
      root.querySelector('[data-act=next]').onclick = () => {
        if (last) { store.setSettings({ onboarded: true }); location.hash = '#/home'; }
        else location.hash = `#/onboarding/${i + 1}`;
      };
    },
  };
}
