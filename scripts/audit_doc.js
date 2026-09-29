const fs = require('fs');

const doc = fs.readFileSync('doc_v2_1_full.txt', 'utf8');

// Search for all tables mentioned in S4
const s4Start = doc.indexOf('Section 4: Canonical Data Model');
const s5Start = doc.indexOf('Section 5: Screens, Tabs & Workflows');
const s4Text = doc.slice(s4Start, s5Start);

console.log('=== S4 Table Mentions ===');
const tableMatches = [...s4Text.matchAll(/Table \d+:?\s*([A-Za-z0-9_ -]+)/gi)];
tableMatches.forEach(m => console.log('Doc Table:', m[1]));

// Search for all Rules (R-01 to R-44)
const ruleMatches = [...doc.matchAll(/(R-\d{2}):?\s*([^\n\r]+)/g)];
console.log('\n=== Total Rules in Doc ===', ruleMatches.length);
ruleMatches.slice(0, 15).forEach(m => console.log(m[1], ':', m[2].slice(0, 60)));
