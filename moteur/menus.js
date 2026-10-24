/* Lanterval · les fenêtres : Équipe, Inventaire, Codex, Journal, Options, aide au combat. */

const icPlace = p => p === 'arme' ? 'sword' : p === 'armure' ? 'shield' : 'spark';
function fermerFenetre() { closeModal(); if (!busy && !B) renderStable(); }
function diffTxt(a, b) {
  return STATS.map(k => { const d = b[k] - a[k]; return d ? `<span class="${d > 0 ? 'up' : 'dn'}">${esc(t('stat.' + k))} ${d > 0 ? '+' : ''}${d}</span>` : ''; }).filter(Boolean).join(' · ') || esc(t('equipe.pareil'));
}
function utiliserObjet(k, h) { const it = OBJETS[k], s = stats(h); S.inv[k]--; if (it.hp) h.hp = Math.min(s.hp, h.hp + it.hp); if (it.pp) h.pp = Math.min(s.pp, h.pp + it.pp); save(); hud(); }

/* ---------- Équipe ---------- */
// valeur d'un équipement complet pour la classe du héros : sert à « Optimiser »
function valeurPour(h, eq) {
  // Attaque et Magie comptent selon ce que le héros sait faire sans équipement (Kael frappe, Mira lance des sorts)
  const s = stats({ ...h, eq }), nu = stats({ ...h, eq: {} }), m = Math.max(nu.atk, nu.mag), w = k => Math.pow(nu[k] / m, 2);
  return s.hp * .25 + s.pp * .3 + s.atk * w('atk') + s.mag * w('mag') + s.def + s.spd;
}
// le meilleur du sac pour chaque emplacement, en gardant ce qu'il porte si rien n'est mieux
function optimiser(h) {
  const pris = [];
  for (const p of PLACES_EQ) {
    let mieux = h.eq[p], v = valeurPour(h, h.eq);
    for (const id of Object.keys(S.bag).filter(k => S.bag[k] > 0 && EQUIPEMENT[k].place === p && canWear(h, k))) {
      const w = valeurPour(h, { ...h.eq, [p]: id });
      if (w > v + 1e-9) { v = w; mieux = id; }
    }
    if (mieux !== h.eq[p]) { if (h.eq[p]) addEq(h.eq[p]); S.bag[mieux]--; h.eq[p] = mieux; pris.push(nomEq(mieux)); }
  }
  clampC(h); save();
  return pris;
}
function mieuxDansSac(h, p) { return Object.keys(S.bag).some(k => S.bag[k] > 0 && EQUIPEMENT[k].place === p && canWear(h, k) && valeurPour(h, { ...h.eq, [p]: k }) > valeurPour(h, h.eq) + 1e-9); }

