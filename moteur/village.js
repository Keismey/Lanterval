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
    return { k: p.id, img: imgSrc('pnj.' + p.portrait), label: esc(t(`pnj.${p.id}.nom`)), sub: esc(sub), bang: q ? (main ? 'main' : 'side') : '', cls: (main ? 'main wide ' : q ? 'side ' : '') + (p.large ? 'wide' : ''), main };
  });
  // la quête principale en tête, sur toute la largeur ; les autres en deux colonnes ; « Partir » reste en bas
  opts.sort((a, b) => b.main - a.main);
  opts.push({ k: 'map', ic: 'map', label: esc(t('village.partir')), sub: esc(nomCarte(regionDe(vid))), cls: 'ghost partir', bang: marqueCarte(vid) });
  const p = $('#panel');
  p.innerHTML = `<div class="ptitle">${esc(nomLieu(vid))} <small>${esc(t('village'))}</small></div><p class="ptext">${tx(varianteLieu(vid, 'desc'))}</p>
    <div class="msgline">${S.msg || ''}</div><div class="acts village">${btns(opts)}</div>`;
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
  if (k === 'y') { SON.jingle('auberge'); S.gold -= pnj.prix; healAll(); restorePP(); logR('journal.log.auberge'); S.msg = tx('pnj.auberge.message'); }
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

// Ce que gagnerait un héros à porter cette pièce : null s'il ne peut pas, sinon l'écart sur les stats en jeu
function gainEq(h, id) {
  if (!canWear(h, id)) return null;
  const p = EQUIPEMENT[id].place, avant = stats(h), apres = stats({ ...h, eq: { ...h.eq, [p]: id } }), cur = h.eq[p] && EQUIPEMENT[h.eq[p]];
  const cles = new Set([...Object.keys(EQUIPEMENT[id].st), ...Object.keys(cur ? cur.st : {})]);
  return [...cles].reduce((n, k) => n + apres[k] - avant[k], 0);
}
// petits visages de l'équipe avec le gain : +4 en vert, = en gris, ✕ si la pièce ne lui va pas
function gainsHtml(id) {
  return `<span class="gains">${team().map(h => {
    const g = gainEq(h, id), c = g === null ? 'non' : g > 0 ? 'up' : g < 0 ? 'dn' : 'eg';
    return `<span class="g ${c}"><img alt="${esc(nomH(h))}" src="${vignette(h)}">${g === null ? '✕' : g > 0 ? '+' + g : g < 0 ? '−' + -g : '='}</span>`;
  }).join('')}</span>`;
}
// une ligne compacte : nom, effet et prix sur une ligne, l'équipe dessous
function ligneArticle(k, nom, effet, prix, bas, dis) {
  return { k, cls: 'art', label: `<span class="art-l"><b>${nom}</b><span class="eff">${effet}</span>${prix ? `<b class="prix">${prix}</b>` : ''}</span>`, sub: bas, dis };
}

