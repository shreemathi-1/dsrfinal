"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { crimeCategories } from "../../data/categories";
import {
  getAllDistricts,
  getPoliceStationsByDistrict,
} from "../../data/districts";
import * as XLSX from "xlsx";
import {  
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import BulkUpload from './components/BulkUpload';
import { getVisibleTables, normalizeUserType, isTableVisible, getTableDefinition, shouldRedirectToCCPS, getTableComponentsForUser, shouldRedirectToReports } from '../../config/tableConfig';

// Define the new status options at the top of the file or near other constants
const STATUS_OPTIONS = [
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

export default function NewOfficerDashboard() {
  // === ALL HOOKS MUST BE DECLARED FIRST ===
  const router = useRouter();
  const { user, profile, loading, logout, isAuthenticated } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  
  // All state declarations MUST come before any conditional logic
  const [activeTab, setActiveTab] = useState("dashboard");
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [statusCounts, setStatusCounts] = useState({});

  // Complaint form state
  // DSR Tables Data
  const [dsrData, setDsrData] = useState({
    complaintsTable: {
      financial: {
        onDate: { complaints: 0, firRegistered: 0, csrIssued: 0 },
        fromDate: { complaints: 0, firRegistered: 0, csrIssued: 0 },
        data2024: { complaints: 0, firRegistered: 0, csrIssued: 0 },
      },
      nonFinancial: {
        onDate: { complaints: 0, firRegistered: 0, csrIssued: 0 },
        fromDate: { complaints: 0, firRegistered: 0, csrIssued: 0 },
        data2024: { complaints: 0, firRegistered: 0, csrIssued: 0 },
      },
    },
    amountTable: [
      {
        category: "Total Amount Lost (in Rs)",
        onDate: 0,
        fromDate: 0,
        data2024: 0,
      },
      {
        category: "Total Amount Frozen (in Rs)",
        onDate: 0,
        fromDate: 0,
        data2024: 0,
      },
      {
        category: "Total Amount Returned (in Rs)",
        onDate: 0,
        fromDate: 0,
        data2024: 0,
      },
      {
        category: "No of Accused Arrested",
        onDate: 0,
        fromDate: 0,
        data2024: 0,
      },
      {
        category: "No of Persons detained under Act 14 of 1982",
        onDate: 0,
        fromDate: 0,
        data2024: 0,
      },
      {
        category: "No of Loan App Complaints",
        onDate: 0,
        fromDate: 0,
        data2024: 0,
      },
      {
        category: "No of FIR in Loan App Cases",
        onDate: 0,
        fromDate: 0,
        data2024: 0,
      },
      {
        category: "No of CSR in Loan App Cases",
        onDate: 0,
        fromDate: 0,
        data2024: 0,
      },
    ],
    stagesTable: {
      onDate: { totalComplaints: 0, ui: 0, ntf: 0, pt: 0, disposal: 0 },
      fromDate: { totalComplaints: 0, ui: 0, ntf: 0, pt: 0, disposal: 0 },
    },
  });

  const [editingDSR, setEditingDSR] = useState(false);

  // DSR Date Management
  const [dsrDates, setDsrDates] = useState({
    reportDate: new Date().toISOString().split("T")[0], // Current date as default
    fromDate: "2025-01-01", // Default from date
    fromDateCases: "2021-04-01", // Default from date for cases table
  });

  // Profile dropdown state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Complaints dropdown state
  const [complaintsDropdownOpen, setComplaintsDropdownOpen] = useState(false);

  // View complaints state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // 'list', 'detail', or 'edit'
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [editComplaintData, setEditComplaintData] = useState({});
  const [savingComplaint, setSavingComplaint] = useState(false);

  // Confirmation popup for complaint submission
  const [showComplaintConfirm, setShowComplaintConfirm] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);
  // Handler for closing the confirmation modal
  const handleComplaintConfirmOk = () => {
    setShowComplaintConfirm(false);
    setSubmittedComplaint(null);
  };

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: user?.email || "",
    userType: profile?.user_type || "Officer",
    district: profile?.district || "Chennai",
    policeStation: profile?.police_station || "T.Nagar",
    employeeId: profile?.employee_id || "EMP001",
    phoneNumber: profile?.phone_number || "",
    joinDate: profile?.join_date || "2024-01-01",
  });
  const [editingProfile, setEditingProfile] = useState(false);

  // Confirmation popup for complaint submission
  const ComplaintConfirmationModal = ({ open, complaint, onOk }) => {
    if (!open || !complaint) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
          <h2 className="text-xl font-semibold mb-4 text-green-700">
            Complaint Submitted
          </h2>
          <div className="mb-4 text-gray-700 text-sm">
            <div>
              <b>S.No:</b> {complaint.s_no || complaint.sNo}
            </div>
            <div>
              <b>Acknowledgement No:</b>{" "}
              {complaint.acknowledgement_no || complaint.acknowledgementNo}
            </div>
            <div>
              <b>Complainant:</b> {complaint.complainantName}
            </div>
            <div>
              <b>Category:</b> {complaint.category}
            </div>
            <div>
              <b>Status:</b> {complaint.status}
            </div>
            <div>
              <b>Submitted At:</b>{" "}
              {complaint.submittedAt
                ? new Date(complaint.submittedAt).toLocaleString()
                : ""}
            </div>
          </div>
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition w-full"
            onClick={onOk}
          >
            OK
          </button>
        </div>
      </div>
    );
  };

  // Settings state
  const [settingsData, setSettingsData] = useState({
    // General Settings
    language: "English",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12-hour",

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notificationSound: true,

    // Display Settings
    theme: "light",
    fontSize: "medium",
    autoRefresh: true,
    refreshInterval: 30,

    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,

    // Workflow Settings
    autoSave: true,
    defaultStatus: "Open",
    defaultCategory: "Cyber Fraud",
    defaultDistrict: "Chennai",
  });

  const [complaintData, setComplaintData] = useState({
    sNo: "",
    acknowledgementNo: "",
    stateName: "Tamil Nadu",
    districtName: "",
    policeStation: "",
    crimeAdditionalInfo: "",
    category: "",
    subCategory: "",
    status: "Open",
    incidentDate: "",
    complaintDate: new Date().toISOString().split("T")[0],
    lastActionTakenOn: "",
    fraudulentAmount: "",
    lienAmount: "",
    suspectName: "",
    suspectMobileNo: "",
    suspectIdNo: "",
    complainantName: "",
    complainantAddress: "",
    complainantMobileNo: "",
    complainantEmail: "",
  });

  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [bulkUploadProgress, setBulkUploadProgress] = useState({
    isProcessing: false,
    stage: "",
    processedRows: 0,
    totalRows: 0,
    errors: [],
    results: null,
  });

  // State for showing complaints options
  const [showComplaintsOptions, setShowComplaintsOptions] = useState(false);

  useEffect(() => {
    // Only load complaints when authenticated
    if (isAuthenticated) {
      loadComplaints();
    }
  }, [isAuthenticated, loading, router]);

  // Load DSR data when user or report date changes
  useEffect(() => {
    if (isAuthenticated && user?.id && dsrDates.reportDate) {
      loadDSRData();
    }
  }, [isAuthenticated, user?.id, dsrDates.reportDate]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest(".profile-dropdown")) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  // Helper function to get user display name (same logic as admin dashboard)
  const getUserDisplayName = () => {
    // Debug logging to see what data we have
    console.log("=== USER DISPLAY NAME DEBUG ===");
    console.log("User object:", user);
    console.log("Profile object:", profile);
    console.log("User metadata:", user?.user_metadata);
    console.log("Profile full_name:", profile?.full_name);
    console.log("Profile user_type:", profile?.user_type);

    // // First check for firstName + lastName in user metadata
    // if (user?.user_metadata?.firstName && user?.user_metadata?.lastName) {
    //   console.log("Using firstName + lastName from metadata");
    //   return `${user.user_metadata.firstName} ${user.user_metadata.lastName}`;
    // }

    // // Check if profile.full_name exists and is not just the email
    // if (profile?.full_name && profile.full_name !== user?.email) {
    //   console.log("Using profile full_name (not email)");
    //   return profile.full_name;
    // }

    // // Check if user_type exists and create a display name from it
    // if (profile?.user_type && profile.user_type !== "officer") {
    //   console.log("Using user_type for display name");
    //   return profile.user_type === "dsr-admin"
    //     ? "DSR Admin"
    //     : profile.user_type === "admin"
    //     ? "Admin"
    //     : profile.user_type.charAt(0).toUpperCase() +
    //       profile.user_type.slice(1);
    // }

    // console.log("Using fallback: Officer");
    return user.user_metadata.name;
  };

  // Update profile data when user/profile changes
  useEffect(() => {
    if (user || profile) {
      setProfileData((prev) => ({
        ...prev,
        fullName: getUserDisplayName(),
        email: user?.email || "",
        userType: profile?.user_type || "Officer",
        district: profile?.district || "Chennai",
        policeStation: profile?.police_station || "T.Nagar",
        employeeId: profile?.employee_id || "EMP001",
        phoneNumber: profile?.phone_number || "",
        joinDate: profile?.join_date || "2024-01-01",
      }));
    }
  }, [user, profile]);

  // Removed auto-generation of complaint numbers as they are now manually entered

  const loadComplaints = async () => {
    if (!isAuthenticated) return;

    try {
      setLoadingComplaints(true);

      // Load complaints from database with improved API
      const response = await fetch(
        "/api/complaints?limit=100&sortBy=created_at&sortOrder=desc"
      );

      if (!response.ok) {
        throw new Error(`Failed to load complaints: ${response.status}`);
      }

      const result = await response.json();
      console.log("Loaded complaints:", result);

      if (result.complaints) {
        // Transform database format to frontend format
        const transformedComplaints = result.complaints.map((complaint) => ({
          id: complaint.id,
          sNo: complaint.s_no,
          acknowledgementNo: complaint.acknowledgement_no,
          stateName: complaint.state_name,
          districtName: complaint.district_name,
          policeStation: complaint.police_station,
          category: complaint.category,
          subCategory: complaint.sub_category,
          status: complaint.status || 'Unknown',
          incidentDate: complaint.incident_date,
          complaintDate: complaint.complaint_date,
          lastActionTakenOn: complaint.last_action_taken_on,
          crimeAdditionalInfo: complaint.crime_additional_info,
          complainantName: complaint.complainant_name,
          complainantAddress: complaint.complainant_address,
          complainantMobileNo: complaint.complainant_mobile_no,
          complainantEmail: complaint.complainant_email,
          suspectName: complaint.suspect_name,
          suspectMobileNo: complaint.suspect_mobile_no,
          suspectIdNo: complaint.suspect_id_no,
          fraudulentAmount: complaint.fraudulent_amount,
          lienAmount: complaint.lien_amount,
          submittedAt: complaint.created_at,
        }));

        setComplaints(transformedComplaints);
        
        // Store status counts for dynamic display
        if (result.statusCounts) {
          setStatusCounts(result.statusCounts);
        }
      }
    } catch (error) {
      console.error("Error loading complaints:", error);
      showError("Failed to load complaints. Please try again.");
    } finally {
      setLoadingComplaints(false);
    }
  };

  // Calculate dynamic stats from complaints data
  const getComplaintStats = () => {
    const total = complaints.length;
    
    // Use dynamic status counts from API if available
    const getStatusCount = (statusKey) => {
      if (Object.keys(statusCounts).length > 0) {
        return statusCounts[statusKey] || 0;
      }
      return complaints.filter(c => c.status === statusKey).length;
    };
    
    // Map status categories using actual status values
    const pending = getStatusCount('Registered') + getStatusCount('Under Process');
    const underInvestigation = getStatusCount('Under Investigation');
    const resolved = getStatusCount('Closed') + getStatusCount('FIR Registered');
    const rejected = getStatusCount('Rejected') + getStatusCount('No Action');
    
    // Get all status counts for dynamic display
    const allStatusCounts = Object.keys(statusCounts).length > 0 ? statusCounts : 
      STATUS_OPTIONS.reduce((acc, status) => {
        acc[status] = complaints.filter(c => c.status === status).length;
        return acc;
      }, {});

    // Calculate additional dynamic stats
    const totalFraudAmount = complaints.reduce(
      (sum, c) => sum + (parseFloat(c.fraudulentAmount) || 0),
      0
    );
    const recentComplaints = complaints.filter((c) => {
      if (!c.complaintDate) return false;
      const complaintDate = new Date(c.complaintDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return complaintDate >= weekAgo;
    }).length;

    const todayComplaints = complaints.filter((c) => {
      if (!c.complaintDate) return false;
      const complaintDate = new Date(c.complaintDate);
      const today = new Date();
      return complaintDate.toDateString() === today.toDateString();
    }).length;

    return {
      total,
      pending,
      underInvestigation,
      resolved,
      rejected,
      allStatusCounts,
      totalFraudAmount,
      recentComplaints,
      todayComplaints,
    };
  };

  // Dynamic trends analysis functions
  const getTopCrimeCategories = () => {
    if (!complaints.length) return [];

    const categoryCounts = {};
    complaints.forEach((complaint) => {
      const category = complaint.category || "Other";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const total = complaints.length;
    const categoryData = Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    return categoryData;
  };

  const getOverallTrends = () => {
    if (!complaints.length) return [];

    // Get overall status counts as trend data
    const stats = getComplaintStats();

    return [
      { status: "Pending", count: stats.pending, color: "#f59e0b" },
      {
        status: "Under Investigation",
        count: stats.underInvestigation,
        color: "#3b82f6",
      },
      { status: "Resolved", count: stats.resolved, color: "#10b981" },
    ];
  };

  // Filter complaints based on search and filters
  const getFilteredComplaints = () => {
    let filtered = [...complaints];
    console.log("Starting filter with", filtered.length, "complaints");
    console.log(
      "Filters: status =",
      statusFilter,
      ", category =",
      categoryFilter,
      ", search =",
      searchTerm
    );

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (complaint) =>
          complaint.complainantName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          complaint.acknowledgementNo
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          complaint.category
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          complaint.sNo?.toString().includes(searchTerm)
      );
      console.log("After search filter:", filtered.length, "complaints");
    }

    // Apply status filter
    if (statusFilter !== "All") {
      if (statusFilter === "Pending") {
        // For pending, include both 'Pending' and 'Open' status (same as stats calculation)
        filtered = filtered.filter(
          (complaint) =>
            complaint.status === "Pending" || complaint.status === "Open"
        );
        console.log(
          "After pending status filter (Pending OR Open):",
          filtered.length,
          "complaints"
        );
      } else if (statusFilter === "Resolved") {
        // For resolved, include both 'Resolved' and 'Closed' status (same as stats calculation)
        filtered = filtered.filter(
          (complaint) =>
            complaint.status === "Resolved" || complaint.status === "Closed"
        );
        console.log(
          "After resolved status filter (Resolved OR Closed):",
          filtered.length,
          "complaints"
        );
      } else {
        // For other statuses, use exact match
        filtered = filtered.filter(
          (complaint) => complaint.status === statusFilter
        );
        console.log(
          "After exact status filter (" + statusFilter + "):",
          filtered.length,
          "complaints"
        );
      }
    }

    // Apply category filter
    if (categoryFilter !== "All") {
      filtered = filtered.filter(
        (complaint) => complaint.category === categoryFilter
      );
      console.log("After category filter:", filtered.length, "complaints");
    }

    console.log(
      "Final filtered complaints:",
      filtered.map((c) => ({ name: c.complainantName, status: c.status }))
    );
    return filtered;
  };

  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setSelectedComplaint(null);
    setEditingComplaint(null);
    setEditComplaintData({});
    setViewMode("list");
  };

  const handleEditComplaint = (complaint) => {
    setEditingComplaint(complaint);
    setEditComplaintData({
      sNo: complaint.sNo || "",
      acknowledgementNo: complaint.acknowledgementNo || "",
      stateName: complaint.stateName || "Tamil Nadu",
      districtName: complaint.districtName || "",
      policeStation: complaint.policeStation || "",
      category: complaint.category || "",
      subCategory: complaint.subCategory || "",
      status: complaint.status || "Open",
      incidentDate: complaint.incidentDate || "",
      complaintDate: complaint.complaintDate || "",
      lastActionTakenOn: complaint.lastActionTakenOn || "",
      crimeAdditionalInfo: complaint.crimeAdditionalInfo || "",
      complainantName: complaint.complainantName || "",
      complainantAddress: complaint.complainantAddress || "",
      complainantMobileNo: complaint.complainantMobileNo || "",
      complainantEmail: complaint.complainantEmail || "",
      suspectName: complaint.suspectName || "",
      suspectMobileNo: complaint.suspectMobileNo || "",
      suspectIdNo: complaint.suspectIdNo || "",
      fraudulentAmount: complaint.fraudulentAmount || "",
      lienAmount: complaint.lienAmount || "",
    });
    setViewMode("edit");
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditComplaintData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveComplaint = async (e) => {
    e.preventDefault();

    try {
      setSavingComplaint(true);

      // Prepare data for API
      const complaintPayload = {
        id: editingComplaint.id,
        sNo: editComplaintData.sNo,
        acknowledgementNo: editComplaintData.acknowledgementNo,
        stateName: editComplaintData.stateName,
        districtName: editComplaintData.districtName,
        policeStation: editComplaintData.policeStation,
        category: editComplaintData.category,
        subCategory: editComplaintData.subCategory,
        status: editComplaintData.status,
        incidentDate: editComplaintData.incidentDate,
        complaintDate: editComplaintData.complaintDate,
        lastActionTakenOn: editComplaintData.lastActionTakenOn || null,
        crimeAdditionalInfo: editComplaintData.crimeAdditionalInfo || null,
        complainantName: editComplaintData.complainantName,
        complainantAddress: editComplaintData.complainantAddress,
        complainantMobileNo: editComplaintData.complainantMobileNo,
        complainantEmail: editComplaintData.complainantEmail,
        suspectName: editComplaintData.suspectName || null,
        suspectMobileNo: editComplaintData.suspectMobileNo || null,
        suspectIdNo: editComplaintData.suspectIdNo || null,
        fraudulentAmount: editComplaintData.fraudulentAmount || 0,
        lienAmount: editComplaintData.lienAmount || 0,
      };

      console.log("Updating complaint data:", complaintPayload);

      // Update via API
      const response = await fetch(`/api/complaints/${editingComplaint.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(complaintPayload),
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (!response.ok) {
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`
        );
      }

      if (result.success || result.complaint) {
        // Success - show success message
        showSuccess(
          `Complaint updated successfully! S.No: ${
            result.complaint?.s_no || editComplaintData.sNo
          }, Acknowledgement: ${
            result.complaint?.acknowledgement_no ||
            editComplaintData.acknowledgementNo
          }`
        );

        // Update local state with edited data
        const updatedComplaint = {
          ...editingComplaint,
          ...editComplaintData,
          id: editingComplaint.id,
          submittedAt: editingComplaint.submittedAt,
        };

        setComplaints((prev) =>
          prev.map((c) => (c.id === editingComplaint.id ? updatedComplaint : c))
        );

        setSelectedComplaint(updatedComplaint);
        setEditingComplaint(null);
        setEditComplaintData({});
        setViewMode("detail");
      } else {
        throw new Error("Failed to update complaint - no data returned");
      }
    } catch (error) {
      console.error("Error updating complaint:", error);

      // Show detailed error message
      let errorMessage = "Failed to update complaint. ";
      if (error.message.includes("Missing required fields")) {
        errorMessage += "Please fill in all required fields.";
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorMessage +=
          "Network error. Please check your connection and try again.";
      } else {
        errorMessage += error.message;
      }

      showError(errorMessage);
    } finally {
      setSavingComplaint(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingComplaint(null);
    setEditComplaintData({});
    setViewMode("detail");
  };

  const handleStatsCardClick = (filterType) => {
    console.log("Stats card clicked:", filterType);
    console.log(
      "Current complaints:",
      complaints.map((c) => ({ name: c.complainantName, status: c.status }))
    );

    // Reset view mode and selected complaint
    setViewMode("list");
    setSelectedComplaint(null);

    // Set appropriate filter based on card clicked
    switch (filterType) {
      case "all":
        console.log("Setting filter to All");
        setStatusFilter("All");
        setCategoryFilter("All");
        setSearchTerm("");
        break;
      case "pending":
        console.log("Setting filter to Pending");
        setStatusFilter("Pending");
        setCategoryFilter("All");
        setSearchTerm("");
        break;
      case "under-investigation":
        console.log("Setting filter to Under Investigation");
        setStatusFilter("Under Investigation");
        setCategoryFilter("All");
        setSearchTerm("");
        break;
      case "resolved":
        console.log("Setting filter to Resolved");
        setStatusFilter("Resolved");
        setCategoryFilter("All");
        setSearchTerm("");
        break;
      default:
        console.log("Setting filter to default (All)");
        setStatusFilter("All");
        setCategoryFilter("All");
        setSearchTerm("");
    }

    // Navigate to view complaints tab
    console.log("Navigating to view-complaints tab");
    setActiveTab("view-complaints");
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setComplaintData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Handle cascading dropdowns
    if (name === "category") {
      setSelectedCategory(value);
      setComplaintData((prev) => ({
        ...prev,
        subCategory: "",
      }));
    }

    if (name === "districtName") {
      setSelectedDistrict(value);
      setComplaintData((prev) => ({
        ...prev,
        policeStation: "",
      }));
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();

    try {
      // Show loading state
      const submitButton = e.target.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";

      // Prepare data for API
      const complaintPayload = {
        sNo: complaintData.sNo,
        acknowledgementNo: complaintData.acknowledgementNo,
        stateName: complaintData.stateName,
        districtName: complaintData.districtName,
        policeStation: complaintData.policeStation,
        category: complaintData.category,
        subCategory: complaintData.subCategory,
        status: complaintData.status,
        incidentDate: complaintData.incidentDate,
        complaintDate: complaintData.complaintDate,
        lastActionTakenOn: complaintData.lastActionTakenOn || null,
        crimeAdditionalInfo: complaintData.crimeAdditionalInfo || null,
        complainantName: complaintData.complainantName,
        complainantAddress: complaintData.complainantAddress,
        complainantMobileNo: complaintData.complainantMobileNo,
        complainantEmail: complaintData.complainantEmail,
        suspectName: complaintData.suspectName || null,
        suspectMobileNo: complaintData.suspectMobileNo || null,
        suspectIdNo: complaintData.suspectIdNo || null,
        fraudulentAmount: complaintData.fraudulentAmount || 0,
        lienAmount: complaintData.lienAmount || 0,
      };

      console.log("Submitting complaint data:", complaintPayload);

      // Submit to database via API
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(complaintPayload),
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (!response.ok) {
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`
        );
      }

      if (result.success || result.complaint) {
        // Success - show success message
        showSuccess(
          `Complaint submitted successfully! S.No: ${
            result.complaint?.s_no || complaintData.sNo
          }, Acknowledgement: ${
            result.complaint?.acknowledgement_no ||
            complaintData.acknowledgementNo
          }`
        );

        // Add to local state for immediate UI update
        const newComplaint = {
          ...result.complaint,
          id: result.complaint?.id || Date.now(),
          submittedBy: user?.email || "",
          submittedAt: result.complaint?.created_at || new Date().toISOString(),
        };

        setComplaints((prev) => [...prev, newComplaint]);
        // Show success notification
        showSuccess("Complaint submitted successfully!");
        // Reset form and generate new numbers
        resetForm();
      } else {
        throw new Error("Failed to submit complaint - no data returned");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);

      // Show detailed error message
      let errorMessage = "Failed to submit complaint. ";
      if (error.message.includes("Missing required fields")) {
        errorMessage += "Please fill in all required fields.";
      } else if (error.message.includes("already exists")) {
        errorMessage +=
          "This S.No or Acknowledgement number already exists. Please refresh and try again.";
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorMessage +=
          "Network error. Please check your connection and try again.";
      } else {
        errorMessage += error.message;
      }

      showError(errorMessage);
    } finally {
      // Reset button state
      const submitButton = e.target.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Complaint";
      }
    }
  };

  const resetForm = () => {
    setComplaintData({
      sNo: "",
      acknowledgementNo: "",
      stateName: "Tamil Nadu",
      districtName: "",
      policeStation: "",
      crimeAdditionalInfo: "",
      category: "",
      subCategory: "",
      status: "Open",
      incidentDate: "",
      complaintDate: new Date().toISOString().split("T")[0],
      lastActionTakenOn: "",
      fraudulentAmount: "",
      lienAmount: "",
      suspectName: "",
      suspectMobileNo: "",
      suspectIdNo: "",
      complainantName: "",
      complainantAddress: "",
      complainantMobileNo: "",
      complainantEmail: "",
    });

    setSelectedCategory("");
    setSelectedDistrict("");
  };

  const getSubcategories = () => {
    const category = crimeCategories.find(
      (cat) => cat.name === selectedCategory
    );
    return category ? category.subcategories : [];
  };

  const getPoliceStations = () => {
    return getPoliceStationsByDistrict(selectedDistrict);
  };

  // DSR Functions
  const handleDSRInputChange = (table, section, field, value) => {
    setDsrData((prev) => {
      const newData = { ...prev };
      if (table === "complaintsTable") {
        newData.complaintsTable[section][field] = {
          ...newData.complaintsTable[section][field],
        };
        Object.keys(newData.complaintsTable[section][field]).forEach((key) => {
          if (
            typeof newData.complaintsTable[section][field][key] === "object"
          ) {
            newData.complaintsTable[section][field][key] = parseInt(value) || 0;
          }
        });
      } else if (table === "amountTable") {
        newData.amountTable[section][field] = parseInt(value) || 0;
      } else if (table === "stagesTable") {
        newData.stagesTable[section][field] = parseInt(value) || 0;
      }
      return newData;
    });
  };

  // Load DSR data from database
  const loadDSRData = async () => {
    if (!user?.id || !dsrDates.reportDate) return;

    try {
      const response = await fetch(
        `/api/dsr-data?reportDate=${dsrDates.reportDate}&officerId=${user.id}`
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setDsrData(result.data);
          console.log("DSR data loaded from database:", result.data);
        }
      } else {
        console.log("No existing DSR data found for this date");
      }
    } catch (error) {
      console.error("Error loading DSR data:", error);
    }
  };

  // Save DSR data to database
  const saveDSRData = async () => {
    if (!user?.id) {
      showError("User not authenticated");
      return;
    }

    try {
      const payload = {
        officerId: user.id,
        districtName: profile?.district || "Unknown",
        policeStation: profile?.police_station || "Unknown",
        reportDate: dsrDates.reportDate,
        fromDate: dsrDates.fromDate,
        fromDateCases: dsrDates.fromDateCases,
        dsrData: dsrData,
      };

      const response = await fetch("/api/dsr-data", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setEditingDSR(false);
        showSuccess("DSR data saved successfully to database!");
      } else {
        throw new Error(result.error || "Failed to save DSR data");
      }
    } catch (error) {
      console.error("Error saving DSR data:", error);
      showError("Error saving DSR data: " + error.message);
    }
  };

  const handleDateChange = (dateType, value) => {
    setDsrDates((prev) => ({
      ...prev,
      [dateType]: value,
    }));

    // Load DSR data when report date changes
    if (dateType === "reportDate" && user?.id) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        loadDSRData();
      }, 100);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const clearAllDSRData = () => {
    if (
      confirm(
        "Are you sure you want to clear all DSR data? This action cannot be undone."
      )
    ) {
      setDsrData({
        complaintsTable: {
          financial: {
            onDate: { complaints: 0, firRegistered: 0, csrIssued: 0 },
            fromDate: { complaints: 0, firRegistered: 0, csrIssued: 0 },
            data2024: { complaints: 0, firRegistered: 0, csrIssued: 0 },
          },
          nonFinancial: {
            onDate: { complaints: 0, firRegistered: 0, csrIssued: 0 },
            fromDate: { complaints: 0, firRegistered: 0, csrIssued: 0 },
            data2024: { complaints: 0, firRegistered: 0, csrIssued: 0 },
          },
        },
        amountTable: [
          {
            category: "Total Amount Lost (in Rs)",
            onDate: 0,
            fromDate: 0,
            data2024: 0,
          },
          {
            category: "Total Amount Frozen (in Rs)",
            onDate: 0,
            fromDate: 0,
            data2024: 0,
          },
          {
            category: "Total Amount Returned (in Rs)",
            onDate: 0,
            fromDate: 0,
            data2024: 0,
          },
          {
            category: "No of Accused Arrested",
            onDate: 0,
            fromDate: 0,
            data2024: 0,
          },
          {
            category: "No of Persons detained under Act 14 of 1982",
            onDate: 0,
            fromDate: 0,
            data2024: 0,
          },
          {
            category: "No of Loan App Complaints",
            onDate: 0,
            fromDate: 0,
            data2024: 0,
          },
          {
            category: "No of FIR in Loan App Cases",
            onDate: 0,
            fromDate: 0,
            data2024: 0,
          },
          {
            category: "No of CSR in Loan App Cases",
            onDate: 0,
            fromDate: 0,
            data2024: 0,
          },
        ],
        stagesTable: {
          onDate: { totalComplaints: 0, ui: 0, ntf: 0, pt: 0, disposal: 0 },
          fromDate: { totalComplaints: 0, ui: 0, ntf: 0, pt: 0, disposal: 0 },
        },
      });
      showSuccess("All DSR data has been cleared.");
    }
  };

  // Profile functions
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = () => {
    // In a real app, this would update the user profile in the database
    setEditingProfile(false);
    showSuccess("Profile updated successfully!");
  };

  const openProfileModal = () => {
    setProfileDropdownOpen(false);
    setShowProfileModal(true);
    setEditingProfile(false);
  };

  const openSettingsModal = () => {
    setProfileDropdownOpen(false);
    setShowSettingsModal(true);
  };

  const handleSettingsChange = (section, field, value) => {
    setSettingsData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSettings = () => {
    // In a real app, this would save settings to the database
    showSuccess("Settings saved successfully!");
    setShowSettingsModal(false);
  };

  const handleResetSettings = () => {
    setSettingsData({
      language: "English",
      timezone: "Asia/Kolkata",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "12-hour",
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      notificationSound: true,
      theme: "light",
      fontSize: "medium",
      autoRefresh: true,
      refreshInterval: 30,
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      autoSave: true,
      defaultStatus: "Open",
      defaultCategory: "Cyber Fraud",
      defaultDistrict: "Chennai",
    });
    showInfo("Settings reset to defaults");
  };

  // Bulk Upload Functions
  const downloadTemplate = async () => {
    try {
      const response = await fetch("/api/complaints/bulk");
      const result = await response.json();

      if (result.success) {
        // Create Excel workbook
        const wb = XLSX.utils.book_new();

        // Create instructions sheet
        const instructionsWS = XLSX.utils.aoa_to_sheet([
          ["Complaint Upload Template - Instructions"],
          [""],
          ...result.templateData.instructions.map((instruction) => [
            instruction,
          ]),
          [""],
          ["Required Fields:"],
          [
            "S No, Acknowledgement No, State Name, District Name, Police Station,",
          ],
          ["Category, Sub Category, Status, Incident Date, Complaint Date,"],
          [
            "Complainant Name, Complainant Address, Complainant Mobile No, Complainant Email",
          ],
          [""],
          ["Optional Fields:"],
          ["Last Action Taken On, Crime Additional Info, Suspect Name,"],
          ["Suspect Mobile No, Suspect ID No, Fraudulent Amount, Lien Amount"],
        ]);

        // Create template sheet with headers and sample data
        const templateWS = XLSX.utils.json_to_sheet(
          result.templateData.sampleData,
          {
            header: result.templateData.headers,
          }
        );

        // Add sheets to workbook
        XLSX.utils.book_append_sheet(wb, instructionsWS, "Instructions");
        XLSX.utils.book_append_sheet(wb, templateWS, "Template");

        // Download file
        XLSX.writeFile(wb, "Complaint_Upload_Template.xlsx");

        showSuccess(
          "Template downloaded successfully! Check your Downloads folder."
        );
      } else {
        throw new Error("Failed to get template data");
      }
    } catch (error) {
      console.error("Error downloading template:", error);
      showError("Failed to download template. Please try again.");
    }
  };

  const processExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          // Get the first sheet (template sheet)
          const sheetName =
            workbook.SheetNames.find(
              (name) =>
                name.toLowerCase().includes("template") ||
                name.toLowerCase().includes("data") ||
                workbook.SheetNames.indexOf(name) ===
                  (workbook.SheetNames.length > 1 ? 1 : 0)
            ) || workbook.SheetNames[0];

          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });

          if (jsonData.length < 2) {
            reject(
              new Error(
                "Excel file must contain at least a header row and one data row"
              )
            );
            return;
          }

          // Get headers (first row)
          const headers = jsonData[0];

          // Expected headers mapping
          const headerMapping = {
            "S No": "sNo",
            "Acknowledgement No": "acknowledgementNo",
            "State Name": "stateName",
            "District Name": "districtName",
            "Police Station": "policeStation",
            Category: "category",
            "Sub Category": "subCategory",
            Status: "status",
            "Incident Date": "incidentDate",
            "Complaint Date": "complaintDate",
            "Last Action Taken On": "lastActionTakenOn",
            "Crime Additional Info": "crimeAdditionalInfo",
            "Complainant Name": "complainantName",
            "Complainant Address": "complainantAddress",
            "Complainant Mobile No": "complainantMobileNo",
            "Complainant Email": "complainantEmail",
            "Suspect Name": "suspectName",
            "Suspect Mobile No": "suspectMobileNo",
            "Suspect ID No": "suspectIdNo",
            "Fraudulent Amount": "fraudulentAmount",
            "Lien Amount": "lienAmount",
          };

          // Convert data rows to objects
          const complaints = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];

            // Skip empty rows
            if (row.every((cell) => !cell || cell.toString().trim() === "")) {
              continue;
            }

            const complaint = {};
            headers.forEach((header, index) => {
              const mappedField = headerMapping[header];
              if (mappedField) {
                complaint[mappedField] = row[index]
                  ? row[index].toString().trim()
                  : "";
              }
            });

            // Generate S.No and Acknowledgement if empty
            if (!complaint.sNo) {
              const timestamp = Date.now() + i;
              complaint.sNo = `CC${timestamp}`;
            }
            if (!complaint.acknowledgementNo) {
              const timestamp = Date.now() + i;
              complaint.acknowledgementNo = `ACK${timestamp}`;
            }

            complaints.push(complaint);
          }

          resolve(complaints);
        } catch (error) {
          reject(new Error(`Failed to parse Excel file: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();

    if (!bulkUploadFile) {
      showWarning("Please select an Excel file");
      return;
    }

    setBulkUploadProgress({
      isProcessing: true,
      stage: "Reading Excel file...",
      processedRows: 0,
      totalRows: 0,
      errors: [],
      results: null,
    });

    try {
      // Parse Excel file
      const complaints = await processExcelFile(bulkUploadFile);

      setBulkUploadProgress((prev) => ({
        ...prev,
        stage: "Validating data...",
        totalRows: complaints.length,
      }));

      // Submit to API
      const response = await fetch("/api/complaints/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ complaints }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Success
        setBulkUploadProgress((prev) => ({
          ...prev,
          isProcessing: false,
          stage: "Completed successfully!",
          processedRows: result.successCount,
          results: result,
        }));

        // Refresh complaints list
        await loadComplaints();

        // Clear file input
        setBulkUploadFile(null);

        showSuccess(
          `Success! Uploaded ${result.successCount} complaints to the database.`
        );
      } else {
        // Handle validation errors
        setBulkUploadProgress((prev) => ({
          ...prev,
          isProcessing: false,
          stage: "Validation errors found",
          errors: result.validationErrors || [],
          results: result,
        }));

        if (result.validationErrors) {
          const errorSummary = result.validationErrors
            .slice(0, 5)
            .map((err) => `Row ${err.row}: ${err.errors.join(", ")}`)
            .join("\n");

          showError(`Validation Errors Found: ${errorSummary}`);
        } else {
          showError(`${result.error} ${result.details || ""}`);
        }
      }
    } catch (error) {
      console.error("Bulk upload error:", error);
      setBulkUploadProgress((prev) => ({
        ...prev,
        isProcessing: false,
        stage: "Error occurred",
        errors: [{ row: "N/A", errors: [error.message] }],
      }));

      showError(error.message);
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 mb-2">Loading Dashboard...</p>
          <p className="text-sm text-gray-500">
            Authenticating and loading your data
          </p>
        </div>
      </div>
    );
  }

  // Handle authentication check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-lg text-gray-700 mb-2">Authentication Required</p>
          <p className="text-sm text-gray-500 mb-4">
            You need to be logged in to access this page
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Access logic based on user_type and department
  const userType = user?.user_type || profile?.user_type || user?.department || profile?.department || "";
  const normalizedUserType = normalizeUserType(userType);
  
  console.log('[DASHBOARD] Raw user type:', userType);
  console.log('[DASHBOARD] Normalized user type:', normalizedUserType);
  console.log('[DASHBOARD] User department:', user?.department);
  
  // Check if CCPS user should be redirected
  if (shouldRedirectToCCPS(userType)) {
    console.log('[DASHBOARD] CCPS user detected, redirecting to CCPS dashboard');
    if (typeof window !== 'undefined') {
      window.location.replace("/ccps-dashboard");
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-lg text-gray-700 mb-2">Redirecting to CCPS Dashboard</p>
          <p className="text-sm text-gray-500 mb-4">
            CCPS users should use the dedicated CCPS dashboard.
          </p>
        </div>
      </div>
    );
  }
  
  // Get visible tables for current user
  const visibleTables = getVisibleTables(normalizedUserType);
  const tableComponents = getTableComponentsForUser(normalizedUserType);
  
  console.log('[DASHBOARD] Visible tables for user:', visibleTables);
  console.log('[DASHBOARD] Table components:', tableComponents);
  
  // Check if user has access to any tables (non-DSR users with specific table access)
  const hasLimitedAccess = normalizedUserType !== 'DSR' && visibleTables.length > 0;
  
  // For non-DSR users with limited access, redirect to reports page
  if (hasLimitedAccess && typeof window !== 'undefined' && !window.location.pathname.includes('/reports')) {
    console.log('[DASHBOARD] Limited access user, redirecting to reports');
    window.location.replace("/dsr-dashboard/reports");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-lg text-gray-700 mb-2">Redirecting to Reports</p>
          <p className="text-sm text-gray-500 mb-4">
            Your department ({normalizedUserType}) has access to specific tables in the Reports section.
          </p>
        </div>
      </div>
    );
  }

  // Add a function to get dynamic status counts
  const getStatusCounts = () => {
    // Use dynamic status counts from API if available, otherwise calculate from complaints
    if (Object.keys(statusCounts).length > 0) {
      return statusCounts;
    }
    
    // Fallback to calculating from complaints array
    const counts = {};
    STATUS_OPTIONS.forEach(status => {
      counts[status] = complaints.filter(c => c.status === status).length;
    });
    
    // Add unknown status count if there are complaints with undefined/null status
    const unknownCount = complaints.filter(c => !c.status || c.status === 'Unknown').length;
    if (unknownCount > 0) {
      counts['Unknown'] = unknownCount;
    }
    
    return counts;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <img
                    src="/tn-government-logo.png"
                    alt="Tamil Nadu Government Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-xl font-bold text-white">
                  Officer Dashboard
                </h1>
              </div>
            </div>

            <nav className="flex items-center space-x-8">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`${
                  activeTab === "dashboard"
                    ? "text-white font-medium border-b-2 border-white pb-1"
                    : "text-white hover:text-gray-300 hover:border-b-2 hover:border-gray-300 pb-1 border-b-2 border-transparent"
                } text-sm px-2 transition-all duration-200`}
              >
                Dashboard
              </button>
              <div className="relative">
                <button
                  onClick={() =>
                    setComplaintsDropdownOpen(!complaintsDropdownOpen)
                  }
                  className={`${
                    activeTab === "complaint-form" ||
                    activeTab === "view-complaints"
                      ? "text-white font-medium border-b-2 border-white pb-1"
                      : "text-white hover:text-gray-300 hover:border-b-2 hover:border-gray-300 pb-1 border-b-2 border-transparent"
                  } text-sm flex items-center space-x-1 px-2 transition-all duration-200`}
                >
                  <span>Complaints</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Complaints Dropdown */}
                {complaintsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setActiveTab("complaint-form");
                          setComplaintsDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <span>File Complaint</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("view-complaints");
                          setComplaintsDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <span>View Complaints</span>
                      </button>
                      <button
                        onClick={() => { setActiveTab('complaint-status'); setShowComplaintsOptions(false); }}
                        className="w-full bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors font-medium text-left flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Complaint Status
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setActiveTab("bulk-upload")}
                className={`${
                  activeTab === "bulk-upload"
                    ? "text-white font-medium border-b-2 border-white pb-1"
                    : "text-white hover:text-gray-300 hover:border-b-2 hover:border-gray-300 pb-1 border-b-2 border-transparent"
                } text-sm px-2 transition-all duration-200`}
              >
                Bulk Upload
              </button>

              <button
                onClick={() => router.push('/dsr-dashboard/reports')}
                className={`${typeof window !== 'undefined' && window.location.pathname.startsWith('/dsr-dashboard/reports')
                  ? "text-white font-medium border-b-2 border-white pb-1"
                  : "text-white hover:text-gray-300 hover:border-b-2 hover:border-gray-300 pb-1 border-b-2 border-transparent"} text-sm px-2 transition-all duration-200`}
              >
                Reports
              </button>

              <div className="relative profile-dropdown">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900 shadow-lg"
                  title={`${getUserDisplayName()} - Click to open menu`}
                >
                  <span className="text-white text-sm font-semibold tracking-wide">
                    O
                  </span>
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">O</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {getUserDisplayName()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {profile?.user_type || "Officer"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={openProfileModal}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>View Profile</span>
                      </button>

                      <button
                        onClick={openSettingsModal}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>Settings</span>
                      </button>

                      <hr className="my-2" />

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md flex items-center space-x-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {getUserDisplayName()}
          </h1>
          <p className="text-gray-600">
            Manage cybercrime complaints and daily case data efficiently
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Department:</strong> {normalizedUserType} | 
              <strong>Access Level:</strong> {normalizedUserType === 'DSR' ? 'Full Dashboard + All Tables' : `Reports Only (Tables: ${visibleTables.join(', ')})`}
            </p>
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              <div
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105"
                onClick={() => handleStatsCardClick("all")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Total Complaints
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {loadingComplaints ? (
                        <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                      ) : (
                        getComplaintStats().total
                      )}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">All time filed</p>
                      {getComplaintStats().recentComplaints > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                          +{getComplaintStats().recentComplaints} this week
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      ↗ View All
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center ml-4">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105"
                onClick={() => handleStatsCardClick("pending")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Pending Cases
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {loadingComplaints ? (
                        <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                      ) : (
                        getComplaintStats().pending
                      )}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">Awaiting action</p>
                      {getComplaintStats().todayComplaints > 0 && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                          +{getComplaintStats().todayComplaints} today
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-orange-600 mt-1 font-medium">
                      ↗ View Pending
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center ml-4">
                    <svg
                      className="w-6 h-6 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105"
                onClick={() => handleStatsCardClick("under-investigation")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Under Investigation
                    </p>
                    <div className="text-3xl font-bold text-gray-900">
                      {loadingComplaints ? (
                        <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                      ) : (
                        getComplaintStats().underInvestigation
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">Active cases</p>
                      {getComplaintStats().total > 0 && (
                        <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full font-medium">
                          {Math.round(
                            (getComplaintStats().underInvestigation /
                              getComplaintStats().total) *
                              100
                          )}
                          % of total
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-yellow-600 mt-1 font-medium">
                      ↗ View Active
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center ml-4">
                    <svg
                      className="w-6 h-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105"
                onClick={() => handleStatsCardClick("resolved")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Resolved Cases
                    </p>
                    <div className="text-3xl font-bold text-gray-900">
                      {loadingComplaints ? (
                        <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                      ) : (
                        getComplaintStats().resolved
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">
                        Successfully closed
                      </p>
                      {getComplaintStats().total > 0 && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">
                          {Math.round(
                            (getComplaintStats().resolved /
                              getComplaintStats().total) *
                              100
                          )}
                          % resolved
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      ↗ View Resolved
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center ml-4">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Financial Impact Card */}
              <div
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105"
                onClick={() => {
                  setStatusFilter("All");
                  setCategoryFilter("All");
                  setSearchTerm("");
                  setViewMode("list");
                  setSelectedComplaint(null);
                  setActiveTab("view-complaints");
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Financial Impact
                    </p>
                    <div className="text-3xl font-bold text-gray-900">
                      {loadingComplaints ? (
                        <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                      ) : (
                        `₹${getComplaintStats().totalFraudAmount.toLocaleString()}`
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">
                        Total fraud amount
                      </p>
                      {getComplaintStats().total > 0 && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                          ₹
                          {Math.round(
                            getComplaintStats().totalFraudAmount /
                              getComplaintStats().total
                          ).toLocaleString()}{" "}
                          avg
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      ↗ View Financial Cases
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center ml-4">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Complaints Card (replaces File New Complaint) */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0zm6 0a6 6 0 11-12 0 6 6 0 0112 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Complaints
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Register and view cyber crime complaints, or file a new one
                </p>
                <button
                  onClick={() => setShowComplaintsOptions((prev) => !prev)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {showComplaintsOptions ? 'Hide Options' : 'View Options'}
                </button>
                {showComplaintsOptions && (
                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <button
                      onClick={() => { setActiveTab('complaint-form'); setShowComplaintsOptions(false); }}
                      className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors font-medium text-left flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      File Complaint
                    </button>
                    <button
                      onClick={() => { setActiveTab('view-complaints'); setShowComplaintsOptions(false); }}
                      className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-left flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      View Complaints
                    </button>
                    <button
                      onClick={() => { setActiveTab('complaint-status'); setShowComplaintsOptions(false); }}
                      className="w-full bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors font-medium text-left flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Complaint Status
                    </button>
                  </div>
                )}
              </div>

              {/* Bulk Upload Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Bulk Upload
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Upload multiple complaints at once using Excel templates for
                  faster processing
                </p>
                <button
                  onClick={() => setActiveTab("bulk-upload")}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Upload Files
                </button>
              </div>

            </div>

            {/* Recent Activity & System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Complaints */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Complaints
                    </h3>
                    <button
                      onClick={() => setActiveTab("complaint-form")}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      File New
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {loadingComplaints ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                      <p className="text-gray-600">Loading complaints...</p>
                    </div>
                  ) : complaints.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500 mb-4">
                        No complaints filed yet
                      </p>
                      <button
                        onClick={() => setActiveTab("complaint-form")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        File First Complaint
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-600">
                          {complaints.length} complaint
                          {complaints.length !== 1 ? "s" : ""} found
                        </p>
                        <button
                          onClick={loadComplaints}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          disabled={loadingComplaints}
                        >
                          {loadingComplaints ? "Loading..." : "Refresh"}
                        </button>
                      </div>
                      {complaints
                        .slice(-5)
                        .reverse()
                        .map((complaint, index) => (
                          <div
                            key={complaint.id || index}
                            className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-blue-400"
                          >
                            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                              <svg
                                className="w-8 h-8 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0 space-y-3">
                              <div>
                                <h4 className="text-base font-bold text-gray-900 leading-tight">
                                  {complaint.complainantName ||
                                    "Unknown Complainant"}
                                </h4>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                                  {complaint.acknowledgementNo}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <span className="text-sm text-gray-700 bg-gray-200 px-3 py-1 rounded-full">
                                  {complaint.category || "No Category"}
                                </span>
                                <span
                                  className={`text-sm px-3 py-1 rounded-full font-medium ${
                                    complaint.status === "Resolved"
                                      ? "bg-green-100 text-green-700"
                                      : complaint.status ===
                                        "Under Investigation"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : complaint.status === "Open"
                                      ? "bg-blue-100 text-blue-700"
                                      : complaint.status === "Closed"
                                      ? "bg-gray-100 text-gray-700"
                                      : complaint.status === "Pending"
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {complaint.status || "Unknown"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                <span className="text-sm text-gray-500 font-medium">
                                  📅{" "}
                                  {complaint.submittedAt
                                    ? new Date(
                                        complaint.submittedAt
                                      ).toLocaleDateString()
                                    : "No date"}
                                </span>
                                {complaint.fraudulentAmount > 0 && (
                                  <span className="text-sm text-red-600 font-bold bg-red-50 px-2 py-1 rounded">
                                    💰 ₹
                                    {complaint.fraudulentAmount.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Trends Analytics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Complaints Analytics
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-medium">
                        {complaints.length} Total Cases
                      </span>
                      <button
                        onClick={loadComplaints}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        🔄 Refresh
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {loadingComplaints ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                      <p className="text-gray-600">Loading analytics...</p>
                    </div>
                  ) : complaints.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-600 mb-2">No data available</p>
                      <p className="text-sm text-gray-500">
                        File some complaints to see analytics
                      </p>
                      <button
                        onClick={() => setActiveTab("new-complaint")}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        File First Complaint
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Overall Trends Graph */}
                      <div className="border-t border-gray-200 pt-6 mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                          Overall Complaint Trends
                        </h4>

                        <div className="bg-white rounded-lg p-6 shadow-sm">
                          {complaints.length > 0 ? (
                            <div style={{ width: "100%", height: 400 }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={getOverallTrends()}
                                  margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 20,
                                  }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e5e7eb"
                                  />
                                  <XAxis
                                    dataKey="status"
                                    tick={{ fontSize: 14, fill: "#374151" }}
                                    axisLine={{ stroke: "#d1d5db" }}
                                  />
                                  <YAxis
                                    tick={{ fontSize: 12, fill: "#6b7280" }}
                                    axisLine={{ stroke: "#d1d5db" }}
                                    label={{
                                      value: "Number of Cases",
                                      angle: -90,
                                      position: "insideLeft",
                                      style: {
                                        textAnchor: "middle",
                                        fill: "#6b7280",
                                      },
                                    }}
                                  />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: "#1f2937",
                                      border: "none",
                                      borderRadius: "8px",
                                      color: "#fff",
                                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                    }}
                                    formatter={(value, name) => [
                                      value,
                                      "Cases",
                                    ]}
                                  />
                                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                    {getOverallTrends().map((entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                      />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                  className="w-12 h-12 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                  />
                                </svg>
                              </div>
                              <h3 className="text-lg font-medium text-gray-700 mb-2">
                                No Data Available
                              </h3>
                              <p className="text-sm text-gray-500 mb-4">
                                File complaints to see overall trends
                              </p>
                              <button
                                onClick={() => setActiveTab("new-complaint")}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                File First Complaint
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fill Complaint Tab */}
        {activeTab === "complaint-form" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              File New Complaint
            </h2>
            <form onSubmit={handleComplaintSubmit} className="space-y-6">
              {/* Case Details */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">
                  Case Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* S.No */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      S.No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="sNo"
                      value={complaintData.sNo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter serial number manually
                    </p>
                  </div>

                  {/* Acknowledgement No */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Acknowledgement No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="acknowledgementNo"
                      value={complaintData.acknowledgementNo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter acknowledgement number manually
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-green-800 mb-2">
                  Location Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* State Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State Name
                    </label>
                    <input
                      type="text"
                      name="stateName"
                      value={complaintData.stateName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>

                  {/* District Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District Name
                    </label>
                    <select
                      name="districtName"
                      value={complaintData.districtName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select District</option>
                      {getAllDistricts().map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Police Station */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Police Station
                    </label>
                    <select
                      name="policeStation"
                      value={complaintData.policeStation}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Police Station</option>
                      {selectedDistrict &&
                        getPoliceStationsByDistrict(selectedDistrict).map(
                          (station) => (
                            <option key={station} value={station}>
                              {station}
                            </option>
                          )
                        )}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Select district first to enable police stations
                    </p>
                  </div>
                </div>
              </div>

              {/* Crime Details */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                  Crime Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={complaintData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      {crimeCategories.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sub Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub Category
                    </label>
                    <select
                      name="subCategory"
                      value={complaintData.subCategory}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Sub Category</option>
                      {selectedCategory &&
                        getSubcategories().map((subCat) => (
                          <option key={subCat} value={subCat}>
                            {subCat}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={complaintData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* Incident Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Incident Date
                    </label>
                    <input
                      type="date"
                      name="incidentDate"
                      value={complaintData.incidentDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Complaint Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complaint Date
                    </label>
                    <input
                      type="date"
                      name="complaintDate"
                      value={complaintData.complaintDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Last Action Taken On */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Action Taken On
                    </label>
                    <input
                      type="date"
                      name="lastActionTakenOn"
                      value={complaintData.lastActionTakenOn}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-purple-800 mb-2">
                  Financial Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fraudulent Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fraudulent Amount
                    </label>
                    <input
                      type="number"
                      name="fraudulentAmount"
                      value={complaintData.fraudulentAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Lien Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lien Amount
                    </label>
                    <input
                      type="number"
                      name="lienAmount"
                      value={complaintData.lienAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Suspect Details */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-red-800 mb-2">
                  Suspect Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Suspect Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suspect Name
                    </label>
                    <input
                      type="text"
                      name="suspectName"
                      value={complaintData.suspectName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Suspect Mobile No */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suspect Mobile No
                    </label>
                    <input
                      type="tel"
                      name="suspectMobileNo"
                      value={complaintData.suspectMobileNo}
                      onChange={handleInputChange}
                      pattern="[0-9]{10}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Suspect ID No */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suspect ID No
                    </label>
                    <input
                      type="text"
                      name="suspectIdNo"
                      value={complaintData.suspectIdNo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Complainant Details */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-orange-800 mb-2">
                  Complainant Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Complainant Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complainant Name
                    </label>
                    <input
                      type="text"
                      name="complainantName"
                      value={complaintData.complainantName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Complainant Mobile No */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complainant Mobile No
                    </label>
                    <input
                      type="tel"
                      name="complainantMobileNo"
                      value={complaintData.complainantMobileNo}
                      onChange={handleInputChange}
                      pattern="[0-9]{10}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Complainant Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complainant Email
                    </label>
                    <input
                      type="email"
                      name="complainantEmail"
                      value={complaintData.complainantEmail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Complainant Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complainant Address
                    </label>
                    <textarea
                      name="complainantAddress"
                      value={complaintData.complainantAddress}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                  Additional Information
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crime Additional Information
                  </label>
                  <textarea
                    name="crimeAdditionalInfo"
                    value={complaintData.crimeAdditionalInfo}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
                >
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        )}

        {/* View Complaints Tab */}
        {activeTab === "view-complaints" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            {viewMode === "list" ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    All Complaints
                  </h2>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {getFilteredComplaints().length} of {complaints.length}{" "}
                      complaints
                    </span>
                    <button
                      onClick={() => setActiveTab("complaint-form")}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      + New Complaint
                    </button>
                  </div>
                </div>

                {/* Search and Filter Controls */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search Input */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search by name, acknowledgement no., category..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <svg
                          className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="All">All Status</option>
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="All">All Categories</option>
                        {crimeCategories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("All");
                        setCategoryFilter("All");
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>

                {/* Complaints Preview List */}
                <div className="space-y-4">
                  {loadingComplaints ? (
                    <div className="text-center py-12">
                      Loading complaints...
                    </div>
                  ) : getFilteredComplaints().length === 0 ? (
                    <div className="text-center py-12">No Complaints Found</div>
                  ) : (
                    getFilteredComplaints().map((complaint, index) => (
                      <div
                        key={complaint.id || index}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between"
                        onClick={() => handleComplaintClick(complaint)}
                      >
                        <div>
                          <span className="font-mono bg-blue-50 px-2 py-1 rounded text-blue-700 mr-4">
                            {complaint.acknowledgementNo}
                          </span>
                          <span className="text-lg font-semibold text-gray-900">
                            {complaint.complainantName || "Unknown Complainant"}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">
                          View Details &rarr;
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              /* Detail View */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handleBackToList}
                    className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Back to All Complaints
                  </button>
                  <div className="flex items-center space-x-3">
                    {viewMode === "detail" && (
                      <button
                        onClick={() => handleEditComplaint(selectedComplaint)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit Complaint
                      </button>
                    )}
                    {viewMode === "edit" && (
                      <>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveComplaint}
                          disabled={savingComplaint}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {savingComplaint ? "Saving..." : "Save Changes"}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setActiveTab("complaint-form")}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      + New Complaint
                    </button>
                  </div>
                </div>

                {selectedComplaint && (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {viewMode === "edit" ? (
                      /* Edit Form */
                      <form onSubmit={handleSaveComplaint} className="p-6">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                          <h3 className="text-sm font-semibold text-orange-800 mb-2">
                            Edit Complaint
                          </h3>
                          <p className="text-sm text-orange-700">
                            Make changes to the complaint details and click Save
                            Changes to update.
                          </p>
                        </div>

                        <div className="space-y-6">
                          {/* Basic Information */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                              Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* S No. - Read Only */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  S No. <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="sNo"
                                  value={editComplaintData.sNo}
                                  readOnly
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                              </div>

                              {/* Acknowledgement No. - Read Only */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Acknowledgement No.{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="acknowledgementNo"
                                  value={editComplaintData.acknowledgementNo}
                                  readOnly
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                              </div>

                              {/* State Name */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  State Name{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="stateName"
                                  value={editComplaintData.stateName}
                                  onChange={handleEditInputChange}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                              {/* District Name */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  District Name{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <select
                                  name="districtName"
                                  value={editComplaintData.districtName}
                                  onChange={handleEditInputChange}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">Select District</option>
                                  {getAllDistricts().map((district) => (
                                    <option key={district} value={district}>
                                      {district}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Police Station */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Police Station{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <select
                                  name="policeStation"
                                  value={editComplaintData.policeStation}
                                  onChange={handleEditInputChange}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">
                                    Select Police Station
                                  </option>
                                  {getPoliceStationsByDistrict(
                                    editComplaintData.districtName
                                  ).map((station) => (
                                    <option key={station} value={station}>
                                      {station}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Category */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Category{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <select
                                  name="category"
                                  value={editComplaintData.category}
                                  onChange={handleEditInputChange}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">Select Category</option>
                                  {Object.keys(crimeCategories).map(
                                    (category) => (
                                      <option key={category} value={category}>
                                        {category}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>

                              {/* Sub Category */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Sub Category
                                </label>
                                <select
                                  name="subCategory"
                                  value={editComplaintData.subCategory}
                                  onChange={handleEditInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">Select Sub Category</option>
                                  {editComplaintData.category &&
                                    crimeCategories[
                                      editComplaintData.category
                                    ]?.map((subCategory) => (
                                      <option
                                        key={subCategory}
                                        value={subCategory}
                                      >
                                        {subCategory}
                                      </option>
                                    ))}
                                </select>
                              </div>

                              {/* Status */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                  name="status"
                                  value={editComplaintData.status}
                                  onChange={handleEditInputChange}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  {STATUS_OPTIONS.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Date Information */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                              Date Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Incident Date{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="date"
                                  name="incidentDate"
                                  value={editComplaintData.incidentDate}
                                  onChange={handleEditInputChange}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Complaint Date{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="date"
                                  name="complaintDate"
                                  value={editComplaintData.complaintDate}
                                  onChange={handleEditInputChange}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Last Action Taken On
                                </label>
                                <input
                                  type="date"
                                  name="lastActionTakenOn"
                                  value={editComplaintData.lastActionTakenOn}
                                  onChange={handleEditInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Financial Information */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                              Financial Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Fraudulent Amount (₹)
                                </label>
                                <input
                                  type="number"
                                  name="fraudulentAmount"
                                  value={editComplaintData.fraudulentAmount}
                                  onChange={handleEditInputChange}
                                  min="0"
                                  step="0.01"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Lien Amount (₹)
                                </label>
                                <input
                                  type="number"
                                  name="lienAmount"
                                  value={editComplaintData.lienAmount}
                                  onChange={handleEditInputChange}
                                  min="0"
                                  step="0.01"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Complainant Details */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                              Complainant Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Full Name{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="complainantName"
                                  value={editComplaintData.complainantName}
                                  onChange={handleEditInputChange}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Mobile Number{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="tel"
                                  name="complainantMobileNo"
                                  value={editComplaintData.complainantMobileNo}
                                  onChange={handleEditInputChange}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Email Address
                                </label>
                                <input
                                  type="email"
                                  name="complainantEmail"
                                  value={editComplaintData.complainantEmail}
                                  onChange={handleEditInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Address{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                  name="complainantAddress"
                                  value={editComplaintData.complainantAddress}
                                  onChange={handleEditInputChange}
                                  required
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Suspect Information */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                              Suspect Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Suspect Name
                                </label>
                                <input
                                  type="text"
                                  name="suspectName"
                                  value={editComplaintData.suspectName}
                                  onChange={handleEditInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Suspect Mobile No.
                                </label>
                                <input
                                  type="tel"
                                  name="suspectMobileNo"
                                  value={editComplaintData.suspectMobileNo}
                                  onChange={handleEditInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Suspect ID No.
                                </label>
                                <input
                                  type="text"
                                  name="suspectIdNo"
                                  value={editComplaintData.suspectIdNo}
                                  onChange={handleEditInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Additional Information */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                              Additional Information
                            </h3>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Crime Additional Information
                              </label>
                              <textarea
                                name="crimeAdditionalInfo"
                                value={editComplaintData.crimeAdditionalInfo}
                                onChange={handleEditInputChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Provide any additional details about the crime or incident..."
                              />
                            </div>
                          </div>
                        </div>
                      </form>
                    ) : (
                      /* Detail View */
                      <>
                        {/* Header Section */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h1 className="text-2xl font-bold text-gray-900">
                                {selectedComplaint.complainantName ||
                                  "Unknown Complainant"}
                              </h1>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="font-mono bg-gray-200 px-3 py-1 rounded text-sm">
                                  S.No: {selectedComplaint.sNo || "N/A"}
                                </span>
                                <span className="font-mono bg-blue-100 px-3 py-1 rounded text-blue-800 text-sm">
                                  {selectedComplaint.acknowledgementNo}
                                </span>
                                <span
                                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                    selectedComplaint.status === "Resolved"
                                      ? "bg-green-100 text-green-800"
                                      : selectedComplaint.status ===
                                        "Under Investigation"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : selectedComplaint.status === "Open"
                                      ? "bg-blue-100 text-blue-800"
                                      : selectedComplaint.status === "Closed"
                                      ? "bg-gray-100 text-gray-800"
                                      : selectedComplaint.status === "Pending"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {selectedComplaint.status || "Unknown"}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Filed on</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {selectedComplaint.complaintDate
                                  ? new Date(
                                      selectedComplaint.complaintDate
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Content Sections */}
                        <div className="p-6 space-y-8">
                          {/* Basic Information */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                              Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Category
                                </label>
                                <p className="text-gray-900">
                                  {selectedComplaint.category ||
                                    "Not specified"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Sub Category
                                </label>
                                <p className="text-gray-900">
                                  {selectedComplaint.subCategory ||
                                    "Not specified"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  District
                                </label>
                                <p className="text-gray-900">
                                  {selectedComplaint.districtName ||
                                    "Not specified"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Police Station
                                </label>
                                <p className="text-gray-900">
                                  {selectedComplaint.policeStation ||
                                    "Not specified"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Dates Information */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                              Important Dates
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Incident Date
                                </label>
                                <p className="text-gray-900">
                                  {selectedComplaint.incidentDate
                                    ? new Date(
                                        selectedComplaint.incidentDate
                                      ).toLocaleDateString()
                                    : "Not specified"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Complaint Filed
                                </label>
                                <p className="text-gray-900">
                                  {selectedComplaint.complaintDate
                                    ? new Date(
                                        selectedComplaint.complaintDate
                                      ).toLocaleDateString()
                                    : "Not specified"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Last Action Taken
                                </label>
                                <p className="text-gray-900">
                                  {selectedComplaint.lastActionTakenOn
                                    ? new Date(
                                        selectedComplaint.lastActionTakenOn
                                      ).toLocaleDateString()
                                    : "No action taken"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Financial Information */}
                          {(selectedComplaint.fraudulentAmount > 0 ||
                            selectedComplaint.lienAmount > 0) && (
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                                Financial Impact
                              </h3>
                              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {selectedComplaint.fraudulentAmount > 0 && (
                                    <div>
                                      <label className="block text-sm font-medium text-red-800 mb-1">
                                        Fraudulent Amount
                                      </label>
                                      <p className="text-2xl font-bold text-red-700">
                                        ₹
                                        {selectedComplaint.fraudulentAmount.toLocaleString()}
                                      </p>
                                    </div>
                                  )}
                                  {selectedComplaint.lienAmount > 0 && (
                                    <div>
                                      <label className="block text-sm font-medium text-red-800 mb-1">
                                        Lien Amount
                                      </label>
                                      <p className="text-2xl font-bold text-red-700">
                                        ₹
                                        {selectedComplaint.lienAmount.toLocaleString()}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Complainant Information */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                              Complainant Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Full Name
                                </label>
                                <p className="text-gray-900">
                                  {selectedComplaint.complainantName ||
                                    "Not provided"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Mobile Number
                                </label>
                                <p className="text-gray-900">
                                  {selectedComplaint.complainantMobileNo ||
                                    "Not provided"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Email Address
                                </label>
                                <p className="text-gray-900">
                                  {selectedComplaint.complainantEmail ||
                                    "Not provided"}
                                </p>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Address
                                </label>
                                <p className="text-gray-900">
                                  {selectedComplaint.complainantAddress ||
                                    "Not provided"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Suspect Information */}
                          {(selectedComplaint.suspectName ||
                            selectedComplaint.suspectMobileNo ||
                            selectedComplaint.suspectIdNo) && (
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                                Suspect Information
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {selectedComplaint.suspectName && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                      Name
                                    </label>
                                    <p className="text-gray-900">
                                      {selectedComplaint.suspectName}
                                    </p>
                                  </div>
                                )}
                                {selectedComplaint.suspectMobileNo && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                      Mobile Number
                                    </label>
                                    <p className="text-gray-900">
                                      {selectedComplaint.suspectMobileNo}
                                    </p>
                                  </div>
                                )}
                                {selectedComplaint.suspectIdNo && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                      ID Number
                                    </label>
                                    <p className="text-gray-900">
                                      {selectedComplaint.suspectIdNo}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Additional Information */}
                          {selectedComplaint.crimeAdditionalInfo && (
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                                Additional Information
                              </h3>
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <p className="text-gray-900 whitespace-pre-wrap">
                                  {selectedComplaint.crimeAdditionalInfo}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* System Information */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                              System Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Created At
                                </label>
                                <p className="text-gray-900">
                                  {selectedComplaint.submittedAt
                                    ? new Date(
                                        selectedComplaint.submittedAt
                                      ).toLocaleString()
                                    : "Unknown"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Submitted By
                                </label>
                                <p className="text-gray-900">
                                  {selectedComplaint.submittedBy || "System"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bulk Upload Tab */}
        {activeTab === "bulk-upload" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Bulk Upload Complaints
            </h2>

            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">
                  Instructions:
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    • Download the Excel template with all required columns
                  </li>
                  <li>• Fill in the complaint data according to the format</li>
                  <li>• Upload the completed Excel file</li>
                  <li>
                    • System will automatically process and create complaints
                  </li>
                </ul>
              </div>

              {/* Template Download */}
              <div>
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download Excel Template
                </button>
              </div>

              {/* File Upload */}
              <form onSubmit={handleBulkUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Excel File
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setBulkUploadFile(e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={bulkUploadProgress.isProcessing}
                  />
                  {bulkUploadFile && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {bulkUploadFile.name}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!bulkUploadFile || bulkUploadProgress.isProcessing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {bulkUploadProgress.isProcessing
                    ? "Processing..."
                    : "Process Upload"}
                </button>
              </form>

              {/* Progress Display */}
              {bulkUploadProgress.isProcessing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm font-medium text-blue-800">
                      {bulkUploadProgress.stage}
                    </span>
                  </div>
                  {bulkUploadProgress.totalRows > 0 && (
                    <div className="text-sm text-blue-700">
                      Processing {bulkUploadProgress.processedRows} of{" "}
                      {bulkUploadProgress.totalRows} rows
                    </div>
                  )}
                </div>
              )}

              {/* Results Display */}
              {bulkUploadProgress.results &&
                !bulkUploadProgress.isProcessing && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-800 mb-2">
                      Upload Results
                    </h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <div>
                        <span>
                          ✅ Successfully uploaded:{" "}
                          {bulkUploadProgress.results.successCount} complaints
                        </span>
                      </div>
                      <div>
                        <span>
                          📋 Total processed:{" "}
                          {bulkUploadProgress.results.totalProcessed} rows
                        </span>
                      </div>
                      {bulkUploadProgress.results.insertedComplaints && (
                        <div className="mt-3 max-h-32 overflow-y-auto">
                          <p className="font-medium mb-1">
                            Uploaded complaints:
                          </p>
                          {bulkUploadProgress.results.insertedComplaints
                            .slice(0, 5)
                            .map((complaint, index) => (
                              <p key={index} className="text-xs">
                                • {complaint.sNo} - {complaint.complainantName}{" "}
                                ({complaint.category})
                              </p>
                            ))}
                          {bulkUploadProgress.results.insertedComplaints
                            .length > 5 && (
                            <p className="text-xs">
                              ...and{" "}
                              {bulkUploadProgress.results.insertedComplaints
                                .length - 5}{" "}
                              more
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Error Display */}
              {bulkUploadProgress.errors.length > 0 &&
                !bulkUploadProgress.isProcessing && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-red-800 mb-2">
                      Validation Errors
                    </h4>
                    <div className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                      {bulkUploadProgress.errors
                        .slice(0, 10)
                        .map((error, index) => (
                          <p key={index}>
                            <span className="font-medium">
                              Row {error.row}:
                            </span>{" "}
                            {error.errors.join(", ")}
                          </p>
                        ))}
                      {bulkUploadProgress.errors.length > 10 && (
                        <p className="text-xs">
                          ...and {bulkUploadProgress.errors.length - 10} more
                          errors
                        </p>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* DSR Reports Tab */}
        {activeTab === "dsr" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    DSR - CYBER CRIME WING
                  </h2>

                  {/* Date Selection Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Report Date
                      </label>
                      <input
                        type="date"
                        value={dsrDates.reportDate}
                        onChange={(e) =>
                          handleDateChange("reportDate", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Used for On Date columns
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Date (Current Year)
                      </label>
                      <input
                        type="date"
                        value={dsrDates.fromDate}
                        onChange={(e) =>
                          handleDateChange("fromDate", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Used for From Date to till Date columns
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Date (Cases)
                      </label>
                      <input
                        type="date"
                        value={dsrDates.fromDateCases}
                        onChange={(e) =>
                          handleDateChange("fromDateCases", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Used for Stages of cases table
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600">
                    Daily Situation Report as on{" "}
                    <span className="font-semibold">
                      {formatDate(dsrDates.reportDate)}
                    </span>
                  </p>
                </div>

                <div className="flex space-x-3 ml-6">
                  {editingDSR ? (
                    <>
                      <button
                        onClick={() => setEditingDSR(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveDSRData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={clearAllDSRData}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Clear All Data
                      </button>
                      <button
                        onClick={() => setEditingDSR(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Edit Data
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Table 1: Complaints registered through NCRP and Complaints received by CCPS */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                1. Complaints registered through NCRP and Complaints received by
                CCPS:
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th
                        rowSpan={3}
                        className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900"
                      >
                        Financial and Non financial Cyber Frauds
                      </th>
                      <th
                        colSpan={3}
                        className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900"
                      >
                        On {formatDate(dsrDates.reportDate)}
                      </th>
                      <th
                        colSpan={3}
                        className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900"
                      >
                        From {formatDate(dsrDates.fromDate)} To till Date
                      </th>
                      <th
                        colSpan={3}
                        className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900"
                      >
                        Data of 2024
                      </th>
                    </tr>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-2 py-2 text-center text-xs font-medium text-gray-900">
                        Fin
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center text-xs font-medium text-gray-900">
                        Non-Fin
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center text-xs font-medium text-gray-900">
                        Total
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center text-xs font-medium text-gray-900">
                        Fin
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center text-xs font-medium text-gray-900">
                        Non-Fin
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center text-xs font-medium text-gray-900">
                        Total
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center text-xs font-medium text-gray-900">
                        Fin
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center text-xs font-medium text-gray-900">
                        Non-Fin
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center text-xs font-medium text-gray-900">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {["Complaints", "FIR Registered", "CSR Issued"].map(
                      (rowType, rowIndex) => {
                        const fieldMap = {
                          Complaints: "complaints",
                          "FIR Registered": "firRegistered",
                          "CSR Issued": "csrIssued",
                        };
                        const field = fieldMap[rowType];

                        // Calculate totals
                        const onDateTotal =
                          dsrData.complaintsTable.financial.onDate[field] +
                          dsrData.complaintsTable.nonFinancial.onDate[field];
                        const fromDateTotal =
                          dsrData.complaintsTable.financial.fromDate[field] +
                          dsrData.complaintsTable.nonFinancial.fromDate[field];
                        const data2024Total =
                          dsrData.complaintsTable.financial.data2024[field] +
                          dsrData.complaintsTable.nonFinancial.data2024[field];

                        return (
                          <tr key={rowType}>
                            <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900">
                              {rowType}
                            </td>
                            {/* On Date columns */}
                            <td className="border border-gray-300 px-2 py-2 text-center">
                              {editingDSR ? (
                                <input
                                  type="number"
                                  className="w-full text-center border-0 focus:ring-0"
                                  value={
                                    dsrData.complaintsTable.financial.onDate[
                                      field
                                    ]
                                  }
                                  onChange={(e) => {
                                    const newData = { ...dsrData };
                                    newData.complaintsTable.financial.onDate[
                                      field
                                    ] = parseInt(e.target.value) || 0;
                                    setDsrData(newData);
                                  }}
                                />
                              ) : (
                                <span className="text-sm">
                                  {
                                    dsrData.complaintsTable.financial.onDate[
                                      field
                                    ]
                                  }
                                </span>
                              )}
                            </td>
                            <td className="border border-gray-300 px-2 py-2 text-center">
                              {editingDSR ? (
                                <input
                                  type="number"
                                  className="w-full text-center border-0 focus:ring-0"
                                  value={
                                    dsrData.complaintsTable.nonFinancial.onDate[
                                      field
                                    ]
                                  }
                                  onChange={(e) => {
                                    const newData = { ...dsrData };
                                    newData.complaintsTable.nonFinancial.onDate[
                                      field
                                    ] = parseInt(e.target.value) || 0;
                                    setDsrData(newData);
                                  }}
                                />
                              ) : (
                                <span className="text-sm">
                                  {
                                    dsrData.complaintsTable.nonFinancial.onDate[
                                      field
                                    ]
                                  }
                                </span>
                              )}
                            </td>
                            <td className="border border-gray-300 px-2 py-2 text-center bg-gray-50">
                              <span className="text-sm font-medium">
                                {onDateTotal}
                              </span>
                            </td>
                            {/* From Date columns */}
                            <td className="border border-gray-300 px-2 py-2 text-center">
                              {editingDSR ? (
                                <input
                                  type="number"
                                  className="w-full text-center border-0 focus:ring-0"
                                  value={
                                    dsrData.complaintsTable.financial.fromDate[
                                      field
                                    ]
                                  }
                                  onChange={(e) => {
                                    const newData = { ...dsrData };
                                    newData.complaintsTable.financial.fromDate[
                                      field
                                    ] = parseInt(e.target.value) || 0;
                                    setDsrData(newData);
                                  }}
                                />
                              ) : (
                                <span className="text-sm">
                                  {
                                    dsrData.complaintsTable.financial.fromDate[
                                      field
                                    ]
                                  }
                                </span>
                              )}
                            </td>
                            <td className="border border-gray-300 px-2 py-2 text-center">
                              {editingDSR ? (
                                <input
                                  type="number"
                                  className="w-full text-center border-0 focus:ring-0"
                                  value={
                                    dsrData.complaintsTable.nonFinancial
                                      .fromDate[field]
                                  }
                                  onChange={(e) => {
                                    const newData = { ...dsrData };
                                    newData.complaintsTable.nonFinancial.fromDate[
                                      field
                                    ] = parseInt(e.target.value) || 0;
                                    setDsrData(newData);
                                  }}
                                />
                              ) : (
                                <span className="text-sm">
                                  {
                                    dsrData.complaintsTable.nonFinancial
                                      .fromDate[field]
                                  }
                                </span>
                              )}
                            </td>
                            <td className="border border-gray-300 px-2 py-2 text-center bg-gray-50">
                              <span className="text-sm font-medium">
                                {fromDateTotal}
                              </span>
                            </td>
                            {/* 2024 Data columns */}
                            <td className="border border-gray-300 px-2 py-2 text-center">
                              {editingDSR ? (
                                <input
                                  type="number"
                                  className="w-full text-center border-0 focus:ring-0"
                                  value={
                                    dsrData.complaintsTable.financial.data2024[
                                      field
                                    ]
                                  }
                                  onChange={(e) => {
                                    const newData = { ...dsrData };
                                    newData.complaintsTable.financial.data2024[
                                      field
                                    ] = parseInt(e.target.value) || 0;
                                    setDsrData(newData);
                                  }}
                                />
                              ) : (
                                <span className="text-sm">
                                  {
                                    dsrData.complaintsTable.financial.data2024[
                                      field
                                    ]
                                  }
                                </span>
                              )}
                            </td>
                            <td className="border border-gray-300 px-2 py-2 text-center">
                              {editingDSR ? (
                                <input
                                  type="number"
                                  className="w-full text-center border-0 focus:ring-0"
                                  value={
                                    dsrData.complaintsTable.nonFinancial
                                      .data2024[field]
                                  }
                                  onChange={(e) => {
                                    const newData = { ...dsrData };
                                    newData.complaintsTable.nonFinancial.data2024[
                                      field
                                    ] = parseInt(e.target.value) || 0;
                                    setDsrData(newData);
                                  }}
                                />
                              ) : (
                                <span className="text-sm">
                                  {
                                    dsrData.complaintsTable.nonFinancial
                                      .data2024[field]
                                  }
                                </span>
                              )}
                            </td>
                            <td className="border border-gray-300 px-2 py-2 text-center bg-gray-50">
                              <span className="text-sm font-medium">
                                {data2024Total}
                              </span>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: Amount Lost, Frozen, Returned etc. in CCPS */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                2. Amount Lost, Frozen, Returned etc. in CCPS:
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900">
                        S.No
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900">
                        Category
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-900">
                        On {formatDate(dsrDates.reportDate)}
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-900">
                        From {formatDate(dsrDates.fromDate)} to till Date
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-900">
                        2024
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {dsrData.amountTable.map((row, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900 text-center">
                          {index + 1}.
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                          {row.category}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          {editingDSR ? (
                            <input
                              type="number"
                              className="w-full text-center border-0 focus:ring-0"
                              value={row.onDate}
                              onChange={(e) =>
                                handleDSRInputChange(
                                  "amountTable",
                                  index,
                                  "onDate",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <span className="text-sm">{row.onDate}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          {editingDSR ? (
                            <input
                              type="number"
                              className="w-full text-center border-0 focus:ring-0"
                              value={row.fromDate}
                              onChange={(e) =>
                                handleDSRInputChange(
                                  "amountTable",
                                  index,
                                  "fromDate",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <span className="text-sm">{row.fromDate}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          {editingDSR ? (
                            <input
                              type="number"
                              className="w-full text-center border-0 focus:ring-0"
                              value={row.data2024}
                              onChange={(e) =>
                                handleDSRInputChange(
                                  "amountTable",
                                  index,
                                  "data2024",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <span className="text-sm">{row.data2024}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 3: Stages of cases */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                3. Stages of cases:
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900">
                        Period
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-900">
                        Total Complaints
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-900">
                        UI
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-900">
                        NTF
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-900">
                        PT
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-900">
                        Disposal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr>
                      <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900">
                        On {formatDate(dsrDates.reportDate)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {editingDSR ? (
                          <input
                            type="number"
                            className="w-full text-center border-0 focus:ring-0"
                            value={dsrData.stagesTable.onDate.totalComplaints}
                            onChange={(e) =>
                              handleDSRInputChange(
                                "stagesTable",
                                "onDate",
                                "totalComplaints",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          <span className="text-sm">
                            {dsrData.stagesTable.onDate.totalComplaints}
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {editingDSR ? (
                          <input
                            type="number"
                            className="w-full text-center border-0 focus:ring-0"
                            value={dsrData.stagesTable.onDate.ui}
                            onChange={(e) =>
                              handleDSRInputChange(
                                "stagesTable",
                                "onDate",
                                "ui",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          <span className="text-sm">
                            {dsrData.stagesTable.onDate.ui}
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {editingDSR ? (
                          <input
                            type="number"
                            className="w-full text-center border-0 focus:ring-0"
                            value={dsrData.stagesTable.onDate.ntf}
                            onChange={(e) =>
                              handleDSRInputChange(
                                "stagesTable",
                                "onDate",
                                "ntf",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          <span className="text-sm">
                            {dsrData.stagesTable.onDate.ntf}
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {editingDSR ? (
                          <input
                            type="number"
                            className="w-full text-center border-0 focus:ring-0"
                            value={dsrData.stagesTable.onDate.pt}
                            onChange={(e) =>
                              handleDSRInputChange(
                                "stagesTable",
                                "onDate",
                                "pt",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          <span className="text-sm">
                            {dsrData.stagesTable.onDate.pt}
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {editingDSR ? (
                          <input
                            type="number"
                            className="w-full text-center border-0 focus:ring-0"
                            value={dsrData.stagesTable.onDate.disposal}
                            onChange={(e) =>
                              handleDSRInputChange(
                                "stagesTable",
                                "onDate",
                                "disposal",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          <span className="text-sm">
                            {dsrData.stagesTable.onDate.disposal}
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900">
                        From {formatDate(dsrDates.fromDateCases)} To till date
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {editingDSR ? (
                          <input
                            type="number"
                            className="w-full text-center border-0 focus:ring-0"
                            value={dsrData.stagesTable.fromDate.totalComplaints}
                            onChange={(e) =>
                              handleDSRInputChange(
                                "stagesTable",
                                "fromDate",
                                "totalComplaints",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          <span className="text-sm">
                            {dsrData.stagesTable.fromDate.totalComplaints}
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {editingDSR ? (
                          <input
                            type="number"
                            className="w-full text-center border-0 focus:ring-0"
                            value={dsrData.stagesTable.fromDate.ui}
                            onChange={(e) =>
                              handleDSRInputChange(
                                "stagesTable",
                                "fromDate",
                                "ui",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          <span className="text-sm">
                            {dsrData.stagesTable.fromDate.ui}
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {editingDSR ? (
                          <input
                            type="number"
                            className="w-full text-center border-0 focus:ring-0"
                            value={dsrData.stagesTable.fromDate.ntf}
                            onChange={(e) =>
                              handleDSRInputChange(
                                "stagesTable",
                                "fromDate",
                                "ntf",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          <span className="text-sm">
                            {dsrData.stagesTable.fromDate.ntf}
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {editingDSR ? (
                          <input
                            type="number"
                            className="w-full text-center border-0 focus:ring-0"
                            value={dsrData.stagesTable.fromDate.pt}
                            onChange={(e) =>
                              handleDSRInputChange(
                                "stagesTable",
                                "fromDate",
                                "pt",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          <span className="text-sm">
                            {dsrData.stagesTable.fromDate.pt}
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {editingDSR ? (
                          <input
                            type="number"
                            className="w-full text-center border-0 focus:ring-0"
                            value={dsrData.stagesTable.fromDate.disposal}
                            onChange={(e) =>
                              handleDSRInputChange(
                                "stagesTable",
                                "fromDate",
                                "disposal",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          <span className="text-sm">
                            {dsrData.stagesTable.fromDate.disposal}
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "complaint-status" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Complaint Status Counts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(getStatusCounts()).map(([status, count]) => (
                <div key={status} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <span className="font-medium text-gray-700">{status}</span>
                  <span className="text-xl font-bold text-blue-700">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bulk Upload Section */}
        <div className="mt-8">
          <BulkUpload />
        </div>
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-lg">O</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Officer Profile
                  </h2>
                  <p className="text-sm text-gray-600">
                    Manage your profile information
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveProfile();
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleProfileInputChange}
                      disabled={!editingProfile}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileInputChange}
                      disabled={true}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Type
                    </label>
                    <input
                      type="text"
                      name="userType"
                      value={profileData.userType}
                      disabled={true}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={profileData.employeeId}
                      onChange={handleProfileInputChange}
                      disabled={!editingProfile}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District
                    </label>
                    <select
                      name="district"
                      value={profileData.district}
                      onChange={handleProfileInputChange}
                      disabled={!editingProfile}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="Chennai">Chennai</option>
                      <option value="Coimbatore">Coimbatore</option>
                      <option value="Madurai">Madurai</option>
                      <option value="Tiruchirappalli">Tiruchirappalli</option>
                      <option value="Salem">Salem</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Police Station
                    </label>
                    <input
                      type="text"
                      name="policeStation"
                      value={profileData.policeStation}
                      onChange={handleProfileInputChange}
                      disabled={!editingProfile}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={handleProfileInputChange}
                      disabled={!editingProfile}
                      placeholder="Enter phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Join Date
                    </label>
                    <input
                      type="date"
                      name="joinDate"
                      value={profileData.joinDate}
                      onChange={handleProfileInputChange}
                      disabled={!editingProfile}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  {editingProfile ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingProfile(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowProfileModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProfile(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Edit Profile
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Officer Settings
                  </h2>
                  <p className="text-sm text-gray-600">
                    Customize your dashboard preferences
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* General Settings */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                        />
                      </svg>
                      General Settings
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select
                          value={settingsData.language}
                          onChange={(e) =>
                            handleSettingsChange(
                              "general",
                              "language",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="English">English</option>
                          <option value="Tamil">Tamil</option>
                          <option value="Hindi">Hindi</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timezone
                        </label>
                        <select
                          value={settingsData.timezone}
                          onChange={(e) =>
                            handleSettingsChange(
                              "general",
                              "timezone",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Asia/Kolkata">
                            Asia/Kolkata (IST)
                          </option>
                          <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date Format
                          </label>
                          <select
                            value={settingsData.dateFormat}
                            onChange={(e) =>
                              handleSettingsChange(
                                "general",
                                "dateFormat",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time Format
                          </label>
                          <select
                            value={settingsData.timeFormat}
                            onChange={(e) =>
                              handleSettingsChange(
                                "general",
                                "timeFormat",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="12-hour">12-hour</option>
                            <option value="24-hour">24-hour</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-5 5v-5zM4.5 19.5a2.5 2.5 0 01-2.5-2.5V7a2.5 2.5 0 012.5-2.5h11a2.5 2.5 0 012.5 2.5v10a2.5 2.5 0 01-2.5 2.5h-11z"
                        />
                      </svg>
                      Notification Settings
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Email Notifications
                          </p>
                          <p className="text-xs text-gray-500">
                            Receive notifications via email
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsData.emailNotifications}
                            onChange={(e) =>
                              handleSettingsChange(
                                "notifications",
                                "emailNotifications",
                                e.target.checked
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            SMS Notifications
                          </p>
                          <p className="text-xs text-gray-500">
                            Receive notifications via SMS
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsData.smsNotifications}
                            onChange={(e) =>
                              handleSettingsChange(
                                "notifications",
                                "smsNotifications",
                                e.target.checked
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Push Notifications
                          </p>
                          <p className="text-xs text-gray-500">
                            Receive browser notifications
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsData.pushNotifications}
                            onChange={(e) =>
                              handleSettingsChange(
                                "notifications",
                                "pushNotifications",
                                e.target.checked
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Notification Sound
                          </p>
                          <p className="text-xs text-gray-500">
                            Play sound for notifications
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsData.notificationSound}
                            onChange={(e) =>
                              handleSettingsChange(
                                "notifications",
                                "notificationSound",
                                e.target.checked
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Display & Security Settings */}
                <div className="space-y-6">
                  {/* Display Settings */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Display Settings
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Theme
                        </label>
                        <select
                          value={settingsData.theme}
                          onChange={(e) =>
                            handleSettingsChange(
                              "display",
                              "theme",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Font Size
                        </label>
                        <select
                          value={settingsData.fontSize}
                          onChange={(e) =>
                            handleSettingsChange(
                              "display",
                              "fontSize",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Auto Refresh
                          </p>
                          <p className="text-xs text-gray-500">
                            Automatically refresh data
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsData.autoRefresh}
                            onChange={(e) =>
                              handleSettingsChange(
                                "display",
                                "autoRefresh",
                                e.target.checked
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {settingsData.autoRefresh && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Refresh Interval (seconds)
                          </label>
                          <input
                            type="number"
                            min="10"
                            max="300"
                            value={settingsData.refreshInterval}
                            onChange={(e) =>
                              handleSettingsChange(
                                "display",
                                "refreshInterval",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Security Settings
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Two-Factor Authentication
                          </p>
                          <p className="text-xs text-gray-500">
                            Add extra security to your account
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsData.twoFactorAuth}
                            onChange={(e) =>
                              handleSettingsChange(
                                "security",
                                "twoFactorAuth",
                                e.target.checked
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Timeout (minutes)
                        </label>
                        <select
                          value={settingsData.sessionTimeout}
                          onChange={(e) =>
                            handleSettingsChange(
                              "security",
                              "sessionTimeout",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={120}>2 hours</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password Expiry (days)
                        </label>
                        <select
                          value={settingsData.passwordExpiry}
                          onChange={(e) =>
                            handleSettingsChange(
                              "security",
                              "passwordExpiry",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={30}>30 days</option>
                          <option value={60}>60 days</option>
                          <option value={90}>90 days</option>
                          <option value={180}>180 days</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Workflow Settings */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      Workflow Settings
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Auto Save
                          </p>
                          <p className="text-xs text-gray-500">
                            Automatically save form data
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsData.autoSave}
                            onChange={(e) =>
                              handleSettingsChange(
                                "workflow",
                                "autoSave",
                                e.target.checked
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Status
                        </label>
                        <select
                          value={settingsData.defaultStatus}
                          onChange={(e) =>
                            handleSettingsChange(
                              "workflow",
                              "defaultStatus",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Category
                        </label>
                        <select
                          value={settingsData.defaultCategory}
                          onChange={(e) =>
                            handleSettingsChange(
                              "workflow",
                              "defaultCategory",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Cyber Fraud">Cyber Fraud</option>
                          <option value="Online Harassment">
                            Online Harassment
                          </option>
                          <option value="Data Theft">Data Theft</option>
                          <option value="Financial Fraud">
                            Financial Fraud
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default District
                        </label>
                        <select
                          value={settingsData.defaultDistrict}
                          onChange={(e) =>
                            handleSettingsChange(
                              "workflow",
                              "defaultDistrict",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Chennai">Chennai</option>
                          <option value="Coimbatore">Coimbatore</option>
                          <option value="Madurai">Madurai</option>
                          <option value="Tiruchirappalli">
                            Tiruchirappalli
                          </option>
                          <option value="Salem">Salem</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={handleResetSettings}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Reset to Defaults
                </button>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
