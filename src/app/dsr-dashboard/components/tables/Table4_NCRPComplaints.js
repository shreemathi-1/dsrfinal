import { useState, useEffect } from 'react';

const Table4_NCRPComplaints = ({ date, editMode, data, onDataChange }) => {
  const [tableData, setTableData] = useState({
    onDate: {
      received: 0,
      firRegistered: 0,
      csrRegistered: 0,
      acceptedUnderProcess: 0,
      notAcceptedPending: 0,
      withdrawal: 0,
      rejectedNoAction: 0,
      complaintsClosed: 0,
      reopen: 0
    },
    fromDate: {
      received: 0,
      firRegistered: 0,
      csrRegistered: 0,
      acceptedUnderProcess: 0,
      notAcceptedPending: 0,
      withdrawal: 0,
      rejectedNoAction: 0,
      complaintsClosed: 0,
      reopen: 0
    },
    year2021: {
      received: 0,
      firRegistered: 0,
      csrRegistered: 0,
      acceptedUnderProcess: 0,
      notAcceptedPending: 0,
      withdrawal: 0,
      rejectedNoAction: 0,
      complaintsClosed: 0,
      reopen: 0
    },
    year2022: {
      received: 0,
      firRegistered: 0,
      csrRegistered: 0,
      acceptedUnderProcess: 0,
      notAcceptedPending: 0,
      withdrawal: 0,
      rejectedNoAction: 0,
      complaintsClosed: 0,
      reopen: 0
    },
    year2023: {
      received: 0,
      firRegistered: 0,
      csrRegistered: 0,
      acceptedUnderProcess: 0,
      notAcceptedPending: 0,
      withdrawal: 0,
      rejectedNoAction: 0,
      complaintsClosed: 0,
      reopen: 0
    },
    year2024: {
      received: 0,
      firRegistered: 0,
      csrRegistered: 0,
      acceptedUnderProcess: 0,
      notAcceptedPending: 0,
      withdrawal: 0,
      rejectedNoAction: 0,
      complaintsClosed: 0,
      reopen: 0
    }
  });
  // Removed loading, error states since we only use localStorage

  // Use data from props (localStorage) only - no database calls
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      // Use data from localStorage (passed via props)
      console.log('Table 4: Using data from localStorage:', data);
      setTableData(data);
    } else {
      // If no localStorage data, keep default values (already initialized)
      console.log('Table 4: No localStorage data, using default values');
    }
  }, [date, data]);

  // Database functions removed - using localStorage only
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
    
    // Call onDataChange to update parent component's state (for localStorage saving)
    if (onDataChange) {
      onDataChange(newData);
    }
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
    "No.of Complaints Received",
    "FIR Registered",
    "CSR/NC Registered",
    "CCPS Accepted & Under Process",
    "Not Accepted & Pending with CCPS",
    "Complainant Withdrawal",
    "CCPS Rejected/No Action",
    "CSR/Complaints Closed",
    "Re open"
  ];

  const getRowHeaders = () => [
    { key: 'onDate', label: `On ${date}` },
    { key: 'fromDate', label: 'From 01.01.25 To till date' },
    { key: 'year2021', label: '(Apr-Dec)2021' },
    { key: 'year2022', label: '2022' },
    { key: 'year2023', label: '2023' },
    { key: 'year2024', label: '2024' }
  ];

  const getFieldKey = (columnHeader) => {
    const fieldMap = {
      "No.of Complaints Received": "received",
      "FIR Registered": "firRegistered",
      "CSR/NC Registered": "csrRegistered",
      "CCPS Accepted & Under Process": "acceptedUnderProcess",
      "Not Accepted & Pending with CCPS": "notAcceptedPending",
      "Complainant Withdrawal": "withdrawal",
      "CCPS Rejected/No Action": "rejectedNoAction",
      "CSR/Complaints Closed": "complaintsClosed",
      "Re open": "reopen"
    };
    return fieldMap[columnHeader];
  };

  // Removed loading and error states - using localStorage only

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50"></th>
            {getColumnHeaders().map((header) => (
              <th key={header} className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {getRowHeaders().map(({ key, label }, rowIndex) => (
            <tr key={key} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 px-4 py-2">{label}</td>
              {getColumnHeaders().map((header) => {
                const fieldKey = getFieldKey(header);
                return (
                  <td key={`${key}-${fieldKey}`} className="border border-gray-300 px-4 py-2 text-center">
                    <EditableCell
                      value={tableData[key][fieldKey]}
                      onChange={(value) => handleChange(key, fieldKey, value)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table4_NCRPComplaints; 