async function boutique(pnj) {
  const qui = t('parle.' + pnj.portrait), V = prixVisite(pnj), P = V.P;
  const accueil = V.fous && existe(`pnj.${pnj.id}.accueil.fous`) ? `pnj.${pnj.id}.accueil.fous` : V.remise && existe(`pnj.${pnj.id}.accueil.remise`) ? `pnj.${pnj.id}.accueil.remise` : repliqueAttente(pnj.id, '.accueil');
  let line = html(bulle(t(accueil)).texte), tab = null;
  while (true) {
    const tout = pnj.objets.map(([k]) => ligneArticle('i:' + k, esc(t('objet.' + k)), esc(t('objet.' + k + '.desc') + ' · ' + t('boutique.possede', { n: S.inv[k] || 0 })), V.aff('i:' + k) + esc(' ' + t('po')), '', S.gold < P['i:' + k]));
    for (const k of enRayon(pnj)) tout.push(ligneArticle('e:' + k, esc(nomEq(k)), esc(stTxt(EQUIPEMENT[k].st, EQUIPEMENT[k].el)), V.aff('e:' + k) + esc(' ' + t('po')), gainsHtml(k), S.gold < P['e:' + k]));
    // onglets : les rayons du marchand, puis Vendre
    const O = ongletsDe(tout, tab === 'vendre' ? null : tab);
    let opts = O.liste.slice(), tabs = O.tabs || [{ k: O.tab, label: t('boutique.onglet.' + O.tab) }];
    if (tab === 'vendre') {
      opts = Object.keys(OBJETS).filter(k => S.inv[k] > 0).map(k => ligneArticle('i:' + k, esc(`${t('objet.' + k)} ×${S.inv[k]}`), esc(t('objet.' + k + '.desc')), esc(`+${OBJETS[k].v} ${t('po')}`)));
      for (const k of Object.keys(S.bag).filter(k => S.bag[k] > 0)) {
        const v = eqVal(k);
        opts.push(ligneArticle('e:' + k, esc(`${nomEq(k)} ×${S.bag[k]}`), esc(stTxt(EQUIPEMENT[k].st, EQUIPEMENT[k].el)), esc(v ? `+${v} ${t('po')}` : t('boutique.cadeau')), '', !v));
      }
      if (!opts.length) line = tx('boutique.vide');
    } else tab = O.tab;
    tabs = tabs.concat([{ k: 'vendre', label: t('boutique.vendre'), cls: 'vendre' }]);
    opts.push({ k: 'x', label: esc(t('retour')), ic: 'back', cls: 'ghost wide' });
    const note = tab === 'vendre' ? tx('boutique.porte') : V.fous ? tx('boutique.fous') : V.remise ? tx('boutique.remise') : '';
    const k = await show(line, { who: qui, portrait: pnj.portrait, choices: opts, tabs, tab, note, bourse: true, court: true, acts: 'rayon' });
    if (k === 'x') return;
    if (k.startsWith('tab:')) { tab = k.slice(4); if (tab === 'vendre') line = tx('boutique.vente.accueil'); continue; }
    const [ty, id] = k.split(':');
    if (tab === 'vendre') {
      SON.bruitage('or');
      if (ty === 'i') { S.inv[id]--; S.gold += OBJETS[id].v; line = tx('boutique.vendu', { nom: t('objet.' + id), prix: OBJETS[id].v }); }
      else { const v = eqVal(id); S.bag[id]--; S.gold += v; line = tx('boutique.vendu', { nom: nomEq(id), prix: v }); logR('journal.log.vente', { nom: 'equip.' + id }); }
      save(); continue;
    }
    const r = ty === 'i' ? await ficheObjet(id, P[k]) : await ficheEquipement(id, P[k]);
    closeModal();
    if (!r) continue;
    SON.bruitage('or');
    if (ty === 'i') { S.gold -= P[k] * r; addItem(id, r); line = tx(r > 1 ? 'boutique.achete.n' : 'boutique.achete', { nom: t('objet.' + id), n: r }); }
    else {
      S.gold -= P[k]; logR('journal.log.achat', { nom: 'equip.' + id });
      if (r === 'sac') { addEq(id); line = tx('boutique.achete.eq', { nom: nomEq(id) }); }
      else { const h = char(r), p = EQUIPEMENT[id].place; if (h.eq[p]) addEq(h.eq[p]); h.eq[p] = id; clampC(h); line = tx('boutique.achete.porte', { nom: nomEq(id), heros: nomH(h) }); }
    }
    save();
  }
}

// Fiche d'un consommable : combien en acheter. Renvoie 1, 5, 10 ou rien.
function ficheObjet(id, prix) {
  return new Promise(res => {
    const o = [1, 5, 10].map(n => ({ k: n, ic: 'coin', label: esc(t('boutique.acheter.n', { n })), sub: esc(`${prix * n} ${t('po')}`), cls: n === 1 ? 'main' : '', dis: S.gold < prix * n }));
    o.push({ k: 0, ic: 'back', label: esc(t('retour')), cls: 'ghost wide' });
    const sh = modal(`<div class="sheet-h"><div><div class="ptitle">${esc(t('objet.' + id))}</div><p class="note">${esc(t('objet.' + id + '.desc'))}</p></div><span class="sp"></span><button class="ibtn" id="mclose" aria-label="${esc(t('fermer'))}">${ic('x')}</button></div>
      <div class="prixl"><span>${esc(t('boutique.prix'))}</span><b>${prix} ${esc(t('po'))}</b><span>${esc(t('boutique.possede', { n: S.inv[id] || 0 }))}</span><b>${S.gold} ${esc(t('po'))}</b></div><div class="acts">${btns(o)}</div>`);
    sh.querySelector('#mclose').onclick = () => res(0);
    bind(sh, o, n => res(n));
  });
}

