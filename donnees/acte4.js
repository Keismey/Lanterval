/* Lanterval · Acte 4 : L'Œil. Quête principale, étapes dans l'ordre.
   Même format que donnees/acte1.js (la liste des événements possibles est en tête de ce fichier) et acte3.js (drapeaux).
   Drapeaux de l'acte : acte4 (en a4.e1, attendu par la suite des quêtes annexes), varen (en a4.e6 : Varen se bat avec l'équipe).
   Les textes sont dans textes/<langue>/acte4.txt. Les Hauts-Vents ont leur carte (region: 'vents' dans monde.js).
   Version 0.5.0 : jusqu'au feu de camp (a4.e7) ; le final (Escalier de brume, Cœur de l'Œil, épilogue) arrive en 0.5.3. */

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
      ['message', 'a4.e7.message'],
      ['fin_version']
    ] }
  ]
});
