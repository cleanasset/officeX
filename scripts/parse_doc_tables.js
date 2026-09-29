const fs = require('fs');

const full = fs.readFileSync('doc_v2_1_full.txt', 'utf8');
const tablesPart = full.slice(full.indexOf('=== TABLES ==='));
const tableBlocks = tablesPart.split(/--- TABLE \d+ ---/g);

console.log('Total table blocks:', tableBlocks.length);

const matchedTables = [];

tableBlocks.forEach((tb, idx) => {
  const lines = tb.trim().split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) return;
  const firstLine = lines[0];
  const secondLine = lines[1] || '';
  const content = lines.slice(0, 5).join(' | ');

  // Look for important specification tables
  if (
    content.toLowerCase().includes('screen') ||
    content.toLowerCase().includes('contract_type') ||
    content.toLowerCase().includes('billing_model') ||
    content.toLowerCase().includes('rent roll register') ||
    content.toLowerCase().includes('r-01') ||
    content.toLowerCase().includes('ingestion') ||
    content.toLowerCase().includes('entitlement') ||
    content.toLowerCase().includes('exception') ||
    content.toLowerCase().includes('rule id') ||
    content.toLowerCase().includes('column name')
  ) {
    matchedTables.push({
      tableIndex: idx,
      firstLine,
      lineCount: lines.length,
      sample: lines.slice(0, 3)
    });
  }
});

console.log(`Found ${matchedTables.length} specification tables:`);
matchedTables.forEach(t => {
  console.log(`\n[Table ${t.tableIndex}] (${t.lineCount} lines)`);
  t.sample.forEach(s => console.log('  ', s.slice(0, 100)));
});
