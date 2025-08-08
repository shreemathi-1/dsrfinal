-- STEP 1: Drop existing table (run this first)
DROP TABLE IF EXISTS public.complaints CASCADE;

-- STEP 2: Create the main table (run this second)
CREATE TABLE public.complaints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    s_no TEXT NOT NULL UNIQUE,
    acknowledgement_no TEXT NOT NULL UNIQUE,
    state_name TEXT NOT NULL DEFAULT 'Tamil Nadu',
    district_name TEXT NOT NULL,
    police_station TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open',
    category TEXT NOT NULL,
    sub_category TEXT NOT NULL,
    crime_additional_info TEXT,
    incident_date DATE NOT NULL,
    complaint_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_action_taken_on DATE,
    complainant_name TEXT NOT NULL,
    complainant_address TEXT NOT NULL,
    complainant_mobile_no TEXT NOT NULL,
    complainant_email TEXT NOT NULL,
    suspect_name TEXT, 
    suspect_mobile_no TEXT, 
    suspect_id_no TEXT,
    fraudulent_amount DECIMAL(15, 2) DEFAULT 0,
    lien_amount DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_deleted BOOLEAN DEFAULT false
);

-- STEP 3: Create indexes (run each line separately if needed)
CREATE INDEX idx_complaints_s_no ON public.complaints (s_no);
CREATE INDEX idx_complaints_acknowledgement_no ON public.complaints (acknowledgement_no);
CREATE INDEX idx_complaints_district ON public.complaints (district_name);
CREATE INDEX idx_complaints_status ON public.complaints (status);
CREATE INDEX idx_complaints_category ON public.complaints (category);

-- STEP 4: Enable security
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create policy
CREATE POLICY "Allow all for authenticated users" ON public.complaints FOR ALL USING (true);

-- STEP 6: Add constraints (run each separately)
ALTER TABLE public.complaints ADD CONSTRAINT check_complainant_mobile_length CHECK (char_length(complainant_mobile_no) = 10);
ALTER TABLE public.complaints ADD CONSTRAINT check_positive_amounts CHECK (fraudulent_amount >= 0 AND lien_amount >= 0);
ALTER TABLE public.complaints ADD CONSTRAINT check_valid_status CHECK (status IN ('Open', 'Under Investigation', 'Closed', 'Pending', 'Resolved'));

-- STEP 7: Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- STEP 8: Create trigger
CREATE TRIGGER update_complaints_updated_at 
    BEFORE UPDATE ON public.complaints 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 