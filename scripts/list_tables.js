const fs = require('fs');
const code = fs.readFileSync('src/db/schema.ts', 'utf8');
const tables = [];
const regex = /export const (\w+) = pgTable\(['"]([^'"]+)/g;
let match;
while ((match = regex.exec(code)) !== null) {
  tables.push(`${match[1]} -> ${match[2]}`);
}
console.log(tables.join('\n'));
console.log('Total tables in schema.ts:', tables.length);
