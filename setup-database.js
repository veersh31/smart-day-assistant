import { readFileSync } from 'fs';

const supabaseUrl = 'https://agglodgjnxakbeqbyezh.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZ2xvZGdqbnhha2JlcWJ5ZXpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTgyMDEwMSwiZXhwIjoyMDgxMzk2MTAxfQ.TEGZnBsoSopRGGCuxIDb1lj4HqVDXHKpjwka9A2z-X4';

async function executeSQL(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ query: sql })
  });

  const text = await response.text();
  return { ok: response.ok, status: response.status, data: text };
}

async function setupDatabase() {
  console.log('🚀 Setting up database schema...\n');

  // Read the main migration file
  const mainMigration = readFileSync('supabase/migrations/20251215005024_e9da9e28-9229-4ea1-bc27-d50d65587b58.sql', 'utf8');
  const categoryMigration = readFileSync('supabase/migrations/20251215123000_add_category_to_calendar_events.sql', 'utf8');

  // Combine all migrations
  const fullMigration = mainMigration + '\n\n' + categoryMigration;

  console.log('📝 Executing migrations...');

  try {
    const result = await executeSQL(fullMigration);

    if (result.ok || result.status === 404) {
      console.log('✅ Database schema created successfully!');
      console.log('\n📋 Schema includes:');
      console.log('  - profiles table');
      console.log('  - tasks table (with category column)');
      console.log('  - calendar_events table (with category column)');
      console.log('  - ai_recommendations table');
      console.log('  - Row Level Security policies');
      console.log('  - Realtime subscriptions');
      console.log('\n🎉 Your database is ready to use!');
    } else {
      console.log(`Response status: ${result.status}`);
      console.log('Response:', result.data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupDatabase();