function openParty() {
  const T = team(); let cur = T[0].id, vue = 'main', place = null, note = '', onglet = 'eq';
  const draw = () => {
    const h = char(cur), s = stats(h), el = HEROS[cur].el, nom = t('parle.' + cur);
    let body = '';
    if (vue === 'main') {
      body = `<div class="etete">${av(cur, 'lg')}<div class="etete-d"><div><b class="jn">${esc(nom)}</b> <small class="note">${esc(t('equipe.niveau', { n: h.lvl }) + ' · ' + t('classe.' + h.job) + ' · ' + t('element.' + el))}</small></div>
        <div class="jauges mini">${[['hp', t('stat.hp'), h.hp, s.hp], ['pp', t('stat.pp'), h.pp, s.pp], ['xp', t('equipe.xp'), h.xp, need(h.lvl)]].map(([k, n, v, m]) => `<div class="jauge" data-st="${k}"><span>${esc(n)}</span><div class="bar ${k} ${k === 'hp' && v / m < .3 ? 'low' : ''}"><i style="width:${v / m * 100}%"></i></div><b>${v}/${m}</b></div>`).join('')}</div></div></div>
      <div class="statg q4">${['atk', 'mag', 'def', 'spd'].map(k => `<div class="st" data-st="${k}"><span>${esc(t('stat.' + k))}</span><b>${s[k]}</b></div>`).join('')}</div>
      <p class="note" id="m-stinfo">${esc(t('equipe.stat.toucher'))}</p>
      ${note ? `<div class="msgline">${note}</div>` : ''}
      <div class="tabs souso">${[['eq', 'equipe.equipement'], ['job', 'equipe.classe'], ['tech', 'equipe.techniques']].map(([k, c]) => `<button class="tab txt ${onglet === k ? 'on' : ''}" data-o="${k}">${esc(t(c))}</button>`).join('')}</div>
      ${onglet === 'tech' ? `<div class="list">${CLASSES[h.job].tech.map(id => `<p class="note"><b class="clair">${esc(t('tech.' + id))}</b> · ${TECHNIQUES[id].pp} ${esc(t('stat.pp'))} · ${tx('tech.' + id + '.desc')}</p>`).join('')}</div>` : `<div class="acts" id="m-list"></div>`}
      ${onglet === 'eq' ? `<div class="acts bas"><button class="btn side wide" id="m-opt"><span class="ic">${ic('star')}</span><span class="tx"><span>${esc(t('equipe.optimiser', { nom }))}</span></span></button></div>` : ''}`;
    } else body = `<p class="note">${tx('equipe.place.aide', { place: t('place.' + place), nom, classe: t('classe.' + h.job) })}</p><div class="acts" id="m-list"></div>
      <div class="acts"><button class="btn ghost wide" id="m-back"><span class="ic">${ic('back')}</span><span class="tx"><span>${esc(t('retour'))}</span></span></button></div>`;
    const titre = vue === 'main' ? t('menu.equipe') : t('equipe.changer', { place: t('place.' + place) });
    const sh = modal('grand', sheetHead(titre) + `<div class="tabs">${T.map(x => `<button class="tab ${x.id === cur ? 'on' : ''}" data-c="${x.id}">${av(x.id, 'sm')}${esc(t('parle.' + x.id))}</button>`).join('')}</div>` + body);
    note = '';
    sh.querySelector('#mclose').onclick = fermerFenetre;
    sh.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { cur = b.dataset.c; vue = 'main'; draw(); });
    if (vue !== 'main') sh.querySelector('#m-back').onclick = () => { vue = 'main'; draw(); };
    const ml = sh.querySelector('#m-list');
    if (vue === 'main') {
      sh.querySelectorAll('[data-st]').forEach(x => x.onclick = () => {
        sh.querySelectorAll('[data-st]').forEach(y => y.classList.toggle('on', y === x));
        sh.querySelector('#m-stinfo').innerHTML = `<b class="clair">${esc(t(x.dataset.st === 'xp' ? 'equipe.xp' : 'stat.' + x.dataset.st))}</b> : ${esc(t('stat.' + x.dataset.st + '.aide'))}`;
      });
      sh.querySelectorAll('[data-o]').forEach(b => b.onclick = () => { onglet = b.dataset.o; draw(); });
      if (onglet === 'eq') {
        const eo = PLACES_EQ.map(p => { const id = h.eq[p]; return { k: p, ic: icPlace(p), label: esc(id ? nomEq(id) : t('equipe.rien')), sub: esc(t('place.' + p) + (id ? ' · ' + stTxt(EQUIPEMENT[id].st, EQUIPEMENT[id].el) : ' · ' + t('equipe.choisir'))) + (mieuxDansSac(h, p) ? ` <b class="up">${esc(t('equipe.mieux'))}</b>` : ''), cls: 'wide' }; });
        ml.innerHTML = btns(eo); bind(ml, eo, k => { place = k; vue = 'place'; draw(); });
        sh.querySelector('#m-opt').onclick = () => { const pris = optimiser(h); note = esc(pris.length ? t('equipe.optimise', { nom, liste: pris.join(', ') }) : t('equipe.optimise.rien', { nom })); draw(); };
      }
      if (onglet === 'job') {
        const o = classesJouables().map(j => {
          const J = CLASSES[j];
          if (!S.jobs.includes(j)) return { k: j, ic: 'lock', label: esc(J.cachee ? '???' : t('classe.' + j)), sub: esc(existe('classe.' + j + '.verrou') ? t('classe.' + j + '.verrou') : t('equipe.verrouillee')), dis: true };
          const tmp = { ...h, job: j, eq: { ...h.eq } };
          for (const p of ['arme', 'armure']) if (tmp.eq[p] && !canWear(tmp, tmp.eq[p], j)) tmp.eq[p] = null;
          return { k: j, ic: 'star', label: esc(t('classe.' + j)) + (j === h.job ? ' ' + esc(t('equipe.actuelle')) : ''), sub: esc(t('classe.' + j + '.desc')) + (j === h.job ? '' : ' ' + diffTxt(s, stats(tmp))), cls: j === h.job ? 'main' : '' };
        });
        ml.innerHTML = btns(o);
        bind(ml, o, j => {
          if (j === h.job) return;
          h.job = j; let msg = '';
          for (const p of ['arme', 'armure']) { const id = h.eq[p]; if (id && !canWear(h, id)) { addEq(id); h.eq[p] = null; msg += ' ' + t('equipe.retour.sac', { nom: nomEq(id) }); } }
          clampC(h); save(); note = esc(t('equipe.devient', { nom, classe: t('classe.' + j) }) + msg); draw();
        });
      }
    }
    if (vue === 'place') {
      const actuel = h.eq[place];
      const ids = Object.keys(S.bag).filter(k => S.bag[k] > 0 && EQUIPEMENT[k].place === place);
      const o = ids.map(id => {
        const ok = canWear(h, id), tmp = { ...h, eq: { ...h.eq, [place]: id } };
        return { k: id, ic: icPlace(place), label: esc(`${nomEq(id)} ×${S.bag[id]}`), sub: ok ? diffTxt(s, stats(tmp)) : esc(EQUIPEMENT[id].heros && EQUIPEMENT[id].heros !== h.id ? t('equipe.pas.heros', { nom: t('parle.' + EQUIPEMENT[id].heros) }) : t('equipe.pas.pour', { classe: t('classe.' + h.job), qui: wearers(id) })), dis: !ok };
      });
      if (actuel) o.unshift({ k: '__off', ic: 'x', label: esc(t('equipe.retirer')), sub: esc(t('equipe.retour.sac', { nom: nomEq(actuel) })) + ' · ' + diffTxt(s, stats({ ...h, eq: { ...h.eq, [place]: null } })), cls: 'ghost' });
      ml.innerHTML = o.length ? btns(o) : `<p class="note">${esc(t('equipe.place.vide'))}</p>`;
      bind(ml, o, id => { if (actuel) addEq(actuel); if (id === '__off') h.eq[place] = null; else { S.bag[id]--; h.eq[place] = id; } clampC(h); save(); vue = 'main'; draw(); });
    }
  };
  draw();
}

