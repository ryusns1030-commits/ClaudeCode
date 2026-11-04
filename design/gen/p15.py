from lib import *
p=Page("PBdTrFqqP4cFz6Y8")
p.status()
p.text("チャート",54,20,200,size=26,bold=True)
x=16
for t,w,on in [("血液検査",96,True),("尿検査",80,False),("体重",70,False),("症状",70,False)]:
  p.chip(t,100,x,w,on=on); x+=w+8
x=16
for t,w,on in [("たんぱく",88,False),("腎臓",64,False),("電解質",80,True),("肝臓",64,False),("血球",64,False)]:
  if on: p.rect(150,x,w,34,"primarySoft",17); p.text(t,158.5,x,w,size=14,c="primary",bold=True,align="center")
  else: p.rect(150,x,w,34,"surface2",17); p.text(t,158.5,x,w,size=14,c="text2",align="center")
  x+=w+8
p.text("期間：2026年6月〜11月 ・ 測定した項目だけを表示",198,20,350,size=13,c="text2")
chart(p,224,"Na（ナトリウム）","mEq/L","148","基準 141〜152（検査票）",141,152,135,158,[("6/10",146),("8/30",None),("11/1",148)])
chart(p,432,"K（カリウム）","mEq/L","4.6","基準 3.8〜5.0（検査票）",3.8,5.0,3.0,5.6,[("6/10",4.2),("8/30",None),("11/1",4.6)])
p.rect(640,16,358,60,"surface2",14)
p.text("Cl は今回測定されていないため表示していません。未測定の日は 0 ではなく「未測定」と表示します。",650,30,330,size=13,c="text2",lh=1.5)
p.text("グラフをタップ → 検査票の写真・検査日を確認",716,0,390,size=13,c="primary",bold=True,align="center")
p.tabbar(1)
p.dump("p15")
