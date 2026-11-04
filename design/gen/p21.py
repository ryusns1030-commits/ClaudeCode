from lib import *
p=Page("PB0G2Nj6bkTGSvsS")
p.status()
p.text("プロフィール",54,20,250,size=26,bold=True)
photo(p,104,16,358,150,18)
p.rect(0,0,390,844,"#3A322B",0,op=0.35)
p.rect(0,70,320,844,"surface",0)
p.text("メニュー",56,90,200,size=20,bold=True)
p.icon("cross",56,342,24,"text2")
items=[("cal","病院・通院"),("doc","病院で見せる"),("nikki","使い方ガイド"),("menu","設定")]
for i,(ic,t) in enumerate(items):
  y=110+i*64
  p.icon(ic,y+16,94,24,"primary"); p.text(t,y+18,130,200,size=17,bold=True)
  p.text("›",y+14,354,16,size=20,c="text2")
  p.hline(y+60,90,284)
p.text("その他",384,90,200,size=14,c="text2",bold=True)
for i,t in enumerate(["データのバックアップ（準備中）","お問い合わせ","利用規約・プライバシーポリシー"]):
  y=410+i*52
  p.text(t,y+14,94,270,size=15,c="text2" if i==0 else "text")
  p.hline(y+48,90,284)
p.text("バージョン 0.1.0（初期版）",600,94,270,size=13,c="text2")
emit(p,"p21")
