import json
from lib import Page
p=Page("PB2FW5NcmYgQmBsC")
p.status()
p.pushnav("愛犬の登録","犬種を選ぶ")
p.hline(92,0,390)
p.rect(108,16,358,48,"surface",16,stroke="border")
p.text("犬種名で検索（例：プードル）",122,32,320,size=16,c="text2")
p.text("よく選ばれる犬種",176,20,300,size=15,c="text2",bold=True)
rows=[("トイ・プードル","サイズ違いのプードルも同じイラスト",True),
      ("チワワ","",False),("ミニチュア・ダックスフンド","",False),("柴","",False),
      ("ゴールデン・レトリーバー","",False),("フラットコーテッド・レトリーバー","ゴールデンと共通のイラスト",False)]
p.rect(204,16,358,64*6,"surface",18)
imgs=[]
for i,(n,sub,on) in enumerate(rows):
    t=204+64*i
    if on: p.rect(t,16,358,64,"primarySoft",18 if i==0 else 0)
    p.rect(t+10,28,44,44,"surface2",22)
    imgs.append((t+6,24))
    if sub:
        p.text(n,t+12,84,240,size=16,bold=True,c="primary" if on else "text")
        p.text(sub,t+36,84,240,size=13,c="text2")
    else:
        p.text(n,t+22,84,240,size=16,bold=on,c="primary" if on else "text")
    if on: p.icon("check",t+22,334,22,"primary")
    else: p.icon("chev",t+24,338,16,"text2")
    if i<5: p.hline(t+64,84,274)
p.text("そのほかの犬種",604,20,300,size=15,c="text2",bold=True)
p.rect(632,16,358,72,"surface",18)
p.rect(646,28,44,44,"surface2",22); p.icon("dog",656,38,24,"text2")
p.text("バーニーズ・マウンテン・ドッグ",644,84,250,size=16)
p.text("イラスト準備中（ほかの犬種のイラストで表示）",668,84,260,size=13,c="amber",bold=True)
p.icon("chev",660,338,16,"text2")
p.text("犬種名と犬種IDは、選んだとおりに保存します。専用のイラストができたら自動で切り替わります。",718,20,350,size=13,c="text2",lh=1.4)
json.dump(p.ops,open("p31.ops.json","w"),ensure_ascii=False); p.dump("p31")
json.dump(imgs,open("p31.imgs.json","w"))
print(len(p.ops))
