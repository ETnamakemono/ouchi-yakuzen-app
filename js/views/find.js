// 家の食材からさがす（食材起点）
//  #/find  … 食材を選ぶ（いつもの悩み・今日の不調も）
//  #/found … 選んだ食材で作れるレシピを、悩み×季節に合う順に
import { store } from '../store.js';
import { esc, sheet, toast, natureBadge } from '../ui.js';
import { getSeasonInfo } from '../season.js';
import { diagnose, rankCandidates, resolveAvailability, companionProfile, shoppingEntries, nutrition } from '../engine.js';
import { INGREDIENTS, ING_MAP, GROUP_LABELS } from '../../data/ingredients.js';
import { WORRIES, WORRY_CATS, WORRY_MAP } from '../../data/worries.js';
import { PATTERN_MAP } from '../../data/patterns.js';
import { CATS } from '../../data/recipes.js';
import { SEASONS } from '../../data/seasons.js';
import { illustSVG } from '../illust.js';

const refresh = () => window.dispatchEvent(new HashChangeEvent('hashchange'));
const PICK_GROUPS = ['veg', 'protein', 'mush', 'grain', 'fruit'];

// 悩みの短い呼び名（バッジ用）
const SHORT = { runny_nose: '鼻水', cold_belly: '下半身の冷え', cold_limbs: '手足の冷え', clench: '食いしばり', nails: '二枚爪', overeating: '食べすぎ', gas_bloating: 'お腹の張り',
  hangover: '二日酔い', poor_appetite: '食欲不振', stomach_tight: '胃痛', loose_stool: 'お腹がゆるい', dry_throat: 'のどの乾燥', chill_cold: 'かぜ', stuffy_nose: '鼻づまり',
  dry_skin: '肌の乾燥', acne: '肌荒れ', hair: '髪', eye_strain: '目の疲れ', dry_mouth: '口の渇き', mouth_ulcer: '口内炎', insomnia: '睡眠', irritable: 'イライラ', low_mood: '気分の落ち込み',
  anxious: '不安', period_pain: '生理痛', pms: 'PMS', anemia: '立ちくらみ', hot_flash: 'ほてり', frequent_urine: 'トイレが近い', sweet_craving: '甘いもの', swelling: 'むくみ',
  stiff_shoulder: '肩こり', lower_back: '腰', leg_cramp: '足がつる', fatigue: '疲れ', hard_morning: '朝がつらい', sleepy_after_meal: '食後の眠気', sweaty: 'かぜをひきやすい',
  summer_fatigue: '夏バテ', heavy_head: '頭が重い', headache: '頭痛', dizzy: 'めまい', weather: '天気痛', constipation: '便秘', cough: '咳' };
export const worryShort = id => SHORT[id] || (WORRY_MAP[id]?.name || '').split(/[・（]/)[0];

function findState() {
  const st = store.get();
  if (!st.find) st.find = { have: [...(st.lastHave || [])].filter(id => ING_MAP[id]), today: [], cat: 'any', who: st.settings.defaultServes === 1 ? 'self' : 'pair' };
  return st.find;
}
const saveFind = f => store.update(s => { s.find = f; });

// 悩み選択シート（いつもの悩み・今日の不調で共用）
function worryPicker(title, note, selected, onSave) {
  const sel = new Set(selected);
  sheet(`<h3>${esc(title)}</h3><p class="small">${esc(note)}</p>
    ${WORRY_CATS.map(c => `<div class="cat-head">${esc(c)}</div><div class="chips">${WORRIES.filter(w => w.cat === c).map(w => `<button class="chip ${sel.has(w.id) ? 'on' : ''}" data-w="${w.id}">${esc(w.name)}</button>`).join('')}</div>`).join('')}
    <div style="position:sticky;bottom:0;background:var(--card);padding-top:12px"><button class="btn primary block" data-act="ok">決定</button></div>`, {
    onOpen(el, close) {
      el.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { const id = b.dataset.w; sel.has(id) ? sel.delete(id) : sel.add(id); b.classList.toggle('on'); });
      el.querySelector('[data-act=ok]').onclick = () => { onSave([...sel]); close(); refresh(); };
    },
  });
}

