import { supabase } from './supabaseClient';

// Generic function to save DSR data
export const saveDSRData = async (tableId, data, reportDate) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Map tableId to actual table name
    const tableMap = {
      'complaints_ncrp_ccps': 'dsr_complaints_ncrp_ccps',
      'amount_lost_frozen': 'dsr_amount_tracking',
      'stages_of_cases': 'dsr_case_stages',
      'ncrp_complaints': 'dsr_ncrp_complaints',
      'cctns_complaints': 'dsr_cctns_complaints',
      'trending_mo': 'dsr_trending_mo',
      'helpline_1930': 'dsr_helpline_1930',
      'cases_above_1lakh': 'dsr_cases_above_1lakh',
      'cases_above_50lakh': 'dsr_cases_above_50lakh',
      'meity_requests': 'dsr_meity_requests',
      'sim_blocking': 'dsr_sim_blocking',
      'content_blocking': 'dsr_content_blocking',
      'ceir': 'dsr_ceir',
      'linkage_cases': 'dsr_linkage_cases',
      'ciar': 'dsr_ciar',
      'ccw_headquarters': 'dsr_ccw_headquarters',
      'awareness': 'dsr_awareness',
      'cyber_volunteers': 'dsr_cyber_volunteers',
      'social_media': 'dsr_social_media',
      'trainings': 'dsr_trainings',
      'duty_leave': 'dsr_duty_leave'
    };

    const tableName = tableMap[tableId];
    if (!tableName) {
      throw new Error('Invalid table ID');
    }

    // Transform data based on table type
    let transformedData = {
      report_date: reportDate,
      district: user.user_metadata?.district || 'Unknown',
      created_by: user.id,
      updated_by: user.id
    };

    if (tableId === 'complaints_ncrp_ccps') {
      // Transform CCPS data - flatten the districts array structure
      const district = data.districts?.[0] || {};
      transformedData = {
        ...transformedData,
        // Complaints data
        complaints_financial_ncrp: district.complaints?.financial?.ncrp || 0,
        complaints_financial_direct: district.complaints?.financial?.direct || 0,
        complaints_non_financial_ncrp: district.complaints?.nonFinancial?.ncrp || 0,
        complaints_non_financial_direct: district.complaints?.nonFinancial?.direct || 0,
        // FIR data
        fir_financial_ncrp: district.fir?.financial?.ncrp || 0,
        fir_financial_direct: district.fir?.financial?.direct || 0,
        fir_non_financial_ncrp: district.fir?.nonFinancial?.ncrp || 0,
        fir_non_financial_direct: district.fir?.nonFinancial?.direct || 0,
        // CSR data
        csr_financial_ncrp: district.csr?.financial?.ncrp || 0,
        csr_financial_direct: district.csr?.financial?.direct || 0,
        csr_non_financial_ncrp: district.csr?.nonFinancial?.ncrp || 0,
        csr_non_financial_direct: district.csr?.nonFinancial?.direct || 0,
        // Amount data
        amount_lost: district.amountLost || 0,
        amount_frozen: district.amountFrozen || 0,
        amount_returned: district.amountReturned || 0,
        accused_arrested: district.accusedArrested || 0,
        cases_in_goondas: district.casesInGoondas || 0,
        // Loan app cases
        loan_app_cases: district.loanAppCases?.noOfCases || 0,
        loan_app_complaints: district.loanAppCases?.noOfComplaints || 0,
        loan_app_fir_registered: district.loanAppCases?.noOfFirRegistered || 0,
        loan_app_csr_issued: district.loanAppCases?.noOfCsrIssued || 0,
        loan_app_accused_arrested: district.loanAppCases?.accusedArrested || 0,
        // Case progress
        cc_no_obtained: district.caseProgress?.ccNoObtained || 0,
        convicted: district.caseProgress?.convicted || 0,
        acquitted_disposed: district.caseProgress?.acquittedDisposed || 0,
        // Cyber volunteers current
        cv_current_requests: district.cyberVolunteers?.current?.noOfRequests || 0,
        cv_current_approved: district.cyberVolunteers?.current?.noOfRequestsApproved || 0,
        cv_current_rejected: district.cyberVolunteers?.current?.noOfRequestsRejected || 0,
        cv_current_pending: district.cyberVolunteers?.current?.noOfRequestsPending || 0,
        // Cyber volunteers total
        cv_total_requests: district.cyberVolunteers?.total?.noOfRequests || 0,
        cv_total_approved: district.cyberVolunteers?.total?.noOfRequestsApproved || 0,
        cv_total_rejected: district.cyberVolunteers?.total?.noOfRequestsRejected || 0,
        cv_total_pending: district.cyberVolunteers?.total?.noOfRequestsPending || 0
      };
    } else if (tableId === 'amount_lost_frozen') {
      // Transform amount tracking data to match database schema
      transformedData = {
        ...transformedData,
        amount_lost_on_date: data.amount_lost?.onDate || 0,
        amount_lost_from_date: data.amount_lost?.fromDate || 0,
        amount_lost_2024: data.amount_lost?.data2024 || 0,
        amount_frozen_on_date: data.amount_frozen?.onDate || 0,
        amount_frozen_from_date: data.amount_frozen?.fromDate || 0,
        amount_frozen_2024: data.amount_frozen?.data2024 || 0,
        amount_returned_on_date: data.amount_returned?.onDate || 0,
        amount_returned_from_date: data.amount_returned?.fromDate || 0,
        amount_returned_2024: data.amount_returned?.data2024 || 0
      };
    } else if (tableId === 'stages_of_cases') {
      // Transform stages data - Table 3 sends individual stage fields
      transformedData = {
        ...transformedData,
        ...data  // Table 3 already sends the correct column names
      };
    } else {
      // For other tables, merge the data as is
      transformedData = {
        ...transformedData,
        ...data
      };
    }

    // Check if record exists
    const { data: existingRecords, error: queryError } = await supabase
      .from(tableName)
      .select('id')
      .eq('report_date', reportDate)
      .eq('created_by', user.id);

    if (queryError) {
      throw queryError;
    }

    let result;
    if (existingRecords && existingRecords.length > 0) {
      // Update existing record
      result = await supabase
        .from(tableName)
        .update(transformedData)
        .eq('id', existingRecords[0].id)
        .select();
    } else {
      // Insert new record
      result = await supabase
        .from(tableName)
        .insert(transformedData)
        .select();
    }

    if (result.error) {
      throw result.error;
    }

    return result.data;
  } catch (error) {
    console.error('Error in saveDSRData:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      tableId,
      tableName: tableMap[tableId] || 'unknown',
      transformedData
    });
    throw error;
  }
};

// Function to load DSR data
export const loadDSRData = async (tableId, reportDate) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const tableMap = {
      'complaints_ncrp_ccps': 'dsr_complaints_ncrp_ccps',
      'amount_lost_frozen': 'dsr_amount_tracking',
      'stages_of_cases': 'dsr_case_stages',
      'ncrp_complaints': 'dsr_ncrp_complaints',
      'cctns_complaints': 'dsr_cctns_complaints',
      'trending_mo': 'dsr_trending_mo',
      'helpline_1930': 'dsr_helpline_1930',
      'cases_above_1lakh': 'dsr_cases_above_1lakh',
      'cases_above_50lakh': 'dsr_cases_above_50lakh',
      'meity_requests': 'dsr_meity_requests',
      'sim_blocking': 'dsr_sim_blocking',
      'content_blocking': 'dsr_content_blocking',
      'ceir': 'dsr_ceir',
      'linkage_cases': 'dsr_linkage_cases',
      'ciar': 'dsr_ciar',
      'ccw_headquarters': 'dsr_ccw_headquarters',
      'awareness': 'dsr_awareness',
      'cyber_volunteers': 'dsr_cyber_volunteers',
      'social_media': 'dsr_social_media',
      'trainings': 'dsr_trainings',
      'duty_leave': 'dsr_duty_leave'
    };

    const tableName = tableMap[tableId];
    if (!tableName) {
      throw new Error('Invalid table ID');
    }

    // Query the database
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('report_date', reportDate)
      .eq('created_by', user.id);

    if (error) {
      throw error;
    }

    // If no data found, return default structure
    if (!data || data.length === 0) {
      if (tableId === 'amount_lost_frozen') {
        return {
          amount_lost: { onDate: 0, fromDate: 0, data2024: 0 },
          amount_frozen: { onDate: 0, fromDate: 0, data2024: 0 },
          amount_returned: { onDate: 0, fromDate: 0, data2024: 0 }
        };
      } else if (tableId === 'stages_of_cases') {
        return {
          under_investigation: { onDate: 0, fromDate: 0, data2024: 0 },
          charge_sheet_filed: { onDate: 0, fromDate: 0, data2024: 0 },
          fir_closed: { onDate: 0, fromDate: 0, data2024: 0 },
          transferred: { onDate: 0, fromDate: 0, data2024: 0 }
        };
      }
      return null;
    }

    // Transform data based on table type for frontend consumption
    const record = data[0]; // Take the first record if multiple exist
    
    if (tableId === 'amount_lost_frozen') {
      return {
        amount_lost: {
          onDate: record.amount_lost_on_date || 0,
          fromDate: record.amount_lost_from_date || 0,
          data2024: record.amount_lost_2024 || 0
        },
        amount_frozen: {
          onDate: record.amount_frozen_on_date || 0,
          fromDate: record.amount_frozen_from_date || 0,
          data2024: record.amount_frozen_2024 || 0
        },
        amount_returned: {
          onDate: record.amount_returned_on_date || 0,
          fromDate: record.amount_returned_from_date || 0,
          data2024: record.amount_returned_2024 || 0
        }
      };
    } else if (tableId === 'stages_of_cases') {
      return {
        under_investigation: {
          onDate: record.under_investigation_on_date || 0,
          fromDate: record.under_investigation_from_date || 0,
          data2024: record.under_investigation_2024 || 0
        },
        charge_sheet_filed: {
          onDate: record.charge_sheet_filed_on_date || 0,
          fromDate: record.charge_sheet_filed_from_date || 0,
          data2024: record.charge_sheet_filed_2024 || 0
        },
        fir_closed: {
          onDate: record.fir_closed_on_date || 0,
          fromDate: record.fir_closed_from_date || 0,
          data2024: record.fir_closed_2024 || 0
        },
        transferred: {
          onDate: record.transferred_on_date || 0,
          fromDate: record.transferred_from_date || 0,
          data2024: record.transferred_2024 || 0
        }
      };
    }

    return record;
  } catch (error) {
    console.error('Error in loadDSRData:', error);
    throw error;
  }
};

// Function to transform data for Table1_ComplaintsNCRPCCPS
export const transformComplaintsNCRPCCPSData = (data) => {
  if (!data) {
    return {
      complaints: { fin: 0, nonFin: 0, total: 0 },
      firRegistered: { fin: 0, nonFin: 0, total: 0 },
      csrIssued: { fin: 0, nonFin: 0, total: 0 }
    };
  }

  return {
    complaints: {
      fin: data.ncrp_complaints_received || 0,
      nonFin: data.ccps_complaints_received || 0,
      total: (data.ncrp_complaints_received || 0) + (data.ccps_complaints_received || 0)
    },
    firRegistered: {
      fin: data.ncrp_complaints_disposed || 0,
      nonFin: data.ccps_complaints_disposed || 0,
      total: (data.ncrp_complaints_disposed || 0) + (data.ccps_complaints_disposed || 0)
    },
    csrIssued: {
      fin: 0, // Add these fields if needed in the schema
      nonFin: 0,
      total: 0
    }
  };
};

// Function to transform data back for saving
export const transformComplaintsNCRPCCPSForSave = (data) => {
  return {
    ncrp_complaints_received: data.complaints.fin,
    ccps_complaints_received: data.complaints.nonFin,
    ncrp_complaints_disposed: data.firRegistered.fin,
    ccps_complaints_disposed: data.firRegistered.nonFin,
    remarks: ''
  };
};

// Function to transform data for Table2_AmountLostFrozen
export const transformAmountLostFrozenData = (data) => {
  if (!data) {
    return {
      amount_lost: { onDate: 0, fromDate: 0, data2024: 0 },
      amount_frozen: { onDate: 0, fromDate: 0, data2024: 0 },
      amount_returned: { onDate: 0, fromDate: 0, data2024: 0 }
    };
  }

  return {
    amount_lost: {
      onDate: data.amount_lost_on_date || 0,
      fromDate: data.amount_lost_from_date || 0,
      data2024: data.amount_lost_2024 || 0
    },
    amount_frozen: {
      onDate: data.amount_frozen_on_date || 0,
      fromDate: data.amount_frozen_from_date || 0,
      data2024: data.amount_frozen_2024 || 0
    },
    amount_returned: {
      onDate: data.amount_returned_on_date || 0,
      fromDate: data.amount_returned_from_date || 0,
      data2024: data.amount_returned_2024 || 0
    }
  };
};

// Function to transform data back for saving
export const transformAmountLostFrozenForSave = (data) => {
  return {
    amount_lost_on_date: data.amount_lost.onDate,
    amount_lost_from_date: data.amount_lost.fromDate,
    amount_lost_2024: data.amount_lost.data2024,
    amount_frozen_on_date: data.amount_frozen.onDate,
    amount_frozen_from_date: data.amount_frozen.fromDate,
    amount_frozen_2024: data.amount_frozen.data2024,
    amount_returned_on_date: data.amount_returned.onDate,
    amount_returned_from_date: data.amount_returned.fromDate,
    amount_returned_2024: data.amount_returned.data2024
  };
};

// Function to transform data for Table3_StagesOfCases
export const transformStagesOfCasesData = (data) => {
  if (!data) {
    return {
      under_investigation: { onDate: 0, fromDate: 0, data2024: 0 },
      charge_sheet_filed: { onDate: 0, fromDate: 0, data2024: 0 },
      fir_closed: { onDate: 0, fromDate: 0, data2024: 0 },
      transferred: { onDate: 0, fromDate: 0, data2024: 0 }
    };
  }

  return {
    under_investigation: {
      onDate: data.under_investigation_on_date || 0,
      fromDate: data.under_investigation_from_date || 0,
      data2024: data.under_investigation_2024 || 0
    },
    charge_sheet_filed: {
      onDate: data.charge_sheet_filed_on_date || 0,
      fromDate: data.charge_sheet_filed_from_date || 0,
      data2024: data.charge_sheet_filed_2024 || 0
    },
    fir_closed: {
      onDate: data.fir_closed_on_date || 0,
      fromDate: data.fir_closed_from_date || 0,
      data2024: data.fir_closed_2024 || 0
    },
    transferred: {
      onDate: data.transferred_on_date || 0,
      fromDate: data.transferred_from_date || 0,
      data2024: data.transferred_2024 || 0
    }
  };
};

export const transformStagesOfCasesForSave = (data) => {
  return {
    under_investigation_on_date: data.under_investigation.onDate,
    under_investigation_from_date: data.under_investigation.fromDate,
    under_investigation_2024: data.under_investigation.data2024,
    charge_sheet_filed_on_date: data.charge_sheet_filed.onDate,
    charge_sheet_filed_from_date: data.charge_sheet_filed.fromDate,
    charge_sheet_filed_2024: data.charge_sheet_filed.data2024,
    fir_closed_on_date: data.fir_closed.onDate,
    fir_closed_from_date: data.fir_closed.fromDate,
    fir_closed_2024: data.fir_closed.data2024,
    transferred_on_date: data.transferred.onDate,
    transferred_from_date: data.transferred.fromDate,
    transferred_2024: data.transferred.data2024
  };
};

// Function to transform data for Table4_NCRPComplaints
export const transformNCRPComplaintsData = (data) => {
  if (!data) {
    return {
      onDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      fromDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2021: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2022: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2023: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2024: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      }
    };
  }

  return {
    onDate: {
      received: data.received_on_date || 0,
      firRegistered: data.fir_registered_on_date || 0,
      csrRegistered: data.csr_registered_on_date || 0,
      acceptedUnderProcess: data.accepted_under_process_on_date || 0,
      notAcceptedPending: data.not_accepted_pending_on_date || 0,
      withdrawal: data.withdrawal_on_date || 0,
      rejectedNoAction: data.rejected_no_action_on_date || 0,
      complaintsClosed: data.complaints_closed_on_date || 0,
      reopen: data.reopen_on_date || 0
    },
    fromDate: {
      received: data.received_from_date || 0,
      firRegistered: data.fir_registered_from_date || 0,
      csrRegistered: data.csr_registered_from_date || 0,
      acceptedUnderProcess: data.accepted_under_process_from_date || 0,
      notAcceptedPending: data.not_accepted_pending_from_date || 0,
      withdrawal: data.withdrawal_from_date || 0,
      rejectedNoAction: data.rejected_no_action_from_date || 0,
      complaintsClosed: data.complaints_closed_from_date || 0,
      reopen: data.reopen_from_date || 0
    },
    year2021: {
      received: data.received_2021 || 0,
      firRegistered: data.fir_registered_2021 || 0,
      csrRegistered: data.csr_registered_2021 || 0,
      acceptedUnderProcess: data.accepted_under_process_2021 || 0,
      notAcceptedPending: data.not_accepted_pending_2021 || 0,
      withdrawal: data.withdrawal_2021 || 0,
      rejectedNoAction: data.rejected_no_action_2021 || 0,
      complaintsClosed: data.complaints_closed_2021 || 0,
      reopen: data.reopen_2021 || 0
    },
    year2022: {
      received: data.received_2022 || 0,
      firRegistered: data.fir_registered_2022 || 0,
      csrRegistered: data.csr_registered_2022 || 0,
      acceptedUnderProcess: data.accepted_under_process_2022 || 0,
      notAcceptedPending: data.not_accepted_pending_2022 || 0,
      withdrawal: data.withdrawal_2022 || 0,
      rejectedNoAction: data.rejected_no_action_2022 || 0,
      complaintsClosed: data.complaints_closed_2022 || 0,
      reopen: data.reopen_2022 || 0
    },
    year2023: {
      received: data.received_2023 || 0,
      firRegistered: data.fir_registered_2023 || 0,
      csrRegistered: data.csr_registered_2023 || 0,
      acceptedUnderProcess: data.accepted_under_process_2023 || 0,
      notAcceptedPending: data.not_accepted_pending_2023 || 0,
      withdrawal: data.withdrawal_2023 || 0,
      rejectedNoAction: data.rejected_no_action_2023 || 0,
      complaintsClosed: data.complaints_closed_2023 || 0,
      reopen: data.reopen_2023 || 0
    },
    year2024: {
      received: data.received_2024 || 0,
      firRegistered: data.fir_registered_2024 || 0,
      csrRegistered: data.csr_registered_2024 || 0,
      acceptedUnderProcess: data.accepted_under_process_2024 || 0,
      notAcceptedPending: data.not_accepted_pending_2024 || 0,
      withdrawal: data.withdrawal_2024 || 0,
      rejectedNoAction: data.rejected_no_action_2024 || 0,
      complaintsClosed: data.complaints_closed_2024 || 0,
      reopen: data.reopen_2024 || 0
    }
  };
};

