// 初回のオンボーディング（4画面）
import { store } from '../store.js';
import { esc } from '../ui.js';
import { INSTALL_HELP, DISCLAIMER, stockCatsHTML, bindStockCats } from './settings.js';

export default function onboarding([n]) {
  const i = +n || 0;
  const s = store.settings();
  const slides = [
    {
      body: `<div class="big-emoji">🍲</div>
        <h1 class="center">おうち薬膳へようこそ</h1>
        <p class="center">その日のからだの調子と季節から、<br><b>家にある食材でつくれる</b>薬膳レシピを提案します。</p>
        <div class="card flat small">
          <p style="margin:0">① 気になる不調を選ぶ<br>② 作りたい料理（汁物だけ・副菜だけ…）を選ぶ<br>③ 家にある食材を確認<br>→ 東洋医学の「見立て」と、レシピ・食材の解説を表示</p>
        </div>
        <p class="small center">作るたびに、自分のからだを通して薬膳の知識が少しずつ身についていきます。</p>`,
    },
    { body: `<div class="big-emoji">🌿</div><h1 class="center">はじめにお読みください</h1><div class="card flat small">${DISCLAIMER}</div>` },
    {
      body: `<h1>だいたい家にあるものは？</h1>
        <p class="small">ざっくりでOK。選んだものは「常備」として毎回の確認を省きます。足りないときは、代わりの食材や「なくてもOK」で柔軟に提案します。あとから設定で変更できます。</p>
        ${stockCatsHTML(s)}`,
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
      root.querySelector('[data-act=next]').onclick = () => {
        if (last) { store.setSettings({ onboarded: true }); location.hash = '#/home'; }
        else location.hash = `#/onboarding/${i + 1}`;
      };
    },
  };
}
