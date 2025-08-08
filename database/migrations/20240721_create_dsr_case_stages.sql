-- Create dsr_case_stages table
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

-- Enable RLS
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

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW; 
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE OR REPLACE TRIGGER update_dsr_case_stages_modtime
BEFORE UPDATE ON public.dsr_case_stages
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
