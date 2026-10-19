// Service Worker des Mathe-Igels: macht die App installierbar und ohne
// Internet nutzbar. Immer zuerst das Netz, damit Änderungen sofort
// ankommen; nur wenn das nicht klappt, kommt die gespeicherte Kopie.
'use strict';

// Liefert alleSaetze() und kennung(), um alle Aufnahmen zu kennen
importScripts('texte.js', 'fakten.js');

// Bei neuen Texten genügt es, die «Stand»-Zeile zu ändern: dann holt der neue
// Service Worker die fehlenden Aufnahmen nach, ohne alles neu zu laden.
// Wurden bestehende Aufnahmen neu gesprochen (gleiche Dateinamen, z.B. andere
// Stimme), stattdessen CACHE hochzählen, damit alte Aufnahmen verschwinden.
// Stand: alle 869 Aufnahmen da (Lucy Fennek)
const CACHE = 'pieks-v1';
const FILES = [
  './',
  'stil.css',
  'aufgaben.js',
  'texte.js',
  'fakten.js',
  'grafik.js',
  'app.js',
  'manifest.webmanifest',
  'icon.svg',
  'favicon.ico',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'audio/vorhanden.json',
];
// Vorab nur, was oft gebraucht wird; Fakten kommen beim ersten Hören in den Speicher
const AUDIO = [...new Set(alleSaetze().filter(x => x.gruppe !== 'fakt').map(x => 'audio/' + kennung(x.s) + '.mp3'))];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  // Nur eigene, ältere Speicher aufräumen; Yunas App auf 42.ai nicht anfassen
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('pieks-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Die App bittet nach dem Start darum: alle wichtigen Aufnahmen holen, die noch
// fehlen. Ohne Netz bricht es still ab und versucht es beim nächsten Start wieder.
let laedt = null;
async function audioVorladen() {
  const c = await caches.open(CACHE);
  const da = new Set((await c.keys()).map(r => r.url));
  for (const f of AUDIO) {
    const url = new URL(f, self.registration.scope).href;
    if (da.has(url)) continue;
    try {
      const r = await fetch(url);
      if (r.ok) await c.put(url, r);
    } catch (e) {
      return;
    }
  }
}
self.addEventListener('message', e => {
  if (e.data !== 'vorladen') return;
  if (!laedt) laedt = audioVorladen().finally(() => { laedt = null; });
  e.waitUntil(laedt);
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          e.waitUntil(caches.open(CACHE).then(c => c.put(req, copy)));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('./')))
  );
});
