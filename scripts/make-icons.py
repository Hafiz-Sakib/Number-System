"""PWA ও ফেভিকন আইকন তৈরি scripts/logo.png (টিল সার্কিট ব্রেন লোগো) থেকে। চালাতে: python3 scripts/make-icons.py"""
from PIL import Image, ImageDraw
import os
HERE = os.path.dirname(__file__)
OUT = os.path.join(HERE, "..", "public")
WHITE = (255, 255, 255, 255)

src = Image.open(os.path.join(HERE, "logo.png")).convert("RGBA")
logo = src.crop(src.split()[3].point(lambda v: 255 if v > 40 else 0).getbbox())  # স্বচ্ছ ফাঁকা অংশ ছেঁটে ফেলা

def draw(size, mode):
    S = size * 4  # supersample
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    if mode == "any":        # সাদা গোল-কোণা টাইল
        ImageDraw.Draw(img).rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=WHITE); k = 0.66
    elif mode == "full":     # apple-touch: পুরো সাদা (আইওএস নিজে কোণা কাটে)
        img.paste(WHITE, [0, 0, S, S]); k = 0.66
    elif mode == "maskable": # নিরাপদ বৃত্তের ভেতরে
        img.paste(WHITE, [0, 0, S, S]); k = 0.52
    else:                    # favicon: স্বচ্ছ ব্যাকগ্রাউন্ড, লোগো প্রায় পুরো জায়গা জুড়ে
        k = 0.98
    w = int(S * k); h = int(logo.height * w / logo.width)
    lg = logo.resize((w, h), Image.LANCZOS)
    img.alpha_composite(lg, ((S - w) // 2, (S - h) // 2))
    return img.resize((size, size), Image.LANCZOS)

def save(name, size, mode): draw(size, mode).save(os.path.join(OUT, name))

save("pwa-192.png", 192, "any"); save("pwa-512.png", 512, "any")
save("pwa-maskable-192.png", 192, "maskable"); save("pwa-maskable-512.png", 512, "maskable")
save("apple-touch-icon.png", 180, "full")
save("favicon-32.png", 32, "favicon"); save("favicon-16.png", 16, "favicon")
draw(256, "favicon").save(os.path.join(OUT, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
print("icons ok")
