/**
 * Utility functions to fetch and calculate CCPS Table 4 data
 * for integration with DSR Table 21
 */

/**
 * Get CCPS Table IV data from localStorage for a specific date
 * @param {Date|string} date - The date to fetch data for (Date object or YYYY-MM-DD string)
 * @returns {Object|null} - Table IV data or null if not found
 */
export function getCCPSTableIVData(date) {
  try {
    // Handle both Date objects and string formats
    let dateKey;
    if (typeof date === 'string') {
      // If it's already a string in YYYY-MM-DD format, use it directly
      dateKey = date;
    } else if (date instanceof Date) {
      // If it's a Date object, convert to YYYY-MM-DD format
      dateKey = date.toISOString().split('T')[0];
    } else {
      console.error('Invalid date format provided:', date);
      return null;
    }
    
    const storageKey = `ccps-table4-${dateKey}`; // Match CCPS dashboard storage format
    console.log(`Fetching CCPS Table IV data with key: ${storageKey}`);
    const data = localStorage.getItem(storageKey);
    
    if (data) {
      const parsedData = JSON.parse(data);
      console.log(`Found CCPS Table IV data for ${dateKey}:`, parsedData);
      return parsedData;
    }
    
    console.log(`No CCPS Table IV data found for key: ${storageKey}`);
    return null;
  } catch (error) {
    console.error('Error fetching CCPS Table IV data:', error);
    return null;
  }
}

/**
 * Calculate grand total for B/D duty by role from CCPS Table IV data
 * @param {Object} tableIVData - The table IV data structure
 * @param {string} role - The role to calculate for ('adsp', 'inspector', 'si', 'others')
 * @returns {number} - Grand total for the specified role's B/D duty
 */
export function calculateBDDutyGrandTotal(tableIVData, role = 'adsp') {
  if (!tableIVData || !tableIVData.districts || !Array.isArray(tableIVData.districts)) {
    return 0;
  }

  return tableIVData.districts.reduce((sum, district) => {
    if (district.dutyAndLeave && district.dutyAndLeave[role] && typeof district.dutyAndLeave[role].bdDuty === 'number') {
      return sum + district.dutyAndLeave[role].bdDuty;
    }
    return sum;
  }, 0);
}

/**
 * Calculate grand total for any duty/leave type by role from CCPS Table IV data
 * @param {Object} tableIVData - The table IV data structure
 * @param {string} role - The role to calculate for ('adsp', 'inspector', 'si', 'others')
 * @param {string} dutyType - The duty type ('bdDuty', 'cl', 'mlEl', 'od')
 * @returns {number} - Grand total for the specified role and duty type
 */
export function calculateDutyLeaveGrandTotal(tableIVData, role = 'adsp', dutyType = 'bdDuty') {
  if (!tableIVData || !tableIVData.districts || !Array.isArray(tableIVData.districts)) {
    return 0;
  }

  return tableIVData.districts.reduce((sum, district) => {
    if (district.dutyAndLeave && district.dutyAndLeave[role] && typeof district.dutyAndLeave[role][dutyType] === 'number') {
      return sum + district.dutyAndLeave[role][dutyType];
    }
    return sum;
  }, 0);
}

/**
 * Get all duty and leave grand totals for all roles from CCPS Table IV
 * @param {Date|string} date - The date to fetch data for (Date object or YYYY-MM-DD string)
 * @returns {Object} - Object containing all grand totals organized by duty type and role
 */
export function getCCPSAllDutyLeaveGrandTotals(date) {
  const tableIVData = getCCPSTableIVData(date);
  
  if (!tableIVData) {
    return {
      bdDuty: { adsp: 0, inspector: 0, si: 0, others: 0 },
      cl: { adsp: 0, inspector: 0, si: 0, others: 0 },
      mlEl: { adsp: 0, inspector: 0, si: 0, others: 0 },
      od: { adsp: 0, inspector: 0, si: 0, others: 0 }
    };
  }

  const roles = ['adsp', 'inspector', 'si', 'others'];
  const dutyTypes = ['bdDuty', 'cl', 'mlEl', 'od'];
  
  const result = {};
  
  dutyTypes.forEach(dutyType => {
    result[dutyType] = {};
    roles.forEach(role => {
      result[dutyType][role] = calculateDutyLeaveGrandTotal(tableIVData, role, dutyType);
    });
  });
  
  return result;
}

/**
 * Get all B/D duty grand totals for all roles from CCPS Table IV
 * @param {Date|string} date - The date to fetch data for (Date object or YYYY-MM-DD string)
 * @returns {Object} - Object containing grand totals for all roles
 * @deprecated Use getCCPSAllDutyLeaveGrandTotals instead
 */
export function getCCPSBDDutyGrandTotals(date) {
  const allTotals = getCCPSAllDutyLeaveGrandTotals(date);
  return allTotals.bdDuty;
}

/**
 * Get the report date (yesterday if today is selected)
 * This matches the logic used in CCPS dashboard
 * @param {Date|string} date - The selected date (Date object or YYYY-MM-DD string)
 * @returns {Date|string} - The actual report date in the same format as input
 */
export function getReportDate(date) {
  if (typeof date === 'string') {
    // Handle string format (YYYY-MM-DD)
    const dateObj = new Date(date + 'T00:00:00');
    const yesterday = new Date(dateObj);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0]; // Return as YYYY-MM-DD string
  } else {
    // Handle Date object format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yest = new Date(date);
    yest.setDate(yest.getDate() - 1);
    return yest;
  }
}
