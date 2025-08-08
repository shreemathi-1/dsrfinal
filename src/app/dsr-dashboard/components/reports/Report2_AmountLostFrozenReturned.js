import { useState } from "react";

const rows = [
  "Total Amount Lost (in Rs)",
  "Total Amount Frozen (in Rs)",
  "Total Amount Returned (in Rs)",
  "No of Accused Arrested",
  "No of Persons detained under Act 14 of 1982",
  "No of Loan App Complaints",
  "No of FIR in Loan App Cases",
  "No of CSR in Loan App Cases"
];

export default function Report2_AmountLostFrozenReturned() {
  const [onDate, setOnDate] = useState(new Date().toISOString().split("T")[0]);
  const [editMode, setEditMode] = useState(false);
  const [tableData, setTableData] = useState(
    rows.map(label => ({ label, onDate: 0, fromDate: 0, data2024: 0 }))
  );

  const handleExport = () => {
    // TODO: Implement export as Excel
    alert("Export as Excel coming soon!");
  };

  const handleInputChange = (idx, field, value) => {
    const updated = [...tableData];
    updated[idx][field] = value;
    setTableData(updated);
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center gap-4 mb-4">
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
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-50 rounded-lg border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Category</th>
              <th className="px-4 py-2 border">On Date</th>
              <th className="px-4 py-2 border">From 01.01.25 To till Date</th>
              <th className="px-4 py-2 border">Data of 2024</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr key={row.label}>
                <td className="px-4 py-2 border font-medium text-gray-700 bg-gray-50">{row.label}</td>
                <td className="px-4 py-2 border">
                  {editMode ? (
                    <input
                      type="number"
                      value={row.onDate}
                      onChange={e => handleInputChange(idx, "onDate", e.target.value)}
                      className="w-24 px-2 py-1 border rounded"
                    />
                  ) : (
                    row.onDate
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {editMode ? (
                    <input
                      type="number"
                      value={row.fromDate}
                      onChange={e => handleInputChange(idx, "fromDate", e.target.value)}
                      className="w-24 px-2 py-1 border rounded"
                    />
                  ) : (
                    row.fromDate
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {editMode ? (
                    <input
                      type="number"
                      value={row.data2024}
                      onChange={e => handleInputChange(idx, "data2024", e.target.value)}
                      className="w-24 px-2 py-1 border rounded"
                    />
                  ) : (
                    row.data2024
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 