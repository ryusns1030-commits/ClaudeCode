"""Download the most recent Canva export URLs for a design (read from the session transcript) and
save them as assets/dogs/dog_XXX_pose.png.  usage: dl.py DESIGN_ID FILE_NO"""
import re, sys, glob, urllib.request, os
from PIL import Image
did, fno = sys.argv[1], int(sys.argv[2])
T = max(glob.glob('/root/.claude/projects/-home-user-ClaudeCode/*.jsonl'), key=os.path.getmtime)
txt = open(T, encoding='utf-8').read()
urls = re.findall(r'https://export-download\.canva\.com/[^/]+/' + did + r'/-1/0/\d{4}-\d+\.png\?[^"\s\\]+', txt)
last = {}
for u in urls:  # keep the last URL per page
    pg = int(re.search(r'/0/(\d{4})-', u).group(1)); last[pg] = u
want = [int(x) for x in sys.argv[3].split(',')] if len(sys.argv) > 3 else sorted(last)
bad = []
for pg in want:
    i = (fno - 1) * 15 + (pg + 1) // 2; pose = 'normal' if pg % 2 else 'happy'
    out = f'/home/user/ClaudeCode/assets/dogs/dog_{i:03d}_{pose}.png'
    urllib.request.urlretrieve(last[pg].replace('&amp;', '&'), out)
    im = Image.open(out); b = im.getchannel('A').point(lambda v: 255 if v > 16 else 0).getbbox()
    m = (b[0], b[1], 1024 - b[2], 1024 - b[3])
    ok = im.size == (1024, 1024) and im.mode == 'RGBA' and im.getpixel((2, 2))[3] == 0 and min(m) >= 85 and \
        (abs(m[0] - m[2]) <= 12 or abs(m[1] - m[3]) <= 12) and (min(m[0], m[2]) <= 112 or min(m[1], m[3]) <= 112)
    print(f'p{pg:02d} dog_{i:03d}_{pose} margins L{m[0]} T{m[1]} R{m[2]} B{m[3]}', 'OK' if ok else 'CHECK')
    if not ok: bad.append(pg)
print('bad:', bad)
