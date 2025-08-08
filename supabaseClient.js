import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fallback for development if environment variables are not set
const defaultUrl = "https://gcxotaorwlcindaoebjy.supabase.co";
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjeG90YW9yd2xjaW5kYW9lYmp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MDM2OTMsImV4cCI6MjA2NzE3OTY5M30.FRRn38V2KKkyiEIoLIzpvNYim2JjaB33bgf3Bb44IbA';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anonymous Key not found in environment variables. Using default development values.');
}

const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
};

export const supabase = createClient(
  supabaseUrl || defaultUrl, 
  supabaseAnonKey || defaultKey,
  options
);