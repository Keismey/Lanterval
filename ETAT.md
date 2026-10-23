# État du projet

## Version 0.5.1 (2026-10-23)

- Demande de Keismey : les traversées allaient trop vite. `traverse` (moteur/carte.js) avance en 4 étapes de 1,4 s ; le panneau garde la liste de ce qui s'est passé à chaque étape (combat gagné et contre qui, or ramassé, rien à signaler) ; avant chaque combat, les monstres sont annoncés avec un bouton « Combattre » ; à l'arrivée, un bilan affiché d'un coup (option `instant` de `show`, demande de Keismey) et validé d'un appui.
- Demande de Keismey : fin de combat toujours validée d'un appui (avant, le combat automatique sans niveau gagné continuait tout seul). Écran de victoire (`ecranVictoire` dans moteur/combat.js) : XP et or gagnés, barre d'XP de chaque héros qui se remplit, « Niveau N ! » quand un niveau est gagné.
- Correction : un bouton doré (principal) restait gris quand le pointeur était encore dessus après un appui.

## Version 0.5.0 (2026-10-23)

- Acte 4 « L'Œil », première partie (donnees/acte4.js, étapes a4.e1 à a4.e7, plan validé par Keismey) : carte `vents` avec le Pont des Nuées (zone à deux côtés Cendre/Aerie), Aerie, les Ruines du monastère (parvis/sanctuaire) et le Pic hurlant (base/sommet) ; l'Escalier de brume est visible en « bientôt ». L'histoire va jusqu'au feu de camp, la veille de l'assaut.
- a4.e1 pose le drapeau `acte4` ; Kael reçoit l'Épée d'Aldric (`aldric`, réservée à Kael, Attaque +36).
- Boss : Serpent d'azur (a4.e5, charge + double garde), Varen en duel contre Nev seule (a4.e6, `equipe: 'nev'`). Monstres : rapace, sylphe, gargouille, moine spectral, griffon, élémentaire de givre.
- Classes Sage, Ninja et Lame-mage (cristal d'azur, a4.e5). Techniques : prière, jugement, kunaï, ninjutsu, taille-sort (Attaque et Magie), enchantement (l'Attaque prend l'élément du héros pendant 3 actions).
- Varen invité : après a4.e6 (drapeau `varen`), il se bat avec l'équipe dans tous les combats, sauf les duels (`equipe`) et les combats avec une autre invitée. Classe Duelliste (lames croisées, parade).
- Capacité `envol` (Roc ailé) : un tour sur deux il s'envole ; en l'air seul le Vent le touche, briser sa garde le fait tomber, et il pique sur toute l'équipe en redescendant. Demande de Keismey : deux images (`monstre.rocaile` au sol, `monstre.rocaile.vol` en vol) ; en vol, le monstre monte au-dessus de sa place sans sortir de l'écran (`levee` dans moteur/scene.js), son ombre et son cadre d'infos restent au sol.
- Quêtes annexes : fin de la graine (Fleur-lanterne, accessoire qui rend des PV à chaque action), du carnet du chasseur (Roc ailé au Pont, Œil du traqueur : faiblesses connues dès le début du combat, 800 po) et du colporteur (Ilse tisse la Cape des quatre vents). Nouvelle quête 14 « Le courrier des falaises » (`courrier`, Pell) : Plume du facteur (depuis la carte, aller directement dans une zone déjà visitée, sans combat de traversée) ; à la fin, Joran vend la Plume de vent et l'Amulette des nuées.
- Aerie : auberge d'Edda, boutique de Joran (armes et armures des vents, Baume des vents +400 PV). Roxane, Fennel, Pell et Ilse y sont après a4.e2.
- Codex, onglet Personnages : Tavor, Pell, Ilse, et nouvelles infos pour Kael, Mira, Sol, Nev, Orvan, Varen, Naïa, Ysold, Roxane, Fennel.
- Images de l'acte 4 : toutes provisoires (pixel art pour les monstres, les visages et les décors, cadre nommé pour les panoramas).
- Le vérificateur signale désormais les repères de texte en double sans planter.
- Équilibrage au bot (graines 1 à 3, le bot sait maintenant viser un monstre en l'air avec le Vent) : l'équipe arrive au Pont vers le niveau 29 et au sommet du Pic vers 33 ; le Serpent d'azur descend l'équipe entre 7 et 43 % de PV, Varen (Nev seule) entre 16 et 35 %, le Roc ailé entre 36 et 74 % (le bot se soigne beaucoup avec Sol).
## Version 0.4.2 (2026-10-23)

- Demande de Keismey : les armes ultimes sont réservées à leur personnage (`heros` dans donnees/objets.js) : Bâton des marées pour Sol, Cœur de forge pour Mira. Le sac, l'inventaire et le menu Équipe l'indiquent (« Seulement pour Sol », « Réservée à Mira ») ; une arme portée par quelqu'un d'autre retourne au sac au chargement de la partie. L'épée d'Aldric (Kael) et la dague de Nev suivront la même règle à l'acte 4.

## Version 0.4.1 (2026-10-23)

- Quêtes annexes 9 et 10 de la bible, données par Hilde à Forgecendre après l'épée reforgée (`ouvre: 'fini a3.e10'`), choix validés par Keismey :
  - « Le premier moule » (`moule`) : salle scellée des Mines rouges (boss : deux Gardiens de cage), moule jeté dans le cratère du Volcan endormi, forge avec Hilde. Récompense : *Cœur de forge*, bâton ultime de Mira (Magie +29, PP +10). Panorama `pano.forge`.
  - « Le carnet d'Aldric » (`aldric`) : page dans la garde de l'épée, page chez Brann, page au fond de la Grotte de Cristal (Ombres de brume), dernière page au sommet du Col (sentinelles et automate de l'Ordre). Récompense : *Bouclier d'Aldric* (accessoire, Défense +8, PV +25) et le *Carnet d'Aldric*. Toute la quête se joue dès l'acte 3 ; finie (`annexe aldric 4`), elle fait survivre Aldric dans l'épilogue (acte 4). Panorama `pano.carnet`.
- Invitée en combat : option `invitee: 'hilde'` d'un combat de quête. Hilde (`HEROS.hilde`, `invite: true`, classe Forgeronne : Coup de marteau qui ronge la garde, Trempe qui divise les dégâts par deux) se bat au niveau de Kael, se commande comme un héros, ne gagne pas d'expérience et n'apparaît ni dans le menu Équipe ni dans le Codex. Cinq cartes en combat (`.pcards.n5`).
- Un personnage qui a deux quêtes à offrir (Hilde) propose l'autre quand on vient d'en refuser une (`offresRefusees` dans moteur/village.js).
- Codex, onglet Personnages : nouvelles infos pour Kael, Mira, Brann, Hilde et le Sans-Nom.
- Correction : le casque trouvé dans la galerie porte le nom d'Ulric (et non Bram), le père de Tobi.
- Images provisoires : Gardien de cage et Ombre de brume (pixel art) ; panoramas en cadre nommé.
- Équilibrage au bot (graines 1 à 3) : les Gardiens de cage descendent l'équipe (niveau 26, avec Hilde) entre 19 et 39 % de PV.

## Version 0.4.0 (2026-10-23)

- Acte 3 « Les forges de Cendre » (donnees/acte3.js, étapes a3.e1 à a3.e10, plan validé par Keismey) : carte `cendre` avec les Champs brûlés (zone à deux côtés vallée/Cendre), Forgecendre (état `libre` après a3.e5), les Mines rouges, le Volcan endormi ; le Pont des Nuées est visible en « bientôt ».
- Nev rejoint en a3.e1 (élément Vent `V`, classe de départ Moine) : combats à quatre héros (`.pcards.n4`). Duel de a3.e8 avec `equipe: 'kael nev'`.
- Événement `['drapeau', id]` (pose `S.f[id]`) : `acte3` en a3.e1, `pardon` (choix de Mira en a3.e6), `charrette` en a3.e10 (voyage direct vers un village depuis la carte, moteur/carte.js).
- Classes Berserker, Alchimiste, Invocateur (cristal de braise, a3.e8) et Géomancien (secrète, quête « La pierre qui chante ») ; élément `Z` = élément de la région (`ELEMENT_REGION` dans donnees/heros.js). Techniques : furie (recul), rage (Attaque ×1,4 pendant 3 actions, Défense baissée), corrosion (retire un point de garde), mixture, invocation, offrande, terroir, éboulement.
- Quêtes annexes : suite de la graine (bourgeon), du carnet (Salamandre reine, 500 po), du colporteur (Dorn, lingot → plume de roc) avec une dernière étape qui attend `drapeau acte4` ; fin de « La berceuse » (Bâton des marées pour Sol) ; nouvelles quêtes `pierre` (Dorn) et `mineurs` (Tobi, Lampe de mineur : l'exploration trouve plus souvent un trésor ou un lieu ; trois armes de Hilde débloquées).
- Hilde quitte Lanterval pour Forgecendre en a3.e2 ; Roxane et Fennel l'y suivent.
- Équilibrage au bot (graines 1 à 5) : l'équipe entre dans l'acte 3 vers le niveau 18 et le finit vers 25 ; les boss de l'acte 3 sont plus rapides et ont plus de garde, pour ne pas rester brisés en permanence face à quatre héros.
- Mode test : sauter une étape applique aussi les événements d'une traversée (`milieu`), sinon Nev ne rejoignait pas l'équipe.
- Images de l'acte 3 : toutes provisoires (entrées ajoutées dans donnees/images.js avec leur `sujet`).

## Version 0.3.5 (2026-10-23)

- Mise à jour du jeu sur le site public : le service worker télécharge les fichiers sans le cache du navigateur (`cache: 'reload'`, GitHub Pages les garde 10 minutes), et la page se recharge toute seule à l'écran titre quand une nouvelle version s'installe.

## Version 0.3.4 (2026-10-23)

- Demande de Keismey : sur grand écran (paysage d'au moins 560 px de haut), même mise en page que sur téléphone, image en haut au format des décors (16:9, jusqu'à 60 % de la hauteur) et panneau de dialogues et boutons dessous, largeur bornée (720 à 1100 px). Seul le téléphone couché garde la scène à gauche et le panneau à droite (css/jeu.css).

## Version 0.3.3 (2026-10-23)

- Demande de Keismey (ne pas casser le 4e mur) : une bulle « ? texte » est une astuce de jeu, affichée dans un encadré avec une icône « ? » (`encadreTuto` dans moteur/textes.js). Les conseils avant un boss (`conseil`) sont encadrés de la même façon. Appliqué au prologue (les « ! »), aux deux annonces de classes et aux récompenses des quêtes annexes.

## Version 0.3.2 (2026-10-23)

- Quêtes annexes de la vallée (bible, quêtes 2, 3 et 4), jouées aux actes 1 et 2 ; leur dernière étape attend l'acte 3 (`si: 'drapeau acte3'`) :
  - « La graine-lanterne » (Pia, après la fête) : arroser la graine au Marais des Lanternes (feux follets) ; elle devient une pousse.
  - « Le carnet du chasseur » (Roxane, après la fête) : Sanglier-roc au Col des Pierres (garde 7, faible au Feu), Anguille-tonnerre au cœur du Marais des Lanternes (frappe deux fois tant que sa garde tient) ; Roxane paie 150 puis 300 po.
  - « Le colporteur » (Fennel, après l'arrivée de Mira) : miel de Berthe → boussole (Fennel) → perle grise (Loïc) → corne de brume (Fennel).
- Le prompt de l'étape parlait du « carnet d'Aldric » : c'est la quête 10 de la bible (acte 3). La quête 3 est « Le carnet du chasseur ».
- Personnages qui suivent l'équipe : un même PNJ dans plusieurs villages avec des conditions `si` qui se suivent (Roxane, Fennel) ; `villageDuPnj` prend le village où il est en ce moment.
- Sous-titre du donneur : `<quête>.e<n>.sous` (ce que cherche Fennel) quand l'étape se joue ailleurs.
- Capacité `double` avec `garde: true` : seulement tant que la garde du monstre tient.
- Codex, onglet Personnages : Roxane et Fennel.
- Portraits provisoires de Pia, Roxane, Fennel ; Sanglier-roc et Anguille-tonnerre en pixel art.
- `outils/bot.js` : le bot de test qui joue la partie entière (quêtes annexes comprises) et donne les niveaux et les PV les plus bas à chaque combat de quête.

## Version 0.3.1 (2026-10-23)

- Onglet Personnages du Codex (demande de Keismey) : donnees/personnages.js donne, pour chaque personnage, une condition par info ; textes perso.<id>.<n> dans textes/xx/personnages.txt. `S.perso[id]` = infos déjà lues ; une info nouvelle met une pastille sur l'icône du Codex, l'onglet et le personnage, éteinte quand on déplie sa fiche (les infos nouvelles restent surlignées). L'icône du Codex ouvre directement l'onglet Personnages quand il y a du nouveau.
- Portrait provisoire d'Ysold (`pnj.ysold`).

## Version 0.3.0 (2026-10-22)

- Acte 2 « La ville qui oublie » (donnees/acte2.js, étapes a2.e1 à a2.e8) : Marais salant (zone à deux côtés, pont entre la vallée et la côte), Salvent, Marais des Lanternes, Épave engloutie, Phare noyé.
- Cartes par région : `region` dans donnees/monde.js, `carte: { cote: [x, y] }` pour un lieu sur deux cartes ; le menu de la carte propose aussi les villages des autres régions.
- Boss : Vouivre des marais, Mère-des-abysses (appelle des crabes), Héraut de la Paupière ; boss annexes : Pie-brume, Bosco. Nouvelles capacités de monstres : `drain`, `double`, `appel`, et `vol` (objet volable).
- Classes Moine, Voleur, Barde (cristal d'écume) et classe secrète Corsaire (quête « Le navire oublié »). Statuts de combat : sommeil, courage, esquive.
- Quêtes annexes : « Le navire oublié » (Rosal), « Les prix perdus » (Gaspard : prix tirés au hasard à chaque visite, en rouge si gonflés et en vert si réduits, puis vrais prix à −10 %), « La berceuse » (étape 1 ; l'étape 2 attend l'acte 3 via `si: 'drapeau acte3'`).
- Boutiques à onglets (Armes, Armures, Accessoires, Consommables), à l'achat comme à la vente (demande de Keismey).
- Défaite : réveil à l'auberge du dernier village visité (`S.auberge`).
- Équilibrage vérifié au bot (exploration à 100 %, niveaux 15 à 17 en fin d'acte 2) : boss de l'acte 2 entre 15 et 40 % de PV restants au plus bas, sans défaite.
- Images provisoires (pixel art) pour tout ce qui est nouveau.

## Version 0.2.2 (2026-10-22)

- Pas de quête téléguidée (demande de Keismey) : plus de bouton « Aller à / Rentrer à » ; un « ! » marque le bouton Carte (`marqueCarte`), le bouton Traverser (`marqueTraversee`) et le lieu sur la carte.

## Version 0.2.1 (2026-10-22)

- Codex : chaque classe débloquée est repliable (`<details class="cls">`).

## Version 0.2.0 (2026-10-22)

- L'acte 1 est complet (étapes 1 à 10 dans donnees/acte1.js ; les étapes 8 et 9 de la bible deviennent a1.e8 montée du col, a1.e9 sommet, a1.e10 épée du père).
- Col des Pierres : zone à deux côtés (pied, sommet), 6 découvertes, 5 événements, Bélier des roches et Harpie du col ; état « vide » après le vol du cristal.
- Duel contre Varen à deux héros (`equipe: 'kael mira'`), puis combat perdu d'avance contre le Sans-Nom (`perdu: true`, monstre `intouchable`) : pas de retour au village ni de perte d'or, l'étape continue et Kael se réveille à l'auberge.
- Épée du père (objet important), Marais salant sur la carte (prochaine version).
- Hilde, mère de Mira, tient la forge de Lanterval (armes et armures, nouvelles pièces après la fête) ; Berthe vend les herbes et toniques. Accueil des boutiques selon l'avancée (`pnj.<id>.accueil.<étape>`).
- Images provisoires (pixel art) : décor du col, Bélier, Harpie, Varen, Sans-Nom, portraits de Hilde, Varen et du Sans-Nom. Panoramas « cage du cristal » et « épée du père » en cadre nommé.
- Hub : pas de fiche avant la version finale (décision de Keismey) ; le jeu se joue par son lien.

## Version 0.1.2 (2026-10-22)

- 0.1.1 : texte stable, appui n'importe où pour continuer, monstres deux fois plus petits, icônes de combat colorées par élément. Le moteur gère les armes élémentaires (`el` dans donnees/objets.js), mais aucune n'en a pour l'instant.
- 0.1.2 : onglet Classes dans le Codex (classes débloquées, armes, statistiques, techniques) ; le Bâton de braise n'est plus de Feu et l'Attaque n'est plus colorée (seules les techniques le sont) ; jauges PV, PP et XP chiffrées dans le menu Équipe. Explication des stats (appui dans l'Équipe, aide du Codex). Journal à quêtes repliables, sans les classes. Menus à taille fixe (`modal('grand', …)`). Point de reprise `S.reprise` : une étape interrompue reprend après le dernier événement joué.

- Acte 1 jouable de l'Ancien Orvan à la fête de la lanterne (étapes 1 à 7 de la bible), quête annexe du loup alpha.
- Le Col des Pierres apparaît sur la carte, marqué « prochaine version ».
- Sauvegarde automatique, copie de secours, export/import (Options › Sauvegarde), partie+.
- FR et EN complets, hors ligne, mode test.
- Images définitives : place du village, Kael (+ portrait), loup des brumes, panorama de la fête. Le reste est provisoire (pixel art de la maquette ou cadre nommé).

## Prochaine étape (0.5.2)

0.5.2 : quêtes annexes 12 (l'œuf de wyverne), 13 (le cerf-volant : dague ultime de Nev, réservée à Nev, en ajoutant la dague aux armes du Moine et du Berserker) et 15 (les larmes de l'Œil). Puis 0.5.3 : l'Escalier de brume, l'assaut final et l'épilogue, qui lira `annexe aldric 4` (Aldric survit) et `annexe moule 4` (réconciliation de Mira et Hilde).
