-- ============================================================================
-- OFFICEX Rent Roll — Row Level Security (RLS) Policy Framework
-- Specifications: §4.3 (RLS Anchor), §4.4 (Operator Multi-Tenancy), §5.10
-- NOTE: Structured framework only. Do NOT enable in production until
-- session context middleware (app.current_org_id) is activated.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ARCHITECTURAL OVERVIEW
-- ----------------------------------------------------------------------------
-- The Rent Roll SaaS enforces a 2-tier multi-tenant security architecture:
--
-- Level 1: Organization Isolation (Subscriber Org Boundary)
--   Every query is constrained to rows matching `app.current_org_id`.
--   Users from Org A can NEVER read or modify rows from Org B.
--
-- Level 2: Client Account Portfolio Isolation (Managed Portfolio Boundary)
--   Within an organization, users may be assigned to specific client accounts.
--   - Single-owner subscribers (is_self = true) have full access to all properties.
--   - For managed portfolios, Client Principal users only see rows where:
--       client_account_id = app.current_client_account_id
--     or where client_account_id IS NULL (portfolio-wide config like charge_type).
--
-- Level 3: Soft-Delete Integrity
--   Rows with `deleted_at IS NOT NULL` are excluded from standard views.

-- ----------------------------------------------------------------------------
-- 2. HELPER FUNCTIONS FOR SESSION CONTEXT
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION current_app_org_id() 
RETURNS uuid AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_org_id', true), '')::uuid;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION current_app_client_account_id() 
RETURNS uuid AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_client_account_id', true), '')::uuid;
END;
$$ LANGUAGE plpgsql STABLE;

-- ----------------------------------------------------------------------------
-- 3. RLS ENABLEMENT & POLICIES TEMPLATE FOR ALL 13 P0 TABLES
-- ----------------------------------------------------------------------------

-- TABLE 1: organization
-- ALTER TABLE "organization" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY organization_isolation_policy ON "organization"
--   FOR ALL
--   USING (id = current_app_org_id());

-- TABLE 2: client_account
-- ALTER TABLE "client_account" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY client_account_org_isolation ON "client_account"
--   FOR ALL
--   USING (
--     org_id = current_app_org_id() 
--     AND (deleted_at IS NULL)
--     AND (
--       current_app_client_account_id() IS NULL 
--       OR is_self = true 
--       OR id = current_app_client_account_id()
--     )
--   );

-- TABLE 3: property
-- ALTER TABLE "property" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY property_org_isolation ON "property"
--   FOR ALL
--   USING (
--     org_id = current_app_org_id()
--     AND (deleted_at IS NULL)
--     AND (
--       current_app_client_account_id() IS NULL
--       OR client_account_id = current_app_client_account_id()
--     )
--   );

-- TABLE 4: building
-- ALTER TABLE "building" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY building_org_isolation ON "building"
--   FOR ALL
--   USING (
--     org_id = current_app_org_id()
--     AND (deleted_at IS NULL)
--     AND (
--       current_app_client_account_id() IS NULL
--       OR client_account_id = current_app_client_account_id()
--     )
--   );

-- TABLE 5: space
-- ALTER TABLE "space" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY space_org_isolation ON "space"
--   FOR ALL
--   USING (
--     org_id = current_app_org_id()
--     AND (deleted_at IS NULL)
--     AND (
--       current_app_client_account_id() IS NULL
--       OR client_account_id = current_app_client_account_id()
--     )
--   );

-- TABLE 6: occupant
-- ALTER TABLE "occupant" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY occupant_org_isolation ON "occupant"
--   FOR ALL
--   USING (
--     org_id = current_app_org_id()
--     AND (deleted_at IS NULL)
--     AND (
--       client_account_id IS NULL
--       OR current_app_client_account_id() IS NULL
--       OR client_account_id = current_app_client_account_id()
--     )
--   );

-- TABLE 7: contract
-- ALTER TABLE "contract" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY contract_org_isolation ON "contract"
--   FOR ALL
--   USING (
--     org_id = current_app_org_id()
--     AND (deleted_at IS NULL)
--     AND (
--       current_app_client_account_id() IS NULL
--       OR client_account_id = current_app_client_account_id()
--     )
--   );

-- TABLE 8: contract_space
-- ALTER TABLE "contract_space" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY contract_space_org_isolation ON "contract_space"
--   FOR ALL
--   USING (
--     org_id = current_app_org_id()
--     AND (deleted_at IS NULL)
--     AND (
--       current_app_client_account_id() IS NULL
--       OR client_account_id = current_app_client_account_id()
--     )
--   );

-- TABLE 9: charge_type (Config Table)
-- ALTER TABLE "charge_type" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY charge_type_org_isolation ON "charge_type"
--   FOR ALL
--   USING (
--     org_id = current_app_org_id()
--     AND (deleted_at IS NULL)
--   );

-- TABLE 10: tax_profile (Config Table)
-- ALTER TABLE "tax_profile" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY tax_profile_org_isolation ON "tax_profile"
--   FOR ALL
--   USING (
--     org_id = current_app_org_id()
--     AND (deleted_at IS NULL)
--   );

-- TABLE 11: billing_entity
-- ALTER TABLE "billing_entity" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY billing_entity_org_isolation ON "billing_entity"
--   FOR ALL
--   USING (
--     org_id = current_app_org_id()
--     AND (deleted_at IS NULL)
--     AND (
--       client_account_id IS NULL
--       OR current_app_client_account_id() IS NULL
--       OR client_account_id = current_app_client_account_id()
--     )
--   );

-- TABLE 12: management_mandate
-- ALTER TABLE "management_mandate" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY management_mandate_org_isolation ON "management_mandate"
--   FOR ALL
--   USING (
--     org_id = current_app_org_id()
--     AND (deleted_at IS NULL)
--     AND (
--       current_app_client_account_id() IS NULL
--       OR client_account_id = current_app_client_account_id()
--     )
--   );

-- TABLE 13: deal
-- ALTER TABLE "deal" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY deal_org_isolation ON "deal"
--   FOR ALL
--   USING (
--     org_id = current_app_org_id()
--     AND (deleted_at IS NULL)
--     AND (
--       current_app_client_account_id() IS NULL
--       OR client_account_id = current_app_client_account_id()
--     )
--   );
