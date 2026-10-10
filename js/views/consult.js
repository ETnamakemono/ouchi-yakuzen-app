// 相談フロー（1画面1問）
import { store } from '../store.js';
import { esc, sheet } from '../ui.js';
import { newDraft, buildContext } from '../context.js';
import { askList, askLabel, askGroup } from '../engine.js';
import { WORRIES, WORRY_CATS, WORRY_MAP, NO_WORRY } from '../../data/worries.js';
import { CATS } from '../../data/recipes.js';
import { COMPANIONS, COMPANION_GROUPS, COMPANION_MAP } from '../../data/companions.js';
import { ING_MAP, GROUP_LABELS, INGREDIENTS } from '../../data/ingredients.js';
import { TIME_LABELS } from '../engine.js';
import { getSeasonInfo } from '../season.js';

const ALL_STEPS = ['who', 'worries', 'cat', 'companions', 'time', 'have'];
const stepsFor = d => ALL_STEPS.filter(s => !(s === 'cat' && d.shortcut));

function getDraft() {
  let d = store.get().draft;
  if (!d) { d = newDraft(); store.saveDraft(d); }
  return d;
}
function save(d) { store.saveDraft(d); }
function goStep(d, step) { d.step = step; save(d); location.hash = '#/consult/' + step; }
function next(d) {
  const steps = stepsFor(d);
  const i = steps.indexOf(d.step);
  if (i < steps.length - 1) goStep(d, steps[i + 1]);
  else { save(d); location.hash = '#/result'; }
}
function prevHash(d) {
  const steps = stepsFor(d);
  const i = steps.indexOf(d.step);
  return i <= 0 ? '#/home' : '#/consult/' + steps[i - 1];
}

const actionBar = (d, nextLabel, { disabled = false, hideNext = false } = {}) => `
  <div class="action-bar"><div class="inner">
    <a class="btn ghost back" href="${prevHash(d)}">‹ 戻る</a>
    ${hideNext ? '' : `<button class="btn primary" data-act="next" ${disabled ? 'disabled' : ''}>${nextLabel}</button>`}
  </div></div>`;

const head = (d, title, sub) => {
  const steps = stepsFor(d);
  const i = steps.indexOf(d.step);
  return `<div class="step-label">ステップ ${i + 1} / ${steps.length}</div>
    <div class="progress"><i style="width:${((i + 1) / steps.length) * 100}%"></i></div>
    <div class="q-title">${title}</div>${sub ? `<p class="q-sub">${sub}</p>` : ''}`;
};

export default function consult([step]) {
  const d = getDraft();
  if (step && ALL_STEPS.includes(step) && d.step !== step) { d.step = step; save(d); }
  const s = stepsFor(d).includes(d.step) ? d.step : 'who';
  const fn = { who, worries, cat, companions, time, have }[s];
  return { title: '相談する', back: '#/home', tabbar: false, ...fn(d) };
}

// ── S1 誰の分？ ──
function who(d) {
  const st = store.settings();
  const ngNote = st.ngPartner.flags.includes('shellfish') ? 'エビ・カニ・貝は使いません' : '夫のNG食材を除きます';
  return {
    html: `${head(d, '今日は誰の分を作りますか？', '分量と、使う食材が変わります。')}
    <div class="options">
      <button class="option ${d.who === 'self' ? 'on' : ''}" data-who="self"><span class="o-icon">🙋</span><span><span class="o-main">自分だけ（1人分）</span><span class="o-sub">エビ・カニ・貝もOK</span></span></button>
      <button class="option ${d.who === 'pair' ? 'on' : ''}" data-who="pair"><span class="o-icon">👫</span><span><span class="o-main">夫と2人（2人分）</span><span class="o-sub">${ngNote}</span></span></button>
    </div>${actionBar(d, '次へ')}`,
    mount(root) {
      root.querySelector('[data-act=next]').onclick = () => { d.serves = d.who === 'self' ? 1 : 2; next(d); };
      root.querySelectorAll('[data-who]').forEach(b => b.onclick = () => {
        d.who = b.dataset.who; d.serves = d.who === 'self' ? 1 : 2;
        next(d);
      });
    },
  };
}

