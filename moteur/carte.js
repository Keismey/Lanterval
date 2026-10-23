/* Lanterval · les cartes des régions et les déplacements.
   Une position est un village (« lanterval ») ou un côté de zone (« foret.v »). Les chemins de LIENS
   sont directs ; pour passer d'un côté à l'autre d'une zone, il faut la traverser (combats au hasard).
   Chaque région (vallee, cote…) a sa carte : on y voit ses lieux ; le Marais salant relie la vallée et la côte.
   La charrette de Hilde (drapeau charrette, fin de l'acte 3) mène directement dans un village, sans traversée ;
   la Plume du facteur (« Le courrier des falaises », acte 4) mène directement dans une zone déjà visitée. */
const charrette = id => !!S.f.charrette && LIEUX[id].type === 'village';
const plume = id => S.imp.includes('plume-facteur') && LIEUX[id].type === 'zone' && !!S.z[id] && S.z[id].visits > 0;

// toutes les positions d'un lieu : ses côtés pour une zone qui en a, sinon le lieu lui-même
function positions(id) { const L = LIEUX[id]; return L.cotes ? L.cotes.map(c => id + '.' + c) : [id]; }
function lieuDe(pos) { return pos.split('.')[0]; }

// voisins d'une position : [position, zone traversée ou null]
function voisins(pos) {
  const o = [];
  for (const [a, b] of LIENS) { if (a === pos) o.push([b, null]); else if (b === pos) o.push([a, null]); }
  const id = lieuDe(pos), L = LIEUX[id];
  if (L.cotes && !L.nonRetour) for (const c of L.cotes) if (id + '.' + c !== pos) o.push([id + '.' + c, id]);
  return o.filter(([p]) => lieuOuvert(lieuDe(p)) && !LIEUX[lieuDe(p)].bientot);
}
// chemin le plus court (en nombre de traversées) vers un lieu : { vers, via: [[zone, deCote, versCote], …] }
function route(dest) {
  const fin = new Set(positions(dest)), dist = { [S.loc]: 0 }, prev = {}, file = [S.loc];
  while (file.length) {
    file.sort((a, b) => dist[a] - dist[b]);
    const p = file.shift();
    if (fin.has(p)) {
      const via = []; let x = p;
      while (prev[x]) { const [q, z] = prev[x]; if (z) via.unshift([z, q.split('.')[1], x.split('.')[1]]); x = q; }
      return { vers: p, via };
    }
    for (const [n, z] of voisins(p)) {
      const d = dist[p] + (z ? 1 : 0);
      if (dist[n] === undefined || d < dist[n]) { dist[n] = d; prev[n] = [p, z]; file.push(n); }
    }
  }
  return null;
}

function coutTraversee(zone) { return t(S.z[zone] && S.z[zone].m100 ? 'carte.cout.maitrise' : 'carte.cout'); }
function viaTxt(via) {
  if (!via.length) return t('carte.direct');
  return t('carte.traverser', { lieux: via.map(([z]) => t('lieu.' + z + '.le')).join(' ' + t('carte.puis') + ' '), cout: via.map(([z]) => coutTraversee(z)).join(' + ') });
}
function ouSuisJe() { const c = coteActuel(); return nomLieu(lieuActuel()) + (c ? ', ' + t(`lieu.${lieuActuel()}.${c}`) : ''); }

// les lieux où une quête attend l'équipe, quête principale d'abord : [lieu ou personnage, 'main' ou 'side']
function lieuxQuete() {
  const e = etapeCourante(), lieux = [];
  if (e) lieux.push([e.lieu, 'main']);
  for (const [, x] of annexesDispos()) lieux.push([x.lieu, 'side']);
  return lieux;
}
// un lieu où une quête attend l'équipe (point d'exclamation sur la carte)
function queteSur(id) {
  for (const [l, k] of lieuxQuete()) if ((villageDuPnj(l) || lieuDe(l)) === id) return k;
  return '';
}
// une quête attend dans une région dont on ne voit pas la carte (« ! » sur le bouton de son village)
function queteRegion(reg, ids) {
  for (const [l, k] of lieuxQuete()) {
    const v = villageDuPnj(l), id = v || lieuDe(l);
    if (ids.includes(id)) continue;
    if ((v ? regionsDu(v) : l.includes('.') ? [regionDe(l)] : regionsDu(id)).includes(reg)) return k;
  }
  return '';
}

// « ! » du bouton Carte : la quête principale (sinon une quête annexe) attend dans un autre lieu
function marqueCarte(ici) {
  const lieuQ = l => villageDuPnj(l) || lieuDe(l);
  const e = etapeCourante(); if (e && lieuQ(e.lieu) !== ici) return 'main';
  for (const [, x] of annexesDispos()) if (lieuQ(x.lieu) !== ici) return 'side';
  return '';
}

