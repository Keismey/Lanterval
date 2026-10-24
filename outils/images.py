"""Lanterval : prépare les images du jeu à partir des images Gemini.

Usage : python3 -I outils/images.py   (depuis la racine du dépôt)

Chaque entrée de LISTE prend une image de outils/sources/ et écrit un WebP dans img/.
Modes :
  decor     recadrée au format voulu, redimensionnée, compressée
  detoure   le fond blanc touchant les bords devient transparent, puis l'image est rognée
  portrait  un carré découpé dans l'image détourée (avatar)
Après un ajout, passer la fiche correspondante en « finale » dans donnees/images.js.
"""
import os
from collections import deque
from PIL import Image

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(RACINE, 'outils', 'sources')
OUT = os.path.join(RACINE, 'img')

LISTE = [
    # (source, sortie, mode, options)
    ('decor-village-lanterval.jpg', 'decors/lanterval.webp', 'decor', {'largeur': 1376}),
    ('panorama-lanterne-village.jpg', 'panoramas/fete-lanterne.webp', 'decor', {'largeur': 1584}),
    ('panorama-ouverture.jpg', 'panoramas/ouverture.webp', 'decor', {'largeur': 1584}),
    ('panorama-mira-loups.jpg', 'panoramas/mira-loups.webp', 'decor', {'largeur': 1584}),
    ('panorama-insigne.jpg', 'panoramas/insigne.webp', 'decor', {'largeur': 1584}),
    ('panorama-lac-sol.jpg', 'panoramas/lac-sol.webp', 'decor', {'largeur': 1584}),
    ('panorama-gardien.jpg', 'panoramas/gardien.webp', 'decor', {'largeur': 1584}),
    ('panorama-loup-alpha.jpg', 'panoramas/loup-alpha.webp', 'decor', {'largeur': 1584}),
    ('panorama-cage.jpg', 'panoramas/cage.webp', 'decor', {'largeur': 1584}),
    ('panorama-epee.jpg', 'panoramas/epee.webp', 'decor', {'largeur': 1584}),
    ('panorama-salvent.jpg', 'panoramas/salvent.webp', 'decor', {'largeur': 1584}),
    ('panorama-epave.jpg', 'panoramas/epave.webp', 'decor', {'largeur': 1584}),
    ('panorama-naia.jpg', 'panoramas/naia.webp', 'decor', {'largeur': 1584}),
    ('panorama-phare.jpg', 'panoramas/phare.webp', 'decor', {'largeur': 1584}),
    ('panorama-vision.jpg', 'panoramas/vision.webp', 'decor', {'largeur': 1584}),
    ('panorama-rosal.jpg', 'panoramas/rosal.webp', 'decor', {'largeur': 1584}),
    ('panorama-nev-champs.jpg', 'panoramas/nev-champs.webp', 'decor', {'largeur': 1584}),
    ('panorama-forgecendre.jpg', 'panoramas/forgecendre.webp', 'decor', {'largeur': 1584}),
    ('panorama-cage-hilde.jpg', 'panoramas/cage-hilde.webp', 'decor', {'largeur': 1584}),
    ('panorama-braise.jpg', 'panoramas/braise.webp', 'decor', {'largeur': 1584}),
    ('panorama-masque.jpg', 'panoramas/masque.webp', 'decor', {'largeur': 1584}),
    ('panorama-berceuse.jpg', 'panoramas/berceuse.webp', 'decor', {'largeur': 1584}),
    ('panorama-veine.jpg', 'panoramas/veine.webp', 'decor', {'largeur': 1584}),
    ('panorama-forge.jpg', 'panoramas/forge.webp', 'decor', {'largeur': 1584}),
    ('panorama-carnet.jpg', 'panoramas/carnet.webp', 'decor', {'largeur': 1584}),
    ('panorama-pont.jpg', 'panoramas/pont.webp', 'decor', {'largeur': 1584}),
    ('panorama-aerie.jpg', 'panoramas/aerie.webp', 'decor', {'largeur': 1584}),
    ('panorama-fresques.jpg', 'panoramas/fresques.webp', 'decor', {'largeur': 1584}),
    ('panorama-ysold-azur.jpg', 'panoramas/ysold-azur.webp', 'decor', {'largeur': 1584}),
    ('panorama-feu.jpg', 'panoramas/feu.webp', 'decor', {'largeur': 1584}),
    ('panorama-wyverne.jpg', 'panoramas/wyverne.webp', 'decor', {'largeur': 1584}),
    ('panorama-cerfvolant.jpg', 'panoramas/cerfvolant.webp', 'decor', {'largeur': 1584}),
    ('panorama-larmes.jpg', 'panoramas/larmes.webp', 'decor', {'largeur': 1584}),
    ('panorama-fleur.jpg', 'panoramas/fleur.webp', 'decor', {'largeur': 1584}),
    ('panorama-aldric.jpg', 'panoramas/aldric.webp', 'decor', {'largeur': 1584}),
    ('panorama-ysold.jpg', 'panoramas/ysold.webp', 'decor', {'largeur': 1584}),
    ('panorama-oeil.jpg', 'panoramas/oeil.webp', 'decor', {'largeur': 1584}),
    ('panorama-epilogue-kael.jpg', 'panoramas/epilogue-kael.webp', 'decor', {'largeur': 1584}),
    ('panorama-epilogue-mira.jpg', 'panoramas/epilogue-mira.webp', 'decor', {'largeur': 1584}),
    ('panorama-epilogue-sol.jpg', 'panoramas/epilogue-sol.webp', 'decor', {'largeur': 1584}),
    ('panorama-epilogue-nev.jpg', 'panoramas/epilogue-nev.webp', 'decor', {'largeur': 1584}),
    ('panorama-echo.jpg', 'panoramas/echo.webp', 'decor', {'largeur': 1584}),
    ('titre-paix.jpg', 'titre/paix.webp', 'decor', {'largeur': 768}),
    ('titre-brume.jpg', 'titre/brume.webp', 'decor', {'largeur': 768}),
    ('perso-kael.jpg', 'heros/kael.webp', 'detoure', {'hauteur': 420}),
    ('perso-kael.jpg', 'heros/kael-portrait.webp', 'portrait', {'boite': (612, 38, 186, 186), 'cote': 192}),
    ('monstre-loup-des-brumes.jpg', 'monstres/loup.webp', 'detoure', {'largeur': 640}),
    ('perso-mira.jpg', 'heros/mira.webp', 'detoure', {'hauteur': 420}),
    ('perso-mira.jpg', 'heros/mira-portrait.webp', 'portrait', {'boite': (594, 42, 170, 170), 'cote': 192}),
    ('perso-sol.jpg', 'heros/sol.webp', 'detoure', {'hauteur': 420}),
    ('perso-sol.jpg', 'heros/sol-portrait.webp', 'portrait', {'boite': (620, 42, 180, 180), 'cote': 192}),
    ('perso-nev.jpg', 'heros/nev.webp', 'detoure', {'hauteur': 420}),
    ('perso-nev.jpg', 'heros/nev-portrait.webp', 'portrait', {'boite': (615, 30, 180), 'cote': 192}),
    ('decor-foret-murmures.jpg', 'decors/foret.webp', 'decor', {'largeur': 1376}),
    ('monstre-champi-spore.jpg', 'monstres/spore.webp', 'detoure', {'largeur': 640}),
    ('monstre-chiroptere.jpg', 'monstres/chauve.webp', 'detoure', {'largeur': 640, 'trous': 400}),
    ('monstre-gelee-quartz.jpg', 'monstres/gelee.webp', 'detoure', {'largeur': 640}),
    ('monstre-ombre-voleuse.jpg', 'monstres/ombre.webp', 'detoure', {'largeur': 640, 'trous': 400}),
    ('monstre-loup-alpha.jpg', 'monstres/alpha.webp', 'detoure', {'largeur': 640, 'trous': 400}),
    ('monstre-gardien-cristal.jpg', 'monstres/golem.webp', 'detoure', {'largeur': 760, 'trous': 3000}),
    ('decor-foret-calme.jpg', 'decors/foret-calme.webp', 'decor', {'largeur': 1376}),
    ('decor-grotte-cristal.jpg', 'decors/grotte.webp', 'decor', {'largeur': 1376}),
    ('decor-grotte-sombre.jpg', 'decors/grotte-sombre.webp', 'decor', {'largeur': 1376}),
    ('decor-col-pierres.jpg', 'decors/col.webp', 'decor', {'largeur': 1376}),
    ('decor-col-vide.jpg', 'decors/col-vide.webp', 'decor', {'largeur': 1376}),
    ('decor-carte-vallee.jpg', 'decors/carte.webp', 'decor', {'largeur': 1376}),
    ('decor-marais.jpg', 'decors/marais.webp', 'decor', {'largeur': 1376}),
    ('decor-salvent.jpg', 'decors/salvent.webp', 'decor', {'largeur': 1376}),
    ('decor-salvent-libre.jpg', 'decors/salvent-libre.webp', 'decor', {'largeur': 1376}),
    ('decor-lanternes.jpg', 'decors/lanternes.webp', 'decor', {'largeur': 1376}),
    ('decor-lanternes-allume.jpg', 'decors/lanternes-allume.webp', 'decor', {'largeur': 1376}),
    ('decor-epave.jpg', 'decors/epave.webp', 'decor', {'largeur': 1376}),
    ('decor-phare.jpg', 'decors/phare.webp', 'decor', {'largeur': 1376}),
    ('decor-phare-libre.jpg', 'decors/phare-libre.webp', 'decor', {'largeur': 1376}),
    ('decor-carte-cote.jpg', 'decors/carte-cote.webp', 'decor', {'largeur': 1376}),
    ('decor-champs.jpg', 'decors/champs.webp', 'decor', {'largeur': 1376}),
    ('decor-forgecendre.jpg', 'decors/forgecendre.webp', 'decor', {'largeur': 1376}),
    ('decor-forgecendre-libre.jpg', 'decors/forgecendre-libre.webp', 'decor', {'largeur': 1376}),
    ('decor-mines.jpg', 'decors/mines.webp', 'decor', {'largeur': 1376}),
    ('decor-mines-libre.jpg', 'decors/mines-libre.webp', 'decor', {'largeur': 1376}),
    ('decor-volcan.jpg', 'decors/volcan.webp', 'decor', {'largeur': 1376}),
    ('decor-carte-cendre.jpg', 'decors/carte-cendre.webp', 'decor', {'largeur': 1376}),
    ('decor-pont.jpg', 'decors/pont.webp', 'decor', {'largeur': 1376}),
    ('decor-aerie.jpg', 'decors/aerie.webp', 'decor', {'largeur': 1376}),
    ('decor-ruines.jpg', 'decors/ruines.webp', 'decor', {'largeur': 1376}),
    ('decor-pic.jpg', 'decors/pic.webp', 'decor', {'largeur': 1376}),
    ('decor-escalier.jpg', 'decors/escalier.webp', 'decor', {'largeur': 1376}),
    ('decor-escalier-sommet.jpg', 'decors/escalier-sommet.webp', 'decor', {'largeur': 1376}),
    ('decor-carte-vents.jpg', 'decors/carte-vents.webp', 'decor', {'largeur': 1376}),
    ('monstre-belier-roches.jpg', 'monstres/belier.webp', 'detoure', {'largeur': 640}),
    ('monstre-harpie-col.jpg', 'monstres/harpie.webp', 'detoure', {'largeur': 640, 'trous': 400}),
    ('monstre-crabe-sel.jpg', 'monstres/crabe.webp', 'detoure', {'largeur': 640}),
    ('monstre-sangsue.jpg', 'monstres/sangsue.webp', 'detoure', {'largeur': 640, 'trous': 400}),
    ('monstre-follet.jpg', 'monstres/follet.webp', 'detoure', {'largeur': 520, 'trous': 400}),
    ('monstre-crapaud.jpg', 'monstres/crapaud.webp', 'detoure', {'largeur': 640, 'trous': 400}),
    ('monstre-noye.jpg', 'monstres/noye.webp', 'detoure', {'hauteur': 520, 'trous': 400}),
    ('monstre-poisson-lame.jpg', 'monstres/poisson.webp', 'detoure', {'largeur': 640}),
    ('monstre-soldat-ordre.jpg', 'monstres/soldat.webp', 'detoure', {'largeur': 640, 'trous': 400}),
    ('monstre-vouivre.jpg', 'monstres/vouivre.webp', 'detoure', {'largeur': 680, 'trous': 400}),
    ('monstre-mere-abysses.jpg', 'monstres/mere.webp', 'detoure', {'largeur': 760, 'trous': 400}),
    ('monstre-pie-brume.jpg', 'monstres/pie.webp', 'detoure', {'largeur': 640, 'trous': 400}),
    ('perso-heraut.jpg', 'monstres/heraut.webp', 'detoure', {'hauteur': 540, 'trous': 400}),
    ('perso-heraut.jpg', 'pnj/heraut.webp', 'portrait', {'boite': (635, 30, 190), 'cote': 192}),
    ('perso-bosco.jpg', 'monstres/bosco.webp', 'detoure', {'hauteur': 520, 'trous': 400}),
    ('perso-bosco.jpg', 'pnj/bosco.webp', 'portrait', {'boite': (675, 25, 160), 'cote': 192}),
    ('monstre-sanglier-roc.jpg', 'monstres/sanglier.webp', 'detoure', {'largeur': 680}),
    ('monstre-anguille.jpg', 'monstres/anguille.webp', 'detoure', {'largeur': 640, 'trous': 400}),
    ('perso-varen.jpg', 'monstres/varen.webp', 'detoure', {'hauteur': 520}),
    ('perso-varen.jpg', 'pnj/varen.webp', 'portrait', {'boite': (640, 25, 150, 150), 'cote': 192}),
    ('perso-sansnom.jpg', 'monstres/sansnom.webp', 'detoure', {'hauteur': 520, 'trous': 60}),
    ('monstre-chien-cendre.jpg', 'monstres/chien.webp', 'detoure', {'largeur': 640, 'trous': 400}),
    ('monstre-scarabee.jpg', 'monstres/scarabee.webp', 'detoure', {'largeur': 640, 'trous': 400}),
    ('monstre-salamandre.jpg', 'monstres/salamandre.webp', 'detoure', {'largeur': 640, 'trous': 400}),
    ('monstre-ver-roche.jpg', 'monstres/ver.webp', 'detoure', {'largeur': 640, 'trous': 400}),
    ('monstre-automate.jpg', 'monstres/automate.webp', 'detoure', {'largeur': 640, 'trous': 400}),
    ('monstre-sentinelle.jpg', 'monstres/sentinelle.webp', 'detoure', {'largeur': 640, 'trous': 400}),
    ('monstre-lezard-lave.jpg', 'monstres/lezard.webp', 'detoure', {'largeur': 640, 'trous': 400}),
    ('monstre-esprit-braise.jpg', 'monstres/esprit.webp', 'detoure', {'largeur': 640}),
    ('monstre-forgeur.jpg', 'monstres/forgeur.webp', 'detoure', {'largeur': 760, 'trous': 400}),
    ('monstre-salreine.jpg', 'monstres/salreine.webp', 'detoure', {'largeur': 760, 'trous': 400}),
    ('monstre-golem-col.jpg', 'monstres/statue.webp', 'detoure', {'largeur': 640, 'trous': 400}),
    ('monstre-tellure.jpg', 'monstres/tellure.webp', 'detoure', {'largeur': 760, 'trous': 400}),
    ('monstre-gardien-cage.jpg', 'monstres/gardien.webp', 'detoure', {'hauteur': 600, 'trous': 400}),
    ('monstre-ombre-brume.jpg', 'monstres/brume.webp', 'detoure', {'largeur': 640, 'trous': 400}),
    ('monstre-rapace.jpg', 'monstres/rapace.webp', 'detoure', {'largeur': 640, 'trous': 1500}),
    ('monstre-sylphe.jpg', 'monstres/sylphe.webp', 'detoure', {'largeur': 640, 'trous': 1500}),
    ('monstre-gargouille.jpg', 'monstres/gargouille.webp', 'detoure', {'largeur': 640, 'trous': 400}),
    ('monstre-spectre.jpg', 'monstres/spectre.webp', 'detoure', {'largeur': 640, 'trous': 1500}),
    ('monstre-griffon.jpg', 'monstres/griffon.webp', 'detoure', {'largeur': 640, 'trous': 4000}),
    ('monstre-givre.jpg', 'monstres/givre.webp', 'detoure', {'largeur': 640, 'trous': 3000}),
    ('monstre-serpent.jpg', 'monstres/serpent.webp', 'detoure', {'largeur': 760, 'trous': 400}),
    ('monstre-rocaile.jpg', 'monstres/rocaile.webp', 'detoure', {'largeur': 700, 'trous': 1500}),
    ('monstre-rocaile-vol.jpg', 'monstres/rocaile-vol.webp', 'detoure', {'largeur': 700, 'trous': 1500}),
    ('monstre-prieur.jpg', 'monstres/prieur.webp', 'detoure', {'largeur': 760, 'trous': 1500}),
    ('monstre-wyverne.jpg', 'monstres/wyverne.webp', 'detoure', {'largeur': 760, 'trous': 1500}),
    ('monstre-larmet.jpg', 'monstres/larmet.webp', 'detoure', {'largeur': 680, 'trous': 1500}),
    ('monstre-larmee.jpg', 'monstres/larmee.webp', 'detoure', {'largeur': 680, 'trous': 1500}),
    ('monstre-larmef.jpg', 'monstres/larmef.webp', 'detoure', {'largeur': 680, 'trous': 1500}),
    ('monstre-larmev.jpg', 'monstres/larmev.webp', 'detoure', {'largeur': 680, 'trous': 1500}),
    ('monstre-veilleur.jpg', 'monstres/veilleur.webp', 'detoure', {'hauteur': 560, 'trous': 1500}),
    ('monstre-nueeoubli.jpg', 'monstres/nueeoubli.webp', 'detoure', {'largeur': 640, 'trous': 2000}),
    ('monstre-ysold.jpg', 'monstres/ysold.webp', 'detoure', {'hauteur': 620, 'trous': 600}),
    ('monstre-paupiere.jpg', 'monstres/paupiere.webp', 'detoure', {'largeur': 760, 'trous': 400}),
    ('perso-sansnom.jpg', 'pnj/sansnom.webp', 'portrait', {'boite': (665, 30, 160, 160), 'cote': 192}),
    ('perso-orvan.jpg', 'pnj/orvan.webp', 'portrait', {'boite': (250, 40, 580), 'cote': 192}),
    ('perso-brann.jpg', 'pnj/brann.webp', 'portrait', {'boite': (230, 50, 580), 'cote': 192}),
    ('perso-hilde.jpg', 'pnj/hilde.webp', 'portrait', {'boite': (280, 60, 560), 'cote': 192}),
    ('perso-berthe.jpg', 'pnj/berthe.webp', 'portrait', {'boite': (220, 20, 580), 'cote': 192}),
    ('perso-nell.jpg', 'pnj/nell.webp', 'portrait', {'boite': (230, 60, 580), 'cote': 192}),
    ('perso-tilo.jpg', 'pnj/tilo.webp', 'portrait', {'boite': (220, 40, 580), 'cote': 192}),
    ('perso-aubergiste.jpg', 'pnj/aubergiste.webp', 'portrait', {'boite': (220, 10, 580), 'cote': 192}),
    ('perso-silhouette.jpg', 'pnj/silhouette.webp', 'portrait', {'boite': (250, 70, 600), 'cote': 192}),
    ('perso-maelle.jpg', 'pnj/maelle.webp', 'portrait', {'boite': (250, 80, 560), 'cote': 192}),
    ('perso-gaspard.jpg', 'pnj/gaspard.webp', 'portrait', {'boite': (230, 40, 560), 'cote': 192}),
    ('perso-loic.jpg', 'pnj/loic.webp', 'portrait', {'boite': (230, 40, 580), 'cote': 192}),
    ('perso-rosal.jpg', 'pnj/rosal.webp', 'portrait', {'boite': (170, 10, 640), 'cote': 192}),
    ('perso-naia.jpg', 'pnj/naia.webp', 'portrait', {'boite': (220, 120, 600), 'cote': 192}),
    ('perso-erwan.jpg', 'pnj/erwan.webp', 'portrait', {'boite': (230, 40, 580), 'cote': 192}),
    ('perso-ysold.jpg', 'pnj/ysold.webp', 'portrait', {'boite': (220, 30, 600), 'cote': 192}),
    ('perso-pia.jpg', 'pnj/pia.webp', 'portrait', {'boite': (230, 60, 580), 'cote': 192}),
    ('perso-roxane.jpg', 'pnj/roxane.webp', 'portrait', {'boite': (200, 20, 580), 'cote': 192}),
    ('perso-fennel.jpg', 'pnj/fennel.webp', 'portrait', {'boite': (180, 40, 640), 'cote': 192}),
    ('perso-goran.jpg', 'pnj/goran.webp', 'portrait', {'boite': (230, 40, 600), 'cote': 192}),
    ('perso-agathe.jpg', 'pnj/agathe.webp', 'portrait', {'boite': (250, 60, 580), 'cote': 192}),
    ('perso-dorn.jpg', 'pnj/dorn.webp', 'portrait', {'boite': (170, 40, 640), 'cote': 192}),
    ('perso-tobi.jpg', 'pnj/tobi.webp', 'portrait', {'boite': (230, 30, 600), 'cote': 192}),
    ('perso-tavor.jpg', 'pnj/tavor.webp', 'portrait', {'boite': (200, 60, 600), 'cote': 192}),
    ('perso-edda.jpg', 'pnj/edda.webp', 'portrait', {'boite': (250, 40, 620), 'cote': 192}),
    ('perso-joran.jpg', 'pnj/joran.webp', 'portrait', {'boite': (260, 100, 600), 'cote': 192}),
    ('perso-pell.jpg', 'pnj/pell.webp', 'portrait', {'boite': (200, 40, 620), 'cote': 192}),
    ('perso-liss.jpg', 'pnj/liss.webp', 'portrait', {'boite': (200, 50, 600), 'cote': 192}),
    ('perso-ilse.jpg', 'pnj/ilse.webp', 'portrait', {'boite': (180, 50, 600), 'cote': 192}),
    ('perso-aldric.jpg', 'pnj/aldric.webp', 'portrait', {'boite': (230, 50, 600), 'cote': 192}),
    ('perso-garrick.jpg', 'pnj/garrick.webp', 'portrait', {'boite': (200, 20, 620), 'cote': 192}),
]


