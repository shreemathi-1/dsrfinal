/**
 * Utility functions for CCPS Table 1 (Financial & Non-Financial Complaints) integration with DSR Table 1
 */

/**
 * Get CCPS Table I data from localStorage for a specific date
 * @param {string|Date} date - Date in YYYY-MM-DD format or Date object
 * @returns {Object|null} CCPS Table I data or null if not found
 */
export const getCCPSTableIData = (date) => {
  try {
    // Convert date to YYYY-MM-DD format
    let dateKey;
    if (date instanceof Date) {
      dateKey = date.toISOString().split('T')[0];
    } else if (typeof date === 'string') {
      dateKey = date;
    } else {
      console.error('Invalid date format provided to getCCPSTableIData');
      return null;
    }

    const storageKey = `ccps-table1-${dateKey}`;
    const data = localStorage.getItem(storageKey);
    
    if (data) {
      return JSON.parse(data);
    }
    
    console.log(`No CCPS Table I data found for date: ${dateKey}`);
    return null;
  } catch (error) {
    console.error('Error fetching CCPS Table I data:', error);
    return null;
  }
};

/**
 * Calculate grand total for a specific section and fraud type in CCPS Table I
 * @param {Object} tableIData - CCPS Table I data
 * @param {string} section - Section name (complaints, fir, csr)
 * @param {string} fraudType - Fraud type (financial, nonFinancial)
 * @returns {number} Grand total value (sum of ncrp + direct)
 */
export const calculateTable1GrandTotal = (tableIData, section, fraudType) => {
  if (!tableIData || !tableIData.districts) {
    return 0;
  }

  try {
    return tableIData.districts.reduce((sum, district) => {
      const sectionData = district[section];
      if (sectionData && sectionData[fraudType]) {
        const ncrp = sectionData[fraudType].ncrp || 0;
        const direct = sectionData[fraudType].direct || 0;
        return sum + ncrp + direct;
      }
      return sum;
    }, 0);
  } catch (error) {
    console.error(`Error calculating grand total for ${section}.${fraudType}:`, error);
    return 0;
  }
};

/**
 * Get all CCPS Table I grand totals for DSR Table 1 integration
 * @param {string|Date} date - Date in YYYY-MM-DD format or Date object
 * @returns {Object} Object containing all grand totals mapped to DSR Table 1 structure
 */
export const getCCPSTable1GrandTotals = (date) => {
  const tableIData = getCCPSTableIData(date);
  
  if (!tableIData) {
    return {
      complaints: {
        financial: 0,
        nonFinancial: 0
      },
      fir: {
        financial: 0,
        nonFinancial: 0
      },
      csr: {
        financial: 0,
        nonFinancial: 0
      }
    };
  }

  // Calculate grand totals for each section and fraud type
  const complaintsFinancial = calculateTable1GrandTotal(tableIData, 'complaints', 'financial');
  const complaintsNonFinancial = calculateTable1GrandTotal(tableIData, 'complaints', 'nonFinancial');
  const firFinancial = calculateTable1GrandTotal(tableIData, 'fir', 'financial');
  const firNonFinancial = calculateTable1GrandTotal(tableIData, 'fir', 'nonFinancial');
  const csrFinancial = calculateTable1GrandTotal(tableIData, 'csr', 'financial');
  const csrNonFinancial = calculateTable1GrandTotal(tableIData, 'csr', 'nonFinancial');

  return {
    complaints: {
      financial: complaintsFinancial,
      nonFinancial: complaintsNonFinancial
    },
    fir: {
      financial: firFinancial,
      nonFinancial: firNonFinancial
    },
    csr: {
      financial: csrFinancial,
      nonFinancial: csrNonFinancial
    }
  };
};



/**
 * Get detailed CCPS Table I data for DSR Table 1 with separate financial/non-financial mapping
 * @param {string|Date} date - Selected date
 * @returns {Object} Detailed formatted data for DSR Table 1 if separate columns are needed
 */
export const getCCPSDetailedDataForDSRTable1 = (date) => {
  const grandTotals = getCCPSTable1GrandTotals(date);

  // Alternative mapping if DSR Table 1 needs separate financial/non-financial columns
  return {
    complaints: {
      financial: grandTotals.complaints.financial,
      nonFinancial: grandTotals.complaints.nonFinancial,
      total: grandTotals.complaints.financial + grandTotals.complaints.nonFinancial
    },
    firRegistered: {
      financial: grandTotals.fir.financial,
      nonFinancial: grandTotals.fir.nonFinancial,
      total: grandTotals.fir.financial + grandTotals.fir.nonFinancial
    },
    csrIssued: {
      financial: grandTotals.csr.financial,
      nonFinancial: grandTotals.csr.nonFinancial,
      total: grandTotals.csr.financial + grandTotals.csr.nonFinancial
    }
  };
};

/**
 * Get cumulative data from 01.01.2025 to specified date
 * @param {string|Date} endDate - End date in YYYY-MM-DD format or Date object
 * @returns {Object} Cumulative data for CCPS Table 1
 */
