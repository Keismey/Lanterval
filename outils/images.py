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
    ('perso-kael.jpg', 'heros/kael.webp', 'detoure', {'hauteur': 420}),
    ('perso-kael.jpg', 'heros/kael-portrait.webp', 'portrait', {'boite': (612, 38, 186, 186), 'cote': 192}),
    ('monstre-loup-des-brumes.jpg', 'monstres/loup.webp', 'detoure', {'largeur': 640}),
    ('perso-mira.jpg', 'heros/mira.webp', 'detoure', {'hauteur': 420}),
    ('perso-mira.jpg', 'heros/mira-portrait.webp', 'portrait', {'boite': (594, 42, 170, 170), 'cote': 192}),
    ('perso-sol.jpg', 'heros/sol.webp', 'detoure', {'hauteur': 420}),
    ('perso-sol.jpg', 'heros/sol-portrait.webp', 'portrait', {'boite': (620, 42, 180, 180), 'cote': 192}),
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
    ('monstre-belier-roches.jpg', 'monstres/belier.webp', 'detoure', {'largeur': 640}),
    ('monstre-harpie-col.jpg', 'monstres/harpie.webp', 'detoure', {'largeur': 640, 'trous': 400}),
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
            x, y, c = o['boite'][0], o['boite'][1], o['boite'][2]
            im = im.convert('RGB').crop((x, y, x + c, y + c)).resize((o['cote'], o['cote']), Image.LANCZOS)
        chemin = os.path.join(OUT, sortie)
        os.makedirs(os.path.dirname(chemin), exist_ok=True)
        im.save(chemin, 'WEBP', quality=80, method=6)
        print(f'{sortie:32} {im.width}×{im.height}  {os.path.getsize(chemin) // 1024} Ko')


if __name__ == '__main__':
    main()
    icones()
