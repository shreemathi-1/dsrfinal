"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Table1_ComplaintsNCRPCCPS from '../components/tables/Table1_ComplaintsNCRPCCPS';
import Table2_AmountLostFrozen from '../components/tables/Table2_AmountLostFrozen';
import Table3_StagesOfCases from '../components/tables/Table3_StagesOfCases';
import Table4_NCRPComplaints from '../components/tables/Table4_NCRPComplaints';
import Table5_CCTNSComplaints from '../components/tables/Table5_CCTNSComplaints';
import Table6_TrendingMO from '../components/tables/Table6_TrendingMO';
import Table7_Helpline1930 from '../components/tables/Table7_Helpline1930';
import Table8_Above1Lakh from '../components/tables/Table8_Above1Lakh';
import Table9_Above50Lakh from '../components/tables/Table9_Above50Lakh';
import Table10_MeiTYRequests from '../components/tables/Table10_MeiTYRequests';
import Table11_SIMBlocking from '../components/tables/Table11_SIMBlocking';
import Table12_ContentBlocking from '../components/tables/Table12_ContentBlocking';
import Table13_CEIR from '../components/tables/Table13_CEIR';
import Table14_LinkageCases from '../components/tables/Table14_LinkageCases';
import Table15_CIAR from '../components/tables/Table15_CIAR';
import Table16_CCWHeadquarters from '../components/tables/Table16_CCWHeadquarters';
import Table17_Awareness from '../components/tables/Table17_Awareness';
import Table18_CyberVolunteers from '../components/tables/Table18_CyberVolunteers';
import Table19_SocialMedia from '../components/tables/Table19_SocialMedia';
import Table20_Trainings from '../components/tables/Table20_Trainings';
import Table21_DutyLeave from '../components/tables/Table21_DutyLeave';

// Table titles and their corresponding IDs
const TABLES = [
  { id: 1, title: "Complaints registered through NCRP and Complaints received by CCPS" },
  { id: 2, title: "Amount Lost,Frozen,Returned etc. in CCPS" },
  { id: 3, title: "Stages of cases" },
  { id: 4, title: "NCRP Complaints status" },
  { id: 5, title: "CCTNS Complaints status" },
  { id: 6, title: "NEW MO/Trending MO Reported" },
  { id: 7, title: "Details of Complaints received through helpline 1930" },
  { id: 8, title: "Cases where amount lost is 1 Lakh and above (1930 Complaints)" },
  { id: 9, title: "Cases where amount lost is 50 Lakh and above (1930 Complaints)" },
  { id: 10, title: "Blocking requests sent to MeiTY and complied" },
  { id: 11, title: "SIM Blocking" },
  { id: 12, title: "Content Blocking" },
  { id: 13, title: "Details of Central Equipment Identity Register (CEIR)" },
  { id: 14, title: "Interstate and Intrastate Linkage Cases" },
  { id: 15, title: "Details of Cyber Crime Investigation Assistance Request (CIAR)" },
  { id: 16, title: "Investigation of cases at CCW headquarters" },
  { id: 17, title: "Awareness Conducted" },
  { id: 18, title: "Cyber Volunteers" },
  { id: 19, title: "Posts uploaded in Social Media" },
  { id: 20, title: "Trainings Conducted" },
  { id: 21, title: "Districts/cities CCPS Duty & Leave Details" }
];

// Map table IDs to their components
const TABLE_COMPONENTS = {
  1: Table1_ComplaintsNCRPCCPS,
  2: Table2_AmountLostFrozen,
  3: Table3_StagesOfCases,
  4: Table4_NCRPComplaints,
  5: Table5_CCTNSComplaints,
  6: Table6_TrendingMO,
  7: Table7_Helpline1930,
  8: Table8_Above1Lakh,
  9: Table9_Above50Lakh,
  10: Table10_MeiTYRequests,
  11: Table11_SIMBlocking,
  12: Table12_ContentBlocking,
  13: Table13_CEIR,
  14: Table14_LinkageCases,
  15: Table15_CIAR,
  16: Table16_CCWHeadquarters,
  17: Table17_Awareness,
  18: Table18_CyberVolunteers,
  19: Table19_SocialMedia,
  20: Table20_Trainings,
  21: Table21_DutyLeave
};

// Helper function to get table title
const getTableTitle = (tableId) => {
  const table = TABLES.find(t => t.id === tableId);
  return table ? table.title : '';
};

// Helper function to convert table data to Excel format
const tableToExcelData = (tableElement) => {
  const rows = Array.from(tableElement.querySelectorAll('tr'));
  return rows.map(row => {
    const cells = Array.from(row.querySelectorAll('th, td'));
    return cells.map(cell => cell.textContent.trim());
  });
};

