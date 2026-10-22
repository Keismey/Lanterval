/* Lanterval · éléments d'interface : barre du haut, boutons, panneau de texte, fenêtres. */

function elChip(el) { return `<span class="elc ${el}" title="${esc(t('element.' + el))}">${el}</span>`; }
function btns(opts) {
  return opts.map((o, i) => `<button class="btn ${o.cls || ''}" data-i="${i}" ${o.dis ? 'disabled' : ''}>${o.bang ? `<span class="bang ${o.bang}">!</span>` : ''}${o.ic || o.img ? `<span class="ic">${o.img ? `<img alt="" src="${o.img}">` : ic(o.ic)}</span>` : ''}<span class="tx"><span>${o.label}</span>${o.sub ? `<small>${o.sub}</small>` : ''}</span></button>`).join('');
}
function bind(el, opts, res) { el.querySelectorAll('button[data-i]').forEach(b => b.onclick = () => { const o = opts[+b.dataset.i]; res(o.k !== undefined ? o.k : +b.dataset.i); }); }

function hud() {
  const h = $('#hud');
  if (!S || S.screen === 'title') { h.innerHTML = `<span class="brand">Keismey Studio</span><span class="sp"></span><button class="ibtn" id="hb-opt" aria-label="${esc(t('menu.options'))}" title="${esc(t('menu.options'))}">${ic('gear')}</button>`; $('#hb-opt').onclick = () => openOptions(); return; }
  h.innerHTML = `<span class="pillv gold">${ic('coin')}${S.gold} ${esc(t('po'))}</span><span class="pillv" id="tm">${ic('clock')}${fmt(S.st.time)}</span><span class="sp"></span>
  <button class="ibtn" id="hb-inv" aria-label="${esc(t('menu.inventaire'))}" title="${esc(t('menu.inventaire'))}">${ic('bag')}</button><button class="ibtn" id="hb-eq" aria-label="${esc(t('menu.equipe'))}" title="${esc(t('menu.equipe'))}" ${B ? 'disabled' : ''}>${ic('users')}</button><button class="ibtn" id="hb-cx" aria-label="${esc(t('menu.codex'))}" title="${esc(t('menu.codex'))}">${ic('book')}</button><button class="ibtn" id="hb-j" aria-label="${esc(t('menu.journal'))}" title="${esc(t('menu.journal'))}">${ic('scroll')}</button><button class="ibtn" id="hb-opt" aria-label="${esc(t('menu.options'))}" title="${esc(t('menu.options'))}">${ic('gear')}</button>`;
  $('#hb-inv').onclick = () => openInv('obj'); $('#hb-eq').onclick = () => { if (!B) openParty(); }; $('#hb-cx').onclick = () => openCodex('best'); $('#hb-j').onclick = openJournal; $('#hb-opt').onclick = () => openOptions();
}

// Affiche un texte dans le panneau et attend un choix. Renvoie la clé du bouton choisi.
function show(text, o = {}) {
  return new Promise(res => {
    const p = $('#panel');
    const ch = (o.choices || [{ label: esc(t('continuer')), k: 0, ic: 'run' }]).map(x => typeof x === 'string' ? { label: x, ic: 'run' } : x);
    p.innerHTML = `${o.title ? `<div class="ptitle">${esc(o.title)}</div>` : ''}${o.who ? `<div class="who">${av(o.portrait)}<b>${esc(o.who)}</b></div>` : ''}
      <div class="ptext">${text}</div>${o.note ? `<p class="note">${o.note}</p>` : ''}<div class="acts">${btns(ch)}</div>`;
    let fini = false;
    const choisir = k => { if (fini) return; fini = true; document.removeEventListener('click', partout); res(k); };
    bind(p, ch, choisir); p.scrollTop = 0; hud(); typeIn(p);
    // un seul bouton (« Continuer », « Combattre »…) : un appui n'importe où dans la scène ou le texte suffit
    const t0 = performance.now();
    const partout = e => {
      if (e.timeStamp <= t0 || !document.body.contains(p) || modalOuverte() || document.getElementById('ks-dlg')) return;
      if (e.target.closest('button,a,input,#hud,#modal')) return;
      if (!e.target.closest('#scene,#panel')) return;
      const o = ch[0]; choisir(o.k !== undefined ? o.k : 0);
    };
    if (ch.length === 1 && !ch[0].dis) document.addEventListener('click', partout);
  });
}
async function flash(text) { $('#panel').innerHTML = `<div class="ptitle" style="font-size:18px">${text}</div>`; await wait(750); }

// fiche d'un héros qui rejoint l'équipe
async function joinCard(id, titre) {
  const h = char(id), el = HEROS[id].el;
  await show(`<div class="join">${av(id, 'lg')}<div><div class="jn">${esc(t('parle.' + id))}</div><div class="chips">${elChip(el)}<span class="pill">${esc(t('element.' + el))}</span><span class="pill">${esc(t('classe.' + h.job))}</span><span class="pill">${esc(t('heros.' + id + '.age'))}</span></div><p class="ptext" style="font-size:14px">${tx('heros.' + id + '.bio')}</p></div></div>`, { title: titre });
}

/* ---------- Fenêtres ---------- */
function closeModal() { $('#modal').innerHTML = ''; }
function modalOuverte() { return !!$('#modal .modal'); }
function modal(html) { $('#modal').innerHTML = `<div class="modal"><div class="sheet">${html}</div></div>`; return $('#modal .sheet'); }
function sheetHead(titre) { return `<div class="sheet-h"><div class="ptitle">${esc(titre)}</div><button class="ibtn" id="mclose" aria-label="${esc(t('fermer'))}">${ic('x')}</button></div>`; }