/* ---------- Inventaire ---------- */
function importants() {
  return Object.keys(IMPORTANTS).filter(id => S.imp.includes(id)).map(id => {
    const m = IMPORTANTS[id].mystere, cache = m && !cond(m);
    return [cache ? '???' : t('important.' + id), cache ? t('inventaire.mystere') : t('important.' + id + '.desc')];
  });
}
function openInv(tab) {
  let note = '', filtre = 'tout';
  const draw = () => {
    let body = '';
    if (tab === 'obj') {
      const ks = Object.keys(OBJETS).filter(k => S.inv[k] > 0);
      body = (note ? `<div class="msgline">${note}</div>` : '') + (ks.length ? `<p class="note">${esc(t(B ? 'inventaire.combat' : 'inventaire.visage'))}</p><div class="list">${ks.map(k => {
        const it = OBJETS[k];
        // la jauge qui compte pour cet objet : PV pour un soin, PP pour un tonique
        const qui = team().map(h => {
          const s = stats(h), pv = it.hp && !it.pp, v = pv || it.hp ? [h.hp, s.hp, 'stat.hp'] : [h.pp, s.pp, 'stat.pp'];
          const plein = (!it.hp || h.hp >= s.hp) && (!it.pp || h.pp >= s.pp);
          return `<button class="hdon ${plein ? 'plein' : ''}" data-u="${k}" data-h="${h.id}" ${B ? 'disabled' : ''}><img alt="" src="${vignette(h)}"><span><b>${esc(nomH(h))}</b><small>${v[0]}/${v[1]} ${esc(t(v[2]))}</small></span></button>`;
        }).join('');
        return `<div class="objc"><div class="objc-h"><b>${esc(`${t('objet.' + k)} ×${S.inv[k]}`)}</b><span class="note">${esc(t('objet.' + k + '.desc'))}</span></div><div class="hdons">${qui}</div></div>`;
      }).join('')}</div>` : `<p class="note">${esc(t('inventaire.vide'))}</p>`);
    } else if (tab === 'eq') {
      const garde = id => filtre === 'tout' || EQUIPEMENT[id].place === filtre;
      const sac = Object.keys(S.bag).filter(k => S.bag[k] > 0 && garde(k)), porte = [];
      for (const h of team()) for (const p of PLACES_EQ) if (h.eq[p] && garde(h.eq[p])) porte.push([h, h.eq[p]]);
      const ligne = (id, n, droite) => `<div class="eqr"><b>${esc(nomEq(id))}${n ? ' ×' + n : ''}</b><span class="note">${esc(stTxt(EQUIPEMENT[id].st, EQUIPEMENT[id].el))}</span>${droite}</div>`;
      const meilleur = id => { const g = team().map(h => [h, gainEq(h, id)]).filter(([, g]) => g !== null && g > 0).sort((a, b) => b[1] - a[1])[0]; return g ? `<span class="up">${esc(nomH(g[0]))} +${g[1]}</span>` : ''; };
      body = `<div class="tabs filtres">${['tout', ...PLACES_EQ].map(f => `<button class="tab txt ${filtre === f ? 'on' : ''}" data-f="${f}">${esc(t(f === 'tout' ? 'inventaire.tout' : 'boutique.onglet.' + f))}</button>`).join('')}</div>
        <h3 class="sec">${esc(t('inventaire.sac'))}</h3><div class="list">${sac.length ? sac.map(k => ligne(k, S.bag[k], meilleur(k))).join('') : `<p class="note">${esc(t('inventaire.sac.vide'))}</p>`}</div>
        <h3 class="sec">${esc(t('inventaire.porte'))}</h3><div class="list">${porte.map(([h, k]) => ligne(k, 0, `<span class="note">${esc(t('inventaire.porte.par', { nom: nomH(h) }))}</span>`)).join('')}</div>
        <p class="note">${esc(t('inventaire.eq.aide'))}</p>`;
    } else {
      const k = importants();
      body = `<div class="list">${k.length ? k.map(([n, d]) => `<div class="irow key"><span class="ic">${ic('star')}</span><div><b>${esc(n)}</b><small>${html(d)}</small></div><span></span></div>`).join('') : `<p class="note">${esc(t('inventaire.imp.vide'))}</p>`}</div>`;
    }
    const sh = modal('grand', `<div class="sheet-h"><div class="ptitle">${esc(t('menu.inventaire'))}</div><span class="pillv gold">${ic('coin')}${S.gold} ${esc(t('po'))}</span><button class="ibtn" id="mclose" aria-label="${esc(t('fermer'))}">${ic('x')}</button></div>
      <div class="tabs">${[['obj', 'inventaire.objets'], ['eq', 'inventaire.equipement'], ['key', 'inventaire.importants']].map(([k, c]) => `<button class="tab txt ${tab === k ? 'on' : ''}" data-t="${k}">${esc(t(c))}</button>`).join('')}</div>` + body);
    note = '';
    sh.querySelector('#mclose').onclick = fermerFenetre;
    sh.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; draw(); });
    sh.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { filtre = b.dataset.f; draw(); });
    sh.querySelectorAll('[data-u]').forEach(b => b.onclick = () => {
      const k = b.dataset.u, id = b.dataset.h;
      utiliserObjet(k, char(id)); SON.bruitage('soin'); note = esc(t('inventaire.utilise', { nom: t('parle.' + id), objet: t('objet.' + k) })); draw();
    });
  };
  draw();
}

