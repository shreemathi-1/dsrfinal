-- Create districts table first as it will be referenced by other tables
CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table I: Financial & Non-Financial Complaints
CREATE TABLE IF NOT EXISTS ccps_complaints (
    id SERIAL PRIMARY KEY,
    district_id INTEGER REFERENCES districts(id),
    date DATE NOT NULL,
    
    -- No. of Complaints received
    financial_fraud_ncrp INTEGER DEFAULT 0,
    financial_fraud_direct INTEGER DEFAULT 0,
    non_financial_fraud_ncrp INTEGER DEFAULT 0,
    non_financial_fraud_direct INTEGER DEFAULT 0,
    
    -- No. of FIR Registered
    fir_financial_fraud_ncrp INTEGER DEFAULT 0,
    fir_financial_fraud_direct INTEGER DEFAULT 0,
    fir_non_financial_fraud_ncrp INTEGER DEFAULT 0,
    fir_non_financial_fraud_direct INTEGER DEFAULT 0,
    
    -- No. of CSR Registered
    csr_financial_fraud_ncrp INTEGER DEFAULT 0,
    csr_financial_fraud_direct INTEGER DEFAULT 0,
    csr_non_financial_fraud_ncrp INTEGER DEFAULT 0,
    csr_non_financial_fraud_direct INTEGER DEFAULT 0,
    
    -- Financial Details
    amount_lost DECIMAL(15,2) DEFAULT 0,
    amount_frozen DECIMAL(15,2) DEFAULT 0,
    amount_returned DECIMAL(15,2) DEFAULT 0,
    accused_arrested INTEGER DEFAULT 0,
    cases_in_goondas INTEGER DEFAULT 0,
    
    -- Loan App Cases
    loan_app_cases INTEGER DEFAULT 0,
    loan_app_complaints INTEGER DEFAULT 0,
    loan_app_fir_registered INTEGER DEFAULT 0,
    loan_app_csr_issued INTEGER DEFAULT 0,
    loan_app_accused_arrested INTEGER DEFAULT 0,
    
    -- Case Progress
    case_cc_no_obtained INTEGER DEFAULT 0,
    case_convicted INTEGER DEFAULT 0,
    case_acquitted_disposed INTEGER DEFAULT 0,
    
    -- Cyber Volunteers Progress on date
    cv_requests_applied INTEGER DEFAULT 0,
    cv_requests_approved INTEGER DEFAULT 0,
    cv_requests_rejected INTEGER DEFAULT 0,
    cv_requests_pending INTEGER DEFAULT 0,
    
    -- Cyber Volunteers Progress so far
    cv_total_requests_applied INTEGER DEFAULT 0,
    cv_total_requests_approved INTEGER DEFAULT 0,
    cv_total_requests_rejected INTEGER DEFAULT 0,
    cv_total_requests_pending INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(district_id, date)
);

-- Table II: CSR to FIR Conversion
CREATE TABLE IF NOT EXISTS ccps_csr_fir_conversion (
    id SERIAL PRIMARY KEY,
    district_id INTEGER REFERENCES districts(id),
    date DATE NOT NULL,
    
    -- Total No.of CSR Converted to FIR
    financial_fraud INTEGER DEFAULT 0,
    non_financial_fraud INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    
    -- No of FIR Registered
    fir_financial_fraud INTEGER DEFAULT 0,
    fir_non_financial_fraud INTEGER DEFAULT 0,
    fir_total INTEGER DEFAULT 0,
    
    -- No of CSR Registered
    csr_financial_fraud INTEGER DEFAULT 0,
    csr_non_financial_fraud INTEGER DEFAULT 0,
    csr_total INTEGER DEFAULT 0,
    
    -- Other details
    amount_lost DECIMAL(15,2) DEFAULT 0,
    amount_frozen DECIMAL(15,2) DEFAULT 0,
    amount_returned DECIMAL(15,2) DEFAULT 0,
    accused_arrested INTEGER DEFAULT 0,
    cases_in_goondas INTEGER DEFAULT 0,
    
    -- Loan App Cases
    loan_app_fir_registered INTEGER DEFAULT 0,
    loan_app_csr_issued INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(district_id, date)
);

