import json,sys,os
L=dict(bg="#FBF7F0",surface="#FFFFFF",surface2="#F3ECE2",border="#E8DFD2",text="#3A322B",text2="#6E6258",
 primary="#B8613D",primarySoft="#F6E3D8",sage="#4F7A5E",sageSoft="#E2EEE5",blue="#4F6F8F",blueSoft="#E3EAF2",
 amber="#9A6412",amberSoft="#FBEFD9",red="#B0443A",redSoft="#F8E1DD",ph="#EADFD2")
D=dict(bg="#1E1A17",surface="#2A2521",surface2="#352F2A",border="#433B34",text="#F3ECE3",text2="#C2B6A9",
 primary="#E39A76",primarySoft="#4A3328",sage="#8FBF9F",sageSoft="#2C3A30",blue="#9DB6D1",blueSoft="#2C3540",
 amber="#E2B66A",amberSoft="#3F3424",red="#E58C80",redSoft="#44291F",ph="#433B34")
ICON={
"kiroku":"M15 3 L21 9 L9 21 H3 V15 Z","chart":"M3 14 H7 V21 H3 Z M10 8 H14 V21 H10 Z M17 3 H21 V21 H17 Z",
"nikki":"M3 5 C6 4 9 4 11 6 V21 C9 19 6 19 3 20 Z M13 6 C15 4 18 4 21 5 V20 C18 19 15 19 13 21 Z",
"dog":"M12 6 C16 6 19 9 19 13 C19 17 16 20 12 20 C8 20 5 17 5 13 C5 9 8 6 12 6 Z M5 7 C3 7 1 10 1 14 C3 14 5 12 6 9 Z M19 7 C21 7 23 10 23 14 C21 14 19 12 18 9 Z",
"cal":"M3 5 H21 V21 H3 Z M7 2 H9 V6 H7 Z M15 2 H17 V6 H15 Z",
"heart":"M12 21 C5 15 2 12 2 8 C2 5 4 3 7 3 C9 3 11 4 12 6 C13 4 15 3 17 3 C20 3 22 5 22 8 C22 12 19 15 12 21 Z",
"drop":"M12 2 C16 8 19 11 19 15 C19 19 16 22 12 22 C8 22 5 19 5 15 C5 11 8 8 12 2 Z",
"bowl":"M2 10 H22 C22 16 18 21 12 21 C6 21 2 16 2 10 Z M7 3 H9 V8 H7 Z M11 2 H13 V8 H11 Z M15 3 H17 V8 H15 Z",
"pill":"M8 3 C11 0 15 1 17 3 C19 5 20 9 17 12 L12 17 C9 20 5 19 3 17 C1 15 0 11 3 8 Z",
"check":"M9 16.2 L4.8 12 L3.4 13.4 L9 19 L21 7 L19.6 5.6 Z",
"plus":"M10.5 3 H13.5 V10.5 H21 V13.5 H13.5 V21 H10.5 V13.5 H3 V10.5 H10.5 Z",
"camera":"M2 7 H7 L9 4 H15 L17 7 H22 V20 H2 Z",
"doc":"M4 1 H15 L20 6 V23 H4 Z",
"bang":"M10.5 4 H13.5 V14 H10.5 Z M10.5 17 H13.5 V20 H10.5 Z",
"chev":"M8.6 4.6 L10 3.2 L18.8 12 L10 20.8 L8.6 19.4 L16 12 Z",
"cross":"M5 6.4 L6.4 5 L12 10.6 L17.6 5 L19 6.4 L13.4 12 L19 17.6 L17.6 19 L12 13.4 L6.4 19 L5 17.6 L10.6 12 Z",
"menu":"M3 5 H21 V7.5 H3 Z M3 10.75 H21 V13.25 H3 Z M3 16.5 H21 V19 H3 Z",
"hosp":"M10 3 H14 V10 H21 V14 H14 V21 H10 V14 H3 V10 H10 Z",
"circle":"M12 2 A10 10 0 1 1 12 22 A10 10 0 1 1 12 2 Z",
}
class Page:
  def __init__(s,pid,dark=False):
    s.pid=pid; s.ops=[]; s.fmt=[]; s.C=D if dark else L
  def col(s,c): return s.C.get(c,c)
  def rect(s,top,left,w,h,c,r=0,stroke=None,sw=2,op=None):
    o=dict(type="insert_shape",page_id=s.pid,top=top,left=left,width=w,height=h,path=f"M0 0 H{w} V{h} H0 Z",view_box_width=w,view_box_height=h,color=s.col(c))
    if r: o["corner_rounding"]=r
    if stroke: o["stroke_color"]=s.col(stroke); o["stroke_weight"]=sw
    if op is not None: o["opacity"]=op
    s.ops.append(o)
  def icon(s,name,top,left,size,c,vb=24):
    s.ops.append(dict(type="insert_shape",page_id=s.pid,top=top,left=left,width=size,height=size,path=ICON.get(name,name),view_box_width=vb,view_box_height=vb,color=s.col(c)))
  def hline(s,top,left,w,c="border"):
    s.ops.append(dict(type="insert_shape",page_id=s.pid,top=top-4,left=left,width=w,height=8,path=f"M0 3.5 H{w} V4.5 H0 Z",view_box_width=w,view_box_height=8,color=s.col(c)))
  def text(s,t,top,left,w=None,size=16,c="text",bold=False,align="start",lh=None):
    o=dict(type="add_text",page_id=s.pid,text=t,top=top,left=left)
    if w: o["width"]=w
    s.ops.append(o)
    f=dict(font_size=size,color=s.col(c),font_weight="bold" if bold else "normal",text_align=align)
    if lh: f["line_height"]=lh
    s.fmt.append(dict(text=t,top=top,left=left,f=f))
  def status(s):
    s.text("9:41",15,34,size=15,bold=True)
    s.ops.append(dict(type="insert_shape",page_id=s.pid,top=19,left=306,width=18,height=12,path="M0 9 H3 V12 H0 Z M5 6 H8 V12 H5 Z M10 3 H13 V12 H10 Z M15 0 H18 V12 H15 Z",view_box_width=18,view_box_height=12,color=s.col("text")))
    s.rect(19,334,24,12,"text",3)
  def modalnav(s,title,save="保存"):
    s.text("キャンセル",58,16,90,size=16,c="text2")
    s.text(title,56,95,200,size=17,bold=True,align="center")
    if save: s.text(save,57,290,84,size=16,c="primary",bold=True,align="end")
    s.hline(92,0,390)
  def pushnav(s,back,title=None,right=None):
    s.text("‹ "+back,57,16,110,size=16,c="primary",bold=True)
    if title: s.text(title,56,95,200,size=17,bold=True,align="center")
    if right: s.text(right,57,280,94,size=16,c="primary",bold=True,align="end")
  def savebtn(s,label="保存する",top=776,c="primary"):
    s.rect(top,16,358,52,c,16); s.text(label,top+16,16,358,size=17,c="#FFFFFF" if s.C is L else "#1E1A17",bold=True,align="center")
  def tabbar(s,active):
    s.rect(760,0,390,84,"border"); s.rect(761,0,390,83,"surface")
    names=[("記録","kiroku"),("チャート","chart"),("日記","nikki"),("プロフィール","dog"),("カレンダー","cal")]
    for i,(n,ic) in enumerate(names):
      cx=39+78*i; on=(i==active)
      if on: s.rect(767,cx-28,56,32,"primarySoft",16)
      s.icon(ic,771,cx-12,24,"primary" if on else "text2")
      if ic=="cal": s.rect(781,cx-7,14,9,"primarySoft" if on else "surface")
      s.text(n,802,78*i,78,size=12,c="primary" if on else "text2",bold=on,align="center")
  def chip(s,t,top,left,w,on=False,h=38,size=14):
    if on: s.rect(top,left,w,h,"text",h/2); s.text(t,top+(h-17)/2,left,w,size=size,c="bg",bold=True,align="center")
    else: s.rect(top,left,w,h,"surface",h/2,stroke="border"); s.text(t,top+(h-17)/2,left,w,size=size,align="center")
  def badge(s,t,top,left,w,kind="sage"):
    s.rect(top,left,w,24,kind+"Soft",12); s.text(t,top+4,left,w,size=12,c=kind,bold=True,align="center")
  def dump(s,name):
    d=os.path.dirname(__file__)
    json.dump(s.fmt,open(f"{d}/{name}.fmt.json","w"),ensure_ascii=False)
    print(json.dumps(s.ops,ensure_ascii=False))
