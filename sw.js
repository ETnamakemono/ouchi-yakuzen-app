// Service Worker：全ファイルを事前キャッシュしてオフラインで動かす
// ファイルを更新したら VERSION を上げる → アプリに「新しいバージョンがあります」が出る
const VERSION = 'v1.1.0';
const CACHE = `yakuzen-${VERSION}`;
const FILES = [
  './', './index.html', './manifest.webmanifest', './css/style.css',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png',
  './js/app.js', './js/store.js', './js/season.js', './js/engine.js', './js/illust.js', './js/exporter.js', './js/ui.js', './js/context.js', './js/graphics.js',
  './js/views/home.js', './js/views/consult.js', './js/views/result.js', './js/views/recipe.js', './js/views/records.js',
  './js/views/constitution.js', './js/views/learn.js', './js/views/settings.js', './js/views/onboarding.js',
  './data/ingredients.js', './data/recipes.js', './data/recipes_a.js', './data/recipes_b.js', './data/worries.js', './data/patterns.js', './data/constitutions.js',
  './data/seasons.js', './data/companions.js', './data/glossary.js', './data/readings.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(async () => {
    // 初回インストール時はすぐに有効化（更新時はユーザーの「更新」操作を待つ）
    if (!(await self.clients.matchAll()).length) self.skipWaiting();
  }));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('yakuzen-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match('./index.html'))));
});
