import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configure environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: `${__dirname}/../.env.local` });

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Expected columns
const expectedColumns = [
  'case_registered_today', 'case_registered_2024',
  'charge_sheet_filed_today', 'charge_sheet_filed_2024',
  'charge_sheet_taken_on_file_today', 'charge_sheet_taken_on_file_2024',
  'final_report_filed_today', 'final_report_filed_2024',
  'final_report_taken_on_file_today', 'final_report_taken_on_file_2024',
  'cases_charge_sheeted_today', 'cases_charge_sheeted_2024',
  'cases_convicted_today', 'cases_convicted_2024',
  'cases_acquitted_today', 'cases_acquitted_2024',
  'cases_compounded_today', 'cases_compounded_2024',
  'cases_withdrawn_today', 'cases_withdrawn_2024',
  'cases_transferred_today', 'cases_transferred_2024',
  'cases_pending_trial_today', 'cases_pending_trial_2024',
  'cases_pending_investigation_today', 'cases_pending_investigation_2024'
];

async function verifyTableStructure() {
  console.log('🔍 Verifying dsr_case_stages table structure...');
  
  try {
    // 1. Check if table exists
    const { data: tableExists } = await supabase
      .rpc('table_exists', { table_name: 'dsr_case_stages' })
      .single();

    if (!tableExists) {
      console.error('❌ Table dsr_case_stages does not exist');
      return;
    }

    // 2. Get current columns
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'dsr_case_stages');

    if (error) throw error;

    console.log('\n✅ Table exists. Current columns:');
    console.table(columns);

    // 3. Check for missing columns
    const missingColumns = expectedColumns.filter(
      col => !columns.some(c => c.column_name === col)
    );

    if (missingColumns.length > 0) {
      console.error('\n❌ Missing columns:');
      console.log(missingColumns.join('\n'));
      
      console.log('\n💡 Run the migration script to add missing columns:');
      console.log('node database/scripts/run-migration.js 20240721_fix_dsr_case_stages_schema.sql');
      return;
    }

    console.log('\n✅ All required columns exist');
    await testTableOperations();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.details) console.error('Details:', error.details);
    if (error.hint) console.error('Hint:', error.hint);
  }
}

async function testTableOperations() {
  console.log('\n🧪 Testing table operations...');
  
  try {
    const testUserId = process.env.TEST_USER_ID || (await supabase.auth.getUser()).data.user.id;
    const testDate = new Date().toISOString().split('T')[0];
    
    // Test data
    const testData = {
      report_date: testDate,
      created_by: testUserId,
      updated_by: testUserId,
      district: 'Test District',
      case_registered_today: 5,
      case_registered_2024: 100,
      charge_sheet_filed_today: 3,
      charge_sheet_filed_2024: 75,
      // Add more test data as needed
    };

    // Test insert
    console.log('\nTesting insert...');
    const { data: insertData, error: insertError } = await supabase
      .from('dsr_case_stages')
      .insert(testData)
      .select();

    if (insertError) throw insertError;
    console.log('✅ Insert successful:', insertData[0]);

    // Test update
    console.log('\nTesting update...');
    const updateData = { case_registered_today: 6 };
    const { data: updateDataResult, error: updateError } = await supabase
      .from('dsr_case_stages')
      .update(updateData)
      .eq('id', insertData[0].id)
      .select();

    if (updateError) throw updateError;
    console.log('✅ Update successful:', updateDataResult[0]);

    // Clean up
    console.log('\nCleaning up test data...');
    const { error: deleteError } = await supabase
      .from('dsr_case_stages')
      .delete()
      .eq('id', insertData[0].id);

    if (!deleteError) {
      console.log('✅ Test data cleaned up');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.details) console.error('Details:', error.details);
  }
}

// Run the verification
async function main() {
  // Create table_exists function if it doesn't exist
  const { error } = await supabase.rpc('create_table_exists_function');
  if (error && !error.message.includes('already exists')) {
    console.error('Error creating table_exists function:', error);
    return;
  }
  
  await verifyTableStructure();
}

main().catch(console.error);
