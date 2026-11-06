"""stdin: line1 = 30 page ids (space sep); following lines: 'ID nt_media nt_suffix ht_media ht_suffix'.
Writes items json for fitops and records transparent media IDs in ledger.json."""
import sys, json
L = '/home/user/ClaudeCode/design/dogs/ledger.json'
lines = sys.stdin.read().split('\n'); pages = lines[0].split(); led = json.load(open(L)); items = []
for ln in lines[1:]:
    if not ln.strip(): continue
    i, nm, ns, hm, hs = ln.split(); k = (int(i) - 1) % 15
    items += [[i, 'normal', nm, ns, pages[2*k]], [i, 'happy', hm, hs, pages[2*k+1]]]
    led.setdefault(i, {}).update(nt=nm, ht=hm)
json.dump(led, open(L, 'w'), indent=0); json.dump(items, open(sys.argv[1], 'w'))
print(len(items), 'items')
