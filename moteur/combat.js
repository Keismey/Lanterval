/* Lanterval · les combats : tours selon la vitesse, faiblesses et garde, Union, enchaînement, mode auto.
   Les monstres et leurs capacités sont dans donnees/monstres.js, les techniques dans donnees/heros.js. */

const DEFAITE = { defaite: true };   // lancé quand toute l'équipe est à terre (voir run dans jeu.js)

const aliveE = () => B.enemies.filter(e => e.hp > 0), aliveH = () => B.team.filter(h => h.hp > 0), units = () => [...aliveH(), ...aliveE()];
const spd = u => u.isEnemy ? u.spd : B.st[u.id].spd;
const hs = h => B.st[h.id];
const nomH = h => t('parle.' + h.id);
const vignette = u => u.isEnemy ? imgSrc('monstre.' + u.id) : ((IMAGES['heros.' + u.id] || {}).portrait || imgSrc('heros.' + u.id));
const nomsEnnemis = () => B.enemies.map(e => e.name).join(', ');

// ordre des prochains tours (frise en haut de l'écran)
function predict(n) {
  const u = units().map(x => ({ u: x, t: x.next, rec: !!x.broken, chg: !!x.charged })), out = [];
  for (let i = 0; i < n && u.length; i++) {
    u.sort((a, b) => a.t - b.t || (a.u.isEnemy ? 1 : 0) - (b.u.isEnemy ? 1 : 0));
    const x = u[0]; out.push({ u: x.u, rec: x.rec, chg: x.chg && !x.rec }); x.rec = false; x.chg = false; x.t += 100 / spd(x.u);
  }
  return out;
}
function elChips(e) {
  const b = best(e.id); let s = '';
  for (const el of e.weak) s += b.weak.includes(el) ? elChip(el) : `<span class="elc unk" title="${esc(t('combat.inconnue'))}">?</span>`;
  for (const el of b.res) s += `<span class="elc ${el} res" title="${esc(t('combat.resiste.titre', { el: t('element.' + el) }))}">${el}</span>`;
  return s;
}
const chaine = () => B.streak > 0 ? (1 + .15 * Math.min(B.streak, 3)).toFixed(2) : null;
function bOverlay() {
  if (!B) return;
  const tl = predict(9); let prevH = false;
  const chips = tl.map((p, i) => {
    const ch = !p.u.isEnemy && prevH && i > 0; prevH = !p.u.isEnemy && !p.rec;
    return `<span class="chipw ${ch ? 'ch' : ''}" title="${esc(p.u.isEnemy ? p.u.name : nomH(p.u))}"><span class="chip ${p.u.isEnemy ? 'e' : 'h'} ${!p.u.isEnemy && (IMAGES['heros.' + p.u.id] || {}).portrait ? 'face' : ''} ${i === 0 ? 'now' : ''}"><img alt="" src="${vignette(p.u)}"></span>${p.rec ? '<i class="rec">KO</i>' : p.chg ? '<i class="chg">!</i>' : ''}</span>`;
  }).join('');
  const m = chaine();
  const ei = B.enemies.map((e, i) => e.hp <= 0 ? '' : `<div class="einfo glass ${B.targeting ? 'tg' : ''}" data-ei="${i}" style="left:${e.px * 100}%;top:${(e.py * 100 + 1.5).toFixed(1)}%">
    <div class="nm">${esc(e.name)}</div><div class="bar ${e.hp / e.mhp < .3 ? 'low' : ''}"><i style="width:${e.hp / e.mhp * 100}%"></i></div>
    <div class="erow">${e.broken ? `<span class="brk">${esc(t('combat.brise.court'))}</span>` : `<span class="shield" title="${esc(t('combat.garde.titre'))}">${MONSTRES[e.id].intouchable ? '∞' : e.shield}</span>`}${elChips(e)}</div></div>`).join('');
  ovc().innerHTML = `<div class="tl glass"><span class="tll">${esc(t('combat.tours'))}</span>${chips}</div>
   <div class="bmeta">${B.team.length > 1 ? `<span class="glass pips">${esc(t('combat.union'))} ${[0, 1, 2].map(i => `<b class="${B.union > i ? 'on' : ''}"></b>`).join('')}</span>` : ''}${m ? `<span class="glass chain">${esc(t('combat.chaine', { m }))}</span>` : ''}${B.auto ? `<span class="glass autoflag">${esc(t('combat.auto'))}</span>` : ''}</div>${ei}`;
  majMonstres();
}
function bCards() {
  const el = $('#pcards'); if (!el) return;
  el.innerHTML = B.team.map(h => {
    const s = hs(h);
    return `<div class="pcard ${B.cur === h ? 'act' : ''} ${h.hp <= 0 ? 'ko' : ''}" data-h="${h.id}"><div class="pc-top">${av(h.id, 'sm')}<div class="pc-n"><b>${esc(nomH(h))}</b><span>${esc(t('classe.' + h.job))}</span></div></div>
   <div class="bar ${h.hp / s.hp < .3 ? 'low' : ''}"><i style="width:${h.hp / s.hp * 100}%"></i></div><div class="pc-v"><span>${esc(t('stat.hp'))}</span><b>${h.hp}/${s.hp}</b></div>
   <div class="bar pp"><i style="width:${h.pp / s.pp * 100}%"></i></div><div class="pc-v"><span>${esc(t('stat.pp'))}</span><b>${h.pp}/${s.pp}</b></div></div>`;
  }).join('') + (B.team.length < 3 ? Array(3 - B.team.length).fill(`<div class="pcard empty">${esc(t('combat.vide'))}</div>`).join('') : '');
  hud();
}
function bMsg(texte) { const m = $('#bmsg'); if (m) m.innerHTML = texte; }
function bDraw() { bOverlay(); bCards(); }
function menu(opts, list) { return new Promise(res => { const el = $('#bcmd'); if (!el) return; el.className = 'cmds' + (list ? ' list' : ''); el.innerHTML = btns(opts); bind(el, opts, res); }); }
const retourOpt = v => ({ k: v, ic: 'back', label: esc(t('retour')), cls: 'ghost' });
function pickEnemy() {
  return new Promise(res => {
    const al = aliveE(); B.targeting = true; bOverlay();
    const done = v => { B.targeting = false; B.pick = null; bOverlay(); res(v); };
    B.pick = i => done(B.enemies[i]);
    const opts = al.map(e => ({ k: B.enemies.indexOf(e), img: vignette(e), label: esc(e.name), sub: esc(t('combat.pv', { hp: e.hp, max: e.mhp }) + ' · ' + (e.broken ? t('combat.garde.brisee') : t('combat.garde', { n: e.shield }))) }));
    opts.push(retourOpt(-1));
    const el = $('#bcmd'); el.className = 'cmds list'; el.innerHTML = btns(opts); bind(el, opts, k => done(k < 0 ? null : B.enemies[k]));
  });
}
function pickAlly(quoi) {
  bMsg(quoi);
  const opts = B.team.map((h, i) => ({ k: i, img: vignette(h), label: esc(nomH(h)), sub: esc(t('combat.pv', { hp: h.hp, max: hs(h).hp }) + ' · ' + h.pp + ' ' + t('stat.pp')), dis: h.hp <= 0 }));
  opts.push(retourOpt(-1));
  return menu(opts, true).then(k => k < 0 ? null : B.team[k]);
}
function pickItem() {
  const opts = Object.keys(OBJETS).filter(k => S.inv[k] > 0).map(k => ({ k, ic: 'heart', label: esc(t('objet.' + k)), sub: esc(`${t('objet.' + k + '.desc')} · ×${S.inv[k]}`) }));
  opts.push(retourOpt(null));
  return menu(opts, true);
}
document.addEventListener('click', e => { const x = e.target.closest('#ov [data-ei]'); if (x && B && B.pick) B.pick(+x.dataset.ei); });

