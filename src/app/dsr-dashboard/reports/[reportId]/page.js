"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Report1_ComplaintsNCRPCCPS from "../../components/reports/Report1_ComplaintsNCRPCCPS";
import Report2_AmountLostFrozenReturned from "../../components/reports/Report2_AmountLostFrozenReturned";
import Report3_StagesOfCases from "../../components/reports/Report3_StagesOfCases";
import * as XLSX from "xlsx";
// TODO: Import other report components as you create them

const reportComponents = [
  Report1_ComplaintsNCRPCCPS,
  Report2_AmountLostFrozenReturned,
  Report3_StagesOfCases,
  // Report2_AmountLostFrozenReturned, ...
];

const reportTitles = [
  "Complaints registered through NCRP and CCPS",
  "Amount Lost, Frozen, Returned etc. in CCPS",
  "Stages of cases",
  "NCRP Complaints status",
  "CCTNS Complaints status",
  "NEW MO/Trending MO Reported",
  "Details of Complaints received through helpline 1930",
  "Cases where amount lost is 1 Lakh and above (1930 Complaints)",
  "Cases where amount lost is 50 Lakh and above (1930 Complaints)",
  "Blocking requests sent to MeiTY and complied",
  "SIM Blocking",
  "Content Blocking",
  "Details of Central Equipment Identity Register (CEIR)",
  "Interstate and Intrastate Linkage Cases",
  "Details of Cyber Crime Investigation Assistance Request (CIAR)",
  "Investigation of cases at CCW headquarters",
  "Awareness Conducted",
  "Cyber Volunteers",
  "Posts uploaded in Social Media",
  "Trainings Conducted",
  "Districts/cities CCPS Duty & Leave Details"
];

export default function ReportTablePage() {
  const params = useParams();
  const router = useRouter();
  const reportId = parseInt(params.reportId, 10) || 1;
  const title = reportTitles[reportId - 1] || "Report";
  const [onDate, setOnDate] = useState(new Date().toISOString().split("T")[0]);
  const [editMode, setEditMode] = useState(false);

  // Placeholder for table data
  const [tableData, setTableData] = useState([
    { label: "Complaints", onDate: { fin: 0, nonFin: 0 }, fromDate: { fin: 0, nonFin: 0 }, data2024: { fin: 0, nonFin: 0 } },
    { label: "FIR Registered", onDate: { fin: 0, nonFin: 0 }, fromDate: { fin: 0, nonFin: 0 }, data2024: { fin: 0, nonFin: 0 } },
    { label: "CSR Issued", onDate: { fin: 0, nonFin: 0 }, fromDate: { fin: 0, nonFin: 0 }, data2024: { fin: 0, nonFin: 0 } },
  ]);

  // Placeholder for export functionality
  const handleExport = () => {
    // Only implement for the first table for now
    if (reportId === 1) {
      const wsData = [
        [
          "Financial and Non financial Cyber Frauds",
          "On 19.06.25", "", "",
          "From 01.01.25 To till Date", "", "",
          "Data of 2024", "", ""
        ],
        [
          "",
          "Fin", "Non-Fin", "Total",
          "Fin", "Non-Fin", "Total",
          "Fin", "Non-Fin", "Total"
        ],
        ...tableData.map(row => [
          row.label,
          row.onDate.fin, row.onDate.nonFin, Number(row.onDate.fin) + Number(row.onDate.nonFin),
          row.fromDate.fin, row.fromDate.nonFin, Number(row.fromDate.fin) + Number(row.fromDate.nonFin),
          row.data2024.fin, row.data2024.nonFin, Number(row.data2024.fin) + Number(row.data2024.nonFin)
        ])
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Complaints NCRP CCPS");
      XLSX.writeFile(wb, `Complaints_NCRP_CCPS_${onDate}.xlsx`);
    } else {
      alert("Export as Excel coming soon!");
    }
  };

  const ReportComponent = reportComponents[reportId - 1];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <button
          onClick={() => router.back()}
          className="px-3 py-1 bg-gray-200 rounded text-sm"
        >
          Back
        </button>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <label className="text-sm font-medium text-gray-700">On Date:</label>
        <input
          type="date"
          value={onDate}
          onChange={e => setOnDate(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setEditMode(false)}
        >
          View
        </button>
        <button
          className="px-4 py-2 bg-orange-600 text-white rounded"
          onClick={() => setEditMode(true)}
        >
          Edit
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={handleExport}
        >
          Export as Excel
        </button>
      </div>
      {ReportComponent ? (
        <ReportComponent
          editMode={editMode}
          onDate={onDate}
          setOnDate={setOnDate}
          tableData={tableData}
          setTableData={setTableData}
        />
      ) : (
        <div className="border rounded p-4 bg-gray-50 text-gray-500 text-sm">
          Table for <b>{title}</b> will be displayed here.<br />
          [Component not implemented yet]
        </div>
      )}
    </div>
  );
} 