export const transformNCRPComplaintsForSave = (data) => {
  return {
    received_on_date: data.onDate.received,
    fir_registered_on_date: data.onDate.firRegistered,
    csr_registered_on_date: data.onDate.csrRegistered,
    accepted_under_process_on_date: data.onDate.acceptedUnderProcess,
    not_accepted_pending_on_date: data.onDate.notAcceptedPending,
    withdrawal_on_date: data.onDate.withdrawal,
    rejected_no_action_on_date: data.onDate.rejectedNoAction,
    complaints_closed_on_date: data.onDate.complaintsClosed,
    reopen_on_date: data.onDate.reopen,
    
    received_from_date: data.fromDate.received,
    fir_registered_from_date: data.fromDate.firRegistered,
    csr_registered_from_date: data.fromDate.csrRegistered,
    accepted_under_process_from_date: data.fromDate.acceptedUnderProcess,
    not_accepted_pending_from_date: data.fromDate.notAcceptedPending,
    withdrawal_from_date: data.fromDate.withdrawal,
    rejected_no_action_from_date: data.fromDate.rejectedNoAction,
    complaints_closed_from_date: data.fromDate.complaintsClosed,
    reopen_from_date: data.fromDate.reopen,
    
    received_2021: data.year2021.received,
    fir_registered_2021: data.year2021.firRegistered,
    csr_registered_2021: data.year2021.csrRegistered,
    accepted_under_process_2021: data.year2021.acceptedUnderProcess,
    not_accepted_pending_2021: data.year2021.notAcceptedPending,
    withdrawal_2021: data.year2021.withdrawal,
    rejected_no_action_2021: data.year2021.rejectedNoAction,
    complaints_closed_2021: data.year2021.complaintsClosed,
    reopen_2021: data.year2021.reopen,
    
    received_2022: data.year2022.received,
    fir_registered_2022: data.year2022.firRegistered,
    csr_registered_2022: data.year2022.csrRegistered,
    accepted_under_process_2022: data.year2022.acceptedUnderProcess,
    not_accepted_pending_2022: data.year2022.notAcceptedPending,
    withdrawal_2022: data.year2022.withdrawal,
    rejected_no_action_2022: data.year2022.rejectedNoAction,
    complaints_closed_2022: data.year2022.complaintsClosed,
    reopen_2022: data.year2022.reopen,
    
    received_2023: data.year2023.received,
    fir_registered_2023: data.year2023.firRegistered,
    csr_registered_2023: data.year2023.csrRegistered,
    accepted_under_process_2023: data.year2023.acceptedUnderProcess,
    not_accepted_pending_2023: data.year2023.notAcceptedPending,
    withdrawal_2023: data.year2023.withdrawal,
    rejected_no_action_2023: data.year2023.rejectedNoAction,
    complaints_closed_2023: data.year2023.complaintsClosed,
    reopen_2023: data.year2023.reopen,
    
    received_2024: data.year2024.received,
    fir_registered_2024: data.year2024.firRegistered,
    csr_registered_2024: data.year2024.csrRegistered,
    accepted_under_process_2024: data.year2024.acceptedUnderProcess,
    not_accepted_pending_2024: data.year2024.notAcceptedPending,
    withdrawal_2024: data.year2024.withdrawal,
    rejected_no_action_2024: data.year2024.rejectedNoAction,
    complaints_closed_2024: data.year2024.complaintsClosed,
    reopen_2024: data.year2024.reopen
  };
};

// Function to transform data for Table5_CCTNSComplaints
export const transformCCTNSComplaintsData = (data) => {
  if (!data) {
    return {
      onDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      fromDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2021: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2022: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2023: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2024: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      }
    };
  }

  return {
    onDate: {
      received: data.received_on_date || 0,
      firRegistered: data.fir_registered_on_date || 0,
      csrRegistered: data.csr_registered_on_date || 0,
      acceptedUnderProcess: data.accepted_under_process_on_date || 0,
      notAcceptedPending: data.not_accepted_pending_on_date || 0,
      withdrawal: data.withdrawal_on_date || 0,
      rejectedNoAction: data.rejected_no_action_on_date || 0,
      complaintsClosed: data.complaints_closed_on_date || 0,
      reopen: data.reopen_on_date || 0
    },
    fromDate: {
      received: data.received_from_date || 0,
      firRegistered: data.fir_registered_from_date || 0,
      csrRegistered: data.csr_registered_from_date || 0,
      acceptedUnderProcess: data.accepted_under_process_from_date || 0,
      notAcceptedPending: data.not_accepted_pending_from_date || 0,
      withdrawal: data.withdrawal_from_date || 0,
      rejectedNoAction: data.rejected_no_action_from_date || 0,
      complaintsClosed: data.complaints_closed_from_date || 0,
      reopen: data.reopen_from_date || 0
    },
    year2021: {
      received: data.received_2021 || 0,
      firRegistered: data.fir_registered_2021 || 0,
      csrRegistered: data.csr_registered_2021 || 0,
      acceptedUnderProcess: data.accepted_under_process_2021 || 0,
      notAcceptedPending: data.not_accepted_pending_2021 || 0,
      withdrawal: data.withdrawal_2021 || 0,
      rejectedNoAction: data.rejected_no_action_2021 || 0,
      complaintsClosed: data.complaints_closed_2021 || 0,
      reopen: data.reopen_2021 || 0
    },
    year2022: {
      received: data.received_2022 || 0,
      firRegistered: data.fir_registered_2022 || 0,
      csrRegistered: data.csr_registered_2022 || 0,
      acceptedUnderProcess: data.accepted_under_process_2022 || 0,
      notAcceptedPending: data.not_accepted_pending_2022 || 0,
      withdrawal: data.withdrawal_2022 || 0,
      rejectedNoAction: data.rejected_no_action_2022 || 0,
      complaintsClosed: data.complaints_closed_2022 || 0,
      reopen: data.reopen_2022 || 0
    },
    year2023: {
      received: data.received_2023 || 0,
      firRegistered: data.fir_registered_2023 || 0,
      csrRegistered: data.csr_registered_2023 || 0,
      acceptedUnderProcess: data.accepted_under_process_2023 || 0,
      notAcceptedPending: data.not_accepted_pending_2023 || 0,
      withdrawal: data.withdrawal_2023 || 0,
      rejectedNoAction: data.rejected_no_action_2023 || 0,
      complaintsClosed: data.complaints_closed_2023 || 0,
      reopen: data.reopen_2023 || 0
    },
    year2024: {
      received: data.received_2024 || 0,
      firRegistered: data.fir_registered_2024 || 0,
      csrRegistered: data.csr_registered_2024 || 0,
      acceptedUnderProcess: data.accepted_under_process_2024 || 0,
      notAcceptedPending: data.not_accepted_pending_2024 || 0,
      withdrawal: data.withdrawal_2024 || 0,
      rejectedNoAction: data.rejected_no_action_2024 || 0,
      complaintsClosed: data.complaints_closed_2024 || 0,
      reopen: data.reopen_2024 || 0
    }
  };
};

export const transformCCTNSComplaintsForSave = (data) => {
  return {
    received_on_date: data.onDate.received,
    fir_registered_on_date: data.onDate.firRegistered,
    csr_registered_on_date: data.onDate.csrRegistered,
    accepted_under_process_on_date: data.onDate.acceptedUnderProcess,
    not_accepted_pending_on_date: data.onDate.notAcceptedPending,
    withdrawal_on_date: data.onDate.withdrawal,
    rejected_no_action_on_date: data.onDate.rejectedNoAction,
    complaints_closed_on_date: data.onDate.complaintsClosed,
    reopen_on_date: data.onDate.reopen,
    
    received_from_date: data.fromDate.received,
    fir_registered_from_date: data.fromDate.firRegistered,
    csr_registered_from_date: data.fromDate.csrRegistered,
    accepted_under_process_from_date: data.fromDate.acceptedUnderProcess,
    not_accepted_pending_from_date: data.fromDate.notAcceptedPending,
    withdrawal_from_date: data.fromDate.withdrawal,
    rejected_no_action_from_date: data.fromDate.rejectedNoAction,
    complaints_closed_from_date: data.fromDate.complaintsClosed,
    reopen_from_date: data.fromDate.reopen,
    
    received_2021: data.year2021.received,
    fir_registered_2021: data.year2021.firRegistered,
    csr_registered_2021: data.year2021.csrRegistered,
    accepted_under_process_2021: data.year2021.acceptedUnderProcess,
    not_accepted_pending_2021: data.year2021.notAcceptedPending,
    withdrawal_2021: data.year2021.withdrawal,
    rejected_no_action_2021: data.year2021.rejectedNoAction,
    complaints_closed_2021: data.year2021.complaintsClosed,
    reopen_2021: data.year2021.reopen,
    
    received_2022: data.year2022.received,
    fir_registered_2022: data.year2022.firRegistered,
    csr_registered_2022: data.year2022.csrRegistered,
    accepted_under_process_2022: data.year2022.acceptedUnderProcess,
    not_accepted_pending_2022: data.year2022.notAcceptedPending,
    withdrawal_2022: data.year2022.withdrawal,
    rejected_no_action_2022: data.year2022.rejectedNoAction,
    complaints_closed_2022: data.year2022.complaintsClosed,
    reopen_2022: data.year2022.reopen,
    
    received_2023: data.year2023.received,
    fir_registered_2023: data.year2023.firRegistered,
    csr_registered_2023: data.year2023.csrRegistered,
    accepted_under_process_2023: data.year2023.acceptedUnderProcess,
    not_accepted_pending_2023: data.year2023.notAcceptedPending,
    withdrawal_2023: data.year2023.withdrawal,
    rejected_no_action_2023: data.year2023.rejectedNoAction,
    complaints_closed_2023: data.year2023.complaintsClosed,
    reopen_2023: data.year2023.reopen,
    
    received_2024: data.year2024.received,
    fir_registered_2024: data.year2024.firRegistered,
    csr_registered_2024: data.year2024.csrRegistered,
    accepted_under_process_2024: data.year2024.acceptedUnderProcess,
    not_accepted_pending_2024: data.year2024.notAcceptedPending,
    withdrawal_2024: data.year2024.withdrawal,
    rejected_no_action_2024: data.year2024.rejectedNoAction,
    complaints_closed_2024: data.year2024.complaintsClosed,
    reopen_2024: data.year2024.reopen
  };
};

// Function to transform data for Table6_TrendingMO
export const transformTrendingMOData = (data) => {
  if (!data) {
    return {
      onDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      fromDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2021: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2022: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2023: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2024: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      }
    };
  }

  return {
    onDate: {
      received: data.received_on_date || 0,
      firRegistered: data.fir_registered_on_date || 0,
      csrRegistered: data.csr_registered_on_date || 0,
      acceptedUnderProcess: data.accepted_under_process_on_date || 0,
      notAcceptedPending: data.not_accepted_pending_on_date || 0,
      withdrawal: data.withdrawal_on_date || 0,
      rejectedNoAction: data.rejected_no_action_on_date || 0,
      complaintsClosed: data.complaints_closed_on_date || 0,
      reopen: data.reopen_on_date || 0
    },
    fromDate: {
      received: data.received_from_date || 0,
      firRegistered: data.fir_registered_from_date || 0,
      csrRegistered: data.csr_registered_from_date || 0,
      acceptedUnderProcess: data.accepted_under_process_from_date || 0,
      notAcceptedPending: data.not_accepted_pending_from_date || 0,
      withdrawal: data.withdrawal_from_date || 0,
      rejectedNoAction: data.rejected_no_action_from_date || 0,
      complaintsClosed: data.complaints_closed_from_date || 0,
      reopen: data.reopen_from_date || 0
    },
    year2021: {
      received: data.received_2021 || 0,
      firRegistered: data.fir_registered_2021 || 0,
      csrRegistered: data.csr_registered_2021 || 0,
      acceptedUnderProcess: data.accepted_under_process_2021 || 0,
      notAcceptedPending: data.not_accepted_pending_2021 || 0,
      withdrawal: data.withdrawal_2021 || 0,
      rejectedNoAction: data.rejected_no_action_2021 || 0,
      complaintsClosed: data.complaints_closed_2021 || 0,
      reopen: data.reopen_2021 || 0
    },
    year2022: {
      received: data.received_2022 || 0,
      firRegistered: data.fir_registered_2022 || 0,
      csrRegistered: data.csr_registered_2022 || 0,
      acceptedUnderProcess: data.accepted_under_process_2022 || 0,
      notAcceptedPending: data.not_accepted_pending_2022 || 0,
      withdrawal: data.withdrawal_2022 || 0,
      rejectedNoAction: data.rejected_no_action_2022 || 0,
      complaintsClosed: data.complaints_closed_2022 || 0,
      reopen: data.reopen_2022 || 0
    },
    year2023: {
      received: data.received_2023 || 0,
      firRegistered: data.fir_registered_2023 || 0,
      csrRegistered: data.csr_registered_2023 || 0,
      acceptedUnderProcess: data.accepted_under_process_2023 || 0,
      notAcceptedPending: data.not_accepted_pending_2023 || 0,
      withdrawal: data.withdrawal_2023 || 0,
      rejectedNoAction: data.rejected_no_action_2023 || 0,
      complaintsClosed: data.complaints_closed_2023 || 0,
      reopen: data.reopen_2023 || 0
    },
    year2024: {
      received: data.received_2024 || 0,
      firRegistered: data.fir_registered_2024 || 0,
      csrRegistered: data.csr_registered_2024 || 0,
      acceptedUnderProcess: data.accepted_under_process_2024 || 0,
      notAcceptedPending: data.not_accepted_pending_2024 || 0,
      withdrawal: data.withdrawal_2024 || 0,
      rejectedNoAction: data.rejected_no_action_2024 || 0,
      complaintsClosed: data.complaints_closed_2024 || 0,
      reopen: data.reopen_2024 || 0
    }
  };
};

export const transformTrendingMOForSave = (data) => {
  return {
    received_on_date: data.onDate.received,
    fir_registered_on_date: data.onDate.firRegistered,
    csr_registered_on_date: data.onDate.csrRegistered,
    accepted_under_process_on_date: data.onDate.acceptedUnderProcess,
    not_accepted_pending_on_date: data.onDate.notAcceptedPending,
    withdrawal_on_date: data.onDate.withdrawal,
    rejected_no_action_on_date: data.onDate.rejectedNoAction,
    complaints_closed_on_date: data.onDate.complaintsClosed,
    reopen_on_date: data.onDate.reopen,
    
    received_from_date: data.fromDate.received,
    fir_registered_from_date: data.fromDate.firRegistered,
    csr_registered_from_date: data.fromDate.csrRegistered,
    accepted_under_process_from_date: data.fromDate.acceptedUnderProcess,
    not_accepted_pending_from_date: data.fromDate.notAcceptedPending,
    withdrawal_from_date: data.fromDate.withdrawal,
    rejected_no_action_from_date: data.fromDate.rejectedNoAction,
    complaints_closed_from_date: data.fromDate.complaintsClosed,
    reopen_from_date: data.fromDate.reopen,
    
    received_2021: data.year2021.received,
    fir_registered_2021: data.year2021.firRegistered,
    csr_registered_2021: data.year2021.csrRegistered,
    accepted_under_process_2021: data.year2021.acceptedUnderProcess,
    not_accepted_pending_2021: data.year2021.notAcceptedPending,
    withdrawal_2021: data.year2021.withdrawal,
    rejected_no_action_2021: data.year2021.rejectedNoAction,
    complaints_closed_2021: data.year2021.complaintsClosed,
    reopen_2021: data.year2021.reopen,
    
    received_2022: data.year2022.received,
    fir_registered_2022: data.year2022.firRegistered,
    csr_registered_2022: data.year2022.csrRegistered,
    accepted_under_process_2022: data.year2022.acceptedUnderProcess,
    not_accepted_pending_2022: data.year2022.notAcceptedPending,
    withdrawal_2022: data.year2022.withdrawal,
    rejected_no_action_2022: data.year2022.rejectedNoAction,
    complaints_closed_2022: data.year2022.complaintsClosed,
    reopen_2022: data.year2022.reopen,
    
    received_2023: data.year2023.received,
    fir_registered_2023: data.year2023.firRegistered,
    csr_registered_2023: data.year2023.csrRegistered,
    accepted_under_process_2023: data.year2023.acceptedUnderProcess,
    not_accepted_pending_2023: data.year2023.notAcceptedPending,
    withdrawal_2023: data.year2023.withdrawal,
    rejected_no_action_2023: data.year2023.rejectedNoAction,
    complaints_closed_2023: data.year2023.complaintsClosed,
    reopen_2023: data.year2023.reopen,
    
    received_2024: data.year2024.received,
    fir_registered_2024: data.year2024.firRegistered,
    csr_registered_2024: data.year2024.csrRegistered,
    accepted_under_process_2024: data.year2024.acceptedUnderProcess,
    not_accepted_pending_2024: data.year2024.notAcceptedPending,
    withdrawal_2024: data.year2024.withdrawal,
    rejected_no_action_2024: data.year2024.rejectedNoAction,
    complaints_closed_2024: data.year2024.complaintsClosed,
    reopen_2024: data.year2024.reopen
  };
};

