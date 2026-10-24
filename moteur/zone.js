/* Lanterval · écran de zone : exploration (découvertes fixes et événements), chasse, repos, traversée, quêtes. */

function zoneOverlay(id) {
  const z = S.z[id], L = LIEUX[id];
  let o = lbl(nomLieu(id), t(varianteLieu(id, 'sous')));
  if (!z) return o;
  const pc = pct(id);
  return o + `<div class="xcard glass"><div class="row"><span>${esc(t('zone.exploration'))}</span><span>${esc(t('zone.decouvertes', { p: pc, n: z.found.length, total: L.tresors.length }))}</span></div>
  <div class="xtrack"><i style="width:${pc}%"></i><span class="gem ${z.m50 ? 'ok' : ''}" style="left:50%" title="${esc(t('zone.palier', { p: 50 }))}"></span><span class="gem ${z.m100 ? 'ok' : ''}" style="left:calc(100% - 7px)" title="${esc(t('zone.palier', { p: 100 }))}"></span></div></div>`;
}

// boutons des quêtes jouables ici. Une quête qui attend ailleurs n'emmène pas l'équipe :
// un « ! » marque le bouton Traverser (autre côté de la zone) ou le bouton Carte (autre lieu).
function questBtns(id) {
  const o = [], e = etapeCourante();
  if (e && estIci(e.lieu)) o.push({ k: 'q:main', ic: 'star', label: esc(titreEtape(e)), sub: esc(t('zone.quete.principale')), cls: 'main wide' });
  for (const [a, x] of annexesDispos()) {
    if (!estIci(x.lieu)) continue;
    const c = cleEtape(a, x), cle = existe(c + '.bouton') ? c + '.bouton' : c + '.titre';
    o.push({ k: 'a:' + a + (x.morceau !== undefined ? ':' + x.morceau : ''), ic: 'paw', label: esc(t(cle)), sub: esc(t('zone.quete.annexe') + (team().length < 2 ? ' · ' + t('zone.conseil.equipe') : '')), cls: 'side wide' });
  }
  return o;
}
// « ! » du bouton Traverser : une quête attend de l'autre côté de cette zone
function marqueTraversee(id) {
  const autreCote = l => l && lieuDe(l) === id && l.includes('.') && !estIci(l);
  const e = etapeCourante(); if (e && autreCote(e.lieu)) return 'main';
  for (const [, x] of annexesDispos()) if (autreCote(x.lieu)) return 'side';
  return '';
}

function renderZone() {
  const id = lieuActuel(), z = S.z[id], L = LIEUX[id], cote = coteActuel();
  setDecor(decorDuLieu(id));
  ovc().innerHTML = zoneOverlay(id);
  const qb = questBtns(id), opts = [...qb];
  // l'Escalier de brume (nonRetour) : on n'y explore qu'une fois monté, et on n'en redescend plus avant la fin ;
  // ses deux côtés ne se relient que par l'histoire
  const monte = L.nonRetour && cond(L.nonRetour);
  if (z && (!L.nonRetour || monte)) {
    const reste = L.tresors.length - z.found.length, peut = reste > 0 || z.rnd < L.maxEvenements;
    opts.push({ k: 'explore', ic: 'search', label: esc(t('zone.explorer')), sub: esc(peut ? (reste ? t(reste > 1 ? 'zone.reste' : 'zone.reste.un', { n: reste }) : t('zone.tout')) : t('zone.rien')), dis: !peut });
    opts.push({ k: 'hunt', ic: 'sword', label: esc(t('zone.chasser')), sub: esc(t('zone.chasser.sous')) });
    const repos = L.tresors.find(f => f.repos && z.found.includes(f.id));
    if (repos) opts.push({ k: 'rest', ic: 'drop', label: esc(t(`${id}.${repos.id}.nom`)), sub: esc(t(z.rest ? 'zone.repos.utilise' : 'zone.repos')), dis: z.rest });
  }
  // traverser vers l'autre côté de la zone
  if (L.cotes && !L.nonRetour) {
    const autre = L.cotes.find(c => c !== cote);
    opts.push({ k: 'cross', ic: 'cross', label: esc(t('zone.traverser', { lieu: t(`lieu.${id}.${autre}`) })), sub: esc(coutTraversee(id)), bang: marqueTraversee(id) });
  }
  // chemins qui partent d'ici mais pas encore ouverts
  for (const [a, b] of LIENS) {
    const autre = a === S.loc ? b : b === S.loc ? a : null; if (!autre) continue;
    const l = lieuDe(autre);
    if (lieuVisible(l) && (!lieuOuvert(l) || LIEUX[l].bientot)) opts.push({ k: 'x', ic: 'lock', label: esc(nomLieu(l)), sub: esc(existe(`lieu.${l}.ferme`) ? t(`lieu.${l}.ferme`) : t(LIEUX[l].bientot ? 'zone.bientot' : 'zone.ferme')), dis: true });
  }
  if (monte) opts.push({ k: 'x', ic: 'lock', label: esc(t('zone.carte')), sub: esc(t('zone.nonretour')), dis: true });
  else opts.push({ k: 'map', ic: 'map', label: esc(t('zone.carte')), sub: esc(t('zone.carte.sous')), cls: 'ghost', bang: marqueCarte(id) });
  const p = $('#panel');
  p.innerHTML = `<div class="ptitle">${esc(nomLieu(id))} <small>${esc(cote ? t(`lieu.${id}.${cote}`) : '')}</small></div><p class="ptext">${tx(varianteLieu(id, 'desc'))}</p><div class="msgline">${S.msg || ''}</div><div class="acts">${btns(opts)}</div>`;
  S.msg = '';
  bind(p, opts, k => {
    if (k === 'map') { S.screen = 'map'; renderStable(); return; }
    run(async () => {
      if (k === 'explore') await explore(id);
      else if (k === 'hunt') await fightRandom(id, t('zone.chasser.texte'));
      else if (k === 'rest') { const f = L.tresors.find(x => x.repos); z.rest = true; healAll(); restorePP(); S.msg = tx('zone.repos.fait', { lieu: t(`${id}.${f.id}.nom`) }); }
      else if (k === 'cross') { const autre = L.cotes.find(c => c !== cote); await traverse(id, cote, autre); S.loc = id + '.' + autre; }
      else if (k === 'q:main') await jouerEtape(etapeCourante());
      else if (k.startsWith('a:')) { const [, a, m] = k.split(':'); await jouerAnnexe(a, false, m === undefined ? undefined : +m); }
    });
  });
}

