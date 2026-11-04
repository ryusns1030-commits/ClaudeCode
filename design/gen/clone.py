# usage: clone.py SRC_PID DST_PID mode(light|dark) name  -> writes name.ops.json name.fmt.json (+ summary)
import json,sys,glob,os
src,dst,mode,name=sys.argv[1:5]
d=os.path.dirname(os.path.abspath(__file__))
f=max(glob.glob('/root/.claude/projects/-home-user-ClaudeCode/*.jsonl'),key=os.path.getmtime)
page=None
for line in open(f):
  if src not in line: continue
  m=json.loads(line).get('message',{})
  if not isinstance(m.get('content'),list): continue
  for c in m['content']:
    if c.get('type')!='tool_result': continue
    cc=c['content']; txts=[cc] if isinstance(cc,str) else [x.get('text','') for x in cc if x.get('type')=='text']
    for t in txts:
      try: j=json.loads(t)
      except Exception: continue
      if not isinstance(j,dict): continue
      cands=[]
      if 'design_content' in j: cands=j['design_content'].get('pages',[])
      if 'document' in j: cands=[j['document']['page']]
      for pg in cands:
        if pg.get('id')==src and pg.get('elements'): page=pg
if not page: sys.exit("source page not found")
TD={'#ffffff':'#1E1A17','#fbf7f0':'#1E1A17','#3a322b':'#F3ECE3','#6e6258':'#C2B6A9','#b8613d':'#E39A76','#4f7a5e':'#8FBF9F','#4f6f8f':'#9DB6D1','#9a6412':'#E2B66A','#b0443a':'#E58C80'}
SD={'#ffffff':'#2A2521','#fbf7f0':'#1E1A17','#f3ece2':'#352F2A','#e8dfd2':'#433B34','#3a322b':'#F3ECE3','#6e6258':'#C2B6A9','#b8613d':'#E39A76','#f6e3d8':'#4A3328','#4f7a5e':'#8FBF9F','#e2eee5':'#2C3A30','#4f6f8f':'#9DB6D1','#e3eaf2':'#2C3540','#9a6412':'#E2B66A','#fbefd9':'#3F3424','#b0443a':'#E58C80','#f8e1dd':'#44291F','#eadfd2':'#433B34'}
def mp(c,tab): 
  c=c.lower()
  return (tab.get(c,c) if mode=='dark' else c).upper()
ops=[];fmt=[];skipped=[]
for e in page['elements']:
  if e['type']=='text':
    t=''.join(r['characters'] for r in e['textRegions']); fm=e['textRegions'][0]['formatting']
    o=dict(type='add_text',page_id=dst,text=t,top=round(e['top'],1),left=round(e['left'],1),width=round(e['width'],1))
    ops.append(o)
    ff=dict(font_size=int(round(fm['fontSize'])),color=mp(fm['color'],TD),font_weight=fm['fontWeight'] if fm['fontWeight'] in('bold','normal') else 'normal',text_align=fm['textAlign'])
    if abs(fm.get('lineHeight',1.4)-1.4)>0.01: ff['line_height']=fm['lineHeight']
    fmt.append(dict(text=t,top=o['top'],left=o['left'],f=ff))
  elif e['type']=='shape':
    vb=e['viewBox']
    for pa in e['paths']:
      o=dict(type='insert_shape',page_id=dst,top=round(e['top'],1),left=round(e['left'],1),width=round(e['width'],1),height=round(e['height'],1),path=pa['d'],view_box_width=vb['width'],view_box_height=vb['height'],color=mp(pa['fill']['color']['color'],SD))
      if pa.get('cornerRounding'): o['corner_rounding']=pa['cornerRounding']
      if pa['stroke']['weight']: o['stroke_color']=mp(pa['stroke']['color']['color'],SD); o['stroke_weight']=pa['stroke']['weight']
      if e.get('opacity',1)<1: o['opacity']=round(e['opacity'],2)
      ops.append(o)
  else: skipped.append(e['type'])
json.dump(ops,open(f'{d}/{name}.ops.json','w'),ensure_ascii=False)
json.dump(fmt,open(f'{d}/{name}.fmt.json','w'),ensure_ascii=False)
print(name,len(ops),'ops; skipped',skipped)