// ── S2 悩み ──
function worries(d) {
  const si = getSeasonInfo(new Date());
  const seasonal = WORRIES.filter(w => w.peak.some(p => si.tags.includes(p)));
  const chip = w => `<button class="chip ${d.worries.includes(w.id) ? 'on' : ''}" data-w="${w.id}">${esc(w.name)}</button>`;
  return {
    html: `${head(d, '今日のからだの調子は？', '気になることをいくつでも（3つまでがおすすめ）。')}
    <div class="chips"><button class="chip ${d.worries.includes(NO_WORRY) ? 'on' : ''}" data-w="${NO_WORRY}">😊 特に不調なし（季節の養生をしたい）</button></div>
    <div class="cat-head">🍂 今の季節（${esc(si.seasonData.name)}）に出やすい</div>
    <div class="chips">${seasonal.map(chip).join('')}</div>
    ${WORRY_CATS.map(c => `<div class="cat-head">${esc(c)}</div><div class="chips">${WORRIES.filter(w => w.cat === c).map(chip).join('')}</div>`).join('')}
    <div id="w-notes"></div>
    <div style="height:20px"></div>
    ${actionBar(d, '次へ')}`,
    mount(root) {
      const update = () => {
        root.querySelectorAll('[data-w]').forEach(b => b.classList.toggle('on', d.worries.includes(b.dataset.w)));
        const n = d.worries.filter(w => w !== NO_WORRY).length;
        const btn = root.querySelector('[data-act=next]');
        btn.disabled = d.worries.length === 0;
        btn.textContent = d.worries.includes(NO_WORRY) ? '次へ' : n ? `次へ（${n}つ選択中）` : '選んでください';
        const notes = [];
        if (n >= 4) notes.push(`<div class="card tint-kaki flat small">たくさん選ぶと見立てがぼやけやすくなります。特に気になるものを3つまでに絞るのがおすすめです（このままでも進めます）。</div>`);
        const flags = d.worries.map(w => WORRY_MAP[w]).filter(w => w?.redflag);
        if (flags.length) notes.push(`<div class="card tint-beni flat small"><b>⚠️ 受診の目安</b><ul class="points">${flags.map(w => `<li><b>${esc(w.name)}</b>：${esc(w.redflag)}</li>`).join('')}</ul></div>`);
        root.querySelector('#w-notes').innerHTML = notes.join('');
      };
      root.querySelectorAll('[data-w]').forEach(b => b.onclick = () => {
        const id = b.dataset.w;
        if (id === NO_WORRY) d.worries = d.worries.includes(NO_WORRY) ? [] : [NO_WORRY];
        else {
          d.worries = d.worries.filter(w => w !== NO_WORRY);
          d.worries = d.worries.includes(id) ? d.worries.filter(w => w !== id) : [...d.worries, id];
        }
        save(d); update();
      });
      root.querySelector('[data-act=next]').onclick = () => next(d);
      update();
    },
  };
}

// ── S3 何を作る？ ──
function cat(d) {
  const opts = [...Object.entries(CATS), ['any', { name: 'おまかせ', icon: '✨', desc: '種類にこだわらず、今の体に合うもの' }]];
  return {
    html: `${head(d, '何を作りますか？', '主菜はあるから副菜だけ、寒いから汁物だけ…など。')}
    <div class="options">${opts.map(([k, c]) => `<button class="option ${d.cat === k ? 'on' : ''}" data-cat="${k}"><span class="o-icon">${c.icon}</span><span><span class="o-main">${esc(c.name)}</span><span class="o-sub">${esc(c.desc)}</span></span></button>`).join('')}</div>
    ${actionBar(d, '次へ', { disabled: !d.cat })}`,
    mount(root) {
      root.querySelector('[data-act=next]').onclick = () => next(d);
      root.querySelectorAll('[data-cat]').forEach(b => b.onclick = () => { d.cat = b.dataset.cat; next(d); });
    },
  };
}

