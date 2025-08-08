// API endpoints for DSR dashboard report tables
// Handles CRUD operations for all 21 tables

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Table name mapping
const TABLE_MAPPING = {
  1: 'complaints_ncrp_ccps',
  2: 'amount_lost_frozen',
  3: 'stages_of_cases',
  4: 'ncrp_complaints',
  5: 'cctns_complaints',
  6: 'trending_mo',
  7: 'helpline_1930',
  8: 'above_1_lakh',
  9: 'above_50_lakh',
  10: 'meity_requests',
  11: 'sim_blocking',
  12: 'content_blocking',
  13: 'ceir_data',
  14: 'linkage_cases',
  15: 'ciar_data',
  16: 'ccw_headquarters',
  17: 'awareness_programs',
  18: 'cyber_volunteers',
  19: 'social_media_posts',
  20: 'training_programs',
  21: 'duty_leave_details'
};

// GET - Retrieve data for a specific table
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('tableId');
    const date = searchParams.get('date');
    const district = searchParams.get('district');
    const policeStation = searchParams.get('policeStation');

    if (!tableId || !TABLE_MAPPING[tableId]) {
      return NextResponse.json({ error: 'Invalid table ID' }, { status: 400 });
    }

    const tableName = TABLE_MAPPING[tableId];
    let query = `SELECT * FROM ${tableName} WHERE 1=1`;
    const params = [];
    let paramCount = 0;

    if (date) {
      paramCount++;
      query += ` AND report_date = $${paramCount}`;
      params.push(date);
    }

    if (district) {
      paramCount++;
      query += ` AND district = $${paramCount}`;
      params.push(district);
    }

    if (policeStation) {
      paramCount++;
      query += ` AND police_station = $${paramCount}`;
      params.push(policeStation);
    }

    query += ' ORDER BY report_date DESC, created_at DESC';

    const result = await pool.query(query, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });

  } catch (error) {
    console.error('Error fetching DSR table data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new record
export async function POST(request) {
  try {
    const body = await request.json();
    const { tableId, data, userId } = body;

    if (!tableId || !TABLE_MAPPING[tableId]) {
      return NextResponse.json({ error: 'Invalid table ID' }, { status: 400 });
    }

    if (!data || !userId) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    const tableName = TABLE_MAPPING[tableId];
    
    // Add common fields
    const recordData = {
      ...data,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Build dynamic insert query
    const columns = Object.keys(recordData);
    const values = Object.values(recordData);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

    const query = `
      INSERT INTO ${tableName} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await pool.query(query, values);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Record created successfully'
    });

  } catch (error) {
    console.error('Error creating DSR table record:', error);
    
    // Handle unique constraint violations
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Record already exists for this date and location' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create record', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update existing record
export async function PUT(request) {
  try {
    const body = await request.json();
    const { tableId, id, data, userId } = body;

    if (!tableId || !TABLE_MAPPING[tableId]) {
      return NextResponse.json({ error: 'Invalid table ID' }, { status: 400 });
    }

    if (!id || !data || !userId) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    const tableName = TABLE_MAPPING[tableId];
    
    // Add updated timestamp
    const updateData = {
      ...data,
      updated_at: new Date()
    };

    // Build dynamic update query
    const columns = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');

    const query = `
      UPDATE ${tableName}
      SET ${setClause}
      WHERE id = $${columns.length + 1}
      RETURNING *
    `;

    const result = await pool.query(query, [...values, id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Record updated successfully'
    });

  } catch (error) {
    console.error('Error updating DSR table record:', error);
    return NextResponse.json(
      { error: 'Failed to update record', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete record
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('tableId');
    const id = searchParams.get('id');

    if (!tableId || !TABLE_MAPPING[tableId]) {
      return NextResponse.json({ error: 'Invalid table ID' }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing record ID' }, { status: 400 });
    }

    const tableName = TABLE_MAPPING[tableId];
    
    const query = `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Record deleted successfully',
      deletedRecord: result.rows[0]
    });

  } catch (error) {
    console.error('Error deleting DSR table record:', error);
    return NextResponse.json(
      { error: 'Failed to delete record', details: error.message },
      { status: 500 }
    );
  }
}
