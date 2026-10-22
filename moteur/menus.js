/* Lanterval · les fenêtres : Équipe, Inventaire, Codex, Journal, Options, aide au combat. */

const icPlace = p => p === 'arme' ? 'sword' : p === 'armure' ? 'shield' : 'spark';
function fermerFenetre() { closeModal(); if (!busy && !B) renderStable(); }
function diffTxt(a, b) {
  return STATS.map(k => { const d = b[k] - a[k]; return d ? `<span class="${d > 0 ? 'up' : 'dn'}">${esc(t('stat.' + k))} ${d > 0 ? '+' : ''}${d}</span>` : ''; }).filter(Boolean).join(' · ') || esc(t('equipe.pareil'));
}
function utiliserObjet(k, h) { const it = OBJETS[k], s = stats(h); S.inv[k]--; if (it.hp) h.hp = Math.min(s.hp, h.hp + it.hp); if (it.pp) h.pp = Math.min(s.pp, h.pp + it.pp); save(); hud(); }

/* ---------- Équipe ---------- */
function openParty() {
  const T = team(); let cur = T[0].id, vue = 'main', place = null, note = '';
  const draw = () => {
    const h = char(cur), s = stats(h), el = HEROS[cur].el, nom = t('parle.' + cur);
    let body = '';
    if (vue === 'main') {
      body = `<div class="join">${av(cur, 'lg')}<div><div class="jn">${esc(nom)} <small class="niv">${esc(t('equipe.niveau', { n: h.lvl, xp: h.xp, max: need(h.lvl) }))}</small></div>
        <div class="chips">${elChip(el)}<span class="pill">${esc(t('element.' + el))}</span><span class="pill">${esc(t('classe.' + h.job))}</span><span class="pill">${esc(t('heros.' + cur + '.age'))}</span></div><p class="note">${tx('heros.' + cur + '.bio')}</p></div></div>
      ${note ? `<div class="msgline">${note}</div>` : ''}
      <div class="statg">${['hp', 'pp', 'spd', 'atk', 'mag', 'def'].map(k => `<div class="st"><span>${esc(t('stat.' + k))}</span><b>${k === 'hp' ? h.hp + '/' + s.hp : k === 'pp' ? h.pp + '/' + s.pp : s[k]}</b></div>`).join('')}</div>
      <h3 class="sec">${esc(t('equipe.classe'))}</h3><div class="acts" id="m-job"></div>
      <h3 class="sec">${esc(t('equipe.equipement'))}</h3><div class="acts" id="m-eq"></div>
      <h3 class="sec">${esc(t('equipe.techniques'))}</h3><div class="list">${CLASSES[h.job].tech.map(id => `<p class="note"><b class="clair">${esc(t('tech.' + id))}</b> · ${TECHNIQUES[id].pp} ${esc(t('stat.pp'))} · ${tx('tech.' + id + '.desc')}</p>`).join('')}</div>
      <h3 class="sec">${esc(t('equipe.sac'))}</h3><div class="acts" id="m-items"></div>`;
    } else body = `<p class="note">${vue === 'job' ? tx('equipe.classe.aide', { nom, el: t('element.' + el) }) : tx('equipe.place.aide', { place: t('place.' + place), nom, classe: t('classe.' + h.job) })}</p><div class="acts" id="m-list"></div>
      <div class="acts"><button class="btn ghost wide" id="m-back"><span class="ic">${ic('back')}</span><span class="tx"><span>${esc(t('retour'))}</span></span></button></div>`;
    const titre = vue === 'main' ? t('menu.equipe') : vue === 'job' ? t('equipe.changer.classe') : t('equipe.changer', { place: t('place.' + place) });
    const sh = modal(sheetHead(titre) + `<div class="tabs">${T.map(x => `<button class="tab ${x.id === cur ? 'on' : ''}" data-c="${x.id}">${av(x.id, 'sm')}${esc(t('parle.' + x.id))}</button>`).join('')}</div>` + body);
    note = '';
    sh.querySelector('#mclose').onclick = fermerFenetre;
    sh.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { cur = b.dataset.c; draw(); });
    if (vue !== 'main') sh.querySelector('#m-back').onclick = () => { vue = 'main'; draw(); };
    if (vue === 'main') {
      const jo = [{ k: 'job', ic: 'star', label: esc(t('classe.' + h.job)), sub: esc(t('classe.' + h.job + '.desc') + ' ' + t('equipe.toucher')), cls: 'wide' }];
      const mj = sh.querySelector('#m-job'); mj.innerHTML = btns(jo); bind(mj, jo, () => { vue = 'job'; draw(); });
      const eo = PLACES_EQ.map(p => { const id = h.eq[p]; return { k: p, ic: icPlace(p), label: esc(id ? nomEq(id) : t('equipe.rien')), sub: esc(t('place.' + p) + (id ? ' · ' + stTxt(EQUIPEMENT[id].st) : '')) }; });
      const me = sh.querySelector('#m-eq'); me.innerHTML = btns(eo); bind(me, eo, k => { place = k; vue = 'place'; draw(); });
      const io = Object.keys(OBJETS).filter(k => S.inv[k] > 0).map(k => ({ k, ic: 'heart', label: esc(`${t('objet.' + k)} ×${S.inv[k]}`), sub: esc(t('objet.' + k + '.desc') + ' · ' + t('equipe.utiliser', { nom })) }));
      const mi = sh.querySelector('#m-items'); mi.innerHTML = io.length ? btns(io) : `<p class="note">${esc(t('equipe.sac.vide'))}</p>`;
      bind(mi, io, k => { utiliserObjet(k, h); draw(); });
    }
    if (vue === 'job') {
      const o = Object.keys(CLASSES).map(j => {
        const J = CLASSES[j];
        if (!S.jobs.includes(j)) return { k: j, ic: 'lock', label: esc(J.cachee ? '???' : t('classe.' + j)), sub: esc(existe('classe.' + j + '.verrou') ? t('classe.' + j + '.verrou') : t('equipe.verrouillee')), dis: true };
        const tmp = { ...h, job: j, eq: { ...h.eq } };
        for (const p of ['arme', 'armure']) if (tmp.eq[p] && !canWear(tmp, tmp.eq[p], j)) tmp.eq[p] = null;
        return { k: j, ic: 'star', label: esc(t('classe.' + j)) + (j === h.job ? ' ' + esc(t('equipe.actuelle')) : ''), sub: esc(t('classe.' + j + '.desc')) + (j === h.job ? '' : ' ' + diffTxt(s, stats(tmp))), dis: j === h.job };
      });
      const el = sh.querySelector('#m-list'); el.innerHTML = btns(o);
      bind(el, o, j => {
        h.job = j; let msg = '';
        for (const p of ['arme', 'armure']) { const id = h.eq[p]; if (id && !canWear(h, id)) { addEq(id); h.eq[p] = null; msg += ' ' + t('equipe.retour.sac', { nom: nomEq(id) }); } }
        clampC(h); save(); note = esc(t('equipe.devient', { nom, classe: t('classe.' + j) }) + msg); vue = 'main'; draw();
      });
    }
    if (vue === 'place') {
      const actuel = h.eq[place];
      const ids = Object.keys(S.bag).filter(k => S.bag[k] > 0 && EQUIPEMENT[k].place === place);
      const o = ids.map(id => {
        const ok = canWear(h, id), tmp = { ...h, eq: { ...h.eq, [place]: id } };
        return { k: id, ic: icPlace(place), label: esc(`${nomEq(id)} ×${S.bag[id]}`), sub: ok ? diffTxt(s, stats(tmp)) : esc(t('equipe.pas.pour', { classe: t('classe.' + h.job), qui: wearers(id) })), dis: !ok };
      });
      if (actuel) o.unshift({ k: '__off', ic: 'x', label: esc(t('equipe.retirer')), sub: esc(t('equipe.retour.sac', { nom: nomEq(actuel) })) + ' · ' + diffTxt(s, stats({ ...h, eq: { ...h.eq, [place]: null } })), cls: 'ghost' });
      const el = sh.querySelector('#m-list'); el.innerHTML = o.length ? btns(o) : `<p class="note">${esc(t('equipe.place.vide'))}</p>`;
      bind(el, o, id => { if (actuel) addEq(actuel); if (id === '__off') h.eq[place] = null; else { S.bag[id]--; h.eq[place] = id; } clampC(h); save(); vue = 'main'; draw(); });
    }
  };
  draw();
}

