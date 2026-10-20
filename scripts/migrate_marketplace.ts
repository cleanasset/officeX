import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('--- Migrating Marketplace Tables ---');

  // 1. marketplace_owners
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS marketplace_owners (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      company_name VARCHAR(255),
      contact_name VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(50),
      role_type VARCHAR(50) DEFAULT 'MARKETPLACE_OWNER' NOT NULL,
      operator_type VARCHAR(100) DEFAULT 'coworking_operator',
      status VARCHAR(50) DEFAULT 'active' NOT NULL,
      verified BOOLEAN DEFAULT false NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `);
  console.log('✓ marketplace_owners table created/verified');

  // 2. marketplace_listings
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS marketplace_listings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug VARCHAR(300) UNIQUE NOT NULL,
      name VARCHAR(500) NOT NULL,
      brand_name VARCHAR(200),
      vertical VARCHAR(50) NOT NULL,
      status VARCHAR(30) DEFAULT 'active' NOT NULL,
      city VARCHAR(100) NOT NULL,
      locality VARCHAR(200),
      micro_market VARCHAR(200),
      full_address TEXT,
      pincode VARCHAR(20),
      latitude VARCHAR(50),
      longitude VARCHAR(50),
      total_area_sqft INTEGER,
      total_seats INTEGER,
      building_grade VARCHAR(20) DEFAULT 'Grade A',
      building_type VARCHAR(100),
      furnishing_status VARCHAR(50),
      images JSONB DEFAULT '[]'::jsonb,
      featured_image TEXT,
      amenities JSONB DEFAULT '[]'::jsonb,
      pricing_plans JSONB DEFAULT '{}'::jsonb,
      starting_price DECIMAL(12, 2),
      starting_price_unit VARCHAR(50),
      description TEXT,
      operating_hours JSONB DEFAULT '{}'::jsonb,
      avg_rating DECIMAL(3, 2) DEFAULT 4.50,
      total_reviews INTEGER DEFAULT 0,
      nearest_metro VARCHAR(200),
      metro_distance VARCHAR(100),
      consultant_name VARCHAR(150),
      consultant_phone VARCHAR(50),
      source VARCHAR(50) DEFAULT 'scraped_myhq',
      source_url TEXT,
      marketplace_owner_id UUID REFERENCES marketplace_owners(id),
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `);
  console.log('✓ marketplace_listings table created/verified');

  // Indexes
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_marketplace_listings_city ON marketplace_listings(city);`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_marketplace_listings_vertical ON marketplace_listings(vertical);`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings(status);`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_marketplace_listings_slug ON marketplace_listings(slug);`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_marketplace_listings_brand ON marketplace_listings(brand_name);`);
  console.log('✓ marketplace_listings indexes created');

  // 3. marketplace_enquiries
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS marketplace_enquiries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      listing_id UUID REFERENCES marketplace_listings(id),
      listing_name VARCHAR(500),
      seeker_name VARCHAR(255) NOT NULL,
      seeker_email VARCHAR(255) NOT NULL,
      seeker_phone VARCHAR(50) NOT NULL,
      company_name VARCHAR(255),
      seats_required INTEGER,
      move_in_date VARCHAR(50),
      budget VARCHAR(100),
      vertical VARCHAR(50),
      city VARCHAR(100),
      status VARCHAR(50) DEFAULT 'new' NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `);
  console.log('✓ marketplace_enquiries table created/verified');

  // 4. marketplace_site_visits
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS marketplace_site_visits (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      enquiry_id UUID REFERENCES marketplace_enquiries(id),
      listing_id UUID REFERENCES marketplace_listings(id),
      visitor_name VARCHAR(255) NOT NULL,
      visitor_email VARCHAR(255),
      visitor_phone VARCHAR(50),
      scheduled_date VARCHAR(50) NOT NULL,
      scheduled_time VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'scheduled' NOT NULL,
      host_name VARCHAR(200),
      feedback TEXT,
      rating INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `);
  console.log('✓ marketplace_site_visits table created/verified');

  // 5. marketplace_deals
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS marketplace_deals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      enquiry_id UUID REFERENCES marketplace_enquiries(id),
      listing_id UUID REFERENCES marketplace_listings(id),
      client_name VARCHAR(255) NOT NULL,
      deal_stage VARCHAR(50) DEFAULT 'inquiry' NOT NULL,
      deal_value DECIMAL(14, 2),
      commission_rate DECIMAL(5, 2) DEFAULT 10.00,
      commission_amount DECIMAL(12, 2),
      target_move_in DATE,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `);
  console.log('✓ marketplace_deals table created/verified');

  console.log('\nAll marketplace tables successfully migrated!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
