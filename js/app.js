// 起動・ルーティング
import { store } from './store.js';
import { esc, bindTerms, closeSheet, rubyHTML } from './ui.js';
import home from './views/home.js';
import consult from './views/consult.js';
import result from './views/result.js';
import recipe from './views/recipe.js';
import records from './views/records.js';
import constitution from './views/constitution.js';
import learn from './views/learn.js';
import settings from './views/settings.js';
import onboarding from './views/onboarding.js';

const routes = { home, consult, result, recipe, records, constitution, learn, settings, onboarding };

const view = document.getElementById('view');
const topbar = document.getElementById('topbar');
bindTerms(view);

export function applyFontSize() {
  document.documentElement.classList.toggle('font-large', store.settings().fontSize === 'large');
}

export function go(hash) {
  if (location.hash === hash) render(); else location.hash = hash;
}

let lastPath = '';
function render() {
  closeSheet();
  document.body.classList.remove('cook-mode');
  let hash = location.hash.replace(/^#\/?/, '') || 'home';
  if (!store.settings().onboarded && !hash.startsWith('onboarding')) { location.replace('#/onboarding'); return; }
  const [name, ...params] = hash.split('/');
  const mod = routes[name] || home;
  let v;
  try {
    v = mod(params.map(decodeURIComponent));
  } catch (e) {
    console.error(e);
    v = { title: 'エラー', html: `<div class="empty"><span class="e-icon">🙇</span>表示できませんでした。<br><small>${esc(e.message)}</small><br><br><a class="btn" href="#/home">ホームへ</a></div>` };
  }
  document.body.classList.toggle('no-tabbar', v.tabbar === false);
  topbar.innerHTML = `
    ${v.back ? `<a class="icon-btn" href="${v.back}" aria-label="戻る">‹ 戻る</a>` : '<span style="width:8px"></span>'}
    <div class="tb-title">${esc(v.title || 'おうち薬膳')}</div>
    ${v.right || ''}`;
  view.innerHTML = rubyHTML(v.html);
  document.querySelectorAll('#tabbar a').forEach(a => a.classList.toggle('active', a.dataset.tab === (v.tab || name)));
  const path = name + '/' + params.join('/');
  if (path !== lastPath && !v.keepScroll) window.scrollTo(0, 0);
  lastPath = path;
  v.mount?.(view, topbar);
  document.title = v.title && v.title !== 'おうち薬膳' ? `${v.title}｜おうち薬膳` : 'おうち薬膳';
}

window.addEventListener('hashchange', render);
window.addEventListener('scroll', () => topbar.classList.toggle('scrolled', window.scrollY > 4), { passive: true });
export const rerender = render;

applyFontSize();
render();

// ── PWA：Service Worker と更新通知 ──
// 開発中（localhost）はキャッシュで古いファイルが出ないよう無効。?sw を付けると有効にして確認できる
const devNoSW = location.hostname === 'localhost' && !location.search.includes('sw');
if (devNoSW && 'serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
if ('serviceWorker' in navigator && location.protocol !== 'file:' && !devNoSW) {
  navigator.serviceWorker.register('sw.js').then(reg => {
    const notify = w => {
      const b = document.createElement('div');
      b.className = 'update-banner';
      b.innerHTML = '新しいバージョンがあります<button>更新</button>';
      b.querySelector('button').onclick = () => w.postMessage('skipWaiting');
      document.body.appendChild(b);
    };
    if (reg.waiting && navigator.serviceWorker.controller) notify(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) notify(w); });
    });
  }).catch(e => console.warn('SW', e));
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded) { reloaded = true; location.reload(); } });
}