-- Table III: Social Media Requests
CREATE TABLE IF NOT EXISTS ccps_social_media (
    id SERIAL PRIMARY KEY,
    district_id INTEGER REFERENCES districts(id),
    date DATE NOT NULL,
    
    -- Facebook
    facebook_sent INTEGER DEFAULT 0,
    facebook_blocked INTEGER DEFAULT 0,
    
    -- Twitter
    twitter_sent INTEGER DEFAULT 0,
    twitter_blocked INTEGER DEFAULT 0,
    
    -- Youtube
    youtube_sent INTEGER DEFAULT 0,
    youtube_blocked INTEGER DEFAULT 0,
    
    -- Instagram
    instagram_sent INTEGER DEFAULT 0,
    instagram_blocked INTEGER DEFAULT 0,
    
    -- Loan Apps
    loan_apps_sent INTEGER DEFAULT 0,
    loan_apps_blocked INTEGER DEFAULT 0,
    
    -- Other Apps
    other_apps_sent INTEGER DEFAULT 0,
    other_apps_blocked INTEGER DEFAULT 0,
    
    -- Websites
    websites_sent INTEGER DEFAULT 0,
    websites_blocked INTEGER DEFAULT 0,
    
    -- Telegram
    telegram_sent INTEGER DEFAULT 0,
    telegram_blocked INTEGER DEFAULT 0,
    
    -- WhatsApp
    whatsapp_sent INTEGER DEFAULT 0,
    whatsapp_blocked INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(district_id, date)
);

-- Table IV: B/D Duty & Leave Details
CREATE TABLE IF NOT EXISTS ccps_duty_leave (
    id SERIAL PRIMARY KEY,
    district_id INTEGER REFERENCES districts(id),
    date DATE NOT NULL,
    
    -- ADSP's
    adsp_bd_duty INTEGER DEFAULT 0,
    adsp_cl INTEGER DEFAULT 0,
    adsp_ml_el INTEGER DEFAULT 0,
    adsp_od INTEGER DEFAULT 0,
    
    -- Inspector's
    inspector_bd_duty INTEGER DEFAULT 0,
    inspector_cl INTEGER DEFAULT 0,
    inspector_ml_el INTEGER DEFAULT 0,
    inspector_od INTEGER DEFAULT 0,
    
    -- SI's (L&O,Tech)
    si_bd_duty INTEGER DEFAULT 0,
    si_cl INTEGER DEFAULT 0,
    si_ml_el INTEGER DEFAULT 0,
    si_od INTEGER DEFAULT 0,
    
    -- Others
    others_bd_duty INTEGER DEFAULT 0,
    others_cl INTEGER DEFAULT 0,
    others_ml_el INTEGER DEFAULT 0,
    others_od INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(district_id, date)
);

-- Trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_districts_updated_at
    BEFORE UPDATE ON districts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ccps_complaints_updated_at
    BEFORE UPDATE ON ccps_complaints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ccps_csr_fir_conversion_updated_at
    BEFORE UPDATE ON ccps_csr_fir_conversion
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ccps_social_media_updated_at
    BEFORE UPDATE ON ccps_social_media
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ccps_duty_leave_updated_at
    BEFORE UPDATE ON ccps_duty_leave
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_ccps_complaints_district_date ON ccps_complaints(district_id, date);
CREATE INDEX idx_ccps_csr_fir_conversion_district_date ON ccps_csr_fir_conversion(district_id, date);
CREATE INDEX idx_ccps_social_media_district_date ON ccps_social_media(district_id, date);
CREATE INDEX idx_ccps_duty_leave_district_date ON ccps_duty_leave(district_id, date);

-- Insert initial district data
INSERT INTO districts (name) VALUES ('Kanchipuram')
ON CONFLICT (id) DO NOTHING;

-- Insert sample data for testing
INSERT INTO ccps_complaints (
    district_id,
    date,
    amount_lost
) 
SELECT 
    d.id,
    '2025-07-14'::DATE,
    82153
FROM districts d
WHERE d.name = 'Kanchipuram'
ON CONFLICT (district_id, date) DO NOTHING; 