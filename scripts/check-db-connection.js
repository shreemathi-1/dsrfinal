import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: `${__dirname}/../.env.local` });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    
    // 1. Test connection by fetching tables
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (tablesError) throw tablesError;
    console.log('✅ Connected to Supabase. Available tables:', tables.map(t => t.tablename));

    // 2. Check if dsr_case_stages table exists
    const tableName = 'dsr_case_stages';
    const tableExists = tables.some(t => t.tablename === tableName);
    
    if (!tableExists) {
      console.error(`❌ Table '${tableName}' does not exist`);
      return;
    }

    console.log(`✅ Table '${tableName}' exists`);

    // 3. Check table structure
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', tableName);

    if (columnsError) throw columnsError;
    
    console.log(`\n📋 Table '${tableName}' structure:`);
    console.table(columns);

    // 4. Try to insert a test record
    console.log('\n🧪 Testing insert operation...');
    const testData = {
      report_date: new Date().toISOString().split('T')[0],
      created_by: (await supabase.auth.getUser()).data.user?.id || '00000000-0000-0000-0000-000000000000',
      district: 'Test District',
      case_registered_today: 1,
      case_registered_2024: 1,
      charge_sheet_filed_today: 0,
      charge_sheet_filed_2024: 0,
      // Add other required fields with default values
      updated_by: (await supabase.auth.getUser()).data.user?.id || '00000000-0000-0000-0000-000000000000'
    };

    const { data: insertData, error: insertError } = await supabase
      .from(tableName)
      .insert([testData])
      .select();

    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
    } else {
      console.log('✅ Insert test successful:', insertData);
      
      // Clean up test data
      if (insertData && insertData[0]?.id) {
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq('id', insertData[0].id);
          
        if (!deleteError) {
          console.log('✅ Test data cleaned up');
        }
      }
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
    
    // Check if it's a JWT error
    if (error.message.includes('JWT')) {
      console.error('\n🔑 Authentication error: Please check your Supabase service role key');
      console.error('Make sure you have set SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
    }
    
    // Check if it's a connection error
    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      console.error('\n🔌 Connection error: Could not connect to Supabase');
      console.error('Please check your internet connection and Supabase URL');
    }
  }
}

// Run the check
checkDatabase();
