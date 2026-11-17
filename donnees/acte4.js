/* Lanterval · Acte 4 : L'Œil. Quête principale, étapes dans l'ordre.
   Même format que donnees/acte1.js (la liste des événements possibles est en tête de ce fichier) et acte3.js (drapeaux).
   Drapeaux de l'acte : acte4 (en a4.e1, attendu par la suite des quêtes annexes), varen (en a4.e6 : Varen se bat avec l'équipe sur l'Escalier de brume, voir battle dans combat.js).
   Les textes sont dans textes/<langue>/acte4.txt. Les Hauts-Vents ont leur carte (region: 'vents' dans monde.js).
   Le final (0.5.3) : a4.e8 à a4.e10, sur l'Escalier de brume (zone nonRetour de monde.js). Drapeau escalier : l'équipe est montée,
   plus de carte jusqu'à la fin (FINAL ci-dessous ; défaite = relève au palier, voir defaite dans jeu.js).
   ['si', condition, [événements], [sinon]] : les épilogues changent selon les quêtes annexes finies.
   0.10 : après la Paupière, l'équipe redescend (a4.e10) et rend les cristaux (a4.e11 en désordre, puis a4.e12 au Col
   et à Lanterval) ; chaque retour joue l'épilogue d'un héros. ['fin_jeu'] vient à la fin de a4.e12, sans retour dans le temps.
   Drapeau varenreste (a4.e9) : Varen tient l'Escalier avec Aldric et ne se bat plus avec l'équipe. */

