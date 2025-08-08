import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function GET() {
  try {
    console.log("Testing database connection...");
    console.log("Supabase URL:", supabaseUrl);
    console.log("Service Role Key exists:", !!serviceRoleKey);

    // Test 1: Check if we can connect to Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser();
    console.log("Auth test:", { authData, authError });

    // Test 2: Try to list tables (this might not work with RLS)
    const { data: tablesData, error: tablesError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public");
    console.log("Tables test:", { tablesData, tablesError });

    // Test 3: Try to query the complaints table with different names
    const testQueries = [
      { name: "complaints", table: "complaints" },
      { name: "COMPLAINTS", table: "COMPLAINTS" },
      { name: "Complaints", table: "Complaints" }
    ];

    const results = {};

    for (const test of testQueries) {
      try {
        const { data, error, count } = await supabaseAdmin
          .from(test.table)
          .select("*", { count: 'exact', head: true });
        
        results[test.name] = {
          success: !error,
          error: error?.message,
          count,
          data: data
        };
      } catch (e) {
        results[test.name] = {
          success: false,
          error: e.message
        };
      }
    }

    // Test 4: Try a simple insert to see what columns are required
    let insertTestResult = null;
    try {
      const { data, error } = await supabaseAdmin
        .from("complaints")
        .insert([{ test: "test" }])
        .select();
      
      insertTestResult = { 
        success: !error, 
        error: error?.message || null, 
        fullError: error,
        data 
      };
    } catch (e) {
      insertTestResult = { success: false, error: e.message, fullError: e };
    }

    // Test 5: Try to describe the table structure
    let tableStructure = null;
    try {
      const { data, error } = await supabaseAdmin.rpc('get_table_columns', { table_name: 'complaints' });
      tableStructure = { data, error: error?.message };
    } catch (e) {
      // Try alternative method
      try {
        const { data, error } = await supabaseAdmin
          .from("complaints")
          .select("*")
          .limit(1);
        tableStructure = { 
          sampleData: data, 
          error: error?.message,
          note: "Sample data from table"
        };
      } catch (e2) {
        tableStructure = { error: e2.message };
      }
    }

    return NextResponse.json({
      supabaseUrl: supabaseUrl,
      hasServiceKey: !!serviceRoleKey,
      authTest: { authData: !!authData, authError: authError?.message },
      tablesTest: { data: tablesData, error: tablesError?.message },
      queryTests: results,
      insertTest: insertTestResult,
      tableStructure: tableStructure
    });

  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      { error: "Database test failed", details: error.message },
      { status: 500 }
    );
  }
} 