/* Lanterval · bot de test : joue la partie entière (quête principale et quêtes annexes) dans Chromium,
   pour vérifier que tout s'enchaîne sans erreur et que les boss restent difficiles sans être injustes.
   Usage : node outils/bot.js [graine] [étape] [--presse] [--json=fichier]
     étape : « a1.e10 » s'arrête quand elle est finie ; --json : écrit le rapport complet (outils/equilibrage.js les assemble)
     (Playwright : /opt/node-tools/node_modules/playwright, ou PLAYWRIGHT_MODULE)
   Deux profils de joueur (0.9.0) :
     appliqué (par défaut) : toutes les quêtes annexes, chaque zone explorée à 100 % ; avant un boss, il choisit pour chaque
       héros la classe qui vise le mieux ses faiblesses (Sol reste soigneur) ; Union, fioles, soins des états.
     pressé (--presse) : quête principale seule, zones explorées à moitié, jamais de chasse ; il garde ses classes de départ
       (Guerrier, Mage, Soigneur, Moine) et n'achète ni fioles ni réserve d'objets d'état.
   Dans les deux cas : avant un boss, il chasse (farm en auto) jusqu'à pouvoir payer l'équipement en vente (l'équipement passe
   avant les potions) ; auberge avant chaque quête, et après une défaite il s'entraîne
   (6 combats) avant de réessayer.
   Il ne se déplace pas sur la carte : il se place directement au bon endroit (pas de combats de traversée).
   Rapport : niveaux et PV les plus bas de l'équipe à chaque combat de quête, défaites, erreurs de la page. */
'use strict';
const path = require('path'), http = require('http'), fs = require('fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node-tools/node_modules/playwright');
const RACINE = path.join(__dirname, '..');
const ARGS = process.argv.slice(2).filter(a => !a.startsWith('--')), OPT = process.argv.slice(2).filter(a => a.startsWith('--'));
const GRAINE = +(ARGS[0] || 1), JUSQUA = ARGS[1] || null, PROFIL = OPT.includes('--presse') ? 'presse' : 'applique';
const JSON_SORTIE = (OPT.find(a => a.startsWith('--json=')) || '').slice(7);

