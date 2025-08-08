-- Drop existing constraints
ALTER TABLE complaints
  DROP CONSTRAINT IF EXISTS complaints_s_no_key,
  DROP CONSTRAINT IF EXISTS complaints_acknowledgement_no_key,
  DROP CONSTRAINT IF EXISTS complaints_status_check;

-- Add new constraints
ALTER TABLE complaints
  ADD CONSTRAINT complaints_s_no_key UNIQUE (s_no),
  ADD CONSTRAINT complaints_acknowledgement_no_key UNIQUE (acknowledgement_no),
  ADD CONSTRAINT complaints_status_check CHECK (
    status IN (
      'Closed',
      'FIR Registered',
      'NC Registered',
      'No Action',
      'Re Open',
      'Registered',
      'Rejected',
      'Under Process',
      'Withdrawal'
    )
  );

-- Make all fields optional except acknowledgement_no
ALTER TABLE complaints
  ALTER COLUMN s_no DROP NOT NULL,
  ALTER COLUMN state_name DROP NOT NULL,
  ALTER COLUMN district_name DROP NOT NULL,
  ALTER COLUMN police_station DROP NOT NULL,
  ALTER COLUMN category DROP NOT NULL,
  ALTER COLUMN sub_category DROP NOT NULL,
  ALTER COLUMN status DROP NOT NULL,
  ALTER COLUMN incident_date DROP NOT NULL,
  ALTER COLUMN complaint_date DROP NOT NULL,
  ALTER COLUMN complainant_name DROP NOT NULL,
  ALTER COLUMN complainant_address DROP NOT NULL,
  ALTER COLUMN complainant_mobile_no DROP NOT NULL,
  ALTER COLUMN complainant_email DROP NOT NULL; 