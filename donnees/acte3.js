/* Lanterval · Acte 3 : Les forges de Cendre. Quête principale, étapes dans l'ordre.
   Même format que donnees/acte1.js (la liste des événements possibles est en tête de ce fichier), plus :
     ['drapeau', 'acte3']   pose un drapeau, lu par les conditions « drapeau acte3 » (quêtes annexes qui attendaient l'acte 3)
   Les textes sont dans textes/<langue>/acte3.txt. Les Plaines de Cendre ont leur carte (region: 'cendre' dans monde.js). */

ACTES.push({
  id: 'a3',
  ouverture: [],
  etapes: [
    // Champs brûlés : Nev fuit Varen et des Ombres, le groupe la protège
    { id: 'a3.e1', lieu: 'champs.v', evenements: [
      ['drapeau', 'acte3'],
      ['dialogue', 'a3.e1.lisiere'],
      ['traversee', 'champs.c', { milieu: [
        ['panorama', 'pano.nev-champs'],
        ['dialogue', 'a3.e1.nev'],
        ['decor'],
        ['rejoint', 'nev'],
        ['combat', 'sentinelle ombre sentinelle'],
        ['dialogue', 'a3.e1.varen']
      ] }],
      ['presente', 'nev'],
      ['dialogue', 'a3.e1.ferme'],
      ['message', 'a3.e1.message']
    ] },

    // Forgecendre : la ville minière tenue par l'Ordre, Hilde arrive en charrette
    { id: 'a3.e2', lieu: 'goran', evenements: [
      ['panorama', 'pano.forgecendre'],
      ['dialogue', 'a3.e2.arrivee'],
      ['decor'],
      ['dialogue', 'a3.e2.hilde'],
      ['dialogue', 'a3.e2.ville'],
      ['dialogue', 'a3.e2.forge'],
      ['message', 'a3.e2.message']
    ] },

    // Mines rouges, en trois étapes : les premiers mineurs, l'aveu de Hilde, le Forgeur de cages
    { id: 'a3.e3', lieu: 'mines.e', evenements: [
      ['dialogue', 'a3.e3.entree'],
      ['combat', 'sentinelle automate sentinelle'],
      ['dialogue', 'a3.e3.mineurs'],
      ['message', 'a3.e3.message']
    ] },

    { id: 'a3.e4', lieu: 'mines.e', evenements: [
      ['dialogue', 'a3.e4.descente'],
      ['traversee', 'mines.g', { milieu: [
        ['dialogue', 'a3.e4.atelier'],
        ['panorama', 'pano.cage-hilde'],
        ['dialogue', 'a3.e4.aveu'],
        ['decor'],
        ['dialogue', 'a3.e4.alerte'],
        ['combat', 'ver automate ver']
      ] }],
      ['dialogue', 'a3.e4.galerie'],
      ['message', 'a3.e4.message']
    ] },

    { id: 'a3.e5', lieu: 'mines.g', evenements: [
      ['dialogue', 'a3.e5.forgeur'],
      ['combat', 'automate forgeur automate', { boss: true, conseil: 'a3.e5.conseil' }],
      ['decor'],
      ['dialogue', 'a3.e5.libres'],
      ['message', 'a3.e5.message']
    ] },

    // Forgecendre : Mira refuse de parler à sa mère ; pardonner maintenant ou plus tard
    { id: 'a3.e6', lieu: 'goran', evenements: [
      ['soin'],
      ['dialogue', 'a3.e6.fete'],
      ['dialogue', 'a3.e6.mira'],
      ['choix', 'a3.e6.choix', {
        maintenant: [['drapeau', 'pardon'], ['dialogue', 'a3.e6.maintenant']],
        plustard: [['dialogue', 'a3.e6.plustard']]
      }],
      ['dialogue', 'a3.e6.volcan'],
      ['message', 'a3.e6.message']
    ] },

    // Volcan endormi : la montée, puis le cristal de braise et le duel contre Varen au bord du cratère
    { id: 'a3.e7', lieu: 'volcan.p', evenements: [
      ['dialogue', 'a3.e7.pentes'],
      ['combat', 'lezard sentinelle lezard'],
      ['traversee', 'volcan.c', { milieu: [
        ['dialogue', 'a3.e7.ordre'],
        ['combat', 'esprit sentinelle esprit']
      ] }],
      ['dialogue', 'a3.e7.bord'],
      ['message', 'a3.e7.message']
    ] },

    { id: 'a3.e8', lieu: 'volcan.c', evenements: [
      ['panorama', 'pano.braise'],
      ['dialogue', 'a3.e8.cristal'],
      ['classes', 'berserker alchimiste invocateur'],
      ['dialogue', 'a3.e8.classes'],
      ['decor'],
      ['dialogue', 'a3.e8.varen'],
      ['combat', 'varen2', { boss: true, equipe: 'kael nev', conseil: 'a3.e8.conseil' }],
      ['dialogue', 'a3.e8.fuite'],
      // repos au bord du cratère (onglet Rythme, correction D) : soin complet, Nev et Mira parlent de Varen
      ['soin'],
      ['dialogue', 'a3.e8.repos'],
      ['message', 'a3.e8.message']
    ] },

    // Cratère : le Sans-Nom attaque ; son masque se brise, c'est Aldric
    { id: 'a3.e9', lieu: 'volcan.c', evenements: [
      ['dialogue', 'a3.e9.sansnom'],
      ['combat', 'sansnom2', { boss: true, conseil: 'a3.e9.conseil' }],
      ['panorama', 'pano.masque'],
      ['dialogue', 'a3.e9.masque'],
      ['decor'],
      ['dialogue', 'a3.e9.fuite'],
      ['message', 'a3.e9.message']
    ] },

    // Forgecendre : Hilde reforge l'épée d'Aldric, Mira l'aide en silence ; la charrette ; cap sur les Hauts-Vents
    { id: 'a3.e10', lieu: 'hilde', evenements: [
      ['soin'],
      ['dialogue', 'a3.e10.forge'],
      ['perd', 'epee-pere'],
      ['gagne', 'epee-aldric'],
      ['dialogue', 'a3.e10.epee'],
      ['dialogue', 'a3.e10.nev'],
      ['drapeau', 'charrette'],
      ['dialogue', 'a3.e10.charrette'],
      ['message', 'a3.e10.message']
    ] }
  ]
});
