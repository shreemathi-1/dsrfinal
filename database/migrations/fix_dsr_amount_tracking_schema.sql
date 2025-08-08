-- Migration to fix dsr_amount_tracking table schema
-- This adds missing columns that the code expects

-- First, let's check what columns currently exist
-- You can run this query in Supabase SQL editor to see current structure:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'dsr_amount_tracking';

-- Add missing columns if they don't exist
-- Amount Lost columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsr_amount_tracking' AND column_name = 'amount_lost_on_date') THEN
        ALTER TABLE dsr_amount_tracking ADD COLUMN amount_lost_on_date DECIMAL(15,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsr_amount_tracking' AND column_name = 'amount_lost_from_date') THEN
        ALTER TABLE dsr_amount_tracking ADD COLUMN amount_lost_from_date DECIMAL(15,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsr_amount_tracking' AND column_name = 'amount_lost_2024') THEN
        ALTER TABLE dsr_amount_tracking ADD COLUMN amount_lost_2024 DECIMAL(15,2) DEFAULT 0;
    END IF;
END $$;

-- Amount Frozen columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsr_amount_tracking' AND column_name = 'amount_frozen_on_date') THEN
        ALTER TABLE dsr_amount_tracking ADD COLUMN amount_frozen_on_date DECIMAL(15,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsr_amount_tracking' AND column_name = 'amount_frozen_from_date') THEN
        ALTER TABLE dsr_amount_tracking ADD COLUMN amount_frozen_from_date DECIMAL(15,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsr_amount_tracking' AND column_name = 'amount_frozen_2024') THEN
        ALTER TABLE dsr_amount_tracking ADD COLUMN amount_frozen_2024 DECIMAL(15,2) DEFAULT 0;
    END IF;
END $$;

-- Amount Returned columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsr_amount_tracking' AND column_name = 'amount_returned_on_date') THEN
        ALTER TABLE dsr_amount_tracking ADD COLUMN amount_returned_on_date DECIMAL(15,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsr_amount_tracking' AND column_name = 'amount_returned_from_date') THEN
        ALTER TABLE dsr_amount_tracking ADD COLUMN amount_returned_from_date DECIMAL(15,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsr_amount_tracking' AND column_name = 'amount_returned_2024') THEN
        ALTER TABLE dsr_amount_tracking ADD COLUMN amount_returned_2024 DECIMAL(15,2) DEFAULT 0;
    END IF;
END $$;

-- Add other required columns if missing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsr_amount_tracking' AND column_name = 'report_date') THEN
        ALTER TABLE dsr_amount_tracking ADD COLUMN report_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsr_amount_tracking' AND column_name = 'district') THEN
        ALTER TABLE dsr_amount_tracking ADD COLUMN district VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsr_amount_tracking' AND column_name = 'created_by') THEN
        ALTER TABLE dsr_amount_tracking ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsr_amount_tracking' AND column_name = 'updated_by') THEN
        ALTER TABLE dsr_amount_tracking ADD COLUMN updated_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsr_amount_tracking' AND column_name = 'created_at') THEN
        ALTER TABLE dsr_amount_tracking ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dsr_amount_tracking' AND column_name = 'updated_at') THEN
        ALTER TABLE dsr_amount_tracking ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Create indexes if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'dsr_amount_tracking' AND indexname = 'idx_dsr_amount_tracking_date') THEN
        CREATE INDEX idx_dsr_amount_tracking_date ON dsr_amount_tracking(report_date);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'dsr_amount_tracking' AND indexname = 'idx_dsr_amount_tracking_district') THEN
        CREATE INDEX idx_dsr_amount_tracking_district ON dsr_amount_tracking(district);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'dsr_amount_tracking' AND indexname = 'idx_dsr_amount_tracking_user') THEN
        CREATE INDEX idx_dsr_amount_tracking_user ON dsr_amount_tracking(created_by);
    END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE dsr_amount_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (will not error if they already exist)
DO $$ 
BEGIN
    -- Drop existing policies if they exist and recreate them
    DROP POLICY IF EXISTS "Users can view their own records" ON dsr_amount_tracking;
    DROP POLICY IF EXISTS "Users can insert their own records" ON dsr_amount_tracking;
    DROP POLICY IF EXISTS "Users can update their own records" ON dsr_amount_tracking;
    DROP POLICY IF EXISTS "Users can delete their own records" ON dsr_amount_tracking;
    
    -- Create new policies
    CREATE POLICY "Users can view their own records" ON dsr_amount_tracking
        FOR SELECT USING (auth.uid() = created_by);

    CREATE POLICY "Users can insert their own records" ON dsr_amount_tracking
        FOR INSERT WITH CHECK (auth.uid() = created_by);

    CREATE POLICY "Users can update their own records" ON dsr_amount_tracking
        FOR UPDATE USING (auth.uid() = created_by);

    CREATE POLICY "Users can delete their own records" ON dsr_amount_tracking
        FOR DELETE USING (auth.uid() = created_by);
END $$;

-- Create or replace the update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_dsr_amount_tracking_updated_at') THEN
        CREATE TRIGGER update_dsr_amount_tracking_updated_at 
            BEFORE UPDATE ON dsr_amount_tracking 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Verify the schema after migration
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'dsr_amount_tracking' 
ORDER BY ordinal_position;
