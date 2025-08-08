// PATCH: Update user details (name, firstName, lastName, phone, user_type, district, police_station, status)
export async function PATCH(request) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      firstName,
      lastName,
      phone,
      userType,
      district,
      policeStation,
      status,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Construct full name from firstName and lastName if both are provided
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : name;

    // Update user metadata
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          ...(fullName && { name: fullName }),
          ...(firstName && { first_name: firstName }),
          ...(lastName && { last_name: lastName }),
          ...(phone && { phone }),
          ...(userType && { user_type: userType }),
          ...(district && { district }),
          ...(policeStation && { police_station: policeStation }),
        },
        // Optionally update email_confirmed_at for status
        ...(status === "Active"
          ? { email_confirm: true }
          : status === "Inactive"
          ? { email_confirm: false }
          : {}),
      }
    );

    if (error) {
      console.error("Supabase update user error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: data.user });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
/**
 * Admin Users API Route
 * Handles user management operations that require service role permissions
 */

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Get environment variables with fallbacks
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing environment variables:", {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!serviceRoleKey,
  });
}

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function GET() {
  try {
    // Check if environment variables are properly configured
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          error: "Server configuration error: Missing Supabase credentials",
          details: "Please check environment variables",
        },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error("Supabase admin error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Transform the data to match your frontend structure
    const transformedUsers =
      data.users?.map((user) => ({
        id: user.id,
        name: user.user_metadata?.name || user.email,
        firstName: user.user_metadata?.first_name || "",
        lastName: user.user_metadata?.last_name || "",
        phone: user.user_metadata?.phone || "",
        email: user.email,
        district: user.user_metadata?.district || "Not Assigned",
        policeStation: user.user_metadata?.police_station || "Not Assigned",
        status: user.email_confirmed_at ? "Active" : "Inactive",
        createdAt: new Date(user.created_at).toISOString().split("T")[0],
        supabaseId: user.id,
        team: user.user_metadata?.team || "Not Assigned",
        rankings: user.user_metadata?.rankings || "Not Assigned",
        emailIdentifier: user.user_metadata?.email || "Not Assigned",
        userIdentifier: user.user_metadata?.userIdentifier || "Not Assigned",
      })) || [];

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      password,
      name,
      department,
      rankings,
      userIdentifier,
      district,
      policeStation,
      firstName,
      lastName,
      phone,
      team,
      email, // get email from request
      status,
    } = body;

    // Compose user_metadata for Supabase
    const user_metadata = {
      name,
      department,
      rankings,
      userIdentifier,
      district,
      firstName,
      lastName,
      phone,
      team,
      emailIdentifier: email,
      police_station: policeStation,
    };

    // Use provided email if available, otherwise generate dummy email
    const emailId = `${userIdentifier || Date.now()}@example.com`;

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: emailId,
      password,
      user_metadata,
      email_confirm: status === "Active",
    });

    if (error) {
      console.error("Supabase create user error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: data.user });
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
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error("Supabase delete user error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