// ── 食材を選ぶ ──
export function find() {
  const st = store.get();
  const f = findState();
  const my = st.settings.myWorries || [];
  const stockNames = st.settings.stock.map(id => ING_MAP[id]).filter(i => i && i.group !== 'seasoning').map(i => i.name.replace(/（.*/, ''));
  const stockSet = new Set(st.settings.stock);
  const chip = i => `<button class="chip ${f.have.includes(i.id) ? 'on' : ''}" data-i="${i.id}" data-name="${esc(i.name + i.kana)}">${esc(i.name.replace(/（.*/, ''))}${stockSet.has(i.id) ? '<span class="badge" style="background:var(--wash);color:var(--ink-3)">常備</span>' : ''}</button>`;

  const html = `
  <div class="card flat" style="margin-top:10px;padding:12px 14px">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
      <div class="label">いつもの悩み</div><button class="btn small ghost" data-act="my" style="min-height:36px">変更</button>
    </div>
    ${my.length ? `<div>${my.map(w => `<span class="tag matcha">${esc(worryShort(w))}</span>`).join('')}</div>`
      : `<p class="small" style="margin:.2em 0 0">まだ登録されていません。「変更」から、くり返し気になる不調を選んでおくと、毎回それに合うレシピを優先します。</p>`}
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px">
      <div class="label">今日だけの不調（任意）</div><button class="btn small ghost" data-act="today" style="min-height:36px">${f.today.length ? '変更' : '追加'}</button>
    </div>
    ${f.today.length ? `<div>${f.today.map(w => `<span class="tag kaki">${esc(worryShort(w))}</span>`).join('')}</div>` : ''}
  </div>

  <div class="q-title" style="margin-top:6px">家にある食材は？</div>
  <p class="q-sub">今日使いたい食材・家にある食材をタップ。「常備」の印がある食材は選ばなくても使える前提ですが、選ぶとその食材を使うレシピを優先します。</p>
  <input type="text" id="ing-filter" placeholder="🔍 食材名で絞り込み（例：大根）" autocomplete="off">
  ${PICK_GROUPS.map(g => { const list = INGREDIENTS.filter(i => i.group === g); return list.length ? `<div class="cat-head" data-g>${esc(GROUP_LABELS[g])}</div><div class="chips">${list.map(chip).join('')}</div>` : ''; }).join('')}
  <p class="small" style="margin-top:14px">調味料・薬味など、ほかの常備は設定で変更できます。<a href="#/settings">設定を開く</a></p>
  <div style="height:24px"></div>
  <div class="action-bar"><div class="inner">
    <button class="btn ghost back" data-act="clear">選択をはずす</button>
    <button class="btn primary" data-act="go"></button>
  </div></div>`;

  return {
    title: '家の食材からさがす', back: '#/home', tabbar: false, html,
    mount(root) {
      const go = root.querySelector('[data-act=go]');
      const update = () => { go.textContent = f.have.length ? `🔍 この${f.have.length}品でさがす` : '🔍 常備だけでさがす'; };
      root.querySelectorAll('[data-i]').forEach(b => b.onclick = () => {
        const id = b.dataset.i;
        f.have = f.have.includes(id) ? f.have.filter(x => x !== id) : [...f.have, id];
        b.classList.toggle('on'); saveFind(f); update();
      });
      root.querySelector('#ing-filter').oninput = e => {
        const q = e.target.value.trim();
        root.querySelectorAll('[data-i]').forEach(b => { b.style.display = !q || b.dataset.name.includes(q) ? '' : 'none'; });
      };
      root.querySelector('[data-act=clear]').onclick = () => { f.have = []; saveFind(f); root.querySelectorAll('[data-i]').forEach(b => b.classList.remove('on')); update(); };
      root.querySelector('[data-act=my]').onclick = () => worryPicker('いつもの悩み', 'くり返し気になる不調を選んでください（設定からも変更できます）。', my, v => store.setSettings({ myWorries: v }));
      root.querySelector('[data-act=today]').onclick = () => worryPicker('今日だけの不調', '今日とくに気になることがあれば。次回はリセットされます。', f.today, v => { f.today = v; saveFind(f); });
      go.onclick = () => {
        store.update(s => { s.lastHave = [...new Set([...(s.lastHave || []).filter(id => !PICK_GROUPS.includes(ING_MAP[id]?.group)), ...f.have])]; });
        f.cat = 'any'; saveFind(f);
        location.hash = '#/found';
      };
      update();
    },
  };
}