// Function to transform data for Table7_Helpline1930
export const transformHelpline1930Data = (data) => {
  if (!data) {
    return {
      onDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      fromDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2021: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2022: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2023: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2024: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      }
    };
  }

  return {
    onDate: {
      received: data.received_on_date || 0,
      firRegistered: data.fir_registered_on_date || 0,
      csrRegistered: data.csr_registered_on_date || 0,
      acceptedUnderProcess: data.accepted_under_process_on_date || 0,
      notAcceptedPending: data.not_accepted_pending_on_date || 0,
      withdrawal: data.withdrawal_on_date || 0,
      rejectedNoAction: data.rejected_no_action_on_date || 0,
      complaintsClosed: data.complaints_closed_on_date || 0,
      reopen: data.reopen_on_date || 0
    },
    fromDate: {
      received: data.received_from_date || 0,
      firRegistered: data.fir_registered_from_date || 0,
      csrRegistered: data.csr_registered_from_date || 0,
      acceptedUnderProcess: data.accepted_under_process_from_date || 0,
      notAcceptedPending: data.not_accepted_pending_from_date || 0,
      withdrawal: data.withdrawal_from_date || 0,
      rejectedNoAction: data.rejected_no_action_from_date || 0,
      complaintsClosed: data.complaints_closed_from_date || 0,
      reopen: data.reopen_from_date || 0
    },
    year2021: {
      received: data.received_2021 || 0,
      firRegistered: data.fir_registered_2021 || 0,
      csrRegistered: data.csr_registered_2021 || 0,
      acceptedUnderProcess: data.accepted_under_process_2021 || 0,
      notAcceptedPending: data.not_accepted_pending_2021 || 0,
      withdrawal: data.withdrawal_2021 || 0,
      rejectedNoAction: data.rejected_no_action_2021 || 0,
      complaintsClosed: data.complaints_closed_2021 || 0,
      reopen: data.reopen_2021 || 0
    },
    year2022: {
      received: data.received_2022 || 0,
      firRegistered: data.fir_registered_2022 || 0,
      csrRegistered: data.csr_registered_2022 || 0,
      acceptedUnderProcess: data.accepted_under_process_2022 || 0,
      notAcceptedPending: data.not_accepted_pending_2022 || 0,
      withdrawal: data.withdrawal_2022 || 0,
      rejectedNoAction: data.rejected_no_action_2022 || 0,
      complaintsClosed: data.complaints_closed_2022 || 0,
      reopen: data.reopen_2022 || 0
    },
    year2023: {
      received: data.received_2023 || 0,
      firRegistered: data.fir_registered_2023 || 0,
      csrRegistered: data.csr_registered_2023 || 0,
      acceptedUnderProcess: data.accepted_under_process_2023 || 0,
      notAcceptedPending: data.not_accepted_pending_2023 || 0,
      withdrawal: data.withdrawal_2023 || 0,
      rejectedNoAction: data.rejected_no_action_2023 || 0,
      complaintsClosed: data.complaints_closed_2023 || 0,
      reopen: data.reopen_2023 || 0
    },
    year2024: {
      received: data.received_2024 || 0,
      firRegistered: data.fir_registered_2024 || 0,
      csrRegistered: data.csr_registered_2024 || 0,
      acceptedUnderProcess: data.accepted_under_process_2024 || 0,
      notAcceptedPending: data.not_accepted_pending_2024 || 0,
      withdrawal: data.withdrawal_2024 || 0,
      rejectedNoAction: data.rejected_no_action_2024 || 0,
      complaintsClosed: data.complaints_closed_2024 || 0,
      reopen: data.reopen_2024 || 0
    }
  };
};

export const transformHelpline1930ForSave = (data) => {
  return {
    received_on_date: data.onDate.received,
    fir_registered_on_date: data.onDate.firRegistered,
    csr_registered_on_date: data.onDate.csrRegistered,
    accepted_under_process_on_date: data.onDate.acceptedUnderProcess,
    not_accepted_pending_on_date: data.onDate.notAcceptedPending,
    withdrawal_on_date: data.onDate.withdrawal,
    rejected_no_action_on_date: data.onDate.rejectedNoAction,
    complaints_closed_on_date: data.onDate.complaintsClosed,
    reopen_on_date: data.onDate.reopen,
    
    received_from_date: data.fromDate.received,
    fir_registered_from_date: data.fromDate.firRegistered,
    csr_registered_from_date: data.fromDate.csrRegistered,
    accepted_under_process_from_date: data.fromDate.acceptedUnderProcess,
    not_accepted_pending_from_date: data.fromDate.notAcceptedPending,
    withdrawal_from_date: data.fromDate.withdrawal,
    rejected_no_action_from_date: data.fromDate.rejectedNoAction,
    complaints_closed_from_date: data.fromDate.complaintsClosed,
    reopen_from_date: data.fromDate.reopen,
    
    received_2021: data.year2021.received,
    fir_registered_2021: data.year2021.firRegistered,
    csr_registered_2021: data.year2021.csrRegistered,
    accepted_under_process_2021: data.year2021.acceptedUnderProcess,
    not_accepted_pending_2021: data.year2021.notAcceptedPending,
    withdrawal_2021: data.year2021.withdrawal,
    rejected_no_action_2021: data.year2021.rejectedNoAction,
    complaints_closed_2021: data.year2021.complaintsClosed,
    reopen_2021: data.year2021.reopen,
    
    received_2022: data.year2022.received,
    fir_registered_2022: data.year2022.firRegistered,
    csr_registered_2022: data.year2022.csrRegistered,
    accepted_under_process_2022: data.year2022.acceptedUnderProcess,
    not_accepted_pending_2022: data.year2022.notAcceptedPending,
    withdrawal_2022: data.year2022.withdrawal,
    rejected_no_action_2022: data.year2022.rejectedNoAction,
    complaints_closed_2022: data.year2022.complaintsClosed,
    reopen_2022: data.year2022.reopen,
    
    received_2023: data.year2023.received,
    fir_registered_2023: data.year2023.firRegistered,
    csr_registered_2023: data.year2023.csrRegistered,
    accepted_under_process_2023: data.year2023.acceptedUnderProcess,
    not_accepted_pending_2023: data.year2023.notAcceptedPending,
    withdrawal_2023: data.year2023.withdrawal,
    rejected_no_action_2023: data.year2023.rejectedNoAction,
    complaints_closed_2023: data.year2023.complaintsClosed,
    reopen_2023: data.year2023.reopen,
    
    received_2024: data.year2024.received,
    fir_registered_2024: data.year2024.firRegistered,
    csr_registered_2024: data.year2024.csrRegistered,
    accepted_under_process_2024: data.year2024.acceptedUnderProcess,
    not_accepted_pending_2024: data.year2024.notAcceptedPending,
    withdrawal_2024: data.year2024.withdrawal,
    rejected_no_action_2024: data.year2024.rejectedNoAction,
    complaints_closed_2024: data.year2024.complaintsClosed,
    reopen_2024: data.year2024.reopen
  };
};

// Function to transform data for Table8_CasesAbove1Lakh
export const transformCasesAbove1LakhData = (data) => {
  if (!data) {
    return {
      onDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      fromDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2021: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2022: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2023: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2024: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      }
    };
  }

  return {
    onDate: {
      received: data.received_on_date || 0,
      firRegistered: data.fir_registered_on_date || 0,
      csrRegistered: data.csr_registered_on_date || 0,
      acceptedUnderProcess: data.accepted_under_process_on_date || 0,
      notAcceptedPending: data.not_accepted_pending_on_date || 0,
      withdrawal: data.withdrawal_on_date || 0,
      rejectedNoAction: data.rejected_no_action_on_date || 0,
      complaintsClosed: data.complaints_closed_on_date || 0,
      reopen: data.reopen_on_date || 0
    },
    fromDate: {
      received: data.received_from_date || 0,
      firRegistered: data.fir_registered_from_date || 0,
      csrRegistered: data.csr_registered_from_date || 0,
      acceptedUnderProcess: data.accepted_under_process_from_date || 0,
      notAcceptedPending: data.not_accepted_pending_from_date || 0,
      withdrawal: data.withdrawal_from_date || 0,
      rejectedNoAction: data.rejected_no_action_from_date || 0,
      complaintsClosed: data.complaints_closed_from_date || 0,
      reopen: data.reopen_from_date || 0
    },
    year2021: {
      received: data.received_2021 || 0,
      firRegistered: data.fir_registered_2021 || 0,
      csrRegistered: data.csr_registered_2021 || 0,
      acceptedUnderProcess: data.accepted_under_process_2021 || 0,
      notAcceptedPending: data.not_accepted_pending_2021 || 0,
      withdrawal: data.withdrawal_2021 || 0,
      rejectedNoAction: data.rejected_no_action_2021 || 0,
      complaintsClosed: data.complaints_closed_2021 || 0,
      reopen: data.reopen_2021 || 0
    },
    year2022: {
      received: data.received_2022 || 0,
      firRegistered: data.fir_registered_2022 || 0,
      csrRegistered: data.csr_registered_2022 || 0,
      acceptedUnderProcess: data.accepted_under_process_2022 || 0,
      notAcceptedPending: data.not_accepted_pending_2022 || 0,
      withdrawal: data.withdrawal_2022 || 0,
      rejectedNoAction: data.rejected_no_action_2022 || 0,
      complaintsClosed: data.complaints_closed_2022 || 0,
      reopen: data.reopen_2022 || 0
    },
    year2023: {
      received: data.received_2023 || 0,
      firRegistered: data.fir_registered_2023 || 0,
      csrRegistered: data.csr_registered_2023 || 0,
      acceptedUnderProcess: data.accepted_under_process_2023 || 0,
      notAcceptedPending: data.not_accepted_pending_2023 || 0,
      withdrawal: data.withdrawal_2023 || 0,
      rejectedNoAction: data.rejected_no_action_2023 || 0,
      complaintsClosed: data.complaints_closed_2023 || 0,
      reopen: data.reopen_2023 || 0
    },
    year2024: {
      received: data.received_2024 || 0,
      firRegistered: data.fir_registered_2024 || 0,
      csrRegistered: data.csr_registered_2024 || 0,
      acceptedUnderProcess: data.accepted_under_process_2024 || 0,
      notAcceptedPending: data.not_accepted_pending_2024 || 0,
      withdrawal: data.withdrawal_2024 || 0,
      rejectedNoAction: data.rejected_no_action_2024 || 0,
      complaintsClosed: data.complaints_closed_2024 || 0,
      reopen: data.reopen_2024 || 0
    }
  };
};

export const transformCasesAbove1LakhForSave = (data) => {
  return {
    received_on_date: data.onDate.received,
    fir_registered_on_date: data.onDate.firRegistered,
    csr_registered_on_date: data.onDate.csrRegistered,
    accepted_under_process_on_date: data.onDate.acceptedUnderProcess,
    not_accepted_pending_on_date: data.onDate.notAcceptedPending,
    withdrawal_on_date: data.onDate.withdrawal,
    rejected_no_action_on_date: data.onDate.rejectedNoAction,
    complaints_closed_on_date: data.onDate.complaintsClosed,
    reopen_on_date: data.onDate.reopen,
    
    received_from_date: data.fromDate.received,
    fir_registered_from_date: data.fromDate.firRegistered,
    csr_registered_from_date: data.fromDate.csrRegistered,
    accepted_under_process_from_date: data.fromDate.acceptedUnderProcess,
    not_accepted_pending_from_date: data.fromDate.notAcceptedPending,
    withdrawal_from_date: data.fromDate.withdrawal,
    rejected_no_action_from_date: data.fromDate.rejectedNoAction,
    complaints_closed_from_date: data.fromDate.complaintsClosed,
    reopen_from_date: data.fromDate.reopen,
    
    received_2021: data.year2021.received,
    fir_registered_2021: data.year2021.firRegistered,
    csr_registered_2021: data.year2021.csrRegistered,
    accepted_under_process_2021: data.year2021.acceptedUnderProcess,
    not_accepted_pending_2021: data.year2021.notAcceptedPending,
    withdrawal_2021: data.year2021.withdrawal,
    rejected_no_action_2021: data.year2021.rejectedNoAction,
    complaints_closed_2021: data.year2021.complaintsClosed,
    reopen_2021: data.year2021.reopen,
    
    received_2022: data.year2022.received,
    fir_registered_2022: data.year2022.firRegistered,
    csr_registered_2022: data.year2022.csrRegistered,
    accepted_under_process_2022: data.year2022.acceptedUnderProcess,
    not_accepted_pending_2022: data.year2022.notAcceptedPending,
    withdrawal_2022: data.year2022.withdrawal,
    rejected_no_action_2022: data.year2022.rejectedNoAction,
    complaints_closed_2022: data.year2022.complaintsClosed,
    reopen_2022: data.year2022.reopen,
    
    received_2023: data.year2023.received,
    fir_registered_2023: data.year2023.firRegistered,
    csr_registered_2023: data.year2023.csrRegistered,
    accepted_under_process_2023: data.year2023.acceptedUnderProcess,
    not_accepted_pending_2023: data.year2023.notAcceptedPending,
    withdrawal_2023: data.year2023.withdrawal,
    rejected_no_action_2023: data.year2023.rejectedNoAction,
    complaints_closed_2023: data.year2023.complaintsClosed,
    reopen_2023: data.year2023.reopen,
    
    received_2024: data.year2024.received,
    fir_registered_2024: data.year2024.firRegistered,
    csr_registered_2024: data.year2024.csrRegistered,
    accepted_under_process_2024: data.year2024.acceptedUnderProcess,
    not_accepted_pending_2024: data.year2024.notAcceptedPending,
    withdrawal_2024: data.year2024.withdrawal,
    rejected_no_action_2024: data.year2024.rejectedNoAction,
    complaints_closed_2024: data.year2024.complaintsClosed,
    reopen_2024: data.year2024.reopen
  };
};

// Function to transform data for Table9_CasesAbove50Lakh
export const transformCasesAbove50LakhData = (data) => {
  if (!data) {
    return {
      onDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      fromDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2021: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2022: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2023: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2024: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      }
    };
  }

  return {
    onDate: {
      received: data.received_on_date || 0,
      firRegistered: data.fir_registered_on_date || 0,
      csrRegistered: data.csr_registered_on_date || 0,
      acceptedUnderProcess: data.accepted_under_process_on_date || 0,
      notAcceptedPending: data.not_accepted_pending_on_date || 0,
      withdrawal: data.withdrawal_on_date || 0,
      rejectedNoAction: data.rejected_no_action_on_date || 0,
      complaintsClosed: data.complaints_closed_on_date || 0,
      reopen: data.reopen_on_date || 0
    },
    fromDate: {
      received: data.received_from_date || 0,
      firRegistered: data.fir_registered_from_date || 0,
      csrRegistered: data.csr_registered_from_date || 0,
      acceptedUnderProcess: data.accepted_under_process_from_date || 0,
      notAcceptedPending: data.not_accepted_pending_from_date || 0,
      withdrawal: data.withdrawal_from_date || 0,
      rejectedNoAction: data.rejected_no_action_from_date || 0,
      complaintsClosed: data.complaints_closed_from_date || 0,
      reopen: data.reopen_from_date || 0
    },
    year2021: {
      received: data.received_2021 || 0,
      firRegistered: data.fir_registered_2021 || 0,
      csrRegistered: data.csr_registered_2021 || 0,
      acceptedUnderProcess: data.accepted_under_process_2021 || 0,
      notAcceptedPending: data.not_accepted_pending_2021 || 0,
      withdrawal: data.withdrawal_2021 || 0,
      rejectedNoAction: data.rejected_no_action_2021 || 0,
      complaintsClosed: data.complaints_closed_2021 || 0,
      reopen: data.reopen_2021 || 0
    },
    year2022: {
      received: data.received_2022 || 0,
      firRegistered: data.fir_registered_2022 || 0,
      csrRegistered: data.csr_registered_2022 || 0,
      acceptedUnderProcess: data.accepted_under_process_2022 || 0,
      notAcceptedPending: data.not_accepted_pending_2022 || 0,
      withdrawal: data.withdrawal_2022 || 0,
      rejectedNoAction: data.rejected_no_action_2022 || 0,
      complaintsClosed: data.complaints_closed_2022 || 0,
      reopen: data.reopen_2022 || 0
    },
    year2023: {
      received: data.received_2023 || 0,
      firRegistered: data.fir_registered_2023 || 0,
      csrRegistered: data.csr_registered_2023 || 0,
      acceptedUnderProcess: data.accepted_under_process_2023 || 0,
      notAcceptedPending: data.not_accepted_pending_2023 || 0,
      withdrawal: data.withdrawal_2023 || 0,
      rejectedNoAction: data.rejected_no_action_2023 || 0,
      complaintsClosed: data.complaints_closed_2023 || 0,
      reopen: data.reopen_2023 || 0
    },
    year2024: {
      received: data.received_2024 || 0,
      firRegistered: data.fir_registered_2024 || 0,
      csrRegistered: data.csr_registered_2024 || 0,
      acceptedUnderProcess: data.accepted_under_process_2024 || 0,
      notAcceptedPending: data.not_accepted_pending_2024 || 0,
      withdrawal: data.withdrawal_2024 || 0,
      rejectedNoAction: data.rejected_no_action_2024 || 0,
      complaintsClosed: data.complaints_closed_2024 || 0,
      reopen: data.reopen_2024 || 0
    }
  };
};

