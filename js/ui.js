// 共通UI部品
import { GLOSSARY } from '../data/glossary.js';
import { READINGS, SINGLE_READINGS } from '../data/readings.js';

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ── ルビ（読み仮名） ──
const reEsc = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const ruby = (t, yomi) => yomi ? `<ruby>${esc(t)}<rt>${esc(yomi)}</rt></ruby>` : esc(t);
const READ_TERMS = Object.keys(READINGS).sort((a, b) => b.length - a.length);
// 用語の直後に「（ひらがな」が続く場合は、すでに読みが書いてあるのでルビを振らない
const RUBY_RE = new RegExp(`(${READ_TERMS.map(reEsc).join('|')})(?!（[ぁ-ん])|「(${Object.keys(SINGLE_READINGS).join('|')})(?=」|（)`, 'g');

// プレーンテキスト（エスケープ済み）にルビを振る。同じ用語は1つの文のかたまりにつき最初の1回だけ
function rubyText(text) {
  const used = new Set();
  return text.replace(RUBY_RE, (m, multi, single) => {
    const t = multi || single;
    if (used.has(t)) return m;
    used.add(t);
    return single ? `「<ruby>${single}<rt>${SINGLE_READINGS[single]}</rt></ruby>` : `<ruby>${multi}<rt>${READINGS[multi]}</rt></ruby>`;
  });
}

// HTML全体にルビを振る（タグの中・SVG・既存のルビ・用語ボタン・入力欄は対象外）
export function rubyHTML(html) {
  const out = [];
  let skip = null; // スキップ中の閉じタグ名
  for (const tok of html.split(/(<[^>]+>)/)) {
    if (!tok) continue;
    if (tok[0] === '<') {
      if (skip) { if (tok.toLowerCase().startsWith('</' + skip)) skip = null; }
      else {
        const m = tok.match(/^<(svg|ruby|textarea|script|style)\b/i);
        if (m) skip = m[1].toLowerCase();
        else if (/^<button\b[^>]*class="term"/.test(tok)) skip = 'button';
        else if (/\bdata-noruby\b/.test(tok)) skip = tok.match(/^<(\w+)/)[1].toLowerCase();
      }
      out.push(tok);
    } else out.push(skip ? tok : rubyText(tok));
  }
  return out.join('');
}

// 用語リンク：2文字以上の用語は最初の1回、1文字の用語は「」で囲まれたときだけリンク（ルビ付き）
const MULTI = GLOSSARY.filter(g => g.term.length >= 2).map(g => g.term).sort((a, b) => b.length - a.length);
const SINGLE = GLOSSARY.filter(g => g.term.length === 1).map(g => g.term);
const GMAP = Object.fromEntries(GLOSSARY.map(g => [g.term, g]));
const GLOSS_RE = new RegExp(`(${MULTI.map(reEsc).join('|')})(（[ぁ-ん])?|「(${SINGLE.join('|')})」`, 'g');

export function glossify(text) {
  const used = new Set();
  return esc(text).replace(GLOSS_RE, (m, multi, hasYomi, single) => {
    const t = multi || single;
    if (used.has(t)) return m;
    used.add(t);
    const yomi = single ? SINGLE_READINGS[t] : hasYomi ? null : READINGS[t];
    const inner = `<button type="button" class="term" data-term="${esc(t)}">${ruby(t, yomi)}</button>`;
    return single ? `「${inner}」` : inner + (hasYomi || '');
  });
}

export function bindTerms(root) {
  root.addEventListener('click', e => {
    const b = e.target.closest('button.term');
    if (!b) return;
    e.preventDefault();
    const g = GMAP[b.dataset.term];
    if (g) sheet(`<h3 data-noruby>${esc(g.term)}</h3><p>${esc(g.text)}</p><button class="btn block ghost" data-close>閉じる</button>`);
  });
}

// ボトムシート
export function sheet(html, { onOpen } = {}) {
  const root = $('#sheet-root');
  root.innerHTML = `<div class="sheet-backdrop" data-close></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${rubyHTML(html)}</div>`;
  const close = () => { root.innerHTML = ''; };
  root.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', close));
  const el = root.querySelector('.sheet');
  onOpen?.(el, close);
  return close;
}
export const closeSheet = () => { $('#sheet-root').innerHTML = ''; };

// トースト
let toastTimer;
export function toast(msg, { action, onAction, ms = 4000 } = {}) {
  const root = $('#toast-root');
  root.innerHTML = `<div class="toast"><span>${esc(msg)}</span>${action ? `<button type="button">${esc(action)}</button>` : ''}</div>`;
  const btn = root.querySelector('button');
  if (btn) btn.addEventListener('click', () => { root.innerHTML = ''; onAction?.(); });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { root.innerHTML = ''; }, ms);
}

export function natureBadge(n) { return `<span class="nature n-${esc(n)}" title="五性：${esc(n)}">${esc(n)}</span>`; }

export function confirmSheet(message, okLabel = 'OK', { danger = false } = {}) {
  return new Promise(resolve => {
    sheet(`<p style="margin-top:6px">${esc(message)}</p>
      <div class="btn-row" style="margin-top:14px"><button class="btn ghost" data-act="no">やめる</button><button class="btn ${danger ? 'danger' : 'primary'}" data-act="ok">${esc(okLabel)}</button></div>`,
    { onOpen: (el, close) => {
      el.querySelector('[data-act=no]').onclick = () => { close(); resolve(false); };
      el.querySelector('[data-act=ok]').onclick = () => { close(); resolve(true); };
    } });
  });
}

export function fmtDate(d, withTime = false) {
  const dt = new Date(d);
  const w = '日月火水木金土'[dt.getDay()];
  const s = `${dt.getMonth() + 1}月${dt.getDate()}日（${w}）`;
  return withTime ? `${s} ${dt.getHours()}:${String(dt.getMinutes()).padStart(2, '0')}` : s;
}
