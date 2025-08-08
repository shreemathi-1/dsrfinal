-- DSR Dashboard Report Tables Database Schema - Part 2
-- Tables 11-21 with save/edit functionality

-- Table 11: SIM Blocking
CREATE TABLE sim_blocking (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- SIM blocking data
    requests_received INTEGER DEFAULT 0,
    requests_processed INTEGER DEFAULT 0,
    sims_blocked INTEGER DEFAULT 0,
    requests_pending INTEGER DEFAULT 0,
    requests_rejected INTEGER DEFAULT 0,
    
    -- Operator wise breakdown
    airtel_blocked INTEGER DEFAULT 0,
    jio_blocked INTEGER DEFAULT 0,
    vi_blocked INTEGER DEFAULT 0,
    bsnl_blocked INTEGER DEFAULT 0,
    other_operators_blocked INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, police_station)
);

-- Table 12: Content Blocking
CREATE TABLE content_blocking (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- Content blocking data
    urls_reported INTEGER DEFAULT 0,
    urls_blocked INTEGER DEFAULT 0,
    social_media_accounts_blocked INTEGER DEFAULT 0,
    apps_blocked INTEGER DEFAULT 0,
    websites_blocked INTEGER DEFAULT 0,
    
    -- Platform wise
    facebook_blocks INTEGER DEFAULT 0,
    instagram_blocks INTEGER DEFAULT 0,
    twitter_blocks INTEGER DEFAULT 0,
    youtube_blocks INTEGER DEFAULT 0,
    other_platform_blocks INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, police_station)
);

-- Table 13: Details of Central Equipment Identity Register (CEIR)
CREATE TABLE ceir_data (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- CEIR blocking data
    devices_reported_stolen INTEGER DEFAULT 0,
    devices_blocked INTEGER DEFAULT 0,
    devices_unblocked INTEGER DEFAULT 0,
    devices_traced INTEGER DEFAULT 0,
    
    -- Device types
    smartphones_blocked INTEGER DEFAULT 0,
    tablets_blocked INTEGER DEFAULT 0,
    laptops_blocked INTEGER DEFAULT 0,
    other_devices_blocked INTEGER DEFAULT 0,
    
    -- Recovery data
    devices_recovered INTEGER DEFAULT 0,
    recovery_value DECIMAL(15,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, police_station)
);

-- Table 14: Interstate and Intrastate Linkage Cases
CREATE TABLE linkage_cases (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- Linkage data
    interstate_cases INTEGER DEFAULT 0,
    intrastate_cases INTEGER DEFAULT 0,
    international_cases INTEGER DEFAULT 0,
    
    -- Coordination
    states_coordinated_with INTEGER DEFAULT 0,
    joint_investigations INTEGER DEFAULT 0,
    information_shared INTEGER DEFAULT 0,
    
    -- Outcomes
    cases_solved_through_linkage INTEGER DEFAULT 0,
    arrests_made INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, police_station)
);

-- Table 15: Details of Cyber Crime Investigation Assistance Request (CIAR)
CREATE TABLE ciar_data (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- CIAR requests
    requests_received INTEGER DEFAULT 0,
    requests_processed INTEGER DEFAULT 0,
    requests_pending INTEGER DEFAULT 0,
    
    -- Request types
    technical_assistance INTEGER DEFAULT 0,
    digital_forensics INTEGER DEFAULT 0,
    data_analysis INTEGER DEFAULT 0,
    expert_opinion INTEGER DEFAULT 0,
    
    -- Response metrics
    average_processing_time INTEGER DEFAULT 0, -- in days
    success_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, police_station)
);

-- Table 16: Investigation of cases at CCW headquarters
CREATE TABLE ccw_headquarters (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- CCW investigation data
    cases_received INTEGER DEFAULT 0,
    cases_under_investigation INTEGER DEFAULT 0,
    cases_completed INTEGER DEFAULT 0,
    cases_transferred INTEGER DEFAULT 0,
    
    -- Investigation outcomes
    arrests_made INTEGER DEFAULT 0,
    chargesheets_filed INTEGER DEFAULT 0,
    convictions INTEGER DEFAULT 0,
    acquittals INTEGER DEFAULT 0,
    
    -- Resources utilized
    officers_deployed INTEGER DEFAULT 0,
    technical_experts_involved INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, police_station)
);

-- Table 17: Awareness Conducted
CREATE TABLE awareness_programs (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- Awareness program data
    programs_conducted INTEGER DEFAULT 0,
    participants_reached INTEGER DEFAULT 0,
    schools_covered INTEGER DEFAULT 0,
    colleges_covered INTEGER DEFAULT 0,
    corporate_sessions INTEGER DEFAULT 0,
    
    -- Program types
    cyber_safety_sessions INTEGER DEFAULT 0,
    financial_fraud_awareness INTEGER DEFAULT 0,
    social_media_safety INTEGER DEFAULT 0,
    digital_literacy INTEGER DEFAULT 0,
    
    -- Materials distributed
    pamphlets_distributed INTEGER DEFAULT 0,
    digital_content_shared INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, police_station)
);

