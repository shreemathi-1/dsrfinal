-- DSR Tables Schema for Supabase

-- Common function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. DSR Complaints NCRP CCPS Table
CREATE TABLE IF NOT EXISTS dsr_complaints_ncrp_ccps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    ncrp_complaints_received INTEGER DEFAULT 0,
    ncrp_complaints_disposed INTEGER DEFAULT 0,
    ccps_complaints_received INTEGER DEFAULT 0,
    ccps_complaints_disposed INTEGER DEFAULT 0,
    remarks TEXT,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DSR Amount Tracking Table
CREATE TABLE IF NOT EXISTS dsr_amount_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    amount_lost_on_date NUMERIC(15,2) DEFAULT 0,
    amount_lost_from_date NUMERIC(15,2) DEFAULT 0,
    amount_lost_2024 NUMERIC(15,2) DEFAULT 0,
    amount_frozen_on_date NUMERIC(15,2) DEFAULT 0,
    amount_frozen_from_date NUMERIC(15,2) DEFAULT 0,
    amount_frozen_2024 NUMERIC(15,2) DEFAULT 0,
    amount_returned_on_date NUMERIC(15,2) DEFAULT 0,
    amount_returned_from_date NUMERIC(15,2) DEFAULT 0,
    amount_returned_2024 NUMERIC(15,2) DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. DSR Case Stages Table
CREATE TABLE IF NOT EXISTS dsr_case_stages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    under_investigation_on_date INTEGER DEFAULT 0,
    under_investigation_from_date INTEGER DEFAULT 0,
    under_investigation_2024 INTEGER DEFAULT 0,
    charge_sheet_filed_on_date INTEGER DEFAULT 0,
    charge_sheet_filed_from_date INTEGER DEFAULT 0,
    charge_sheet_filed_2024 INTEGER DEFAULT 0,
    fir_closed_on_date INTEGER DEFAULT 0,
    fir_closed_from_date INTEGER DEFAULT 0,
    fir_closed_2024 INTEGER DEFAULT 0,
    transferred_on_date INTEGER DEFAULT 0,
    transferred_from_date INTEGER DEFAULT 0,
    transferred_2024 INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. DSR NCRP Complaints Table
CREATE TABLE IF NOT EXISTS dsr_ncrp_complaints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    received_on_date INTEGER DEFAULT 0,
    received_from_date INTEGER DEFAULT 0,
    received_2021 INTEGER DEFAULT 0,
    received_2022 INTEGER DEFAULT 0,
    received_2023 INTEGER DEFAULT 0,
    received_2024 INTEGER DEFAULT 0,
    fir_registered_on_date INTEGER DEFAULT 0,
    fir_registered_from_date INTEGER DEFAULT 0,
    fir_registered_2021 INTEGER DEFAULT 0,
    fir_registered_2022 INTEGER DEFAULT 0,
    fir_registered_2023 INTEGER DEFAULT 0,
    fir_registered_2024 INTEGER DEFAULT 0,
    csr_registered_on_date INTEGER DEFAULT 0,
    csr_registered_from_date INTEGER DEFAULT 0,
    csr_registered_2021 INTEGER DEFAULT 0,
    csr_registered_2022 INTEGER DEFAULT 0,
    csr_registered_2023 INTEGER DEFAULT 0,
    csr_registered_2024 INTEGER DEFAULT 0,
    accepted_under_process_on_date INTEGER DEFAULT 0,
    accepted_under_process_from_date INTEGER DEFAULT 0,
    accepted_under_process_2021 INTEGER DEFAULT 0,
    accepted_under_process_2022 INTEGER DEFAULT 0,
    accepted_under_process_2023 INTEGER DEFAULT 0,
    accepted_under_process_2024 INTEGER DEFAULT 0,
    not_accepted_pending_on_date INTEGER DEFAULT 0,
    not_accepted_pending_from_date INTEGER DEFAULT 0,
    not_accepted_pending_2021 INTEGER DEFAULT 0,
    not_accepted_pending_2022 INTEGER DEFAULT 0,
    not_accepted_pending_2023 INTEGER DEFAULT 0,
    not_accepted_pending_2024 INTEGER DEFAULT 0,
    withdrawal_on_date INTEGER DEFAULT 0,
    withdrawal_from_date INTEGER DEFAULT 0,
    withdrawal_2021 INTEGER DEFAULT 0,
    withdrawal_2022 INTEGER DEFAULT 0,
    withdrawal_2023 INTEGER DEFAULT 0,
    withdrawal_2024 INTEGER DEFAULT 0,
    rejected_no_action_on_date INTEGER DEFAULT 0,
    rejected_no_action_from_date INTEGER DEFAULT 0,
    rejected_no_action_2021 INTEGER DEFAULT 0,
    rejected_no_action_2022 INTEGER DEFAULT 0,
    rejected_no_action_2023 INTEGER DEFAULT 0,
    rejected_no_action_2024 INTEGER DEFAULT 0,
    complaints_closed_on_date INTEGER DEFAULT 0,
    complaints_closed_from_date INTEGER DEFAULT 0,
    complaints_closed_2021 INTEGER DEFAULT 0,
    complaints_closed_2022 INTEGER DEFAULT 0,
    complaints_closed_2023 INTEGER DEFAULT 0,
    complaints_closed_2024 INTEGER DEFAULT 0,
    reopen_on_date INTEGER DEFAULT 0,
    reopen_from_date INTEGER DEFAULT 0,
    reopen_2021 INTEGER DEFAULT 0,
    reopen_2022 INTEGER DEFAULT 0,
    reopen_2023 INTEGER DEFAULT 0,
    reopen_2024 INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. DSR CCTNS Complaints Table