/* ---------- Codex ---------- */
function openCodex(tab) {
  const draw = () => {
    let body = '';
    if (tab === 'best') body = `<p class="note">${esc(t('codex.aide'))}</p><div class="list">${Object.keys(MONSTRES).map(id => {
      const c = S.codex[id], d = MONSTRES[id], b = best(id);
      if (!c) return `<div class="bst unseen"><span></span><div><h4>???</h4><p>${esc(t('codex.inconnu'))}</p></div></div>`;
      const w = d.faible.map(el => b.weak.includes(el) ? elChip(el) : '<span class="elc unk">?</span>').join(''), r = b.res.map(el => `<span class="elc ${el} res">${el}</span>`).join('');
      return `<div class="bst"><img alt="" class="${(IMAGES['monstre.' + id] || {}).brume ? 'echo' : ''}" src="${imgSrc('monstre.' + id)}"><div><h4>${esc(t('monstre.' + id))}</h4><p>${tx('monstre.' + id + '.desc')} ${esc(t('codex.vaincus', { n: c.kills }))}</p><div class="erow"><span class="note">${esc(t('codex.faiblesses'))}</span>${w}${r ? `<span class="note gauche">${esc(t('codex.resiste'))}</span>${r}` : ''}</div></div></div>`;
    }).join('')}</div>`;
    else if (tab === 'classes') body = classesHtml();
    else if (tab === 'perso') body = persoHtml();
    else body = helpHtml();
    const onglet = (k, nom, neuf) => `<button class="tab txt ${tab === k ? 'on' : ''}" data-t="${k}">${esc(nom)}${neuf ? '<span class="pastille"></span>' : ''}</button>`;
    const sh = modal('grand', sheetHead(t('menu.codex')) + `<div class="tabs">${onglet('best', t('codex.bestiaire'))}${onglet('classes', t('codex.classes'))}${onglet('perso', t('codex.perso'), persoNouveautes())}${onglet('help', t('aide.titre'))}</div>` + body);
    sh.querySelector('#mclose').onclick = closeModal;
    sh.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; draw(); });
    // déplier un personnage marque ses infos comme lues : les pastilles s'éteignent, les nouvelles infos restent surlignées
    sh.querySelectorAll('details[data-p]').forEach(d => d.addEventListener('toggle', () => {
      if (!d.open) return;
      S.perso[d.dataset.p] = infosPerso(d.dataset.p).length; save();
      d.querySelector('summary .pastille')?.remove();
      if (!persoNouveautes()) sh.querySelector('.tab .pastille')?.remove();
      hud();
    }));
  };
  draw();
}
// classes débloquées, leurs armes, leurs statistiques et leurs techniques ; les autres restent verrouillées
function classesHtml() {
  const pct = (k, v) => t('codex.pct', { stat: t('stat.' + k), v: (v > 1 ? '+' : '−') + Math.round(Math.abs(v - 1) * 100) });
  const elTxt = el => el === 'X' ? t('codex.el.X') : el === 'LX' ? t('element.L') + ' + ' + t('codex.el.X') : el === 'Z' ? t('codex.el.Z') : el ? t('element.' + el) : '';
  return `<p class="note">${esc(t('codex.classes.aide'))}</p><div class="list">${classesJouables().map(j => {
    const J = CLASSES[j];
    if (!S.jobs.includes(j)) return `<div class="cls unseen"><h4>???</h4><p>${esc(t('codex.classe.inconnue'))}</p></div>`;
    const qui = team().filter(h => h.job === j).map(nomH), mods = Object.entries(J.mod).filter(([, v]) => v !== 1);
    const techs = J.tech.map(id => {
      const x = TECHNIQUES[id], el = elTxt(x.el), c = x.el ? ' el-' + x.el.slice(-1) : '';
      return `<div class="ctech${c}"><span class="ic">${ic(icTech(x))}</span><div><b>${esc(t('tech.' + id))}</b><small>${esc(`${x.pp} ${t('stat.pp')}${el ? ' · ' + el : ''} · ${t('tech.' + id + '.desc')}`)}</small></div></div>`;
    }).join('');
    // repliable : le nom de la classe, puis le détail une fois dépliée
    return `<details class="cls"><summary>${esc(t('classe.' + j))}${qui.length ? ` <span class="note">· ${esc(qui.join(', '))}</span>` : ''}</summary><div class="cls-corps"><p>${esc(t('classe.' + j + '.desc'))}</p>
      <p>${esc(t('codex.armes', { liste: J.armes.map(a => t('codex.arme.' + a)).join(', ') }))}<br>${esc(mods.length ? mods.map(([k, v]) => pct(k, v)).join(', ') : t('codex.equilibre'))}</p>${techs}</div></details>`;
  }).join('')}</div>`;
}
// personnages importants : chacun se déplie sur ce qu'on sait de lui à ce point de l'histoire
function persoHtml() {
  return `<p class="note">${esc(t('codex.perso.aide'))}</p><div class="list">${persoConnus().map(id => {
    const lus = S.perso[id] || 0;
    const infos = infosPerso(id).map((i, n) => `<p class="${n >= lus ? 'neuf' : ''}">${tx(`perso.${id}.${i + 1}`)}</p>`).join('');
    return `<details class="cls perso" data-p="${id}"><summary>${av(id, 'sm')}${esc(t('parle.' + id))}${persoNouveau(id) ? '<span class="pastille"></span>' : ''}</summary><div class="cls-corps">${infos}</div></details>`;
  }).join('')}</div>`;
}
function helpHtml() {
  const L = k => tx('aide.' + k);
  return `<div class="legend">
  <span><span class="chip h ${(IMAGES['heros.kael'] || {}).portrait ? 'face' : ''}"><img alt="" src="${vignette({ id: 'kael' })}"></span><span class="chip e"><img alt="" src="${imgSrc('monstre.loup')}"></span></span><span>${L('tours')}</span>
  <span><span class="shield">2</span></span><span>${L('garde')}</span>
  <span><span class="brk">${esc(t('combat.brise.court'))}</span></span><span>${L('brise')}</span>
  <span>${elChip('L')}${elChip('T')}${elChip('F')}${elChip('E')}${elChip('V')}</span><span>${L('elements')}</span>
  <span><span class="elc unk">?</span></span><span>${L('inconnue')}</span>
  <span><span class="elc F res">F</span></span><span>${L('resistance')}</span>
  <span><span class="pips"><b class="on"></b><b class="on"></b><b></b></span></span><span>${L('union')}</span>
  <span class="chain grasse">+</span><span>${L('chaine')}</span>
  <span class="vert">${ic('play').replace('<svg', '<svg width="18" height="18"')}</span><span>${L('auto')}</span></div>
  <h3 class="sec">${esc(t('aide.stats'))}</h3><div class="list">${[...STATS, 'xp'].map(k => `<p class="note"><b class="clair">${esc(t(k === 'xp' ? 'equipe.xp' : 'stat.' + k))}</b> : ${esc(t('stat.' + k + '.aide'))}</p>`).join('')}</div>`;
}
function openHelp(premier) {
  return new Promise(res => {
    const sh = modal(sheetHead(t(premier ? 'aide.premier' : 'aide.titre')) + (premier ? `<p class="ptext">${tx('aide.intro')}</p>` : '') + helpHtml() +
      `<div class="acts"><button class="btn main wide" id="m-ok"><span class="ic">${ic('sword')}</span><span class="tx"><span>${esc(t('aide.ok'))}</span></span></button></div>`);
    const fin = () => { if (TW) TW(); closeModal(); res(); };
    sh.querySelector('#mclose').onclick = fin; sh.querySelector('#m-ok').onclick = fin;
    if (premier) typeIn(sh);
  });
}