function groupFor(id) {
  const G = LIEUX[id].groupes || {}, g = pick(G[etatLieu(id)] || G.normal);
  return team().length === 1 ? g.slice(0, 1) : g;
}
async function fightRandom(id, texte) { ovc().innerHTML = zoneOverlay(id); await flash(esc(texte)); return battle(groupFor(id), { zone: id }); }

// applique ce qu'une découverte ou un événement donne
function recompense(x) {
  if (x.gagne) gagner(x.gagne);
  if (x.effet) appliquerEffet(x.effet);
  if (x.revele) revealAll(x.revele);
  hud();
}

// récompenses à 50 % et 100 % d'exploration (silencieux : sans dialogue)
async function paliers(id, silencieux) {
  const z = S.z[id], L = LIEUX[id], pc = pct(id);
  for (const [p, cle, palier] of [[50, 'm50', 'palier50'], [100, 'm100', 'palier100']]) {
    if (pc >= p && !z[cle]) {
      z[cle] = true; recompense(L[palier] || {});
      if (silencieux) continue;
      SON.bruitage('palier');
      ovc().innerHTML = zoneOverlay(id);
      await dialogue(`${id}.${cle}`, { titre: nomLieu(id) });
      logR('journal.log.palier', { lieu: 'lieu.' + id + '.nom', p });
    }
  }
}

async function explore(id) {
  const z = S.z[id], L = LIEUX[id];
  S.st.explores++;
  const reste = L.tresors.filter(f => !z.found.includes(f.id));
  let fixe;
  if (!reste.length) fixe = false;
  else if (z.rnd >= L.maxEvenements || z.streak >= 2) fixe = true;
  // Lampe de mineur : plus de découvertes fixes
  else fixe = Math.random() < (team().some(h => h.eq.acc && EQUIPEMENT[h.eq.acc].lampe) ? .75 : .5);
  if (fixe) {
    z.streak = 0;
    const f = pick(reste);
    recompense(f); z.found.push(f.id); SON.bruitage('trouve');
    ovc().innerHTML = zoneOverlay(id);
    await show(`<span class="tag ${f.type === 'lieu' ? 'lieu' : ''}">${esc(t('zone.tag.' + f.type))}</span><b>${esc(t(`${id}.${f.id}.nom`))}</b><br>${tx(`${id}.${f.id}.texte`)}`, { title: nomLieu(id) });
    logR('journal.log.decouverte', { lieu: 'lieu.' + id + '.nom', nom: `${id}.${f.id}.nom`, p: pct(id) });
    await paliers(id);
  } else {
    z.rnd++; z.streak++;
    let tot = 0; for (const e of L.evenements) tot += e.poids;
    let r = Math.random() * tot, ev = L.evenements[0];
    for (const e of L.evenements) { r -= e.poids; if (r <= 0) { ev = e; break; } }
    if (ev.combat) await fightRandom(id, t(`${id}.ev.${ev.id}`));
    else { recompense(ev); await show(`<span class="tag rnd">${esc(t('zone.tag.evenement'))}</span>${tx(`${id}.ev.${ev.id}`)}`, { title: nomLieu(id) }); }
  }
}
