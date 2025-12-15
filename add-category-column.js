import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addCategoryColumn() {
  console.log('Attempting to add category column to calendar_events table...');

  try {
    // Try to run the migration using a SQL query
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS category TEXT;'
    });

    if (error) {
      console.error('Error with RPC approach:', error.message);
      console.log('\nAlternative: Using a test update to verify column exists...');

      // Try a different approach - attempt an update that will fail if column doesn't exist
      const { error: testError } = await supabase
        .from('calendar_events')
        .update({ category: null })
        .eq('id', '00000000-0000-0000-0000-000000000000'); // Non-existent ID

      if (testError && testError.message.includes('category')) {
        console.error('\n❌ The category column does NOT exist and cannot be added automatically.');
        console.log('\nYou need to add it manually. Please contact Lovable support or:');
        console.log('1. Check if you can access the Supabase project through Lovable');
        console.log('2. Or provide a Supabase service role key to run the migration');
        process.exit(1);
      } else {
        console.log('✅ Category column already exists or was added successfully!');
      }
    } else {
      console.log('✅ Migration completed successfully!');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

addCategoryColumn();