/* ---------- Inventaire ---------- */
function irow(icon, name, sub, qty, cls) { return `<div class="irow ${cls || ''}"><span class="ic">${ic(icon)}</span><div><b>${name}</b>${sub ? `<small>${sub}</small>` : ''}</div><span class="qty">${qty || ''}</span></div>`; }
function importants() {
  return Object.keys(IMPORTANTS).filter(id => S.imp.includes(id)).map(id => {
    const m = IMPORTANTS[id].mystere, cache = m && !cond(m);
    return [cache ? '???' : t('important.' + id), cache ? t('inventaire.mystere') : t('important.' + id + '.desc')];
  });
}
function openInv(tab) {
  let pour = null, note = '';
  const draw = () => {
    let body = '';
    if (tab === 'obj') {
      const ks = Object.keys(OBJETS).filter(k => S.inv[k] > 0);
      if (pour) body = `<p class="note">${esc(t('combat.cible.allie', { quoi: t('objet.' + pour) }))}</p><div class="acts" id="i-who"></div>`;
      else body = (note ? `<div class="msgline">${note}</div>` : '') + (ks.length ? `<div class="acts" id="i-list"></div><p class="note">${esc(t(B ? 'inventaire.combat' : 'inventaire.toucher'))}</p>` : `<p class="note">${esc(t('inventaire.vide'))}</p>`);
    } else if (tab === 'eq') {
      const sac = Object.keys(S.bag).filter(k => S.bag[k] > 0), porte = [];
      for (const h of team()) for (const p of PLACES_EQ) if (h.eq[p]) porte.push([h, p, h.eq[p]]);
      body = `<h3 class="sec">${esc(t('inventaire.sac'))}</h3><div class="list">${sac.length ? sac.map(k => irow(icPlace(EQUIPEMENT[k].place), esc(nomEq(k)), esc(`${t('place.' + EQUIPEMENT[k].place)} · ${stTxt(EQUIPEMENT[k].st)} · ${wearers(k)}`), '×' + S.bag[k])).join('') : `<p class="note">${esc(t('inventaire.sac.vide'))}</p>`}</div>
        <h3 class="sec">${esc(t('inventaire.porte'))}</h3><div class="list">${porte.map(([h, p, k]) => irow(icPlace(p), esc(nomEq(k)), esc(`${t('parle.' + h.id)} · ${t('place.' + p)} · ${stTxt(EQUIPEMENT[k].st)}`))).join('')}</div>
        <p class="note">${esc(t('inventaire.eq.aide'))}</p>`;
    } else {
      const k = importants();
      body = `<div class="list">${k.length ? k.map(([n, d]) => irow('star', esc(n), html(d), '', 'key')).join('') : `<p class="note">${esc(t('inventaire.imp.vide'))}</p>`}</div>`;
    }
    const sh = modal(sheetHead(t('menu.inventaire')) + `<div class="tabs">${[['obj', 'inventaire.objets'], ['eq', 'inventaire.equipement'], ['key', 'inventaire.importants']].map(([k, c]) => `<button class="tab txt ${tab === k ? 'on' : ''}" data-t="${k}">${esc(t(c))}</button>`).join('')}</div>
      <div class="row bourse"><span class="note">${esc(t('inventaire.bourse'))}</span><b>${S.gold} ${esc(t('po'))}</b></div>` + body);
    note = '';
    sh.querySelector('#mclose').onclick = fermerFenetre;
    sh.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; pour = null; draw(); });
    const il = sh.querySelector('#i-list');
    if (il) { const o = Object.keys(OBJETS).filter(k => S.inv[k] > 0).map(k => ({ k, ic: 'heart', label: esc(`${t('objet.' + k)} ×${S.inv[k]}`), sub: esc(t('objet.' + k + '.desc')), dis: !!B })); il.innerHTML = btns(o); bind(il, o, k => { pour = k; draw(); }); }
    const iw = sh.querySelector('#i-who');
    if (iw) {
      const o = team().map(h => { const s = stats(h); return { k: h.id, img: vignette(h), label: esc(t('parle.' + h.id)), sub: esc(`${h.hp}/${s.hp} ${t('stat.hp')} · ${h.pp}/${s.pp} ${t('stat.pp')}`) }; });
      o.push({ k: null, ic: 'back', label: esc(t('retour')), cls: 'ghost' });
      iw.innerHTML = btns(o);
      bind(iw, o, id => { if (id) { utiliserObjet(pour, char(id)); note = esc(t('inventaire.utilise', { nom: t('parle.' + id), objet: t('objet.' + pour) })); } pour = null; draw(); });
    }
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
      return `<div class="bst"><img alt="" src="${imgSrc('monstre.' + id)}"><div><h4>${esc(t('monstre.' + id))}</h4><p>${tx('monstre.' + id + '.desc')} ${esc(t('codex.vaincus', { n: c.kills }))}</p><div class="erow"><span class="note">${esc(t('codex.faiblesses'))}</span>${w}${r ? `<span class="note gauche">${esc(t('codex.resiste'))}</span>${r}` : ''}</div></div></div>`;
    }).join('')}</div>`;
    else body = helpHtml();
    const sh = modal(sheetHead(t('menu.codex')) + `<div class="tabs"><button class="tab txt ${tab === 'best' ? 'on' : ''}" data-t="best">${esc(t('codex.bestiaire'))}</button><button class="tab txt ${tab === 'help' ? 'on' : ''}" data-t="help">${esc(t('aide.titre'))}</button></div>` + body);
    sh.querySelector('#mclose').onclick = closeModal;
    sh.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; draw(); });
  };
  draw();
}
function helpHtml() {
  const L = k => tx('aide.' + k);
  return `<div class="legend">
  <span><span class="chip h ${(IMAGES['heros.kael'] || {}).portrait ? 'face' : ''}"><img alt="" src="${vignette({ id: 'kael' })}"></span><span class="chip e"><img alt="" src="${imgSrc('monstre.loup')}"></span></span><span>${L('tours')}</span>
  <span><span class="shield">2</span></span><span>${L('garde')}</span>
  <span><span class="brk">${esc(t('combat.brise.court'))}</span></span><span>${L('brise')}</span>
  <span>${elChip('L')}${elChip('T')}${elChip('F')}${elChip('E')}</span><span>${L('elements')}</span>
  <span><span class="elc unk">?</span></span><span>${L('inconnue')}</span>
  <span><span class="elc F res">F</span></span><span>${L('resistance')}</span>
  <span><span class="pips"><b class="on"></b><b class="on"></b><b></b></span></span><span>${L('union')}</span>
  <span class="chain grasse">+</span><span>${L('chaine')}</span>
  <span class="vert">${ic('play').replace('<svg', '<svg width="18" height="18"')}</span><span>${L('auto')}</span></div>`;
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
function openJournal() {
  const st = S.st, cur = etapeCourante();
  let quetes = '';
  for (const a of ACTES) {
    const vus = a.etapes.filter(e => fini(e.id) || e === cur);
    if (!vus.length) continue;
    quetes += `<h3 class="sec">${esc(t('journal.acte', { n: ACTES.indexOf(a) + 1, titre: t(a.id + '.titre') }))}</h3><ul class="qlist">${vus.map(e => `<li class="${fini(e.id) ? 'done' : 'cur'}">${esc(t(e.id + '.titre'))}</li>`).join('')}</ul>`;
  }
  if (!cur) quetes += `<p class="note">${esc(t('journal.tout.fini'))}</p>`;
  for (const id in ANNEXES) {
    const n = annexeEtat(id); if (!n) continue;
    const E = ANNEXES[id].etapes;
    quetes += `<h3 class="sec">${esc(t('journal.annexe', { titre: t(id + '.titre') }))}</h3><ul class="qlist">${E.slice(0, n).map((e, i) => `<li class="${i + 1 < n ? 'done' : 'cur'}">${esc(t(`${id}.e${i + 1}.titre`))}</li>`).join('')}</ul>`;
  }
  const zones = Object.keys(S.z).filter(id => lieuVisible(id) && S.z[id].visits).map(id => `${nomLieu(id)} ${pct(id)} %`).join(' · ');
  const sh = modal(sheetHead(t('menu.journal')) + quetes + `
   <h3 class="sec">${esc(t('journal.classes'))}</h3><p class="note">${Object.keys(CLASSES).map(j => S.jobs.includes(j) ? `<b class="clair">${esc(t('classe.' + j))}</b>` : CLASSES[j].cachee ? esc(t('journal.secrete')) : esc(t('journal.verrouillee', { nom: t('classe.' + j) }))).join(' · ')}</p>
   <h3 class="sec">${esc(t('journal.bilan'))}</h3><div class="stats"><div class="stat"><b>${fmt(st.time)}</b><span>${esc(t('stats.temps'))}</span></div><div class="stat"><b>${st.fights}</b><span>${esc(t('stats.combats'))}</span></div><div class="stat"><b>${st.explores}</b><span>${esc(t('stats.explorations'))}</span></div><div class="stat"><b>${S.plus ? '+' + S.plus : '–'}</b><span>${esc(t('stats.plus'))}</span></div></div>
   ${zones ? `<p class="note">${esc(zones)}</p>` : ''}
   <div class="log">${st.log.slice().reverse().map(ligneJournal).join('') || esc(t('journal.vide'))}</div>`);
  sh.querySelector('#mclose').onclick = closeModal;
}

/* ---------- Options ---------- */
const VITESSES = ['normal', 'rapide', 'instant'];
function openOptions(vue) {
  let confirmer = false;
  const draw = () => {
    if (vue === 'notes') {
      const sh = modal(sheetHead(t('options.notes')) + `<div class="notes">${lignes('notes.version').map(l => l.startsWith('##') ? `<h3 class="sec">${html(l.replace(/^##\s*/, ''))}</h3>` : `<p class="note">${html(l)}</p>`).join('')}</div>
        <div class="acts"><button class="btn ghost wide" id="m-back"><span class="ic">${ic('back')}</span><span class="tx"><span>${esc(t('retour'))}</span></span></button></div>`);
      sh.querySelector('#mclose').onclick = closeModal; sh.querySelector('#m-back').onclick = () => { vue = null; draw(); };
      return;
    }
    const enJeu = S && S.screen !== 'title', libre = !busy && !B;
    const o = [
      { k: 'lang', ic: 'globe', label: esc(t('options.langue')), sub: esc(t('options.langue.sous')) },
      { k: 'texte', ic: 'scroll', label: esc(t('options.texte', { v: t('options.texte.' + OPT.texte) })), sub: esc(t('options.texte.sous')) },
      { k: 'rapide', ic: 'play', label: esc(t(OPT.rapide ? 'options.combats.rapides' : 'options.combats.normaux')), sub: esc(t('options.combats.sous')) },
      { k: 'save', ic: 'save', label: esc(t('options.sauvegarde')), sub: esc(t('options.sauvegarde.sous')) },
      { k: 'notes', ic: 'book', label: esc(t('options.notes')), sub: esc(t('options.notes.sous', { v: VERSION })) },
      { k: 'bug', ic: 'bug', label: esc(t('options.bug')), sub: esc(t('options.bug.sous')) },
      { k: 'soutien', ic: 'heart', label: esc(t('options.soutien')), sub: esc(t('options.soutien.sous')) }
    ];
    if (enJeu) o.push({ k: 'titre', ic: 'home', label: esc(t('options.titre')), sub: esc(t('options.titre.sous')), dis: !libre });
    if (S && (enJeu || loadSave())) o.push({ k: 'reset', ic: 'x', label: esc(t(confirmer ? 'options.reset.confirmer' : 'options.reset')), sub: esc(t(confirmer ? 'options.reset.confirmer.sous' : 'options.reset.sous')), dis: !libre, cls: confirmer ? 'danger' : '' });
    if (DEBUG) o.push({ k: 'debug', ic: 'bug', label: esc(t('debug.titre')), sub: esc(t('debug.sous')), cls: 'ghost', dis: !libre });
    const sh = modal(sheetHead(t('menu.options')) + `<div class="acts" id="o-list"></div><p class="note centre">Lanterval ${esc(VERSION)} · Keismey Studio</p>`);
    sh.querySelector('#mclose').onclick = fermerFenetre;
    const el = sh.querySelector('#o-list'); el.innerHTML = btns(o);
    bind(el, o, k => {
      if (k === 'lang') { OPT.lang = LANG === 'fr' ? 'en' : 'fr'; sauverOptions(); choisirLangue(OPT.lang); document.documentElement.lang = LANG; hud(); if (libre) { closeModal(); renderStable(); openOptions(); } else draw(); }
      else if (k === 'texte') { OPT.texte = VITESSES[(VITESSES.indexOf(OPT.texte) + 1) % VITESSES.length]; sauverOptions(); draw(); }
      else if (k === 'rapide') { OPT.rapide = !OPT.rapide; sauverOptions(); draw(); }
      else if (k === 'save') { if (S && S.screen !== 'title') save(); KS.saveDialog({ jeu: 'Lanterval', keys: [CLE, CLE_SECOURS], lang: LANG }); }
      else if (k === 'notes') { vue = 'notes'; draw(); }
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