def chart(p,top,name,unit,latest,ref,lo,hi,vmin,vmax,pts,note=None):
  # pts: list of (label, value or None)
  p.rect(top,16,358,196,"surface",18)
  p.text(name,top+14,32,200,size=16,bold=True)
  p.text(ref,top+38,32,250,size=13,c="text2")
  p.text(latest,top+12,240,118,size=20,bold=True,align="end")
  p.text(unit,top+38,240,118,size=13,c="text2",align="end")
  px,pw,py,ph=40,300,top+70,84
  Y=lambda v: py+ph-(v-vmin)/(vmax-vmin)*ph
  p.rect(Y(hi),px,pw,max(8,Y(lo)-Y(hi)),"sageSoft",4)
  p.hline(py+ph,px,pw)
  n=len(pts); X=lambda i: px+16+i*(pw-32)/(n-1)
  meas=[(X(i),Y(v)) for i,(l,v) in enumerate(pts) if v is not None]
  if len(meas)>1:
    up=" ".join(f"L{x:.1f} {y-1:.1f}" for x,y in meas)[1:]
    dn=" ".join(f"L{x:.1f} {y+1:.1f}" for x,y in reversed(meas))
    d="M"+up+" "+dn+" Z"
    # shift to local box
    p.ops.append(dict(type="insert_shape",page_id=p.pid,top=py,left=px,width=pw,height=ph+20,path=" ".join(
      (tok if tok[0].isalpha() and len(tok)==1 else tok) for tok in d.split()),view_box_width=pw,view_box_height=ph+20,color=p.col("primary")))
    # convert absolute coords to local
    o=p.ops[-1]; import re
    toks=re.findall(r"[MLZ]|-?\d+\.?\d*",d); out=[];k=0;cmd=None;nums=[]
    res=[]
    i=0
    while i<len(toks):
      t=toks[i]
      if t in "MLZ":
        res.append(t); i+=1
        if t!="Z": res.append(f"{float(toks[i])-px:.1f} {float(toks[i+1])-py:.1f}"); i+=2
      else: i+=1
    o["path"]=" ".join(res)
  for i,(l,v) in enumerate(pts):
    x=X(i)
    if v is not None:
      p.ops.append(dict(type="insert_shape",page_id=p.pid,top=Y(v)-6,left=x-6,width=12,height=12,path=ICON["circle"],view_box_width=24,view_box_height=24,color=p.col("primary")))
    else:
      p.text("未測定",py+ph-26,x-30,60,size=12,c="text2",align="center")
    p.text(l,py+ph+6,x-30,60,size=12,c="text2",align="center")
  if note: p.text(note,top+200,20,350,size=13,c="text2")