// Helper function to convert table to data for PDF
const tableToData = (table) => {
  const headers = [];
  const data = [];
  
  // Get headers
  const headerCells = table.querySelectorAll('thead th');
  headerCells.forEach(cell => {
    headers.push(cell.textContent.trim());
  });

  // Get data rows
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const rowData = [];
    const cells = row.querySelectorAll('td');
    cells.forEach(cell => {
      rowData.push(cell.textContent.trim());
    });
    if (rowData.length > 0) {
      data.push(rowData);
    }
  });

  return { headers, data };
};

import { useAuth } from '../../../contexts/AuthContext';
import { getVisibleTables, normalizeUserType, shouldRedirectToCCPS, getTableDefinition } from '../../../config/tableConfig';

export default function ReportsDashboard() {
  // All hooks must come first!
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  // State for date picker
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  // State for table selection (all checked by default, but only for visible tables)
  const [selectedTables, setSelectedTables] = useState({});
  // State for edit mode and table data
  const [editMode, setEditMode] = useState(false);
  const [tableData, setTableData] = useState({});

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

  // Save all table data to localStorage with date-specific keys
  const handleSave = () => {
    setEditMode(false);
    const dateKey = selectedDate; // Already in YYYY-MM-DD format
    console.log('=== SAVE BUTTON CLICKED ===');
    console.log('Selected Date:', dateKey);
    console.log('Current table data:', tableData);
    
    try {
      // Save all table data to localStorage with date-specific keys
      console.log('Starting date-wise localStorage saves for DSR tables...');
      for (let i = 1; i <= 21; i++) {
        const tableKey = `dsr-table${i}-${dateKey}`;
        const data = tableData[i] || {}; // Use empty object if no data for this table
        saveToLocalStorage(tableKey, data);
      }
      
      // Final verification - check what's actually in localStorage
      console.log('=== FINAL VERIFICATION ===');
      for (let i = 1; i <= 21; i++) {
        const tableKey = `dsr-table${i}-${dateKey}`;
        const data = localStorage.getItem(tableKey);
        console.log(`${tableKey} in localStorage:`, data ? 'EXISTS' : 'MISSING', data ? `(${data.length} chars)` : '');
      }
      
      console.log(`All DSR table data saved to localStorage for date: ${dateKey}`);
    } catch (error) {
      console.error("Failed to save DSR table data:", error);
    }
  };

  // Load data from localStorage based on selected date
  useEffect(() => {
    const loadTableDataFromStorage = () => {
      const dateKey = selectedDate; // Already in YYYY-MM-DD format
      console.log(`Loading DSR data for date: ${dateKey}`);
      
      const newTableData = {};
      
      // Load data for all 21 tables
      for (let i = 1; i <= 21; i++) {
        const tableKey = `dsr-table${i}-${dateKey}`;
        const data = loadFromLocalStorage(tableKey);
        
        if (data) {
          newTableData[i] = data;
          console.log(`Table ${i} data loaded from localStorage for ${dateKey}`);
        } else {
          newTableData[i] = {}; // Default empty object if no data
          console.log(`No Table ${i} data found for ${dateKey} - reset to defaults`);
        }
      }
      
      setTableData(newTableData);
    };

    // Only load from localStorage if we're in the browser
    if (typeof window !== 'undefined') {
      loadTableDataFromStorage();
    }
  }, [selectedDate]); // Runs when selectedDate changes

  // Get user's department and determine visible tables using the centralized config
  // Priority: user.department > profile.department > user.user_type > profile.user_type
  const userType = user?.department || profile?.department || user?.user_type || profile?.user_type || '';
  const normalizedUserType = normalizeUserType(userType);
  const visibleTableIds = getVisibleTables(normalizedUserType);

  // Sync selectedTables state with visibleTableIds on user/department change
  useEffect(() => {
    setSelectedTables(
      TABLES.reduce((acc, table) => {
        if (visibleTableIds.includes(table.id)) {
          acc[table.id] = true;
        }
        return acc;
      }, {})
    );
  }, [visibleTableIds.length, user]);

  // Show loading spinner only while loading is true
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }
  // If not loading and no user, show access denied
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-500">Access Denied: Not logged in.</div>
      </div>
    );
  }

  // Get user's department and determine visible tables using the centralized config
  // Priority: user.department > profile.department > user.user_type > profile.user_type

  console.log('[REPORTS] Raw department:', user?.department);
  console.log('[REPORTS] Raw user_type:', user?.user_type);
  
  console.log('[REPORTS] Raw user type:', userType);
  console.log('[REPORTS] Normalized user type:', normalizedUserType);
  console.log('[REPORTS] User object:', user);
  console.log('[REPORTS] Profile object:', profile);
  
  // Check if CCPS user should be redirected
  if (shouldRedirectToCCPS(userType)) {
    console.log('[REPORTS] CCPS user detected, redirecting to CCPS dashboard');
    if (typeof window !== 'undefined') {
      window.location.replace("/ccps-dashboard");
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg text-gray-700 mb-2">Redirecting to CCPS Dashboard</p>
          <p className="text-sm text-gray-500 mb-4">CCPS users should use the dedicated CCPS dashboard.</p>
        </div>
      </div>
    );
  }

  console.log('[REPORTS] Visible table IDs for', normalizedUserType, ':', visibleTableIds);
  console.log('[REPORTS] Total tables available:', TABLES.length);
  console.log('[REPORTS] Tables that will be rendered:', TABLES.filter(table => visibleTableIds.includes(table.id)).length);
  console.log('[REPORTS] Filtered table IDs:', TABLES.filter(table => visibleTableIds.includes(table.id)).map(t => t.id));
  
  // Debug: Test getVisibleTables function directly
  console.log('[REPORTS] Testing getVisibleTables with different inputs:');
  console.log('[REPORTS] getVisibleTables("MOA"):', getVisibleTables('MOA'));
  console.log('[REPORTS] getVisibleTables("NCRP"):', getVisibleTables('NCRP'));
  console.log('[REPORTS] getVisibleTables("Cyber arangam"):', getVisibleTables('Cyber arangam'));
  console.log('[REPORTS] getVisibleTables("DSR"):', getVisibleTables('DSR'));


  // Handle date change
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    
    // Load data from localStorage for the new date
    console.log(`=== DATE CHANGED TO: ${newDate} ===`);
    
    const newTableData = {};
    
    // Load data for all 21 tables for the new date
    for (let i = 1; i <= 21; i++) {
      const tableKey = `dsr-table${i}-${newDate}`;
      const data = loadFromLocalStorage(tableKey);
      
      if (data && Object.keys(data).length > 0) {
        newTableData[i] = data;
        console.log(`Table ${i} data loaded from localStorage for ${newDate}`);
      } else {
        newTableData[i] = {}; // Default empty object if no data
        console.log(`No Table ${i} data found for ${newDate} - reset to defaults`);
      }
    }
    
    setTableData(newTableData);
    console.log(`All table data loaded/reset for date: ${newDate}`);
  };

  // Handle checkbox changes
  const handleTableSelection = (tableId) => {
    setSelectedTables(prev => ({
      ...prev,
      [tableId]: !prev[tableId]
    }));
  };

  // Select/Deselect all tables
  const handleSelectAll = (selected) => {
    setSelectedTables(
      TABLES.reduce((acc, table) => ({ ...acc, [table.id]: selected }), {})
    );
  };

  // Handle table data changes
  const handleTableDataChange = (tableId, data) => {
    console.log(`Table ${tableId} data changed:`, data);
    
    // Update in-memory state
    setTableData(prev => ({
      ...prev,
      [tableId]: data
    }));
    
    // Immediately save to localStorage with date-specific key for real-time datewise storage
    const dateKey = selectedDate; // Already in YYYY-MM-DD format
    const tableKey = `dsr-table${tableId}-${dateKey}`;
    
    try {
      console.log(`💾 Saving Table ${tableId} data for date ${dateKey}:`, data);
      saveToLocalStorage(tableKey, data);
      console.log(`✅ Table ${tableId} data saved to localStorage for ${dateKey}`);
    } catch (error) {
      console.error(`❌ Failed to save Table ${tableId} data for ${dateKey}:`, error);
    }
  };

  const renderTable = (tableId) => {
    const TableComponent = TABLE_COMPONENTS[tableId];
    if (TableComponent) {
      return (
        <TableComponent
          date={selectedDate}
          editMode={editMode}
          data={tableData[tableId] || {}}
          onDataChange={(data) => handleTableDataChange(tableId, data)}
        />
      );
    }
    return (
      <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded">
        Table component not yet implemented
      </div>
    );
  };

  // Export to Word (Excel format)
  const exportToWord = async () => {
    const selectedTableIds = Object.entries(selectedTables)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => Number(id));

    if (selectedTableIds.length === 0) {
      alert('Please select at least one table to export.');
      return;
    }

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add each selected table as a worksheet
    selectedTableIds.forEach(tableId => {
      const tableContainer = document.querySelector(`[data-table-id="${tableId}"]`);
      if (tableContainer) {
        const table = tableContainer.querySelector('table');
        if (table) {
          const data = tableToExcelData(table);
          const ws = XLSX.utils.aoa_to_sheet(data);
          
          // Add title as merged cell at the top
          const title = getTableTitle(tableId);
          XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: 'A1' });
          ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: data[0].length - 1 } }];
          
          XLSX.utils.book_append_sheet(wb, ws, `Table ${tableId}`);
        }
      }
    });

    // Save the file
    XLSX.writeFile(wb, `DSR_Report_${selectedDate}.xlsx`);
  };

  // Export to PDF
  const exportToPDF = async () => {
    const selectedTableIds = Object.entries(selectedTables)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => Number(id));

    if (selectedTableIds.length === 0) {
      alert('Please select at least one table to export.');
      return;
    }

    try {
      // Initialize PDF in landscape mode
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
      });

      let firstPage = true;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      let yOffset = margin;

      // Add title
      doc.setFontSize(16);
      doc.text(`DSR Report - ${selectedDate}`, margin, yOffset);
      yOffset += 30;

      // Process each selected table
      for (const tableId of selectedTableIds) {
        if (!firstPage) {
          doc.addPage();
          yOffset = margin;
        }

        // Add table title
        const title = getTableTitle(tableId);
        doc.setFontSize(12);
        doc.text(title, margin, yOffset);
        yOffset += 20;

        // Get the table element
        const tableContainer = document.querySelector(`[data-table-id="${tableId}"]`);
        if (tableContainer) {
          const table = tableContainer.querySelector('table');
          if (table) {
            try {
              // Extract table data
              const { headers, data } = tableToData(table);

              // Add table
              doc.autoTable({
                head: [headers],
                body: data,
                startY: yOffset,
                margin: { left: margin, right: margin },
                styles: {
                  fontSize: 8,
                  cellPadding: 3,
                  overflow: 'linebreak',
                  halign: 'center'
                },
                headStyles: {
                  fillColor: [240, 240, 240],
                  textColor: [0, 0, 0],
                  fontStyle: 'bold',
                  halign: 'center'
                },
                alternateRowStyles: {
                  fillColor: [245, 245, 245]
                },
                tableWidth: pageWidth - (margin * 2),
                theme: 'grid',
                columnStyles: {
                  0: { halign: 'left' } // Align first column to left
                }
              });

              yOffset = doc.lastAutoTable.finalY + 20;
            } catch (tableError) {
              console.error(`Error processing table ${tableId}:`, tableError);
              continue; // Skip to next table if there's an error
            }
          }
        }

        firstPage = false;
      }

      // Save the PDF
      doc.save(`DSR_Report_${selectedDate}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please check console for details.');
    }
  };

  return (
    <div className="max-w-[95%] mx-auto px-4 py-8">
      {/* Header Controls */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                // NCRP, SCCIC, and DSR departments can go back to dashboard
                // All other departments (MOA, CEIR, JMIS, Cyber arangam, Sim & Content Blocking, Helpline Center) go back to login
                if (normalizedUserType === 'DSR' || normalizedUserType === 'NCRP' || normalizedUserType === 'SCCIC') {
                  router.push('/dsr-dashboard');
                } else {
                  router.push('/');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {normalizedUserType === 'DSR' || normalizedUserType === 'NCRP' || normalizedUserType === 'SCCIC' ? 'Back to Dashboard' : 'Back'}
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="px-3 py-2 border rounded-md"
            />
            <button
              onClick={() => {
                if (editMode) {
                  handleSave();
                } else {
                  setEditMode(true);
                }
              }}
              className={`px-4 py-2 rounded-md ${
                editMode 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {editMode ? 'Save Changes' : 'Edit Tables'}
            </button>
          </div>
        </div>

        {/* Export Controls */}
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleSelectAll(true)}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Select All
            </button>
            <button
              onClick={() => handleSelectAll(false)}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Deselect All
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={exportToWord}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Export as Excel
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Export as PDF
            </button>
          </div>
        </div>
      </div>

      {/* User Access Information */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Access Information</h3>
        <p className="text-blue-700">
          <strong>Department:</strong> {normalizedUserType} | 
          <strong>Available Tables:</strong> {visibleTableIds.length > 0 ? visibleTableIds.join(', ') : 'None'} | 
          <strong>Total Tables:</strong> {visibleTableIds.length} of 21
        </p>
      </div>

      {/* Tables Section */}
      <div className="space-y-8">
        {visibleTableIds.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Tables Available</h3>
            <p className="text-gray-500">No report tables are available for your department ({normalizedUserType}).</p>
            <p className="text-sm text-gray-400 mt-2">Contact your administrator if you believe this is an error.</p>
          </div>
        ) : (
          TABLES.filter(table => visibleTableIds.includes(table.id)).map((table) => (
            <div key={table.id} className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-4 border-b bg-gray-50 flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedTables[table.id] || false}
                  onChange={() => handleTableSelection(table.id)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">Table {table.id}: {table.title}</h2>
                  <p className="text-sm text-gray-600 mt-1">{getTableDefinition(table.id)?.description || 'DSR Table'}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                  Table {table.id}
                </span>
              </div>
              <div className="p-4" data-table-id={table.id}>
                {renderTable(table.id)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}