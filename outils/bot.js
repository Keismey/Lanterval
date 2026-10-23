/* Lanterval · bot de test : joue la partie entière (quête principale et quêtes annexes) dans Chromium,
   pour vérifier que tout s'enchaîne sans erreur et que les boss restent difficiles sans être injustes.
   Usage : node outils/bot.js [graine]   (Playwright : /opt/node-tools/node_modules/playwright, ou PLAYWRIGHT_MODULE)
   Le bot explore chaque zone à 100 % avant d'y jouer une quête, se soigne à l'auberge avant chaque quête,
   achète le meilleur équipement qu'il peut et se bat avec une tactique simple (faiblesses, soins, objets).
   Il ne se déplace pas sur la carte : il se place directement au bon endroit (pas de combats de traversée).
   Rapport : niveaux et PV les plus bas de l'équipe à chaque combat de quête, défaites, erreurs de la page. */
'use strict';
const path = require('path'), http = require('http'), fs = require('fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node-tools/node_modules/playwright');
const RACINE = path.join(__dirname, '..');
const GRAINE = +(process.argv[2] || 1);

// petit serveur de fichiers pour la page
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const serveur = http.createServer((req, res) => {
  const p = path.join(RACINE, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  if (!p.startsWith(RACINE) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});

// tout ce qui suit s'exécute dans la page
function cerveau(graine) {
  // hasard reproductible
  let s = graine * 2654435761 % 4294967296; Math.random = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  // les pauses du jeu deviennent presque instantanées
  const st0 = window.setTimeout; window.setTimeout = (f, ms, ...a) => st0(f, Math.min(ms || 0, 2), ...a);
  window.typeIn = () => {};
  const R = window.BOT = { log: [], combats: [], defaites: [], etapes: 0, fini: false };
  const note = m => R.log.push(m);

  // ---------- combat ----------
  const pvp = h => h.hp / mhp(h);
  const origBattle = battle;
  window.battle = async (ids, o) => {
    S.f.tuto = true;
    const c = { ids: ids.join(' '), boss: !!o.boss, quete: !!o.quest, lieu: S.loc, etape: (etapeCourante() || {}).id, niv: team().map(h => h.lvl).join('/'), min: 1 };
    R.cur = c;
    try { const r = await origBattle(ids, o); c.res = r || 'gagne'; return r; }
    catch (e) { c.res = 'defaite'; throw e; }
    finally { if (o.quest || o.boss) R.combats.push(c); R.cur = null; }
  };
  window.heroCommand = async h => {
    const E = aliveE(), T = aliveH();
    if (R.cur) { R.cur.min = Math.min(R.cur.min, ...team().map(pvp)); R.cur.tours = B.turns; }
    const tech = id => CLASSES[h.job].tech.includes(id) && h.pp >= TECHNIQUES[id].pp;
    const bas = T.filter(x => pvp(x) < .45).sort((a, b) => pvp(a) - pvp(b));
    if (bas.length >= 2 && tech('soins')) return { type: 'skill', sk: 'soins' };
    if (bas.length && tech('soin')) return { type: 'skill', sk: 'soin', t: bas[0] };
    const tresBas = T.filter(x => pvp(x) < .3).sort((a, b) => pvp(a) - pvp(b))[0];
    if (tresBas) for (const it of ['potion', 'elixir', 'herbe']) if (S.inv[it] > 0) return { type: 'item', it, t: tresBas };
    if (h.pp < 4 && Math.random() < .5) for (const it of ['ether', 'tonique']) if (S.inv[it] > 0) return { type: 'item', it, t: h };
    const he = HEROS[h.id].el;
    // une technique de l'élément du héros sur une faiblesse ; sinon l'Attaque (Lame) sur une faiblesse ; sinon le plus faible
    const faibleA = el => E.filter(e => e.weak.includes(el) && !e.broken).sort((a, b) => a.shield - b.shield || a.hp - b.hp)[0];
    const cibleX = faibleA(he), cibleL = faibleA(elArme(h)), cassé = E.find(e => e.broken), faible = [...E].sort((a, b) => a.hp - b.hp)[0];
    if (E.length >= 3 && tech('deluge')) return { type: 'skill', sk: 'deluge' };
    for (const sk of ['sort', 'frappe', 'sacree', 'rafale', 'abordage', 'marteau']) if (tech(sk) && (cibleX || cassé)) return { type: 'skill', sk, t: cassé || cibleX };
    if (cibleL) return { type: 'skill', sk: 'attaque', t: cibleL };
    if (tech('sort')) return { type: 'skill', sk: 'sort', t: cassé || faible };
    return { type: 'skill', sk: 'attaque', t: cassé || faible };
  };

  // ---------- préparation ----------
  const PHYSIQUES = ['kael', 'nev'];
  const score = (id, h) => { const st = EQUIPEMENT[id].st, ph = PHYSIQUES.includes(h.id); return (st.atk || 0) * (ph ? 1.4 : .4) + (st.mag || 0) * (ph ? .2 : 1.2) + (st.def || 0) * 1.1 + (st.hp || 0) * .25 + (st.pp || 0) * .3 + (st.spd || 0) * .5; };
  function equiper() {
    for (const h of team()) for (const id of Object.keys(S.bag).filter(k => S.bag[k] > 0)) {
      const pl = EQUIPEMENT[id].place, cur = h.eq[pl];
      if (canWear(h, id) && (!cur || score(id, h) > score(cur, h))) { S.bag[id]--; if (cur) addEq(cur); h.eq[pl] = id; clampC(h); }
    }
  }
  function choisirClasses() {
    const veut = { kael: ['guerrier', 'apprenti'], mira: ['mage'], sol: ['soigneur'], nev: ['moine'] };
    for (const h of team()) { const j = veut[h.id].find(x => S.jobs.includes(x)); if (j && h.job !== j) { h.job = j; for (const pl of PLACES_EQ) if (h.eq[pl] && !canWear(h, h.eq[pl])) { addEq(h.eq[pl]); h.eq[pl] = null; } clampC(h); } }
  }
  function acheter(vid) {
    for (const p of LIEUX[vid].pnj.filter(p => p.role === 'boutique' && cond(p.si))) {
      for (const k of enRayon(p)) for (const h of team()) {
        const e = EQUIPEMENT[k], cur = h.eq[e.place];
        if (canWear(h, k) && (!cur || score(k, h) > score(cur, h) + 1) && S.gold >= e.prix + 30) { S.gold -= e.prix; addEq(k); equiper(); }
      }
      for (const [k, prix] of p.objets) while ((S.inv[k] || 0) < (k === 'tonique' ? 4 : 6) && S.gold >= prix + 30) { S.gold -= prix; addItem(k, 1); }
    }
  }
  function auberge(vid) {
    const a = LIEUX[vid].pnj.find(p => p.role === 'auberge'); if (a && S.gold >= a.prix) S.gold -= a.prix;
    healAll(); restorePP();
  }
  // village le plus proche d'une position (la région du lieu)
  const villageDe = pos => { const reg = regionDe(pos); return Object.keys(LIEUX).find(k => LIEUX[k].type === 'village' && lieuVisible(k) && regionsDu(k).includes(reg)) || 'lanterval'; };
  const posDe = l => { const v = villageDuPnj(l); if (v) return v; const [id, c] = l.split('.'); return c ? l : LIEUX[id].cotes ? id + '.' + LIEUX[id].cotes[0] : id; };
  function aller(pos) { S.loc = pos; S.screen = LIEUX[lieuActuel()].type === 'village' ? 'village' : 'zone'; }
  function preparer(pos) { const v = villageDe(pos); aller(v); choisirClasses(); acheter(v); equiper(); auberge(v); }

  // zone pas encore explorée à fond : on l'explore (et on y chasse un peu) avant d'y jouer une quête
  function aExplorer(id) {
    const z = S.z[id], L = LIEUX[id]; if (!z) return false;
    return L.tresors.length > z.found.length || z.rnd < L.maxEvenements;
  }
  async function explorerZone(pos) {
    const id = pos.split('.')[0];
    preparer(pos); aller(pos);
    let n = 0;
    while (aExplorer(id) && n++ < 40) {
      if (team().some(h => pvp(h) < .4)) { preparer(pos); aller(pos); }
      await explore(id);
    }
    for (let i = 0; i < 2; i++) { if (team().some(h => pvp(h) < .5)) { preparer(pos); aller(pos); } await fightRandom(id, ''); }
    S.z[id].visits++;
  }

  // ---------- ce que le bot fait ensuite ----------
  const essais = {};
  R.pas = async () => {
    if (S.screen === 'fin') { S.screen = 'village'; R.etapes++; }
    // 1. accepter les quêtes annexes proposées
    for (const a in ANNEXES) if (!annexeEtat(a) && annexeOuverte(a)) {
      const v = villageDuPnj(ANNEXES[a].donneur);
      if (v && lieuOuvert(v) && LIEUX[v].pnj.some(p => p.id === ANNEXES[a].donneur && cond(p.si))) {
        aller(v); await parler(LIEUX[v].pnj.find(p => p.id === ANNEXES[a].donneur && cond(p.si)));
        if (annexeEtat(a)) { note(`offre ${a} acceptée (${etapeCourante() ? etapeCourante().id : 'fin'})`); return true; }
      }
    }
    // 2. une étape de quête annexe jouable, sinon la quête principale
    let quete = null;
    for (const a in ANNEXES) { const x = annexeDispo(a); if (x) { quete = { a, lieu: x.lieu }; break; } }
    const e = etapeCourante();
    if (!quete && e) quete = { e, lieu: e.lieu };
    if (!quete) return false;
    const pos = posDe(quete.lieu), id = pos.split('.')[0];
    const cle = (quete.a ? quete.a + annexeEtat(quete.a) : quete.e.id);
    essais[cle] = (essais[cle] || 0) + 1;
    if (essais[cle] > 6) { note(`bloqué sur ${cle}`); return false; }
    if (LIEUX[id].type === 'zone' && aExplorer(id)) await explorerZone(pos);
    // trop de défaites : on s'entraîne
    if (essais[cle] > 2 && LIEUX[id].type === 'zone') for (let i = 0; i < 6; i++) { preparer(pos); aller(pos); await fightRandom(id, ''); }
    preparer(pos); aller(pos);
    if (LIEUX[id].type === 'village') {
      const p = LIEUX[id].pnj.find(x => x.id === quete.lieu && cond(x.si));
      if (!p) { note(`personnage absent : ${quete.lieu}`); return false; }
      await parler(p);
    } else if (quete.a) await jouerAnnexe(quete.a);
    else await jouerEtape(e);
    return true;
  };
}

(async () => {
  await new Promise(r => serveur.listen(0, r));
  const port = serveur.address().port;
  const nav = await chromium.launch();
  const page = await nav.newPage({ viewport: { width: 420, height: 860 } });
  const erreurs = [];
  page.on('pageerror', e => erreurs.push(String(e.stack || e)));
  page.on('console', m => { if ((m.type() === 'error' || m.type() === 'warning') && !/cloudflareinsights|Failed to load resource|willReadFrequently/.test(m.text())) erreurs.push(m.text()); });
  await page.route(/cloudflareinsights/, r => r.abort());
  await page.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('lanterval-options', JSON.stringify({ lang: 'fr', texte: 'instant', rapide: true })); } catch (e) {} });
  await page.goto(`http://localhost:${port}/index.html`);
  await page.waitForFunction(() => typeof S !== 'undefined' && S && S.screen === 'title' && document.querySelector('#panel button'));
  await page.evaluate(cerveau, GRAINE);
  // nouvelle partie
  await page.click('#panel button');

  // les dialogues : on choisit la première réponse qui n'est pas « Plus tard » ; les fenêtres se ferment
  async function repondre() {
    return page.evaluate(() => {
      const m = document.querySelector('#modal .modal');
      if (m) { const x = m.querySelector('#mclose') || m.querySelector('button'); if (x) { x.click(); return true; } }
      const b = [...document.querySelectorAll('#panel button[data-i]:not([disabled])')];
      const ok = b.find(x => !x.classList.contains('ghost')) || b[0];
      if (ok) { ok.click(); return true; }
      return false;
    });
  }
  const t0 = Date.now();
  let calme = 0;
  while (Date.now() - t0 < 25 * 60 * 1000) {
    const st = await page.evaluate(() => ({ busy, ecran: S.screen, fini: BOT.fini }));
    if (st.busy || st.ecran === 'intro') { if (!(await repondre())) await page.waitForTimeout(5); continue; }
    // écran stable : le bot choisit sa prochaine action (elle se joue dans run(), comme un appui du joueur)
    const lance = await page.evaluate(() => { if (busy) return 'busy'; BOT.dernier = undefined; run(async () => { BOT.dernier = await BOT.pas(); }); return 'ok'; });
    await page.waitForTimeout(5);
    await page.waitForFunction(() => !busy || document.querySelector('#panel button[data-i]:not([disabled]), #modal .modal'), null, { timeout: 60000 }).catch(() => {});
    const r = await page.evaluate(() => BOT.dernier);
    if (r === false && !(await page.evaluate(() => busy))) { if (++calme > 3) break; } else calme = 0;
  }
  const R = await page.evaluate(() => ({ ...BOT, etat: { etapes: S.etapes.length, annexes: S.annexes, niv: team().map(h => `${h.id} ${h.lvl} ${h.job}`), or: S.gold, imp: S.imp, eq: team().map(h => h.eq), perso: persoConnus(), temps: S.st.time } }));
  console.log('Journal du bot :'); for (const l of R.log) console.log('  ' + l);
  console.log('Combats de quête (niveaux, PV les plus bas de l\'équipe) :');
  for (const c of R.combats) console.log(`  ${c.etape || '-'} · ${c.ids}${c.boss ? ' (boss)' : ''} @ ${c.lieu} · niv ${c.niv} · ${c.res} · ${c.tours} tours · PV min ${Math.round(c.min * 100)} %`);
  console.log('État final :', JSON.stringify(R.etat, null, 1));
  if (erreurs.length) { console.log('Erreurs de la page :'); for (const e of [...new Set(erreurs)].slice(0, 30)) console.log('  ' + e); }
  if (process.env.CAPTURES) {
    await page.evaluate(() => { S.loc = 'lanterval'; S.screen = 'village'; renderStable(); });
    await page.screenshot({ path: path.join(process.env.CAPTURES, 'lanterval.png') });
    await page.evaluate(() => { S.loc = 'salvent'; S.screen = 'village'; renderStable(); });
    await page.screenshot({ path: path.join(process.env.CAPTURES, 'salvent.png') });
    await page.evaluate(() => { S.loc = 'forgecendre'; S.screen = 'village'; renderStable(); });
    await page.screenshot({ path: path.join(process.env.CAPTURES, 'forgecendre.png') });
    await page.evaluate(() => openJournal());
    await page.screenshot({ path: path.join(process.env.CAPTURES, 'journal.png') });
  }
  await nav.close(); serveur.close();
  process.exit(erreurs.length ? 1 : 0);
})();
