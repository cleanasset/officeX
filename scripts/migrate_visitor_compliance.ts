import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { Client } from 'pg';

async function migrateVisitorCompliance() {
  const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
  const connStr = rawUrl.includes('officeX@18129001')
    ? rawUrl.replace('officeX@18129001', 'officeX%4018129001')
    : rawUrl;

  console.log('Connecting to PostgreSQL database...');
  const client = new Client({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✓ Connected to Supabase DB successfully!');

    // 1. vc_visitors
    await client.query(`
      CREATE TABLE IF NOT EXISTS vc_visitors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id VARCHAR(100) NOT NULL,
        visitor_type VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        mobile VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        photo_url TEXT,
        identity_type VARCHAR(50),
        identity_ref_token VARCHAR(100),
        consent_flag BOOLEAN DEFAULT true,
        status VARCHAR(50) DEFAULT 'active' NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_vc_visitors_org ON vc_visitors(org_id);
      CREATE INDEX IF NOT EXISTS idx_vc_visitors_mobile ON vc_visitors(mobile);
      CREATE INDEX IF NOT EXISTS idx_vc_visitors_name ON vc_visitors(name);
    `);
    console.log('✓ vc_visitors table & indexes verified');

    // 2. vc_visits
    await client.query(`
      CREATE TABLE IF NOT EXISTS vc_visits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        visitor_id UUID REFERENCES vc_visitors(id) ON DELETE CASCADE,
        org_id VARCHAR(100) NOT NULL,
        property_id VARCHAR(100),
        property_name VARCHAR(255),
        building_id VARCHAR(100),
        floor VARCHAR(50),
        zone_id VARCHAR(100),
        host_user_id VARCHAR(100),
        host_name VARCHAR(255),
        host_email VARCHAR(255),
        host_phone VARCHAR(50),
        tenant_id VARCHAR(100),
        tenant_name VARCHAR(255),
        purpose VARCHAR(255),
        visit_start TIMESTAMPTZ NOT NULL,
        visit_end TIMESTAMPTZ NOT NULL,
        approval_status VARCHAR(50) DEFAULT 'pending' NOT NULL,
        status VARCHAR(50) DEFAULT 'scheduled' NOT NULL,
        checkin_at TIMESTAMPTZ,
        checkout_at TIMESTAMPTZ,
        risk_level VARCHAR(20) DEFAULT 'low' NOT NULL,
        special_instructions TEXT,
        checkin_method VARCHAR(50),
        checkout_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_vc_visits_org ON vc_visits(org_id);
      CREATE INDEX IF NOT EXISTS idx_vc_visits_visitor ON vc_visits(visitor_id);
      CREATE INDEX IF NOT EXISTS idx_vc_visits_status ON vc_visits(status);
      CREATE INDEX IF NOT EXISTS idx_vc_visits_approval ON vc_visits(approval_status);
      CREATE INDEX IF NOT EXISTS idx_vc_visits_start ON vc_visits(visit_start);
    `);
    console.log('✓ vc_visits table & indexes verified');

    // 3. vc_vehicles
    await client.query(`
      CREATE TABLE IF NOT EXISTS vc_vehicles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        visit_id UUID REFERENCES vc_visits(id) ON DELETE CASCADE,
        registration_no VARCHAR(50) NOT NULL,
        type VARCHAR(50) DEFAULT 'four_wheeler',
        parking_slot VARCHAR(50),
        in_at TIMESTAMPTZ,
        out_at TIMESTAMPTZ,
        status VARCHAR(50) DEFAULT 'parked',
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_vc_vehicles_reg ON vc_vehicles(registration_no);
      CREATE INDEX IF NOT EXISTS idx_vc_vehicles_visit ON vc_vehicles(visit_id);
    `);
    console.log('✓ vc_vehicles table & indexes verified');

    // 4. vc_approvals
    await client.query(`
      CREATE TABLE IF NOT EXISTS vc_approvals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        visit_id UUID REFERENCES vc_visits(id) ON DELETE CASCADE,
        approver_id VARCHAR(100),
        approver_name VARCHAR(255),
        decision VARCHAR(50) NOT NULL,
        reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_vc_approvals_visit ON vc_approvals(visit_id);
    `);
    console.log('✓ vc_approvals table & indexes verified');

    // 5. vc_access_passes
    await client.query(`
      CREATE TABLE IF NOT EXISTS vc_access_passes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        visit_id UUID REFERENCES vc_visits(id) ON DELETE CASCADE,
        pass_number VARCHAR(100) UNIQUE NOT NULL,
        pass_type VARCHAR(50) DEFAULT 'digital_qr' NOT NULL,
        qr_token TEXT NOT NULL,
        valid_from TIMESTAMPTZ NOT NULL,
        valid_to TIMESTAMPTZ NOT NULL,
        access_zones JSONB DEFAULT '["Lobby", "Floor"]'::jsonb,
        status VARCHAR(50) DEFAULT 'active' NOT NULL,
        issued_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        returned_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_vc_passes_visit ON vc_access_passes(visit_id);
      CREATE INDEX IF NOT EXISTS idx_vc_passes_number ON vc_access_passes(pass_number);
      CREATE INDEX IF NOT EXISTS idx_vc_passes_status ON vc_access_passes(status);
    `);
    console.log('✓ vc_access_passes table & indexes verified');

    // 6. vc_access_events
    await client.query(`
      CREATE TABLE IF NOT EXISTS vc_access_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pass_id UUID REFERENCES vc_access_passes(id) ON DELETE SET NULL,
        visitor_id UUID REFERENCES vc_visitors(id) ON DELETE SET NULL,
        visit_id UUID REFERENCES vc_visits(id) ON DELETE SET NULL,
        access_point VARCHAR(255) NOT NULL,
        direction VARCHAR(20) NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        source_system VARCHAR(100) DEFAULT 'turnstile_qr',
        result VARCHAR(50) DEFAULT 'granted' NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_vc_events_visitor ON vc_access_events(visitor_id);
      CREATE INDEX IF NOT EXISTS idx_vc_events_time ON vc_access_events(timestamp);
    `);
    console.log('✓ vc_access_events table & indexes verified');

    // 7. vc_watchlist
    await client.query(`
      CREATE TABLE IF NOT EXISTS vc_watchlist (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        mobile VARCHAR(50),
        email VARCHAR(255),
        identity_reference VARCHAR(100),
        reason TEXT NOT NULL,
        severity VARCHAR(20) DEFAULT 'high' NOT NULL,
        active_from TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        active_to TIMESTAMPTZ,
        approval_status VARCHAR(50) DEFAULT 'active' NOT NULL,
        created_by VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_vc_watchlist_org ON vc_watchlist(org_id);
      CREATE INDEX IF NOT EXISTS idx_vc_watchlist_mobile ON vc_watchlist(mobile);
    `);
    console.log('✓ vc_watchlist table & indexes verified');

    // 8. cm_obligations
    await client.query(`
      CREATE TABLE IF NOT EXISTS cm_obligations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id VARCHAR(100) NOT NULL,
        property_id VARCHAR(100),
        property_name VARCHAR(255),
        category VARCHAR(100) NOT NULL,
        subcategory VARCHAR(100),
        authority VARCHAR(255),
        requirement TEXT NOT NULL,
        frequency VARCHAR(50) NOT NULL,
        owner_id VARCHAR(100),
        owner_name VARCHAR(255),
        criticality VARCHAR(20) DEFAULT 'medium' NOT NULL,
        evidence_required BOOLEAN DEFAULT true NOT NULL,
        status VARCHAR(50) DEFAULT 'compliant' NOT NULL,
        next_due_date DATE,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_cm_obligations_org ON cm_obligations(org_id);
      CREATE INDEX IF NOT EXISTS idx_cm_obligations_category ON cm_obligations(category);
      CREATE INDEX IF NOT EXISTS idx_cm_obligations_status ON cm_obligations(status);
      CREATE INDEX IF NOT EXISTS idx_cm_obligations_due ON cm_obligations(next_due_date);
    `);
    console.log('✓ cm_obligations table & indexes verified');

    // 9. cm_schedules
    await client.query(`
      CREATE TABLE IF NOT EXISTS cm_schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        obligation_id UUID REFERENCES cm_obligations(id) ON DELETE CASCADE,
        due_date DATE NOT NULL,
        reminder_days INTEGER DEFAULT 15,
        recurrence_rule VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending' NOT NULL,
        extended_to DATE,
        extension_reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_cm_schedules_obligation ON cm_schedules(obligation_id);
      CREATE INDEX IF NOT EXISTS idx_cm_schedules_due ON cm_schedules(due_date);
    `);
    console.log('✓ cm_schedules table & indexes verified');

    // 10. cm_evidence
    await client.query(`
      CREATE TABLE IF NOT EXISTS cm_evidence (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        obligation_id UUID REFERENCES cm_obligations(id) ON DELETE CASCADE,
        document_name VARCHAR(255) NOT NULL,
        document_url TEXT NOT NULL,
        issue_date DATE,
        expiry_date DATE,
        verification_status VARCHAR(50) DEFAULT 'verified' NOT NULL,
        verified_by VARCHAR(255),
        verified_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_cm_evidence_obligation ON cm_evidence(obligation_id);
      CREATE INDEX IF NOT EXISTS idx_cm_evidence_expiry ON cm_evidence(expiry_date);
    `);
    console.log('✓ cm_evidence table & indexes verified');

    // 11. cm_inspections
    await client.query(`
      CREATE TABLE IF NOT EXISTS cm_inspections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id VARCHAR(100),
        property_name VARCHAR(255),
        asset_id VARCHAR(100),
        vendor_id VARCHAR(100),
        type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        scheduled_date DATE NOT NULL,
        conducted_date DATE,
        inspector_id VARCHAR(100),
        inspector_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'scheduled' NOT NULL,
        score NUMERIC(5,2),
        checklist JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_cm_inspections_property ON cm_inspections(property_id);
      CREATE INDEX IF NOT EXISTS idx_cm_inspections_status ON cm_inspections(status);
    `);
    console.log('✓ cm_inspections table & indexes verified');

    // 12. cm_findings
    await client.query(`
      CREATE TABLE IF NOT EXISTS cm_findings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        inspection_id UUID REFERENCES cm_inspections(id) ON DELETE CASCADE,
        category VARCHAR(100),
        severity VARCHAR(20) DEFAULT 'medium' NOT NULL,
        observation TEXT NOT NULL,
        location VARCHAR(255),
        photo_url TEXT,
        capa_id UUID,
        status VARCHAR(50) DEFAULT 'open' NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_cm_findings_inspection ON cm_findings(inspection_id);
      CREATE INDEX IF NOT EXISTS idx_cm_findings_status ON cm_findings(status);
    `);
    console.log('✓ cm_findings table & indexes verified');

    // 13. cm_incidents
    await client.query(`
      CREATE TABLE IF NOT EXISTS cm_incidents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id VARCHAR(100),
        property_name VARCHAR(255),
        location VARCHAR(255) NOT NULL,
        incident_type VARCHAR(100) NOT NULL,
        severity VARCHAR(20) DEFAULT 'medium' NOT NULL,
        occurred_at TIMESTAMPTZ NOT NULL,
        reported_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        reported_by VARCHAR(255),
        persons_involved TEXT,
        description TEXT NOT NULL,
        immediate_action TEXT,
        capa_id UUID,
        status VARCHAR(50) DEFAULT 'reported' NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_cm_incidents_property ON cm_incidents(property_id);
      CREATE INDEX IF NOT EXISTS idx_cm_incidents_severity ON cm_incidents(severity);
      CREATE INDEX IF NOT EXISTS idx_cm_incidents_status ON cm_incidents(status);
    `);
    console.log('✓ cm_incidents table & indexes verified');

    // 14. cm_capa
    await client.query(`
      CREATE TABLE IF NOT EXISTS cm_capa (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_type VARCHAR(50) NOT NULL,
        source_id VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        action_type VARCHAR(50) NOT NULL,
        action TEXT NOT NULL,
        owner_id VARCHAR(100),
        owner_name VARCHAR(255) NOT NULL,
        due_date DATE NOT NULL,
        priority VARCHAR(20) DEFAULT 'high' NOT NULL,
        evidence_url TEXT,
        verification_status VARCHAR(50) DEFAULT 'pending' NOT NULL,
        status VARCHAR(50) DEFAULT 'open' NOT NULL,
        closed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_cm_capa_status ON cm_capa(status);
      CREATE INDEX IF NOT EXISTS idx_cm_capa_due ON cm_capa(due_date);
    `);
    console.log('✓ cm_capa table & indexes verified');

    // 15. cm_permits
    await client.query(`
      CREATE TABLE IF NOT EXISTS cm_permits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id VARCHAR(100),
        property_name VARCHAR(255),
        permit_number VARCHAR(100) UNIQUE NOT NULL,
        vendor_id VARCHAR(100),
        contractor_name VARCHAR(255) NOT NULL,
        permit_type VARCHAR(100) NOT NULL,
        risk_controls TEXT,
        valid_from TIMESTAMPTZ NOT NULL,
        valid_to TIMESTAMPTZ NOT NULL,
        approver_id VARCHAR(100),
        approver_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'approved' NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_cm_permits_number ON cm_permits(permit_number);
      CREATE INDEX IF NOT EXISTS idx_cm_permits_status ON cm_permits(status);
    `);
    console.log('✓ cm_permits table & indexes verified');

    // 16. cm_risks
    await client.query(`
      CREATE TABLE IF NOT EXISTS cm_risks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id VARCHAR(100),
        property_name VARCHAR(255),
        category VARCHAR(100) NOT NULL,
        statement TEXT NOT NULL,
        likelihood INTEGER NOT NULL,
        impact INTEGER NOT NULL,
        inherent_score INTEGER NOT NULL,
        mitigation TEXT NOT NULL,
        residual_likelihood INTEGER,
        residual_impact INTEGER,
        residual_score INTEGER,
        owner_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active' NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_cm_risks_category ON cm_risks(category);
      CREATE INDEX IF NOT EXISTS idx_cm_risks_status ON cm_risks(status);
    `);
    console.log('✓ cm_risks table & indexes verified');

    // 17. cm_audit_findings
    await client.query(`
      CREATE TABLE IF NOT EXISTS cm_audit_findings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        audit_id VARCHAR(100) NOT NULL,
        property_name VARCHAR(255),
        severity VARCHAR(20) DEFAULT 'high' NOT NULL,
        finding TEXT NOT NULL,
        clause_reference VARCHAR(100),
        owner_name VARCHAR(255),
        due_date DATE,
        capa_id UUID,
        closure_status VARCHAR(50) DEFAULT 'open' NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_cm_audit_audit ON cm_audit_findings(audit_id);
      CREATE INDEX IF NOT EXISTS idx_cm_audit_status ON cm_audit_findings(closure_status);
    `);
    console.log('✓ cm_audit_findings table & indexes verified');

    // 18. vc_subscriptions
    await client.query(`
      CREATE TABLE IF NOT EXISTS vc_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id VARCHAR(100) NOT NULL,
        org_name VARCHAR(255) NOT NULL,
        plan_name VARCHAR(100) DEFAULT 'Commercial Pass' NOT NULL,
        billing_cycle VARCHAR(50) DEFAULT 'monthly' NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
        coupon_code VARCHAR(50),
        discount_amount NUMERIC(10,2) DEFAULT 0.00,
        razorpay_order_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        razorpay_signature TEXT,
        status VARCHAR(50) DEFAULT 'active' NOT NULL,
        starts_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        ends_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_vc_subs_org ON vc_subscriptions(org_id);
      CREATE INDEX IF NOT EXISTS idx_vc_subs_status ON vc_subscriptions(status);
    `);
    console.log('✓ vc_subscriptions table & indexes verified');

    // 19. vc_settings
    await client.query(`
      CREATE TABLE IF NOT EXISTS vc_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id VARCHAR(100) UNIQUE NOT NULL,
        visitor_types JSONB DEFAULT '["Guest", "Client", "Interview Candidate", "Contractor", "Vendor", "Delivery Partner", "VIP", "Emergency"]'::jsonb,
        access_zones JSONB DEFAULT '["Tower Lobby", "Floor 1 to 5", "Server Room", "Cafeteria", "Basement Parking", "Terrace"]'::jsonb,
        approval_rules JSONB DEFAULT '{"require_host_approval": true, "auto_approve_vip": true, "max_visit_hours": 8}'::jsonb,
        badge_template JSONB DEFAULT '{"theme": "dark", "show_qr": true, "show_photo": true, "show_zone": true}'::jsonb,
        notification_channels JSONB DEFAULT '{"email": true, "sms": true, "whatsapp": false}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_vc_settings_org ON vc_settings(org_id);
    `);
    console.log('✓ vc_settings table & indexes verified');

    // Baseline Seed for Demo/Default Organization
    console.log('\n--- Seeding Demo / Initial Data ---');
    const defaultOrgId = 'org_officex_demo';

    // Insert Default Settings
    await client.query(`
      INSERT INTO vc_settings (org_id)
      VALUES ($1)
      ON CONFLICT (org_id) DO NOTHING;
    `, [defaultOrgId]);

    // Insert Demo Active Subscription with coupon visitor001
    await client.query(`
      INSERT INTO vc_subscriptions (
        org_id, org_name, plan_name, billing_cycle, amount, coupon_code, discount_amount, status, starts_at, ends_at
      )
      VALUES (
        $1, 'CyberCity Commercial Towers', 'Commercial Pass', 'monthly', 0.00, 'visitor001', 999.00, 'active', NOW(), NOW() + INTERVAL '30 days'
      )
      ON CONFLICT DO NOTHING;
    `, [defaultOrgId]);

    // Insert Demo Visitors
    const vRes = await client.query(`
      INSERT INTO vc_visitors (org_id, visitor_type, name, company, mobile, email, status)
      VALUES 
        ($1, 'client', 'Vikram Malhotra', 'Apex Global Advisory', '+91 98201 11223', 'vikram.m@apexadvisory.com', 'active'),
        ($1, 'guest', 'Priya Sharma', 'KPMG Advisory', '+91 98112 33445', 'priya.sharma@kpmg.com', 'active'),
        ($1, 'contractor', 'Ramesh Kumar', 'Otis Elevator India', '+91 97110 55667', 'ramesh.k@otis.com', 'active'),
        ($1, 'interview', 'Ananya Deshmukh', 'Tech Mahindra', '+91 99887 76655', 'ananya.d@gmail.com', 'active'),
        ($1, 'vip', 'Siddharth Rao', 'Sequoia Capital India', '+91 98223 99887', 'siddharth@sequoia.com', 'active')
      ON CONFLICT DO NOTHING
      RETURNING id, name;
    `, [defaultOrgId]);

    // Insert sample visits if vc_visits is empty
    const checkVisits = await client.query(`SELECT COUNT(*) FROM vc_visits WHERE org_id = $1`, [defaultOrgId]);
    if (parseInt(checkVisits.rows[0].count, 10) === 0 && vRes.rows.length > 0) {
      const visitor1 = vRes.rows[0].id;
      const visitor2 = vRes.rows[1]?.id || visitor1;
      const visitor3 = vRes.rows[2]?.id || visitor1;

      // Active visit 1 (Checked In)
      const visit1 = await client.query(`
        INSERT INTO vc_visits (
          visitor_id, org_id, property_id, property_name, building_id, floor, zone_id,
          host_name, host_email, tenant_name, purpose, visit_start, visit_end,
          approval_status, status, checkin_at, risk_level, checkin_method
        ) VALUES (
          $1, $2, 'prop_01', 'CyberCity Tech Tower A', 'Tower 1', 'Floor 8', 'Executive Suite 801',
          'Arun Jaitley (Director)', 'arun@techcorp.in', 'TechCorp Solutions Ltd', 'Client Board Meeting',
          NOW() - INTERVAL '1 hour', NOW() + INTERVAL '3 hours',
          'approved', 'checked_in', NOW() - INTERVAL '45 minutes', 'low', 'kiosk'
        ) RETURNING id;
      `, [visitor1, defaultOrgId]);

      // Active pass for visit 1
      if (visit1.rows.length > 0) {
        await client.query(`
          INSERT INTO vc_access_passes (
            visit_id, pass_number, pass_type, qr_token, valid_from, valid_to, access_zones, status
          ) VALUES (
            $1, 'PASS-2026-0891', 'digital_qr', 'QR_VC_CYBER_2026_0891',
            NOW() - INTERVAL '1 hour', NOW() + INTERVAL '3 hours',
            '["Lobby Turnstile", "Tower A - Lift Bank 2", "Floor 8 East Wing"]'::jsonb, 'active'
          );
        `, [visit1.rows[0].id]);
      }

      // Visit 2 (Checked In - Inside)
      await client.query(`
        INSERT INTO vc_visits (
          visitor_id, org_id, property_id, property_name, building_id, floor, zone_id,
          host_name, host_email, tenant_name, purpose, visit_start, visit_end,
          approval_status, status, checkin_at, risk_level, checkin_method
        ) VALUES (
          $1, $2, 'prop_01', 'CyberCity Tech Tower A', 'Tower 1', 'Floor 4', 'Meeting Room 4B',
          'Neha Agarwal (HR Head)', 'neha@fintech.io', 'FinTech Innovations', 'Quarterly Financial Review',
          NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '2 hours',
          'approved', 'checked_in', NOW() - INTERVAL '20 minutes', 'low', 'reception'
        );
      `, [visitor2, defaultOrgId]);

      // Visit 3 (Contractor - Checked In)
      await client.query(`
        INSERT INTO vc_visits (
          visitor_id, org_id, property_id, property_name, building_id, floor, zone_id,
          host_name, host_email, tenant_name, purpose, visit_start, visit_end,
          approval_status, status, checkin_at, risk_level, checkin_method
        ) VALUES (
          $1, $2, 'prop_01', 'CyberCity Tech Tower A', 'Tower 1', 'Service Core', 'Lift Machine Room #3',
          'Rajesh Verma (FM Lead)', 'rajesh.fm@cybercity.com', 'Clean Asset FM Services', 'Elevator Periodic Safety Servicing',
          NOW() - INTERVAL '2 hours', NOW() + INTERVAL '2 hours',
          'approved', 'checked_in', NOW() - INTERVAL '1 hour 45 minutes', 'medium', 'guard'
        );
      `, [visitor3, defaultOrgId]);
    }

    // Insert sample compliance obligations
    const checkObligations = await client.query(`SELECT COUNT(*) FROM cm_obligations WHERE org_id = $1`, [defaultOrgId]);
    if (parseInt(checkObligations.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO cm_obligations (
          org_id, property_id, property_name, category, authority, requirement, frequency,
          owner_name, criticality, evidence_required, status, next_due_date
        ) VALUES 
          ($1, 'prop_01', 'CyberCity Tech Tower A', 'fire_safety', 'State Fire Service Dept', 'Form 15 Annual Fire Safety Certificate & Hydrant Inspection Renewal', 'annual', 'Rohan Mathur (EHS Officer)', 'critical', true, 'compliant', CURRENT_DATE + INTERVAL '64 days'),
          ($1, 'prop_01', 'CyberCity Tech Tower A', 'hvac_lift', 'Chief Electrical Inspector', 'Elevator & Lift License Bi-Annual Inspection Certificate for 8 Passenger Cars', 'half_yearly', 'Vikas Bansal (FM Engineer)', 'critical', true, 'due_soon', CURRENT_DATE + INTERVAL '12 days'),
          ($1, 'prop_01', 'CyberCity Tech Tower A', 'environmental', 'Pollution Control Board', 'Consent to Operate (CTO) & Sewage Treatment Plant Water Discharge Audit', 'quarterly', 'Suresh Nair (Ops Mgr)', 'high', true, 'compliant', CURRENT_DATE + INTERVAL '45 days'),
          ($1, 'prop_01', 'CyberCity Tech Tower A', 'statutory', 'Municipal Corporation', 'Structural Stability Audit Report & Grade A Glass Facade Sealant Inspection', 'annual', 'Rajesh Verma (FM Lead)', 'high', true, 'compliant', CURRENT_DATE + INTERVAL '120 days'),
          ($1, 'prop_01', 'CyberCity Tech Tower A', 'labor_law', 'Labour Commissioner', 'Contract Labour Regulation Act (CLRA) Monthly Statutory Wage & ESI/PF Audit', 'monthly', 'Pooja Chhabra (HR/Admin)', 'medium', true, 'due_soon', CURRENT_DATE + INTERVAL '5 days');
      `, [defaultOrgId]);
      console.log('✓ Compliance obligations seeded');
    }

    console.log('\n========================================');
    console.log('✓ All 19 Visitor & Compliance SaaS tables migrated successfully!');
    console.log('========================================\n');
  } catch (err) {
    console.error('Migration failed with error:', err);
    throw err;
  } finally {
    await client.end();
  }
}

migrateVisitorCompliance();
