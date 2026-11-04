from lib import *
p=Page("PBshcSlD9s1LD7l8")
p.status(); p.pushnav("戻る","検査票の読み取り")
p.rect(100,16,358,80,"amberSoft",14)
p.text("準備中",112,32,70,size=13,c="amber",bold=True)
p.text("この機能は今後の追加予定です。現在は数値を手入力してください。",130,32,330,size=14,c="amber",bold=True,lh=1.4)
p.text("完成時のイメージ",200,20,300,size=15,c="text2",bold=True)
p.rect(226,16,358,210,"surface",18)
p.rect(242,32,120,176,"ph",8)
for i in range(7):
  p.rect(258+i*20,44,96 if i%2==0 else 70,8,"#FFFFFF",4)
p.rect(274,40,104,18,"primary",4,op=0.25); p.rect(294,40,104,18,"primary",4,op=0.25)
p.text("① 検査票を撮影",246,378-0-0,0) if False else None
p.text("① 検査票を撮影",246,378,0) if False else None
for i,t in enumerate(["① 検査票を撮影する","② 項目と数値を読み取る","③ 内容を確認して保存"]):
  p.text(t,250+i*44,378-6-0-0-0-0-0-0-0-0-200+16,170,size=14,bold=(i==1))
p.text("読み取り結果は必ず検査票と見比べて確認します",392,32,330,size=13,c="text2")
p.text("読み取り結果（イメージ）",458,20,300,size=15,c="text2",bold=True)
p.rect(484,16,358,140,"surface",18)
for i,(n,v,ok) in enumerate([("ALB","3.1 g/dL",True),("TP","6.4 g/dL",True),("GLU","92 mg/dL",False)]):
  y=496+i*44
  p.text(n,y+10,32,80,size=16,bold=True); p.text(v,y+10,120,120,size=16)
  if ok: p.badge("確認済み",y+8,280,78,"sage")
  else: p.badge("要確認",y+8,280,78,"amber")
  if i<2: p.hline(y+44,32,326)
p.rect(684,16,358,52,"surface2",16); p.text("読み取りを開始（準備中）",700,16,358,size=16,c="text2",bold=True,align="center")
p.text("手入力に戻る",780,16,358,size=16,c="primary",bold=True,align="center")
emit(p,"p14")
