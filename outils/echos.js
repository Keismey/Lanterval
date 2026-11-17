/* Lanterval · simulation des combats contre les Échos (0.10.1), avec le cerveau du bot (outils/bot.js).
   Usage : node outils/echos.js [niveau=40] [parties=5] [--dur] [--json=fichier]
   L'équipe est montée au niveau donné, avec toutes les classes et tout l'équipement du jeu (sauf les pièces des Échos
   et le Talisman de l'écho) ; le bot choisit les classes contre chaque Écho et s'équipe au mieux.
   Comme en partie+ : Kael, Mira et Sol seuls contre les Échos du Gardien, de la Vouivre et du Héraut (Nev arrive à l'acte 3).
   Sac : 5 baumes, 3 élixirs, 5 éthers, 3 toniques, 3 sels, 3 antidotes, 3 onguents, 2 panacées, 2 fioles et 1 flacon de
   chaque élément. Deux reprises au plus par combat, puis repli (compté comme perdu). */
'use strict';
const path = require('path'), http = require('http'), fs = require('fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node-tools/node_modules/playwright');
const RACINE = path.join(__dirname, '..');
const ARGS = process.argv.slice(2).filter(a => !a.startsWith('--')), OPT = process.argv.slice(2).filter(a => a.startsWith('--'));
const NIVEAU = +(ARGS[0] || 40), PARTIES = +(ARGS[1] || 5), DUR = OPT.includes('--dur');
const JSON_SORTIE = (OPT.find(a => a.startsWith('--json=')) || '').slice(7);
const ECHOS = [['echogolem', 'foret', 3], ['echovouivre', 'lanternes', 3], ['echoheraut', 'pont', 3], ['echoforgeur', 'champs', 4], ['echosansnom', 'col.s', 4]];

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.m4a': 'audio/mp4' };
const serveur = http.createServer((req, res) => {
  const p = path.join(RACINE, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  if (!p.startsWith(RACINE) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
// le cerveau du bot, repris tel quel de outils/bot.js
const src = fs.readFileSync(path.join(__dirname, 'bot.js'), 'utf8');
const CERVEAU = src.slice(src.indexOf('function cerveau'), src.indexOf('\n(async () =>'));

(async () => {
  await new Promise(r => serveur.listen(0, r));
  const nav = await chromium.launch();
  const page = await nav.newPage({ viewport: { width: 420, height: 860 } });
  const erreurs = [];
  page.on('pageerror', e => erreurs.push(String(e.stack || e)));
  await page.route(/cloudflareinsights/, r => r.abort());
  await page.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('lanterval-options', JSON.stringify({ lang: 'fr', texte: 'instant', rapide: true })); } catch (e) {} });
  await page.goto(`http://localhost:${serveur.address().port}/index.html`);
  await page.waitForFunction(() => typeof S !== 'undefined' && S && S.screen === 'title');
  await page.evaluate(`(${CERVEAU.replace(/^function cerveau/, 'function')})([1, 'applique'])`);
  const repondre = () => page.evaluate(() => {
    const m = document.querySelector('#modal .modal');
    if (m) { const x = m.querySelector('#mclose') || m.querySelector('button'); if (x) { x.click(); return true; } }
    const b = [...document.querySelectorAll('#panel button[data-i]:not([disabled])')];
    const repli = b.find(x => x.textContent.includes(t('combat.abandonner')));
    if (repli && BOT.cur && (S.st.reprises || 0) - BOT.cur.rep0 >= 2) { repli.click(); return true; }
    const ok = b.find(x => !x.classList.contains('ghost')) || b[0];
    if (ok) { ok.click(); return true; }
    return false;
  });
  const res = [];
  for (const [id, lieu, nb] of ECHOS) for (let g = 1; g <= PARTIES; g++) {
    await page.evaluate(([id, lieu, nb, niv, dur, g]) => {
      let s = g * 7919 + id.length; Math.random = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
      S = newState(); S.plus = 1; S.finVue = 1; S.echosDur = dur; S.f.tuto = true;
      S.jobs = Object.keys(CLASSES).filter(j => !CLASSES[j].invite);
      for (const h of ORDRE_HEROS.slice(0, nb)) { const c = S.chars[h]; c.joined = true; c.lvl = niv; c.xp = 0; }
      const exclus = ['pierrecho', 'ecaillecho', 'lamecho', 'manteaucho', 'batoncho', 'talecho'];
      for (const k of Object.keys(EQUIPEMENT)) if (!exclus.includes(k)) S.bag[k] = 4;
      Object.assign(S.inv, { baume: 5, elixir: 3, ether: 5, tonique: 3, sel: 3, antidote: 3, onguent: 3, panacee: 2, fiolef: 2, fiolee: 2, fiolet: 2, fiolev: 2, flaconf: 1, flacone: 1, flacont: 1, flaconv: 1 });
      BOT.prep.choisirClasses([[id, 4]], true); BOT.prep.equiper();
      for (const h of team()) fullC(h);
      S.loc = lieu; S.screen = 'zone'; renderStable(); BOT.combats = []; BOT.objets = {};
      run(async () => { await battle([id], { boss: true }); });
    }, [id, lieu, nb, NIVEAU, DUR, g]);
    const t0 = Date.now();
    while (Date.now() - t0 < 120000) {
      const fini = await page.evaluate(() => !busy && BOT.combats.length > 0);
      if (fini) break;
      if (!(await repondre())) await page.waitForTimeout(5);
    }
    const c = await page.evaluate(() => ({ ...BOT.combats[0], classes: team().map(h => h.job).join('/'), pvEcho: (B && B.enemies ? B.enemies : []).length, mhp: mkEnnemi(BOT.combats[0] ? BOT.combats[0].ids.split(' ')[0] : 'loup', '').mhp, niveauEcho: niveauEcho() }));
    res.push({ id, g, ...c });
    process.stdout.write('.');
  }
  console.log('');
  console.log(`Échos, équipe niveau ${NIVEAU}, tout l'équipement${DUR ? ', difficulté Échos difficile' : ''} (${PARTIES} combats chacun)`);
  console.log('| Écho | Niveau de l\'Écho | PV | Classes | Gagnés sans reprise | Avec reprise(s) | Perdus | PV min médian | Tours médian | Objets moyen |');
  console.log('|---|---|---|---|---|---|---|---|---|---|');
  const med = a => { a = [...a].sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
  for (const [id] of ECHOS) {
    const r = res.filter(x => x.id === id);
    const nets = r.filter(x => x.res === 'win' && !x.reprises).length, rep = r.filter(x => x.res === 'win' && x.reprises).length, perdus = r.length - nets - rep;
    console.log(`| ${id} | ${r[0].niveauEcho} | ${r[0].mhp} | ${r[0].classes} | ${nets} | ${rep} | ${perdus} | ${Math.round(med(r.map(x => x.min)) * 100)} % | ${med(r.map(x => x.tours || 0))} | ${(r.reduce((a, x) => a + x.objets, 0) / r.length).toFixed(1)} |`);
  }
  if (JSON_SORTIE) fs.writeFileSync(JSON_SORTIE, JSON.stringify(res));
  if (erreurs.length) { console.log('Erreurs de la page :'); for (const e of [...new Set(erreurs)].slice(0, 20)) console.log('  ' + e); }
  await nav.close(); serveur.close(); process.exit(0);
})();