/* ---------- Déroulé d'un combat ---------- */
// o : { zone, canFlee, quest, boss, equipe, perdu }. Renvoie 'win', 'fled' ou 'perdu' (combat perdu d'avance) ;
// lance DEFAITE si l'équipe tombe dans un combat normal. equipe : ids des seuls héros qui se battent.
async function battle(ids, o) {
  const t0 = S.st.time, n = ids.length, cnt = {}, vus = {}, fp = forcePlus();
  S.st.fights++; if (o.quest) S.st.qfights++;
  ids.forEach(id => { cnt[id] = (cnt[id] || 0) + 1; seen(id); });
  const T = o.equipe ? team().filter(h => o.equipe.includes(h.id)) : team();
  B = { zone: o.zone, canFlee: o.canFlee !== false, boss: !!o.boss, quest: !!o.quest, perdu: !!o.perdu, union: 0, streak: 0, turns: 0, cur: null, targeting: false, team: T, st: {}, auto: false, wall: null,
    enemies: ids.map(id => {
      const d = MONSTRES[id]; vus[id] = (vus[id] || 0) + 1;
      const nom = cnt[id] > 1 ? (existe(`monstre.${id}.court`) ? t(`monstre.${id}.court`) : t('monstre.' + id)) + ' ' + 'ABC'[vus[id] - 1] : t('monstre.' + id);
      const pv = Math.round(d.pv * fp);
      return { id, isEnemy: true, name: nom, hp: pv, mhp: pv, atk: Math.round(d.atk * (1 + (fp - 1) * .6)), def: d.def, spd: d.vit, shield: d.garde, mshield: d.garde, weak: d.faible, res: d.resiste,
        xp: Math.round(d.xp * fp), gold: Math.round(d.or * fp), broken: false, charged: false, cnt: 0 };
    }) };
  B.autoOk = !B.boss && !B.quest; if (!B.autoOk) S.auto = false;
  for (const h of T) { B.st[h.id] = stats(h); h.guard = h.taunt = false; }
  for (const u of units()) u.next = 100 / spd(u) * rnd(.25, 1);
  $('#app').classList.add('inb');
  setDecor(decorDuLieu(o.zone || lieuActuel()));
  poserMonstres(B.enemies);
  $('#panel').innerHTML = `<div class="pcards" id="pcards"></div><div class="msgline" id="bmsg"></div><div class="cmds" id="bcmd"></div>`;
  bDraw();
  bMsg(o.perdu ? tx('combat.ecrasant') : o.boss ? tx('combat.boss') : esc(t('combat.debut', { noms: nomsEnnemis() })));
  if (!S.f.tuto) { S.f.tuto = true; await openHelp(true); }
  await wait(600);
  while (true) {
    if (!aliveE().length || !aliveH().length) break;
    const u = units().sort((a, b) => a.next - b.next || (a.isEnemy ? 1 : 0) - (b.isEnemy ? 1 : 0))[0];
    B.cur = u; B.turns++; bDraw();
    if (u.isEnemy) {
      if (u.broken) { u.broken = false; u.shield = u.mshield; bMsg(esc(t('combat.releve', { nom: u.name }))); u.next += 100 / u.spd; await wait(750); continue; }
      B.streak = 0;
      const w = await enemyAct(u); u.next += 100 / u.spd * w;
    } else {
      u.guard = false; u.taunt = false; if (B.wall === u) B.wall = null;
      let a = null;
      if (S.auto && B.autoOk) {
        const low = aliveH().find(h => h.hp / hs(h).hp < .3);
        if (low) { S.auto = false; B.auto = false; bOverlay(); bMsg(tx('combat.auto.coupe', { nom: nomH(low) })); await wait(500); }
        else {
          B.auto = true; S.st.autoTurns++; bOverlay(); bMsg(esc(t('combat.auto.tour', { nom: nomH(u) })));
          menu([{ k: 'stop', ic: 'x', label: esc(t('combat.auto.arreter')), sub: esc(t('combat.auto.arreter.sous')), cls: 'wide' }], true).then(k => { if (k === 'stop' && B) { S.auto = false; B.auto = false; bOverlay(); bMsg(esc(t('combat.auto.arrete'))); } });
          await wait(300); a = { type: 'skill', sk: 'attaque', t: pick(aliveE()) };
        }
      }
      if (!a) { B.auto = false; bOverlay(); const m = chaine(); bMsg(tx('combat.atoi', { nom: nomH(u), classe: t('classe.' + u.job) }) + (m ? ' ' + tx('combat.atoi.chaine', { m }) : '')); a = await heroCommand(u); }
      if (a.type === 'auto') { S.auto = true; B.auto = true; S.st.autoTurns++; bOverlay(); a = { type: 'skill', sk: 'attaque', t: pick(aliveE()) }; }
      const w = await heroAct(u, a);
      if (w === 'fled') { S.st.fights--; logR('journal.log.fuite', { noms: nomsEnnemis() }); finCombat(); return 'fled'; }
      u.next += 100 / hs(u).spd * w;
    }
  }
  B.cur = null; bDraw();
  if (!aliveH().length && B.perdu) {
    bMsg(tx('combat.perdu')); await wait(1600); logR('journal.log.perdu', { noms: nomsEnnemis() });
    for (const h of B.team) h.hp = 1;
    finCombat(); return 'perdu';
  }
  if (!aliveH().length) { bMsg(esc(t('combat.defaite'))); await wait(1100); logR('journal.log.defaite', { noms: nomsEnnemis() }); finCombat(); throw DEFAITE; }
  const xp = B.enemies.reduce((a, e) => a + e.xp, 0), gold = B.enemies.reduce((a, e) => a + e.gold, 0);
  S.gold += gold;
  for (const e of B.enemies) S.codex[e.id].kills++;
  for (const h of B.team) if (h.hp <= 0) h.hp = 1;
  const ups = gainXP(xp), wasAuto = S.auto && B.autoOk;
  logR(o.boss ? 'journal.log.boss' : o.quest ? 'journal.log.combat.quete' : 'journal.log.combat', { noms: nomsEnnemis(), tours: B.turns, duree: fmt(S.st.time - t0), auto: wasAuto ? ' ' + t('journal.auto') : '' });
  bCards(); bMsg(tx('combat.victoire', { xp, or: gold }) + (ups.length ? '<br>' + ups.join('<br>') : ''));
  if (wasAuto && !ups.length) await Promise.race([menu([{ k: 1, ic: 'run', label: esc(t('continuer')), sub: esc(t('combat.suite.auto')), cls: 'wide' }]), wait(1300)]);
  else await menu([{ k: 1, ic: 'run', label: esc(t('continuer')), cls: 'wide main' }]);
  finCombat();
  return 'win';
}
function finCombat() { for (const h of B.team) { delete h.guard; delete h.taunt; delete h.next; } B = null; $('#units').innerHTML = ''; $('#app').classList.remove('inb'); }
function gainXP(x) {
  const ups = [];
  for (const h of team()) {
    const avant = stats(h); h.xp += x; let up = false;
    while (h.xp >= need(h.lvl)) { h.xp -= need(h.lvl); h.lvl++; up = true; }
    if (up) { const a = stats(h); h.hp += a.hp - avant.hp; h.pp += a.pp - avant.pp; clampC(h); ups.push(tx('combat.niveau', { nom: nomH(h), n: h.lvl })); }
  }
  return ups;
}

