// 体質チェック（簡易版・27問）
import { store } from '../store.js';
import { esc, glossify, fmtDate } from '../ui.js';
import { CONSTITUTIONS, CONST_MAP, SCALE, judgeConstitution } from '../../data/constitutions.js';

const QUESTIONS = CONSTITUTIONS.flatMap(c => c.questions.map((q, i) => ({ key: `${c.id}_${i}`, text: q })));
// 同じ体質の設問が続かないよう並べ替え（固定順）
const ORDER = [0, 1, 2].flatMap(i => CONSTITUTIONS.filter(c => c.questions.length).map(c => `${c.id}_${i}`));
const QS = ORDER.map(k => QUESTIONS.find(q => q.key === k));

export default function constitution([mode, n]) {
  const st = store.get();
  if (mode === 'q') return question(+n || 0);
  if (!st.constitution) return intro();
  return resultView(st.constitution);
}

function intro() {
  return {
    title: '体質チェック', tab: 'constitution',
    html: `<div class="card tint-matcha" style="margin-top:14px">
      <div class="card-title">🌿 あなたの体質の傾向をチェック</div>
      <p>中医学の「9つの体質分類」（中華中医薬学会の基準）を参考にした、簡易セルフチェックです。全${QS.length}問・約3分。</p>
      <p class="small" style="margin:0">最近1〜2か月のふだんの様子で答えてください。結果はレシピ選びに反映され、季節ごとに見直すのがおすすめです。</p>
    </div>
    <button class="btn primary big block" data-act="start">はじめる</button>
    <p class="disclaimer">簡易的なセルフチェックであり、医学的な診断ではありません。</p>`,
    mount(root) {
      root.querySelector('[data-act=start]').onclick = () => { store.update(s => { s.constDraft = {}; }); location.hash = '#/constitution/q/0'; };
    },
  };
}

function question(i) {
  const st = store.get();
  const answers = st.constDraft || {};
  const q = QS[i];
  if (!q) return intro();
  return {
    title: '体質チェック', back: i ? `#/constitution/q/${i - 1}` : '#/constitution', tabbar: false,
    html: `<div class="step-label">${i + 1} / ${QS.length}</div>
    <div class="progress"><i style="width:${(i + 1) / QS.length * 100}%"></i></div>
    <div class="q-title" style="min-height:4.5em">${esc(q.text)}</div>
    <div class="scale">${SCALE.map((s, v) => `<button class="option ${answers[q.key] === v ? 'on' : ''}" data-v="${v}" style="min-height:56px"><span class="o-main">${esc(s)}</span></button>`).join('')}</div>`,
    mount(root) {
      root.querySelectorAll('[data-v]').forEach(b => b.onclick = () => {
        store.update(s => { s.constDraft = { ...(s.constDraft || {}), [q.key]: +b.dataset.v }; });
        if (i + 1 < QS.length) location.hash = `#/constitution/q/${i + 1}`;
        else {
          const ans = store.get().constDraft;
          store.update(s => { s.constitution = { answers: ans, result: judgeConstitution(ans), date: new Date().toISOString() }; delete s.constDraft; });
          location.hash = '#/constitution';
        }
      });
    },
  };
}

function resultView(c) {
  const main = CONST_MAP[c.result.main];
  const others = c.result.tendencies.filter(t => t !== c.result.main).map(t => CONST_MAP[t]);
  const bars = CONSTITUTIONS.filter(x => x.questions.length).map(x => ({ x, s: c.result.scores[x.id] || 0 })).sort((a, b) => b.s - a.s);
  const block = (k, label) => `
    <div class="card ${label ? 'flat' : ''}">
      ${label ? `<div class="label">${label}</div>` : '<div class="label">あなたの主な体質</div>'}
      <div class="diag-name">${esc(k.name)}<small>${esc(k.short)}</small></div>
      <p>${glossify(k.desc)}</p>
      <div><small>おすすめ</small><br>${k.good.map(g => `<span class="tag matcha">${esc(g)}</span>`).join('')}</div>
      <div style="margin-top:6px"><small>控えめに</small><br>${k.bad.map(g => `<span class="tag beni">${esc(g)}</span>`).join('')}</div>
    </div>`;
  return {
    title: '体質チェック', tab: 'constitution',
    html: `<p class="small" style="margin-top:10px">${fmtDate(c.date)}にチェック</p>
    ${block(main)}
    ${others.map(o => block(o, 'こんな傾向も')).join('')}
    <h2>体質ごとのスコア</h2>
    <div class="const-bars">${bars.map(({ x, s }) => `<div class="bar-row"><span class="bl">${esc(x.name)}</span><span class="bb"><i style="width:${s / 4 * 100}%;${s >= 2 ? '' : 'background:var(--ink-3)'}"></i></span><span class="bn">${s.toFixed(1)}</span></div>`).join('')}</div>
    <p class="small">2.0以上を「傾向あり」としています。どれも2.0未満なら、バランスのとれた「平和質」です。</p>
    <button class="btn block" data-act="redo" style="margin-top:12px">もう一度チェックする</button>
    <p class="small center">季節の変わり目ごとの見直しがおすすめです。</p>
    <p class="disclaimer">簡易的なセルフチェックであり、医学的な診断ではありません。</p>`,
    mount(root) {
      root.querySelector('[data-act=redo]').onclick = () => { store.update(s => { s.constDraft = {}; }); location.hash = '#/constitution/q/0'; };
    },
  };
}