CREATE TABLE IF NOT EXISTS dsr_cctns_complaints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    received_on_date INTEGER DEFAULT 0,
    received_from_date INTEGER DEFAULT 0,
    received_2021 INTEGER DEFAULT 0,
    registered_on_date INTEGER DEFAULT 0,
    registered_from_date INTEGER DEFAULT 0,
    registered_2021 INTEGER DEFAULT 0,
    disposed_on_date INTEGER DEFAULT 0,
    disposed_from_date INTEGER DEFAULT 0,
    disposed_2021 INTEGER DEFAULT 0,
    under_process_on_date INTEGER DEFAULT 0,
    under_process_from_date INTEGER DEFAULT 0,
    under_process_2021 INTEGER DEFAULT 0,
    not_processed_on_date INTEGER DEFAULT 0,
    not_processed_from_date INTEGER DEFAULT 0,
    not_processed_2021 INTEGER DEFAULT 0,
    pending_on_date INTEGER DEFAULT 0,
    pending_from_date INTEGER DEFAULT 0,
    pending_2021 INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DSR Trending MO Table
CREATE TABLE IF NOT EXISTS dsr_trending_mo (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. DSR Helpline 1930 Table
CREATE TABLE IF NOT EXISTS dsr_helpline_1930 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    total_calls_on_date INTEGER DEFAULT 0,
    total_calls_from_date INTEGER DEFAULT 0,
    total_complaints_on_date INTEGER DEFAULT 0,
    total_complaints_from_date INTEGER DEFAULT 0,
    aadhar_enabled_on_date INTEGER DEFAULT 0,
    aadhar_enabled_from_date INTEGER DEFAULT 0,
    email_compromise_on_date INTEGER DEFAULT 0,
    email_compromise_from_date INTEGER DEFAULT 0,
    card_fraud_on_date INTEGER DEFAULT 0,
    card_fraud_from_date INTEGER DEFAULT 0,
    demat_fraud_on_date INTEGER DEFAULT 0,
    demat_fraud_from_date INTEGER DEFAULT 0,
    ewallet_fraud_on_date INTEGER DEFAULT 0,
    ewallet_fraud_from_date INTEGER DEFAULT 0,
    fraud_call_on_date INTEGER DEFAULT 0,
    fraud_call_from_date INTEGER DEFAULT 0,
    internet_banking_on_date INTEGER DEFAULT 0,
    internet_banking_from_date INTEGER DEFAULT 0,
    upi_fraud_on_date INTEGER DEFAULT 0,
    upi_fraud_from_date INTEGER DEFAULT 0,
    complaint_transfer_on_date INTEGER DEFAULT 0,
    complaint_transfer_from_date INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. DSR Cases Above 1 Lakh Table
CREATE TABLE IF NOT EXISTS dsr_cases_above_1lakh (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    above_1lakh_on_date INTEGER DEFAULT 0,
    above_1lakh_from_date INTEGER DEFAULT 0,
    above_1lakh_2024 INTEGER DEFAULT 0,
    above_10lakh_on_date INTEGER DEFAULT 0,
    above_10lakh_from_date INTEGER DEFAULT 0,
    above_10lakh_2024 INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. DSR Cases Above 50 Lakh Table
CREATE TABLE IF NOT EXISTS dsr_cases_above_50lakh (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    on_date INTEGER DEFAULT 0,
    from_date INTEGER DEFAULT 0,
    year_2024 INTEGER DEFAULT 0,
    case_details JSONB DEFAULT '[]',
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. DSR MeiTY Requests Table
CREATE TABLE IF NOT EXISTS dsr_meity_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    requests_received_on_date INTEGER DEFAULT 0,
    requests_received_from_date INTEGER DEFAULT 0,
    requests_received_2024 INTEGER DEFAULT 0,
    requests_sent_on_date INTEGER DEFAULT 0,
    requests_sent_from_date INTEGER DEFAULT 0,
    requests_sent_2024 INTEGER DEFAULT 0,
    blocked_on_date INTEGER DEFAULT 0,
    blocked_from_date INTEGER DEFAULT 0,
    blocked_2024 INTEGER DEFAULT 0,
    pending_on_date INTEGER DEFAULT 0,
    pending_from_date INTEGER DEFAULT 0,
    pending_2024 INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. DSR SIM Blocking Table
CREATE TABLE IF NOT EXISTS dsr_sim_blocking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    requests_received_on_date INTEGER DEFAULT 0,
    request_sent_on_date INTEGER DEFAULT 0,
    request_sent_so_far_on_date INTEGER DEFAULT 0,
    blocked_on_date INTEGER DEFAULT 0,
    mobile_blocked_on_date INTEGER DEFAULT 0,
    ccsp_pending_on_date INTEGER DEFAULT 0,
    total_pending_on_date INTEGER DEFAULT 0,
    requests_received_mo INTEGER DEFAULT 0,
    request_sent_mo INTEGER DEFAULT 0,
    request_sent_so_far_mo INTEGER DEFAULT 0,
    blocked_mo INTEGER DEFAULT 0,
    mobile_blocked_mo INTEGER DEFAULT 0,
    ccsp_pending_mo INTEGER DEFAULT 0,
    total_pending_mo INTEGER DEFAULT 0,
    requests_received_2024 INTEGER DEFAULT 0,
    request_sent_2024 INTEGER DEFAULT 0,
    request_sent_so_far_2024 INTEGER DEFAULT 0,
    blocked_2024 INTEGER DEFAULT 0,
    mobile_blocked_2024 INTEGER DEFAULT 0,
    ccsp_pending_2024 INTEGER DEFAULT 0,
    total_pending_2024 INTEGER DEFAULT 0,
    requests_received_2023 INTEGER DEFAULT 0,
    request_sent_2023 INTEGER DEFAULT 0,
    request_sent_so_far_2023 INTEGER DEFAULT 0,
    blocked_2023 INTEGER DEFAULT 0,
    mobile_blocked_2023 INTEGER DEFAULT 0,
    ccsp_pending_2023 INTEGER DEFAULT 0,
    total_pending_2023 INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. DSR Content Blocking Table
CREATE TABLE IF NOT EXISTS dsr_content_blocking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    platform_data JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. DSR CEIR Table
CREATE TABLE IF NOT EXISTS dsr_ceir (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    blocking_requests_on_date INTEGER DEFAULT 0,
    blocking_requests_from_date INTEGER DEFAULT 0,
    blocking_requests_2024 INTEGER DEFAULT 0,
    imei_blocked_on_date INTEGER DEFAULT 0,
    imei_blocked_from_date INTEGER DEFAULT 0,
    imei_blocked_2024 INTEGER DEFAULT 0,
    phones_traced_on_date INTEGER DEFAULT 0,
    phones_traced_from_date INTEGER DEFAULT 0,
    phones_traced_2024 INTEGER DEFAULT 0,
    phones_recovered_on_date INTEGER DEFAULT 0,
    phones_recovered_from_date INTEGER DEFAULT 0,
    phones_recovered_2024 INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. DSR Linkage Cases Table
CREATE TABLE IF NOT EXISTS dsr_linkage_cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    interstate_data JSONB DEFAULT '{}',
    intrastate_data JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. DSR CIAR Table
CREATE TABLE IF NOT EXISTS dsr_ciar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    received_from_others_data JSONB DEFAULT '{}',
    sent_to_others_data JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. DSR CCW Headquarters Table
CREATE TABLE IF NOT EXISTS dsr_ccw_headquarters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    complaints_received_on_date INTEGER DEFAULT 0,
    complaints_received_from_date INTEGER DEFAULT 0,
    complaints_received_2024 INTEGER DEFAULT 0,
    complaints_received_2023 INTEGER DEFAULT 0,
    fir_registered_on_date INTEGER DEFAULT 0,
    fir_registered_from_date INTEGER DEFAULT 0,
    fir_registered_2024 INTEGER DEFAULT 0,
    fir_registered_2023 INTEGER DEFAULT 0,
    csr_issued_on_date INTEGER DEFAULT 0,
    csr_issued_from_date INTEGER DEFAULT 0,
    csr_issued_2024 INTEGER DEFAULT 0,
    csr_issued_2023 INTEGER DEFAULT 0,
    accused_arrested_on_date INTEGER DEFAULT 0,
    accused_arrested_from_date INTEGER DEFAULT 0,
    accused_arrested_2024 INTEGER DEFAULT 0,
    accused_arrested_2023 INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. DSR Awareness Table
CREATE TABLE IF NOT EXISTS dsr_awareness (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    school_on_date INTEGER DEFAULT 0,
    school_from_date INTEGER DEFAULT 0,
    school_2024 INTEGER DEFAULT 0,
    college_on_date INTEGER DEFAULT 0,
    college_from_date INTEGER DEFAULT 0,
    college_2024 INTEGER DEFAULT 0,
    public_place_on_date INTEGER DEFAULT 0,
    public_place_from_date INTEGER DEFAULT 0,
    public_place_2024 INTEGER DEFAULT 0,
    other_places_on_date INTEGER DEFAULT 0,
    other_places_from_date INTEGER DEFAULT 0,
    other_places_2024 INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. DSR Cyber Volunteers Table
CREATE TABLE IF NOT EXISTS dsr_cyber_volunteers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    applied_on_date INTEGER DEFAULT 0,
    applied_from_date INTEGER DEFAULT 0,
    approved_on_date INTEGER DEFAULT 0,
    approved_from_date INTEGER DEFAULT 0,
    rejected_on_date INTEGER DEFAULT 0,
    rejected_from_date INTEGER DEFAULT 0,
    pending_on_date INTEGER DEFAULT 0,
    pending_from_date INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. DSR Social Media Table
CREATE TABLE IF NOT EXISTS dsr_social_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    platform_data JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. DSR Trainings Table
CREATE TABLE IF NOT EXISTS dsr_trainings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    ccps_officers_on_date INTEGER DEFAULT 0,
    ccps_officers_from_date INTEGER DEFAULT 0,
    ccps_officers_2024 INTEGER DEFAULT 0,
    other_police_on_date INTEGER DEFAULT 0,
    other_police_from_date INTEGER DEFAULT 0,
    other_police_2024 INTEGER DEFAULT 0,
    bank_officials_on_date INTEGER DEFAULT 0,
    bank_officials_from_date INTEGER DEFAULT 0,
    bank_officials_2024 INTEGER DEFAULT 0,
    others_on_date INTEGER DEFAULT 0,
    others_from_date INTEGER DEFAULT 0,
    others_2024 INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 21. DSR Duty Leave Table
CREATE TABLE IF NOT EXISTS dsr_duty_leave (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100) NOT NULL,
    district_data JSONB DEFAULT '[]',
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for all tables
CREATE INDEX IF NOT EXISTS idx_dsr_complaints_ncrp_ccps_report_date ON dsr_complaints_ncrp_ccps(report_date);
CREATE INDEX IF NOT EXISTS idx_dsr_complaints_ncrp_ccps_district ON dsr_complaints_ncrp_ccps(district);
CREATE INDEX IF NOT EXISTS idx_dsr_complaints_ncrp_ccps_created_by ON dsr_complaints_ncrp_ccps(created_by);

CREATE INDEX IF NOT EXISTS idx_dsr_amount_tracking_report_date ON dsr_amount_tracking(report_date);
CREATE INDEX IF NOT EXISTS idx_dsr_amount_tracking_district ON dsr_amount_tracking(district);
CREATE INDEX IF NOT EXISTS idx_dsr_amount_tracking_created_by ON dsr_amount_tracking(created_by);

-- Add similar indexes for all other tables...

-- Enable Row Level Security (RLS)
ALTER TABLE dsr_complaints_ncrp_ccps ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsr_amount_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsr_case_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsr_ncrp_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsr_cctns_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsr_trending_mo ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsr_helpline_1930 ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsr_cases_above_1lakh ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsr_cases_above_50lakh ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsr_meity_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsr_sim_blocking ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsr_content_blocking ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsr_ceir ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsr_linkage_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsr_ciar ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsr_ccw_headquarters ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsr_awareness ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsr_cyber_volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsr_social_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsr_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsr_duty_leave ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE 'dsr_%'
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            CREATE POLICY "Users can view their own data" ON %I
                FOR SELECT
                TO authenticated
                USING (created_by = auth.uid());
            
            CREATE POLICY "Users can insert their own data" ON %I
                FOR INSERT
                TO authenticated
                WITH CHECK (auth.uid() = created_by);
            
            CREATE POLICY "Users can update their own data" ON %I
                FOR UPDATE
                TO authenticated
                USING (created_by = auth.uid())
                WITH CHECK (created_by = auth.uid());
        ', t, t, t);
    END LOOP;
END $$;

-- Create triggers for updated_at
DO $$ 
DECLARE
    t text;
    trigger_name text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE 'dsr_%'
        AND table_schema = 'public'
    LOOP
        trigger_name := 'update_' || t || '_updated_at';
        EXECUTE format('
            DROP TRIGGER IF EXISTS %I ON %I;
            CREATE TRIGGER %I 
            BEFORE UPDATE ON %I 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', trigger_name, t, trigger_name, t);
    END LOOP;
END $$; 