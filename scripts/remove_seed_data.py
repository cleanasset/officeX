# -*- coding: utf-8 -*-
import re

with open('src/lib/rent-roll-store.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find from ensureSpacesAndContractsForProperties to the end of getRentRollDb
pattern = r'// Auto-hydrate spaces and contracts for any registered property lacking space inventory\s+export function ensureSpacesAndContractsForProperties[\s\S]*?return parsed;\s*\}\s*catch\s*\(e\)\s*\{[\s\S]*?return initial;\s*\}\s*\}'

replacement = """// Auto-hydrate spaces and contracts for any registered property lacking space inventory (Disabled: clean user workspace)
export function ensureSpacesAndContractsForProperties(parsed: RentRollDatabase): boolean {
  return false;
}

// Read database
export function getRentRollDb(): RentRollDatabase {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const initial = getEmptyDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    
    // Ensure all canonical arrays exist
    if (!parsed.clientAccounts) parsed.clientAccounts = [];
    if (!parsed.billingEntities) parsed.billingEntities = [];
    if (!parsed.managementMandates) parsed.managementMandates = [];
    if (!parsed.deals) parsed.deals = [];
    if (!parsed.billingRuns) parsed.billingRuns = [];
    if (!parsed.paymentAllocations) parsed.paymentAllocations = [];
    if (!parsed.adjustmentNotes) parsed.adjustmentNotes = [];
    if (!parsed.ownerStatements) parsed.ownerStatements = [];
    if (!parsed.importBatches) parsed.importBatches = [];
    if (!parsed.mappingTemplates) parsed.mappingTemplates = [];
    if (!parsed.flexCentres) parsed.flexCentres = [];
    if (!parsed.camPools) parsed.camPools = [];
    if (!parsed.meterReadings) parsed.meterReadings = [];
    if (!parsed.auditLogs) parsed.auditLogs = [];

    if (!parsed.snapshots) parsed.snapshots = [];
    if (!parsed.spaces) parsed.spaces = [];
    if (!parsed.leases) parsed.leases = [];
    if (!parsed.tenants) parsed.tenants = [];
    if (!parsed.properties) parsed.properties = [];
    if (!parsed.invoices) parsed.invoices = [];
    if (!parsed.collections) parsed.collections = [];
    if (!parsed.expenses) parsed.expenses = [];
    if (!parsed.notices) parsed.notices = [];
    if (!parsed.alerts) parsed.alerts = [];
    if (!parsed.escalations) parsed.escalations = [];

    if (!parsed.chargeMaster || parsed.chargeMaster.length === 0) {
      parsed.chargeMaster = getEmptyDatabase().chargeMaster;
    }

    if (!parsed.config) {
      parsed.config = getEmptyDatabase().config;
    } else if (parsed.config.makerCheckerEnabled === undefined) {
      parsed.config.makerCheckerEnabled = true;
    }

    return parsed;
  } catch (e) {
    console.error("Error reading rent roll DB, initializing clean empty DB:", e);
    const initial = getEmptyDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}"""

match = re.search(pattern, content)
if not match:
    print("Error: pattern not found!")
    exit(1)

new_content = content[:match.start()] + replacement + content[match.end():]

with open('src/lib/rent-roll-store.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated src/lib/rent-roll-store.ts successfully to pure empty workspace mode!")
