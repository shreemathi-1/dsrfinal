-- Corrected Database Schema for Table 2: Amount Lost, Frozen, Returned etc. in CCPS
-- This matches the existing implementation in dsrDatabase.js

-- Table 2: Amount Lost, Frozen, Returned etc. in CCPS
CREATE TABLE dsr_amount_tracking (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Amount Lost fields
    amount_lost_on_date DECIMAL(15,2) DEFAULT 0,
    amount_lost_from_date DECIMAL(15,2) DEFAULT 0,
    amount_lost_2024 DECIMAL(15,2) DEFAULT 0,
    
    -- Amount Frozen fields
    amount_frozen_on_date DECIMAL(15,2) DEFAULT 0,
    amount_frozen_from_date DECIMAL(15,2) DEFAULT 0,
    amount_frozen_2024 DECIMAL(15,2) DEFAULT 0,
    
    -- Amount Returned fields
    amount_returned_on_date DECIMAL(15,2) DEFAULT 0,
    amount_returned_from_date DECIMAL(15,2) DEFAULT 0,
    amount_returned_2024 DECIMAL(15,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, created_by)
);

-- Create indexes for better performance
CREATE INDEX idx_dsr_amount_tracking_date ON dsr_amount_tracking(report_date);
CREATE INDEX idx_dsr_amount_tracking_district ON dsr_amount_tracking(district);
CREATE INDEX idx_dsr_amount_tracking_user ON dsr_amount_tracking(created_by);

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE dsr_amount_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own records" ON dsr_amount_tracking
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own records" ON dsr_amount_tracking
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own records" ON dsr_amount_tracking
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own records" ON dsr_amount_tracking
    FOR DELETE USING (auth.uid() = created_by);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_dsr_amount_tracking_updated_at 
    BEFORE UPDATE ON dsr_amount_tracking 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
