"""Contact sheet for one Canva file: 15 breeds x (normal, happy) at 150px + 40px, on app bg. usage: qa_sheet.py FILE_NO"""
import sys, os
from PIL import Image, ImageDraw
f = int(sys.argv[1]); ids = range((f-1)*15+1, f*15+1)
W = 5*340+20; H = 3*(170+60)+20
sh = Image.new('RGB', (W, H), '#FBF7F0'); d = ImageDraw.Draw(sh)
for k, i in enumerate(ids):
    c, r = k % 5, k // 5; x, y = 20+c*340, 20+r*230
    d.text((x, y), f'{i:03d}', fill='#6E6258')
    for j, p in enumerate(('normal', 'happy')):
        fp = f'/home/user/ClaudeCode/assets/dogs/dog_{i:03d}_{p}.png'
        if not os.path.exists(fp): d.text((x+j*160+40, y+70), 'MISSING', fill='#B0443A'); continue
        im = Image.open(fp).convert('RGBA')
        a = im.resize((150, 150), Image.LANCZOS); sh.paste(a, (x+j*160, y+12), a)
        s = im.resize((40, 40), Image.LANCZOS); sh.paste(s, (x+j*50+200 if False else x+j*48+100, y+168), s)
out = f'/home/user/ClaudeCode/design/dogs/qa_file{f:02d}.png'; sh.save(out); print(out)
