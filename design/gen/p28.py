from over import *
ops,fmt=load("p28")
# drop the 「前回と同じ」 row; shrink the memo box; retitle the save button
drop=lambda o:(o.get('top')==722 and o['type']=='insert_shape') or o.get('text','').startswith('前回と同じ')
ops=[o for o in ops if not drop(o)]; fmt=[f for f in fmt if not f['text'].startswith('前回と同じ')]
for o in ops:
  if o['type']=='insert_shape' and o['top']==630 and o['height']==80:
    o['height']=44; o['path']="M0 0 H358 V44 H0 Z"; o['view_box_height']=44
  if o.get('text')=='例：朝ごはんの後。少しやわらかめ。元気はあります':
    o['text']='朝ごはんの後。少しやわらかめ'
for f in fmt:
  if f['text']=='例：朝ごはんの後。少しやわらかめ。元気はあります':
    f['text']='朝ごはんの後。少しやわらかめ'; f['f']['color']='#3A322B'
for o in ops+fmt:
  if o.get('text')=='保存する': o['text']='もう一度保存する'
p=Page("PBLZQYQHYYSclXMj")
p.rect(686,16,358,80,"redSoft",14,stroke="red",sw=1.5)
p.rect(700,30,24,24,"red",12); p.icon("bang",703,33,18,"#FFFFFF")
p.text("保存できませんでした",701,66,290,size=15,c="red",bold=True)
p.text("通信状況を確認して、もう一度お試しください。入力内容は残っています。",724,66,290,size=13,c="text",lh=1.5)
finish("p28",ops,fmt,p)
