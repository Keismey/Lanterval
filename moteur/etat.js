/* Lanterval · la partie en cours : état, sauvegarde, options, progression, partie+. */

const CLE = 'lanterval-v1';             // sauvegarde de la partie (lue par le hub)
const CLE_SECOURS = CLE + '.bak';       // copie de secours, refaite à chaque passage au village
const CLE_OPTIONS = 'lanterval-options';
const FORMAT = 1;                       // numéro de format de la sauvegarde (voir migrer)

let S = null;      // la partie
let B = null;      // le combat en cours
let busy = false;  // une séquence (dialogue, combat, trajet) est en cours

/* ---------- Options (gardées même si la partie est effacée) ---------- */
const OPT = { lang: null, texte: 'normal', rapide: false, notes: '' };
function chargerOptions() { try { Object.assign(OPT, JSON.parse(localStorage.getItem(CLE_OPTIONS) || '{}')); } catch (e) {} }
function sauverOptions() { try { localStorage.setItem(CLE_OPTIONS, JSON.stringify(OPT)); } catch (e) {} }

/* ---------- Nouvelle partie ---------- */
function mkZ() { return { found: [], rnd: 0, streak: 0, visits: 0, m50: false, m100: false, rest: false }; }
function mkC(id) { const h = HEROS[id]; const c = { id, lvl: 1, xp: 0, hp: 0, pp: 0, job: h.classe, eq: { arme: h.arme, armure: 'tunique', acc: null }, joined: false }; fullC(c); return c; }
function newState() {
  const s = { v: FORMAT, version: VERSION, gold: 40, inv: { herbe: 3, tonique: 1 }, bag: {}, imp: [],
    etapes: [], annexes: {}, f: {}, jobs: ['apprenti'], chars: {}, z: {}, loc: 'lanterval', screen: 'title',
    best: {}, codex: {}, vus: {}, auto: false, msg: '', plus: 0, fins: 0, auberge: 'lanterval', perso: {},
    st: { time: 0, fights: 0, qfights: 0, explores: 0, trav: 0, taps: 0, autoTurns: 0, log: [] } };
  for (const id of ORDRE_HEROS) s.chars[id] = mkC(id);
  for (const id in LIEUX) if (LIEUX[id].type === 'zone' && LIEUX[id].tresors) s.z[id] = mkZ();
  s.chars.kael.joined = true;
  return s;
}

/* ---------- Sauvegarde ---------- */
function save() { try { localStorage.setItem(CLE, JSON.stringify(S)); } catch (e) {} }
function saveSecours() { try { localStorage.setItem(CLE_SECOURS, JSON.stringify(S)); } catch (e) {} }
function lire(cle) { try { const s = JSON.parse(localStorage.getItem(cle) || 'null'); return s && s.v ? s : null; } catch (e) { return null; } }
function loadSave() { const s = lire(CLE) || lire(CLE_SECOURS); return s ? migrer(s) : null; }
// Met une ancienne sauvegarde au format actuel. Chaque nouveau format ajoute son étape ici.
function migrer(s) {
  if (s.v > FORMAT) return s;
  for (const id in LIEUX) if (LIEUX[id].type === 'zone' && LIEUX[id].tresors && !s.z[id]) s.z[id] = mkZ();
  for (const id of ORDRE_HEROS) if (!s.chars[id]) s.chars[id] = mkC(id);
  if (!s.vus) s.vus = {};
  if (!s.auberge) s.auberge = 'lanterval';
  if (!s.perso) s.perso = {};
  s.v = FORMAT; s.version = VERSION;
  return s;
}
function effacerPartie() { try { localStorage.removeItem(CLE); localStorage.removeItem(CLE_SECOURS); } catch (e) {} }

/* ---------- Partie+ : on garde classes, niveaux, équipement et codex ---------- */
function partiePlus() {
  const old = S, s = newState();
  s.plus = (old.plus || 0) + 1; s.fins = old.fins || 0;
  s.jobs = [...old.jobs]; s.best = old.best; s.codex = old.codex; s.bag = old.bag; s.vus = old.vus || {};
  for (const id of ORDRE_HEROS) { const o = old.chars[id], c = s.chars[id]; c.lvl = o.lvl; c.xp = o.xp; c.job = o.job; c.eq = { ...o.eq }; fullC(c); }
  S = s; return s;
}
// les monstres sont plus forts en partie+
function forcePlus() { return 1 + .35 * (S.plus || 0); }

