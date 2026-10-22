/* Lanterval · service worker : le jeu marche hors ligne après la première visite.
   La page passe par le réseau d'abord (mises à jour) ; tout le reste vient du cache.
   VERSION et FICHIERS sont réécrits par outils/construire.js à chaque publication. */
var VERSION = '0.2.2-41be37ee';
var FICHIERS = ["./","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable.png","css/jeu.css","commun/ks-back.js","commun/ks-studio.js","moteur/base.js","moteur/carte.js","moteur/combat.js","moteur/debug.js","moteur/etat.js","moteur/interface.js","moteur/jeu.js","moteur/menus.js","moteur/provisoire.js","moteur/recit.js","moteur/scene.js","moteur/textes.js","moteur/village.js","moteur/zone.js","donnees/acte1.js","donnees/annexes.js","donnees/heros.js","donnees/images.js","donnees/monde.js","donnees/monstres.js","donnees/objets.js","textes/en/acte1.txt","textes/en/annexes.txt","textes/en/interface.txt","textes/en/lieux.txt","textes/en/noms.txt","textes/fr/acte1.txt","textes/fr/annexes.txt","textes/fr/interface.txt","textes/fr/lieux.txt","textes/fr/noms.txt","polices/cinzel-600.woff2","polices/cinzel-700.woff2","polices/figtree-400.woff2","polices/figtree-500.woff2","polices/figtree-600.woff2","polices/figtree-700.woff2","img/decors/col-vide.webp","img/decors/col.webp","img/decors/foret-calme.webp","img/decors/foret.webp","img/decors/grotte-sombre.webp","img/decors/grotte.webp","img/decors/lanterval.webp","img/heros/kael-portrait.webp","img/heros/kael.webp","img/heros/mira-portrait.webp","img/heros/mira.webp","img/heros/sol-portrait.webp","img/heros/sol.webp","img/monstres/alpha.webp","img/monstres/belier.webp","img/monstres/chauve.webp","img/monstres/gelee.webp","img/monstres/golem.webp","img/monstres/harpie.webp","img/monstres/loup.webp","img/monstres/ombre.webp","img/monstres/sansnom.webp","img/monstres/spore.webp","img/monstres/varen.webp","img/panoramas/fete-lanterne.webp","img/pnj/sansnom.webp","img/pnj/varen.webp"];
var CACHE = 'lanterval-' + VERSION;

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FICHIERS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('lanterval-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(function (r) {
      var copie = r.clone(); caches.open(CACHE).then(function (c) { c.put('./', copie); }); return r;
    }).catch(function () { return caches.match('./'); }));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    return hit || fetch(req).then(function (r) { if (r.ok) { var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, cp); }); } return r; });
  }));
});
