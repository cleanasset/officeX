import json

with open('scripts/all_requirements.json', encoding='utf-8') as f:
    reqs = json.load(f)

lines = []
for rid, data in sorted(reqs.items()):
    lines.append(f"{rid} | {data['title']} | {data['acceptance']} | Priority: {data['priority']} | Phase: {data['phase']}")

with open('scripts/requirements_full.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f"Wrote {len(lines)} requirements into scripts/requirements_full.txt")
