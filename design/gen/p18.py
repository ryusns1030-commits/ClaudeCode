from lib import *
p=Page("PBz1rKVbxpFnzpHc")
p.status(); p.pushnav("日記",None,"編集")
photo(p,96,16,358,240,18)
p.rect(312,166,58,8,"#FFFFFF",4,op=0.9)
p.text("2026年11月3日（火）",356,20,300,size=14,c="text2")
p.text("はじめての落ち葉さんぽ",380,20,350,size=22,bold=True)
x=20
for t,w in [("おさんぽ",84),("ごはん",72)]:
  p.rect(420,x,w,30,"primarySoft",15); p.text(t,426.5,x,w,size=13,c="primary",bold=True,align="center"); x+=w+8
p.text("公園の落ち葉の上を、うれしそうに何度も往復していました。帰ってからはぐっすり。夜ごはんも完食。",468,20,350,size=16,lh=1.7)
p.text("この日の記録",568,20,200,size=15,c="text2",bold=True)
p.rect(594,16,358,64,"surface",16)
p.icon("pill",614,32,24,"blue"); p.text("服薬 2件 ・ 食事 2件",616,64,250,size=16,bold=True)
p.text("›",614,340,20,size=20,c="text2")
p.text("この日記を削除",712,16,358,size=15,c="red",bold=True,align="center")
p.tabbar(2)
emit(p,"p18")
