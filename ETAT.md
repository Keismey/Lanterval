# État du projet

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

## Prochaine étape (0.4)

Acte 3, les forges de Cendre. Il faudra y poser le drapeau `acte3` et écrire la suite des quêtes annexes qui l'attendent : « La berceuse » (Hilde répare la boîte), « La graine-lanterne » (cendre chaude aux Champs brûlés), « Le carnet du chasseur » (Salamandre reine), « Le colporteur » (trocs à Forgecendre).
