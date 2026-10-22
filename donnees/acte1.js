/* Lanterval · Acte 1 : La lanterne. Quête principale, étapes dans l'ordre.
   lieu : où l'étape se joue (un personnage du village comme « orvan », une zone comme « foret »,
          ou un côté de zone comme « grotte.e » pour l'entrée et « grotte.f » pour le fond).
   evenements : ce qui se passe, dans l'ordre. Les textes sont dans textes/<langue>/acte1.txt.

   Événements possibles
     ['dialogue', repère]                une ou plusieurs bulles
     ['panorama', image]                 l'image large remplace le décor jusqu'à ['decor']
     ['decor']                           retour au décor du lieu
     ['combat', 'loup loup', options]    options : boss, conseil (repère d'un texte affiché avant),
                                         equipe ('kael mira' : seuls ces héros se battent),
                                         perdu (combat perdu d'avance : l'équipe tombe et l'étape continue,
                                         sans retour au village ni perte d'or)
     ['rejoint', héros]                  le héros entre dans l'équipe ; ['presente', héros] affiche sa fiche
     ['gagne', '100 or, medaillon']      ['perd', 'coeur']
     ['classes', 'guerrier mage']        débloque des classes
     ['soin'], ['degats', 'tous 5']      PV de l'équipe
     ['revele', 'golem E']               faiblesse ajoutée au codex (sans élément : toutes)
     ['position', 'grotte.f']            l'équipe change de côté dans la zone
     ['traversee', 'grotte.e', { milieu: [...] }]   traverse la zone, avec des événements à mi-chemin
     ['choix', repère, { id: [...] }]    une question ; chaque réponse a sa suite
     ['stop']                            arrête l'étape sans la terminer
     ['message', repère]                 ligne d'info affichée ensuite sur l'écran du lieu
     ['fin_version']                     écran de fin de la version en cours */

ACTES.push({
  id: 'a1',
  ouverture: [
    ['panorama', 'pano.ouverture'],
    ['dialogue', 'prologue'],
    ['decor'],
    ['presente', 'kael'],
    ['dialogue', 'prologue.suite']
  ],
  etapes: [
    { id: 'a1.e1', lieu: 'orvan', evenements: [
      ['dialogue', 'a1.e1.scene'],
      ['gagne', 'eclat-lanterne'],
      ['classes', 'guerrier mage soigneur'],
      ['dialogue', 'a1.e1.classes'],
      ['message', 'a1.e1.message']
    ] },

    { id: 'a1.e2', lieu: 'foret', evenements: [
      ['dialogue', 'a1.e2.traces'],
      ['panorama', 'pano.mira-loups'],
      ['dialogue', 'a1.e2.encerclee'],
      ['rejoint', 'mira'],
      ['combat', 'loup loup loup'],
      ['decor'],
      ['dialogue', 'a1.e2.merci'],
      ['panorama', 'pano.insigne'],
      ['gagne', 'insigne'],
      ['dialogue', 'a1.e2.insigne'],
      ['decor'],
      ['presente', 'mira'],
      ['message', 'a1.e2.message']
    ] },

    { id: 'a1.e3', lieu: 'orvan', evenements: [
      ['dialogue', 'a1.e3.scene'],
      ['message', 'a1.e3.message']
    ] },

    { id: 'a1.e4', lieu: 'grotte.e', evenements: [
      ['choix', 'a1.e4.choix', {
        gauche: [['dialogue', 'a1.e4.gauche'], ['combat', 'chauve chauve chauve'], ['gagne', '2 tonique'], ['dialogue', 'a1.e4.gauche.fin']],
        droite: [['degats', 'tous 5'], ['dialogue', 'a1.e4.droite']]
      }],
      ['panorama', 'pano.lac-sol'],
      ['dialogue', 'a1.e4.lac'],
      ['rejoint', 'sol'],
      ['combat', 'gelee gelee chauve'],
      ['decor'],
      ['dialogue', 'a1.e4.sol'],
      ['revele', 'golem E'],
      ['presente', 'sol'],
      ['dialogue', 'a1.e4.passage'],
      ['position', 'grotte.f'],
      ['message', 'a1.e4.message']
    ] },

    { id: 'a1.e5', lieu: 'grotte.f', evenements: [
      ['dialogue', 'a1.e5.salle'],
      ['panorama', 'pano.gardien'],
      ['dialogue', 'a1.e5.gardien'],
      ['combat', 'golem', { boss: true, conseil: 'a1.e5.conseil' }],
      ['decor'],
      ['gagne', 'coeur'],
      ['classes', 'chevalier'],
      ['dialogue', 'a1.e5.victoire'],
      ['message', 'a1.e5.message']
    ] },

    { id: 'a1.e6', lieu: 'grotte.f', evenements: [
      ['traversee', 'grotte.e', { milieu: [
        ['dialogue', 'a1.e6.embuscade'],
        ['combat', 'ombre ombre'],
        ['dialogue', 'a1.e6.fuite']
      ] }],
      ['message', 'a1.e6.message']
    ] },

    { id: 'a1.e7', lieu: 'orvan', evenements: [
      ['dialogue', 'a1.e7.coeur'],
      ['perd', 'coeur'],
      ['panorama', 'pano.fete'],
      ['gagne', '100 or, medaillon'],
      ['soin'],
      ['dialogue', 'a1.e7.fete'],
      ['decor'],
      ['dialogue', 'a1.e7.aveu'],
      ['message', 'a1.e7.message']
    ] },

    // Col des Pierres, en deux étapes : la montée, puis le sommet (duel contre Varen et défaite face au Sans-Nom)
    { id: 'a1.e8', lieu: 'col.p', evenements: [
      ['dialogue', 'a1.e8.montee'],
      ['traversee', 'col.s', { milieu: [
        ['dialogue', 'a1.e8.harpies'],
        ['combat', 'harpie belier harpie'],
        ['dialogue', 'a1.e8.traces']
      ] }],
      ['dialogue', 'a1.e8.sommet'],
      ['message', 'a1.e8.message']
    ] },

    { id: 'a1.e9', lieu: 'col.s', evenements: [
      ['panorama', 'pano.cage'],
      ['dialogue', 'a1.e9.cage'],
      ['dialogue', 'a1.e9.varen'],
      ['combat', 'varen', { boss: true, equipe: 'kael mira', conseil: 'a1.e9.conseil' }],
      ['dialogue', 'a1.e9.varen.fin'],
      ['dialogue', 'a1.e9.sansnom'],
      ['combat', 'sansnom', { boss: true, perdu: true }],
      ['dialogue', 'a1.e9.cri'],
      ['position', 'lanterval'],
      ['decor'],
      ['soin'],
      ['dialogue', 'a1.e9.reveil'],
      ['message', 'a1.e9.message']
    ] },

    { id: 'a1.e10', lieu: 'brann', evenements: [
      ['dialogue', 'a1.e10.brann'],
      ['panorama', 'pano.epee'],
      ['gagne', 'epee-pere'],
      ['dialogue', 'a1.e10.epee'],
      ['decor'],
      ['dialogue', 'a1.e10.depart'],
      ['message', 'a1.e10.message']
    ] }
  ]
});
