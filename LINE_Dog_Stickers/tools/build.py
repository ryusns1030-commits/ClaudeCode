"""LINE dog sticker builder.

raw/NN.png (1080x1080, mint background from Canva)
  -> drafts/NN_cutout.png  (transparent illustration)
  -> originals/NN.png      (1280x1280, illustration + text)
  -> stickers/NN.png       (320x320 LINE sticker)
  -> preview/preview.png, stickers/main.png (240x240), stickers/tab.png (96x74)

usage: python3 build.py RAW_DIR FONT_PATH
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
RAW = Path(sys.argv[1])
FONT = sys.argv[2]

STICKERS = [
    # text, fill color, rotation(deg)
    ("おはよ！", "#FF9A3C", -4),
    ("ありがと♡", "#FF5C8D", 0),
    ("了解！", "#2F7BEA", -3),
    ("おつかれ〜", "#9A6BD6", 0),
    ("ごめんね", "#4FA3E0", 0),
    ("えっ！？", "#FF4D4D", 5),
    ("やったー！", "#FFB000", -6),
    ("じーーっ", "#8A7565", 0),
    ("おねがい♡", "#FF6FAE", 3),
    ("おやすみ", "#4B5BC4", 0),
]

OUTLINE = (58, 42, 34)  # dark brown, same as the illustration line
BIG = 1280


def cutout(img: Image.Image) -> Image.Image:
    a = np.asarray(img.convert("RGB")).astype(np.float32)
    h, w, _ = a.shape
    border = np.concatenate([a[:8].reshape(-1, 3), a[-8:].reshape(-1, 3),
                             a[:, :8].reshape(-1, 3), a[:, -8:].reshape(-1, 3)])
    key = np.median(border, axis=0)
    d = np.sqrt(((a - key) ** 2).sum(-1))
    lo, hi = 14.0, 46.0

    # darker key-coloured pixels (cast shadows on the background)
    chroma = a / np.clip(a.sum(-1, keepdims=True), 1, None)
    kc = key / key.sum()
    cd = np.abs(chroma - kc).sum(-1)
    lum = a.mean(-1)
    shadow = (cd < 0.035) & (lum < key.mean() - 4) & (d >= lo)

    cand = (d < hi) | shadow
    lab, n = ndimage.label(cand)
    core = d < lo
    bg = np.zeros_like(cand)
    edge_labels = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])))
    edge_labels.discard(0)
    core_counts = ndimage.sum(core, lab, index=np.arange(1, n + 1))
    for i in range(1, n + 1):
        if i in edge_labels or core_counts[i - 1] > 15:
            bg |= lab == i

    alpha = np.ones((h, w), np.float32)
    t = np.clip((d - lo) / (hi - lo), 0, 1)
    alpha[bg] = t[bg]
    # enclosed slivers of background between fur strands (no mint in the character)
    hi2 = hi * 1.8
    sliver = (~bg) & (cd < 0.045) & (d < hi2) & (lum > 90)
    t2 = np.clip((d - lo) / (hi2 - lo), 0, 1)
    alpha[sliver] = np.minimum(alpha[sliver], t2[sliver])

    # un-mix the key colour from semi-transparent edge pixels (despill)
    am = np.clip(alpha, 1e-3, 1)[..., None]
    fg = (a - (1 - am) * key) / am
    fg = np.clip(fg, 0, 255)
    # turn background shadows into a soft neutral shadow
    sh = bg & shadow
    sh_a = np.clip((key.mean() - lum) / key.mean() * 1.3, 0, 0.45)
    alpha[sh] = sh_a[sh]
    fg[sh] = np.array(OUTLINE, np.float32)
    out = np.dstack([fg, alpha * 255]).astype(np.uint8)
    res = Image.fromarray(out, "RGBA")
    # tiny alpha cleanup: drop isolated near-transparent specks
    al = res.getchannel("A").point(lambda v: 0 if v < 8 else v)
    res.putalpha(al)
    return res


def crop_alpha(im: Image.Image) -> Image.Image:
    return im.crop(im.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox())


def text_layer(text: str, color: str, size: int, rot: float) -> Image.Image:
    font = ImageFont.truetype(FONT, size)
    inner = int(size * 0.13)   # white border
    outer = inner + int(size * 0.05)  # brown outer border
    pad = outer + 20
    bbox = ImageDraw.Draw(Image.new("L", (1, 1))).textbbox((0, 0), text, font=font)
    w, h = bbox[2] - bbox[0] + pad * 2, bbox[3] - bbox[1] + pad * 2
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    dr = ImageDraw.Draw(layer)
    xy = (pad - bbox[0], pad - bbox[1])
    dr.text(xy, text, font=font, fill=OUTLINE + (255,), stroke_width=outer, stroke_fill=OUTLINE + (255,))
    dr.text(xy, text, font=font, fill=(255, 255, 255, 255), stroke_width=inner, stroke_fill=(255, 255, 255, 255))
    dr.text(xy, text, font=font, fill=color)
    if rot:
        layer = layer.rotate(rot, resample=Image.BICUBIC, expand=True)
    return crop_alpha(layer)


def compose(dog: Image.Image, text: str, color: str, rot: float) -> Image.Image:
    canvas = Image.new("RGBA", (BIG, BIG), (0, 0, 0, 0))
    margin = 40
    # text: fit into the top band
    size = 230
    t = text_layer(text, color, size, rot)
    max_tw = BIG - margin * 2
    if t.width > max_tw:
        t = t.resize((max_tw, round(t.height * max_tw / t.width)), Image.LANCZOS)
    band = t.height
    overlap = int(band * 0.18)  # text may slightly overlap the top of the ears
    avail_h = BIG - margin * 2 - band + overlap
    avail_w = BIG - margin * 2
    s = min(avail_w / dog.width, avail_h / dog.height)
    dog_r = dog.resize((round(dog.width * s), round(dog.height * s)), Image.LANCZOS)
    dx = (BIG - dog_r.width) // 2
    dy = BIG - margin - dog_r.height
    canvas.alpha_composite(dog_r, (dx, dy))
    tx = (BIG - t.width) // 2
    ty = max(margin, dy - band + overlap)
    canvas.alpha_composite(t, (tx, ty))
    return canvas


def to_size(im: Image.Image, w: int, h: int, margin: int) -> Image.Image:
    c = crop_alpha(im)
    s = min((w - 2 * margin) / c.width, (h - 2 * margin) / c.height)
    c = c.resize((max(1, round(c.width * s)), max(1, round(c.height * s))), Image.LANCZOS)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.alpha_composite(c, ((w - c.width) // 2, (h - c.height) // 2))
    return out


def main():
    finals, cutouts = [], []
    for i, (text, color, rot) in enumerate(STICKERS, 1):
        nn = f"{i:02d}"
        dog = cutout(Image.open(RAW / f"{nn}.png"))
        dog.save(ROOT / "drafts" / f"{nn}_cutout.png")
        dog = crop_alpha(dog)
        cutouts.append(dog)
        big = compose(dog, text, color, rot)
        big.save(ROOT / "originals" / f"{nn}.png")
        st = to_size(big, 320, 320, 10)
        st.save(ROOT / "stickers" / f"{nn}.png", optimize=True)
        finals.append(st)
        print(nn, text, "ok")

    to_size(Image.open(ROOT / "originals" / "02.png"), 240, 240, 8).save(ROOT / "stickers" / "main.png", optimize=True)
    to_size(cutouts[0], 96, 74, 2).save(ROOT / "stickers" / "tab.png", optimize=True)

    # preview: 5x2 grid on two backgrounds (LINE light / dark)
    cell = 320
    for name, bgc in (("preview.png", (255, 255, 255)), ("preview_dark.png", (30, 30, 30))):
        pv = Image.new("RGB", (cell * 5 + 60, cell * 2 + 30), bgc)
        for k, st in enumerate(finals):
            x = 10 + (k % 5) * (cell + 10)
            y = 10 + (k // 5) * (cell + 10)
            pv.paste(st, (x, y), st)
        pv.save(ROOT / "preview" / name)


if __name__ == "__main__":
    main()
