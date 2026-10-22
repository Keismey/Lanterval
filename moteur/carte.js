/* Lanterval · la carte de la vallée et les déplacements.
   Une position est un village (« lanterval ») ou un côté de zone (« foret.v »). Les chemins de LIENS
   sont directs ; pour passer d'un côté à l'autre d'une zone, il faut la traverser (combats au hasard). */

// toutes les positions d'un lieu : ses côtés pour une zone qui en a, sinon le lieu lui-même
function positions(id) { const L = LIEUX[id]; return L.cotes ? L.cotes.map(c => id + '.' + c) : [id]; }
function lieuDe(pos) { return pos.split('.')[0]; }

// voisins d'une position : [position, zone traversée ou null]
function voisins(pos) {
  const o = [];
  for (const [a, b] of LIENS) { if (a === pos) o.push([b, null]); else if (b === pos) o.push([a, null]); }
  const id = lieuDe(pos), L = LIEUX[id];
  if (L.cotes) for (const c of L.cotes) if (id + '.' + c !== pos) o.push([id + '.' + c, id]);
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
  return t('carte.traverser', { lieux: via.map(([z]) => t('lieu.' + z + '.le')).join(' ' + t('carte.puis') + ' ') }) + ' : ' + via.map(([z]) => coutTraversee(z)).join(' + ');
}
function ouSuisJe() { const c = coteActuel(); return nomLieu(lieuActuel()) + (c ? ', ' + t(`lieu.${lieuActuel()}.${c}`) : ''); }

// un lieu où une quête attend l'équipe (point d'exclamation sur la carte)
function queteSur(id) {
  const e = etapeCourante(), lieux = [];
  if (e) lieux.push([e.lieu, 'main']);
  for (const a in ANNEXES) { const x = annexeEtape(a); if (x) lieux.push([x.lieu, 'side']); }
  for (const [l, k] of lieux) {
    const v = villageDuPnj(l);
    if ((v || lieuDe(l)) === id) return k;
  }
  return '';
}

// « ! » du bouton Carte : la quête principale (sinon une quête annexe) attend dans un autre lieu
function marqueCarte(ici) {
  const lieuQ = l => villageDuPnj(l) || lieuDe(l);
  const e = etapeCourante(); if (e && lieuQ(e.lieu) !== ici) return 'main';
  for (const a in ANNEXES) { const x = annexeEtape(a); if (x && lieuQ(x.lieu) !== ici) return 'side'; }
  return '';
}

function renderMap() {
  setDecor('decor.carte');
  const ici = lieuActuel(), ids = Object.keys(LIEUX).filter(lieuVisible), R = {};
  for (const id of ids) if (id !== ici && lieuOuvert(id) && !LIEUX[id].bientot) { const r = route(id); if (r) R[id] = r; }
  const pos = id => LIEUX[id];
  const traits = LIENS.map(([a, b]) => [lieuDe(a), lieuDe(b)]).filter(([a, b]) => ids.includes(a) && ids.includes(b)).map(([a, b]) => {
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
  const opts = Object.entries(R).map(([id, r]) => ({ k: id, ic: LIEUX[id].type === 'village' ? 'home' : 'run', label: esc(nomLieu(id)), sub: esc(viaTxt(r.via)), bang: queteSur(id) }));
  opts.push({ k: 'back', ic: 'back', label: esc(t('carte.rester')), sub: esc(ouSuisJe()), cls: 'ghost' });
  const p = $('#panel');
  p.innerHTML = `<div class="ptitle">${esc(t('carte.titre'))}</div><p class="ptext">${tx('carte.ici', { lieu: ouSuisJe() })}</p>
    ${fermes.length ? `<p class="note">${tx('carte.fermes', { lieux: fermes.map(nomLieu).join(', ') })}</p>` : ''}<div class="msgline">${S.msg || ''}</div><div class="acts">${btns(opts)}</div>`;
  S.msg = '';
  bind(p, opts, k => { if (k === 'back') { S.screen = LIEUX[ici].type === 'village' ? 'village' : 'zone'; renderStable(); } else run(() => voyager(k)); });
}

// aller jusqu'à un lieu en traversant les zones sur le chemin
async function voyager(dest) {
  const r = route(dest); if (!r) return;
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
  const dest = t(`lieu.${id}.${vers}`);
  let trouve = 0;
  const dessiner = f => {
    ovc().innerHTML = lbl(nomLieu(id), t('trav.vers', { lieu: dest })) + `<div class="trav glass">${esc(t('trav.avance', { p: Math.round(f * 100) }))}<div class="xtrack"><i style="width:${f * 100}%"></i></div></div>`;
    $('#panel').innerHTML = `<div class="ptitle">${esc(t('trav.titre'))}</div><p class="ptext">${tx('trav.texte', { zone: t('lieu.' + id + '.le'), lieu: dest })}</p><p class="note">${tx(z.m100 ? 'trav.note.maitrise' : 'trav.note')}</p>`;
  };
  setDecor(decorDuLieu(id));
  for (let s = 0; s < segs; s++) {
    for (const f of [s / segs, (s + .5) / segs]) { dessiner(f); await wait(380); }
    if (o.milieu && s === 2) { await o.milieu(); setDecor(decorDuLieu(id)); n++; }
    else if (at.has(s)) { await flash(esc(t('trav.monstres'))); await battle(groupFor(id), { zone: id }); setDecor(decorDuLieu(id)); }
    else if (Math.random() < .2) { const g = ri(4, 9); S.gold += g; trouve += g; hud(); }
  }
  dessiner(1); await wait(300);
  logR('journal.log.traversee', { lieu: 'lieu.' + id + '.nom', n, duree: fmt(S.st.time - t0) });
  S.msg = tx(n === 1 ? 'trav.fin.un' : 'trav.fin', { zone: t('lieu.' + id + '.le'), n }) + (trouve ? ' ' + tx('trav.or', { or: trouve }) : '');
}
