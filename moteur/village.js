/* Lanterval · écran de village : personnages, quêtes « ! », auberge, boutiques. */

function nomLieu(id) { return t('lieu.' + id + '.nom'); }
function varianteLieu(id, quoi) { const e = etatLieu(id); return e && existe(`lieu.${id}.${quoi}.${e}`) ? `lieu.${id}.${quoi}.${e}` : `lieu.${id}.${quoi}`; }

// Que propose ce personnage en ce moment ?
// Un personnage qui a deux quêtes à offrir (Hilde) propose l'autre quand on vient d'en refuser une.
const offresRefusees = new Set();
function quetesDuPnj(pnj) {
  const e = etapeCourante();
  if (e && e.lieu === pnj) return { type: 'etape', etape: e };
  for (const [id, a] of annexesDispos()) if (a.lieu === pnj) return { type: 'annexe', id, morceau: a.morceau, cle: cleEtape(id, a) };
  const offres = Object.keys(ANNEXES).filter(id => ANNEXES[id].donneur === pnj && annexeEtat(id) === 0 && annexeOuverte(id));
  if (!offres.length) return null;
  let id = offres.find(x => !offresRefusees.has(x));
  if (!id) { offres.forEach(x => offresRefusees.delete(x)); id = offres[0]; }
  return { type: 'offre', id };
}

// sous-titre d'un donneur dont la quête attend ailleurs : <quête>.e<n>.sous s'il existe (ce que cherche Fennel)
function sousDonneur(pnj) {
  for (const id in ANNEXES) {
    const n = annexeEtat(id);
    if (ANNEXES[id].donneur === pnj && n > 0 && !annexeFinie(id) && existe(`${id}.e${n}.sous`)) return t(`${id}.e${n}.sous`);
  }
  return '';
}

function renderVillage() {
  const vid = lieuActuel(), V = LIEUX[vid];
  S.auberge = vid;
  setDecor(decorDuLieu(vid), { lueur: lueurDuLieu(vid) });
  ovc().innerHTML = lbl(nomLieu(vid), t(varianteLieu(vid, 'sous')));
  saveSecours();
  const opts = V.pnj.filter(p => cond(p.si)).map(p => {
    const q = quetesDuPnj(p.id), main = q && q.type === 'etape';
    const sub = main ? t(q.etape.id + '.titre') : q && q.type === 'offre' ? t('village.annexe') : q ? t(q.cle + '.titre') : sousDonneur(p.id) || t(p.sous || `pnj.${p.id}.sous`, { prix: p.prix });
    return { k: p.id, img: imgSrc('pnj.' + p.portrait), label: esc(t(`pnj.${p.id}.nom`)), sub: esc(sub), bang: q ? (main ? 'main' : 'side') : '', cls: (main ? 'main ' : q ? 'side ' : '') + (p.large ? 'wide' : '') };
  });
  opts.push({ k: 'map', ic: 'map', label: esc(t('village.partir')), sub: esc(nomCarte(regionDe(vid))), cls: 'ghost', bang: marqueCarte(vid) });
  const p = $('#panel');
  p.innerHTML = `<div class="ptitle">${esc(nomLieu(vid))} <small>${esc(t('village'))}</small></div><p class="ptext">${tx(varianteLieu(vid, 'desc'))}</p>
    <div class="msgline">${S.msg || ''}</div><div class="acts">${btns(opts)}</div>`;
  S.msg = '';
  bind(p, opts, k => {
    if (k === 'map') { S.screen = 'map'; renderStable(); }
    else run(() => parler(V.pnj.find(x => x.id === k)));
  });
}

async function parler(pnj) {
  const q = quetesDuPnj(pnj.id);
  if (q && q.type === 'etape') return jouerEtape(q.etape);
  if (q && q.type === 'annexe') return jouerAnnexe(q.id, false, q.morceau);
  // une offre refusée laisse la place au métier du personnage (boutique, auberge)
  if (q && q.type === 'offre') { await jouerOffre(q.id); if (annexeEtat(q.id)) return; offresRefusees.add(q.id); if (!pnj.role) return; }
  if (pnj.role === 'auberge') return auberge(pnj);
  if (pnj.role === 'boutique') return boutique(pnj);
  for (const id in ANNEXES) if (ANNEXES[id].donneur === pnj.id) {
    if (annexeFinie(id) && existe(id + '.apres')) return dialogue(id + '.apres', {});
    const n = annexeEtat(id);
    if (n > 0 && !annexeFinie(id) && existe(`${id}.e${n}.attente`)) return dialogue(`${id}.e${n}.attente`, {});
  }
  return dialogue(repliqueAttente(pnj.id), {});
}
// réplique selon l'avancée : pnj.<id>.<étape en cours>, sinon celle d'une étape précédente, sinon pnj.<id>
// (quoi = '.accueil' pour l'accueil d'une boutique : pnj.<id>.accueil.<étape>)
function repliqueAttente(id, quoi = '') {
  const ids = toutesEtapes().map(e => e.id), cur = etapeCourante(), base = `pnj.${id}${quoi}`;
  const pos = cur ? ids.indexOf(cur.id) : ids.length;
  if (!cur && existe(`${base}.fin`)) return `${base}.fin`;
  for (let i = pos; i >= 0; i--) if (ids[i] && existe(`${base}.${ids[i]}`)) return `${base}.${ids[i]}`;
  return base;
}