/* ---------- Commandes du héros ---------- */
const icTech = x => x.type === 'soin' || x.type === 'soins' ? 'heart' : x.type === 'scan' ? 'search' : x.type === 'provoc' || x.type === 'rempart' ? 'shield' : 'spark';
function elTech(h, el) { const he = t('element.' + HEROS[h.id].el); return el === 'X' ? he : el === 'LX' ? t('element.L') + ' + ' + he : el ? t('element.' + el) : ''; }
async function heroCommand(h) {
  while (true) {
    const sk = CLASSES[h.job].tech, solo = aliveH().length < 2;
    const opts = [
      { k: 'attaque', ic: 'sword', label: esc(t('tech.attaque')), sub: esc(t('element.' + elArme(h))) },
      { k: 'skills', ic: 'spark', label: esc(t('combat.cmd.tech')), sub: esc(t('classe.' + h.job)) },
      { k: 'objet', ic: 'bag', label: esc(t('combat.cmd.objet')), sub: esc(t('combat.cmd.objet.sous', { n: itemCount() })), dis: !itemCount() },
      { k: 'garde', ic: 'shield', label: esc(t('combat.cmd.garde')), sub: esc(t('combat.cmd.garde.sous')) },
      { k: 'union', ic: 'link', label: esc(t('combat.union')), sub: esc(B.team.length < 2 ? t('combat.cmd.union.seul') : B.union >= 3 ? t('combat.cmd.union.prete') : `${B.union}/3`), dis: B.union < 3 || solo, cls: B.union >= 3 && !solo ? 'main' : '' },
      { k: 'auto', ic: 'play', label: esc(t('combat.auto')), sub: esc(t(B.autoOk ? 'combat.cmd.auto.sous' : 'combat.cmd.auto.non')), dis: !B.autoOk },
      { k: 'fuir', ic: 'run', label: esc(t('combat.cmd.fuir')), sub: esc(t(B.canFlee ? 'combat.cmd.fuir.sous' : 'combat.cmd.fuir.non')), dis: !B.canFlee }
    ];
    const k = await menu(opts);
    if (k === 'garde' || k === 'fuir' || k === 'union' || k === 'auto') return { type: k };
    if (k === 'objet') {
      const it = await pickItem(); if (!it) continue;
      const cible = await pickAlly(esc(t('combat.cible.allie', { quoi: t('objet.' + it) }))); if (!cible) continue;
      return { type: 'item', it, t: cible };
    }
    let s;
    if (k === 'skills') {
      const so = sk.map(id => { const x = TECHNIQUES[id], el = elTech(h, x.el); return { k: id, ic: icTech(x), label: esc(t('tech.' + id)), sub: esc(`${x.pp} ${t('stat.pp')}${el ? ' · ' + el : ''} · ${t('tech.' + id + '.desc')}`), dis: h.pp < x.pp, cls: x.el ? 'el-' + elsOf(h, x.el).slice(-1)[0] : '' }; });
      so.push(retourOpt('back'));
      bMsg(esc(t('combat.tech.liste', { nom: nomH(h), classe: t('classe.' + h.job) })));
      const c = await menu(so, true); if (c === 'back') continue;
      s = { id: c, ...TECHNIQUES[c] };
    } else s = { id: 'attaque', cible: 'ennemi' };
    const nomT = t('tech.' + s.id);
    if (s.cible === 'ennemi') { bMsg(esc(t('combat.cible.ennemi', { quoi: nomT }))); const c = await pickEnemy(); if (!c) continue; return { type: 'skill', sk: s.id, t: c }; }
    if (s.cible === 'allie') { const c = await pickAlly(esc(t('combat.cible.allie', { quoi: nomT }))); if (!c) continue; return { type: 'skill', sk: s.id, t: c }; }
    return { type: 'skill', sk: s.id };
  }
}

