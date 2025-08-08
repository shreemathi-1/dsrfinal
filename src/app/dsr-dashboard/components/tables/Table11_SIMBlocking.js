import { useState, useEffect } from 'react';

const Table11_SIMBlocking = ({ date, editMode, data, onDataChange }) => {
  const [tableData, setTableData] = useState({
    onDate: {
      requestsReceived: 0,
      requestSent: 0,
      requestSentSoFar: 0,
      blocked: 0,
      mobileBlocked: 0,
      ccspPending: 0,
      totalPending: 0
    },
    moAnalysis: {
      requestsReceived: 0,
      requestSent: 0,
      requestSentSoFar: 0,
      blocked: 0,
      mobileBlocked: 0,
      ccspPending: 0,
      totalPending: 0
    },
    year2024: {
      requestsReceived: 0,
      requestSent: 0,
      requestSentSoFar: 0,
      blocked: 0,
      mobileBlocked: 0,
      ccspPending: 0,
      totalPending: 0
    },
    year2023: {
      requestsReceived: 0,
      requestSent: 0,
      requestSentSoFar: 0,
      blocked: 0,
      mobileBlocked: 0,
      ccspPending: 0,
      totalPending: 0
    }
  });

  // Use data from props (localStorage) only - no database calls
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      // Use data from localStorage (passed via props)
      console.log('Table 11: Using data from localStorage:', data);
      setTableData(data);
    } else {
      // If no localStorage data, keep default values (already initialized)
      console.log('Table 11: No localStorage data, using default values');
    }
  }, [date, data]);

  const handleChange = (section, field, value) => {
    const newValue = value === '' ? 0 : Number(value);
    const newData = {
      ...tableData,
      [section]: {
        ...tableData[section],
        [field]: newValue
      }
    };
    setTableData(newData);
    if (onDataChange) onDataChange(newData);
  };

  // Render an editable cell
  const EditableCell = ({ value, onChange }) => {
    return editMode ? (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 text-center border rounded"
      />
    ) : (
      <span>{value}</span>
    );
  };

  const getColumnHeaders = () => [
    "No. of requests Received from CCPS",
    "Request sent on",
    "Request sent so far",
    "Blocked on",
    "Mobile No.s blocked so far",
    "CCSP & M.O Analysis Pending",
    "Total Pending as on"
  ];

  const getFieldKey = (header) => {
    const fieldMap = {
      "No. of requests Received from CCPS": "requestsReceived",
      "Request sent on": "requestSent",
      "Request sent so far": "requestSentSoFar",
      "Blocked on": "blocked",
      "Mobile No.s blocked so far": "mobileBlocked",
      "CCSP & M.O Analysis Pending": "ccspPending",
      "Total Pending as on": "totalPending"
    };
    return fieldMap[header];
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50"></th>
            {getColumnHeaders().map((header) => (
              <th key={header} className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
                {header} {header.includes('on') ? date : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 px-4 py-2">On {date}</td>
            {getColumnHeaders().map((header) => {
              const fieldKey = getFieldKey(header);
              return (
                <td key={fieldKey} className="border border-gray-300 px-4 py-2 text-center">
                  <EditableCell
                    value={tableData.onDate[fieldKey]}
                    onChange={(value) => handleChange('onDate', fieldKey, value)}
                  />
                </td>
              );
            })}
          </tr>
          <tr className="bg-gray-50">
            <td className="border border-gray-300 px-4 py-2">M.O. Analysis</td>
            {getColumnHeaders().map((header) => {
              const fieldKey = getFieldKey(header);
              return (
                <td key={fieldKey} className="border border-gray-300 px-4 py-2 text-center">
                  <EditableCell
                    value={tableData.moAnalysis[fieldKey]}
                    onChange={(value) => handleChange('moAnalysis', fieldKey, value)}
                  />
                </td>
              );
            })}
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">2024</td>
            {getColumnHeaders().map((header) => {
              const fieldKey = getFieldKey(header);
              return (
                <td key={fieldKey} className="border border-gray-300 px-4 py-2 text-center">
                  <EditableCell
                    value={tableData.year2024[fieldKey]}
                    onChange={(value) => handleChange('year2024', fieldKey, value)}
                  />
                </td>
              );
            })}
          </tr>
          <tr className="bg-gray-50">
            <td className="border border-gray-300 px-4 py-2">2023</td>
            {getColumnHeaders().map((header) => {
              const fieldKey = getFieldKey(header);
              return (
                <td key={fieldKey} className="border border-gray-300 px-4 py-2 text-center">
                  <EditableCell
                    value={tableData.year2023[fieldKey]}
                    onChange={(value) => handleChange('year2023', fieldKey, value)}
                  />
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Table11_SIMBlocking; 