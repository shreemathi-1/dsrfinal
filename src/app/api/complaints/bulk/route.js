import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { pool } from '@/lib/database';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    try {
      // Convert File to Buffer for processing
      const buffer = Buffer.from(await file.arrayBuffer());
      const workbook = XLSX.read(buffer, { 
        type: 'array',
        cellDates: true,
        dateNF: 'yyyy-mm-dd'
      });

      // Get the first sheet
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        return NextResponse.json(
          { error: 'Excel file appears to be empty' },
          { status: 400 }
        );
      }

      const worksheet = workbook.Sheets[firstSheetName];
      if (!worksheet) {
        return NextResponse.json(
          { error: 'Excel sheet appears to be empty' },
          { status: 400 }
        );
      }

      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: '',
        blankrows: false
      });

      if (!data || data.length === 0) {
        return NextResponse.json(
          { error: 'No valid data found in the Excel file' },
          { status: 400 }
        );
      }

      // Start a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Prepare the insert query
        const insertQuery = `
          INSERT INTO complaints (
            s_no,
            acknowledgement_no,
            state_name,
            district_name,
            police_station,
            crime_additional_info,
            category,
            sub_category,
            status,
            incident_date,
            complaint_date,
            last_action_taken_on,
            fraudulent_amount,
            lien_amount,
            suspect_name,
            suspect_mobile_no,
            suspect_id_no,
            complainant_name,
            complainant_address,
            complainant_mobile_no,
            complainant_email
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        `;

        // Process each row
        for (const row of data) {
          const values = [
            row['S.No.'] || '',
            row['Acknowledgement No.'] || '',
            row['State Name'] || 'Tamil Nadu',
            row['District Name'] || '',
            row['Police Station'] || '',
            row['Crime Additional Information'] || '',
            row['Category'] || '',
            row['Sub Category'] || '',
            row['Status'] || 'Registered',
            row['Incident Date'] || null,
            row['Complaint Date'] || new Date().toISOString().split('T')[0],
            row['Last Action Taken on'] || null,
            row['Fraudulent Amount'] || 0,
            row['Lien Amount'] || 0,
            row['Suspect Name'] || '',
            row['Suspect Mobile No'] || '',
            row['Suspect Id No.'] || '',
            row['Complainant Name'] || '',
            row['Complainant Address'] || '',
            row['Complainant Mobile No.'] || '',
            row['Complainant Email'] || ''
          ];

          await client.query(insertQuery, values);
        }

        // Commit the transaction
        await client.query('COMMIT');

        return NextResponse.json({
          success: true,
          message: `Successfully uploaded ${data.length} complaints`,
          count: data.length
        });
      } catch (error) {
        // Rollback on error
        await client.query('ROLLBACK');
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to save complaints to database: ' + error.message },
          { status: 500 }
        );
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('File processing error:', error);
      return NextResponse.json(
        { error: 'Failed to process Excel file: ' + error.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Request handling error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to download Excel template
export async function GET() {
  try {
    // Define the template structure
    const templateData = {
      headers: [
        'S No', 'Acknowledgement No', 'State Name', 'District Name', 'Police Station',
        'Category', 'Sub Category', 'Status', 'Incident Date', 'Complaint Date',
        'Last Action Taken On', 'Crime Additional Info', 'Complainant Name',
        'Complainant Address', 'Complainant Mobile No', 'Complainant Email',
        'Suspect Name', 'Suspect Mobile No', 'Suspect ID No', 
        'Fraudulent Amount', 'Lien Amount'
      ],
      sampleData: [
        {
          'S No': 'CC20250101001',
          'Acknowledgement No': 'ACK20250001',
          'State Name': 'Tamil Nadu',
          'District Name': 'Chennai',
          'Police Station': 'T.Nagar',
          'Category': 'Financial Fraud',
          'Sub Category': 'UPI Fraud',
          'Status': 'Open',
          'Incident Date': '2025-01-15',
          'Complaint Date': '2025-01-15',
          'Last Action Taken On': '',
          'Crime Additional Info': 'UPI transaction fraud via fake payment gateway',
          'Complainant Name': 'John Doe',
          'Complainant Address': '123 Anna Nagar, Chennai, Tamil Nadu - 600040',
          'Complainant Mobile No': '9876543210',
          'Complainant Email': 'john.doe@example.com',
          'Suspect Name': 'Unknown',
          'Suspect Mobile No': '',
          'Suspect ID No': '',
          'Fraudulent Amount': '50000',
          'Lien Amount': '0'
        }
      ],
      instructions: [
        '1. Fill in all required fields marked with * in the template',
        '2. Use YYYY-MM-DD format for dates (e.g., 2025-01-15)',
        '3. Mobile numbers should be exactly 10 digits',
        '4. Email should be in valid format (e.g., user@domain.com)',
        '5. Status must be one of: Open, Under Investigation, Closed, Pending, Resolved',
        '6. Amounts should be numbers only (no currency symbols)',
        '7. Delete the sample row before uploading your actual data'
      ]
    };

    return NextResponse.json({
      success: true,
      templateData
    });

  } catch (error) {
    console.error("Template generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    );
  }
} 