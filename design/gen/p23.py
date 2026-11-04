from lib import *
p=Page("PBNyNjvsp9nk7743")
p.status(); p.pushnav("メニュー","使い方ガイド")
p.text("「うちのこ」でできること",104,20,350,size=20,bold=True)
p.text("最初に読まなくても使えます。困ったときにいつでも開けます。",136,20,350,size=14,c="text2",lh=1.5)
steps=[("kiroku","毎日の記録","記録タブで項目を横にスクロールして選び、入力します。"),
       ("doc","検査結果を残す","検査票の写真と数値を保存します。写真だけでも保存できます。"),
       ("chart","チャートで見返す","測った項目だけをグラフで表示します。"),
       ("hosp","病院で見せる","最近の様子をまとめた画面を、診察室でそのまま見せられます。")]
for i,(ic,t,d) in enumerate(steps):
  y=186+i*126
  p.rect(y,16,358,112,"surface",18)
  p.rect(y+18,32,44,44,"primarySoft",22); p.icon(ic,y+28,42,24,"primary")
  p.text(f"{i+1}. {t}",y+20,92,266,size=17,bold=True)
  p.text(d,y+48,92,266,size=14,c="text2",lh=1.5)
p.tabbar(3)
emit(p,"p23")
