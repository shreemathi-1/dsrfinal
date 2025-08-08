import { useState, useEffect } from 'react';
import { getCCPSDataForDSRTable2 } from '../../../../lib/ccpsTable2Utils';

const Table2_AmountLostFrozen = ({ date, editMode, data, onDataChange }) => {
  const [tableData, setTableData] = useState({
    amount_lost: { onDate: 0, fromDate: 0, data2024: 0 },
    amount_frozen: { onDate: 0, fromDate: 0, data2024: 0 },
    amount_returned: { onDate: 0, fromDate: 0, data2024: 0 },
    accused_arrested: { onDate: 0, fromDate: 0, data2024: 0 },
    cases_in_goondas: { onDate: 0, fromDate: 0, data2024: 0 },
    loan_app_total: { onDate: 0, fromDate: 0, data2024: 0 },
    loan_app_fir: { onDate: 0, fromDate: 0, data2024: 0 },
    loan_app_csr: { onDate: 0, fromDate: 0, data2024: 0 }
  });
  // Removed loading, error, schemaError states and auth since we only use localStorage

  // Integrate CCPS Table 2 data and use localStorage for manual entries
  useEffect(() => {
    // Get CCPS Table 2 data for auto-population
    const ccpsData = getCCPSDataForDSRTable2(date);
    
    // Default structure for all 8 rows
    const defaultData = {
      amount_lost: { onDate: 0, fromDate: 0, data2024: 0 },
      amount_frozen: { onDate: 0, fromDate: 0, data2024: 0 },
      amount_returned: { onDate: 0, fromDate: 0, data2024: 0 },
      accused_arrested: { onDate: 0, fromDate: 0, data2024: 0 },
      cases_in_goondas: { onDate: 0, fromDate: 0, data2024: 0 },
      loan_app_total: { onDate: 0, fromDate: 0, data2024: 0 },
      loan_app_fir: { onDate: 0, fromDate: 0, data2024: 0 },
      loan_app_csr: { onDate: 0, fromDate: 0, data2024: 0 }
    };

    // Merge CCPS data with localStorage data, preserving manual entries
    const mergedData = { ...defaultData };
    
    // Auto-populate onDate and fromDate columns from CCPS data
    Object.keys(ccpsData).forEach(key => {
      if (mergedData[key]) {
        mergedData[key].onDate = ccpsData[key].onDate || 0;
        mergedData[key].fromDate = ccpsData[key].fromDate || 0;
      }
    });
    
    // Preserve manual data2024 values from localStorage if available
    if (data && Object.keys(data).length > 0) {
      Object.keys(data).forEach(key => {
        if (mergedData[key] && data[key].data2024 !== undefined) {
          mergedData[key].data2024 = data[key].data2024;
        }
      });
      console.log('Table 2: Merged CCPS data with localStorage manual entries:', mergedData);
    } else {
      console.log('Table 2: Using CCPS data with default manual entries:', mergedData);
    }
    
    setTableData(mergedData);
  }, [date, data]);

  // Database functions removed - using localStorage only

  const handleChange = (category, period, value) => {
    // Only allow editing of data2024 column (manual entry)
    if (period !== 'data2024') {
      console.log('Cannot edit auto-populated columns (onDate, fromDate)');
      return;
    }

    const newValue = value === '' ? 0 : Number(value);
    if (isNaN(newValue)) {
      console.error('Invalid number entered:', value);
      return;
    }

    const newData = {
      ...tableData,
      [category]: {
        ...tableData[category],
        [period]: newValue
      }
    };
    setTableData(newData);
    
    // Call onDataChange to update parent component's state (for localStorage saving)
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  // EditableCell component for visual indicators
  const EditableCell = ({ value, onChange, isReadOnly = false, period }) => {
    if (isReadOnly || period !== 'data2024') {
      const tooltipText = period === 'onDate' ? 'Auto-populated from CCPS Table 2 (selected date)' :
                         period === 'fromDate' ? 'Auto-populated from CCPS Table 2 (cumulative from 01.01.2025)' :
                         'Manual entry';
      
      return (
        <span 
          className={period !== 'data2024' ? "text-blue-600 font-medium" : ""}
          title={tooltipText}
        >
          {value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </span>
      );
    }

    return (
      <input
        type="number"
        value={value}
        onChange={onChange}
        className="w-full px-2 py-1 text-center border rounded"
        min="0"
        step="0.01"
        title="Manual entry"
      />
    );
  };

  // Removed loading and error states - using localStorage only

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 w-16">S.No</th>
            <th className="border border-gray-300 px-4 py-2">Category</th>
            <th className="border border-gray-300 px-4 py-2">On {date} <br/><small className="text-blue-600">(From CCPS)</small></th>
            <th className="border border-gray-300 px-4 py-2">From 01.01.25 <br/><small className="text-blue-600">(From CCPS)</small></th>
            <th className="border border-gray-300 px-4 py-2">Data of 2024 <br/><small className="text-gray-600">(Manual)</small></th>
          </tr>
        </thead>
        <tbody>
          {[
            { key: 'amount_lost', label: 'Amount Lost (in Rupees)' },
            { key: 'amount_frozen', label: 'Amount Frozen (in Rupees)' },
            { key: 'amount_returned', label: 'Amount Returned (in Rupees)' },
            { key: 'accused_arrested', label: 'Number of Accused Arrested' },
            { key: 'cases_in_goondas', label: 'No.Of cases Registered in Goondas' },
            { key: 'loan_app_total', label: 'Loan App Cases (Total)' },
            { key: 'loan_app_fir', label: 'Loan App - No.of FIR Registered' },
            { key: 'loan_app_csr', label: 'Loan App - No.of CSR Issued' }
          ].map((row, index) => (
            <tr key={row.key} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
              <td className="border border-gray-300 px-4 py-2 font-medium">{row.label}</td>
              {['onDate', 'fromDate', 'data2024'].map((period) => (
                <td key={period} className="border border-gray-300 px-4 py-2 text-center">
                  {editMode ? (
                    <EditableCell
                      value={tableData[row.key][period]}
                      onChange={(e) => handleChange(row.key, period, e.target.value)}
                      isReadOnly={false}
                      period={period}
                    />
                  ) : (
                    <EditableCell
                      value={tableData[row.key][period]}
                      isReadOnly={true}
                      period={period}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table2_AmountLostFrozen;