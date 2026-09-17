#!/usr/bin/env python3
"""Genera favicon y og-card para Samanta Carinelli (fondo negro + acento lima)."""
from PIL import Image, ImageDraw, ImageFont
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "img")

INK = (17, 19, 15)
LIME = (207, 255, 61)
PAPER = (250, 250, 246)

def font(size, bold=True):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/SFNSDisplay.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                pass
    return ImageFont.load_default()

def favicon():
    size = 512
    im = Image.new("RGB", (size, size), INK)
    d = ImageDraw.Draw(im)
    f = font(300, bold=True)
    txt = "S"
    bbox = d.textbbox((0, 0), txt, font=f)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text(((size - w) / 2 - bbox[0], (size - h) / 2 - bbox[1] - 10), txt, font=f, fill=LIME)
    im.save(os.path.join(IMG, "favicon.png"))
    for s in (16, 32, 180, 192, 512):
        im.resize((s, s), Image.LANCZOS).save(os.path.join(IMG, f"favicon-{s}.png"))
    im.resize((180, 180), Image.LANCZOS).save(os.path.join(IMG, "apple-touch-icon.png"))

def og_card():
    w, h = 1200, 630
    src = Image.open(os.path.join(IMG, "uno-bahia-bodypump.jpg")).convert("RGB")
    # Cover-fit crop to 1200x630, biased toward the top third (heads/faces).
    scale = max(w / src.width, h / src.height)
    rw, rh = round(src.width * scale), round(src.height * scale)
    src = src.resize((rw, rh), Image.LANCZOS)
    top = min(int(rh * 0.28), rh - h)
    im = src.crop((round((rw - w) / 2), top, round((rw - w) / 2) + w, top + h))

    # Dark gradient at the bottom for text legibility.
    gradient = Image.new("L", (1, h), color=0)
    for y in range(h):
        t = max(0, (y - h * 0.35) / (h * 0.65))
        gradient.putpixel((0, y), int(235 * t))
    gradient = gradient.resize((w, h))
    overlay = Image.new("RGBA", (w, h), INK + (0,))
    overlay.putalpha(gradient)
    im = Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB")

    d = ImageDraw.Draw(im)
    d.rectangle([0, h - 14, w, h], fill=LIME)
    f_name = font(68, bold=True)
    f_role = font(26, bold=False)
    d.text((70, 440), "SAMANTA", font=f_name, fill=PAPER)
    d.text((70, 512), "CARINELLI", font=f_name, fill=LIME)
    d.text((450, 460), "Instructora de fitness grupal\nPilates Reformer · Body Pump\nStretching · Abdominales",
           font=f_role, fill=PAPER, spacing=12)
    im.save(os.path.join(IMG, "og-cover.jpg"), quality=88)

if __name__ == "__main__":
    favicon()
    og_card()
    print("done")