/* ---------- Coups et effets ---------- */
function heroFx(h, texte, cls) { const c = document.querySelector(`.pcard[data-h="${h.id}"]`); if (!c) return; const d = document.createElement('div'); d.className = 'fnum ' + (cls || ''); d.innerHTML = texte; c.appendChild(d); setTimeout(() => d.remove(), 1000); }
async function strike(e, els, base, mult) {
  const weak = els.some(x => e.weak.includes(x)), res = !weak && els.some(x => e.res.includes(x));
  let m = mult, cls = '', tag = '';
  if (weak) { m *= 1.5; els.filter(x => e.weak.includes(x)).forEach(x => reveal(e.id, x)); cls = 'weak'; tag = t('combat.faiblesse') + ' '; if (!e.broken) { e.shield--; if (!B.inUnion) B.union = Math.min(3, B.union + 1); } }
  else if (res) { m *= .5; els.forEach(x => { if (e.res.includes(x)) reveal(e.id, x, true); }); cls = 'res'; tag = t('combat.resiste') + ' '; }
  if (e.broken) m *= 1.5;
  const dmg = Math.max(1, Math.round(base * rnd(.9, 1.1) * m));
  e.hp = Math.max(MONSTRES[e.id].intouchable ? 1 : 0, e.hp - dmg);
  const [x, y] = epos(e); fx(x, y, dmg, cls); await hitFlash(e);
  let line = esc(tag + t('combat.perd', { nom: e.name, n: dmg }));
  if (weak && e.shield <= 0 && !e.broken && e.hp > 0) {
    e.broken = true; e.next += 50 / e.spd; fx(x, y - 10, esc(t('combat.fx.brise')), 'brk'); if (!B.inUnion) B.union = Math.min(3, B.union + 1);
    line += ' ' + tx('combat.brise');
    if (e.charged) { e.charged = false; line += ' ' + tx('combat.charge.annulee'); }
  }
  if (e.hp <= 0) { e.dying = true; line += ' ' + esc(t(MONSTRES[e.id].f ? 'combat.vaincue' : 'combat.vaincu', { nom: e.name })); bOverlay(); await wait(200); e.dying = false; }
  bOverlay();
  return line;
}
// élément de l'Attaque : celui de l'arme si elle en a un, sinon Lame
function elArme(h) { const a = h.eq.arme && EQUIPEMENT[h.eq.arme]; return (a && a.el) || 'L'; }
function elsOf(h, el) { const he = HEROS[h.id].el; return el === 'X' ? [he] : el === 'LX' ? ['L', he] : [el]; }
async function heroAct(h, a) {
  const s = hs(h), nm = nomH(h);
  if (a.type === 'garde') { h.guard = true; bMsg(esc(t('combat.garde.texte', { nom: nm }))); bCards(); await wait(500); return .6; }
  if (a.type === 'fuir') {
    if (Math.random() < .7) { bMsg(esc(t('combat.fuite'))); await wait(650); return 'fled'; }
    B.streak = 0; bMsg(esc(t('combat.fuite.rate'))); await wait(650); return 1;
  }
  if (a.type === 'item') {
    const it = OBJETS[a.it], c = a.t, cs = hs(c);
    S.inv[a.it]--;
    let line = esc(t('combat.objet', { nom: nm, objet: t('objet.' + a.it), cible: nomH(c) })) + ' ';
    if (it.hp) { const v = Math.min(it.hp, cs.hp - c.hp); c.hp += v; bCards(); heroFx(c, '+' + v, 'heal'); line += esc(t('combat.plus.pv', { n: v })); }
    if (it.pp) { const v = Math.min(it.pp, cs.pp - c.pp); c.pp += v; bCards(); heroFx(c, '+' + v + ' ' + t('stat.pp'), 'heal'); line += esc(t('combat.plus.pp', { n: v })); }
    bMsg(line); await wait(650); return .8;
  }
  if (a.type === 'union') {
    B.union = 0; B.streak++; B.inUnion = true;
    bMsg(tx('combat.union.texte')); await wait(450);
    const lines = [];
    for (const e of aliveE()) for (const m of aliveH()) {
      if (e.hp <= 0) break;
      const ms = hs(m), base = Math.max(ms.atk * 1.05 - e.def * .6, ms.mag - e.def * .3);
      lines.push(await strike(e, [HEROS[m.id].el], Math.max(3, base), 1)); await wait(110);
    }
    B.inUnion = false;
    bMsg(lines.filter(l => l.includes('<b>') || /vaincu/.test(l)).join(' ') || esc(t('combat.union.fin'))); bDraw(); await wait(500); return 1.2;
  }
  const sk = a.sk === 'attaque' ? { el: elArme(h), type: 'phys', pow: 1, pp: 0, cible: 'ennemi', poids: 1 } : TECHNIQUES[a.sk], nomT = t('tech.' + a.sk);
  h.pp -= sk.pp; bCards();
  if (sk.type === 'scan') {
    revealAll(a.t.id);
    bMsg(tx('combat.scan', { nom: nm, cible: a.t.name, faibles: a.t.weak.map(e => t('element.' + e)).join(', ') }) + (a.t.res.length ? esc(t('combat.scan.res', { res: a.t.res.map(e => t('element.' + e)).join(', ') })) : '') + '.');
    bOverlay(); await wait(800); return sk.poids;
  }
  if (sk.type === 'soin') { const c = a.t, v = Math.min(Math.round(s.mag * sk.pow + 12), hs(c).hp - c.hp); c.hp += v; bCards(); heroFx(c, '+' + v, 'heal'); bMsg(esc(t('combat.soin', { nom: nm, cible: nomH(c), n: v }))); await wait(650); return sk.poids; }
  if (sk.type === 'soins') { const vs = []; for (const c of aliveH()) { const v = Math.min(Math.round(s.mag * sk.pow + 8), hs(c).hp - c.hp); c.hp += v; vs.push([c, v]); } bCards(); vs.forEach(([c, v]) => heroFx(c, '+' + v, 'heal')); bMsg(esc(t('combat.soins', { nom: nm }))); await wait(700); return sk.poids; }
  if (sk.type === 'provoc') { h.taunt = true; bMsg(esc(t('combat.provoc', { nom: nm }))); bCards(); await wait(550); return sk.poids; }
  if (sk.type === 'rempart') { B.wall = h; bMsg(esc(t('combat.rempart', { nom: nm }))); await wait(600); return sk.poids; }
  const mult = 1 + .15 * Math.min(B.streak, 3); B.streak++;
  const lines = [], els = elsOf(h, sk.el);
  const cibles = sk.cible === 'tous' ? aliveE() : sk.cible === 'hasard2' ? [null, null] : [a.t];
  for (let e of cibles) {
    if (!e) { const al = aliveE(); if (!al.length) break; e = pick(al); }
    if (e.hp <= 0) continue;
    const base = sk.type === 'phys' ? s.atk * sk.pow - e.def * .6 : s.mag * sk.pow - e.def * .3;
    lines.push(await strike(e, els, Math.max(2, base), mult));
  }
  bMsg(esc(nomT) + (mult > 1 ? ' ' + esc(t('combat.chaine.court', { m: mult.toFixed(2) })) : '') + ' : ' + lines.join(' '));
  bDraw(); await wait(sk.cible === 'tous' ? 750 : 600); return sk.poids;
}
async function dmgHero(c, raw) {
  const s = hs(c);
  let d = Math.max(1, Math.round((raw - s.def * (c.taunt ? .9 : .6)) * rnd(.9, 1.1)));
  if (c.guard) d = Math.max(1, Math.round(d / 2));
  if (B.wall && B.wall.hp > 0) d = Math.max(1, Math.round(d / 2));
  c.hp = Math.max(0, c.hp - d); bCards(); heroFx(c, d, ''); await hitFlash(c);
  return d;
}

