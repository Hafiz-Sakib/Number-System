"""PWA আইকন তৈরি: ২×২ টাইলে চার সংখ্যা পদ্ধতির ভিত্তি (2, 8, 10, 16)। চালাতে: python3 scripts/make-icons.py"""
from PIL import Image, ImageDraw, ImageFont
import os
BG = (21, 22, 51)
TILES = [("2", (185, 174, 255)), ("8", (142, 227, 181)), ("10", (140, 203, 255)), ("16", (255, 180, 138))]
INK = (20, 21, 26)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
OUT = os.path.join(os.path.dirname(__file__), "..", "public")

def draw(size, mode):
    S = size * 4  # supersample
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if mode == "any":
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=BG)
        m = S * 0.17
    elif mode == "full":
        d.rectangle([0, 0, S, S], fill=BG)
        m = S * 0.17
    else:  # maskable: নিরাপদ বৃত্তের (৮০%) ভেতরে
        d.rectangle([0, 0, S, S], fill=BG)
        m = S * 0.26
    g = S * 0.045
    t = (S - 2 * m - g) / 2
    for i, (label, col) in enumerate(TILES):
        x = m + (i % 2) * (t + g)
        y = m + (i // 2) * (t + g)
        d.rounded_rectangle([x, y, x + t, y + t], radius=t * 0.26, fill=col)
        fs = int(t * (0.46 if len(label) == 2 else 0.62))
        f = ImageFont.truetype(FONT, fs)
        bb = d.textbbox((0, 0), label, font=f)
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
        d.text((x + (t - tw) / 2 - bb[0], y + (t - th) / 2 - bb[1]), label, font=f, fill=INK)
    return img.resize((size, size), Image.LANCZOS)

def save(name, size, mode):
    draw(size, mode).save(os.path.join(OUT, name))

save("pwa-192.png", 192, "any"); save("pwa-512.png", 512, "any")
save("pwa-maskable-192.png", 192, "maskable"); save("pwa-maskable-512.png", 512, "maskable")
save("apple-touch-icon.png", 180, "full")
save("favicon-32.png", 32, "any"); save("favicon-16.png", 16, "any")
ico = draw(256, "any")
ico.save(os.path.join(OUT, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
print("icons ok")
