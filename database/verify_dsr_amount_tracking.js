// Script to verify the structure of dsr_amount_tracking table
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configure dotenv to load environment variables from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: `${__dirname}/../.env.local` });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing required environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Main function to verify table structure
async function verifyTableStructure() {
  console.log('🔍 Verifying dsr_amount_tracking table structure...');
  
  // Expected columns
  const expectedColumns = [
    'amount_lost_on_date', 'amount_lost_from_date', 'amount_lost_2024',
    'amount_frozen_on_date', 'amount_frozen_from_date', 'amount_frozen_2024',
    'amount_returned_on_date', 'amount_returned_from_date', 'amount_returned_2024',
    'report_date', 'district'
  ];

  try {
    // Get current table structure
    const { data: columns, error } = await supabase
      .rpc('get_table_columns', { table_name: 'dsr_amount_tracking' });

    if (error) {
      console.error('❌ Error fetching table structure:', error);
      return;
    }

    console.log('\n✅ Current table structure:');
    const existingColumns = columns.map(col => col.column_name);
    console.table(columns);

    // Check for missing columns
    const missingColumns = expectedColumns.filter(
      col => !existingColumns.includes(col)
    );

    if (missingColumns.length > 0) {
      console.log('\n❌ Missing columns:');
      console.log(missingColumns.join('\n'));
      
      console.log('\n💡 Run this SQL in Supabase SQL Editor to add missing columns:');
      console.log(`
        ALTER TABLE dsr_amount_tracking
        ${missingColumns.map(col => 
          `ADD COLUMN IF NOT EXISTS ${col} ${getColumnType(col)};`
        ).join('\n        ')}
      `);
    } else {
      console.log('\n✅ All expected columns exist in the table!');
      
      // Test insert/update if all columns exist
      await testInsertUpdate();
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

function getColumnType(columnName) {
  if (columnName.includes('date') && !columnName.includes('report_date')) {
    return 'DECIMAL(15,2) DEFAULT 0';
  } else if (columnName === 'report_date') {
    return 'DATE';
  } else if (columnName === 'district') {
    return 'VARCHAR(100)';
  }
  return 'DECIMAL(15,2) DEFAULT 0';
}

async function testInsertUpdate() {
  console.log('\n🧪 Testing insert/update functionality...');
  
  try {
    const testData = {
      report_date: '2024-01-01',
      district: 'Test District',
      amount_lost_on_date: 100.50,
      amount_frozen_on_date: 200.75,
      amount_returned_on_date: 50.25
    };

    // Test insert
    const { data: insertData, error: insertError } = await supabase
      .from('dsr_amount_tracking')
      .insert(testData)
      .select();

    if (insertError) throw insertError;
    
    console.log('✅ Test insert successful!');
    console.log('Inserted data:', insertData);

    // Test update
    const updateData = { amount_lost_on_date: 150.75 };
    const { data: updateDataResult, error: updateError } = await supabase
      .from('dsr_amount_tracking')
      .update(updateData)
      .eq('id', insertData[0].id)
      .select();

    if (updateError) throw updateError;
    
    console.log('✅ Test update successful!');
    console.log('Updated data:', updateDataResult);

    // Clean up test data
    const { error: deleteError } = await supabase
      .from('dsr_amount_tracking')
      .delete()
      .eq('id', insertData[0].id);

    if (!deleteError) {
      console.log('✅ Test data cleaned up successfully!');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the verification
verifyTableStructure().catch(console.error);
