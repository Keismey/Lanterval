/* Lanterval · Quêtes annexes. Les textes sont dans textes/<langue>/annexes.txt.
   donneur : personnage du village marqué d'un « ! » bleu ; ouvre : quand la quête devient disponible.
   offre : ce qui se passe quand on parle au donneur (un choix dont la réponse « non » ne lance pas la quête).
   etapes : comme celles de la quête principale (voir acte1.js). Une quête annexe ne bloque jamais l'histoire.
   Une étape attend sans « ! » tant que son lieu n'est pas ouvert, ou que sa condition si n'est pas remplie
   (la suite de « La berceuse » se joue à l'acte 3). */

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

  // 6. La berceuse (Maëlle ; Sol et Naïa). La boîte se trouve à l'acte 2, Hilde la répare à l'acte 3.
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
      // suite à l'acte 3 : Hilde répare la boîte à Forgecendre (drapeau posé par l'acte 3)
      { lieu: 'hilde', si: 'drapeau acte3', evenements: [
        ['dialogue', 'berceuse.e2.scene']
      ] }
    ]
  }
};
