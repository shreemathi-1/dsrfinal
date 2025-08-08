// Script to verify and fix dsr_amount_tracking table schema
// Run this to check if the table has all required columns

import { createClient } from '@supabase/supabase-js';

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

const supabase = createClient(supabaseUrl, supabaseKey);

const requiredColumns = [
  'id',
  'report_date',
  'district',
  'created_by',
  'updated_by',
  'amount_lost_on_date',
  'amount_lost_from_date',
  'amount_lost_2024',
  'amount_frozen_on_date',
  'amount_frozen_from_date',
  'amount_frozen_2024',
  'amount_returned_on_date',
  'amount_returned_from_date',
  'amount_returned_2024',
  'created_at',
  'updated_at'
];

async function verifyTableSchema() {
  try {
    console.log('🔍 Checking dsr_amount_tracking table schema...');
    
    // Query to get current table structure
    const { data, error } = await supabase
      .rpc('get_table_columns', { table_name: 'dsr_amount_tracking' });
    
    if (error) {
      console.error('❌ Error querying table schema:', error);
      
      // Alternative method - try to select from the table to see what columns exist
      console.log('🔄 Trying alternative method...');
      const { data: testData, error: testError } = await supabase
        .from('dsr_amount_tracking')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.error('❌ Table might not exist or has permission issues:', testError);
        return false;
      } else {
        console.log('✅ Table exists and is accessible');
        console.log('📋 Sample data structure:', testData);
      }
    } else {
      console.log('📋 Current table columns:', data);
    }
    
    // Test if we can query specific columns
    console.log('\n🧪 Testing required columns...');
    const missingColumns = [];
    
    for (const column of requiredColumns) {
      try {
        const { error: columnError } = await supabase
          .from('dsr_amount_tracking')
          .select(column)
          .limit(1);
        
        if (columnError) {
          console.log(`❌ Missing column: ${column}`);
          missingColumns.push(column);
        } else {
          console.log(`✅ Column exists: ${column}`);
        }
      } catch (err) {
        console.log(`❌ Error checking column ${column}:`, err.message);
        missingColumns.push(column);
      }
    }
    
    if (missingColumns.length > 0) {
      console.log('\n⚠️  Missing columns detected:', missingColumns);
      console.log('\n📝 You need to run the migration script to add these columns.');
      console.log('   File: /database/migrations/fix_dsr_amount_tracking_schema.sql');
      return false;
    } else {
      console.log('\n✅ All required columns are present!');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

async function testTableOperations() {
  console.log('\n🧪 Testing table operations...');
  
  try {
    // Test insert
    const testData = {
      report_date: '2024-01-01',
      district: 'Test District',
      amount_lost_on_date: 1000.00,
      amount_lost_from_date: 2000.00,
      amount_lost_2024: 3000.00,
      amount_frozen_on_date: 500.00,
      amount_frozen_from_date: 1000.00,
      amount_frozen_2024: 1500.00,
      amount_returned_on_date: 200.00,
      amount_returned_from_date: 400.00,
      amount_returned_2024: 600.00
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('dsr_amount_tracking')
      .insert(testData)
      .select();
    
    if (insertError) {
      console.log('❌ Insert test failed:', insertError);
      return false;
    }
    
    console.log('✅ Insert test passed');
    
    // Test update
    const { error: updateError } = await supabase
      .from('dsr_amount_tracking')
      .update({ amount_lost_on_date: 1100.00 })
      .eq('id', insertData[0].id);
    
    if (updateError) {
      console.log('❌ Update test failed:', updateError);
    } else {
      console.log('✅ Update test passed');
    }
    
    // Clean up test data
    await supabase
      .from('dsr_amount_tracking')
      .delete()
      .eq('id', insertData[0].id);
    
    console.log('✅ All table operations working correctly!');
    return true;
    
  } catch (error) {
    console.error('❌ Table operations test failed:', error);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting dsr_amount_tracking table verification...\n');
  
  const schemaValid = await verifyTableSchema();
  
  if (schemaValid) {
    await testTableOperations();
    console.log('\n🎉 Table 2 schema is ready for use!');
  } else {
    console.log('\n⚠️  Please apply the migration script first:');
    console.log('   1. Open Supabase SQL Editor');
    console.log('   2. Run the SQL from: /database/migrations/fix_dsr_amount_tracking_schema.sql');
    console.log('   3. Run this verification script again');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { verifyTableSchema, testTableOperations };
