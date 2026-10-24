/* Lanterval · service worker : le jeu marche hors ligne.
   Premier chargement léger : seul BASE (code, textes, polices, écran titre, musique du titre) est téléchargé à l'installation ;
   le reste (images, musiques) se met en cache quand le jeu s'en sert, et petit à petit pendant qu'on joue (message « remplir »).
   Chaque fichier est rangé avec son empreinte : une mise à jour ne retélécharge que les fichiers qui ont changé.
   La page passe par le réseau d'abord (mises à jour) ; tout le reste vient du cache.
   VERSION, FICHIERS ([chemin, empreinte]) et BASE sont réécrits par outils/construire.js à chaque publication. */
var VERSION = '0.6.8-8e622c42';
var FICHIERS = [["./","ba158017"],["commun/ks-back.js","923a7a53"],["commun/ks-studio.js","292660ef"],["css/jeu.css","4880f3a5"],["donnees/acte1.js","7de15627"],["donnees/acte2.js","20d985ac"],["donnees/acte3.js","9d50db37"],["donnees/acte4.js","da0ebad9"],["donnees/annexes.js","6cc8ecf1"],["donnees/heros.js","17c3b115"],["donnees/images.js","b87e6c53"],["donnees/monde.js","0029ac29"],["donnees/monstres.js","33db827d"],["donnees/musiques.js","19f04395"],["donnees/objets.js","014e1d2f"],["donnees/personnages.js","71b2590f"],["icon-192.png","8459efc5"],["icon-512.png","1f27ab78"],["icon-maskable.png","3f3fa852"],["img/studio/keismey-studio.webp","4303390d"],["img/titre/brume.webp","a7ee7abb"],["img/titre/paix.webp","0e7614b9"],["manifest.webmanifest","7ae7fe8a"],["moteur/base.js","2be94f0d"],["moteur/carte.js","1a761dc0"],["moteur/combat.js","381410dd"],["moteur/debug.js","5bfc3624"],["moteur/etat.js","3c77fdaf"],["moteur/interface.js","a9cd8076"],["moteur/jeu.js","b97e658d"],["moteur/menus.js","7a438726"],["moteur/provisoire.js","f1bd91cc"],["moteur/recit.js","1a803850"],["moteur/scene.js","c4ece23d"],["moteur/son.js","21333652"],["moteur/textes.js","52d8a96b"],["moteur/village.js","b54f9eb9"],["moteur/zone.js","fe7476f9"],["polices/cinzel-600.woff2","f013ac32"],["polices/cinzel-700.woff2","e30aae05"],["polices/figtree-400.woff2","6f0c09ba"],["polices/figtree-500.woff2","f9c9da3b"],["polices/figtree-600.woff2","cdc20e28"],["polices/figtree-700.woff2","32c1002f"],["textes/en/acte1.txt","e8bc02a2"],["textes/en/acte2.txt","9a3a2d53"],["textes/en/acte3.txt","949a19f6"],["textes/en/acte4.txt","9a289e77"],["textes/en/annexes.txt","8de2aa58"],["textes/en/interface.txt","b13bdca7"],["textes/en/lieux.txt","6106acd3"],["textes/en/noms.txt","26e148eb"],["textes/en/personnages.txt","a7272593"],["textes/fr/acte1.txt","92c4ee35"],["textes/fr/acte2.txt","3be81e00"],["textes/fr/acte3.txt","3041b7a6"],["textes/fr/acte4.txt","b11a2507"],["textes/fr/annexes.txt","8c22df12"],["textes/fr/interface.txt","8fba8582"],["textes/fr/lieux.txt","643c62aa"],["textes/fr/noms.txt","c4f821d3"],["textes/fr/personnages.txt","ffdb5b5e"],["son/theme.m4a","45e9585f"],["img/affiche.jpg","a7808329"],["img/decors/aerie.webp","5eefc35d"],["img/decors/carte-cendre.webp","4b8ee5f9"],["img/decors/carte-cote.webp","03e4324d"],["img/decors/carte-vents.webp","eaa00d02"],["img/decors/carte.webp","425c1d1d"],["img/decors/champs.webp","81624862"],["img/decors/col-vide.webp","0c86ec33"],["img/decors/col.webp","9f4ab95f"],["img/decors/epave.webp","daa07e65"],["img/decors/escalier-sommet.webp","3695b293"],["img/decors/escalier.webp","91b3266c"],["img/decors/foret-calme.webp","45b1a19c"],["img/decors/foret.webp","96a72aaa"],["img/decors/forgecendre-libre.webp","0c9373ce"],["img/decors/forgecendre.webp","fa77a934"],["img/decors/grotte-sombre.webp","6d87d5fb"],["img/decors/grotte.webp","6ae4b073"],["img/decors/lanternes-allume.webp","65f73472"],["img/decors/lanternes.webp","8aded609"],["img/decors/lanterval.webp","ce721dff"],["img/decors/marais.webp","4795c7a7"],["img/decors/mines-libre.webp","f3052dcf"],["img/decors/mines.webp","339b8c79"],["img/decors/phare-libre.webp","3e823acf"],["img/decors/phare.webp","492f72ec"],["img/decors/pic.webp","e35cdb97"],["img/decors/pont.webp","f0461d69"],["img/decors/ruines.webp","fd8b4d83"],["img/decors/salvent-libre.webp","5b72c254"],["img/decors/salvent.webp","61f88e71"],["img/decors/volcan.webp","26980be1"],["img/heros/kael-portrait.webp","c89d39f3"],["img/heros/kael.webp","bdc29739"],["img/heros/mira-portrait.webp","8136078e"],["img/heros/mira.webp","df886acd"],["img/heros/nev-portrait.webp","72be16d8"],["img/heros/nev.webp","ce09f6f5"],["img/heros/sol-portrait.webp","093eefed"],["img/heros/sol.webp","747cbbed"],["img/pnj/agathe.webp","92ff7a9e"],["img/pnj/aldric.webp","b9a55744"],["img/pnj/aubergiste.webp","668b7a0b"],["img/pnj/berthe.webp","5cc05608"],["img/pnj/bosco.webp","e12c0c9c"],["img/pnj/brann.webp","1e842f36"],["img/pnj/dorn.webp","8dd4f1a4"],["img/pnj/edda.webp","8f9a2134"],["img/pnj/erwan.webp","574c676c"],["img/pnj/fennel.webp","cbb46e04"],["img/pnj/garrick.webp","3dc4027a"],["img/pnj/gaspard.webp","bc44b004"],["img/pnj/goran.webp","b56d1d26"],["img/pnj/heraut.webp","e8b1dca8"],["img/pnj/hilde.webp","25849faf"],["img/pnj/ilse.webp","616261fd"],["img/pnj/joran.webp","3f9d2d02"],["img/pnj/liss.webp","e4041e8d"],["img/pnj/loic.webp","4a06c71d"],["img/pnj/maelle.webp","273e1d31"],["img/pnj/naia.webp","27ee1475"],["img/pnj/nell.webp","91700e63"],["img/pnj/orvan.webp","ac57c3dc"],["img/pnj/pell.webp","f0da1389"],["img/pnj/pia.webp","8f218303"],["img/pnj/rosal.webp","b2da7344"],["img/pnj/roxane.webp","1db0d563"],["img/pnj/sansnom.webp","c87b5be9"],["img/pnj/silhouette.webp","0ee24d2c"],["img/pnj/tavor.webp","72a36284"],["img/pnj/tilo.webp","72c1a054"],["img/pnj/tobi.webp","c4ac89fa"],["img/pnj/varen.webp","bc510b02"],["img/pnj/ysold.webp","0870855f"],["img/panoramas/aerie.webp","f7033024"],["img/panoramas/aldric.webp","1c38054e"],["img/panoramas/berceuse.webp","24426071"],["img/panoramas/braise.webp","2e19b043"],["img/panoramas/cage-hilde.webp","3faeb791"],["img/panoramas/cage.webp","ce5ba906"],["img/panoramas/carnet.webp","6e9f88cf"],["img/panoramas/cerfvolant.webp","3da4eb5c"],["img/panoramas/echo.webp","ef59a22e"],["img/panoramas/epave.webp","18e113fd"],["img/panoramas/epee.webp","0a2cd2f2"],["img/panoramas/epilogue-kael.webp","09667b70"],["img/panoramas/epilogue-mira.webp","c05e8815"],["img/panoramas/epilogue-nev.webp","eb3f7bbd"],["img/panoramas/epilogue-sol.webp","947b7be8"],["img/panoramas/fete-lanterne.webp","95d414cf"],["img/panoramas/feu.webp","5ecaceea"],["img/panoramas/fleur.webp","38d59345"],["img/panoramas/forge.webp","f7b2eae8"],["img/panoramas/forgecendre.webp","d018162c"],["img/panoramas/fresques.webp","4ba400e1"],["img/panoramas/gardien.webp","4a726f66"],["img/panoramas/insigne.webp","42d2fd26"],["img/panoramas/lac-sol.webp","f82e7379"],["img/panoramas/larmes.webp","dfd756cb"],["img/panoramas/loup-alpha.webp","d0d0442e"],["img/panoramas/masque.webp","0b43e49b"],["img/panoramas/mira-loups.webp","2fcb552e"],["img/panoramas/naia.webp","e5dada07"],["img/panoramas/nev-champs.webp","fbbfbeac"],["img/panoramas/oeil.webp","2a947e11"],["img/panoramas/ouverture.webp","bcce3aec"],["img/panoramas/phare.webp","7f96c301"],["img/panoramas/pont.webp","42d982d0"],["img/panoramas/rosal.webp","4b61f7cd"],["img/panoramas/salvent.webp","781c4da1"],["img/panoramas/veine.webp","df36b0de"],["img/panoramas/vision.webp","9b00991a"],["img/panoramas/wyverne.webp","dfe70de7"],["img/panoramas/ysold-azur.webp","3878669d"],["img/panoramas/ysold.webp","94c156ec"],["img/monstres/alpha.webp","ba9884f2"],["img/monstres/anguille.webp","7c35cb47"],["img/monstres/automate.webp","4097ba8f"],["img/monstres/belier.webp","4c612e12"],["img/monstres/bosco.webp","cd449eb1"],["img/monstres/brume.webp","ab223071"],["img/monstres/chauve.webp","23352d94"],["img/monstres/chien.webp","3160886f"],["img/monstres/crabe.webp","073dae7c"],["img/monstres/crapaud.webp","d5a7c853"],["img/monstres/esprit.webp","9818f7ce"],["img/monstres/follet.webp","7e36a5e7"],["img/monstres/forgeur.webp","9e13d704"],["img/monstres/gardien.webp","b28df593"],["img/monstres/gargouille.webp","d5d29b85"],["img/monstres/gelee.webp","dec5590e"],["img/monstres/givre.webp","d5092b63"],["img/monstres/golem.webp","bf5a1eed"],["img/monstres/griffon.webp","f4c2a40f"],["img/monstres/harpie.webp","4fade1e0"],["img/monstres/heraut.webp","fdaba2d3"],["img/monstres/larmee.webp","8fba5e08"],["img/monstres/larmef.webp","8acc65bc"],["img/monstres/larmet.webp","1ed1ffe0"],["img/monstres/larmev.webp","593057eb"],["img/monstres/lezard.webp","d7100061"],["img/monstres/loup.webp","832a854a"],["img/monstres/mere.webp","c5144155"],["img/monstres/noye.webp","9a832184"],["img/monstres/nueeoubli.webp","686e8ede"],["img/monstres/ombre.webp","08af682b"],["img/monstres/paupiere.webp","83af5489"],["img/monstres/pie.webp","7ff307d6"],["img/monstres/poisson.webp","3e9016d7"],["img/monstres/prieur.webp","7c80fa23"],["img/monstres/rapace.webp","cc9687ab"],["img/monstres/rocaile-vol.webp","d708e4fd"],["img/monstres/rocaile.webp","1460f5e6"],["img/monstres/salamandre.webp","948712ca"],["img/monstres/salreine.webp","e35ad0a4"],["img/monstres/sanglier.webp","1090dfeb"],["img/monstres/sangsue.webp","ebc8226f"],["img/monstres/sansnom.webp","231e5a3b"],["img/monstres/scarabee.webp","15954788"],["img/monstres/sentinelle.webp","5b9c5ff8"],["img/monstres/serpent.webp","24a3c0ad"],["img/monstres/soldat.webp","776c4201"],["img/monstres/spectre.webp","46997380"],["img/monstres/spore.webp","6e3b266c"],["img/monstres/statue.webp","fd9c8228"],["img/monstres/sylphe.webp","1f0ebffb"],["img/monstres/tellure.webp","0a62842e"],["img/monstres/varen.webp","fe0654c6"],["img/monstres/veilleur.webp","5a60c822"],["img/monstres/ver.webp","f3242259"],["img/monstres/vouivre.webp","3ac9fea5"],["img/monstres/wyverne.webp","6b06dd33"],["img/monstres/ysold.webp","47730aa5"],["son/aerie.m4a","be787973"],["son/boss.m4a","de338f71"],["son/brume.m4a","97e1b0d0"],["son/cendre.m4a","66a2cdeb"],["son/combat.m4a","34efbf29"],["son/cote.m4a","d55da8a4"],["son/emotion.m4a","18726b29"],["son/epilogue.m4a","39f5f093"],["son/escalier.m4a","b2af8835"],["son/final.m4a","f5ff3358"],["son/forgecendre.m4a","21fff0ac"],["son/lanterval.m4a","7157227f"],["son/menace.m4a","147bd011"],["son/salvent.m4a","45aec804"],["son/vallee.m4a","f04b4e6c"],["son/vents.m4a","d5dfe201"],["son/voyage.m4a","ba7a067b"]];
var BASE = ["./","commun/ks-back.js","commun/ks-studio.js","css/jeu.css","donnees/acte1.js","donnees/acte2.js","donnees/acte3.js","donnees/acte4.js","donnees/annexes.js","donnees/heros.js","donnees/images.js","donnees/monde.js","donnees/monstres.js","donnees/musiques.js","donnees/objets.js","donnees/personnages.js","icon-192.png","icon-512.png","icon-maskable.png","img/studio/keismey-studio.webp","img/titre/brume.webp","img/titre/paix.webp","manifest.webmanifest","moteur/base.js","moteur/carte.js","moteur/combat.js","moteur/debug.js","moteur/etat.js","moteur/interface.js","moteur/jeu.js","moteur/menus.js","moteur/provisoire.js","moteur/recit.js","moteur/scene.js","moteur/son.js","moteur/textes.js","moteur/village.js","moteur/zone.js","polices/cinzel-600.woff2","polices/cinzel-700.woff2","polices/figtree-400.woff2","polices/figtree-500.woff2","polices/figtree-600.woff2","polices/figtree-700.woff2","textes/en/acte1.txt","textes/en/acte2.txt","textes/en/acte3.txt","textes/en/acte4.txt","textes/en/annexes.txt","textes/en/interface.txt","textes/en/lieux.txt","textes/en/noms.txt","textes/en/personnages.txt","textes/fr/acte1.txt","textes/fr/acte2.txt","textes/fr/acte3.txt","textes/fr/acte4.txt","textes/fr/annexes.txt","textes/fr/interface.txt","textes/fr/lieux.txt","textes/fr/noms.txt","textes/fr/personnages.txt","son/theme.m4a"];
var CACHE = 'lanterval-fichiers';
var EMP = {};
FICHIERS.forEach(function (f) { EMP[f[0]] = f[1]; });
var RACINE = new URL(self.registration.scope).pathname;