def detourer(im, trous=False):
    """Rend transparent le fond clair relié aux bords (papier blanc), en douceur sur les lavis.
    trous : vide aussi le blanc enfermé dans la brume ou la fumée (à éviter si le sujet a du blanc) ;
    un nombre au lieu de True ne vide que les zones d'au moins ce nombre de pixels (garde les reflets)."""
    im = im.convert('RGBA')
    w, h = im.size
    px = im.load()
    clair = lambda c: min(c[0], c[1], c[2]) > 196 and max(c[0], c[1], c[2]) - min(c[0], c[1], c[2]) < 40
    vu = bytearray(w * h)
    file = deque()
    for x in range(w):
        file.append((x, 0)); file.append((x, h - 1))
    for y in range(h):
        file.append((0, y)); file.append((w - 1, y))
    while file:
        x, y = file.popleft()
        i = y * w + x
        if vu[i] or not clair(px[x, y]):
            continue
        vu[i] = 1
        if x > 0: file.append((x - 1, y))
        if x < w - 1: file.append((x + 1, y))
        if y > 0: file.append((x, y - 1))
        if y < h - 1: file.append((x, y + 1))
    # le grain du papier laisse des points isolés : les petits îlots non atteints rejoignent le fond
    deja = bytearray(w * h)
    for y0 in range(h):
        for x0 in range(w):
            i0 = y0 * w + x0
            if vu[i0] or deja[i0]:
                continue
            ilot, file = [], deque([(x0, y0)])
            deja[i0] = 1
            while file:
                x, y = file.popleft()
                ilot.append(y * w + x)
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if 0 <= nx < w and 0 <= ny < h:
                        j = ny * w + nx
                        if not vu[j] and not deja[j]:
                            deja[j] = 1
                            file.append((nx, ny))
            if len(ilot) < 60:
                for j in ilot:
                    vu[j] = 1
    if trous:
        blanc = lambda c: min(c[0], c[1], c[2]) > 226 and max(c[0], c[1], c[2]) - min(c[0], c[1], c[2]) < 30
        mini = 0 if trous is True else trous
        deja = bytearray(w * h)
        for i0 in range(w * h):
            if vu[i0] or deja[i0] or not blanc(px[i0 % w, i0 // w]):
                continue
            zone, file = [], deque([i0])
            deja[i0] = 1
            while file:
                i = file.popleft()
                zone.append(i)
                x, y = i % w, i // w
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    j = ny * w + nx
                    if 0 <= nx < w and 0 <= ny < h and not vu[j] and not deja[j] and blanc(px[nx, ny]):
                        deja[j] = 1
                        file.append(j)
            if len(zone) >= mini:
                for i in zone:
                    vu[i] = 1
    for y in range(h):
        for x in range(w):
            if not vu[y * w + x]:
                continue
            r, g, b, _ = px[x, y]
            a = max(0.0, min(1.0, (232 - min(r, g, b)) / 40.0))
            if a <= 0:
                px[x, y] = (255, 255, 255, 0)
                continue
            # retire le blanc mélangé pour éviter un liseré clair
            f = lambda c: max(0, min(255, int(round((c - (1 - a) * 255) / a))))
            px[x, y] = (f(r), f(g), f(b), int(a * 255))
    # rognage sur les pixels bien visibles (ignore les traces de grain presque transparentes)
    return im.crop(im.getchannel('A').point(lambda v: 255 if v > 90 else 0).getbbox())


def taille(im, o):
    if 'largeur' in o and im.width > o['largeur']:
        im = im.resize((o['largeur'], round(im.height * o['largeur'] / im.width)), Image.LANCZOS)
    if 'hauteur' in o and im.height > o['hauteur']:
        im = im.resize((round(im.width * o['hauteur'] / im.height), o['hauteur']), Image.LANCZOS)
    return im


# Icônes de l'appli (dossier du jeu) : la tête de la lanterne détourée, sur fond nuit avec une lueur.
ICONES = [('icon-192.png', 192, .06), ('icon-512.png', 512, .06), ('icon-maskable.png', 512, .2)]


def icones():
    lanterne = detourer(Image.open(os.path.join(SRC, 'objet-lanterne.jpg')))
    tete = lanterne.crop((0, 0, lanterne.width, round(lanterne.height * .5)))
    tete = tete.crop(tete.getchannel('A').point(lambda v: 255 if v > 90 else 0).getbbox())
    for nom, cote, marge in ICONES:
        fond = Image.new('RGBA', (cote, cote), (11, 13, 26, 255))
        lueur = Image.new('L', (cote, cote), 0)
        from PIL import ImageDraw, ImageFilter
        r = cote * .3
        ImageDraw.Draw(lueur).ellipse((cote / 2 - r, cote * .45 - r, cote / 2 + r, cote * .45 + r), fill=150)
        lueur = lueur.filter(ImageFilter.GaussianBlur(cote * .12))
        fond.paste(Image.new('RGBA', (cote, cote), (150, 220, 255, 255)), (0, 0), lueur)
        h = round(cote * (1 - 2 * marge))
        im = tete.resize((round(tete.width * h / tete.height), h), Image.LANCZOS)
        fond.alpha_composite(im, ((cote - im.width) // 2, (cote - im.height) // 2))
        fond.convert('RGB').save(os.path.join(OUT, '..', nom), 'PNG', optimize=True)
        print(f'{nom:32} {cote}×{cote}')


def main():
    for source, sortie, mode, o in LISTE:
        im = Image.open(os.path.join(SRC, source))
        if mode == 'decor':
            im = taille(im.convert('RGB'), o)
        elif mode == 'detoure':
            im = taille(detourer(im, o.get('trous', False)), o)
        elif mode == 'portrait':
            x, y, c = o['boite'][0], o['boite'][1], o['boite'][-1]
            im = im.convert('RGB').crop((x, y, x + c, y + c)).resize((o['cote'], o['cote']), Image.LANCZOS)
        chemin = os.path.join(OUT, sortie)
        os.makedirs(os.path.dirname(chemin), exist_ok=True)
        im.save(chemin, 'WEBP', quality=80, method=6)
        print(f'{sortie:32} {im.width}×{im.height}  {os.path.getsize(chemin) // 1024} Ko')


if __name__ == '__main__':
    main()
    icones()