export const getCCPSTable1CumulativeData = (endDate) => {
  try {
    const startDate = new Date('2025-01-01');
    const end = new Date(endDate);
    
    let cumulativeData = {
      complaints: { financial: 0, nonFinancial: 0 },
      fir: { financial: 0, nonFinancial: 0 },
      csr: { financial: 0, nonFinancial: 0 }
    };
    
    // Iterate through each date from start to end
    for (let d = new Date(startDate); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      const dayData = getCCPSTable1GrandTotals(dateKey);
      
      if (dayData) {
        // Get individual financial and non-financial totals
        const tableData = getCCPSTableIData(dateKey);
        if (tableData && tableData.districts) {
          // Calculate financial and non-financial separately
          const complaintsFinancial = calculateTable1GrandTotal(tableData, 'complaints', 'financial');
          const complaintsNonFinancial = calculateTable1GrandTotal(tableData, 'complaints', 'nonFinancial');
          const firFinancial = calculateTable1GrandTotal(tableData, 'fir', 'financial');
          const firNonFinancial = calculateTable1GrandTotal(tableData, 'fir', 'nonFinancial');
          const csrFinancial = calculateTable1GrandTotal(tableData, 'csr', 'financial');
          const csrNonFinancial = calculateTable1GrandTotal(tableData, 'csr', 'nonFinancial');
          
          cumulativeData.complaints.financial += complaintsFinancial;
          cumulativeData.complaints.nonFinancial += complaintsNonFinancial;
          cumulativeData.fir.financial += firFinancial;
          cumulativeData.fir.nonFinancial += firNonFinancial;
          cumulativeData.csr.financial += csrFinancial;
          cumulativeData.csr.nonFinancial += csrNonFinancial;
        }
      }
    }
    
    return cumulativeData;
  } catch (error) {
    console.error('Error calculating cumulative CCPS Table 1 data:', error);
    return {
      complaints: { financial: 0, nonFinancial: 0 },
      fir: { financial: 0, nonFinancial: 0 },
      csr: { financial: 0, nonFinancial: 0 }
    };
  }
};

/**
 * Format CCPS Table I data for DSR Table 1 structure with date periods and Financial/Non-Financial columns
 * @param {string|Date} date - Selected date
 * @returns {Object} Formatted data for DSR Table 1 with CCPS column auto-populated
 */
export const getCCPSDataForDSRTable1 = (date) => {
  try {
    // Get data for the specific date
    const tableData = getCCPSTableIData(date);
    const cumulativeData = getCCPSTable1CumulativeData(date);
    
    let onDateData = {
      complaints: { financial: 0, nonFinancial: 0 },
      fir: { financial: 0, nonFinancial: 0 },
      csr: { financial: 0, nonFinancial: 0 }
    };
    
    if (tableData && tableData.districts) {
      onDateData.complaints.financial = calculateTable1GrandTotal(tableData, 'complaints', 'financial');
      onDateData.complaints.nonFinancial = calculateTable1GrandTotal(tableData, 'complaints', 'nonFinancial');
      onDateData.fir.financial = calculateTable1GrandTotal(tableData, 'fir', 'financial');
      onDateData.fir.nonFinancial = calculateTable1GrandTotal(tableData, 'fir', 'nonFinancial');
      onDateData.csr.financial = calculateTable1GrandTotal(tableData, 'csr', 'financial');
      onDateData.csr.nonFinancial = calculateTable1GrandTotal(tableData, 'csr', 'nonFinancial');
    }
    
    return {
      complaints: {
        onDate: {
          fin: onDateData.complaints.financial,
          nonFin: onDateData.complaints.nonFinancial,
          total: onDateData.complaints.financial + onDateData.complaints.nonFinancial
        },
        fromDate: {
          fin: cumulativeData.complaints.financial,
          nonFin: cumulativeData.complaints.nonFinancial,
          total: cumulativeData.complaints.financial + cumulativeData.complaints.nonFinancial
        },
        data2024: { fin: 0, nonFin: 0, total: 0 } // Manual entry only
      },
      firRegistered: {
        onDate: {
          fin: onDateData.fir.financial,
          nonFin: onDateData.fir.nonFinancial,
          total: onDateData.fir.financial + onDateData.fir.nonFinancial
        },
        fromDate: {
          fin: cumulativeData.fir.financial,
          nonFin: cumulativeData.fir.nonFinancial,
          total: cumulativeData.fir.financial + cumulativeData.fir.nonFinancial
        },
        data2024: { fin: 0, nonFin: 0, total: 0 } // Manual entry only
      },
      csrIssued: {
        onDate: {
          fin: onDateData.csr.financial,
          nonFin: onDateData.csr.nonFinancial,
          total: onDateData.csr.financial + onDateData.csr.nonFinancial
        },
        fromDate: {
          fin: cumulativeData.csr.financial,
          nonFin: cumulativeData.csr.nonFinancial,
          total: cumulativeData.csr.financial + cumulativeData.csr.nonFinancial
        },
        data2024: { fin: 0, nonFin: 0, total: 0 } // Manual entry only
      }
    };
  } catch (error) {
    console.error('Error getting CCPS data for DSR Table 1:', error);
    return {
      complaints: {
        onDate: { fin: 0, nonFin: 0, total: 0 },
        fromDate: { fin: 0, nonFin: 0, total: 0 },
        data2024: { fin: 0, nonFin: 0, total: 0 }
      },
      firRegistered: {
        onDate: { fin: 0, nonFin: 0, total: 0 },
        fromDate: { fin: 0, nonFin: 0, total: 0 },
        data2024: { fin: 0, nonFin: 0, total: 0 }
      },
      csrIssued: {
        onDate: { fin: 0, nonFin: 0, total: 0 },
        fromDate: { fin: 0, nonFin: 0, total: 0 },
        data2024: { fin: 0, nonFin: 0, total: 0 }
      }
    };
  }
};