// adresse rangée dans le cache : le fichier et son empreinte
function cle(f) { return new URL((f === './' ? '' : f) + '?h=' + EMP[f], self.registration.scope).href; }
function chemin(url) { var p = url.pathname.indexOf(RACINE) === 0 ? url.pathname.slice(RACINE.length) : null; return p === '' || p === 'index.html' ? './' : p; }
// met un fichier en cache s'il n'y est pas déjà ; renvoie sa taille téléchargée (0 s'il y était)
function charger(c, f) {
  return c.match(cle(f)).then(function (hit) {
    if (hit) return 0;
    // cache: 'reload' : le fichier du serveur, pas la copie que le navigateur garde 10 minutes
    return fetch(new Request(f, { cache: 'reload' })).then(function (r) {
      if (!r.ok) throw new Error(f + ' ' + r.status);
      var n = +r.headers.get('content-length') || 200000;
      return c.put(cle(f), r).then(function () { return n; });
    });
  });
}

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(BASE.map(function (f) { return charger(c, f); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  var gardes = {};
  FICHIERS.forEach(function (f) { gardes[cle(f[0])] = 1; });
  e.waitUntil(caches.keys().then(function (ks) {
    // anciens caches (un par version) et fichiers qui ont changé ou disparu
    return Promise.all(ks.filter(function (k) { return k.indexOf('lanterval-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return caches.open(CACHE); }).then(function (c) {
    return c.keys().then(function (reqs) { return Promise.all(reqs.filter(function (r) { return !gardes[r.url]; }).map(function (r) { return c.delete(r); })); });
  }).then(function () { return self.clients.claim(); }));
});

// la page demande de compléter le cache : quelques Mo à la fois, dans l'ordre de FICHIERS
self.addEventListener('message', function (e) {
  if (!e.data || e.data.remplir === undefined) return;
  var budget = e.data.remplir || 3000000;
  e.waitUntil(caches.open(CACHE).then(function (c) {
    var i = 0, pris = 0, reste = 0;
    function suivant() {
      if (i >= FICHIERS.length) return null;
      var f = FICHIERS[i++][0];
      if (pris >= budget) return c.match(cle(f)).then(function (hit) { if (!hit) reste++; return suivant(); });
      return charger(c, f).then(function (n) { pris += n; }, function () { reste++; }).then(suivant);
    }
    return Promise.resolve(suivant()).then(function () { if (e.source) e.source.postMessage({ reste: reste }); });
  }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  var f = chemin(url);
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(function (r) {
      var copie = r.clone(); if (r.ok && EMP['./']) caches.open(CACHE).then(function (c) { c.put(cle('./'), copie); }); return r;
    }).catch(function () { return caches.match(cle('./')); }));
    return;
  }
  if (!f || !EMP[f]) return;   // fichier hors du jeu : le réseau, sans cache
  e.respondWith(caches.match(cle(f)).then(function (hit) {
    return hit || caches.open(CACHE).then(function (c) { return charger(c, f); }).then(function () { return caches.match(cle(f)); }).then(function (r) { return r || fetch(req); }, function () { return fetch(req); });
  }));
});
