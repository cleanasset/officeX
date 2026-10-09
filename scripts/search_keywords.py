import os

keywords = ['exception', 'forecast', 'snapshot', 'investor_pack', 'head_lease', 'centre_pnl', 'stacking', 'meter_reading', 'seat_count']

found = {}
for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith(('.ts', '.tsx')):
            p = os.path.join(root, f)
            with open(p, encoding='utf-8', errors='ignore') as fp:
                c = fp.read().lower()
            for k in keywords:
                if k in c:
                    found.setdefault(k, []).append(p)

for k, matches in found.items():
    print(f'Keyword "{k}": {len(matches)} files')
    for m in matches[:3]:
        print('  ', m)
