/* Lanterval · service worker : le jeu marche hors ligne après la première visite.
   La page passe par le réseau d'abord (mises à jour) ; tout le reste vient du cache.
   VERSION et FICHIERS sont réécrits par outils/construire.js à chaque publication. */
var VERSION = '0.5.0-b26f294c';
var FICHIERS = ["./","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable.png","css/jeu.css","commun/ks-back.js","commun/ks-studio.js","moteur/base.js","moteur/carte.js","moteur/combat.js","moteur/debug.js","moteur/etat.js","moteur/interface.js","moteur/jeu.js","moteur/menus.js","moteur/provisoire.js","moteur/recit.js","moteur/scene.js","moteur/textes.js","moteur/village.js","moteur/zone.js","donnees/acte1.js","donnees/acte2.js","donnees/acte3.js","donnees/acte4.js","donnees/annexes.js","donnees/heros.js","donnees/images.js","donnees/monde.js","donnees/monstres.js","donnees/objets.js","donnees/personnages.js","textes/en/acte1.txt","textes/en/acte2.txt","textes/en/acte3.txt","textes/en/acte4.txt","textes/en/annexes.txt","textes/en/interface.txt","textes/en/lieux.txt","textes/en/noms.txt","textes/en/personnages.txt","textes/fr/acte1.txt","textes/fr/acte2.txt","textes/fr/acte3.txt","textes/fr/acte4.txt","textes/fr/annexes.txt","textes/fr/interface.txt","textes/fr/lieux.txt","textes/fr/noms.txt","textes/fr/personnages.txt","polices/cinzel-600.woff2","polices/cinzel-700.woff2","polices/figtree-400.woff2","polices/figtree-500.woff2","polices/figtree-600.woff2","polices/figtree-700.woff2","img/decors/carte-cote.webp","img/decors/carte.webp","img/decors/col-vide.webp","img/decors/col.webp","img/decors/epave.webp","img/decors/foret-calme.webp","img/decors/foret.webp","img/decors/grotte-sombre.webp","img/decors/grotte.webp","img/decors/lanternes-allume.webp","img/decors/lanternes.webp","img/decors/lanterval.webp","img/decors/marais.webp","img/decors/phare-libre.webp","img/decors/phare.webp","img/decors/salvent-libre.webp","img/decors/salvent.webp","img/heros/kael-portrait.webp","img/heros/kael.webp","img/heros/mira-portrait.webp","img/heros/mira.webp","img/heros/nev-portrait.webp","img/heros/nev.webp","img/heros/sol-portrait.webp","img/heros/sol.webp","img/monstres/alpha.webp","img/monstres/anguille.webp","img/monstres/automate.webp","img/monstres/belier.webp","img/monstres/bosco.webp","img/monstres/chauve.webp","img/monstres/chien.webp","img/monstres/crabe.webp","img/monstres/crapaud.webp","img/monstres/esprit.webp","img/monstres/follet.webp","img/monstres/forgeur.webp","img/monstres/gelee.webp","img/monstres/golem.webp","img/monstres/harpie.webp","img/monstres/heraut.webp","img/monstres/lezard.webp","img/monstres/loup.webp","img/monstres/mere.webp","img/monstres/noye.webp","img/monstres/ombre.webp","img/monstres/pie.webp","img/monstres/poisson.webp","img/monstres/salamandre.webp","img/monstres/salreine.webp","img/monstres/sanglier.webp","img/monstres/sangsue.webp","img/monstres/sansnom.webp","img/monstres/scarabee.webp","img/monstres/sentinelle.webp","img/monstres/soldat.webp","img/monstres/spore.webp","img/monstres/varen.webp","img/monstres/ver.webp","img/monstres/vouivre.webp","img/panoramas/cage.webp","img/panoramas/epave.webp","img/panoramas/epee.webp","img/panoramas/fete-lanterne.webp","img/panoramas/gardien.webp","img/panoramas/insigne.webp","img/panoramas/lac-sol.webp","img/panoramas/loup-alpha.webp","img/panoramas/mira-loups.webp","img/panoramas/naia.webp","img/panoramas/ouverture.webp","img/panoramas/phare.webp","img/panoramas/rosal.webp","img/panoramas/salvent.webp","img/panoramas/vision.webp","img/pnj/aubergiste.webp","img/pnj/berthe.webp","img/pnj/bosco.webp","img/pnj/brann.webp","img/pnj/erwan.webp","img/pnj/fennel.webp","img/pnj/gaspard.webp","img/pnj/heraut.webp","img/pnj/hilde.webp","img/pnj/loic.webp","img/pnj/maelle.webp","img/pnj/naia.webp","img/pnj/nell.webp","img/pnj/orvan.webp","img/pnj/pia.webp","img/pnj/rosal.webp","img/pnj/roxane.webp","img/pnj/sansnom.webp","img/pnj/silhouette.webp","img/pnj/tilo.webp","img/pnj/varen.webp","img/pnj/ysold.webp"];
var CACHE = 'lanterval-' + VERSION;

self.addEventListener('install', function (e) {
  // cache: 'reload' : on prend les fichiers sur le serveur, pas la copie que le navigateur garde 10 minutes
  // (sinon une mise à jour installée juste après la publication garderait les anciens fichiers)
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(FICHIERS.map(function (f) { return new Request(f, { cache: 'reload' }); }));
  }).then(function () { return self.skipWaiting(); }));
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