// ── S3.5 一緒に食べる料理 ──
function companions(d) {
  const recent = (store.get().lastConsult?.companions || []).filter(id => COMPANION_MAP[id]);
  const chip = c => `<button class="chip ${d.companions.includes(c.id) ? 'on' : ''}" data-c="${c.id}">${esc(c.name)}</button>`;
  return {
    html: `${head(d, '一緒に食べる料理はありますか？', 'すでに作った・買った、これから作る・買う予定のもの（なければそのまま次へ）。食べ合わせのバランスを考えて提案します。')}
    ${recent.length ? `<div class="cat-head">前回えらんだもの</div><div class="chips">${recent.map(id => chip(COMPANION_MAP[id])).join('')}</div>` : ''}
    ${COMPANION_GROUPS.map(g => `<div class="cat-head">${esc(g)}</div><div class="chips">${COMPANIONS.filter(c => c.group === g).map(chip).join('')}</div>`).join('')}
    <div style="height:20px"></div>
    ${actionBar(d, 'なし・次へ')}`,
    mount(root) {
      const update = () => {
        root.querySelectorAll('[data-c]').forEach(b => b.classList.toggle('on', d.companions.includes(b.dataset.c)));
        root.querySelector('[data-act=next]').textContent = d.companions.length ? `次へ（${d.companions.length}品）` : 'なし・次へ';
      };
      root.querySelectorAll('[data-c]').forEach(b => b.onclick = () => {
        const id = b.dataset.c;
        d.companions = d.companions.includes(id) ? d.companions.filter(x => x !== id) : [...d.companions, id];
        save(d); update();
      });
      root.querySelector('[data-act=next]').onclick = () => next(d);
      update();
    },
  };
}

// ── S4 時間 ──
function time(d) {
  const icons = { quick: '⚡', normal: '⏱️', slow: '🍲' };
  return {
    html: `${head(d, '調理時間はどれくらい？')}
    <div class="options">${Object.entries(TIME_LABELS).map(([k, l]) => `<button class="option ${d.time === k ? 'on' : ''}" data-t="${k}"><span class="o-icon">${icons[k]}</span><span class="o-main">${esc(l)}</span></button>`).join('')}</div>
    ${actionBar(d, '次へ')}`,
    mount(root) {
      root.querySelector('[data-act=next]').onclick = () => next(d);
      root.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { d.time = b.dataset.t; next(d); });
    },
  };
}

