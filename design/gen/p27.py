from over import *
ops,fmt=load("p27")
p=Page("PB7GpGsHtjBHFKg6")
p.rect(684,16,358,60,"text",16)
p.rect(700,30,28,28,"sage",14); p.icon("check",705,35,18,"#FFFFFF")
p.text("排泄の記録を保存しました",703,68,190,size=15,c="#FFFFFF",bold=True)
p.text("取り消す",703,262,96,size=15,c="#F6E3D8",bold=True,align="end")
finish("p27",ops,fmt,p)
