/* Lanterval · le récit : joue dans l'ordre les événements d'une étape (donnees/acte1.js, annexes.js).
   En mode silencieux (outil de test), seuls les changements d'état sont appliqués : ni texte, ni combat. */

// Joue les bulles d'un repère. Si le repère contient un choix (« > id : texte »), renvoie l'id choisi.
async function dialogue(cle, ctx, suite) {
  const L = lignes(cle);
  if (!L) { console.warn('Texte manquant :', cle); return null; }
  const opts = [], bulles = [];
  let titre = ctx.titre;
  for (const l of L) {
    const m = /^>\s*([\w-]+)\s*:\s*([^|]+?)\s*(?:\|\s*(.+))?$/.exec(l);
    if (m) opts.push({ k: m[1], label: html(m[2]), sub: m[3] ? html(m[3]) : '', ic: m[1] === 'non' ? 'back' : ctx.style === 'side' ? 'paw' : 'run', cls: m[1] === 'non' ? 'ghost' : ctx.style || '' });
    else if (l.startsWith('##')) bulles.push({ titre: l.replace(/^##\s*/, '') });
    else bulles.push(bulle(l));
  }
  const dernier = bulles.map(b => !b.titre).lastIndexOf(true);
  // en partie+, une scène déjà vue peut être passée (sauf la dernière bulle s'il y a un choix à faire)
  const passable = S && S.plus && S.vus && S.vus[cle];
  let choix = null;
  for (let i = 0; i < bulles.length; i++) {
    const b = bulles[i];
    if (b.titre) { titre = b.titre; continue; }
    const o = b.qui ? { who: b.nom, portrait: b.qui } : { title: titre };
    if (i === dernier && opts.length) o.choices = opts;
    else if (b.bouton) o.choices = [{ label: html(b.bouton), ic: i === dernier && suite === 'combat' ? 'sword' : 'run', cls: i === dernier && suite === 'combat' ? 'main' : '' }];
    else if (i === dernier && suite === 'combat') o.choices = [{ label: esc(t('combattre')), ic: 'sword', cls: 'main' }];
    if (passable && i < dernier) o.choices = [...(o.choices || [{ label: esc(t('continuer')), k: 0, ic: 'run' }]), { k: '__passer', label: esc(t('recit.passer')), ic: 'play', cls: 'ghost' }];
    choix = await show(b.tuto ? encadreTuto(html(b.texte)) : html(b.texte), o);
    if (choix === '__passer') { if (opts.length) { i = dernier - 1; continue; } break; }
  }
  if (S && S.vus) S.vus[cle] = 1;
  return opts.length ? choix : null;
}

const EVENEMENTS = {
  async dialogue([cle], ctx, suite) { if (!ctx.silencieux) await dialogue(cle, ctx, suite); },
  async panorama([id], ctx) { if (!ctx.silencieux) { setDecor(id, { pano: true }); ovc().innerHTML = ''; } },
  async decor(a, ctx) { if (!ctx.silencieux) { setDecor(decorDuLieu(lieuActuel()), { lueur: lueurDuLieu(lieuActuel()) }); ovc().innerHTML = ''; } },
  async rejoint([id]) { join(id); },
  async presente([id], ctx) { if (!ctx.silencieux) await joinCard(id, id === 'kael' ? t('recit.heros') : t('recit.rejoint', { nom: t('parle.' + id) })); },
  async combat([ids, o], ctx) {
    if (ctx.silencieux) return;
    o = o || {};
    if (o.conseil) await show(encadreTuto(tx(o.conseil)), { title: t('combat.conseil'), choices: [{ label: esc(t('combattre')), ic: 'sword', cls: 'main' }] });
    await battle(ids.split(/\s+/), { zone: lieuActuel(), canFlee: false, quest: true, boss: !!o.boss, perdu: !!o.perdu, equipe: o.equipe ? o.equipe.split(/\s+/) : null });
  },
  async gagne([spec]) { gagner(spec); hud(); },
  async perd([spec]) { perdre(spec); },
  async classes([liste]) { liste.split(/\s+/).forEach(unlockJob); },
  async soin() { healAll(); },
  async drapeau([id]) { S.f[id] = true; },
  async degats([spec]) { appliquerEffet('degats ' + spec); },
  async revele([spec]) { const [id, el] = spec.split(/\s+/); if (el) { reveal(id, el); seen(id); } else revealAll(id); },
  async position([pos]) { S.loc = pos; },
  async traversee([vers, o], ctx, suite, id) {
    if (ctx.silencieux) { if (o && o.milieu) await jouer(o.milieu, ctx, id + '.'); S.loc = vers; return; }
    const milieu = o && o.milieu ? () => jouer(o.milieu, ctx, id + '.') : null;
    // reprise au milieu de la traversée : on ne refait pas le trajet
    if (ctx.reprise && ctx.reprise.fait.some(f => f.startsWith(id + '.'))) { if (milieu) await milieu(); }
    else await traverse(lieuActuel(), coteActuel(), vers.split('.')[1], { milieu });
    S.loc = vers;
  },
  async choix([cle, branches], ctx, suite, id) {
    const r = ctx.reprise, k = ctx.silencieux ? Object.keys(branches).find(x => x !== 'non') : r && r.choix[id] ? r.choix[id] : await dialogue(cle, ctx);
    if (r) r.choix[id] = k;
    if (branches[k]) await jouer(branches[k], ctx, id + '.');
  },
  async stop(a, ctx) { ctx.stop = true; },
  async message([cle], ctx) { if (!ctx.silencieux) S.msg = tx(cle); },
  async fin_version(a, ctx) { S.fins = (S.fins || 0) + 1; if (!ctx.silencieux) S.screen = 'fin'; }
};

/* Point de reprise : chaque événement joué est noté dans S.reprise (sauvegardé avec la partie).
   Si la page est fermée en pleine étape, l'étape reprend après le dernier événement joué :
   un combat gagné n'est pas rejoué, un objet reçu n'est pas redonné. Les décors sont toujours rejoués. */
const VISUELS = ['panorama', 'decor'];
function pointDeReprise(k) {
  if (!S.reprise || S.reprise.k !== k) S.reprise = { k, fait: [], choix: {} };
  return S.reprise;
}
async function jouer(evts, ctx, chemin = '') {
  for (let i = 0; i < evts.length; i++) {
    if (ctx.stop) return;
    const [type, ...args] = evts[i], id = chemin + i, r = ctx.reprise;
    if (!EVENEMENTS[type]) { console.warn('Événement inconnu :', type); continue; }
    if (r && r.fait.includes(id)) continue;
    // un dialogue suivi d'un combat (sans conseil) se termine par le bouton « Combattre »
    const n = evts[i + 1], suite = n && n[0] === 'combat' && !(n[2] && n[2].conseil) ? 'combat' : null;
    await EVENEMENTS[type](args, ctx, suite, id);
    if (r && !VISUELS.includes(type)) { r.fait.push(id); save(); }
  }
}
// à l'ouverture d'une partie : relance l'étape interrompue, s'il y en a une
function reprendre() {
  const r = S.reprise; if (!r) return null;
  const [type, id, n] = r.k.split(':'), e = type === 'e' && toutesEtapes().find(x => x.id === id);
  if (e && !fini(id) && etapeCourante() === e) return () => jouerEtape(e);
  if (type === 'a' && ANNEXES[id] && annexeEtat(id) === +n) return () => jouerAnnexe(id);
  if (type === 'o' && ANNEXES[id] && !annexeEtat(id)) return () => jouerOffre(id);
  S.reprise = null; return null;
}

function titreEtape(e) { return existe(e.id + '.bouton') ? t(e.id + '.bouton') : t(e.id + '.titre'); }

async function jouerEtape(e, silencieux) {
  const ctx = { titre: titreEtape(e), silencieux, reprise: silencieux ? null : pointDeReprise('e:' + e.id) };
  await jouer(e.evenements, ctx);
  if (!silencieux) S.reprise = null;
  if (ctx.stop) return false;
  if (!fini(e.id)) S.etapes.push(e.id);
  if (!silencieux) logR('journal.log.etape', { titre: e.id + '.titre' });
  return true;
}

// Quête annexe : l'offre au donneur, puis chaque étape
async function jouerOffre(id) {
  const ctx = { titre: t(id + '.titre'), style: 'side', reprise: pointDeReprise('o:' + id) };
  await jouer(ANNEXES[id].offre, ctx);
  S.reprise = null;
  if (ctx.stop) return;
  S.annexes[id] = 1;
  logR('journal.log.annexe', { titre: id + '.titre' });
}
async function jouerAnnexe(id, silencieux) {
  const n = annexeEtat(id), e = ANNEXES[id].etapes[n - 1];
  const ctx = { titre: t(id + '.titre'), style: 'side', silencieux, reprise: silencieux ? null : pointDeReprise(`a:${id}:${n}`) };
  await jouer(e.evenements, ctx);
  if (!silencieux) S.reprise = null;
  if (ctx.stop) return;
  S.annexes[id] = n + 1;
  if (annexeFinie(id) && !silencieux) logR('journal.log.annexeFinie', { titre: id + '.titre' });
}
