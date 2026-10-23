/* Lanterval · Quêtes annexes. Les textes sont dans textes/<langue>/annexes.txt.
   donneur : personnage du village marqué d'un « ! » bleu ; ouvre : quand la quête devient disponible.
   offre : ce qui se passe quand on parle au donneur (un choix dont la réponse « non » ne lance pas la quête).
   etapes : comme celles de la quête principale (voir acte1.js). Une quête annexe ne bloque jamais l'histoire.
   Une étape attend sans « ! » tant que son lieu n'est pas ouvert, ou que sa condition si n'est pas remplie
   (« drapeau acte3 » : la suite se joue à l'acte 3 ; « drapeau acte4 » : elle attend l'acte 4).
   Le donneur peut afficher sous son nom ce qu'il attend : texte <quête>.e<n>.sous (ce que cherche Fennel). */

const ANNEXES = {
  loup: {
    donneur: 'brann', ouvre: 'fini a1.e2',
    offre: [
      ['choix', 'loup.offre', { oui: [['message', 'loup.message']], non: [['stop']] }]
    ],
    etapes: [
      { lieu: 'foret', evenements: [
        ['dialogue', 'loup.e1.piste'],
        ['panorama', 'pano.loup-alpha'],
        ['dialogue', 'loup.e1.ravin'],
        ['combat', 'loup alpha'],
        ['decor'],
        ['gagne', 'croc'],
        ['dialogue', 'loup.e1.fin'],
        ['message', 'loup.e1.message']
      ] },
      { lieu: 'brann', evenements: [
        ['perd', 'croc'],
        ['classes', 'rodeur'],
        ['gagne', 'arc, 40 or'],
        ['dialogue', 'loup.e2.scene']
      ] }
    ]
  },

  // 2. La graine-lanterne (Pia). Une étape par région : la suite aux actes 3 et 4.
  graine: {
    donneur: 'pia', ouvre: 'fini a1.e7',
    offre: [
      ['choix', 'graine.offre', { oui: [['gagne', 'graine'], ['message', 'graine.message']], non: [['stop']] }]
    ],
    etapes: [
      { lieu: 'lanternes', evenements: [
        ['dialogue', 'graine.e1.arroser'],
        ['combat', 'follet follet follet'],
        ['perd', 'graine'],
        ['gagne', 'pousse'],
        ['dialogue', 'graine.e1.fin'],
        ['message', 'graine.e1.message']
      ] },
      // acte 3 : la cendre chaude des Champs brûlés
      { lieu: 'champs', si: 'drapeau acte3', evenements: [
        ['dialogue', 'graine.e2.cendre'],
        ['combat', 'chien chien salamandre'],
        ['perd', 'pousse'],
        ['gagne', 'bourgeon'],
        ['dialogue', 'graine.e2.fin'],
        ['message', 'graine.e2.message']
      ] },
      // acte 4 : le vent du Pont des Nuées ouvre la fleur, puis Pia la plante au pied de la lanterne
      { lieu: 'pont', si: 'drapeau acte4', evenements: [
        ['dialogue', 'graine.e3.vent'],
        ['combat', 'sylphe sylphe sylphe'],
        ['perd', 'bourgeon'],
        ['gagne', 'fleurie'],
        ['dialogue', 'graine.e3.fin'],
        ['message', 'graine.e3.message']
      ] },
      { lieu: 'pia', evenements: [
        ['perd', 'fleurie'],
        ['panorama', 'pano.fleur'],
        ['dialogue', 'graine.e4.lanterne'],
        ['decor'],
        ['gagne', 'fleur'],
        ['dialogue', 'graine.e4.fin']
      ] }
    ]
  },

  // 3. Le carnet du chasseur (Roxane). Une bête redoutable par région ; Roxane paie chaque preuve.
  // Roxane suit l'équipe : auberge de Lanterval, puis de Salvent (voir donnees/monde.js).
  chasse: {
    donneur: 'roxane', ouvre: 'fini a1.e7',
    offre: [
      ['choix', 'chasse.offre', { oui: [['message', 'chasse.message']], non: [['stop']] }]
    ],
    etapes: [
      { lieu: 'col', evenements: [
        ['dialogue', 'chasse.e1.traque'],
        ['combat', 'sanglier', { boss: true }],
        ['gagne', 'defense'],
        ['dialogue', 'chasse.e1.fin'],
        ['message', 'chasse.e1.message']
      ] },
      { lieu: 'roxane', evenements: [
        ['perd', 'defense'],
        ['gagne', '150 or'],
        ['dialogue', 'chasse.e2.scene'],
        ['message', 'chasse.e2.message']
      ] },
      { lieu: 'lanternes.c', evenements: [
        ['dialogue', 'chasse.e3.traque'],
        ['combat', 'anguille', { boss: true }],
        ['gagne', 'ecaille-orage'],
        ['dialogue', 'chasse.e3.fin'],
        ['message', 'chasse.e3.message']
      ] },
      { lieu: 'roxane', evenements: [
        ['perd', 'ecaille-orage'],
        ['gagne', '300 or'],
        ['dialogue', 'chasse.e4.scene'],
        ['message', 'chasse.e4.message']
      ] },
      // acte 3 : la Salamandre reine, côté ferme brûlée des Champs brûlés ; Roxane attend à Forgecendre
      { lieu: 'champs.c', si: 'drapeau acte3', evenements: [
        ['dialogue', 'chasse.e5.traque'],
        ['combat', 'salamandre salreine salamandre', { boss: true }],
        ['gagne', 'peau-salamandre'],
        ['dialogue', 'chasse.e5.fin'],
        ['message', 'chasse.e5.message']
      ] },
      { lieu: 'roxane', evenements: [
        ['perd', 'peau-salamandre'],
        ['gagne', '500 or'],
        ['dialogue', 'chasse.e6.scene'],
        ['message', 'chasse.e6.message']
      ] },
      // acte 4 : le Roc ailé du Pont des Nuées ; Roxane attend à Aerie
      { lieu: 'pont', si: 'drapeau acte4', evenements: [
        ['dialogue', 'chasse.e7.traque'],
        ['combat', 'rocaile', { boss: true, conseil: 'chasse.e7.conseil' }],
        ['gagne', 'serre-roc'],
        ['dialogue', 'chasse.e7.fin'],
        ['message', 'chasse.e7.message']
      ] },
      { lieu: 'roxane', si: 'fini a4.e2', evenements: [
        ['perd', 'serre-roc'],
        ['dialogue', 'chasse.e8.scene'],
        ['gagne', 'traqueur, 800 or'],
        ['dialogue', 'chasse.e8.fin']
      ] }
    ]
  },

  // 4. Le colporteur (Fennel). Une chaîne de trocs d'un village à l'autre ; Fennel suit l'équipe.
  colporteur: {
    donneur: 'fennel', ouvre: 'fini a1.e2',
    offre: [
      ['choix', 'colporteur.offre', { oui: [['message', 'colporteur.message']], non: [['stop']] }]
    ],
    etapes: [
      { lieu: 'berthe', evenements: [
        ['dialogue', 'colporteur.e1.scene'],
        ['gagne', 'miel'],
        ['message', 'colporteur.e1.message']
      ] },
      { lieu: 'fennel', evenements: [
        ['perd', 'miel'],
        ['gagne', 'boussole'],
        ['dialogue', 'colporteur.e2.scene'],
        ['message', 'colporteur.e2.message']
      ] },
      { lieu: 'loic', evenements: [
        ['perd', 'boussole'],
        ['gagne', 'perle-grise'],
        ['dialogue', 'colporteur.e3.scene'],
        ['message', 'colporteur.e3.message']
      ] },
      { lieu: 'fennel', evenements: [
        ['perd', 'perle-grise'],
        ['gagne', 'corne-brume'],
        ['dialogue', 'colporteur.e4.scene'],
        ['message', 'colporteur.e4.message']
      ] },
      // acte 3 : Dorn, le vieux mineur aveugle, troque la corne de brume contre un lingot d'étoile
      { lieu: 'dorn', si: 'drapeau acte3 et fini a3.e2', evenements: [
        ['perd', 'corne-brume'],
        ['gagne', 'lingot'],
        ['dialogue', 'colporteur.e5.scene'],
        ['message', 'colporteur.e5.message']
      ] },
      { lieu: 'fennel', evenements: [
        ['perd', 'lingot'],
        ['gagne', 'plume-roc'],
        ['dialogue', 'colporteur.e6.scene'],
        ['message', 'colporteur.e6.message']
      ] },
      // acte 4 : à Aerie, Ilse tisse la plume de roc en Cape des quatre vents
      { lieu: 'ilse', si: 'drapeau acte4 et fini a4.e2', evenements: [
        ['dialogue', 'colporteur.e7.scene'],
        ['perd', 'plume-roc'],
        ['gagne', 'cape4'],
        ['dialogue', 'colporteur.e7.fin']
      ] }
    ]
  },

  // ---------- Côte de Salvent ----------
  // 5. Le navire oublié (Rosal, classe Corsaire)
  navire: {
    donneur: 'rosal', ouvre: 'fini a2.e2',
    offre: [
      ['choix', 'navire.offre', { oui: [['message', 'navire.message']], non: [['stop']] }]
    ],
    etapes: [
      { lieu: 'epave.c', evenements: [
        ['dialogue', 'navire.e1.cales'],
        ['combat', 'noye noye'],
        ['gagne', 'journal-salicorne'],
        ['dialogue', 'navire.e1.journal'],
        ['message', 'navire.e1.message']
      ] },
      { lieu: 'phare.c', evenements: [
        ['dialogue', 'navire.e2.crique'],
        ['combat', 'soldat bosco soldat', { boss: true }],
        ['decor'],
        ['dialogue', 'navire.e2.fin'],
        ['message', 'navire.e2.message']
      ] },
      { lieu: 'rosal', evenements: [
        ['perd', 'journal-salicorne'],
        ['panorama', 'pano.rosal'],
        ['dialogue', 'navire.e3.barre'],
        ['decor'],
        ['classes', 'corsaire'],
        ['gagne', 'sabre, 100 or'],
        ['dialogue', 'navire.e3.scene']
      ] }
    ]
  },

  // 7. Les prix perdus (Gaspard, le marchand de Salvent)
  prix: {
    donneur: 'gaspard', ouvre: 'fini a2.e2',
    offre: [
      ['choix', 'prix.offre', { oui: [['message', 'prix.message']], non: [['stop']] }]
    ],
    etapes: [
      { lieu: 'marais', evenements: [
        ['dialogue', 'prix.e1.pages'],
        ['combat', 'crabe crabe'],
        ['gagne', 'pages-registre'],
        ['dialogue', 'prix.e1.pie'],
        ['message', 'prix.e1.message']
      ] },
      { lieu: 'lanternes', evenements: [
        ['dialogue', 'prix.e2.nid'],
        ['combat', 'pie', { boss: true }],
        ['decor'],
        ['perd', 'pages-registre'],
        ['gagne', 'registre'],
        ['dialogue', 'prix.e2.fin'],
        ['message', 'prix.e2.message']
      ] },
      { lieu: 'gaspard', evenements: [
        ['perd', 'registre'],
        ['dialogue', 'prix.e3.scene']
      ] }
    ]
  },

  // 6. La berceuse (Maëlle ; Sol et Naïa). La boîte se trouve à l'acte 2, Hilde la répare à l'acte 3,
  // puis Sol la rend à Naïa (dès l'acte 3, comme prévu dans l'onglet Rythme de la bible).
  berceuse: {
    donneur: 'maelle', ouvre: 'fini a2.e8',
    offre: [
      ['choix', 'berceuse.offre', { oui: [['message', 'berceuse.message']], non: [['stop']] }]
    ],
    etapes: [
      { lieu: 'epave.c', evenements: [
        ['dialogue', 'berceuse.e1.cabine'],
        ['combat', 'poisson poisson poisson'],
        ['gagne', 'boite'],
        ['dialogue', 'berceuse.e1.boite'],
        ['message', 'berceuse.e1.message']
      ] },
      // acte 3 : Hilde répare la boîte à Forgecendre
      { lieu: 'hilde', si: 'drapeau acte3 et fini a3.e2', evenements: [
        ['dialogue', 'berceuse.e2.scene'],
        ['perd', 'boite'],
        ['gagne', 'boite-reparee'],
        ['dialogue', 'berceuse.e2.fin'],
        ['message', 'berceuse.e2.message']
      ] },
      { lieu: 'naia', evenements: [
        ['dialogue', 'berceuse.e3.quai'],
        ['perd', 'boite-reparee'],
        ['panorama', 'pano.berceuse'],
        ['dialogue', 'berceuse.e3.chant'],
        ['decor'],
        ['gagne', 'marees'],
        ['dialogue', 'berceuse.e3.fin']
      ] }
    ]
  },

  // ---------- Plaines de Cendre ----------
  // 8. La pierre qui chante (Dorn, classe Géomancien). La pierre se cherche sous le rocher fendu du Col.
  pierre: {
    donneur: 'dorn', ouvre: 'fini a3.e2',
    offre: [
      ['choix', 'pierre.offre', { oui: [['message', 'pierre.message']], non: [['stop']] }]
    ],
    etapes: [
      { lieu: 'col', evenements: [
        ['dialogue', 'pierre.e1.rocher'],
        ['combat', 'statue statue'],
        ['gagne', 'pierre'],
        ['dialogue', 'pierre.e1.fin'],
        ['message', 'pierre.e1.message']
      ] },
      { lieu: 'mines', evenements: [
        ['dialogue', 'pierre.e2.ecoute'],
        ['combat', 'tellure', { boss: true }],
        ['panorama', 'pano.veine'],
        ['dialogue', 'pierre.e2.veine'],
        ['decor'],
        ['gagne', 'cristal-chantant'],
        ['message', 'pierre.e2.message']
      ] },
      { lieu: 'dorn', evenements: [
        ['perd', 'pierre, cristal-chantant'],
        ['dialogue', 'pierre.e3.scene'],
        ['classes', 'geomancien'],
        ['gagne', 'dorn'],
        ['dialogue', 'pierre.e3.fin']
      ] }
    ]
  },

  // 9. Le premier moule (Hilde ; Mira et Hilde). Hilde se bat avec l'équipe (invitee) dans les deux combats.
  moule: {
    donneur: 'hilde', ouvre: 'fini a3.e10',
    offre: [
      ['choix', 'moule.offre', { oui: [['message', 'moule.message']], non: [['stop']] }]
    ],
    etapes: [
      { lieu: 'mines.g', evenements: [
        ['dialogue', 'moule.e1.porte'],
        ['dialogue', 'moule.e1.salle'],
        ['combat', 'gardien gardien', { boss: true, invitee: 'hilde', conseil: 'moule.e1.conseil' }],
        ['gagne', 'moule'],
        ['dialogue', 'moule.e1.fin'],
        ['message', 'moule.e1.message']
      ] },
      { lieu: 'volcan.c', evenements: [
        ['dialogue', 'moule.e2.bord'],
        ['combat', 'esprit lezard esprit', { invitee: 'hilde' }],
        ['perd', 'moule'],
        ['gagne', 'metal-ardent'],
        ['dialogue', 'moule.e2.fin'],
        ['message', 'moule.e2.message']
      ] },
      { lieu: 'hilde', evenements: [
        ['panorama', 'pano.forge'],
        ['dialogue', 'moule.e3.forge'],
        ['perd', 'metal-ardent'],
        ['dialogue', 'moule.e3.arme'],
        ['decor'],
        ['gagne', 'coeurforge'],
        ['dialogue', 'moule.e3.fin']
      ] }
    ]
  },

  // 10. Le carnet d'Aldric (Hilde ; Kael et Aldric). Quatre pages : la garde de l'épée, Brann, la grotte, le col.
  // Finie, elle fait survivre Aldric dans l'épilogue (condition « annexe aldric 4 », acte 4).
  aldric: {
    donneur: 'hilde', ouvre: 'fini a3.e10',
    offre: [
      ['choix', 'aldric.offre', { oui: [['gagne', 'page-aldric'], ['dialogue', 'aldric.page'], ['message', 'aldric.message']], non: [['stop']] }]
    ],
    etapes: [
      { lieu: 'brann', evenements: [
        ['dialogue', 'aldric.e1.coffre'],
        ['perd', 'page-aldric'],
        ['gagne', 'pages-aldric2'],
        ['dialogue', 'aldric.e1.page'],
        ['message', 'aldric.e1.message']
      ] },
      { lieu: 'grotte.f', evenements: [
        ['dialogue', 'aldric.e2.cristal'],
        ['combat', 'brume brume brume'],
        ['perd', 'pages-aldric2'],
        ['gagne', 'pages-aldric3'],
        ['dialogue', 'aldric.e2.page'],
        ['message', 'aldric.e2.message']
      ] },
      { lieu: 'col.s', evenements: [
        ['dialogue', 'aldric.e3.pierre'],
        ['combat', 'sentinelle automate sentinelle'],
        ['dialogue', 'aldric.e3.page'],
        ['perd', 'pages-aldric3'],
        ['gagne', 'carnet-aldric'],
        ['panorama', 'pano.carnet'],
        ['dialogue', 'aldric.e3.carnet'],
        ['decor'],
        ['gagne', 'bouclier'],
        ['dialogue', 'aldric.e3.fin']
      ] }
    ]
  },

  // 11. Les mineurs disparus (Tobi). La galerie profonde des Mines rouges débouche sur les Champs brûlés.
  mineurs: {
    donneur: 'tobi', ouvre: 'fini a3.e6',
    offre: [
      ['choix', 'mineurs.offre', { oui: [['message', 'mineurs.message']], non: [['stop']] }]
    ],
    etapes: [
      { lieu: 'mines.g', evenements: [
        ['dialogue', 'mineurs.e1.galerie'],
        ['combat', 'ver ver ver'],
        ['gagne', 'casque-mineur'],
        ['dialogue', 'mineurs.e1.fin'],
        ['message', 'mineurs.e1.message']
      ] },
      { lieu: 'champs.c', evenements: [
        ['dialogue', 'mineurs.e2.ferme'],
        ['combat', 'chien scarabee chien'],
        ['dialogue', 'mineurs.e2.fin'],
        ['message', 'mineurs.e2.message']
      ] },
      { lieu: 'tobi', evenements: [
        ['perd', 'casque-mineur'],
        ['dialogue', 'mineurs.e3.scene'],
        ['gagne', 'lampe, 200 or'],
        ['dialogue', 'mineurs.e3.fin']
      ] }
    ]
  },

  // ---------- Hauts-Vents ----------
  // 14. Le courrier des falaises (Pell, le facteur en planeur). Les lettres sont sur le Pont des Nuées ;
  // la Plume du facteur arrive tout de suite (voyage direct vers une zone déjà visitée), puis une lettre par village.
  courrier: {
    donneur: 'pell', ouvre: 'fini a4.e2',
    offre: [
      ['choix', 'courrier.offre', { oui: [['message', 'courrier.message']], non: [['stop']] }]
    ],
    etapes: [
      { lieu: 'pont', evenements: [
        ['dialogue', 'courrier.e1.lettres'],
        ['combat', 'rapace rapace rapace'],
        ['gagne', 'lettres'],
        ['dialogue', 'courrier.e1.pell'],
        ['gagne', 'plume-facteur'],
        ['dialogue', 'courrier.e1.plume'],
        ['message', 'courrier.e1.message']
      ] },
      { lieu: 'brann', evenements: [
        ['dialogue', 'courrier.e2.scene'],
        ['message', 'courrier.e2.message']
      ] },
      { lieu: 'maelle', evenements: [
        ['dialogue', 'courrier.e3.scene'],
        ['message', 'courrier.e3.message']
      ] },
      { lieu: 'dorn', evenements: [
        ['dialogue', 'courrier.e4.scene'],
        ['message', 'courrier.e4.message']
      ] },
      { lieu: 'pell', evenements: [
        ['perd', 'lettres'],
        ['dialogue', 'courrier.e5.scene'],
        ['gagne', '300 or'],
        ['dialogue', 'courrier.e5.fin']
      ] }
    ]
  }
};
