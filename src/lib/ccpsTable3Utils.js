/**
 * Utility functions to fetch and calculate CCPS Table 3 (Social Media Requests) data
 * for integration with DSR Table 12 (Content Blocking)
 */

/**
 * Get CCPS Table III data from localStorage for a specific date
 * @param {Date|string} date - The date to fetch data for (Date object or YYYY-MM-DD string)
 * @returns {Object|null} - Table III data or null if not found
 */
export function getCCPSTableIIIData(date) {
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
    
    const storageKey = `ccps-table3-${dateKey}`; // Match CCPS dashboard storage format
    console.log(`Fetching CCPS Table III data with key: ${storageKey}`);
    const data = localStorage.getItem(storageKey);
    
    if (data) {
      const parsedData = JSON.parse(data);
      console.log(`Found CCPS Table III data for ${dateKey}:`, parsedData);
      return parsedData;
    }
    
    console.log(`No CCPS Table III data found for key: ${storageKey}`);
    return null;
  } catch (error) {
    console.error('Error fetching CCPS Table III data:', error);
    return null;
  }
}

/**
 * Calculate grand total for social media platform by type from CCPS Table III data
 * @param {Object} tableIIIData - The table III data structure
 * @param {string} platform - The platform ('facebook', 'twitter', 'youtube', 'instagram', 'loanApps', 'otherApps', 'websites', 'telegram', 'whatsapp')
 * @param {string} type - The type ('sent', 'blocked')
 * @returns {number} - Grand total for the specified platform and type
 */
export function calculateSocialMediaGrandTotal(tableIIIData, platform, type) {
  if (!tableIIIData || !tableIIIData.districts || !Array.isArray(tableIIIData.districts)) {
    return 0;
  }

  return tableIIIData.districts.reduce((sum, district) => {
    if (district.socialMedia && district.socialMedia[platform] && typeof district.socialMedia[platform][type] === 'number') {
      return sum + district.socialMedia[platform][type];
    }
    return sum;
  }, 0);
}

/**
 * Get all social media grand totals for all platforms from CCPS Table III
 * @param {Date|string} date - The date to fetch data for (Date object or YYYY-MM-DD string)
 * @returns {Object} - Object containing all grand totals organized by platform and type
 */
export function getCCPSAllSocialMediaGrandTotals(date) {
  const tableIIIData = getCCPSTableIIIData(date);
  
  if (!tableIIIData) {
    return {
      facebook: { sent: 0, blocked: 0 },
      twitter: { sent: 0, blocked: 0 },
      youtube: { sent: 0, blocked: 0 },
      instagram: { sent: 0, blocked: 0 },
      loanApps: { sent: 0, blocked: 0 },
      otherApps: { sent: 0, blocked: 0 },
      websites: { sent: 0, blocked: 0 },
      telegram: { sent: 0, blocked: 0 },
      whatsapp: { sent: 0, blocked: 0 }
    };
  }

  const platforms = ['facebook', 'twitter', 'youtube', 'instagram', 'loanApps', 'otherApps', 'websites', 'telegram', 'whatsapp'];
  const types = ['sent', 'blocked'];
  
  const result = {};
  
  platforms.forEach(platform => {
    result[platform] = {};
    types.forEach(type => {
      result[platform][type] = calculateSocialMediaGrandTotal(tableIIIData, platform, type);
    });
  });
  
  return result;
}

/**
 * Map CCPS Table 3 platform names to DSR Table 12 platform keys
 * @param {string} ccpsPlatform - CCPS platform name
 * @returns {string} - DSR platform key
 */
export function mapCCPSToDSRPlatform(ccpsPlatform) {
  const mapping = {
    'facebook': 'facebook',
    'twitter': 'twitter',
    'youtube': 'youtube',
    'instagram': 'instagram',
    'loanApps': 'loanApps',
    'otherApps': 'otherApps',
    'websites': 'websites',
    'telegram': 'telegram',
    'whatsapp': 'whatsapp'
  };
  
  return mapping[ccpsPlatform] || ccpsPlatform;
}

/**
 * Get social media data formatted for DSR Table 12 integration
 * @param {Date|string} date - The date to fetch data for
 * @returns {Object} - Object containing data formatted for DSR Table 12
 */
export function getCCPSDataForDSRTable12(date) {
  const ccpsData = getCCPSAllSocialMediaGrandTotals(date);
  
  // Format data for DSR Table 12 structure
  const dsrFormattedData = {
    onDate: {},      // "No. of requests sent on date" -> maps to CCPS "sent"
    blocked: {},     // "No. of Contents blocked" -> maps to CCPS "blocked"
    fromDate: {},    // "No. of requests sent from 01.01.25 to till Date" -> could be cumulative or same as onDate
    pending: {}      // "No. of requests Pending" -> not available in CCPS, will remain 0
  };
  
  Object.keys(ccpsData).forEach(platform => {
    const dsrPlatform = mapCCPSToDSRPlatform(platform);
    
    dsrFormattedData.onDate[dsrPlatform] = {
      ccps: ccpsData[platform].sent,
      hqrs: 0 // Keep existing value, don't override
    };
    
    dsrFormattedData.blocked[dsrPlatform] = {
      ccps: ccpsData[platform].blocked,
      hqrs: 0 // Keep existing value, don't override
    };
    
    dsrFormattedData.fromDate[dsrPlatform] = {
      ccps: ccpsData[platform].sent, // Using same as onDate for now
      hqrs: 0 // Keep existing value, don't override
    };
    
    dsrFormattedData.pending[dsrPlatform] = {
      ccps: 0, // Not available in CCPS Table 3
      hqrs: 0 // Keep existing value, don't override
    };
  });
  
  return dsrFormattedData;
}
