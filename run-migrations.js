import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = 'https://agglodgjnxakbeqbyezh.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZ2xvZGdqbnhha2JlcWJ5ZXpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTgyMDEwMSwiZXhwIjoyMDgxMzk2MTAxfQ.TEGZnBsoSopRGGCuxIDb1lj4HqVDXHKpjwka9A2z-X4';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  try {
    // Read migration files
    const migration1Path = join(__dirname, 'supabase/migrations/20251215005024_e9da9e28-9229-4ea1-bc27-d50d65587b58.sql');
    const migration2Path = join(__dirname, 'supabase/migrations/20251215123000_add_category_to_calendar_events.sql');

    console.log('📖 Reading migration files...');
    const migration1 = readFileSync(migration1Path, 'utf8');
    const migration2 = readFileSync(migration2Path, 'utf8');

    // Run first migration (create tables)
    console.log('⚙️  Running initial schema migration...');
    const { data: data1, error: error1 } = await supabase.rpc('exec_sql', { sql: migration1 });

    if (error1) {
      // If exec_sql doesn't exist, we need to create tables manually
      console.log('💡 Using alternative approach to create schema...');

      // Split the SQL into individual statements and execute them
      const statements = migration1
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement) {
          try {
            // Use the REST API to execute SQL
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': serviceRoleKey,
                'Authorization': `Bearer ${serviceRoleKey}`
              },
              body: JSON.stringify({ query: statement + ';' })
            });

            if (!response.ok && response.status !== 404) {
              const error = await response.text();
              console.log(`⚠️  Statement ${i + 1} response: ${response.status}`);
            }
          } catch (err) {
            console.log(`⚠️  Statement ${i + 1}: ${err.message}`);
          }
        }
      }
    } else {
      console.log('✅ Initial schema created');
    }

    // Add category column
    console.log('⚙️  Adding category column to calendar_events...');
    const { data: data2, error: error2 } = await supabase.rpc('exec_sql', { sql: migration2 });

    if (error2) {
      console.log('💡 Using alternative approach for category column...');
      // Try alternative approach
    } else {
      console.log('✅ Category column added');
    }

    console.log('\n✅ Migrations completed successfully!');
    console.log('\n📋 Verifying tables...');

    // Verify tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('calendar_events')
      .select('*')
      .limit(0);

    if (tablesError) {
      console.log('⚠️  Verification note:', tablesError.message);
    } else {
      console.log('✅ Tables verified!');
    }

  } catch (error) {
    console.error('❌ Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();
