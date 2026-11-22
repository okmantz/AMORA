// AMORA service worker — precaches the app shell so it works fully offline.
const VERSION = 'amora-v3.1.1';
const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/disguise/notes-180.png', 'icons/disguise/calc-180.png', 'icons/disguise/tasks-180.png', 'icons/disguise/reader-180.png',
  'icons/disguise/notes.webmanifest', 'icons/disguise/calc.webmanifest', 'icons/disguise/tasks.webmanifest', 'icons/disguise/reader.webmanifest',
  'icons/disguise/notes-192.png', 'icons/disguise/calc-192.png', 'icons/disguise/tasks-192.png', 'icons/disguise/reader-192.png',
  'icons/disguise/notes-512.png', 'icons/disguise/calc-512.png', 'icons/disguise/tasks-512.png', 'icons/disguise/reader-512.png',
  'css/styles.css',
  'assets/portraits/manifest.json',
  'js/app.js',
  'js/core/auth.js',
  'js/core/discreet.js',
  'js/core/io.js',
  'js/core/lookup.js',
  'js/core/store.js',
  'js/core/util.js',
  'js/data/dialogue.js',
  'js/data/facts.js',
  'js/data/presets.js',
  'js/data/range.js',
  'js/data/spice.js',
  'js/data/depth.js',
  'js/data/knowhow.js',
  'js/data/wisdom.js',
  'js/data/system-data.js',
  'js/data/topics-data.js',
  'js/data/topics-extra.js',
  'js/engine/engine.js',
  'js/engine/intents.js',
  'js/engine/memory.js',
  'js/engine/relationship.js',
  'js/engine/rules.js',
  'js/engine/spice.js',
  'js/engine/depth.js',
  'js/engine/depth-intents.js',
  'js/engine/style.js',
  'js/engine/templates.js',
  'js/engine/text.js',
  'js/engine/tools.js',
  'js/engine/topics.js',
  'js/ui/auth.js',
  'js/ui/avatar.js',
  'js/ui/chat.js',
  'js/ui/dialogue.js',
  'js/ui/dom.js',
  'js/ui/her.js',
  'js/ui/history.js',
  'js/ui/journal.js',
  'js/ui/memory.js',
  'js/ui/onboarding.js',
  'js/ui/photoreal.js',
  'js/ui/portrait.js',
  'js/ui/settings.js',
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
