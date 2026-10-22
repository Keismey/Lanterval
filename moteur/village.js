/* Lanterval · écran de village : personnages, quêtes « ! », auberge, boutiques. */

function nomLieu(id) { return t('lieu.' + id + '.nom'); }
function varianteLieu(id, quoi) { const e = etatLieu(id); return e && existe(`lieu.${id}.${quoi}.${e}`) ? `lieu.${id}.${quoi}.${e}` : `lieu.${id}.${quoi}`; }

// Que propose ce personnage en ce moment ?
function quetesDuPnj(pnj) {
  const e = etapeCourante();
  if (e && e.lieu === pnj) return { type: 'etape', etape: e };
  for (const id in ANNEXES) {
    const a = annexeEtape(id);
    if (a && a.lieu === pnj) return { type: 'annexe', id };
    if (ANNEXES[id].donneur === pnj && annexeEtat(id) === 0 && annexeOuverte(id)) return { type: 'offre', id };
  }
  return null;
}

function renderVillage() {
  const vid = lieuActuel(), V = LIEUX[vid];
  setDecor(decorDuLieu(vid), { lueur: lueurDuLieu(vid) });
  ovc().innerHTML = lbl(nomLieu(vid), t(varianteLieu(vid, 'sous')));
  saveSecours();
  const opts = V.pnj.map(p => {
    const q = quetesDuPnj(p.id), main = q && q.type === 'etape';
    const sub = main ? t(q.etape.id + '.titre') : q && q.type === 'offre' ? t('village.annexe') : q ? t(`${q.id}.e${annexeEtat(q.id)}.titre`) : t(`pnj.${p.id}.sous`, { prix: p.prix });
    return { k: p.id, img: imgSrc('pnj.' + p.portrait), label: esc(t(`pnj.${p.id}.nom`)), sub: esc(sub), bang: q ? (main ? 'main' : 'side') : '', cls: (main ? 'main ' : q ? 'side ' : '') + (p.large ? 'wide' : '') };
  });
  const e = etapeCourante(), aller = e && !V.pnj.some(p => p.id === e.lieu) ? boutonAller(e) : null;
  if (aller) opts.unshift(aller);
  opts.push({ k: 'map', ic: 'map', label: esc(t('village.partir')), sub: esc(t('carte.titre')), cls: 'ghost' });
  const p = $('#panel');
  p.innerHTML = `<div class="ptitle">${esc(nomLieu(vid))} <small>${esc(t('village'))}</small></div><p class="ptext">${tx(varianteLieu(vid, 'desc'))}</p>
    <div class="msgline">${S.msg || ''}</div><div class="acts">${btns(opts)}</div>`;
  S.msg = '';
  bind(p, opts, k => {
    if (k === 'map') { S.screen = 'map'; renderStable(); }
    else if (k.startsWith('go:')) run(() => voyager(k.slice(3)));
    else run(() => parler(V.pnj.find(x => x.id === k)));
  });
}

