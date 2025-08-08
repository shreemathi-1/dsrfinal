-- Migration to add missing columns to dsr_amount_tracking table
-- This script will add all required columns if they don't exist

-- First, check if the table exists
DO $$
BEGIN
    -- Check if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = 'dsr_amount_tracking') THEN
        
        -- Add all missing columns with proper data types and defaults
        -- Amount Lost columns
        ALTER TABLE dsr_amount_tracking 
            ADD COLUMN IF NOT EXISTS amount_lost_on_date DECIMAL(15,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS amount_lost_from_date DECIMAL(15,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS amount_lost_2024 DECIMAL(15,2) DEFAULT 0,
            
            -- Amount Frozen columns
            ADD COLUMN IF NOT EXISTS amount_frozen_on_date DECIMAL(15,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS amount_frozen_from_date DECIMAL(15,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS amount_frozen_2024 DECIMAL(15,2) DEFAULT 0,
            
            -- Amount Returned columns
            ADD COLUMN IF NOT EXISTS amount_returned_on_date DECIMAL(15,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS amount_returned_from_date DECIMAL(15,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS amount_returned_2024 DECIMAL(15,2) DEFAULT 0,
            
            -- Additional required columns
            ADD COLUMN IF NOT EXISTS report_date DATE,
            ADD COLUMN IF NOT EXISTS district VARCHAR(100);
            
        RAISE NOTICE 'Successfully added missing columns to dsr_amount_tracking table';
    ELSE
        RAISE NOTICE 'Table dsr_amount_tracking does not exist. Please create the table first.';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error adding columns: %', SQLERRM;
END $$;
