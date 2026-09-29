const fs = require('fs');
const doc = fs.readFileSync('doc_v2_1_full.txt', 'utf8');

function extractBetween(startStr, endStr) {
  const s = doc.indexOf(startStr);
  if (s === -1) return 'NOT FOUND: ' + startStr;
  const e = doc.indexOf(endStr, s);
  if (e === -1) return doc.slice(s, s + 3000);
  return doc.slice(s, e);
}

// Write out key sections for analysis
fs.writeFileSync('s4_extracted.txt', extractBetween('4.1 Design Principles', 'Section 5: Screens, Tabs & Workflows'));
fs.writeFileSync('s5_screens_extracted.txt', extractBetween('5.2 Screen Inventory', '5.3 Rent Roll Register'));
fs.writeFileSync('s5_fields_extracted.txt', extractBetween('5.3 Rent Roll Register', '5.4 Standalone Product'));
fs.writeFileSync('rules_extracted.txt', extractBetween('4.14 Core Business Rules', '4.15 Multi-Currency'));

console.log('Sections written to disk.');
