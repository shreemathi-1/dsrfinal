"use client";

import React, { useState, useEffect } from "react";
import { saveDSRData, loadDSRData } from "@/lib/dsrDatabase";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  CalendarIcon,
  DocumentArrowDownIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import CCPSHeader from "./components/CCPSHeader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Helper: if selectedDate is today, use yesterday for data/report
function getReportDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  //if (date.getTime() === today.getTime()) {
  const yest = new Date(date);
  yest.setDate(yest.getDate() - 1);
  return yest;
  // }
  return date;
}

export default function CCPSDashboard() {
  const { user, profile, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  // Dynamically set default date to today
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [isEditing, setIsEditing] = useState(false);

  // Updated initial state structure
  const [tableData, setTableData] = useState({
    districts: [
      {
        districtName: "Kanchipuram",
        complaints: {
          financial: { ncrp: 0, direct: 0, total: 0 },
          nonFinancial: { ncrp: 0, direct: 0, total: 0 },
        },
        fir: {
          financial: { ncrp: 0, direct: 0, total: 0 },
          nonFinancial: { ncrp: 0, direct: 0, total: 0 },
        },
        csr: {
          financial: { ncrp: 0, direct: 0, total: 0 },
          nonFinancial: { ncrp: 0, direct: 0, total: 0 },
        },
        amountLost: 82153,
        amountFrozen: 0,
        amountReturned: 0,
        accusedArrested: 0,
        casesInGoondas: 0,
        // Loan App Cases
        loanAppCases: {
          noOfCases: 0,
          noOfComplaints: 0,
          noOfFirRegistered: 0,
          noOfCsrIssued: 0,
          accusedArrested: 0,
        },
        // Case Progress
        caseProgress: {
          ccNoObtained: 0,
          convicted: 0,
          acquittedDisposed: 0,
        },
        // Cyber Volunteers Progress on date
        cyberVolunteers: {
          current: {
            noOfRequests: 0,
            noOfRequestsApproved: 0,
            noOfRequestsRejected: 0,
            noOfRequestsPending: 0,
          },
          total: {
            noOfRequests: 0,
            noOfRequestsApproved: 0,
            noOfRequestsRejected: 0,
            noOfRequestsPending: 0,
          },
        },
      },
    ],
  });

  // Table II data structure
  const [tableIIData, setTableIIData] = useState({
    districts: [
      {
        districtName: "Kanchipuram",
        csrToFir: {
          financial: 0,
          nonFinancial: 0,
          total: 0,
        },
        firRegistered: {
          financial: 0,
          nonFinancial: 0,
          total: 0,
        },
        csrRegistered: {
          financial: 0,
          nonFinancial: 0,
          total: 0,
        },
        amountLost: 82153,
        amountFrozen: 0,
        amountReturned: 0,
        accusedArrested: 0,
        casesInGoondas: 0,
        loanAppCases: {
          firRegistered: 0,
          csrIssued: 0,
        },
      },
    ],
  });

  // Table III data structure
  const [tableIIIData, setTableIIIData] = useState({
    districts: [
      {
        districtName: "Kanchipuram",
        socialMedia: {
          facebook: { sent: 0, blocked: 0 },
          twitter: { sent: 0, blocked: 0 },
          youtube: { sent: 0, blocked: 0 },
          instagram: { sent: 0, blocked: 0 },
          loanApps: { sent: 0, blocked: 0 },
          otherApps: { sent: 0, blocked: 0 },
          websites: { sent: 0, blocked: 0 },
          telegram: { sent: 0, blocked: 0 },
          whatsapp: { sent: 0, blocked: 0 },
        },
      },
    ],
  });

  // Table IV data structure
  const [tableIVData, setTableIVData] = useState({
    districts: [
      {
        districtName: "Kanchipuram",
        dutyAndLeave: {
          adsp: { bdDuty: 0, cl: 0, mlEl: 0, od: 0 },
          inspector: { bdDuty: 0, cl: 0, mlEl: 0, od: 0 },
          si: { bdDuty: 0, cl: 0, mlEl: 0, od: 0 },
          others: { bdDuty: 0, cl: 0, mlEl: 0, od: 0 },
        },
      },
    ],
  });

  // Protect the route
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

  // Helper functions for localStorage operations
  const saveToLocalStorage = (key, data) => {
    try {
      console.log(`Attempting to save ${key} to localStorage:`, data);
      const jsonData = JSON.stringify(data);
      localStorage.setItem(key, jsonData);
      console.log(`Successfully saved ${key} to localStorage`);
      
      // Verify the save by reading it back
      const savedData = localStorage.getItem(key);
      if (savedData) {
        console.log(`Verification: ${key} exists in localStorage with length:`, savedData.length);
      } else {
        console.error(`Verification failed: ${key} not found in localStorage after save`);
      }
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  };

  const loadFromLocalStorage = (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
      return null;
    }
  };

  // Default/initial state objects for resetting tables when no data found
  const getDefaultTableData = () => ({
    districts: [
      {
        districtName: "Kanchipuram",
        complaints: {
          financial: { ncrp: 0, direct: 0, total: 0 },
          nonFinancial: { ncrp: 0, direct: 0, total: 0 },
        },
        fir: {
          financial: { ncrp: 0, direct: 0, total: 0 },
          nonFinancial: { ncrp: 0, direct: 0, total: 0 },
        },
        csr: {
          financial: { ncrp: 0, direct: 0, total: 0 },
          nonFinancial: { ncrp: 0, direct: 0, total: 0 },
        },
        amountLost: 0,
        amountFrozen: 0,
        amountReturned: 0,
        accusedArrested: 0,
        casesInGoondas: 0,
        loanAppCases: {
          noOfCases: 0,
          noOfComplaints: 0,
          noOfFirRegistered: 0,
          noOfCsrIssued: 0,
          accusedArrested: 0,
        },
        caseProgress: {
          ccNoObtained: 0,
          convicted: 0,
          acquittedDisposed: 0,
        },
        cyberVolunteers: {
          current: {
            noOfRequests: 0,
            noOfRequestsApproved: 0,
            noOfRequestsRejected: 0,
            noOfRequestsPending: 0,
          },
          total: {
            noOfRequests: 0,
            noOfRequestsApproved: 0,
            noOfRequestsRejected: 0,
            noOfRequestsPending: 0,
          },
        },
      },
    ],
  });

  const getDefaultTableIIData = () => ({
    districts: [
      {
        districtName: "Kanchipuram",
        csrToFir: {
          financial: 0,
          nonFinancial: 0,
          total: 0,
        },
        firRegistered: {
          financial: 0,
          nonFinancial: 0,
          total: 0,
        },
        csrRegistered: {
          financial: 0,
          nonFinancial: 0,
          total: 0,
        },
        amountLost: 0,
        amountFrozen: 0,
        amountReturned: 0,
        accusedArrested: 0,
        casesInGoondas: 0,
        loanAppCases: {
          firRegistered: 0,
          csrIssued: 0,
        },
      },
    ],
  });

  const getDefaultTableIIIData = () => ({
    districts: [
      {
        districtName: "Kanchipuram",
        socialMedia: {
          facebook: { sent: 0, blocked: 0 },
          twitter: { sent: 0, blocked: 0 },
          youtube: { sent: 0, blocked: 0 },
          instagram: { sent: 0, blocked: 0 },
          loanApps: { sent: 0, blocked: 0 },
          otherApps: { sent: 0, blocked: 0 },
          websites: { sent: 0, blocked: 0 },
          telegram: { sent: 0, blocked: 0 },
          whatsapp: { sent: 0, blocked: 0 },
        },
      },
    ],
  });

  const getDefaultTableIVData = () => ({
    districts: [
      {
        districtName: "Kanchipuram",
        dutyAndLeave: {
          adsp: { bdDuty: 0, cl: 0, mlEl: 0, od: 0 },
          inspector: { bdDuty: 0, cl: 0, mlEl: 0, od: 0 },
          si: { bdDuty: 0, cl: 0, mlEl: 0, od: 0 },
          others: { bdDuty: 0, cl: 0, mlEl: 0, od: 0 },
        },
      },
    ],
  });

  // Load data from localStorage based on selected date
  useEffect(() => {
    const loadTableDataFromStorage = () => {
      const dateKey = selectedDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      console.log(`Loading data for date: ${dateKey}`);
      
      const table1Data = loadFromLocalStorage(`ccps-table1-${dateKey}`);
      const table2Data = loadFromLocalStorage(`ccps-table2-${dateKey}`);
      const table3Data = loadFromLocalStorage(`ccps-table3-${dateKey}`);
      const table4Data = loadFromLocalStorage(`ccps-table4-${dateKey}`);

      // Load data if exists, otherwise reset to defaults
      if (table1Data) {
        setTableData(table1Data);
        console.log(`Table 1 data loaded from localStorage for ${dateKey}`);
      } else {
        setTableData(getDefaultTableData());
        console.log(`No Table 1 data found for ${dateKey} - reset to defaults`);
      }
      
      if (table2Data) {
        setTableIIData(table2Data);
        console.log(`Table 2 data loaded from localStorage for ${dateKey}`);
      } else {
        setTableIIData(getDefaultTableIIData());
        console.log(`No Table 2 data found for ${dateKey} - reset to defaults`);
      }
      
      if (table3Data) {
        setTableIIIData(table3Data);
        console.log(`Table 3 data loaded from localStorage for ${dateKey}`);
      } else {
        setTableIIIData(getDefaultTableIIIData());
        console.log(`No Table 3 data found for ${dateKey} - reset to defaults`);
      }
      
      if (table4Data) {
        setTableIVData(table4Data);
        console.log(`Table 4 data loaded from localStorage for ${dateKey}`);
      } else {
        setTableIVData(getDefaultTableIVData());
        console.log(`No Table 4 data found for ${dateKey} - reset to defaults`);
      }
    };

    // Only load from localStorage if we're in the browser
    if (typeof window !== 'undefined') {
      loadTableDataFromStorage();
    }
  }, [selectedDate]); // Now depends on selectedDate, so it runs when date changes

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Data loading is handled in useEffect below
  };

  // Database loading removed - now using localStorage only

  const handleEditClick = () => {
    setIsEditing(!isEditing);
    // setEditingDistrict(null); // This line is removed as per new state
  };

  const handleSave = () => {
    setIsEditing(false);
    const dateKey = selectedDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    console.log('=== SAVE BUTTON CLICKED ===');
    console.log('Selected Date:', dateKey);
    console.log('Current table states:');
    console.log('Table 1 (tableData):', tableData);
    console.log('Table 2 (tableIIData):', tableIIData);
    console.log('Table 3 (tableIIIData):', tableIIIData);
    console.log('Table 4 (tableIVData):', tableIVData);
    
    try {
      // Save all table data to localStorage with date-specific keys
      console.log('Starting date-wise localStorage saves...');
      saveToLocalStorage(`ccps-table1-${dateKey}`, tableData);
      saveToLocalStorage(`ccps-table2-${dateKey}`, tableIIData);
      saveToLocalStorage(`ccps-table3-${dateKey}`, tableIIIData);
      saveToLocalStorage(`ccps-table4-${dateKey}`, tableIVData);
      
      // Final verification - check what's actually in localStorage
      console.log('=== FINAL VERIFICATION ===');
      const keys = [`ccps-table1-${dateKey}`, `ccps-table2-${dateKey}`, `ccps-table3-${dateKey}`, `ccps-table4-${dateKey}`];
      keys.forEach(key => {
        const data = localStorage.getItem(key);
        console.log(`${key} in localStorage:`, data ? 'EXISTS' : 'MISSING', data ? `(${data.length} chars)` : '');
      });
      
      console.log(`All table data saved to localStorage for date: ${dateKey}`);
      // Optionally show a success notification here
      // showSuccess('All table data saved!');
    } catch (error) {
      // Optionally show an error notification here
      // showError('Failed to save table data: ' + error.message);
      console.error("Failed to save table data:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // setEditingDistrict(null); // This line is removed as per new state
  };

  // Helper to update table data for Table I
  const handleTableIChange = (districtIdx, section, type, field, value) => {
    setTableData((prev) => {
      const districts = [...prev.districts];
      if (section === "complaints" || section === "fir" || section === "csr") {
        districts[districtIdx][section][type][field] = Number(value);
      } else if (
        section === "amountLost" ||
        section === "amountFrozen" ||
        section === "amountReturned" ||
        section === "accusedArrested" ||
        section === "casesInGoondas"
      ) {
        districts[districtIdx][section] = Number(value);
      } else if (section === "loanAppCases") {
        districts[districtIdx][section][field] = Number(value);
      } else if (section === "caseProgress") {
        districts[districtIdx][section][field] = Number(value);
      } else if (section === "cyberVolunteers") {
        districts[districtIdx][section][type][field] = Number(value);
      }
      return { ...prev, districts };
    });
  };

  // Helper to update Table II
  const handleTableIIChange = (districtIdx, section, field, value) => {
    setTableIIData((prev) => {
      const districts = [...prev.districts];
      if (
        section === "csrToFir" ||
        section === "firRegistered" ||
        section === "csrRegistered"
      ) {
        districts[districtIdx][section][field] = Number(value);
      } else if (
        section === "amountLost" ||
        section === "amountFrozen" ||
        section === "amountReturned" ||
        section === "accusedArrested" ||
        section === "casesInGoondas"
      ) {
        districts[districtIdx][section] = Number(value);
      } else if (section === "loanAppCases") {
        districts[districtIdx][section][field] = Number(value);
      }
      return { ...prev, districts };
    });
  };

  // Helper to update Table III
  const handleTableIIIChange = (districtIdx, platform, field, value) => {
    setTableIIIData((prev) => {
      const districts = [...prev.districts];
      districts[districtIdx].socialMedia[platform][field] = Number(value);
      return { ...prev, districts };
    });
  };

  // Helper to update Table IV
  const handleTableIVChange = (districtIdx, role, field, value) => {
    setTableIVData((prev) => {
      const districts = [...prev.districts];
      districts[districtIdx].dutyAndLeave[role][field] = Number(value);
      return { ...prev, districts };
    });
  };

  // Export all tables as a single PDF
  const exportToPDF = () => {
    const doc = new jsPDF("l", "mm", "a3");
    let y = 10;
    doc.setFontSize(16);
    doc.text("CCPS Dashboard Report", 14, y);
    doc.setFontSize(12);
    doc.text(`Date: ${selectedDate.toLocaleDateString()}`, 14, y + 8);
    y += 16;

    // Table I
    doc.setFontSize(14);
    // Show the report date (yesterday if today is selected)
    const reportDate = getReportDate(selectedDate);
    const reportDateStr = reportDate.toLocaleDateString();
    doc.text(
      `TABLE I - Financial & Non-Financial Complaints Registered (${reportDateStr})`,
      14,
      y
    );
    y += 6;
    doc.autoTable({
      startY: y,
      head: [
        [
          "District/City",
          "NCRP Fin",
          "Direct Fin",
          "NCRP Non-Fin",
          "Direct Non-Fin",
          "FIR NCRP Fin",
          "FIR Direct Fin",
          "FIR NCRP Non-Fin",
          "FIR Direct Non-Fin",
          "CSR NCRP Fin",
          "CSR Direct Fin",
          "CSR NCRP Non-Fin",
          "CSR Direct Non-Fin",
          "Amount Lost",
          "Amount Frozen",
          "Amount Returned",
          "Accused Arrested",
          "Cases in Goondas",
          "Loan Cases",
          "Loan Complaints",
          "Loan FIR",
          "Loan CSR",
          "Loan Arrested",
          "CC No",
          "Convicted",
          "Acquitted",
          "CV Requests",
          "CV Approved",
          "CV Rejected",
          "CV Pending",
        ],
      ],
      body: tableData.districts.map((d) => [
        d.districtName,
        d.complaints.financial.ncrp,
        d.complaints.financial.direct,
        d.complaints.nonFinancial.ncrp,
        d.complaints.nonFinancial.direct,
        d.fir.financial.ncrp,
        d.fir.financial.direct,
        d.fir.nonFinancial.ncrp,
        d.fir.nonFinancial.direct,
        d.csr.financial.ncrp,
        d.csr.financial.direct,
        d.csr.nonFinancial.ncrp,
        d.csr.nonFinancial.direct,
        d.amountLost,
        d.amountFrozen,
        d.amountReturned,
        d.accusedArrested,
        d.casesInGoondas,
        d.loanAppCases.noOfCases,
        d.loanAppCases.noOfComplaints,
        d.loanAppCases.noOfFirRegistered,
        d.loanAppCases.noOfCsrIssued,
        d.loanAppCases.accusedArrested,
        d.caseProgress.ccNoObtained,
        d.caseProgress.convicted,
        d.caseProgress.acquittedDisposed,
        d.cyberVolunteers.current.noOfRequests,
        d.cyberVolunteers.current.noOfRequestsApproved,
        d.cyberVolunteers.current.noOfRequestsRejected,
        d.cyberVolunteers.current.noOfRequestsPending,
      ]),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: { fillColor: [200, 200, 200] },
    });
    y = doc.lastAutoTable.finalY + 10;

    // Table II
    doc.setFontSize(14);
    doc.text(
      `TABLE II - Total No.of CSR Converted to FIR and Loan App Cases (${getReportDate(
        selectedDate
      ).toLocaleDateString()})`,
      14,
      y
    );
    y += 6;
    doc.autoTable({
      startY: y,
      head: [
        [
          "District/City",
          "CSR to FIR Fin",
          "CSR to FIR Non-Fin",
          "CSR to FIR Total",
          "FIR Reg Fin",
          "FIR Reg Non-Fin",
          "FIR Reg Total",
          "CSR Reg Fin",
          "CSR Reg Non-Fin",
          "CSR Reg Total",
          "Amount Lost",
          "Amount Frozen",
          "Amount Returned",
          "Accused Arrested",
          "Cases in Goondas",
          "Loan FIR",
          "Loan CSR",
        ],
      ],
      body: tableIIData.districts.map((d) => [
        d.districtName,
        d.csrToFir.financial,
        d.csrToFir.nonFinancial,
        d.csrToFir.total,
        d.firRegistered.financial,
        d.firRegistered.nonFinancial,
        d.firRegistered.total,
        d.csrRegistered.financial,
        d.csrRegistered.nonFinancial,
        d.csrRegistered.total,
        d.amountLost,
        d.amountFrozen,
        d.amountReturned,
        d.accusedArrested,
        d.casesInGoondas,
        d.loanAppCases.firRegistered,
        d.loanAppCases.csrIssued,
      ]),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: { fillColor: [200, 200, 200] },
    });
    y = doc.lastAutoTable.finalY + 10;

    // Table III
    doc.setFontSize(14);
    doc.text("TABLE III - Social Media Requests", 14, y);
    y += 6;
    doc.autoTable({
      startY: y,
      head: [
        [
          "District/City",
          "FB Sent",
          "FB Blocked",
          "TW Sent",
          "TW Blocked",
          "YT Sent",
          "YT Blocked",
          "IG Sent",
          "IG Blocked",
          "Loan Sent",
          "Loan Blocked",
          "Other Sent",
          "Other Blocked",
          "Web Sent",
          "Web Blocked",
          "TG Sent",
          "TG Blocked",
          "WA Sent",
          "WA Blocked",
        ],
      ],
      body: tableIIIData.districts.map((d) => [
        d.districtName,
        d.socialMedia.facebook.sent,
        d.socialMedia.facebook.blocked,
        d.socialMedia.twitter.sent,
        d.socialMedia.twitter.blocked,
        d.socialMedia.youtube.sent,
        d.socialMedia.youtube.blocked,
        d.socialMedia.instagram.sent,
        d.socialMedia.instagram.blocked,
        d.socialMedia.loanApps.sent,
        d.socialMedia.loanApps.blocked,
        d.socialMedia.otherApps.sent,
        d.socialMedia.otherApps.blocked,
        d.socialMedia.websites.sent,
        d.socialMedia.websites.blocked,
        d.socialMedia.telegram.sent,
        d.socialMedia.telegram.blocked,
        d.socialMedia.whatsapp.sent,
        d.socialMedia.whatsapp.blocked,
      ]),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: { fillColor: [200, 200, 200] },
    });
    y = doc.lastAutoTable.finalY + 10;

    // Table IV
    doc.setFontSize(14);
    doc.text("TABLE IV - B/D duty & Leave details", 14, y);
    y += 6;
    doc.autoTable({
      startY: y,
      head: [
        [
          "District/City",
          "ADSP BD",
          "ADSP CL",
          "ADSP ML/EL",
          "ADSP OD",
          "Inspector BD",
          "Inspector CL",
          "Inspector ML/EL",
          "Inspector OD",
          "SI BD",
          "SI CL",
          "SI ML/EL",
          "SI OD",
          "Others BD",
          "Others CL",
          "Others ML/EL",
          "Others OD",
        ],
      ],
      body: tableIVData.districts.map((d) => [
        d.districtName,
        d.dutyAndLeave.adsp.bdDuty,
        d.dutyAndLeave.adsp.cl,
        d.dutyAndLeave.adsp.mlEl,
        d.dutyAndLeave.adsp.od,
        d.dutyAndLeave.inspector.bdDuty,
        d.dutyAndLeave.inspector.cl,
        d.dutyAndLeave.inspector.mlEl,
        d.dutyAndLeave.inspector.od,
        d.dutyAndLeave.si.bdDuty,
        d.dutyAndLeave.si.cl,
        d.dutyAndLeave.si.mlEl,
        d.dutyAndLeave.si.od,
        d.dutyAndLeave.others.bdDuty,
        d.dutyAndLeave.others.cl,
        d.dutyAndLeave.others.mlEl,
        d.dutyAndLeave.others.od,
      ]),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: { fillColor: [200, 200, 200] },
    });
    doc.save(`CCPS_Report_${selectedDate.toISOString().split("T")[0]}.pdf`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CCPSHeader
        handleLogout={async () => {
          if (typeof window !== "undefined") {
            const { logout } = await import("@/contexts/AuthContext");
            if (logout) await logout();
            window.location.href = "/";
          }
        }}
      />
      <div className="px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mt-4 mb-6 p">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Welcom!</h1>
            <div className="flex items-center gap-4">
              <DatePicker
                selected={selectedDate}
                onChange={setSelectedDate}
                dateFormat="dd/MM/yyyy"
                className="px-3 py-2 border rounded-lg"
              />
              <button
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isEditing ? "Save" : "Edit Table"}
              </button>
              <button
                onClick={exportToPDF}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Table I */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <h2 className="text-xl font-bold p-4 border-b">
            {`TABLE I - Financial & Non-Financial Complaints Registered (${getReportDate(
              selectedDate
            ).toLocaleDateString()})`}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th rowSpan="3" className="border p-2">
                    Sl.No
                  </th>
                  <th rowSpan="3" className="border p-2">
                    District/City
                  </th>
                  <th colSpan="6" className="border p-2">
                    No. of Complaints received
                  </th>
                  <th colSpan="6" className="border p-2">
                    No. of FIR Registered
                  </th>
                  <th colSpan="6" className="border p-2">
                    No. of CSR Registered
                  </th>
                  <th rowSpan="3" className="border p-2">
                    Amount Lost (in Rupees)
                  </th>
                  <th rowSpan="3" className="border p-2">
                    Amount Frozen (in Rupees)
                  </th>
                  <th rowSpan="3" className="border p-2">
                    Amount Returned (in Rupees)
                  </th>
                  <th rowSpan="3" className="border p-2">
                    Number of Accused Arrested
                  </th>
                  <th rowSpan="3" className="border p-2">
                    No.Of cases Registered in Goondas
                  </th>
                  {/* Loan App Cases */}
                  <th rowSpan="3" className="border p-2">
                    No.Of cases
                  </th>
                  <th rowSpan="3" className="border p-2">
                    No.of Complaints
                  </th>
                  <th rowSpan="3" className="border p-2">
                    No.of FIR Registered
                  </th>
                  <th rowSpan="3" className="border p-2">
                    No.of CSR Issued
                  </th>
                  <th rowSpan="3" className="border p-2">
                    Number of Accused Arrested
                  </th>
                  {/* Case Progress */}
                  <th rowSpan="3" className="border p-2">
                    CC No/SC No Obtained
                  </th>
                  <th rowSpan="3" className="border p-2">
                    Convicted
                  </th>
                  <th rowSpan="3" className="border p-2">
                    Acquitted/ O/disposal
                  </th>
                  {/* Cyber Volunteers Progress on date */}
                  <th rowSpan="3" className="border p-2">
                    No.of requests applied
                  </th>
                  <th rowSpan="3" className="border p-2">
                    No.of requests approved
                  </th>
                  <th rowSpan="3" className="border p-2">
                    No.of requests rejected
                  </th>
                  <th rowSpan="3" className="border p-2">
                    No.of requests pending
                  </th>
                  {/* Cyber Volunteers Progress so far */}
                  <th rowSpan="3" className="border p-2">
                    No.of requests applied
                  </th>
                  <th rowSpan="3" className="border p-2">
                    No.of requests approved
                  </th>
                  <th rowSpan="3" className="border p-2">
                    No.of requests rejected
                  </th>
                  <th rowSpan="3" className="border p-2">
                    No.of requests pending
                  </th>
                </tr>
                <tr className="bg-gray-50">
                  <th colSpan="3" className="border p-2">
                    FINANCIAL FRAUD
                  </th>
                  <th colSpan="3" className="border p-2">
                    NON FINANCIAL FRAUD
                  </th>
                  <th colSpan="3" className="border p-2">
                    FINANCIAL FRAUD
                  </th>
                  <th colSpan="3" className="border p-2">
                    NON FINANCIAL FRAUD
                  </th>
                  <th colSpan="3" className="border p-2">
                    FINANCIAL FRAUD
                  </th>
                  <th colSpan="3" className="border p-2">
                    NON FINANCIAL FRAUD
                  </th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="border p-2">NCRP</th>
                  <th className="border p-2">Direct</th>
                  <th className="border p-2">Total</th>
                  <th className="border p-2">NCRP</th>
                  <th className="border p-2">Direct</th>
                  <th className="border p-2">Total</th>
                  <th className="border p-2">NCRP</th>
                  <th className="border p-2">Direct</th>
                  <th className="border p-2">Total</th>
                  <th className="border p-2">NCRP</th>
                  <th className="border p-2">Direct</th>
                  <th className="border p-2">Total</th>
                  <th className="border p-2">NCRP</th>
                  <th className="border p-2">Direct</th>
                  <th className="border p-2">Total</th>
                  <th className="border p-2">NCRP</th>
                  <th className="border p-2">Direct</th>
                  <th className="border p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {tableData.districts.map((district, index) => (
                  <tr key={index}>
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">{district.districtName}</td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.complaints.financial.ncrp}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "complaints",
                              "financial",
                              "ncrp",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.complaints.financial.ncrp
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.complaints.financial.direct}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "complaints",
                              "financial",
                              "direct",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.complaints.financial.direct
                      )}
                    </td>
                    <td className="border p-2">
                      {district.complaints.financial.ncrp + district.complaints.financial.direct}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.complaints.nonFinancial.ncrp}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "complaints",
                              "nonFinancial",
                              "ncrp",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.complaints.nonFinancial.ncrp
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.complaints.nonFinancial.direct}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "complaints",
                              "nonFinancial",
                              "direct",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.complaints.nonFinancial.direct
                      )}
                    </td>
                    <td className="border p-2">
                      {district.complaints.nonFinancial.ncrp + district.complaints.nonFinancial.direct}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.fir.financial.ncrp}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "fir",
                              "financial",
                              "ncrp",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.fir.financial.ncrp
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.fir.financial.direct}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "fir",
                              "financial",
                              "direct",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.fir.financial.direct
                      )}
                    </td>
                    <td className="border p-2">
                      {district.fir.financial.ncrp + district.fir.financial.direct}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.fir.nonFinancial.ncrp}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "fir",
                              "nonFinancial",
                              "ncrp",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.fir.nonFinancial.ncrp
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.fir.nonFinancial.direct}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "fir",
                              "nonFinancial",
                              "direct",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.fir.nonFinancial.direct
                      )}
                    </td>
                    <td className="border p-2">
                      {district.fir.nonFinancial.ncrp + district.fir.nonFinancial.direct}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.csr.financial.ncrp}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "csr",
                              "financial",
                              "ncrp",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.csr.financial.ncrp
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.csr.financial.direct}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "csr",
                              "financial",
                              "direct",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.csr.financial.direct
                      )}
                    </td>
                    <td className="border p-2">
                      {district.csr.financial.ncrp + district.csr.financial.direct}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.csr.nonFinancial.ncrp}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "csr",
                              "nonFinancial",
                              "ncrp",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.csr.nonFinancial.ncrp
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.csr.nonFinancial.direct}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "csr",
                              "nonFinancial",
                              "direct",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.csr.nonFinancial.direct
                      )}
                    </td>
                    <td className="border p-2">
                      {district.csr.nonFinancial.ncrp + district.csr.nonFinancial.direct}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.amountLost}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "amountLost",
                              null,
                              null,
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.amountLost
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.amountFrozen}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "amountFrozen",
                              null,
                              null,
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.amountFrozen
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.amountReturned}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "amountReturned",
                              null,
                              null,
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.amountReturned
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.accusedArrested}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "accusedArrested",
                              null,
                              null,
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.accusedArrested
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.casesInGoondas}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "casesInGoondas",
                              null,
                              null,
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.casesInGoondas
                      )}
                    </td>
                    {/* Loan App Cases */}
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.loanAppCases.noOfCases}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "loanAppCases",
                              null,
                              "noOfCases",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.loanAppCases.noOfCases
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.loanAppCases.noOfComplaints}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "loanAppCases",
                              null,
                              "noOfComplaints",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.loanAppCases.noOfComplaints
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.loanAppCases.noOfFirRegistered}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "loanAppCases",
                              null,
                              "noOfFirRegistered",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.loanAppCases.noOfFirRegistered
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.loanAppCases.noOfCsrIssued}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "loanAppCases",
                              null,
                              "noOfCsrIssued",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.loanAppCases.noOfCsrIssued
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.loanAppCases.accusedArrested}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "loanAppCases",
                              null,
                              "accusedArrested",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.loanAppCases.accusedArrested
                      )}
                    </td>
                    {/* Case Progress */}
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.caseProgress.ccNoObtained}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "caseProgress",
                              null,
                              "ccNoObtained",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.caseProgress.ccNoObtained
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.caseProgress.convicted}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "caseProgress",
                              null,
                              "convicted",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.caseProgress.convicted
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.caseProgress.acquittedDisposed}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "caseProgress",
                              null,
                              "acquittedDisposed",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.caseProgress.acquittedDisposed
                      )}
                    </td>
                    {/* Cyber Volunteers Progress on date */}
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.cyberVolunteers.current.noOfRequests}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "cyberVolunteers",
                              "current",
                              "noOfRequests",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.cyberVolunteers.current.noOfRequests
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={
                            district.cyberVolunteers.current
                              .noOfRequestsApproved
                          }
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "cyberVolunteers",
                              "current",
                              "noOfRequestsApproved",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.cyberVolunteers.current.noOfRequestsApproved
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={
                            district.cyberVolunteers.current
                              .noOfRequestsRejected
                          }
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "cyberVolunteers",
                              "current",
                              "noOfRequestsRejected",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.cyberVolunteers.current.noOfRequestsRejected
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={
                            district.cyberVolunteers.current.noOfRequestsPending
                          }
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "cyberVolunteers",
                              "current",
                              "noOfRequestsPending",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.cyberVolunteers.current.noOfRequestsPending
                      )}
                    </td>
                    {/* Cyber Volunteers Progress so far */}
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={district.cyberVolunteers.total.noOfRequests}
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "cyberVolunteers",
                              "total",
                              "noOfRequests",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.cyberVolunteers.total.noOfRequests
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={
                            district.cyberVolunteers.total.noOfRequestsApproved
                          }
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "cyberVolunteers",
                              "total",
                              "noOfRequestsApproved",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.cyberVolunteers.total.noOfRequestsApproved
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={
                            district.cyberVolunteers.total.noOfRequestsRejected
                          }
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "cyberVolunteers",
                              "total",
                              "noOfRequestsRejected",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.cyberVolunteers.total.noOfRequestsRejected
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={
                            district.cyberVolunteers.total.noOfRequestsPending
                          }
                          onChange={(e) =>
                            handleTableIChange(
                              index,
                              "cyberVolunteers",
                              "total",
                              "noOfRequestsPending",
                              e.target.value
                            )
                          }
                          className="w-16 px-1"
                        />
                      ) : (
                        district.cyberVolunteers.total.noOfRequestsPending
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-50">
                  <td className="border p-2"></td>
                  <td className="border p-2">Grand Total</td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.complaints.financial.ncrp,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.complaints.financial.direct,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.complaints.financial.ncrp + d.complaints.financial.direct,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.complaints.nonFinancial.ncrp,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.complaints.nonFinancial.direct,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.complaints.nonFinancial.ncrp + d.complaints.nonFinancial.direct,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.fir.financial.ncrp,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.fir.financial.direct,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.fir.financial.ncrp + d.fir.financial.direct,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.fir.nonFinancial.ncrp,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.fir.nonFinancial.direct,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.fir.nonFinancial.ncrp + d.fir.nonFinancial.direct,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.csr.financial.ncrp,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.csr.financial.direct,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.csr.financial.ncrp + d.csr.financial.direct,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.csr.nonFinancial.ncrp,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.csr.nonFinancial.direct,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.csr.nonFinancial.ncrp + d.csr.nonFinancial.direct,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.amountLost,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.amountFrozen,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.amountReturned,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.accusedArrested,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.casesInGoondas,
                      0
                    )}
                  </td>
                  {/* Loan App Cases Totals */}
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.loanAppCases.noOfCases,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.loanAppCases.noOfComplaints,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.loanAppCases.noOfFirRegistered,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.loanAppCases.noOfCsrIssued,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.loanAppCases.accusedArrested,
                      0
                    )}
                  </td>
                  {/* Case Progress Totals */}
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.caseProgress.ccNoObtained,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.caseProgress.convicted,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.caseProgress.acquittedDisposed,
                      0
                    )}
                  </td>
                  {/* Cyber Volunteers Current Progress Totals */}
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.cyberVolunteers.current.noOfRequests,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) =>
                        sum + d.cyberVolunteers.current.noOfRequestsApproved,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) =>
                        sum + d.cyberVolunteers.current.noOfRequestsRejected,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) =>
                        sum + d.cyberVolunteers.current.noOfRequestsPending,
                      0
                    )}
                  </td>
                  {/* Cyber Volunteers Total Progress Totals */}
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) => sum + d.cyberVolunteers.total.noOfRequests,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) =>
                        sum + d.cyberVolunteers.total.noOfRequestsApproved,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) =>
                        sum + d.cyberVolunteers.total.noOfRequestsRejected,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableData.districts.reduce(
                      (sum, d) =>
                        sum + d.cyberVolunteers.total.noOfRequestsPending,
                      0
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Table II */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <h2 className="text-xl font-bold p-4 border-b">
            {`TABLE II - Total No.of CSR Converted to FIR and Loan App Cases (${getReportDate(
              selectedDate
            ).toLocaleDateString()})`}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th rowSpan="3" className="border p-2">
                    Sl.No
                  </th>
                  <th rowSpan="3" className="border p-2">
                    District/City
                  </th>
                  <th colSpan="3" className="border p-2">
                    Total No.of CSR Converted to FIR
                  </th>
                  <th colSpan="3" className="border p-2">
                    No of FIR Registered
                  </th>
                  <th colSpan="3" className="border p-2">
                    No of CSR Registered
                  </th>
                  <th rowSpan="3" className="border p-2">
                    Amount Lost (in Rupees)
                  </th>
                  <th rowSpan="3" className="border p-2">
                    Amount Frozen (in Rupees)
                  </th>
                  <th rowSpan="3" className="border p-2">
                    Amount Returned (in Rupees)
                  </th>
                  <th rowSpan="3" className="border p-2">
                    Number of Accused Arrested
                  </th>
                  <th rowSpan="3" className="border p-2">
                    No.Of cases Registered in Goondas
                  </th>
                  <th colSpan="2" className="border p-2">
                    Loan App Cases
                  </th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="border p-2">FINANCIAL FRAUD</th>
                  <th className="border p-2">NON FINANCIAL FRAUD</th>
                  <th className="border p-2">TOTAL</th>
                  <th className="border p-2">FINANCIAL FRAUD</th>
                  <th className="border p-2">NON FINANCIAL FRAUD</th>
                  <th className="border p-2">TOTAL</th>
                  <th className="border p-2">FINANCIAL FRAUD</th>
                  <th className="border p-2">NON FINANCIAL FRAUD</th>
                  <th className="border p-2">TOTAL</th>
                  <th className="border p-2">No.of FIR Registered</th>
                  <th className="border p-2">No.of CSR Issued</th>
                </tr>
              </thead>
              <tbody>
                {tableIIData.districts.map((district, index) => (
                  <tr key={index}>
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">{district.districtName}</td>
                    {isEditing ? (
                      <>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={district.csrToFir.financial}
                            onChange={(e) =>
                              handleTableIIChange(
                                index,
                                "csrToFir",
                                "financial",
                                e.target.value
                              )
                            }
                            className="w-16 px-1"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={district.csrToFir.nonFinancial}
                            onChange={(e) =>
                              handleTableIIChange(
                                index,
                                "csrToFir",
                                "nonFinancial",
                                e.target.value
                              )
                            }
                            className="w-16 px-1"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={district.csrToFir.total}
                            onChange={(e) =>
                              handleTableIIChange(
                                index,
                                "csrToFir",
                                "total",
                                e.target.value
                              )
                            }
                            className="w-16 px-1"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={district.firRegistered.financial}
                            onChange={(e) =>
                              handleTableIIChange(
                                index,
                                "firRegistered",
                                "financial",
                                e.target.value
                              )
                            }
                            className="w-16 px-1"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={district.firRegistered.nonFinancial}
                            onChange={(e) =>
                              handleTableIIChange(
                                index,
                                "firRegistered",
                                "nonFinancial",
                                e.target.value
                              )
                            }
                            className="w-16 px-1"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={district.firRegistered.total}
                            onChange={(e) =>
                              handleTableIIChange(
                                index,
                                "firRegistered",
                                "total",
                                e.target.value
                              )
                            }
                            className="w-16 px-1"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={district.csrRegistered.financial}
                            onChange={(e) =>
                              handleTableIIChange(
                                index,
                                "csrRegistered",
                                "financial",
                                e.target.value
                              )
                            }
                            className="w-16 px-1"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={district.csrRegistered.nonFinancial}
                            onChange={(e) =>
                              handleTableIIChange(
                                index,
                                "csrRegistered",
                                "nonFinancial",
                                e.target.value
                              )
                            }
                            className="w-16 px-1"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={district.csrRegistered.total}
                            onChange={(e) =>
                              handleTableIIChange(
                                index,
                                "csrRegistered",
                                "total",
                                e.target.value
                              )
                            }
                            className="w-16 px-1"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={district.amountLost}
                            onChange={(e) =>
                              handleTableIIChange(
                                index,
                                "amountLost",
                                null,
                                e.target.value
                              )
                            }
                            className="w-16 px-1"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={district.amountFrozen}
                            onChange={(e) =>
                              handleTableIIChange(
                                index,
                                "amountFrozen",
                                null,
                                e.target.value
                              )
                            }
                            className="w-16 px-1"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={district.amountReturned}
                            onChange={(e) =>
                              handleTableIIChange(
                                index,
                                "amountReturned",
                                null,
                                e.target.value
                              )
                            }
                            className="w-16 px-1"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={district.accusedArrested}
                            onChange={(e) =>
                              handleTableIIChange(
                                index,
                                "accusedArrested",
                                null,
                                e.target.value
                              )
                            }
                            className="w-16 px-1"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={district.casesInGoondas}
                            onChange={(e) =>
                              handleTableIIChange(
                                index,
                                "casesInGoondas",
                                null,
                                e.target.value
                              )
                            }
                            className="w-16 px-1"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={district.loanAppCases.firRegistered}
                            onChange={(e) =>
                              handleTableIIChange(
                                index,
                                "loanAppCases",
                                "firRegistered",
                                e.target.value
                              )
                            }
                            className="w-16 px-1"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={district.loanAppCases.csrIssued}
                            onChange={(e) =>
                              handleTableIIChange(
                                index,
                                "loanAppCases",
                                "csrIssued",
                                e.target.value
                              )
                            }
                            className="w-16 px-1"
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="border p-2">
                          {district.csrToFir.financial}
                        </td>
                        <td className="border p-2">
                          {district.csrToFir.nonFinancial}
                        </td>
                        <td className="border p-2">
                          {district.csrToFir.total}
                        </td>
                        <td className="border p-2">
                          {district.firRegistered.financial}
                        </td>
                        <td className="border p-2">
                          {district.firRegistered.nonFinancial}
                        </td>
                        <td className="border p-2">
                          {district.firRegistered.total}
                        </td>
                        <td className="border p-2">
                          {district.csrRegistered.financial}
                        </td>
                        <td className="border p-2">
                          {district.csrRegistered.nonFinancial}
                        </td>
                        <td className="border p-2">
                          {district.csrRegistered.total}
                        </td>
                        <td className="border p-2">{district.amountLost}</td>
                        <td className="border p-2">{district.amountFrozen}</td>
                        <td className="border p-2">
                          {district.amountReturned}
                        </td>
                        <td className="border p-2">
                          {district.accusedArrested}
                        </td>
                        <td className="border p-2">
                          {district.casesInGoondas}
                        </td>
                        <td className="border p-2">
                          {district.loanAppCases.firRegistered}
                        </td>
                        <td className="border p-2">
                          {district.loanAppCases.csrIssued}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                <tr className="font-bold bg-gray-50">
                  <td className="border p-2"></td>
                  <td className="border p-2">Grand Total</td>
                  <td className="border p-2">
                    {tableIIData.districts.reduce(
                      (sum, d) => sum + d.csrToFir.financial,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIData.districts.reduce(
                      (sum, d) => sum + d.csrToFir.nonFinancial,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIData.districts.reduce(
                      (sum, d) => sum + d.csrToFir.total,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIData.districts.reduce(
                      (sum, d) => sum + d.firRegistered.financial,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIData.districts.reduce(
                      (sum, d) => sum + d.firRegistered.nonFinancial,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIData.districts.reduce(
                      (sum, d) => sum + d.firRegistered.total,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIData.districts.reduce(
                      (sum, d) => sum + d.csrRegistered.financial,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIData.districts.reduce(
                      (sum, d) => sum + d.csrRegistered.nonFinancial,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIData.districts.reduce(
                      (sum, d) => sum + d.csrRegistered.total,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIData.districts.reduce(
                      (sum, d) => sum + d.amountLost,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIData.districts.reduce(
                      (sum, d) => sum + d.amountFrozen,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIData.districts.reduce(
                      (sum, d) => sum + d.amountReturned,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIData.districts.reduce(
                      (sum, d) => sum + d.accusedArrested,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIData.districts.reduce(
                      (sum, d) => sum + d.casesInGoondas,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIData.districts.reduce(
                      (sum, d) => sum + d.loanAppCases.firRegistered,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIData.districts.reduce(
                      (sum, d) => sum + d.loanAppCases.csrIssued,
                      0
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Table III */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <h2 className="text-xl font-bold p-4 border-b">
            {`TABLE III - Social Media Requests (${getReportDate(
              selectedDate
            ).toLocaleDateString()})`}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th rowSpan="3" className="border p-2">
                    Sl.No
                  </th>
                  <th rowSpan="3" className="border p-2">
                    District/City
                  </th>
                  <th colSpan="18" className="border p-2">
                    Social media requests sent & blocked on{" "}
                    {getReportDate(selectedDate).toLocaleDateString()}
                  </th>
                </tr>
                <tr className="bg-gray-50">
                  <th colSpan="2" className="border p-2">
                    Facebook
                  </th>
                  <th colSpan="2" className="border p-2">
                    Twitter
                  </th>
                  <th colSpan="2" className="border p-2">
                    Youtube
                  </th>
                  <th colSpan="2" className="border p-2">
                    Instagram
                  </th>
                  <th colSpan="2" className="border p-2">
                    Loan Apps
                  </th>
                  <th colSpan="2" className="border p-2">
                    Other Apps
                  </th>
                  <th colSpan="2" className="border p-2">
                    Websites
                  </th>
                  <th colSpan="2" className="border p-2">
                    Telegram
                  </th>
                  <th colSpan="2" className="border p-2">
                    WhatsApp
                  </th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="border p-2">1</th>
                  <th className="border p-2">2</th>
                  <th className="border p-2">Sent</th>
                  <th className="border p-2">Blocked</th>
                  <th className="border p-2">Sent</th>
                  <th className="border p-2">Blocked</th>
                  <th className="border p-2">Sent</th>
                  <th className="border p-2">Blocked</th>
                  <th className="border p-2">Sent</th>
                  <th className="border p-2">Blocked</th>
                  <th className="border p-2">Sent</th>
                  <th className="border p-2">Blocked</th>
                  <th className="border p-2">Sent</th>
                  <th className="border p-2">Blocked</th>
                  <th className="border p-2">Sent</th>
                  <th className="border p-2">Blocked</th>
                  <th className="border p-2">Sent</th>
                  <th className="border p-2">Blocked</th>
                  <th className="border p-2">Sent</th>
                  <th className="border p-2">Blocked</th>
                </tr>
              </thead>
              <tbody>
                {tableIIIData.districts.map((district, index) => (
                  <tr key={index}>
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">{district.districtName}</td>
                    {isEditing ? (
                      <>
                        {Object.keys(district.socialMedia).map((platform) => (
                          <React.Fragment key={platform}>
                            <td className="border p-2">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={district.socialMedia[platform].sent}
                                  onChange={(e) =>
                                    handleTableIIIChange(
                                      index,
                                      platform,
                                      "sent",
                                      e.target.value
                                    )
                                  }
                                  className="w-16 px-1"
                                />
                              ) : (
                                district.socialMedia[platform].sent
                              )}
                            </td>
                            <td className="border p-2">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={district.socialMedia[platform].blocked}
                                  onChange={(e) =>
                                    handleTableIIIChange(
                                      index,
                                      platform,
                                      "blocked",
                                      e.target.value
                                    )
                                  }
                                  className="w-16 px-1"
                                />
                              ) : (
                                district.socialMedia[platform].blocked
                              )}
                            </td>
                          </React.Fragment>
                        ))}
                      </>
                    ) : (
                      <>
                        <td className="border p-2">
                          {district.socialMedia.facebook.sent}
                        </td>
                        <td className="border p-2">
                          {district.socialMedia.facebook.blocked}
                        </td>
                        <td className="border p-2">
                          {district.socialMedia.twitter.sent}
                        </td>
                        <td className="border p-2">
                          {district.socialMedia.twitter.blocked}
                        </td>
                        <td className="border p-2">
                          {district.socialMedia.youtube.sent}
                        </td>
                        <td className="border p-2">
                          {district.socialMedia.youtube.blocked}
                        </td>
                        <td className="border p-2">
                          {district.socialMedia.instagram.sent}
                        </td>
                        <td className="border p-2">
                          {district.socialMedia.instagram.blocked}
                        </td>
                        <td className="border p-2">
                          {district.socialMedia.loanApps.sent}
                        </td>
                        <td className="border p-2">
                          {district.socialMedia.loanApps.blocked}
                        </td>
                        <td className="border p-2">
                          {district.socialMedia.otherApps.sent}
                        </td>
                        <td className="border p-2">
                          {district.socialMedia.otherApps.blocked}
                        </td>
                        <td className="border p-2">
                          {district.socialMedia.websites.sent}
                        </td>
                        <td className="border p-2">
                          {district.socialMedia.websites.blocked}
                        </td>
                        <td className="border p-2">
                          {district.socialMedia.telegram.sent}
                        </td>
                        <td className="border p-2">
                          {district.socialMedia.telegram.blocked}
                        </td>
                        <td className="border p-2">
                          {district.socialMedia.whatsapp.sent}
                        </td>
                        <td className="border p-2">
                          {district.socialMedia.whatsapp.blocked}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                <tr className="font-bold bg-gray-50">
                  <td className="border p-2"></td>
                  <td className="border p-2">Grand Total</td>
                  <td className="border p-2">
                    {tableIIIData.districts.reduce(
                      (sum, d) => sum + d.socialMedia.facebook.sent,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIIData.districts.reduce(
                      (sum, d) => sum + d.socialMedia.facebook.blocked,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIIData.districts.reduce(
                      (sum, d) => sum + d.socialMedia.twitter.sent,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIIData.districts.reduce(
                      (sum, d) => sum + d.socialMedia.twitter.blocked,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIIData.districts.reduce(
                      (sum, d) => sum + d.socialMedia.youtube.sent,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIIData.districts.reduce(
                      (sum, d) => sum + d.socialMedia.youtube.blocked,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIIData.districts.reduce(
                      (sum, d) => sum + d.socialMedia.instagram.sent,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIIData.districts.reduce(
                      (sum, d) => sum + d.socialMedia.instagram.blocked,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIIData.districts.reduce(
                      (sum, d) => sum + d.socialMedia.loanApps.sent,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIIData.districts.reduce(
                      (sum, d) => sum + d.socialMedia.loanApps.blocked,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIIData.districts.reduce(
                      (sum, d) => sum + d.socialMedia.otherApps.sent,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIIData.districts.reduce(
                      (sum, d) => sum + d.socialMedia.otherApps.blocked,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIIData.districts.reduce(
                      (sum, d) => sum + d.socialMedia.websites.sent,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIIData.districts.reduce(
                      (sum, d) => sum + d.socialMedia.websites.blocked,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIIData.districts.reduce(
                      (sum, d) => sum + d.socialMedia.telegram.sent,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIIData.districts.reduce(
                      (sum, d) => sum + d.socialMedia.telegram.blocked,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIIData.districts.reduce(
                      (sum, d) => sum + d.socialMedia.whatsapp.sent,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIIIData.districts.reduce(
                      (sum, d) => sum + d.socialMedia.whatsapp.blocked,
                      0
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Table IV */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <h2 className="text-xl font-bold p-4 border-b">
            {`TABLE IV - B/D duty & Leave details on ${getReportDate(
              selectedDate
            ).toLocaleDateString()}`}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th rowSpan="3" className="border p-2">
                    Sl.No
                  </th>
                  <th rowSpan="3" className="border p-2">
                    District/City
                  </th>
                  <th colSpan="4" className="border p-2">
                    ADSP&apos;s
                  </th>
                  <th colSpan="4" className="border p-2">
                    Inspector&apos;s
                  </th>
                  <th colSpan="4" className="border p-2">
                    SI&apos;s (L&O,Tech)
                  </th>
                  <th colSpan="4" className="border p-2">
                    Others
                  </th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="border p-2">B/D Duty</th>
                  <th className="border p-2">CL</th>
                  <th className="border p-2">ML/EL</th>
                  <th className="border p-2">OD</th>
                  <th className="border p-2">B/D Duty</th>
                  <th className="border p-2">CL</th>
                  <th className="border p-2">ML/EL</th>
                  <th className="border p-2">OD</th>
                  <th className="border p-2">B/D Duty</th>
                  <th className="border p-2">CL</th>
                  <th className="border p-2">ML/EL</th>
                  <th className="border p-2">OD</th>
                  <th className="border p-2">B/D Duty</th>
                  <th className="border p-2">CL</th>
                  <th className="border p-2">ML/EL</th>
                  <th className="border p-2">OD</th>
                </tr>
              </thead>
              <tbody>
                {tableIVData.districts.map((district, index) => (
                  <tr key={index}>
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">{district.districtName}</td>
                    {["adsp", "inspector", "si", "others"].map((role) => (
                      <React.Fragment key={role}>
                        <td className="border p-2">
                          {isEditing ? (
                            <input
                              type="number"
                              value={district.dutyAndLeave[role].bdDuty}
                              onChange={(e) =>
                                handleTableIVChange(
                                  index,
                                  role,
                                  "bdDuty",
                                  e.target.value
                                )
                              }
                              className="w-16 px-1"
                            />
                          ) : (
                            district.dutyAndLeave[role].bdDuty
                          )}
                        </td>
                        <td className="border p-2">
                          {isEditing ? (
                            <input
                              type="number"
                              value={district.dutyAndLeave[role].cl}
                              onChange={(e) =>
                                handleTableIVChange(
                                  index,
                                  role,
                                  "cl",
                                  e.target.value
                                )
                              }
                              className="w-16 px-1"
                            />
                          ) : (
                            district.dutyAndLeave[role].cl
                          )}
                        </td>
                        <td className="border p-2">
                          {isEditing ? (
                            <input
                              type="number"
                              value={district.dutyAndLeave[role].mlEl}
                              onChange={(e) =>
                                handleTableIVChange(
                                  index,
                                  role,
                                  "mlEl",
                                  e.target.value
                                )
                              }
                              className="w-16 px-1"
                            />
                          ) : (
                            district.dutyAndLeave[role].mlEl
                          )}
                        </td>
                        <td className="border p-2">
                          {isEditing ? (
                            <input
                              type="number"
                              value={district.dutyAndLeave[role].od}
                              onChange={(e) =>
                                handleTableIVChange(
                                  index,
                                  role,
                                  "od",
                                  e.target.value
                                )
                              }
                              className="w-16 px-1"
                            />
                          ) : (
                            district.dutyAndLeave[role].od
                          )}
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
                <tr className="font-bold bg-gray-50">
                  <td className="border p-2"></td>
                  <td className="border p-2">Grand Total</td>
                  <td className="border p-2">
                    {tableIVData.districts.reduce(
                      (sum, d) => sum + d.dutyAndLeave.adsp.bdDuty,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIVData.districts.reduce(
                      (sum, d) => sum + d.dutyAndLeave.adsp.cl,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIVData.districts.reduce(
                      (sum, d) => sum + d.dutyAndLeave.adsp.mlEl,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIVData.districts.reduce(
                      (sum, d) => sum + d.dutyAndLeave.adsp.od,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIVData.districts.reduce(
                      (sum, d) => sum + d.dutyAndLeave.inspector.bdDuty,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIVData.districts.reduce(
                      (sum, d) => sum + d.dutyAndLeave.inspector.cl,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIVData.districts.reduce(
                      (sum, d) => sum + d.dutyAndLeave.inspector.mlEl,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIVData.districts.reduce(
                      (sum, d) => sum + d.dutyAndLeave.inspector.od,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIVData.districts.reduce(
                      (sum, d) => sum + d.dutyAndLeave.si.bdDuty,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIVData.districts.reduce(
                      (sum, d) => sum + d.dutyAndLeave.si.cl,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIVData.districts.reduce(
                      (sum, d) => sum + d.dutyAndLeave.si.mlEl,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIVData.districts.reduce(
                      (sum, d) => sum + d.dutyAndLeave.si.od,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIVData.districts.reduce(
                      (sum, d) => sum + d.dutyAndLeave.others.bdDuty,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIVData.districts.reduce(
                      (sum, d) => sum + d.dutyAndLeave.others.cl,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIVData.districts.reduce(
                      (sum, d) => sum + d.dutyAndLeave.others.mlEl,
                      0
                    )}
                  </td>
                  <td className="border p-2">
                    {tableIVData.districts.reduce(
                      (sum, d) => sum + d.dutyAndLeave.others.od,
                      0
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