-- Table 18: Cyber Volunteers
CREATE TABLE cyber_volunteers (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- Volunteer data
    total_volunteers INTEGER DEFAULT 0,
    active_volunteers INTEGER DEFAULT 0,
    new_registrations INTEGER DEFAULT 0,
    volunteers_trained INTEGER DEFAULT 0,
    
    -- Volunteer activities
    complaints_handled INTEGER DEFAULT 0,
    awareness_sessions_conducted INTEGER DEFAULT 0,
    social_media_monitoring INTEGER DEFAULT 0,
    community_outreach INTEGER DEFAULT 0,
    
    -- Performance metrics
    average_response_time INTEGER DEFAULT 0, -- in hours
    satisfaction_rating DECIMAL(3,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, police_station)
);

-- Table 19: Posts uploaded in Social Media
CREATE TABLE social_media_posts (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- Social media activity
    posts_uploaded INTEGER DEFAULT 0,
    awareness_posts INTEGER DEFAULT 0,
    case_updates INTEGER DEFAULT 0,
    safety_tips INTEGER DEFAULT 0,
    
    -- Platform wise
    facebook_posts INTEGER DEFAULT 0,
    twitter_posts INTEGER DEFAULT 0,
    instagram_posts INTEGER DEFAULT 0,
    youtube_videos INTEGER DEFAULT 0,
    linkedin_posts INTEGER DEFAULT 0,
    
    -- Engagement metrics
    total_reach INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, police_station)
);

-- Table 20: Trainings Conducted
CREATE TABLE training_programs (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- Training data
    programs_conducted INTEGER DEFAULT 0,
    officers_trained INTEGER DEFAULT 0,
    civilian_participants INTEGER DEFAULT 0,
    training_hours INTEGER DEFAULT 0,
    
    -- Training types
    cyber_investigation_training INTEGER DEFAULT 0,
    digital_forensics_training INTEGER DEFAULT 0,
    awareness_training INTEGER DEFAULT 0,
    technical_skills_training INTEGER DEFAULT 0,
    
    -- Training outcomes
    certifications_issued INTEGER DEFAULT 0,
    pass_rate DECIMAL(5,2) DEFAULT 0,
    feedback_score DECIMAL(3,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, police_station)
);

-- Table 21: Districts/cities CCPS Duty & Leave Details
CREATE TABLE duty_leave_details (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    district VARCHAR(100),
    police_station VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- Staff details
    total_sanctioned_posts INTEGER DEFAULT 0,
    posts_filled INTEGER DEFAULT 0,
    posts_vacant INTEGER DEFAULT 0,
    
    -- Duty status
    officers_on_duty INTEGER DEFAULT 0,
    officers_on_leave INTEGER DEFAULT 0,
    officers_on_training INTEGER DEFAULT 0,
    officers_on_deputation INTEGER DEFAULT 0,
    
    -- Leave types
    casual_leave INTEGER DEFAULT 0,
    earned_leave INTEGER DEFAULT 0,
    medical_leave INTEGER DEFAULT 0,
    maternity_leave INTEGER DEFAULT 0,
    
    -- Operational impact
    cases_handled INTEGER DEFAULT 0,
    response_time_hours DECIMAL(5,2) DEFAULT 0,
    overtime_hours INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_date, district, police_station)
);

-- Create indexes for better performance
CREATE INDEX idx_complaints_ncrp_ccps_date ON complaints_ncrp_ccps(report_date);
CREATE INDEX idx_complaints_ncrp_ccps_district ON complaints_ncrp_ccps(district);
CREATE INDEX idx_amount_lost_frozen_date ON amount_lost_frozen(report_date);
CREATE INDEX idx_stages_of_cases_date ON stages_of_cases(report_date);
CREATE INDEX idx_ncrp_complaints_date ON ncrp_complaints(report_date);
CREATE INDEX idx_cctns_complaints_date ON cctns_complaints(report_date);
CREATE INDEX idx_trending_mo_date ON trending_mo(report_date);
CREATE INDEX idx_helpline_1930_date ON helpline_1930(report_date);
CREATE INDEX idx_above_1_lakh_date ON above_1_lakh(report_date);
CREATE INDEX idx_above_50_lakh_date ON above_50_lakh(report_date);
CREATE INDEX idx_meity_requests_date ON meity_requests(report_date);
CREATE INDEX idx_sim_blocking_date ON sim_blocking(report_date);
CREATE INDEX idx_content_blocking_date ON content_blocking(report_date);
CREATE INDEX idx_ceir_data_date ON ceir_data(report_date);
CREATE INDEX idx_linkage_cases_date ON linkage_cases(report_date);
CREATE INDEX idx_ciar_data_date ON ciar_data(report_date);
CREATE INDEX idx_ccw_headquarters_date ON ccw_headquarters(report_date);
CREATE INDEX idx_awareness_programs_date ON awareness_programs(report_date);
CREATE INDEX idx_cyber_volunteers_date ON cyber_volunteers(report_date);
CREATE INDEX idx_social_media_posts_date ON social_media_posts(report_date);
CREATE INDEX idx_training_programs_date ON training_programs(report_date);
CREATE INDEX idx_duty_leave_details_date ON duty_leave_details(report_date);
