-- Migration to add missing columns to dsr_case_stages table
DO $$
BEGIN
    -- Check if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = 'dsr_case_stages') THEN
        
        -- Add all missing columns for case stages
        ALTER TABLE dsr_case_stages 
            -- Case Registration
            ADD COLUMN IF NOT EXISTS case_registered_today INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS case_registered_2024 INTEGER DEFAULT 0,
            
            -- Charge Sheet Filed
            ADD COLUMN IF NOT EXISTS charge_sheet_filed_today INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS charge_sheet_filed_2024 INTEGER DEFAULT 0,
            
            -- Charge Sheet Taken on File
            ADD COLUMN IF NOT EXISTS charge_sheet_taken_on_file_today INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS charge_sheet_taken_on_file_2024 INTEGER DEFAULT 0,
            
            -- Final Report Filed
            ADD COLUMN IF NOT EXISTS final_report_filed_today INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS final_report_filed_2024 INTEGER DEFAULT 0,
            
            -- Final Report Taken on File
            ADD COLUMN IF NOT EXISTS final_report_taken_on_file_today INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS final_report_taken_on_file_2024 INTEGER DEFAULT 0,
            
            -- Cases Charge sheeted
            ADD COLUMN IF NOT EXISTS cases_charge_sheeted_today INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS cases_charge_sheeted_2024 INTEGER DEFAULT 0,
            
            -- Cases Convicted
            ADD COLUMN IF NOT EXISTS cases_convicted_today INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS cases_convicted_2024 INTEGER DEFAULT 0,
            
            -- Cases Acquitted
            ADD COLUMN IF NOT EXISTS cases_acquitted_today INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS cases_acquitted_2024 INTEGER DEFAULT 0,
            
            -- Cases Compounded
            ADD COLUMN IF NOT EXISTS cases_compounded_today INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS cases_compounded_2024 INTEGER DEFAULT 0,
            
            -- Cases Withdrawn
            ADD COLUMN IF NOT EXISTS cases_withdrawn_today INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS cases_withdrawn_2024 INTEGER DEFAULT 0,
            
            -- Cases Transferred
            ADD COLUMN IF NOT EXISTS cases_transferred_today INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS cases_transferred_2024 INTEGER DEFAULT 0,
            
            -- Cases Pending Trial
            ADD COLUMN IF NOT EXISTS cases_pending_trial_today INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS cases_pending_trial_2024 INTEGER DEFAULT 0,
            
            -- Cases Pending Investigation
            ADD COLUMN IF NOT EXISTS cases_pending_investigation_today INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS cases_pending_investigation_2024 INTEGER DEFAULT 0;
            
        RAISE NOTICE 'Successfully added missing columns to dsr_case_stages table';
    ELSE
        RAISE NOTICE 'Table dsr_case_stages does not exist. Creating table...';
        
        CREATE TABLE IF NOT EXISTS public.dsr_case_stages (
            id BIGSERIAL PRIMARY KEY,
            report_date DATE NOT NULL,
            created_by UUID REFERENCES auth.users(id) NOT NULL,
            updated_by UUID REFERENCES auth.users(id),
            district VARCHAR(100),
            
            -- Case Registration
            case_registered_today INTEGER DEFAULT 0,
            case_registered_2024 INTEGER DEFAULT 0,
            
            -- Charge Sheet Filed
            charge_sheet_filed_today INTEGER DEFAULT 0,
            charge_sheet_filed_2024 INTEGER DEFAULT 0,
            
            -- Charge Sheet Taken on File
            charge_sheet_taken_on_file_today INTEGER DEFAULT 0,
            charge_sheet_taken_on_file_2024 INTEGER DEFAULT 0,
            
            -- Final Report Filed
            final_report_filed_today INTEGER DEFAULT 0,
            final_report_filed_2024 INTEGER DEFAULT 0,
            
            -- Final Report Taken on File
            final_report_taken_on_file_today INTEGER DEFAULT 0,
            final_report_taken_on_file_2024 INTEGER DEFAULT 0,
            
            -- Cases Charge sheeted
            cases_charge_sheeted_today INTEGER DEFAULT 0,
            cases_charge_sheeted_2024 INTEGER DEFAULT 0,
            
            -- Cases Convicted
            cases_convicted_today INTEGER DEFAULT 0,
            cases_convicted_2024 INTEGER DEFAULT 0,
            
            -- Cases Acquitted
            cases_acquitted_today INTEGER DEFAULT 0,
            cases_acquitted_2024 INTEGER DEFAULT 0,
            
            -- Cases Compounded
            cases_compounded_today INTEGER DEFAULT 0,
            cases_compounded_2024 INTEGER DEFAULT 0,
            
            -- Cases Withdrawn
            cases_withdrawn_today INTEGER DEFAULT 0,
            cases_withdrawn_2024 INTEGER DEFAULT 0,
            
            -- Cases Transferred
            cases_transferred_today INTEGER DEFAULT 0,
            cases_transferred_2024 INTEGER DEFAULT 0,
            
            -- Cases Pending Trial
            cases_pending_trial_today INTEGER DEFAULT 0,
            cases_pending_trial_2024 INTEGER DEFAULT 0,
            
            -- Cases Pending Investigation
            cases_pending_investigation_today INTEGER DEFAULT 0,
            cases_pending_investigation_2024 INTEGER DEFAULT 0,
            
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            
            -- Ensure one record per user per date
            UNIQUE(report_date, created_by)
        );
        
        -- Enable Row Level Security
        ALTER TABLE public.dsr_case_stages ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
        CREATE POLICY "Users can view their own case stages" 
        ON public.dsr_case_stages FOR SELECT 
        USING (auth.uid() = created_by);
        
        CREATE POLICY "Users can insert their own case stages"
        ON public.dsr_case_stages FOR INSERT
        WITH CHECK (auth.uid() = created_by);
        
        CREATE POLICY "Users can update their own case stages"
        ON public.dsr_case_stages FOR UPDATE
        USING (auth.uid() = created_by);
        
        RAISE NOTICE 'Successfully created dsr_case_stages table';
    END IF;
    
    -- Create or replace function to update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_modified_column() 
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW; 
    END;
    $$ LANGUAGE plpgsql;
    
    -- Create trigger for updated_at
    DROP TRIGGER IF EXISTS update_dsr_case_stages_modtime ON public.dsr_case_stages;
    CREATE TRIGGER update_dsr_case_stages_modtime
    BEFORE UPDATE ON public.dsr_case_stages
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
    
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating dsr_case_stages table: %', SQLERRM;
END $$;
