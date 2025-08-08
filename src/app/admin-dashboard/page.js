"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { complaintFormFields } from "../../data/complaintFields";
import AddUserModal from "../../components/forms/AddUserModal";
import { supabase } from "../../lib/supabaseClient";
import { useCallback } from "react";

// Import new components
import AdminHeader from "./components/AdminHeader";
import DashboardStats from "./components/DashboardStats";
import UserManagement from "./components/UserManagement";
import UserReports from "./components/UserReports";
import RolesPermissions from "./components/RolesPermissions";
import FormFieldManagement from "./components/FormFieldManagement";
import AdminSettings from "./components/AdminSettings";

export default function AdminDashboard() {
  // ...existing code from admin-dashboard/page.js...
}
