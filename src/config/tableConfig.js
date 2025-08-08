// Table visibility configuration based on user_type
export const TABLE_CONFIG = {
  DSR: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], // All 21 tables
  NCRP: [1, 2, 3, 4, 5],
  MOA: [6],
  'Helpline Center': [7, 8, 9],
  'Sim and Content Blocking': [10, 11, 12], // Single department for both sim and content blocking
  CEIR: [13],
  JMIS: [14, 15],
  SCCIC: [16],
  'Cyber arangam': [17, 18, 19, 20],
  CCPS: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21] // All 21 tables
};

// Table definitions with titles and descriptions
export const TABLE_DEFINITIONS = {
  1: {
    title: "Complaints registered through NCRP and Complaints received by CCPS",
    type: "complaintsTable",
    description: "Financial and Non-financial Cyber Frauds"
  },
  2: {
    title: "Amount Lost, Frozen, Returned etc. in CCPS",
    type: "amountTable",
    description: "Financial data related to cyber crimes"
  },
  3: {
    title: "Stages of cases",
    type: "stagesTable",
    description: "Case progression tracking"
  },
  4: {
    title: "NCRP Complaint Categories",
    type: "categoryTable",
    description: "Breakdown of complaint types received through NCRP"
  },
  5: {
    title: "NCRP Monthly Trends",
    type: "trendsTable",
    description: "Monthly analysis of NCRP complaints"
  },
  6: {
    title: "MOA Coordination Activities",
    type: "moaTable",
    description: "Ministry of Affairs coordination and activities"
  },
  7: {
    title: "Helpline Call Statistics",
    type: "callStatsTable",
    description: "Statistics of calls received at helpline center"
  },
  8: {
    title: "Helpline Resolution Status",
    type: "resolutionTable",
    description: "Status of issues resolved through helpline"
  },
  9: {
    title: "Helpline Feedback Analysis",
    type: "feedbackTable",
    description: "Analysis of feedback received from helpline users"
  },
  10: {
    title: "SIM Blocking Requests",
    type: "simBlockingTable",
    description: "Requests and actions for SIM blocking"
  },
  11: {
    title: "Content Blocking Activities",
    type: "contentBlockingTable",
    description: "Content blocking requests and implementations"
  },
  12: {
    title: "Blocking Effectiveness Report",
    type: "blockingEffectivenessTable",
    description: "Effectiveness analysis of blocking measures"
  },
  13: {
    title: "CEIR Device Blocking",
    type: "ceirTable",
    description: "Central Equipment Identity Register device blocking data"
  },
  14: {
    title: "JMIS Case Management",
    type: "jmisCaseTable",
    description: "Judicial Management Information System case data"
  },
  15: {
    title: "JMIS Court Proceedings",
    type: "jmisCourtTable",
    description: "Court proceedings tracked through JMIS"
  },
  16: {
    title: "SCCIC Coordination",
    type: "sccicTable",
    description: "State Cyber Crime Investigation Cell coordination activities"
  },
  17: {
    title: "Cyber Arangam Training Programs",
    type: "trainingTable",
    description: "Training programs conducted under Cyber Arangam"
  },
  18: {
    title: "Cyber Arangam Awareness Campaigns",
    type: "awarenessTable",
    description: "Awareness campaigns and their reach"
  },
  19: {
    title: "Cyber Arangam Resource Utilization",
    type: "resourceTable",
    description: "Utilization of resources in Cyber Arangam initiatives"
  },
  20: {
    title: "Cyber Arangam Impact Assessment",
    type: "impactTable",
    description: "Assessment of impact of Cyber Arangam programs"
  },
  21: {
    title: "Overall DSR Summary",
    type: "summaryTable",
    description: "Comprehensive summary of all DSR activities"
  }
};

// Function to get visible tables for a user type
export const getVisibleTables = (userType) => {
  // Normalize user type to handle case variations and department mappings
  const normalizedUserType = normalizeUserType(userType);
  return TABLE_CONFIG[normalizedUserType] || [];
};

// Function to normalize user type for consistent mapping
export const normalizeUserType = (userType) => {
  if (!userType) return 'DSR';
  
  const type = userType.toLowerCase().trim().replace(/[_-]/g, ' ');
  
  // Map department names to user types
  const departmentMapping = {
    'dsr': 'DSR',
    'ncrp': 'NCRP',
    'moa': 'MOA',
    'helpline center': 'Helpline Center',
    'helpline': 'Helpline Center',
    'sim and content blocking': 'Sim and Content Blocking',
    'sim blocking': 'Sim and Content Blocking',
    'content blocking': 'Sim and Content Blocking',
    'blocking': 'Sim and Content Blocking',
    'ceir': 'CEIR',
    'jmis': 'JMIS',
    'sccic': 'SCCIC',
    'scic': 'SCCIC', // Alternative name
    'cyber arangam': 'Cyber arangam',
    'cyber': 'Cyber arangam',
    'ccps': 'CCPS'
  };
  
  return departmentMapping[type] || 'DSR';
};

// Function to check if a table should be visible for a user
export const isTableVisible = (tableNumber, userType) => {
  const visibleTables = getVisibleTables(userType);
  return visibleTables.includes(tableNumber);
};

// Function to get table definition
export const getTableDefinition = (tableNumber) => {
  return TABLE_DEFINITIONS[tableNumber] || null;
};

// Function to check if user should be redirected to CCPS dashboard
export const shouldRedirectToCCPS = (userType) => {
  const normalizedUserType = normalizeUserType(userType);
  return normalizedUserType === 'CCPS';
};

// Function to check if department should go directly to reports page
export const shouldRedirectToReports = (department) => {
  if (!department) return false;
  
  const normalizedDept = department.toLowerCase().trim().replace(/[_-]/g, ' ');
  
  // Departments that should go directly to reports
  const reportsOnlyDepartments = [
    'moa',
    'helpline center',
    'helpline',
    'sim and content blocking',
    'sim blocking',
    'content blocking',
    'blocking',
    'jmis',
    'ceir',
    'cyber arangam',
    'cyber'
  ];
  
  return reportsOnlyDepartments.includes(normalizedDept);
};

// Function to get all table components for a user type
export const getTableComponentsForUser = (userType) => {
  const visibleTables = getVisibleTables(userType);
  return visibleTables.map(tableNumber => ({
    number: tableNumber,
    definition: getTableDefinition(tableNumber)
  }));
};