/* ---------- Équipe et statistiques ---------- */
const STATS = ['hp', 'pp', 'atk', 'mag', 'def', 'spd'];
const PLACES_EQ = ['arme', 'armure', 'acc'];
function team() { return ORDRE_HEROS.map(k => S.chars[k]).filter(c => c.joined); }
const char = id => S.chars[id];
function stats(h) {
  const c = HEROS[h.id], j = CLASSES[h.job].mod, l = h.lvl - 1, o = {};
  for (const k of STATS) o[k] = Math.round((c.base[k] + c.gain[k] * l) * (j[k] || 1));
  for (const sl of PLACES_EQ) { const e = h.eq[sl] && EQUIPEMENT[h.eq[sl]]; if (e) for (const k in e.st) o[k] += e.st[k]; }
  for (const k of STATS) o[k] = Math.max(1, o[k]);
  return o;
}
const mhp = h => stats(h).hp, mpp = h => stats(h).pp;
function clampC(h) { const s = stats(h); h.hp = Math.min(h.hp, s.hp); h.pp = Math.min(h.pp, s.pp); }
function fullC(h) { const s = stats(h); h.hp = s.hp; h.pp = s.pp; }
function join(id) { const h = char(id); h.lvl = Math.max(h.lvl, char('kael').lvl); h.joined = true; fullC(h); }
function canWear(h, id, job) { const e = EQUIPEMENT[id], j = job || h.job; if (e.place === 'arme') return CLASSES[j].armes.includes(e.type); if (e.classes) return e.classes.includes(j); return true; }
function healAll(n) { for (const h of team()) { if (n === undefined) fullC(h); else if (h.hp > 0) h.hp = Math.min(mhp(h), h.hp + n); } }
function restorePP(n) { for (const h of team()) h.pp = n === undefined ? mpp(h) : Math.min(mpp(h), h.pp + n); }
function hurt(id, n) { const h = char(id); h.hp = Math.max(1, h.hp - n); }
function hurtAll(n) { for (const h of team()) if (h.hp > 0) h.hp = Math.max(1, h.hp - n); }
function need(l) { return 20 + 15 * l; }

/* ---------- Sac, codex, journal ---------- */
function logR(cle, v) { S.st.log.push([S.st.time, cle, v || null]); }
function addItem(k, n) { S.inv[k] = (S.inv[k] || 0) + n; }
function addEq(k) { S.bag[k] = (S.bag[k] || 0) + 1; }
function eqVal(k) { const e = EQUIPEMENT[k]; return e.cadeau ? 0 : e.v || Math.floor((e.prix || 0) / 2); }
function itemCount() { return Object.keys(OBJETS).reduce((a, k) => a + (S.inv[k] || 0), 0); }
function best(id) { return S.best[id] || (S.best[id] = { weak: [], res: [] }); }
function seen(id) { S.codex[id] = S.codex[id] || { kills: 0 }; }
function revealAll(id) { const b = best(id); b.weak = [...MONSTRES[id].faible]; b.res = [...MONSTRES[id].resiste]; seen(id); }
function reveal(id, el, res) { const b = best(id), a = res ? b.res : b.weak; if (!a.includes(el)) a.push(el); }
function unlockJob(j) { if (!S.jobs.includes(j)) S.jobs.push(j); }
function pct(id) { return Math.round(S.z[id].found.length / LIEUX[id].tresors.length * 100); }

/* ---------- Gains et effets écrits dans les données ---------- */
// « 100 or, medaillon, 2 tonique, insigne »
function gagner(spec) {
  for (const brut of String(spec).split(',')) {
    const m = /^\s*(\d+)?\s*([\w-]+)\s*$/.exec(brut); if (!m) continue;
    const n = m[1] ? +m[1] : 1, id = m[2];
    if (id === 'or') S.gold += n;
    else if (OBJETS[id]) addItem(id, n);
    else if (EQUIPEMENT[id]) for (let i = 0; i < n; i++) addEq(id);
    else if (IMPORTANTS[id]) { if (!S.imp.includes(id)) S.imp.push(id); }
    else console.warn('Gain inconnu :', id);
  }
}
function perdre(spec) { for (const id of String(spec).split(',').map(x => x.trim())) S.imp = S.imp.filter(k => k !== id); }
// « soin », « soin 12 », « pp », « pp 5 », « degats kael 8 », « degats tous 6 »
function appliquerEffet(spec) {
  const [quoi, a, b] = String(spec).trim().split(/\s+/);
  if (quoi === 'soin') healAll(a ? +a : undefined);
  else if (quoi === 'pp') restorePP(a ? +a : undefined);
  else if (quoi === 'degats') { if (a === 'tous') hurtAll(+b); else if (char(a).joined) hurt(a, +b); }
  else console.warn('Effet inconnu :', spec);
}

