/* Keismey Studio — bouton retour, VERSION APPLI ANDROID.
   Remplace commun/ks-back.js uniquement dans l'appli (le site garde l'original).
   Même interface pour le jeu : KSBack.init({ back, lang, title }), KSBack.toHub(), KSBack.fromHub().
   Copié dans www/commun/ks-back.js par outils/appli.js.
   - Le bouton ou geste retour d'Android appelle back() du jeu.
   - Quand le jeu répond 'hub' (le joueur veut quitter), l'appli se ferme.
   - Pas de bouton « Hub » : l'appli est autonome. */
(function () {
  'use strict';
  var cfg = null;

  function appPlugin() {
    var C = window.Capacitor;
    return C && C.Plugins && C.Plugins.App;
  }

  function quitter() {
    var a = appPlugin();
    if (a && a.exitApp) a.exitApp();
  }

  function back() {
    if (window.KS && window.KS.closeDialog && window.KS.closeDialog()) return;   // fenêtre « Sauvegarde » commune
    var r = null;
    try { r = cfg ? cfg.back() : 'hub'; } catch (e) { if (window.console) console.error(e); }
    if (r === 'hub') quitter();
  }

  var a = appPlugin();
  if (a && a.addListener) a.addListener('backButton', back);

  window.KSBack = {
    init: function (o) { cfg = o; },
    toHub: quitter,
    fromHub: function () { return false; }
  };
})();
