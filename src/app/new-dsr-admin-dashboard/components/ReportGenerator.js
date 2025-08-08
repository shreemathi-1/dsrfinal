"use client";

import React, { useState, useEffect } from 'react';

export default function ReportGenerator({ reportType, onClose }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tableData, setTableData] = useState(null);

  // Helper to format date as DD.MM.YY
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear().toString().slice(-2)}`;
  };

  // Calculate previous date and previous year
  const getPrevDate = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };
  const getPrevYear = (dateStr) => {
    const date = new Date(dateStr);
    return date.getFullYear() - 1;
  };
  const getStartOfYear = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-01-01`;
  };

  // Fetch table data for selected date
  useEffect(() => {
    async function fetchData() {
      // Example API call, replace with your actual API
      // /api/dsr-data?reportDate=selectedDate
      // Should return: { prevDateData, fromStartToPrevDateData, prevYearData }
      // For now, use dummy data
      setTableData({
        prevDateData: {},
        fromStartToPrevDateData: {},
        prevYearData: {}
      });
    }
    fetchData();
  }, [selectedDate]);

  // Render table with new columns
  const renderTable = () => {
    // Example for one table, repeat for all tables
    return (
      <div className="space-y-6">
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mr-2">On Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 border">On {formatDate(getPrevDate(selectedDate))}</th>
                <th className="px-4 py-2 border">From {formatDate(getStartOfYear(selectedDate))} to {formatDate(getPrevDate(selectedDate))}</th>
                <th className="px-4 py-2 border">Data of {getPrevYear(selectedDate)}</th>
              </tr>
            </thead>
            <tbody>
              {/* Render rows using tableData */}
              <tr>
                <td className="px-4 py-2 border">{/* prevDateData */}</td>
                <td className="px-4 py-2 border">{/* fromStartToPrevDateData */}</td>
                <td className="px-4 py-2 border">{/* prevYearData */}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{reportType.title}</h2>
          <p className="text-gray-600 mt-1">{reportType.description}</p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Reports
        </button>
      </div>

      {/* Table Content */}
      <div className="mt-6">
        {renderTable()}
      </div>
    </div>
  );
}