const nomCarte = reg => t(reg === 'vallee' ? 'carte.titre' : 'carte.titre.' + reg);
// place d'un lieu sur la carte d'une région
function surCarte(id, reg) { const L = LIEUX[id], c = L.carte && L.carte[reg]; return c ? { x: c[0], y: c[1] } : { x: L.x, y: L.y }; }

function renderMap() {
  const reg = regionDe(S.loc);
  setDecor(reg === 'vallee' ? 'decor.carte' : 'decor.carte.' + reg);
  const ici = lieuActuel(), tous = Object.keys(LIEUX).filter(lieuVisible), ids = tous.filter(id => regionsDu(id).includes(reg)), R = {};
  for (const id of tous) if (id !== ici && lieuOuvert(id) && !LIEUX[id].bientot) { const r = route(id); if (r) R[id] = r; }
  const pos = id => surCarte(id, reg);
  const traits = LIENS.filter(([a, b]) => regionDe(a) === reg && regionDe(b) === reg).map(([a, b]) => [lieuDe(a), lieuDe(b)]).filter(([a, b]) => ids.includes(a) && ids.includes(b)).map(([a, b]) => {
    const ferme = !lieuOuvert(a) || !lieuOuvert(b) || LIEUX[a].bientot || LIEUX[b].bientot;
    return `<line x1="${pos(a).x * 100}" y1="${pos(a).y * 100}" x2="${pos(b).x * 100}" y2="${pos(b).y * 100}" stroke="${ferme ? '#aab0c8' : '#fff1c0'}" stroke-width="${ferme ? 2 : 3}" stroke-dasharray="${ferme ? '3 5' : '7 5'}" vector-effect="non-scaling-stroke" opacity="${ferme ? .6 : .95}"/>`;
  }).join('');
  const noeuds = ids.map(id => {
    const ferme = !lieuOuvert(id) || LIEUX[id].bientot, q = queteSur(id);
    return `<button class="node ${id === ici ? 'here' : R[id] ? 'go' : ferme ? 'lock' : ''}" data-n="${id}" style="left:${pos(id).x * 100}%;top:${pos(id).y * 100}%">${q ? `<span class="bang ${q}">!</span>` : ''}<span class="dot"></span><span>${esc(nomLieu(id))}${ferme ? ' ?' : ''}</span></button>`;
  }).join('');
  ovc().innerHTML = `<div class="map"><svg viewBox="0 0 100 100" preserveAspectRatio="none">${traits}</svg>${noeuds}</div>` + (decorProvisoire() ? `<div class="ph glass">${esc(t('scene.provisoire'))}</div>` : '');
  const fermes = ids.filter(id => !lieuOuvert(id) || LIEUX[id].bientot);
  const clic = id => {
    if (R[id]) return run(() => voyager(id));
    if (LIEUX[id].bientot) S.msg = tx('carte.bientot', { lieu: nomLieu(id) });
    else if (!lieuOuvert(id)) S.msg = tx('carte.ferme', { lieu: nomLieu(id) });
    else return;
    renderMap();
  };
  ovc().querySelectorAll('.node').forEach(b => b.onclick = () => clic(b.dataset.n));
  // boutons : les lieux de cette carte, et les villages des autres régions
  const opts = Object.entries(R).filter(([id]) => ids.includes(id) || LIEUX[id].type === 'village').map(([id, r]) => ({ k: id, ic: LIEUX[id].type === 'village' ? 'home' : 'run', label: esc(nomLieu(id)) + (ids.includes(id) ? '' : ` <small>${esc(nomCarte(regionsDu(id)[0]))}</small>`), sub: esc(charrette(id) ? t('carte.charrette') : plume(id) && r.via.length ? t('carte.plume') : viaTxt(r.via)), bang: queteSur(id) || (ids.includes(id) ? '' : queteRegion(regionsDu(id)[0], ids)) }));
  opts.push({ k: 'back', ic: 'back', label: esc(t('carte.rester')), sub: esc(ouSuisJe()), cls: 'ghost' });
  const p = $('#panel');
  p.innerHTML = `<div class="ptitle">${esc(nomCarte(reg))}</div><p class="ptext">${tx('carte.ici', { lieu: ouSuisJe() })}</p>
    ${fermes.length ? `<p class="note">${tx('carte.fermes', { lieux: fermes.map(nomLieu).join(', ') })}</p>` : ''}<div class="msgline">${S.msg || ''}</div><div class="acts">${btns(opts)}</div>`;
  S.msg = '';
  bind(p, opts, k => { if (k === 'back') { S.screen = LIEUX[ici].type === 'village' ? 'village' : 'zone'; renderStable(); } else run(() => voyager(k)); });
}

