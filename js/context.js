// 相談内容（draft）から推薦用の文脈を組み立てる
import { store } from './store.js';
import { getSeasonInfo } from './season.js';
import { diagnose, companionProfile, rankCandidates } from './engine.js';

export function newDraft(patch = {}) {
  const s = store.settings();
  return {
    step: 'who', who: s.defaultServes === 1 ? 'self' : 'pair', serves: s.defaultServes,
    worries: [], cat: null, companions: [], time: s.defaultTime, have: undefined,
    shortcut: false, startedAt: new Date().toISOString(), ...patch,
  };
}

export function buildContext(draft) {
  const st = store.get();
  const season = getSeasonInfo(new Date());
  const diag = diagnose({ worries: draft.worries, constitution: st.constitution, season });
  const companions = companionProfile(draft.companions);
  const ctx = { diag, season, constitution: st.constitution, companions, who: draft.who, records: st.records };
  const cond = { cat: draft.cat || 'any', time: draft.time, who: draft.who };
  const ranked = rankCandidates(cond, ctx, st.settings);
  return { ctx, cond, ranked, season, diag, companions, settings: st.settings };
}
