/* Lanterval · Acte 2 : La ville qui oublie. Quête principale, étapes dans l'ordre.
   Même format que donnees/acte1.js (la liste des événements possibles est en tête de ce fichier).
   Les textes sont dans textes/<langue>/acte2.txt. La Côte de Salvent a sa propre carte (region: 'cote' dans monde.js). */

ACTES.push({
  id: 'a2',
  ouverture: [],
  etapes: [
    // Marais salant : le pêcheur qui ne se souvient plus de son nom
    { id: 'a2.e1', lieu: 'marais.v', evenements: [
      ['dialogue', 'a2.e1.pecheur'],
      ['traversee', 'marais.c', { milieu: [
        ['dialogue', 'a2.e1.crabes'],
        ['combat', 'crabe sangsue crabe'],
        ['dialogue', 'a2.e1.nom']
      ] }],
      ['dialogue', 'a2.e1.cote'],
      ['message', 'a2.e1.message']
    ] },

    // Salvent : la ville qui oublie, Maëlle reconnaît Sol
    { id: 'a2.e2', lieu: 'maelle', evenements: [
      ['panorama', 'pano.salvent'],
      ['dialogue', 'a2.e2.arrivee'],
      ['decor'],
      ['dialogue', 'a2.e2.gaspard'],
      ['dialogue', 'a2.e2.maelle'],
      ['dialogue', 'a2.e2.lanternes'],
      ['message', 'a2.e2.message']
    ] },

    // Marais des Lanternes : trois lanternes à rallumer, la Vouivre au cœur du marais
    { id: 'a2.e3', lieu: 'lanternes.b', evenements: [
      ['dialogue', 'a2.e3.berge'],
      ['combat', 'follet follet'],
      ['dialogue', 'a2.e3.premiere'],
      ['traversee', 'lanternes.c', { milieu: [
        ['dialogue', 'a2.e3.deuxieme'],
        ['combat', 'crapaud follet crapaud'],
        ['dialogue', 'a2.e3.deuxieme.fin']
      ] }],
      ['dialogue', 'a2.e3.coeur'],
      ['combat', 'vouivre', { boss: true, conseil: 'a2.e3.conseil' }],
      ['decor'],
      ['dialogue', 'a2.e3.troisieme'],
      ['message', 'a2.e3.message']
    ] },

    // Épave engloutie : le navire du naufrage de Sol, la Mère-des-abysses dans les cales
    { id: 'a2.e4', lieu: 'epave.p', evenements: [
      ['panorama', 'pano.epave'],
      ['dialogue', 'a2.e4.plongee'],
      ['decor'],
      ['traversee', 'epave.c', { milieu: [
        ['dialogue', 'a2.e4.coursive'],
        ['combat', 'poisson noye poisson'],
        ['dialogue', 'a2.e4.cabine']
      ] }],
      ['dialogue', 'a2.e4.journal'],
      ['gagne', 'journal-bord'],
      ['dialogue', 'a2.e4.mere'],
      ['combat', 'crabe mere crabe', { boss: true, conseil: 'a2.e4.conseil' }],
      ['decor'],
      ['dialogue', 'a2.e4.fin'],
      ['message', 'a2.e4.message']
    ] },

    // Salvent : Naïa, la sœur de Sol, ne le reconnaît pas
    { id: 'a2.e5', lieu: 'maelle', evenements: [
      ['dialogue', 'a2.e5.maelle'],
      ['panorama', 'pano.naia'],
      ['dialogue', 'a2.e5.naia'],
      ['decor'],
      ['dialogue', 'a2.e5.sol'],
      ['message', 'a2.e5.message']
    ] },

    // Phare noyé, en deux étapes : la crique et l'escalier (Nev), puis le sommet (le Héraut)
    { id: 'a2.e6', lieu: 'phare.c', evenements: [
      ['dialogue', 'a2.e6.crique'],
      ['combat', 'soldat ombre soldat'],
      ['panorama', 'pano.phare'],
      ['dialogue', 'a2.e6.nev'],
      ['decor'],
      ['traversee', 'phare.s', { milieu: [
        ['dialogue', 'a2.e6.escalier'],
        ['combat', 'soldat soldat'],
        ['dialogue', 'a2.e6.escalier.fin']
      ] }],
      ['dialogue', 'a2.e6.sommet'],
      ['message', 'a2.e6.message']
    ] },

    { id: 'a2.e7', lieu: 'phare.s', evenements: [
      ['dialogue', 'a2.e7.heraut'],
      ['combat', 'heraut', { boss: true, conseil: 'a2.e7.conseil' }],
      ['decor'],
      ['dialogue', 'a2.e7.cristal'],
      ['classes', 'moine voleur barde'],
      ['dialogue', 'a2.e7.classes'],
      ['dialogue', 'a2.e7.gardien'],
      ['message', 'a2.e7.message']
    ] },

    // Salvent : la berceuse, la vision d'Ysold et du jeune Orvan, la lettre d'Orvan
    { id: 'a2.e8', lieu: 'maelle', evenements: [
      ['soin'],
      ['dialogue', 'a2.e8.ville'],
      ['dialogue', 'a2.e8.berceuse'],
      ['panorama', 'pano.vision'],
      ['dialogue', 'a2.e8.vision'],
      ['decor'],
      ['dialogue', 'a2.e8.lettre'],
      ['gagne', 'lettre-orvan'],
      ['dialogue', 'a2.e8.aveu'],
      ['dialogue', 'a2.e8.est'],
      ['message', 'a2.e8.message']
    ] }
  ]
});