// depart : première étape du final ; palier : étape après laquelle une défaite relève l'équipe au sommet ;
// fin : la dernière étape sur l'Escalier ; retour : le village où l'équipe redescend
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
      ['panorama', 'pano.serpent'],
      ['dialogue', 'a4.e5.serpent'],
      ['combat', 'serpent', { boss: true, conseil: 'a4.e5.conseil' }],
      ['decor'],
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
      ['si', 'annexe moule 4', [['dialogue', 'a4.e7.mira.forge']], [['dialogue', 'a4.e7.mira']]],
      ['si', 'annexe berceuse 4', [['dialogue', 'a4.e7.sol.naia']], [['dialogue', 'a4.e7.sol']]],
      ['dialogue', 'a4.e7.nev'],
      ['dialogue', 'a4.e7.orvan'],
      ['decor'],
      ['message', 'a4.e7.message']
    ] },

    // L'Escalier de brume : le point de non-retour, la garde de la Paupière, puis le Sans-Nom sur le palier
    { id: 'a4.e8', lieu: 'escalier.b', evenements: [
      ['panorama', 'pano.escalier'],
      ['dialogue', 'a4.e8.pied'],
      // les quêtes familiales pas finies, qui se ferment en montant (SOUVENIRS dans etat.js)
      ['souvenirs', 'a4.e8.souvenirs'],
      ['choix', 'a4.e8.choix', {
        monter: [['drapeau', 'escalier'], ['dialogue', 'a4.e8.monter']],
        non: [['dialogue', 'a4.e8.pasencore'], ['decor'], ['stop']]
      }],
      ['decor'],
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
      // Varen reste tenir l'Escalier avec Aldric : il ne se bat plus avec l'équipe
      ['dialogue', 'a4.e9.varen'],
      ['drapeau', 'varenreste'],
      ['decor'],
      ['traversee', 'escalier.s', { milieu: [
        ['combat', 'nueeoubli veilleur nueeoubli'],
        ['dialogue', 'a4.e9.montee']
      ] }],
      ['soin'],
      ['dialogue', 'a4.e9.sommet'],
      ['message', 'a4.e9.message']
    ] },

    // Le Cœur de l'Œil : Ysold et ses quatre cristaux ; Orvan prend l'ombre de la Paupière à la place des héros et oublie tout,
    // Ysold doute ; la Paupière contre les quatre héros ; l'Œil s'ouvre. Orvan (épilogue : la quête des larmes) part avec Ysold.
    // Les cristaux restent intacts et vont chacun à un héros ; l'équipe redescend, retrouve Aldric et Varen, et rentre à Aerie.
    { id: 'a4.e10', lieu: 'escalier.s', evenements: [
      ['panorama', 'pano.ysold'],
      ['dialogue', 'a4.e10.coeur'],
      ['dialogue', 'a4.e10.ysold'],
      ['decor'],
      ['combat', 'ysold', { boss: true, conseil: 'a4.e10.conseil' }],
      ['dialogue', 'a4.e10.paupiere'],
      ['panorama', 'pano.orvan'],
      ['dialogue', 'a4.e10.orvan'],
      ['combat', 'paupiere', { boss: true, equipe: 'kael mira sol nev', conseil: 'a4.e10.conseil2' }],
      ['panorama', 'pano.oeil'],
      ['dialogue', 'a4.e10.oeil'],
      ['dialogue', 'a4.e10.souvenir'],
      ['si', 'annexe larmes 3', [['dialogue', 'a4.e10.orvan.larmes']], [['dialogue', 'a4.e10.orvan.brume']]],
      ['dialogue', 'a4.e10.cristaux'],
      ['decor'],
      ['dialogue', 'a4.e10.descente'],
      // fin du final : l'Escalier disparaît de la carte, l'équipe est à Aerie
      ['drapeau', '!escalier'],
      ['position', 'aerie'],
      ['soin'],
      ['decor'],
      ['message', 'a4.e10.message']
    ] },

    // Rendre les cristaux, dans l'ordre qu'on veut : chaque retour est l'épilogue d'un héros, joué sur place, sans combat
    { id: 'a4.e11', parmi: [
      { lieu: 'ruines.s', evenements: [
        ['dialogue', 'a4.e11.m1.pose'],
        ['position', 'aerie'],
        ['panorama', 'pano.epilogue.nev'],
        ['si', 'annexe cerfvolant 5', [['dialogue', 'a4.e11.m1.liss']], [['dialogue', 'a4.e11.m1.route']]],
        ['decor'],
        ['message', 'a4.e11.m1.message']
      ] },
      { lieu: 'volcan.c', evenements: [
        ['dialogue', 'a4.e11.m2.pose'],
        ['position', 'forgecendre'],
        ['panorama', 'pano.epilogue.mira'],
        ['si', 'annexe moule 4', [['dialogue', 'a4.e11.m2.forge']],
          [['si', 'drapeau pardon', [['dialogue', 'a4.e11.m2.pardon']], [['dialogue', 'a4.e11.m2.plustard']]]]],
        ['decor'],
        ['message', 'a4.e11.m2.message']
      ] },
      { lieu: 'phare.s', evenements: [
        ['dialogue', 'a4.e11.m3.pose'],
        ['position', 'salvent'],
        ['panorama', 'pano.epilogue.sol'],
        ['si', 'annexe berceuse 4', [['dialogue', 'a4.e11.m3.naia']], [['dialogue', 'a4.e11.m3.frere']]],
        ['decor'],
        ['message', 'a4.e11.m3.message']
      ] }
    ] },

    // L'ambre en dernier : Kael et Aldric le reposent au Col, puis la fête à Lanterval (Hilde, la tombe d'Elna,
    // la lettre d'Orvan ou d'Ysold apportée par Pell, la lanterne allumée), l'adieu, le générique
    { id: 'a4.e12', lieu: 'col.s', evenements: [
      ['dialogue', 'a4.e12.pose'],
      ['si', 'annexe aldric 4', [['dialogue', 'a4.e12.carnet']]],
      ['position', 'lanterval'],
      ['dialogue', 'a4.e12.fete'],
      ['si', 'annexe moule 4 ou drapeau pardon', [['dialogue', 'a4.e12.fete.hilde']], [['dialogue', 'a4.e12.fete.mot']]],
      ['panorama', 'pano.tombe'],
      ['dialogue', 'a4.e12.tombe'],
      ['dialogue', 'a4.e12.pell'],
      ['si', 'annexe larmes 3', [['dialogue', 'a4.e12.lettre.orvan']], [['dialogue', 'a4.e12.lettre.ysold']]],
      ['panorama', 'pano.lanterne.fin'],
      ['dialogue', 'a4.e12.lanterne'],
      ['si', 'annexe graine 5', [['panorama', 'pano.fleur'], ['dialogue', 'a4.e12.fleur']],
        [['panorama', 'titre.paix'], ['dialogue', 'a4.e12.lanterval']]],
      ['panorama', 'pano.epilogue.kael'],
      ['dialogue', 'a4.e12.kael'],
      ['dialogue', 'a4.e12.adieu'],
      ['panorama', 'pano.silhouettes'],
      ['decor'],
      ['fin_jeu']
    ] }
  ]
});
