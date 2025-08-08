import { createClient } from "@supabase/supabase-js";
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// GET - Fetch DSR data for a specific officer and date
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportDate = searchParams.get('reportDate');
    const officerId = searchParams.get('officerId');

    if (!reportDate || !officerId) {
      return NextResponse.json(
        { error: 'Report date and officer ID are required' },
        { status: 400 }
      );
    }

    // Fetch data from all 3 tables
    const [complaintsResponse, amountResponse, stagesResponse] = await Promise.all([
      supabaseAdmin
        .from('dsr_complaints_data')
        .select('*')
        .eq('officer_id', officerId)
        .eq('report_date', reportDate)
        .single(),
      
      supabaseAdmin
        .from('dsr_amount_data')
        .select('*')
        .eq('officer_id', officerId)
        .eq('report_date', reportDate)
        .single(),
      
      supabaseAdmin
        .from('dsr_stages_data')
        .select('*')
        .eq('officer_id', officerId)
        .eq('report_date', reportDate)
        .single()
    ]);

    // Transform data to match frontend structure
    const dsrData = {
      complaintsTable: {
        financial: {
          onDate: {
            complaints: complaintsResponse.data?.financial_complaints_on_date || 0,
            firRegistered: complaintsResponse.data?.financial_fir_registered_on_date || 0,
            csrIssued: complaintsResponse.data?.financial_csr_issued_on_date || 0
          },
          fromDate: {
            complaints: complaintsResponse.data?.financial_complaints_from_date || 0,
            firRegistered: complaintsResponse.data?.financial_fir_registered_from_date || 0,
            csrIssued: complaintsResponse.data?.financial_csr_issued_from_date || 0
          },
          data2024: {
            complaints: complaintsResponse.data?.financial_complaints_data_2024 || 0,
            firRegistered: complaintsResponse.data?.financial_fir_registered_data_2024 || 0,
            csrIssued: complaintsResponse.data?.financial_csr_issued_data_2024 || 0
          }
        },
        nonFinancial: {
          onDate: {
            complaints: complaintsResponse.data?.non_financial_complaints_on_date || 0,
            firRegistered: complaintsResponse.data?.non_financial_fir_registered_on_date || 0,
            csrIssued: complaintsResponse.data?.non_financial_csr_issued_on_date || 0
          },
          fromDate: {
            complaints: complaintsResponse.data?.non_financial_complaints_from_date || 0,
            firRegistered: complaintsResponse.data?.non_financial_fir_registered_from_date || 0,
            csrIssued: complaintsResponse.data?.non_financial_csr_issued_from_date || 0
          },
          data2024: {
            complaints: complaintsResponse.data?.non_financial_complaints_data_2024 || 0,
            firRegistered: complaintsResponse.data?.non_financial_fir_registered_data_2024 || 0,
            csrIssued: complaintsResponse.data?.non_financial_csr_issued_data_2024 || 0
          }
        }
      },
      amountTable: [
        {
          category: 'Total Amount Lost (in Rs)',
          onDate: amountResponse.data?.total_amount_lost_on_date || 0,
          fromDate: amountResponse.data?.total_amount_lost_from_date || 0,
          data2024: amountResponse.data?.total_amount_lost_data_2024 || 0
        },
        {
          category: 'Total Amount Frozen (in Rs)',
          onDate: amountResponse.data?.total_amount_frozen_on_date || 0,
          fromDate: amountResponse.data?.total_amount_frozen_from_date || 0,
          data2024: amountResponse.data?.total_amount_frozen_data_2024 || 0
        },
        {
          category: 'Total Amount Returned (in Rs)',
          onDate: amountResponse.data?.total_amount_returned_on_date || 0,
          fromDate: amountResponse.data?.total_amount_returned_from_date || 0,
          data2024: amountResponse.data?.total_amount_returned_data_2024 || 0
        },
        {
          category: 'No of Accused Arrested',
          onDate: amountResponse.data?.accused_arrested_on_date || 0,
          fromDate: amountResponse.data?.accused_arrested_from_date || 0,
          data2024: amountResponse.data?.accused_arrested_data_2024 || 0
        },
        {
          category: 'No of Persons detained under Act 14 of 1982',
          onDate: amountResponse.data?.persons_detained_act14_on_date || 0,
          fromDate: amountResponse.data?.persons_detained_act14_from_date || 0,
          data2024: amountResponse.data?.persons_detained_act14_data_2024 || 0
        },
        {
          category: 'No of Loan App Complaints',
          onDate: amountResponse.data?.loan_app_complaints_on_date || 0,
          fromDate: amountResponse.data?.loan_app_complaints_from_date || 0,
          data2024: amountResponse.data?.loan_app_complaints_data_2024 || 0
        },
        {
          category: 'No of FIR in Loan App Cases',
          onDate: amountResponse.data?.loan_app_fir_on_date || 0,
          fromDate: amountResponse.data?.loan_app_fir_from_date || 0,
          data2024: amountResponse.data?.loan_app_fir_data_2024 || 0
        },
        {
          category: 'No of CSR in Loan App Cases',
          onDate: amountResponse.data?.loan_app_csr_on_date || 0,
          fromDate: amountResponse.data?.loan_app_csr_from_date || 0,
          data2024: amountResponse.data?.loan_app_csr_data_2024 || 0
        }
      ],
      stagesTable: {
        onDate: {
          totalComplaints: stagesResponse.data?.total_complaints_on_date || 0,
          ui: stagesResponse.data?.ui_on_date || 0,
          ntf: stagesResponse.data?.ntf_on_date || 0,
          pt: stagesResponse.data?.pt_on_date || 0,
          disposal: stagesResponse.data?.disposal_on_date || 0
        },
        fromDate: {
          totalComplaints: stagesResponse.data?.total_complaints_from_date || 0,
          ui: stagesResponse.data?.ui_from_date || 0,
          ntf: stagesResponse.data?.ntf_from_date || 0,
          pt: stagesResponse.data?.pt_from_date || 0,
          disposal: stagesResponse.data?.disposal_from_date || 0
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: dsrData,
      exists: {
        complaints: !!complaintsResponse.data,
        amount: !!amountResponse.data,
        stages: !!stagesResponse.data
      }
    });

  } catch (error) {
    console.error('Error fetching DSR data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update DSR data
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      officerId,
      districtName,
      policeStation,
      reportDate,
      fromDate,
      fromDateCases,
      dsrData
    } = body;

    if (!officerId || !reportDate || !dsrData) {
      return NextResponse.json(
        { error: 'Officer ID, report date, and DSR data are required' },
        { status: 400 }
      );
    }

    // Transform frontend data to database format for complaints table
    const complaintsData = {
      officer_id: officerId,
      district_name: districtName,
      police_station: policeStation,
      report_date: reportDate,
      from_date: fromDate,
      
      // Financial
      financial_complaints_on_date: dsrData.complaintsTable.financial.onDate.complaints,
      financial_fir_registered_on_date: dsrData.complaintsTable.financial.onDate.firRegistered,
      financial_csr_issued_on_date: dsrData.complaintsTable.financial.onDate.csrIssued,
      financial_complaints_from_date: dsrData.complaintsTable.financial.fromDate.complaints,
      financial_fir_registered_from_date: dsrData.complaintsTable.financial.fromDate.firRegistered,
      financial_csr_issued_from_date: dsrData.complaintsTable.financial.fromDate.csrIssued,
      financial_complaints_data_2024: dsrData.complaintsTable.financial.data2024.complaints,
      financial_fir_registered_data_2024: dsrData.complaintsTable.financial.data2024.firRegistered,
      financial_csr_issued_data_2024: dsrData.complaintsTable.financial.data2024.csrIssued,
      
      // Non-Financial
      non_financial_complaints_on_date: dsrData.complaintsTable.nonFinancial.onDate.complaints,
      non_financial_fir_registered_on_date: dsrData.complaintsTable.nonFinancial.onDate.firRegistered,
      non_financial_csr_issued_on_date: dsrData.complaintsTable.nonFinancial.onDate.csrIssued,
      non_financial_complaints_from_date: dsrData.complaintsTable.nonFinancial.fromDate.complaints,
      non_financial_fir_registered_from_date: dsrData.complaintsTable.nonFinancial.fromDate.firRegistered,
      non_financial_csr_issued_from_date: dsrData.complaintsTable.nonFinancial.fromDate.csrIssued,
      non_financial_complaints_data_2024: dsrData.complaintsTable.nonFinancial.data2024.complaints,
      non_financial_fir_registered_data_2024: dsrData.complaintsTable.nonFinancial.data2024.firRegistered,
      non_financial_csr_issued_data_2024: dsrData.complaintsTable.nonFinancial.data2024.csrIssued,
    };

    // Transform amount table data
    const amountData = {
      officer_id: officerId,
      district_name: districtName,
      police_station: policeStation,
      report_date: reportDate,
      from_date: fromDate,
      
      total_amount_lost_on_date: dsrData.amountTable[0].onDate,
      total_amount_lost_from_date: dsrData.amountTable[0].fromDate,
      total_amount_lost_data_2024: dsrData.amountTable[0].data2024,
      
      total_amount_frozen_on_date: dsrData.amountTable[1].onDate,
      total_amount_frozen_from_date: dsrData.amountTable[1].fromDate,
      total_amount_frozen_data_2024: dsrData.amountTable[1].data2024,
      
      total_amount_returned_on_date: dsrData.amountTable[2].onDate,
      total_amount_returned_from_date: dsrData.amountTable[2].fromDate,
      total_amount_returned_data_2024: dsrData.amountTable[2].data2024,
      
      accused_arrested_on_date: dsrData.amountTable[3].onDate,
      accused_arrested_from_date: dsrData.amountTable[3].fromDate,
      accused_arrested_data_2024: dsrData.amountTable[3].data2024,
      
      persons_detained_act14_on_date: dsrData.amountTable[4].onDate,
      persons_detained_act14_from_date: dsrData.amountTable[4].fromDate,
      persons_detained_act14_data_2024: dsrData.amountTable[4].data2024,
      
      loan_app_complaints_on_date: dsrData.amountTable[5].onDate,
      loan_app_complaints_from_date: dsrData.amountTable[5].fromDate,
      loan_app_complaints_data_2024: dsrData.amountTable[5].data2024,
      
      loan_app_fir_on_date: dsrData.amountTable[6].onDate,
      loan_app_fir_from_date: dsrData.amountTable[6].fromDate,
      loan_app_fir_data_2024: dsrData.amountTable[6].data2024,
      
      loan_app_csr_on_date: dsrData.amountTable[7].onDate,
      loan_app_csr_from_date: dsrData.amountTable[7].fromDate,
      loan_app_csr_data_2024: dsrData.amountTable[7].data2024,
    };

    // Transform stages table data
    const stagesData = {
      officer_id: officerId,
      district_name: districtName,
      police_station: policeStation,
      report_date: reportDate,
      from_date_cases: fromDateCases,
      
      total_complaints_on_date: dsrData.stagesTable.onDate.totalComplaints,
      ui_on_date: dsrData.stagesTable.onDate.ui,
      ntf_on_date: dsrData.stagesTable.onDate.ntf,
      pt_on_date: dsrData.stagesTable.onDate.pt,
      disposal_on_date: dsrData.stagesTable.onDate.disposal,
      
      total_complaints_from_date: dsrData.stagesTable.fromDate.totalComplaints,
      ui_from_date: dsrData.stagesTable.fromDate.ui,
      ntf_from_date: dsrData.stagesTable.fromDate.ntf,
      pt_from_date: dsrData.stagesTable.fromDate.pt,
      disposal_from_date: dsrData.stagesTable.fromDate.disposal,
    };

    // Use upsert (insert or update) for all tables
    const [complaintsResult, amountResult, stagesResult] = await Promise.all([
      supabaseAdmin
        .from('dsr_complaints_data')
        .upsert(complaintsData, { 
          onConflict: 'officer_id,report_date',
          returning: 'minimal'
        }),
      
      supabaseAdmin
        .from('dsr_amount_data')
        .upsert(amountData, { 
          onConflict: 'officer_id,report_date',
          returning: 'minimal'
        }),
      
      supabaseAdmin
        .from('dsr_stages_data')
        .upsert(stagesData, { 
          onConflict: 'officer_id,report_date',
          returning: 'minimal'
        })
    ]);

    // Check for errors
    if (complaintsResult.error) {
      console.error('Error updating complaints data:', complaintsResult.error);
      throw complaintsResult.error;
    }
    if (amountResult.error) {
      console.error('Error updating amount data:', amountResult.error);
      throw amountResult.error;
    }
    if (stagesResult.error) {
      console.error('Error updating stages data:', stagesResult.error);
      throw stagesResult.error;
    }

    return NextResponse.json({
      success: true,
      message: 'DSR data updated successfully',
      data: {
        complaintsUpdated: true,
        amountUpdated: true,
        stagesUpdated: true
      }
    });

  } catch (error) {
    console.error('Error updating DSR data:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
} 