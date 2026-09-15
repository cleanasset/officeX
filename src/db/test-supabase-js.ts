import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function test() {
  console.log("Testing Supabase JS Client with URL:", supabaseUrl);
  try {
    const { data, error } = await supabase.from('properties').select('*').limit(5);
    if (error) {
      console.log("Supabase error:", error);
    } else {
      console.log("Supabase query successful! Properties count:", data?.length);
      console.log("Sample:", data);
    }
  } catch (err: any) {
    console.error("Fetch failed:", err);
  }
}

test();
