/* Lanterval · Le monde : villages, zones, carte.
   Les textes (noms, descriptions, trésors, événements) sont dans textes/<langue>/lieux.txt.

   Conditions (visible, ouvert, si) : « fini a1.e3 » = étape 3 de l'acte 1 terminée,
   « pas fini a1.e7 », « annexe loup 2 » = quête annexe loup arrivée à l'étape 2 ou plus.
   Plusieurs conditions se joignent avec « et ». Sans condition : toujours vrai.

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
      { id: 'berthe', role: 'boutique', portrait: 'berthe',
        objets: [['herbe', 8], ['tonique', 12]], equipement: ['epee', 'braise', 'mailles', 'robe'] },
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

  // Lieux de la suite, visibles sur la carte mais pas encore jouables
  col: { type: 'zone', x: .47, y: .15, ouvert: 'fini a1.e7', bientot: true },
  marais: { type: 'zone', x: .13, y: .3, ouvert: false },
  prof: { type: 'zone', x: .9, y: .62, visible: 'fini a1.e3', ouvert: false }
};

// Chemins de la carte. « foret.v » = la forêt côté village : on change de côté en traversant la zone.
const LIENS = [
  ['lanterval', 'foret.v'],
  ['foret.g', 'grotte.e'],
  ['foret.g', 'col'],
  ['lanterval', 'marais'],
  ['grotte.f', 'prof']
];
