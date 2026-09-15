async function testInteractiveMutations() {
  const baseUrl = "http://localhost:3000";
  console.log("==================================================");
  console.log("⚡ TESTING INTERACTIVE USER WORKFLOWS (MUTATIONS)");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(title: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title} - ${details || ''}`);
      failed++;
    }
  }

  // 1. Onboard New Lease
  const leaseRes = await fetch(`${baseUrl}/api/rent-roll/leases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      propertyId: "PROP-001",
      tenantName: "Anthropic Research India",
      unitNumber: "Suite 901",
      floorNumber: 9,
      startDate: "2026-10-01",
      endDate: "2031-09-30",
      chargeableArea: 20000,
      monthlyRent: 5000000,
      camRatePsf: 24,
      utilityFixedMonthly: 150000,
      escalationPct: 5,
      escalationFrequencyMonths: 24,
      securityDepositMonths: 6,
      lockInMonths: 36,
      noticePeriodDays: 90
    })
  });
  const createdLease = await leaseRes.json();
  assert("WF-01: Onboard New Lease (20k sqft, 50L/mo)", leaseRes.ok && createdLease.baseRentPsf === 250);

  // 2. Generate Invoices Batch
  const invGenRes = await fetch(`${baseUrl}/api/rent-roll/invoices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ billingMonth: "October 2026" })
  });
  const invGenData = await invGenRes.json();
  assert("WF-02: Generate Invoices Batch", invGenRes.ok && invGenData.invoices.length > 0);

  // 3. Record Payment Receipt
  const invToPay = invGenData.invoices[0];
  const payRes = await fetch(`${baseUrl}/api/rent-roll/collections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      invoiceId: invToPay.id,
      amountReceived: invToPay.netPayable,
      tdsDeducted: invToPay.tdsDeducted,
      paymentMode: "neft_rtgs",
      referenceNumber: "HDFCR520261001009912",
      paymentDate: "2026-10-02"
    })
  });
  const payData = await payRes.json();
  assert("WF-03: Record Payment & Settle Invoice", payRes.ok && payData.receipt.amountReceived === invToPay.netPayable);

  // 4. Apply Escalation
  const escListRes = await fetch(`${baseUrl}/api/rent-roll/escalations?status=pending`);
  const escList = await escListRes.json();
  if (escList.length > 0) {
    const escTarget = escList[0];
    const escApplyRes = await fetch(`${baseUrl}/api/rent-roll/escalations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ escalationId: escTarget.id, action: "apply" })
    });
    assert("WF-04: Apply Escalation Trigger", escApplyRes.ok);
  }

  // 5. Serve Vacation Notice
  const noticeRes = await fetch(`${baseUrl}/api/rent-roll/notices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      leaseId: "LEASE-003",
      noticeDate: "2026-09-15",
      effectiveDate: "2026-12-14",
      noticeReason: "relocation",
      initiatedBy: "tenant",
      remarks: "Tenant relocating to consolidated campus."
    })
  });
  assert("WF-06: Serve Vacation Notice", noticeRes.ok);

  // 6. Record Operating Expense
  const expRes = await fetch(`${baseUrl}/api/rent-roll/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      propertyId: "PROP-001",
      expenseCategory: "repairs_maintenance",
      vendorName: "Otis Elevator Company",
      amount: 150000,
      gstAmount: 27000,
      description: "Quarterly preventative maintenance"
    })
  });
  assert("WF-10: Record Operating Expense (OpEx)", expRes.ok);

  console.log("==================================================");
  console.log(`WORKFLOW TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

testInteractiveMutations();
