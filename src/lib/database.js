import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Test the database connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Function to execute SQL schema
export const executeDSRSchema = async () => {
  try {
    // Get the SQL schema from the file
    const schemaSQL = `
    -- Create execute_sql function first
    CREATE OR REPLACE FUNCTION execute_sql(sql_statement text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql_statement;
    END;
    $$;

    -- Grant execute permission to authenticated users
    GRANT EXECUTE ON FUNCTION execute_sql(text) TO authenticated;

    -- Common audit fields function
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Create all DSR tables
    CREATE TABLE IF NOT EXISTS dsr_complaints_ncrp_ccps (
      id SERIAL PRIMARY KEY,
      report_date DATE NOT NULL,
      district VARCHAR(100) NOT NULL,
      ncrp_complaints_received INT NOT NULL DEFAULT 0,
      ncrp_complaints_disposed INT NOT NULL DEFAULT 0,
      ccps_complaints_received INT NOT NULL DEFAULT 0,
      ccps_complaints_disposed INT NOT NULL DEFAULT 0,
      remarks TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      created_by UUID REFERENCES auth.users(id),
      updated_by UUID REFERENCES auth.users(id)
    );

    -- Add other table creation statements here...

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_complaints_ncrp_ccps_date ON dsr_complaints_ncrp_ccps(report_date);
    CREATE INDEX IF NOT EXISTS idx_complaints_ncrp_ccps_district ON dsr_complaints_ncrp_ccps(district);

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
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', trigger_name, t);
        EXECUTE format('
          CREATE TRIGGER %I 
          BEFORE UPDATE ON %I 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', 
          trigger_name, t);
      END LOOP;
    END $$;

    -- Enable Row Level Security
    ALTER TABLE dsr_complaints_ncrp_ccps ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view their own data"
      ON dsr_complaints_ncrp_ccps
      FOR SELECT
      TO authenticated
      USING (created_by = auth.uid());

    CREATE POLICY "Users can insert their own data"
      ON dsr_complaints_ncrp_ccps
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = created_by);

    CREATE POLICY "Users can update their own data"
      ON dsr_complaints_ncrp_ccps
      FOR UPDATE
      TO authenticated
      USING (created_by = auth.uid())
      WITH CHECK (created_by = auth.uid());
    `;

    // Execute the schema
    const { error } = await supabase.rpc('execute_sql', { sql_statement: schemaSQL });
    if (error) throw error;

    console.log('DSR schema executed successfully');
    return true;
  } catch (error) {
    console.error('Error executing DSR schema:', error);
    throw error;
  }
};

// Export both clients
export { pool }; 