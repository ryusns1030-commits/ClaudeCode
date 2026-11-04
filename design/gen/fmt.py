# usage: fmt.py name  -> reads latest edit-design result from transcript, outputs format ops
import json,sys,glob,os
name=sys.argv[1]; d=os.path.dirname(os.path.abspath(__file__))
spec=json.load(open(f"{d}/{name}.fmt.json"))
f=max(glob.glob('/root/.claude/projects/-home-user-ClaudeCode/*.jsonl'),key=os.path.getmtime)
doc=None
for line in open(f):
  if 'edit_operation_results' not in line and 'design_content' not in line: continue
  m=json.loads(line).get('message',{})
  for c in m.get('content',[]) if isinstance(m.get('content'),list) else []:
    if c.get('type')=='tool_result':
      cc=c['content']; txt=cc if isinstance(cc,str) else [x.get('text','') for x in cc if x.get('type')=='text'][0]
      try:
        j=json.loads(txt)
        if 'document' in j: doc=j
        elif 'design_content' in j and j['design_content'].get('pages'): doc={'document':{'page':j['design_content']['pages'][0]}}
      except Exception: pass
els=[e for e in doc['document']['page']['elements'] if e['type']=='text']
ops=[];used=set()
for sp in spec:
  best=None
  for e in els:
    if e['id'] in used: continue
    t=''.join(r['characters'] for r in e['textRegions'])
    if t.strip()==sp['text'].strip() and abs(e['top']-sp['top'])<3 and abs(e['left']-sp['left'])<3: best=e;break
  if not best: print("MISS",sp['text'],file=sys.stderr);continue
  used.add(best['id'])
  ops.append(dict(type="format_text",locator_id=best['locator_id'],formatting=sp['f']))
print(json.dumps(ops,ensure_ascii=False))
