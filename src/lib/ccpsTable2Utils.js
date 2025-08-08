/**
 * Utility functions for CCPS Table 2 (CSR Conversion) integration with DSR Table 2 (Amount Lost/Frozen)
 */

/**
 * Get CCPS Table II data from localStorage for a specific date
 * @param {string|Date} date - Date in YYYY-MM-DD format or Date object
 * @returns {Object|null} CCPS Table II data or null if not found
 */
export const getCCPSTableIIData = (date) => {
  try {
    // Convert date to YYYY-MM-DD format
    let dateKey;
    if (date instanceof Date) {
      dateKey = date.toISOString().split('T')[0];
    } else if (typeof date === 'string') {
      dateKey = date;
    } else {
      console.error('Invalid date format provided to getCCPSTableIIData');
      return null;
    }

    const storageKey = `ccps-table2-${dateKey}`;
    const data = localStorage.getItem(storageKey);
    
    if (data) {
      return JSON.parse(data);
    }
    
    console.log(`No CCPS Table II data found for date: ${dateKey}`);
    return null;
  } catch (error) {
    console.error('Error fetching CCPS Table II data:', error);
    return null;
  }
};

/**
 * Calculate grand total for a specific field in CCPS Table II
 * @param {Object} tableIIData - CCPS Table II data
 * @param {string} field - Field name to calculate grand total for
 * @param {string} subField - Sub-field name (optional, for nested fields)
 * @returns {number} Grand total value
 */
export const calculateTable2GrandTotal = (tableIIData, field, subField = null) => {
  if (!tableIIData || !tableIIData.districts) {
    return 0;
  }

  try {
    return tableIIData.districts.reduce((sum, district) => {
      if (subField) {
        return sum + (district[field]?.[subField] || 0);
      } else {
        return sum + (district[field] || 0);
      }
    }, 0);
  } catch (error) {
    console.error(`Error calculating grand total for ${field}${subField ? `.${subField}` : ''}:`, error);
    return 0;
  }
};

/**
 * Get all CCPS Table II grand totals for DSR Table 2 integration
 * @param {string|Date} date - Date in YYYY-MM-DD format or Date object
 * @returns {Object} Object containing all grand totals mapped to DSR Table 2 structure
 */
export const getCCPSTable2GrandTotals = (date) => {
  const tableIIData = getCCPSTableIIData(date);
  
  if (!tableIIData) {
    return {
      amountLost: 0,           // Row 1: Amount Lost (5th column in CCPS)
      amountFrozen: 0,         // Row 2: Amount Frozen (6th column in CCPS)
      amountReturned: 0,       // Row 3: Amount Returned (7th column in CCPS)
      accusedArrested: 0,      // Row 4: Number of Accused Arrested (8th column in CCPS)
      casesInGoondas: 0,       // Row 5: Cases in Goondas (9th column in CCPS)
      loanAppTotal: 0,         // Row 6: Sum of loan app cases (10th column total)
      loanAppFir: 0,           // Row 7: Loan App FIR Registered (10th column, 1st inner)
      loanAppCsr: 0            // Row 8: Loan App CSR Issued (10th column, 2nd inner)
    };
  }

  // Calculate grand totals for each field
  const amountLost = calculateTable2GrandTotal(tableIIData, 'amountLost');
  const amountFrozen = calculateTable2GrandTotal(tableIIData, 'amountFrozen');
  const amountReturned = calculateTable2GrandTotal(tableIIData, 'amountReturned');
  const accusedArrested = calculateTable2GrandTotal(tableIIData, 'accusedArrested');
  const casesInGoondas = calculateTable2GrandTotal(tableIIData, 'casesInGoondas');
  const loanAppFir = calculateTable2GrandTotal(tableIIData, 'loanAppCases', 'firRegistered');
  const loanAppCsr = calculateTable2GrandTotal(tableIIData, 'loanAppCases', 'csrIssued');
  const loanAppTotal = loanAppFir + loanAppCsr; // Sum of inner columns

  return {
    amountLost,
    amountFrozen,
    amountReturned,
    accusedArrested,
    casesInGoondas,
    loanAppTotal,
    loanAppFir,
    loanAppCsr
  };
};

