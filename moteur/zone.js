/* Lanterval · écran de zone : exploration (découvertes fixes et événements), chasse, repos, traversée, quêtes. */

function zoneOverlay(id) {
  const z = S.z[id], L = LIEUX[id];
  let o = lbl(nomLieu(id), t(varianteLieu(id, 'sous')));
  if (!z) return o;
  const pc = pct(id);
  return o + `<div class="xcard glass"><div class="row"><span>${esc(t('zone.exploration'))}</span><span>${esc(t('zone.decouvertes', { p: pc, n: z.found.length, total: L.tresors.length }))}</span></div>
  <div class="xtrack"><i style="width:${pc}%"></i><span class="gem ${z.m50 ? 'ok' : ''}" style="left:50%" title="${esc(t('zone.palier', { p: 50 }))}"></span><span class="gem ${z.m100 ? 'ok' : ''}" style="left:calc(100% - 7px)" title="${esc(t('zone.palier', { p: 100 }))}"></span></div></div>`;
}

// boutons de quête jouables ici, ou qui ramènent l'équipe là où la quête attend
function questBtns(id) {
  const o = [], e = etapeCourante();
  if (e) {
    if (estIci(e.lieu)) o.push({ k: 'q:main', ic: 'star', label: esc(titreEtape(e)), sub: esc(t('zone.quete.principale')), cls: 'main wide' });
    else if (lieuDe(e.lieu) === id) o.push({ k: 'cross', ic: 'star', label: esc(t('zone.traverser', { lieu: t(`lieu.${id}.${e.lieu.split('.')[1]}`) })), sub: esc(t(e.id + '.titre') + ' · ' + coutTraversee(id)), cls: 'main wide' });
    else { const b = boutonAller(e); if (b) o.push(b); }
  }
  for (const a in ANNEXES) {
    const x = annexeEtape(a); if (!x) continue;
    if (!estIci(x.lieu)) { const v = villageDuPnj(x.lieu); if (v && !o.some(b => b.k === 'go:' + v)) { const r = route(v); if (r) o.push({ k: 'go:' + v, ic: 'paw', label: esc(t('zone.rentrer', { lieu: nomLieu(v) })), sub: esc(t(`${a}.e${annexeEtat(a)}.titre`) + ' · ' + viaTxt(r.via)), cls: 'side wide' }); } continue; }
    const n = annexeEtat(a), cle = existe(`${a}.e${n}.bouton`) ? `${a}.e${n}.bouton` : `${a}.e${n}.titre`;
    o.push({ k: 'a:' + a, ic: 'paw', label: esc(t(cle)), sub: esc(t('zone.quete.annexe') + (team().length < 2 ? ' · ' + t('zone.conseil.equipe') : '')), cls: 'side wide' });
  }
  return o;
}

// bouton qui emmène l'équipe là où l'étape en cours se joue (village ou autre zone)
function boutonAller(e) {
  const v = villageDuPnj(e.lieu) || lieuDe(e.lieu);
  if (v === lieuActuel() || !lieuOuvert(v)) return null;
  const r = route(v); if (!r) return null;
  return { k: 'go:' + v, ic: 'star', label: esc(t(LIEUX[v].type === 'village' ? 'zone.rentrer' : 'zone.aller', { lieu: nomLieu(v) })), sub: esc(t(e.id + '.titre') + ' · ' + viaTxt(r.via)), cls: 'main wide' };
}