// aller jusqu'à un lieu en traversant les zones sur le chemin
async function voyager(dest) {
  if (charrette(dest)) { S.loc = dest; S.screen = 'village'; logR('journal.log.charrette', { lieu: 'lieu.' + dest + '.nom' }); return; }
  const r = route(dest); if (!r) return;
  // Plume du facteur : on arrive du côté le plus proche, sans traverser
  if (plume(dest) && r.via.length) { S.loc = r.vers; logR('journal.log.plume', { lieu: 'lieu.' + dest + '.nom' }); return entrerZone(dest); }
  for (const [z, de, vers] of r.via) { S.loc = z + '.' + de; await traverse(z, de, vers); S.loc = z + '.' + vers; }
  S.loc = r.vers;
  if (LIEUX[dest].type === 'village') { S.screen = 'village'; logR('journal.log.arrivee', { lieu: 'lieu.' + dest + '.nom' }); return; }
  await entrerZone(dest);
}
async function entrerZone(id) {
  const z = S.z[id];
  S.screen = 'zone';
  logR('journal.log.entree', { lieu: 'lieu.' + id + '.nom' });
  if (!z) return;
  z.rnd = 0; z.streak = 0; z.rest = false; z.visits++;
  if (z.visits === 1 && existe(`lieu.${id}.intro`)) {
    setDecor(decorDuLieu(id)); ovc().innerHTML = zoneOverlay(id);
    await dialogue(`lieu.${id}.intro`, { titre: nomLieu(id) });
  }
}

/* ---------- Traversée d'une zone ---------- */
// milieu : événements joués à mi-chemin (embuscade de l'acte 1, par exemple)
async function traverse(id, de, vers, o) {
  o = o || {};
  const z = S.z[id] || mkZ(), t0 = S.st.time, segs = 4, at = new Set();
  S.st.trav++;
  let n = z.m100 ? ri(0, 2) : ri(1, 3);
  while (at.size < n) at.add(ri(0, segs - 1));
  if (o.milieu) at.delete(2);
  n = at.size;
  const dest = t(`lieu.${id}.${vers}`), fait = [];
  let trouve = 0;
  // la barre avance d'une étape à l'autre ; le panneau garde la liste de ce qui s'est passé
  const dessiner = (de, a, enCours) => {
    ovc().innerHTML = lbl(nomLieu(id), t('trav.vers', { lieu: dest })) + `<div class="trav glass">${esc(t('trav.avance', { p: Math.round(a * 100) }))}<div class="xtrack"><i style="width:${de * 100}%"></i></div></div>`;
    $('#panel').innerHTML = `<div class="ptitle">${esc(t('trav.titre'))}</div><p class="ptext">${tx('trav.texte', { zone: t('lieu.' + id + '.le'), lieu: dest })}</p>
      <ul class="travlog">${fait.map(l => `<li>${l}</li>`).join('')}${enCours ? `<li class="now">${enCours}</li>` : ''}</ul><p class="note">${tx(z.m100 ? 'trav.note.maitrise' : 'trav.note')}</p>`;
    const i = ovc().querySelector('.trav .xtrack>i'); void i.offsetWidth; i.style.width = a * 100 + '%';
  };
  const etape = s => esc(t('trav.etape', { n: s + 1, total: segs }));
  setDecor(decorDuLieu(id));
  for (let s = 0; s < segs; s++) {
    dessiner(s / segs, (s + 1) / segs, `${etape(s)} · ${esc(t('trav.marche'))}`); await wait(1400);
    if (o.milieu && s === 2) { await o.milieu(); setDecor(decorDuLieu(id)); n++; fait.push(`${etape(s)} · ${esc(t('trav.log.rencontre'))}`); }
    else if (at.has(s)) {
      const g = groupFor(id), noms = listeMonstres(g);
      await show(`${tx('trav.monstres')}<br><b>${esc(noms)}</b>`, { title: t('trav.titre'), choices: [{ label: esc(t('trav.combattre')), ic: 'sword', k: 0 }] });
      await battle(g, { zone: id }); setDecor(decorDuLieu(id));
      fait.push(`${etape(s)} · ${tx('trav.log.combat', { noms })}`);
    }
    else if (Math.random() < .2) { const g = ri(4, 9); S.gold += g; trouve += g; hud(); fait.push(`${etape(s)} · ${tx('trav.log.or', { or: g })}`); }
    else fait.push(`${etape(s)} · ${esc(t('trav.log.calme'))}`);
  }
  dessiner(1, 1);
  logR('journal.log.traversee', { lieu: 'lieu.' + id + '.nom', n, duree: fmt(S.st.time - t0) });
  // bilan : un appui pour arriver
  await show(tx(n === 1 ? 'trav.fin.un' : 'trav.fin', { zone: t('lieu.' + id + '.le'), n }) + (trouve ? ' ' + tx('trav.or', { or: trouve }) : '') + `<ul class="travlog">${fait.map(l => `<li>${l}</li>`).join('')}</ul>`, { title: t('trav.titre'), instant: true });
}
// « 2 × Loup des brumes, Chauve-souris »
function listeMonstres(ids) {
  const n = {}; for (const id of ids) n[id] = (n[id] || 0) + 1;
  return Object.entries(n).map(([id, k]) => (k > 1 ? k + ' × ' : '') + t('monstre.' + id)).join(', ');
}