/* ---------- Journal ---------- */
// une ligne du journal : [temps, repère, valeurs] ; une valeur qui est un repère de texte est traduite
function ligneJournal([temps, cle, v]) {
  const o = {};
  if (v) for (const k in v) o[k] = typeof v[k] === 'string' && existe(v[k]) ? t(v[k]) : v[k];
  return `<div><span>${fmt(temps)}</span>${tx(cle, o)}</div>`;
}
// une quête repliable : son nom, puis ses étapes une fois dépliée
function queteRepliable(nom, etapes, fini) {
  return `<details class="quete ${fini ? 'finie' : ''}"><summary>${esc(nom)}</summary><ul class="qlist">${etapes.map(([titre, ok]) => `<li class="${ok ? 'done' : 'cur'}">${esc(titre)}</li>`).join('')}</ul></details>`;
}
function openJournal() {
  const st = S.st, cur = etapeCourante(), enCours = [], finies = [];
  for (const a of ACTES) {
    const vus = a.etapes.filter(e => fini(e.id) || e === cur);
    if (!vus.length) continue;
    const toutes = a.etapes.every(e => fini(e.id));
    (toutes ? finies : enCours).push(queteRepliable(t('journal.acte', { n: ACTES.indexOf(a) + 1, titre: t(a.id + '.titre') }), vus.map(e => [t(e.id + '.titre'), fini(e.id)]), toutes));
  }
  for (const id in ANNEXES) {
    const n = annexeEtat(id); if (!n) continue;
    const ok = annexeFinie(id);
    // une étape en désordre (parmi) montre chacun de ses morceaux, cochés quand ils sont faits
    const suite = ANNEXES[id].etapes.slice(0, n).flatMap((e, i) => e.parmi
      ? e.parmi.map((m, j) => [t(`${id}.e${i + 1}.m${j + 1}.titre`), i + 1 < n || morceauxFaits(id).includes(j)])
      : [[t(`${id}.e${i + 1}.titre`), i + 1 < n]]);
    (ok ? finies : enCours).push(queteRepliable(t('journal.annexe', { titre: t(id + '.titre') }), suite, ok));
  }
  let quetes = `<h3 class="sec">${esc(t('journal.encours'))}</h3>${enCours.join('') || `<p class="note">${esc(t(cur ? 'journal.aucune' : 'journal.tout.fini'))}</p>`}`;
  if (finies.length) quetes += `<details class="terminees"><summary>${esc(t('journal.terminees', { n: finies.length }))}</summary><div class="list">${finies.join('')}</div></details>`;
  const zones = Object.keys(S.z).filter(id => lieuVisible(id) && S.z[id].visits).map(id => `${nomLieu(id)} ${pct(id)} %`).join(' · ');
  const sh = modal('grand', sheetHead(t('menu.journal')) + quetes + `
   <h3 class="sec">${esc(t('journal.bilan'))}</h3><div class="stats"><div class="stat"><b>${fmt(st.time)}</b><span>${esc(t('stats.temps'))}</span></div><div class="stat"><b>${st.fights}</b><span>${esc(t('stats.combats'))}</span></div><div class="stat"><b>${st.explores}</b><span>${esc(t('stats.explorations'))}</span></div><div class="stat"><b>${S.plus ? '+' + S.plus : '–'}</b><span>${esc(t('stats.plus'))}</span></div></div>
   ${zones ? `<p class="note">${esc(zones)}</p>` : ''}
   <div class="log">${st.log.slice().reverse().map(ligneJournal).join('') || esc(t('journal.vide'))}</div>`);
  sh.querySelector('#mclose').onclick = closeModal;
}