// petit serveur de fichiers pour la page
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.m4a': 'audio/mp4' };
const serveur = http.createServer((req, res) => {
  const p = path.join(RACINE, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  if (!p.startsWith(RACINE) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});

// tout ce qui suit s'exécute dans la page
function cerveau([graine, profil]) {
  // hasard reproductible
  let s = graine * 2654435761 % 4294967296; Math.random = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  // les pauses du jeu deviennent presque instantanées
  const st0 = window.setTimeout; window.setTimeout = (f, ms, ...a) => st0(f, Math.min(ms || 0, 2), ...a);
  window.typeIn = () => {};
  const APPLIQUE = profil !== 'presse';
  const R = window.BOT = { profil, log: [], combats: [], etapes: 0, fini: false, objets: {}, achatsEq: {}, voulu: {}, achete: {}, achatsObj: {}, orGagne: {}, classes: {}, entrainement: 0, farm: {}, farmOr: {} };
  const note = m => R.log.push(m);
  const acteDe = () => ((etapeCourante() || {}).id || 'a4').split('.')[0];
  const ajoute = (o, k, n) => { o[k] = (o[k] || 0) + n; };

  // l'or gagné, par acte
  let orAvant = 0;
  const suivreOr = () => { if (S.gold > orAvant) ajoute(R.orGagne, acteDe(), S.gold - orAvant); orAvant = S.gold; };

  // ---------- combat ----------
  const pvp = h => h.hp / mhp(h);
  const origBattle = battle;
  window.battle = async (ids, o) => {
    S.f.tuto = true; suivreOr();
    const c = { ids: ids.join(' '), boss: !!o.boss, quete: !!o.quest, lieu: S.loc, etape: (etapeCourante() || {}).id, acte: acteDe(), niv: team().map(h => h.lvl).join('/'), classes: team().map(h => h.job).join('/'), or: S.gold, min: 1, objets: 0, reprises: 0 };
    const rep0 = S.st.reprises || 0, obj0 = Object.values(R.objets).reduce((a, b) => a + b, 0);
    c.rep0 = rep0;
    // équipement à jour : part des (héros, place) qui portent au moins aussi bien que le meilleur article en vente
    if (o.boss) {
      const vente = []; for (const v in LIEUX) if (LIEUX[v].type === 'village' && lieuOuvert(v)) for (const p of LIEUX[v].pnj) if (p.role === 'boutique' && cond(p.si)) vente.push(...enRayon(p));
      let n = 0, okk = 0;
      for (const h of team()) for (const pl of ['arme', 'armure']) {
        const mieux = vente.filter(k => EQUIPEMENT[k].place === pl && canWear(h, k)).sort((a, b) => score(b, h) - score(a, h))[0];
        if (!mieux) continue; n++; if (h.eq[pl] && score(h.eq[pl], h) >= score(mieux, h) - 1) okk++;
      }
      c.equipe = n ? okk / n : 1;
    }
    if (!R.cur) R.cur = c;
    const moi = R.cur === c;
    try { const r = await origBattle(ids, o); if (moi) c.res = r || 'win'; return r; }
    catch (e) { if (moi) c.res = 'defaite'; throw e; }
    finally {
      if (moi) {
        c.reprises = (S.st.reprises || 0) - rep0; c.objets = Object.values(R.objets).reduce((a, b) => a + b, 0) - obj0;
        if (o.quest || o.boss) R.combats.push(c);
        R.cur = null; suivreOr();
      }
    }
  };
  const elsTech = (h, sk) => sk === 'attaque' ? [elArme(h)] : elsOf(h, TECHNIQUES[sk].el);
  // dégâts attendus d'une option sur un ennemi (le bot connaît les faiblesses : il lit le bestiaire et les conseils)
  function valeur(h, opt, e) {
    const st = hs(h);
    if (opt.fiole) { const it = OBJETS[opt.fiole], w = e.weak.includes(it.el), r = !w && e.res.includes(it.el); return (it.degats * (CLASSES[h.job].objetsPlus || 1)) * (w ? 1.5 : r ? .5 : 1) * (e.broken ? 1.5 : 1) + (w && !e.broken ? e.mhp * .08 : 0); }
    const sk = opt.sk === 'attaque' ? { el: elArme(h), type: 'phys', pow: 1 } : TECHNIQUES[opt.sk];
    const els = elsTech(h, opt.sk);
    if (e.air && !els.includes('V')) return 0;
    const w = els.some(x => e.weak.includes(x)), r = !w && els.some(x => e.res.includes(x));
    let base = sk.mixte ? (st.atk + st.mag) / 2 * sk.pow - e.def * .45 : sk.type !== 'mag' ? st.atk * sk.pow - e.def * .6 : st.mag * sk.pow - e.def * .3;
    base = Math.max(2, base * armure(e, sk)) * (sk.coups || 1) * (h.brulure ? .7 : 1);
    const aff = sk.el && sk.el.length === 1 && sk.el === HEROS[h.id].el && opt.sk !== 'attaque' ? AFFINITE : 1;
    // briser la garde vaut cher : un tour perdu pour le monstre et +50 % de dégâts ensuite
    return base * aff * (w ? 1.5 : r ? .5 : 1) * (e.broken ? 1.5 : 1) + (w && !e.broken ? Math.max(base, e.mhp * (e.shield <= 1 ? .12 : .06)) : 0);
  }
  window.heroCommand = async h => {
    const E = aliveE(), T = aliveH();
    if (R.cur) { R.cur.min = Math.min(R.cur.min, ...team().map(pvp)); R.cur.tours = B.turns; }
    const tech = id => !(h.oubli > 0) && CLASSES[h.job].tech.includes(id) && (h.pp >= TECHNIQUES[id].pp || h.echoLibre);
    const objet = (it, t) => { ajoute(R.objets, it, 1); return { type: 'item', it, t }; };
    const bas = T.filter(x => pvp(x) < .45).sort((a, b) => pvp(a) - pvp(b));
    const malades = T.filter(x => ETATS.some(k => x[k]));
    // soutien
    if (malades.length >= 2 || (malades.length && bas.length >= 2)) for (const sk of ['purification', 'apaisement', 'mixture']) if (tech(sk)) return { type: 'skill', sk };
    if (bas.length >= 2) for (const sk of ['priere', 'soins', 'seve', 'mixture']) if (tech(sk)) return { type: 'skill', sk };
    if (bas.length && tech('soin')) return { type: 'skill', sk: 'soin', t: bas[0] };
    const tresBas = T.filter(x => pvp(x) < .3).sort((a, b) => pvp(a) - pvp(b))[0];
    if (tresBas) for (const it of ['baume', 'potion', 'elixir', 'panacee', 'herbe']) if (S.inv[it] > 0) return objet(it, tresBas);
    // un état qui gêne vraiment : poison sur un héros fragile, brûlure sur un attaquant, torpeur
    for (const m of malades) {
      if (m.torpeur && S.inv.sel > 0) return objet('sel', m);
      if (m.brulure && S.inv.onguent > 0 && (APPLIQUE || B.boss)) return objet('onguent', m);
      if (m.poison && pvp(m) < .7 && S.inv.antidote > 0) return objet('antidote', m);
      if (S.inv.panacee > 0 && pvp(m) < .6) return objet('panacee', m);
    }
    if (h.pp < 4 && Math.random() < .5) for (const it of ['ether', 'tonique']) if (S.inv[it] > 0) return objet(it, h);
    // Union : toute l'équipe frappe (le joueur appliqué s'en sert)
    if (APPLIQUE && B.union >= 3 && T.length >= 2 && (B.boss || E.length >= 2)) return { type: 'union' };
    // la meilleure option offensive
    const opts = [{ sk: 'attaque' }];
    for (const sk of CLASSES[h.job].tech) { const x = TECHNIQUES[sk]; if (tech(sk) && ['phys', 'mag', 'saut'].includes(x.type)) opts.push({ sk }); }
    if (APPLIQUE || B.boss) for (const it of Object.keys(OBJETS)) if (OBJETS[it].el && S.inv[it] > 0) opts.push({ fiole: it });
    let mieux = null;
    for (const o of opts) {
      const x = o.sk && o.sk !== 'attaque' ? TECHNIQUES[o.sk] : null;
      const cibles = x && x.cible === 'tous' ? [E] : E.map(e => [e]);
      for (const c of cibles) {
        let v = c.reduce((a, e) => a + Math.min(valeur(h, o, e), e.hp * 1.3 + (e.weak.length ? 0 : 0)), 0);
        // économie : les PP et les fioles se gardent pour les combats qui comptent
        const cout = o.fiole ? (B.boss ? 2 : 60) : x ? x.pp : 0;
        v -= cout * (B.boss ? .3 : 1.2);
        if (x && x.poids) v /= x.poids;
        if (!mieux || v > mieux.v) mieux = { v, o, t: c.length === 1 ? c[0] : null };
      }
    }
    if (!mieux) return { type: 'garde' };
    if (mieux.o.fiole) return objet(mieux.o.fiole, mieux.t);
    if (mieux.o.sk === 'saut') return { type: 'skill', sk: 'saut', t: mieux.t };
    return { type: 'skill', sk: mieux.o.sk, t: mieux.t || undefined };
  };

  // ---------- préparation ----------
  const physique = (h, job) => { const m = CLASSES[job || h.job].mod; return (m.atk || 1) * HEROS[h.id].base.atk > (m.mag || 1) * HEROS[h.id].base.mag; };
  const score = (id, h) => { const st = EQUIPEMENT[id].st, ph = physique(h); return (st.atk || 0) * (ph ? 1.4 : .4) + (st.mag || 0) * (ph ? .2 : 1.2) + (st.def || 0) * 1.1 + (st.hp || 0) * .25 + (st.pp || 0) * .3 + (st.spd || 0) * .5 + (EQUIPEMENT[id].el && h.id === 'sol' && !ph ? 2 : 0); };
  function equiper() {
    for (const h of team()) for (const pl of PLACES_EQ) { const cur = h.eq[pl]; if (cur && !canWear(h, cur)) { addEq(cur); h.eq[pl] = null; } }
    for (const h of team()) for (const id of Object.keys(S.bag).filter(k => S.bag[k] > 0)) {
      const pl = EQUIPEMENT[id].place, cur = h.eq[pl];
      if (canWear(h, id) && (!cur || score(id, h) > score(cur, h))) { S.bag[id]--; if (cur) addEq(cur); h.eq[pl] = id; clampC(h); }
    }
  }
  // les ennemis des combats d'une quête (pour choisir les classes avant un boss)
  function ennemisDe(q) {
    let ev = [];
    if (q.e) ev = q.e.evenements;
    else { const e = annexeEtape(q.a); ev = e.parmi ? e.parmi[q.m !== undefined ? q.m : annexeDispo(q.a).morceau].evenements : e.evenements; }
    const out = []; for (const x of ev) if (x[0] === 'combat' && !(x[2] && x[2].perdu)) for (const id of x[1].split(' ')) out.push([id, x[2] && x[2].boss ? (MONSTRES[id].boss ? 4 : 1) : 1]);
    return out;
  }
  // valeur d'une classe pour un héros contre ces ennemis : la meilleure technique offensive sur chacun
  function valeurClasse(h, job, ennemis) {
    const st = stats({ ...h, job }); let tot = 0;
    for (const [id, poids] of ennemis) {
      const d = MONSTRES[id]; let best = 0;
      for (const sk of ['attaque', ...CLASSES[job].tech]) {
        const x = sk === 'attaque' ? { el: 'L', type: 'phys', pow: 1 } : TECHNIQUES[sk]; if (!['phys', 'mag', 'saut'].includes(x.type)) continue;
        const els = x.el === 'X' ? [HEROS[h.id].el] : x.el === 'LX' ? ['L', HEROS[h.id].el] : x.el === 'Z' ? [elRegion()] : [x.el];
        const w = els.some(e => d.faible.includes(e)), r = !w && els.some(e => d.resiste.includes(e));
        const arm = (d.carapace && x.type !== 'mag' && !x.mixte) || (d.voile && (x.type === 'mag' || x.mixte)) ? .6 : 1;
        const v = (x.type === 'mag' ? st.mag : x.mixte ? (st.atk + st.mag) / 2 : st.atk) * (x.pow || 1) * (x.coups || 1) * (x.cible === 'tous' ? 1.3 : 1) * arm * (w ? 1.8 : r ? .5 : 1) * (x.el && x.el.length === 1 && x.el === HEROS[h.id].el ? AFFINITE : 1);
        best = Math.max(best, v);
      }
      tot += best * poids;
    }
    return tot + st.hp * .05 + st.def * .3;
  }
  const SOIGNEURS = ['sage', 'soigneur'];
  function choisirClasses(ennemis, adapte) {
    const defaut = { kael: ['guerrier', 'apprenti'], mira: ['mage'], sol: ['soigneur'], nev: ['moine'] };
    for (const h of team()) {
      let j;
      if (!(APPLIQUE || adapte) || !ennemis || !ennemis.length) j = h.job !== 'apprenti' && S.jobs.includes(h.job) ? h.job : defaut[h.id].find(x => S.jobs.includes(x));
      else if (h.id === 'sol') j = SOIGNEURS.find(x => S.jobs.includes(x));
      else j = S.jobs.filter(x => !SOIGNEURS.includes(x) && !CLASSES[x].invite).sort((a, b) => valeurClasse(h, b, ennemis) - valeurClasse(h, a, ennemis))[0];
      if (j && h.job !== j) { h.job = j; equiper(); clampC(h); ajoute(R.classes, j, 1); }
    }
  }
  function acheter(vid, prochains) {
    const ac = acteDe();
    for (const p of LIEUX[vid].pnj.filter(p => p.role === 'boutique' && cond(p.si))) {
      let epargne = false;
      for (const k of enRayon(p)) for (const h of team()) {
        const e = EQUIPEMENT[k], cur = h.eq[e.place];
        if (!canWear(h, k) || (cur && score(k, h) <= score(cur, h) + 1)) continue;
        // part de l'équipement voulu (une amélioration pour ce héros) qu'il a pu payer
        const cle = k + ':' + h.id; if (!R.voulu[cle]) R.voulu[cle] = e.prix;
        if (S.gold >= e.prix + 30) { S.gold -= e.prix; ajoute(R.achatsEq, ac, e.prix); R.achete[cle] = e.prix; addEq(k); equiper(); }
        else epargne = true;
      }
      // fioles : deux (et un flacon) de chaque élément qui vise une faiblesse du prochain boss, une fois l'équipement payé
      const visees = new Set((prochains || []).filter(([id, p]) => p > 1).flatMap(([id]) => MONSTRES[id].faible));
      const veut = k => OBJETS[k].hp ? (epargne ? 2 : 6) : OBJETS[k].pp ? (epargne ? 1 : 4) : OBJETS[k].soigne ? (APPLIQUE ? 3 : 1) : OBJETS[k].el && visees.has(OBJETS[k].el) && !epargne ? (OBJETS[k].degats > 100 ? (APPLIQUE ? 1 : 0) : APPLIQUE ? 2 : 1) : 0;
      for (const [k, prix] of p.objets) while ((S.inv[k] || 0) < veut(k) && S.gold >= prix + 40) { S.gold -= prix; ajoute(R.achatsObj, ac, prix); addItem(k, 1); }
    }
    orAvant = S.gold;
  }
  function auberge(vid) {
    const a = LIEUX[vid].pnj.find(p => p.role === 'auberge'); if (a && S.gold >= a.prix) { S.gold -= a.prix; ajoute(R.achatsObj, acteDe(), a.prix); }
    healAll(); restorePP(); orAvant = S.gold;
  }
  // village le plus proche d'une position (la région du lieu)
  const villageDe = pos => { const reg = regionDe(pos); return Object.keys(LIEUX).find(k => LIEUX[k].type === 'village' && lieuVisible(k) && regionsDu(k).includes(reg)) || 'lanterval'; };
  const posDe = l => { const v = villageDuPnj(l); if (v) return v; const [id, c] = l.split('.'); return c ? l : LIEUX[id].cotes ? id + '.' + LIEUX[id].cotes[0] : id; };
  function aller(pos) { suivreOr(); S.loc = pos; S.screen = LIEUX[lieuActuel()].type === 'village' ? 'village' : 'zone'; }
  function preparer(pos, ennemis, adapte) { suivreOr(); const v = villageDe(pos); aller(v); choisirClasses(ennemis, adapte); acheter(v, ennemis); equiper(); auberge(v); }

  // zone pas encore explorée : le joueur appliqué l'explore à fond (et chasse un peu), le pressé jusqu'à la moitié
  function aExplorer(id) {
    const z = S.z[id], L = LIEUX[id]; if (!z) return false;
    if (!APPLIQUE) return z.found.length < L.tresors.length / 2;
    return tresorsDispos(id).some(f => !z.found.includes(f.id)) || z.rnd < L.maxEvenements;
  }
  async function explorerZone(pos) {
    const id = pos.split('.')[0];
    preparer(pos); aller(pos);
    let n = 0;
    while (aExplorer(id) && n++ < 40) {
      if (team().some(h => pvp(h) < .4)) { preparer(pos); aller(pos); }
      await explore(id);
    }
    if (APPLIQUE) for (let i = 0; i < 2; i++) { if (team().some(h => pvp(h) < .5)) { preparer(pos); aller(pos); } await fightRandom(id, ''); }
    S.z[id].visits++;
  }

  // ---------- farm avant un boss (0.9.0) ----------
  // Un vrai joueur met son équipement à jour avant un boss : il chasse (en mode auto) jusqu'à pouvoir payer les améliorations
  // en vente pour chaque héros (arme, armure), puis revient au village. Durée estimée : FARM_S secondes par combat auto.
  const FARM_S = 25, FARM_MAX = 40;
  // ce que coûtent les améliorations en vente au village où le joueur se prépare (il n'achète que là)
  function ameliorations(v) {
    let cout = 0; const vu = new Set();
    for (const p of LIEUX[v].pnj) if (p.role === 'boutique' && cond(p.si))
      for (const h of team()) for (const pl of ['arme', 'armure']) {
        const mieux = enRayon(p).filter(k => EQUIPEMENT[k].place === pl && canWear(h, k)).sort((a, b) => score(b, h) - score(a, h))[0];
        if (!mieux || (h.eq[pl] && score(mieux, h) <= score(h.eq[pl], h) + 1) || vu.has(h.id + pl)) continue;
        vu.add(h.id + pl); cout += EQUIPEMENT[mieux].prix;
      }
    return cout;
  }
  function zoneDeFarm(pos) {
    const id = pos.split('.')[0]; if (LIEUX[id].type === 'zone' && LIEUX[id].groupes) return pos;
    const reg = regionDe(pos), z = Object.keys(LIEUX).filter(k => LIEUX[k].type === 'zone' && LIEUX[k].groupes && lieuOuvert(k) && regionsDu(k).includes(reg) && !LIEUX[k].nonRetour);
    const k = z[z.length - 1]; return k ? (LIEUX[k].cotes ? k + '.' + LIEUX[k].cotes[0] : k) : null;
  }
  async function farmer(pos, ennemis) {
    if (!ennemis.some(([, p]) => p > 1)) return;
    const zf = zoneDeFarm(pos); if (!zf) return;
    const ac = acteDe(), v = villageDe(pos); let n = 0;
    preparer(pos);
    while (n < FARM_MAX) {
      const besoin = ameliorations(v); if (!besoin || S.gold >= besoin + 30) break;
      // l'auberge seulement quand l'équipe est entamée ; l'or du farm va à l'équipement
      if (team().some(h => pvp(h) < .5)) preparer(pos);
      aller(zf); const or0 = S.gold;
      await fightRandom(zf.split('.')[0], ''); n++;
      ajoute(R.farm, ac, 1); ajoute(R.farmOr, ac, Math.max(0, S.gold - or0));
      if (n % 5 === 0) { aller(v); acheter(v, ennemis); equiper(); }
    }
    if (n) note(`farm ${n} combats avant ${ennemis.find(([, p]) => p > 1)[0]} (${ac})`);
  }

  // ---------- ce que le bot fait ensuite ----------
  const essais = {};
  R.pas = async () => {
    suivreOr();
    // la fin vue : retour à Aerie avant l'Escalier, comme le bouton de l'écran de fin
    if (S.screen === 'fin') { retourAvantFinal(); R.etapes++; note('fin du jeu vue'); }
    // 1. accepter les quêtes annexes proposées (le joueur pressé n'en fait aucune)
    if (APPLIQUE) for (const a in ANNEXES) if (!annexeEtat(a) && annexeOuverte(a)) {
      const v = villageDuPnj(ANNEXES[a].donneur);
      if (v && lieuOuvert(v) && LIEUX[v].pnj.some(p => p.id === ANNEXES[a].donneur && cond(p.si))) {
        aller(v); await parler(LIEUX[v].pnj.find(p => p.id === ANNEXES[a].donneur && cond(p.si)));
        if (annexeEtat(a)) { note(`offre ${a} acceptée (${etapeCourante() ? etapeCourante().id : 'fin'})`); return true; }
      }
    }
    // 2. une étape de quête annexe jouable, sinon la quête principale
    let quete = null;
    if (APPLIQUE) for (const [a, x] of annexesDispos()) { quete = { a, lieu: x.lieu, m: x.morceau }; break; }
    const e = etapeCourante();
    // après la fin, le bot ne rejoue pas le final : il s'arrête quand il n'a plus de quête annexe
    if (!quete && e && !S.finVue) quete = { e, lieu: e.lieu };
    if (!quete) return false;
    const pos = posDe(quete.lieu), id = pos.split('.')[0], ennemis = ennemisDe(quete);
    const cle = (quete.a ? quete.a + annexeEtat(quete.a) + (quete.m !== undefined ? '.' + quete.m : '') : quete.e.id);
    essais[cle] = (essais[cle] || 0) + 1;
    if (essais[cle] > 6) { note(`bloqué sur ${cle}`); return false; }
    if (essais[cle] > 1) note(`nouvel essai ${essais[cle]} sur ${cle}`);
    if (LIEUX[id].type === 'zone' && aExplorer(id)) await explorerZone(pos);
    // trop de défaites : on s'entraîne (la porte de sortie du joueur bloqué)
    if (essais[cle] > 1 && LIEUX[id].type === 'zone') for (let i = 0; i < 6; i++) { preparer(pos); aller(pos); await fightRandom(id, ''); R.entrainement++; }
    await farmer(pos, ennemis);
    preparer(pos, ennemis, essais[cle] > 1); aller(pos);
    if (LIEUX[id].type === 'village') {
      const p = LIEUX[id].pnj.find(x => x.id === quete.lieu && cond(x.si));
      if (!p) { note(`personnage absent : ${quete.lieu}`); return false; }
      await parler(p);
    } else if (quete.a) await jouerAnnexe(quete.a, false, quete.m);
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
  await page.waitForFunction(() => typeof S !== 'undefined' && S && S.screen === 'title');
  // écran d'accueil passé : l'écran titre et ses boutons
  await page.evaluate(() => { accueilVu = true; renderTitle(); });
  await page.waitForFunction(() => document.querySelector('#accueil button'));
  await page.evaluate(cerveau, [GRAINE, PROFIL]);
  // nouvelle partie
  await page.click('#accueil button');

  // les dialogues : on choisit la première réponse qui n'est pas « Plus tard » ; les fenêtres se ferment
  async function repondre() {
    return page.evaluate(() => {
      const m = document.querySelector('#modal .modal');
      if (m) { const x = m.querySelector('#mclose') || m.querySelector('button'); if (x) { x.click(); return true; } }
      const b = [...document.querySelectorAll('#panel button[data-i]:not([disabled])')];
      // boss perdu : deux reprises au plus, puis on se replie (entraînement, autres classes)
      const repli = b.find(x => x.textContent.includes(t('combat.abandonner')));
      if (repli && BOT.cur && (S.st.reprises || 0) - BOT.cur.rep0 >= 2) { repli.click(); return true; }
      const ok = b.find(x => !x.classList.contains('ghost')) || b[0];
      if (ok) { ok.click(); return true; }
      return false;
    });
  }
  const t0 = Date.now();
  let calme = 0;
  while (Date.now() - t0 < 45 * 60 * 1000) {
    const st = await page.evaluate(() => ({ busy, ecran: S.screen, fini: BOT.fini }));
    if (JUSQUA && !st.busy && await page.evaluate(e => fini(e), JUSQUA)) break;
    if (st.busy || st.ecran === 'intro') { if (!(await repondre())) await page.waitForTimeout(5); continue; }
    // écran stable : le bot choisit sa prochaine action (elle se joue dans run(), comme un appui du joueur)
    const lance = await page.evaluate(() => { if (busy) return 'busy'; BOT.dernier = undefined; run(async () => { BOT.dernier = await BOT.pas(); }); return 'ok'; });
    await page.waitForTimeout(5);
    await page.waitForFunction(() => !busy || document.querySelector('#panel button[data-i]:not([disabled]), #modal .modal'), null, { timeout: 60000 }).catch(() => {});
    const r = await page.evaluate(() => BOT.dernier);
    if (r === false && !(await page.evaluate(() => busy))) { if (++calme > 3) break; } else calme = 0;
  }
  const R = await page.evaluate(() => { const { pas, cur, ...r } = BOT; return { ...r, etat: { etapes: S.etapes.length, annexes: S.annexes, niv: team().map(h => `${h.id} ${h.lvl} ${h.job}`), or: S.gold, eq: team().map(h => h.eq), reprises: S.st.reprises || 0, defaites: S.st.log.filter(l => l[1] === 'journal.log.defaite').length, temps: S.st.time } }; });
  console.log(`Profil ${PROFIL}, graine ${GRAINE}`);
  console.log('Journal du bot :'); for (const l of R.log) console.log('  ' + l);
  console.log('Combats de quête (niveaux, classes, PV les plus bas de l\'équipe, objets, reprises) :');
  for (const c of R.combats) console.log(`  ${c.etape || '-'} · ${c.ids}${c.boss ? ' (boss)' : ''} @ ${c.lieu} · niv ${c.niv} · ${c.classes} · ${c.res} · ${c.tours} tours · PV min ${Math.round(c.min * 100)} %${c.objets ? ' · ' + c.objets + ' objets' : ''}${c.reprises ? ' · ' + c.reprises + ' reprise(s)' : ''}`);
  console.log('Or gagné par acte :', JSON.stringify(R.orGagne), '· équipement acheté :', JSON.stringify(R.achatsEq), '· objets et auberge :', JSON.stringify(R.achatsObj));
  console.log('Farm avant les boss (combats par acte) :', JSON.stringify(R.farm), '· or gagné en farm :', JSON.stringify(R.farmOr));
  console.log('Objets utilisés :', JSON.stringify(R.objets), '· classes prises :', JSON.stringify(R.classes), '· combats d\'entraînement :', R.entrainement);
  console.log('État final :', JSON.stringify(R.etat));
  if (JSON_SORTIE) fs.writeFileSync(JSON_SORTIE, JSON.stringify({ graine: GRAINE, profil: PROFIL, erreurs, ...R }));
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
