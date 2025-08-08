-- DSR Dashboard Report Tables Database Schema
-- Complete schema for all 21 tables with save/edit functionality

-- Common fields for all tables
-- id: Primary key
-- report_date: Date of the report
-- district: District name
-- police_station: Police station name
-- user_id: User who created/modified the record
-- created_at: Timestamp when record was created
-- updated_at: Timestamp when record was last updated

-- Table 1: Complaints registered through NCRP and Complaints received by CCPS
CREATE TABLE complaints_ncrp_ccps (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- Financial complaints
    fin_complaints_received INTEGER DEFAULT 0,
    fin_complaints_disposed INTEGER DEFAULT 0,
    fin_complaints_pending INTEGER DEFAULT 0,
    
    -- Non-financial complaints
    nonfin_complaints_received INTEGER DEFAULT 0,
    nonfin_complaints_disposed INTEGER DEFAULT 0,
    nonfin_complaints_pending INTEGER DEFAULT 0,
    
    -- Totals (calculated fields)
    total_complaints_received INTEGER GENERATED ALWAYS AS (fin_complaints_received + nonfin_complaints_received) STORED,
    total_complaints_disposed INTEGER GENERATED ALWAYS AS (fin_complaints_disposed + nonfin_complaints_disposed) STORED,
    total_complaints_pending INTEGER GENERATED ALWAYS AS (fin_complaints_pending + nonfin_complaints_pending) STORED,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, police_station)
);

-- Table 2: Amount Lost, Frozen, Returned etc. in CCPS
CREATE TABLE amount_lost_frozen (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- Amount data
    amount_lost_on_date DECIMAL(15,2) DEFAULT 0,
    amount_lost_from_date DECIMAL(15,2) DEFAULT 0,
    amount_lost_2024 DECIMAL(15,2) DEFAULT 0,
    
    amount_frozen_on_date DECIMAL(15,2) DEFAULT 0,
    amount_frozen_from_date DECIMAL(15,2) DEFAULT 0,
    amount_frozen_2024 DECIMAL(15,2) DEFAULT 0,
    
    amount_returned_on_date DECIMAL(15,2) DEFAULT 0,
    amount_returned_from_date DECIMAL(15,2) DEFAULT 0,
    amount_returned_2024 DECIMAL(15,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, police_station)
);

-- Table 3: Stages of cases
CREATE TABLE stages_of_cases (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- Case stages
    investigation_stage INTEGER DEFAULT 0,
    chargesheet_filed INTEGER DEFAULT 0,
    court_proceedings INTEGER DEFAULT 0,
    conviction INTEGER DEFAULT 0,
    acquittal INTEGER DEFAULT 0,
    pending_trial INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, police_station)
);

-- Table 4: NCRP Complaints status
CREATE TABLE ncrp_complaints (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- NCRP complaint categories
    financial_fraud INTEGER DEFAULT 0,
    online_harassment INTEGER DEFAULT 0,
    data_theft INTEGER DEFAULT 0,
    cyber_bullying INTEGER DEFAULT 0,
    other_complaints INTEGER DEFAULT 0,
    
    -- Status
    resolved INTEGER DEFAULT 0,
    pending INTEGER DEFAULT 0,
    transferred INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, police_station)
);

-- Table 5: CCTNS Complaints status
CREATE TABLE cctns_complaints (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- CCTNS data
    fir_registered INTEGER DEFAULT 0,
    nc_registered INTEGER DEFAULT 0,
    under_investigation INTEGER DEFAULT 0,
    chargesheet_filed INTEGER DEFAULT 0,
    case_closed INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, police_station)
);

-- Table 6: NEW MO/Trending MO Reported
CREATE TABLE trending_mo (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- MO types
    mo_description TEXT,
    frequency INTEGER DEFAULT 0,
    trend_status VARCHAR(50), -- 'increasing', 'decreasing', 'stable'
    severity_level VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 7: Details of Complaints received through helpline 1930
CREATE TABLE helpline_1930 (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- Call statistics
    total_calls_received INTEGER DEFAULT 0,
    complaints_registered INTEGER DEFAULT 0,
    information_provided INTEGER DEFAULT 0,
    calls_transferred INTEGER DEFAULT 0,
    prank_calls INTEGER DEFAULT 0,
    
    -- Response metrics
    average_response_time INTEGER DEFAULT 0, -- in seconds
    satisfaction_rating DECIMAL(3,2) DEFAULT 0, -- 0-5 scale
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, police_station)
);

-- Table 8: Cases where amount lost is 1 Lakh and above (1930 Complaints)
CREATE TABLE above_1_lakh (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- High value cases
    total_cases INTEGER DEFAULT 0,
    amount_involved DECIMAL(15,2) DEFAULT 0,
    cases_solved INTEGER DEFAULT 0,
    amount_recovered DECIMAL(15,2) DEFAULT 0,
    cases_pending INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, police_station)
);

-- Table 9: Cases where amount lost is 50 Lakh and above (1930 Complaints)
CREATE TABLE above_50_lakh (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- Very high value cases
    total_cases INTEGER DEFAULT 0,
    amount_involved DECIMAL(15,2) DEFAULT 0,
    cases_solved INTEGER DEFAULT 0,
    amount_recovered DECIMAL(15,2) DEFAULT 0,
    cases_pending INTEGER DEFAULT 0,
    special_investigation_team BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, police_station)
);

-- Table 10: Blocking requests sent to MeiTY and complied
CREATE TABLE meity_requests (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- MeiTY blocking requests
    requests_sent INTEGER DEFAULT 0,
    requests_complied INTEGER DEFAULT 0,
    requests_pending INTEGER DEFAULT 0,
    requests_rejected INTEGER DEFAULT 0,
    
    -- Types of blocking
    url_blocking INTEGER DEFAULT 0,
    app_blocking INTEGER DEFAULT 0,
    social_media_blocking INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, police_station)
);

-- Continue with remaining tables...
-- Due to length constraints, I'll create the remaining tables in separate files
