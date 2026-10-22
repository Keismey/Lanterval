/* Lanterval · Le monde : villages, zones, carte.
   Les textes (noms, descriptions, trésors, événements) sont dans textes/<langue>/lieux.txt.

   region : la carte où le lieu apparaît (vallee par défaut). Une zone à deux côtés peut relier deux régions :
   region: { v: 'vallee', c: 'cote' } ; carte: { cote: [x, y] } donne sa place sur l'autre carte.

   Conditions (visible, ouvert, si) : « fini a1.e3 » = étape 3 de l'acte 1 terminée,
   « pas fini a1.e7 », « annexe loup 2 » = quête annexe loup arrivée à l'étape 2 ou plus.
   Plusieurs conditions se joignent avec « et ». Sans condition : toujours vrai.

   Personnage (pnj) : si = condition pour qu'il soit là.
   Boutique : equipement liste les pièces en vente ; ['acier', 'fini a1.e7'] n'arrive en rayon qu'avec la condition.
   fous : condition pendant laquelle les prix sont tirés au hasard à chaque visite ; remise : condition d'une remise de 10 %.

   Gains (gagne) : « 40 or, cuir, 2 herbe » ; effets (effet) : « soin », « soin 12 », « pp », « pp 5 »,
   « degats kael 8 », « degats tous 6 ». */