def photo(p,top,left,w,h,r=14,icon=True):
  p.rect(top,left,w,h,"ph",r)
  if icon:
    s=min(w,h)*0.4; p.icon("dog",top+(h-s)/2,left+(w-s)/2,s,"#FFFFFF" if p.C is L else "#5A5048")
def emit(p,name):
  import json
  def r(x):
    if isinstance(x,float): return round(x,1)
    if isinstance(x,dict): return {k:r(v) for k,v in x.items()}
    return x
  p.ops=[r(o) for o in p.ops]
  for f in p.fmt: f["top"]=round(f["top"],1); f["left"]=round(f["left"],1)
  d=os.path.dirname(os.path.abspath(__file__))
  json.dump(p.fmt,open(f"{d}/{name}.fmt.json","w"),ensure_ascii=False)
  json.dump(p.ops,open(f"{d}/{name}.ops.json","w"),ensure_ascii=False)
  print(name,len(p.ops),"ops")
def toggle(p,top,left,on=True):
  p.rect(top,left,52,30,"sage" if on else "border",15)
  p.ops.append(dict(type="insert_shape",page_id=p.pid,top=top+3,left=left+(25 if on else 3),width=24,height=24,path=ICON["circle"],view_box_width=24,view_box_height=24,color="#FFFFFF"))
def row(p,top,label,value=None,chev=True,c="text",vcol="text2"):
  p.text(label,top,32,220,size=16,c=c)
  if value: p.text(value,top,160,(186 if chev else 198),size=15,c=vcol,align="end")
  if chev: p.text("›",top-3,346,16,size=20,c="text2")
