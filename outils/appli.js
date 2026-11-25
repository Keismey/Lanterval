/* Lanterval · version appli Android.
   Usage : node outils/appli.js DOSSIER   (le workflow « Appli Android » utilise app/www)
   Copie le jeu dans DOSSIER, prêt pour Capacitor, avec ces différences :
   - pas de service worker (les fichiers sont déjà dans l'appli) ni de mesure Cloudflare ;
   - window.LV_APPLI = true : pas de hub, pas de lien de soutien, plein écran géré par Android ;
   - commun/ks-back.js remplacé par android-app/ks-back.js (retour Android, quitter ferme l'appli) ;
   - commun/ks-studio.js : nom du jeu fixé (l'adresse est https://localhost/, le code de sauvegarde
     garde « KS1.Lanterval. » et passe donc du site à l'appli), synchro de compte coupée, formulaire
     de bug ouvert sur le hub dans le navigateur, pas de bouton « Télécharger le fichier ». */
'use strict';
const fs = require('fs'), path = require('path');
const RACINE = path.join(__dirname, '..');
const OUT = process.argv[2];
if (!OUT) { console.error('Usage : node outils/appli.js DOSSIER'); process.exit(1); }
const lire = f => fs.readFileSync(path.join(RACINE, f), 'utf8');
function remplacer(t, a, b, f) {
  if (!t.includes(a)) throw new Error(`${f} : introuvable « ${a.slice(0, 60)} »`);
  return t.split(a).join(b);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const d of ['css', 'moteur', 'donnees', 'textes', 'polices', 'img', 'son'])
  fs.cpSync(path.join(RACINE, d), path.join(OUT, d), { recursive: true });
for (const f of ['icon-192.png', 'icon-512.png', 'icon-maskable.png'])
  fs.copyFileSync(path.join(RACINE, f), path.join(OUT, f));
// affiche et sources d'images : inutiles dans l'appli
fs.rmSync(path.join(OUT, 'img/affiche.jpg'), { force: true });

// page
let page = lire('index.html');
const sw = page.indexOf("<script>if ('serviceWorker' in navigator");
const fin = page.indexOf('</script>', sw);
if (sw < 0 || fin < 0) throw new Error('index.html : bloc du service worker introuvable');
page = page.slice(0, sw) + page.slice(fin + '</script>'.length);
page = page.replace(/<!-- Cloudflare Web Analytics -->[\s\S]*?<!-- End Cloudflare Web Analytics -->\n?/, '');
if (/cloudflareinsights|serviceWorker/.test(page)) throw new Error('index.html : Cloudflare ou service worker encore présent');
page = page.replace(/<link rel="manifest"[^>]*>\n/, '').replace(/<meta (property|name)="(og|twitter):[^>]*>\n/g, '');
page = remplacer(page, '<!-- fichiers communs du studio -->',
  '<script>window.LV_APPLI = true;</script>\n<style>#ks-file{display:none}</style>\n<!-- fichiers communs du studio -->', 'index.html');
fs.writeFileSync(path.join(OUT, 'index.html'), page);

// fichiers communs
fs.mkdirSync(path.join(OUT, 'commun'));
fs.copyFileSync(path.join(RACINE, 'android-app/ks-back.js'), path.join(OUT, 'commun/ks-back.js'));
let ks = lire('commun/ks-studio.js');
for (const [a, b] of [
  ["var DIR = location.pathname.split('/')[1] || '';", "var DIR = 'Lanterval';"],
  ["var SYNC_API = 'https://ks-sync.keismeystudio.workers.dev/v1/';", "var SYNC_API = '';"],
  ["return '/?contact=bug&jeu='", "return 'https://keismey.github.io/?contact=bug&jeu='"],
  ["bug: function (jeu, lang) { location.assign(window.KS.bugUrl(jeu, lang)); },",
   "bug: function (jeu, lang) { window.open(window.KS.bugUrl(jeu, lang), '_blank', 'noopener'); },"]
]) ks = remplacer(ks, a, b, 'commun/ks-studio.js');
fs.writeFileSync(path.join(OUT, 'commun/ks-studio.js'), ks);

const VERSION = /VERSION = '([^']+)'/.exec(lire('moteur/base.js'))[1];
let taille = 0;
(function compter(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) compter(p); else taille += fs.statSync(p).size; } })(OUT);
console.log(`Lanterval ${VERSION} · version appli dans ${OUT} (${(taille / 1048576).toFixed(1)} Mo)`);