export const transformCasesAbove50LakhForSave = (data) => {
  return {
    received_on_date: data.onDate.received,
    fir_registered_on_date: data.onDate.firRegistered,
    csr_registered_on_date: data.onDate.csrRegistered,
    accepted_under_process_on_date: data.onDate.acceptedUnderProcess,
    not_accepted_pending_on_date: data.onDate.notAcceptedPending,
    withdrawal_on_date: data.onDate.withdrawal,
    rejected_no_action_on_date: data.onDate.rejectedNoAction,
    complaints_closed_on_date: data.onDate.complaintsClosed,
    reopen_on_date: data.onDate.reopen,
    
    received_from_date: data.fromDate.received,
    fir_registered_from_date: data.fromDate.firRegistered,
    csr_registered_from_date: data.fromDate.csrRegistered,
    accepted_under_process_from_date: data.fromDate.acceptedUnderProcess,
    not_accepted_pending_from_date: data.fromDate.notAcceptedPending,
    withdrawal_from_date: data.fromDate.withdrawal,
    rejected_no_action_from_date: data.fromDate.rejectedNoAction,
    complaints_closed_from_date: data.fromDate.complaintsClosed,
    reopen_from_date: data.fromDate.reopen,
    
    received_2021: data.year2021.received,
    fir_registered_2021: data.year2021.firRegistered,
    csr_registered_2021: data.year2021.csrRegistered,
    accepted_under_process_2021: data.year2021.acceptedUnderProcess,
    not_accepted_pending_2021: data.year2021.notAcceptedPending,
    withdrawal_2021: data.year2021.withdrawal,
    rejected_no_action_2021: data.year2021.rejectedNoAction,
    complaints_closed_2021: data.year2021.complaintsClosed,
    reopen_2021: data.year2021.reopen,
    
    received_2022: data.year2022.received,
    fir_registered_2022: data.year2022.firRegistered,
    csr_registered_2022: data.year2022.csrRegistered,
    accepted_under_process_2022: data.year2022.acceptedUnderProcess,
    not_accepted_pending_2022: data.year2022.notAcceptedPending,
    withdrawal_2022: data.year2022.withdrawal,
    rejected_no_action_2022: data.year2022.rejectedNoAction,
    complaints_closed_2022: data.year2022.complaintsClosed,
    reopen_2022: data.year2022.reopen,
    
    received_2023: data.year2023.received,
    fir_registered_2023: data.year2023.firRegistered,
    csr_registered_2023: data.year2023.csrRegistered,
    accepted_under_process_2023: data.year2023.acceptedUnderProcess,
    not_accepted_pending_2023: data.year2023.notAcceptedPending,
    withdrawal_2023: data.year2023.withdrawal,
    rejected_no_action_2023: data.year2023.rejectedNoAction,
    complaints_closed_2023: data.year2023.complaintsClosed,
    reopen_2023: data.year2023.reopen,
    
    received_2024: data.year2024.received,
    fir_registered_2024: data.year2024.firRegistered,
    csr_registered_2024: data.year2024.csrRegistered,
    accepted_under_process_2024: data.year2024.acceptedUnderProcess,
    not_accepted_pending_2024: data.year2024.notAcceptedPending,
    withdrawal_2024: data.year2024.withdrawal,
    rejected_no_action_2024: data.year2024.rejectedNoAction,
    complaints_closed_2024: data.year2024.complaintsClosed,
    reopen_2024: data.year2024.reopen
  };
};

// Function to transform data for Table10_MeityRequests
export const transformMeityRequestsData = (data) => {
  if (!data) {
    return {
      onDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      fromDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2021: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2022: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2023: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2024: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      }
    };
  }

  return {
    onDate: {
      received: data.received_on_date || 0,
      firRegistered: data.fir_registered_on_date || 0,
      csrRegistered: data.csr_registered_on_date || 0,
      acceptedUnderProcess: data.accepted_under_process_on_date || 0,
      notAcceptedPending: data.not_accepted_pending_on_date || 0,
      withdrawal: data.withdrawal_on_date || 0,
      rejectedNoAction: data.rejected_no_action_on_date || 0,
      complaintsClosed: data.complaints_closed_on_date || 0,
      reopen: data.reopen_on_date || 0
    },
    fromDate: {
      received: data.received_from_date || 0,
      firRegistered: data.fir_registered_from_date || 0,
      csrRegistered: data.csr_registered_from_date || 0,
      acceptedUnderProcess: data.accepted_under_process_from_date || 0,
      notAcceptedPending: data.not_accepted_pending_from_date || 0,
      withdrawal: data.withdrawal_from_date || 0,
      rejectedNoAction: data.rejected_no_action_from_date || 0,
      complaintsClosed: data.complaints_closed_from_date || 0,
      reopen: data.reopen_from_date || 0
    },
    year2021: {
      received: data.received_2021 || 0,
      firRegistered: data.fir_registered_2021 || 0,
      csrRegistered: data.csr_registered_2021 || 0,
      acceptedUnderProcess: data.accepted_under_process_2021 || 0,
      notAcceptedPending: data.not_accepted_pending_2021 || 0,
      withdrawal: data.withdrawal_2021 || 0,
      rejectedNoAction: data.rejected_no_action_2021 || 0,
      complaintsClosed: data.complaints_closed_2021 || 0,
      reopen: data.reopen_2021 || 0
    },
    year2022: {
      received: data.received_2022 || 0,
      firRegistered: data.fir_registered_2022 || 0,
      csrRegistered: data.csr_registered_2022 || 0,
      acceptedUnderProcess: data.accepted_under_process_2022 || 0,
      notAcceptedPending: data.not_accepted_pending_2022 || 0,
      withdrawal: data.withdrawal_2022 || 0,
      rejectedNoAction: data.rejected_no_action_2022 || 0,
      complaintsClosed: data.complaints_closed_2022 || 0,
      reopen: data.reopen_2022 || 0
    },
    year2023: {
      received: data.received_2023 || 0,
      firRegistered: data.fir_registered_2023 || 0,
      csrRegistered: data.csr_registered_2023 || 0,
      acceptedUnderProcess: data.accepted_under_process_2023 || 0,
      notAcceptedPending: data.not_accepted_pending_2023 || 0,
      withdrawal: data.withdrawal_2023 || 0,
      rejectedNoAction: data.rejected_no_action_2023 || 0,
      complaintsClosed: data.complaints_closed_2023 || 0,
      reopen: data.reopen_2023 || 0
    },
    year2024: {
      received: data.received_2024 || 0,
      firRegistered: data.fir_registered_2024 || 0,
      csrRegistered: data.csr_registered_2024 || 0,
      acceptedUnderProcess: data.accepted_under_process_2024 || 0,
      notAcceptedPending: data.not_accepted_pending_2024 || 0,
      withdrawal: data.withdrawal_2024 || 0,
      rejectedNoAction: data.rejected_no_action_2024 || 0,
      complaintsClosed: data.complaints_closed_2024 || 0,
      reopen: data.reopen_2024 || 0
    }
  };
};

export const transformMeityRequestsForSave = (data) => {
  return {
    received_on_date: data.onDate.received,
    fir_registered_on_date: data.onDate.firRegistered,
    csr_registered_on_date: data.onDate.csrRegistered,
    accepted_under_process_on_date: data.onDate.acceptedUnderProcess,
    not_accepted_pending_on_date: data.onDate.notAcceptedPending,
    withdrawal_on_date: data.onDate.withdrawal,
    rejected_no_action_on_date: data.onDate.rejectedNoAction,
    complaints_closed_on_date: data.onDate.complaintsClosed,
    reopen_on_date: data.onDate.reopen,
    
    received_from_date: data.fromDate.received,
    fir_registered_from_date: data.fromDate.firRegistered,
    csr_registered_from_date: data.fromDate.csrRegistered,
    accepted_under_process_from_date: data.fromDate.acceptedUnderProcess,
    not_accepted_pending_from_date: data.fromDate.notAcceptedPending,
    withdrawal_from_date: data.fromDate.withdrawal,
    rejected_no_action_from_date: data.fromDate.rejectedNoAction,
    complaints_closed_from_date: data.fromDate.complaintsClosed,
    reopen_from_date: data.fromDate.reopen,
    
    received_2021: data.year2021.received,
    fir_registered_2021: data.year2021.firRegistered,
    csr_registered_2021: data.year2021.csrRegistered,
    accepted_under_process_2021: data.year2021.acceptedUnderProcess,
    not_accepted_pending_2021: data.year2021.notAcceptedPending,
    withdrawal_2021: data.year2021.withdrawal,
    rejected_no_action_2021: data.year2021.rejectedNoAction,
    complaints_closed_2021: data.year2021.complaintsClosed,
    reopen_2021: data.year2021.reopen,
    
    received_2022: data.year2022.received,
    fir_registered_2022: data.year2022.firRegistered,
    csr_registered_2022: data.year2022.csrRegistered,
    accepted_under_process_2022: data.year2022.acceptedUnderProcess,
    not_accepted_pending_2022: data.year2022.notAcceptedPending,
    withdrawal_2022: data.year2022.withdrawal,
    rejected_no_action_2022: data.year2022.rejectedNoAction,
    complaints_closed_2022: data.year2022.complaintsClosed,
    reopen_2022: data.year2022.reopen,
    
    received_2023: data.year2023.received,
    fir_registered_2023: data.year2023.firRegistered,
    csr_registered_2023: data.year2023.csrRegistered,
    accepted_under_process_2023: data.year2023.acceptedUnderProcess,
    not_accepted_pending_2023: data.year2023.notAcceptedPending,
    withdrawal_2023: data.year2023.withdrawal,
    rejected_no_action_2023: data.year2023.rejectedNoAction,
    complaints_closed_2023: data.year2023.complaintsClosed,
    reopen_2023: data.year2023.reopen,
    
    received_2024: data.year2024.received,
    fir_registered_2024: data.year2024.firRegistered,
    csr_registered_2024: data.year2024.csrRegistered,
    accepted_under_process_2024: data.year2024.acceptedUnderProcess,
    not_accepted_pending_2024: data.year2024.notAcceptedPending,
    withdrawal_2024: data.year2024.withdrawal,
    rejected_no_action_2024: data.year2024.rejectedNoAction,
    complaints_closed_2024: data.year2024.complaintsClosed,
    reopen_2024: data.year2024.reopen
  };
};

// Function to transform data for Table11_SimBlocking
export const transformSimBlockingData = (data) => {
  if (!data) {
    return {
      onDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      fromDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2021: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2022: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2023: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2024: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      }
    };
  }

  return {
    onDate: {
      received: data.received_on_date || 0,
      firRegistered: data.fir_registered_on_date || 0,
      csrRegistered: data.csr_registered_on_date || 0,
      acceptedUnderProcess: data.accepted_under_process_on_date || 0,
      notAcceptedPending: data.not_accepted_pending_on_date || 0,
      withdrawal: data.withdrawal_on_date || 0,
      rejectedNoAction: data.rejected_no_action_on_date || 0,
      complaintsClosed: data.complaints_closed_on_date || 0,
      reopen: data.reopen_on_date || 0
    },
    fromDate: {
      received: data.received_from_date || 0,
      firRegistered: data.fir_registered_from_date || 0,
      csrRegistered: data.csr_registered_from_date || 0,
      acceptedUnderProcess: data.accepted_under_process_from_date || 0,
      notAcceptedPending: data.not_accepted_pending_from_date || 0,
      withdrawal: data.withdrawal_from_date || 0,
      rejectedNoAction: data.rejected_no_action_from_date || 0,
      complaintsClosed: data.complaints_closed_from_date || 0,
      reopen: data.reopen_from_date || 0
    },
    year2021: {
      received: data.received_2021 || 0,
      firRegistered: data.fir_registered_2021 || 0,
      csrRegistered: data.csr_registered_2021 || 0,
      acceptedUnderProcess: data.accepted_under_process_2021 || 0,
      notAcceptedPending: data.not_accepted_pending_2021 || 0,
      withdrawal: data.withdrawal_2021 || 0,
      rejectedNoAction: data.rejected_no_action_2021 || 0,
      complaintsClosed: data.complaints_closed_2021 || 0,
      reopen: data.reopen_2021 || 0
    },
    year2022: {
      received: data.received_2022 || 0,
      firRegistered: data.fir_registered_2022 || 0,
      csrRegistered: data.csr_registered_2022 || 0,
      acceptedUnderProcess: data.accepted_under_process_2022 || 0,
      notAcceptedPending: data.not_accepted_pending_2022 || 0,
      withdrawal: data.withdrawal_2022 || 0,
      rejectedNoAction: data.rejected_no_action_2022 || 0,
      complaintsClosed: data.complaints_closed_2022 || 0,
      reopen: data.reopen_2022 || 0
    },
    year2023: {
      received: data.received_2023 || 0,
      firRegistered: data.fir_registered_2023 || 0,
      csrRegistered: data.csr_registered_2023 || 0,
      acceptedUnderProcess: data.accepted_under_process_2023 || 0,
      notAcceptedPending: data.not_accepted_pending_2023 || 0,
      withdrawal: data.withdrawal_2023 || 0,
      rejectedNoAction: data.rejected_no_action_2023 || 0,
      complaintsClosed: data.complaints_closed_2023 || 0,
      reopen: data.reopen_2023 || 0
    },
    year2024: {
      received: data.received_2024 || 0,
      firRegistered: data.fir_registered_2024 || 0,
      csrRegistered: data.csr_registered_2024 || 0,
      acceptedUnderProcess: data.accepted_under_process_2024 || 0,
      notAcceptedPending: data.not_accepted_pending_2024 || 0,
      withdrawal: data.withdrawal_2024 || 0,
      rejectedNoAction: data.rejected_no_action_2024 || 0,
      complaintsClosed: data.complaints_closed_2024 || 0,
      reopen: data.reopen_2024 || 0
    }
  };
};

export const transformSimBlockingForSave = (data) => {
  return {
    received_on_date: data.onDate.received,
    fir_registered_on_date: data.onDate.firRegistered,
    csr_registered_on_date: data.onDate.csrRegistered,
    accepted_under_process_on_date: data.onDate.acceptedUnderProcess,
    not_accepted_pending_on_date: data.onDate.notAcceptedPending,
    withdrawal_on_date: data.onDate.withdrawal,
    rejected_no_action_on_date: data.onDate.rejectedNoAction,
    complaints_closed_on_date: data.onDate.complaintsClosed,
    reopen_on_date: data.onDate.reopen,
    
    received_from_date: data.fromDate.received,
    fir_registered_from_date: data.fromDate.firRegistered,
    csr_registered_from_date: data.fromDate.csrRegistered,
    accepted_under_process_from_date: data.fromDate.acceptedUnderProcess,
    not_accepted_pending_from_date: data.fromDate.notAcceptedPending,
    withdrawal_from_date: data.fromDate.withdrawal,
    rejected_no_action_from_date: data.fromDate.rejectedNoAction,
    complaints_closed_from_date: data.fromDate.complaintsClosed,
    reopen_from_date: data.fromDate.reopen,
    
    received_2021: data.year2021.received,
    fir_registered_2021: data.year2021.firRegistered,
    csr_registered_2021: data.year2021.csrRegistered,
    accepted_under_process_2021: data.year2021.acceptedUnderProcess,
    not_accepted_pending_2021: data.year2021.notAcceptedPending,
    withdrawal_2021: data.year2021.withdrawal,
    rejected_no_action_2021: data.year2021.rejectedNoAction,
    complaints_closed_2021: data.year2021.complaintsClosed,
    reopen_2021: data.year2021.reopen,
    
    received_2022: data.year2022.received,
    fir_registered_2022: data.year2022.firRegistered,
    csr_registered_2022: data.year2022.csrRegistered,
    accepted_under_process_2022: data.year2022.acceptedUnderProcess,
    not_accepted_pending_2022: data.year2022.notAcceptedPending,
    withdrawal_2022: data.year2022.withdrawal,
    rejected_no_action_2022: data.year2022.rejectedNoAction,
    complaints_closed_2022: data.year2022.complaintsClosed,
    reopen_2022: data.year2022.reopen,
    
    received_2023: data.year2023.received,
    fir_registered_2023: data.year2023.firRegistered,
    csr_registered_2023: data.year2023.csrRegistered,
    accepted_under_process_2023: data.year2023.acceptedUnderProcess,
    not_accepted_pending_2023: data.year2023.notAcceptedPending,
    withdrawal_2023: data.year2023.withdrawal,
    rejected_no_action_2023: data.year2023.rejectedNoAction,
    complaints_closed_2023: data.year2023.complaintsClosed,
    reopen_2023: data.year2023.reopen,
    
    received_2024: data.year2024.received,
    fir_registered_2024: data.year2024.firRegistered,
    csr_registered_2024: data.year2024.csrRegistered,
    accepted_under_process_2024: data.year2024.acceptedUnderProcess,
    not_accepted_pending_2024: data.year2024.notAcceptedPending,
    withdrawal_2024: data.year2024.withdrawal,
    rejected_no_action_2024: data.year2024.rejectedNoAction,
    complaints_closed_2024: data.year2024.complaintsClosed,
    reopen_2024: data.year2024.reopen
  };
};

