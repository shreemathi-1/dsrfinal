# URGENT FIX: Table 2 Database Schema Issue

## 🚨 Problem Analysis
The error `Could not find the 'amount_frozen_from_date' column of 'dsr_amount_tracking' in the schema cache` indicates that:

1. ✅ The `dsr_amount_tracking` table EXISTS in Supabase
2. ❌ The table is MISSING required columns that the code expects
3. 🔄 The Supabase schema cache doesn't match the actual table structure

## 🛠️ Immediate Solution

### Step 1: Apply Database Migration
Run this SQL in your **Supabase SQL Editor**:

```sql
-- Add missing columns to dsr_amount_tracking table
ALTER TABLE dsr_amount_tracking 
ADD COLUMN IF NOT EXISTS amount_lost_on_date DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_lost_from_date DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_lost_2024 DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_frozen_on_date DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_frozen_from_date DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_frozen_2024 DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_returned_on_date DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_returned_from_date DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_returned_2024 DECIMAL(15,2) DEFAULT 0;

-- Add other required columns if missing
ALTER TABLE dsr_amount_tracking 
ADD COLUMN IF NOT EXISTS report_date DATE,
ADD COLUMN IF NOT EXISTS district VARCHAR(100),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

### Step 2: Verify Schema
After running the SQL, verify the columns exist:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dsr_amount_tracking' 
ORDER BY ordinal_position;
```

Expected columns:
- ✅ `amount_lost_on_date`
- ✅ `amount_lost_from_date` 
- ✅ `amount_lost_2024`
- ✅ `amount_frozen_on_date`
- ✅ `amount_frozen_from_date` ← **This was missing!**
- ✅ `amount_frozen_2024`
- ✅ `amount_returned_on_date`
- ✅ `amount_returned_from_date`
- ✅ `amount_returned_2024`

### Step 3: Clear Supabase Cache
In Supabase Dashboard:
1. Go to **Settings** → **API**
2. Click **Reset API Schema Cache**
3. Wait for cache to refresh

### Step 4: Test Table 2
1. Refresh your application
2. Navigate to DSR Dashboard → Reports
3. Try editing Table 2 (Amount Lost, Frozen, Returned)
4. The save/edit should now work without errors

## 🔍 Root Cause
The `dsr_amount_tracking` table was created with a partial schema, missing the specific columns that the transformation functions expect. The code was trying to save data to columns that didn't exist in the database.

## 📋 Expected Result
After applying the fix:
- ✅ Table 2 save functionality works
- ✅ Table 2 edit functionality works  
- ✅ No more "column not found" errors
- ✅ Data persists correctly in database

## 🚨 If Issue Persists
If you still get errors after applying the migration:

1. **Check Supabase Logs**: Go to Supabase → Logs → API to see detailed error messages
2. **Verify RLS Policies**: Ensure Row Level Security policies allow your user to read/write
3. **Check User Authentication**: Ensure the user is properly authenticated with Supabase
4. **Test Direct Query**: Try running a direct SELECT query on the table in SQL Editor

## 📞 Quick Test Query
Run this in Supabase SQL Editor to test if the fix worked:

```sql
-- Test insert
INSERT INTO dsr_amount_tracking (
    report_date, 
    district, 
    amount_frozen_from_date,
    amount_lost_on_date
) VALUES (
    '2024-01-01', 
    'Test District', 
    1000.00,
    500.00
);

-- Verify insert worked
SELECT * FROM dsr_amount_tracking WHERE district = 'Test District';

-- Clean up test data
DELETE FROM dsr_amount_tracking WHERE district = 'Test District';
```

If this query works without errors, Table 2 should be fixed!
