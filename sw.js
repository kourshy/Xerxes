// Xerxes — service worker: پوستهٔ برنامه را کش می‌کند تا آفلاین هم باز شود.
// هر بار فایل‌ها را عوض کردی، عدد نسخه را یکی بالا ببر.
const VERSION = 'xerxes-v3';
const SHELL = [
  './', 'index.html', 'app.css', 'app.js', 'manifest.webmanifest', 'vendor/qrcode.min.js',
  'fonts/vazirmatn-arabic-wght-normal.woff2', 'fonts/vazirmatn-latin-wght-normal.woff2',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-192.png',
  'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // درخواست‌های API به گوگل کش نمی‌شوند
  if (req.mode === 'navigate') {
    // صفحه: اول شبکه (برای دریافت نسخهٔ تازه)، در نبود اینترنت از کش
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put('index.html', c)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  // فایل‌های برنامه: از کش سریع، و هم‌زمان نسخهٔ تازه از شبکه (stale-while-revalidate)
  e.respondWith(caches.open(VERSION).then(c => c.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  })));
});