// Function to transform data for Table12_ContentBlocking
export const transformContentBlockingData = (data) => {
  if (!data) {
    return {
      onDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      fromDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2021: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2022: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2023: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2024: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      }
    };
  }

  return {
    onDate: {
      received: data.received_on_date || 0,
      firRegistered: data.fir_registered_on_date || 0,
      csrRegistered: data.csr_registered_on_date || 0,
      acceptedUnderProcess: data.accepted_under_process_on_date || 0,
      notAcceptedPending: data.not_accepted_pending_on_date || 0,
      withdrawal: data.withdrawal_on_date || 0,
      rejectedNoAction: data.rejected_no_action_on_date || 0,
      complaintsClosed: data.complaints_closed_on_date || 0,
      reopen: data.reopen_on_date || 0
    },
    fromDate: {
      received: data.received_from_date || 0,
      firRegistered: data.fir_registered_from_date || 0,
      csrRegistered: data.csr_registered_from_date || 0,
      acceptedUnderProcess: data.accepted_under_process_from_date || 0,
      notAcceptedPending: data.not_accepted_pending_from_date || 0,
      withdrawal: data.withdrawal_from_date || 0,
      rejectedNoAction: data.rejected_no_action_from_date || 0,
      complaintsClosed: data.complaints_closed_from_date || 0,
      reopen: data.reopen_from_date || 0
    },
    year2021: {
      received: data.received_2021 || 0,
      firRegistered: data.fir_registered_2021 || 0,
      csrRegistered: data.csr_registered_2021 || 0,
      acceptedUnderProcess: data.accepted_under_process_2021 || 0,
      notAcceptedPending: data.not_accepted_pending_2021 || 0,
      withdrawal: data.withdrawal_2021 || 0,
      rejectedNoAction: data.rejected_no_action_2021 || 0,
      complaintsClosed: data.complaints_closed_2021 || 0,
      reopen: data.reopen_2021 || 0
    },
    year2022: {
      received: data.received_2022 || 0,
      firRegistered: data.fir_registered_2022 || 0,
      csrRegistered: data.csr_registered_2022 || 0,
      acceptedUnderProcess: data.accepted_under_process_2022 || 0,
      notAcceptedPending: data.not_accepted_pending_2022 || 0,
      withdrawal: data.withdrawal_2022 || 0,
      rejectedNoAction: data.rejected_no_action_2022 || 0,
      complaintsClosed: data.complaints_closed_2022 || 0,
      reopen: data.reopen_2022 || 0
    },
    year2023: {
      received: data.received_2023 || 0,
      firRegistered: data.fir_registered_2023 || 0,
      csrRegistered: data.csr_registered_2023 || 0,
      acceptedUnderProcess: data.accepted_under_process_2023 || 0,
      notAcceptedPending: data.not_accepted_pending_2023 || 0,
      withdrawal: data.withdrawal_2023 || 0,
      rejectedNoAction: data.rejected_no_action_2023 || 0,
      complaintsClosed: data.complaints_closed_2023 || 0,
      reopen: data.reopen_2023 || 0
    },
    year2024: {
      received: data.received_2024 || 0,
      firRegistered: data.fir_registered_2024 || 0,
      csrRegistered: data.csr_registered_2024 || 0,
      acceptedUnderProcess: data.accepted_under_process_2024 || 0,
      notAcceptedPending: data.not_accepted_pending_2024 || 0,
      withdrawal: data.withdrawal_2024 || 0,
      rejectedNoAction: data.rejected_no_action_2024 || 0,
      complaintsClosed: data.complaints_closed_2024 || 0,
      reopen: data.reopen_2024 || 0
    }
  };
};

export const transformContentBlockingForSave = (data) => {
  return {
    received_on_date: data.onDate.received,
    fir_registered_on_date: data.onDate.firRegistered,
    csr_registered_on_date: data.onDate.csrRegistered,
    accepted_under_process_on_date: data.onDate.acceptedUnderProcess,
    not_accepted_pending_on_date: data.onDate.notAcceptedPending,
    withdrawal_on_date: data.onDate.withdrawal,
    rejected_no_action_on_date: data.onDate.rejectedNoAction,
    complaints_closed_on_date: data.onDate.complaintsClosed,
    reopen_on_date: data.onDate.reopen,
    
    received_from_date: data.fromDate.received,
    fir_registered_from_date: data.fromDate.firRegistered,
    csr_registered_from_date: data.fromDate.csrRegistered,
    accepted_under_process_from_date: data.fromDate.acceptedUnderProcess,
    not_accepted_pending_from_date: data.fromDate.notAcceptedPending,
    withdrawal_from_date: data.fromDate.withdrawal,
    rejected_no_action_from_date: data.fromDate.rejectedNoAction,
    complaints_closed_from_date: data.fromDate.complaintsClosed,
    reopen_from_date: data.fromDate.reopen,
    
    received_2021: data.year2021.received,
    fir_registered_2021: data.year2021.firRegistered,
    csr_registered_2021: data.year2021.csrRegistered,
    accepted_under_process_2021: data.year2021.acceptedUnderProcess,
    not_accepted_pending_2021: data.year2021.notAcceptedPending,
    withdrawal_2021: data.year2021.withdrawal,
    rejected_no_action_2021: data.year2021.rejectedNoAction,
    complaints_closed_2021: data.year2021.complaintsClosed,
    reopen_2021: data.year2021.reopen,
    
    received_2022: data.year2022.received,
    fir_registered_2022: data.year2022.firRegistered,
    csr_registered_2022: data.year2022.csrRegistered,
    accepted_under_process_2022: data.year2022.acceptedUnderProcess,
    not_accepted_pending_2022: data.year2022.notAcceptedPending,
    withdrawal_2022: data.year2022.withdrawal,
    rejected_no_action_2022: data.year2022.rejectedNoAction,
    complaints_closed_2022: data.year2022.complaintsClosed,
    reopen_2022: data.year2022.reopen,
    
    received_2023: data.year2023.received,
    fir_registered_2023: data.year2023.firRegistered,
    csr_registered_2023: data.year2023.csrRegistered,
    accepted_under_process_2023: data.year2023.acceptedUnderProcess,
    not_accepted_pending_2023: data.year2023.notAcceptedPending,
    withdrawal_2023: data.year2023.withdrawal,
    rejected_no_action_2023: data.year2023.rejectedNoAction,
    complaints_closed_2023: data.year2023.complaintsClosed,
    reopen_2023: data.year2023.reopen,
    
    received_2024: data.year2024.received,
    fir_registered_2024: data.year2024.firRegistered,
    csr_registered_2024: data.year2024.csrRegistered,
    accepted_under_process_2024: data.year2024.acceptedUnderProcess,
    not_accepted_pending_2024: data.year2024.notAcceptedPending,
    withdrawal_2024: data.year2024.withdrawal,
    rejected_no_action_2024: data.year2024.rejectedNoAction,
    complaints_closed_2024: data.year2024.complaintsClosed,
    reopen_2024: data.year2024.reopen
  };
};

// Function to transform data for Table13_Ceir
export const transformCeirData = (data) => {
  if (!data) {
    return {
      onDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      fromDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2021: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2022: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2023: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2024: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      }
    };
  }

  return {
    onDate: {
      received: data.received_on_date || 0,
      firRegistered: data.fir_registered_on_date || 0,
      csrRegistered: data.csr_registered_on_date || 0,
      acceptedUnderProcess: data.accepted_under_process_on_date || 0,
      notAcceptedPending: data.not_accepted_pending_on_date || 0,
      withdrawal: data.withdrawal_on_date || 0,
      rejectedNoAction: data.rejected_no_action_on_date || 0,
      complaintsClosed: data.complaints_closed_on_date || 0,
      reopen: data.reopen_on_date || 0
    },
    fromDate: {
      received: data.received_from_date || 0,
      firRegistered: data.fir_registered_from_date || 0,
      csrRegistered: data.csr_registered_from_date || 0,
      acceptedUnderProcess: data.accepted_under_process_from_date || 0,
      notAcceptedPending: data.not_accepted_pending_from_date || 0,
      withdrawal: data.withdrawal_from_date || 0,
      rejectedNoAction: data.rejected_no_action_from_date || 0,
      complaintsClosed: data.complaints_closed_from_date || 0,
      reopen: data.reopen_from_date || 0
    },
    year2021: {
      received: data.received_2021 || 0,
      firRegistered: data.fir_registered_2021 || 0,
      csrRegistered: data.csr_registered_2021 || 0,
      acceptedUnderProcess: data.accepted_under_process_2021 || 0,
      notAcceptedPending: data.not_accepted_pending_2021 || 0,
      withdrawal: data.withdrawal_2021 || 0,
      rejectedNoAction: data.rejected_no_action_2021 || 0,
      complaintsClosed: data.complaints_closed_2021 || 0,
      reopen: data.reopen_2021 || 0
    },
    year2022: {
      received: data.received_2022 || 0,
      firRegistered: data.fir_registered_2022 || 0,
      csrRegistered: data.csr_registered_2022 || 0,
      acceptedUnderProcess: data.accepted_under_process_2022 || 0,
      notAcceptedPending: data.not_accepted_pending_2022 || 0,
      withdrawal: data.withdrawal_2022 || 0,
      rejectedNoAction: data.rejected_no_action_2022 || 0,
      complaintsClosed: data.complaints_closed_2022 || 0,
      reopen: data.reopen_2022 || 0
    },
    year2023: {
      received: data.received_2023 || 0,
      firRegistered: data.fir_registered_2023 || 0,
      csrRegistered: data.csr_registered_2023 || 0,
      acceptedUnderProcess: data.accepted_under_process_2023 || 0,
      notAcceptedPending: data.not_accepted_pending_2023 || 0,
      withdrawal: data.withdrawal_2023 || 0,
      rejectedNoAction: data.rejected_no_action_2023 || 0,
      complaintsClosed: data.complaints_closed_2023 || 0,
      reopen: data.reopen_2023 || 0
    },
    year2024: {
      received: data.received_2024 || 0,
      firRegistered: data.fir_registered_2024 || 0,
      csrRegistered: data.csr_registered_2024 || 0,
      acceptedUnderProcess: data.accepted_under_process_2024 || 0,
      notAcceptedPending: data.not_accepted_pending_2024 || 0,
      withdrawal: data.withdrawal_2024 || 0,
      rejectedNoAction: data.rejected_no_action_2024 || 0,
      complaintsClosed: data.complaints_closed_2024 || 0,
      reopen: data.reopen_2024 || 0
    }
  };
};

export const transformCeirForSave = (data) => {
  return {
    received_on_date: data.onDate.received,
    fir_registered_on_date: data.onDate.firRegistered,
    csr_registered_on_date: data.onDate.csrRegistered,
    accepted_under_process_on_date: data.onDate.acceptedUnderProcess,
    not_accepted_pending_on_date: data.onDate.notAcceptedPending,
    withdrawal_on_date: data.onDate.withdrawal,
    rejected_no_action_on_date: data.onDate.rejectedNoAction,
    complaints_closed_on_date: data.onDate.complaintsClosed,
    reopen_on_date: data.onDate.reopen,
    
    received_from_date: data.fromDate.received,
    fir_registered_from_date: data.fromDate.firRegistered,
    csr_registered_from_date: data.fromDate.csrRegistered,
    accepted_under_process_from_date: data.fromDate.acceptedUnderProcess,
    not_accepted_pending_from_date: data.fromDate.notAcceptedPending,
    withdrawal_from_date: data.fromDate.withdrawal,
    rejected_no_action_from_date: data.fromDate.rejectedNoAction,
    complaints_closed_from_date: data.fromDate.complaintsClosed,
    reopen_from_date: data.fromDate.reopen,
    
    received_2021: data.year2021.received,
    fir_registered_2021: data.year2021.firRegistered,
    csr_registered_2021: data.year2021.csrRegistered,
    accepted_under_process_2021: data.year2021.acceptedUnderProcess,
    not_accepted_pending_2021: data.year2021.notAcceptedPending,
    withdrawal_2021: data.year2021.withdrawal,
    rejected_no_action_2021: data.year2021.rejectedNoAction,
    complaints_closed_2021: data.year2021.complaintsClosed,
    reopen_2021: data.year2021.reopen,
    
    received_2022: data.year2022.received,
    fir_registered_2022: data.year2022.firRegistered,
    csr_registered_2022: data.year2022.csrRegistered,
    accepted_under_process_2022: data.year2022.acceptedUnderProcess,
    not_accepted_pending_2022: data.year2022.notAcceptedPending,
    withdrawal_2022: data.year2022.withdrawal,
    rejected_no_action_2022: data.year2022.rejectedNoAction,
    complaints_closed_2022: data.year2022.complaintsClosed,
    reopen_2022: data.year2022.reopen,
    
    received_2023: data.year2023.received,
    fir_registered_2023: data.year2023.firRegistered,
    csr_registered_2023: data.year2023.csrRegistered,
    accepted_under_process_2023: data.year2023.acceptedUnderProcess,
    not_accepted_pending_2023: data.year2023.notAcceptedPending,
    withdrawal_2023: data.year2023.withdrawal,
    rejected_no_action_2023: data.year2023.rejectedNoAction,
    complaints_closed_2023: data.year2023.complaintsClosed,
    reopen_2023: data.year2023.reopen,
    
    received_2024: data.year2024.received,
    fir_registered_2024: data.year2024.firRegistered,
    csr_registered_2024: data.year2024.csrRegistered,
    accepted_under_process_2024: data.year2024.acceptedUnderProcess,
    not_accepted_pending_2024: data.year2024.notAcceptedPending,
    withdrawal_2024: data.year2024.withdrawal,
    rejected_no_action_2024: data.year2024.rejectedNoAction,
    complaints_closed_2024: data.year2024.complaintsClosed,
    reopen_2024: data.year2024.reopen
  };
};

// Function to transform data for Table14_LinkageCases
export const transformLinkageCasesData = (data) => {
  if (!data) {
    return {
      onDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      fromDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2021: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2022: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2023: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2024: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      }
    };
  }

  return {
    onDate: {
      received: data.received_on_date || 0,
      firRegistered: data.fir_registered_on_date || 0,
      csrRegistered: data.csr_registered_on_date || 0,
      acceptedUnderProcess: data.accepted_under_process_on_date || 0,
      notAcceptedPending: data.not_accepted_pending_on_date || 0,
      withdrawal: data.withdrawal_on_date || 0,
      rejectedNoAction: data.rejected_no_action_on_date || 0,
      complaintsClosed: data.complaints_closed_on_date || 0,
      reopen: data.reopen_on_date || 0
    },
    fromDate: {
      received: data.received_from_date || 0,
      firRegistered: data.fir_registered_from_date || 0,
      csrRegistered: data.csr_registered_from_date || 0,
      acceptedUnderProcess: data.accepted_under_process_from_date || 0,
      notAcceptedPending: data.not_accepted_pending_from_date || 0,
      withdrawal: data.withdrawal_from_date || 0,
      rejectedNoAction: data.rejected_no_action_from_date || 0,
      complaintsClosed: data.complaints_closed_from_date || 0,
      reopen: data.reopen_from_date || 0
    },
    year2021: {
      received: data.received_2021 || 0,
      firRegistered: data.fir_registered_2021 || 0,
      csrRegistered: data.csr_registered_2021 || 0,
      acceptedUnderProcess: data.accepted_under_process_2021 || 0,
      notAcceptedPending: data.not_accepted_pending_2021 || 0,
      withdrawal: data.withdrawal_2021 || 0,
      rejectedNoAction: data.rejected_no_action_2021 || 0,
      complaintsClosed: data.complaints_closed_2021 || 0,
      reopen: data.reopen_2021 || 0
    },
    year2022: {
      received: data.received_2022 || 0,
      firRegistered: data.fir_registered_2022 || 0,
      csrRegistered: data.csr_registered_2022 || 0,
      acceptedUnderProcess: data.accepted_under_process_2022 || 0,
      notAcceptedPending: data.not_accepted_pending_2022 || 0,
      withdrawal: data.withdrawal_2022 || 0,
      rejectedNoAction: data.rejected_no_action_2022 || 0,
      complaintsClosed: data.complaints_closed_2022 || 0,
      reopen: data.reopen_2022 || 0
    },
    year2023: {
      received: data.received_2023 || 0,
      firRegistered: data.fir_registered_2023 || 0,
      csrRegistered: data.csr_registered_2023 || 0,
      acceptedUnderProcess: data.accepted_under_process_2023 || 0,
      notAcceptedPending: data.not_accepted_pending_2023 || 0,
      withdrawal: data.withdrawal_2023 || 0,
      rejectedNoAction: data.rejected_no_action_2023 || 0,
      complaintsClosed: data.complaints_closed_2023 || 0,
      reopen: data.reopen_2023 || 0
    },
    year2024: {
      received: data.received_2024 || 0,
      firRegistered: data.fir_registered_2024 || 0,
      csrRegistered: data.csr_registered_2024 || 0,
      acceptedUnderProcess: data.accepted_under_process_2024 || 0,
      notAcceptedPending: data.not_accepted_pending_2024 || 0,
      withdrawal: data.withdrawal_2024 || 0,
      rejectedNoAction: data.rejected_no_action_2024 || 0,
      complaintsClosed: data.complaints_closed_2024 || 0,
      reopen: data.reopen_2024 || 0
    }
  };
};

