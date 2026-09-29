import { resetRentRollDb, getRentRollDb } from '../src/lib/rent-roll-store';

console.log('Resetting rent roll database to PRISTINE CLEAN mode (zero seed data)...');
resetRentRollDb('clean');

const db = getRentRollDb();
console.log('==================================================');
console.log('🧹 RENT ROLL DATABASE: PRISTINE CLEAN STATE');
console.log('==================================================');
console.log(`Properties:         ${db.properties?.length || 0}`);
console.log(`Spaces:             ${db.spaces?.length || 0}`);
console.log(`Tenants:            ${db.tenants?.length || 0}`);
console.log(`Leases/Contracts:   ${db.leases?.length || 0}`);
console.log(`Invoices:           ${db.invoices?.length || 0}`);
console.log(`Collections:        ${db.collections?.length || 0}`);
console.log(`Allocations:        ${db.paymentAllocations?.length || 0}`);
console.log(`Owner Statements:   ${db.ownerStatements?.length || 0}`);
console.log(`Expenses:           ${db.expenses?.length || 0}`);
console.log(`Notices:            ${db.notices?.length || 0}`);
console.log(`Alerts:             ${db.alerts?.length || 0}`);
console.log(`Flex Centres:       ${db.flexCentres?.length || 0}`);
console.log(`CAM Pools:          ${db.camPools?.length || 0}`);
console.log(`Meter Readings:     ${db.meterReadings?.length || 0}`);
console.log(`Client Accounts:    ${db.clientAccounts?.length || 0}`);
console.log(`Billing Entities:   ${db.billingEntities?.length || 0}`);
console.log('==================================================');
console.log('All seed data removed successfully!');
