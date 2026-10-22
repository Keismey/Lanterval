/* Lanterval · démarrage, écran titre, enchaînement des écrans, défaite, fin de version. */

// Lance une séquence (dialogue, combat, trajet…) ; une seule à la fois. Une défaite ramène à l'auberge.
async function run(fn) {
  if (busy) return;
  busy = true;
  try { await fn(); }
  catch (e) { if (e === DEFAITE) { B = null; await defaite(); } else console.error(e); }
  finally { busy = false; }
  renderStable();
}
async function defaite() {
  S.gold = Math.floor(S.gold / 2); healAll(); restorePP();
  S.loc = 'lanterval'; S.screen = 'village';
  logR('journal.log.retour');
  setDecor(decorDuLieu('lanterval'), { lueur: lueurDuLieu('lanterval') }); ovc().innerHTML = '';
  await show(tx('defaite.texte', { or: S.gold }), { title: t('defaite.titre') });
}

// affiche l'écran stable de la partie (là où le joueur choisit quoi faire)
function renderStable() {
  $('#app').classList.remove('inb');
  if (!S) S = newState();
  hud();
  if (S.screen !== 'title') save();
  if (S.screen === 'title') renderTitle();
  else if (S.screen === 'fin') renderFin();
  else if (S.screen === 'map') renderMap();
  else if (LIEUX[lieuActuel()].type === 'village') { S.screen = 'village'; renderVillage(); }
  else { S.screen = 'zone'; renderZone(); }
}

/* ---------- Écran titre ---------- */
function partieEnCours() { return S && (S.etapes.length > 0 || S.st.time > 0); }
function renderTitle() {
  setDecor('decor.lanterval', { lueur: 'faible' });
  ovc().innerHTML = `<div class="titre"><h1>Lanterval</h1><span>${esc(t('titre.sous'))}</span></div>`;
  let confirmer = false;
  const draw = () => {
    const opts = [];
    if (partieEnCours()) {
      const e = etapeCourante();
      opts.push({ k: 'go', ic: 'play', label: esc(t('titre.continuer')), sub: esc((e ? t(e.id + '.titre') : t('journal.tout.fini')) + ' · ' + fmt(S.st.time) + (S.plus ? ' · ' + t('titre.plus', { n: S.plus }) : '')), cls: 'main' });
      opts.push({ k: 'new', ic: 'star', label: esc(t(confirmer ? 'titre.nouvelle.confirmer' : 'titre.nouvelle')), sub: esc(t(confirmer ? 'options.reset.confirmer.sous' : 'titre.nouvelle.sous')), cls: confirmer ? 'danger' : 'ghost' });
    } else opts.push({ k: 'new', ic: 'play', label: esc(t('titre.commencer')), sub: esc(t('titre.commencer.sous')), cls: 'main' });
    const p = $('#panel');
    p.innerHTML = `<p class="ptext">${tx('titre.texte')}</p><div class="acts">${btns(opts)}</div><p class="note centre">${esc(t('titre.version', { v: VERSION }))}</p>`;
    bind(p, opts, k => {
      if (k === 'go') { const ici = LIEUX[lieuActuel()]; S.screen = ici.type === 'village' ? 'village' : 'zone'; renderStable(); return; }
      if (partieEnCours() && !confirmer) { confirmer = true; draw(); return; }
      effacerPartie(); S = newState(); run(commencer);
    });
  };
  draw();
}
// nouvelle partie (ou partie+) : la scène d'ouverture, puis le village
async function commencer() {
  S.screen = 'intro';
  await jouer(ACTES[0].ouverture, { titre: t(ACTES[0].id + '.titre') });
  S.screen = 'village';
}

/* ---------- Fin de la version ---------- */
function renderFin() {
  setDecor(decorDuLieu('lanterval'), { lueur: lueurDuLieu('lanterval') });
  ovc().innerHTML = lbl(nomLieu('lanterval'), t(varianteLieu('lanterval', 'sous')));
  const st = S.st, zones = Object.keys(S.z).filter(lieuVisible);
  const annexes = Object.keys(ANNEXES), finies = annexes.filter(annexeFinie).length;
  const opts = [
    { k: 'go', ic: 'run', label: esc(t('fin.continuer')), sub: esc(t(finies < annexes.length ? 'fin.continuer.annexes' : 'fin.continuer.zones')), cls: 'main' },
    { k: 'plus', ic: 'star', label: esc(t('fin.plus')), sub: esc(t('fin.plus.sous')) },
    { k: 'titre', ic: 'home', label: esc(t('options.titre')), cls: 'ghost' }
  ];
  const p = $('#panel');
  p.innerHTML = `<div class="ptitle">${esc(t('fin.titre'))}</div><p class="ptext">${tx('fin.version')}</p>
  <div class="stats"><div class="stat"><b>${fmt(st.time)}</b><span>${esc(t('stats.temps'))}</span></div><div class="stat"><b>${st.taps}</b><span>${esc(t('stats.appuis'))}</span></div>
  <div class="stat"><b>${st.fights}</b><span>${esc(t('stats.combats.quete', { n: st.qfights }))}</span></div><div class="stat"><b>${st.autoTurns}</b><span>${esc(t('stats.auto'))}</span></div>
  <div class="stat"><b>${st.explores}</b><span>${esc(t('stats.explorations'))}</span></div><div class="stat"><b>${st.trav}</b><span>${esc(t('stats.traversees'))}</span></div>
  ${zones.map(id => `<div class="stat"><b>${pct(id)} %</b><span>${esc(nomLieu(id))}</span></div>`).join('')}<div class="stat"><b>${finies}/${annexes.length}</b><span>${esc(t('stats.annexes'))}</span></div></div>
  <h3 class="sec">${esc(t('fin.chronologie'))}</h3><div class="log">${st.log.map(ligneJournal).join('')}</div>
  <div class="acts">${btns(opts)}</div>`;
  bind(p, opts, k => {
    if (k === 'go') { S.screen = 'village'; renderStable(); }
    else if (k === 'plus') { partiePlus(); run(commencer); }
    else { S.screen = 'title'; save(); renderStable(); }
  });
}

/* ---------- Temps de jeu, appuis, bouton retour ---------- */
document.addEventListener('click', e => { if (S && S.screen !== 'title' && e.target.closest('button')) S.st.taps++; }, true);
setInterval(() => {
  if (!S || S.screen === 'title' || document.hidden) return;
  S.st.time++;
  const tm = $('#tm'); if (tm) tm.innerHTML = ic('clock') + fmt(S.st.time);
}, 1000);
window.addEventListener('pagehide', () => { if (S && S.screen !== 'title' && S.screen !== 'intro') save(); });

function retour() {
  if (KS.closeDialog()) return;
  if (modalOuverte()) { if (TW) TW(); fermerFenetre(); return; }
  if (busy || B || !S) return;
  if (S.screen === 'title') return 'hub';
  if (S.screen === 'map') { S.screen = LIEUX[lieuActuel()].type === 'village' ? 'village' : 'zone'; renderStable(); return; }
  save(); S.screen = 'title'; renderStable();
}

/* ---------- Démarrage ---------- */
(async function demarrer() {
  chargerOptions();
  const q = new URLSearchParams(location.search).get('lang');
  if (q) { OPT.lang = q; sauverOptions(); }
  await chargerTextes();
  choisirLangue(OPT.lang || ((navigator.language || 'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en'));
  dessinerSprites();
  S = loadSave() || newState();
  S.screen = 'title';
  KSBack.init({ back: retour, lang: () => LANG });
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  renderStable();
  $('#app').classList.add('pret');
})();