export const transformLinkageCasesForSave = (data) => {
  return {
    received_on_date: data.onDate.received,
    fir_registered_on_date: data.onDate.firRegistered,
    csr_registered_on_date: data.onDate.csrRegistered,
    accepted_under_process_on_date: data.onDate.acceptedUnderProcess,
    not_accepted_pending_on_date: data.onDate.notAcceptedPending,
    withdrawal_on_date: data.onDate.withdrawal,
    rejected_no_action_on_date: data.onDate.rejectedNoAction,
    complaints_closed_on_date: data.onDate.complaintsClosed,
    reopen_on_date: data.onDate.reopen,
    
    received_from_date: data.fromDate.received,
    fir_registered_from_date: data.fromDate.firRegistered,
    csr_registered_from_date: data.fromDate.csrRegistered,
    accepted_under_process_from_date: data.fromDate.acceptedUnderProcess,
    not_accepted_pending_from_date: data.fromDate.notAcceptedPending,
    withdrawal_from_date: data.fromDate.withdrawal,
    rejected_no_action_from_date: data.fromDate.rejectedNoAction,
    complaints_closed_from_date: data.fromDate.complaintsClosed,
    reopen_from_date: data.fromDate.reopen,
    
    received_2021: data.year2021.received,
    fir_registered_2021: data.year2021.firRegistered,
    csr_registered_2021: data.year2021.csrRegistered,
    accepted_under_process_2021: data.year2021.acceptedUnderProcess,
    not_accepted_pending_2021: data.year2021.notAcceptedPending,
    withdrawal_2021: data.year2021.withdrawal,
    rejected_no_action_2021: data.year2021.rejectedNoAction,
    complaints_closed_2021: data.year2021.complaintsClosed,
    reopen_2021: data.year2021.reopen,
    
    received_2022: data.year2022.received,
    fir_registered_2022: data.year2022.firRegistered,
    csr_registered_2022: data.year2022.csrRegistered,
    accepted_under_process_2022: data.year2022.acceptedUnderProcess,
    not_accepted_pending_2022: data.year2022.notAcceptedPending,
    withdrawal_2022: data.year2022.withdrawal,
    rejected_no_action_2022: data.year2022.rejectedNoAction,
    complaints_closed_2022: data.year2022.complaintsClosed,
    reopen_2022: data.year2022.reopen,
    
    received_2023: data.year2023.received,
    fir_registered_2023: data.year2023.firRegistered,
    csr_registered_2023: data.year2023.csrRegistered,
    accepted_under_process_2023: data.year2023.acceptedUnderProcess,
    not_accepted_pending_2023: data.year2023.notAcceptedPending,
    withdrawal_2023: data.year2023.withdrawal,
    rejected_no_action_2023: data.year2023.rejectedNoAction,
    complaints_closed_2023: data.year2023.complaintsClosed,
    reopen_2023: data.year2023.reopen,
    
    received_2024: data.year2024.received,
    fir_registered_2024: data.year2024.firRegistered,
    csr_registered_2024: data.year2024.csrRegistered,
    accepted_under_process_2024: data.year2024.acceptedUnderProcess,
    not_accepted_pending_2024: data.year2024.notAcceptedPending,
    withdrawal_2024: data.year2024.withdrawal,
    rejected_no_action_2024: data.year2024.rejectedNoAction,
    complaints_closed_2024: data.year2024.complaintsClosed,
    reopen_2024: data.year2024.reopen
  };
};

// Function to transform data for Table15_Ciar
export const transformCiarData = (data) => {
  if (!data) {
    return {
      onDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      fromDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2021: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2022: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2023: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2024: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      }
    };
  }

  return {
    onDate: {
      received: data.received_on_date || 0,
      firRegistered: data.fir_registered_on_date || 0,
      csrRegistered: data.csr_registered_on_date || 0,
      acceptedUnderProcess: data.accepted_under_process_on_date || 0,
      notAcceptedPending: data.not_accepted_pending_on_date || 0,
      withdrawal: data.withdrawal_on_date || 0,
      rejectedNoAction: data.rejected_no_action_on_date || 0,
      complaintsClosed: data.complaints_closed_on_date || 0,
      reopen: data.reopen_on_date || 0
    },
    fromDate: {
      received: data.received_from_date || 0,
      firRegistered: data.fir_registered_from_date || 0,
      csrRegistered: data.csr_registered_from_date || 0,
      acceptedUnderProcess: data.accepted_under_process_from_date || 0,
      notAcceptedPending: data.not_accepted_pending_from_date || 0,
      withdrawal: data.withdrawal_from_date || 0,
      rejectedNoAction: data.rejected_no_action_from_date || 0,
      complaintsClosed: data.complaints_closed_from_date || 0,
      reopen: data.reopen_from_date || 0
    },
    year2021: {
      received: data.received_2021 || 0,
      firRegistered: data.fir_registered_2021 || 0,
      csrRegistered: data.csr_registered_2021 || 0,
      acceptedUnderProcess: data.accepted_under_process_2021 || 0,
      notAcceptedPending: data.not_accepted_pending_2021 || 0,
      withdrawal: data.withdrawal_2021 || 0,
      rejectedNoAction: data.rejected_no_action_2021 || 0,
      complaintsClosed: data.complaints_closed_2021 || 0,
      reopen: data.reopen_2021 || 0
    },
    year2022: {
      received: data.received_2022 || 0,
      firRegistered: data.fir_registered_2022 || 0,
      csrRegistered: data.csr_registered_2022 || 0,
      acceptedUnderProcess: data.accepted_under_process_2022 || 0,
      notAcceptedPending: data.not_accepted_pending_2022 || 0,
      withdrawal: data.withdrawal_2022 || 0,
      rejectedNoAction: data.rejected_no_action_2022 || 0,
      complaintsClosed: data.complaints_closed_2022 || 0,
      reopen: data.reopen_2022 || 0
    },
    year2023: {
      received: data.received_2023 || 0,
      firRegistered: data.fir_registered_2023 || 0,
      csrRegistered: data.csr_registered_2023 || 0,
      acceptedUnderProcess: data.accepted_under_process_2023 || 0,
      notAcceptedPending: data.not_accepted_pending_2023 || 0,
      withdrawal: data.withdrawal_2023 || 0,
      rejectedNoAction: data.rejected_no_action_2023 || 0,
      complaintsClosed: data.complaints_closed_2023 || 0,
      reopen: data.reopen_2023 || 0
    },
    year2024: {
      received: data.received_2024 || 0,
      firRegistered: data.fir_registered_2024 || 0,
      csrRegistered: data.csr_registered_2024 || 0,
      acceptedUnderProcess: data.accepted_under_process_2024 || 0,
      notAcceptedPending: data.not_accepted_pending_2024 || 0,
      withdrawal: data.withdrawal_2024 || 0,
      rejectedNoAction: data.rejected_no_action_2024 || 0,
      complaintsClosed: data.complaints_closed_2024 || 0,
      reopen: data.reopen_2024 || 0
    }
  };
};

export const transformCiarForSave = (data) => {
  return {
    received_on_date: data.onDate.received,
    fir_registered_on_date: data.onDate.firRegistered,
    csr_registered_on_date: data.onDate.csrRegistered,
    accepted_under_process_on_date: data.onDate.acceptedUnderProcess,
    not_accepted_pending_on_date: data.onDate.notAcceptedPending,
    withdrawal_on_date: data.onDate.withdrawal,
    rejected_no_action_on_date: data.onDate.rejectedNoAction,
    complaints_closed_on_date: data.onDate.complaintsClosed,
    reopen_on_date: data.onDate.reopen,
    
    received_from_date: data.fromDate.received,
    fir_registered_from_date: data.fromDate.firRegistered,
    csr_registered_from_date: data.fromDate.csrRegistered,
    accepted_under_process_from_date: data.fromDate.acceptedUnderProcess,
    not_accepted_pending_from_date: data.fromDate.notAcceptedPending,
    withdrawal_from_date: data.fromDate.withdrawal,
    rejected_no_action_from_date: data.fromDate.rejectedNoAction,
    complaints_closed_from_date: data.fromDate.complaintsClosed,
    reopen_from_date: data.fromDate.reopen,
    
    received_2021: data.year2021.received,
    fir_registered_2021: data.year2021.firRegistered,
    csr_registered_2021: data.year2021.csrRegistered,
    accepted_under_process_2021: data.year2021.acceptedUnderProcess,
    not_accepted_pending_2021: data.year2021.notAcceptedPending,
    withdrawal_2021: data.year2021.withdrawal,
    rejected_no_action_2021: data.year2021.rejectedNoAction,
    complaints_closed_2021: data.year2021.complaintsClosed,
    reopen_2021: data.year2021.reopen,
    
    received_2022: data.year2022.received,
    fir_registered_2022: data.year2022.firRegistered,
    csr_registered_2022: data.year2022.csrRegistered,
    accepted_under_process_2022: data.year2022.acceptedUnderProcess,
    not_accepted_pending_2022: data.year2022.notAcceptedPending,
    withdrawal_2022: data.year2022.withdrawal,
    rejected_no_action_2022: data.year2022.rejectedNoAction,
    complaints_closed_2022: data.year2022.complaintsClosed,
    reopen_2022: data.year2022.reopen,
    
    received_2023: data.year2023.received,
    fir_registered_2023: data.year2023.firRegistered,
    csr_registered_2023: data.year2023.csrRegistered,
    accepted_under_process_2023: data.year2023.acceptedUnderProcess,
    not_accepted_pending_2023: data.year2023.notAcceptedPending,
    withdrawal_2023: data.year2023.withdrawal,
    rejected_no_action_2023: data.year2023.rejectedNoAction,
    complaints_closed_2023: data.year2023.complaintsClosed,
    reopen_2023: data.year2023.reopen,
    
    received_2024: data.year2024.received,
    fir_registered_2024: data.year2024.firRegistered,
    csr_registered_2024: data.year2024.csrRegistered,
    accepted_under_process_2024: data.year2024.acceptedUnderProcess,
    not_accepted_pending_2024: data.year2024.notAcceptedPending,
    withdrawal_2024: data.year2024.withdrawal,
    rejected_no_action_2024: data.year2024.rejectedNoAction,
    complaints_closed_2024: data.year2024.complaintsClosed,
    reopen_2024: data.year2024.reopen
  };
};

// Function to transform data for Table16_CcwHeadquarters
export const transformCcwHeadquartersData = (data) => {
  if (!data) {
    return {
      onDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      fromDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2021: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2022: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2023: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2024: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      }
    };
  }

  return {
    onDate: {
      received: data.received_on_date || 0,
      firRegistered: data.fir_registered_on_date || 0,
      csrRegistered: data.csr_registered_on_date || 0,
      acceptedUnderProcess: data.accepted_under_process_on_date || 0,
      notAcceptedPending: data.not_accepted_pending_on_date || 0,
      withdrawal: data.withdrawal_on_date || 0,
      rejectedNoAction: data.rejected_no_action_on_date || 0,
      complaintsClosed: data.complaints_closed_on_date || 0,
      reopen: data.reopen_on_date || 0
    },
    fromDate: {
      received: data.received_from_date || 0,
      firRegistered: data.fir_registered_from_date || 0,
      csrRegistered: data.csr_registered_from_date || 0,
      acceptedUnderProcess: data.accepted_under_process_from_date || 0,
      notAcceptedPending: data.not_accepted_pending_from_date || 0,
      withdrawal: data.withdrawal_from_date || 0,
      rejectedNoAction: data.rejected_no_action_from_date || 0,
      complaintsClosed: data.complaints_closed_from_date || 0,
      reopen: data.reopen_from_date || 0
    },
    year2021: {
      received: data.received_2021 || 0,
      firRegistered: data.fir_registered_2021 || 0,
      csrRegistered: data.csr_registered_2021 || 0,
      acceptedUnderProcess: data.accepted_under_process_2021 || 0,
      notAcceptedPending: data.not_accepted_pending_2021 || 0,
      withdrawal: data.withdrawal_2021 || 0,
      rejectedNoAction: data.rejected_no_action_2021 || 0,
      complaintsClosed: data.complaints_closed_2021 || 0,
      reopen: data.reopen_2021 || 0
    },
    year2022: {
      received: data.received_2022 || 0,
      firRegistered: data.fir_registered_2022 || 0,
      csrRegistered: data.csr_registered_2022 || 0,
      acceptedUnderProcess: data.accepted_under_process_2022 || 0,
      notAcceptedPending: data.not_accepted_pending_2022 || 0,
      withdrawal: data.withdrawal_2022 || 0,
      rejectedNoAction: data.rejected_no_action_2022 || 0,
      complaintsClosed: data.complaints_closed_2022 || 0,
      reopen: data.reopen_2022 || 0
    },
    year2023: {
      received: data.received_2023 || 0,
      firRegistered: data.fir_registered_2023 || 0,
      csrRegistered: data.csr_registered_2023 || 0,
      acceptedUnderProcess: data.accepted_under_process_2023 || 0,
      notAcceptedPending: data.not_accepted_pending_2023 || 0,
      withdrawal: data.withdrawal_2023 || 0,
      rejectedNoAction: data.rejected_no_action_2023 || 0,
      complaintsClosed: data.complaints_closed_2023 || 0,
      reopen: data.reopen_2023 || 0
    },
    year2024: {
      received: data.received_2024 || 0,
      firRegistered: data.fir_registered_2024 || 0,
      csrRegistered: data.csr_registered_2024 || 0,
      acceptedUnderProcess: data.accepted_under_process_2024 || 0,
      notAcceptedPending: data.not_accepted_pending_2024 || 0,
      withdrawal: data.withdrawal_2024 || 0,
      rejectedNoAction: data.rejected_no_action_2024 || 0,
      complaintsClosed: data.complaints_closed_2024 || 0,
      reopen: data.reopen_2024 || 0
    }
  };
};

export const transformCcwHeadquartersForSave = (data) => {
  return {
    received_on_date: data.onDate.received,
    fir_registered_on_date: data.onDate.firRegistered,
    csr_registered_on_date: data.onDate.csrRegistered,
    accepted_under_process_on_date: data.onDate.acceptedUnderProcess,
    not_accepted_pending_on_date: data.onDate.notAcceptedPending,
    withdrawal_on_date: data.onDate.withdrawal,
    rejected_no_action_on_date: data.onDate.rejectedNoAction,
    complaints_closed_on_date: data.onDate.complaintsClosed,
    reopen_on_date: data.onDate.reopen,
    
    received_from_date: data.fromDate.received,
    fir_registered_from_date: data.fromDate.firRegistered,
    csr_registered_from_date: data.fromDate.csrRegistered,
    accepted_under_process_from_date: data.fromDate.acceptedUnderProcess,
    not_accepted_pending_from_date: data.fromDate.notAcceptedPending,
    withdrawal_from_date: data.fromDate.withdrawal,
    rejected_no_action_from_date: data.fromDate.rejectedNoAction,
    complaints_closed_from_date: data.fromDate.complaintsClosed,
    reopen_from_date: data.fromDate.reopen,
    
    received_2021: data.year2021.received,
    fir_registered_2021: data.year2021.firRegistered,
    csr_registered_2021: data.year2021.csrRegistered,
    accepted_under_process_2021: data.year2021.acceptedUnderProcess,
    not_accepted_pending_2021: data.year2021.notAcceptedPending,
    withdrawal_2021: data.year2021.withdrawal,
    rejected_no_action_2021: data.year2021.rejectedNoAction,
    complaints_closed_2021: data.year2021.complaintsClosed,
    reopen_2021: data.year2021.reopen,
    
    received_2022: data.year2022.received,
    fir_registered_2022: data.year2022.firRegistered,
    csr_registered_2022: data.year2022.csrRegistered,
    accepted_under_process_2022: data.year2022.acceptedUnderProcess,
    not_accepted_pending_2022: data.year2022.notAcceptedPending,
    withdrawal_2022: data.year2022.withdrawal,
    rejected_no_action_2022: data.year2022.rejectedNoAction,
    complaints_closed_2022: data.year2022.complaintsClosed,
    reopen_2022: data.year2022.reopen,
    
    received_2023: data.year2023.received,
    fir_registered_2023: data.year2023.firRegistered,
    csr_registered_2023: data.year2023.csrRegistered,
    accepted_under_process_2023: data.year2023.acceptedUnderProcess,
    not_accepted_pending_2023: data.year2023.notAcceptedPending,
    withdrawal_2023: data.year2023.withdrawal,
    rejected_no_action_2023: data.year2023.rejectedNoAction,
    complaints_closed_2023: data.year2023.complaintsClosed,
    reopen_2023: data.year2023.reopen,
    
    received_2024: data.year2024.received,
    fir_registered_2024: data.year2024.firRegistered,
    csr_registered_2024: data.year2024.csrRegistered,
    accepted_under_process_2024: data.year2024.acceptedUnderProcess,
    not_accepted_pending_2024: data.year2024.notAcceptedPending,
    withdrawal_2024: data.year2024.withdrawal,
    rejected_no_action_2024: data.year2024.rejectedNoAction,
    complaints_closed_2024: data.year2024.complaintsClosed,
    reopen_2024: data.year2024.reopen
  };
};

