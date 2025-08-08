/**
 * Test API Route
 * Simple endpoint to test if environment variables are loaded correctly
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    return NextResponse.json({
      message: 'API route is working',
      config: {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey,
        urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'Missing',
        serviceKeyPreview: serviceRoleKey ? `${serviceRoleKey.substring(0, 30)}...` : 'Missing'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Test API failed', details: error.message },
      { status: 500 }
    );
  }
} 