async function auberge(pnj) {
  const v = { prix: pnj.prix }, qui = pnj.portrait === 'aubergiste' ? 'auberge' : pnj.id;
  const k = await show(html(bulle(t(`pnj.${qui}.accueil`, v)).texte), { who: t('parle.' + pnj.portrait), portrait: pnj.portrait,
    choices: [{ k: 'y', label: esc(t('pnj.auberge.dormir')), sub: esc(t('pnj.auberge.dormir.sous', v)), ic: 'bed', dis: S.gold < pnj.prix }, { k: 'n', label: esc(t('retour')), ic: 'back', cls: 'ghost' }] });
  if (k === 'y') { SON.bruitage('or'); S.gold -= pnj.prix; healAll(); restorePP(); logR('journal.log.auberge'); S.msg = tx('pnj.auberge.message'); }
}

/* ---------- Boutiques ---------- */
function nomEq(id) { return t('equip.' + id); }
function stTxt(st, el) { return (el ? t('element.' + el) + ' · ' : '') + Object.entries(st).map(([k, v]) => `${t('stat.' + k)} ${v > 0 ? '+' : ''}${v}`).join(', '); }
function wearers(id) {
  const e = EQUIPEMENT[id];
  if (e.heros) return t('equipe.reservee', { nom: t('parle.' + e.heros), classes: wearersClasses(e) });
  return wearersClasses(e);
}
function wearersClasses(e) {
  if (e.place === 'arme') return classesJouables().filter(j => CLASSES[j].armes.includes(e.type)).map(j => CLASSES[j].cachee && !S.jobs.includes(j) ? '???' : t('classe.' + j)).join(', ');
  return e.classes ? e.classes.map(j => t('classe.' + j)).join(', ') : t('equipe.toutes');
}
function icEq(id) { const p = EQUIPEMENT[id].place; return p === 'arme' ? 'sword' : p === 'armure' ? 'shield' : 'spark'; }

// pièces en vente : 'epee', ou ['acier', 'fini a1.e7'] qui n'arrive qu'avec la condition
function enRayon(pnj) { return pnj.equipement.filter(x => typeof x === 'string' || cond(x[1])).map(x => typeof x === 'string' ? x : x[0]); }

// Prix d'une visite : déréglés (tirés au hasard) tant que la condition fous est vraie, remisés de 10 % avec remise.
const PRIX_FOUS = [.5, .75, 1, 1.5, 2, 3];
function prixVisite(pnj) {
  const fous = pnj.fous && cond(pnj.fous), m = pnj.remise && cond(pnj.remise) ? .9 : 1, P = {}, N = {};
  for (const [k, prix] of pnj.objets) { N['i:' + k] = prix; P['i:' + k] = Math.max(1, Math.round(prix * (fous ? pick(PRIX_FOUS) : m))); }
  for (const k of enRayon(pnj)) { N['e:' + k] = EQUIPEMENT[k].prix; P['e:' + k] = Math.max(1, Math.round(EQUIPEMENT[k].prix * (fous ? pick(PRIX_FOUS) : m) / (fous ? 5 : 1)) * (fous ? 5 : 1)); }
  // tant que les prix sont déréglés : prix gonflé en rouge, prix réduit en vert
  const aff = k => !fous || P[k] === N[k] ? String(P[k]) : `<span class="${P[k] > N[k] ? 'cher' : 'bon'}">${P[k]}</span>`;
  return { P, fous, remise: m < 1, aff };
}

// Onglets des boutiques : Armes, Armures, Accessoires, Consommables (seulement ceux qui ont quelque chose)
const RAYONS = ['arme', 'armure', 'acc', 'conso'];
function rayonDe(k) { const [ty, id] = k.split(':'); return ty === 'i' ? 'conso' : EQUIPEMENT[id].place; }
function ongletsDe(opts, tab) {
  const pris = RAYONS.filter(r => opts.some(o => rayonDe(o.k) === r));
  if (pris.length < 2) return { tabs: null, tab: pris[0], liste: opts };
  if (!pris.includes(tab)) tab = pris[0];
  return { tabs: pris.map(r => ({ k: r, label: t('boutique.onglet.' + r) })), tab, liste: opts.filter(o => rayonDe(o.k) === tab) };
}