// Function to transform data for Table17_Awareness
export const transformAwarenessData = (data) => {
  if (!data) {
    return {
      onDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      fromDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2021: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2022: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2023: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2024: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      }
    };
  }

  return {
    onDate: {
      received: data.received_on_date || 0,
      firRegistered: data.fir_registered_on_date || 0,
      csrRegistered: data.csr_registered_on_date || 0,
      acceptedUnderProcess: data.accepted_under_process_on_date || 0,
      notAcceptedPending: data.not_accepted_pending_on_date || 0,
      withdrawal: data.withdrawal_on_date || 0,
      rejectedNoAction: data.rejected_no_action_on_date || 0,
      complaintsClosed: data.complaints_closed_on_date || 0,
      reopen: data.reopen_on_date || 0
    },
    fromDate: {
      received: data.received_from_date || 0,
      firRegistered: data.fir_registered_from_date || 0,
      csrRegistered: data.csr_registered_from_date || 0,
      acceptedUnderProcess: data.accepted_under_process_from_date || 0,
      notAcceptedPending: data.not_accepted_pending_from_date || 0,
      withdrawal: data.withdrawal_from_date || 0,
      rejectedNoAction: data.rejected_no_action_from_date || 0,
      complaintsClosed: data.complaints_closed_from_date || 0,
      reopen: data.reopen_from_date || 0
    },
    year2021: {
      received: data.received_2021 || 0,
      firRegistered: data.fir_registered_2021 || 0,
      csrRegistered: data.csr_registered_2021 || 0,
      acceptedUnderProcess: data.accepted_under_process_2021 || 0,
      notAcceptedPending: data.not_accepted_pending_2021 || 0,
      withdrawal: data.withdrawal_2021 || 0,
      rejectedNoAction: data.rejected_no_action_2021 || 0,
      complaintsClosed: data.complaints_closed_2021 || 0,
      reopen: data.reopen_2021 || 0
    },
    year2022: {
      received: data.received_2022 || 0,
      firRegistered: data.fir_registered_2022 || 0,
      csrRegistered: data.csr_registered_2022 || 0,
      acceptedUnderProcess: data.accepted_under_process_2022 || 0,
      notAcceptedPending: data.not_accepted_pending_2022 || 0,
      withdrawal: data.withdrawal_2022 || 0,
      rejectedNoAction: data.rejected_no_action_2022 || 0,
      complaintsClosed: data.complaints_closed_2022 || 0,
      reopen: data.reopen_2022 || 0
    },
    year2023: {
      received: data.received_2023 || 0,
      firRegistered: data.fir_registered_2023 || 0,
      csrRegistered: data.csr_registered_2023 || 0,
      acceptedUnderProcess: data.accepted_under_process_2023 || 0,
      notAcceptedPending: data.not_accepted_pending_2023 || 0,
      withdrawal: data.withdrawal_2023 || 0,
      rejectedNoAction: data.rejected_no_action_2023 || 0,
      complaintsClosed: data.complaints_closed_2023 || 0,
      reopen: data.reopen_2023 || 0
    },
    year2024: {
      received: data.received_2024 || 0,
      firRegistered: data.fir_registered_2024 || 0,
      csrRegistered: data.csr_registered_2024 || 0,
      acceptedUnderProcess: data.accepted_under_process_2024 || 0,
      notAcceptedPending: data.not_accepted_pending_2024 || 0,
      withdrawal: data.withdrawal_2024 || 0,
      rejectedNoAction: data.rejected_no_action_2024 || 0,
      complaintsClosed: data.complaints_closed_2024 || 0,
      reopen: data.reopen_2024 || 0
    }
  };
};

export const transformAwarenessForSave = (data) => {
  return {
    received_on_date: data.onDate.received,
    fir_registered_on_date: data.onDate.firRegistered,
    csr_registered_on_date: data.onDate.csrRegistered,
    accepted_under_process_on_date: data.onDate.acceptedUnderProcess,
    not_accepted_pending_on_date: data.onDate.notAcceptedPending,
    withdrawal_on_date: data.onDate.withdrawal,
    rejected_no_action_on_date: data.onDate.rejectedNoAction,
    complaints_closed_on_date: data.onDate.complaintsClosed,
    reopen_on_date: data.onDate.reopen,
    
    received_from_date: data.fromDate.received,
    fir_registered_from_date: data.fromDate.firRegistered,
    csr_registered_from_date: data.fromDate.csrRegistered,
    accepted_under_process_from_date: data.fromDate.acceptedUnderProcess,
    not_accepted_pending_from_date: data.fromDate.notAcceptedPending,
    withdrawal_from_date: data.fromDate.withdrawal,
    rejected_no_action_from_date: data.fromDate.rejectedNoAction,
    complaints_closed_from_date: data.fromDate.complaintsClosed,
    reopen_from_date: data.fromDate.reopen,
    
    received_2021: data.year2021.received,
    fir_registered_2021: data.year2021.firRegistered,
    csr_registered_2021: data.year2021.csrRegistered,
    accepted_under_process_2021: data.year2021.acceptedUnderProcess,
    not_accepted_pending_2021: data.year2021.notAcceptedPending,
    withdrawal_2021: data.year2021.withdrawal,
    rejected_no_action_2021: data.year2021.rejectedNoAction,
    complaints_closed_2021: data.year2021.complaintsClosed,
    reopen_2021: data.year2021.reopen,
    
    received_2022: data.year2022.received,
    fir_registered_2022: data.year2022.firRegistered,
    csr_registered_2022: data.year2022.csrRegistered,
    accepted_under_process_2022: data.year2022.acceptedUnderProcess,
    not_accepted_pending_2022: data.year2022.notAcceptedPending,
    withdrawal_2022: data.year2022.withdrawal,
    rejected_no_action_2022: data.year2022.rejectedNoAction,
    complaints_closed_2022: data.year2022.complaintsClosed,
    reopen_2022: data.year2022.reopen,
    
    received_2023: data.year2023.received,
    fir_registered_2023: data.year2023.firRegistered,
    csr_registered_2023: data.year2023.csrRegistered,
    accepted_under_process_2023: data.year2023.acceptedUnderProcess,
    not_accepted_pending_2023: data.year2023.notAcceptedPending,
    withdrawal_2023: data.year2023.withdrawal,
    rejected_no_action_2023: data.year2023.rejectedNoAction,
    complaints_closed_2023: data.year2023.complaintsClosed,
    reopen_2023: data.year2023.reopen,
    
    received_2024: data.year2024.received,
    fir_registered_2024: data.year2024.firRegistered,
    csr_registered_2024: data.year2024.csrRegistered,
    accepted_under_process_2024: data.year2024.acceptedUnderProcess,
    not_accepted_pending_2024: data.year2024.notAcceptedPending,
    withdrawal_2024: data.year2024.withdrawal,
    rejected_no_action_2024: data.year2024.rejectedNoAction,
    complaints_closed_2024: data.year2024.complaintsClosed,
    reopen_2024: data.year2024.reopen
  };
};

// Function to transform data for Table18_CyberVolunteers
export const transformCyberVolunteersData = (data) => {
  if (!data) {
    return {
      onDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      fromDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2021: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2022: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2023: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2024: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      }
    };
  }

  return {
    onDate: {
      received: data.received_on_date || 0,
      firRegistered: data.fir_registered_on_date || 0,
      csrRegistered: data.csr_registered_on_date || 0,
      acceptedUnderProcess: data.accepted_under_process_on_date || 0,
      notAcceptedPending: data.not_accepted_pending_on_date || 0,
      withdrawal: data.withdrawal_on_date || 0,
      rejectedNoAction: data.rejected_no_action_on_date || 0,
      complaintsClosed: data.complaints_closed_on_date || 0,
      reopen: data.reopen_on_date || 0
    },
    fromDate: {
      received: data.received_from_date || 0,
      firRegistered: data.fir_registered_from_date || 0,
      csrRegistered: data.csr_registered_from_date || 0,
      acceptedUnderProcess: data.accepted_under_process_from_date || 0,
      notAcceptedPending: data.not_accepted_pending_from_date || 0,
      withdrawal: data.withdrawal_from_date || 0,
      rejectedNoAction: data.rejected_no_action_from_date || 0,
      complaintsClosed: data.complaints_closed_from_date || 0,
      reopen: data.reopen_from_date || 0
    },
    year2021: {
      received: data.received_2021 || 0,
      firRegistered: data.fir_registered_2021 || 0,
      csrRegistered: data.csr_registered_2021 || 0,
      acceptedUnderProcess: data.accepted_under_process_2021 || 0,
      notAcceptedPending: data.not_accepted_pending_2021 || 0,
      withdrawal: data.withdrawal_2021 || 0,
      rejectedNoAction: data.rejected_no_action_2021 || 0,
      complaintsClosed: data.complaints_closed_2021 || 0,
      reopen: data.reopen_2021 || 0
    },
    year2022: {
      received: data.received_2022 || 0,
      firRegistered: data.fir_registered_2022 || 0,
      csrRegistered: data.csr_registered_2022 || 0,
      acceptedUnderProcess: data.accepted_under_process_2022 || 0,
      notAcceptedPending: data.not_accepted_pending_2022 || 0,
      withdrawal: data.withdrawal_2022 || 0,
      rejectedNoAction: data.rejected_no_action_2022 || 0,
      complaintsClosed: data.complaints_closed_2022 || 0,
      reopen: data.reopen_2022 || 0
    },
    year2023: {
      received: data.received_2023 || 0,
      firRegistered: data.fir_registered_2023 || 0,
      csrRegistered: data.csr_registered_2023 || 0,
      acceptedUnderProcess: data.accepted_under_process_2023 || 0,
      notAcceptedPending: data.not_accepted_pending_2023 || 0,
      withdrawal: data.withdrawal_2023 || 0,
      rejectedNoAction: data.rejected_no_action_2023 || 0,
      complaintsClosed: data.complaints_closed_2023 || 0,
      reopen: data.reopen_2023 || 0
    },
    year2024: {
      received: data.received_2024 || 0,
      firRegistered: data.fir_registered_2024 || 0,
      csrRegistered: data.csr_registered_2024 || 0,
      acceptedUnderProcess: data.accepted_under_process_2024 || 0,
      notAcceptedPending: data.not_accepted_pending_2024 || 0,
      withdrawal: data.withdrawal_2024 || 0,
      rejectedNoAction: data.rejected_no_action_2024 || 0,
      complaintsClosed: data.complaints_closed_2024 || 0,
      reopen: data.reopen_2024 || 0
    }
  };
};

export const transformCyberVolunteersForSave = (data) => {
  return {
    received_on_date: data.onDate.received,
    fir_registered_on_date: data.onDate.firRegistered,
    csr_registered_on_date: data.onDate.csrRegistered,
    accepted_under_process_on_date: data.onDate.acceptedUnderProcess,
    not_accepted_pending_on_date: data.onDate.notAcceptedPending,
    withdrawal_on_date: data.onDate.withdrawal,
    rejected_no_action_on_date: data.onDate.rejectedNoAction,
    complaints_closed_on_date: data.onDate.complaintsClosed,
    reopen_on_date: data.onDate.reopen,
    
    received_from_date: data.fromDate.received,
    fir_registered_from_date: data.fromDate.firRegistered,
    csr_registered_from_date: data.fromDate.csrRegistered,
    accepted_under_process_from_date: data.fromDate.acceptedUnderProcess,
    not_accepted_pending_from_date: data.fromDate.notAcceptedPending,
    withdrawal_from_date: data.fromDate.withdrawal,
    rejected_no_action_from_date: data.fromDate.rejectedNoAction,
    complaints_closed_from_date: data.fromDate.complaintsClosed,
    reopen_from_date: data.fromDate.reopen,
    
    received_2021: data.year2021.received,
    fir_registered_2021: data.year2021.firRegistered,
    csr_registered_2021: data.year2021.csrRegistered,
    accepted_under_process_2021: data.year2021.acceptedUnderProcess,
    not_accepted_pending_2021: data.year2021.notAcceptedPending,
    withdrawal_2021: data.year2021.withdrawal,
    rejected_no_action_2021: data.year2021.rejectedNoAction,
    complaints_closed_2021: data.year2021.complaintsClosed,
    reopen_2021: data.year2021.reopen,
    
    received_2022: data.year2022.received,
    fir_registered_2022: data.year2022.firRegistered,
    csr_registered_2022: data.year2022.csrRegistered,
    accepted_under_process_2022: data.year2022.acceptedUnderProcess,
    not_accepted_pending_2022: data.year2022.notAcceptedPending,
    withdrawal_2022: data.year2022.withdrawal,
    rejected_no_action_2022: data.year2022.rejectedNoAction,
    complaints_closed_2022: data.year2022.complaintsClosed,
    reopen_2022: data.year2022.reopen,
    
    received_2023: data.year2023.received,
    fir_registered_2023: data.year2023.firRegistered,
    csr_registered_2023: data.year2023.csrRegistered,
    accepted_under_process_2023: data.year2023.acceptedUnderProcess,
    not_accepted_pending_2023: data.year2023.notAcceptedPending,
    withdrawal_2023: data.year2023.withdrawal,
    rejected_no_action_2023: data.year2023.rejectedNoAction,
    complaints_closed_2023: data.year2023.complaintsClosed,
    reopen_2023: data.year2023.reopen,
    
    received_2024: data.year2024.received,
    fir_registered_2024: data.year2024.firRegistered,
    csr_registered_2024: data.year2024.csrRegistered,
    accepted_under_process_2024: data.year2024.acceptedUnderProcess,
    not_accepted_pending_2024: data.year2024.notAcceptedPending,
    withdrawal_2024: data.year2024.withdrawal,
    rejected_no_action_2024: data.year2024.rejectedNoAction,
    complaints_closed_2024: data.year2024.complaintsClosed,
    reopen_2024: data.year2024.reopen
  };
};

// Function to transform data for Table19_SocialMedia
export const transformSocialMediaData = (data) => {
  if (!data) {
    return {
      onDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      fromDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2021: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2022: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2023: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2024: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      }
    };
  }

  return {
    onDate: {
      received: data.received_on_date || 0,
      firRegistered: data.fir_registered_on_date || 0,
      csrRegistered: data.csr_registered_on_date || 0,
      acceptedUnderProcess: data.accepted_under_process_on_date || 0,
      notAcceptedPending: data.not_accepted_pending_on_date || 0,
      withdrawal: data.withdrawal_on_date || 0,
      rejectedNoAction: data.rejected_no_action_on_date || 0,
      complaintsClosed: data.complaints_closed_on_date || 0,
      reopen: data.reopen_on_date || 0
    },
    fromDate: {
      received: data.received_from_date || 0,
      firRegistered: data.fir_registered_from_date || 0,
      csrRegistered: data.csr_registered_from_date || 0,
      acceptedUnderProcess: data.accepted_under_process_from_date || 0,
      notAcceptedPending: data.not_accepted_pending_from_date || 0,
      withdrawal: data.withdrawal_from_date || 0,
      rejectedNoAction: data.rejected_no_action_from_date || 0,
      complaintsClosed: data.complaints_closed_from_date || 0,
      reopen: data.reopen_from_date || 0
    },
    year2021: {
      received: data.received_2021 || 0,
      firRegistered: data.fir_registered_2021 || 0,
      csrRegistered: data.csr_registered_2021 || 0,
      acceptedUnderProcess: data.accepted_under_process_2021 || 0,
      notAcceptedPending: data.not_accepted_pending_2021 || 0,
      withdrawal: data.withdrawal_2021 || 0,
      rejectedNoAction: data.rejected_no_action_2021 || 0,
      complaintsClosed: data.complaints_closed_2021 || 0,
      reopen: data.reopen_2021 || 0
    },
    year2022: {
      received: data.received_2022 || 0,
      firRegistered: data.fir_registered_2022 || 0,
      csrRegistered: data.csr_registered_2022 || 0,
      acceptedUnderProcess: data.accepted_under_process_2022 || 0,
      notAcceptedPending: data.not_accepted_pending_2022 || 0,
      withdrawal: data.withdrawal_2022 || 0,
      rejectedNoAction: data.rejected_no_action_2022 || 0,
      complaintsClosed: data.complaints_closed_2022 || 0,
      reopen: data.reopen_2022 || 0
    },
    year2023: {
      received: data.received_2023 || 0,
      firRegistered: data.fir_registered_2023 || 0,
      csrRegistered: data.csr_registered_2023 || 0,
      acceptedUnderProcess: data.accepted_under_process_2023 || 0,
      notAcceptedPending: data.not_accepted_pending_2023 || 0,
      withdrawal: data.withdrawal_2023 || 0,
      rejectedNoAction: data.rejected_no_action_2023 || 0,
      complaintsClosed: data.complaints_closed_2023 || 0,
      reopen: data.reopen_2023 || 0
    },
    year2024: {
      received: data.received_2024 || 0,
      firRegistered: data.fir_registered_2024 || 0,
      csrRegistered: data.csr_registered_2024 || 0,
      acceptedUnderProcess: data.accepted_under_process_2024 || 0,
      notAcceptedPending: data.not_accepted_pending_2024 || 0,
      withdrawal: data.withdrawal_2024 || 0,
      rejectedNoAction: data.rejected_no_action_2024 || 0,
      complaintsClosed: data.complaints_closed_2024 || 0,
      reopen: data.reopen_2024 || 0
    }
  };
};