/* ---------- Progression ---------- */
function toutesEtapes() { return ACTES.flatMap(a => a.etapes); }
function fini(id) { return S.etapes.includes(id); }
// première étape de la quête principale qui n'est pas terminée (null quand tout est fini)
function etapeCourante() { return toutesEtapes().find(e => !fini(e.id)) || null; }
function acteDe(etape) { return ACTES.find(a => a.etapes.includes(etape)); }

// « fini a1.e3 et pas fini a1.e7 et annexe loup 2 »
function cond(c) {
  if (c === undefined || c === true) return true;
  if (c === false) return false;
  return String(c).split(/\s+et\s+/).every(p => {
    const m = p.trim().split(/\s+/), non = m[0] === 'pas'; if (non) m.shift();
    let ok;
    if (m[0] === 'fini') ok = fini(m[1]);
    else if (m[0] === 'annexe') ok = (S.annexes[m[1]] || 0) >= +(m[2] || 1);
    else if (m[0] === 'drapeau') ok = !!S.f[m[1]];
    else { console.warn('Condition inconnue :', p); ok = false; }
    return non ? !ok : ok;
  });
}
function etatLieu(id) { const L = LIEUX[id]; let e = null; for (const x of L.etats || []) if (cond(x.si)) e = x.id; return e; }
function lieuVisible(id) { return cond(LIEUX[id].visible); }
function lieuOuvert(id) { return lieuVisible(id) && cond(LIEUX[id].ouvert); }

// Quêtes annexes : 0 = pas commencée, 1 à n = étape en cours, n + 1 = terminée
// Personnages du Codex : une info apparaît quand sa condition est vraie ; S.perso[id] = nombre d'infos déjà lues
function infosPerso(id) { return PERSONNAGES[id].map((c, i) => [c, i]).filter(([c]) => cond(c)).map(([, i]) => i); }
function persoConnus() { return Object.keys(PERSONNAGES).filter(id => cond(PERSONNAGES[id][0])); }
function persoNouveau(id) { return infosPerso(id).length > (S.perso[id] || 0); }
function persoNouveautes() { return persoConnus().some(persoNouveau); }

function annexeEtat(id) { return S.annexes[id] || 0; }
function annexeOuverte(id) { return cond(ANNEXES[id].ouvre); }
function annexeFinie(id) { return annexeEtat(id) > ANNEXES[id].etapes.length; }
function annexeEtape(id) { const n = annexeEtat(id); return n >= 1 && !annexeFinie(id) ? ANNEXES[id].etapes[n - 1] : null; }
// l'étape en cours, seulement si elle peut se jouer maintenant (lieu ouvert, condition si remplie) : sinon pas de « ! »
function annexeDispo(id) {
  const x = annexeEtape(id); if (!x) return null;
  if (x.si && !cond(x.si)) return null;
  const l = villageDuPnj(x.lieu) || x.lieu.split('.')[0];
  return lieuOuvert(l) ? x : null;
}

// où se trouve l'équipe : « lanterval » (village) ou « foret.v » (une zone et son côté)
function lieuActuel() { return S.loc.split('.')[0]; }
function coteActuel() { return S.loc.split('.')[1] || null; }
// un lieu d'étape (« foret », « grotte.f », « orvan ») correspond-il à la position ?
function estIci(lieu) { return lieu === S.loc || lieu === lieuActuel(); }
// un personnage peut changer de village selon l'avancée (Roxane, Fennel) : on prend celui où il est en ce moment
function villageDuPnj(pnj) {
  const avec = Object.keys(LIEUX).filter(k => LIEUX[k].type === 'village' && LIEUX[k].pnj.some(p => p.id === pnj));
  return avec.find(k => lieuVisible(k) && LIEUX[k].pnj.some(p => p.id === pnj && cond(p.si))) || avec[0] || null;
}

// Régions : chaque région a sa carte (vallee, cote…). Une zone à deux côtés peut être à cheval sur deux régions.
function regionsDu(id) { const r = LIEUX[id].region; return !r ? ['vallee'] : typeof r === 'string' ? [r] : [...new Set(Object.values(r))]; }
function regionDe(pos) {
  const [id, c] = pos.split('.'), r = LIEUX[id].region;
  return !r ? 'vallee' : typeof r === 'string' ? r : r[c] || Object.values(r)[0];
}