/* ---------- Options ---------- */
const VITESSES = ['normal', 'rapide', 'instant'];
const volTexte = v => v ? v + ' / 10' : t('options.coupe');
function openOptions(vue) {
  let confirmer = false;
  const draw = () => {
    if (vue === 'notes') {
      const sh = modal('grand', sheetHead(t('options.notes')) + `<div class="notes">${lignes('notes.version').map(l => l.startsWith('##') ? `<h3 class="sec">${html(l.replace(/^##\s*/, ''))}</h3>` : `<p class="note">${html(l)}</p>`).join('')}</div>
        <div class="acts"><button class="btn ghost wide" id="m-back"><span class="ic">${ic('back')}</span><span class="tx"><span>${esc(t('retour'))}</span></span></button></div>`);
      sh.querySelector('#mclose').onclick = closeModal; sh.querySelector('#m-back').onclick = () => { vue = null; draw(); };
      return;
    }
    if (vue === 'son') {
      const ligne = k => `<div class="vol"><div class="vol-h"><b>${esc(t('options.' + k))}</b><span id="v-${k}">${esc(volTexte(OPT[k]))}</span></div>
        <input type="range" min="0" max="10" step="1" value="${OPT[k]}" data-k="${k}" aria-label="${esc(t('options.' + k))}"></div>`;
      const sh = modal('grand', sheetHead(t('options.son')) + `<div class="vols">${ligne('musique')}${ligne('bruitages')}</div><p class="note">${esc(t('options.son.note'))}</p>
        <div class="acts"><button class="btn ghost wide" id="m-back"><span class="ic">${ic('back')}</span><span class="tx"><span>${esc(t('retour'))}</span></span></button></div>`);
      sh.querySelectorAll('input[type=range]').forEach(r => {
        r.oninput = () => { OPT[r.dataset.k] = +r.value; sh.querySelector('#v-' + r.dataset.k).textContent = volTexte(OPT[r.dataset.k]); SON.volumes(); };
        r.onchange = () => { sauverOptions(); if (r.dataset.k === 'bruitages') SON.bruitage('trouve'); };
      });
      sh.querySelector('#mclose').onclick = closeModal; sh.querySelector('#m-back').onclick = () => { vue = null; draw(); };
      return;
    }
    const enJeu = S && S.screen !== 'title', libre = !busy && !B;
    const o = [
      { k: 'lang', ic: 'globe', label: esc(t('options.langue')), sub: esc(t('options.langue.sous')) },
      { k: 'texte', ic: 'scroll', label: esc(t('options.texte', { v: t('options.texte.' + OPT.texte) })), sub: esc(t('options.texte.sous')) },
      { k: 'son', ic: 'note', label: esc(t('options.son')), sub: esc(t('options.son.sous', { m: volTexte(OPT.musique), b: volTexte(OPT.bruitages) })) },
      { k: 'rapide', ic: 'play', label: esc(t(OPT.rapide ? 'options.combats.rapides' : 'options.combats.normaux')), sub: esc(t('options.combats.sous')) },
      { k: 'save', ic: 'save', label: esc(t('options.sauvegarde')), sub: esc(t('options.sauvegarde.sous')) },
      { k: 'notes', ic: 'book', label: esc(t('options.notes')), sub: esc(t('options.notes.sous', { v: VERSION })) },
      { k: 'bug', ic: 'bug', label: esc(t('options.bug')), sub: esc(t('options.bug.sous')) },
      { k: 'soutien', ic: 'heart', label: esc(t('options.soutien')), sub: esc(t('options.soutien.sous')) }
    ];
    if (enJeu) o.push({ k: 'titre', ic: 'home', label: esc(t('options.titre')), sub: esc(t('options.titre.sous')), dis: !libre });
    if (S && (enJeu || loadSave())) o.push({ k: 'reset', ic: 'x', label: esc(t(confirmer ? 'options.reset.confirmer' : 'options.reset')), sub: esc(t(confirmer ? 'options.reset.confirmer.sous' : 'options.reset.sous')), dis: !libre, cls: confirmer ? 'danger' : '' });
    if (DEBUG) o.push({ k: 'debug', ic: 'bug', label: esc(t('debug.titre')), sub: esc(t('debug.sous')), cls: 'ghost', dis: !libre });
    const sh = modal('grand', sheetHead(t('menu.options')) + `<div class="acts" id="o-list"></div><p class="note centre">Lanterval ${esc(VERSION)} · Keismey Studio</p>`);
    sh.querySelector('#mclose').onclick = fermerFenetre;
    const el = sh.querySelector('#o-list'); el.innerHTML = btns(o);
    bind(el, o, k => {
      if (k === 'lang') { OPT.lang = LANG === 'fr' ? 'en' : 'fr'; sauverOptions(); choisirLangue(OPT.lang); document.documentElement.lang = LANG; hud(); if (libre) { closeModal(); renderStable(); openOptions(); } else draw(); }
      else if (k === 'texte') { OPT.texte = VITESSES[(VITESSES.indexOf(OPT.texte) + 1) % VITESSES.length]; sauverOptions(); draw(); }
      else if (k === 'rapide') { OPT.rapide = !OPT.rapide; sauverOptions(); draw(); }
      else if (k === 'save') { if (S && S.screen !== 'title') save(); KS.saveDialog({ jeu: 'Lanterval', keys: [CLE, CLE_SECOURS], lang: LANG }); }
      else if (k === 'notes') { vue = 'notes'; draw(); }
      else if (k === 'son') { vue = 'son'; draw(); }
      else if (k === 'bug') KS.bug('Lanterval', LANG);
      else if (k === 'soutien') KS.support();
      else if (k === 'titre') { save(); closeModal(); S.screen = 'title'; renderStable(); }
      else if (k === 'reset') {
        if (!confirmer) { confirmer = true; draw(); return; }
        closeModal(); effacerPartie(); S = newState(); renderStable();
      }
      else if (k === 'debug') { closeModal(); openDebug(); }
    });
  };
  draw();
}
