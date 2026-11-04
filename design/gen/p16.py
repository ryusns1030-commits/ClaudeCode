from lib import *
p=Page("PBHg5kY0XshnqXrM")
p.status()
p.text("チャート",54,20,200,size=26,bold=True)
x=16
for t,w,on in [("血液検査",96,False),("尿検査",80,False),("体重",70,True),("症状",70,False)]:
  p.chip(t,100,x,w,on=on); x+=w+8
x=16
for t,w,on in [("1か月",72,True),("3か月",72,False),("1年",60,False)]:
  if on: p.rect(150,x,w,34,"primarySoft",17); p.text(t,158.5,x,w,size=14,c="primary",bold=True,align="center")
  else: p.rect(150,x,w,34,"surface2",17); p.text(t,158.5,x,w,size=14,c="text2",align="center")
  x+=w+8
# weight card
p.rect(200,16,358,224,"surface",18)
p.text("体重",214,32,200,size=16,bold=True)
p.text("10/5〜11/4 ・ 記録 2件",238,32,200,size=13,c="text2")
p.text("4.2 kg",212,200,158,size=20,bold=True,align="end")
p.text("11/1 時点",238,200,158,size=13,c="text2",align="end")
px,pw,py,ph=40,300,270,90
p.hline(py+ph,px,pw)
for xx,yy in [(px+70,py+30),(px+262,py+40)]:
  p.ops.append(dict(type="insert_shape",page_id=p.pid,top=yy-6,left=xx-6,width=12,height=12,path=ICON["circle"],view_box_width=24,view_box_height=24,color=p.col("primary")))
p.text("4.3",py+6,px+50,40,size=12,c="text2",align="center")
p.text("4.2",py+16,px+242,40,size=12,c="text2",align="center")
for i,l in enumerate(["10/5","10/15","10/25","11/4"]):
  p.text(l,py+ph+6,px+10+i*93-20,60,size=12,c="text2",align="center")
p.text("記録が少ないため、点を線でつないでいません",392,32,326,size=13,c="amber",bold=True)
# record-status card
p.text("記録状況（10/5〜11/4）",440,20,300,size=15,c="text2",bold=True)
p.rect(466,16,358,140,"surface",18)
for j,(ic,n,c,v) in enumerate([("bowl","食事","sage","記録あり 12日"),("drop","排泄","blue","記録あり 9日")]):
  y=480+j*64
  p.icon(ic,y+4,32,24,c); p.text(n,y+6,64,80,size=16,bold=True); p.text(v,y+6,150,208,size=16,align="end")
  p.text("まだ記録がない日 "+("19日" if j==0 else "22日"),y+30,150,208,size=13,c="text2",align="end")
  if j==0: p.hline(y+58,32,326)
p.rect(622,16,358,64,"surface2",14)
p.text("記録がない日は「異常なし」ではなく「まだ記録がありません」として扱います。",632,30,330,size=13,c="text2",lh=1.5)
p.tabbar(1)
emit(p,"p16")
