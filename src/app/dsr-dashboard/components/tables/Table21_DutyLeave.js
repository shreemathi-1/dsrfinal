import { useState, useEffect } from 'react';
import { getCCPSAllDutyLeaveGrandTotals, getReportDate } from '@/lib/ccpsDataUtils';

const Table21_DutyLeave = ({ date = '19.06.25', editMode = false, data, onDataChange }) => {
  // Initialize table data structure
  const [tableData, setTableData] = useState({
    particulars: [
      { id: 1, name: 'B/D Duty', adsp: 0, ins: 0, si: 0, others: 0 },
      { id: 2, name: 'CL', adsp: 0, ins: 0, si: 0, others: 0 },
      { id: 3, name: 'ML/EL/MTL', adsp: 0, ins: 0, si: 0, others: 0 },
      { id: 4, name: 'OD', adsp: 0, ins: 0, si: 0, others: 0 }
    ]
  });

  // Use data from props (localStorage) and integrate with CCPS data
  useEffect(() => {
    // Handle different date formats from DSR reports
    let currentDate;
    if (typeof date === 'string') {
      // Check if it's YYYY-MM-DD format (from DSR reports)
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        currentDate = date; // Use string directly for CCPS utility
        console.log('Table 21: Using YYYY-MM-DD date format:', currentDate);
      } else {
        // Convert date string like '19.06.25' to proper Date
        const parts = date.split('.');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // Month is 0-indexed
          const year = 2000 + parseInt(parts[2]); // Assuming 2000s
          currentDate = new Date(year, month, day);
        } else {
          currentDate = new Date();
        }
      }
    } else {
      currentDate = date || new Date();
    }

    // Get CCPS all duty and leave grand totals
    // For DSR Table 21, use the actual selected date, not yesterday's date
    const ccpsAllTotals = getCCPSAllDutyLeaveGrandTotals(currentDate);
    console.log('Table 21: Using date for CCPS lookup:', currentDate);
    console.log('Table 21: CCPS All Grand Totals:', ccpsAllTotals);

    if (data && Object.keys(data).length > 0) {
      // Use data from localStorage (passed via props) but update all rows with CCPS data
      console.log('Table 21: Using data from localStorage:', data);
      const updatedData = {
        ...data,
        particulars: data.particulars.map(item => {
          // Map all rows to CCPS data based on duty type
          if (item.id === 1 && item.name === 'B/D Duty') {
            return {
              ...item,
              adsp: ccpsAllTotals.bdDuty.adsp,
              ins: ccpsAllTotals.bdDuty.inspector,
              si: ccpsAllTotals.bdDuty.si,
              others: ccpsAllTotals.bdDuty.others
            };
          } else if (item.id === 2 && item.name === 'CL') {
            return {
              ...item,
              adsp: ccpsAllTotals.cl.adsp,
              ins: ccpsAllTotals.cl.inspector,
              si: ccpsAllTotals.cl.si,
              others: ccpsAllTotals.cl.others
            };
          } else if (item.id === 3 && item.name === 'ML/EL/MTL') {
            return {
              ...item,
              adsp: ccpsAllTotals.mlEl.adsp,
              ins: ccpsAllTotals.mlEl.inspector,
              si: ccpsAllTotals.mlEl.si,
              others: ccpsAllTotals.mlEl.others
            };
          } else if (item.id === 4 && item.name === 'OD') {
            return {
              ...item,
              adsp: ccpsAllTotals.od.adsp,
              ins: ccpsAllTotals.od.inspector,
              si: ccpsAllTotals.od.si,
              others: ccpsAllTotals.od.others
            };
          }
          return item;
        })
      };
      setTableData(updatedData);
    } else {
      // If no localStorage data, use default values with all CCPS data
      console.log('Table 21: No localStorage data, using default values with complete CCPS integration');
      const defaultDataWithCCPS = {
        particulars: [
          { 
            id: 1, 
            name: 'B/D Duty', 
            adsp: ccpsAllTotals.bdDuty.adsp, 
            ins: ccpsAllTotals.bdDuty.inspector, 
            si: ccpsAllTotals.bdDuty.si, 
            others: ccpsAllTotals.bdDuty.others 
          },
          { 
            id: 2, 
            name: 'CL', 
            adsp: ccpsAllTotals.cl.adsp, 
            ins: ccpsAllTotals.cl.inspector, 
            si: ccpsAllTotals.cl.si, 
            others: ccpsAllTotals.cl.others 
          },
          { 
            id: 3, 
            name: 'ML/EL/MTL', 
            adsp: ccpsAllTotals.mlEl.adsp, 
            ins: ccpsAllTotals.mlEl.inspector, 
            si: ccpsAllTotals.mlEl.si, 
            others: ccpsAllTotals.mlEl.others 
          },
          { 
            id: 4, 
            name: 'OD', 
            adsp: ccpsAllTotals.od.adsp, 
            ins: ccpsAllTotals.od.inspector, 
            si: ccpsAllTotals.od.si, 
            others: ccpsAllTotals.od.others 
          }
        ]
      };
      setTableData(defaultDataWithCCPS);
    }
  }, [date, data]);

  // Handle cell value changes
  const handleChange = (rowId, field, value) => {
    // Prevent editing any row as all are auto-populated from CCPS
    console.log('Table 21: All rows are read-only (populated from CCPS Table 4)');
    return;

    // Note: This function is kept for potential future use if manual editing is needed
    // const newValue = value === '' ? 0 : Number(value);
    // const newData = {
    //   particulars: tableData.particulars.map(item => {
    //     if (item.id === rowId) {
    //       return { ...item, [field]: newValue };
    //     }
    //     return item;
    //   })
    // };
    // setTableData(newData);
    // if (onDataChange) onDataChange(newData);
  };

  // Render an editable cell
  const EditableCell = ({ value, onChange, isReadOnly = false }) => {
    if (isReadOnly) {
      return (
        <span className="text-blue-600 font-medium" title="Auto-populated from CCPS Table 4">
          {value}
        </span>
      );
    }
    
    return editMode ? (
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-16 px-2 py-1 text-center border rounded"
      />
    ) : (
      <span>{value}</span>
    );
  };

  // Calculate column totals
  const calculateTotal = (field) => {
    return tableData.particulars.reduce((sum, row) => sum + row[field], 0);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th colSpan="5" className="border border-gray-300 px-4 py-2 bg-gray-50 text-center font-semibold">
              Districts/cities CCPS Duty & Leave Details
            </th>
          </tr>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 w-1/5">Particulars</th>
            <th colSpan="4" className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
              On {date}
            </th>
          </tr>
          <tr>
            <th className="border border-gray-300 bg-gray-50"></th>
            <th className="border border-gray-300 px-2 py-1 bg-gray-50 text-center">ADSP'S</th>
            <th className="border border-gray-300 px-2 py-1 bg-gray-50 text-center">INS's</th>
            <th className="border border-gray-300 px-2 py-1 bg-gray-50 text-center">SI's</th>
            <th className="border border-gray-300 px-2 py-1 bg-gray-50 text-center">Others</th>
          </tr>
        </thead>
        <tbody>
          {tableData.particulars.map((row) => {
            const isCCPSRow = true; // All rows are now populated from CCPS
            return (
              <tr key={row.id} className={row.id % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-4 py-2 font-medium">
                  {row.name}
                  <div className="text-xs text-blue-600 mt-1">
                    (From CCPS Table 4)
                  </div>
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  <EditableCell
                    value={row.adsp}
                    onChange={(value) => handleChange(row.id, 'adsp', value)}
                    isReadOnly={isCCPSRow}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  <EditableCell
                    value={row.ins}
                    onChange={(value) => handleChange(row.id, 'ins', value)}
                    isReadOnly={isCCPSRow}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  <EditableCell
                    value={row.si}
                    onChange={(value) => handleChange(row.id, 'si', value)}
                    isReadOnly={isCCPSRow}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  <EditableCell
                    value={row.others}
                    onChange={(value) => handleChange(row.id, 'others', value)}
                    isReadOnly={isCCPSRow}
                  />
                </td>
              </tr>
            );
          })}
          <tr className="bg-gray-100 font-medium">
            <td className="border border-gray-300 px-4 py-2">Total</td>
            <td className="border border-gray-300 px-2 py-1 text-center">
              {calculateTotal('adsp')}
            </td>
            <td className="border border-gray-300 px-2 py-1 text-center">
              {calculateTotal('ins')}
            </td>
            <td className="border border-gray-300 px-2 py-1 text-center">
              {calculateTotal('si')}
            </td>
            <td className="border border-gray-300 px-2 py-1 text-center">
              {calculateTotal('others')}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Table21_DutyLeave; 