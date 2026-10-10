// 設定
import { store } from '../store.js';
import { esc, sheet, toast, confirmSheet } from '../ui.js';
import { INGREDIENTS, ING_MAP, GROUP_LABELS, STOCK_CATEGORIES } from '../../data/ingredients.js';
import { TIME_LABELS, FAT_LIMITS } from '../engine.js';
import { applyFontSize } from '../app.js';

export const APP_VERSION = '1.2.0';
const refresh = () => window.dispatchEvent(new HashChangeEvent('hashchange'));

export const INSTALL_HELP = `
  <ol class="points">
    <li>Android の <b>Chrome</b> でこのアプリのページを開きます。</li>
    <li>右上の <b>︙（メニュー）</b> をタップします。</li>
    <li><b>「ホーム画面に追加」</b>（または「アプリをインストール」）を選びます。</li>
    <li>ホーム画面に「おうち薬膳」のアイコンができます。以後はアイコンから開けば、普通のアプリのように全画面で使えます（電波がなくても動きます）。</li>
  </ol>`;

export const DISCLAIMER = `
  <p>このアプリは、薬膳・食養生の考え方にもとづく<b>参考情報</b>を提供するもので、医療・診断・治療に代わるものではありません。</p>
  <p><b>次のような場合は、医療機関を受診してください。</b></p>
  <ul class="points"><li>38℃以上の発熱、強い痛みがある</li><li>症状が2週間以上続く・悪化している</li><li>血便・吐血、急な体重の変化がある</li><li>妊娠中・授乳中・持病がある・薬を飲んでいて不安がある</li></ul>
  <p>食物アレルギーのある方は、材料を必ずご確認ください。</p>`;

export const SOURCES = `
  <ul class="points">
    <li>証（体の状態）の分類と、証ごとの食材の選び方：神奈川県「未病を改善する薬膳」</li>
    <li>体質の分類：中華中医薬学会「中医体質分類と判定」(ZYYXH/T157-2009) を参考にした簡易版</li>
    <li>二十四節気・土用：太陽黄経にもとづく天文計算（国立天文台の暦要項と同じ定義）</li>
    <li>食材の五性・五味・帰経・はたらき：中医学・薬膳の一般的な教科書で共通する記載（諸説あるものは注記）</li>
    <li>脂質・エネルギー：日本食品標準成分表（八訂）をもとにした概算</li>
  </ul>`;

// ざっくり常備カテゴリ（オンボーディングと設定で共用）
export function stockCatsHTML(s) {
  const on = new Set(s.stockCats || []);
  return `<div class="options">${STOCK_CATEGORIES.map(c => `<button class="option ${on.has(c.id) ? 'on' : ''}" data-cat="${c.id}" style="min-height:60px;padding:10px 14px">
    <span class="o-icon">${c.icon}</span><span><span class="o-main">${esc(c.name)}</span><span class="o-sub">${esc(c.desc)}</span></span></button>`).join('')}</div>`;
}
export function bindStockCats(root) {
  root.querySelectorAll('[data-cat]').forEach(b => b.onclick = () => {
    const on = !b.classList.contains('on');
    store.setStockCat(b.dataset.cat, on);
    b.classList.toggle('on', on);
  });
}

function chipPicker(title, selected, filter, onSave, note = '') {
  const groups = Object.keys(GROUP_LABELS);
  let sel = new Set(selected);
  sheet(`<h3>${esc(title)}</h3>${note ? `<p class="small">${note}</p>` : ''}
    ${groups.map(g => { const list = INGREDIENTS.filter(i => i.group === g && filter(i)); return list.length ? `<div class="cat-head">${esc(GROUP_LABELS[g])}</div>
      <div class="chips">${list.map(i => `<button class="chip ${sel.has(i.id) ? 'on' : ''}" data-i="${i.id}">${esc(i.name)}</button>`).join('')}</div>` : ''; }).join('')}
    <div style="position:sticky;bottom:0;background:var(--card);padding-top:12px"><button class="btn primary block" data-act="save">保存する</button></div>`, {
    onOpen(el, close) {
      el.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { const id = b.dataset.i; sel.has(id) ? sel.delete(id) : sel.add(id); b.classList.toggle('on'); });
      el.querySelector('[data-act=save]').onclick = () => { onSave([...sel]); close(); toast('保存しました'); refresh(); };
    },
  });
}

