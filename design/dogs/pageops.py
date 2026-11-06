import json, sys
sys.path.insert(0, '/home/user/ClaudeCode/design/dogs'); from breeds import B
f = int(sys.argv[1]); ops = [{'type': 'update_title', 'title': f'うちのこ_犬種別イラスト_{f:02d}'}]
for i in range((f-1)*15+1, f*15+1):
    for p in ('normal', 'happy'):
        ops.append({'type': 'add_page', 'width': 1080, 'height': 1080, 'title': f'{i:03d}_{B[i-1][1]}_{p}'})
print(json.dumps(ops, ensure_ascii=False, separators=(',', ':')))
