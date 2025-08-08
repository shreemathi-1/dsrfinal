"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveDSRComplaints, loadDSRComplaints } from "../../../lib/dsrDatabase";

export default function DSRComplaintsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("fill");

  // Get tab from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam && ["fill", "view", "update"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);
  const [editingDSR, setEditingDSR] = useState(false);

  // Set editing mode based on active tab
  useEffect(() => {
    if (activeTab === "fill" || activeTab === "update") {
      setEditingDSR(true);
    } else {
      setEditingDSR(false);
    }
  }, [activeTab]);
  const [dsrDates, setDsrDates] = useState({
    reportDate: new Date().toISOString().split("T")[0],
    fromDate: new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split("T")[0],
    fromDateCases: new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split("T")[0],
  });

  const [complaintsData, setComplaintsData] = useState({
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
  });

  // Load data when component mounts or dates change
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadDSRComplaints(dsrDates.reportDate);
        setComplaintsData(data);
      } catch (error) {
        console.error("Error loading complaints data:", error);
        // Keep default data if loading fails
      }
    };

    loadData();
  }, [dsrDates.reportDate]);

  const handleDateChange = (dateType, value) => {
    setDsrDates((prev) => ({
      ...prev,
      [dateType]: value,
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleComplaintsInputChange = (section, fieldPath, value) => {
    const newData = { ...complaintsData };
    if (section === "financial" || section === "nonFinancial") {
      const [period, field] = fieldPath.split(".");
      newData[section][period][field] = parseInt(value) || 0;
    }
    setComplaintsData(newData);
  };

  const saveComplaintsData = async () => {
    try {
      await saveDSRComplaints(
        complaintsData,
        dsrDates.reportDate,
        dsrDates.fromDate
      );
      setEditingDSR(false);
      alert("Data saved successfully!");
    } catch (error) {
      console.error("Error saving Complaints data:", error);
      alert("Error saving data. Please try again.");
    }
  };

  const clearAllComplaintsData = () => {
    setComplaintsData({
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
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 transition-colors"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  DSR Complaints Table
                </h1>
                <p className="text-sm text-gray-600">
                  Complaints registered through NCRP and Complaints received by
                  CCPS
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              {activeTab === "view" ? (
                <>
                  <button
                    onClick={() => setActiveTab("fill")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Switch to Fill Mode
                  </button>
                  <button
                    onClick={() => setActiveTab("update")}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    Switch to Update Mode
                  </button>
                </>
              ) : activeTab === "fill" ? (
                <>
                  <button
                    onClick={() => setActiveTab("view")}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    View Mode
                  </button>
                  <button
                    onClick={saveComplaintsData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Data
                  </button>
                  <button
                    onClick={clearAllComplaintsData}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Clear All
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab("view")}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    View Mode
                  </button>
                  <button
                    onClick={() => setActiveTab("fill")}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Fill Mode
                  </button>
                  <button
                    onClick={saveComplaintsData}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    Update Data
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {["fill", "view", "update"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Date Selection Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Date
              </label>
              <input
                type="date"
                value={dsrDates.reportDate}
                onChange={(e) => handleDateChange("reportDate", e.target.value)}
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
                onChange={(e) => handleDateChange("fromDate", e.target.value)}
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

          <p className="text-gray-600 mt-4">
            Daily Situation Report as on{" "}
            <span className="font-semibold">
              {formatDate(dsrDates.reportDate)}
            </span>
          </p>
        </div>

        {/* Table Content */}
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
                      complaintsData.financial.onDate[field] +
                      complaintsData.nonFinancial.onDate[field];
                    const fromDateTotal =
                      complaintsData.financial.fromDate[field] +
                      complaintsData.nonFinancial.fromDate[field];
                    const data2024Total =
                      complaintsData.financial.data2024[field] +
                      complaintsData.nonFinancial.data2024[field];

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
                              value={complaintsData.financial.onDate[field]}
                              onChange={(e) =>
                                handleComplaintsInputChange(
                                  "financial",
                                  `onDate.${field}`,
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <span className="text-sm">
                              {complaintsData.financial.onDate[field]}
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center">
                          {editingDSR ? (
                            <input
                              type="number"
                              className="w-full text-center border-0 focus:ring-0"
                              value={complaintsData.nonFinancial.onDate[field]}
                              onChange={(e) =>
                                handleComplaintsInputChange(
                                  "nonFinancial",
                                  `onDate.${field}`,
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <span className="text-sm">
                              {complaintsData.nonFinancial.onDate[field]}
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
                              value={complaintsData.financial.fromDate[field]}
                              onChange={(e) =>
                                handleComplaintsInputChange(
                                  "financial",
                                  `fromDate.${field}`,
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <span className="text-sm">
                              {complaintsData.financial.fromDate[field]}
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center">
                          {editingDSR ? (
                            <input
                              type="number"
                              className="w-full text-center border-0 focus:ring-0"
                              value={
                                complaintsData.nonFinancial.fromDate[field]
                              }
                              onChange={(e) =>
                                handleComplaintsInputChange(
                                  "nonFinancial",
                                  `fromDate.${field}`,
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <span className="text-sm">
                              {complaintsData.nonFinancial.fromDate[field]}
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
                              value={complaintsData.financial.data2024[field]}
                              onChange={(e) =>
                                handleComplaintsInputChange(
                                  "financial",
                                  `data2024.${field}`,
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <span className="text-sm">
                              {complaintsData.financial.data2024[field]}
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center">
                          {editingDSR ? (
                            <input
                              type="number"
                              className="w-full text-center border-0 focus:ring-0"
                              value={
                                complaintsData.nonFinancial.data2024[field]
                              }
                              onChange={(e) =>
                                handleComplaintsInputChange(
                                  "nonFinancial",
                                  `data2024.${field}`,
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <span className="text-sm">
                              {complaintsData.nonFinancial.data2024[field]}
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
      </main>
    </div>
  );
}
