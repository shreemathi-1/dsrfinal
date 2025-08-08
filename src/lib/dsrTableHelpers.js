// DSR Table Database Helper Functions
// Comprehensive helper functions for all 21 DSR dashboard report tables

// Table configuration with field mappings
export const DSR_TABLE_CONFIG = {
  1: {
    name: 'complaints_ncrp_ccps',
    title: 'Complaints registered through NCRP and Complaints received by CCPS',
    fields: {
      fin_complaints_received: { type: 'number', label: 'Financial Complaints Received' },
      fin_complaints_disposed: { type: 'number', label: 'Financial Complaints Disposed' },
      fin_complaints_pending: { type: 'number', label: 'Financial Complaints Pending' },
      nonfin_complaints_received: { type: 'number', label: 'Non-Financial Complaints Received' },
      nonfin_complaints_disposed: { type: 'number', label: 'Non-Financial Complaints Disposed' },
      nonfin_complaints_pending: { type: 'number', label: 'Non-Financial Complaints Pending' }
    }
  },
  2: {
    name: 'amount_lost_frozen',
    title: 'Amount Lost, Frozen, Returned etc. in CCPS',
    fields: {
      amount_lost_on_date: { type: 'decimal', label: 'Amount Lost (On Date)' },
      amount_lost_from_date: { type: 'decimal', label: 'Amount Lost (From Date)' },
      amount_lost_2024: { type: 'decimal', label: 'Amount Lost (2024)' },
      amount_frozen_on_date: { type: 'decimal', label: 'Amount Frozen (On Date)' },
      amount_frozen_from_date: { type: 'decimal', label: 'Amount Frozen (From Date)' },
      amount_frozen_2024: { type: 'decimal', label: 'Amount Frozen (2024)' },
      amount_returned_on_date: { type: 'decimal', label: 'Amount Returned (On Date)' },
      amount_returned_from_date: { type: 'decimal', label: 'Amount Returned (From Date)' },
      amount_returned_2024: { type: 'decimal', label: 'Amount Returned (2024)' }
    }
  },
  3: {
    name: 'stages_of_cases',
    title: 'Stages of cases',
    fields: {
      investigation_stage: { type: 'number', label: 'Investigation Stage' },
      chargesheet_filed: { type: 'number', label: 'Chargesheet Filed' },
      court_proceedings: { type: 'number', label: 'Court Proceedings' },
      conviction: { type: 'number', label: 'Conviction' },
      acquittal: { type: 'number', label: 'Acquittal' },
      pending_trial: { type: 'number', label: 'Pending Trial' }
    }
  },
  4: {
    name: 'ncrp_complaints',
    title: 'NCRP Complaints status',
    fields: {
      financial_fraud: { type: 'number', label: 'Financial Fraud' },
      online_harassment: { type: 'number', label: 'Online Harassment' },
      data_theft: { type: 'number', label: 'Data Theft' },
      cyber_bullying: { type: 'number', label: 'Cyber Bullying' },
      other_complaints: { type: 'number', label: 'Other Complaints' },
      resolved: { type: 'number', label: 'Resolved' },
      pending: { type: 'number', label: 'Pending' },
      transferred: { type: 'number', label: 'Transferred' }
    }
  },
  5: {
    name: 'cctns_complaints',
    title: 'CCTNS Complaints status',
    fields: {
      fir_registered: { type: 'number', label: 'FIR Registered' },
      nc_registered: { type: 'number', label: 'NC Registered' },
      under_investigation: { type: 'number', label: 'Under Investigation' },
      chargesheet_filed: { type: 'number', label: 'Chargesheet Filed' },
      case_closed: { type: 'number', label: 'Case Closed' }
    }
  },
  6: {
    name: 'trending_mo',
    title: 'NEW MO/Trending MO Reported',
    fields: {
      mo_description: { type: 'text', label: 'MO Description' },
      frequency: { type: 'number', label: 'Frequency' },
      trend_status: { type: 'select', label: 'Trend Status', options: ['increasing', 'decreasing', 'stable'] },
      severity_level: { type: 'select', label: 'Severity Level', options: ['low', 'medium', 'high', 'critical'] }
    }
  },
  7: {
    name: 'helpline_1930',
    title: 'Details of Complaints received through helpline 1930',
    fields: {
      total_calls_received: { type: 'number', label: 'Total Calls Received' },
      complaints_registered: { type: 'number', label: 'Complaints Registered' },
      information_provided: { type: 'number', label: 'Information Provided' },
      calls_transferred: { type: 'number', label: 'Calls Transferred' },
      prank_calls: { type: 'number', label: 'Prank Calls' },
      average_response_time: { type: 'number', label: 'Average Response Time (seconds)' },
      satisfaction_rating: { type: 'decimal', label: 'Satisfaction Rating (0-5)' }
    }
  },
  8: {
    name: 'above_1_lakh',
    title: 'Cases where amount lost is 1 Lakh and above',
    fields: {
      total_cases: { type: 'number', label: 'Total Cases' },
      amount_involved: { type: 'decimal', label: 'Amount Involved' },
      cases_solved: { type: 'number', label: 'Cases Solved' },
      amount_recovered: { type: 'decimal', label: 'Amount Recovered' },
      cases_pending: { type: 'number', label: 'Cases Pending' }
    }
  },
  9: {
    name: 'above_50_lakh',
    title: 'Cases where amount lost is 50 Lakh and above',
    fields: {
      total_cases: { type: 'number', label: 'Total Cases' },
      amount_involved: { type: 'decimal', label: 'Amount Involved' },
      cases_solved: { type: 'number', label: 'Cases Solved' },
      amount_recovered: { type: 'decimal', label: 'Amount Recovered' },
      cases_pending: { type: 'number', label: 'Cases Pending' },
      special_investigation_team: { type: 'boolean', label: 'Special Investigation Team' }
    }
  },
  10: {
    name: 'meity_requests',
    title: 'Blocking requests sent to MeiTY and complied',
    fields: {
      requests_sent: { type: 'number', label: 'Requests Sent' },
      requests_complied: { type: 'number', label: 'Requests Complied' },
      requests_pending: { type: 'number', label: 'Requests Pending' },
      requests_rejected: { type: 'number', label: 'Requests Rejected' },
      url_blocking: { type: 'number', label: 'URL Blocking' },
      app_blocking: { type: 'number', label: 'App Blocking' },
      social_media_blocking: { type: 'number', label: 'Social Media Blocking' }
    }
  },
  11: {
    name: 'sim_blocking',
    title: 'SIM Blocking',
    fields: {
      requests_received: { type: 'number', label: 'Requests Received' },
      requests_processed: { type: 'number', label: 'Requests Processed' },
      sims_blocked: { type: 'number', label: 'SIMs Blocked' },
      requests_pending: { type: 'number', label: 'Requests Pending' },
      requests_rejected: { type: 'number', label: 'Requests Rejected' },
      airtel_blocked: { type: 'number', label: 'Airtel Blocked' },
      jio_blocked: { type: 'number', label: 'Jio Blocked' },
      vi_blocked: { type: 'number', label: 'VI Blocked' },
      bsnl_blocked: { type: 'number', label: 'BSNL Blocked' },
      other_operators_blocked: { type: 'number', label: 'Other Operators Blocked' }
    }
  },
  12: {
    name: 'content_blocking',
    title: 'Content Blocking',
    fields: {
      urls_reported: { type: 'number', label: 'URLs Reported' },
      urls_blocked: { type: 'number', label: 'URLs Blocked' },
      social_media_accounts_blocked: { type: 'number', label: 'Social Media Accounts Blocked' },
      apps_blocked: { type: 'number', label: 'Apps Blocked' },
      websites_blocked: { type: 'number', label: 'Websites Blocked' },
      facebook_blocks: { type: 'number', label: 'Facebook Blocks' },
      instagram_blocks: { type: 'number', label: 'Instagram Blocks' },
      twitter_blocks: { type: 'number', label: 'Twitter Blocks' },
      youtube_blocks: { type: 'number', label: 'YouTube Blocks' },
      other_platform_blocks: { type: 'number', label: 'Other Platform Blocks' }
    }
  },
  13: {
    name: 'ceir_data',
    title: 'Details of Central Equipment Identity Register (CEIR)',
    fields: {
      devices_reported_stolen: { type: 'number', label: 'Devices Reported Stolen' },
      devices_blocked: { type: 'number', label: 'Devices Blocked' },
      devices_unblocked: { type: 'number', label: 'Devices Unblocked' },
      devices_traced: { type: 'number', label: 'Devices Traced' },
      smartphones_blocked: { type: 'number', label: 'Smartphones Blocked' },
      tablets_blocked: { type: 'number', label: 'Tablets Blocked' },
      laptops_blocked: { type: 'number', label: 'Laptops Blocked' },
      other_devices_blocked: { type: 'number', label: 'Other Devices Blocked' },
      devices_recovered: { type: 'number', label: 'Devices Recovered' },
      recovery_value: { type: 'decimal', label: 'Recovery Value' }
    }
  },
  14: {
    name: 'linkage_cases',
    title: 'Interstate and Intrastate Linkage Cases',
    fields: {
      interstate_cases: { type: 'number', label: 'Interstate Cases' },
      intrastate_cases: { type: 'number', label: 'Intrastate Cases' },
      international_cases: { type: 'number', label: 'International Cases' },
      states_coordinated_with: { type: 'number', label: 'States Coordinated With' },
      joint_investigations: { type: 'number', label: 'Joint Investigations' },
      information_shared: { type: 'number', label: 'Information Shared' },
      cases_solved_through_linkage: { type: 'number', label: 'Cases Solved Through Linkage' },
      arrests_made: { type: 'number', label: 'Arrests Made' }
    }
  },
  15: {
    name: 'ciar_data',
    title: 'Details of Cyber Crime Investigation Assistance Request (CIAR)',
    fields: {
      requests_received: { type: 'number', label: 'Requests Received' },
      requests_processed: { type: 'number', label: 'Requests Processed' },
      requests_pending: { type: 'number', label: 'Requests Pending' },
      technical_assistance: { type: 'number', label: 'Technical Assistance' },
      digital_forensics: { type: 'number', label: 'Digital Forensics' },
      data_analysis: { type: 'number', label: 'Data Analysis' },
      expert_opinion: { type: 'number', label: 'Expert Opinion' },
      average_processing_time: { type: 'number', label: 'Average Processing Time (days)' },
      success_rate: { type: 'decimal', label: 'Success Rate (%)' }
    }
  },
  16: {
    name: 'ccw_headquarters',
    title: 'Investigation of cases at CCW headquarters',
    fields: {
      cases_received: { type: 'number', label: 'Cases Received' },
      cases_under_investigation: { type: 'number', label: 'Cases Under Investigation' },
      cases_completed: { type: 'number', label: 'Cases Completed' },
      cases_transferred: { type: 'number', label: 'Cases Transferred' },
      arrests_made: { type: 'number', label: 'Arrests Made' },
      chargesheets_filed: { type: 'number', label: 'Chargesheets Filed' },
      convictions: { type: 'number', label: 'Convictions' },
      acquittals: { type: 'number', label: 'Acquittals' },
      officers_deployed: { type: 'number', label: 'Officers Deployed' },
      technical_experts_involved: { type: 'number', label: 'Technical Experts Involved' }
    }
  },
  17: {
    name: 'awareness_programs',
    title: 'Awareness Conducted',
    fields: {
      programs_conducted: { type: 'number', label: 'Programs Conducted' },
      participants_reached: { type: 'number', label: 'Participants Reached' },
      schools_covered: { type: 'number', label: 'Schools Covered' },
      colleges_covered: { type: 'number', label: 'Colleges Covered' },
      corporate_sessions: { type: 'number', label: 'Corporate Sessions' },
      cyber_safety_sessions: { type: 'number', label: 'Cyber Safety Sessions' },
      financial_fraud_awareness: { type: 'number', label: 'Financial Fraud Awareness' },
      social_media_safety: { type: 'number', label: 'Social Media Safety' },
      digital_literacy: { type: 'number', label: 'Digital Literacy' },
      pamphlets_distributed: { type: 'number', label: 'Pamphlets Distributed' },
      digital_content_shared: { type: 'number', label: 'Digital Content Shared' }
    }
  },
  18: {
    name: 'cyber_volunteers',
    title: 'Cyber Volunteers',
    fields: {
      total_volunteers: { type: 'number', label: 'Total Volunteers' },
      active_volunteers: { type: 'number', label: 'Active Volunteers' },
      new_registrations: { type: 'number', label: 'New Registrations' },
      volunteers_trained: { type: 'number', label: 'Volunteers Trained' },
      complaints_handled: { type: 'number', label: 'Complaints Handled' },
      awareness_sessions_conducted: { type: 'number', label: 'Awareness Sessions Conducted' },
      social_media_monitoring: { type: 'number', label: 'Social Media Monitoring' },
      community_outreach: { type: 'number', label: 'Community Outreach' },
      average_response_time: { type: 'number', label: 'Average Response Time (hours)' },
      satisfaction_rating: { type: 'decimal', label: 'Satisfaction Rating' }
    }
  },
  19: {
    name: 'social_media_posts',
    title: 'Posts uploaded in Social Media',
    fields: {
      posts_uploaded: { type: 'number', label: 'Posts Uploaded' },
      awareness_posts: { type: 'number', label: 'Awareness Posts' },
      case_updates: { type: 'number', label: 'Case Updates' },
      safety_tips: { type: 'number', label: 'Safety Tips' },
      facebook_posts: { type: 'number', label: 'Facebook Posts' },
      twitter_posts: { type: 'number', label: 'Twitter Posts' },
      instagram_posts: { type: 'number', label: 'Instagram Posts' },
      youtube_videos: { type: 'number', label: 'YouTube Videos' },
      linkedin_posts: { type: 'number', label: 'LinkedIn Posts' },
      total_reach: { type: 'number', label: 'Total Reach' },
      total_likes: { type: 'number', label: 'Total Likes' },
      total_shares: { type: 'number', label: 'Total Shares' },
      total_comments: { type: 'number', label: 'Total Comments' }
    }
  },
  20: {
    name: 'training_programs',
    title: 'Trainings Conducted',
    fields: {
      programs_conducted: { type: 'number', label: 'Programs Conducted' },
      officers_trained: { type: 'number', label: 'Officers Trained' },
      civilian_participants: { type: 'number', label: 'Civilian Participants' },
      training_hours: { type: 'number', label: 'Training Hours' },
      cyber_investigation_training: { type: 'number', label: 'Cyber Investigation Training' },
      digital_forensics_training: { type: 'number', label: 'Digital Forensics Training' },
      awareness_training: { type: 'number', label: 'Awareness Training' },
      technical_skills_training: { type: 'number', label: 'Technical Skills Training' },
      certifications_issued: { type: 'number', label: 'Certifications Issued' },
      pass_rate: { type: 'decimal', label: 'Pass Rate (%)' },
      feedback_score: { type: 'decimal', label: 'Feedback Score' }
    }
  },
  21: {
    name: 'duty_leave_details',
    title: 'Districts/cities CCPS Duty & Leave Details',
    fields: {
      total_sanctioned_posts: { type: 'number', label: 'Total Sanctioned Posts' },
      posts_filled: { type: 'number', label: 'Posts Filled' },
      posts_vacant: { type: 'number', label: 'Posts Vacant' },
      officers_on_duty: { type: 'number', label: 'Officers on Duty' },
      officers_on_leave: { type: 'number', label: 'Officers on Leave' },
      officers_on_training: { type: 'number', label: 'Officers on Training' },
      officers_on_deputation: { type: 'number', label: 'Officers on Deputation' },
      casual_leave: { type: 'number', label: 'Casual Leave' },
      earned_leave: { type: 'number', label: 'Earned Leave' },
      medical_leave: { type: 'number', label: 'Medical Leave' },
      maternity_leave: { type: 'number', label: 'Maternity Leave' },
      cases_handled: { type: 'number', label: 'Cases Handled' },
      response_time_hours: { type: 'decimal', label: 'Response Time (hours)' },
      overtime_hours: { type: 'number', label: 'Overtime Hours' }
    }
  }
};

