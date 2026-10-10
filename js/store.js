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
      ngSelf: [],
      ngPartner: { flags: ['shellfish'], ids: [] },
      tools: ['microwave', 'toaster', 'ricecooker'],
      defaultTime: 'normal',
      defaultServes: 2,
      lowFat: true,
      fontSize: 'normal',
      onboarded: false,
    },
    constitution: null,
    draft: null,
    lastConsult: null,
    lastHave: [],
    records: [],
  };
}

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
  return {
    ...d, ...data,
    settings: { ...d.settings, ...(data.settings || {}) },
    version: DATA_VERSION,
  };
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
