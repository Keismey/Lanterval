/* Lanterval · Quêtes annexes. Les textes sont dans textes/<langue>/annexes.txt.
   donneur : personnage du village marqué d'un « ! » bleu ; ouvre : quand la quête devient disponible.
   offre : ce qui se passe quand on parle au donneur (un choix dont la réponse « non » ne lance pas la quête).
   etapes : comme celles de la quête principale (voir acte1.js). Une quête annexe ne bloque jamais l'histoire. */

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
  }
};
