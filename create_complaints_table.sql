-- Create comprehensive complaints table with all fields from complaintFields.js
-- Run this in your Supabase SQL editor

-- Drop the existing table if it exists to recreate with all fields
DROP TABLE IF EXISTS public.complaints CASCADE;

-- Create comprehensive complaints table
CREATE TABLE public.complaints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

-- Administrative Information
s_no TEXT,
acknowledgement_no TEXT,
state_name TEXT DEFAULT 'Tamil Nadu',
district_name TEXT,
police_station TEXT,
status TEXT DEFAULT 'Registered',

-- Crime Details
category TEXT,
sub_category TEXT,
crime_additional_info TEXT,
incident_date DATE,
complaint_date DATE DEFAULT CURRENT_DATE,
last_action_taken_on DATE,

-- Complainant Details
complainant_name TEXT,
complainant_address TEXT,
complainant_mobile_no TEXT,
complainant_email TEXT,

-- Suspect Details (Optional)
suspect_name TEXT, 
suspect_mobile_no TEXT, 
suspect_id_no TEXT,

-- Financial Details (Optional)
fraudulent_amount DECIMAL(15, 2) DEFAULT 0,
lien_amount DECIMAL(15, 2) DEFAULT 0,

-- System fields
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
is_deleted BOOLEAN DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_complaints_s_no ON public.complaints (s_no);
CREATE INDEX IF NOT EXISTS idx_complaints_acknowledgement_no ON public.complaints (acknowledgement_no);
CREATE INDEX IF NOT EXISTS idx_complaints_district ON public.complaints (district_name);
CREATE INDEX IF NOT EXISTS idx_complaints_police_station ON public.complaints (police_station);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints (status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints (category);
CREATE INDEX IF NOT EXISTS idx_complaints_complainant_email ON public.complaints (complainant_email);
CREATE INDEX IF NOT EXISTS idx_complaints_complainant_mobile ON public.complaints (complainant_mobile_no);
CREATE INDEX IF NOT EXISTS idx_complaints_incident_date ON public.complaints (incident_date);
CREATE INDEX IF NOT EXISTS idx_complaints_complaint_date ON public.complaints (complaint_date);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints (created_at);
CREATE INDEX IF NOT EXISTS idx_complaints_is_deleted ON public.complaints (is_deleted);

-- Enable Row Level Security (RLS)
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON public.complaints FOR ALL USING (true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_complaints_updated_at 
    BEFORE UPDATE ON public.complaints 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();