export default function settings() {
  const s = store.settings();
  const names = ids => ids.map(id => ING_MAP[id]?.name.replace(/（.*/, '')).filter(Boolean);
  const stockNames = names(s.stock.filter(id => ING_MAP[id]?.group !== 'seasoning'));
  const seg = (key, opts) => `<div class="seg" data-seg="${key}">${opts.map(([v, l]) => `<button data-v="${v}" class="${String(s[key]) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  const sw = (key, label, sub = '') => `<label class="switch-row"><span>${label}${sub ? `<br><small>${sub}</small>` : ''}</span><span class="switch"><input type="checkbox" data-sw="${key}" ${s[key] ? 'checked' : ''}><i></i></span></label>`;
  const tool = (t, label) => `<label class="switch-row"><span>${label}</span><span class="switch"><input type="checkbox" data-tool="${t}" ${s.tools.includes(t) ? 'checked' : ''}><i></i></span></label>`;

  const html = `
  <h2>食材</h2>
  <div class="card flat">
    <div class="label">ざっくり常備（タップでまとめて登録）</div>
    <p class="small" style="margin:.2em 0 .6em">だいたい家にあるものを選ぶだけでOK。ないときは代用や「なくてもOK」で柔軟に提案します。</p>
    ${stockCatsHTML(s)}
  </div>
  <div class="card flat">
    <div class="label">常備食材の内訳（細かく調整したいとき）</div>
    <p class="small" style="margin:.2em 0 .6em">${esc(stockNames.join('・') || 'なし')}<br>＋調味料 ${s.stock.filter(id => ING_MAP[id]?.group === 'seasoning').length}種類</p>
    <button class="btn small block" data-act="stock">常備食材を編集</button>
  </div>
  <div class="card flat">
    <div class="label">自分が食べられない・避けたい食材</div>
    <p class="small" style="margin:.2em 0 .6em">${esc(names(s.ngSelf).join('・') || 'なし')}</p>
    <button class="btn small block" data-act="ngself">編集</button>
  </div>
  <div class="card flat">
    <div class="label">夫が苦手な食材（2人分のときだけ除外）</div>
    <label class="switch-row"><span>エビ・カニ・貝をまとめて除外</span><span class="switch"><input type="checkbox" data-shellfish ${s.ngPartner.flags.includes('shellfish') ? 'checked' : ''}><i></i></span></label>
    <p class="small" style="margin:.4em 0 .6em">そのほか：${esc(names(s.ngPartner.ids).join('・') || 'なし')}</p>
    <button class="btn small block" data-act="ngpartner">そのほかを編集</button>
  </div>

  <h2>調理の条件</h2>
  <div class="card flat">
    <div class="label">使える調理器具（コンロ・鍋・フライパンは常にあり）</div>
    ${tool('microwave', '電子レンジ')}${tool('toaster', 'オーブン・トースター')}${tool('ricecooker', '炊飯器')}
  </div>
  <div class="card flat">
    <div class="label">はじめに選ばれている調理時間</div>
    ${seg('defaultTime', Object.entries(TIME_LABELS).map(([k, l]) => [k, l.replace(/（.*/, '')]))}
    <div class="label" style="margin-top:14px">はじめに選ばれている人数</div>
    ${seg('defaultServes', [[1, '1人分'], [2, '2人分']])}
  </div>
  <div class="card flat">
    ${sw('lowFat', '低脂質モード', `1人分の脂質が 主菜${FAT_LIMITS.main}g・主食${FAT_LIMITS.staple}g・そのほか${FAT_LIMITS.side}g を超えるレシピを出しません`)}
  </div>

  <h2>表示</h2>
  <div class="card flat"><div class="label">文字の大きさ</div>${seg('fontSize', [['normal', 'ふつう'], ['large', '大きめ']])}</div>

  <h2>データ</h2>
  <div class="card flat">
    <p class="small" style="margin-top:0">記録や設定は<b>このスマホの中だけ</b>に保存され、外部には送信されません。公開URLを他の人が開いても、あなたの記録は見えません。<br>ブラウザのデータを消去したり機種変更したりすると消えるので、ときどきバックアップしてください。</p>
    <div class="btn-row"><button class="btn small" data-act="backup">バックアップ</button><button class="btn small" data-act="restore">復元</button></div>
    <input type="file" accept="application/json,.json" id="restore-file" hidden>
    <button class="btn small danger block" style="margin-top:10px" data-act="reset">すべてのデータを削除</button>
  </div>

  <h2>このアプリについて</h2>
  <div class="card flat">
    <button class="btn small ghost block" data-act="install">📱 ホーム画面に追加する方法</button>
    <button class="btn small ghost block" style="margin-top:8px" data-act="disclaimer">⚠️ 免責事項・受診の目安</button>
    <button class="btn small ghost block" style="margin-top:8px" data-act="sources">📚 参考にした資料</button>
    <button class="btn small ghost block" style="margin-top:8px" data-act="onboarding">はじめの説明をもう一度見る</button>
    <p class="small center" style="margin:.8em 0 0">おうち薬膳 v${APP_VERSION}</p>
  </div>`;

  return {
    title: '設定', tab: 'settings', html,
    mount(root) {
      bindStockCats(root);
      root.querySelectorAll('[data-seg]').forEach(g => g.querySelectorAll('button').forEach(b => b.onclick = () => {
        const key = g.dataset.seg; let v = b.dataset.v;
        if (key === 'defaultServes') v = +v;
        store.setSettings({ [key]: v });
        if (key === 'fontSize') applyFontSize();
        g.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      }));
      root.querySelectorAll('[data-sw]').forEach(i => i.onchange = () => store.setSettings({ [i.dataset.sw]: i.checked }));
      root.querySelectorAll('[data-tool]').forEach(i => i.onchange = () => {
        const t = i.dataset.tool; const tools = new Set(store.settings().tools);
        i.checked ? tools.add(t) : tools.delete(t); store.setSettings({ tools: [...tools] });
      });
      root.querySelector('[data-shellfish]').onchange = e => {
        const flags = e.target.checked ? ['shellfish'] : [];
        store.setSettings({ ngPartner: { ...store.settings().ngPartner, flags } });
      };
      const act = (name, fn) => root.querySelector(`[data-act=${name}]`).onclick = fn;
      act('stock', () => chipPicker('常備食材', s.stock, () => true, v => store.setSettings({ stock: v }), 'いつも家にある食材・調味料を選んでください。ここに入っていない食材は、相談のたびに「ある？」と確認します。'));
      act('ngself', () => chipPicker('自分が避けたい食材', s.ngSelf, i => i.group !== 'seasoning', v => store.setSettings({ ngSelf: v })));
      act('ngpartner', () => chipPicker('夫が苦手な食材', s.ngPartner.ids, i => i.group !== 'seasoning', v => store.setSettings({ ngPartner: { ...store.settings().ngPartner, ids: v } })));
      act('backup', () => {
        const blob = new Blob([store.exportJSON()], { type: 'application/json' });
        const a = document.createElement('a'); const d = new Date();
        a.href = URL.createObjectURL(blob); a.download = `おうち薬膳_バックアップ_${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.json`;
        document.body.appendChild(a); a.click(); a.remove(); toast('バックアップを保存しました');
      });
      const file = root.querySelector('#restore-file');
      act('restore', () => file.click());
      file.onchange = async () => {
        const f = file.files[0]; if (!f) return;
        if (!await confirmSheet('今のデータをバックアップの内容で置き換えます。よろしいですか？', '復元する')) return;
        try { store.importJSON(await f.text()); applyFontSize(); toast('復元しました'); refresh(); }
        catch (e) { toast('復元できませんでした：' + e.message); }
      };
      act('reset', async () => {
        if (await confirmSheet('記録・体質チェック・設定をすべて削除します。元に戻せません。', '削除する', { danger: true })) {
          store.resetAll(); applyFontSize(); location.hash = '#/onboarding';
        }
      });
      act('install', () => sheet(`<h3>ホーム画面に追加する方法</h3>${INSTALL_HELP}<button class="btn block ghost" data-close>閉じる</button>`));
      act('disclaimer', () => sheet(`<h3>免責事項・受診の目安</h3>${DISCLAIMER}<button class="btn block ghost" data-close>閉じる</button>`));
      act('sources', () => sheet(`<h3>参考にした資料</h3>${SOURCES}<button class="btn block ghost" data-close>閉じる</button>`));
      act('onboarding', () => { location.hash = '#/onboarding'; });
    },
  };
}
