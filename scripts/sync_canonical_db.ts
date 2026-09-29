import { resetRentRollDb, getRentRollDb } from '../src/lib/rent-roll-store';

console.log('Resetting rent roll database to Section 13 canonical fixtures...');
resetRentRollDb('fixtures');

const db = getRentRollDb();
console.log('--- Canonical DB Hydrated ---');
console.log(`Properties: ${db.properties.length}`);
console.log(`Spaces:     ${db.spaces.length}`);
console.log(`Tenants:    ${db.tenants.length}`);
console.log(`Leases:     ${db.leases.length}`);
console.log(`Invoices:   ${db.invoices.length}`);
console.log(`Collections:${db.collections?.length || 0}`);
console.log(`Allocations:${db.paymentAllocations?.length || 0}`);
console.log(`Statements: ${db.ownerStatements?.length || 0}`);
console.log('Done!');
