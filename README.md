# Lanterval

RPG à l'aquarelle de **Keismey Studio** : la lanterne de Lanterval s'éteint, Kael part la ranimer.
HTML et JavaScript purs, sans installation ; publié sur GitHub Pages, jouable hors ligne, en français et en anglais.

## Où est quoi

| Dossier | Contenu | Qui le modifie |
|---|---|---|
| `textes/fr/`, `textes/en/` | Tous les textes : dialogues, lieux, noms, interface | Keismey peut les relire et les corriger directement |
| `donnees/` | Le scénario et le monde : étapes des actes, quêtes annexes, monstres, objets, carte, liste des images | Claude (format expliqué en tête de chaque fichier) |
| `moteur/` | Le code du jeu | Claude |
| `img/` | Images définitives (préparées depuis `outils/sources/` par `outils/images.py`) | Claude |
| `commun/` | `ks-studio.js` et `ks-back.js`, fichiers communs à tous les jeux du studio | Ne pas modifier ici |
| `outils/` | Vérification, préparation des publications, images | Claude |

## Lire ou corriger un texte

Ouvre le fichier dans `textes/fr/`. Chaque texte commence par `== repère` (ne change pas le repère).
Une ligne = une bulle. `Nom : « … »` fait parler un personnage. `*mots*` met en gras. `[Bouton]` en fin de ligne
change le bouton pour continuer. Les lignes qui commencent par `#` sont des notes.

## Avant chaque publication

```
node outils/verifier.js     # textes manquants, monstres ou objets inconnus, bulles trop longues
node outils/construire.js   # met à jour le cache hors ligne (sw.js) et l'aperçu dist/apercu.html
```

Pour vérifier l'équilibrage, `node outils/bot.js` joue la partie entière dans Chromium (Playwright) et donne,
pour chaque combat de quête, les niveaux de l'équipe et ses PV les plus bas.

## Mode test

Ajoute `?debug=1` à l'adresse (jamais actif sur keismey.github.io), puis Options › Mode test :
sauter à une étape, donner de l'or ou des niveaux, finir une zone.

## Sauvegarde

Clé `lanterval-v1` (lue par le hub, sans y écrire), copie de secours `lanterval-v1.bak`, options `lanterval-options`.
