# usage: els.py PAGE_ID  -> compact element list from latest read/edit result in transcript
import json,sys,glob,os
pid=sys.argv[1]
f=max(glob.glob('/root/.claude/projects/-home-user-ClaudeCode/*.jsonl'),key=os.path.getmtime)
page=None
for line in open(f):
  if pid not in line: continue
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
      if isinstance(j.get('design_content'),dict): cands=j['design_content'].get('pages',[])
      if 'document' in j: cands=[j['document']['page']]
      for pg in cands:
        if pg.get('id')==pid and pg.get('elements'): page=pg
if not page: sys.exit('not found')
for e in page['elements']:
  if e['type']=='text':
    t=''.join(r['characters'] for r in e['textRegions']).replace('\n','⏎'); fm=e['textRegions'][0]['formatting']
    print(f"T {e['id']} t{e['top']:.0f} l{e['left']:.0f} w{e['width']:.0f} h{e['height']:.0f} {fm['fontSize']:.0f}{'b' if fm['fontWeight']=='bold' else ''} {fm['color']} {fm['textAlign'][0]} | {t}")
  else:
    p=e.get('paths',[{}])[0]; col=p.get('fill',{}).get('color',{}).get('color','')
    sw=p.get('stroke',{}).get('weight',0)
    print(f"S {e['id']} t{e['top']:.0f} l{e['left']:.0f} w{e['width']:.0f} h{e['height']:.0f} {col}{' sw'+str(sw) if sw else ''}")