async function boutique(pnj) {
  const qui = t('parle.' + pnj.portrait), V = prixVisite(pnj), P = V.P;
  const accueil = V.fous && existe(`pnj.${pnj.id}.accueil.fous`) ? `pnj.${pnj.id}.accueil.fous` : V.remise && existe(`pnj.${pnj.id}.accueil.remise`) ? `pnj.${pnj.id}.accueil.remise` : repliqueAttente(pnj.id, '.accueil');
  let line = html(bulle(t(accueil)).texte), tab = null;
  while (true) {
    const tout = pnj.objets.map(([k]) => ({ k: 'i:' + k, ic: 'heart', label: esc(t('objet.' + k)), sub: esc(t('boutique.objet', { prix: '§', effet: t('objet.' + k + '.desc'), n: S.inv[k] || 0 })).replace('§', V.aff('i:' + k)), dis: S.gold < P['i:' + k] }));
    for (const k of enRayon(pnj)) tout.push({ k: 'e:' + k, ic: icEq(k), label: esc(nomEq(k)), sub: V.aff('e:' + k) + esc(` ${t('po')} · ${stTxt(EQUIPEMENT[k].st, EQUIPEMENT[k].el)} · ${wearers(k)}`), dis: S.gold < P['e:' + k] });
    const O = ongletsDe(tout, tab), opts = O.liste.slice(); tab = O.tab;
    opts.push({ k: 'sell', ic: 'coin', label: esc(t('boutique.vendre')), sub: esc(t('boutique.vendre.sous')), cls: 'side' });
    opts.push({ k: 'x', label: esc(t('retour')), ic: 'back', cls: 'ghost' });
    const k = await show(line, { who: qui, portrait: pnj.portrait, choices: opts, tabs: O.tabs, tab, note: tx('boutique.bourse', { or: S.gold }) + (V.fous ? ' ' + tx('boutique.fous') : V.remise ? ' ' + tx('boutique.remise') : '') + (tab !== 'conso' && enRayon(pnj).length ? ' ' + tx('boutique.equiper') : '') });
    if (k === 'x') return;
    if (k.startsWith('tab:')) { tab = k.slice(4); continue; }
    if (k === 'sell') { line = await vendre(pnj); continue; }
    const [ty, id] = k.split(':');
    S.gold -= P[k]; SON.bruitage('or');
    if (ty === 'i') { addItem(id, 1); line = tx('boutique.achete', { nom: t('objet.' + id) }); }
    else { addEq(id); line = tx('boutique.achete.eq', { nom: nomEq(id) }); logR('journal.log.achat', { nom: 'equip.' + id }); }
  }
}

async function vendre(pnj) {
  const qui = t('parle.' + pnj.portrait);
  let line = tx('boutique.vente.accueil'), tab = null;
  while (true) {
    const tout = Object.keys(OBJETS).filter(k => S.inv[k] > 0).map(k => ({ k: 'i:' + k, ic: 'heart', label: esc(`${t('objet.' + k)} ×${S.inv[k]}`), sub: esc(`+${OBJETS[k].v} ${t('po')} · ${t('objet.' + k + '.desc')}`) }));
    for (const k of Object.keys(S.bag).filter(k => S.bag[k] > 0)) {
      const v = eqVal(k);
      tout.push({ k: 'e:' + k, ic: icEq(k), label: esc(`${nomEq(k)} ×${S.bag[k]}`), sub: esc(v ? `+${v} ${t('po')} · ${t('place.' + EQUIPEMENT[k].place)} · ${stTxt(EQUIPEMENT[k].st, EQUIPEMENT[k].el)}` : t('boutique.cadeau')), dis: !v });
    }
    const O = ongletsDe(tout, tab), opts = O.liste.slice(); tab = O.tab;
    opts.push({ k: 'x', label: esc(t('boutique.fini')), ic: 'back', cls: 'ghost' });
    const k = await show(line, { who: qui, portrait: pnj.portrait, title: t('boutique.vendre'), choices: opts, tabs: O.tabs, tab, note: tx('boutique.bourse', { or: S.gold }) + ' ' + tx('boutique.porte') + (opts.length === 1 ? ' ' + tx('boutique.vide') : '') });
    if (k === 'x') return tx('boutique.autre');
    if (k.startsWith('tab:')) { tab = k.slice(4); continue; }
    const [ty, id] = k.split(':');
    SON.bruitage('or');
    if (ty === 'i') { S.inv[id]--; S.gold += OBJETS[id].v; line = tx('boutique.vendu', { nom: t('objet.' + id), prix: OBJETS[id].v }); }
    else { const v = eqVal(id); S.bag[id]--; S.gold += v; line = tx('boutique.vendu', { nom: nomEq(id), prix: v }); logR('journal.log.vente', { nom: 'equip.' + id }); }
  }
}
