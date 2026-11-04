from lib import *
p=Page("PBzYc2gWQwzlm96R")
p.status(); p.modalnav("日記を書く")
p.text("写真（最大4枚）",108,20,250,size=15,c="text2",bold=True)
photo(p,134,16,110,110); photo(p,134,134,110,110)
p.rect(134,252,110,110,"surface",14,stroke="border")
p.icon("plus",166,285,28,"primary"); p.text("追加",200,252,110,size=13,c="primary",bold=True,align="center")
p.text("日付",266,20,80,size=15,c="text2",bold=True); p.text("2026年11月3日（火）",264,120,254,size=16,bold=True,align="end")
p.hline(298,20,350)
p.text("タイトル",314,20,200,size=15,c="text2",bold=True)
p.rect(340,16,358,48,"surface",12,stroke="border"); p.text("はじめての落ち葉さんぽ",354,30,330,size=16)
p.text("本文",400,20,200,size=15,c="text2",bold=True)
p.rect(426,16,358,104,"surface",12,stroke="border")
p.text("公園の落ち葉の上を、うれしそうに何度も往復していました。帰ってからはぐっすり。",438,30,330,size=15,lh=1.6)
p.text("タグ（いくつでも選べます）",546,20,300,size=15,c="text2",bold=True)
row=[("おさんぽ",88,True),("ごはん",76,True),("通院",64,False),("おでかけ",88,False)]
x=16
for t,w,on in row:
  if on:
    p.rect(572,x,w,36,"primarySoft",18,stroke="primary",sw=2); p.text("✓ "+t,581.5,x,w,size=14,c="primary",bold=True,align="center")
  else: p.chip(t,572,x,w,h=36)
  x+=w+8
x=16
for t,w in [("体調",64),("おともだち",100)]:
  p.chip(t,616,x,w,h=36); x+=w+8
p.rect(616,x,112,36,"surface",18,stroke="border"); p.text("＋ タグを作る",625.5,x,112,size=14,c="primary",bold=True,align="center")
p.text("選択中：おさんぽ・ごはん",666,20,350,size=13,c="text2")
p.savebtn()
emit(p,"p17")