// Fiche d'une pièce d'équipement : ce qu'elle change pour chaque héros, puis acheter et équiper (sur le meilleur), ou acheter seulement.
// Renvoie l'id du héros qui la porte, 'sac', ou rien.
function ficheEquipement(id, prix) {
  const E = EQUIPEMENT[id], p = E.place, T = team();
  const gains = T.map(h => [h, gainEq(h, id)]);
  let choix = (gains.filter(([, g]) => g !== null && g > 0).sort((a, b) => b[1] - a[1])[0] || [])[0];
  choix = choix ? choix.id : null;
  return new Promise(res => {
    const draw = () => {
      const lignes = gains.map(([h, g]) => {
        const nom = nomH(h), cur = h.eq[p];
        if (g === null) return `<div class="hfiche non"><img alt="" src="${vignette(h)}"><div><b>${esc(nom)}</b><small>${esc(E.heros && E.heros !== h.id ? t('equipe.pas.heros', { nom: t('parle.' + E.heros) }) : t('boutique.fiche.classe', { classe: t('classe.' + h.job) }))}</small></div></div>`;
        const avant = stats(h), apres = stats({ ...h, eq: { ...h.eq, [p]: id } });
        const ecarts = STATS.filter(k => apres[k] !== avant[k]).map(k => `${esc(t('stat.' + k))} ${avant[k]} → <b class="${apres[k] > avant[k] ? 'up' : 'dn'}">${apres[k]}</b>`).join('<br>') || esc(t('equipe.pareil'));
        return `<button class="hfiche ${h.id === choix ? 'on' : ''}" data-h="${h.id}"><img alt="" src="${vignette(h)}"><div><b>${esc(nom)}</b><small>${esc(cur ? t('boutique.fiche.porte', { nom: nomEq(cur) }) : t('boutique.fiche.rien'))}</small></div><span class="ecart">${ecarts}</span></button>`;
      }).join('');
      const h = choix && char(choix), cur = h && h.eq[p];
      const o = [];
      if (h) o.push({ k: choix, ic: icEq(id), label: esc(t('boutique.acheter.equiper', { nom: nomH(h) })), cls: 'main wide', dis: S.gold < prix });
      o.push({ k: 'sac', ic: 'bag', label: esc(t('boutique.acheter')), dis: S.gold < prix }, { k: null, ic: 'back', label: esc(t('retour')), cls: 'ghost' });
      const sh = modal(`<div class="sheet-h"><div><div class="ptitle">${esc(nomEq(id))}</div><p class="note">${esc(t('place.' + p) + ' · ' + stTxt(E.st, E.el))}</p></div><span class="sp"></span><button class="ibtn" id="mclose" aria-label="${esc(t('fermer'))}">${ic('x')}</button></div>
        <div class="prixl"><span>${esc(t('boutique.prix'))}</span><b>${prix} ${esc(t('po'))}</b><span>${esc(t('inventaire.bourse'))}</span><b>${S.gold} ${esc(t('po'))}</b></div>
        <div class="list">${lignes}</div><p class="note">${esc(t('boutique.fiche.qui', { liste: wearers(id) }))}${gains.some(([, g]) => g !== null) ? ' ' + esc(t('boutique.choisir')) : ''}</p>
        <div class="acts">${btns(o)}</div>${cur ? `<p class="note">${esc(t('boutique.fiche.sac', { objet: nomEq(cur), nom: nomH(h) }))}</p>` : ''}`);
      sh.querySelector('#mclose').onclick = () => res(null);
      sh.querySelectorAll('[data-h]').forEach(b => b.onclick = () => { choix = b.dataset.h; draw(); });
      bind(sh.querySelector('.acts'), o, k => res(k));
    };
    draw();
  });
}
