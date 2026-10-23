/* Lanterval · Acte 4 : L'Œil. Quête principale, étapes dans l'ordre.
   Même format que donnees/acte1.js (la liste des événements possibles est en tête de ce fichier) et acte3.js (drapeaux).
   Drapeaux de l'acte : acte4 (en a4.e1, attendu par la suite des quêtes annexes), varen (en a4.e6 : Varen se bat avec l'équipe).
   Les textes sont dans textes/<langue>/acte4.txt. Les Hauts-Vents ont leur carte (region: 'vents' dans monde.js).
   Le final (0.5.3) : a4.e8 à a4.e10, sur l'Escalier de brume (zone nonRetour de monde.js). Drapeau escalier : l'équipe est montée,
   plus de carte jusqu'à la fin (FINAL ci-dessous ; défaite = relève au palier, voir defaite dans jeu.js).
   ['si', condition, [événements], [sinon]] : les épilogues changent selon les quêtes annexes finies.
   ['fin_jeu'] : générique et écran de fin ; la partie revient ensuite à Aerie avant l'Escalier (retourAvantFinal dans etat.js). */

// depart : première étape du final ; palier : étape après laquelle une défaite relève l'équipe au sommet ;
// fin : dernière étape ; retour : le village où la partie revient après la fin
const FINAL = { depart: 'a4.e8', palier: 'a4.e9', fin: 'a4.e10', retour: 'aerie' };