/**
 * Get cumulative CCPS Table II data from 01.01.2025 to current date
 * @param {string|Date} endDate - End date (current date)
 * @returns {Object} Object containing cumulative totals for all fields
 */
export const getCCPSTable2CumulativeData = (endDate) => {
  try {
    // Convert end date to Date object
    let currentDate;
    if (endDate instanceof Date) {
      currentDate = new Date(endDate);
    } else {
      currentDate = new Date(endDate);
    }

    // Start from 01.01.2025
    const startDate = new Date('2025-01-01');
    
    // Initialize cumulative totals
    const cumulativeTotals = {
      amountLost: 0,
      amountFrozen: 0,
      amountReturned: 0,
      accusedArrested: 0,
      casesInGoondas: 0,
      loanAppTotal: 0,
      loanAppFir: 0,
      loanAppCsr: 0
    };

    // Iterate through each date from start to end
    const iterDate = new Date(startDate);
    while (iterDate <= currentDate) {
      const dateKey = iterDate.toISOString().split('T')[0];
      const dayTotals = getCCPSTable2GrandTotals(dateKey);
      
      // Add each day's totals to cumulative
      Object.keys(cumulativeTotals).forEach(key => {
        cumulativeTotals[key] += dayTotals[key] || 0;
      });

      // Move to next day
      iterDate.setDate(iterDate.getDate() + 1);
    }

    return cumulativeTotals;
  } catch (error) {
    console.error('Error calculating cumulative CCPS Table II data:', error);
    return {
      amountLost: 0,
      amountFrozen: 0,
      amountReturned: 0,
      accusedArrested: 0,
      casesInGoondas: 0,
      loanAppTotal: 0,
      loanAppFir: 0,
      loanAppCsr: 0
    };
  }
};

/**
 * Format CCPS Table II data for DSR Table 2 structure
 * @param {string|Date} date - Selected date
 * @returns {Object} Formatted data for DSR Table 2 with onDate and fromDate columns
 */
export const getCCPSDataForDSRTable2 = (date) => {
  const onDateTotals = getCCPSTable2GrandTotals(date);
  const fromDateTotals = getCCPSTable2CumulativeData(date);

  // Map CCPS data to DSR Table 2 structure
  // Note: DSR Table 2 currently has only 3 rows (amount_lost, amount_frozen, amount_returned)
  // But we need to expand it to accommodate all 8 mappings as per user requirements
  
  return {
    // Current DSR Table 2 structure (first 3 rows)
    amount_lost: {
      onDate: onDateTotals.amountLost,
      fromDate: fromDateTotals.amountLost
    },
    amount_frozen: {
      onDate: onDateTotals.amountFrozen,
      fromDate: fromDateTotals.amountFrozen
    },
    amount_returned: {
      onDate: onDateTotals.amountReturned,
      fromDate: fromDateTotals.amountReturned
    },
    
    // Additional rows needed for complete mapping (rows 4-8)
    accused_arrested: {
      onDate: onDateTotals.accusedArrested,
      fromDate: fromDateTotals.accusedArrested
    },
    cases_in_goondas: {
      onDate: onDateTotals.casesInGoondas,
      fromDate: fromDateTotals.casesInGoondas
    },
    loan_app_total: {
      onDate: onDateTotals.loanAppTotal,
      fromDate: fromDateTotals.loanAppTotal
    },
    loan_app_fir: {
      onDate: onDateTotals.loanAppFir,
      fromDate: fromDateTotals.loanAppFir
    },
    loan_app_csr: {
      onDate: onDateTotals.loanAppCsr,
      fromDate: fromDateTotals.loanAppCsr
    }
  };
};