// ── 結果 ──
export function found([cat]) {
  const st = store.get();
  const f = findState();
  if (cat && cat !== f.cat) { f.cat = cat; saveFind(f); }
  const settings = st.settings;
  const my = settings.myWorries || [];
  const worries = [...new Set([...my, ...f.today])];
  const season = getSeasonInfo(new Date());
  const sd = SEASONS[season.season];
  const diag = diagnose({ worries, constitution: st.constitution, season });
  const ctx = { diag, season, constitution: st.constitution, companions: companionProfile([]), who: f.who, records: st.records };
  const ranked = rankCandidates({ cat: 'any', time: 'slow', who: f.who }, ctx, settings);
  const haveSet = new Set(f.have);

  // 悩みごとに、レシピが合うかどうか（悩みの主な証をレシピが狙っているか）
  const helps = r => worries.filter(w => {
    const ps = Object.entries(WORRY_MAP[w]?.patterns || {}).filter(([, v]) => v >= 2).map(([p]) => p);
    return ps.some(p => r.targets.includes(p));
  });
  const items = ranked.map(c => {
    const av = resolveAvailability(c.recipe, f.have, settings);
    const used = [...new Set(c.recipe.items.map(i => i[0]).filter(id => haveSet.has(id)))];
    const h = helps(c.recipe);
    // 選んだ食材をたくさん使うほど上に（食材ありき）。悩み・季節の合い方（score）はその次
    return { ...c, ...av, used, helps: h, rank: used.length * 5 + c.score * 0.6 + h.length * 1.2 };
  }).sort((a, b) => b.rank - a.rank);

  const inCat = x => f.cat === 'any' || x.recipe.cat === f.cat;
  const ready = items.filter(x => !x.missing.length);
  const almost = items.filter(x => x.missing.length === 1);
  const pool = f.have.length ? ready.filter(x => x.used.length) : ready;
  const count = c => pool.filter(x => c === 'any' || x.recipe.cat === c).length;
  const otherCats = f.cat !== 'any' && f.have.length ? Object.keys(CATS).filter(c => c !== f.cat && count(c)) : [];
  const shownReady = ready.filter(inCat);
  const useSel = shownReady.filter(x => x.used.length);
  const stockOnly = shownReady.filter(x => !x.used.length);
  const shownAlmost = almost.filter(inCat).slice(0, 5);
  const added = new Set(st.shopping.recipes.map(r => r.id));
  // 選んだ食材の薬膳メモ：その食材の性質・悩みとの相性・食べ方のコツ（レシピが少ない食材ほど役立つ）
  const recipeCount = id => ranked.filter(c => c.recipe.items.some(i => i[0] === id && i[4] !== 'opt')).length;
  const notes = f.have.slice(0, 4).map(id => {
    const ing = ING_MAP[id];
    const n = recipeCount(id);
    if (n >= 3 && f.have.length > 2) return '';
    const fit = worries.filter(w => Object.entries(WORRY_MAP[w]?.patterns || {}).filter(([, v]) => v >= 2)
      .some(([p]) => [...PATTERN_MAP[p].mainTags, ...PATTERN_MAP[p].needTags].some(t => ing.tags.includes(t))));
    const coldWarn = (ing.nature === '寒' || ing.nature === '涼') && diag.direction === 'cold';
    return `<div class="tip-card"><b>${natureBadge(ing.nature)} ${esc(ing.name)}</b>
      <span class="small">（${esc(ing.taste.join('・'))}味・${esc(ing.meridian.join('・'))}）</span>
      <ul class="points" style="margin:.3em 0">${ing.actions.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
      ${fit.length ? `<div class="small">◎ <b>${esc(fit.map(worryShort).join('・'))}</b>によい食材です</div>` : ''}
      ${coldWarn ? `<div class="small" style="color:#b0631a">❄ 体を冷やす性質なので、今日は加熱したり生姜・ねぎと合わせたりするのがおすすめ</div>` : ''}
      ${ing.howto?.length ? `<div class="howto" style="margin-top:6px"><b>食べ方のコツ</b><ul class="points">${ing.howto.slice(0, 2).map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
      <div class="small muted" style="margin-top:4px">この食材を使う登録レシピ：${n}件${n <= 1 ? '（まだ少ないので、順次増やします）' : ''}</div></div>`;
  }).filter(Boolean);
  // 見立て（1行）
  const top = diag.top[0]?.pattern;

  const card = x => {
    const r = x.recipe, n = nutrition(r);
    const entries = x.missing.length ? shoppingEntries(r, f.have, settings, f.who === 'self' ? 1 : 2) : [];
    const a = `<a class="rcard" href="#/recipe/${r.id}/f">
      ${illustSVG(r, { size: 'sm' })}
      <div class="r-body">
        <div class="r-name">${esc(r.name)}</div>
        <div class="r-meta">${CATS[r.cat].icon} ${CATS[r.cat].name}・${r.minutes}分・脂質${n.fat}g ${natureBadge(r.nature)}</div>
        ${x.helps.length ? `<div class="r-why">${x.helps.slice(0, 3).map(w => `<span class="tag matcha">◎ ${esc(worryShort(w))}</span>`).join('')}${r.seasons.some(s => season.tags.includes(s)) ? `<span class="tag kaki">${esc(sd.name)}向き</span>` : ''}</div>` : (r.seasons.some(s => season.tags.includes(s)) ? `<div class="r-why"><span class="tag kaki">${esc(sd.name)}の養生</span></div>` : '')}
        ${x.used.length ? `<div class="r-missing" style="color:var(--matcha-d)">✓ ${esc(x.used.map(id => ING_MAP[id].name.replace(/（.*/, '')).join('・'))}を使う</div>` : ''}
        ${x.missing.length ? `<div class="r-missing">あと「${esc(x.missing.map(id => ING_MAP[id].name.replace(/（.*/, '')).join('・'))}」があれば</div>` : ''}
        ${x.subs.length ? `<div class="r-missing" style="color:var(--ai)">${esc(x.subs.map(s => `${ING_MAP[s.id].name.replace(/（.*/, '')}→${ING_MAP[s.alt].name.replace(/（.*/, '')}`).join('、'))}で代用</div>` : ''}
        ${x.skips.length ? `<div class="r-missing" style="color:var(--ink-3)">${esc(x.skips.map(id => ING_MAP[id].name.replace(/（.*/, '')).join('・'))}はなくてもOK</div>` : ''}
      </div></a>`;
    if (!entries.length) return a;
    return `<div class="rwrap">${a}<button class="btn small shop-add ${added.has(r.id) ? 'done' : ''}" data-shop="${r.id}">${added.has(r.id) ? '✓ 買い物リストに追加済み' : `🛒 買い物リストに追加（${entries.length}品）`}</button></div>`;
  };

  const tabs = [['any', 'すべて'], ...Object.entries(CATS).map(([k, c]) => [k, c.name])];
  const html = `
  <div class="cond-line" style="margin-top:8px">
    <span class="tag">${f.who === 'self' ? '自分だけ（1人分）' : '夫と2人（2人分）'}</span>
    ${f.have.length ? f.have.slice(0, 6).map(id => `<span class="tag">${esc(ING_MAP[id].name.replace(/（.*/, ''))}</span>`).join('') + (f.have.length > 6 ? `<span class="tag">ほか${f.have.length - 6}品</span>` : '') : '<span class="tag">常備のみ</span>'}
  </div>
  <a class="small" href="#/find">食材を変える</a>

  <div class="season-banner" style="background:${sd.color}22;margin-top:10px">
    <span style="font-size:1.5em">${top?.icon || '🍁'}</span>
    <span>${worries.length ? `<b>${esc(worries.map(worryShort).join('・'))}</b>に合う順。` : '季節の養生に合う順。'}いまは<b>${esc(season.term.name)}・${esc(sd.name)}</b>（「${esc(sd.organ)}」をいたわる時期${season.doyo ? '・土用' : ''}）</span>
  </div>
  ${!my.length ? `<div class="card tint-kaki flat small">「いつもの悩み」を登録すると、あなたの悩みに合うレシピを優先して並べます。<a href="#/find">登録する</a></div>` : ''}

  <div class="seg scroll" data-noruby style="margin:12px 0 4px">${tabs.map(([k, l]) => `<button class="${f.cat === k ? 'on' : ''}" data-cat="${k}">${l}<small style="font-size:.78em;opacity:.7"> ${count(k)}</small></button>`).join('')}</div>
  <div style="display:flex;justify-content:flex-end">
    <div class="seg who-seg" data-noruby style="margin:6px 0"><button data-who="self" class="${f.who === 'self' ? 'on' : ''}" style="padding:0 12px">1人分</button><button data-who="pair" class="${f.who === 'pair' ? 'on' : ''}" style="padding:0 12px">2人分</button></div>
  </div>

  ${useSel.length ? `<div class="label small" style="margin-top:6px">選んだ食材で作れる（${useSel.length}件）</div>
    ${useSel.slice(0, 8).map(card).join('')}
    ${useSel.length > 8 ? `<div id="more" class="hidden">${useSel.slice(8).map(card).join('')}</div><button class="btn ghost block" data-act="more">もっと見る（${useSel.length - 8}件）</button>` : ''}` : ''}
  ${f.have.length && !useSel.length && otherCats.length ? `<div class="card tint-kaki flat"><p style="margin:0 0 8px">選んだ食材を使う${CATS[f.cat].name}はありませんでした。ほかの種類ならあります：</p>
    <div class="chips">${otherCats.map(c => `<button class="chip" data-cat="${c}">${CATS[c].icon} ${CATS[c].name}（${count(c)}件）</button>`).join('')}</div></div>` : ''}
  ${notes.length ? `<h2>選んだ食材の薬膳メモ</h2>${notes.join('')}` : ''}
  ${!shownReady.length ? `<div class="card tint-kaki"><p style="margin:0">この食材で作れる${f.cat === 'any' ? '' : CATS[f.cat].name + 'の'}レシピは見つかりませんでした。${f.cat === 'any' ? '' : '「すべて」のタブも見てみてください。'}下の「あと1品あれば」なら作れます。</p></div>` : ''}
  ${stockOnly.length ? `<details class="more" ${useSel.length ? '' : 'open'}><summary>🏠 常備だけで作れる（${stockOnly.length}件）</summary><div class="body" style="padding:0 8px 8px">${stockOnly.slice(0, 10).map(card).join('')}</div></details>` : ''}
  ${shownAlmost.length ? `<div class="label small" style="margin-top:16px">あと1品あれば作れる</div>${shownAlmost.map(card).join('')}` : ''}
  <p class="disclaimer">悩みに合うかどうかは、薬膳の考え方にもとづく目安です。気になる症状が続くときは医療機関へ。</p>`;

  return {
    title: '作れるレシピ', back: '#/find', tabbar: false,
    right: `<a class="icon-btn" href="#/home" aria-label="ホーム">🏠</a>`, html, keepScroll: !!cat,
    mount(root) {
      root.querySelectorAll('[data-cat]').forEach(b => b.onclick = () => { f.cat = b.dataset.cat; saveFind(f); refresh(); });
      root.querySelectorAll('[data-who]').forEach(b => b.onclick = () => { f.who = b.dataset.who; saveFind(f); refresh(); });
      const mb = root.querySelector('[data-act=more]');
      if (mb) mb.onclick = () => { root.querySelector('#more').classList.remove('hidden'); mb.remove(); };
      root.querySelectorAll('[data-shop]').forEach(b => b.onclick = () => {
        if (b.classList.contains('done')) return;
        const x = items.find(i => i.recipe.id === b.dataset.shop);
        store.addShopping(x.recipe, shoppingEntries(x.recipe, f.have, settings, f.who === 'self' ? 1 : 2));
        b.classList.add('done'); b.textContent = '✓ 買い物リストに追加済み';
        toast('買い物リストに追加しました', { action: 'リストを見る', onAction: () => { location.hash = '#/shopping'; } });
      });
    },
  };
}
