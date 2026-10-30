/* Lanterval · préparation d'une publication.
   Usage : node outils/construire.js
   1. Met à jour sw.js : numéro de version et liste des fichiers gardés pour jouer hors ligne.
   2. Écrit dist/apercu.html : une seule page avec le code, les styles et les textes dedans
      (pour l'aperçu privé ; les images et les polices restent à côté, dans img/ et polices/). */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const RACINE = path.join(__dirname, '..');
const lire = f => fs.readFileSync(path.join(RACINE, f), 'utf8');
function fichiers(dossier, ext) {
  const out = [];
  for (const e of fs.readdirSync(path.join(RACINE, dossier), { withFileTypes: true })) {
    const p = dossier + '/' + e.name;
    if (e.isDirectory()) out.push(...fichiers(p, ext)); else if (ext.test(e.name)) out.push(p);
  }
  return out.sort();
}

// ---------- 1. service worker ----------
const liste = ['index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable.png', 'css/jeu.css',
  ...fichiers('commun', /\.js$/), ...fichiers('moteur', /\.js$/), ...fichiers('donnees', /\.js$/),
  ...fichiers('textes', /\.txt$/), ...fichiers('polices', /\.woff2$/), ...fichiers('img', /\.(webp|png|jpg)$/), ...fichiers('son', /\.m4a$/)];
const h = crypto.createHash('sha1'), emp = {};
for (const f of liste) {
  const d = fs.readFileSync(path.join(RACINE, f));
  h.update(d); emp[f] = crypto.createHash('sha1').update(d).digest('hex').slice(0, 8);
}
const version = /VERSION = '([^']+)'/.exec(lire('moteur/base.js'))[1] + '-' + h.digest('hex').slice(0, 8);
// premier chargement : tout sauf les images et les musiques, plus l'écran titre et sa musique ;
// sans les grandes icônes (640 Ko), que le navigateur demande lui-même à l'installation
const base = f => (!/^(img|son)\//.test(f) && !/^icon-(512|maskable)\.png$/.test(f)) || /^img\/(studio|titre)\//.test(f) || f === 'son/theme.m4a';
// ensuite, dans l'ordre où le jeu s'en sert le plus : décors et visages, panoramas, monstres, musiques
const rang = f => ['img/decors', 'img/heros', 'img/pnj', 'img/panoramas', 'img/monstres', 'son'].findIndex(d => f.startsWith(d + '/'));
const ordre = liste.filter(f => f !== 'index.html').sort((a, b) => (base(b) - base(a)) || (rang(a) - rang(b)) || (a < b ? -1 : 1));
let sw = lire('sw.js');
sw = sw.replace(/var VERSION = '[^']*';/, `var VERSION = '${version}';`)
       .replace(/var FICHIERS = \[.*\];/, 'var FICHIERS = ' + JSON.stringify([['./', emp['index.html']], ...ordre.map(f => [f, emp[f]])]) + ';')
       .replace(/var BASE = \[.*\];/, 'var BASE = ' + JSON.stringify(['./', ...ordre.filter(base)]) + ';');
fs.writeFileSync(path.join(RACINE, 'sw.js'), sw);
console.log(`sw.js : version ${version}, ${liste.length} fichiers`);

// ---------- 2. aperçu en une page ----------
let page = lire('index.html');
const textes = {};
for (const f of fichiers('textes', /\.txt$/)) textes[f.replace(/^textes\//, '').replace(/\.txt$/, '')] = lire(f);
const css = lire('css/jeu.css').replace(/url\(\.\.\/polices\//g, 'url(polices/');
page = page.replace('<link rel="stylesheet" href="css/jeu.css">', () => `<style>\n${css}</style>`);
page = page.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => `<script>/* ${src} */\n${lire(src).replace(/<\/script/gi, '<\\/script')}</script>`);
page = page.replace('<script>/* moteur/base.js */', () => `<script>window.LV_APERCU = true; window.LV_TEXTES = ${JSON.stringify(textes).replace(/</g, '\\u003c')};</script>\n<script>/* moteur/base.js */`);
// pas de service worker ni de statistiques dans l'aperçu
page = page.replace(/<script>if \('serviceWorker'[\s\S]*?<\/script>\n/, '').replace(/<!-- Cloudflare Web Analytics -->[\s\S]*?<!-- End Cloudflare Web Analytics -->\n/, '');
page = page.replace(/<link rel="(manifest|preload|icon|apple-touch-icon)"[^>]*>\n/g, '');
// l'aperçu est enveloppé par la page qui l'accueille : pas de doctype, html, head ni body à nous
page = page.replace(/<!doctype html>\n|<\/?html[^>]*>\n?|<\/?head>\n|<\/?body>\n|<meta (charset|name="(viewport|mobile-web-app-capable|apple-[^"]*)")[^>]*>\n/gi, '')
  .replace('<title>Lanterval</title>', '<title>Lanterval</title>\n<meta name="claude:viewport-fit-sides" content="cover">');
fs.mkdirSync(path.join(RACINE, 'dist'), { recursive: true });
fs.writeFileSync(path.join(RACINE, 'dist/apercu.html'), page);
console.log(`dist/apercu.html : ${Math.round(page.length / 1024)} Ko`);
