import re

def main():
    with open('src/db/schema.ts', encoding='utf-8', errors='ignore') as f:
        text = f.read()

    pattern = re.compile(r'export const (\w+)\s*=\s*pgTable\(\s*["\']([^"\']+)["\']')
    tables = pattern.findall(text)
    print(f'schema.ts tables ({len(tables)}):')
    for var_name, tbl_name in tables:
        print(f'  {var_name} -> {tbl_name}')

if __name__ == '__main__':
    main()
