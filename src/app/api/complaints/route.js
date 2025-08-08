import { NextResponse } from 'next/server';
import { pool, supabase } from '@/lib/database';

// Helper function to handle database errors
const handleDatabaseError = (error) => {
  console.error('Database error:', error);
  
  if (error.code === '23505') { // Unique violation
    if (error.constraint?.includes('s_no')) {
      return { error: 'S.No already exists', status: 409 };
    }
    if (error.constraint?.includes('acknowledgement_no')) {
      return { error: 'Acknowledgement No. already exists', status: 409 };
    }
    return { error: 'Duplicate entry found', status: 409 };
  }
  
  return { error: 'Internal server error', status: 500 };
};

export async function POST(request) {
  try {
    const data = await request.json();

    // Check if acknowledgement_no is provided (required field)
    if (!data.acknowledgementNo) {
      return NextResponse.json(
        { error: 'Acknowledgement No. is required' },
        { status: 400 }
      );
    }

    // Try PostgreSQL first, fallback to Supabase
    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Check uniqueness
        if (data.sNo) {
          const sNoResult = await client.query(
            'SELECT s_no FROM complaints WHERE s_no = $1',
            [data.sNo]
          );
          if (sNoResult.rows.length > 0) {
            throw { code: '23505', constraint: 'complaints_s_no_key' };
          }
        }

        const ackResult = await client.query(
          'SELECT acknowledgement_no FROM complaints WHERE acknowledgement_no = $1',
          [data.acknowledgementNo]
        );
        if (ackResult.rows.length > 0) {
          throw { code: '23505', constraint: 'complaints_acknowledgement_no_key' };
        }

        // Insert complaint
        const result = await client.query(
          `INSERT INTO complaints (
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
          RETURNING *`,
          [
            data.sNo || null,
            data.acknowledgementNo,
            data.stateName || null,
            data.districtName || null,
            data.policeStation || null,
            data.crimeAdditionalInfo || null,
            data.category || null,
            data.subCategory || null,
            data.status || null,
            data.incidentDate || null,
            data.complaintDate || null,
            data.lastActionTakenOn || null,
            data.fraudulentAmount || null,
            data.lienAmount || null,
            data.suspectName || null,
            data.suspectMobileNo || null,
            data.suspectIdNo || null,
            data.complainantName || null,
            data.complainantAddress || null,
            data.complainantMobileNo || null,
            data.complainantEmail || null
          ]
        );

        await client.query('COMMIT');
        return NextResponse.json({
          message: 'Complaint created successfully',
          complaint: result.rows[0]
        });
      } catch (error) {
        await client.query('ROLLBACK');
        const { error: errMsg, status } = handleDatabaseError(error);
        return NextResponse.json({ error: errMsg }, { status });
      } finally {
        client.release();
      }
    } catch (pgError) {
      console.warn('PostgreSQL connection failed, falling back to Supabase:', pgError);
      
      // Fallback to Supabase
      const { data: complaint, error } = await supabase
        .from('complaints')
        .insert([{
          s_no: data.sNo,
          acknowledgement_no: data.acknowledgementNo,
          state_name: data.stateName,
          district_name: data.districtName,
          police_station: data.policeStation,
          crime_additional_info: data.crimeAdditionalInfo,
          category: data.category,
          sub_category: data.subCategory,
          status: data.status,
          incident_date: data.incidentDate,
          complaint_date: data.complaintDate,
          last_action_taken_on: data.lastActionTakenOn,
          fraudulent_amount: data.fraudulentAmount,
          lien_amount: data.lienAmount,
          suspect_name: data.suspectName,
          suspect_mobile_no: data.suspectMobileNo,
          suspect_id_no: data.suspectIdNo,
          complainant_name: data.complainantName,
          complainant_address: data.complainantAddress,
          complainant_mobile_no: data.complainantMobileNo,
          complainant_email: data.complainantEmail
        }])
        .select()
        .single();

      if (error) {
        const { error: errMsg, status } = handleDatabaseError(error);
        return NextResponse.json({ error: errMsg }, { status });
      }

      return NextResponse.json({
        message: 'Complaint created successfully',
        complaint
      });
    }
  } catch (error) {
    console.error('Error creating complaint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 100;
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    
    // Try PostgreSQL first
    try {
      let query = 'SELECT * FROM complaints WHERE is_deleted = false OR is_deleted IS NULL';
      const params = [];
      let paramCount = 0;
      
      if (status) {
        paramCount++;
        query += ` AND status = $${paramCount}`;
        params.push(status);
      }
      
      if (category) {
        paramCount++;
        query += ` AND category = $${paramCount}`;
        params.push(category);
      }
      
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
      
      if (limit) {
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        params.push(limit);
      }
      
      const result = await pool.query(query, params);
      
      // Get status counts for dashboard
      const statusCountsResult = await pool.query(`
        SELECT status, COUNT(*) as count 
        FROM complaints 
        WHERE is_deleted = false OR is_deleted IS NULL
        GROUP BY status
      `);
      
      const statusCounts = {};
      statusCountsResult.rows.forEach(row => {
        statusCounts[row.status || 'Unknown'] = parseInt(row.count);
      });
      
      return NextResponse.json({
        complaints: result.rows,
        total: result.rows.length,
        statusCounts: statusCounts
      });
    } catch (pgError) {
      console.warn('PostgreSQL connection failed, falling back to Supabase:', pgError);
      
      // Fallback to Supabase
      let query = supabase
        .from('complaints')
        .select('*')
        .or('is_deleted.is.null,is_deleted.eq.false');
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (category) {
        query = query.eq('category', category);
      }
      
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Get status counts for dashboard
      const { data: statusData, error: statusError } = await supabase
        .from('complaints')
        .select('status')
        .or('is_deleted.is.null,is_deleted.eq.false');
      
      const statusCounts = {};
      if (!statusError && statusData) {
        statusData.forEach(row => {
          const status = row.status || 'Unknown';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
      }
      
      return NextResponse.json({
        complaints: data || [],
        total: data?.length || 0,
        statusCounts: statusCounts
      });
    }
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { complaintId, ...updateFields } = body;

    if (!complaintId) {
      return NextResponse.json(
        { error: "Complaint ID is required" },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (updateFields.complainantEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateFields.complainantEmail)) {
        return NextResponse.json(
          { error: "Please provide a valid email address" },
          { status: 400 }
        );
      }
    }

    // Validate mobile numbers if provided
    const mobileRegex = /^[0-9]{10}$/;
    if (updateFields.complainantMobileNo && !mobileRegex.test(updateFields.complainantMobileNo)) {
      return NextResponse.json(
        { error: "Complainant mobile number must be 10 digits" },
        { status: 400 }
      );
    }

    if (updateFields.suspectMobileNo && !mobileRegex.test(updateFields.suspectMobileNo)) {
      return NextResponse.json(
        { error: "Suspect mobile number must be 10 digits" },
        { status: 400 }
      );
    }

    // Validate amounts if provided
    if (updateFields.fraudulentAmount && parseFloat(updateFields.fraudulentAmount) < 0) {
      return NextResponse.json(
        { error: "Fraudulent amount cannot be negative" },
        { status: 400 }
      );
    }

    if (updateFields.lienAmount && parseFloat(updateFields.lienAmount) < 0) {
      return NextResponse.json(
        { error: "Lien amount cannot be negative" },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (updateFields.status) {
      const validStatuses = [
        "Closed",
        "FIR Registered",
        "NC Registered",
        "No Action",
        "Re Open",
        "Registered",
        "Rejected",
        "Under Process",
        "Withdrawal"
      ];
      if (!validStatuses.includes(updateFields.status)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }
    }

    // Convert field names to database column names
    const cleanUpdateData = {};
    const fieldMapping = {
      sNo: 's_no',
      acknowledgementNo: 'acknowledgement_no',
      stateName: 'state_name',
      districtName: 'district_name',
      policeStation: 'police_station',
      category: 'category',
      subCategory: 'sub_category',
      status: 'status',
      incidentDate: 'incident_date',
      complaintDate: 'complaint_date',
      lastActionTakenOn: 'last_action_taken_on',
      crimeAdditionalInfo: 'crime_additional_info',
      complainantName: 'complainant_name',
      complainantAddress: 'complainant_address',
      complainantMobileNo: 'complainant_mobile_no',
      complainantEmail: 'complainant_email',
      suspectName: 'suspect_name',
      suspectMobileNo: 'suspect_mobile_no',
      suspectIdNo: 'suspect_id_no',
      fraudulentAmount: 'fraudulent_amount',
      lienAmount: 'lien_amount'
    };

    for (const [camelCase, snake_case] of Object.entries(fieldMapping)) {
      if (updateFields[camelCase] !== undefined) {
        if (camelCase === 'fraudulentAmount' || camelCase === 'lienAmount') {
          cleanUpdateData[snake_case] = updateFields[camelCase] ? parseFloat(updateFields[camelCase]) : 0;
        } else {
          cleanUpdateData[snake_case] = updateFields[camelCase];
        }
      }
    }

    const { data, error } = await supabase
      .from("complaints")
      .update(cleanUpdateData)
      .eq("id", complaintId)
      .eq("is_deleted", false)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Complaint not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      complaint: data,
      message: "Complaint updated successfully"
    });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const complaintId = searchParams.get("complaintId");

    if (!complaintId) {
      return NextResponse.json(
        { error: "Complaint ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("complaints")
      .update({ is_deleted: true })
      .eq("id", complaintId)
      .eq("is_deleted", false)
      .select("id, s_no, acknowledgement_no")
      .single();

    if (error) {
      console.error("Supabase soft delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Complaint not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Complaint ${data.s_no} deleted successfully`
    });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 