export const transformSocialMediaForSave = (data) => {
  return {
    received_on_date: data.onDate.received,
    fir_registered_on_date: data.onDate.firRegistered,
    csr_registered_on_date: data.onDate.csrRegistered,
    accepted_under_process_on_date: data.onDate.acceptedUnderProcess,
    not_accepted_pending_on_date: data.onDate.notAcceptedPending,
    withdrawal_on_date: data.onDate.withdrawal,
    rejected_no_action_on_date: data.onDate.rejectedNoAction,
    complaints_closed_on_date: data.onDate.complaintsClosed,
    reopen_on_date: data.onDate.reopen,
    
    received_from_date: data.fromDate.received,
    fir_registered_from_date: data.fromDate.firRegistered,
    csr_registered_from_date: data.fromDate.csrRegistered,
    accepted_under_process_from_date: data.fromDate.acceptedUnderProcess,
    not_accepted_pending_from_date: data.fromDate.notAcceptedPending,
    withdrawal_from_date: data.fromDate.withdrawal,
    rejected_no_action_from_date: data.fromDate.rejectedNoAction,
    complaints_closed_from_date: data.fromDate.complaintsClosed,
    reopen_from_date: data.fromDate.reopen,
    
    received_2021: data.year2021.received,
    fir_registered_2021: data.year2021.firRegistered,
    csr_registered_2021: data.year2021.csrRegistered,
    accepted_under_process_2021: data.year2021.acceptedUnderProcess,
    not_accepted_pending_2021: data.year2021.notAcceptedPending,
    withdrawal_2021: data.year2021.withdrawal,
    rejected_no_action_2021: data.year2021.rejectedNoAction,
    complaints_closed_2021: data.year2021.complaintsClosed,
    reopen_2021: data.year2021.reopen,
    
    received_2022: data.year2022.received,
    fir_registered_2022: data.year2022.firRegistered,
    csr_registered_2022: data.year2022.csrRegistered,
    accepted_under_process_2022: data.year2022.acceptedUnderProcess,
    not_accepted_pending_2022: data.year2022.notAcceptedPending,
    withdrawal_2022: data.year2022.withdrawal,
    rejected_no_action_2022: data.year2022.rejectedNoAction,
    complaints_closed_2022: data.year2022.complaintsClosed,
    reopen_2022: data.year2022.reopen,
    
    received_2023: data.year2023.received,
    fir_registered_2023: data.year2023.firRegistered,
    csr_registered_2023: data.year2023.csrRegistered,
    accepted_under_process_2023: data.year2023.acceptedUnderProcess,
    not_accepted_pending_2023: data.year2023.notAcceptedPending,
    withdrawal_2023: data.year2023.withdrawal,
    rejected_no_action_2023: data.year2023.rejectedNoAction,
    complaints_closed_2023: data.year2023.complaintsClosed,
    reopen_2023: data.year2023.reopen,
    
    received_2024: data.year2024.received,
    fir_registered_2024: data.year2024.firRegistered,
    csr_registered_2024: data.year2024.csrRegistered,
    accepted_under_process_2024: data.year2024.acceptedUnderProcess,
    not_accepted_pending_2024: data.year2024.notAcceptedPending,
    withdrawal_2024: data.year2024.withdrawal,
    rejected_no_action_2024: data.year2024.rejectedNoAction,
    complaints_closed_2024: data.year2024.complaintsClosed,
    reopen_2024: data.year2024.reopen
  };
};

// Function to transform data for Table20_Trainings
export const transformTrainingsData = (data) => {
  if (!data) {
    return {
      onDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      fromDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2021: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2022: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2023: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2024: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      }
    };
  }

  return {
    onDate: {
      received: data.received_on_date || 0,
      firRegistered: data.fir_registered_on_date || 0,
      csrRegistered: data.csr_registered_on_date || 0,
      acceptedUnderProcess: data.accepted_under_process_on_date || 0,
      notAcceptedPending: data.not_accepted_pending_on_date || 0,
      withdrawal: data.withdrawal_on_date || 0,
      rejectedNoAction: data.rejected_no_action_on_date || 0,
      complaintsClosed: data.complaints_closed_on_date || 0,
      reopen: data.reopen_on_date || 0
    },
    fromDate: {
      received: data.received_from_date || 0,
      firRegistered: data.fir_registered_from_date || 0,
      csrRegistered: data.csr_registered_from_date || 0,
      acceptedUnderProcess: data.accepted_under_process_from_date || 0,
      notAcceptedPending: data.not_accepted_pending_from_date || 0,
      withdrawal: data.withdrawal_from_date || 0,
      rejectedNoAction: data.rejected_no_action_from_date || 0,
      complaintsClosed: data.complaints_closed_from_date || 0,
      reopen: data.reopen_from_date || 0
    },
    year2021: {
      received: data.received_2021 || 0,
      firRegistered: data.fir_registered_2021 || 0,
      csrRegistered: data.csr_registered_2021 || 0,
      acceptedUnderProcess: data.accepted_under_process_2021 || 0,
      notAcceptedPending: data.not_accepted_pending_2021 || 0,
      withdrawal: data.withdrawal_2021 || 0,
      rejectedNoAction: data.rejected_no_action_2021 || 0,
      complaintsClosed: data.complaints_closed_2021 || 0,
      reopen: data.reopen_2021 || 0
    },
    year2022: {
      received: data.received_2022 || 0,
      firRegistered: data.fir_registered_2022 || 0,
      csrRegistered: data.csr_registered_2022 || 0,
      acceptedUnderProcess: data.accepted_under_process_2022 || 0,
      notAcceptedPending: data.not_accepted_pending_2022 || 0,
      withdrawal: data.withdrawal_2022 || 0,
      rejectedNoAction: data.rejected_no_action_2022 || 0,
      complaintsClosed: data.complaints_closed_2022 || 0,
      reopen: data.reopen_2022 || 0
    },
    year2023: {
      received: data.received_2023 || 0,
      firRegistered: data.fir_registered_2023 || 0,
      csrRegistered: data.csr_registered_2023 || 0,
      acceptedUnderProcess: data.accepted_under_process_2023 || 0,
      notAcceptedPending: data.not_accepted_pending_2023 || 0,
      withdrawal: data.withdrawal_2023 || 0,
      rejectedNoAction: data.rejected_no_action_2023 || 0,
      complaintsClosed: data.complaints_closed_2023 || 0,
      reopen: data.reopen_2023 || 0
    },
    year2024: {
      received: data.received_2024 || 0,
      firRegistered: data.fir_registered_2024 || 0,
      csrRegistered: data.csr_registered_2024 || 0,
      acceptedUnderProcess: data.accepted_under_process_2024 || 0,
      notAcceptedPending: data.not_accepted_pending_2024 || 0,
      withdrawal: data.withdrawal_2024 || 0,
      rejectedNoAction: data.rejected_no_action_2024 || 0,
      complaintsClosed: data.complaints_closed_2024 || 0,
      reopen: data.reopen_2024 || 0
    }
  };
};

export const transformTrainingsForSave = (data) => {
  return {
    received_on_date: data.onDate.received,
    fir_registered_on_date: data.onDate.firRegistered,
    csr_registered_on_date: data.onDate.csrRegistered,
    accepted_under_process_on_date: data.onDate.acceptedUnderProcess,
    not_accepted_pending_on_date: data.onDate.notAcceptedPending,
    withdrawal_on_date: data.onDate.withdrawal,
    rejected_no_action_on_date: data.onDate.rejectedNoAction,
    complaints_closed_on_date: data.onDate.complaintsClosed,
    reopen_on_date: data.onDate.reopen,
    
    received_from_date: data.fromDate.received,
    fir_registered_from_date: data.fromDate.firRegistered,
    csr_registered_from_date: data.fromDate.csrRegistered,
    accepted_under_process_from_date: data.fromDate.acceptedUnderProcess,
    not_accepted_pending_from_date: data.fromDate.notAcceptedPending,
    withdrawal_from_date: data.fromDate.withdrawal,
    rejected_no_action_from_date: data.fromDate.rejectedNoAction,
    complaints_closed_from_date: data.fromDate.complaintsClosed,
    reopen_from_date: data.fromDate.reopen,
    
    received_2021: data.year2021.received,
    fir_registered_2021: data.year2021.firRegistered,
    csr_registered_2021: data.year2021.csrRegistered,
    accepted_under_process_2021: data.year2021.acceptedUnderProcess,
    not_accepted_pending_2021: data.year2021.notAcceptedPending,
    withdrawal_2021: data.year2021.withdrawal,
    rejected_no_action_2021: data.year2021.rejectedNoAction,
    complaints_closed_2021: data.year2021.complaintsClosed,
    reopen_2021: data.year2021.reopen,
    
    received_2022: data.year2022.received,
    fir_registered_2022: data.year2022.firRegistered,
    csr_registered_2022: data.year2022.csrRegistered,
    accepted_under_process_2022: data.year2022.acceptedUnderProcess,
    not_accepted_pending_2022: data.year2022.notAcceptedPending,
    withdrawal_2022: data.year2022.withdrawal,
    rejected_no_action_2022: data.year2022.rejectedNoAction,
    complaints_closed_2022: data.year2022.complaintsClosed,
    reopen_2022: data.year2022.reopen,
    
    received_2023: data.year2023.received,
    fir_registered_2023: data.year2023.firRegistered,
    csr_registered_2023: data.year2023.csrRegistered,
    accepted_under_process_2023: data.year2023.acceptedUnderProcess,
    not_accepted_pending_2023: data.year2023.notAcceptedPending,
    withdrawal_2023: data.year2023.withdrawal,
    rejected_no_action_2023: data.year2023.rejectedNoAction,
    complaints_closed_2023: data.year2023.complaintsClosed,
    reopen_2023: data.year2023.reopen,
    
    received_2024: data.year2024.received,
    fir_registered_2024: data.year2024.firRegistered,
    csr_registered_2024: data.year2024.csrRegistered,
    accepted_under_process_2024: data.year2024.acceptedUnderProcess,
    not_accepted_pending_2024: data.year2024.notAcceptedPending,
    withdrawal_2024: data.year2024.withdrawal,
    rejected_no_action_2024: data.year2024.rejectedNoAction,
    complaints_closed_2024: data.year2024.complaintsClosed,
    reopen_2024: data.year2024.reopen
  };
};

// Function to transform data for Table21_DutyLeave
export const transformDutyLeaveData = (data) => {
  if (!data) {
    return {
      onDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      fromDate: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2021: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2022: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2023: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      },
      year2024: {
        received: 0,
        firRegistered: 0,
        csrRegistered: 0,
        acceptedUnderProcess: 0,
        notAcceptedPending: 0,
        withdrawal: 0,
        rejectedNoAction: 0,
        complaintsClosed: 0,
        reopen: 0
      }
    };
  }

  return {
    onDate: {
      received: data.received_on_date || 0,
      firRegistered: data.fir_registered_on_date || 0,
      csrRegistered: data.csr_registered_on_date || 0,
      acceptedUnderProcess: data.accepted_under_process_on_date || 0,
      notAcceptedPending: data.not_accepted_pending_on_date || 0,
      withdrawal: data.withdrawal_on_date || 0,
      rejectedNoAction: data.rejected_no_action_on_date || 0,
      complaintsClosed: data.complaints_closed_on_date || 0,
      reopen: data.reopen_on_date || 0
    },
    fromDate: {
      received: data.received_from_date || 0,
      firRegistered: data.fir_registered_from_date || 0,
      csrRegistered: data.csr_registered_from_date || 0,
      acceptedUnderProcess: data.accepted_under_process_from_date || 0,
      notAcceptedPending: data.not_accepted_pending_from_date || 0,
      withdrawal: data.withdrawal_from_date || 0,
      rejectedNoAction: data.rejected_no_action_from_date || 0,
      complaintsClosed: data.complaints_closed_from_date || 0,
      reopen: data.reopen_from_date || 0
    },
    year2021: {
      received: data.received_2021 || 0,
      firRegistered: data.fir_registered_2021 || 0,
      csrRegistered: data.csr_registered_2021 || 0,
      acceptedUnderProcess: data.accepted_under_process_2021 || 0,
      notAcceptedPending: data.not_accepted_pending_2021 || 0,
      withdrawal: data.withdrawal_2021 || 0,
      rejectedNoAction: data.rejected_no_action_2021 || 0,
      complaintsClosed: data.complaints_closed_2021 || 0,
      reopen: data.reopen_2021 || 0
    },
    year2022: {
      received: data.received_2022 || 0,
      firRegistered: data.fir_registered_2022 || 0,
      csrRegistered: data.csr_registered_2022 || 0,
      acceptedUnderProcess: data.accepted_under_process_2022 || 0,
      notAcceptedPending: data.not_accepted_pending_2022 || 0,
      withdrawal: data.withdrawal_2022 || 0,
      rejectedNoAction: data.rejected_no_action_2022 || 0,
      complaintsClosed: data.complaints_closed_2022 || 0,
      reopen: data.reopen_2022 || 0
    },
    year2023: {
      received: data.received_2023 || 0,
      firRegistered: data.fir_registered_2023 || 0,
      csrRegistered: data.csr_registered_2023 || 0,
      acceptedUnderProcess: data.accepted_under_process_2023 || 0,
      notAcceptedPending: data.not_accepted_pending_2023 || 0,
      withdrawal: data.withdrawal_2023 || 0,
      rejectedNoAction: data.rejected_no_action_2023 || 0,
      complaintsClosed: data.complaints_closed_2023 || 0,
      reopen: data.reopen_2023 || 0
    },
    year2024: {
      received: data.received_2024 || 0,
      firRegistered: data.fir_registered_2024 || 0,
      csrRegistered: data.csr_registered_2024 || 0,
      acceptedUnderProcess: data.accepted_under_process_2024 || 0,
      notAcceptedPending: data.not_accepted_pending_2024 || 0,
      withdrawal: data.withdrawal_2024 || 0,
      rejectedNoAction: data.rejected_no_action_2024 || 0,
      complaintsClosed: data.complaints_closed_2024 || 0,
      reopen: data.reopen_2024 || 0
    }
  };
};

export const transformDutyLeaveForSave = (data) => {
  return {
    received_on_date: data.onDate.received,
    fir_registered_on_date: data.onDate.firRegistered,
    csr_registered_on_date: data.onDate.csrRegistered,
    accepted_under_process_on_date: data.onDate.acceptedUnderProcess,
    not_accepted_pending_on_date: data.onDate.notAcceptedPending,
    withdrawal_on_date: data.onDate.withdrawal,
    rejected_no_action_on_date: data.onDate.rejectedNoAction,
    complaints_closed_on_date: data.onDate.complaintsClosed,
    reopen_on_date: data.onDate.reopen,
    
    received_from_date: data.fromDate.received,
    fir_registered_from_date: data.fromDate.firRegistered,
    csr_registered_from_date: data.fromDate.csrRegistered,
    accepted_under_process_from_date: data.fromDate.acceptedUnderProcess,
    not_accepted_pending_from_date: data.fromDate.notAcceptedPending,
    withdrawal_from_date: data.fromDate.withdrawal,
    rejected_no_action_from_date: data.fromDate.rejectedNoAction,
    complaints_closed_from_date: data.fromDate.complaintsClosed,
    reopen_from_date: data.fromDate.reopen,
    
    received_2021: data.year2021.received,
    fir_registered_2021: data.year2021.firRegistered,
    csr_registered_2021: data.year2021.csrRegistered,
    accepted_under_process_2021: data.year2021.acceptedUnderProcess,
    not_accepted_pending_2021: data.year2021.notAcceptedPending,
    withdrawal_2021: data.year2021.withdrawal,
    rejected_no_action_2021: data.year2021.rejectedNoAction,
    complaints_closed_2021: data.year2021.complaintsClosed,
    reopen_2021: data.year2021.reopen,
    
    received_2022: data.year2022.received,
    fir_registered_2022: data.year2022.firRegistered,
    csr_registered_2022: data.year2022.csrRegistered,
    accepted_under_process_2022: data.year2022.acceptedUnderProcess,
    not_accepted_pending_2022: data.year2022.notAcceptedPending,
    withdrawal_2022: data.year2022.withdrawal,
    rejected_no_action_2022: data.year2022.rejectedNoAction,
    complaints_closed_2022: data.year2022.complaintsClosed,
    reopen_2022: data.year2022.reopen,
    
    received_2023: data.year2023.received,
    fir_registered_2023: data.year2023.firRegistered,
    csr_registered_2023: data.year2023.csrRegistered,
    accepted_under_process_2023: data.year2023.acceptedUnderProcess,
    not_accepted_pending_2023: data.year2023.notAcceptedPending,
    withdrawal_2023: data.year2023.withdrawal,
    rejected_no_action_2023: data.year2023.rejectedNoAction,
    complaints_closed_2023: data.year2023.complaintsClosed,
    reopen_2023: data.year2023.reopen,
    
    received_2024: data.year2024.received,
    fir_registered_2024: data.year2024.firRegistered,
    csr_registered_2024: data.year2024.csrRegistered,
    accepted_under_process_2024: data.year2024.acceptedUnderProcess,
    not_accepted_pending_2024: data.year2024.notAcceptedPending,
    withdrawal_2024: data.year2024.withdrawal,
    rejected_no_action_2024: data.year2024.rejectedNoAction,
    complaints_closed_2024: data.year2024.complaintsClosed,
    reopen_2024: data.year2024.reopen
  };
};

// Specific wrapper functions for DSR operations
// These functions provide specific interfaces for different DSR data types

// DSR Amount functions
export const saveDSRAmount = async (data, reportDate) => {
  return await saveDSRData('amount_lost_frozen', data, reportDate);
};

export const loadDSRAmount = async (reportDate) => {
  return await loadDSRData('amount_lost_frozen', reportDate);
};

// DSR Complaints functions
export const saveDSRComplaints = async (data, reportDate) => {
  return await saveDSRData('complaints_ncrp_ccps', data, reportDate);
};

export const loadDSRComplaints = async (reportDate) => {
  return await loadDSRData('complaints_ncrp_ccps', reportDate);
};

// DSR Stages functions
export const saveDSRStages = async (data, reportDate) => {
  return await saveDSRData('stages_of_cases', data, reportDate);
};

export const loadDSRStages = async (reportDate) => {
  return await loadDSRData('stages_of_cases', reportDate);
};