// Helper functions for DSR table operations
export const dsrTableHelpers = {
  // Get table configuration
  getTableConfig: (tableId) => {
    return DSR_TABLE_CONFIG[tableId] || null;
  },

  // Get all table configurations
  getAllTableConfigs: () => {
    return DSR_TABLE_CONFIG;
  },

  // Validate table data
  validateTableData: (tableId, data) => {
    const config = DSR_TABLE_CONFIG[tableId];
    if (!config) {
      throw new Error(`Invalid table ID: ${tableId}`);
    }

    const errors = [];
    const fields = config.fields;

    Object.keys(fields).forEach(fieldName => {
      const fieldConfig = fields[fieldName];
      const value = data[fieldName];

      if (value !== undefined && value !== null && value !== '') {
        switch (fieldConfig.type) {
          case 'number':
            if (isNaN(value) || value < 0) {
              errors.push(`${fieldConfig.label} must be a valid positive number`);
            }
            break;
          case 'decimal':
            if (isNaN(value) || value < 0) {
              errors.push(`${fieldConfig.label} must be a valid positive decimal`);
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push(`${fieldConfig.label} must be true or false`);
            }
            break;
          case 'select':
            if (fieldConfig.options && !fieldConfig.options.includes(value)) {
              errors.push(`${fieldConfig.label} must be one of: ${fieldConfig.options.join(', ')}`);
            }
            break;
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Format data for display
  formatDisplayValue: (tableId, fieldName, value) => {
    const config = DSR_TABLE_CONFIG[tableId];
    if (!config || !config.fields[fieldName]) {
      return value;
    }

    const fieldConfig = config.fields[fieldName];

    switch (fieldConfig.type) {
      case 'decimal':
        return typeof value === 'number' ? value.toFixed(2) : value;
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return value;
    }
  },

  // Get default values for a table
  getDefaultValues: (tableId) => {
    const config = DSR_TABLE_CONFIG[tableId];
    if (!config) {
      return {};
    }

    const defaults = {};
    Object.keys(config.fields).forEach(fieldName => {
      const fieldConfig = config.fields[fieldName];
      switch (fieldConfig.type) {
        case 'number':
        case 'decimal':
          defaults[fieldName] = 0;
          break;
        case 'boolean':
          defaults[fieldName] = false;
          break;
        case 'text':
        case 'select':
          defaults[fieldName] = '';
          break;
        default:
          defaults[fieldName] = null;
      }
    });

    return defaults;
  },

  // API helper functions
  async fetchTableData(tableId, filters = {}) {
    try {
      const params = new URLSearchParams({
        tableId: tableId.toString(),
        ...filters
      });

      const response = await fetch(`/api/dsr-tables?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      return result;
    } catch (error) {
      console.error('Error fetching table data:', error);
      throw error;
    }
  },

  async saveTableData(tableId, data, userId) {
    try {
      const validation = this.validateTableData(tableId, data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const response = await fetch('/api/dsr-tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableId,
          data,
          userId
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save data');
      }

      return result;
    } catch (error) {
      console.error('Error saving table data:', error);
      throw error;
    }
  },

  async updateTableData(tableId, id, data, userId) {
    try {
      const validation = this.validateTableData(tableId, data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const response = await fetch('/api/dsr-tables', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableId,
          id,
          data,
          userId
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update data');
      }

      return result;
    } catch (error) {
      console.error('Error updating table data:', error);
      throw error;
    }
  },

  async deleteTableData(tableId, id) {
    try {
      const response = await fetch(`/api/dsr-tables?tableId=${tableId}&id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete data');
      }

      return result;
    } catch (error) {
      console.error('Error deleting table data:', error);
      throw error;
    }
  }
};
