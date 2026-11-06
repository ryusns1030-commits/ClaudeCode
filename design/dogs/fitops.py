"""Build insert_fill ops: fit dog bbox (from 200px alpha preview) into 864px box centred on a 1080 page.
usage: fitops.py items.json  (list of [id,pose,media,preview_suffix,page_id])"""
import json, sys, glob, sys as _s
_s.path.insert(0, '/home/user/ClaudeCode/design/dogs')
from PIL import Image
from breeds import B
TR = '/root/.claude/projects/-home-user-ClaudeCode/b8308261-ec4e-58a4-a999-0f888469573b/tool-results/'
ops = []
for i, pose, media, suf, pid in json.load(open(sys.argv[1])):
    f = glob.glob(TR + f'mcp-Canva-blob-*{suf}.png')[0]
    im = Image.open(f); S = im.size[0]
    x0, y0, x1, y1 = [v * 1080 / S for v in im.getchannel('A').point(lambda v: 255 if v > 16 else 0).getbbox()]
    bw, bh = x1 - x0, y1 - y0; s = 864 / max(bw, bh); W = round(1080 * s, 1)
    ops.append({'type': 'insert_fill', 'page_id': pid, 'asset_type': 'image', 'asset_id': media,
                'alt_text': f'{i} {B[int(i)-1][0]} {pose}', 'width': W, 'height': W,
                'left': round(540 - (x0 + bw / 2) * s, 1), 'top': round(540 - (y0 + bh / 2) * s, 1)})
print(json.dumps(ops, ensure_ascii=False))
