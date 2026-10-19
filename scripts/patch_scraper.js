const fs = require('fs');

let code = fs.readFileSync('scripts/scrape_myhq_master.js', 'utf8');
const searchStr = "'Photos Count': photos.length,\n          'Badges / Tags':";
const replaceStr = "'Photos Count': photos.length,\n          'Photo URLs': photos.slice(0, 5).join(' ; '),\n          'Brochure URL': (detail.brochure && detail.brochure.url) || '',\n          'Badges / Tags':";

code = code.replaceAll(searchStr, replaceStr);
fs.writeFileSync('scripts/scrape_myhq_master.js', code, 'utf8');
console.log('Successfully patched scripts/scrape_myhq_master.js!');
