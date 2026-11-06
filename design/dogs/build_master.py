import csv, json, sys
sys.path.insert(0, 'design/dogs')
from breeds import B
URL01 = 'https://www.canva.com/d/MZFR8TsOzY4h3sH'
PROTO = {1, 2, 3, 5, 11}
def tier(i):
    return '人気' if i<=30 else '小型' if i<=64 else '中型' if i<=93 else '大型' if i<=128 else '日本犬' if i<=135 else '希少'
H = ['犬種ID','犬種名（日本語）','英語識別名','犬種の外見的特徴','Canvaファイル番号','normalのページ番号','happyのページ番号',
     'normalのPNGファイル名','happyのPNGファイル名','制作状況','品質確認状況','CanvaファイルURL','備考']
rows, mp = [], []
for i,(ja,en,feat) in enumerate(B,1):
    fno = (i-1)//15+1; pn = ((i-1)%15)*2+1
    sid = f'{i:03d}'; n, h = f'dog_{sid}_normal.png', f'dog_{sid}_happy.png'
    p = i in PROTO
    rows.append([sid, ja, en, feat, f'{fno:02d}', pn, pn+1, n, h,
                 '試作済み（承認待ち）' if p else '未着手',
                 '一次確認OK（承認待ち）' if p else '未確認',
                 URL01 if fno==1 else '未作成',
                 f'区分:{tier(i)}' + ('／STEP2試作' if p else '')])
    mp.append({'id': sid, 'key': en, 'nameJa': ja, 'normal': f'assets/dogs/{n}', 'happy': f'assets/dogs/{h}',
               'canvaFile': f'うちのこ_犬種別イラスト_{fno:02d}', 'pages': [pn, pn+1], 'ready': False})
with open('design/dogs/breed_master.csv','w',newline='',encoding='utf-8-sig') as f:
    w = csv.writer(f); w.writerow(H); w.writerows(rows)
json.dump({'version':1,'note':'IDは固定。ready=true は承認・最終QA合格後のみ。','breeds':mp},
          open('assets/dogs/dogs.json','w',encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump([H]+rows, open(sys.argv[1],'w',encoding='utf-8'), ensure_ascii=False)
print(len(rows))