const LIEUX = {
  // ---------- Vallée de Lanterval ----------
  lanterval: {
    type: 'village', x: .17, y: .72,
    etats: [{ id: 'fete', si: 'fini a1.e7' }],   // change le sous-titre, le texte et la lueur de la lanterne
    pnj: [
      { id: 'orvan', portrait: 'orvan', large: true },
      { id: 'brann', portrait: 'brann' },
      { id: 'auberge', role: 'auberge', portrait: 'aubergiste', prix: 10 },
      { id: 'hilde', role: 'boutique', portrait: 'hilde',
        objets: [], equipement: ['epee', 'braise', 'mailles', 'robe', ['acier', 'fini a1.e7'], ['chene', 'fini a1.e7'], ['brigandine', 'fini a1.e7'], ['cape', 'fini a1.e7']] },
      { id: 'berthe', role: 'boutique', portrait: 'berthe',
        objets: [['herbe', 8], ['tonique', 12]], equipement: [] },
      { id: 'nell', role: 'boutique', portrait: 'nell',
        objets: [['herbe', 7], ['tonique', 11], ['elixir', 25]], equipement: [] },
      { id: 'tilo', portrait: 'tilo' }
    ]
  },

  foret: {
    type: 'zone', x: .44, y: .52, cotes: ['v', 'g'],
    etats: [{ id: 'calme', si: 'fini a1.e7' }],
    maxEvenements: 3,   // événements au hasard par visite, en plus des découvertes fixes
    tresors: [
      { id: 'f1', type: 'tresor', gagne: '2 herbe' },
      { id: 'f2', type: 'lieu', effet: 'soin', repos: true },
      { id: 'f3', type: 'lieu', revele: 'loup' },
      { id: 'f4', type: 'tresor', gagne: '40 or, cuir' },
      { id: 'f5', type: 'lieu', revele: 'spore' }
    ],
    palier50: { gagne: 'herbe, tonique' },
    palier100: { gagne: 'plume' },
    evenements: [
      { id: 'combat', poids: 4, combat: true },
      { id: 'baies', poids: 1.5, effet: 'soin 12' },
      { id: 'colporteur', poids: 1, gagne: '15 or' },
      { id: 'piege', poids: 1.5, effet: 'degats kael 8' },
      { id: 'champignons', poids: 1.5, effet: 'pp 5' }
    ],
    groupes: {
      normal: [['loup', 'loup'], ['spore', 'spore'], ['loup', 'spore'], ['loup', 'loup', 'spore'], ['spore', 'loup', 'spore']]
    }
  },

  grotte: {
    type: 'zone', x: .74, y: .3, cotes: ['e', 'f'],
    visible: 'fini a1.e3', ouvert: 'fini a1.e3',
    etats: [{ id: 'sombre', si: 'fini a1.e5' }],
    maxEvenements: 3,
    tresors: [
      { id: 'g1', type: 'tresor', gagne: '40 or' },
      { id: 'g2', type: 'tresor', gagne: 'anneau' },
      { id: 'g3', type: 'lieu', revele: 'golem' },
      { id: 'g4', type: 'lieu', effet: 'pp' }
    ],
    palier50: { gagne: '2 tonique' },
    palier100: { gagne: 'eclat' },
    evenements: [
      { id: 'combat', poids: 4, combat: true },
      { id: 'filon', poids: 2, gagne: '20 or' },
      { id: 'eboulis', poids: 1.5, effet: 'degats tous 6' },
      { id: 'goutte', poids: 1.5, effet: 'pp 6' }
    ],
    groupes: {
      normal: [['chauve', 'chauve'], ['gelee', 'chauve'], ['gelee', 'gelee'], ['chauve', 'gelee', 'chauve']],
      sombre: [['ombre', 'chauve'], ['ombre', 'gelee'], ['chauve', 'ombre', 'chauve']]
    }
  },

  col: {
    type: 'zone', x: .47, y: .15, cotes: ['p', 's'],
    ouvert: 'fini a1.e7',
    etats: [{ id: 'vide', si: 'fini a1.e9' }],   // l'Ordre a emporté le cristal d'ambre
    maxEvenements: 3,
    tresors: [
      { id: 'c1', type: 'tresor', gagne: '60 or' },
      { id: 'c2', type: 'lieu', revele: 'belier' },
      { id: 'c3', type: 'lieu', effet: 'soin', repos: true },
      { id: 'c4', type: 'tresor', gagne: '2 tonique, elixir' },
      { id: 'c5', type: 'lieu', revele: 'harpie' },
      { id: 'c6', type: 'tresor', gagne: 'talisman' }
    ],
    palier50: { gagne: '2 herbe, tonique' },
    palier100: { gagne: 'corne' },
    evenements: [
      { id: 'combat', poids: 4, combat: true },
      { id: 'eboulis', poids: 1.5, effet: 'degats tous 8' },
      { id: 'edelweiss', poids: 1.5, effet: 'soin 15' },
      { id: 'pelerin', poids: 1, gagne: '25 or' },
      { id: 'vent', poids: 1.5, effet: 'pp 6' }
    ],
    groupes: {
      normal: [['belier'], ['harpie', 'harpie'], ['belier', 'harpie'], ['harpie', 'belier', 'harpie'], ['ombre', 'harpie']],
      vide: [['belier', 'belier'], ['harpie', 'ombre'], ['ombre', 'ombre', 'harpie'], ['belier', 'harpie', 'harpie']]
    }
  },

  marais: {
    type: 'zone', x: .13, y: .3, cotes: ['v', 'c'], region: { v: 'vallee', c: 'cote' }, carte: { cote: [.9, .5] },
    ouvert: 'fini a1.e10',
    maxEvenements: 3,
    tresors: [
      { id: 'm1', type: 'tresor', gagne: '60 or' },
      { id: 'm2', type: 'lieu', revele: 'crabe' },
      { id: 'm3', type: 'lieu', effet: 'soin', repos: true },
      { id: 'm4', type: 'tresor', gagne: '2 herbe, tonique' },
      { id: 'm5', type: 'tresor', gagne: '80 or' },
      { id: 'm6', type: 'lieu', revele: 'sangsue' }
    ],
    palier50: { gagne: '2 tonique' },
    palier100: { gagne: 'rose' },
    evenements: [
      { id: 'combat', poids: 4, combat: true },
      { id: 'sel', poids: 1.5, gagne: '20 or' },
      { id: 'vase', poids: 1.5, effet: 'degats tous 9' },
      { id: 'heron', poids: 1.5, effet: 'soin 15' },
      { id: 'brise', poids: 1.5, effet: 'pp 6' }
    ],
    groupes: {
      normal: [['crabe'], ['sangsue', 'sangsue'], ['crabe', 'sangsue'], ['sangsue', 'crabe', 'sangsue'], ['crabe', 'crabe']]
    }
  },

  // ---------- Côte de Salvent (acte 2) ----------
  salvent: {
    type: 'village', region: 'cote', x: .5, y: .6,
    visible: 'fini a2.e1',
    etats: [{ id: 'libre', si: 'fini a2.e7' }],   // la lanterne du phare protège à nouveau la ville
    pnj: [
      { id: 'maelle', role: 'auberge', portrait: 'maelle', prix: 20 },
      { id: 'gaspard', role: 'boutique', portrait: 'gaspard', fous: 'pas annexe prix 3', remise: 'annexe prix 3',
        objets: [['herbe', 8], ['tonique', 12], ['elixir', 25]],
        equipement: ['bandes', 'coutelas', 'harpe', 'veste', ['corail', 'fini a2.e4'], ['flots', 'fini a2.e4'], ['nacre', 'fini a2.e4'], ['houle', 'fini a2.e4'], ['griffes', 'annexe prix 3']] },
      { id: 'naia', portrait: 'naia', si: 'fini a2.e4' },
      { id: 'rosal', portrait: 'rosal' },
      { id: 'loic', portrait: 'loic' }
    ]
  },

  lanternes: {
    type: 'zone', region: 'cote', x: .7, y: .2, cotes: ['b', 'c'],
    visible: 'fini a2.e2', ouvert: 'fini a2.e2',
    etats: [{ id: 'allume', si: 'fini a2.e3' }],   // les trois lanternes brillent
    maxEvenements: 3,
    tresors: [
      { id: 'l1', type: 'tresor', gagne: '2 elixir' },
      { id: 'l2', type: 'lieu', revele: 'follet' },
      { id: 'l3', type: 'lieu', effet: 'soin', repos: true },
      { id: 'l4', type: 'tresor', gagne: '120 or' },
      { id: 'l5', type: 'lieu', revele: 'crapaud' },
      { id: 'l6', type: 'tresor', gagne: 'perle' }
    ],
    palier50: { gagne: '2 herbe, 2 tonique' },
    palier100: { gagne: 'ecaille' },
    evenements: [
      { id: 'combat', poids: 4, combat: true },
      { id: 'lueur', poids: 1.5, effet: 'pp 8' },
      { id: 'lucioles', poids: 1.5, effet: 'soin 18' },
      { id: 'vase', poids: 1.5, effet: 'degats tous 10' },
      { id: 'barque', poids: 1, gagne: '30 or' }
    ],
    groupes: {
      normal: [['follet', 'follet'], ['crapaud'], ['follet', 'crapaud'], ['crapaud', 'follet', 'follet'], ['sangsue', 'follet']],
      allume: [['follet'], ['crapaud', 'sangsue'], ['follet', 'follet', 'crapaud'], ['crapaud', 'crapaud']]
    }
  },

  epave: {
    type: 'zone', region: 'cote', x: .26, y: .84, cotes: ['p', 'c'],
    visible: 'fini a2.e3', ouvert: 'fini a2.e3',
    maxEvenements: 3,
    tresors: [
      { id: 'e1', type: 'tresor', gagne: '2 elixir' },
      { id: 'e2', type: 'lieu', revele: 'noye' },
      { id: 'e3', type: 'lieu', effet: 'soin', repos: true },
      { id: 'e4', type: 'tresor', gagne: '3 tonique' },
      { id: 'e5', type: 'lieu', revele: 'poisson' },
      { id: 'e6', type: 'tresor', gagne: '150 or' }
    ],
    palier50: { gagne: '2 tonique, elixir' },
    palier100: { gagne: 'dent' },
    evenements: [
      { id: 'combat', poids: 4, combat: true },
      { id: 'courant', poids: 1.5, effet: 'degats tous 10' },
      { id: 'bulle', poids: 1.5, effet: 'pp 8' },
      { id: 'coquillage', poids: 1, gagne: '40 or' },
      { id: 'algue', poids: 1.5, effet: 'soin 18' }
    ],
    groupes: {
      normal: [['noye'], ['poisson', 'poisson'], ['noye', 'poisson'], ['crabe', 'noye'], ['poisson', 'noye', 'poisson']]
    }
  },

  phare: {
    type: 'zone', region: 'cote', x: .15, y: .36, cotes: ['c', 's'],
    visible: 'fini a2.e5', ouvert: 'fini a2.e5',
    etats: [{ id: 'libre', si: 'fini a2.e7' }],   // l'Ordre est parti
    maxEvenements: 3,
    tresors: [
      { id: 'p1', type: 'tresor', gagne: '2 elixir' },
      { id: 'p2', type: 'lieu', revele: 'soldat' },
      { id: 'p3', type: 'lieu', effet: 'soin', repos: true },
      { id: 'p4', type: 'tresor', gagne: '3 tonique' },
      { id: 'p5', type: 'tresor', gagne: '200 or' },
      { id: 'p6', type: 'tresor', gagne: 'cloche' }
    ],
    palier50: { gagne: '2 elixir' },
    palier100: { gagne: 'perle' },
    evenements: [
      { id: 'combat', poids: 4, combat: true },
      { id: 'vague', poids: 1.5, effet: 'degats tous 11' },
      { id: 'provisions', poids: 1, gagne: '45 or' },
      { id: 'phare', poids: 1.5, effet: 'pp 8' },
      { id: 'embruns', poids: 1.5, effet: 'soin 20' }
    ],
    groupes: {
      normal: [['soldat'], ['soldat', 'ombre'], ['ombre', 'soldat', 'ombre'], ['soldat', 'soldat']],
      libre: [['noye', 'poisson'], ['crabe', 'crabe'], ['noye', 'crabe', 'poisson']]
    }
  },

  // Lieux de la suite, visibles sur la carte mais pas encore jouables
  prof: { type: 'zone', x: .9, y: .62, visible: 'fini a1.e3', ouvert: false },
  champs: { type: 'zone', x: .62, y: .9, visible: 'fini a2.e8', bientot: true }
};

// Chemins de la carte. « foret.v » = la forêt côté village : on change de côté en traversant la zone.
const LIENS = [
  ['lanterval', 'foret.v'],
  ['foret.g', 'grotte.e'],
  ['foret.g', 'col.p'],
  ['lanterval', 'marais.v'],
  ['grotte.f', 'prof'],
  ['lanterval', 'champs'],
  // Côte de Salvent
  ['marais.c', 'salvent'],
  ['salvent', 'lanternes.b'],
  ['salvent', 'epave.p'],
  ['salvent', 'phare.c']
];
