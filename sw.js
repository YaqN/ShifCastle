const CACHE = 'bday-v1';
const ASSETS = [
  './', './index.html', './style.css', './script.js',
  './birthday_center.png', './bunny_room.jpg', './cake_room.jpg', './tea_room.jpg',
  './track.mp3', './favicon.svg', './og-cover.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
