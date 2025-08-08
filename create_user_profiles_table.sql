-- Create user_profiles table for Supabase
-- Run this in your Supabase SQL editor

-- Drop the existing table if it exists
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Create user_profiles table
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    user_type TEXT NOT NULL DEFAULT 'officer',
    district TEXT,
    police_station TEXT,
    employee_id TEXT,
    phone_number TEXT,
    join_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON public.user_profiles (user_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_district ON public.user_profiles (district);
CREATE INDEX IF NOT EXISTS idx_user_profiles_police_station ON public.user_profiles (police_station);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles table
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow authenticated users to read all profiles (for admin purposes)
CREATE POLICY "Authenticated users can view all profiles" ON public.user_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_user_profiles_updated_at();

-- Insert some sample user profiles for testing
INSERT INTO public.user_profiles (id, full_name, user_type, district, police_station, employee_id, phone_number, join_date) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin', 'Chennai', 'Central Station', 'EMP001', '9876543210', '2024-01-01'),
    ('00000000-0000-0000-0000-000000000002', 'Officer User', 'officer', 'Chennai', 'T.Nagar', 'EMP002', '9876543211', '2024-01-01'),
    ('00000000-0000-0000-0000-000000000003', 'DSR Admin User', 'dsr-admin', 'Chennai', 'DSR Office', 'EMP003', '9876543212', '2024-01-01'); 