/* ---------- Tour d'un monstre ---------- */
const capacite = (e, type) => (MONSTRES[e.id].capacites || []).find(c => c.type === type);
async function enemyAct(e) {
  const al = aliveH(); if (!al.length) return 1;
  const tn = al.find(h => h.taunt);
  const cible = () => tn || (Math.random() < .4 ? al.reduce((a, b) => a.hp < b.hp ? a : b) : pick(al));
  const charge = capacite(e, 'charge');
  if (charge) {
    if (e.charged) { e.charged = false; bMsg(tx(`monstre.${e.id}.special`, { nom: e.name })); await wait(400); for (const h of al) await dmgHero(h, e.atk * charge.mult); bDraw(); await wait(600); return 1; }
    e.cnt++;
    if (e.cnt % 3 === 2) { e.charged = true; bMsg(tx(`monstre.${e.id}.charge`, { nom: e.name })); bDraw(); await wait(950); return 1; }
  }
  const spores = capacite(e, 'spores');
  if (spores && Math.random() < spores.chance) { bMsg(tx(`monstre.${e.id}.special`, { nom: e.name })); await wait(300); for (const h of al) await dmgHero(h, e.atk * spores.mult); bDraw(); await wait(500); return 1; }
  const regen = capacite(e, 'regen');
  if (regen && e.hp < e.mhp * regen.seuil && Math.random() < regen.chance) {
    const v = Math.min(regen.v, e.mhp - e.hp); e.hp += v; fx(...epos(e), '+' + v, 'heal');
    bMsg(tx(`monstre.${e.id}.special`, { nom: e.name, v })); bDraw(); await wait(650); return 1;
  }
  const fort = capacite(e, 'fort'), coup = fort && Math.random() < fort.chance;
  const c = cible(), d = await dmgHero(c, e.atk * (coup ? fort.mult : 1)), nc = nomH(c);
  bMsg(esc(coup ? t('combat.fort', { nom: e.name, coup: t(`monstre.${e.id}.special`) }) : t('combat.attaque', { nom: e.name })) + ' ' +
    esc(t('combat.perd', { nom: nc, n: d })) + (c.guard ? ' ' + esc(t('combat.en.garde')) : '') + (c.hp <= 0 ? ' ' + tx('combat.a.terre', { nom: nc }) : ''));
  bDraw(); await wait(650); return 1;
}
