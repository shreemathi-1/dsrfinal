"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveDSRStages, loadDSRStages } from "../../../lib/dsrDatabase";

export default function DSRStagesPage() {
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

  const [stagesData, setStagesData] = useState({
    onDate: {
      totalComplaints: 0,
      ui: 0,
      pt: 0,
      disposal: 0,
    },
    fromDate: {
      totalComplaints: 0,
      ui: 0,
      pt: 0,
      disposal: 0,
    },
  });

  // Load data when component mounts or dates change
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadDSRStages(dsrDates.reportDate);
        setStagesData(data);
      } catch (error) {
        console.error("Error loading stages data:", error);
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

  const handleStagesInputChange = (section, field, value) => {
    const newData = { ...stagesData };
    newData[section][field] = parseInt(value) || 0;
    setStagesData(newData);
  };

  const saveStagesData = async () => {
    try {
      await saveDSRStages(stagesData, dsrDates.reportDate, dsrDates.fromDate);
      setEditingDSR(false);
      alert("Data saved successfully!");
    } catch (error) {
      console.error("Error saving Stages data:", error);
      alert("Error saving data. Please try again.");
    }
  };

  const clearAllStagesData = () => {
    setStagesData({
      onDate: {
        totalComplaints: 0,
        ui: 0,
        pt: 0,
        disposal: 0,
      },
      fromDate: {
        totalComplaints: 0,
        ui: 0,
        pt: 0,
        disposal: 0,
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
                  DSR Stages Table
                </h1>
                <p className="text-sm text-gray-600">Stages of cases</p>
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
                    onClick={saveStagesData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Data
                  </button>
                  <button
                    onClick={clearAllStagesData}
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
                    onClick={saveStagesData}
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
                        value={stagesData.onDate.totalComplaints}
                        onChange={(e) =>
                          handleStagesInputChange(
                            "onDate",
                            "totalComplaints",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <span className="text-sm">
                        {stagesData.onDate.totalComplaints}
                      </span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    {editingDSR ? (
                      <input
                        type="number"
                        className="w-full text-center border-0 focus:ring-0"
                        value={stagesData.onDate.ui}
                        onChange={(e) =>
                          handleStagesInputChange(
                            "onDate",
                            "ui",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <span className="text-sm">{stagesData.onDate.ui}</span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    {editingDSR ? (
                      <input
                        type="number"
                        className="w-full text-center border-0 focus:ring-0"
                        value={stagesData.onDate.pt}
                        onChange={(e) =>
                          handleStagesInputChange(
                            "onDate",
                            "pt",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <span className="text-sm">{stagesData.onDate.pt}</span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    {editingDSR ? (
                      <input
                        type="number"
                        className="w-full text-center border-0 focus:ring-0"
                        value={stagesData.onDate.disposal}
                        onChange={(e) =>
                          handleStagesInputChange(
                            "onDate",
                            "disposal",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <span className="text-sm">
                        {stagesData.onDate.disposal}
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900">
                    From {formatDate(dsrDates.fromDate)} to till Date
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    {editingDSR ? (
                      <input
                        type="number"
                        className="w-full text-center border-0 focus:ring-0"
                        value={stagesData.fromDate.totalComplaints}
                        onChange={(e) =>
                          handleStagesInputChange(
                            "fromDate",
                            "totalComplaints",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <span className="text-sm">
                        {stagesData.fromDate.totalComplaints}
                      </span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    {editingDSR ? (
                      <input
                        type="number"
                        className="w-full text-center border-0 focus:ring-0"
                        value={stagesData.fromDate.ui}
                        onChange={(e) =>
                          handleStagesInputChange(
                            "fromDate",
                            "ui",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <span className="text-sm">{stagesData.fromDate.ui}</span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    {editingDSR ? (
                      <input
                        type="number"
                        className="w-full text-center border-0 focus:ring-0"
                        value={stagesData.fromDate.pt}
                        onChange={(e) =>
                          handleStagesInputChange(
                            "fromDate",
                            "pt",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <span className="text-sm">{stagesData.fromDate.pt}</span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    {editingDSR ? (
                      <input
                        type="number"
                        className="w-full text-center border-0 focus:ring-0"
                        value={stagesData.fromDate.disposal}
                        onChange={(e) =>
                          handleStagesInputChange(
                            "fromDate",
                            "disposal",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <span className="text-sm">
                        {stagesData.fromDate.disposal}
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
