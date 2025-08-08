import { useState } from "react";

const initialData = [
  { label: "Complaints", onDate: { fin: 0, nonFin: 0 }, fromDate: { fin: 0, nonFin: 0 }, data2024: { fin: 0, nonFin: 0 } },
  { label: "FIR Registered", onDate: { fin: 0, nonFin: 0 }, fromDate: { fin: 0, nonFin: 0 }, data2024: { fin: 0, nonFin: 0 } },
  { label: "CSR Issued", onDate: { fin: 0, nonFin: 0 }, fromDate: { fin: 0, nonFin: 0 }, data2024: { fin: 0, nonFin: 0 } },
];

export default function Report1_ComplaintsNCRPCCPS({ editMode, onDate, setOnDate, tableData, setTableData }) {
  // No internal tableData state; use props
  const handleInputChange = (rowIdx, section, type, value) => {
    const updated = [...tableData];
    updated[rowIdx][section][type] = value;
    setTableData(updated);
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      {/* Remove the calendar input from here, only render the table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-50 rounded-lg border text-center">
          <thead className="bg-gray-100">
            <tr>
              <th rowSpan={3} className="px-4 py-2 border align-middle">Financial and Non<br/>financial Cyber<br/>Frauds</th>
              <th colSpan={3} className="px-4 py-2 border">On 19.06.25</th>
              <th colSpan={3} className="px-4 py-2 border">From 01.01.25 To till Date</th>
              <th colSpan={3} className="px-4 py-2 border">Data of 2024</th>
            </tr>
            <tr>
              <th colSpan={2} className="border"> </th>
              <th className="border">Total</th>
              <th colSpan={2} className="border"> </th>
              <th className="border">Total</th>
              <th colSpan={2} className="border"> </th>
              <th className="border">Total</th>
            </tr>
            <tr>
              <th className="border">Fin</th>
              <th className="border">Non-Fin</th>
              <th className="border">Total</th>
              <th className="border">Fin</th>
              <th className="border">Non-Fin</th>
              <th className="border">Total</th>
              <th className="border">Fin</th>
              <th className="border">Non-Fin</th>
              <th className="border">Total</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIdx) => (
              <tr key={row.label}>
                <td className="px-4 py-2 border font-medium text-gray-700 bg-gray-50 text-left">{row.label}</td>
                {/* On Date */}
                <td className="px-2 py-2 border">{editMode ? <input type="number" value={row.onDate.fin} onChange={e => handleInputChange(rowIdx, 'onDate', 'fin', e.target.value)} className="w-16 px-2 py-1 border rounded" /> : row.onDate.fin}</td>
                <td className="px-2 py-2 border">{editMode ? <input type="number" value={row.onDate.nonFin} onChange={e => handleInputChange(rowIdx, 'onDate', 'nonFin', e.target.value)} className="w-16 px-2 py-1 border rounded" /> : row.onDate.nonFin}</td>
                <td className="px-2 py-2 border bg-gray-100">{Number(row.onDate.fin) + Number(row.onDate.nonFin)}</td>
                {/* From Date */}
                <td className="px-2 py-2 border">{editMode ? <input type="number" value={row.fromDate.fin} onChange={e => handleInputChange(rowIdx, 'fromDate', 'fin', e.target.value)} className="w-16 px-2 py-1 border rounded" /> : row.fromDate.fin}</td>
                <td className="px-2 py-2 border">{editMode ? <input type="number" value={row.fromDate.nonFin} onChange={e => handleInputChange(rowIdx, 'fromDate', 'nonFin', e.target.value)} className="w-16 px-2 py-1 border rounded" /> : row.fromDate.nonFin}</td>
                <td className="px-2 py-2 border bg-gray-100">{Number(row.fromDate.fin) + Number(row.fromDate.nonFin)}</td>
                {/* Data 2024 */}
                <td className="px-2 py-2 border">{editMode ? <input type="number" value={row.data2024.fin} onChange={e => handleInputChange(rowIdx, 'data2024', 'fin', e.target.value)} className="w-16 px-2 py-1 border rounded" /> : row.data2024.fin}</td>
                <td className="px-2 py-2 border">{editMode ? <input type="number" value={row.data2024.nonFin} onChange={e => handleInputChange(rowIdx, 'data2024', 'nonFin', e.target.value)} className="w-16 px-2 py-1 border rounded" /> : row.data2024.nonFin}</td>
                <td className="px-2 py-2 border bg-gray-100">{Number(row.data2024.fin) + Number(row.data2024.nonFin)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 