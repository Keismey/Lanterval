# Lanterval · réponses pour la Play Console

Tout ce qu'il faut recopier dans la Play Console, section par section. Les textes de la fiche sont dans `fr.md` et `en.md`.

Ces réponses valent pour la 1.0 (test fermé, tout gratuit, verrou de l'acte 2 ouvert par le bouton « Déverrouiller »). **À revoir en 1.1** : achat Google Play de la suite (Achats intégrés : Oui ; Classification : Achats numériques : Oui ; page de confidentialité déjà prête pour ça).

## Créer l'application

| Champ | Réponse |
|---|---|
| Nom de l'appli | Lanterval |
| Langue par défaut | Français – fr-FR |
| Application ou jeu | Jeu |
| Gratuite ou payante | Gratuite (définitif : une appli gratuite ne peut jamais devenir payante ; l'achat de la suite sera un achat intégré) |
| Nom du package (vient de l'AAB) | com.keismey.lanterval |

## Fiche de l'application

| Champ | Réponse |
|---|---|
| Titre de la fiche | voir `fr.md` (« Lanterval : RPG à l'aquarelle ») |
| Traductions | en-US (`en.md`), et en-GB si tu veux la même fiche anglaise au Royaume-Uni |
| Catégorie | Jeu de rôle |
| Tags | Jeu de rôle, Fantasy, Au tour par tour, Solo, Hors ligne, Histoire (choisir dans la liste de la Console, 5 au maximum) |
| E-mail de contact | l'adresse du studio (la même que pour Oxyblox et Pico-Clinic) |
| Site web | https://keismey.github.io/ |
| Règles de confidentialité | https://keismey.github.io/confidentialite-lanterval.html |

## Contenu de l'application

| Question | Réponse |
|---|---|
| Règles de confidentialité | https://keismey.github.io/confidentialite-lanterval.html |
| Annonces | **Non, l'appli ne contient pas d'annonces** |
| Accès à l'appli | Toutes les fonctionnalités sont disponibles sans accès spécial (pas de compte) |
| Public cible | 13-15, 16-17, 18 ans et plus. **Ne pas cocher les moins de 13 ans** (sinon le jeu entre dans le programme Familles, avec des règles bien plus strictes) |
| L'appli peut-elle attirer les enfants ? | Non (RPG avec combats, ton et thèmes pour ados et adultes : deuil, oubli, disparitions) |
| Appli d'actualités | Non |
| Applis gouvernementales, santé, finances, VPN | Non |
| Identifiant publicitaire | **Non** (aucun SDK publicitaire ni de mesure) |
| Achats intégrés | Non pour la 1.0. Oui à partir de la 1.1 |

## Classification du contenu (questionnaire IARC)

| Question | Réponse |
|---|---|
| Catégorie | Jeu |
| Violence | Oui, violence fantastique : les héros combattent des monstres et des créatures (loups, golems, spectres, soldats d'un ordre ennemi) au tour par tour, à l'épée et à la magie. Pas de sang, pas de démembrement, pas de violence réaliste. Les personnages humains vaincus s'enfuient ou se rendent |
| Peur / horreur | Non (quelques ambiances sombres, brume, spectres en aquarelle, sans effets choquants) |
| Sexualité, nudité | Non |
| Langage grossier | Non |
| Drogues, alcool, tabac | Non (une auberge du village, sans consommation montrée ni encouragée) |
| Jeux d'argent (simulés ou réels) | Non |
| Les utilisateurs peuvent-ils communiquer ou partager du contenu ? | Non |
| Partage de la position | Non |
| Achats numériques | Non pour la 1.0, oui en 1.1 |
| Navigateur web / accès Internet sans restriction | Non (le formulaire de bug s'ouvre dans le navigateur du téléphone, pas dans l'appli) |

Si une question porte sur des thèmes difficiles : l'histoire parle de deuil (la mère de Kael), d'abandon et d'oubli, sans scène explicite.

Résultat attendu : PEGI 7 ou PEGI 12 (violence fantastique), « 10+ » ou « Ado » selon les pays.

## Sécurité des données

| Question | Réponse |
|---|---|
| L'appli collecte-t-elle ou partage-t-elle des types de données requis ? | **Non** |

C'est tout : avec « Non », la Console ne pose pas les autres questions. Justification : le jeu fonctionne hors ligne, pas de compte, pas de pub, pas de mesure d'audience, pas de synchro. La partie reste sur le téléphone (et dans la sauvegarde Google d'Android si le joueur l'a activée, ce qui ne compte pas comme une collecte par l'appli). Le code de sauvegarde ne sort que si le joueur le copie lui-même. Le formulaire de bug est une page web ouverte dans le navigateur, hors de l'appli.

**À revoir en 1.1** : Google Play Billing n'oblige pas à déclarer de données (c'est Google qui traite le paiement), la réponse reste « Non » tant qu'on n'ajoute ni pub ni Play Jeux.

## Autorisations Android de l'APK

| Autorisation | Pourquoi |
|---|---|
| INTERNET | Ajoutée d'office par Capacitor. Le jeu lui-même n'envoie rien |

Aucune autre autorisation (pas de vibration, pas de position, pas de stockage).

## Éléments graphiques (dans `graphismes/`)

| Élément | Format | Fichier |
|---|---|---|
| Icône | 512 × 512 PNG | `icone-512.png` |
| Image de présentation | 1024 × 500 PNG | `presentation-1024x500.png` (tirée de l'affiche) |
| Captures téléphone | 2 à 8, 9:16, 1080 × 1920 | `captures-fr/` pour la fiche française, `captures-en/` pour la fiche anglaise |
| Vidéo (facultatif) | lien YouTube | la bande-annonce de fin d'acte 1 filmée (`/mnt/project-files/lanterval-playstore/apercu-trailer-fin-acte1-v5.mp4`), à mettre en ligne sur YouTube si tu veux |
