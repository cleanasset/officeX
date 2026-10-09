import os
import re

def main():
    with open('client response/v2_1_spec_extracted.txt', encoding='utf-8', errors='ignore') as f:
        v2_text = f.read()

    # Find section 4 tables
    # Often formatted like '4.x Table: table_name' or 'Table 4.x: table_name' or 'table_name (table)'
    matches = re.findall(r'(\b[a-z_0-9]+)\s*\((?:table|Table)\)', v2_text)
    print(f'Tables with (table): {len(set(matches))}')
    for t in sorted(set(matches)):
        print(' ', t)

    # Search for all table schemas in section 4
    idx4 = v2_text.find('SECTION\n\n4\n')
    idx5 = v2_text.find('SECTION\n\n5\n')
    sec4 = v2_text[idx4:idx5] if idx4 != -1 and idx5 != -1 else v2_text[idx4:idx4+20000]

    # Look for table definitions in Section 4
    lines = sec4.split('\n')
    tables_found = set()
    for l in lines:
        m = re.match(r'^(?:4\.\d+|Table\s+\d+|###\s+)?\s*([a-z_]+)\s*(?:\(table\)|\btable\b|—|-)', l.strip())
        if m:
            tables_found.add(m.group(1))

    print(f'\nTables found in Sec 4 headers: {len(tables_found)}')
    for t in sorted(tables_found):
        print(' ', t)

if __name__ == '__main__':
    main()
