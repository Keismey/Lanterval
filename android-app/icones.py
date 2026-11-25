# Icônes et écran de démarrage de l'appli, fabriqués à partir des icônes du jeu.
# Lancé par le workflow « Appli Android », dans le dossier app/ (après « npx cap add android »).
import glob
import os
from PIL import Image

RES = 'android/app/src/main/res'
icone = Image.open('www/icon-512.png').convert('RGBA')
masque = Image.open('www/icon-maskable.png').convert('RGBA')
fond = masque.getpixel((2, 2))

for nom, f in {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}.items():
    d = f'{RES}/mipmap-{nom}'
    os.makedirs(d, exist_ok=True)
    t = round(48 * f)
    petite = icone.resize((t, t), Image.LANCZOS)
    petite.save(f'{d}/ic_launcher.png')
    petite.save(f'{d}/ic_launcher_round.png')
    # icône adaptative (Android 8+) : l'icône « maskable » centrée sur son propre fond
    c, i = round(108 * f), round(92 * f)
    avant = Image.new('RGBA', (c, c), fond)
    m = masque.resize((i, i), Image.LANCZOS)
    avant.paste(m, ((c - i) // 2, (c - i) // 2), m)
    avant.save(f'{d}/ic_launcher_foreground.png')

coul = '#%02X%02X%02X' % fond[:3]
p = f'{RES}/values/ic_launcher_background.xml'
if os.path.exists(p):
    with open(p, 'w') as fh:
        fh.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
                 f'    <color name="ic_launcher_background">{coul}</color>\n</resources>\n')

# écran de démarrage de la couleur du jeu (remplace le logo Capacitor)
for s in glob.glob(f'{RES}/drawable*/splash.png'):
    w, h = Image.open(s).size
    Image.new('RGB', (w, h), (11, 13, 26)).save(s)
