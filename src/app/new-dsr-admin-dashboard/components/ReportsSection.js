'use client';

import { useState } from 'react';

const dsrTables = [
  'Complaints Table',
  'Stages Table',
  'Amount Table',
  'Frozen Table',
  'Returned Table',
  'Seized Table',
  'Confiscated Table',
  'FIR Table',
  'CSR Table',
  'Victim Table',
  'Suspect Table',
  'Bank Table',
  'UPI Table',
  'Card Table',
  'Social Media Table',
  'Email Table',
  'Loan App Table',
  'Investment Table',
  'Trading Table',
  'Ransomware Table',
  'Phishing Table'
];

export default function ReportsSection({ onGenerateReport }) {
  const [search, setSearch] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);

  const filteredTables = dsrTables.filter((table) =>
    table.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">DSR Reports</h2>
        <input
          type="text"
          placeholder="Filter tables..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-md text-sm"
        />
      </div>
      {selectedTable ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{selectedTable}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedTable(null)}
                className="px-3 py-1 bg-gray-200 rounded text-sm"
              >
                Back
              </button>
              <button
                className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                onClick={() => {/* TODO: implement export to excel */}}
              >
                Export to Excel
              </button>
            </div>
          </div>
          {/* Table view/edit UI placeholder */}
          <div className="mb-4 flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">View</button>
            <button className="px-4 py-2 bg-orange-600 text-white rounded">Edit</button>
          </div>
          <div className="border rounded p-4 bg-gray-50 text-gray-500 text-sm">
            Table data for <b>{selectedTable}</b> will be displayed here.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTables.map((table) => (
            <div
              key={table}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm cursor-pointer hover:shadow-md transition"
              onClick={() => setSelectedTable(table)}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">{table}</h3>
              <span className="text-sm text-gray-600">Click to view and edit</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
