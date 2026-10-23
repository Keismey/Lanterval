/* Lanterval · vérification des données et des textes, avant chaque publication.
   Usage : node outils/verifier.js
   Signale : textes manquants (FR et EN), monstres, objets ou images inconnus, bulles trop longues,
   noms de personnages mal écrits, identifiants en double. Ne modifie rien. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const RACINE = path.join(__dirname, '..');
const lire = f => fs.readFileSync(path.join(RACINE, f), 'utf8');

// charge les données comme le fait la page (scripts classiques qui partagent leurs variables)
const ctx = { console };
vm.createContext(ctx);
vm.runInContext('const ACTES = [];', ctx);
for (const f of ['heros', 'objets', 'monstres', 'monde', 'images', 'acte1', 'acte2', 'annexes', 'personnages']) vm.runInContext(lire(`donnees/${f}.js`), ctx, { filename: f });
const D = vm.runInContext('({ ACTES, ANNEXES, LIEUX, LIENS, IMAGES, MONSTRES, OBJETS, EQUIPEMENT, IMPORTANTS, HEROS, CLASSES, TECHNIQUES, PERSONNAGES })', ctx);

// textes
const FICHIERS = ['interface', 'noms', 'lieux', 'acte1', 'acte2', 'annexes', 'personnages'];
const TXT = {};
for (const lg of ['fr', 'en']) {
  TXT[lg] = {};
  for (const f of FICHIERS) {
    const p = `textes/${lg}/${f}.txt`;
    if (!fs.existsSync(path.join(RACINE, p))) continue;
    let cle = null;
    for (const brut of lire(p).split(/\r?\n/)) {
      const l = brut.trim();
      if (!l || l.startsWith('#') && !l.startsWith('##')) continue;
      const m = /^==\s*(\S+)\s*$/.exec(l);
      if (m) { if (TXT[lg][m[1]]) erreur(`${p} : repère en double « ${m[1]} »`); cle = m[1]; TXT[lg][cle] = { f: p, l: [] }; continue; }
      if (cle) TXT[lg][cle].l.push(l);
    }
  }
}

const erreurs = [], avertissements = [];
function erreur(m) { erreurs.push(m); }
function averti(m) { avertissements.push(m); }
function texte(cle, ou) { if (!TXT.fr[cle]) erreur(`texte manquant « ${cle} » (${ou})`); }
function monstre(id, ou) { if (!D.MONSTRES[id]) erreur(`monstre inconnu « ${id} » (${ou})`); }
function gain(spec, ou) {
  for (const brut of String(spec).split(',')) {
    const m = /^\s*(\d+)?\s*([\w-]+)\s*$/.exec(brut); if (!m) { erreur(`gain illisible « ${brut} » (${ou})`); continue; }
    const id = m[2];
    if (id !== 'or' && !D.OBJETS[id] && !D.EQUIPEMENT[id] && !D.IMPORTANTS[id]) erreur(`gain inconnu « ${id} » (${ou})`);
  }
}
function effet(spec, ou) { if (!/^(soin|pp)( \d+)?$|^degats (tous|kael|mira|sol) \d+$/.test(spec)) erreur(`effet illisible « ${spec} » (${ou})`); }
function condition(c, ou) {
  if (c === undefined || c === true || c === false) return;
  for (const p of String(c).split(/\s+et\s+/)) {
    const m = p.trim().split(/\s+/); if (m[0] === 'pas') m.shift();
    if (m[0] === 'fini') { if (!etapes.has(m[1])) erreur(`condition : étape inconnue « ${m[1]} » (${ou})`); }
    else if (m[0] === 'annexe') { if (!D.ANNEXES[m[1]]) erreur(`condition : quête annexe inconnue « ${m[1]} » (${ou})`); }
    else if (m[0] !== 'drapeau') erreur(`condition illisible « ${p} » (${ou})`);
  }
}
function lieu(l, ou) {
  const [id, cote] = l.split('.');
  const pnj = Object.values(D.LIEUX).some(L => L.pnj && L.pnj.some(p => p.id === l));
  if (pnj) return;
  if (!D.LIEUX[id]) return erreur(`lieu inconnu « ${l} » (${ou})`);
  if (cote && !(D.LIEUX[id].cotes || []).includes(cote)) erreur(`côté inconnu « ${l} » (${ou})`);
}

// étapes
const etapes = new Set();
for (const a of D.ACTES) for (const e of a.etapes) { if (etapes.has(e.id)) erreur(`étape en double « ${e.id} »`); etapes.add(e.id); }

function evenements(evts, ou) {
  for (const [type, a, b] of evts) {
    const o = `${ou}, ${type}`;
    if (type === 'dialogue' || type === 'message') texte(a, o);
    else if (type === 'panorama') { if (!D.IMAGES[a]) erreur(`image inconnue « ${a} » (${o})`); }
    else if (type === 'combat') { a.split(/\s+/).forEach(id => monstre(id, o)); if (a.split(/\s+/).length > 3) erreur(`plus de 3 monstres (${o})`); if (b && b.conseil) texte(b.conseil, o); if (b && b.equipe) b.equipe.split(/\s+/).forEach(h => { if (!D.HEROS[h]) erreur(`héros inconnu « ${h} » (${o})`); }); }
    else if (type === 'rejoint' || type === 'presente') { if (!D.HEROS[a]) erreur(`héros inconnu « ${a} » (${o})`); }
    else if (type === 'gagne') gain(a, o);
    else if (type === 'perd') a.split(',').forEach(x => { if (!D.IMPORTANTS[x.trim()]) erreur(`objet important inconnu « ${x} » (${o})`); });
    else if (type === 'classes') a.split(/\s+/).forEach(j => { if (!D.CLASSES[j]) erreur(`classe inconnue « ${j} » (${o})`); });
    else if (type === 'degats') effet('degats ' + a, o);
    else if (type === 'revele') monstre(a.split(/\s+/)[0], o);
    else if (type === 'position') lieu(a, o);
    else if (type === 'traversee') { lieu(a, o); if (b && b.milieu) evenements(b.milieu, o + ' (milieu)'); }
    else if (type === 'choix') {
      texte(a, o);
      const ids = (TXT.fr[a] ? TXT.fr[a].l : []).map(l => /^>\s*([\w-]+)\s*:/.exec(l)).filter(Boolean).map(m => m[1]);
      for (const k in b) { if (!ids.includes(k)) erreur(`choix « ${k} » absent du texte ${a} (${o})`); evenements(b[k], `${o} → ${k}`); }
      for (const k of ids) if (!b[k]) erreur(`réponse « ${k} » sans suite (${o})`);
    }
    else if (!['decor', 'soin', 'stop', 'fin_version'].includes(type)) erreur(`événement inconnu « ${type} » (${ou})`);
  }
}
for (const a of D.ACTES) {
  texte(a.id + '.titre', a.id);
  evenements(a.ouverture, a.id + ' ouverture');
  for (const e of a.etapes) { texte(e.id + '.titre', e.id); lieu(e.lieu, e.id); evenements(e.evenements, e.id); }
}
for (const id in D.ANNEXES) {
  const A = D.ANNEXES[id];
  texte(id + '.titre', id); condition(A.ouvre, id);
  evenements(A.offre, id + ' offre');
  A.etapes.forEach((e, i) => { texte(`${id}.e${i + 1}.titre`, id); lieu(e.lieu, `${id}.e${i + 1}`); condition(e.si, `${id}.e${i + 1}`); evenements(e.evenements, `${id}.e${i + 1}`); });
}

// personnages du Codex : nom, visage, une info par condition
for (const id in D.PERSONNAGES) {
  texte('parle.' + id, 'personnages');
  if (!D.IMAGES['heros.' + id] && !D.IMAGES['pnj.' + id]) erreur(`personnage sans image « ${id} » (heros.${id} ou pnj.${id})`);
  D.PERSONNAGES[id].forEach((c, i) => { condition(c, 'perso.' + id); texte(`perso.${id}.${i + 1}`, 'personnages'); });
}

// monde
for (const id in D.LIEUX) {
  const L = D.LIEUX[id];
  texte(`lieu.${id}.nom`, 'monde');
  condition(L.visible, id); condition(L.ouvert, id);
  for (const e of L.etats || []) condition(e.si, id);
  if (L.type === 'village') for (const p of L.pnj) {
    texte(`pnj.${p.id}.nom`, id); texte(`pnj.${p.id}.sous`, id); condition(p.si, p.id); condition(p.fous, p.id); condition(p.remise, p.id);
    if (p.role === 'auberge') texte(p.portrait === 'aubergiste' ? 'pnj.auberge.accueil' : `pnj.${p.id}.accueil`, p.id);
    if (!D.IMAGES['pnj.' + p.portrait]) erreur(`portrait inconnu « ${p.portrait} »`);
    for (const [o] of p.objets || []) if (!D.OBJETS[o]) erreur(`objet inconnu « ${o} » (${p.id})`);
    for (const x of p.equipement || []) {
      const o = typeof x === 'string' ? x : x[0];
      if (!D.EQUIPEMENT[o]) erreur(`équipement inconnu « ${o} » (${p.id})`);
      if (typeof x !== 'string') condition(x[1], p.id);
    }
  }
  if (L.tresors) {
    for (const k of ['sous', 'desc', 'le']) texte(`lieu.${id}.${k}`, id);
    for (const c of L.cotes || []) texte(`lieu.${id}.${c}`, id);
    const vus = new Set();
    for (const f of L.tresors) {
      if (vus.has(f.id)) erreur(`trésor en double « ${f.id} » (${id})`); vus.add(f.id);
      texte(`${id}.${f.id}.nom`, id); texte(`${id}.${f.id}.texte`, id);
      if (f.gagne) gain(f.gagne, `${id}.${f.id}`); if (f.effet) effet(f.effet, `${id}.${f.id}`); if (f.revele) monstre(f.revele, `${id}.${f.id}`);
    }
    texte(`${id}.m50`, id); texte(`${id}.m100`, id);
    if (L.palier50) gain(L.palier50.gagne, id + ' palier 50'); if (L.palier100) gain(L.palier100.gagne, id + ' palier 100');
    for (const e of L.evenements) { texte(`${id}.ev.${e.id}`, id); if (e.gagne) gain(e.gagne, id); if (e.effet) effet(e.effet, id); }
    for (const g of Object.values(L.groupes)) for (const grp of g) grp.forEach(m => monstre(m, id + ' groupes'));
    if (!D.IMAGES['decor.' + id]) erreur(`décor manquant « decor.${id} »`);
  }
}
for (const [a, b] of D.LIENS) { lieu(a, 'LIENS'); lieu(b, 'LIENS'); }

// noms et images
for (const id in D.HEROS) { texte('parle.' + id, id); texte(`heros.${id}.age`, id); texte(`heros.${id}.bio`, id); if (!D.IMAGES['heros.' + id]) erreur(`image manquante heros.${id}`); }
for (const id in D.CLASSES) { texte('classe.' + id, 'classes'); texte(`classe.${id}.desc`, 'classes'); D.CLASSES[id].tech.forEach(t => { if (!D.TECHNIQUES[t]) erreur(`technique inconnue « ${t} »`); }); }
for (const id in D.TECHNIQUES) { texte('tech.' + id, 'techniques'); texte(`tech.${id}.desc`, 'techniques'); }
for (const id in D.OBJETS) { texte('objet.' + id, 'objets'); texte(`objet.${id}.desc`, 'objets'); }
for (const id in D.EQUIPEMENT) texte('equip.' + id, 'équipement');
for (const id in D.IMPORTANTS) { texte('important.' + id, 'importants'); texte(`important.${id}.desc`, 'importants'); }
for (const id in D.MONSTRES) {
  texte('monstre.' + id, 'monstres'); texte(`monstre.${id}.desc`, 'monstres');
  if (!D.IMAGES['monstre.' + id]) erreur(`image manquante monstre.${id}`);
  for (const c of D.MONSTRES[id].capacites || []) {
    if (c.type === 'charge') texte(`monstre.${id}.charge`, id);
    if (c.type === 'appel') { texte(`monstre.${id}.appel`, id); monstre(c.id, id + ' appel'); }
    if (['charge', 'spores', 'regen', 'fort'].includes(c.type)) texte(`monstre.${id}.special`, id);
  }
  if (D.MONSTRES[id].vol && !D.OBJETS[D.MONSTRES[id].vol] && !D.EQUIPEMENT[D.MONSTRES[id].vol]) erreur(`vol inconnu « ${D.MONSTRES[id].vol} » (${id})`);
}
for (const [id, f] of Object.entries(D.IMAGES)) {
  for (const k of ['fichier', 'portrait']) if (f[k] && !fs.existsSync(path.join(RACINE, f[k]))) erreur(`fichier image absent « ${f[k]} » (${id})`);
  if (!f.fichier && !f.sujet) averti(`image sans fichier ni sujet : ${id}`);
}

// textes utilisés par le moteur
for (const f of fs.readdirSync(path.join(RACINE, 'moteur'))) {
  const src = lire('moteur/' + f);
  for (const m of src.matchAll(/\b(?:t|tx|existe|lignes|logR)\('([a-z][\w.-]*[\w])'/g)) if (!m[1].endsWith('.')) texte(m[1], 'moteur/' + f);
}

// bulles : 3 phrases au plus, 5 bulles au plus ; noms des personnages
const PARLE = { fr: {}, en: {} };
for (const lg of ['fr', 'en']) for (const k in TXT[lg]) if (k.startsWith('parle.')) PARLE[lg][TXT[lg][k].l.join(' ')] = 1;
for (const lg of ['fr', 'en']) for (const [k, { f, l }] of Object.entries(TXT[lg])) {
  if (!/^(a\d|prologue|loup|navire|prix|berceuse|pnj\.\w+\.(a\d|fin)|pnj\.brann$|pnj\.\w+\.accueil)/.test(k)) continue;
  const bulles = l.filter(x => !x.startsWith('##') && !x.startsWith('>'));
  if (bulles.length > 5) averti(`${f} « ${k} » : ${bulles.length} bulles (5 au plus)`);
  for (const b of bulles) {
    const phrases = b.replace(/\[[^\]]*\]\s*$/, '').split(/(?<=[.!?…»”])\s+(?=[«“A-ZÀ-Ý*])/).filter(x => /\w/.test(x));
    if (phrases.length > 3) averti(`${f} « ${k} » : bulle de ${phrases.length} phrases : ${b.slice(0, 60)}…`);
    const m = /^([^:«»“*]{1,28}?)\s?:\s(.+)$/.exec(b);
    if (m && /^[«“]/.test(m[2]) && !PARLE[lg][m[1]]) erreur(`${f} « ${k} » : personnage inconnu « ${m[1]} » (ajoute parle.<id> dans noms.txt)`);
  }
}

// anglais : repères manquants
const manquantsEN = Object.keys(TXT.fr).filter(k => !TXT.en[k]);
const enTrop = Object.keys(TXT.en).filter(k => !TXT.fr[k]);

for (const m of avertissements) console.log('  ⚠ ' + m);
for (const m of erreurs) console.log('  ✗ ' + m);
if (manquantsEN.length) console.log(`  ⚠ ${manquantsEN.length} textes sans traduction anglaise : ${manquantsEN.slice(0, 30).join(', ')}${manquantsEN.length > 30 ? '…' : ''}`);
if (enTrop.length) console.log(`  ⚠ textes anglais sans équivalent français : ${enTrop.join(', ')}`);
console.log(`${Object.keys(TXT.fr).length} textes FR, ${Object.keys(TXT.en).length} EN · ${etapes.size} étapes · ${Object.keys(D.ANNEXES).length} quête(s) annexe(s) · ${erreurs.length} erreur(s), ${avertissements.length} avertissement(s)`);
process.exit(erreurs.length ? 1 : 0);
