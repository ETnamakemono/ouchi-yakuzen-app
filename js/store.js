// 保存層（端末内 localStorage）。外部には一切送信しない。
import { INGREDIENTS, STOCK_CATEGORIES } from '../data/ingredients.js';

const KEY = 'yakuzen-app';
export const DATA_VERSION = 1;

function defaults() {
  return {
    version: DATA_VERSION,
    settings: {
      stock: [...new Set([...INGREDIENTS.filter(i => i.stock).map(i => i.id),
        ...STOCK_CATEGORIES.filter(c => ['seasoning', 'aroma', 'staple'].includes(c.id)).flatMap(c => c.ids)])],
      stockCats: ['seasoning', 'aroma', 'staple'],
      stockSeen: [...new Set(STOCK_CATEGORIES.flatMap(c => c.ids))],
      ngSelf: [],
      ngPartner: { flags: ['shellfish'], ids: [] },
      tools: ['microwave', 'toaster', 'ricecooker'],
      defaultTime: 'normal',
      defaultServes: 2,
      lowFat: true,
      fontSize: 'normal',
      onboarded: false,
      myWorries: [],
    },
    constitution: null,
    draft: null,
    lastConsult: null,
    lastHave: [],
    records: [],
    shopping: { items: [], recipes: [] },
    find: null,
  };
}

const ALL_CAT_IDS = [...new Set(STOCK_CATEGORIES.flatMap(c => c.ids))];
// stockSeen を持たない旧データ向け：このバージョンでカテゴリに増えた食材
const NEW_CAT_IDS = ['goji'];

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    return migrate(JSON.parse(raw));
  } catch (e) {
    console.warn('load failed', e);
    return defaults();
  }
}

// 将来データ形式を変えたとき用（version を見て変換）
function migrate(data) {
  const d = defaults();
  const out = {
    ...d, ...data,
    settings: { ...d.settings, ...(data.settings || {}) },
    version: DATA_VERSION,
  };
  out.shopping = { items: [], recipes: [], ...(data.shopping || {}) };
  // アプリの更新で常備カテゴリに食材が増えたら、そのカテゴリをONにしている人の常備に追加する
  const st = out.settings;
  // 保存データ側の stockSeen を見る（初期値と混ぜると、新しい食材まで「確認済み」になってしまう）
  const seen = new Set(data.settings?.stockSeen || ALL_CAT_IDS.filter(id => !NEW_CAT_IDS.includes(id)));
  const stock = new Set(st.stock);
  for (const c of STOCK_CATEGORIES) if ((st.stockCats || []).includes(c.id)) for (const id of c.ids) if (!seen.has(id)) stock.add(id);
  st.stock = [...stock];
  st.stockSeen = ALL_CAT_IDS;
  return out;
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (e) { console.warn('save failed', e); }
}

export const store = {
  get: () => state,
  settings: () => state.settings,
  update(fn) { fn(state); save(); },
  setSettings(patch) { Object.assign(state.settings, patch); save(); },

  // ざっくり常備カテゴリのON/OFF（カテゴリ内の食材をまとめて常備に出し入れ）
  setStockCat(catId, on) {
    const s = state.settings;
    const cats = new Set(s.stockCats || []);
    on ? cats.add(catId) : cats.delete(catId);
    const stock = new Set(s.stock);
    const cat = STOCK_CATEGORIES.find(c => c.id === catId);
    if (on) cat.ids.forEach(id => stock.add(id));
    else {
      const keep = new Set(STOCK_CATEGORIES.filter(c => cats.has(c.id)).flatMap(c => c.ids));
      cat.ids.forEach(id => { if (!keep.has(id)) stock.delete(id); });
    }
    s.stockCats = [...cats]; s.stock = [...stock]; save();
  },

  // ── 買い物リスト ──
  // entries: [{ id, name, group, text }]  recipe: { id, name }
  addShopping(recipe, entries) {
    const sh = state.shopping;
    if (!sh.recipes.some(r => r.id === recipe.id)) sh.recipes.push({ id: recipe.id, name: recipe.name });
    for (const e of entries) {
      let it = sh.items.find(x => x.id === e.id);
      if (!it) { it = { id: e.id, name: e.name, group: e.group, done: false, uses: [] }; sh.items.push(it); }
      it.done = false;
      if (!it.uses.some(u => u.recipeId === recipe.id)) it.uses.push({ recipeId: recipe.id, recipeName: recipe.name, text: e.text });
    }
    save();
  },
  toggleShopping(id) {
    const it = state.shopping.items.find(x => x.id === id);
    if (!it) return;
    it.done = !it.done;
    // 買ったものは「家にある」として次回の食材確認に反映
    const have = new Set(state.lastHave || []);
    it.done ? have.add(id) : have.delete(id);
    state.lastHave = [...have];
    save();
  },
  removeShoppingRecipe(recipeId) {
    const sh = state.shopping;
    sh.recipes = sh.recipes.filter(r => r.id !== recipeId);
    sh.items.forEach(it => { it.uses = it.uses.filter(u => u.recipeId !== recipeId); });
    sh.items = sh.items.filter(it => it.uses.length);
    save();
  },
  clearShopping(onlyDone = false) {
    const sh = state.shopping;
    if (onlyDone) sh.items = sh.items.filter(it => !it.done);
    else { sh.items = []; sh.recipes = []; }
    save();
  },

  // 相談の途中保存
  saveDraft(draft) { state.draft = draft; save(); },
  clearDraft() { state.draft = null; save(); },

  addRecord(rec) {
    const r = { id: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), memo: '', ...rec };
    state.records.unshift(r); save(); return r;
  },
  updateRecord(id, patch) {
    const r = state.records.find(x => x.id === id);
    if (r) { Object.assign(r, patch); save(); }
  },
  deleteRecord(id) { state.records = state.records.filter(x => x.id !== id); save(); },

  exportJSON() {
    return JSON.stringify({ app: 'yakuzen-app', exportedAt: new Date().toISOString(), ...state }, null, 2);
  },
  importJSON(text) {
    const data = JSON.parse(text);
    if (data.app !== 'yakuzen-app' || !data.settings) throw new Error('このアプリのバックアップファイルではありません');
    delete data.app; delete data.exportedAt;
    state = migrate(data); save();
  },
  resetAll() { state = defaults(); save(); },
};