// ── S5 食材の確認 ──
function have(d) {
  const { ranked, settings } = buildContext(d);
  const asked = askList(ranked, settings);
  const lastHave = store.get().lastHave || [];
  if (!Array.isArray(d.have)) d.have = asked.filter(id => lastHave.includes(id));
  // 「ほかにもある」で追加した食材も一覧に出す
  const list = [...asked, ...d.have.filter(k => !asked.includes(k) && (ING_MAP[k] || k.startsWith('g:')))];
  const groups = {};
  list.forEach(k => { const g = askGroup(k); (groups[g] ||= []).push(k); });
  const shopMode = d.mode === 'shop';

  if (!list.length) {
    return {
      html: `${head(d, '食材の確認')}
      <div class="card tint-matcha"><p style="margin:0">${ranked.length ? '候補のレシピは、登録済みの常備食材だけで作れます。確認は不要です。' : '条件に合うレシピが見つかりませんでした。次の画面で条件の変え方をご案内します。'}</p></div>
      ${actionBar(d, '結果を見る')}`,
      mount(root) { root.querySelector('[data-act=next]').onclick = () => { d.have = []; next(d); }; },
    };
  }
  return {
    html: `${head(d, shopMode ? '家にある食材は？' : '今、家にある食材は？', shopMode
      ? '買い物の前に：家にあるものを、わかる範囲でタップ（何も選ばなくてもOK）。足りない食材は、次の画面で買い物リストに入れられます。'
      : '今日のレシピの「主役」になる食材だけ聞いています。ざっくりでOK。常備食材は確認不要です（設定で変更できます）。')}
    <div class="seg" data-noruby style="margin-bottom:6px">
      <button data-mode="now" class="${shopMode ? '' : 'on'}">🍳 今から作る</button>
      <button data-mode="shop" class="${shopMode ? 'on' : ''}">🛒 買い物に行く</button>
    </div>
    ${Object.entries(groups).map(([g, ids]) => `<div class="cat-head">${esc(GROUP_LABELS[g])}</div>
      <div class="chips">${ids.map(k => `<button class="chip ${d.have.includes(k) ? 'on' : ''}" data-i="${esc(k)}">${esc(askLabel(k))}</button>`).join('')}</div>`).join('')}
    <div class="card tint-ai flat small" style="margin-top:16px">💡 ない食材があっても大丈夫。同じ仲間の食材（例：しめじ→干ししいたけ、黒ごま→白ごま）で代用したり、脇役の食材は「なくてもOK」として省いたりして提案します。</div>
    <div style="margin:12px 0 8px" class="btn-row">
      <button class="btn small" data-act="more">＋ ほかにも家にある食材</button>
      ${shopMode ? '' : '<button class="btn small ghost" data-act="all">全部ある前提で見る</button>'}
    </div>
    <div style="height:20px"></div>
    ${actionBar(d, shopMode ? 'レシピを探す' : 'これで探す')}`,
    mount(root) {
      const update = () => {
        root.querySelectorAll('[data-i]').forEach(b => b.classList.toggle('on', d.have.includes(b.dataset.i)));
        root.querySelector('[data-act=next]').textContent = shopMode ? `レシピを探す（${d.have.length}個ある）` : `これで探す（${d.have.length}個）`;
      };
      root.querySelectorAll('[data-i]').forEach(b => b.onclick = () => {
        const id = b.dataset.i;
        d.have = d.have.includes(id) ? d.have.filter(x => x !== id) : [...d.have, id];
        save(d); update();
      });
      const finish = () => {
        store.update(s => { s.lastHave = [...new Set([...(s.lastHave || []).filter(x => !list.includes(x)), ...(d.have || [])])]; });
        next(d);
      };
      root.querySelector('[data-act=next]').onclick = finish;
      const allBtn = root.querySelector('[data-act=all]');
      if (allBtn) allBtn.onclick = () => { d.have = null; save(d); next(d); };
      root.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { d.mode = b.dataset.mode; save(d); window.dispatchEvent(new HashChangeEvent('hashchange')); });
      root.querySelector('[data-act=more]').onclick = () => {
        const sel = new Set(d.have);
        const groups2 = Object.keys(GROUP_LABELS);
        sheet(`<h3>ほかにも家にある食材</h3><p class="small">あるものをタップ。常備食材は表示していません。</p>
          ${groups2.map(g => { const ings = INGREDIENTS.filter(i => i.group === g && !settings.stock.includes(i.id)); return ings.length ? `<div class="cat-head">${esc(GROUP_LABELS[g])}</div>
            <div class="chips">${ings.map(i => `<button class="chip ${sel.has(i.id) ? 'on' : ''}" data-x="${i.id}">${esc(i.name)}</button>`).join('')}</div>` : ''; }).join('')}
          <div style="position:sticky;bottom:0;background:var(--card);padding-top:12px"><button class="btn primary block" data-act="ok">追加する</button></div>`, {
          onOpen(el, close) {
            el.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { const id = b.dataset.x; sel.has(id) ? sel.delete(id) : sel.add(id); b.classList.toggle('on'); });
            el.querySelector('[data-act=ok]').onclick = () => { d.have = [...sel]; save(d); close(); window.dispatchEvent(new HashChangeEvent('hashchange')); };
          },
        });
      };
      update();
    },
  };
}
