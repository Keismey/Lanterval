/* Lanterval · Le monde : villages, zones, carte.
   Les textes (noms, descriptions, trésors, événements) sont dans textes/<langue>/lieux.txt.

   region : la carte où le lieu apparaît (vallee par défaut). Une zone à deux côtés peut relier deux régions :
   region: { v: 'vallee', c: 'cote' } ; carte: { cote: [x, y] } donne sa place sur l'autre carte.

   Conditions (visible, ouvert, si) : « fini a1.e3 » = étape 3 de l'acte 1 terminée,
   « pas fini a1.e7 », « annexe loup 2 » = quête annexe loup arrivée à l'étape 2 ou plus.
   Plusieurs conditions se joignent avec « et ». Sans condition : toujours vrai.

   Personnage (pnj) : si = condition pour qu'il soit là ; sous = repère de son sous-titre dans ce village (sinon pnj.<id>.sous). Un même personnage peut être dans plusieurs villages
   avec des conditions qui se suivent (Roxane, Fennel, Hilde) : il suit l'équipe.
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
      // Orvan monte à Aerie pour le feu de camp (a4.e7) et y reste
      { id: 'orvan', portrait: 'orvan', large: true, si: 'pas fini a4.e7' },
      { id: 'brann', portrait: 'brann' },
      { id: 'auberge', role: 'auberge', portrait: 'aubergiste', prix: 10 },
      // Hilde part pour Forgecendre à l'acte 3 (sa forge de Lanterval ferme)
      { id: 'hilde', role: 'boutique', portrait: 'hilde', si: 'pas fini a3.e2',
        objets: [], equipement: ['epee', 'braise', 'mailles', 'robe', ['acier', 'fini a1.e7'], ['chene', 'fini a1.e7'], ['brigandine', 'fini a1.e7'], ['cape', 'fini a1.e7']] },
      { id: 'berthe', role: 'boutique', portrait: 'berthe',
        objets: [['herbe', 8], ['tonique', 12]], equipement: [] },
      { id: 'nell', role: 'boutique', portrait: 'nell',
        objets: [['herbe', 7], ['tonique', 11], ['elixir', 25]], equipement: [] },
      { id: 'tilo', portrait: 'tilo' },
      // quêtes annexes de la vallée ; Roxane et Fennel partent à Salvent quand la ville est découverte
      { id: 'pia', portrait: 'pia', si: 'fini a1.e7' },
      { id: 'roxane', portrait: 'roxane', si: 'fini a1.e7 et pas fini a2.e1' },
      { id: 'fennel', portrait: 'fennel', si: 'fini a1.e2 et pas fini a2.e1' }
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
      { id: 'loic', portrait: 'loic' },
      { id: 'roxane', portrait: 'roxane', si: 'pas fini a3.e2' },
      { id: 'fennel', portrait: 'fennel', si: 'pas fini a3.e2' }
    ]
  },

  lanternes: {
    type: 'zone', region: 'cote', x: .68, y: .3, cotes: ['b', 'c'],
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

  // ---------- Plaines de Cendre (acte 3) ----------
  // Champs brûlés : zone à deux côtés, la lisière (vallée) et la ferme brûlée (Cendre)
  champs: {
    type: 'zone', x: .62, y: .9, cotes: ['v', 'c'], region: { v: 'vallee', c: 'cendre' }, carte: { cendre: [.14, .78] },
    visible: 'fini a2.e8', ouvert: 'fini a2.e8',
    maxEvenements: 3,
    tresors: [
      { id: 'b1', type: 'tresor', gagne: '2 elixir' },
      { id: 'b2', type: 'lieu', revele: 'chien' },
      { id: 'b3', type: 'lieu', effet: 'soin', repos: true },
      { id: 'b4', type: 'tresor', gagne: '220 or' },
      { id: 'b5', type: 'lieu', revele: 'scarabee' },
      { id: 'b6', type: 'tresor', gagne: '2 ether' }
    ],
    palier50: { gagne: '2 elixir, ether' },
    palier100: { gagne: 'griffe' },
    evenements: [
      { id: 'combat', poids: 4, combat: true },
      { id: 'braises', poids: 1.5, effet: 'degats tous 14' },
      { id: 'puits', poids: 1.5, effet: 'soin 30' },
      { id: 'grange', poids: 1, gagne: '60 or' },
      { id: 'cendres', poids: 1.5, effet: 'pp 10' }
    ],
    groupes: {
      normal: [['chien', 'chien'], ['scarabee'], ['chien', 'salamandre'], ['salamandre', 'scarabee', 'salamandre'], ['chien', 'chien', 'salamandre']]
    }
  },

  forgecendre: {
    type: 'village', region: 'cendre', x: .42, y: .58,
    visible: 'fini a3.e1',
    etats: [{ id: 'libre', si: 'fini a3.e5' }],   // les mineurs sont libres, l'Ordre a quitté la ville
    pnj: [
      { id: 'goran', role: 'auberge', portrait: 'goran', prix: 30 },
      { id: 'hilde', role: 'boutique', portrait: 'hilde', si: 'fini a3.e2',
        objets: [],
        equipement: ['hache', 'cendre', 'magma', 'gantelets', 'stylet', 'lyre', 'plates', 'manteau', 'salamandre',
          ['ardente', 'annexe mineurs 4'], ['cratere', 'annexe mineurs 4'], ['fendoir', 'annexe mineurs 4']] },
      { id: 'agathe', role: 'boutique', portrait: 'agathe',
        objets: [['herbe', 8], ['tonique', 12], ['elixir', 25], ['potion', 50], ['ether', 30]], equipement: [] },
      { id: 'dorn', portrait: 'dorn', si: 'fini a3.e2' },
      { id: 'tobi', portrait: 'tobi', si: 'fini a3.e6' },
      // Roxane et Fennel partent pour Aerie à l'acte 4
      { id: 'roxane', portrait: 'roxane', si: 'fini a3.e2 et pas fini a4.e2' },
      { id: 'fennel', portrait: 'fennel', si: 'fini a3.e2 et pas fini a4.e2' }
    ]
  },

  mines: {
    type: 'zone', region: 'cendre', x: .8, y: .5, cotes: ['e', 'g'],
    visible: 'fini a3.e2', ouvert: 'fini a3.e2',
    etats: [{ id: 'libre', si: 'fini a3.e5' }],
    maxEvenements: 3,
    tresors: [
      { id: 'r1', type: 'tresor', gagne: '2 potion' },
      { id: 'r2', type: 'lieu', revele: 'ver' },
      { id: 'r3', type: 'lieu', effet: 'soin', repos: true },
      { id: 'r4', type: 'tresor', gagne: '280 or' },
      { id: 'r5', type: 'lieu', revele: 'automate' },
      { id: 'r6', type: 'tresor', gagne: '2 ether, elixir' }
    ],
    palier50: { gagne: '2 elixir, ether' },
    palier100: { gagne: 'filon' },
    evenements: [
      { id: 'combat', poids: 4, combat: true },
      { id: 'grisou', poids: 1.5, effet: 'degats tous 15' },
      { id: 'pepite', poids: 1, gagne: '70 or' },
      { id: 'source', poids: 1.5, effet: 'soin 30' },
      { id: 'cristaux', poids: 1.5, effet: 'pp 10' }
    ],
    groupes: {
      normal: [['ver'], ['automate', 'sentinelle'], ['sentinelle', 'ver'], ['ver', 'sentinelle', 'ver'], ['automate']],
      libre: [['ver', 'ver'], ['automate'], ['ver', 'automate', 'ver'], ['scarabee', 'ver']]
    }
  },

  volcan: {
    type: 'zone', region: 'cendre', x: .55, y: .2, cotes: ['p', 'c'],
    visible: 'fini a3.e6', ouvert: 'fini a3.e6',
    maxEvenements: 3,
    tresors: [
      { id: 'v1', type: 'tresor', gagne: '2 potion, ether' },
      { id: 'v2', type: 'lieu', revele: 'lezard' },
      { id: 'v3', type: 'lieu', effet: 'soin', repos: true },
      { id: 'v4', type: 'tresor', gagne: '350 or' },
      { id: 'v5', type: 'lieu', revele: 'esprit' },
      { id: 'v6', type: 'tresor', gagne: 'oeuf' }   // objet mystère : « L'œuf de wyverne », acte 4
    ],
    palier50: { gagne: '2 potion' },
    palier100: { gagne: 'lave' },
    evenements: [
      { id: 'combat', poids: 4, combat: true },
      { id: 'coulee', poids: 1.5, effet: 'degats tous 16' },
      { id: 'geyser', poids: 1.5, effet: 'pp 12' },
      { id: 'obsidienne', poids: 1, gagne: '80 or' },
      { id: 'brise', poids: 1.5, effet: 'soin 35' }
    ],
    groupes: {
      normal: [['lezard'], ['esprit', 'esprit'], ['lezard', 'esprit'], ['esprit', 'lezard', 'esprit'], ['sentinelle', 'lezard']]
    }
  },

  // ---------- Hauts-Vents (acte 4) ----------
  // Pont des Nuées : zone à deux côtés, le côté Cendre et le côté Aerie (carte des Hauts-Vents)
  pont: {
    type: 'zone', x: .88, y: .14, cotes: ['c', 'a'], region: { c: 'cendre', a: 'vents' }, carte: { vents: [.13, .8] },
    visible: 'fini a3.e10', ouvert: 'fini a3.e10',
    maxEvenements: 3,
    tresors: [
      { id: 'n1', type: 'tresor', gagne: '2 potion, ether' },
      { id: 'n2', type: 'lieu', revele: 'rapace' },
      { id: 'n3', type: 'lieu', effet: 'soin', repos: true },
      { id: 'n4', type: 'tresor', gagne: '420 or' },
      { id: 'n5', type: 'lieu', revele: 'sylphe' },
      { id: 'n6', type: 'tresor', gagne: 'baume' }
    ],
    palier50: { gagne: '2 potion, 2 ether' },
    palier100: { gagne: 'nuage' },
    evenements: [
      { id: 'combat', poids: 4, combat: true },
      { id: 'rafale', poids: 1.5, effet: 'degats tous 18' },
      { id: 'nuage', poids: 1.5, effet: 'soin 40' },
      { id: 'sacoche', poids: 1, gagne: '90 or' },
      { id: 'silence', poids: 1.5, effet: 'pp 12' }
    ],
    groupes: {
      normal: [['rapace', 'rapace'], ['sylphe', 'rapace'], ['sylphe', 'sylphe', 'rapace'], ['sentinelle', 'rapace'], ['rapace', 'sylphe', 'rapace']]
    }
  },

  aerie: {
    type: 'village', region: 'vents', x: .36, y: .64,
    visible: 'fini a4.e1',
    pnj: [
      { id: 'tavor', portrait: 'tavor', large: true },
      { id: 'edda', role: 'auberge', portrait: 'edda', prix: 40 },
      // la boutique finale ; Pell y ajoute sa réserve à la fin du « Courrier des falaises »
      { id: 'joran', role: 'boutique', portrait: 'joran',
        objets: [['potion', 50], ['ether', 30], ['baume', 90]],
        equipement: ['vent', 'nuee', 'zephyr', 'serres', 'eolienne', 'tempete', 'plumacier', 'soie', 'cuirvent',
          ['plumevent', 'annexe courrier 6'], ['amulette', 'annexe courrier 6'], ['lance', 'annexe wyverne 4']] },
      { id: 'pell', portrait: 'pell', si: 'fini a4.e2' },
      { id: 'ilse', portrait: 'ilse', si: 'fini a4.e2' },
      { id: 'roxane', portrait: 'roxane', si: 'fini a4.e2' },
      { id: 'fennel', portrait: 'fennel', si: 'fini a4.e2' },
      // Liss, la grand-mère de Nev et Varen (« Le cerf-volant ») ; Orvan, arrivé pour le feu de camp
      { id: 'liss', portrait: 'liss', si: 'fini a4.e2' },
      { id: 'orvan', portrait: 'orvan', si: 'fini a4.e7', sous: 'pnj.orvan.sous.aerie' },
      // Garrick, le vieux maître de Roxane (« Les Échos », après la fin)
      { id: 'garrick', portrait: 'garrick', si: 'fini a4.e2' }
    ]
  },

  ruines: {
    type: 'zone', region: 'vents', x: .7, y: .46, cotes: ['p', 's'],
    visible: 'fini a4.e2', ouvert: 'fini a4.e2',
    maxEvenements: 3,
    tresors: [
      { id: 'u1', type: 'tresor', gagne: '2 potion, baume' },
      { id: 'u2', type: 'lieu', revele: 'gargouille' },
      { id: 'u3', type: 'lieu', effet: 'soin', repos: true },
      { id: 'u4', type: 'tresor', gagne: '480 or' },
      { id: 'u5', type: 'lieu', revele: 'spectre' },
      { id: 'u6', type: 'tresor', gagne: '3 ether' }
    ],
    palier50: { gagne: '2 potion, ether' },
    palier100: { gagne: 'chapelet' },
    evenements: [
      { id: 'combat', poids: 4, combat: true },
      { id: 'eboulis', poids: 1.5, effet: 'degats tous 18' },
      { id: 'cloche', poids: 1.5, effet: 'pp 12' },
      { id: 'tronc', poids: 1, gagne: '100 or' },
      { id: 'source', poids: 1.5, effet: 'soin 40' }
    ],
    groupes: {
      normal: [['gargouille'], ['spectre', 'spectre'], ['gargouille', 'sylphe'], ['spectre', 'gargouille', 'spectre'], ['sylphe', 'spectre']]
    }
  },

  pic: {
    type: 'zone', region: 'vents', x: .46, y: .2, cotes: ['b', 's'],
    visible: 'fini a4.e5', ouvert: 'fini a4.e5',
    maxEvenements: 3,
    tresors: [
      { id: 'k1', type: 'tresor', gagne: '2 baume' },
      { id: 'k2', type: 'lieu', revele: 'griffon' },
      { id: 'k3', type: 'lieu', effet: 'soin', repos: true },
      { id: 'k4', type: 'tresor', gagne: '550 or' },
      { id: 'k5', type: 'lieu', revele: 'givre' },
      { id: 'k6', type: 'tresor', gagne: '2 potion, 2 ether' }
    ],
    palier50: { gagne: 'baume, 2 ether' },
    palier100: { gagne: 'crocgivre' },
    evenements: [
      { id: 'combat', poids: 4, combat: true },
      { id: 'avalanche', poids: 1.5, effet: 'degats tous 20' },
      { id: 'hurlement', poids: 1.5, effet: 'pp 14' },
      { id: 'cairn', poids: 1, gagne: '110 or' },
      { id: 'soleil', poids: 1.5, effet: 'soin 45' }
    ],
    groupes: {
      normal: [['griffon'], ['givre', 'rapace'], ['griffon', 'sylphe'], ['givre', 'givre'], ['rapace', 'griffon', 'rapace']]
    }
  },

  // L'Escalier de brume, le final (a4.e8 à a4.e10). nonRetour : une fois monté (drapeau escalier), plus de carte
  // ni de traversée libre jusqu'à la fin ; avant, on n'y explore pas. Ses deux côtés ne se relient que par l'histoire.
  escalier: {
    type: 'zone', region: 'vents', x: .84, y: .12, cotes: ['b', 's'],
    visible: 'fini a4.e6', ouvert: 'fini a4.e7', nonRetour: 'drapeau escalier',
    etats: [{ id: 'sommet', si: 'fini a4.e9' }],
    maxEvenements: 3,
    tresors: [
      { id: 'h1', type: 'tresor', gagne: '2 baume, 2 ether' },
      { id: 'h2', type: 'lieu', revele: 'veilleur' },
      { id: 'h3', type: 'lieu', effet: 'soin', repos: true },
      { id: 'h4', type: 'tresor', gagne: '900 or' },
      { id: 'h5', type: 'lieu', revele: 'nueeoubli' },
      { id: 'h6', type: 'tresor', gagne: '3 potion, 2 baume' }
    ],
    palier50: { gagne: '2 baume, 3 ether' },
    palier100: { gagne: 'etoile' },
    evenements: [
      { id: 'combat', poids: 4, combat: true },
      { id: 'vertige', poids: 1.5, effet: 'degats tous 24' },
      { id: 'souvenir', poids: 1.5, effet: 'pp 16' },
      { id: 'offrande', poids: 1, gagne: '150 or' },
      { id: 'lumiere', poids: 1.5, effet: 'soin 60' }
    ],
    groupes: {
      normal: [['veilleur'], ['nueeoubli', 'nueeoubli'], ['veilleur', 'nueeoubli'], ['nueeoubli', 'veilleur', 'nueeoubli'], ['veilleur', 'brume']]
    }
  }
};

// Chemins de la carte. « foret.v » = la forêt côté village : on change de côté en traversant la zone.
const LIENS = [
  ['lanterval', 'foret.v'],
  ['foret.g', 'grotte.e'],
  ['foret.g', 'col.p'],
  ['lanterval', 'marais.v'],
  ['lanterval', 'champs.v'],
  // Côte de Salvent
  ['marais.c', 'salvent'],
  ['salvent', 'lanternes.b'],
  ['salvent', 'epave.p'],
  ['salvent', 'phare.c'],
  // Plaines de Cendre
  ['champs.c', 'forgecendre'],
  ['forgecendre', 'mines.e'],
  ['forgecendre', 'volcan.p'],
  ['forgecendre', 'pont.c'],
  // Hauts-Vents
  ['pont.a', 'aerie'],
  ['aerie', 'ruines.p'],
  ['aerie', 'pic.b'],
  ['pic.s', 'escalier.b']
];
