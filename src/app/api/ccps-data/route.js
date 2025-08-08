import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // Fetch data for the specific date from your database
    const { data, error } = await supabase
      .from('ccps_data')
      .select('*')
      .eq('date', date)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, tableData: data || {} });
  } catch (error) {
    console.error('Error fetching CCPS data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { date, data } = body;

    if (!date || !data) {
      return NextResponse.json({ error: 'Date and data are required' }, { status: 400 });
    }

    // Update or insert data for the specific date
    const { data: result, error } = await supabase
      .from('ccps_data')
      .upsert({
        date,
        ...data
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error saving CCPS data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
