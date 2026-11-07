import json,sys
j=json.load(open(sys.argv[1]))
for pg in j['design_content']['pages']:
  print('=== ',pg['id'],pg.get('title'))
  for e in pg['elements']:
    if e['type']=='text':
      t=''.join(r['characters'] for r in e['textRegions']).replace('\n','⏎'); fm=e['textRegions'][0]['formatting']
      print(f"T {e['id']} t{e['top']:.0f} l{e['left']:.0f} w{e['width']:.0f} h{e['height']:.0f} {fm['fontSize']:.0f}{'b' if fm['fontWeight']=='bold' else ''} {fm['color']} {fm['textAlign'][0]} | {t}")
    else:
      p=e.get('paths',[{}])[0]; col=p.get('fill',{}).get('color',{}).get('color','')
      print(f"S {e['id']} t{e['top']:.0f} l{e['left']:.0f} w{e['width']:.0f} h{e['height']:.0f} {col}")
