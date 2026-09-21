import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function test() {
  console.log("Testing Supabase JS Client with URL:", supabaseUrl);
  try {
    const tables = ['properties', 'units', 'leases', 'tenants', 'users', 'profiles'];
    for (const t of tables) {
      const { data, error } = await supabase.from(t).select('*').limit(1);
      console.log(`Table ${t}:`, error ? error.message : `OK (${data?.length} rows)`);
    }
  } catch (err: any) {
    console.error("Fetch failed:", err);
  }
}

test();