ACTES.push({
  id: 'a4',
  ouverture: [],
  etapes: [
    // Pont des Nuées : Pell, le facteur en planeur, apporte les nouvelles de Salvent ; Kael se bat avec l'épée de son père
    { id: 'a4.e1', lieu: 'pont.c', evenements: [
      ['drapeau', 'acte4'],
      ['dialogue', 'a4.e1.depart'],
      ['perd', 'epee-aldric'],
      ['gagne', 'aldric'],
      ['dialogue', 'a4.e1.epee'],
      ['traversee', 'pont.a', { milieu: [
        ['panorama', 'pano.pont'],
        ['dialogue', 'a4.e1.pell'],
        ['decor'],
        ['combat', 'rapace sentinelle rapace'],
        ['dialogue', 'a4.e1.nouvelles']
      ] }],
      ['dialogue', 'a4.e1.aerie'],
      ['message', 'a4.e1.message']
    ] },

    // Aerie : le village natal de Nev l'accueille mal ; le vieux moine Tavor accepte de guider le groupe
    { id: 'a4.e2', lieu: 'tavor', evenements: [
      ['panorama', 'pano.aerie'],
      ['dialogue', 'a4.e2.arrivee'],
      ['decor'],
      ['dialogue', 'a4.e2.accueil'],
      ['dialogue', 'a4.e2.tavor'],
      ['dialogue', 'a4.e2.village'],
      ['message', 'a4.e2.message']
    ] },

    // Ruines du monastère, en trois étapes : le parvis, les fresques, le sanctuaire et le Serpent d'azur
    { id: 'a4.e3', lieu: 'ruines.p', evenements: [
      ['dialogue', 'a4.e3.parvis'],
      ['combat', 'gargouille gargouille'],
      ['dialogue', 'a4.e3.porte'],
      ['message', 'a4.e3.message']
    ] },

    { id: 'a4.e4', lieu: 'ruines.p', evenements: [
      ['dialogue', 'a4.e4.cloitre'],
      ['traversee', 'ruines.s', { milieu: [
        ['combat', 'spectre gargouille spectre'],
        ['panorama', 'pano.fresques'],
        ['dialogue', 'a4.e4.fresques'],
        ['dialogue', 'a4.e4.verite'],
        ['decor']
      ] }],
      ['dialogue', 'a4.e4.sanctuaire'],
      ['message', 'a4.e4.message']
    ] },

    { id: 'a4.e5', lieu: 'ruines.s', evenements: [
      ['dialogue', 'a4.e5.serpent'],
      ['combat', 'serpent', { boss: true, conseil: 'a4.e5.conseil' }],
      ['dialogue', 'a4.e5.cristal'],
      ['classes', 'sage ninja lamemage'],
      ['dialogue', 'a4.e5.classes'],
      ['dialogue', 'a4.e5.vol'],
      ['message', 'a4.e5.message']
    ] },

    // Pic hurlant : Nev seule contre Varen ; il refuse de l'achever ; Ysold arrache l'azur et l'abandonne
    { id: 'a4.e6', lieu: 'pic.b', evenements: [
      ['dialogue', 'a4.e6.montee'],
      ['traversee', 'pic.s', { milieu: [
        ['combat', 'griffon givre'],
        ['dialogue', 'a4.e6.vent']
      ] }],
      ['dialogue', 'a4.e6.varen'],
      ['combat', 'varen3', { boss: true, equipe: 'nev', conseil: 'a4.e6.conseil' }],
      ['dialogue', 'a4.e6.refus'],
      ['panorama', 'pano.ysold-azur'],
      ['dialogue', 'a4.e6.ysold'],
      ['decor'],
      ['drapeau', 'varen'],
      ['dialogue', 'a4.e6.ombres'],
      ['combat', 'brume spectre brume'],
      ['dialogue', 'a4.e6.invite'],
      ['message', 'a4.e6.message']
    ] },

    // Aerie : la nuit avant l'assaut, une scène par héros au feu de camp ; Orvan arrive
    { id: 'a4.e7', lieu: 'edda', evenements: [
      ['soin'],
      ['panorama', 'pano.feu'],
      ['dialogue', 'a4.e7.feu'],
      ['dialogue', 'a4.e7.kael'],
      ['dialogue', 'a4.e7.mira'],
      ['dialogue', 'a4.e7.sol'],
      ['dialogue', 'a4.e7.nev'],
      ['dialogue', 'a4.e7.orvan'],
      ['decor'],
      ['message', 'a4.e7.message']
    ] },

    // L'Escalier de brume : le point de non-retour, la garde de la Paupière, puis le Sans-Nom sur le palier
    { id: 'a4.e8', lieu: 'escalier.b', evenements: [
      ['dialogue', 'a4.e8.pied'],
      ['choix', 'a4.e8.choix', {
        monter: [['drapeau', 'escalier'], ['dialogue', 'a4.e8.monter']],
        non: [['dialogue', 'a4.e8.pasencore'], ['stop']]
      }],
      ['dialogue', 'a4.e8.garde'],
      ['combat', 'veilleur nueeoubli veilleur'],
      ['dialogue', 'a4.e8.palier'],
      ['message', 'a4.e8.message']
    ] },

    // Aldric : le combat s'arrête sous 40 % de ses PV ; Kael lui tend l'épée reforgée (et lui lit le carnet s'il l'a fini)
    { id: 'a4.e9', lieu: 'escalier.b', evenements: [
      ['dialogue', 'a4.e9.sansnom'],
      ['combat', 'sansnom3', { boss: true, conseil: 'a4.e9.conseil' }],
      ['dialogue', 'a4.e9.epee'],
      ['si', 'annexe aldric 4', [['dialogue', 'a4.e9.carnet']], [['dialogue', 'a4.e9.souvenir']]],
      ['dialogue', 'a4.e9.aldric'],
      ['panorama', 'pano.aldric'],
      ['dialogue', 'a4.e9.ombres'],
      ['decor'],
      ['traversee', 'escalier.s', { milieu: [
        ['combat', 'nueeoubli veilleur nueeoubli'],
        ['dialogue', 'a4.e9.montee']
      ] }],
      ['soin'],
      ['dialogue', 'a4.e9.sommet'],
      ['message', 'a4.e9.message']
    ] },

    // Le Cœur de l'Œil : Ysold et ses quatre cristaux, puis la Paupière du monde contre les quatre héros ; épilogues
    { id: 'a4.e10', lieu: 'escalier.s', evenements: [
      ['panorama', 'pano.ysold'],
      ['dialogue', 'a4.e10.coeur'],
      ['dialogue', 'a4.e10.ysold'],
      ['decor'],
      ['combat', 'ysold', { boss: true, conseil: 'a4.e10.conseil' }],
      ['dialogue', 'a4.e10.paupiere'],
      ['dialogue', 'a4.e10.varen'],
      ['combat', 'paupiere', { boss: true, equipe: 'kael mira sol nev', conseil: 'a4.e10.conseil2' }],
      ['panorama', 'pano.oeil'],
      ['dialogue', 'a4.e10.oeil'],
      ['dialogue', 'a4.e10.souvenir'],
      ['dialogue', 'a4.e10.adieu'],
      // épilogues : un par héros, puis Lanterval
      ['panorama', 'pano.epilogue.kael'],
      ['si', 'annexe aldric 4', [['dialogue', 'a4.e10.ep.kael.aldric']], [['dialogue', 'a4.e10.ep.kael.seul']]],
      ['panorama', 'pano.epilogue.mira'],
      ['si', 'annexe moule 4', [['dialogue', 'a4.e10.ep.mira.forge']],
        [['si', 'drapeau pardon', [['dialogue', 'a4.e10.ep.mira.pardon']], [['dialogue', 'a4.e10.ep.mira.plustard']]]]],
      ['panorama', 'pano.epilogue.sol'],
      ['si', 'annexe berceuse 4', [['dialogue', 'a4.e10.ep.sol.naia']], [['dialogue', 'a4.e10.ep.sol.attente']]],
      ['panorama', 'pano.epilogue.nev'],
      ['si', 'annexe cerfvolant 5', [['dialogue', 'a4.e10.ep.nev.liss']], [['dialogue', 'a4.e10.ep.nev.route']]],
      ['si', 'annexe graine 5', [['panorama', 'pano.fleur'], ['dialogue', 'a4.e10.ep.lanterval.fleur']],
        [['panorama', 'pano.fete'], ['dialogue', 'a4.e10.ep.lanterval']]],
      ['fin_jeu']
    ] }
  ]
});
