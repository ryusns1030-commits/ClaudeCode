"""2026-11-07 制作対象縮小を反映: breed_master.csv(15列) / dogs.json / シート更新用JSON を生成"""
import csv, json, sys
sys.path.insert(0, '/home/user/ClaudeCode/design/dogs')
from breeds import B
from f04layout import IDS as F04, page_of
U = {1:'https://www.canva.com/d/MZFR8TsOzY4h3sH', 2:'https://www.canva.com/d/ZN1ej6vkgGC43cI',
     3:'https://www.canva.com/d/CplNNUVTs107OQR', 4:'https://www.canva.com/d/Y7aWCSgw7dKVe-s'}
TARGET = [59,66,67,70,71,76,81,86,94,96,131]
HOLD = [129]
SHARED = {28:1, 65:1, 121:1, 107:11}   # 共通素材: ID -> 参照先ID
rows = list(csv.reader(open('breed_master.csv', encoding='utf-8-sig')))
H = rows[0][:13] + ['制作区分', '画像参照先ID']
out = []
for r in rows[1:]:
    r = r[:13]; i = int(r[0]); ref = ''
    if i in SHARED:
        cat = '共通素材を使用'; ref = f'{SHARED[i]:03d}'
    elif i <= 52: cat = '制作済み'
    elif i in TARGET: cat = '今回制作'
    elif i in HOLD: cat = '今回制作（保留：429の確認待ち）'
    else: cat = '将来制作'
    if i in F04:   # ファイル04に配置する犬種
        r[4] = '04'; r[5] = page_of(i,'normal'); r[6] = page_of(i,'happy'); r[11] = U[4]
    elif i > 45 and cat != '制作済み':
        r[4] = ''; r[5] = ''; r[6] = ''; r[11] = '未作成'
    if i <= 45: r[9], r[10], r[11] = '完成', 'ファイル内QA合格', U[(i-1)//15+1]
    if 46 <= i <= 52: r[9], r[10] = '完成', 'ファイル内QA合格'
    if i == 53: r[9], r[10] = '一部作成（normalのみ・保持）', '未確認'
    if cat == '将来制作' and i != 53: r[9], r[10] = '将来制作', '—'
    if cat == '今回制作': r[9], r[10] = '未着手', '未確認'
    if i in HOLD: r[9], r[10] = '保留', '—'
    if i in SHARED:
        if i == 28: r[9] = '完成（独自画像は保持・表示は001を参照）'
        else: r[9], r[10] = '共通素材', '—'
        if i != 28: r[7] = r[8] = ''; r[4] = r[5] = r[6] = ''; r[11] = '—'
    out.append([f'{i:03d}'] + r[1:13] + [cat, ref])
with open('breed_master.csv', 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f); w.writerow(H); w.writerows(out)
mp = []
for r in out:
    i = r[0]; ref = r[14] or i
    mp.append({'id': i, 'key': B[int(i)-1][1], 'nameJa': r[1], 'category': r[13],
               'imageRef': ref, 'normal': f'assets/dogs/dog_{ref}_normal.png',
               'happy': f'assets/dogs/dog_{ref}_happy.png',
               'ready': r[13] in ('制作済み', '共通素材を使用') and r[9].startswith(('完成', '共通'))})
json.dump({'version': 2, 'note': 'IDは固定。imageRef=表示に使う画像のID（共通素材は参照先）。ready=trueのみ表示可。',
           'breeds': mp}, open('/home/user/ClaudeCode/assets/dogs/dogs.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
def q(x): return x if not (isinstance(x, str) and x[:1].isdigit() and len(x) == 3) else "'" + x
sheetNO = [[r[13], ("'" + r[14]) if r[14] else ''] for r in out[:45]]
sheetEO = [[("'" + r[4]) if r[4] else '', r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[12], r[13], ("'" + r[14]) if r[14] else ''] for r in out[45:]]
json.dump({'NO': sheetNO, 'EO': sheetEO}, open(sys.argv[1], 'w'), ensure_ascii=False)
from collections import Counter; print(Counter(r[13] for r in out))
