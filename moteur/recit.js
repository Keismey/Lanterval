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
    choix = await show(html(b.texte), o);
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
    if (o.conseil) await show(tx(o.conseil), { title: t('combat.conseil'), choices: [{ label: esc(t('combattre')), ic: 'sword', cls: 'main' }] });
    await battle(ids.split(/\s+/), { zone: lieuActuel(), canFlee: false, quest: true, boss: !!o.boss });
  },
  async gagne([spec]) { gagner(spec); hud(); },
  async perd([spec]) { perdre(spec); },
  async classes([liste]) { liste.split(/\s+/).forEach(unlockJob); },
  async soin() { healAll(); },
  async degats([spec]) { appliquerEffet('degats ' + spec); },
  async revele([spec]) { const [id, el] = spec.split(/\s+/); if (el) { reveal(id, el); seen(id); } else revealAll(id); },
  async position([pos]) { S.loc = pos; },
  async traversee([vers, o], ctx) {
    if (ctx.silencieux) { S.loc = vers; return; }
    await traverse(lieuActuel(), coteActuel(), vers.split('.')[1], { milieu: o && o.milieu ? () => jouer(o.milieu, ctx) : null });
    S.loc = vers;
  },
  async choix([cle, branches], ctx) {
    const k = ctx.silencieux ? Object.keys(branches).find(x => x !== 'non') : await dialogue(cle, ctx);
    if (branches[k]) await jouer(branches[k], ctx);
  },
  async stop(a, ctx) { ctx.stop = true; },
  async message([cle], ctx) { if (!ctx.silencieux) S.msg = tx(cle); },
  async fin_version(a, ctx) { S.fins = (S.fins || 0) + 1; if (!ctx.silencieux) S.screen = 'fin'; }
};

async function jouer(evts, ctx) {
  for (let i = 0; i < evts.length; i++) {
    if (ctx.stop) return;
    const [type, ...args] = evts[i];
    if (!EVENEMENTS[type]) { console.warn('Événement inconnu :', type); continue; }
    // un dialogue suivi d'un combat (sans conseil) se termine par le bouton « Combattre »
    const n = evts[i + 1], suite = n && n[0] === 'combat' && !(n[2] && n[2].conseil) ? 'combat' : null;
    await EVENEMENTS[type](args, ctx, suite);
  }
}

function titreEtape(e) { return existe(e.id + '.bouton') ? t(e.id + '.bouton') : t(e.id + '.titre'); }

async function jouerEtape(e, silencieux) {
  const ctx = { titre: titreEtape(e), silencieux };
  await jouer(e.evenements, ctx);
  if (ctx.stop) return false;
  if (!fini(e.id)) S.etapes.push(e.id);
  if (!silencieux) logR('journal.log.etape', { titre: e.id + '.titre' });
  return true;
}

// Quête annexe : l'offre au donneur, puis chaque étape
async function jouerOffre(id) {
  const ctx = { titre: t(id + '.titre'), style: 'side' };
  await jouer(ANNEXES[id].offre, ctx);
  if (ctx.stop) return;
  S.annexes[id] = 1;
  logR('journal.log.annexe', { titre: id + '.titre' });
}
async function jouerAnnexe(id, silencieux) {
  const n = annexeEtat(id), e = ANNEXES[id].etapes[n - 1];
  const ctx = { titre: t(id + '.titre'), style: 'side', silencieux };
  await jouer(e.evenements, ctx);
  if (ctx.stop) return;
  S.annexes[id] = n + 1;
  if (annexeFinie(id) && !silencieux) logR('journal.log.annexeFinie', { titre: id + '.titre' });
}
