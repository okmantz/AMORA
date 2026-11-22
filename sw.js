// AMORA service worker — precaches the app shell so it works fully offline.
const VERSION = 'amora-v1.0.0';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'css/styles.css',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png',
  'js/app.js', 'js/core/util.js', 'js/core/store.js', 'js/core/io.js',
  'js/data/presets.js', 'js/data/dialogue.js', 'js/data/topics-data.js', 'js/data/system-data.js',
  'js/engine/engine.js', 'js/engine/intents.js', 'js/engine/topics.js', 'js/engine/templates.js', 'js/engine/style.js', 'js/engine/memory.js', 'js/engine/rules.js', 'js/engine/relationship.js', 'js/engine/text.js',
  'js/ui/dom.js', 'js/ui/avatar.js', 'js/ui/chat.js', 'js/ui/her.js', 'js/ui/dialogue.js', 'js/ui/memory.js', 'js/ui/journal.js', 'js/ui/history.js', 'js/ui/settings.js', 'js/ui/onboarding.js',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // network-first for navigations (so updates arrive), cache-first for everything else
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((r) => { const cp = r.clone(); caches.open(VERSION).then((c) => c.put('index.html', cp)); return r; }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => { if (r.ok) { const cp = r.clone(); caches.open(VERSION).then((c) => c.put(req, cp)); } return r; }).catch(() => caches.match('index.html'))));
});
