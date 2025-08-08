import { useState, useEffect } from 'react';
import { getCCPSDataForDSRTable1 } from '../../../../lib/ccpsTable1Utils';

const Table1_ComplaintsNCRPCCPS = ({ date, editMode, data, onDataChange }) => {
  const [tableData, setTableData] = useState({
    complaints: {
      onDate: { fin: 0, nonFin: 0, total: 0 },
      fromDate: { fin: 0, nonFin: 0, total: 0 },
      data2024: { fin: 0, nonFin: 0, total: 0 }
    },
    firRegistered: {
      onDate: { fin: 0, nonFin: 0, total: 0 },
      fromDate: { fin: 0, nonFin: 0, total: 0 },
      data2024: { fin: 0, nonFin: 0, total: 0 }
    },
    csrIssued: {
      onDate: { fin: 0, nonFin: 0, total: 0 },
      fromDate: { fin: 0, nonFin: 0, total: 0 },
      data2024: { fin: 0, nonFin: 0, total: 0 }
    }
  });

  // Load data from props
  useEffect(() => {
    if (data) {
      setTableData(data);
    }
  }, [data]);

  // Integrate CCPS Table 1 data
  useEffect(() => {
    if (date) {
      const ccpsData = getCCPSDataForDSRTable1(date);
      
      // Merge CCPS data with existing manual data, preserving manual entries for data2024
      const mergedData = {
        complaints: {
          onDate: ccpsData.complaints.onDate, // Auto-populated from CCPS
          fromDate: ccpsData.complaints.fromDate, // Auto-populated from CCPS
          data2024: tableData.complaints.data2024 // Keep manual entries
        },
        firRegistered: {
          onDate: ccpsData.firRegistered.onDate, // Auto-populated from CCPS
          fromDate: ccpsData.firRegistered.fromDate, // Auto-populated from CCPS
          data2024: tableData.firRegistered.data2024 // Keep manual entries
        },
        csrIssued: {
          onDate: ccpsData.csrIssued.onDate, // Auto-populated from CCPS
          fromDate: ccpsData.csrIssued.fromDate, // Auto-populated from CCPS
          data2024: tableData.csrIssued.data2024 // Keep manual entries
        }
      };
      
      setTableData(mergedData);
      
      if (onDataChange) {
        onDataChange(mergedData);
      }
    }
  }, [date]);

  const handleChange = (row, period, field, value) => {
    // Only allow editing of data2024 period
    if (period !== 'data2024') {
      console.log('Cannot edit auto-populated columns (onDate and fromDate)');
      return;
    }

    const newValue = value === '' ? 0 : Number(value);
    const newData = {
      ...tableData,
      [row]: {
        ...tableData[row],
        [period]: {
          ...tableData[row][period],
          [field]: newValue,
          total: field === 'fin' ? newValue + tableData[row][period].nonFin : 
                 field === 'nonFin' ? tableData[row][period].fin + newValue :
                 tableData[row][period].fin + tableData[row][period].nonFin
        }
      }
    };
    
    setTableData(newData);
    
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  // Render an editable cell with visual indicators for auto-populated columns
  const EditableCell = ({ value, onChange, isReadOnly = false, period }) => {
    const isAutoPopulated = period === 'onDate' || period === 'fromDate';
    
    if (isReadOnly || isAutoPopulated) {
      const tooltipText = period === 'onDate' ? 'Auto-populated from CCPS Table 1 (selected date)' :
                         period === 'fromDate' ? 'Auto-populated from CCPS Table 1 (cumulative from 01.01.25)' :
                         'Manual entry';
      
      return (
        <span 
          className={isAutoPopulated ? "text-blue-600 font-medium" : ""}
          title={tooltipText}
        >
          {value}
        </span>
      );
    }

    return editMode ? (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 text-center border rounded"
        min="0"
        title="Manual entry"
      />
    ) : (
      <span title="Manual entry">{value}</span>
    );
  };

  // Removed loading and error states - using localStorage only

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-blue-100">
            <th className="border border-gray-300 px-2 py-2" rowSpan="3">Financial and Non financial Cyber Frauds</th>
            <th className="border border-gray-300 px-2 py-2" colSpan="3">On {date ? new Date(date).toLocaleDateString('en-GB') : '19.06.25'}</th>
            <th className="border border-gray-300 px-2 py-2" colSpan="3">From 01.01.25 To till Date</th>
            <th className="border border-gray-300 px-2 py-2" colSpan="3">Data of 2024</th>
          </tr>
          <tr className="bg-blue-50">
            <th className="border border-gray-300 px-2 py-1">Fin</th>
            <th className="border border-gray-300 px-2 py-1">Non-Fin</th>
            <th className="border border-gray-300 px-2 py-1">Total</th>
            <th className="border border-gray-300 px-2 py-1">Fin</th>
            <th className="border border-gray-300 px-2 py-1">Non-Fin</th>
            <th className="border border-gray-300 px-2 py-1">Total</th>
            <th className="border border-gray-300 px-2 py-1">Fin</th>
            <th className="border border-gray-300 px-2 py-1">Non-Fin</th>
            <th className="border border-gray-300 px-2 py-1">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white">
            <td className="border border-gray-300 px-2 py-2 font-medium">Complaints</td>
            <td className="border border-gray-300 px-2 py-2 text-center">
              <EditableCell
                value={tableData.complaints.onDate.fin}
                onChange={(value) => handleChange('complaints', 'onDate', 'fin', value)}
                period="onDate"
              />
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center">
              <EditableCell
                value={tableData.complaints.onDate.nonFin}
                onChange={(value) => handleChange('complaints', 'onDate', 'nonFin', value)}
                period="onDate"
              />
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center bg-gray-100">
              <span className="font-medium">{tableData.complaints.onDate.total}</span>
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center">
              <EditableCell
                value={tableData.complaints.fromDate.fin}
                onChange={(value) => handleChange('complaints', 'fromDate', 'fin', value)}
                period="fromDate"
              />
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center">
              <EditableCell
                value={tableData.complaints.fromDate.nonFin}
                onChange={(value) => handleChange('complaints', 'fromDate', 'nonFin', value)}
                period="fromDate"
              />
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center bg-gray-100">
              <span className="font-medium">{tableData.complaints.fromDate.total}</span>
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center">
              <EditableCell
                value={tableData.complaints.data2024.fin}
                onChange={(value) => handleChange('complaints', 'data2024', 'fin', value)}
                period="data2024"
              />
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center">
              <EditableCell
                value={tableData.complaints.data2024.nonFin}
                onChange={(value) => handleChange('complaints', 'data2024', 'nonFin', value)}
                period="data2024"
              />
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center bg-gray-100">
              <span className="font-medium">{tableData.complaints.data2024.total}</span>
            </td>
          </tr>
          <tr className="bg-gray-50">
            <td className="border border-gray-300 px-2 py-2 font-medium">FIR Registered</td>
            <td className="border border-gray-300 px-2 py-2 text-center">
              <EditableCell
                value={tableData.firRegistered.onDate.fin}
                onChange={(value) => handleChange('firRegistered', 'onDate', 'fin', value)}
                period="onDate"
              />
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center">
              <EditableCell
                value={tableData.firRegistered.onDate.nonFin}
                onChange={(value) => handleChange('firRegistered', 'onDate', 'nonFin', value)}
                period="onDate"
              />
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center bg-gray-100">
              <span className="font-medium">{tableData.firRegistered.onDate.total}</span>
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center">
              <EditableCell
                value={tableData.firRegistered.fromDate.fin}
                onChange={(value) => handleChange('firRegistered', 'fromDate', 'fin', value)}
                period="fromDate"
              />
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center">
              <EditableCell
                value={tableData.firRegistered.fromDate.nonFin}
                onChange={(value) => handleChange('firRegistered', 'fromDate', 'nonFin', value)}
                period="fromDate"
              />
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center bg-gray-100">
              <span className="font-medium">{tableData.firRegistered.fromDate.total}</span>
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center">
              <EditableCell
                value={tableData.firRegistered.data2024.fin}
                onChange={(value) => handleChange('firRegistered', 'data2024', 'fin', value)}
                period="data2024"
              />
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center">
              <EditableCell
                value={tableData.firRegistered.data2024.nonFin}
                onChange={(value) => handleChange('firRegistered', 'data2024', 'nonFin', value)}
                period="data2024"
              />
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center bg-gray-100">
              <span className="font-medium">{tableData.firRegistered.data2024.total}</span>
            </td>
          </tr>
          <tr className="bg-white">
            <td className="border border-gray-300 px-2 py-2 font-medium">CSR Issued</td>
            <td className="border border-gray-300 px-2 py-2 text-center">
              <EditableCell
                value={tableData.csrIssued.onDate.fin}
                onChange={(value) => handleChange('csrIssued', 'onDate', 'fin', value)}
                period="onDate"
              />
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center">
              <EditableCell
                value={tableData.csrIssued.onDate.nonFin}
                onChange={(value) => handleChange('csrIssued', 'onDate', 'nonFin', value)}
                period="onDate"
              />
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center bg-gray-100">
              <span className="font-medium">{tableData.csrIssued.onDate.total}</span>
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center">
              <EditableCell
                value={tableData.csrIssued.fromDate.fin}
                onChange={(value) => handleChange('csrIssued', 'fromDate', 'fin', value)}
                period="fromDate"
              />
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center">
              <EditableCell
                value={tableData.csrIssued.fromDate.nonFin}
                onChange={(value) => handleChange('csrIssued', 'fromDate', 'nonFin', value)}
                period="fromDate"
              />
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center bg-gray-100">
              <span className="font-medium">{tableData.csrIssued.fromDate.total}</span>
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center">
              <EditableCell
                value={tableData.csrIssued.data2024.fin}
                onChange={(value) => handleChange('csrIssued', 'data2024', 'fin', value)}
                period="data2024"
              />
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center">
              <EditableCell
                value={tableData.csrIssued.data2024.nonFin}
                onChange={(value) => handleChange('csrIssued', 'data2024', 'nonFin', value)}
                period="data2024"
              />
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center bg-gray-100">
              <span className="font-medium">{tableData.csrIssued.data2024.total}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Table1_ComplaintsNCRPCCPS; 