function renderZone() {
  const id = lieuActuel(), z = S.z[id], L = LIEUX[id], cote = coteActuel();
  setDecor(decorDuLieu(id));
  ovc().innerHTML = zoneOverlay(id);
  const qb = questBtns(id), opts = [...qb];
  if (z) {
    const reste = L.tresors.length - z.found.length, peut = reste > 0 || z.rnd < L.maxEvenements;
    opts.push({ k: 'explore', ic: 'search', label: esc(t('zone.explorer')), sub: esc(peut ? (reste ? t(reste > 1 ? 'zone.reste' : 'zone.reste.un', { n: reste }) : t('zone.tout')) : t('zone.rien')), dis: !peut });
    opts.push({ k: 'hunt', ic: 'sword', label: esc(t('zone.chasser')), sub: esc(t('zone.chasser.sous')) });
    const repos = L.tresors.find(f => f.repos && z.found.includes(f.id));
    if (repos) opts.push({ k: 'rest', ic: 'drop', label: esc(t(`${id}.${repos.id}.nom`)), sub: esc(t(z.rest ? 'zone.repos.utilise' : 'zone.repos')), dis: z.rest });
  }
  // traverser vers l'autre côté de la zone
  if (L.cotes && !qb.some(b => b.k === 'cross')) {
    const autre = L.cotes.find(c => c !== cote);
    opts.push({ k: 'cross', ic: 'cross', label: esc(t('zone.traverser', { lieu: t(`lieu.${id}.${autre}`) })), sub: esc(coutTraversee(id)) });
  }
  // chemins qui partent d'ici mais pas encore ouverts
  for (const [a, b] of LIENS) {
    const autre = a === S.loc ? b : b === S.loc ? a : null; if (!autre) continue;
    const l = lieuDe(autre);
    if (lieuVisible(l) && (!lieuOuvert(l) || LIEUX[l].bientot)) opts.push({ k: 'x', ic: 'lock', label: esc(nomLieu(l)), sub: esc(existe(`lieu.${l}.ferme`) ? t(`lieu.${l}.ferme`) : t(LIEUX[l].bientot ? 'zone.bientot' : 'zone.ferme')), dis: true });
  }
  opts.push({ k: 'map', ic: 'map', label: esc(t('zone.carte')), sub: esc(t('zone.carte.sous')), cls: 'ghost' });
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
      else if (k.startsWith('a:')) await jouerAnnexe(k.slice(2));
      else if (k.startsWith('go:')) await voyager(k.slice(3));
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

async function explore(id) {
  const z = S.z[id], L = LIEUX[id];
  S.st.explores++;
  const reste = L.tresors.filter(f => !z.found.includes(f.id));
  let fixe;
  if (!reste.length) fixe = false;
  else if (z.rnd >= L.maxEvenements || z.streak >= 2) fixe = true;
  else fixe = Math.random() < .5;
  if (fixe) {
    z.streak = 0;
    const f = pick(reste);
    recompense(f); z.found.push(f.id);
    ovc().innerHTML = zoneOverlay(id);
    await show(`<span class="tag ${f.type === 'lieu' ? 'lieu' : ''}">${esc(t('zone.tag.' + f.type))}</span><b>${esc(t(`${id}.${f.id}.nom`))}</b><br>${tx(`${id}.${f.id}.texte`)}`, { title: nomLieu(id) });
    logR('journal.log.decouverte', { lieu: 'lieu.' + id + '.nom', nom: `${id}.${f.id}.nom`, p: pct(id) });
    const pc = pct(id);
    for (const [p, cle, palier] of [[50, 'm50', 'palier50'], [100, 'm100', 'palier100']]) {
      if (pc >= p && !z[cle]) {
        z[cle] = true; recompense(L[palier] || {});
        ovc().innerHTML = zoneOverlay(id);
        await dialogue(`${id}.${cle}`, { titre: nomLieu(id) });
        logR('journal.log.palier', { lieu: 'lieu.' + id + '.nom', p });
      }
    }
  } else {
    z.rnd++; z.streak++;
    let tot = 0; for (const e of L.evenements) tot += e.poids;
    let r = Math.random() * tot, ev = L.evenements[0];
    for (const e of L.evenements) { r -= e.poids; if (r <= 0) { ev = e; break; } }
    if (ev.combat) await fightRandom(id, t(`${id}.ev.${ev.id}`));
    else { recompense(ev); await show(`<span class="tag rnd">${esc(t('zone.tag.evenement'))}</span>${tx(`${id}.ev.${ev.id}`)}`, { title: nomLieu(id) }); }
  }
}
