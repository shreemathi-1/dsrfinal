import { useState, useEffect } from 'react';

const Table5_CCTNSComplaints = ({ date, editMode, data, onDataChange }) => {
  const [tableData, setTableData] = useState({
    onDate: {
      received: 0,
      registered: 0,
      disposed: 0,
      underProcess: 0,
      notProcessed: 0,
      pending: 0
    },
    fromDate: {
      received: 0,
      registered: 0,
      disposed: 0,
      underProcess: 0,
      notProcessed: 0,
      pending: 0
    },
    year2021: {
      received: 0,
      registered: 0,
      disposed: 0,
      underProcess: 0,
      notProcessed: 0,
      pending: 0
    }
  });

  // Use data from props (localStorage) only - no database calls
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      // Use data from localStorage (passed via props)
      console.log('Table 5: Using data from localStorage:', data);
      setTableData(data);
    } else {
      // If no localStorage data, reset to default values
      console.log('Table 5: No localStorage data, resetting to default values');
      setTableData({
        onDate: {
          received: 0,
          registered: 0,
          disposed: 0,
          underProcess: 0,
          notProcessed: 0,
          pending: 0
        },
        fromDate: {
          received: 0,
          registered: 0,
          disposed: 0,
          underProcess: 0,
          notProcessed: 0,
          pending: 0
        },
        year2021: {
          received: 0,
          registered: 0,
          disposed: 0,
          underProcess: 0,
          notProcessed: 0,
          pending: 0
        }
      });
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
    "No. of Complaints Received",
    "Registered as FIR",
    "Disposed",
    "Under Process",
    "Not Processed",
    "Pending"
  ];

  const getRowHeaders = () => [
    { key: 'onDate', label: `On ${date}` },
    { key: 'fromDate', label: 'From 01.01.25 To till date' },
    { key: 'year2021', label: 'Apr 2021 To till date' }
  ];

  const getFieldKey = (columnHeader) => {
    const fieldMap = {
      "No. of Complaints Received": "received",
      "Registered as FIR": "registered",
      "Disposed": "disposed",
      "Under Process": "underProcess",
      "Not Processed": "notProcessed",
      "Pending": "pending"
    };
    return fieldMap[columnHeader];
  };

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

export default Table5_CCTNSComplaints; 