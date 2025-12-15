import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://agglodgjnxakbeqbyezh.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZ2xvZGdqbnhha2JlcWJ5ZXpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTgyMDEwMSwiZXhwIjoyMDgxMzk2MTAxfQ.TEGZnBsoSopRGGCuxIDb1lj4HqVDXHKpjwka9A2z-X4';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verifyAndCreateTables() {
  console.log('🔍 Checking if tables exist...\n');

  // Try to query calendar_events
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .limit(1);

  if (error) {
    console.log('❌ Tables do not exist:', error.message);
    console.log('\n📝 Creating tables using SQL Editor API...\n');

    // Read migrations
    const mainMigration = readFileSync('supabase/migrations/20251215005024_e9da9e28-9229-4ea1-bc27-d50d65587b58.sql', 'utf8');
    const categoryMigration = readFileSync('supabase/migrations/20251215123000_add_category_to_calendar_events.sql', 'utf8');

    // Combine migrations
    const fullSQL = mainMigration + '\n\n' + categoryMigration;

    // Use Supabase's query endpoint
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'X-Supabase-Query': fullSQL
        }
      });

      console.log('Response status:', response.status);

      // Alternative: Use pg connection string approach
      console.log('\n⚠️  The RPC approach may not work. You need to run the SQL manually.');
      console.log('\n📋 Please do the following:');
      console.log('1. Go to: https://supabase.com/dashboard/project/agglodgjnxakbeqbyezh/sql/new');
      console.log('2. Copy the contents of: supabase/migrations/20251215005024_e9da9e28-9229-4ea1-bc27-d50d65587b58.sql');
      console.log('3. Paste and run it in the SQL editor');
      console.log('4. Then copy and run: supabase/migrations/20251215123000_add_category_to_calendar_events.sql');
      console.log('\nOr provide your database password so I can use psql directly.');

    } catch (err) {
      console.error('Error:', err.message);
    }

  } else {
    console.log('✅ Tables exist and are accessible!');
  }
}

verifyAndCreateTables();