async function parler(pnj) {
  const q = quetesDuPnj(pnj.id);
  if (q && q.type === 'etape') return jouerEtape(q.etape);
  if (q && q.type === 'annexe') return jouerAnnexe(q.id);
  if (q && q.type === 'offre') return jouerOffre(q.id);
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
function repliqueAttente(id) {
  const ids = toutesEtapes().map(e => e.id), cur = etapeCourante();
  const pos = cur ? ids.indexOf(cur.id) : ids.length;
  if (!cur && existe(`pnj.${id}.fin`)) return `pnj.${id}.fin`;
  for (let i = pos; i >= 0; i--) if (ids[i] && existe(`pnj.${id}.${ids[i]}`)) return `pnj.${id}.${ids[i]}`;
  return `pnj.${id}`;
}

async function auberge(pnj) {
  const v = { prix: pnj.prix };
  const k = await show(html(bulle(t('pnj.auberge.accueil', v)).texte), { who: t('parle.aubergiste'), portrait: 'aubergiste',
    choices: [{ k: 'y', label: esc(t('pnj.auberge.dormir')), sub: esc(t('pnj.auberge.dormir.sous', v)), ic: 'bed', dis: S.gold < pnj.prix }, { k: 'n', label: esc(t('retour')), ic: 'back', cls: 'ghost' }] });
  if (k === 'y') { S.gold -= pnj.prix; healAll(); restorePP(); logR('journal.log.auberge'); S.msg = tx('pnj.auberge.message'); }
}

/* ---------- Boutiques ---------- */
function nomEq(id) { return t('equip.' + id); }
function stTxt(st, el) { return (el ? t('element.' + el) + ' · ' : '') + Object.entries(st).map(([k, v]) => `${t('stat.' + k)} ${v > 0 ? '+' : ''}${v}`).join(', '); }
function wearers(id) {
  const e = EQUIPEMENT[id];
  if (e.place === 'arme') return Object.keys(CLASSES).filter(j => CLASSES[j].armes.includes(e.type)).map(j => CLASSES[j].cachee && !S.jobs.includes(j) ? '???' : t('classe.' + j)).join(', ');
  return e.classes ? e.classes.map(j => t('classe.' + j)).join(', ') : t('equipe.toutes');
}
function icEq(id) { const p = EQUIPEMENT[id].place; return p === 'arme' ? 'sword' : p === 'armure' ? 'shield' : 'spark'; }

async function boutique(pnj) {
  const qui = t('parle.' + pnj.portrait);
  let line = html(bulle(t(`pnj.${pnj.id}.accueil`)).texte);
  while (true) {
    const opts = pnj.objets.map(([k, prix]) => ({ k: 'i:' + k, ic: 'heart', label: esc(t('objet.' + k)), sub: esc(t('boutique.objet', { prix, effet: t('objet.' + k + '.desc'), n: S.inv[k] || 0 })), dis: S.gold < prix }));
    for (const k of pnj.equipement) opts.push({ k: 'e:' + k, ic: icEq(k), label: esc(nomEq(k)), sub: esc(`${EQUIPEMENT[k].prix} ${t('po')} · ${stTxt(EQUIPEMENT[k].st, EQUIPEMENT[k].el)} · ${wearers(k)}`), dis: S.gold < EQUIPEMENT[k].prix });
    opts.push({ k: 'sell', ic: 'coin', label: esc(t('boutique.vendre')), sub: esc(t('boutique.vendre.sous')), cls: 'side' });
    opts.push({ k: 'x', label: esc(t('retour')), ic: 'back', cls: 'ghost' });
    const k = await show(line, { who: qui, portrait: pnj.portrait, choices: opts, note: tx('boutique.bourse', { or: S.gold }) + (pnj.equipement.length ? ' ' + tx('boutique.equiper') : '') });
    if (k === 'x') return;
    if (k === 'sell') { line = await vendre(pnj); continue; }
    const [ty, id] = k.split(':');
    if (ty === 'i') { const prix = pnj.objets.find(x => x[0] === id)[1]; S.gold -= prix; addItem(id, 1); line = tx('boutique.achete', { nom: t('objet.' + id) }); }
    else { S.gold -= EQUIPEMENT[id].prix; addEq(id); line = tx('boutique.achete.eq', { nom: nomEq(id) }); logR('journal.log.achat', { nom: 'equip.' + id }); }
  }
}

async function vendre(pnj) {
  const qui = t('parle.' + pnj.portrait);
  let line = tx('boutique.vente.accueil');
  while (true) {
    const opts = Object.keys(OBJETS).filter(k => S.inv[k] > 0).map(k => ({ k: 'i:' + k, ic: 'heart', label: esc(`${t('objet.' + k)} ×${S.inv[k]}`), sub: esc(`+${OBJETS[k].v} ${t('po')} · ${t('objet.' + k + '.desc')}`) }));
    for (const k of Object.keys(S.bag).filter(k => S.bag[k] > 0)) {
      const v = eqVal(k);
      opts.push({ k: 'e:' + k, ic: icEq(k), label: esc(`${nomEq(k)} ×${S.bag[k]}`), sub: esc(v ? `+${v} ${t('po')} · ${t('place.' + EQUIPEMENT[k].place)} · ${stTxt(EQUIPEMENT[k].st, EQUIPEMENT[k].el)}` : t('boutique.cadeau')), dis: !v });
    }
    opts.push({ k: 'x', label: esc(t('boutique.fini')), ic: 'back', cls: 'ghost' });
    const k = await show(line, { who: qui, portrait: pnj.portrait, title: t('boutique.vendre'), choices: opts, note: tx('boutique.bourse', { or: S.gold }) + ' ' + tx('boutique.porte') + (opts.length === 1 ? ' ' + tx('boutique.vide') : '') });
    if (k === 'x') return tx('boutique.autre');
    const [ty, id] = k.split(':');
    if (ty === 'i') { S.inv[id]--; S.gold += OBJETS[id].v; line = tx('boutique.vendu', { nom: t('objet.' + id), prix: OBJETS[id].v }); }
    else { const v = eqVal(id); S.bag[id]--; S.gold += v; line = tx('boutique.vendu', { nom: nomEq(id), prix: v }); logR('journal.log.vente', { nom: 'equip.' + id }); }
  }
}
